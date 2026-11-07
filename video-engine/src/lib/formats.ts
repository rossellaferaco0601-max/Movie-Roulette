/** Formati standard per reel e video social. */
export const FORMATS = {
  reel: { width: 1080, height: 1920, fps: 30 }, // Instagram Reels / TikTok / Shorts
  square: { width: 1080, height: 1080, fps: 30 },
  landscape: { width: 1920, height: 1080, fps: 30 },
  cinema: { width: 3840, height: 1608, fps: 24 }, // 2.39:1
} as const;

export const seconds = (s: number, fps: number) => Math.round(s * fps);
