import React from "react";
import {
  AbsoluteFill,
  Audio,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { z } from "zod";
import { zColor } from "@remotion/zod-types";
import { clampedInterpolate, enterExit } from "../lib/animation";
import { FONT_FAMILY } from "../lib/fonts";
import { SafeArea, useUnit } from "../lib/layout";
import { sec } from "../config/video";

export const titleCardSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  backgroundColor: zColor(),
  textColor: zColor(),
  accentColor: zColor(),
  playSound: z.boolean(),
});

export type TitleCardProps = z.infer<typeof titleCardSchema>;

export const titleCardDefaults: TitleCardProps = {
  title: "Title Card",
  subtitle: "A clean starting point",
  backgroundColor: "#111111",
  textColor: "#f5f5f5",
  accentColor: "#8a8a8a",
  playSound: true,
};

export const TitleCard: React.FC<TitleCardProps> = ({
  title,
  subtitle,
  backgroundColor,
  textColor,
  accentColor,
  playSound,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const u = useUnit();

  const exitFrames = sec(0.6, fps);
  const common = { frame, fps, durationInFrames, exitFrames };

  // Staggered entrances, shared exit: title -> rule -> subtitle.
  const titleIn = enterExit({ ...common, enterFrames: sec(0.8, fps) });
  const ruleIn = enterExit({ ...common, enterFrames: sec(0.8, fps), delay: sec(0.2, fps) });
  const subIn = enterExit({ ...common, enterFrames: sec(0.8, fps), delay: sec(0.35, fps) });

  // Extra drift upward during the exit so it leaves with motion, not just a fade.
  const exitDrift = clampedInterpolate(
    frame,
    [durationInFrames - exitFrames, durationInFrames - 1],
    [0, -20 * u],
  );

  return (
    <AbsoluteFill style={{ backgroundColor }}>
      <SafeArea
        style={{
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          fontFamily: FONT_FAMILY,
          color: textColor,
          transform: `translateY(${exitDrift}px)`,
        }}
      >
        <div
          style={{
            fontSize: 120 * u,
            fontWeight: 700,
            letterSpacing: -2 * u,
            lineHeight: 1.05,
            opacity: titleIn,
            transform: `translateY(${(1 - titleIn) * 40 * u}px)`,
          }}
        >
          {title}
        </div>
        <div
          style={{
            width: 160 * u,
            height: 4 * u,
            margin: `${36 * u}px 0`,
            backgroundColor: accentColor,
            transform: `scaleX(${ruleIn})`,
          }}
        />
        <div
          style={{
            fontSize: 44 * u,
            fontWeight: 400,
            opacity: subIn,
            transform: `translateY(${(1 - subIn) * 24 * u}px)`,
          }}
        >
          {subtitle}
        </div>
      </SafeArea>

      {/* Sound effect: a <Sequence> places it on the timeline (here: frame 0).
          Trim leading silence from the file so it hits on the visual. */}
      {playSound ? (
        <Sequence from={0} durationInFrames={sec(1.5, fps)} layout="none">
          <Audio src={staticFile("audio/whoosh.wav")} volume={0.6} />
        </Sequence>
      ) : null}
    </AbsoluteFill>
  );
};
