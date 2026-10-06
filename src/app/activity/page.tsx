"use client";

import { useMemo, useState } from "react";
import { AppBar } from "@/components/brand";
import { planActivity, type ActivityTheme } from "@/lib/activity-plan";
import { useFacility } from "@/lib/facility-store";

const minutesOptions = [15, 30, 45, 60];
const themes: ActivityTheme[] = ["TRAVEL", "SPORTS", "MEMORIES", "NATURE", "RELAXATION", "SURPRISE ME"];

export default function ActivityPage() {
  const { residents, sessions } = useFacility();
  const [prompt, setPrompt] = useState(
    "I have six residents for about 45 minutes who like baseball and travel.",
  );
  const [minutes, setMinutes] = useState(45);
  const [theme, setTheme] = useState<ActivityTheme>("SPORTS");
  const plan = useMemo(
    () => planActivity(prompt, residents, sessions, minutes, theme),
    [prompt, residents, sessions, minutes, theme],
  );

  function listen() {
    const Speech = (window as Window & { webkitSpeechRecognition?: new () => SpeechRecognition }).webkitSpeechRecognition
      ?? (window as Window & { SpeechRecognition?: new () => SpeechRecognition }).SpeechRecognition;
    if (!Speech) {
      return;
    }
    const recognition = new Speech();
    recognition.lang = "en-US";
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      setPrompt(event.results[0][0].transcript);
    };
    recognition.start();
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-8">
      <AppBar backHref="/" />
      <p className="text-lg font-semibold uppercase tracking-[0.18em] text-gold">✨ Plan an activity</p>
      <h1 className="font-display mt-2 text-4xl font-semibold text-navy">AI Activity Director</h1>
      <p className="mt-2 text-xl text-stone-700">
        Type or speak a simple plan. Jester builds a group session from what this community already
        loves.
      </p>

      <textarea
        value={prompt}
        onChange={(event) => setPrompt(event.target.value)}
        rows={3}
        className="mt-6 w-full rounded-3xl border border-navy/10 bg-white px-5 py-4 text-xl shadow"
      />
      <button
        type="button"
        onClick={listen}
        className="mt-3 min-h-14 rounded-2xl border-2 border-navy bg-white px-5 text-lg font-semibold text-navy"
      >
        Speak
      </button>

      <div className="mt-6 flex flex-wrap gap-2">
        {minutesOptions.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setMinutes(option)}
            className={
              minutes === option
                ? "min-h-14 rounded-2xl bg-navy px-5 text-lg font-semibold text-white"
                : "min-h-14 rounded-2xl bg-white px-5 text-lg font-semibold text-navy shadow"
            }
          >
            {option} minutes
          </button>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {themes.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setTheme(option)}
            className={
              theme === option
                ? "min-h-14 rounded-2xl bg-gold px-5 text-lg font-semibold text-navy"
                : "min-h-14 rounded-2xl bg-white px-5 text-lg font-semibold text-navy shadow"
            }
          >
            {option}
          </button>
        ))}
      </div>

      <section className="mt-8 rounded-[2rem] bg-white p-6 shadow-xl">
        <p className="text-lg font-semibold uppercase tracking-wide text-gold">Today&apos;s adventure</p>
        <h2 className="font-display mt-1 text-3xl font-semibold text-navy">{plan.title}</h2>
        <ol className="mt-5 space-y-3">
          {plan.steps.map((step) => (
            <li key={step.label} className="rounded-2xl bg-stone-50 px-4 py-3 text-lg">
              <span className="font-semibold text-navy">{step.minutes} minutes</span>
              <span className="text-stone-700"> · {step.label}</span>
            </li>
          ))}
        </ol>
        <p className="mt-5 text-lg font-semibold text-navy">Recommended residents</p>
        <p className="text-xl text-stone-800">
          {plan.residents.map((resident) => resident.name.split(" ")[0]).join(", ") || "Anyone available"}
        </p>
        <a
          href={
            plan.residents[0]
              ? `/start-session?resident=${plan.residents[0].id}&destination=${encodeURIComponent(plan.experiences[0]?.destination || "")}`
              : "/start-session"
          }
          className="mt-6 inline-flex min-h-16 w-full items-center justify-center rounded-2xl bg-navy text-2xl font-semibold text-white"
        >
          Start group session
        </a>
      </section>
    </div>
  );
}

type SpeechRecognition = {
  lang: string;
  start: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
};

type SpeechRecognitionEvent = {
  results: { 0: { 0: { transcript: string } } };
};
