import type { FamilyMember, FamilyRequest, Resident, Session } from "@/data/sample";
import { isLinkToken } from "@/lib/names";

export type StaffProfile = {
  id: string;
  role: "admin" | "staff";
  fullName: string;
  facilityId: string | null;
  facilityName: string;
};

export type Facility = {
  id: string;
  name: string;
};

export type ResidentRow = {
  id: string;
  facility_id: string;
  name: string;
  room: string;
  birthday: string;
  hometown: string;
  places_lived: string[];
  places_visited: string[];
  places_they_want_to_visit: string[];
  favorite_sports_teams: string[];
  favorite_vacation: string;
  favorite_places: string[];
  military_service: string;
  college: string;
  interests: string[];
  family_members: FamilyMember[];
  mobility_notes: string;
  high_school: string;
  career: string;
  spouse_partner: string;
  children_grandchildren: string[];
  childhood_memories: string;
  wedding_honeymoon: string;
  meaningful_places: string[];
  restaurants_landmarks: string[];
  major_life_events: string[];
  music: string[];
  movies_tv: string[];
  food: string[];
  animals: string[];
  cultural_interests: string[];
  topics_to_avoid: string[];
  staff_notes: string;
  favorite_decade?: string;
  family_traditions?: string;
  family_link_token?: string;
  vr_comfort_level: Resident["vrComfortLevel"];
  favorite_experiences: string[];
  past_experiences: string[];
  future_requests: string[];
  sessions_this_month: number;
  engagement: Resident["engagement"];
};

export function residentFromRow(row: ResidentRow): Resident {
  return {
    id: row.id,
    facilityId: row.facility_id,
    name: row.name,
    room: row.room,
    birthday: row.birthday,
    hometown: row.hometown,
    placesLived: row.places_lived ?? [],
    placesVisited: row.places_visited ?? [],
    placesTheyWantToVisit: row.places_they_want_to_visit ?? [],
    favoriteSportsTeams: row.favorite_sports_teams ?? [],
    favoriteVacation: row.favorite_vacation ?? "",
    favoritePlaces: row.favorite_places ?? [],
    militaryService: row.military_service ?? "",
    college: row.college ?? "",
    interests: row.interests ?? [],
    familyMembers: row.family_members ?? [],
    mobilityNotes: row.mobility_notes ?? "",
    highSchool: row.high_school ?? "",
    career: row.career ?? "",
    spousePartner: row.spouse_partner ?? "",
    childrenGrandchildren: row.children_grandchildren ?? [],
    childhoodMemories: row.childhood_memories ?? "",
    weddingHoneymoon: row.wedding_honeymoon ?? "",
    meaningfulPlaces: row.meaningful_places ?? [],
    restaurantsLandmarks: row.restaurants_landmarks ?? [],
    majorLifeEvents: row.major_life_events ?? [],
    music: row.music ?? [],
    moviesTv: row.movies_tv ?? [],
    food: row.food ?? [],
    animals: row.animals ?? [],
    culturalInterests: row.cultural_interests ?? [],
    topicsToAvoid: row.topics_to_avoid ?? [],
    staffNotes: row.staff_notes ?? "",
    favoriteDecade: row.favorite_decade ?? "",
    familyTraditions: row.family_traditions ?? "",
    familyLinkToken: row.family_link_token ?? "",
    vrComfortLevel: row.vr_comfort_level,
    favoriteExperiences: row.favorite_experiences ?? [],
    pastExperiences: row.past_experiences ?? [],
    futureRequests: row.future_requests ?? [],
    sessionsThisMonth: row.sessions_this_month ?? 0,
    engagement: row.engagement,
  };
}

export function residentToRow(resident: Resident, facilityId: string): ResidentRow {
  return {
    id: resident.id,
    facility_id: resident.facilityId || facilityId,
    name: resident.name,
    room: resident.room,
    birthday: resident.birthday,
    hometown: resident.hometown,
    places_lived: resident.placesLived,
    places_visited: resident.placesVisited,
    places_they_want_to_visit: resident.placesTheyWantToVisit,
    favorite_sports_teams: resident.favoriteSportsTeams,
    favorite_vacation: resident.favoriteVacation,
    favorite_places: resident.favoritePlaces,
    military_service: resident.militaryService,
    college: resident.college,
    interests: resident.interests,
    family_members: resident.familyMembers,
    mobility_notes: resident.mobilityNotes,
    high_school: resident.highSchool,
    career: resident.career,
    spouse_partner: resident.spousePartner,
    children_grandchildren: resident.childrenGrandchildren,
    childhood_memories: resident.childhoodMemories,
    wedding_honeymoon: resident.weddingHoneymoon,
    meaningful_places: resident.meaningfulPlaces,
    restaurants_landmarks: resident.restaurantsLandmarks,
    major_life_events: resident.majorLifeEvents,
    music: resident.music,
    movies_tv: resident.moviesTv,
    food: resident.food,
    animals: resident.animals,
    cultural_interests: resident.culturalInterests,
    topics_to_avoid: resident.topicsToAvoid,
    staff_notes: resident.staffNotes,
    ...(resident.favoriteDecade
      ? { favorite_decade: resident.favoriteDecade }
      : {}),
    ...(resident.familyTraditions
      ? { family_traditions: resident.familyTraditions }
      : {}),
    ...(isLinkToken(resident.familyLinkToken ?? "")
      ? { family_link_token: resident.familyLinkToken }
      : {}),
    vr_comfort_level: resident.vrComfortLevel,
    favorite_experiences: resident.favoriteExperiences,
    past_experiences: resident.pastExperiences,
    future_requests: resident.futureRequests,
    sessions_this_month: resident.sessionsThisMonth,
    engagement: resident.engagement,
  };
}

export type SessionRow = {
  id: string;
  facility_id: string;
  resident_id: string;
  resident_name: string;
  experience: string;
  starts_at: string;
  status: Session["status"];
  duration_minutes?: number;
  reaction?: Session["reaction"];
  session_engagement?: Session["sessionEngagement"];
  staff_notes?: string;
  memory_discovered?: string;
  follow_up_destination?: string;
  request_id?: string | null;
  experience_type?: Session["experienceType"];
  youtube_video_id?: string;
  completion_percentage?: number;
};

export function sessionFromRow(row: SessionRow): Session {
  return {
    id: row.id,
    facilityId: row.facility_id,
    residentId: row.resident_id,
    residentName: row.resident_name,
    experience: row.experience,
    startsAt: row.starts_at,
    status: row.status,
    durationMinutes: row.duration_minutes ?? 0,
    reaction: row.reaction ?? "",
    sessionEngagement: row.session_engagement ?? "",
    sessionNotes: row.staff_notes ?? "",
    memoryDiscovered: row.memory_discovered ?? "",
    followUpDestination: row.follow_up_destination ?? "",
    requestId: row.request_id ?? null,
    experienceType: row.experience_type === "youtube_360" ? "youtube_360" : "vr_jester",
    youtubeVideoId: row.youtube_video_id ?? "",
    completionPercentage: row.completion_percentage ?? (row.status === "completed" ? 100 : 0),
  };
}

export type RequestRow = {
  id: string;
  facility_id: string;
  resident_id: string;
  resident_name: string;
  requested_by: string;
  experience: string;
  note: string;
  received: string;
  relationship?: string;
  approximate_year?: string;
  why_it_matters?: string;
  staff_should_know?: string;
  status?: FamilyRequest["status"];
  submitted_at?: string;
  session_id?: string | null;
};

export function requestFromRow(row: RequestRow): FamilyRequest {
  return {
    id: row.id,
    facilityId: row.facility_id,
    residentId: row.resident_id,
    residentName: row.resident_name,
    requestedBy: row.requested_by,
    experience: row.experience,
    note: row.note,
    received: row.received,
    relationship: row.relationship ?? "",
    approximateYear: row.approximate_year ?? "",
    whyItMatters: row.why_it_matters ?? "",
    staffShouldKnow: row.staff_should_know ?? "",
    status: row.status ?? "New",
    submittedAt: row.submitted_at ?? "",
    sessionId: row.session_id ?? null,
  };
}
