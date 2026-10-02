"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  createBlankResident,
  familyRequests as seedRequests,
  residents as seedResidents,
  sessions as seedSessions,
  type FamilyMember,
  type FamilyRequest,
  type Resident,
  type Session,
} from "@/data/sample";
import { MAPLE_GROVE_FACILITY_ID, SELECTED_FACILITY_KEY } from "@/lib/constants";
import {
  requestFromRow,
  residentFromRow,
  residentToRow,
  sessionFromRow,
  type Facility,
  type RequestRow,
  type ResidentRow,
  type SessionRow,
  type StaffProfile,
} from "@/lib/db";
import { createClient } from "@/lib/supabase/client";

export type ListKey =
  | "placesLived"
  | "placesVisited"
  | "placesTheyWantToVisit"
  | "favoriteSportsTeams"
  | "interests"
  | "favoriteExperiences"
  | "pastExperiences"
  | "futureRequests"
  | "favoritePlaces"
  | "childrenGrandchildren"
  | "meaningfulPlaces"
  | "restaurantsLandmarks"
  | "majorLifeEvents"
  | "music"
  | "moviesTv"
  | "food"
  | "animals"
  | "culturalInterests"
  | "topicsToAvoid";

const listColumn: Record<ListKey, keyof ResidentRow> = {
  placesLived: "places_lived",
  placesVisited: "places_visited",
  placesTheyWantToVisit: "places_they_want_to_visit",
  favoriteSportsTeams: "favorite_sports_teams",
  interests: "interests",
  favoriteExperiences: "favorite_experiences",
  pastExperiences: "past_experiences",
  futureRequests: "future_requests",
  favoritePlaces: "favorite_places",
  childrenGrandchildren: "children_grandchildren",
  meaningfulPlaces: "meaningful_places",
  restaurantsLandmarks: "restaurants_landmarks",
  majorLifeEvents: "major_life_events",
  music: "music",
  moviesTv: "movies_tv",
  food: "food",
  animals: "animals",
  culturalInterests: "cultural_interests",
  topicsToAvoid: "topics_to_avoid",
};

type FacilityState = {
  profile: StaffProfile | null;
  facilities: Facility[];
  selectedFacilityId: string;
  residents: Resident[];
  sessions: Session[];
  familyRequests: FamilyRequest[];
};

type FacilityContextValue = FacilityState & {
  hydrated: boolean;
  isAdmin: boolean;
  selectFacility: (id: string) => void;
  addResident: (name: string, room: string) => Resident;
  updateResident: (id: string, patch: Partial<Resident>) => void;
  addListItem: (id: string, key: ListKey, value: string) => void;
  removeListItem: (id: string, key: ListKey, value: string) => void;
  addFamilyMember: (id: string, member: FamilyMember) => void;
  removeFamilyMember: (id: string, name: string) => void;
  logSession: (residentId: string, experience: string) => void;
  addRequest: (residentId: string, experience: string, requestedBy: string, note: string) => void;
};

const FacilityContext = createContext<FacilityContextValue | null>(null);

const empty: FacilityState = {
  profile: null,
  facilities: [],
  selectedFacilityId: MAPLE_GROVE_FACILITY_ID,
  residents: [],
  sessions: [],
  familyRequests: [],
};

function rememberFacility(id: string) {
  try {
    localStorage.setItem(SELECTED_FACILITY_KEY, id);
  } catch {
    // Ignore private-mode storage errors.
  }
}

function recalledFacility() {
  try {
    return localStorage.getItem(SELECTED_FACILITY_KEY);
  } catch {
    return null;
  }
}

function pickFacilityId(profile: StaffProfile | null, facilities: Facility[]) {
  if (profile?.role === "staff" && profile.facilityId) {
    return profile.facilityId;
  }
  const remembered = recalledFacility();
  if (remembered && facilities.some((facility) => facility.id === remembered)) {
    return remembered;
  }
  if (facilities.some((facility) => facility.id === MAPLE_GROVE_FACILITY_ID)) {
    return MAPLE_GROVE_FACILITY_ID;
  }
  return facilities[0]?.id ?? MAPLE_GROVE_FACILITY_ID;
}

function inFacility<T extends { facilityId?: string }>(items: T[], facilityId: string) {
  return items.filter((item) => (item.facilityId || MAPLE_GROVE_FACILITY_ID) === facilityId);
}

export function FacilityProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<FacilityState>(empty);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || cancelled) {
        setState(empty);
        setHydrated(true);
        return;
      }

      const { data: profileRow } = await supabase
        .from("profiles")
        .select("id, role, full_name, facility_id, facilities ( name )")
        .eq("id", user.id)
        .maybeSingle();

      const facilityJoin = profileRow?.facilities as { name: string } | { name: string }[] | null;
      const facilityName = Array.isArray(facilityJoin)
        ? facilityJoin[0]?.name
        : facilityJoin?.name;

      const profile: StaffProfile | null = profileRow
        ? {
            id: profileRow.id as string,
            role: profileRow.role as StaffProfile["role"],
            fullName: (profileRow.full_name as string) || "",
            facilityId: (profileRow.facility_id as string | null) ?? null,
            facilityName:
              facilityName ||
              ((profileRow.role as string) === "admin"
                ? "Maple Grove Senior Living"
                : "Your facility"),
          }
        : null;

      const { data: facilityRows } = await supabase.from("facilities").select("id, name").order("name");
      const facilities: Facility[] = ((facilityRows ?? []) as Facility[]).map((facility) => ({
        id: facility.id,
        name: facility.name,
      }));

      if (profile && (profile.role === "admin" || profile.facilityId === MAPLE_GROVE_FACILITY_ID)) {
        const { count } = await supabase
          .from("residents")
          .select("id", { count: "exact", head: true })
          .eq("facility_id", MAPLE_GROVE_FACILITY_ID);
        if (!count) {
          await supabase
            .from("residents")
            .insert(seedResidents.map((resident) => residentToRow(resident, MAPLE_GROVE_FACILITY_ID)));
          await supabase.from("sessions").insert(
            seedSessions.map((session) => ({
              id: session.id,
              facility_id: MAPLE_GROVE_FACILITY_ID,
              resident_id: session.residentId,
              resident_name: session.residentName,
              experience: session.experience,
              starts_at: session.startsAt,
              status: session.status,
            })),
          );
          await supabase.from("family_requests").insert(
            seedRequests.map((request) => ({
              id: request.id,
              facility_id: MAPLE_GROVE_FACILITY_ID,
              resident_id: request.residentId,
              resident_name: request.residentName,
              requested_by: request.requestedBy,
              experience: request.experience,
              note: request.note,
              received: request.received,
            })),
          );
        }
      }

      const [{ data: residentRows }, { data: sessionRows }, { data: requestRows }] = await Promise.all([
        supabase.from("residents").select("*").order("name"),
        supabase.from("sessions").select("*").order("starts_at", { ascending: false }),
        supabase.from("family_requests").select("*"),
      ]);

      if (cancelled) {
        return;
      }

      setState({
        profile,
        facilities:
          profile?.role === "staff" && profile.facilityId
            ? [{ id: profile.facilityId, name: profile.facilityName }]
            : facilities,
        selectedFacilityId: pickFacilityId(profile, facilities),
        residents: ((residentRows ?? []) as ResidentRow[]).map(residentFromRow),
        sessions: ((sessionRows ?? []) as SessionRow[]).map(sessionFromRow),
        familyRequests: ((requestRows ?? []) as RequestRow[]).map(requestFromRow),
      });
      setHydrated(true);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<FacilityContextValue>(() => {
    const supabase = createClient();
    const facilityId = state.selectedFacilityId;
    const selected = state.facilities.find((facility) => facility.id === facilityId);
    const profile =
      state.profile && selected
        ? { ...state.profile, facilityId: selected.id, facilityName: selected.name }
        : state.profile;
    const residents = inFacility(state.residents, facilityId);
    const sessions = inFacility(state.sessions, facilityId);
    const familyRequests = inFacility(state.familyRequests, facilityId);

    const selectFacility = (id: string) => {
      rememberFacility(id);
      setState((current) => ({ ...current, selectedFacilityId: id }));
    };

    const addResident = (name: string, room: string) => {
      const resident = { ...createBlankResident(name, room), facilityId };
      const row = residentToRow(resident, facilityId);
      void supabase.from("residents").insert(row);
      setState((current) => ({
        ...current,
        residents: [resident, ...current.residents],
      }));
      return resident;
    };

    const updateResident = (id: string, patch: Partial<Resident>) => {
      setState((current) => {
        const next = current.residents.map((resident) =>
          resident.id === id ? { ...resident, ...patch } : resident,
        );
        const updated = next.find((resident) => resident.id === id);
        if (updated) {
          void supabase.from("residents").update(residentToRow(updated, facilityId)).eq("id", id);
        }
        return { ...current, residents: next };
      });
    };

    const addListItem = (id: string, key: ListKey, value: string) => {
      const item = value.trim();
      if (!item) {
        return;
      }
      setState((current) => {
        const next = current.residents.map((resident) => {
          if (resident.id !== id || resident[key].includes(item)) {
            return resident;
          }
          return { ...resident, [key]: [...resident[key], item] };
        });
        const updated = next.find((resident) => resident.id === id);
        if (updated) {
          void supabase
            .from("residents")
            .update({ [listColumn[key]]: updated[key] })
            .eq("id", id);
        }
        return { ...current, residents: next };
      });
    };

    const removeListItem = (id: string, key: ListKey, value: string) => {
      setState((current) => {
        const next = current.residents.map((resident) =>
          resident.id === id
            ? { ...resident, [key]: resident[key].filter((item) => item !== value) }
            : resident,
        );
        const updated = next.find((resident) => resident.id === id);
        if (updated) {
          void supabase
            .from("residents")
            .update({ [listColumn[key]]: updated[key] })
            .eq("id", id);
        }
        return { ...current, residents: next };
      });
    };

    const addFamilyMember = (id: string, member: FamilyMember) => {
      if (!member.name.trim()) {
        return;
      }
      setState((current) => {
        const next = current.residents.map((resident) =>
          resident.id === id
            ? { ...resident, familyMembers: [...resident.familyMembers, member] }
            : resident,
        );
        const updated = next.find((resident) => resident.id === id);
        if (updated) {
          void supabase
            .from("residents")
            .update({ family_members: updated.familyMembers })
            .eq("id", id);
        }
        return { ...current, residents: next };
      });
    };

    const removeFamilyMember = (id: string, name: string) => {
      setState((current) => {
        const next = current.residents.map((resident) =>
          resident.id === id
            ? {
                ...resident,
                familyMembers: resident.familyMembers.filter((member) => member.name !== name),
              }
            : resident,
        );
        const updated = next.find((resident) => resident.id === id);
        if (updated) {
          void supabase
            .from("residents")
            .update({ family_members: updated.familyMembers })
            .eq("id", id);
        }
        return { ...current, residents: next };
      });
    };

    const logSession = (residentId: string, experience: string) => {
      const destination = experience.trim();
      if (!destination) {
        return;
      }
      setState((current) => {
        const resident = current.residents.find((item) => item.id === residentId);
        if (!resident) {
          return current;
        }
        const sessionFacilityId = resident.facilityId || facilityId;
        const session: Session = {
          id: `s-${crypto.randomUUID()}`,
          facilityId: sessionFacilityId,
          residentId,
          residentName: resident.name,
          experience: destination,
          startsAt: new Date().toISOString(),
          status: "completed",
        };
        void supabase.from("sessions").insert({
          id: session.id,
          facility_id: sessionFacilityId,
          resident_id: residentId,
          resident_name: resident.name,
          experience: destination,
          starts_at: session.startsAt,
          status: "completed",
        });
        const pastExperiences = resident.pastExperiences.includes(destination)
          ? resident.pastExperiences
          : [...resident.pastExperiences, destination];
        void supabase
          .from("residents")
          .update({
            sessions_this_month: resident.sessionsThisMonth + 1,
            past_experiences: pastExperiences,
            engagement: "Doing well",
          })
          .eq("id", residentId);
        return {
          ...current,
          sessions: [session, ...current.sessions],
          residents: current.residents.map((item) =>
            item.id === residentId
              ? {
                  ...item,
                  sessionsThisMonth: item.sessionsThisMonth + 1,
                  pastExperiences,
                  engagement: "Doing well",
                }
              : item,
          ),
        };
      });
    };

    const addRequest = (
      residentId: string,
      experience: string,
      requestedBy: string,
      note: string,
    ) => {
      const destination = experience.trim();
      if (!destination) {
        return;
      }
      setState((current) => {
        const resident = current.residents.find((item) => item.id === residentId);
        if (!resident) {
          return current;
        }
        const request: FamilyRequest = {
          id: `f-${crypto.randomUUID()}`,
          facilityId: resident.facilityId || facilityId,
          residentId,
          residentName: resident.name,
          requestedBy: requestedBy.trim() || "Staff",
          experience: destination,
          note: note.trim(),
          received: "Just now",
        };
        const futureRequests = resident.futureRequests.includes(destination)
          ? resident.futureRequests
          : [...resident.futureRequests, destination];
        const placesTheyWantToVisit = resident.placesTheyWantToVisit.includes(destination)
          ? resident.placesTheyWantToVisit
          : [...resident.placesTheyWantToVisit, destination];
        void supabase.from("family_requests").insert({
          id: request.id,
          facility_id: resident.facilityId || facilityId,
          resident_id: residentId,
          resident_name: resident.name,
          requested_by: request.requestedBy,
          experience: destination,
          note: request.note,
          received: request.received,
        });
        void supabase
          .from("residents")
          .update({
            future_requests: futureRequests,
            places_they_want_to_visit: placesTheyWantToVisit,
          })
          .eq("id", residentId);
        return {
          ...current,
          familyRequests: [request, ...current.familyRequests],
          residents: current.residents.map((item) =>
            item.id === residentId
              ? { ...item, futureRequests, placesTheyWantToVisit }
              : item,
          ),
        };
      });
    };

    return {
      ...state,
      profile,
      residents,
      sessions,
      familyRequests,
      hydrated,
      isAdmin: state.profile?.role === "admin",
      selectFacility,
      addResident,
      updateResident,
      addListItem,
      removeListItem,
      addFamilyMember,
      removeFamilyMember,
      logSession,
      addRequest,
    };
  }, [hydrated, state]);

  return <FacilityContext.Provider value={value}>{children}</FacilityContext.Provider>;
}

export function useFacility() {
  const value = useContext(FacilityContext);
  if (!value) {
    throw new Error("useFacility must be used inside FacilityProvider");
  }
  return value;
}
