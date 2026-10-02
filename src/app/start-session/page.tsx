"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { experiences } from "@/data/sample";
import { LogoutButton } from "@/components/logout-button";
import { useFacility } from "@/lib/facility-store";

function StartSessionForm() {
  const searchParams = useSearchParams();
  const { residents } = useFacility();
  const [residentId, setResidentId] = useState<string | null>(searchParams.get("resident"));
  const [experience, setExperience] = useState<string | null>(null);

  const resident = residents.find((item) => item.id === residentId);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-8">
      <div className="flex items-baseline justify-between gap-4">
        <a href="/" className="text-lg text-emerald-800 underline">
          Back to dashboard
        </a>
        <LogoutButton />
      </div>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight text-stone-900">Start Session</h1>
      <p className="mt-2 text-xl text-stone-700">
        Pick a resident, then a destination. Then open Wander on the headset.
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
                  ? "min-h-16 rounded-xl bg-emerald-800 px-4 text-left text-xl font-medium text-white"
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
              onClick={() => setExperience(item.name)}
              className={
                experience === item.name
                  ? "min-h-16 rounded-xl bg-emerald-800 px-4 text-left text-xl font-medium text-white"
                  : "min-h-16 rounded-xl border border-stone-300 bg-white px-4 text-left text-xl text-stone-900 hover:bg-stone-50"
              }
            >
              {item.name}
            </button>
          ))}
        </div>
      </section>

      {resident && experience ? (
        <div className="mt-10 rounded-2xl border border-emerald-800 bg-emerald-50 p-6">
          <p className="text-2xl font-semibold text-stone-900">Ready</p>
          <p className="mt-2 text-xl text-stone-800">
            {resident.name} is going to {experience}.
          </p>
          <p className="mt-3 text-lg text-stone-700">
            Put on the Quest headset and start this destination in Wander.
          </p>
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
