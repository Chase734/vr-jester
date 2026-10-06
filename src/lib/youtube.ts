export type YoutubeHit = {
  youtubeVideoId: string;
  title: string;
  channel: string;
  thumbnail: string;
  description: string;
  embedAvailable: boolean;
  watchUrl: string;
};

export function youtubeWatchUrl(query: string, videoId?: string) {
  if (videoId) {
    return `https://www.youtube.com/watch?v=${videoId}`;
  }
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
}

export function youtubeEmbedUrl(videoId: string) {
  return `https://www.youtube.com/embed/${videoId}?rel=0`;
}
