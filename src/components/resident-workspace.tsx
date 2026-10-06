"use client";

import { useState } from "react";
import { ChipList, QuickAdd, SectionLabel, fieldClass } from "@/components/quick-add";
import { AppBar } from "@/components/brand";
import { emptySessionLog, SessionLogFields } from "@/components/session-log-form";
import { StartSessionButton } from "@/components/ui";
import {
  experiences,
  interestSuggestions,
  placeSuggestions,
  type Resident,
  type VrComfortLevel,
} from "@/data/sample";
import { formatBirthday, formatSessionWhen, formatSubmittedAt } from "@/lib/dates";
import { useFacility, type ListKey } from "@/lib/facility-store";
import { buildResidentInsights, waitingFamilyRequests } from "@/lib/insights";
import { firstName } from "@/lib/names";
import { recommendExperiences, surprisePick, matchFamilyRequest } from "@/lib/recommendations";
import { jesterEngagementScore, passportFor } from "@/lib/engagement";
import { storyChips } from "@/lib/story-chips";

const tabs = [
  "My Story",
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
    updateRequest,
    ensureFamilyLink,
  } = useFacility();
  const [tab, setTab] = useState<Tab>("My Story");
  const [familyName, setFamilyName] = useState("");
  const [familyRelation, setFamilyRelation] = useState("");
  const [sessionLog, setSessionLog] = useState(emptySessionLog());
  const [requestPlace, setRequestPlace] = useState("");
  const [requestFrom, setRequestFrom] = useState("");
  const [linkMessage, setLinkMessage] = useState("");

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

  const residentSessions = sessions
    .filter((session) => session.residentId === resident.id)
    .sort((left, right) => new Date(right.startsAt).getTime() - new Date(left.startsAt).getTime());
  const residentRequests = familyRequests.filter((request) => request.residentId === resident.id);
  const waitingRequests = waitingFamilyRequests(residentRequests);
  const insights = buildResidentInsights(resident, residentSessions, residentRequests);
  const recommendations = recommendExperiences(resident, residentSessions, residentRequests, {
    limit: 5,
    peers: residents,
    allSessions: sessions,
  });
  const surprise = surprisePick(resident, residentSessions, residentRequests, residents, sessions);
  const passport = passportFor(resident, residentSessions);
  const chips = storyChips(resident);
  const engagementScore = jesterEngagementScore(resident, residentSessions, residentRequests);
  const destinations = experiences.map((item) => item.name);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-8">
      <AppBar backHref="/" />

      <header className="mt-4 mb-5">
        <p className="text-lg text-stone-600">{resident.room}</p>
        <h1 className="font-display text-4xl font-semibold tracking-tight text-navy">{resident.name}</h1>
        <p className="mt-3 text-lg font-semibold text-navy">Jester Engagement {engagementScore}</p>
        <p className="mt-2">
          <span className={comfortClass(resident.vrComfortLevel)}>
            VR comfort: {resident.vrComfortLevel}
          </span>
        </p>
        {chips.length ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {chips.map((chip) => (
              <span
                key={chip.label}
                className="rounded-full bg-white px-4 py-2 text-lg shadow"
              >
                {chip.emoji} {chip.label}
              </span>
            ))}
          </div>
        ) : null}
      </header>

      <div className="mb-4">
        <StartSessionButton residentId={resident.id} />
      </div>
      <button
        type="button"
        className="mb-6 inline-flex min-h-16 w-full items-center justify-center rounded-2xl border-2 border-navy bg-white px-8 text-2xl font-semibold text-navy"
        onClick={async () => {
          try {
            const token = await ensureFamilyLink(resident.id);
            const url = `${window.location.origin}/family/${token}`;
            await navigator.clipboard.writeText(url);
            setLinkMessage("Family link copied. Send it by text or email.");
          } catch {
            setLinkMessage("Could not copy the family link. Try again.");
          }
        }}
      >
        Copy Family Link
      </button>
      {linkMessage ? <p className="mb-6 text-lg text-navy">{linkMessage}</p> : null}

      <section className="mb-6 overflow-hidden rounded-[2rem] bg-gradient-to-br from-navy to-navy-dark p-6 text-white shadow-xl">
        <p className="text-lg font-semibold tracking-[0.18em] text-gold uppercase">
          ✨ AI picks for {firstName(resident.name)}
        </p>
        <p className="mt-2 text-lg text-white/80">
          For engagement and entertainment only. The more sessions you save, the smarter these get.
        </p>
        {recommendations.length === 0 ? (
          <p className="mt-4 text-lg">
            Add hometown, places, family requests, or a few trips, and recommendations will appear
            here.
          </p>
        ) : (
          <ol className="mt-5 space-y-4">
            {recommendations.map((item, index) => (
              <li key={item.experienceId} className="rounded-2xl bg-white/10 p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-xl font-semibold">
                    {index + 1}. {item.destination}
                  </p>
                  <p className="font-semibold text-gold">{item.score}% Match</p>
                </div>
                <p className="mt-1 text-sm uppercase tracking-wide text-white/70">
                  {item.source === "youtube_360" ? "YouTube 360" : "VR Jester Experience"}
                </p>
                <p className="mt-2 text-lg text-white/90">{item.explanation}</p>
                <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                  <a
                    href={
                      item.source === "youtube_360"
                        ? `/watch?resident=${resident.id}&q=${encodeURIComponent(item.youtubeQuery || item.destination)}`
                        : `/start-session?resident=${resident.id}&destination=${encodeURIComponent(item.destination)}`
                    }
                    className="inline-flex min-h-14 flex-1 items-center justify-center rounded-xl bg-gold px-4 text-xl font-semibold text-navy"
                  >
                    {item.source === "youtube_360" ? "Watch" : "Start Experience"}
                  </a>
                  <a
                    href={`/residents/${resident.id}/guide?place=${encodeURIComponent(item.destination)}`}
                    className="inline-flex min-h-14 flex-1 items-center justify-center rounded-xl border-2 border-white/40 px-4 text-xl font-semibold text-white"
                  >
                    View Guide
                  </a>
                </div>
              </li>
            ))}
          </ol>
        )}
        {surprise ? (
          <a
            href={
              surprise.source === "youtube_360"
                ? `/watch?resident=${resident.id}&q=${encodeURIComponent(surprise.youtubeQuery || surprise.destination)}`
                : `/start-session?resident=${resident.id}&destination=${encodeURIComponent(surprise.destination)}`
            }
            className="mt-5 inline-flex min-h-16 w-full items-center justify-center rounded-2xl bg-white text-xl font-semibold text-navy"
          >
            Surprise me · {surprise.destination}
          </a>
        ) : null}
      </section>

      <section className="mb-6 rounded-[2rem] bg-white p-6 shadow-xl">
        <h2 className="font-display text-3xl font-semibold text-navy">
          {firstName(resident.name)}&apos;s Adventures
        </h2>
        <p className="mt-2 text-lg text-stone-700">
          {passport.experiences} Experiences · {passport.destinations} Destinations · {passport.categories}{" "}
          Categories
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {passport.stamps.length ? (
            passport.stamps.map((stamp) => (
              <span key={stamp} className="rounded-2xl bg-navy px-4 py-2 text-lg text-white">
                {stamp} ✓
              </span>
            ))
          ) : (
            <p className="text-lg text-stone-600">Stamps appear after the first saved session.</p>
          )}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {passport.badges.map((badge) => (
            <span
              key={badge.id}
              className={
                badge.earned
                  ? "rounded-full bg-gold px-4 py-2 text-lg font-semibold text-navy"
                  : "rounded-full bg-stone-100 px-4 py-2 text-lg text-stone-500"
              }
            >
              {badge.label}
            </span>
          ))}
        </div>
      </section>

      <section className="mb-6 rounded-2xl border-2 border-gold bg-white p-5">
        <h2 className="text-2xl font-semibold text-navy">Resident Insights</h2>
        <p className="mt-1 text-lg text-stone-600">From what staff and family have already recorded.</p>
        <div className="mt-4 space-y-3 text-lg">
          <p>
            <span className="font-medium">Favorite experiences: </span>
            {insights.favorites.length ? insights.favorites.join(", ") : "None marked yet."}
          </p>
          <p>
            <span className="font-medium">Interests: </span>
            {insights.interests.length ? insights.interests.join(", ") : "None recorded yet."}
          </p>
          <p>
            <span className="font-medium">Most visited destinations: </span>
            {insights.mostVisited.length ? insights.mostVisited.join(", ") : "No trips yet."}
          </p>
          <p>
            <span className="font-medium">Recent experiences: </span>
            {insights.recent.length ? insights.recent.join(", ") : "No trips yet."}
          </p>
          <p>
            <span className="font-medium">Family requests waiting: </span>
            {insights.waiting.length
              ? insights.waiting.map((request) => request.experience).join(", ")
              : "None waiting."}
          </p>
        </div>
      </section>

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
        {tab === "My Story" ? (
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
            <input
              value={sessionLog.experience}
              onChange={(event) =>
                setSessionLog((current) => ({ ...current, experience: event.target.value }))
              }
              placeholder="Where did they go?"
              className={fieldClass}
            />
            <div className="flex flex-wrap gap-2">
              {destinations.map((place) => (
                <button
                  key={place}
                  type="button"
                  onClick={() => setSessionLog((current) => ({ ...current, experience: place }))}
                  className="rounded-full border border-stone-300 bg-stone-50 px-4 py-2 text-lg"
                >
                  {place}
                </button>
              ))}
            </div>
            <SessionLogFields
              values={sessionLog}
              residentName={firstName(resident.name)}
              waitingRequests={waitingRequests}
              onChange={(patch) => setSessionLog((current) => ({ ...current, ...patch }))}
            />
            <button
              type="button"
              disabled={!sessionLog.experience.trim() || !sessionLog.reaction}
              className="inline-flex min-h-14 w-full items-center justify-center rounded-xl bg-navy px-5 text-xl font-semibold text-white disabled:opacity-60"
              onClick={() => {
                logSession(resident.id, {
                  ...sessionLog,
                  requestId: sessionLog.requestId || null,
                });
                setSessionLog(emptySessionLog());
              }}
            >
              Save session
            </button>
            <div>
              <SectionLabel>Session history</SectionLabel>
              {residentSessions.length === 0 ? (
                <p className="mt-3 text-lg text-stone-500">No VR sessions yet.</p>
              ) : (
                <ul className="mt-3 divide-y divide-stone-200">
                  {residentSessions.map((session) => (
                    <li key={session.id} className="py-4">
                      <p className="text-xl font-medium">{session.experience}</p>
                      <p className="text-lg text-stone-600">
                        {formatSessionWhen(session.startsAt)}
                        {session.durationMinutes ? ` · ${session.durationMinutes} min` : ""}
                      </p>
                      <p className="text-lg text-stone-700">
                        {session.reaction || "Reaction not recorded"}
                        {session.sessionEngagement ? ` · ${session.sessionEngagement}` : ""}
                      </p>
                      {session.sessionNotes ? (
                        <p className="mt-1 text-lg text-stone-700">{session.sessionNotes}</p>
                      ) : null}
                      {session.memoryDiscovered ? (
                        <p className="text-lg text-stone-700">Memory: {session.memoryDiscovered}</p>
                      ) : null}
                      {session.followUpDestination ? (
                        <p className="text-lg text-stone-700">
                          Next idea: {session.followUpDestination}
                        </p>
                      ) : null}
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
              <p className="mt-1 text-lg text-stone-600">
                Destinations marked Loved It are added here automatically.
              </p>
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
              <SectionLabel>Family requests</SectionLabel>
              {residentRequests.length === 0 ? (
                <p className="mt-3 text-lg text-stone-500">No family requests yet.</p>
              ) : (
                <ul className="mt-3 divide-y divide-stone-200">
                  {residentRequests.map((request) => (
                    <li key={request.id} className="py-5 first:pt-0">
                      <p className="text-xl font-medium">{request.experience}</p>
                      <p className="text-lg text-stone-700">
                        {request.requestedBy}
                        {request.relationship ? ` · ${request.relationship}` : ""}
                      </p>
                      {request.approximateYear ? (
                        <p className="text-lg text-stone-600">Around {request.approximateYear}</p>
                      ) : null}
                      {request.whyItMatters ? (
                        <p className="mt-2 text-lg text-stone-700">{request.whyItMatters}</p>
                      ) : null}
                      {request.note ? (
                        <p className="mt-1 text-lg text-stone-700">{request.note}</p>
                      ) : null}
                      {request.staffShouldKnow ? (
                        <p className="mt-1 text-lg text-stone-600">
                          Staff should know: {request.staffShouldKnow}
                        </p>
                      ) : null}
                      {matchFamilyRequest(request, resident).length ? (
                        <div className="mt-3 rounded-2xl bg-stone-50 p-4">
                          <p className="font-semibold text-navy">
                            AI found {matchFamilyRequest(request, resident).length} matching experiences
                          </p>
                          <ul className="mt-2 space-y-1 text-lg">
                            {matchFamilyRequest(request, resident).map(({ item }) => (
                              <li key={item.id}>
                                {item.title} · {item.source === "youtube_360" ? "YouTube 360" : "VR Jester"}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                      <p className="mt-2 text-lg text-stone-500">
                        {formatSubmittedAt(request.submittedAt, request.received)} · {request.status}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {request.status === "New" ? (
                          <button
                            type="button"
                            className="min-h-12 rounded-xl bg-navy px-4 text-lg font-semibold text-white"
                            onClick={() => updateRequest(request.id, { status: "Approved" })}
                          >
                            Approve
                          </button>
                        ) : null}
                        {request.status === "Approved" ? (
                          <button
                            type="button"
                            className="min-h-12 rounded-xl bg-navy px-4 text-lg font-semibold text-white"
                            onClick={() => updateRequest(request.id, { status: "Completed" })}
                          >
                            Mark completed
                          </button>
                        ) : null}
                        {request.status === "New" || request.status === "Approved" ? (
                          <button
                            type="button"
                            className="min-h-12 rounded-xl border border-stone-300 bg-white px-4 text-lg"
                            onClick={() => updateRequest(request.id, { status: "Declined" })}
                          >
                            Decline
                          </button>
                        ) : null}
                      </div>
                      {request.status === "Completed" ? (
                        <label className="mt-3 block">
                          <span className="text-lg font-medium">Connected VR session</span>
                          <select
                            className={`${fieldClass} mt-1`}
                            value={request.sessionId ?? ""}
                            onChange={(event) =>
                              updateRequest(request.id, {
                                sessionId: event.target.value || null,
                              })
                            }
                          >
                            <option value="">Not connected yet</option>
                            {residentSessions.map((session) => (
                              <option key={session.id} value={session.id}>
                                {session.experience} — {formatSessionWhen(session.startsAt)}
                              </option>
                            ))}
                          </select>
                        </label>
                      ) : null}
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

function StorySection({
  title,
  children,
  open = false,
}: {
  title: string;
  children: React.ReactNode;
  open?: boolean;
}) {
  return (
    <details
      open={open}
      className="rounded-2xl border-2 border-navy/20 bg-stone-50 p-4"
    >
      <summary className="cursor-pointer text-2xl font-semibold text-navy">
        {title}
      </summary>
      <div className="mt-4 space-y-5">{children}</div>
    </details>
  );
}

function StoryList({
  residentId,
  listKey,
  label,
  placeholder,
  items,
  suggestions,
}: {
  residentId: string;
  listKey: ListKey;
  label: string;
  placeholder: string;
  items: string[];
  suggestions?: string[];
}) {
  return (
    <div>
      <SectionLabel>{label}</SectionLabel>
      <QuickAdd
        residentId={residentId}
        listKey={listKey}
        placeholder={placeholder}
        suggestions={suggestions}
      />
      <div className="mt-3">
        <ChipList residentId={residentId} listKey={listKey} items={items} />
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
    <div className="space-y-4">
      <p className="text-2xl font-semibold text-navy">My Story</p>
      <p className="text-lg text-stone-600">
        Capture a little at a time. Jester uses this to suggest the next adventure. Everything is optional.
      </p>

      <StorySection title="Basics" open>
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
          <span className="text-lg font-medium">Birthplace / hometown</span>
          <input
            defaultValue={resident.hometown}
            className={`${fieldClass} mt-1`}
            onBlur={(event) => onSave({ hometown: event.target.value })}
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
      </StorySection>

      <StorySection title="Places that matter" open>
        <StoryList
          residentId={resident.id}
          listKey="placesLived"
          label="Places lived / former homes"
          placeholder="City or town"
          items={resident.placesLived}
          suggestions={placeSuggestions}
        />
        <StoryList
          residentId={resident.id}
          listKey="meaningfulPlaces"
          label="Places with emotional significance"
          placeholder="A place that still means a lot"
          items={resident.meaningfulPlaces}
          suggestions={placeSuggestions}
        />
        <StoryList
          residentId={resident.id}
          listKey="restaurantsLandmarks"
          label="Favorite restaurants / landmarks"
          placeholder="A restaurant, park, or landmark"
          items={resident.restaurantsLandmarks}
        />
      </StorySection>

      <StorySection title="School and work">
        <label className="block">
          <span className="text-lg font-medium">High school</span>
          <input
            defaultValue={resident.highSchool}
            className={`${fieldClass} mt-1`}
            onBlur={(event) => onSave({ highSchool: event.target.value })}
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
          <span className="text-lg font-medium">Career / occupation</span>
          <input
            defaultValue={resident.career}
            className={`${fieldClass} mt-1`}
            onBlur={(event) => onSave({ career: event.target.value })}
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
      </StorySection>

      <StorySection title="Family">
        <label className="block">
          <span className="text-lg font-medium">Spouse / partner</span>
          <input
            defaultValue={resident.spousePartner}
            className={`${fieldClass} mt-1`}
            onBlur={(event) => onSave({ spousePartner: event.target.value })}
          />
        </label>
        <StoryList
          residentId={resident.id}
          listKey="childrenGrandchildren"
          label="Children / grandchildren"
          placeholder="Name or a short note"
          items={resident.childrenGrandchildren}
        />
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
      </StorySection>

      <StorySection title="Memories">
        <label className="block">
          <span className="text-lg font-medium">Childhood memories</span>
          <textarea
            defaultValue={resident.childhoodMemories}
            rows={3}
            className={`${fieldClass} mt-1 py-3`}
            onBlur={(event) => onSave({ childhoodMemories: event.target.value })}
          />
        </label>
        <label className="block">
          <span className="text-lg font-medium">Wedding / honeymoon location</span>
          <input
            defaultValue={resident.weddingHoneymoon}
            className={`${fieldClass} mt-1`}
            onBlur={(event) => onSave({ weddingHoneymoon: event.target.value })}
          />
        </label>
        <label className="block">
          <span className="text-lg font-medium">Favorite decade</span>
          <input
            defaultValue={resident.favoriteDecade}
            placeholder="The 1950s, the 60s…"
            className={`${fieldClass} mt-1`}
            onBlur={(event) => onSave({ favoriteDecade: event.target.value })}
          />
        </label>
        <label className="block">
          <span className="text-lg font-medium">Family traditions</span>
          <textarea
            defaultValue={resident.familyTraditions}
            rows={2}
            className={`${fieldClass} mt-1 py-3`}
            onBlur={(event) => onSave({ familyTraditions: event.target.value })}
          />
        </label>
        <label className="block">
          <span className="text-lg font-medium">Favorite vacations</span>
          <textarea
            defaultValue={resident.favoriteVacation}
            rows={3}
            className={`${fieldClass} mt-1 py-3`}
            onBlur={(event) => onSave({ favoriteVacation: event.target.value })}
          />
        </label>
        <StoryList
          residentId={resident.id}
          listKey="majorLifeEvents"
          label="Major life events"
          placeholder="A wedding, a move, a job, a trip"
          items={resident.majorLifeEvents}
        />
      </StorySection>

      <StorySection title="Likes">
        <StoryList
          residentId={resident.id}
          listKey="interests"
          label="Hobbies / interests"
          placeholder="Type a hobby or interest"
          items={resident.interests}
          suggestions={interestSuggestions}
        />
        <StoryList
          residentId={resident.id}
          listKey="favoriteSportsTeams"
          label="Favorite sports and teams"
          placeholder="A sport or team"
          items={resident.favoriteSportsTeams}
        />
        <StoryList
          residentId={resident.id}
          listKey="music"
          label="Music"
          placeholder="A singer, song, or kind of music"
          items={resident.music}
        />
        <StoryList
          residentId={resident.id}
          listKey="moviesTv"
          label="Movies / TV"
          placeholder="A movie, show, or actor"
          items={resident.moviesTv}
        />
        <StoryList
          residentId={resident.id}
          listKey="food"
          label="Food"
          placeholder="A favorite meal or restaurant food"
          items={resident.food}
        />
        <StoryList
          residentId={resident.id}
          listKey="animals"
          label="Animals"
          placeholder="A pet or animal they love"
          items={resident.animals}
        />
        <StoryList
          residentId={resident.id}
          listKey="culturalInterests"
          label="Cultural interests"
          placeholder="Faith, language, holidays, traditions"
          items={resident.culturalInterests}
        />
      </StorySection>

      <StorySection title="Care notes">
        <label className="block">
          <span className="text-lg font-medium">Mobility considerations</span>
          <textarea
            defaultValue={resident.mobilityNotes}
            rows={3}
            className={`${fieldClass} mt-1 py-3`}
            onBlur={(event) => onSave({ mobilityNotes: event.target.value })}
          />
        </label>
        <StoryList
          residentId={resident.id}
          listKey="topicsToAvoid"
          label="Topics to avoid"
          placeholder="Something that may upset them"
          items={resident.topicsToAvoid}
        />
        <label className="block">
          <span className="text-lg font-medium">Staff notes</span>
          <textarea
            defaultValue={resident.staffNotes}
            rows={4}
            className={`${fieldClass} mt-1 py-3`}
            onBlur={(event) => onSave({ staffNotes: event.target.value })}
          />
        </label>
      </StorySection>
    </div>
  );
}
