import React from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { SAFE } from "../config/video";

/**
 * Design at 1920px wide, render at any size: multiply pixel values by `u`
 * (u = 1 at 1080p, 2 at 4K) so layouts scale with the canvas.
 */
export const useUnit = () => {
  const { width, height } = useVideoConfig();
  return Math.min(width / 1920, height / 1080);
};

/** Full-frame container padded to the title-safe area. */
export const SafeArea: React.FC<{
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ children, style }) => {
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill
      style={{
        padding: `${height * SAFE.title}px ${width * SAFE.title}px`,
        ...style,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
