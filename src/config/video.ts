/**
 * Shared canvas settings — the ONE place to change resolution and frame rate.
 *
 * Switch to 4K / 60fps by changing PRESET below (or add your own preset).
 * Every composition registered in Root.tsx spreads `VIDEO` and measures time
 * in seconds via `sec()`, so durations stay correct at any fps.
 */

export const PRESETS = {
  hd30: { width: 1920, height: 1080, fps: 30 },
  hd60: { width: 1920, height: 1080, fps: 60 },
  uhd30: { width: 3840, height: 2160, fps: 30 },
  uhd60: { width: 3840, height: 2160, fps: 60 },
  vertical30: { width: 1080, height: 1920, fps: 30 },
  square30: { width: 1080, height: 1080, fps: 30 },
} as const;

export const PRESET: keyof typeof PRESETS = "hd30";

export const VIDEO = PRESETS[PRESET];

/** Seconds -> frames at the project fps (rounded to whole frames). */
export const sec = (seconds: number, fps: number = VIDEO.fps) =>
  Math.round(seconds * fps);

/**
 * Title-safe area: keep text inside this inset (10% per side is the
 * traditional broadcast title-safe; action-safe is 5%).
 */
export const SAFE = {
  title: 0.1,
  action: 0.05,
};
