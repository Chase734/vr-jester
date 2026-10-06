"use client";

import { AppBar } from "@/components/brand";
import { ExperienceCard } from "@/components/experience-card";
import { todayPicks } from "@/lib/recommendations";
import { useFacility } from "@/lib/facility-store";

export default function RecommendationsPage() {
  const { residents, sessions, familyRequests } = useFacility();
  const picks = todayPicks(residents, sessions, familyRequests, 10);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8">
      <AppBar backHref="/" />
      <p className="text-lg font-semibold uppercase tracking-[0.18em] text-gold">✨ Jester AI</p>
      <h1 className="font-display mt-2 text-4xl font-semibold text-navy">AI Recommendations</h1>
      <p className="mt-2 text-xl text-stone-700">
        Weighted from life story, family requests, and how sessions went. Not a medical score.
      </p>
      <div className="mt-8 grid gap-5 lg:grid-cols-2">
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
    </div>
  );
}
