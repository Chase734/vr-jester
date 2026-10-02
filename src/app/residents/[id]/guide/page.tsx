"use client";

import { Suspense, use } from "react";
import { useSearchParams } from "next/navigation";
import { AppBar } from "@/components/brand";
import { useFacility } from "@/lib/facility-store";
import { firstName } from "@/lib/names";
import { guideFacts, recommendationFor } from "@/lib/recommendations";

function GuideBody({ residentId }: { residentId: string }) {
  const searchParams = useSearchParams();
  const place = searchParams.get("place") || "";
  const { residents, sessions, familyRequests, hydrated } = useFacility();
  const resident = residents.find((item) => item.id === residentId);

  if (!resident && !hydrated) {
    return <p className="px-4 py-16 text-xl text-stone-700">Opening guide…</p>;
  }

  if (!resident) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <AppBar backHref="/" />
        <h1 className="mt-6 text-3xl font-semibold">Resident not found</h1>
      </div>
    );
  }

  const residentSessions = sessions.filter((session) => session.residentId === resident.id);
  const residentRequests = familyRequests.filter((request) => request.residentId === resident.id);
  const match = place ? recommendationFor(place, resident, residentSessions, residentRequests) : null;
  const destination = match?.destination || place;
  const facts = destination
    ? guideFacts(destination, resident, residentSessions, residentRequests)
    : [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-8">
      <AppBar backHref={`/residents/${resident.id}`} backLabel="Back to resident" />
      <p className="text-lg text-stone-600">{resident.name}</p>
      <h1 className="mt-1 text-4xl font-semibold tracking-tight text-navy">
        {destination || "Experience guide"}
      </h1>
      {match ? (
        <p className="mt-2 text-xl font-medium text-navy">{match.score}% Match</p>
      ) : null}
      <p className="mt-4 text-xl text-stone-700">
        {match?.reasons.join(" ") ||
          `This guide uses only what VR Jester already knows about ${firstName(resident.name)}.`}
      </p>

      {facts.length > 0 ? (
        <section className="mt-8">
          <h2 className="text-2xl font-semibold">Memories and notes on file</h2>
          <ul className="mt-3 list-disc space-y-2 pl-6 text-lg text-stone-700">
            {facts.map((fact) => (
              <li key={fact}>{fact}</li>
            ))}
          </ul>
        </section>
      ) : (
        <p className="mt-8 text-lg text-stone-600">
          No extra memories are stored for this place yet. Staff can add them after a session.
        </p>
      )}

      {destination ? (
        <a
          href={`/start-session?resident=${resident.id}&destination=${encodeURIComponent(destination)}`}
          className="mt-8 inline-flex min-h-16 w-full items-center justify-center rounded-2xl bg-navy px-8 text-2xl font-semibold text-white"
        >
          Start Experience
        </a>
      ) : null}
    </div>
  );
}

export default function ExperienceGuidePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <Suspense fallback={<p className="px-4 py-16 text-xl text-stone-700">Opening guide…</p>}>
      <GuideBody residentId={id} />
    </Suspense>
  );
}
