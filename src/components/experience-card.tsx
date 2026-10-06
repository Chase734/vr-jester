"use client";

import type { Recommendation } from "@/lib/recommendations";
import { firstName } from "@/lib/names";
import { experienceImage } from "@/data/catalog";

export function ExperienceCard({
  recommendation,
  residentName,
  href,
  extra,
}: {
  recommendation: Recommendation;
  residentName?: string;
  href?: string;
  extra?: React.ReactNode;
}) {
  const image = recommendation.image || experienceImage(recommendation.destination);

  return (
    <article className="overflow-hidden rounded-3xl bg-white shadow-xl shadow-navy/10">
      <div
        className="relative h-44 bg-cover bg-center"
        style={{ backgroundImage: `url(${image})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-navy/20 to-transparent" />
        <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between gap-3">
          <h3 className="font-display text-2xl font-semibold text-white">{recommendation.destination}</h3>
          <span className="rounded-full bg-gold px-3 py-1 text-sm font-bold text-navy">
            {recommendation.score}% Match
          </span>
        </div>
      </div>
      <div className="space-y-3 p-5">
        <div className="flex flex-wrap gap-2 text-sm font-semibold uppercase tracking-wide text-navy/70">
          <span>{recommendation.source === "youtube_360" ? "YouTube 360" : "VR Jester"}</span>
          <span>· {recommendation.category}</span>
          {recommendation.durationMinutes ? <span>· {recommendation.durationMinutes} min</span> : null}
        </div>
        {residentName ? (
          <p className="text-lg text-stone-700">Recommended for {firstName(residentName)}</p>
        ) : null}
        <p className="text-lg text-stone-700">
          <span className="font-semibold text-navy">Why: </span>
          {recommendation.explanation}
        </p>
        {href ? (
          <a
            href={href}
            className="inline-flex min-h-14 w-full items-center justify-center rounded-2xl bg-navy px-5 text-xl font-semibold text-white"
          >
            {recommendation.source === "youtube_360" ? "Watch" : "Start Experience"}
          </a>
        ) : null}
        {extra}
      </div>
    </article>
  );
}

export function ActionButton({
  href,
  children,
  tone = "navy",
}: {
  href: string;
  children: React.ReactNode;
  tone?: "navy" | "gold" | "white";
}) {
  const className =
    tone === "gold"
      ? "bg-gold text-navy"
      : tone === "white"
        ? "border-2 border-navy bg-white text-navy"
        : "bg-navy text-white";
  return (
    <a
      href={href}
      className={`inline-flex min-h-20 w-full items-center justify-center rounded-3xl px-6 text-2xl font-semibold shadow-lg shadow-navy/10 ${className}`}
    >
      {children}
    </a>
  );
}
