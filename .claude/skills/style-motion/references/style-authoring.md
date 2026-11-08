# Style authoring — every field of style.json

Start from `styles/_template/style.json` (`sm learn` copies it). A style = how the art looks (prompts,
refs), how the frame is built (palette, background, layout, ornaments), how it moves (motion) and how
text reads (type). Colours anywhere in the file may be a palette role name or a hex value.

## Reading a reference

Look at 3–4 frames and answer, in words you can paste into prompts:
1. **Medium** — engraving, flat vector, gouache, risograph, clay 3D, photo collage, pixel art.
2. **Texture** — paper grain, halftone, none.
3. **Recurring shapes** — circles behind subjects, torn paper, grids, frames, orbit lines.
4. **Palette** — 4–7 colours by role (background, ink, two accents, muted, rule).
5. **Composition** — centred object, full-bleed scene, list, split.
6. **Absent** — what the style never has (gradients, shadows, people, text). Goes in `negative`.
7. **Motion** — how elements enter (rise, pop, fade, slide), whether anything moves while holding,
   how scenes change (cut, dissolve, wipe), how text appears (word by word, whole line).
8. **Type** — serif/sans/mono, case, where the headline sits, caption treatment (pill, plain italic).

## Fields

| Field | Meaning |
|---|---|
| `label`, `source` | one-line description; where the refs came from |
| `canvas.fps` | 30 default; size comes from the plan's `format` |
| `palette` | role → hex. Roles used by the engine: `paper`, `paperShade`, `ink`, `muted`, `rule`, `pill`, plus any accent names you reference |
| `background` | `{type: radial|solid, from, to}` palette roles |
| `layout` | default layout: `orbit`, `fullbleed`, `stack`, `split` (plan entries can override) |
| `defaultCircles` | palette roles for the code-drawn circles in new plans |
| `ornaments` | `circles`, `ring`, `sparkles` on/off and their `color`. Turn off what the reference lacks |
| `motion.enter` | `rise` (spring up, default), `pop` (scale), `fade`, `slide` (from left) |
| `motion.stagger` | frames between layer entrances (4–6 calm, 2–3 energetic) |
| `motion.damping` | spring damping (18 soft; 10 bouncier; 30 stiff) |
| `motion.drift` | parallax multiplier while holding (0 = still, 1 = default, 2 = lively) |
| `motion.transition` | `drift` (fade + rise), `fade`, `cut`, `wipe` |
| `motion.headline` | `word` (word by word over 60% of the beat) or `line` (all at once) |
| `motion.fade` | transition length in frames |
| `motion.rules`, `motion.avoid` | prose for humans and Claude; describe the reference's motion |
| `type.fonts` | Google Fonts specs, e.g. `"IM Fell English:ital@0;1"`; must cover every font used |
| `type.kicker` | optional small label: `font`, `size`, `tracking`, `color`, `y` |
| `type.headline` | `font`, `weight`, `size`, `tracking`, `case` (`upper`|`title`), `accentColor`, `restColor`, `accentStyle` (`italic`|`normal`), `y` |
| `type.caption` | `font`, `weight`, `style`, `size`, `color`, `background` (role or `none`), `y` |
| `imagePrompt` | the whole-scene description: medium, texture, shapes, palette, composition, "no text" |
| `elementPrompt` | one isolated part; must contain `{subject}` and "plain pure white background, no shadow" |
| `negative` | what to avoid; appended to plate prompts |

Sizes are in px at 1080 wide and scale with the format. `y` is either px on a 1920-tall frame (scaled
to the format) or a 0–1 fraction of the height.

## Checklist before first use

- `sm doctor` passes for the style.
- One-scene test matches the refs side by side; cut-outs are clean.
- Stills read at phone size in the style's main format.
- Nothing in the prompts names another creator, brand or artist.
