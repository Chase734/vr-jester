import { NextResponse } from "next/server";
import type { YoutubeHit } from "@/lib/youtube";
import { createServerSupabase } from "@/lib/supabase/server";

function isoDurationToLabel(iso: string) {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) {
    return "";
  }
  const hours = Number(match[1] ?? 0);
  const minutes = Number(match[2] ?? 0);
  if (hours) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes || 1} minutes`;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = url.searchParams.get("q")?.trim() ?? "";
  if (query.length < 3) {
    return NextResponse.json({ error: "Enter a destination to search." }, { status: 400 });
  }

  const key = process.env.YOUTUBE_API_KEY;
  if (!key) {
    return NextResponse.json({
      items: [],
      watchUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(`${query} 360 VR`)}`,
      message: "YouTube search is not connected yet. Staff can still open results on YouTube.",
    });
  }

  const search = new URL("https://www.googleapis.com/youtube/v3/search");
  search.searchParams.set("part", "snippet");
  search.searchParams.set("type", "video");
  search.searchParams.set("maxResults", "6");
  search.searchParams.set("videoEmbeddable", "true");
  search.searchParams.set("safeSearch", "strict");
  search.searchParams.set("q", `${query} 360 VR immersive`);
  search.searchParams.set("key", key);

  const searchResponse = await fetch(search);
  if (!searchResponse.ok) {
    return NextResponse.json({
      items: [],
      watchUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(`${query} 360 VR`)}`,
      message: "YouTube could not be searched right now.",
    });
  }

  const searchJson = (await searchResponse.json()) as {
    items?: { id?: { videoId?: string }; snippet?: { title?: string; channelTitle?: string; description?: string; thumbnails?: { high?: { url?: string } } } }[];
  };
  const ids = (searchJson.items ?? []).map((item) => item.id?.videoId).filter(Boolean) as string[];
  if (!ids.length) {
    return NextResponse.json({
      items: [],
      watchUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(`${query} 360 VR`)}`,
    });
  }

  const details = new URL("https://www.googleapis.com/youtube/v3/videos");
  details.searchParams.set("part", "snippet,status,contentDetails");
  details.searchParams.set("id", ids.join(","));
  details.searchParams.set("key", key);
  const detailsResponse = await fetch(details);
  const detailsJson = (await detailsResponse.json()) as {
    items?: {
      id: string;
      snippet?: { title?: string; channelTitle?: string; description?: string; thumbnails?: { high?: { url?: string } } };
      status?: { embeddable?: boolean };
      contentDetails?: { duration?: string };
    }[];
  };

  const items: (YoutubeHit & { duration: string })[] = (detailsJson.items ?? []).map((item) => ({
    youtubeVideoId: item.id,
    title: item.snippet?.title ?? "YouTube 360 video",
    channel: item.snippet?.channelTitle ?? "YouTube",
    thumbnail: item.snippet?.thumbnails?.high?.url ?? "",
    description: item.snippet?.description ?? "",
    embedAvailable: item.status?.embeddable !== false,
    watchUrl: `https://www.youtube.com/watch?v=${item.id}`,
    duration: isoDurationToLabel(item.contentDetails?.duration ?? ""),
  }));

  try {
    const supabase = await createServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("facility_id")
        .eq("id", user.id)
        .maybeSingle();
      await supabase.from("youtube_videos").upsert(
        items.map((item) => ({
          id: `yt-${item.youtubeVideoId}`,
          facility_id: (profile?.facility_id as string | null) ?? null,
          youtube_video_id: item.youtubeVideoId,
          title: item.title,
          channel: item.channel,
          thumbnail: item.thumbnail,
          duration: item.duration,
          category: "YouTube 360",
          destination: query,
          description: item.description.slice(0, 500),
          tags: query.toLowerCase().split(/\s+/).slice(0, 8),
          is_360: true,
          embed_available: item.embedAvailable,
          staff_approved: false,
          quality_score: item.embedAvailable ? 70 : 35,
          updated_at: new Date().toISOString(),
        })),
        { onConflict: "youtube_video_id" },
      );
    }
  } catch {
    // Catalog table may not exist until the SQL upgrade is run.
  }

  return NextResponse.json({ items });
}
