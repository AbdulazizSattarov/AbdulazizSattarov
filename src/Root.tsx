import React from "react";
import { Composition, Folder } from "remotion";
import { VIDEO, sec } from "./config/video";
import {
  TitleCard,
  titleCardDefaults,
  titleCardSchema,
} from "./compositions/TitleCard";
import {
  LowerThird,
  lowerThirdDefaults,
  lowerThirdSchema,
} from "./compositions/LowerThird";
import {
  KineticText,
  kineticTextDefaults,
  kineticTextSchema,
} from "./compositions/KineticText";
import {
  OverlayBadge,
  overlayBadgeDefaults,
  overlayBadgeSchema,
} from "./compositions/OverlayBadge";

/**
 * Register every graphic here. Each <Composition> needs:
 *   id               -> used in the Studio sidebar and `npx remotion render <id>`
 *   component        -> the React component in src/compositions/
 *   ...VIDEO         -> width / height / fps from src/config/video.ts
 *   durationInFrames -> use sec() so it stays correct at any fps
 *   schema           -> zod schema (enables live prop editing in the Studio)
 *   defaultProps     -> starting values for the schema
 */

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Folder name="Graphics">
        <Composition
          id="TitleCard"
          component={TitleCard}
          {...VIDEO}
          durationInFrames={sec(4)}
          schema={titleCardSchema}
          defaultProps={titleCardDefaults}
        />
        <Composition
          id="KineticText"
          component={KineticText}
          {...VIDEO}
          durationInFrames={sec(4)}
          schema={kineticTextSchema}
          defaultProps={kineticTextDefaults}
        />
      </Folder>

      <Folder name="Overlays">
        <Composition
          id="LowerThird"
          component={LowerThird}
          {...VIDEO}
          durationInFrames={sec(5)}
          schema={lowerThirdSchema}
          defaultProps={lowerThirdDefaults}
        />
        <Composition
          id="OverlayBadge"
          component={OverlayBadge}
          {...VIDEO}
          durationInFrames={sec(3)}
          schema={overlayBadgeSchema}
          defaultProps={overlayBadgeDefaults}
        />
      </Folder>
    </>
  );
};
