// @ts-nocheck — codice ReelStudio (PC di Ross) importato così com'è; vedi video-engine/reelstudio/
import React from 'react';
import { spring, interpolate } from 'remotion';
import { OutWord, groupWords, TITLE_FONTS } from './lib';

// Stili dei sottotitoli: ognuno si può poi modificare (font, colori, contorno, sfondo, animazione)
export const CAPTION_STYLES: Record<string, string> = {
  boldpop: 'Bold Pop (parola evidenziata)',
  brandpill: 'Pillola brand',
  karaoke: 'Karaoke',
  box: 'Box classico',
  serif: 'Serif editoriale',
  minimal: 'Minimal',
  outline: 'Contorno grosso',
  wordbyword: 'Una parola alla volta',
  hormozi: 'Parola che cresce («Hormozi»)',
  marker: 'Evidenziatore',
  neon: 'Neon',
  tiktok: 'Riga nera TikTok',
  bounce: 'Parole che rimbalzano',
  typewriter: 'Macchina da scrivere',
  gradient: 'Gradiente',
  shadow3d: 'Ombra 3D',
  handwritten: 'Scritto a mano',
  stack: 'Impilato grande/piccolo',
  glass: 'Vetro smerigliato',
  cinema: 'Cinema (piccolo, elegante)',
  banda: 'Banda verde del brand',
  adesivo: 'Adesivo bianco',
  sottolineata: 'Parola detta sottolineata',
  duetono: 'Due colori',
  maxi: 'Maxi condensato',
  contornobrand: 'Contorno verde',
  none: 'Nessuno',
};
export const CAPTION_HELP: Record<string, string> = {
  boldpop: 'Maiuscolo grosso con contorno, la parola detta si colora: il più usato nei reel.',
  brandpill: 'Pillola verde del brand con la parola attiva in azzurro.',
  karaoke: 'Le parole si accendono mentre vengono dette.',
  box: 'Frase intera su sfondo scuro: classico e leggibile.',
  serif: 'Elegante, parole chiave in corsivo colorato.',
  minimal: 'Piccoli e discreti, per video calmi.',
  outline: 'Contorno nero spesso, stile TikTok.',
  wordbyword: 'Una parola alla volta al centro: ritmo altissimo.',
  hormozi: 'Maiuscolo bianco, la parola detta diventa azzurra (colore del brand) e più grande.',
  marker: 'La parola detta viene evidenziata come con un pennarello.',
  neon: 'Scritta luminosa che si accende, molto d’impatto di sera.',
  tiktok: 'Ogni riga su una striscia nera, come i sottotitoli automatici di TikTok.',
  bounce: 'Ogni parola entra saltando dal basso.',
  typewriter: 'Le lettere compaiono una alla volta.',
  gradient: 'Testo con sfumatura di colore del brand.',
  shadow3d: 'Testo con ombra spessa a rilievo, stile pop.',
  handwritten: 'Sembra scritto a mano, caldo e personale.',
  stack: 'Due righe: la parola importante enorme, le altre piccole.',
  glass: 'Riquadro di vetro sfocato dietro il testo, moderno.',
  cinema: 'Piccoli in basso, serif bianco, stile film.',
  banda: 'Ogni riga su una striscia verde Correre Naturale, testo bianco.',
  adesivo: 'Riga su un adesivo bianco leggermente ruotato, testo nero: fresco e social.',
  sottolineata: 'Testo bianco pulito, sotto la parola detta compare una barra azzurra.',
  duetono: 'Le parole si alternano bianco e azzurro: ritmo visivo senza contorni.',
  maxi: 'Poche parole enormi in carattere condensato, per reel ad alta energia.',
  contornobrand: 'Testo bianco con contorno verde del brand.',
  none: 'Niente sottotitoli.',
};

// Effetti per le parole evidenziate (le *parole chiave*)
export const WORD_FX: Record<string, [string, string]> = {
  colore: ['Colore', 'La parola chiave cambia colore.'],
  box: ['Riquadro', 'Rettangolo colorato dietro la parola.'],
  sottolinea: ['Sottolineata', 'Una linea che si disegna sotto la parola.'],
  glow: ['Bagliore', 'La parola si illumina.'],
  grande: ['Più grande', 'La parola chiave è più grande delle altre.'],
  shake: ['Tremolio', 'La parola trema per un attimo.'],
  corsivo: ['Corsivo serif', 'La parola diventa in corsivo elegante.'],
  barrata: ['Barrata', 'Una linea la attraversa (per i miti da smontare).'],
  onda: ['Onda', 'Le lettere ondeggiano.'],
  cerchio: ['Cerchiata', 'Un cerchio a mano attorno alla parola.'],
  emoji: ['Con emoji', 'Aggiunge un’emoji a tema dopo la parola.'],
  vetro: ['Si infrange (vetro)', 'Dopo essere stata detta, la parola si rompe in schegge che volano via.'],
  glitch: ['Glitch', 'La parola si sdoppia in rosso e azzurro per un attimo, stile digitale.'],
  cade: ['Lettere che cadono', 'Le lettere cadono dall’alto una alla volta e rimbalzano.'],
  pulsa: ['Battito', 'La parola pulsa come un cuore.'],
  timbro: ['Timbro', 'La parola arriva grande e “sbatte” come un timbro.'],
};
const EMOJI_FOR: [RegExp, string][] = [
  [/corr|corsa|run/i, '🏃'],
  [/piede|piedi|tallon|appogg/i, '🦶'],
  [/cuor|battit/i, '❤️'],
  [/tempo|minut|second|veloc/i, '⏱'],
  [/errore|sbagli|mai|stop/i, '❌'],
  [/giusto|corrett|sempre|sì/i, '✅'],
  [/dolor|male|infortun/i, '🤕'],
  [/fiato|respir/i, '💨'],
  [/\d/, '🔥'],
];

const POSY: Record<string, number> = { high: 0.24, mid: 0.52, low: 0.66, bottom: 0.74 };

export const Captions: React.FC<{ words: OutWord[]; t: number; fps: number; style: any; P: any }> = ({ words, t, fps, style, P }) => {
  const cs = style?.captions || {};
  const kind = cs.style || 'boldpop';
  const perLine = kind === 'wordbyword' ? 1 : cs.wordsPerLine || (['box', 'minimal', 'tiktok', 'cinema'].includes(kind) ? 5 : kind === 'maxi' ? 2 : 3);
  const nLines = kind === 'wordbyword' ? 1 : Math.max(1, Math.min(3, cs.lines || 1));
  const maxWords = perLine * nLines;
  const groups = React.useMemo(() => groupWords(words, maxWords, (['box', 'tiktok', 'cinema'].includes(kind) ? 30 : 20) * nLines), [words, maxWords, kind, nLines]);
  if (kind === 'none' || !words.length) return null;
  const g = groups.find((gr) => t >= gr[0].start - 0.05 && t <= gr[gr.length - 1].end + 0.25);
  if (!g) return null;
  const baseSize = kind === 'minimal' || kind === 'cinema' ? 50 : kind === 'box' || kind === 'tiktok' ? 58 : kind === 'serif' || kind === 'handwritten' ? 84 : 78;
  // righe troppo lunghe (es. «cardiofrequenzimetro») si rimpiccioliscono per non uscire dal fotogramma (5/11, Ross)
  const perLine0 = kind === 'wordbyword' ? 1 : cs.wordsPerLine || 3;
  let longest = 0;
  for (let i = 0; i < g.length; i += perLine0) longest = Math.max(longest, g.slice(i, i + perLine0).map((w) => w.text).join(' ').length);
  const fit = Math.min(1, (cs.fitChars || 17) / Math.max(1, longest));
  const size = (cs.size || 1) * baseSize * fit;
  const y = (typeof cs.y === 'number' ? cs.y : POSY[cs.position || 'low'] ?? 0.66) * 1920;
  const hl = cs.highlight || P.highlight || P.primary;
  const emphC = cs.emphColor || P.accent;
  const upper = cs.uppercase ?? ['boldpop', 'outline', 'wordbyword', 'brandpill', 'hormozi', 'neon', 'bounce', 'shadow3d', 'stack'].includes(kind);
  const font = cs.font ? TITLE_FONTS[cs.font] : null;
  const gStartF = Math.round(g[0].start * fps);
  const local = Math.round(t * fps) - gStartF;
  const enter = spring({ frame: local, fps, config: { damping: 14, stiffness: 200 } });
  const wfx = cs.wordFx || 'colore';
  const clean = (s: string) => (cs.noPunct ? s.replace(/[.,;:!?…«»"“”]/g, '') : s);

  const wordEls = g.map((w, i) => {
    const active = t >= w.start && t <= w.end + 0.05;
    const spoken = t >= w.start;
    let txt = clean(upper ? w.text.toUpperCase() : w.text);
    const wf = Math.round((t - w.start) * fps);
    const pop = spring({ frame: wf, fps, config: { damping: 10, stiffness: 260 } });
    let st: React.CSSProperties = { display: 'inline-block', margin: '0 0.2em', whiteSpace: 'pre', position: 'relative' };
    const stroke = (px: number) => ({ WebkitTextStroke: `${px}px #000`, paintOrder: 'stroke fill' as any });
    switch (kind) {
      case 'boldpop':
        st = { ...st, color: '#fff', fontFamily: 'Blinker', fontWeight: 800, textShadow: '0 5px 0 #000, 0 0 22px rgba(0,0,0,.6)', ...stroke(3), ...(active ? { background: hl, borderRadius: 14, padding: '0 0.16em', transform: `scale(${1 + (cs.activeScale ?? 0.12) * (1 - Math.abs(1 - pop))})`, WebkitTextStroke: '0px', textShadow: 'none' } : {}) };
        break;
      case 'brandpill':
        st = { ...st, color: active ? P.accent : '#fff', fontFamily: 'Blinker', fontWeight: 800 };
        break;
      case 'karaoke':
        st = { ...st, color: spoken ? '#fff' : 'rgba(255,255,255,.45)', fontFamily: 'Blinker', fontWeight: 800, textShadow: '0 4px 18px rgba(0,0,0,.7)' };
        break;
      case 'box':
        st = { ...st, color: '#fff', fontFamily: 'Blinker', fontWeight: 700, margin: '0 0.12em' };
        break;
      case 'serif':
        st = { ...st, color: '#fff', fontFamily: 'DMSerif', textShadow: '0 4px 24px rgba(0,0,0,.6)', opacity: spoken ? 1 : 0 };
        break;
      case 'minimal':
        st = { ...st, color: '#fff', fontFamily: 'Blinker', fontWeight: 600, textShadow: '0 2px 12px rgba(0,0,0,.8)' };
        break;
      case 'outline':
        st = { ...st, color: active ? hl : '#fff', fontFamily: 'Anton', ...stroke(10), letterSpacing: 1 };
        break;
      case 'wordbyword':
        st = { ...st, color: '#fff', fontFamily: 'Blinker', fontWeight: 800, transform: `scale(${0.6 + 0.4 * pop})`, textShadow: '0 6px 0 #000, 0 0 30px rgba(0,0,0,.5)', ...stroke(3) };
        break;
      case 'hormozi':
        st = { ...st, color: active ? cs.activeColor || P.accent : '#fff', fontFamily: 'Montserrat', fontWeight: 900, ...stroke(8), textShadow: '0 6px 0 rgba(0,0,0,.7)', transform: active ? `scale(${(cs.activeBase ?? 1.08) + (cs.activeScale ?? 0.1) * (1 - Math.abs(1 - pop))})` : 'none' };   // 5/11 (vlog v3): ingrandimento regolabile, la parola attiva non deve coprire le vicine
        break;
      case 'marker':
        st = { ...st, color: '#111', fontFamily: 'Poppins', fontWeight: 800, background: active ? `linear-gradient(transparent 15%, ${cs.activeColor || P.accent} 15%, ${cs.activeColor || P.accent} 85%, transparent 85%)` : 'rgba(255,255,255,.92)', padding: '0 0.18em', margin: '0 0.04em' };
        break;
      case 'neon': {
        const on = spoken ? 1 : 0.25;
        const c = cs.activeColor || P.accent;
        st = { ...st, color: '#fff', fontFamily: 'Righteous', opacity: on, textShadow: `0 0 8px ${c}, 0 0 22px ${c}, 0 0 44px ${c}` };
        break;
      }
      case 'tiktok':
        st = { ...st, color: '#fff', fontFamily: 'DMSans', fontWeight: 800, margin: '0 0.1em' };
        break;
      case 'bounce': {
        const b = spring({ frame: wf, fps, config: { damping: 8, stiffness: 240 } });
        st = { ...st, color: '#fff', fontFamily: 'Poppins', fontWeight: 800, ...stroke(5), opacity: spoken ? 1 : 0, transform: `translateY(${(1 - b) * 60}px)` };
        break;
      }
      case 'typewriter': {
        const n = Math.max(0, Math.min(txt.length, Math.floor(((t - w.start) / Math.max(0.05, w.end - w.start)) * txt.length)));
        txt = spoken ? txt.slice(0, Math.max(1, n)) : '';
        st = { ...st, color: '#fff', fontFamily: 'JBMono, monospace', fontWeight: 700, textShadow: '0 3px 14px rgba(0,0,0,.8)' };
        break;
      }
      case 'gradient':
        st = { ...st, fontFamily: 'Montserrat', fontWeight: 900, backgroundImage: `linear-gradient(90deg, ${P.accent}, #fff, ${hl})`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', filter: 'drop-shadow(0 4px 10px rgba(0,0,0,.6))' };
        break;
      case 'shadow3d':
        st = { ...st, color: active ? cs.activeColor || P.accent : '#fff', fontFamily: 'ArchivoBlack', textShadow: `4px 4px 0 ${P.primary}, 8px 8px 0 #000` };
        break;
      case 'handwritten':
        st = { ...st, color: '#fff', fontFamily: 'Caveat', fontWeight: 700, textShadow: '0 3px 12px rgba(0,0,0,.7)', opacity: spoken ? 1 : 0.35 };
        break;
      case 'stack':
        st = { ...st, display: w.emph ? 'block' : 'inline-block', color: '#fff', fontFamily: 'Bebas', fontSize: w.emph ? '1.9em' : '0.85em', lineHeight: 0.95, ...stroke(4) };
        break;
      case 'glass':
        st = { ...st, color: '#fff', fontFamily: 'Blinker, Poppins, sans-serif', fontWeight: 800, opacity: spoken ? 1 : 0.72, textShadow: '0 2px 10px rgba(0,0,0,.45)' };
        break;
      case 'cinema':
        st = { ...st, color: '#fff', fontFamily: 'Playfair, serif', fontWeight: 800, textShadow: '0 2px 10px rgba(0,0,0,.9)' };
        break;
      case 'banda':
        st = { ...st, color: active ? P.accent : '#fff', fontFamily: 'Blinker', fontWeight: 800, margin: '0 0.12em' };
        break;
      case 'adesivo':
        st = { ...st, color: active ? P.primary : '#0B0F0A', fontFamily: 'Poppins', fontWeight: 800, margin: '0 0.12em' };
        break;
      case 'sottolineata':
        st = { ...st, color: '#fff', fontFamily: 'Blinker', fontWeight: 800, textShadow: '0 3px 14px rgba(0,0,0,.7)', backgroundImage: active ? `linear-gradient(${cs.activeColor || P.accent}, ${cs.activeColor || P.accent})` : 'none', backgroundSize: '100% .14em', backgroundPosition: '0 96%', backgroundRepeat: 'no-repeat' };
        break;
      case 'duetono':
        st = { ...st, color: i % 2 ? P.accent : '#fff', fontFamily: 'Montserrat', fontWeight: 900, textShadow: '0 4px 16px rgba(0,0,0,.6)', transform: active ? 'scale(1.08)' : 'none' };
        break;
      case 'maxi':
        st = { ...st, color: active ? P.accent : '#fff', fontFamily: 'Bebas', fontSize: '1.45em', lineHeight: 0.95, ...stroke(4), textShadow: '0 6px 0 rgba(0,0,0,.5)' };
        break;
      case 'contornobrand':
        st = { ...st, color: active ? P.accent : '#fff', fontFamily: 'Blinker', fontWeight: 800, WebkitTextStroke: `6px ${P.primary}`, paintOrder: 'stroke fill' as any };
        break;
    }
    // modifiche manuali
    if (font) st = { ...st, fontFamily: font.css, fontWeight: font.weight as any };
    if (cs.color && !active) st.color = cs.color;
    if (cs.stroke !== undefined) Object.assign(st, cs.stroke > 0 ? stroke(cs.stroke) : { WebkitTextStroke: '0px' });
    if (cs.shadow === false) st.textShadow = 'none';
    if (cs.letterSpacing) st.letterSpacing = cs.letterSpacing;
    if (cs.wordGap) st.margin = `0 ${cs.wordGap}em`;   // spazio tra le parole (la parola attiva ingrandita non deve toccare le vicine)
    // effetto sulle parole chiave
    let extra: React.ReactNode = null;
    if (w.emph) {
      const k = spring({ frame: wf, fps, config: { damping: 200 } });
      switch (wfx) {
        case 'colore':
          if (!active || kind !== 'boldpop') st.color = emphC;
          if (kind === 'serif') st.fontStyle = 'italic';
          break;
        case 'box':
          st = { ...st, background: emphC, color: P.primary === emphC ? '#fff' : '#0B0F0A', borderRadius: 12, padding: '0 0.18em', WebkitTextStroke: '0px', textShadow: 'none' };
          break;
        case 'sottolinea':
          extra = <span style={{ position: 'absolute', left: 0, bottom: '-0.08em', height: '0.12em', width: `${k * 100}%`, background: emphC, borderRadius: 6 }} />;
          break;
        case 'glow':
          st = { ...st, color: '#fff', textShadow: `0 0 10px ${emphC}, 0 0 28px ${emphC}, 0 0 50px ${emphC}` };
          break;
        case 'grande':
          st = { ...st, fontSize: '1.35em', color: emphC };
          break;
        case 'shake':
          st = { ...st, color: emphC, transform: `${st.transform || ''} translateX(${spoken && wf < 12 ? Math.sin(wf * 2.5) * 8 : 0}px)` };
          break;
        case 'corsivo':
          st = { ...st, fontFamily: 'Instrument, DMSerif, serif', fontStyle: 'italic', fontWeight: 400, color: emphC, WebkitTextStroke: '0px', fontSize: '1.15em' };
          break;
        case 'barrata':
          extra = <span style={{ position: 'absolute', left: '-4%', top: '48%', height: '0.1em', width: `${k * 108}%`, background: '#E2372B', transform: 'rotate(-4deg)' }} />;
          break;
        case 'onda':
          return (
            <span key={i} style={{ ...st, color: emphC }}>
              {txt.split('').map((ch, j) => (
                <span key={j} style={{ display: 'inline-block', transform: `translateY(${Math.sin(wf / 3 + j * 0.8) * 10}px)` }}>
                  {ch}
                </span>
              ))}
            </span>
          );
        case 'cerchio':
          st.color = emphC;
          extra = (
            <svg viewBox="0 0 100 40" preserveAspectRatio="none" style={{ position: 'absolute', left: '-12%', top: '-18%', width: '124%', height: '136%', overflow: 'visible' }}>
              <ellipse cx="50" cy="20" rx="48" ry="18" fill="none" stroke={emphC} strokeWidth="3" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - k} />
            </svg>
          );
          break;
        case 'vetro': {
          // pezzi della parola che si separano dopo 0,35 s
          const br = Math.max(0, (wf - 10) / 12);
          if (br <= 0) {
            st.color = emphC;
            break;
          }
          const pieces = [
            [0, 0, 50, 55, -1, -1],
            [50, 0, 100, 45, 1, -1],
            [0, 55, 45, 100, -1, 1],
            [45, 45, 100, 100, 1, 1],
          ];
          return (
            <span key={i} style={{ ...st, color: emphC, position: 'relative' }}>
              <span style={{ visibility: 'hidden' }}>{txt}</span>
              {pieces.map(([x0, y0, x1, y1, dx, dy], j) => (
                <span key={j} style={{ position: 'absolute', left: 0, top: 0, clipPath: `polygon(${x0}% ${y0}%, ${x1}% ${y0 + (j % 2 ? 8 : -4)}%, ${x1}% ${y1}%, ${x0}% ${y1 - (j % 2 ? 6 : 0)}%)`, transform: `translate(${dx * br * 40}px, ${dy * br * 30 + br * br * 60}px) rotate(${dx * br * 25}deg)`, opacity: Math.max(0, 1 - br * 0.8) }}>
                  {txt}
                </span>
              ))}
            </span>
          );
        }
        case 'glitch': {
          const on = spoken && wf < 14 && wf % 3 !== 0;
          st = { ...st, color: emphC, textShadow: on ? `-6px 0 #ff2a55, 6px 0 #2ad8ff` : st.textShadow, transform: `${st.transform || ''} translateX(${on ? (wf % 2 ? 5 : -5) : 0}px)` };
          break;
        }
        case 'cade':
          return (
            <span key={i} style={{ ...st, color: emphC }}>
              {txt.split('').map((ch, j) => {
                const d = spring({ frame: wf - j * 2, fps, config: { damping: 9, stiffness: 200 } });
                return (
                  <span key={j} style={{ display: 'inline-block', transform: `translateY(${(1 - d) * -120}px)`, opacity: spoken ? Math.min(1, d * 2) : 0 }}>
                    {ch}
                  </span>
                );
              })}
            </span>
          );
        case 'pulsa':
          st = { ...st, color: emphC, transform: `${st.transform || ''} scale(${spoken ? 1 + 0.12 * Math.abs(Math.sin(wf / 4)) : 1})` };
          break;
        case 'timbro': {
          const sc = spoken ? interpolate(wf, [0, 5, 9], [2.2, 0.92, 1], { extrapolateRight: 'clamp' }) : 1;
          st = { ...st, color: emphC, transform: `${st.transform || ''} scale(${sc}) rotate(-4deg)` };
          break;
        }
        case 'emoji': {
          st.color = emphC;
          const em = (EMOJI_FOR.find(([re]) => re.test(w.text)) || [null, '✨'])[1];
          extra = <span style={{ marginLeft: '0.15em', WebkitTextStroke: '0px', display: 'inline-block', transform: `scale(${k})` }}>{em}</span>;
          break;
        }
      }
    }
    return (
      <span key={i} style={st}>
        {txt}
        {extra}
      </span>
    );
  });

  // più righe: vado a capo ogni «parole per riga»
  const lined: React.ReactNode[] = [];
  (wordEls as any[]).forEach((el, i) => {
    if (i && nLines > 1 && i % perLine === 0) lined.push(<br key={'br' + i} />);
    lined.push(el);
  });
  const animIn = cs.anim || (['minimal', 'box', 'tiktok', 'cinema', 'glass'].includes(kind) ? 'none' : 'pop');
  const wrapT = animIn === 'none' ? '' : animIn === 'slide' ? `translateY(${(1 - enter) * 40}px)` : animIn === 'fade' ? '' : `scale(${0.85 + 0.15 * enter})`;
  const wrap: React.CSSProperties = {
    position: 'absolute',
    left: 60,
    right: 60,
    top: y,
    transform: `translateY(-50%) ${wrapT}`,
    opacity: animIn === 'fade' ? enter : 1,
    textAlign: 'center',
    fontSize: size,
    lineHeight: 1.12,
  };
  const boxBg = cs.bg;
  if (kind === 'box' || kind === 'tiktok' || boxBg) {
    return (
      <div style={wrap}>
        <span style={{ background: boxBg || (kind === 'tiktok' ? '#000' : 'rgba(0,0,0,.62)'), padding: '10px 22px', borderRadius: kind === 'tiktok' ? 8 : 18, boxDecorationBreak: 'clone', WebkitBoxDecorationBreak: 'clone', lineHeight: 1.5 }}>{lined}</span>
      </div>
    );
  }
  if (kind === 'brandpill') {
    return (
      <div style={wrap}>
        <span style={{ background: P.primary, padding: '8px 26px', borderRadius: 60, display: 'inline-block', boxShadow: '0 10px 30px rgba(0,0,0,.3)' }}>{lined}</span>
      </div>
    );
  }
  if (kind === 'glass') {
    return (
      <div style={wrap}>
        <span style={{ display: 'inline-block', background: cs.glassBg || 'rgba(16,22,13,.42)', backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)', border: '2px solid rgba(255,255,255,.30)', boxShadow: '0 12px 34px rgba(0,0,0,.25)', padding: '16px 34px', borderRadius: 32 }}>{lined}</span>
      </div>
    );
  }
  if (kind === 'banda' || kind === 'adesivo')
    return (
      <div style={wrap}>
        <span style={{ background: kind === 'banda' ? P.primary : '#fff', padding: '8px 24px', borderRadius: kind === 'banda' ? 10 : 14, boxDecorationBreak: 'clone', WebkitBoxDecorationBreak: 'clone', lineHeight: 1.55, display: 'inline', transform: kind === 'adesivo' ? 'rotate(-2deg)' : undefined, boxShadow: kind === 'adesivo' ? '0 8px 20px rgba(0,0,0,.25)' : undefined }}>{lined}</span>
      </div>
    );
  return <div style={wrap}>{lined}</div>;
};

export const progressOf = (t: number, total: number) => interpolate(t, [0, total], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
