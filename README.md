# Motion Graphics (Remotion)

A minimal, neutral starting point for designing animated graphics in React with
[Remotion](https://www.remotion.dev) and exporting them to any video editor
(Premiere, Resolve, Final Cut, After Effects…).

The look is intentionally plain (greys, Inter, simple motion) so you can take it
in your own direction.

## Setup

```bash
npm install
npm run studio      # live preview at http://localhost:3000
```

Requires Node 18+. The first render downloads a headless Chrome automatically.

## Project structure

```
remotion.config.ts        CLI/Studio render defaults
src/
  index.ts                entry point (registerRoot) – leave as is
  Root.tsx                registers every composition (id, size, fps, duration, schema, defaultProps)
  config/video.ts         ONE place for resolution + fps (presets for 4K / 60fps / vertical…)
  lib/
    animation.ts          enterExit() envelope + clampedInterpolate() helpers
    layout.tsx            <SafeArea> (title-safe padding) + useUnit() (resolution-independent sizing)
    fonts.ts              Google Font loading via @remotion/google-fonts
  compositions/           one file per graphic
    TitleCard.tsx         title + rule + subtitle, with a sound-effect example
    LowerThird.tsx        name/role bar (toggle off the preview bg for transparency)
    KineticText.tsx       word-by-word masked reveal and exit
    OverlayBadge.tsx      pill badge on a TRANSPARENT background
public/                   static assets, referenced with staticFile("…")
  fonts/  images/  audio/
out/                      renders (git-ignored)
scripts/make-whoosh.mjs   regenerates the placeholder whoosh.wav
```

## Preview

```bash
npm run studio
```

Pick a composition in the sidebar. Every prop in its zod schema shows up in the
right-hand **Props** panel – edit text, colours and numbers live. Click
**Save** in that panel to write the values back into `defaultProps` in code.

## Canvas: resolution and fps

Edit `src/config/video.ts`:

```ts
export const PRESET: keyof typeof PRESETS = "hd30"; // -> "uhd60" for 4K @ 60fps
```

Everything else adapts automatically:

- Durations are written in **seconds** with `sec(4)`, so they stay the same
  length at 30 or 60 fps.
- Sizes are written for a 1920-wide canvas and multiplied by `u` from
  `useUnit()`, so a 4K render is a sharp 2x version, not a tiny graphic in a
  big frame.

To override a single render without editing code, add `--width`, `--height`
or `--fps` to the render command (or `--scale=2` for a quick 4K of a 1080p comp).

## Add a new graphic

1. **Create the component** – `src/compositions/MyGraphic.tsx`:

   ```tsx
   import React from "react";
   import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
   import { z } from "zod";
   import { zColor } from "@remotion/zod-types";
   import { enterExit } from "../lib/animation";
   import { SafeArea, useUnit } from "../lib/layout";
   import { FONT_FAMILY } from "../lib/fonts";
   import { sec } from "../config/video";

   export const myGraphicSchema = z.object({
     text: z.string(),
     color: zColor(),
   });
   export type MyGraphicProps = z.infer<typeof myGraphicSchema>;
   export const myGraphicDefaults: MyGraphicProps = { text: "Hello", color: "#ffffff" };

   export const MyGraphic: React.FC<MyGraphicProps> = ({ text, color }) => {
     const frame = useCurrentFrame();
     const { fps, durationInFrames } = useVideoConfig();
     const u = useUnit();
     const progress = enterExit({
       frame, fps, durationInFrames,
       enterFrames: sec(0.6, fps),
       exitFrames: sec(0.5, fps),
     });
     return (
       <AbsoluteFill>
         <SafeArea style={{ justifyContent: "center", alignItems: "center" }}>
           <div style={{ fontFamily: FONT_FAMILY, fontSize: 96 * u, color, opacity: progress }}>
             {text}
           </div>
         </SafeArea>
       </AbsoluteFill>
     );
   };
   ```

2. **Register it in `src/Root.tsx`**:

   ```tsx
   <Composition
     id="MyGraphic"                 // used by the Studio and `npx remotion render MyGraphic`
     component={MyGraphic}
     {...VIDEO}                     // width, height, fps from config/video.ts
     durationInFrames={sec(4)}      // or override: fps={60} width={3840} height={2160}
     schema={myGraphicSchema}       // enables live prop editing
     defaultProps={myGraphicDefaults}
   />
   ```

   For a transparent export, use the ProRes 4444 command below.

3. Refresh the Studio – it appears in the sidebar.

## Render / export

Replace `<id>` with a composition id (`TitleCard`, `LowerThird`, `KineticText`,
`OverlayBadge`). You can also render from the Studio's **Render** button. For transparency, pick
codec **ProRes**, profile **4444**, pixel format **yuva444p10le** and image
format **PNG** in its dialog.

**MP4 (H.264, high quality – no transparency):**

```bash
npx remotion render <id> out/<id>.mp4 --codec=h264 --crf=18
```

**Transparent – ProRes 4444 with alpha** (drop straight onto a track above
your footage):

```bash
npx remotion render <id> out/<id>.mov --codec=prores \
  --prores-profile=4444 --pixel-format=yuva444p10le --image-format=png
```

**PNG sequence (with alpha):**

```bash
npx remotion render <id> out/<id> --sequence --image-format=png \
  --image-sequence-pattern="frame-[frame].[ext]"
```

> Remotion 4 doesn't accept an ffmpeg-style `out/<id>/frame-%04d.png` path – use
> `--sequence` with an output folder, and `--image-sequence-pattern` to name the
> files (`[frame]` = frame number, `[ext]` = png).

Other useful flags: `--props='{"title":"Hello"}'` (or `--props=props.json`) to
override props per render, `--frames=0-59` to render a range, `--scale=2`
to upscale, `--muted` to drop audio.

### Transparency checklist

- Don't paint a background in the composition (no `backgroundColor` on the
  root `AbsoluteFill`). The Studio shows a checkerboard where it's transparent.
- Use ProRes 4444 + `yuva444p10le` + `--image-format=png` (or a PNG sequence).
  H.264/MP4 **cannot** carry alpha.
- `LowerThird` previews on a grey card; turn off `showPreviewBackground` in the
  Props panel (or with `--props='{"showPreviewBackground":false}'`) before a
  transparent render.

## Fonts

`src/lib/fonts.ts` loads **Inter** from Google Fonts via `@remotion/google-fonts`.
Swap the import for any other family (`@remotion/google-fonts/Roboto`, …) and
keep `weights`/`subsets` to what you use. Remotion waits for the font before
rendering, so frames never show a fallback font.

## Sound effects

See `TitleCard.tsx`. Put the file in `public/audio/` and place it on the timeline
with a `<Sequence>`:

```tsx
import { Audio, Sequence, staticFile } from "remotion";

<Sequence from={sec(0.2)} durationInFrames={sec(1.5)} layout="none">
  <Audio src={staticFile("audio/whoosh.wav")} volume={0.6} />
</Sequence>
```

`from` is when the sound starts. `public/audio/whoosh.wav` is a synthesized
placeholder (`node scripts/make-whoosh.mjs` regenerates it) – replace it with your
own. Audio is included in MP4/MOV renders; for PNG sequences, export it separately
with `npx remotion render <id> out/<id>.wav --codec=wav`.

## Tips

- **Keep text in the title-safe area.** Wrap layouts in `<SafeArea>` (10% inset
  per side, from `SAFE.title` in `config/video.ts`) so nothing gets cropped on
  TVs, social crops or in an editor's safe guides.
- **Always give animations a full enter AND exit.** Every element should be
  fully off/invisible on the first and last frame so the graphic never pops
  on or gets cut mid-move. `enterExit()` ends the exit exactly on the last
  frame; scrub to frame 0 and the final frame in the Studio to check.
- **Clamp your interpolations** (`extrapolateLeft/Right: "clamp"`), or values
  keep moving past your keyframes. `clampedInterpolate()` does this for you.
- **Trim leading silence on sound effects** so the hit lines up with the visual
  on the frame you place it, and keep a short tail so it doesn't click off.
- **Animate with `useCurrentFrame()` only** – no CSS transitions,
  `setTimeout` or `Date.now()`; renders happen frame-by-frame in parallel.
- **Use `spring()` for organic entrances** (`damping: 200` = no bounce, lower =
  bouncier) and `Easing` curves for exits and precise timing.
- **Edit the duration in your editor, not here?** Render a little longer than you
  need: the graphic holds between enter and exit, so you can trim the hold.

## Useful commands

| Command | What it does |
| --- | --- |
| `npm run studio` | Live preview + prop editing |
| `npx remotion compositions` | List composition ids |
| `npx remotion still <id> out/<id>.png --frame=30` | Export a single frame |
| `npm run typecheck` | TypeScript check |
| `npx remotion upgrade` | Upgrade all Remotion packages together |
