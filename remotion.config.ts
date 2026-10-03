// CLI / Studio render defaults. Per-composition overrides (e.g. the
// transparent overlay's ProRes 4444 settings) live in src/Root.tsx.
// Docs: https://www.remotion.dev/docs/config
import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
