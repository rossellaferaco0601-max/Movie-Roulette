// @ts-nocheck — codice ReelStudio (PC di Ross) importato così com'è; vedi reelstudio-ref/
import type React from 'react';
import { interpolate, spring, Easing } from 'remotion';

export const ANIMS: Record<string, string> = {
  pop: 'Pop + rimbalzo',
  slideUp: 'Scivola dal basso',
  slideDown: 'Scende dall\'alto',
  slideLeft: 'Entra da destra',
  scale: 'Scala da 0',
  rotate: 'Ruota e atterra',
  fade: 'Dissolvenza',
  wiggle: 'Tremolio',
  cut: 'Taglio secco',
  stamp: 'Timbro (sbatte)',
  blurIn: 'Da sfocato a nitido',
  drop: 'Cade dall\'alto (gravità)',
  zoomOut: 'Da grande a normale',
  flip: 'Si ribalta (3D)',
  glitch: 'Glitch digitale',
};

// stile di entrata/uscita per un elemento che dura `dur` frame
export const enterExit = (anim: string, frame: number, fps: number, dur: number) => {
  const sp = spring({ frame, fps, config: { damping: 11, stiffness: 160, mass: 0.7 } });
  const spSoft = spring({ frame, fps, config: { damping: 200 } });
  const outF = 8;
  const out = interpolate(frame, [dur - outF, dur], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  let tr = '';
  let op = 1;
  let blur = 0;
  switch (anim) {
    case 'slideUp':
      tr = `translateY(${(1 - spSoft) * 220}px)`;
      op = spSoft;
      break;
    case 'slideDown':
      tr = `translateY(${(1 - spSoft) * -260}px)`;
      op = spSoft;
      break;
    case 'slideLeft':
      tr = `translateX(${(1 - spSoft) * 700}px)`;
      break;
    case 'scale':
      tr = `scale(${spSoft})`;
      break;
    case 'rotate':
      tr = `rotate(${(1 - sp) * -25}deg) scale(${0.4 + 0.6 * sp})`;
      op = Math.min(1, frame / 4);
      break;
    case 'fade':
      op = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: 'clamp' });
      break;
    case 'wiggle':
      tr = `scale(${sp}) rotate(${Math.sin(frame / 2.2) * 4 * Math.max(0, 1 - frame / 40)}deg)`;
      break;
    case 'cut':
      break;
    case 'stamp': {
      const s = interpolate(frame, [0, 5, 9], [2.4, 0.92, 1], { extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) });
      tr = `scale(${s})`;
      op = Math.min(1, frame / 3);
      break;
    }
    case 'blurIn':
      op = spSoft;
      tr = `scale(${1.08 - 0.08 * spSoft})`;
      blur = (1 - spSoft) * 24;
      break;
    case 'drop': {
      const d = spring({ frame, fps, config: { damping: 8, stiffness: 120, mass: 0.9 } });
      tr = `translateY(${(1 - d) * -900}px) rotate(${(1 - d) * 8}deg)`;
      break;
    }
    case 'zoomOut':
      tr = `scale(${1 + (1 - spSoft) * 0.8})`;
      op = spSoft;
      break;
    case 'flip':
      tr = `perspective(1200px) rotateX(${(1 - spSoft) * 90}deg)`;
      op = Math.min(1, frame / 3);
      break;
    case 'glitch': {
      const g = frame < 10 ? (frame % 3 === 0 ? 18 : frame % 3 === 1 ? -14 : 6) : 0;
      tr = `translateX(${g}px) skewX(${g / 3}deg)`;
      op = frame < 10 ? (frame % 2 ? 0.6 : 1) : 1;
      break;
    }
    case 'pop':
    default:
      tr = `scale(${sp})`;
  }
  // uscita
  const outScale = anim === 'cut' ? 1 : 0.85 + 0.15 * out;
  return { transform: `${tr} scale(${outScale})`, opacity: op * (anim === 'cut' ? (frame < dur ? 1 : 0) : out), ...(blur > 0.2 ? { filter: `blur(${blur}px)` } : {}) } as React.CSSProperties;
};
