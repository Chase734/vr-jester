import type { Resident } from "@/data/sample";

export type StoryChip = {
  label: string;
  emoji: string;
};

export function storyChips(resident: Resident): StoryChip[] {
  const chips: StoryChip[] = [];
  const push = (emoji: string, value?: string) => {
    const label = value?.trim();
    if (!label || chips.some((chip) => chip.label.toLowerCase() === label.toLowerCase())) {
      return;
    }
    chips.push({ emoji, label });
  };

  for (const team of resident.favoriteSportsTeams) {
    push("⚾", team);
  }
  push("📍", resident.hometown);
  for (const place of [...resident.placesLived, ...resident.favoritePlaces, ...resident.meaningfulPlaces]) {
    push("📍", place.split(",")[0]);
  }
  for (const artist of resident.music) {
    push("🎵", artist);
  }
  if (/italy|rome|venice/i.test([resident.favoriteVacation, resident.weddingHoneymoon, ...resident.placesVisited].join(" "))) {
    push("🇮🇹", "Italy");
  }
  if (/hawaii|honolulu|waikiki/i.test([resident.favoriteVacation, ...resident.placesVisited, ...resident.placesTheyWantToVisit].join(" "))) {
    push("🏝", "Hawaii");
  }
  if (/train/i.test(resident.interests.join(" ") + resident.staffNotes)) {
    push("🚂", "Trains");
  }
  for (const food of resident.food) {
    push("🍽", food);
  }
  for (const hobby of resident.interests) {
    push("✨", hobby);
  }
  if (resident.favoriteDecade) {
    push("📻", resident.favoriteDecade);
  }
  return chips.slice(0, 10);
}
