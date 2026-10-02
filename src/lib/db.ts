import type { FamilyMember, FamilyRequest, Resident, Session } from "@/data/sample";

export type StaffProfile = {
  id: string;
  role: "admin" | "staff";
  fullName: string;
  facilityId: string | null;
  facilityName: string;
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
};

export function sessionFromRow(row: SessionRow): Session {
  return {
    id: row.id,
    residentId: row.resident_id,
    residentName: row.resident_name,
    experience: row.experience,
    startsAt: row.starts_at,
    status: row.status,
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
};

export function requestFromRow(row: RequestRow): FamilyRequest {
  return {
    id: row.id,
    residentId: row.resident_id,
    residentName: row.resident_name,
    requestedBy: row.requested_by,
    experience: row.experience,
    note: row.note,
    received: row.received,
  };
}
