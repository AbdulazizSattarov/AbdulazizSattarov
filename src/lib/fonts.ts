/**
 * Google Font loaded via @remotion/google-fonts. Remotion waits for it to
 * load before rendering each frame, so there's no fallback-font flash.
 *
 * To swap fonts: change the import (e.g. "@remotion/google-fonts/Roboto"),
 * and keep `weights` / `subsets` narrow so fewer files are downloaded.
 *
 * Local font instead? Put the file in public/fonts and use
 * `loadFont` from "@remotion/fonts" with `staticFile("fonts/MyFont.woff2")`.
 */
import { loadFont } from "@remotion/google-fonts/Inter";

const { fontFamily } = loadFont("normal", {
  weights: ["400", "600", "700"],
  subsets: ["latin"],
});

export const FONT_FAMILY = fontFamily;
