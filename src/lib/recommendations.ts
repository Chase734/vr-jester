import type { FamilyRequest, Resident, Session } from "@/data/sample";
import { catalog, findExperience, type CatalogExperience, type ExperienceSource } from "@/data/catalog";
import { firstName } from "@/lib/names";

export type Recommendation = {
  destination: string;
  score: number;
  reasons: string[];
  explanation: string;
  source: ExperienceSource;
  category: string;
  image: string;
  experienceId: string;
  durationMinutes: number;
  youtubeQuery?: string;
  youtubeVideoId?: string;
  channel?: string;
};

type Signal = {
  points: number;
  reason: string;
  strong?: boolean;
};

function clean(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function key(value: string) {
  return clean(value).toLowerCase();
}

function looksLikePlace(value: string) {
  const text = clean(value);
  if (text.length < 3 || text.length > 80) {
    return false;
  }
  if (/^(none|n\/a|na|unknown)$/i.test(text)) {
    return false;
  }
  return true;
}

export function related(left: string, right: string) {
  const a = key(left);
  const b = key(right);
  if (!a || !b) {
    return false;
  }
  if (a === b) {
    return true;
  }
  if (a.includes(b) || b.includes(a)) {
    return Math.min(a.length, b.length) >= 4;
  }
  const words = (text: string) => text.split(/[^a-z0-9]+/).filter((word) => word.length >= 4);
  return words(a).some((word) => words(b).includes(word));
}

function mentions(haystack: string, destination: string) {
  return related(haystack, destination);
}

function addCandidate(bucket: Map<string, string>, value: string) {
  const text = clean(value);
  if (!looksLikePlace(text)) {
    return;
  }
  const id = key(text);
  if (!bucket.has(id)) {
    bucket.set(id, text);
  }
}

function storyText(resident: Resident) {
  return [
    resident.hometown,
    resident.college,
    resident.highSchool,
    resident.weddingHoneymoon,
    resident.favoriteVacation,
    resident.militaryService,
    resident.career,
    resident.childhoodMemories,
    resident.favoriteDecade,
    resident.familyTraditions,
    ...resident.placesLived,
    ...resident.placesVisited,
    ...resident.placesTheyWantToVisit,
    ...resident.favoritePlaces,
    ...resident.favoriteExperiences,
    ...resident.meaningfulPlaces,
    ...resident.restaurantsLandmarks,
    ...resident.futureRequests,
    ...resident.favoriteSportsTeams,
    ...resident.interests,
    ...resident.music,
    ...resident.food,
    ...resident.animals,
    ...resident.culturalInterests,
  ]
    .join(" ")
    .toLowerCase();
}

function collectCandidates(
  resident: Resident,
  sessions: Session[],
  requests: FamilyRequest[],
  extras: CatalogExperience[],
) {
  const bucket = new Map<string, string>();
  addCandidate(bucket, resident.hometown);
  addCandidate(bucket, resident.college);
  addCandidate(bucket, resident.highSchool);
  addCandidate(bucket, resident.weddingHoneymoon);
  addCandidate(bucket, resident.favoriteVacation);
  for (const value of [
    ...resident.placesLived,
    ...resident.placesVisited,
    ...resident.placesTheyWantToVisit,
    ...resident.favoritePlaces,
    ...resident.favoriteExperiences,
    ...resident.meaningfulPlaces,
    ...resident.restaurantsLandmarks,
    ...resident.futureRequests,
    ...resident.favoriteSportsTeams,
  ]) {
    addCandidate(bucket, value);
  }
  for (const request of requests) {
    addCandidate(bucket, request.experience);
  }
  for (const session of sessions) {
    if (session.reaction !== "Didn't Like It") {
      addCandidate(bucket, session.experience);
    }
    addCandidate(bucket, session.followUpDestination);
  }
  for (const item of extras) {
    addCandidate(bucket, item.destination);
  }
  return [...bucket.values()];
}

function tagHits(item: CatalogExperience, resident: Resident) {
  const haystack = storyText(resident);
  return item.tags.filter((tag) => haystack.includes(tag) || related(haystack, tag));
}

function similarResidentBoost(
  destination: string,
  resident: Resident,
  peers: Resident[],
  peerSessions: Session[],
) {
  const loved = peerSessions.filter(
    (session) =>
      session.residentId !== resident.id &&
      related(session.experience, destination) &&
      (session.reaction === "Loved It" || session.reaction === "Liked It"),
  );
  if (loved.length === 0) {
    return null;
  }
  const peer = peers.find((item) => item.id === loved[0].residentId);
  return {
    points: Math.min(18, 8 + loved.length * 3),
    reason: peer
      ? `Residents with similar interests, like ${firstName(peer.name)}, enjoyed this.`
      : "Similar residents at this community enjoyed this.",
  };
}

function signalsFor(
  destination: string,
  resident: Resident,
  sessions: Session[],
  requests: FamilyRequest[],
  peers: Resident[],
  allSessions: Session[],
  item: CatalogExperience | null,
) {
  const name = firstName(resident.name);
  const signals: Signal[] = [];
  const waiting = requests.find(
    (request) =>
      related(request.experience, destination) &&
      (request.status === "New" || request.status === "Approved"),
  );
  if (waiting) {
    signals.push({
      points: 45,
      strong: true,
      reason: `${waiting.requestedBy} asked for ${destination}.`,
    });
  } else {
    const anyRequest = requests.find((request) => related(request.experience, destination));
    if (anyRequest) {
      signals.push({
        points: 20,
        reason: `Family previously requested ${anyRequest.experience}.`,
      });
    }
  }

  const followUp = sessions.find((session) => related(session.followUpDestination, destination));
  if (followUp) {
    const successful =
      followUp.reaction === "Loved It" ||
      followUp.reaction === "Liked It" ||
      followUp.sessionEngagement === "Highly Engaged";
    signals.push({
      points: successful ? 35 : 22,
      strong: true,
      reason: `Staff suggested this after ${followUp.experience}.`,
    });
  }

  if (mentions(resident.hometown, destination)) {
    signals.push({ points: 32, strong: true, reason: `${name} is from ${resident.hometown}.` });
  }
  if (resident.placesLived.some((place) => related(place, destination))) {
    const place = resident.placesLived.find((entry) => related(entry, destination))!;
    signals.push({ points: 28, strong: true, reason: `${name} lived in ${place}.` });
  }
  if (mentions(resident.weddingHoneymoon, destination)) {
    signals.push({
      points: 26,
      strong: true,
      reason: `Wedding or honeymoon: ${resident.weddingHoneymoon}.`,
    });
  }
  if (resident.meaningfulPlaces.some((place) => related(place, destination))) {
    signals.push({ points: 26, strong: true, reason: `${destination} is marked as personally meaningful.` });
  }
  if (mentions(resident.favoriteVacation, destination)) {
    signals.push({ points: 20, reason: `Favorite vacation notes mention this.` });
  }
  if (resident.placesTheyWantToVisit.some((place) => related(place, destination))) {
    signals.push({ points: 22, reason: `${name} wants to visit this place.` });
  }
  if (
    resident.favoritePlaces.some((place) => related(place, destination)) ||
    resident.favoriteExperiences.some((place) => related(place, destination))
  ) {
    signals.push({ points: 24, reason: `${destination} is already on ${name}'s favorites.` });
  }
  if (resident.placesVisited.some((place) => related(place, destination))) {
    const place = resident.placesVisited.find((entry) => related(entry, destination))!;
    signals.push({ points: 12, reason: `${name} has visited ${place}.` });
  }
  if (mentions(resident.college, destination) || mentions(resident.highSchool, destination)) {
    signals.push({ points: 14, reason: `School notes connect to this place.` });
  }
  if (resident.favoriteSportsTeams.some((team) => related(team, destination) || (item?.tags.includes(team.toLowerCase()) ?? false))) {
    const team = resident.favoriteSportsTeams.find((entry) => related(entry, destination) || item?.tags.some((tag) => related(tag, entry))) ??
      resident.favoriteSportsTeams[0];
    if (team) {
      signals.push({ points: 16, strong: true, reason: `${name} follows ${team}.` });
    }
  }
  if (mentions(resident.militaryService, destination)) {
    signals.push({ points: 15, reason: `Military history mentions this.` });
  }
  if (mentions(resident.childhoodMemories, destination)) {
    signals.push({ points: 16, reason: `Childhood memories mention this place.` });
  }
  if (item) {
    const hits = tagHits(item, resident);
    if (hits.length) {
      signals.push({
        points: Math.min(22, 8 + hits.length * 4),
        reason: `This matches ${name}'s interests: ${hits.slice(0, 3).join(", ")}.`,
      });
    }
  }

  const destSessions = sessions.filter((session) => related(session.experience, destination));
  const lovedCount = destSessions.filter((session) => session.reaction === "Loved It").length;
  const likedCount = destSessions.filter((session) => session.reaction === "Liked It").length;
  const finished = destSessions.filter((session) => (session.completionPercentage ?? 0) >= 80 || session.status === "completed");
  if (lovedCount) {
    signals.push({
      points: 18 + Math.min(10, lovedCount * 4),
      strong: true,
      reason: `${name} loved this in a previous session.`,
    });
  } else if (likedCount) {
    signals.push({ points: 10, reason: `${name} liked this in a previous session.` });
  }
  if (destSessions.some((session) => session.sessionEngagement === "Highly Engaged")) {
    signals.push({ points: 8, reason: `${name} was highly engaged here before.` });
  }
  if (finished.length > 1) {
    signals.push({ points: 8, reason: `${name} has returned to similar experiences.` });
  }
  const stoppedEarly = destSessions.filter(
    (session) => session.durationMinutes > 0 && session.durationMinutes < 6 && session.reaction === "Didn't Like It",
  );
  if (stoppedEarly.length) {
    signals.push({ points: -20, reason: `${name} stopped similar experiences early.` });
  }

  const peer = similarResidentBoost(destination, resident, peers, allSessions);
  if (peer) {
    signals.push(peer);
  }

  return signals;
}

function recentlyCompleted(destination: string, sessions: Session[]) {
  const recent = [...sessions]
    .filter((session) => session.status === "completed")
    .sort((left, right) => new Date(right.startsAt).getTime() - new Date(left.startsAt).getTime())
    .slice(0, 2);
  return recent.some((session) => related(session.experience, destination));
}

function toRecommendation(
  destination: string,
  score: number,
  reasons: string[],
  item: CatalogExperience | null,
): Recommendation {
  const explanation = reasons.slice(0, 2).join(" ");
  return {
    destination: item?.title ?? destination,
    score,
    reasons,
    explanation:
      explanation ||
      "Suggested from this resident's life story and recent engagement. For entertainment only.",
    source: item?.source ?? "vr_jester",
    category: item?.category ?? "Travel",
    image: item?.image ?? "",
    experienceId: item?.id ?? key(destination),
    durationMinutes: item?.durationMinutes ?? 15,
    youtubeQuery: item?.youtubeQuery,
    youtubeVideoId: item?.youtubeVideoId,
    channel: item?.channel,
  };
}

type Options = {
  limit?: number;
  peers?: Resident[];
  allSessions?: Session[];
  extras?: CatalogExperience[];
};

export function recommendExperiences(
  resident: Resident,
  sessions: Session[],
  requests: FamilyRequest[],
  limitOrOptions: number | Options = 5,
): Recommendation[] {
  const options: Options = typeof limitOrOptions === "number" ? { limit: limitOrOptions } : limitOrOptions;
  const limit = options.limit ?? 5;
  const peers = options.peers ?? [];
  const allSessions = options.allSessions ?? sessions;
  const extras = options.extras ?? catalog;
  const disliked = sessions.filter((session) => session.reaction === "Didn't Like It");
  const ranked: Recommendation[] = [];
  const destinations = collectCandidates(resident, sessions, requests, extras);

  for (const destination of destinations) {
    if (disliked.some((session) => related(session.experience, destination))) {
      continue;
    }
    const item = findExperience(destination);
    const signals = signalsFor(destination, resident, sessions, requests, peers, allSessions, item);
    if (signals.length === 0) {
      continue;
    }
    const strong = signals.some((signal) => signal.strong);
    if (recentlyCompleted(destination, sessions) && !strong) {
      continue;
    }
    const score = Math.max(
      0,
      Math.min(
        99,
        40 + signals.reduce((total, signal) => total + signal.points, 0) / 2,
      ),
    );
    ranked.push(
      toRecommendation(
        destination,
        Math.round(score),
        signals.filter((signal) => signal.points > 0).slice(0, 3).map((signal) => signal.reason),
        item,
      ),
    );
  }

  const seen = new Set<string>();
  return ranked
    .sort((left, right) => right.score - left.score || left.destination.localeCompare(right.destination))
    .filter((item) => {
      const id = key(item.experienceId);
      if (seen.has(id) || seen.has(key(item.destination))) {
        return false;
      }
      seen.add(id);
      seen.add(key(item.destination));
      return true;
    })
    .slice(0, limit);
}

export function surprisePick(
  resident: Resident,
  sessions: Session[],
  requests: FamilyRequest[],
  peers: Resident[] = [],
  allSessions: Session[] = sessions,
) {
  const pool = recommendExperiences(resident, sessions, requests, {
    limit: 20,
    peers,
    allSessions,
  });
  const last = [...sessions]
    .filter((session) => session.status === "completed")
    .sort((left, right) => new Date(right.startsAt).getTime() - new Date(left.startsAt).getTime())[0];
  const outside = pool.filter(
    (item) => item.score >= 55 && item.score <= 82 && (!last || !related(last.experience, item.destination)),
  );
  return outside[Math.floor(outside.length / 2)] ?? pool[pool.length - 1] ?? null;
}

export function recommendationFor(
  destination: string,
  resident: Resident,
  sessions: Session[],
  requests: FamilyRequest[],
) {
  return (
    recommendExperiences(resident, sessions, requests, 50).find((item) =>
      related(item.destination, destination),
    ) ?? null
  );
}

export function matchFamilyRequest(request: FamilyRequest, resident?: Resident | null) {
  const matches = catalog
    .map((item) => {
      let score = 0;
      if (related(item.destination, request.experience) || related(item.title, request.experience)) {
        score += 50;
      }
      if (item.tags.some((tag) => related(tag, request.experience))) {
        score += 20;
      }
      if (resident && tagHits(item, resident).length) {
        score += 10;
      }
      return { item, score };
    })
    .filter((entry) => entry.score >= 20)
    .sort((left, right) => right.score - left.score)
    .slice(0, 3);
  return matches;
}

export function guideFacts(
  destination: string,
  resident: Resident,
  sessions: Session[],
  requests: FamilyRequest[],
) {
  const memories = sessions
    .filter((session) => related(session.experience, destination) && session.memoryDiscovered.trim())
    .map((session) => session.memoryDiscovered);
  const requestNotes = requests
    .filter((request) => related(request.experience, destination))
    .map((request) => {
      const parts = [request.note, request.whyItMatters].filter(Boolean);
      return parts.length ? `${request.requestedBy}: ${parts.join(" ")}` : "";
    })
    .filter(Boolean);
  const lifeNotes = [
    mentions(resident.childhoodMemories, destination) ? resident.childhoodMemories : "",
    mentions(resident.favoriteVacation, destination) ? resident.favoriteVacation : "",
  ].filter(Boolean);

  return uniqueKeep(memories.concat(requestNotes, lifeNotes));
}

function uniqueKeep(items: string[]) {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const item of items) {
    const id = key(item);
    if (!id || seen.has(id)) {
      continue;
    }
    seen.add(id);
    result.push(item);
  }
  return result;
}

export function todayPicks(
  residents: Resident[],
  sessions: Session[],
  requests: FamilyRequest[],
  limit = 4,
) {
  const picks: { resident: Resident; recommendation: Recommendation }[] = [];
  for (const resident of residents) {
    const recommendation = recommendExperiences(
      resident,
      sessions.filter((session) => session.residentId === resident.id),
      requests.filter((request) => request.residentId === resident.id),
      { limit: 1, peers: residents, allSessions: sessions },
    )[0];
    if (recommendation) {
      picks.push({ resident, recommendation });
    }
  }
  return picks.sort((left, right) => right.recommendation.score - left.recommendation.score).slice(0, limit);
}
