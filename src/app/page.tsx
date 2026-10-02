"use client";

import { AppBar } from "@/components/brand";
import { StartSessionButton } from "@/components/ui";
import { experiences } from "@/data/sample";
import { formatSessionWhen } from "@/lib/dates";
import { useFacility } from "@/lib/facility-store";

export default function DashboardPage() {
  const { residents, sessions, familyRequests, profile, isAdmin } = useFacility();
  const needsVisit = residents.filter((resident) => resident.engagement === "Needs a visit").length;
  const weekStart = new Date("2026-09-28T00:00:00");
  const weekEnd = new Date("2026-10-04T23:59:59");
  const sessionsThisWeek = sessions.filter((session) => {
    const when = new Date(session.startsAt);
    return when >= weekStart && when <= weekEnd;
  });
  const upcomingSessions = sessions.filter((session) => session.status === "upcoming");
  const recentSessions = sessions.filter((session) => session.status === "completed").slice(0, 4);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8">
      <AppBar
        extra={
          isAdmin ? (
            <a href="/facilities" className="text-lg text-navy underline">
              Facilities
            </a>
          ) : null
        }
      />
      <header className="mb-8">
        <h1 className="text-4xl font-semibold tracking-tight text-navy">
          {profile?.facilityName ?? "Maple Grove Senior Living"}
        </h1>
        <p className="mt-2 text-xl text-stone-700">
          Hello{profile?.fullName ? `, ${profile.fullName}` : ""}. Here is today.
        </p>
      </header>

      <div className="mb-4">
        <StartSessionButton />
      </div>
      <a
        href="/residents/new"
        className="mb-8 inline-flex min-h-16 w-full items-center justify-center rounded-2xl border-2 border-navy bg-white px-8 text-2xl font-semibold text-navy"
      >
        Add resident
      </a>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-stone-300 bg-white p-5">
          <p className="text-lg text-stone-600">Residents</p>
          <p className="mt-1 text-4xl font-semibold">{residents.length}</p>
        </div>
        <div className="rounded-2xl border border-stone-300 bg-white p-5">
          <p className="text-lg text-stone-600">Sessions this week</p>
          <p className="mt-1 text-4xl font-semibold">{sessionsThisWeek.length}</p>
        </div>
        <div className="rounded-2xl border border-stone-300 bg-white p-5">
          <p className="text-lg text-stone-600">Family requests</p>
          <p className="mt-1 text-4xl font-semibold">{familyRequests.length}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-stone-300 bg-white p-6">
          <h2 className="mb-4 text-2xl font-semibold tracking-tight text-stone-900">
            Upcoming sessions
          </h2>
          <ul className="divide-y divide-stone-200">
            {upcomingSessions.map((session) => (
              <li key={session.id} className="py-4 first:pt-0 last:pb-0">
                <p className="text-xl font-medium text-stone-900">
                  <a href={`/residents/${session.residentId}`} className="hover:underline">
                    {session.residentName}
                  </a>
                </p>
                <p className="text-lg text-stone-700">{session.experience}</p>
                <p className="text-lg text-navy">{formatSessionWhen(session.startsAt)}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-stone-300 bg-white p-6">
          <h2 className="mb-4 text-2xl font-semibold tracking-tight text-stone-900">
            Recent sessions
          </h2>
          <ul className="divide-y divide-stone-200">
            {recentSessions.map((session) => (
              <li key={session.id} className="py-4 first:pt-0 last:pb-0">
                <p className="text-xl font-medium text-stone-900">
                  <a href={`/residents/${session.residentId}`} className="hover:underline">
                    {session.residentName}
                  </a>
                </p>
                <p className="text-lg text-stone-700">{session.experience}</p>
                <p className="text-lg text-stone-500">{formatSessionWhen(session.startsAt)} — Done</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-stone-300 bg-white p-6">
          <h2 className="mb-4 text-2xl font-semibold tracking-tight text-stone-900">
            Most popular experiences
          </h2>
          <ol className="space-y-3">
            {experiences.map((experience, index) => (
              <li key={experience.name} className="flex items-baseline justify-between gap-4 text-lg">
                <span className="text-xl text-stone-900">
                  {index + 1}. {experience.name}
                </span>
                <span className="shrink-0 text-stone-600">{experience.trips} trips</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="rounded-2xl border border-stone-300 bg-white p-6">
          <h2 className="mb-1 text-2xl font-semibold tracking-tight text-stone-900">
            Resident engagement
          </h2>
          <p className="mb-4 text-lg text-stone-600">
            {needsVisit} {needsVisit === 1 ? "resident needs" : "residents need"} a visit.
          </p>
          <ul className="divide-y divide-stone-200">
            {residents.map((resident) => (
              <li key={resident.id} className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0">
                <div>
                  <p className="text-xl font-medium text-stone-900">
                    <a href={`/residents/${resident.id}`} className="hover:underline">
                      {resident.name}
                    </a>
                  </p>
                  <p className="text-lg text-stone-600">
                    {resident.room} · {resident.sessionsThisMonth}{" "}
                    {resident.sessionsThisMonth === 1 ? "trip" : "trips"} this month
                  </p>
                </div>
                <span
                  className={
                    resident.engagement === "Needs a visit"
                      ? "shrink-0 rounded-full bg-amber-100 px-3 py-1 text-base font-medium text-amber-950"
                      : resident.engagement === "Very active"
                        ? "shrink-0 rounded-full bg-emerald-100 px-3 py-1 text-base font-medium text-emerald-900"
                        : "shrink-0 rounded-full bg-stone-100 px-3 py-1 text-base font-medium text-stone-700"
                  }
                >
                  {resident.engagement}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="mt-6 rounded-2xl border border-stone-300 bg-white p-6">
        <h2 className="mb-4 text-2xl font-semibold tracking-tight text-stone-900">
          Family requests
        </h2>
        <ul className="divide-y divide-stone-200">
          {familyRequests.map((request) => (
            <li key={request.id} className="py-5 first:pt-0 last:pb-0">
              <p className="text-xl font-medium text-stone-900">
                <a href={`/residents/${request.residentId}`} className="hover:underline">
                  {request.residentName}
                </a>{" "}
                — {request.experience}
              </p>
              <p className="text-lg text-stone-700">
                {request.requestedBy}. {request.note}
              </p>
              <p className="text-lg text-stone-500">Received {request.received}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6 rounded-2xl border border-stone-300 bg-white p-6">
        <h2 className="mb-4 text-2xl font-semibold tracking-tight text-stone-900">Residents</h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {residents.map((resident) => (
            <li key={resident.id}>
              <a
                href={`/residents/${resident.id}`}
                className="block rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 hover:border-navy hover:bg-white"
              >
                <p className="text-xl font-medium text-stone-900">{resident.name}</p>
                <p className="text-lg text-stone-600">{resident.room}</p>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
