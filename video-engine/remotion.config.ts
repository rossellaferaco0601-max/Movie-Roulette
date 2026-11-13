import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.setConcurrency(4);
// Chromium headless in cloud/container environments
Config.setChromiumOpenGlRenderer("swangle");

// In cloud non è possibile scaricare Chrome Headless Shell: usa il Chromium di sistema se presente.
import { existsSync } from "node:fs";
const systemChromium = process.env.REMOTION_BROWSER ?? "/opt/pw-browsers/chromium";
if (existsSync(systemChromium)) {
  Config.setBrowserExecutable(systemChromium);
}
