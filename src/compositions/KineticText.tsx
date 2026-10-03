import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { z } from "zod";
import { zColor } from "@remotion/zod-types";
import { FONT_FAMILY } from "../lib/fonts";
import { SafeArea, useUnit } from "../lib/layout";
import { sec } from "../config/video";

export const kineticTextSchema = z.object({
  text: z.string(),
  backgroundColor: zColor(),
  textColor: zColor(),
  fontSize: z.number().min(20).max(300),
  staggerSeconds: z.number().min(0).max(1),
});

export type KineticTextProps = z.infer<typeof kineticTextSchema>;

export const kineticTextDefaults: KineticTextProps = {
  text: "Words arrive one at a time",
  backgroundColor: "#111111",
  textColor: "#f5f5f5",
  fontSize: 110,
  staggerSeconds: 0.12,
};

export const KineticText: React.FC<KineticTextProps> = ({
  text,
  backgroundColor,
  textColor,
  fontSize,
  staggerSeconds,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const u = useUnit();

  const words = text.split(/\s+/).filter(Boolean);
  const stagger = sec(staggerSeconds, fps);
  const enterFrames = sec(0.6, fps);
  const exitFrames = sec(0.4, fps);

  // Exits are staggered in the same order and timed so the LAST word
  // finishes on the final frame.
  const lastExitStart = durationInFrames - 1 - exitFrames;

  return (
    <AbsoluteFill style={{ backgroundColor }}>
      <SafeArea
        style={{
          justifyContent: "center",
          alignItems: "center",
          fontFamily: FONT_FAMILY,
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            columnGap: fontSize * 0.28 * u,
            color: textColor,
            fontSize: fontSize * u,
            fontWeight: 700,
            lineHeight: 1.15,
          }}
        >
          {words.map((word, i) => {
            const enter = spring({
              frame: frame - i * stagger,
              fps,
              durationInFrames: enterFrames,
              config: { damping: 200 },
            });
            const exitStart = lastExitStart - (words.length - 1 - i) * stagger;
            const exit = interpolate(
              frame,
              [exitStart, exitStart + exitFrames],
              [0, 1],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.in(Easing.cubic),
              },
            );
            return (
              // Clip each word so it rises in from / sinks out of a mask line.
              <span key={i} style={{ display: "inline-block", overflow: "hidden" }}>
                <span
                  style={{
                    display: "inline-block",
                    transform: `translateY(${(1 - enter) * 100 - exit * 100}%)`,
                    opacity: Math.min(enter, 1 - exit),
                  }}
                >
                  {word}
                </span>
              </span>
            );
          })}
        </div>
      </SafeArea>
    </AbsoluteFill>
  );
};
