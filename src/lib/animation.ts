import { Easing, interpolate, spring } from "remotion";

const CLAMP = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

/**
 * Enter/exit envelope that goes 0 -> 1 -> 0 over a composition.
 *
 * - Enter: a spring that settles over `enterFrames` (no overshoot by default).
 * - Exit: an eased ramp over the final `exitFrames` that ENDS exactly on the
 *   last frame, so the graphic is fully gone before the cut.
 */
export const enterExit = ({
  frame,
  fps,
  durationInFrames,
  enterFrames,
  exitFrames,
  delay = 0,
}: {
  frame: number;
  fps: number;
  durationInFrames: number;
  enterFrames: number;
  exitFrames: number;
  delay?: number;
}) => {
  const enter = spring({
    frame: frame - delay,
    fps,
    durationInFrames: enterFrames,
    config: { damping: 200 },
  });

  const exit = interpolate(
    frame,
    [durationInFrames - exitFrames, durationInFrames - 1],
    [1, 0],
    { ...CLAMP, easing: Easing.in(Easing.cubic) },
  );

  return Math.min(enter, exit);
};

/** interpolate() with clamping on both ends — the sane default for graphics. */
export const clampedInterpolate = (
  input: number,
  inputRange: readonly number[],
  outputRange: readonly number[],
  easing: (t: number) => number = Easing.bezier(0.33, 1, 0.68, 1),
) => interpolate(input, inputRange, outputRange, { ...CLAMP, easing });
