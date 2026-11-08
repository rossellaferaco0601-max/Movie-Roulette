// Generic style-locked motion graphics. Source of truth: .claude/skills/style-motion/templates/remotion/
// (`style_motion.py install` copies it into remotion_studio/src). Props come from `style_motion.py render`.
//
// A scene is a stack of layers made by fal.ai (plate, backdrop, hero, props) plus code-drawn ornaments and type.
// Everything visual is driven by the style file: palette, background, layout, ornaments, motion preset, type.
// Layouts: orbit | fullbleed | stack | split. Formats: any canvas; geometry scales with u = min(W, H) / 1080.
import React from "react";
import {
  AbsoluteFill, Audio, Composition, Img, Sequence, continueRender, delayRender, interpolate, spring, staticFile,
  useCurrentFrame, useVideoConfig,
} from "remotion";

type Layout = "orbit" | "fullbleed" | "stack" | "split";
type Scene = {
  id: number; from: number; frames: number; layout?: Layout; kicker?: string; headline: string; accent?: string[];
  caption: string; circles?: string[]; layers: Record<string, string>;
};
type TypeSpec = Record<string, any>;
export type Style = {
  canvas: {width: number; height: number; fps: number};
  palette: Record<string, string>;
  background?: {type: "radial" | "solid" | "plate"; from?: string; to?: string};
  layout?: Layout;
  ornaments?: {circles?: boolean; ring?: boolean; sparkles?: boolean; color?: string};
  motion?: {enter?: "rise" | "pop" | "fade" | "slide"; stagger?: number; damping?: number; drift?: number;
    transition?: "drift" | "fade" | "cut" | "wipe"; headline?: "word" | "line"; fade?: number};
  type: {headline: TypeSpec; caption: TypeSpec; kicker?: TypeSpec; fonts?: string[]};
};
export type StyleMotionProps = {style: Style; scenes: Scene[]; audio: string | null};

const clamp = {extrapolateLeft: "clamp", extrapolateRight: "clamp"} as const;
const col = (P: Record<string, string>, k?: string, fb = "#000") => (k ? P[k] ?? k : fb);

const Sparkle: React.FC<{x: number; y: number; s: number; phase: number; color: string}> = ({x, y, s, phase, color}) => {
  const f = useCurrentFrame();
  const k = 0.6 + 0.5 * (0.5 + 0.5 * Math.sin(f / 9 + phase));
  return (
    <svg style={{position: "absolute", left: x - s, top: y - s, opacity: k}} width={s * 2} height={s * 2} viewBox="-10 -10 20 20">
      <path d="M0 -10 L2 -2 L10 0 L2 2 L0 10 L-2 2 L-10 0 L-2 -2 Z" fill={color} transform={`scale(${k})`} />
    </svg>
  );
};

// Layer placement per layout, in units of u around the scene anchor (cx, cy). w = width in u.
type Spot = {x: number; y: number; w: number; drift: number; grow?: number};
const spots = (layout: Layout, portrait: boolean, nProps: number) => {
  if (layout === "stack") {
    const row = Array.from({length: nProps}, (_, i): Spot => ({x: (i - (nProps - 1) / 2) * 300, y: 360, w: 260, drift: i % 2 ? 1 : -1}));
    const row2 = row.map((r) => ({...r, x: r.x * 0.8, y: 290, w: 210}));
    return {hero: {x: 0, y: -40, w: 500, drift: 0.2, grow: 0.03} as Spot, backdrop: {x: 0, y: -30, w: 640, drift: -0.4} as Spot, props: row2};
  }
  if (layout === "split") {
    const hx = portrait ? 0 : 230, hy = portrait ? -200 : 0;
    return {hero: {x: hx, y: hy, w: 760, drift: 0.3, grow: 0.04} as Spot, backdrop: {x: hx + 40, y: hy + 40, w: 900, drift: -0.5} as Spot,
      props: [{x: hx - 280, y: hy + 260, w: 330, drift: -1}, {x: hx + 300, y: hy - 260, w: 330, drift: 1}] as Spot[]};
  }
  // orbit (default) and fullbleed share the centered collage geometry
  return {hero: {x: 0, y: 0, w: 920, drift: 0.3, grow: 0.04} as Spot, backdrop: {x: 40, y: 60, w: 1000, drift: -0.5} as Spot,
    props: [{x: -300, y: -330, w: 480, drift: -1}, {x: 300, y: 330, w: 480, drift: 1}, {x: -320, y: 300, w: 420, drift: 1}, {x: 320, y: -300, w: 420, drift: -1}] as Spot[]};
};

const SceneView: React.FC<{sc: Scene; style: Style; fade: number}> = ({sc, style, fade}) => {
  const f = useCurrentFrame();
  const {fps, width: W, height: H} = useVideoConfig();
  const P = style.palette;
  const M = {enter: "rise", stagger: 5, damping: 18, drift: 1, transition: "drift", headline: "word", ...style.motion};
  const O = {circles: true, ring: true, sparkles: true, color: "gold", ...style.ornaments};
  const layout: Layout = sc.layout ?? style.layout ?? "orbit";
  const u = Math.min(W, H) / 1080;
  const portrait = H >= W;
  const textLeft = layout === "split" && !portrait;
  const cx = W / 2, cy = layout === "split" && portrait ? H * 0.52 : H * 0.5;
  const life = f / sc.frames;
  const enter = (i: number) => spring({frame: f - i * M.stagger, fps, config: {damping: M.damping, mass: 0.8}});
  const out = interpolate(f, [sc.frames - fade, sc.frames], [0, 1], clamp);
  const inn = M.transition === "cut" ? 1 : interpolate(f, [0, fade], [0, 1], clamp);
  const orn = col(P, O.color, "#C9A043");

  const enterXf = (e: number) => M.enter === "pop" ? `scale(${0.6 + 0.4 * e})`
    : M.enter === "slide" ? `translateX(${(1 - e) * -120 * u}px)`
    : M.enter === "fade" ? "" : `translateY(${(1 - e) * 40 * u}px) scale(${0.94 + 0.06 * e})`;

  const layer = (src: string | undefined, i: number, s: Spot) => {
    if (!src) return null;
    const e = enter(i), w = s.w * u, d = s.drift * M.drift;
    return (
      <Img key={src} src={staticFile(src)} style={{
        position: "absolute", width: w, left: cx + s.x * u - w / 2, top: cy + s.y * u - w / 2, opacity: e,
        transform: `translate(${d * life * 14 * u}px, ${-d * life * 8 * u}px) ${enterXf(e)} scale(${1 + (s.grow ?? 0) * life})`,
      }} />
    );
  };

  const props = Object.keys(sc.layers).filter((k) => k.startsWith("prop")).sort();
  const g = spots(layout, portrait, props.length);
  const R = 430 * u * (g.hero.w / 920);

  // scene-level transition
  const wrap: React.CSSProperties = M.transition === "wipe"
    ? {clipPath: `inset(0 ${out * 100}% 0 0)`}
    : {opacity: M.transition === "cut" ? 1 : inn * (1 - out), transform: M.transition === "drift" ? `translateY(${-30 * out * u}px)` : undefined};

  // type
  const T = style.type, Hd = T.headline, C = T.caption, K = T.kicker;
  const sz = (v: number) => v * u;
  const ty = (v: number) => (v <= 1 ? v * H : v * (H / 1920));
  const words = sc.headline.split(" ");
  const accent = new Set((sc.accent ?? []).map((w) => w.toUpperCase().replace(/[^A-Z0-9]/g, "")));
  const textBox: React.CSSProperties = textLeft
    ? {position: "absolute", left: 110 * u, width: W * 0.42, textAlign: "left"}
    : {position: "absolute", left: 0, width: "100%", textAlign: "center", padding: `0 ${80 * u}px`, boxSizing: "border-box"};
  const headTop = textLeft ? H * 0.34 : ty(Hd.y ?? 150);
  const capTop = textLeft ? H * 0.34 + sz(Hd.size ?? 64) * 2.6 : ty(C.y ?? 1640);
  const kTop = textLeft ? H * 0.34 - sz(K?.size ?? 30) * 2.2 : ty(K?.y ?? 110);

  return (
    <AbsoluteFill style={wrap}>
      {layout === "fullbleed" && sc.layers.plate && (
        <>
          <Img src={staticFile(sc.layers.plate)} style={{position: "absolute", inset: 0, width: W, height: H, objectFit: "cover",
            transform: `scale(${1.02 + 0.06 * life}) translateY(${-10 * life * u}px)`}} />
          <AbsoluteFill style={{background: `linear-gradient(to bottom, ${col(P, "paper")}EE 0%, transparent 22%, transparent 70%, ${col(P, "paper")}F2 92%)`}} />
        </>
      )}
      {layout !== "fullbleed" && O.circles && (sc.circles ?? ["green", "gold"]).map((c, i) => {
        const k = g.hero.w / 920;  // circles follow the hero's size so every layout keeps the same proportions
        const e = enter(i), r = (i === 0 ? 330 : 120) * u * k;
        const [ox, oy] = (i === 0 ? [-40, 20] : [250, -280]).map((v) => v * u * k);
        const ax = cx + g.hero.x * u, ay = cy + g.hero.y * u;
        return <div key={i} style={{position: "absolute", left: ax + ox - r, top: ay + oy - r, width: r * 2, height: r * 2,
          borderRadius: "50%", background: col(P, c), transform: `scale(${e}) rotate(${3 * life}deg)`, opacity: 0.95}} />;
      })}
      {layout !== "fullbleed" && layer(sc.layers.backdrop, 1, g.backdrop)}
      {layout !== "fullbleed" && O.ring && (
        <svg style={{position: "absolute", inset: 0}} width={W} height={H}>
          <circle cx={cx + g.hero.x * u} cy={cy + g.hero.y * u} r={R} fill="none" stroke={orn} strokeWidth={2} strokeDasharray={2 * Math.PI * R}
            strokeDashoffset={2 * Math.PI * R * (1 - interpolate(f, [6, 30], [0, 1], clamp))} />
          {[0, 1].map((i) => {
            const a = f / 40 + i * Math.PI;
            return <circle key={i} cx={cx + g.hero.x * u + R * Math.cos(a)} cy={cy + g.hero.y * u + R * Math.sin(a)} r={(i ? 9 : 14) * u} fill={orn} opacity={enter(3)} />;
          })}
        </svg>
      )}
      {layout !== "fullbleed" && layer(sc.layers.hero, 2, g.hero)}
      {layout !== "fullbleed" && props.map((k, i) => layer(sc.layers[k], 3 + i, g.props[i % g.props.length]))}
      {O.sparkles && [[0.14, 0.27, 18], [0.86, 0.36, 14], [0.19, 0.74, 12], [0.81, 0.68, 20], [0.52, 0.22, 10]].map(([x, y, s], i) =>
        <Sparkle key={i} x={x * W} y={y * H} s={s * u} phase={i * 1.7} color={orn} />)}

      {sc.kicker && K && (
        <div style={{...textBox, top: kTop, display: "flex", justifyContent: textLeft ? "flex-start" : "center", alignItems: "center",
          gap: 22 * u, opacity: enter(0), fontFamily: `'${K.font}', serif`, fontSize: sz(K.size), letterSpacing: K.tracking, color: col(P, K.color)}}>
          {!textLeft && <span style={{width: 70 * u * enter(1), height: 1.5, background: col(P, "rule", orn)}} />}{sc.kicker}
          <span style={{width: 70 * u * enter(1), height: 1.5, background: col(P, "rule", orn)}} />
        </div>
      )}
      <div style={{...textBox, top: headTop, fontFamily: `'${Hd.font}', serif`, fontWeight: Hd.weight, fontSize: sz(Hd.size),
        letterSpacing: Hd.tracking, lineHeight: 1.15}}>
        {words.map((w, i) => {
          const at = M.headline === "line" ? 0 : (i * sc.frames * 0.6) / words.length;
          const t = interpolate(f, [at, at + 6], [0, 1], clamp);
          const acc = accent.has(w.toUpperCase().replace(/[^A-Z0-9]/g, ""));
          return <span key={i} style={{opacity: t, display: "inline-block", transform: `translateY(${(1 - t) * 14 * u}px)`,
            fontStyle: acc && Hd.accentStyle === "italic" ? "italic" : "normal", color: col(P, acc ? Hd.accentColor : Hd.restColor)}}>
            {Hd.case === "upper" ? w.toUpperCase() : w}&nbsp;</span>;
        })}
      </div>
      <div style={{...textBox, top: capTop, display: "flex", justifyContent: textLeft ? "flex-start" : "center", opacity: enter(2)}}>
        <span style={{background: C.background && C.background !== "none" ? col(P, C.background) : "transparent", color: col(P, C.color),
          fontFamily: `'${C.font}', sans-serif`, fontWeight: C.weight, fontStyle: C.style ?? "normal", fontSize: sz(C.size),
          padding: `${10 * u}px ${22 * u}px`, borderRadius: 10 * u, maxWidth: textLeft ? "100%" : 860 * u}}>{sc.caption}</span>
      </div>
    </AbsoluteFill>
  );
};

// Load the Google Fonts stylesheet, then hold rendering until the faces are ready, so stills never use fallbacks.
const fontsUrl = (fonts: string[]) =>
  `https://fonts.googleapis.com/css2?${fonts.map((f) => "family=" + f.replace(/ /g, "+")).join("&")}&display=block`;
const useFonts = (fonts: string[]) => {
  const [handle] = React.useState(() => delayRender("web fonts"));
  React.useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet"; link.href = fontsUrl(fonts);
    const done = () => {
      const fams = fonts.map((f) => f.split(":")[0]);
      Promise.all(fams.flatMap((fam) => ["400", "700", "italic 400"].map((w) => document.fonts.load(`${w} 40px '${fam}'`).catch(() => null))))
        .then(() => document.fonts.ready).then(() => continueRender(handle));
    };
    link.onload = done; link.onerror = () => continueRender(handle);
    document.head.appendChild(link);
  }, [fonts, handle]);
};

export const StyleMotion: React.FC<StyleMotionProps> = ({style, scenes, audio}) => {
  const fade = style.motion?.fade ?? 8;
  const P = style.palette, B = style.background ?? {type: "radial"};
  const bg = B.type === "solid" ? col(P, B.from ?? "paper")
    : `radial-gradient(ellipse at 50% 45%, ${col(P, B.from ?? "paper")}, ${col(P, B.to ?? "paperShade", col(P, "paper"))})`;
  const fonts = style.type.fonts ?? [`${style.type.headline.font}:wght@400;700`, `${style.type.caption.font}:wght@500`];
  const fontKey = React.useMemo(() => fonts, [fonts.join("|")]);
  useFonts(fontKey);
  return (
    <AbsoluteFill style={{background: bg}}>
      {scenes.map((sc) => (
        <Sequence key={sc.id} from={sc.from} durationInFrames={sc.frames + fade}>
          <SceneView sc={{...sc, frames: sc.frames + fade}} style={style} fade={fade} />
        </Sequence>
      ))}
      {audio && <Audio src={staticFile(audio)} />}
    </AbsoluteFill>
  );
};

const demo = {style: {canvas: {width: 1080, height: 1920, fps: 30}, palette: {}, type: {headline: {}, caption: {}}}, scenes: [], audio: null} as unknown as StyleMotionProps;

export const StyleMotionRoot: React.FC = () => (
  <Composition id="StyleMotion" component={StyleMotion} width={1080} height={1920} fps={30} durationInFrames={30} defaultProps={demo}
    calculateMetadata={({props}) => {
      const last = props.scenes[props.scenes.length - 1];
      const fade = props.style.motion?.fade ?? 8;
      return {durationInFrames: last ? last.from + last.frames + fade : 30, fps: props.style.canvas.fps,
        width: props.style.canvas.width, height: props.style.canvas.height};
    }} />
);
