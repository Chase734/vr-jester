export type VrComfortLevel = "Comfortable" | "Needs short sessions" | "New to VR";

export type FamilyMember = {
  name: string;
  relation: string;
  note: string;
};

export type Resident = {
  id: string;
  facilityId?: string;
  name: string;
  room: string;
  birthday: string;
  hometown: string;
  placesLived: string[];
  placesVisited: string[];
  placesTheyWantToVisit: string[];
  favoriteSportsTeams: string[];
  favoriteVacation: string;
  favoritePlaces: string[];
  militaryService: string;
  college: string;
  interests: string[];
  familyMembers: FamilyMember[];
  mobilityNotes: string;
  highSchool: string;
  career: string;
  spousePartner: string;
  childrenGrandchildren: string[];
  childhoodMemories: string;
  weddingHoneymoon: string;
  meaningfulPlaces: string[];
  restaurantsLandmarks: string[];
  majorLifeEvents: string[];
  music: string[];
  moviesTv: string[];
  food: string[];
  animals: string[];
  culturalInterests: string[];
  topicsToAvoid: string[];
  staffNotes: string;
  familyLinkToken?: string;
  vrComfortLevel: VrComfortLevel;
  favoriteExperiences: string[];
  pastExperiences: string[];
  futureRequests: string[];
  sessionsThisMonth: number;
  engagement: "Needs a visit" | "Doing well" | "Very active";
};

export type SessionReaction = "Loved It" | "Liked It" | "Neutral" | "Didn't Like It";
export type SessionEngagement = "Highly Engaged" | "Engaged" | "Limited Engagement" | "Disengaged";

export type Session = {
  id: string;
  facilityId?: string;
  residentId: string;
  residentName: string;
  experience: string;
  startsAt: string;
  status: "upcoming" | "completed";
  durationMinutes: number;
  reaction: SessionReaction | "";
  sessionEngagement: SessionEngagement | "";
  sessionNotes: string;
  memoryDiscovered: string;
  followUpDestination: string;
  requestId: string | null;
};

export const sessionReactions: SessionReaction[] = [
  "Loved It",
  "Liked It",
  "Neutral",
  "Didn't Like It",
];

export const sessionEngagements: SessionEngagement[] = [
  "Highly Engaged",
  "Engaged",
  "Limited Engagement",
  "Disengaged",
];

export type RequestStatus = "New" | "Approved" | "Completed" | "Declined";

export type FamilyRequest = {
  id: string;
  facilityId?: string;
  residentId: string;
  residentName: string;
  requestedBy: string;
  experience: string;
  note: string;
  received: string;
  relationship: string;
  approximateYear: string;
  whyItMatters: string;
  staffShouldKnow: string;
  status: RequestStatus;
  submittedAt: string;
  sessionId: string | null;
};

export const emptyLifeStory = {
  highSchool: "",
  career: "",
  spousePartner: "",
  childrenGrandchildren: [] as string[],
  childhoodMemories: "",
  weddingHoneymoon: "",
  meaningfulPlaces: [] as string[],
  restaurantsLandmarks: [] as string[],
  majorLifeEvents: [] as string[],
  music: [] as string[],
  moviesTv: [] as string[],
  food: [] as string[],
  animals: [] as string[],
  culturalInterests: [] as string[],
  topicsToAvoid: [] as string[],
  staffNotes: "",
};

export const facility = {
  name: "Maple Grove Senior Living",
  staffName: "Pat Rivera",
};

const mapleGroveSample = [
  {
    id: "r1",
    name: "Helen Park",
    room: "Room 12",
    birthday: "1941-03-18",
    hometown: "Seoul, South Korea",
    placesLived: ["Seoul, South Korea", "Los Angeles, California", "Maple Grove"],
    placesVisited: ["Tokyo, Japan", "Paris, France", "Honolulu, Hawaii"],
    placesTheyWantToVisit: ["Seoul palaces", "Jeju Island", "San Francisco"],
    favoriteSportsTeams: ["Los Angeles Dodgers"],
    favoriteVacation: "A week in Honolulu with her sister in 1988",
    favoritePlaces: ["Seoul, South Korea", "Honolulu, Hawaii"],
    militaryService: "None",
    college: "Ewha Womans University",
    interests: ["Gardening", "Korean cooking", "Church choir"],
    familyMembers: [
      { name: "Min Park", relation: "Son", note: "Visits on Sundays" },
      { name: "Grace Park", relation: "Granddaughter", note: "Calls on Fridays" },
    ],
    mobilityNotes: "Uses a walker for longer hallways. Sits comfortably in a chair.",
    vrComfortLevel: "Comfortable",
    favoriteExperiences: ["Paris, France", "Seoul, South Korea"],
    pastExperiences: ["Paris, France", "Tokyo, Japan"],
    futureRequests: ["Seoul, South Korea — requested by her son, Min"],
    sessionsThisMonth: 4,
    engagement: "Very active",
  },
  {
    id: "r2",
    name: "Robert Chen",
    room: "Room 8",
    birthday: "1938-11-02",
    hometown: "Taipei, Taiwan",
    placesLived: ["Taipei, Taiwan", "San Francisco, California", "Maple Grove"],
    placesVisited: ["Grand Canyon", "Yosemite", "Vancouver, Canada"],
    placesTheyWantToVisit: ["Hong Kong", "Yellowstone"],
    favoriteSportsTeams: ["San Francisco Giants", "Golden State Warriors"],
    favoriteVacation: "Camping at Yosemite with his sons",
    favoritePlaces: ["Yosemite", "San Francisco, California"],
    militaryService: "None",
    college: "University of California, Berkeley",
    interests: ["Photography", "Mahjong", "National parks"],
    familyMembers: [
      { name: "David Chen", relation: "Son", note: "Lives nearby" },
      { name: "Linda Chen", relation: "Daughter", note: "In Seattle" },
    ],
    mobilityNotes: "Steady on his feet. Prefers a firm chair with armrests.",
    vrComfortLevel: "Comfortable",
    favoriteExperiences: ["Grand Canyon", "Yosemite"],
    pastExperiences: ["Grand Canyon"],
    futureRequests: ["Yellowstone"],
    sessionsThisMonth: 3,
    engagement: "Doing well",
  },
  {
    id: "r3",
    name: "Dorothy Miles",
    room: "Room 21",
    birthday: "1936-07-09",
    hometown: "Toledo, Ohio",
    placesLived: ["Toledo, Ohio", "Chicago, Illinois", "Maple Grove"],
    placesVisited: ["Venice, Italy", "London, England", "Niagara Falls"],
    placesTheyWantToVisit: ["Rome, Italy", "The Swiss Alps"],
    favoriteSportsTeams: ["Chicago Cubs"],
    favoriteVacation: "A gondola ride in Venice on her 40th anniversary",
    favoritePlaces: ["Venice, Italy", "Toledo, Ohio"],
    militaryService: "None",
    college: "Ohio State University",
    interests: ["Reading", "Piano", "Art museums"],
    familyMembers: [
      { name: "Susan Miles", relation: "Daughter", note: "Teacher; visits Wednesdays" },
    ],
    mobilityNotes: "Uses a wheelchair for longer distances. Headset fits well while seated.",
    vrComfortLevel: "Needs short sessions",
    favoriteExperiences: ["Venice, Italy"],
    pastExperiences: ["Venice, Italy"],
    futureRequests: ["Rome, Italy"],
    sessionsThisMonth: 2,
    engagement: "Doing well",
  },
  {
    id: "r4",
    name: "James Walsh",
    room: "Room 4",
    birthday: "1944-01-22",
    hometown: "Dublin, Ireland",
    placesLived: ["Dublin, Ireland", "Boston, Massachusetts", "Maple Grove"],
    placesVisited: ["London, England", "New York City"],
    placesTheyWantToVisit: ["Dublin, Ireland", "The Cliffs of Moher"],
    favoriteSportsTeams: ["Boston Red Sox", "Boston Celtics"],
    favoriteVacation: "A summer in County Cork with cousins",
    favoritePlaces: ["Dublin, Ireland", "Boston, Massachusetts"],
    militaryService: "U.S. Army, 1964–1966",
    college: "Boston College",
    interests: ["History", "Irish music", "Baseball"],
    familyMembers: [
      { name: "Claire Walsh", relation: "Daughter", note: "Sends destination requests" },
      { name: "Tom Walsh", relation: "Son", note: "Lives in Boston" },
    ],
    mobilityNotes: "Mild tremor in left hand. Keep sessions seated. Offer water nearby.",
    vrComfortLevel: "New to VR",
    favoriteExperiences: ["Boston, Massachusetts"],
    pastExperiences: [],
    futureRequests: ["Dublin, Ireland — requested by his daughter, Claire"],
    sessionsThisMonth: 1,
    engagement: "Needs a visit",
  },
  {
    id: "r5",
    name: "Margaret Ellis",
    room: "Room 16",
    birthday: "1939-05-30",
    hometown: "Bath, England",
    placesLived: ["Bath, England", "Philadelphia, Pennsylvania", "Maple Grove"],
    placesVisited: ["Rome, Italy", "Paris, France", "Edinburgh, Scotland"],
    placesTheyWantToVisit: ["The English countryside", "Florence, Italy"],
    favoriteSportsTeams: ["None she follows closely"],
    favoriteVacation: "Walking the Roman Forum with her husband",
    favoritePlaces: ["Rome, Italy", "Bath, England"],
    militaryService: "None",
    college: "University of London",
    interests: ["Gardens", "Tea", "Classical music"],
    familyMembers: [
      { name: "Peter Ellis", relation: "Son", note: "Calls twice a week" },
    ],
    mobilityNotes: "Walks with a cane. Can put the headset on with a little help.",
    vrComfortLevel: "Comfortable",
    favoriteExperiences: ["Rome, Italy", "Paris, France"],
    pastExperiences: ["Paris, France"],
    futureRequests: ["Florence, Italy"],
    sessionsThisMonth: 3,
    engagement: "Doing well",
  },
  {
    id: "r6",
    name: "Alice Nguyen",
    room: "Room 9",
    birthday: "1948-09-14",
    hometown: "Hue, Vietnam",
    placesLived: ["Hue, Vietnam", "Houston, Texas", "Maple Grove"],
    placesVisited: ["Paris, France", "New Orleans", "Washington, D.C."],
    placesTheyWantToVisit: ["Hanoi, Vietnam", "Ha Long Bay"],
    favoriteSportsTeams: ["Houston Astros"],
    favoriteVacation: "A family trip to New Orleans for her granddaughter’s graduation",
    favoritePlaces: ["Hue, Vietnam", "New Orleans"],
    militaryService: "None",
    college: "University of Houston",
    interests: ["Cooking", "Grandchildren", "Markets"],
    familyMembers: [
      { name: "Linh Nguyen", relation: "Daughter", note: "Lives in Houston" },
      { name: "Mai Nguyen", relation: "Granddaughter", note: "College student" },
    ],
    mobilityNotes: "No mobility limits. May need a short break if the scene is crowded.",
    vrComfortLevel: "Needs short sessions",
    favoriteExperiences: ["Paris, France"],
    pastExperiences: [],
    futureRequests: ["Hanoi, Vietnam"],
    sessionsThisMonth: 2,
    engagement: "Doing well",
  },
  {
    id: "r7",
    name: "Frank Ortega",
    room: "Room 3",
    birthday: "1935-12-05",
    hometown: "Mexico City, Mexico",
    placesLived: ["Mexico City, Mexico", "San Antonio, Texas", "Maple Grove"],
    placesVisited: ["Guadalajara", "Austin, Texas"],
    placesTheyWantToVisit: ["Mexico City", "Cancun beaches"],
    favoriteSportsTeams: ["San Antonio Spurs"],
    favoriteVacation: "Winters in Mexico City with Elena",
    favoritePlaces: ["Mexico City", "San Antonio, Texas"],
    militaryService: "None",
    college: "Did not attend college",
    interests: ["Soccer", "Family meals", "Old movies"],
    familyMembers: [
      { name: "Elena Ortega", relation: "Wife", note: "Visits most afternoons" },
      { name: "Miguel Ortega", relation: "Son", note: "Lives in San Antonio" },
    ],
    mobilityNotes: "Tires easily. Keep sessions under 15 minutes. Help with the headset strap.",
    vrComfortLevel: "New to VR",
    favoriteExperiences: ["Mexico City"],
    pastExperiences: [],
    futureRequests: ["Mexico City — requested by his wife, Elena"],
    sessionsThisMonth: 0,
    engagement: "Needs a visit",
  },
  {
    id: "r8",
    name: "Ruth Bennett",
    room: "Room 18",
    birthday: "1943-04-11",
    hometown: "Portland, Oregon",
    placesLived: ["Portland, Oregon", "Denver, Colorado", "Maple Grove"],
    placesVisited: ["Hawaii", "Alaska", "Paris, France", "Grand Canyon"],
    placesTheyWantToVisit: ["New Zealand", "Machu Picchu"],
    favoriteSportsTeams: ["Portland Trail Blazers"],
    favoriteVacation: "Two weeks on Maui with her hiking club",
    favoritePlaces: ["Hawaii", "Portland, Oregon"],
    militaryService: "None",
    college: "University of Oregon",
    interests: ["Hiking stories", "Birdwatching", "Travel magazines"],
    familyMembers: [
      { name: "Kate Bennett", relation: "Daughter", note: "Plans trips with staff" },
      { name: "Noah Bennett", relation: "Grandson", note: "Sends postcards" },
    ],
    mobilityNotes: "Independent walker. Enjoys longer sessions if the view is scenic.",
    vrComfortLevel: "Comfortable",
    favoriteExperiences: ["Hawaii beaches", "Grand Canyon"],
    pastExperiences: ["Hawaii beaches", "Grand Canyon", "Paris, France"],
    futureRequests: ["New Zealand"],
    sessionsThisMonth: 5,
    engagement: "Very active",
  },
].map((resident) => ({
  ...emptyLifeStory,
  ...resident,
  vrComfortLevel: resident.vrComfortLevel,
})) as Resident[];

export const residents: Resident[] = mapleGroveSample;

export const experiences = [
  { name: "Paris, France", trips: 9 },
  { name: "Grand Canyon", trips: 7 },
  { name: "Venice, Italy", trips: 6 },
  { name: "Tokyo, Japan", trips: 4 },
  { name: "Hawaii beaches", trips: 3 },
];

const mapleGroveSessions = [
  {
    id: "s1",
    residentId: "r1",
    residentName: "Helen Park",
    experience: "Paris, France",
    startsAt: "2026-09-28T10:00:00",
    status: "completed" as const,
    durationMinutes: 15,
    reaction: "Loved It" as const,
    sessionEngagement: "Highly Engaged" as const,
  },
  {
    id: "s2",
    residentId: "r2",
    residentName: "Robert Chen",
    experience: "Grand Canyon",
    startsAt: "2026-09-30T14:00:00",
    status: "completed" as const,
  },
  {
    id: "s3",
    residentId: "r3",
    residentName: "Dorothy Miles",
    experience: "Venice, Italy",
    startsAt: "2026-10-01T11:00:00",
    status: "completed" as const,
  },
  {
    id: "s4",
    residentId: "r8",
    residentName: "Ruth Bennett",
    experience: "Hawaii beaches",
    startsAt: "2026-10-01T15:30:00",
    status: "completed" as const,
  },
  {
    id: "s5",
    residentId: "r5",
    residentName: "Margaret Ellis",
    experience: "Rome, Italy",
    startsAt: "2026-10-02T10:00:00",
    status: "upcoming" as const,
  },
  {
    id: "s6",
    residentId: "r4",
    residentName: "James Walsh",
    experience: "Tokyo, Japan",
    startsAt: "2026-10-02T14:00:00",
    status: "upcoming" as const,
  },
  {
    id: "s7",
    residentId: "r6",
    residentName: "Alice Nguyen",
    experience: "Paris, France",
    startsAt: "2026-10-03T10:30:00",
    status: "upcoming" as const,
  },
  {
    id: "s8",
    residentId: "r7",
    residentName: "Frank Ortega",
    experience: "Grand Canyon",
    startsAt: "2026-10-04T13:00:00",
    status: "upcoming" as const,
  },
];

export const sessions: Session[] = mapleGroveSessions.map((session) => ({
  durationMinutes: 0,
  reaction: "" as Session["reaction"],
  sessionEngagement: "" as Session["sessionEngagement"],
  sessionNotes: "",
  memoryDiscovered: "",
  followUpDestination: "",
  requestId: null,
  ...session,
}));

export const familyRequests: FamilyRequest[] = [
  {
    id: "f1",
    residentId: "r4",
    residentName: "James Walsh",
    requestedBy: "His daughter, Claire",
    experience: "Dublin, Ireland",
    note: "Dad grew up near there.",
    received: "This morning",
    relationship: "Daughter",
    approximateYear: "",
    whyItMatters: "He grew up near there.",
    staffShouldKnow: "",
    status: "New",
    submittedAt: "2026-10-02T08:00:00",
    sessionId: null,
  },
  {
    id: "f2",
    residentId: "r1",
    residentName: "Helen Park",
    requestedBy: "Her son, Min",
    experience: "Seoul, South Korea",
    note: "She has been asking about home.",
    received: "Yesterday",
    relationship: "Son",
    approximateYear: "",
    whyItMatters: "She has been asking about home.",
    staffShouldKnow: "",
    status: "New",
    submittedAt: "2026-10-01T08:00:00",
    sessionId: null,
  },
  {
    id: "f3",
    residentId: "r7",
    residentName: "Frank Ortega",
    requestedBy: "His wife, Elena",
    experience: "Mexico City",
    note: "They used to visit every winter.",
    received: "Monday",
    relationship: "Spouse",
    approximateYear: "",
    whyItMatters: "They used to visit every winter.",
    staffShouldKnow: "",
    status: "New",
    submittedAt: "2026-09-28T08:00:00",
    sessionId: null,
  },
];

const weekStart = new Date("2026-09-28T00:00:00");
const weekEnd = new Date("2026-10-04T23:59:59");

export const sessionsThisWeek = sessions.filter((session) => {
  const when = new Date(session.startsAt);
  return when >= weekStart && when <= weekEnd;
});

export const upcomingSessions = sessions.filter((session) => session.status === "upcoming");

export const recentSessions = sessions
  .filter((session) => session.status === "completed")
  .slice()
  .reverse();

export function getResident(id: string) {
  return residents.find((resident) => resident.id === id);
}

export function createBlankResident(name: string, room: string): Resident {
  return {
    id: `r-${Date.now()}`,
    facilityId: undefined,
    familyLinkToken: crypto.randomUUID(),
    name: name.trim(),
    room: room.trim() || "Room unassigned",
    birthday: "",
    hometown: "",
    placesLived: [],
    placesVisited: [],
    placesTheyWantToVisit: [],
    favoriteSportsTeams: [],
    favoriteVacation: "",
    favoritePlaces: [],
    militaryService: "",
    college: "",
    interests: [],
    familyMembers: [],
    mobilityNotes: "",
    ...emptyLifeStory,
    vrComfortLevel: "New to VR",
    favoriteExperiences: [],
    pastExperiences: [],
    futureRequests: [],
    sessionsThisMonth: 0,
    engagement: "Needs a visit",
  };
}

export const interestSuggestions = [
  "Gardening",
  "Cooking",
  "Music",
  "Reading",
  "Church",
  "Sports",
  "Grandchildren",
  "Art",
  "Movies",
  "History",
];

export const placeSuggestions = [
  "Paris, France",
  "Grand Canyon",
  "Venice, Italy",
  "Tokyo, Japan",
  "Hawaii beaches",
  "Rome, Italy",
  "Seoul, South Korea",
  "Mexico City",
  "Dublin, Ireland",
];
