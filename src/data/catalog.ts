export type ExperienceCategory =
  | "Travel"
  | "Memory Lane"
  | "Nature"
  | "Sports"
  | "Animals"
  | "Music & Entertainment"
  | "History"
  | "Adventure"
  | "Relaxation"
  | "YouTube 360";

export type ExperienceSource = "vr_jester" | "youtube_360";

export type CatalogExperience = {
  id: string;
  title: string;
  destination: string;
  category: ExperienceCategory;
  source: ExperienceSource;
  image: string;
  durationMinutes: number;
  youtubeQuery: string;
  youtubeVideoId?: string;
  channel?: string;
  tags: string[];
  description: string;
};

function photo(id: string) {
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1400&q=80`;
}

export const catalog: CatalogExperience[] = [
  {
    id: "wrigley-field",
    title: "Wrigley Field",
    destination: "Wrigley Field",
    category: "Sports",
    source: "vr_jester",
    image: photo("photo-1566577739112-5180d4bf9390"),
    durationMinutes: 15,
    youtubeQuery: "Wrigley Field 360 VR",
    tags: ["baseball", "chicago", "cubs", "stadium", "sports", "nostalgic"],
    description: "Take a seat at the Friendly Confines.",
  },
  {
    id: "fenway-park",
    title: "Fenway Park",
    destination: "Fenway Park",
    category: "Sports",
    source: "vr_jester",
    image: photo("photo-1461896836934-ffe607ba6851"),
    durationMinutes: 12,
    youtubeQuery: "Fenway Park 360 VR",
    tags: ["baseball", "boston", "red sox", "stadium", "sports"],
    description: "Walk the oldest ballpark in the majors.",
  },
  {
    id: "hawaii-beaches",
    title: "Hawaii Beaches",
    destination: "Hawaii beaches",
    category: "Travel",
    source: "vr_jester",
    image: photo("photo-1507525428034-b723cf961d3e"),
    durationMinutes: 15,
    youtubeQuery: "Hawaii beach 360 VR",
    tags: ["hawaii", "beach", "honeymoon", "ocean", "relaxation", "waikiki"],
    description: "Warm sand, palm trees, and the sound of the surf.",
  },
  {
    id: "rome-italy",
    title: "Rome, Italy",
    destination: "Rome, Italy",
    category: "History",
    source: "vr_jester",
    image: photo("photo-1552832230-c0197dd311b5"),
    durationMinutes: 20,
    youtubeQuery: "Rome walking tour 360 VR",
    tags: ["rome", "italy", "honeymoon", "history", "vatican", "travel"],
    description: "Stand in the heart of the Eternal City.",
  },
  {
    id: "paris-france",
    title: "Paris, France",
    destination: "Paris, France",
    category: "Travel",
    source: "vr_jester",
    image: photo("photo-1502602898657-3e91760cbb34"),
    durationMinutes: 18,
    youtubeQuery: "Paris 360 VR Eiffel Tower",
    tags: ["paris", "france", "travel", "romance", "city"],
    description: "A stroll toward the Eiffel Tower.",
  },
  {
    id: "grand-canyon",
    title: "Grand Canyon",
    destination: "Grand Canyon",
    category: "Nature",
    source: "vr_jester",
    image: photo("photo-1474044159687-1ee9f3a52446"),
    durationMinutes: 15,
    youtubeQuery: "Grand Canyon 360 VR",
    tags: ["grand canyon", "national parks", "nature", "adventure", "west"],
    description: "Look out over one of America's great wonders.",
  },
  {
    id: "yellowstone",
    title: "Yellowstone",
    destination: "Yellowstone",
    category: "Nature",
    source: "vr_jester",
    image: photo("photo-1506905925346-21bda4d32df4"),
    durationMinutes: 15,
    youtubeQuery: "Yellowstone 360 VR",
    tags: ["yellowstone", "national parks", "nature", "wildlife", "geysers"],
    description: "Geysers, wildlife, and wide open sky.",
  },
  {
    id: "venice-italy",
    title: "Venice, Italy",
    destination: "Venice, Italy",
    category: "Travel",
    source: "vr_jester",
    image: photo("photo-1523906834658-6e24ef2386f9"),
    durationMinutes: 15,
    youtubeQuery: "Venice canals 360 VR",
    tags: ["venice", "italy", "canals", "honeymoon", "travel"],
    description: "Drift along the canals of Venice.",
  },
  {
    id: "tokyo-japan",
    title: "Tokyo, Japan",
    destination: "Tokyo, Japan",
    category: "Travel",
    source: "vr_jester",
    image: photo("photo-1540959733332-eab4deabeeaf"),
    durationMinutes: 15,
    youtubeQuery: "Tokyo 360 VR",
    tags: ["tokyo", "japan", "city", "travel", "baseball"],
    description: "City lights and quiet gardens in Tokyo.",
  },
  {
    id: "notre-dame",
    title: "Notre Dame Campus",
    destination: "Notre Dame Campus",
    category: "Memory Lane",
    source: "vr_jester",
    image: photo("photo-1562774053-701939374570"),
    durationMinutes: 12,
    youtubeQuery: "Notre Dame campus 360 VR",
    tags: ["notre dame", "college", "campus", "football", "memories"],
    description: "Walk a golden campus that feels like home.",
  },
  {
    id: "chicago-architecture",
    title: "Chicago Architecture Tour",
    destination: "Chicago Architecture Tour",
    category: "Travel",
    source: "vr_jester",
    image: photo("photo-1477959858617-67f85cf4f1df"),
    durationMinutes: 15,
    youtubeQuery: "Chicago architecture river tour 360",
    tags: ["chicago", "architecture", "city", "cubs", "travel"],
    description: "The Chicago River and the skyline around it.",
  },
  {
    id: "yt-rome-walk",
    title: "Explore Rome",
    destination: "Rome walking tour",
    category: "YouTube 360",
    source: "youtube_360",
    image: photo("photo-1531572753322-ad063cecc140"),
    durationMinutes: 12,
    youtubeQuery: "Rome walking tour 360 VR immersive",
    channel: "YouTube 360",
    tags: ["rome", "italy", "walking", "history", "360"],
    description: "A 360° walk through historic Rome.",
  },
  {
    id: "yt-sea-turtles",
    title: "Swim With Sea Turtles",
    destination: "Swim with sea turtles",
    category: "YouTube 360",
    source: "youtube_360",
    image: photo("photo-1544551763-46a013bb70d5"),
    durationMinutes: 8,
    youtubeQuery: "sea turtles scuba 360 VR immersive",
    channel: "YouTube 360",
    tags: ["ocean", "animals", "hawaii", "beach", "scuba", "relaxation"],
    description: "An underwater 360° swim beside sea turtles.",
  },
  {
    id: "yt-waikiki",
    title: "Walk Waikiki Beach",
    destination: "Waikiki Beach",
    category: "YouTube 360",
    source: "youtube_360",
    image: photo("photo-1469474968028-56623f02e42e"),
    durationMinutes: 10,
    youtubeQuery: "Waikiki Beach 360 VR walk",
    channel: "YouTube 360",
    tags: ["hawaii", "beach", "waikiki", "honeymoon", "relaxation"],
    description: "A 360° stroll along Waikiki.",
  },
  {
    id: "yt-vatican",
    title: "Tour the Vatican",
    destination: "Vatican",
    category: "YouTube 360",
    source: "youtube_360",
    image: photo("photo-1531572753322-ad063cecc140"),
    durationMinutes: 14,
    youtubeQuery: "Vatican 360 VR tour immersive",
    channel: "YouTube 360",
    tags: ["vatican", "rome", "italy", "history", "church"],
    description: "Look around St. Peter's in 360°.",
  },
  {
    id: "yt-safari",
    title: "African Safari",
    destination: "African safari",
    category: "Animals",
    source: "youtube_360",
    image: photo("photo-1516426122078-c23e76319801"),
    durationMinutes: 11,
    youtubeQuery: "African safari 360 VR wildlife",
    channel: "YouTube 360",
    tags: ["safari", "animals", "wildlife", "nature", "adventure"],
    description: "A 360° wildlife drive across the savanna.",
  },
  {
    id: "yt-northern-lights",
    title: "Northern Lights",
    destination: "Northern Lights",
    category: "Nature",
    source: "youtube_360",
    image: photo("photo-1531366936337-7c912a8584b9"),
    durationMinutes: 9,
    youtubeQuery: "Northern Lights 360 VR aurora",
    channel: "YouTube 360",
    tags: ["northern lights", "aurora", "nature", "relaxation", "space"],
    description: "Stand under the aurora in 360°.",
  },
  {
    id: "yt-space",
    title: "Earth From Space",
    destination: "Space",
    category: "Adventure",
    source: "youtube_360",
    image: photo("photo-1446776811953-b23d57bd21aa"),
    durationMinutes: 8,
    youtubeQuery: "Earth from space 360 VR ISS",
    channel: "YouTube 360",
    tags: ["space", "earth", "adventure", "science"],
    description: "Look back at Earth from orbit.",
  },
  {
    id: "yt-train",
    title: "Scenic Train Ride",
    destination: "Train ride",
    category: "Relaxation",
    source: "youtube_360",
    image: photo("photo-1474487548417-781cb71495f3"),
    durationMinutes: 16,
    youtubeQuery: "scenic train ride 360 VR",
    channel: "YouTube 360",
    tags: ["train", "travel", "relaxation", "mountains"],
    description: "A gentle 360° journey by rail.",
  },
  {
    id: "yt-museum",
    title: "Museum After Hours",
    destination: "Art museum",
    category: "History",
    source: "youtube_360",
    image: photo("photo-1554907984-15263bfd63bd"),
    durationMinutes: 12,
    youtubeQuery: "art museum 360 VR tour",
    channel: "YouTube 360",
    tags: ["museum", "art", "history", "music"],
    description: "Wander a quiet gallery in 360°.",
  },
  {
    id: "yt-canyon-flight",
    title: "Grand Canyon Flight",
    destination: "Grand Canyon 360",
    category: "YouTube 360",
    source: "youtube_360",
    image: photo("photo-1500534314209-a25ddb2bd429"),
    durationMinutes: 7,
    youtubeQuery: "Grand Canyon helicopter 360 VR",
    channel: "YouTube 360",
    tags: ["grand canyon", "national parks", "adventure", "nature"],
    description: "A 360° flight over the canyon rim.",
  },
];

export const discoverSections: { title: string; category?: ExperienceCategory; special?: string }[] = [
  { title: "Recommended For Your Residents", special: "recommended" },
  { title: "Trending At Your Community", special: "trending" },
  { title: "New Experiences", special: "new" },
  { title: "Family Requested", special: "family" },
  { title: "Travel", category: "Travel" },
  { title: "Memory Lane", category: "Memory Lane" },
  { title: "Nature", category: "Nature" },
  { title: "Sports", category: "Sports" },
  { title: "Animals", category: "Animals" },
  { title: "Music & Entertainment", category: "Music & Entertainment" },
  { title: "History", category: "History" },
  { title: "Adventure", category: "Adventure" },
  { title: "Relaxation", category: "Relaxation" },
  { title: "YouTube 360", category: "YouTube 360" },
];

export function findExperience(value: string) {
  const needle = value.trim().toLowerCase();
  return (
    catalog.find(
      (item) =>
        item.id === needle ||
        item.title.toLowerCase() === needle ||
        item.destination.toLowerCase() === needle,
    ) ??
    catalog.find(
      (item) =>
        item.title.toLowerCase().includes(needle) ||
        item.destination.toLowerCase().includes(needle) ||
        needle.includes(item.destination.toLowerCase()) ||
        item.tags.some((tag) => needle.includes(tag) || tag.includes(needle)),
    ) ??
    null
  );
}

export function experienceImage(destination: string) {
  return findExperience(destination)?.image ?? photo("photo-1469474968028-56623f02e42e");
}
