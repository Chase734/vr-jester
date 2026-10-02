"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { experiences } from "@/data/sample";
import { AppBar } from "@/components/brand";
import { emptySessionLog, SessionLogFields } from "@/components/session-log-form";
import { waitingFamilyRequests } from "@/lib/insights";
import { useFacility } from "@/lib/facility-store";

function StartSessionForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { residents, familyRequests, logSession } = useFacility();
  const [residentId, setResidentId] = useState<string | null>(searchParams.get("resident"));
  const [log, setLog] = useState(emptySessionLog(searchParams.get("destination") || ""));

  const resident = residents.find((item) => item.id === residentId);
  const waiting = useMemo(
    () => waitingFamilyRequests(familyRequests.filter((request) => request.residentId === residentId)),
    [familyRequests, residentId],
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-8">
      <AppBar backHref="/" />
      <h1 className="text-4xl font-semibold tracking-tight text-navy">Start Session</h1>
      <p className="mt-2 text-xl text-stone-700">
        Pick a resident and a destination. After Wander, tap how it went.
      </p>

      <section className="mt-8">
        <h2 className="mb-3 text-2xl font-semibold">1. Who is traveling?</h2>
        <div className="grid gap-3">
          {residents.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setResidentId(item.id)}
              className={
                residentId === item.id
                  ? "min-h-16 rounded-xl bg-navy px-4 text-left text-xl font-medium text-white"
                  : "min-h-16 rounded-xl border border-stone-300 bg-white px-4 text-left text-xl text-stone-900 hover:bg-stone-50"
              }
            >
              {item.name}
              <span className="ml-2 text-lg font-normal opacity-80">{item.room}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="mb-3 text-2xl font-semibold">2. Where are they going?</h2>
        <div className="grid gap-3">
          {experiences.map((item) => (
            <button
              key={item.name}
              type="button"
              onClick={() => setLog((current) => ({ ...current, experience: item.name }))}
              className={
                log.experience === item.name
                  ? "min-h-16 rounded-xl bg-navy px-4 text-left text-xl font-medium text-white"
                  : "min-h-16 rounded-xl border border-stone-300 bg-white px-4 text-left text-xl text-stone-900 hover:bg-stone-50"
              }
            >
              {item.name}
            </button>
          ))}
        </div>
        <input
          value={log.experience}
          onChange={(event) => setLog((current) => ({ ...current, experience: event.target.value }))}
          placeholder="Or type a destination"
          className="mt-3 w-full min-h-14 rounded-xl border border-stone-300 bg-white px-4 text-xl"
        />
      </section>

      {resident && log.experience.trim() ? (
        <div className="mt-10 space-y-6 rounded-2xl border-2 border-gold bg-white p-6">
          <div>
            <p className="text-2xl font-semibold text-stone-900">Ready, then wrap up</p>
            <p className="mt-2 text-xl text-stone-800">
              {resident.name} is going to {log.experience}. Start this destination in Wander, then
              tap how it went.
            </p>
          </div>
          <SessionLogFields
            values={log}
            waitingRequests={waiting}
            onChange={(patch) => setLog((current) => ({ ...current, ...patch }))}
          />
          <button
            type="button"
            disabled={!log.reaction || !log.sessionEngagement}
            className="inline-flex min-h-16 w-full items-center justify-center rounded-2xl bg-navy px-8 text-2xl font-semibold text-white disabled:opacity-60"
            onClick={() => {
              logSession(resident.id, {
                ...log,
                requestId: log.requestId || null,
              });
              router.push(`/residents/${resident.id}`);
            }}
          >
            Save session
          </button>
          {!log.reaction || !log.sessionEngagement ? (
            <p className="text-lg text-stone-600">Choose a reaction and engagement to save.</p>
          ) : null}
        </div>
      ) : (
        <p className="mt-10 text-xl text-stone-600">Choose a resident and a destination above.</p>
      )}
    </div>
  );
}

export default function StartSessionPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-3xl px-4 py-8 text-xl text-stone-700">Loading session…</div>
      }
    >
      <StartSessionForm />
    </Suspense>
  );
}
