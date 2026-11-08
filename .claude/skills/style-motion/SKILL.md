---
name: style-motion
description: Make motion graphics in any visual style. Learn a style from reference images or a video, generate each scene as separate transparent layers on fal.ai (plate, hero, props, backdrop), and animate the layers in code with Remotion. Formats 9x16, 4x5, 1x1, 16x9; layouts orbit, fullbleed, stack, split. Usage /style-motion <slug | topic> [--style <name>] [--format 9x16] | /style-motion learn <name> <image|video ...>
---

# /style-motion — any reference style, animated in code

AI draws the parts; code moves them. fal.ai makes every scene as separate transparent layers in a
saved style, and a Remotion composition stacks and animates those layers with frame math. Nothing is
image-to-video, so the art stays consistent and every motion choice is editable and repeatable.

Run everything from the project root (or set `STYLE_MOTION_ROOT`):

```bash
alias sm='python .claude/skills/style-motion/scripts/style_motion.py'
sm doctor          # FAL_KEY, node, ffmpeg, Remotion, templates, every style file
```

| Command | Does |
|---|---|
| `sm styles` | list saved styles and their default layout |
| `sm learn <name> <refs...>` | new style folder from images or a video (6 frames sampled, palette measured) |
| `sm new <slug> --style S --format F --scenes N` | scaffold `<projects>/<slug>/04_data/style_motion.json` |
| `sm assets <slug> [--scene N]` | fal.ai: plate + cut-outs per scene, background removed, cached, cost-logged |
| `sm render <slug> [--still] [--layout L] [--format F] [--out name]` | QA stills or the MP4 |
| `sm cost <slug>` | fal.ai spend at live unit prices |
| `sm install` / `sm pack` | copy the Remotion templates into the Remotion project / zip the skill |

Paths: `<projects>` = `STYLE_MOTION_PROJECTS` (default `production_hub/`), Remotion project =
`STYLE_MOTION_REMOTION` (default `remotion_studio/`). Per slug: `02_assets/style_motion/` (layers),
`04_data/` (plan, cost log), `04_video/` (renders, `qa/` stills). The engine source of truth is
`templates/remotion/StyleMotion.tsx`; `install` and `render` keep the Remotion copy in sync.

## 1. Pick or learn a style

`sm styles` first. Reuse a style when the look fits; a new look becomes a new style file, never a
one-off prompt in a plan.

New style: `sm learn <name> <ref.jpg|ref.mp4 ...>`, then **look at every ref image** and rewrite the
draft `style.json` field by field with `references/style-authoring.md`: palette roles, background,
layout, ornaments, motion preset, type, `imagePrompt`, `elementPrompt` (keeps `{subject}` and "plain
pure white background"), `negative`. Delete refs that contain UI, captions or watermarks; keep 3–4
clean frames. Only use references you have the right to use.

Test before trusting it: a 1-scene plan, `sm assets <slug> --scene 1`, `sm render <slug> --still`.
If the look is off, fix the style file, not the scene.

## 2. Choose format and layout

Format follows the channel: `9x16` reels/shorts, `4x5` feed, `1x1` square, `16x9` YouTube/web.
Layout follows the content; set it per style and override per scene with `"layout"` in the plan:

| Layout | Use for | Shows |
|---|---|---|
| `orbit` | object-led stories, one metaphor per beat | circles + backdrop + hero centre + props around + ring |
| `fullbleed` | painterly or photographic styles where the composed plate is the shot | plate full frame, slow push-in, type over a paper fade |
| `stack` | lists, "3 things", tool explainers | hero on top, props in a row below |
| `split` | 16x9 explainers, talking points | text left, art right (portrait: art top, text below) |

## 3. Plan the scenes

One voice-over beat per scene, 3–5 s. `sm new <slug> --style S --format F --scenes N`, then fill each
entry: `kicker` (optional label), `headline` (2–4 words), `accent` (words in the accent colour),
`caption` (spoken line), `scene` (the whole composition, used for the plate), `hero` (specific and
drawable: "flame-striped tulip with bulb and roots", not "a tulip"), `props` (1–4, supporting the
hero's meaning), `backdrop` (optional flat backing shape), `circles` (palette roles), `layout`
(optional), and `seconds` or exact `start`/`end` from your VO timings. Set `vo` to an audio file to
include it. Test: cover the props and headline — the hero alone must still tell the beat.

## 4. Generate the layers

`sm assets <slug> --scene 1`, look at `02_assets/style_motion/s01_*.png`, then `sm assets <slug>`.
Per scene: a `plate` (composed scene in the format's aspect: the `fullbleed` background and the
balance reference elsewhere) plus `hero`, `propN`, `backdrop` as transparent PNGs
(`fal-ai/nano-banana/edit` with the style refs, then `fal-ai/birefnet`). About $0.04 per part plus
$0.04 per plate, so a 4-part scene is about $0.20. Requests are cached by model + exact input.
Check every cut-out on dark and light: no white fringe, nothing cropped. Thin light details (smoke,
roots, white petals) fail most; ask for a darker, more solid version of that subject.

## 5. Render and QA

`sm render <slug> --still` writes entry and exit frames per scene to `04_video/qa/`. Pass when the
hero reads at phone size, the headline clears the art, the caption is clear of the hero, nothing
touches the frame edge, no layer is fully hidden behind another, and the style's fonts are used.
Then `sm render <slug>` → `04_video/style_motion.mp4`. Layout and motion fixes are numbers in the
style file or the engine and cost a re-render, not new art. Report `sm cost <slug>` with the video.

## Extending the engine

New layout: add a case to `spots()` in `templates/remotion/StyleMotion.tsx` (positions in units of
`u = min(W,H)/1080` around the anchor), add the name to `LAYOUTS` in the CLI, document it above and
in `references/style-authoring.md`, then `sm install` and check all four formats with
`--still --layout <new>`. New motion preset: extend `enterXf` or the transition block, same check.
