"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AppBar } from "@/components/brand";
import { EnjoyButtons } from "@/components/session-log-form";
import { findExperience } from "@/data/catalog";
import { youtubeEmbedUrl, youtubeWatchUrl, type YoutubeHit } from "@/lib/youtube";
import { firstName } from "@/lib/names";
import { useFacility } from "@/lib/facility-store";
import type { SessionReaction } from "@/data/sample";

function WatchInner() {
  const searchParams = useSearchParams();
  const { residents, logSession } = useFacility();
  const query = searchParams.get("q") || "360 VR";
  const residentId = searchParams.get("resident");
  const resident = residents.find((item) => item.id === residentId);
  const catalogItem = findExperience(query);
  const [hits, setHits] = useState<YoutubeHit[]>([]);
  const [message, setMessage] = useState("");
  const [watchUrl, setWatchUrl] = useState(youtubeWatchUrl(query, catalogItem?.youtubeVideoId));
  const [reaction, setReaction] = useState<SessionReaction | "">("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const response = await fetch(`/api/youtube/search?q=${encodeURIComponent(query)}`);
      const payload = (await response.json()) as {
        items?: YoutubeHit[];
        watchUrl?: string;
        message?: string;
      };
      if (cancelled) {
        return;
      }
      setHits(payload.items ?? []);
      if (payload.watchUrl) {
        setWatchUrl(payload.watchUrl);
      }
      setMessage(payload.message ?? "");
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [query]);

  const embeddable = hits.find((hit) => hit.embedAvailable) ?? (catalogItem?.youtubeVideoId
    ? {
        youtubeVideoId: catalogItem.youtubeVideoId,
        title: catalogItem.title,
        channel: catalogItem.channel ?? "YouTube",
        thumbnail: catalogItem.image,
        description: catalogItem.description,
        embedAvailable: true,
        watchUrl: youtubeWatchUrl(catalogItem.youtubeQuery, catalogItem.youtubeVideoId),
      }
    : null);
  const title = embeddable?.title || catalogItem?.title || query;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-8">
      <AppBar backHref="/discover" backLabel="Back to Discover" />
      <p className="text-sm font-semibold uppercase tracking-wide text-gold">360° Experience · YouTube 360</p>
      <h1 className="font-display mt-2 text-4xl font-semibold text-navy">{title}</h1>
      {embeddable?.channel ? (
        <p className="mt-2 text-lg text-stone-600">
          Video by {embeddable.channel} on YouTube. VR Jester does not host this video.
        </p>
      ) : null}

      {embeddable?.embedAvailable && embeddable.youtubeVideoId ? (
        <div className="mt-6 overflow-hidden rounded-3xl bg-black shadow-xl">
          <iframe
            title={title}
            src={youtubeEmbedUrl(embeddable.youtubeVideoId)}
            className="aspect-video w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; xr-spatial-tracking"
            allowFullScreen
          />
        </div>
      ) : (
        <div className="mt-6 rounded-3xl bg-white p-6 shadow-xl">
          <p className="text-xl text-stone-700">
            {message || "This video cannot be embedded here. Open it on YouTube for the headset or TV."}
          </p>
          <a
            href={watchUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex min-h-16 w-full items-center justify-center rounded-2xl bg-navy text-2xl font-semibold text-white"
          >
            Watch on YouTube
          </a>
        </div>
      )}

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <a
          href={watchUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-14 items-center justify-center rounded-2xl bg-gold px-4 text-lg font-semibold text-navy"
        >
          Open in headset
        </a>
        <a
          href={resident ? `/start-session?resident=${resident.id}&destination=${encodeURIComponent(title)}` : "/start-session"}
          className="inline-flex min-h-14 items-center justify-center rounded-2xl border-2 border-navy bg-white px-4 text-lg font-semibold text-navy"
        >
          Save
        </a>
        {resident ? (
          <button
            type="button"
            className="inline-flex min-h-14 items-center justify-center rounded-2xl bg-stone-100 px-4 text-lg font-semibold text-stone-700 sm:col-span-2"
            onClick={() => {
              logSession(resident.id, {
                experience: title,
                reaction: "Didn't Like It",
                experienceType: "youtube_360",
                youtubeVideoId: embeddable?.youtubeVideoId ?? "",
                completionPercentage: 0,
              });
              setSaved(true);
            }}
          >
            Not interested
          </button>
        ) : null}
      </div>

      {resident ? (
        <div className="mt-8 rounded-3xl bg-white p-6 shadow-xl">
          {saved ? (
            <p className="text-xl text-navy">Saved. Jester will remember how {firstName(resident.name)} responded.</p>
          ) : (
            <>
              <EnjoyButtons name={firstName(resident.name)} value={reaction} onChange={setReaction} />
              <button
                type="button"
                disabled={!reaction}
                className="mt-5 inline-flex min-h-16 w-full items-center justify-center rounded-2xl bg-navy text-2xl font-semibold text-white disabled:opacity-60"
                onClick={() => {
                  logSession(resident.id, {
                    experience: title,
                    reaction,
                    experienceType: "youtube_360",
                    youtubeVideoId: embeddable?.youtubeVideoId ?? "",
                    completionPercentage: 100,
                  });
                  setSaved(true);
                }}
              >
                Save this experience
              </button>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}

export default function WatchPage() {
  return (
    <Suspense fallback={<p className="px-4 py-16 text-xl">Opening experience…</p>}>
      <WatchInner />
    </Suspense>
  );
}
