"use client";

import { AppBar } from "@/components/brand";
import {
  averageEngagement,
  jesterEngagementScore,
  popularCategories,
  popularExperiences,
  reconnectResidents,
  weekSessions,
} from "@/lib/engagement";
import { recommendExperiences } from "@/lib/recommendations";
import { useFacility } from "@/lib/facility-store";

export default function EngagementPage() {
  const { residents, sessions, familyRequests } = useFacility();
  const week = weekSessions(sessions);
  const engaged = new Set(week.map((session) => session.residentId)).size;
  const reconnect = reconnectResidents(residents, sessions).slice(0, 6);
  const familyDone = familyRequests.filter((request) => request.status === "Completed").length;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-8">
      <AppBar backHref="/" />
      <h1 className="font-display text-4xl font-semibold text-navy">Engagement</h1>
      <p className="mt-2 text-xl text-stone-700">
        How this community is showing up. These are engagement opportunities, not medical scores.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Stat label="Residents engaged this week" value={engaged} />
        <Stat label="Sessions this week" value={week.length} />
        <Stat label="Average engagement" value={`${averageEngagement(week)}%`} />
        <Stat label="Family requested sessions" value={familyDone} />
      </div>

      <section className="mt-8 rounded-[2rem] bg-white p-6 shadow-xl">
        <h2 className="font-display text-3xl font-semibold text-navy">Most popular</h2>
        <div className="mt-4 grid gap-6 sm:grid-cols-2">
          <div>
            <p className="text-lg font-semibold">Categories</p>
            <ul className="mt-2 space-y-2 text-lg">
              {popularCategories(sessions).map(([name, count]) => (
                <li key={name}>
                  {name} · {count}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-lg font-semibold">Experiences</p>
            <ul className="mt-2 space-y-2 text-lg">
              {popularExperiences(sessions).map((item) => (
                <li key={item.name}>
                  {item.name} · {item.trips}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="mt-8 rounded-[2rem] bg-white p-6 shadow-xl">
        <h2 className="font-display text-3xl font-semibold text-navy">Residents to reconnect with</h2>
        <p className="mt-1 text-lg text-stone-600">Engagement opportunity</p>
        <ul className="mt-4 space-y-5">
          {reconnect.map(({ resident, idleDays }) => {
            const pick = recommendExperiences(
              resident,
              sessions.filter((session) => session.residentId === resident.id),
              familyRequests.filter((request) => request.residentId === resident.id),
              1,
            )[0];
            return (
              <li key={resident.id} className="rounded-2xl bg-stone-50 p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-2xl font-semibold text-navy">{resident.name}</p>
                  <p className="text-lg text-stone-600">
                    {idleDays >= 30 ? "No session yet" : `No session in ${idleDays} days`}
                  </p>
                </div>
                <p className="mt-1 text-lg text-stone-700">
                  Jester Engagement {jesterEngagementScore(resident, sessions, familyRequests)}
                </p>
                {pick ? (
                  <p className="mt-2 text-lg">
                    AI recommendation: {pick.destination} ({pick.score}% Match)
                  </p>
                ) : null}
                <a
                  href={
                    pick
                      ? `/start-session?resident=${resident.id}&destination=${encodeURIComponent(pick.destination)}`
                      : `/start-session?resident=${resident.id}`
                  }
                  className="mt-3 inline-flex min-h-14 items-center rounded-2xl bg-navy px-5 text-lg font-semibold text-white"
                >
                  Start Experience
                </a>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-[1.75rem] bg-white p-5 shadow-lg">
      <p className="text-lg text-stone-600">{label}</p>
      <p className="font-display mt-1 text-4xl font-semibold text-navy">{value}</p>
    </div>
  );
}
