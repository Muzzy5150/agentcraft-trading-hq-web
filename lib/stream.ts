export function streamConfig(env: Record<string, string | undefined>) {
  const provider = env.STREAM_PROVIDER;
  if (provider === "youtube" && /^[\w-]{11}$/.test(env.STREAM_VIDEO_ID || ""))
    return {
      configured: true,
      provider,
      url: `https://www.youtube-nocookie.com/embed/${env.STREAM_VIDEO_ID}?autoplay=0`,
      status: "UNKNOWN",
    };
  if (
    provider === "twitch" &&
    /^\w{1,25}$/.test(env.STREAM_CHANNEL || "") &&
    /^[a-z0-9.-]+$/.test(env.TWITCH_PARENT || "")
  )
    return {
      configured: true,
      provider,
      url: `https://player.twitch.tv/?channel=${env.STREAM_CHANNEL}&parent=${env.TWITCH_PARENT}&autoplay=false`,
      status: "UNKNOWN",
    };
  return { configured: false, provider: "none", url: null, status: "OFFLINE" };
}
