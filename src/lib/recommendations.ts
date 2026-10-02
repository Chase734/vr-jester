import type { FamilyRequest, Resident, Session } from "@/data/sample";
import { firstName } from "@/lib/names";

export type Recommendation = {
  destination: string;
  score: number;
  reasons: string[];
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

function related(left: string, right: string) {
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
  const words = (text: string) =>
    text.split(/[^a-z0-9]+/).filter((word) => word.length >= 4);
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

function collectCandidates(resident: Resident, sessions: Session[], requests: FamilyRequest[]) {
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
  return [...bucket.values()];
}

function signalsFor(
  destination: string,
  resident: Resident,
  sessions: Session[],
  requests: FamilyRequest[],
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
    const place = resident.placesLived.find((item) => related(item, destination))!;
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
    signals.push({ points: 20, reason: `Favorite vacation notes mention this: ${resident.favoriteVacation}.` });
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
    const place = resident.placesVisited.find((item) => related(item, destination))!;
    signals.push({ points: 12, reason: `${name} has visited ${place}.` });
  }
  if (mentions(resident.college, destination)) {
    signals.push({ points: 14, reason: `College: ${resident.college}.` });
  }
  if (mentions(resident.highSchool, destination)) {
    signals.push({ points: 14, reason: `High school: ${resident.highSchool}.` });
  }
  if (resident.restaurantsLandmarks.some((place) => related(place, destination))) {
    signals.push({ points: 14, reason: `A favorite restaurant or landmark is connected to this place.` });
  }
  if (resident.favoriteSportsTeams.some((team) => related(team, destination))) {
    const team = resident.favoriteSportsTeams.find((item) => related(item, destination))!;
    signals.push({ points: 10, reason: `${name} follows ${team}.` });
  }
  if (mentions(resident.militaryService, destination)) {
    signals.push({ points: 15, reason: `Military history mentions this: ${resident.militaryService}.` });
  }
  if (mentions(resident.career, destination)) {
    signals.push({ points: 10, reason: `Career notes mention this: ${resident.career}.` });
  }
  if (mentions(resident.childhoodMemories, destination)) {
    signals.push({ points: 16, reason: `Childhood memories mention this place.` });
  }

  const destSessions = sessions.filter((session) => related(session.experience, destination));
  const loved = sessions.filter((session) => session.reaction === "Loved It");
  if (destSessions.some((session) => session.reaction === "Loved It")) {
    signals.push({ points: 18, strong: true, reason: `${name} loved this in a previous VR session.` });
  } else if (destSessions.some((session) => session.reaction === "Liked It")) {
    signals.push({ points: 10, reason: `${name} liked this in a previous VR session.` });
  }
  if (destSessions.some((session) => session.sessionEngagement === "Highly Engaged")) {
    signals.push({ points: 8, reason: `${name} was highly engaged here before.` });
  }
  const memorySession = destSessions.find((session) => session.memoryDiscovered.trim());
  if (memorySession) {
    signals.push({
      points: 12,
      reason: `A memory from a session: ${memorySession.memoryDiscovered}.`,
    });
  }

  const similarLoved = loved.find(
    (session) => key(session.experience) !== key(destination) && related(session.experience, destination),
  );
  if (similarLoved && !destSessions.some((session) => session.reaction === "Loved It")) {
    signals.push({
      points: 16,
      reason: `${name} loved ${similarLoved.experience}, which is closely related.`,
    });
  }

  if (resident.interests.some((interest) => related(interest, destination))) {
    const interest = resident.interests.find((item) => related(item, destination))!;
    signals.push({ points: 8, reason: `This matches an interest: ${interest}.` });
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

export function recommendExperiences(
  resident: Resident,
  sessions: Session[],
  requests: FamilyRequest[],
  limit = 5,
): Recommendation[] {
  const disliked = sessions.filter((session) => session.reaction === "Didn't Like It");
  const ranked: Recommendation[] = [];

  for (const destination of collectCandidates(resident, sessions, requests)) {
    if (disliked.some((session) => related(session.experience, destination))) {
      continue;
    }
    const signals = signalsFor(destination, resident, sessions, requests);
    if (signals.length === 0) {
      continue;
    }
    const strong = signals.some((signal) => signal.strong);
    if (recentlyCompleted(destination, sessions) && !strong) {
      continue;
    }
    const score = Math.min(
      100,
      signals.reduce((total, signal) => total + signal.points, 0),
    );
    ranked.push({
      destination,
      score,
      reasons: signals.slice(0, 3).map((signal) => signal.reason),
    });
  }

  return ranked.sort((left, right) => right.score - left.score || left.destination.localeCompare(right.destination)).slice(0, limit);
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
