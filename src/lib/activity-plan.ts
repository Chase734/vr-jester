import type { Resident, Session } from "@/data/sample";
import { catalog, type CatalogExperience } from "@/data/catalog";
import { recommendExperiences } from "@/lib/recommendations";

export type ActivityTheme = "TRAVEL" | "SPORTS" | "MEMORIES" | "NATURE" | "RELAXATION" | "SURPRISE ME";

export type ActivityPlan = {
  title: string;
  minutes: number;
  theme: string;
  steps: { minutes: number; label: string }[];
  residents: Resident[];
  experiences: CatalogExperience[];
};

const themeTags: Record<Exclude<ActivityTheme, "SURPRISE ME">, string[]> = {
  TRAVEL: ["travel", "city", "rome", "paris", "hawaii", "tokyo", "venice"],
  SPORTS: ["baseball", "sports", "stadium", "cubs", "chicago", "fenway"],
  MEMORIES: ["memories", "honeymoon", "college", "hometown", "chicago"],
  NATURE: ["nature", "canyon", "yellowstone", "wildlife", "national parks"],
  RELAXATION: ["beach", "ocean", "train", "aurora", "relaxation"],
};

function parseMinutes(prompt: string, fallback: number) {
  const match = prompt.match(/(\d+)\s*min/i);
  if (match) {
    return Number(match[1]);
  }
  if (/hour/i.test(prompt)) {
    return 60;
  }
  return fallback;
}

function parseTheme(prompt: string, chosen?: ActivityTheme): Exclude<ActivityTheme, "SURPRISE ME"> {
  if (chosen && chosen !== "SURPRISE ME") {
    return chosen;
  }
  const text = prompt.toLowerCase();
  if (/baseball|sport|cubs|sox/.test(text)) {
    return "SPORTS";
  }
  if (/memory|memories|school|hometown/.test(text)) {
    return "MEMORIES";
  }
  if (/nature|park|canyon|wildlife/.test(text)) {
    return "NATURE";
  }
  if (/relax|beach|quiet|calm/.test(text)) {
    return "RELAXATION";
  }
  return "TRAVEL";
}

const titles: Record<Exclude<ActivityTheme, "SURPRISE ME">, string> = {
  TRAVEL: "Around The World",
  SPORTS: "Around The World Through Baseball",
  MEMORIES: "Memory Lane Together",
  NATURE: "National Parks Afternoon",
  RELAXATION: "A Gentle Getaway",
};

export function planActivity(
  prompt: string,
  residents: Resident[],
  sessions: Session[],
  minutes: number,
  themeChoice?: ActivityTheme,
): ActivityPlan {
  const duration = parseMinutes(prompt, minutes);
  const theme = parseTheme(prompt, themeChoice);
  const tags = themeTags[theme];
  const scored = residents
    .map((resident) => {
      const picks = recommendExperiences(
        resident,
        sessions.filter((session) => session.residentId === resident.id),
        [],
        3,
      );
      const overlap = picks.filter((pick) =>
        tags.some((tag) => pick.destination.toLowerCase().includes(tag) || pick.explanation.toLowerCase().includes(tag)),
      ).length;
      return { resident, overlap, picks };
    })
    .sort((left, right) => right.overlap - left.overlap || right.picks[0]?.score - left.picks[0]?.score);

  const groupSize = /six|6/.test(prompt) ? 6 : Math.min(6, Math.max(3, scored.filter((item) => item.overlap > 0).length || 4));
  const chosen = scored.slice(0, groupSize).map((item) => item.resident);
  const experiences = catalog
    .filter((item) => tags.some((tag) => item.tags.includes(tag) || item.destination.toLowerCase().includes(tag)))
    .slice(0, 4);
  const lineup = experiences.length ? experiences : catalog.slice(0, 3);

  const intro = Math.max(5, Math.round(duration * 0.12));
  const outro = Math.max(5, Math.round(duration * 0.15));
  const remaining = Math.max(10, duration - intro - outro);
  const slice = Math.max(8, Math.round(remaining / Math.max(1, lineup.length)));

  const steps = [
    { minutes: intro, label: "Welcome and a short conversation starter" },
    ...lineup.map((item) => ({ minutes: slice, label: item.title })),
    { minutes: outro, label: "Discussion questions and favorite memories" },
  ];

  return {
    title: titles[theme],
    minutes: duration,
    theme,
    steps,
    residents: chosen,
    experiences: lineup,
  };
}
