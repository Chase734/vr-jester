"use client";

import { AppBar } from "@/components/brand";
import { ExperienceCard } from "@/components/experience-card";
import { catalog, discoverSections, experienceImage } from "@/data/catalog";
import { waitingFamilyRequests } from "@/lib/insights";
import { popularExperiences } from "@/lib/engagement";
import { recommendExperiences, related } from "@/lib/recommendations";
import { useFacility } from "@/lib/facility-store";

export default function DiscoverPage() {
  const { residents, sessions, familyRequests } = useFacility();
  const trending = popularExperiences(sessions, 8).map((item) => item.name);
  const familyPlaces = waitingFamilyRequests(familyRequests).map((request) => request.experience);
  const recommended = residents.flatMap((resident) =>
    recommendExperiences(
      resident,
      sessions.filter((session) => session.residentId === resident.id),
      familyRequests.filter((request) => request.residentId === resident.id),
      1,
    ).map((recommendation) => ({ resident, recommendation })),
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8">
      <AppBar backHref="/" backLabel="Back to home" />
      <h1 className="font-display text-4xl font-semibold text-navy">Discover</h1>
      <p className="mt-2 text-xl text-stone-700">
        Browse like a streaming guide. Large cards, less typing, more places to go.
      </p>

      {discoverSections.map((section) => {
        const cards =
          section.special === "recommended"
            ? recommended.slice(0, 6).map(({ resident, recommendation }) => (
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
              ))
            : section.special === "trending"
              ? catalog
                  .filter((item) => trending.some((name) => related(name, item.destination)))
                  .slice(0, 8)
                  .map((item) => railCard(item.title, item))
              : section.special === "new"
                ? catalog.slice(-6).map((item) => railCard(item.title, item))
                : section.special === "family"
                  ? catalog
                      .filter((item) => familyPlaces.some((place) => related(place, item.destination)))
                      .map((item) => railCard(item.title, item))
                  : catalog
                      .filter((item) => item.category === section.category || (section.category === "YouTube 360" && item.source === "youtube_360"))
                      .map((item) => railCard(item.title, item));

        if (!cards.length) {
          return null;
        }

        return (
          <section key={section.title} className="mt-10">
            <h2 className="font-display text-3xl font-semibold text-navy">{section.title}</h2>
            <div className="mt-4 flex gap-4 overflow-x-auto pb-4">
              {cards.map((card, index) => (
                <div key={index} className="w-[280px] shrink-0 sm:w-[320px]">
                  {card}
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function railCard(title: string, item: (typeof catalog)[number]) {
  return (
    <a
      href={
        item.source === "youtube_360"
          ? `/watch?q=${encodeURIComponent(item.youtubeQuery)}`
          : `/start-session?destination=${encodeURIComponent(item.destination)}`
      }
      className="block overflow-hidden rounded-3xl bg-white shadow-lg"
    >
      <div
        className="h-40 bg-cover bg-center"
        style={{ backgroundImage: `url(${item.image || experienceImage(item.destination)})` }}
      />
      <div className="p-4">
        <p className="text-sm font-semibold uppercase tracking-wide text-navy/60">
          {item.source === "youtube_360" ? "YouTube 360" : "VR Jester"}
        </p>
        <p className="font-display text-xl font-semibold text-navy">{title}</p>
      </div>
    </a>
  );
}
