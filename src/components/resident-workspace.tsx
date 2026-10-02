"use client";

import { useState } from "react";
import { ChipList, QuickAdd, SectionLabel, fieldClass } from "@/components/quick-add";
import { AppBar } from "@/components/brand";
import { StartSessionButton } from "@/components/ui";
import {
  experiences,
  interestSuggestions,
  placeSuggestions,
  type Resident,
  type VrComfortLevel,
} from "@/data/sample";
import { formatBirthday, formatSessionWhen } from "@/lib/dates";
import { useFacility } from "@/lib/facility-store";

const tabs = [
  "Profile",
  "Interests",
  "Travel History",
  "VR Sessions",
  "Favorites",
  "Requests",
] as const;

type Tab = (typeof tabs)[number];

function comfortClass(level: VrComfortLevel) {
  if (level === "New to VR") {
    return "rounded-full bg-amber-100 px-3 py-1 text-lg font-medium text-amber-950";
  }
  if (level === "Needs short sessions") {
    return "rounded-full bg-sky-100 px-3 py-1 text-lg font-medium text-sky-950";
  }
  return "rounded-full bg-emerald-100 px-3 py-1 text-lg font-medium text-emerald-900";
}

export function ResidentWorkspace({ residentId }: { residentId: string }) {
  const {
    residents,
    sessions,
    familyRequests,
    hydrated,
    updateResident,
    addFamilyMember,
    removeFamilyMember,
    logSession,
    addRequest,
  } = useFacility();
  const [tab, setTab] = useState<Tab>("Profile");
  const [familyName, setFamilyName] = useState("");
  const [familyRelation, setFamilyRelation] = useState("");
  const [sessionPlace, setSessionPlace] = useState("");
  const [requestPlace, setRequestPlace] = useState("");
  const [requestFrom, setRequestFrom] = useState("");

  const resident = residents.find((item) => item.id === residentId);

  if (!resident && !hydrated) {
    return <p className="px-4 py-16 text-xl text-stone-700">Opening resident…</p>;
  }

  if (!resident) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="text-3xl font-semibold">Resident not found</h1>
        <a href="/" className="mt-6 inline-block text-lg text-navy underline">
          Back to dashboard
        </a>
      </div>
    );
  }

  const residentSessions = sessions.filter((session) => session.residentId === resident.id);
  const residentRequests = familyRequests.filter((request) => request.residentId === resident.id);
  const destinations = experiences.map((item) => item.name);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-8">
      <AppBar backHref="/" />

      <header className="mt-4 mb-5">
        <p className="text-lg text-stone-600">{resident.room}</p>
        <h1 className="text-4xl font-semibold tracking-tight text-stone-900">{resident.name}</h1>
        <p className="mt-2">
          <span className={comfortClass(resident.vrComfortLevel)}>
            VR comfort: {resident.vrComfortLevel}
          </span>
        </p>
      </header>

      <div className="mb-6">
        <StartSessionButton residentId={resident.id} />
      </div>

      <div className="mb-6 flex flex-wrap gap-2" role="tablist" aria-label="Resident sections">
        {tabs.map((item) => (
          <button
            key={item}
            type="button"
            role="tab"
            aria-selected={tab === item}
            onClick={() => setTab(item)}
            className={
              tab === item
                ? "min-h-14 rounded-xl bg-navy px-5 text-xl font-semibold text-white"
                : "min-h-14 rounded-xl border border-stone-300 bg-white px-5 text-xl text-stone-800"
            }
          >
            {item}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-stone-300 bg-white p-6">
        {tab === "Profile" ? (
          <ProfileTab
            resident={resident}
            familyName={familyName}
            familyRelation={familyRelation}
            setFamilyName={setFamilyName}
            setFamilyRelation={setFamilyRelation}
            onSave={(patch) => updateResident(resident.id, patch)}
            onAddFamily={() => {
              addFamilyMember(resident.id, {
                name: familyName,
                relation: familyRelation || "Family",
                note: "",
              });
              setFamilyName("");
              setFamilyRelation("");
            }}
            onRemoveFamily={(name) => removeFamilyMember(resident.id, name)}
          />
        ) : null}

        {tab === "Interests" ? (
          <div className="space-y-8">
            <div>
              <SectionLabel>Interests</SectionLabel>
              <QuickAdd
                residentId={resident.id}
                listKey="interests"
                placeholder="Type an interest"
                suggestions={interestSuggestions}
              />
              <div className="mt-3">
                <ChipList residentId={resident.id} listKey="interests" items={resident.interests} />
              </div>
            </div>
            <div>
              <SectionLabel>Favorite sports teams</SectionLabel>
              <QuickAdd
                residentId={resident.id}
                listKey="favoriteSportsTeams"
                placeholder="Type a team"
              />
              <div className="mt-3">
                <ChipList
                  residentId={resident.id}
                  listKey="favoriteSportsTeams"
                  items={resident.favoriteSportsTeams}
                />
              </div>
            </div>
          </div>
        ) : null}

        {tab === "Travel History" ? (
          <div className="space-y-8">
            <div>
              <SectionLabel>Places lived</SectionLabel>
              <QuickAdd
                residentId={resident.id}
                listKey="placesLived"
                placeholder="City or town"
                suggestions={placeSuggestions}
              />
              <div className="mt-3">
                <ChipList residentId={resident.id} listKey="placesLived" items={resident.placesLived} />
              </div>
            </div>
            <div>
              <SectionLabel>Places visited</SectionLabel>
              <QuickAdd
                residentId={resident.id}
                listKey="placesVisited"
                placeholder="A place they have been"
                suggestions={placeSuggestions}
              />
              <div className="mt-3">
                <ChipList
                  residentId={resident.id}
                  listKey="placesVisited"
                  items={resident.placesVisited}
                />
              </div>
            </div>
            <div>
              <SectionLabel>Favorite vacation</SectionLabel>
              <input
                defaultValue={resident.favoriteVacation}
                placeholder="One sentence is enough"
                className={`${fieldClass} mt-3`}
                onBlur={(event) =>
                  updateResident(resident.id, { favoriteVacation: event.target.value })
                }
              />
            </div>
          </div>
        ) : null}

        {tab === "VR Sessions" ? (
          <div className="space-y-6">
            <SectionLabel>Log a trip they just took</SectionLabel>
            <form
              className="flex flex-col gap-3 sm:flex-row"
              onSubmit={(event) => {
                event.preventDefault();
                logSession(resident.id, sessionPlace);
                setSessionPlace("");
              }}
            >
              <input
                value={sessionPlace}
                onChange={(event) => setSessionPlace(event.target.value)}
                placeholder="Where did they go?"
                className={fieldClass}
              />
              <button
                type="submit"
                className="min-h-14 rounded-xl bg-navy px-5 text-xl font-semibold text-white"
              >
                Log trip
              </button>
            </form>
            <div className="flex flex-wrap gap-2">
              {destinations.map((place) => (
                <button
                  key={place}
                  type="button"
                  onClick={() => logSession(resident.id, place)}
                  className="rounded-full border border-stone-300 bg-stone-50 px-4 py-2 text-lg"
                >
                  {place}
                </button>
              ))}
            </div>
            <div>
              <SectionLabel>Session history</SectionLabel>
              {residentSessions.length === 0 ? (
                <p className="mt-3 text-lg text-stone-500">No VR sessions yet.</p>
              ) : (
                <ul className="mt-3 divide-y divide-stone-200">
                  {residentSessions.map((session) => (
                    <li key={session.id} className="py-3">
                      <p className="text-xl font-medium">{session.experience}</p>
                      <p className="text-lg text-stone-600">
                        {formatSessionWhen(session.startsAt)}
                        {session.status === "completed" ? " — Done" : ""}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ) : null}

        {tab === "Favorites" ? (
          <div className="space-y-8">
            <div>
              <SectionLabel>Favorite places</SectionLabel>
              <QuickAdd
                residentId={resident.id}
                listKey="favoritePlaces"
                placeholder="A favorite place"
                suggestions={placeSuggestions}
              />
              <div className="mt-3">
                <ChipList
                  residentId={resident.id}
                  listKey="favoritePlaces"
                  items={resident.favoritePlaces}
                />
              </div>
            </div>
            <div>
              <SectionLabel>Favorite VR experiences</SectionLabel>
              <QuickAdd
                residentId={resident.id}
                listKey="favoriteExperiences"
                placeholder="A Wander destination they loved"
                suggestions={destinations}
              />
              <div className="mt-3">
                <ChipList
                  residentId={resident.id}
                  listKey="favoriteExperiences"
                  items={resident.favoriteExperiences}
                />
              </div>
            </div>
          </div>
        ) : null}

        {tab === "Requests" ? (
          <div className="space-y-8">
            <div>
              <SectionLabel>Places they want to visit</SectionLabel>
              <QuickAdd
                residentId={resident.id}
                listKey="placesTheyWantToVisit"
                placeholder="A place they asked for"
                suggestions={placeSuggestions}
              />
              <div className="mt-3">
                <ChipList
                  residentId={resident.id}
                  listKey="placesTheyWantToVisit"
                  items={resident.placesTheyWantToVisit}
                />
              </div>
            </div>
            <div>
              <SectionLabel>Add a family or staff request</SectionLabel>
              <form
                className="mt-3 space-y-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  addRequest(resident.id, requestPlace, requestFrom, "");
                  setRequestPlace("");
                  setRequestFrom("");
                }}
              >
                <input
                  value={requestPlace}
                  onChange={(event) => setRequestPlace(event.target.value)}
                  placeholder="Destination"
                  className={fieldClass}
                />
                <input
                  value={requestFrom}
                  onChange={(event) => setRequestFrom(event.target.value)}
                  placeholder="Who asked? (optional)"
                  className={fieldClass}
                />
                <button
                  type="submit"
                  className="min-h-14 w-full rounded-xl bg-navy px-5 text-xl font-semibold text-white"
                >
                  Save request
                </button>
              </form>
            </div>
            <div>
              <SectionLabel>Open requests</SectionLabel>
              {residentRequests.length === 0 ? (
                <p className="mt-3 text-lg text-stone-500">No family requests yet.</p>
              ) : (
                <ul className="mt-3 divide-y divide-stone-200">
                  {residentRequests.map((request) => (
                    <li key={request.id} className="py-3">
                      <p className="text-xl font-medium">{request.experience}</p>
                      <p className="text-lg text-stone-600">
                        {request.requestedBy}
                        {request.note ? `. ${request.note}` : ""}
                      </p>
                      <p className="text-lg text-stone-500">Received {request.received}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function ProfileTab({
  resident,
  familyName,
  familyRelation,
  setFamilyName,
  setFamilyRelation,
  onSave,
  onAddFamily,
  onRemoveFamily,
}: {
  resident: Resident;
  familyName: string;
  familyRelation: string;
  setFamilyName: (value: string) => void;
  setFamilyRelation: (value: string) => void;
  onSave: (patch: Partial<Resident>) => void;
  onAddFamily: () => void;
  onRemoveFamily: (name: string) => void;
}) {
  return (
    <div className="space-y-5">
      <label className="block">
        <span className="text-lg font-medium">Resident name</span>
        <input
          defaultValue={resident.name}
          className={`${fieldClass} mt-1`}
          onBlur={(event) => onSave({ name: event.target.value })}
        />
      </label>
      <label className="block">
        <span className="text-lg font-medium">Room</span>
        <input
          defaultValue={resident.room}
          className={`${fieldClass} mt-1`}
          onBlur={(event) => onSave({ room: event.target.value })}
        />
      </label>
      <label className="block">
        <span className="text-lg font-medium">Birthday</span>
        <input
          type="date"
          defaultValue={resident.birthday}
          className={`${fieldClass} mt-1`}
          onBlur={(event) => onSave({ birthday: event.target.value })}
        />
        <p className="mt-1 text-lg text-stone-500">{formatBirthday(resident.birthday)}</p>
      </label>
      <label className="block">
        <span className="text-lg font-medium">Hometown</span>
        <input
          defaultValue={resident.hometown}
          className={`${fieldClass} mt-1`}
          onBlur={(event) => onSave({ hometown: event.target.value })}
        />
      </label>
      <label className="block">
        <span className="text-lg font-medium">College</span>
        <input
          defaultValue={resident.college}
          className={`${fieldClass} mt-1`}
          onBlur={(event) => onSave({ college: event.target.value })}
        />
      </label>
      <label className="block">
        <span className="text-lg font-medium">Military service</span>
        <input
          defaultValue={resident.militaryService}
          className={`${fieldClass} mt-1`}
          onBlur={(event) => onSave({ militaryService: event.target.value })}
        />
      </label>
      <label className="block">
        <span className="text-lg font-medium">Mobility notes</span>
        <textarea
          defaultValue={resident.mobilityNotes}
          rows={3}
          className={`${fieldClass} mt-1 py-3`}
          onBlur={(event) => onSave({ mobilityNotes: event.target.value })}
        />
      </label>
      <fieldset>
        <legend className="text-lg font-medium">VR comfort level</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-3">
          {(["New to VR", "Needs short sessions", "Comfortable"] as VrComfortLevel[]).map(
            (level) => (
              <button
                key={level}
                type="button"
                onClick={() => onSave({ vrComfortLevel: level })}
                className={
                  resident.vrComfortLevel === level
                    ? "min-h-14 rounded-xl bg-navy px-3 text-lg font-semibold text-white"
                    : "min-h-14 rounded-xl border border-stone-300 bg-white px-3 text-lg"
                }
              >
                {level}
              </button>
            ),
          )}
        </div>
      </fieldset>
      <div>
        <SectionLabel>Family members</SectionLabel>
        <form
          className="mt-3 grid gap-2 sm:grid-cols-[1fr_1fr_auto]"
          onSubmit={(event) => {
            event.preventDefault();
            onAddFamily();
          }}
        >
          <input
            value={familyName}
            onChange={(event) => setFamilyName(event.target.value)}
            placeholder="Name"
            className={fieldClass}
          />
          <input
            value={familyRelation}
            onChange={(event) => setFamilyRelation(event.target.value)}
            placeholder="Son, daughter, spouse…"
            className={fieldClass}
          />
          <button
            type="submit"
            className="min-h-14 rounded-xl bg-navy px-5 text-xl font-semibold text-white"
          >
            Add
          </button>
        </form>
        <ul className="mt-4 divide-y divide-stone-200">
          {resident.familyMembers.map((member) => (
            <li key={member.name} className="flex items-center justify-between gap-3 py-3">
              <div>
                <p className="text-xl font-medium">
                  {member.name} ({member.relation})
                </p>
                {member.note ? <p className="text-lg text-stone-600">{member.note}</p> : null}
              </div>
              <button
                type="button"
                onClick={() => onRemoveFamily(member.name)}
                className="text-lg text-stone-500 underline"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
