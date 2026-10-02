import type { FamilyRequest, Resident, Session } from "@/data/sample";

export function uniqueList(items: string[]) {
  return items.filter((item, index) => item && items.indexOf(item) === index);
}

export function mostVisitedDestinations(sessions: Session[], limit = 3) {
  const counts = new Map<string, number>();
  for (const session of sessions) {
    const name = session.experience.trim();
    if (!name) {
      continue;
    }
    counts.set(name, (counts.get(name) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, limit)
    .map(([name]) => name);
}

export function waitingFamilyRequests(requests: FamilyRequest[]) {
  return requests.filter((request) => request.status === "New" || request.status === "Approved");
}

export function lovedDestinations(sessions: Session[]) {
  return uniqueList(
    sessions.filter((session) => session.reaction === "Loved It").map((session) => session.experience),
  );
}

export function recentDestinations(sessions: Session[], limit = 3) {
  return uniqueList(
    [...sessions]
      .sort((left, right) => new Date(right.startsAt).getTime() - new Date(left.startsAt).getTime())
      .map((session) => session.experience),
  ).slice(0, limit);
}

export function buildResidentInsights(
  resident: Resident,
  sessions: Session[],
  requests: FamilyRequest[],
) {
  return {
    favorites: uniqueList([...resident.favoriteExperiences, ...lovedDestinations(sessions)]),
    interests: resident.interests.slice(0, 6),
    mostVisited: mostVisitedDestinations(sessions),
    recent: recentDestinations(sessions),
    waiting: waitingFamilyRequests(requests),
  };
}
