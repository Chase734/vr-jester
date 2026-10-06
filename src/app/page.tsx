"use client";

import { AppBar } from "@/components/brand";
import { ActionButton, ExperienceCard } from "@/components/experience-card";
import { waitingFamilyRequests } from "@/lib/insights";
import { greeting } from "@/lib/engagement";
import { firstName } from "@/lib/names";
import { todayPicks, matchFamilyRequest } from "@/lib/recommendations";
import { useFacility } from "@/lib/facility-store";

export default function DashboardPage() {
  const { residents, sessions, familyRequests, profile } = useFacility();
  const staff = firstName(profile?.fullName || "there");
  const picks = todayPicks(residents, sessions, familyRequests, 4);
  const waiting = waitingFamilyRequests(familyRequests);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8">
      <AppBar />
      <header className="mb-8">
        <p className="text-lg font-semibold tracking-[0.18em] text-gold uppercase">
          {profile?.facilityName ?? "Your community"}
        </p>
        <h1 className="font-display mt-2 text-4xl font-semibold tracking-tight text-navy sm:text-5xl">
          {greeting()}, {staff}
        </h1>
        <p className="mt-3 max-w-2xl text-xl text-stone-700">
          AI-powered resident engagement, delivered through VR. The more you use it, the smarter
          today&apos;s suggestions become.
        </p>
      </header>

      <section className="mb-8 overflow-hidden rounded-[2rem] bg-gradient-to-br from-navy to-navy-dark p-6 text-white shadow-2xl shadow-navy/30 sm:p-8">
        <p className="text-lg font-semibold tracking-[0.2em] text-gold uppercase">✨ Jester AI</p>
        <h2 className="font-display mt-2 text-3xl font-semibold">Where should we take someone today?</h2>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <ActionButton href="/start-session">Start an Experience</ActionButton>
          <ActionButton href="/recommendations" tone="gold">
            AI Recommendations
          </ActionButton>
          <ActionButton href="/activity" tone="white">
            Plan a Group Activity
          </ActionButton>
          <ActionButton href="/#family-requests" tone="white">
            Family Requests{waiting.length ? ` (${waiting.length})` : ""}
          </ActionButton>
        </div>
      </section>

      <section className="mb-10">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl font-semibold text-navy">Recommended for today</h2>
            <p className="mt-1 text-lg text-stone-600">
              Match scores are for engagement and entertainment only.
            </p>
          </div>
          <a href="/discover" className="text-lg font-semibold text-navy underline">
            Discover more
          </a>
        </div>
        {picks.length === 0 ? (
          <p className="rounded-3xl bg-white/80 p-6 text-xl text-stone-700 shadow">
            Add a hometown, a favorite place, or a family request and today&apos;s picks will appear.
          </p>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            {picks.map(({ resident, recommendation }) => (
              <ExperienceCard
                key={`${resident.id}-${recommendation.experienceId}`}
                recommendation={recommendation}
                residentName={resident.name}
                href={
                  recommendation.source === "youtube_360"
                    ? `/watch?resident=${resident.id}&q=${encodeURIComponent(recommendation.youtubeQuery || recommendation.destination)}`
                    : `/start-session?resident=${resident.id}&destination=${encodeURIComponent(recommendation.destination)}`
                }
              />
            ))}
          </div>
        )}
      </section>

      <div className="mb-8 grid gap-3 sm:grid-cols-2">
        <ActionButton href="/residents/new" tone="white">
          Add resident
        </ActionButton>
        <ActionButton href="/engagement" tone="white">
          Engagement dashboard
        </ActionButton>
      </div>

      <section id="family-requests" className="rounded-[2rem] bg-white/90 p-6 shadow-xl shadow-navy/5">
        <h2 className="font-display text-3xl font-semibold text-navy">Family requests</h2>
        {familyRequests.length === 0 ? (
          <p className="mt-3 text-lg text-stone-600">No family ideas yet. Copy a family link from a resident profile.</p>
        ) : (
          <ul className="mt-4 divide-y divide-stone-200">
            {familyRequests.slice(0, 6).map((request) => {
              const resident = residents.find((item) => item.id === request.residentId);
              const matches = matchFamilyRequest(request, resident);
              return (
              <li key={request.id} className="py-4">
                <p className="text-sm font-semibold uppercase tracking-wide text-gold">New family request</p>
                <p className="text-xl font-semibold text-navy">
                  {request.requestedBy} requested: {request.experience}
                </p>
                <p className="text-lg text-stone-700">
                  For{" "}
                  <a className="underline" href={`/residents/${request.residentId}`}>
                    {request.residentName}
                  </a>
                  {request.whyItMatters ? `. Why it matters: ${request.whyItMatters}` : ""}
                </p>
                {matches.length ? (
                  <div className="mt-3 rounded-2xl bg-stone-50 p-4">
                    <p className="font-semibold text-navy">AI found {matches.length} matching experiences</p>
                    <ul className="mt-2 space-y-1 text-lg">
                      {matches.map(({ item }) => (
                        <li key={item.id}>
                          {item.title} · {item.source === "youtube_360" ? "YouTube 360" : "VR Jester"}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                <a
                  href={`/start-session?resident=${request.residentId}&destination=${encodeURIComponent(matches[0]?.item.destination || request.experience)}&request=${request.id}`}
                  className="mt-3 inline-flex min-h-12 items-center rounded-2xl bg-navy px-5 text-lg font-semibold text-white"
                >
                  Create session
                </a>
              </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="mt-8">
        <h2 className="font-display mb-4 text-3xl font-semibold text-navy">Residents</h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {residents.map((resident) => (
            <li key={resident.id}>
              <a
                href={`/residents/${resident.id}`}
                className="block rounded-2xl bg-white/90 px-5 py-4 shadow-md shadow-navy/5"
              >
                <p className="text-xl font-semibold text-navy">{resident.name}</p>
                <p className="text-lg text-stone-600">{resident.room}</p>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
