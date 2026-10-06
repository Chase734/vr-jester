"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { catalog } from "@/data/catalog";
import { AppBar } from "@/components/brand";
import { emptySessionLog, SessionLogFields } from "@/components/session-log-form";
import { waitingFamilyRequests } from "@/lib/insights";
import { firstName } from "@/lib/names";
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
      <h1 className="font-display text-4xl font-semibold tracking-tight text-navy">Start an experience</h1>
      <p className="mt-2 text-xl text-stone-700">
        Pick a resident and a destination. After Wander, tap how it went. One question is enough.
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
                  ? "min-h-16 rounded-2xl bg-navy px-4 text-left text-xl font-medium text-white shadow-lg"
                  : "min-h-16 rounded-2xl bg-white px-4 text-left text-xl text-stone-900 shadow"
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
        <div className="grid gap-3 sm:grid-cols-2">
          {catalog
            .filter((item) => item.source === "vr_jester")
            .map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setLog((current) => ({ ...current, experience: item.destination }))}
                className={
                  log.experience === item.destination
                    ? "min-h-24 overflow-hidden rounded-2xl bg-navy text-left text-white shadow-lg"
                    : "min-h-24 overflow-hidden rounded-2xl bg-white text-left shadow"
                }
              >
                <span
                  className="block h-16 bg-cover bg-center"
                  style={{ backgroundImage: `url(${item.image})` }}
                />
                <span className="block px-4 py-3 text-xl font-semibold">{item.title}</span>
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
        <div className="mt-10 space-y-6 rounded-[2rem] bg-white p-6 shadow-xl">
          <p className="text-2xl font-semibold text-stone-900">
            {resident.name} is going to {log.experience}. Start this in Wander, then tell Jester how it
            went.
          </p>
          <SessionLogFields
            values={log}
            residentName={firstName(resident.name)}
            waitingRequests={waiting}
            onChange={(patch) => setLog((current) => ({ ...current, ...patch }))}
          />
          <button
            type="button"
            disabled={!log.reaction}
            className="inline-flex min-h-16 w-full items-center justify-center rounded-2xl bg-navy px-8 text-2xl font-semibold text-white disabled:opacity-60"
            onClick={() => {
              logSession(resident.id, {
                ...log,
                requestId: log.requestId || searchParams.get("request") || null,
              });
              router.push(`/residents/${resident.id}`);
            }}
          >
            Save session
          </button>
        </div>
      ) : (
        <p className="mt-10 text-xl text-stone-600">Choose a resident and a destination above.</p>
      )}
    </div>
  );
}

export default function StartSessionPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-3xl px-4 py-8 text-xl">Loading session…</div>}>
      <StartSessionForm />
    </Suspense>
  );
}
