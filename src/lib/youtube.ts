export function extractYoutubeVideoId(input: string): string | null {
  if (!input) return null;
  const url = input.trim();
  if (!url) return null;

  try {
    let targetUrl = url;
    // Check if input is an iframe string
    const iframeMatch = url.match(/<iframe.*?src=["'](.*?)["']/i);
    if (iframeMatch && iframeMatch[1]) {
      targetUrl = iframeMatch[1];
    }

    const parsedUrl = new URL(targetUrl);
    const hostname = parsedUrl.hostname.replace(/^www\./, "").replace(/^m\./, "");
    const parts = parsedUrl.pathname.split("/").filter(Boolean);

    let videoId: string | null = null;
    if (hostname === "youtu.be") {
      videoId = parts[0] || null;
    } else if (hostname === "youtube.com" || hostname === "youtube-nocookie.com") {
      if (parts[0] === "watch") videoId = parsedUrl.searchParams.get("v");
      else if (parts[0] === "embed") videoId = parts[1] || null;
      else if (parts[0] === "shorts") videoId = parts[1] || null;
      else if (parts[0] === "live") videoId = parts[1] || null;
    }

    if (videoId) {
      // Strip out query params from videoId if any sneak in (though parsedUrl handles most)
      videoId = videoId.split("?")[0].split("&")[0];
    }

    return videoId || null;
  } catch {
    return null;
  }
}

export function normalizeYoutubeUrl(input: string): string | null {
  const videoId = extractYoutubeVideoId(input);
  if (!videoId) return null;
  return `https://www.youtube.com/embed/${videoId}`;
}

export function getYoutubeEmbedUrl(rawUrl: string): string {
  const normalized = normalizeYoutubeUrl(rawUrl);
  return normalized || rawUrl;
}
