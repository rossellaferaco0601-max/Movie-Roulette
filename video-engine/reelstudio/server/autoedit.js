// Montaggio automatico: tagli dei silenzi, scelta del momento migliore, hook, effetti sulle parole chiave
const KEY = /(errore|errori|sbagli|segreto|trucco|consiglio|mai|sempre|devi|stop|attenzione|fatica|dolore|infortun|veloce|naturale|tallone|appoggio|cadenza|passo|postura|ginocchi|schiena|scarpe|gratis|guida|metodo|risultat|miglior|peggior)/i;
const NUM = /^\d+([.,]\d+)?%?$/;
const NUMWORDS = { uno: 1, una: 1, due: 2, tre: 3, quattro: 4, cinque: 5, sei: 6, sette: 7, otto: 8, nove: 9, dieci: 10, venti: 20, trenta: 30, cento: 100, mille: 1000 };
const UNIT = /^(km|chilometri|metri|minuti|min|secondi|ore|passi|%|percento|euro|€|volte|giorni|settimane|mesi|anni|battiti|kg|chili)/i;
const LISTW = /^(errori|consigli|esercizi|regole|motivi|cose|segreti|passi|step|trucchi|modi)/i;

const clean = (s) => (s || '').replace(/[.,!?;:«»"“”()]/g, '').trim();
const numOf = (w) => {
  const c = clean(w).toLowerCase();
  if (NUM.test(c)) return c;
  if (NUMWORDS[c] !== undefined) return String(NUMWORDS[c]);
  return null;
};

const T = require('../shared/taglio');
function sentences(words) {
  return T.sentences(words).map((x) => ({ ...x, words: words.slice(x.a, x.b + 1) }));
}

function scoreSentence(s) {
  let sc = 0;
  s.words.forEach((w, i) => {
    const c = clean(w.text).toLowerCase();
    if (KEY.test(c)) sc += 2;
    if (numOf(c)) sc += 2;
    if (c === 'tu' || c === 'devi' || c === 'puoi' || c === 'vuoi') sc += 1;
  });
  if (/\?$/.test(s.text)) sc += 1.5;
  return sc;
}

// segmenti senza silenzi
function speechSegments(words, gap = 0.45, pad = 0.1, duration = Infinity) {
  const segs = [];
  let cur = null;
  for (const w of words) {
    if (!cur) cur = { s: w.start, e: w.end };
    else if (w.start - cur.e <= gap) cur.e = Math.max(cur.e, w.end);
    else {
      segs.push(cur);
      cur = { s: w.start, e: w.end };
    }
  }
  if (cur) segs.push(cur);
  return segs.map((s) => ({ s: Math.max(0, s.s - pad), e: Math.min(duration, s.e + pad + 0.05) }));
}

function findMoments(sents, target, n = 3) {
  const cands = [];
  for (let i = 0; i < sents.length; i++) {
    let dur = 0;
    let sc = 0;
    for (let j = i; j < sents.length; j++) {
      dur += sents[j].end - sents[j].start;
      sc += scoreSentence(sents[j]);
      if (dur > target * 1.15) break;
      if (dur >= target * 0.6) cands.push({ i, j, start: sents[i].start, end: sents[j].end, dur, score: sc / Math.sqrt(dur) + (dur / target) * 1.5 + (/[.!?]$/.test(sents[j].text) ? 1 : 0) });
    }
  }
  cands.sort((a, b) => b.score - a.score);
  const picked = [];
  for (const c of cands) {
    if (picked.some((p) => !(c.end < p.start || c.start > p.end))) continue;
    picked.push(c);
    if (picked.length >= n) break;
  }
  return picked.map((c) => ({ start: c.start, end: c.end, dur: c.dur, sentences: Array.from({ length: c.j - c.i + 1 }, (_, k) => sents[c.i + k].i), title: sents[c.i].text.slice(0, 90), score: Math.round(c.score * 10) / 10 }));
}

function hookVariants(sents) {
  const all = sents.map((s) => s.text);
  const best = [...sents].sort((a, b) => scoreSentence(b) - scoreSentence(a))[0];
  const shorten = (t) => {
    const ws = t.replace(/[.]$/, '').split(/\s+/);
    return ws.slice(0, 8).join(' ') + (ws.length > 8 ? '…' : '');
  };
  const emph = (t) => {
    const ws = t.split(' ');
    let done = false;
    return ws
      .map((w) => {
        if (!done && (KEY.test(clean(w)) || /\d/.test(w))) {
          done = true;
          return `*${w}*`;
        }
        return w;
      })
      .join(' ');
  };
  const out = [];
  if (best) out.push(emph(shorten(best.text)));
  if (all[0]) out.push(emph(shorten(all[0])));
  const q = sents.find((s) => /\?$/.test(s.text));
  if (q) out.push(emph(shorten(q.text)));
  out.push('Stai correndo *sbagliato*?');
  out.push('L\'errore che fa il *90%* dei runner');
  out.push('Smetti di fare *questo* quando corri');
  return [...new Set(out)].slice(0, 6);
}

const DYN_GAP = [99, 6, 4, 2.6];

function autoEffects(outWordsList, total, opts) {
  const dyn = opts.dynamism ?? 2;
  if (dyn <= 0) return [];
  const minGap = DYN_GAP[dyn];
  const fx = [];
  let lastT = -10;
  const hookEnd = opts.hookDuration ?? 2.2;
  const ctaStart = total - (opts.ctaDuration ?? 3);
  let id = 0;
  const add = (type, start, extra = {}) => {
    if (start < hookEnd + 0.2 || start > ctaStart - 1) return false;
    if (start - lastT < minGap) return false;
    fx.push({ id: 'a' + id++, type, start: Math.round(start * 100) / 100, ...extra });
    lastT = start;
    return true;
  };
  const ws = outWordsList;
  const used = { emoji: 0, bw: 0, lower: 0 };
  if (opts.speaker && dyn >= 1 && total > 12) {
    fx.push({ id: 'a' + id++, type: 'lowerThird', start: Math.min(hookEnd + 0.4, 3), duration: 3, props: { name: opts.speaker.name, role: opts.speaker.role } });
  }
  for (let i = 0; i < ws.length; i++) {
    const w = ws[i];
    const c = clean(w.text).toLowerCase();
    const next = clean(ws[i + 1]?.text || '').toLowerCase();
    const n = numOf(c);
    if (n && UNIT.test(next)) {
      if (add('bigNumber', w.start, { duration: 2.2, props: { text: `${n} *${next}*`, sub: '' } })) continue;
    }
    if (n && LISTW.test(next)) {
      if (add('badge', w.start, { duration: 1.8, props: { text: `${n} ${next}` } })) continue;
    }
    if (/^(errore|errori|sbagli|sbagliato|sbagliata)/.test(c)) {
      if (add('badge', w.start, { duration: 1.6, sfx: 'errore', props: { text: '✕ ' + c, color: '#D64545' } })) continue;
    }
    if (/^(fatica|dolore|male|infortun|stanc|soffr)/.test(c) && used.bw < 2) {
      if (add('bw', Math.max(0, w.start - 0.3), { duration: 2.2, sfx: 'battito' })) {
        used.bw++;
        continue;
      }
    }
    if (/^(piede|piedi|tallone|appoggio|avampiede)/.test(c) && used.emoji < 3) {
      if (add('emoji', w.start, { duration: 1.5, props: { emoji: '🦶', x: 0.2, y: 0.36 } })) {
        used.emoji++;
        continue;
      }
    }
    if (/^(corsa|correre|corri|corro|runner|corridor)/.test(c) && used.emoji < 3 && dyn >= 2) {
      if (add('emoji', w.start, { duration: 1.5, props: { emoji: '🏃', x: 0.8, y: 0.34 } })) {
        used.emoji++;
        continue;
      }
    }
    if (/^(segreto|trucco|consiglio)/.test(c)) {
      const txt = ws.slice(i + 1, i + 9).map((x) => x.text).join(' ').replace(/[.,]$/, '');
      if (txt.split(' ').length >= 3 && add('tipCard', w.start + 0.3, { duration: 2.8, props: { label: '💡 ' + c, text: txt } })) continue;
    }
    if ((w.emph || /\?$/.test(w.text)) && dyn >= 2) {
      add('zoom', w.start, { duration: 1.2, props: { amount: dyn >= 3 ? 1.28 : 1.18 } });
    }
  }
  // riempitivo: zoom lento dove non succede nulla per troppo tempo
  if (dyn >= 2) {
    const times = fx.map((f) => f.start).sort((a, b) => a - b);
    let t = hookEnd + 0.5;
    for (const ft of [...times, ctaStart]) {
      while (ft - t > minGap * 1.8) {
        fx.push({ id: 'a' + id++, type: 'zoom', start: Math.round((t + minGap) * 100) / 100, duration: 1.3, props: { amount: 1.15 } });
        t += minGap * 1.2;
      }
      t = Math.max(t, ft);
    }
  }
  return fx;
}

module.exports = { sentences, speechSegments, findMoments, hookVariants, autoEffects, scoreSentence };
