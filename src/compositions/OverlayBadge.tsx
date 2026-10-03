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

export const overlayBadgeSchema = z.object({
  label: z.string(),
  badgeColor: zColor(),
  textColor: zColor(),
  dotColor: zColor(),
  position: z.enum(["top-left", "top-right", "bottom-left", "bottom-right"]),
});

export type OverlayBadgeProps = z.infer<typeof overlayBadgeSchema>;

export const overlayBadgeDefaults: OverlayBadgeProps = {
  label: "Badge",
  badgeColor: "#1c1c1c",
  textColor: "#f5f5f5",
  dotColor: "#d0d0d0",
  position: "top-right",
};

/**
 * NO background is painted anywhere in this composition, so the alpha
 * channel is preserved when rendered as ProRes 4444 / PNG.
 * (The Studio shows a checkerboard behind transparent areas.)
 */
export const OverlayBadge: React.FC<OverlayBadgeProps> = ({
  label,
  badgeColor,
  textColor,
  dotColor,
  position,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const u = useUnit();

  const enter = spring({
    frame,
    fps,
    durationInFrames: sec(0.7, fps),
    config: { damping: 14, mass: 0.6 }, // slight overshoot = "pop"
  });
  const exitFrames = sec(0.4, fps);
  const exit = interpolate(
    frame,
    [durationInFrames - exitFrames, durationInFrames - 1],
    [1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.in(Easing.back(1.5)),
    },
  );
  const scale = enter * exit;
  const opacity = Math.min(enter, Math.max(exit, 0));

  // Label slides out from behind the dot after the badge lands.
  const labelIn = spring({
    frame: frame - sec(0.25, fps),
    fps,
    durationInFrames: sec(0.5, fps),
    config: { damping: 200 },
  });

  // Gentle pulse on the dot while on screen.
  const pulse = 0.65 + 0.35 * Math.cos((frame / fps) * Math.PI * 2);

  const [vertical, horizontal] = position.split("-");

  return (
    <AbsoluteFill>
      <SafeArea
        style={{
          justifyContent: vertical === "top" ? "flex-start" : "flex-end",
          alignItems: horizontal === "left" ? "flex-start" : "flex-end",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16 * u,
            padding: `${16 * u}px ${28 * u}px`,
            borderRadius: 999,
            backgroundColor: badgeColor,
            fontFamily: FONT_FAMILY,
            transform: `scale(${scale})`,
            transformOrigin: `${vertical} ${horizontal}`,
            opacity,
          }}
        >
          <div
            style={{
              width: 18 * u,
              height: 18 * u,
              borderRadius: "50%",
              backgroundColor: dotColor,
              opacity: pulse,
            }}
          />
          <div
            style={{
              color: textColor,
              fontSize: 36 * u,
              fontWeight: 600,
              letterSpacing: 2 * u,
              textTransform: "uppercase",
              opacity: labelIn,
              transform: `translateX(${(1 - labelIn) * -12 * u}px)`,
            }}
          >
            {label}
          </div>
        </div>
      </SafeArea>
    </AbsoluteFill>
  );
};
