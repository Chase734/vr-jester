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

const STORAGE_KEY = "vr-jester-facility-v1";

export type ListKey =
  | "placesLived"
  | "placesVisited"
  | "placesTheyWantToVisit"
  | "favoriteSportsTeams"
  | "interests"
  | "favoriteExperiences"
  | "pastExperiences"
  | "futureRequests"
  | "favoritePlaces";

type FacilityState = {
  residents: Resident[];
  sessions: Session[];
  familyRequests: FamilyRequest[];
};

type FacilityContextValue = FacilityState & {
  hydrated: boolean;
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

const seed: FacilityState = {
  residents: seedResidents,
  sessions: seedSessions,
  familyRequests: seedRequests,
};

function normalizeResident(resident: Resident): Resident {
  return {
    ...resident,
    placesLived: resident.placesLived ?? [],
    placesVisited: resident.placesVisited ?? [],
    placesTheyWantToVisit: resident.placesTheyWantToVisit ?? [],
    favoriteSportsTeams: resident.favoriteSportsTeams ?? [],
    favoritePlaces: resident.favoritePlaces ?? [],
    interests: resident.interests ?? [],
    familyMembers: resident.familyMembers ?? [],
    favoriteExperiences: resident.favoriteExperiences ?? [],
    pastExperiences: resident.pastExperiences ?? [],
    futureRequests: resident.futureRequests ?? [],
  };
}

function loadState(): FacilityState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return seed;
    }
    const parsed = JSON.parse(raw) as FacilityState;
    if (!parsed.residents?.length) {
      return seed;
    }
    return {
      residents: parsed.residents.map(normalizeResident),
      sessions: parsed.sessions ?? seedSessions,
      familyRequests: parsed.familyRequests ?? seedRequests,
    };
  } catch {
    return seed;
  }
}

export function FacilityProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<FacilityState>(seed);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(loadState());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [hydrated, state]);

  const value = useMemo<FacilityContextValue>(() => {
    const addResident = (name: string, room: string) => {
      const resident = createBlankResident(name, room);
      setState((current) => ({
        ...current,
        residents: [resident, ...current.residents],
      }));
      return resident;
    };

    const updateResident = (id: string, patch: Partial<Resident>) => {
      setState((current) => ({
        ...current,
        residents: current.residents.map((resident) =>
          resident.id === id ? { ...resident, ...patch } : resident,
        ),
      }));
    };

    const addListItem = (id: string, key: ListKey, value: string) => {
      const item = value.trim();
      if (!item) {
        return;
      }
      setState((current) => ({
        ...current,
        residents: current.residents.map((resident) => {
          if (resident.id !== id) {
            return resident;
          }
          const list = resident[key];
          if (list.includes(item)) {
            return resident;
          }
          return { ...resident, [key]: [...list, item] };
        }),
      }));
    };

    const removeListItem = (id: string, key: ListKey, value: string) => {
      setState((current) => ({
        ...current,
        residents: current.residents.map((resident) =>
          resident.id === id
            ? { ...resident, [key]: resident[key].filter((item) => item !== value) }
            : resident,
        ),
      }));
    };

    const addFamilyMember = (id: string, member: FamilyMember) => {
      if (!member.name.trim()) {
        return;
      }
      setState((current) => ({
        ...current,
        residents: current.residents.map((resident) =>
          resident.id === id
            ? { ...resident, familyMembers: [...resident.familyMembers, member] }
            : resident,
        ),
      }));
    };

    const removeFamilyMember = (id: string, name: string) => {
      setState((current) => ({
        ...current,
        residents: current.residents.map((resident) =>
          resident.id === id
            ? {
                ...resident,
                familyMembers: resident.familyMembers.filter((member) => member.name !== name),
              }
            : resident,
        ),
      }));
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
        const session: Session = {
          id: `s-${Date.now()}`,
          residentId,
          residentName: resident.name,
          experience: destination,
          startsAt: new Date().toISOString(),
          status: "completed",
        };
        return {
          ...current,
          sessions: [session, ...current.sessions],
          residents: current.residents.map((item) =>
            item.id === residentId
              ? {
                  ...item,
                  sessionsThisMonth: item.sessionsThisMonth + 1,
                  pastExperiences: item.pastExperiences.includes(destination)
                    ? item.pastExperiences
                    : [...item.pastExperiences, destination],
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
          id: `f-${Date.now()}`,
          residentId,
          residentName: resident.name,
          requestedBy: requestedBy.trim() || "Staff",
          experience: destination,
          note: note.trim(),
          received: "Just now",
        };
        return {
          familyRequests: [request, ...current.familyRequests],
          sessions: current.sessions,
          residents: current.residents.map((item) =>
            item.id === residentId
              ? {
                  ...item,
                  futureRequests: item.futureRequests.includes(destination)
                    ? item.futureRequests
                    : [...item.futureRequests, destination],
                  placesTheyWantToVisit: item.placesTheyWantToVisit.includes(destination)
                    ? item.placesTheyWantToVisit
                    : [...item.placesTheyWantToVisit, destination],
                }
              : item,
          ),
        };
      });
    };

    return {
      ...state,
      hydrated,
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
