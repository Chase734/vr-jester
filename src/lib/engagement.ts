import type { FamilyRequest, Resident, Session } from "@/data/sample";
import { catalog } from "@/data/catalog";
import { related } from "@/lib/recommendations";

export function daysSince(iso: string) {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) {
    return 999;
  }
  return Math.floor((Date.now() - then) / (1000 * 60 * 60 * 24));
}

export function weekSessions(sessions: Session[]) {
  const start = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return sessions.filter((session) => new Date(session.startsAt).getTime() >= start);
}

export function lastSession(residentId: string, sessions: Session[]) {
  return [...sessions]
    .filter((session) => session.residentId === residentId && session.status === "completed")
    .sort((left, right) => new Date(right.startsAt).getTime() - new Date(left.startsAt).getTime())[0];
}

export function jesterEngagementScore(
  resident: Resident,
  sessions: Session[],
  requests: FamilyRequest[],
) {
  const mine = sessions.filter((session) => session.residentId === resident.id);
  const completed = mine.filter((session) => session.status === "completed");
  const loved = completed.filter((session) => session.reaction === "Loved It" || session.reaction === "Liked It");
  const families = requests.filter((request) => request.residentId === resident.id);
  const last = lastSession(resident.id, sessions);
  const recency = last ? Math.max(0, 20 - daysSince(last.startsAt)) : 0;
  const frequency = Math.min(25, completed.length * 4);
  const positivity = completed.length ? Math.round((loved.length / completed.length) * 25) : 0;
  const variety = Math.min(
    15,
    new Set(completed.map((session) => session.experience.toLowerCase())).size * 3,
  );
  const family = Math.min(15, families.length * 5);
  return Math.max(8, Math.min(99, recency + frequency + positivity + variety + family));
}

export function reconnectResidents(residents: Resident[], sessions: Session[]) {
  return residents
    .map((resident) => {
      const last = lastSession(resident.id, sessions);
      const idleDays = last ? daysSince(last.startsAt) : 30;
      return { resident, idleDays, last };
    })
    .filter((item) => item.idleDays >= 7)
    .sort((left, right) => right.idleDays - left.idleDays);
}

export function passportFor(resident: Resident, sessions: Session[]) {
  const completed = sessions.filter(
    (session) => session.residentId === resident.id && session.status === "completed",
  );
  const destinations = [
    ...new Set(completed.map((session) => session.experience).filter(Boolean)),
  ];
  const categories = [
    ...new Set(
      destinations
        .map((destination) => catalog.find((item) => related(item.destination, destination))?.category)
        .filter(Boolean),
    ),
  ];
  const count = completed.length;
  const badges = [
    { id: "first", label: "First Adventure", earned: count >= 1 },
    { id: "five", label: "5 Adventures", earned: count >= 5 },
    { id: "ten", label: "10 Adventures", earned: count >= 10 },
    { id: "twentyfive", label: "25 Adventures", earned: count >= 25 },
    { id: "fifty", label: "50 Adventures", earned: count >= 50 },
    { id: "world", label: "World Traveler", earned: destinations.length >= 8 },
    {
      id: "parks",
      label: "National Parks Explorer",
      earned: destinations.some((destination) => /canyon|yellowstone|yosemite|park/i.test(destination)),
    },
    {
      id: "sports",
      label: "Sports Fan",
      earned: destinations.some((destination) => /field|fenway|stadium|dome/i.test(destination)),
    },
    {
      id: "history",
      label: "History Explorer",
      earned: destinations.some((destination) => /rome|vatican|museum|paris/i.test(destination)),
    },
  ];
  return {
    experiences: count,
    destinations: destinations.length,
    categories: categories.length,
    stamps: destinations.slice(0, 12),
    badges,
  };
}

export function popularCategories(sessions: Session[]) {
  const counts = new Map<string, number>();
  for (const session of weekSessions(sessions)) {
    const category = catalog.find((item) => related(item.destination, session.experience))?.category ?? "Travel";
    counts.set(category, (counts.get(category) ?? 0) + 1);
  }
  return [...counts.entries()].sort((left, right) => right[1] - left[1]);
}

export function popularExperiences(sessions: Session[], limit = 5) {
  const counts = new Map<string, number>();
  for (const session of sessions) {
    counts.set(session.experience, (counts.get(session.experience) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, limit)
    .map(([name, trips]) => ({ name, trips }));
}

export function greeting(now = new Date()) {
  const hour = now.getHours();
  if (hour < 12) {
    return "Good morning";
  }
  if (hour < 17) {
    return "Good afternoon";
  }
  return "Good evening";
}

export function averageEngagement(sessions: Session[]) {
  const rated = sessions.filter((session) => session.reaction);
  if (!rated.length) {
    return 0;
  }
  const points: Record<string, number> = {
    "Loved It": 100,
    "Liked It": 75,
    Neutral: 50,
    "Didn't Like It": 20,
  };
  const total = rated.reduce((sum, session) => sum + (points[session.reaction] ?? 50), 0);
  return Math.round(total / rated.length);
}
