// Slide del carosello 1080x1350
import React from 'react';
import { AbsoluteFill, Audio, Img, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { logoUrl, pal, parseEmph, TITLE_FONTS, useFonts } from './lib';

export type SlideProps = { assetBase: string; brand: any; style: any; slide: any; index: number; total: number; format?: string; animate?: { mode: string; durationSec?: number; music?: string } };
// ---- animazione dei caroselli (slide video) ----
export const SLIDE_ANIMS: Record<string, [string, string]> = {
  none: ['Nessuna', 'Slide ferma (immagine).'],
  morbido: ['Entrata morbida', 'Il contenuto sale e compare dolcemente.'],
  parole: ['Parola per parola', 'Il titolo compare una parola alla volta.'],
  scrivi: ['Macchina da scrivere', 'Il testo si scrive lettera per lettera.'],
  pop: ['Pop', 'Il contenuto entra con un rimbalzo.'],
  scorri: ['Scorrimento', 'Il contenuto entra da destra, come uno swipe.'],
  zoom: ['Zoom lento', 'Lo sfondo si avvicina piano, il testo compare in dissolvenza.'],
};
const AnimCtx = React.createContext<{ mode: string; frame: number; fps: number; speed?: number; bg?: string; emph?: string; emphAnim?: boolean; arrow?: boolean; ctaPulse?: boolean }>({ mode: 'none', frame: 0, fps: 30 });
const useAnim = () => React.useContext(AnimCtx);
// scaglionamento per elenchi ed elementi
const Stag: React.FC<{ i: number; children: React.ReactNode; style?: React.CSSProperties; pt?: any }> = ({ i, children, style, pt }) => {
  const a = useAnim();
  const P0 = pt ? pt('voce' + (i + 1), style || {}) : { style };
  if (a.mode === 'none') return <div {...P0}>{children}</div>;
  const sp = spring({ frame: (a.frame - 12 - i * 7) * (a.speed || 1), fps: a.fps, config: { damping: 16 } });
  return <div {...P0} style={{ ...P0.style, opacity: sp, transform: `${P0.style?.transform || ''} translateX(${(1 - sp) * 60}px)` }}>{children}</div>;
};
export const FORMATS: Record<string, { w: number; h: number; name: string }> = { '4:5': { w: 1080, h: 1350, name: 'Verticale 4:5 (feed)' }, '1:1': { w: 1080, h: 1080, name: 'Quadrato 1:1' }, '9:16': { w: 1080, h: 1920, name: 'Storia / copertina 9:16' } };

export const SLIDE_TEMPLATES: Record<string, string> = {
  cover: 'Copertina',
  punto: 'Punto numerato',
  lista: 'Lista / checklist',
  citazione: 'Citazione',
  dato: 'Numero grande',
  mitoverita: 'Mito vs Verità',
  foto: 'Foto + testo',
  cta: 'Call to action',
  domanda: 'Domanda / gancio',
  passi: 'Passaggi 1-2-3',
  testo: 'Testo lungo (racconto)',
  primadopo: 'Prima / dopo',
  copertina: 'Copertina reel (foto + titolo)',
  s_intro: 'Storia · apertura (etichetta + frase)',
  s_testo: 'Storia · testo grande',
  s_domanda: 'Storia · box domande',
  s_sondaggio: 'Storia · sondaggio',
  s_proof: 'Storia · risultato / prova',
  s_lista: 'Storia · passaggi',
  s_cta: 'Storia · invito in DM',
};
export const TEMPLATE_HELP: Record<string, string> = {
  cover: 'La prima slide: il titolo che fa fermare lo scroll.',
  punto: 'Un concetto per slide, con numero grande.',
  lista: 'Elenco con spunte: perfetto per errori o consigli.',
  citazione: 'Una frase forte di Daniele, in stile elegante.',
  dato: 'Un numero gigante che colpisce (es. 180 passi/min).',
  mitoverita: 'Smonta una convinzione sbagliata.',
  foto: 'Fotogramma dal video in alto + testo sotto.',
  cta: 'L\'ultima slide: chiede di commentare la parola chiave.',
  domanda: 'Una domanda grande che crea curiosità.',
  passi: 'Istruzioni in passaggi numerati.',
  testo: 'Un paragrafo da leggere, per raccontare.',
  primadopo: 'Confronto tra come fai ora e come dovresti fare.',
  copertina: 'Copertina del reel: fotogramma a tutto schermo e titolo.',
  s_intro: 'Prima storia della sequenza: etichetta in alto (es. INTRO) e la frase che apre.',
  s_testo: 'Una frase grande da leggere in 3 secondi.',
  s_domanda: 'Lascia lo spazio per il box domande di Instagram (lo aggiungi dall’app nel riquadro tratteggiato).',
  s_sondaggio: 'Lascia lo spazio per il sondaggio di Instagram con le due risposte scritte sotto.',
  s_proof: 'Risultato di un cliente: foto + frase + bollino “Prova”.',
  s_lista: 'Passaggi numerati, per spiegare un metodo.',
  s_cta: 'Ultima storia: chiede di scrivere la parola chiave in DM.',
};

// elementi liberi (stile Canva) sopra la slide: testi, immagini, emoji, forme, frecce
export const SlideElements: React.FC<{ els: any[]; assetBase: string; P: any; f: any; FH: number }> = ({ els, assetBase, P, f, FH }) => (
  <>
    {(els || []).map((e: any) => {
      const st: React.CSSProperties = { position: 'absolute', left: (e.x ?? 0.1) * 1080, top: (e.y ?? 0.1) * FH, width: (e.w ?? 0.5) * 1080, transform: `rotate(${e.rot || 0}deg)`, transformOrigin: 'center', opacity: e.o ?? 1 };
      const src = e.src && e.src.startsWith('/') ? assetBase + e.src : e.src;
      return (
        <ElAnim key={e.id} idx={(els || []).indexOf(e)} id={e.id} st={st}>
          {e.type === 'text' ? (
            <div style={{ fontFamily: e.font === 'serif' ? 'DMSerif, serif' : e.font === 'mano' ? 'Caveat, cursive' : e.font === 'impatto' ? 'Anton, sans-serif' : f.css, fontStyle: e.italic ? 'italic' : 'normal', fontWeight: e.bold === false ? 400 : 800, fontSize: e.size || 64, color: e.color || '#0B0F0A', lineHeight: 1.08, textAlign: e.align || 'left', background: e.bg || 'transparent', padding: e.bg ? '10px 22px' : 0, borderRadius: 16 }}>
              <Rich s={e.text || 'Testo'} color={e.emph || P.primary} italic={f.italicEmph} />
            </div>
          ) : e.type === 'image' ? (
            <Img src={src} style={{ width: '100%', borderRadius: e.radius ?? 24, boxShadow: e.shadow === false ? 'none' : '0 14px 40px rgba(0,0,0,.25)', border: e.border ? `10px solid ${e.border}` : 'none' }} />
          ) : e.type === 'emoji' ? (
            <div style={{ fontSize: e.size || 160, lineHeight: 1 }}>{e.text || '🏃'}</div>
          ) : e.type === 'shape' ? (
            <div style={{ width: '100%', height: (e.h ?? 0.1) * FH, background: e.color || P.accent, borderRadius: e.shape === 'cerchio' ? '50%' : e.radius ?? 20 }} />
          ) : e.type === 'arrow' ? (
            <svg viewBox="0 0 200 80" style={{ width: '100%' }}>
              <path d="M5 60 Q 90 0 185 35 M160 15 L 188 36 L 158 55" fill="none" stroke={e.color || P.primary} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : e.type === 'bubble' ? (
            <div style={{ background: e.bg || '#fff', color: e.color || '#0B0F0A', fontFamily: 'Blinker', fontWeight: 700, fontSize: e.size || 46, padding: '20px 30px', borderRadius: 40, boxShadow: '0 10px 30px rgba(0,0,0,.18)' }}>{e.text || 'Ciao!'}</div>
          ) : e.type === 'phone' ? (
            <div style={{ borderRadius: 70, background: '#111', padding: 16, boxShadow: '0 20px 50px rgba(0,0,0,.35)' }}>
              <div style={{ borderRadius: 56, overflow: 'hidden', aspectRatio: '9 / 19', background: '#ddd' }}>{src ? <Img src={src} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : null}</div>
            </div>
          ) : null}
        </ElAnim>
      );
    })}
  </>
);
const ElAnim: React.FC<{ idx: number; id: string; st: React.CSSProperties; children: React.ReactNode }> = ({ idx, id, st, children }) => {
  const a = useAnim();
  if (a.mode === 'none')
    return (
      <div data-elid={id} style={st}>
        {children}
      </div>
    );
  const sp = spring({ frame: a.frame - 10 - idx * 6, fps: a.fps, config: { damping: 12 } });
  return (
    <div data-elid={id} style={{ ...st, opacity: sp, transform: `${st.transform || ''} scale(${0.7 + 0.3 * sp})` }}>
      {children}
    </div>
  );
};

// ---- Storie (9:16) in stile Story Selling System ----
const StorySlide: React.FC<SlideProps & { P: any; f: any; img: (u?: string) => string | undefined }> = ({ assetBase, brand, slide, index, total, P, f: f0, img }) => {
  let f = f0;
  const tpl = slide.template;
  const theme = slide.theme || 'scuro';
  const cu = P.__custom;
  const useCu = cu && !slide.theme;
  const bgCol = useCu ? (index % 2 && cu.bgAlt ? cu.bgAlt : cu.bg) : theme === 'verde' ? P.primary : theme === 'crema' ? P.bg : theme === 'azzurro' ? P.accent : '#0E1410';
  const lumS = (h: string) => {
    const m = /^#?([0-9a-f]{6})$/i.exec(h || '');
    if (!m) return 0;
    const n = parseInt(m[1], 16);
    return ((n >> 16) * 0.3 + ((n >> 8) & 255) * 0.59 + (n & 255) * 0.11) / 255;
  };
  const dark = useCu ? lumS(bgCol) < 0.5 || !!slide.image : theme === 'verde' || theme === 'scuro' || !!slide.image;
  const fg = useCu && !slide.image ? cu.fg || (dark ? '#fff' : '#111') : dark ? '#fff' : '#0B0F0A';
  const em = slide.emphColor || (useCu ? cu.em : dark ? P.accent : P.primary);
  if (useCu && TITLE_FONTS[cu.font]) f = TITLE_FONTS[cu.font];
  const pad = 90;
  const big: React.CSSProperties = { fontFamily: f.css, fontWeight: f.weight, color: fg, lineHeight: 1.05, textTransform: f.upper || look?.upper ? 'uppercase' : 'none' };
  const label = slide.label ? (
    <div style={{ display: 'inline-block', background: P.primary === bgCol ? '#fff' : P.primary, color: P.primary === bgCol ? P.primary : '#fff', fontFamily: 'Blinker', fontWeight: 800, fontSize: 38, letterSpacing: 3, padding: '10px 26px', borderRadius: 40, marginBottom: 30, textTransform: 'uppercase' }}>{slide.label}</div>
  ) : null;
  const bubble = (t: string, size = 64) => (
    <div style={{ background: dark ? 'rgba(10,14,10,.82)' : '#fff', color: dark ? '#fff' : '#0B0F0A', borderRadius: 34, padding: '34px 40px', fontFamily: 'Blinker', fontWeight: 700, fontSize: size, lineHeight: 1.18, boxShadow: '0 16px 40px rgba(0,0,0,.25)' }}>
      <Rich s={t} color={em} italic={f.italicEmph} />
    </div>
  );
  const stickerZone = (h: number, txt: string) => (
    <div style={{ border: `5px dashed ${dark ? 'rgba(255,255,255,.55)' : 'rgba(0,0,0,.35)'}`, borderRadius: 36, height: h, display: 'grid', placeItems: 'center', color: dark ? 'rgba(255,255,255,.7)' : 'rgba(0,0,0,.5)', fontFamily: 'Blinker', fontSize: 34, fontWeight: 700, textAlign: 'center', padding: 20, marginTop: 40 }}>{txt}</div>
  );
  let body: React.ReactNode = null;
  if (tpl === 's_intro' || tpl === 's_testo') {
    body = (
      <div style={{ position: 'absolute', left: pad, right: pad, top: tpl === 's_intro' ? 780 : 560 }}>
        {label}
        {tpl === 's_intro' ? bubble(slide.title || 'Se i tuoi contenuti non portano clienti, il problema non è quello che pensi.', slide.size && slide.size < 5 ? slide.size * 64 : 64) : <div style={{ ...big, fontSize: (slide.size && slide.size < 5 ? slide.size * 108 : slide.size || 108) }}><Rich s={slide.title || 'Non hai bisogno di più *tempo*.'} color={em} italic={f.italicEmph} /></div>}
        {slide.body ? <div style={{ fontFamily: 'Blinker', fontSize: 50, color: fg, opacity: 0.88, marginTop: 34, lineHeight: 1.25 }}>{slide.body}</div> : null}
      </div>
    );
  } else if (tpl === 's_domanda') {
    body = (
      <div style={{ position: 'absolute', left: pad, right: pad, top: 520 }}>
        {label}
        <div style={{ ...big, fontSize: (slide.size && slide.size < 5 ? slide.size * 92 : slide.size || 92) }}>
          <Rich s={slide.title || 'Qual è il tuo *dubbio* più grande sulla corsa?'} color={em} italic={f.italicEmph} />
        </div>
        {stickerZone(380, '⬇ Qui aggiungi il BOX DOMANDE dall’app Instagram')}
      </div>
    );
  } else if (tpl === 's_sondaggio') {
    const opts: string[] = slide.items?.length ? slide.items : ['Sì, sempre', 'No, mai'];
    body = (
      <div style={{ position: 'absolute', left: pad, right: pad, top: 520 }}>
        {label}
        <div style={{ ...big, fontSize: (slide.size && slide.size < 5 ? slide.size * 92 : slide.size || 92) }}>
          <Rich s={slide.title || 'Ti fanno male le *ginocchia* dopo la corsa?'} color={em} italic={f.italicEmph} />
        </div>
        {stickerZone(300, `⬇ Qui il SONDAGGIO di Instagram
«${opts.join(' / ')}»`)}
      </div>
    );
  } else if (tpl === 's_proof') {
    body = (
      <div style={{ position: 'absolute', left: pad, right: pad, top: 300 }}>
        {label}
        {slide.photo ? <Img src={img(slide.photo) as string} style={{ width: '100%', height: 760, objectFit: 'cover', borderRadius: 40, marginBottom: 40 }} /> : null}
        {bubble(slide.title || 'Marco ha corso i suoi primi 10 km *senza dolore* in 8 settimane.', 58)}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, marginTop: 30, background: P.primary, color: '#fff', fontFamily: 'Blinker', fontWeight: 800, fontSize: 40, padding: '12px 30px', borderRadius: 40 }}>✓ {slide.kicker || 'Risultato reale'}</div>
      </div>
    );
  } else if (tpl === 's_lista') {
    const items: string[] = slide.items?.length ? slide.items : ['Passo corto', 'Appoggio sotto il bacino', 'Cadenza alta'];
    body = (
      <div style={{ position: 'absolute', left: pad, right: pad, top: 420 }}>
        {label}
        <div style={{ ...big, fontSize: 88, marginBottom: 46 }}>
          <Rich s={slide.title || 'Il metodo in *3 passi*'} color={em} italic={f.italicEmph} />
        </div>
        {items.map((it, i) => (
          <div key={i} style={{ display: 'flex', gap: 26, alignItems: 'center', background: dark ? 'rgba(255,255,255,.08)' : '#fff', borderRadius: 30, padding: '26px 30px', marginBottom: 22, fontFamily: 'Blinker', fontWeight: 700, fontSize: 52, color: fg }}>
            <span style={{ width: 70, height: 70, borderRadius: 40, background: P.primary, color: '#fff', display: 'grid', placeItems: 'center', flex: 'none', fontSize: 38 }}>{i + 1}</span>
            {it}
          </div>
        ))}
      </div>
    );
  } else if (tpl === 's_cta') {
    body = (
      <div style={{ position: 'absolute', left: pad, right: pad, top: 640, textAlign: 'center' }}>
        {label}
        <div style={{ ...big, fontSize: (slide.size && slide.size < 5 ? slide.size * 100 : slide.size || 100) }}>
          <Rich s={slide.title || 'Vuoi il piano per iniziare?'} color={em} italic={f.italicEmph} />
        </div>
        <div style={{ fontFamily: 'Blinker', fontWeight: 700, fontSize: 56, color: fg, marginTop: 40 }}>
          Scrivimi <span style={{ background: P.primary, color: '#fff', padding: '4px 22px', borderRadius: 16 }}>{slide.keyword || 'CORRO'}</span> in DM
        </div>
        <div style={{ fontSize: 120, marginTop: 70 }}>👇</div>
      </div>
    );
  }
  return (
    <AbsoluteFill style={{ background: bgCol }}>
      {slide.image ? (
        <>
          <Img src={img(slide.image) as string} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
          <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,0,0,.25) 0%, rgba(0,0,0,.35) 40%, rgba(0,0,0,.8) 100%)' }} />
        </>
      ) : theme === 'scuro' ? (
        <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 100%, ${P.primary}AA 0%, rgba(0,0,0,0) 60%)` }} />
      ) : null}
      {/* barre delle storie e profilo, come su Instagram (solo guida visiva nella parte alta, coperta dall'app) */}
      <div style={{ position: 'absolute', top: 40, left: 30, right: 30, display: 'flex', gap: 8, opacity: slide.guides === false ? 0 : 0.5 }}>
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} style={{ flex: 1, height: 6, borderRadius: 4, background: i <= index ? '#fff' : 'rgba(255,255,255,.35)' }} />
        ))}
      </div>
      <div style={{ textAlign: slide.align || undefined }}>{body}</div>
      <Img src={logoUrl(assetBase, brand, dark ? 'pictogramOnDark' : 'pictogramOnLight')} style={{ position: 'absolute', bottom: 260, right: 90, height: 90, opacity: 0.9 }} />
    </AbsoluteFill>
  );
};

// stile delle *parole evidenziate*: colore | box | evidenziatore | sottolinea | cerchio
const emphStyle = (a: any, color: string, italic?: boolean): React.CSSProperties => {
  const k = a.emphAnim && a.mode !== 'none' ? Math.min(1, Math.max(0, (a.frame - 10) / 14)) : 1;
  switch (a.emph) {
    case 'box':
      return { background: color, color: '#fff', padding: '0 .14em', borderRadius: 10, boxDecorationBreak: 'clone' as any, WebkitBoxDecorationBreak: 'clone' as any, opacity: 0.3 + 0.7 * k };
    case 'evidenziatore':
      return { backgroundImage: `linear-gradient(transparent 55%, ${color}AA 55%)`, backgroundSize: `${k * 100}% 100%`, backgroundRepeat: 'no-repeat' };
    case 'nastro':
      return { background: color, color: '#fff', padding: '0 .2em', display: 'inline-block', transform: `rotate(-2deg) scale(${0.6 + 0.4 * k})`, boxShadow: '0 6px 0 rgba(0,0,0,.18)', margin: '0 .05em' };
    case 'sottolinea':
      return { backgroundImage: `linear-gradient(${color}, ${color})`, backgroundSize: `${k * 100}% .09em`, backgroundPosition: '0 95%', backgroundRepeat: 'no-repeat' };
    default:
      return { color, fontStyle: italic ? 'italic' : 'normal' };
  }
};
const Rich: React.FC<{ s: string; color: string; italic?: boolean }> = ({ s, color, italic }) => {
  const a = useAnim();
  const parts = parseEmph(s || '');
  if (a.mode === 'parole') {
    let k = 0;
    return (
      <>
        {parts.map((p, i) =>
          p.t.split(/(\s+)/).map((w, j) => {
            if (!w.trim()) return w;
            const n = k++;
            const sp = spring({ frame: (a.frame - 4 - n * 4) * (a.speed || 1), fps: a.fps, config: { damping: 14, stiffness: 160 } });
            return (
              <span key={i + '-' + j} style={{ display: 'inline-block', opacity: sp, transform: `translateY(${(1 - sp) * 40}px)`, ...(p.e ? emphStyle(a, color, italic) : {}) }}>
                {w}
              </span>
            );
          })
        )}
      </>
    );
  }
  if (a.mode === 'scrivi') {
    const total = parts.reduce((x, p) => x + p.t.length, 0);
    let left = Math.floor(interpolate(a.frame, [4, 4 + total * 1.2], [0, total], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));
    return (
      <>
        {parts.map((p, i) => {
          const t = p.t.slice(0, Math.max(0, left));
          left -= p.t.length;
          return (
            <span key={i} style={p.e ? emphStyle(a, color, italic) : {}}>
              {t}
            </span>
          );
        })}
      </>
    );
  }
  return (
    <>
      {parts.map((p, i) => (
        <span key={i} style={p.e ? emphStyle(a, color, italic) : {}}>
          {p.t}
        </span>
      ))}
    </>
  );
};
// avvolge il contenuto della slide con l'animazione scelta
const AnimWrap: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const a = useAnim();
  if (a.mode === 'none' || a.mode === 'parole' || a.mode === 'scrivi') return <>{children}</>;
  const sp = spring({ frame: a.frame * (a.speed || 1), fps: a.fps, config: { damping: a.mode === 'pop' ? 10 : 200, stiffness: a.mode === 'pop' ? 170 : 100 } });
  const st: React.CSSProperties =
    a.mode === 'morbido' ? { opacity: sp, transform: `translateY(${(1 - sp) * 80}px)` } : a.mode === 'pop' ? { transform: `scale(${0.6 + 0.4 * sp})`, opacity: Math.min(1, a.frame / 4) } : a.mode === 'scorri' ? { transform: `translateX(${(1 - sp) * 1080}px)` } : { opacity: interpolate(a.frame, [0, 18], [0, 1], { extrapolateRight: 'clamp' }) };
  return <AbsoluteFill style={st}>{children}</AbsoluteFill>;
};
// lo sfondo si muove piano (in tutte le animazioni)
const BgMove: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const a = useAnim();
  if (a.mode === 'none') return <>{children}</>;
  const bg = a.bg || (a.mode === 'zoom' ? 'zoom' : 'leggero');
  if (bg === 'fermo') return <>{children}</>;
  const k = a.frame / (a.fps * 5);
  const tr = bg === 'pan' ? `scale(1.08) translateX(${(k - 0.5) * -60}px)` : `scale(${1 + (bg === 'zoom' ? 0.12 : 0.04) * k})`;
  return <AbsoluteFill style={{ transform: tr }}>{children}</AbsoluteFill>;
};


// ---- Modelli di design dei caroselli: cambiano sfondi, font, colori e decorazioni ----
export const DESIGNS: Record<string, { name: string; desc: string }> = {
  brand: { name: 'Brand Correre Naturale', desc: 'Verde, crema e bianco del brand, font Blinker.' },
  editoriale: { name: 'Editoriale crema', desc: 'Fondo crema, titoli serif da rivista, numeri sottili.' },
  minimal: { name: 'Minimal bianco', desc: 'Tanto bianco, testo nero pulito, una linea d’accento.' },
  bold: { name: 'Bold verde', desc: 'Tutto verde, titoli enormi in maiuscolo.' },
  quaderno: { name: 'Quaderno', desc: 'Carta a righe, scritta a pennarello, evidenziatore giallo.' },
  premium: { name: 'Nero premium', desc: 'Fondo nero, serif elegante, dettagli azzurri.' },
  pastello: { name: 'Pastello', desc: 'Colori morbidi che cambiano a ogni slide, schede arrotondate.' },
  giornale: { name: 'Giornale', desc: 'Carta di giornale, titoli da prima pagina, linee di colonna.' },
  tech: { name: 'Tech / app', desc: 'Fondo scuro a griglia, font tecnico, etichette da interfaccia.' },
  pop: { name: 'Pop sticker', desc: 'Giallo acceso, bordi neri spessi, ombre piene.' },
  foto: { name: 'Foto a tutto schermo', desc: 'Fotogrammi del video come sfondo, testo bianco sopra.' },
  scrapbook: { name: 'Scrapbook', desc: 'Carta kraft, nastro adesivo, foto e scritte a mano.' },
  gradiente: { name: 'Gradiente vetro', desc: 'Sfumatura verde-azzurra con scheda di vetro.' },
  tweet: { name: 'Post stile tweet', desc: 'Ogni slide sembra un post: foto profilo, nome, testo.' },
};
const PASTELS = ['#E9F1E4', '#E6F0F8', '#F8EDE3', '#F3E8F5', '#FFF6D9', '#E4F3EF'];
const designLook = (d: string, index: number, total: number, P: any, f: any, tpl: string) => {
  const last = index === total - 1;
  const first = index === 0;
  switch (d) {
    case 'editoriale':
      return { bg: '#F4F1E5', dark: false, fg: '#1D1B16', em: P.primary, font: TITLE_FONTS.fraunces, body: 'Instrument, Georgia, serif' };
    case 'minimal':
      return { bg: '#FFFFFF', dark: false, fg: '#111', em: P.primary, font: TITLE_FONTS.dmsans, body: 'Inter, sans-serif' };
    case 'bold':
      return { bg: P.primary, dark: true, fg: '#fff', em: P.accent, font: TITLE_FONTS.bebas, body: 'Blinker, sans-serif' };
    case 'quaderno':
      return { bg: '#FBFAF4', dark: false, fg: '#1f2a44', em: '#1f2a44', font: TITLE_FONTS.marker, body: 'Caveat, cursive', hl: '#FFE14D' };
    case 'premium':
      return { bg: '#0B0D0C', dark: true, fg: '#F4F1E5', em: P.accent, font: TITLE_FONTS.playfair, body: 'Inter, sans-serif' };
    case 'pastello':
      return { bg: PASTELS[index % PASTELS.length], dark: false, fg: '#203028', em: P.primary, font: TITLE_FONTS.poppins, body: 'Poppins, sans-serif' };
    case 'giornale':
      return { bg: '#F1ECE0', dark: false, fg: '#1a1a1a', em: '#B3261E', font: TITLE_FONTS.abril, body: 'Georgia, serif' };
    case 'tech':
      return { bg: '#0E1512', dark: true, fg: '#E9F1E4', em: '#8BE36A', font: TITLE_FONTS.spacegrotesk, body: 'JBMono, monospace' };
    case 'pop':
      return { bg: first || last ? '#FFE14D' : '#FFF9E0', dark: false, fg: '#0B0F0A', em: P.primary, font: TITLE_FONTS.archivo, body: 'Poppins, sans-serif' };
    case 'foto':
      return { bg: '#000', dark: true, fg: '#fff', em: P.accent, font: f, body: 'Blinker, sans-serif' };
    case 'scrapbook':
      return { bg: '#D9C4A0', dark: false, fg: '#2b2118', em: '#7a2e1d', font: TITLE_FONTS.marker, body: 'Caveat, cursive' };
    case 'gradiente':
      return { bg: `linear-gradient(160deg, ${P.primary} 0%, #2f5b4a 45%, ${P.accent} 120%)`, dark: true, fg: '#fff', em: '#FFE14D', font: TITLE_FONTS.montserrat, body: 'Poppins, sans-serif' };
    case 'tweet':
      return { bg: '#FFFFFF', dark: false, fg: '#0F1419', em: P.primary, font: TITLE_FONTS.dmsans, body: 'Inter, sans-serif' };
    case 'custom': {
      const c = P.__custom || {};
      const bg = index % 2 && c.bgAlt ? c.bgAlt : c.bg || '#fff';
      const lum = (h: string) => {
        const m = /^#?([0-9a-f]{6})$/i.exec(h || '');
        if (!m) return 1;
        const n = parseInt(m[1], 16);
        return ((n >> 16) * 0.3 + ((n >> 8) & 255) * 0.59 + (n & 255) * 0.11) / 255;
      };
      let em0 = c.em || P.primary;
      if (Math.abs(lum(em0) - lum(bg)) < 0.22) em0 = lum(bg) < 0.5 ? (Math.abs(lum('#B8D7EA') - lum(bg)) > 0.22 ? '#B8D7EA' : '#F4F1E5') : '#49762E';
      let fg0 = c.fg || '#111';
      if (Math.abs(lum(fg0) - lum(bg)) < 0.35) fg0 = lum(bg) < 0.5 ? '#FFFFFF' : '#0B0F0A';
      return { bg, dark: lum(bg) < 0.5, fg: fg0, em: em0, font: TITLE_FONTS[c.font] || f, body: c.body || 'Inter, sans-serif', align: c.allinea, card: c.card, scale: c.scalaTitolo, upper: c.upper };
    }
    default:
      return null;
  }
};

// decorazioni ricavate dalle reference (nastro adesivo, scarabocchi, sticker, carta strappata, grana, griglia, fascia continua tra le slide…)
const RefLayer: React.FC<{ cu: any; index: number; total: number; FH: number; em: string; fg: string; dark: boolean }> = ({ cu, index, total, FH, em, fg, dark }) => {
  const dec: string[] = Array.isArray(cu.decori) ? cu.decori : [];
  const has = (k: string) => dec.includes(k);
  const r = (n: number) => ((index * 9301 + n * 49297) % 233280) / 233280;
  const boundY = (b: number) => FH * (0.22 + 0.5 * (((b * 37) % 10) / 10));
  const W = 1080;
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {has('griglia') ? <AbsoluteFill style={{ backgroundImage: `linear-gradient(${dark ? 'rgba(255,255,255,.07)' : 'rgba(0,0,0,.06)'} 2px, transparent 2px), linear-gradient(90deg, ${dark ? 'rgba(255,255,255,.07)' : 'rgba(0,0,0,.06)'} 2px, transparent 2px)`, backgroundSize: '90px 90px' }} /> : null}
      {has('onda') ? (
        <svg width={W} height={FH} style={{ position: 'absolute', inset: 0 }}>
          <path d={Array.from({ length: 55 }, (_, k) => { const x = k * 20; const gx = x + index * W; const y = FH * 0.86 + 70 * Math.sin(gx / 260) + 30 * Math.sin(gx / 97); return (k ? 'L' : 'M') + x + ' ' + y.toFixed(1); }).join(' ')} stroke={em} strokeWidth={80} fill="none" strokeLinecap="round" opacity={0.9} />
        </svg>
      ) : null}
      {has('cerchi') ? (
        <>
          {index < total - 1 ? <div style={{ position: 'absolute', left: W - 170, top: boundY(index) - 170, width: 340, height: 340, borderRadius: '50%', background: em, opacity: 0.9 }} /> : null}
          {index > 0 ? <div style={{ position: 'absolute', left: -170, top: boundY(index - 1) - 170, width: 340, height: 340, borderRadius: '50%', background: em, opacity: 0.9 }} /> : null}
        </>
      ) : null}
      {has('strappo') ? (
        <svg width={W} height={90} style={{ position: 'absolute', left: 0, top: index % 2 ? FH - 90 : 0, transform: index % 2 ? 'none' : 'scaleY(-1)' }}>
          <path d={'M0 90 ' + Array.from({ length: 28 }, (_, k) => `L${k * 40} ${20 + r(k) * 40}`).join(' ') + ' L1080 40 L1080 90 Z'} fill={cu.bgAlt && index % 2 === 0 ? cu.bgAlt : cu.bg || '#F4F1E5'} />
        </svg>
      ) : null}
      {has('nastro') ? (
        <>
          <div style={{ position: 'absolute', left: 40 + r(1) * 80, top: 60, width: 230, height: 64, background: 'rgba(244,241,229,.78)', transform: `rotate(${-28 + r(2) * 12}deg)`, boxShadow: '0 2px 6px rgba(0,0,0,.12)' }} />
          <div style={{ position: 'absolute', right: 30 + r(3) * 80, top: 90 + r(4) * 60, width: 200, height: 60, background: 'rgba(184,215,234,.7)', transform: `rotate(${22 + r(5) * 14}deg)`, boxShadow: '0 2px 6px rgba(0,0,0,.12)' }} />
        </>
      ) : null}
      {has('scarabocchi') ? (
        <svg width={W} height={FH} style={{ position: 'absolute', inset: 0 }}>
          {index % 3 === 0 ? <path d={`M${860} ${FH - 400} l25 60 l65 5 l-50 40 l18 65 l-58 -36 l-58 36 l18 -65 l-50 -40 l65 -5 z`} fill="none" stroke={em} strokeWidth={7} strokeLinejoin="round" /> : null}
          {index % 3 === 1 ? <path d={`M760 ${FH - 330} q 120 -150 230 -40 m -40 -45 l 42 47 l -55 18`} fill="none" stroke={em} strokeWidth={8} strokeLinecap="round" /> : null}
          {index % 3 === 2 ? <path d={`M940 ${FH - 330} c -60 -10 -90 60 -40 90 c 60 30 110 -50 50 -90 c -70 -40 -150 40 -90 120`} fill="none" stroke={em} strokeWidth={7} strokeLinecap="round" /> : null}
        </svg>
      ) : null}
      {has('sticker') && (index === 0 || index === total - 1) ? (
        <div style={{ position: 'absolute', right: 70, top: index === 0 ? 110 : FH * 0.55, width: 210, height: 210, borderRadius: '50%', background: em, color: '#fff', display: 'grid', placeItems: 'center', textAlign: 'center', fontFamily: 'Blinker', fontWeight: 800, fontSize: 38, lineHeight: 1, transform: 'rotate(-12deg)', boxShadow: '0 10px 0 rgba(0,0,0,.15)', padding: 20 }}>
          {index === 0 ? cu.stickerTesto || 'SCORRI →' : cu.stickerFinale || 'SALVA ✓'}
        </div>
      ) : null}
      {has('numeri') ? <div style={{ position: 'absolute', right: 70, top: 60, fontFamily: 'Anton, sans-serif', fontSize: 170, color: 'transparent', WebkitTextStroke: `4px ${em}`, opacity: 0.8 }}>{String(index + 1).padStart(2, '0')}</div> : null}
      {has('grana') ? (
        <svg width={W} height={FH} style={{ position: 'absolute', inset: 0, opacity: 0.16, mixBlendMode: 'multiply' }}>
          <filter id="rsgrain">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#rsgrain)" />
        </svg>
      ) : null}
    </AbsoluteFill>
  );
};
const DECOR_MAP: Record<string, string> = { righe: 'quaderno', griglia: 'tech', bordo: 'pop', cornice: 'premium', giornale: 'giornale', nastro: 'scrapbook', vetro: 'gradiente', numeri: 'editoriale' };
const DesignDecor: React.FC<{ d: string; index: number; total: number; FH: number; P: any; look: any; img?: string }> = ({ d: d0, index, total, FH, P, look, img }) => {
  const d = d0 === 'custom' ? DECOR_MAP[P.__custom?.decor] || 'none' : d0;
  if (d === 'quaderno')
    return (
      <AbsoluteFill style={{ backgroundImage: 'repeating-linear-gradient(#FBFAF4 0 58px, #C9D7EA 58px 60px)', backgroundPosition: '0 30px' }}>
        <div style={{ position: 'absolute', left: 120, top: 0, bottom: 0, width: 3, background: '#E8A0A0' }} />
      </AbsoluteFill>
    );
  if (d === 'tech')
    return <AbsoluteFill style={{ backgroundImage: 'linear-gradient(rgba(139,227,106,.08) 2px, transparent 2px), linear-gradient(90deg, rgba(139,227,106,.08) 2px, transparent 2px)', backgroundSize: '60px 60px' }} />;
  if (d === 'giornale')
    return (
      <AbsoluteFill>
        <div style={{ position: 'absolute', top: 70, left: 70, right: 70, borderTop: '6px solid #1a1a1a', borderBottom: '2px solid #1a1a1a', height: 10 }} />
        <div style={{ position: 'absolute', top: 96, left: 70, right: 70, fontFamily: 'Georgia, serif', fontSize: 26, letterSpacing: 4, textTransform: 'uppercase', display: 'flex', justifyContent: 'space-between' }}>
          <span>Edizione speciale</span>
          <span>N° {index + 1}</span>
        </div>
      </AbsoluteFill>
    );
  if (d === 'editoriale')
    return (
      <div style={{ position: 'absolute', top: 70, left: 96, right: 96, display: 'flex', justifyContent: 'space-between', fontFamily: 'Inter, sans-serif', fontSize: 26, letterSpacing: 3, color: '#8A8577', borderBottom: '1px solid #CFC8B5', paddingBottom: 14 }}>
        <span>{String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}</span>
        <span>CORRERE NATURALE</span>
      </div>
    );
  if (d === 'pop') return <div style={{ position: 'absolute', inset: 40, border: '8px solid #0B0F0A', borderRadius: 30, boxShadow: '14px 14px 0 #0B0F0A' }} />;
  if (d === 'foto' && img)
    return (
      <>
        <Img src={img} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,0,0,.25), rgba(0,0,0,.72))' }} />
      </>
    );
  if (d === 'scrapbook')
    return (
      <AbsoluteFill>
        <div style={{ position: 'absolute', inset: 50, background: '#FBF7EE', transform: `rotate(${index % 2 ? 1 : -1}deg)`, boxShadow: '0 20px 40px rgba(0,0,0,.25)' }} />
        <div style={{ position: 'absolute', top: 30, left: 420, width: 240, height: 70, background: 'rgba(255,240,170,.75)', transform: 'rotate(-4deg)' }} />
      </AbsoluteFill>
    );
  if (d === 'gradiente') return <div style={{ position: 'absolute', inset: 60, background: 'rgba(255,255,255,.12)', border: '2px solid rgba(255,255,255,.3)', borderRadius: 50, backdropFilter: 'blur(10px)' }} />;
  if (d === 'premium') return <div style={{ position: 'absolute', inset: 50, border: `2px solid ${P.accent}55`, borderRadius: 8 }} />;
  if (d === 'minimal') return <div style={{ position: 'absolute', left: 96, top: 120, width: 90, height: 8, background: P.primary }} />;
  return null;
};
const Tweet: React.FC<any> = ({ assetBase, brand, slide, look, FH, index, total }) => {
  const t = [slide.title, slide.body, ...(slide.items || []).map((x: string, i: number) => `${i + 1}. ${x}`), slide.left ? `❌ ${slide.left}` : '', slide.right ? `✅ ${slide.right}` : '', slide.keyword ? `Commenta ${slide.keyword} 👇` : ''].filter(Boolean).join('\n\n').replace(/\*/g, '');
  return (
    <AbsoluteFill style={{ background: '#fff', padding: 96, justifyContent: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 36 }}>
        <div style={{ width: 120, height: 120, borderRadius: 80, background: '#49762E', display: 'grid', placeItems: 'center' }}>
          <Img src={logoUrl(assetBase, brand, 'pictogramOnDark')} style={{ height: 80 }} />
        </div>
        <div>
          <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: 46, color: '#0F1419' }}>{brand?.speaker?.name || brand?.name} <span style={{ color: '#1D9BF0' }}>✔</span></div>
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 38, color: '#536471' }}>@{(brand?.handle || 'correrenaturale').replace('@', '')}</div>
        </div>
      </div>
      <div style={{ fontFamily: 'Inter, sans-serif', fontSize: t.length > 220 ? 50 : 62, lineHeight: 1.3, color: '#0F1419', whiteSpace: 'pre-wrap', fontWeight: index === 0 ? 700 : 400 }}>{t}</div>
      <div style={{ position: 'absolute', bottom: 80, left: 96, right: 96, display: 'flex', justifyContent: 'space-between', fontFamily: 'Inter, sans-serif', fontSize: 32, color: '#536471' }}>
        <span>{index + 1}/{total}</span>
        <span>{index < total - 1 ? 'Scorri →' : ''}</span>
      </div>
    </AbsoluteFill>
  );
};

export const Slide: React.FC<SlideProps> = (props) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const mode = props.animate?.mode || 'none';
  const an: any = props.animate || {};
  return (
    <AnimCtx.Provider value={{ mode, frame, fps, speed: an.speed || 1, bg: an.bg, emph: props.style?.emphStyle || (props.style?.design === 'custom' ? props.style?.custom?.enfasi : undefined), emphAnim: an.emphAnim !== false, arrow: an.arrow, ctaPulse: an.ctaPulse }}>
      <SlideInner {...props} />
      {an.arrow && mode !== 'none' && props.index < props.total - 1 ? (
        <div style={{ position: 'absolute', right: 60, top: '50%', fontSize: 90, color: props.style?.custom?.em || '#49762E', transform: `translateX(${Math.sin(frame / 6) * 18}px)`, textShadow: '0 4px 14px rgba(0,0,0,.25)' }}>➜</div>
      ) : null}
      {props.animate?.music && mode !== 'none' ? <Audio src={props.animate.music.startsWith('user:') ? `${props.assetBase}/assets/music-utente/${encodeURIComponent(props.animate.music.slice(5))}` : `${props.assetBase}/assets/music/${props.animate.music}.mp3`} volume={(f) => 0.5 * Math.min(1, f / 10, ((props.animate?.durationSec || 5) * fps - f) / 15)} /> : null}
    </AnimCtx.Provider>
  );
};
const SlideInner: React.FC<SlideProps> = ({ assetBase, brand, style, slide, index, total, format }) => {
  const FH = (FORMATS[format || '4:5'] || FORMATS['4:5']).h;
  const img = (u?: string) => (u && u.startsWith('/') ? assetBase + u : u);
  useFonts(assetBase);
  const P = { ...pal(style), __custom: style?.custom };
  const tpl = slide?.template || 'punto';
  const design = style?.design || 'brand';
  const look = tpl.startsWith('s_') ? null : designLook(design, index, total, P, TITLE_FONTS[style?.titleFont || 'brand'] || TITLE_FONTS.brand, tpl);
  const f = look && !style?.titleFontLocked ? look.font : TITLE_FONTS[style?.titleFont || 'brand'] || TITLE_FONTS.brand;
  const theme = slide?.theme || (tpl === 'cover' || tpl === 'cta' ? 'verde' : index % 2 ? 'crema' : 'bianco');
  const bg = look && !slide?.theme ? look.bg : theme === 'verde' ? P.primary : theme === 'nero' ? '#0B0F0A' : theme === 'azzurro' ? P.accent : theme === 'crema' ? P.bg : '#FFFFFF';
  const cu: any = design === 'custom' ? P.__custom || {} : null;
  const fullImg = cu && cu.foto === 'pieno' && tpl !== 'copertina' && tpl !== 'foto' && slide?.image ? img(slide.image) : undefined;
  const dark = fullImg ? true : look && !slide?.theme ? look.dark : theme === 'verde' || theme === 'nero' || tpl === 'copertina';
  const fg = fullImg ? '#FFFFFF' : look && !slide?.theme ? look.fg : dark ? '#FFFFFF' : '#0B0F0A';
  const em = look && !slide?.theme ? look.em : dark ? P.accent : P.primary;
  if (design === 'tweet' && !tpl.startsWith('s_') && tpl !== 'copertina') {
    return (
      <AbsoluteFill>
        <AbsoluteFill data-rs-frame="1" style={{ pointerEvents: 'none' }} />
        <Tweet {...{ assetBase, brand, slide, look, FH, index, total }} />
        <SlideElements els={slide?.elements} assetBase={assetBase} P={P} f={f} FH={FH} />
      </AbsoluteFill>
    );
  }
  const bodyF = look?.body || 'Blinker';
  const title = slide?.title || '';
  const body = slide?.body || '';
  const pad = 96;
  // ogni parte del modello è selezionabile e modificabile da sola (slide.parts[nome])
  const PT = (k: string, st: React.CSSProperties): any => {
    const o = slide?.parts?.[k] || {};
    const ex: React.CSSProperties = {};
    // i testi lunghi si rimpiccioliscono da soli per stare nella slide
    const len = k === 'testo' ? String(slide?.body || '').length : k === 'titolo' ? String(slide?.title || '').length : 0;
    const lim = k === 'testo' ? (cu?.box && cu.box !== 'nessuno' ? 95 : 130) : 46;
    if (k === 'numero' && String(slide?.body || '').length > 120 && typeof st.fontSize === 'number') ex.fontSize = Math.round((st.fontSize as number) * 0.6);
    if (len > lim && typeof st.fontSize === 'number') ex.fontSize = Math.round((st.fontSize as number) * Math.max(0.5, Math.sqrt(lim / len)));
    if (cu && k === 'testo' && cu.box && cu.box !== 'nessuno') {
      const bc = cu.boxColor || (cu.box === 'pill' ? em : '#FFFFFF');
      const lumB = /^#?([0-9a-f]{6})$/i.test(bc) ? (() => { const n = parseInt(bc.replace('#', ''), 16); return ((n >> 16) * 0.3 + ((n >> 8) & 255) * 0.59 + (n & 255) * 0.11) / 255; })() : 1;
      Object.assign(ex, { background: bc, color: lumB < 0.5 ? '#fff' : '#0B0F0A', opacity: 1, padding: cu.box === 'pill' ? '22px 40px' : '30px 38px', borderRadius: cu.box === 'carta' ? 6 : cu.box === 'pill' ? 60 : 28, boxShadow: cu.box === 'carta' ? '0 10px 28px rgba(0,0,0,.22)' : '0 8px 24px rgba(0,0,0,.12)', transform: cu.box === 'carta' ? `rotate(${index % 2 ? 1 : -1}deg)` : undefined, display: 'block' });
    }
    if (o.color) ex.color = o.color;
    if (o.font) ex.fontFamily = o.font;
    if (o.align) ex.textAlign = o.align;
    if (o.bg) Object.assign(ex, { background: o.bg, padding: '.08em .3em', borderRadius: 16 });
    if (o.weight) ex.fontWeight = o.weight;
    const moved = o.x || o.y || (o.s && o.s !== 1) || o.r;
    return {
      'data-elid': 'part:' + k,
      style: { ...st, ...ex, ...(moved ? { transform: `${st.transform || ''} translate(${(o.x || 0) * 1080}px, ${(o.y || 0) * FH}px) scale(${o.s || 1}) rotate(${o.r || 0}deg)`, transformOrigin: 'center' } : {}), ...(o.o !== undefined ? { opacity: o.o } : {}), ...(o.hide ? { visibility: 'hidden' } : {}) },
    };
  };
  const titleStyle: React.CSSProperties = { fontFamily: f.css, fontWeight: f.weight, color: fg, letterSpacing: -1, textTransform: f.upper || look?.upper ? 'uppercase' : 'none' };

  if (tpl.startsWith('s_')) {
    return (
      <AbsoluteFill>
        <AbsoluteFill data-rs-frame="1" style={{ pointerEvents: 'none' }} />
        <AnimWrap>
          <StorySlide {...{ assetBase, brand, style, slide, index, total, format, P, f, img }} />
        </AnimWrap>
        <SlideElements els={slide?.elements} assetBase={assetBase} P={P} f={f} FH={FH} />
      </AbsoluteFill>
    );
  }
  let content: React.ReactNode = null;
  if (tpl === 'cover') {
    content = (
      <>
      <Img src={logoUrl(assetBase, brand, dark ? 'pictogramOnDark' : 'pictogramOnLight')} {...PT('logo', { position: 'absolute', right: -60, bottom: 120, height: 760, opacity: 0.12 })} />
      <div style={{ position: 'absolute', left: pad, right: pad, top: 260 }}>
        {slide?.kicker ? <div {...PT('etichetta', { fontFamily: bodyF, fontWeight: 800, fontSize: 38, letterSpacing: 6, color: em, textTransform: 'uppercase', marginBottom: 30 })}>{slide.kicker}</div> : null}
        <div {...PT('titolo', { ...titleStyle, fontSize: slide?.size || 140, lineHeight: 0.96 })}>
          <Rich s={title} color={em} italic={f.italicEmph} />
        </div>
        {body ? <div {...PT('testo', { fontFamily: bodyF, fontSize: 48, color: fg, opacity: 0.9, marginTop: 40, lineHeight: 1.2 })}>{body}</div> : null}
      </div>
      </>
    );
  } else if (tpl === 'punto') {
    content = (
      <div style={{ position: 'absolute', left: pad, right: pad, top: 200 }}>
        <div {...PT('numero', { fontFamily: bodyF, fontWeight: 800, fontSize: 250, color: em, lineHeight: 1 })}>{slide?.number || String(index).padStart(2, '0')}</div>
        <div {...PT('titolo', { ...titleStyle, fontSize: 104, lineHeight: 1.0, marginTop: 20 })}>
          <Rich s={title} color={em} italic={f.italicEmph} />
        </div>
        <div {...PT('testo', { fontFamily: bodyF, fontSize: 56, color: fg, opacity: 0.88, marginTop: 40, lineHeight: 1.25 })}>{body}</div>
      </div>
    );
  } else if (tpl === 'lista') {
    const items: string[] = slide?.items || [];
    content = (
      <div style={{ position: 'absolute', left: pad, right: pad, top: 180 }}>
        <div {...PT('titolo', { ...titleStyle, fontSize: 100, lineHeight: 1.0, marginBottom: 60 })}>
          <Rich s={title} color={em} italic={f.italicEmph} />
        </div>
        {items.map((it, i) => (
          <Stag key={i} i={i} pt={PT} style={{ display: 'flex', gap: 28, alignItems: 'flex-start', margin: '0 0 40px', fontFamily: bodyF, fontSize: 62, color: fg, lineHeight: 1.2 }}>
            <div style={{ width: 74, height: 74, flex: 'none', borderRadius: 18, background: slide?.mode === 'x' ? '#D64545' : em, color: dark ? P.primary : '#fff', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 38 }}>{slide?.mode === 'x' ? '✕' : slide?.mode === 'num' ? i + 1 : '✓'}</div>
            <div>{it}</div>
          </Stag>
        ))}
      </div>
    );
  } else if (tpl === 'citazione') {
    content = (
      <div style={{ position: 'absolute', left: pad, right: pad, top: 230 }}>
        <div {...PT('decoro', { fontFamily: 'DMSerif', fontSize: 260, color: em, lineHeight: 0.6 })}>“</div>
        <div {...PT('titolo', { fontFamily: 'DMSerif', fontSize: 98, color: fg, lineHeight: 1.08, marginTop: 30 })}>
          <Rich s={title} color={em} italic />
        </div>
        {body ? <div {...PT('testo', { fontFamily: bodyF, fontWeight: 700, fontSize: 40, color: em, marginTop: 50, letterSpacing: 2 })}>— {body}</div> : null}
      </div>
    );
  } else if (tpl === 'dato') {
    content = (
      <div style={{ position: 'absolute', left: pad, right: pad, top: 250, textAlign: 'center' }}>
        <div {...PT('numero', { fontFamily: bodyF, fontWeight: 800, fontSize: 400, color: em, lineHeight: 1 })}>{slide?.number || '180'}</div>
        <div {...PT('titolo', { ...titleStyle, fontSize: 96, lineHeight: 1.02, marginTop: 20 })}>
          <Rich s={title} color={em} italic={f.italicEmph} />
        </div>
        <div {...PT('testo', { fontFamily: bodyF, fontSize: 54, color: fg, opacity: 0.85, marginTop: 30, lineHeight: 1.25 })}>{body}</div>
      </div>
    );
  } else if (tpl === 'mitoverita') {
    content = (
      <div style={{ position: 'absolute', left: pad, right: pad, top: 170 }}>
        <div {...PT('titolo', { ...titleStyle, fontSize: 96, marginBottom: 60 })}>
          <Rich s={title || 'Mito vs *verità*'} color={em} italic={f.italicEmph} />
        </div>
        {[
          { l: '✕ MITO', t: slide?.left || '', c: '#D64545' },
          { l: '✓ VERITÀ', t: slide?.right || '', c: P.primary },
        ].map((b, i) => (
          <div key={i} {...PT('voce' + (i + 1), { background: '#fff', borderRadius: 30, padding: '40px 46px', marginBottom: 36, borderLeft: `18px solid ${b.c}`, boxShadow: '0 10px 30px rgba(0,0,0,.08)' })}>
            <div style={{ fontFamily: bodyF, fontWeight: 800, fontSize: 44, color: b.c, letterSpacing: 3 }}>{b.l}</div>
            <div style={{ fontFamily: bodyF, fontWeight: 600, fontSize: 64, color: '#0B0F0A', lineHeight: 1.12, marginTop: 10 }}>{b.t}</div>
          </div>
        ))}
      </div>
    );
  } else if (tpl === 'foto') {
    content = (
      <>
        {slide?.image ? <Img src={img(slide.image) as string} {...PT('immagine', { position: 'absolute', left: 0, top: 0, width: 1080, height: 820, objectFit: 'cover' })} /> : <div style={{ position: 'absolute', left: 0, top: 0, width: 1080, height: 820, background: P.accent }} />}
        <div style={{ position: 'absolute', left: pad, right: pad, top: 870 }}>
          <div {...PT('titolo', { ...titleStyle, fontSize: 72, lineHeight: 1.02 })}>
            <Rich s={title} color={em} italic={f.italicEmph} />
          </div>
          <div {...PT('testo', { fontFamily: bodyF, fontSize: 40, color: fg, opacity: 0.88, marginTop: 20, lineHeight: 1.25 })}>{body}</div>
        </div>
      </>
    );
  } else if (tpl === 'cta') {
    content = (
      <div style={{ position: 'absolute', left: pad, right: pad, top: 230, textAlign: 'center' }}>
        <Img src={logoUrl(assetBase, brand, dark ? 'pictogramOnDark' : 'pictogramOnLight')} {...PT('logo', { height: 260 })} />
        <div {...PT('titolo', { ...titleStyle, fontSize: 110, lineHeight: 1.0, marginTop: 60 })}>
          <Rich s={title || 'Vuoi correre *senza dolore*?'} color={em} italic={f.italicEmph} />
        </div>
        <div {...PT('testo', { fontFamily: bodyF, fontWeight: 700, fontSize: 62, color: fg, marginTop: 60, lineHeight: 1.3 })}>
          {body || 'Commenta'}{' '}
          {slide?.keyword ? <span style={{ background: dark ? '#fff' : P.primary, color: dark ? P.primary : '#fff', padding: '4px 22px', borderRadius: 14, fontWeight: 800 }}>{slide.keyword}</span> : null}
        </div>
      </div>
    );
  }

  if (tpl === 'domanda') {
    content = (
      <div style={{ position: 'absolute', left: pad, right: pad, top: 0, bottom: 160, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div {...PT('decoro', { fontFamily: bodyF, fontWeight: 800, fontSize: 260, color: em, lineHeight: 0.8 })}>?</div>
        <div {...PT('titolo', { ...titleStyle, fontSize: 112, lineHeight: 1.0, marginTop: 30 })}>
          <Rich s={title} color={em} italic={f.italicEmph} />
        </div>
        {body ? <div {...PT('testo', { fontFamily: bodyF, fontSize: 52, color: fg, opacity: 0.85, marginTop: 36 })}>{body}</div> : null}
      </div>
    );
  } else if (tpl === 'passi') {
    const items: string[] = slide?.items || [];
    content = (
      <div style={{ position: 'absolute', left: pad, right: pad, top: 170 }}>
        <div {...PT('titolo', { ...titleStyle, fontSize: 92, lineHeight: 1.0, marginBottom: 56 })}>
          <Rich s={title} color={em} italic={f.italicEmph} />
        </div>
        {items.map((it, i) => (
          <div key={i} {...PT('voce' + (i + 1), { display: 'flex', gap: 30, alignItems: 'center', marginBottom: 36 })}>
            <div style={{ width: 96, height: 96, flex: 'none', borderRadius: 60, background: em, color: dark ? P.primary : '#fff', display: 'grid', placeItems: 'center', fontFamily: bodyF, fontWeight: 800, fontSize: 56 }}>{i + 1}</div>
            <div style={{ fontFamily: bodyF, fontWeight: 600, fontSize: 56, color: fg, lineHeight: 1.15 }}>{it}</div>
          </div>
        ))}
      </div>
    );
  } else if (tpl === 'testo') {
    content = (
      <div style={{ position: 'absolute', left: pad, right: pad, top: 170 }}>
        <div {...PT('titolo', { ...titleStyle, fontSize: 80, lineHeight: 1.02, marginBottom: 40 })}>
          <Rich s={title} color={em} italic={f.italicEmph} />
        </div>
        <div {...PT('testo', { fontFamily: bodyF, fontSize: 50, color: fg, lineHeight: 1.4, whiteSpace: 'pre-wrap' })}>
          <Rich s={body} color={em} />
        </div>
      </div>
    );
  } else if (tpl === 'primadopo') {
    content = (
      <div style={{ position: 'absolute', left: pad, right: pad, top: 170 }}>
        <div {...PT('titolo', { ...titleStyle, fontSize: 88, marginBottom: 50 })}>
          <Rich s={title || 'Prima e *dopo*'} color={em} italic={f.italicEmph} />
        </div>
        <div style={{ display: 'flex', gap: 30 }}>
          {[
            { l: 'PRIMA', t: slide?.left || '', c: '#8A918C' },
            { l: 'DOPO', t: slide?.right || '', c: P.primary },
          ].map((b, i) => (
            <div key={i} {...PT('voce' + (i + 1), { flex: 1, background: i ? P.primary : '#fff', color: i ? '#fff' : '#0B0F0A', borderRadius: 30, padding: '40px 36px', minHeight: 520, boxShadow: '0 10px 30px rgba(0,0,0,.08)' })}>
              <div style={{ fontFamily: bodyF, fontWeight: 800, fontSize: 42, letterSpacing: 4, color: i ? P.accent : b.c }}>{b.l}</div>
              <div style={{ fontFamily: bodyF, fontWeight: 600, fontSize: 54, lineHeight: 1.15, marginTop: 20 }}>{b.t}</div>
            </div>
          ))}
        </div>
      </div>
    );
  } else if (tpl === 'copertina') {
    content = (
      <>
        {slide?.image ? <Img src={img(slide.image) as string} {...PT('immagine', { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' })} /> : <AbsoluteFill style={{ background: P.primary }} />}
        <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0) 35%, rgba(0,0,0,.75) 100%)' }} />
        <div style={{ position: 'absolute', left: pad, right: pad, bottom: FH * 0.2 }}>
          {slide?.kicker ? <div {...PT('etichetta', { display: 'inline-block', background: P.primary, color: '#fff', fontFamily: bodyF, fontWeight: 800, fontSize: 40, padding: '8px 24px', borderRadius: 40, marginBottom: 26 })}>{slide.kicker}</div> : null}
          <div {...PT('titolo', { ...titleStyle, color: '#fff', fontSize: slide?.size || 130, lineHeight: 0.98, textShadow: '0 6px 30px rgba(0,0,0,.5)' })}>
            <Rich s={title} color={P.accent} italic={f.italicEmph} />
          </div>
        </div>
      </>
    );
  }

  return (
    <AbsoluteFill style={{ background: bg, fontFamily: look?.body }}>
      <AbsoluteFill data-rs-frame="1" style={{ pointerEvents: 'none' }} />
      <BgMove>{look ? <DesignDecor d={design} index={index} total={total} FH={FH} P={P} look={look} img={img(slide?.bgImage || style?.bgImages?.[index % (style?.bgImages?.length || 1)])} /> : null}</BgMove>
      {fullImg ? (
        <>
          <Img src={fullImg as string} {...PT('immagine', { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' })} />
          <AbsoluteFill style={{ background: `linear-gradient(180deg, ${cu.overlay || '#0B0F0A'}55 0%, ${cu.overlay || '#0B0F0A'}99 45%, ${cu.overlay || '#0B0F0A'}EE 100%)` }} />
        </>
      ) : null}
      {cu ? <RefLayer cu={cu} index={index} total={total} FH={FH} em={em} fg={fg} dark={dark} /> : null}
      <AnimWrap>
        {look?.card ? <div style={{ position: 'absolute', inset: 70, background: look.card === true ? (look.dark ? 'rgba(255,255,255,.08)' : '#fff') : look.card, borderRadius: 36, boxShadow: '0 20px 50px rgba(0,0,0,.12)' }} /> : null}
        <div style={{ position: 'absolute', inset: 0, textAlign: look?.align === 'center' ? 'center' : undefined, fontSize: look?.scale ? `${look.scale}em` : undefined }}>{content}</div>
      </AnimWrap>
      <SlideElements els={slide?.elements} assetBase={assetBase} P={P} f={f} FH={FH} />
      {slide?.fonte ? <div {...PT('fonte', { position: 'absolute', left: pad, right: pad, bottom: 150, fontFamily: bodyF, fontSize: 26, color: fg, opacity: 0.7, fontStyle: 'italic' })}>Fonte: {String(slide.fonte).replace(/^Fonte:\s*/i, '')}</div> : null}
      {/* piè di pagina */}
      <div {...PT('piede', { position: 'absolute', left: pad, right: pad, bottom: 70, display: 'flex', alignItems: 'center', justifyContent: 'space-between' })}>
        <Img src={logoUrl(assetBase, brand, dark ? 'onDark' : 'onLight')} style={{ height: 64 }} />
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {Array.from({ length: total }).map((_, i) => (
            <div key={i} style={{ width: i === index ? 34 : 12, height: 12, borderRadius: 10, background: i === index ? em : dark ? 'rgba(255,255,255,.4)' : 'rgba(0,0,0,.2)' }} />
          ))}
        </div>
        <div style={{ fontFamily: bodyF, fontWeight: 700, fontSize: 34, color: fg, opacity: 0.8 }}>{index < total - 1 ? 'Scorri →' : brand?.handle || ''}</div>
      </div>
    </AbsoluteFill>
  );
};
