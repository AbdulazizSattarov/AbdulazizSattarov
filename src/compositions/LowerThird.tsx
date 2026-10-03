import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { zColor } from "@remotion/zod-types";
import { clampedInterpolate, enterExit } from "../lib/animation";
import { FONT_FAMILY } from "../lib/fonts";
import { SafeArea, useUnit } from "../lib/layout";
import { sec } from "../config/video";

export const lowerThirdSchema = z.object({
  name: z.string(),
  role: z.string(),
  textColor: zColor(),
  barColor: zColor(),
  accentColor: zColor(),
  // Off = transparent background; render as ProRes 4444 to overlay in an editor.
  showPreviewBackground: z.boolean(),
});

export type LowerThirdProps = z.infer<typeof lowerThirdSchema>;

export const lowerThirdDefaults: LowerThirdProps = {
  name: "Jane Doe",
  role: "Role or description",
  textColor: "#f5f5f5",
  barColor: "#1c1c1c",
  accentColor: "#9a9a9a",
  showPreviewBackground: true,
};

export const LowerThird: React.FC<LowerThirdProps> = ({
  name,
  role,
  textColor,
  barColor,
  accentColor,
  showPreviewBackground,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const u = useUnit();

  const exitFrames = sec(0.5, fps);
  const common = { frame, fps, durationInFrames, exitFrames };

  // 1) accent line, 2) bar wipes open, 3) name, 4) role.
  const accent = enterExit({ ...common, enterFrames: sec(0.5, fps) });
  const bar = enterExit({ ...common, enterFrames: sec(0.7, fps), delay: sec(0.1, fps) });
  const nameIn = enterExit({ ...common, enterFrames: sec(0.6, fps), delay: sec(0.3, fps) });
  const roleIn = enterExit({ ...common, enterFrames: sec(0.6, fps), delay: sec(0.4, fps) });

  // On exit the whole group also slides left, mirroring the entrance.
  const exitSlide = clampedInterpolate(
    frame,
    [durationInFrames - exitFrames, durationInFrames - 1],
    [0, -40 * u],
  );

  return (
    <AbsoluteFill
      style={{ backgroundColor: showPreviewBackground ? "#3a3a3a" : undefined }}
    >
      <SafeArea style={{ justifyContent: "flex-end", alignItems: "flex-start" }}>
        <div
          style={{
            display: "flex",
            transform: `translateX(${exitSlide}px)`,
            fontFamily: FONT_FAMILY,
          }}
        >
          <div
            style={{
              width: 8 * u,
              backgroundColor: accentColor,
              transform: `scaleY(${accent})`,
              transformOrigin: "bottom",
            }}
          />
          <div
            style={{
              backgroundColor: barColor,
              padding: `${22 * u}px ${36 * u}px`,
              clipPath: `inset(0 ${(1 - bar) * 100}% 0 0)`,
            }}
          >
            <div
              style={{
                color: textColor,
                fontSize: 56 * u,
                fontWeight: 600,
                lineHeight: 1.1,
                opacity: nameIn,
                transform: `translateX(${(1 - nameIn) * -30 * u}px)`,
              }}
            >
              {name}
            </div>
            <div
              style={{
                color: accentColor,
                fontSize: 32 * u,
                fontWeight: 400,
                marginTop: 6 * u,
                opacity: roleIn,
                transform: `translateX(${(1 - roleIn) * -30 * u}px)`,
              }}
            >
              {role}
            </div>
          </div>
        </div>
      </SafeArea>
    </AbsoluteFill>
  );
};
