// Logica condivisa (server + dashboard): frasi, tagli "a significato", mappatura dei tempi.
// I tagli nascono SEMPRE dalle parole tenute: mai una frase spezzata a metà per caso.

// divide la trascrizione in frasi (indici delle parole a..b inclusi)
function sentences(words) {
  const out = [];
  let a = 0;
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    const next = words[i + 1];
    const endPunct = /[.!?…]["»”]?$/.test(w.text);
    const longPause = next && next.start - w.end > 1.2;
    const tooLong = i - a >= 40 && /[,;:]$/.test(w.text);
    if (endPunct || longPause || tooLong || !next) {
      out.push({ i: out.length, a, b: i, start: words[a].start, end: w.end, text: words.slice(a, i + 1).map((x) => x.text).join(' ') });
      a = i + 1;
    }
  }
  return out;
}

// tagli dalle parole tenute. gap = silenzio massimo tollerato dentro un pezzo (0 = non tagliare i silenzi)
function cutsFromWords(words, removed, gap, pad, duration) {
  const rm = removed instanceof Set ? removed : new Set(removed || []);
  const P = pad == null ? 0.12 : pad;
  const G = gap == null ? 0.45 : gap;
  const dur = duration || Infinity;
  const segs = [];
  let cur = null;
  let lastIdx = -10;
  for (let i = 0; i < words.length; i++) {
    if (rm.has(i)) continue;
    const w = words[i];
    const contiguous = i === lastIdx + 1;
    const silence = cur ? w.start - cur.e : 0;
    if (!cur) cur = { s: w.start, e: w.end };
    else if (contiguous && (G <= 0 || silence <= G)) cur.e = Math.max(cur.e, w.end);
    else {
      segs.push(cur);
      cur = { s: w.start, e: w.end };
    }
    lastIdx = i;
  }
  if (cur) segs.push(cur);
  // margini, senza sovrapporre pezzi vicini
  const out = segs.map((s) => ({ s: Math.max(0, s.s - P), e: Math.min(dur, s.e + P + 0.04) }));
  for (let k = 1; k < out.length; k++) if (out[k].s < out[k - 1].e) out[k].s = out[k - 1].e;
  return out.filter((c) => c.e - c.s > 0.2).map((c) => ({ s: Math.round(c.s * 1000) / 1000, e: Math.round(c.e * 1000) / 1000 }));
}

// parole rimosse per tenere solo le frasi indicate
function removedForSentences(words, sents, keepIds) {
  const keep = new Set(keepIds);
  const rm = [];
  sents.forEach((s) => {
    if (!keep.has(s.i)) for (let k = s.a; k <= s.b; k++) rm.push(k);
  });
  return rm;
}

function cutLen(c) {
  return Math.max(0, c.e - c.s) / (c.speed || 1);
}
function cutStarts(cuts) {
  const out = [];
  let acc = 0;
  for (const c of cuts) {
    out.push(acc);
    acc += cutLen(c);
  }
  return out;
}
function totalDuration(cuts) {
  return cuts.reduce((a, c) => a + cutLen(c), 0);
}
function srcToOut(t, cuts, starts) {
  const st = starts || cutStarts(cuts);
  for (let i = 0; i < cuts.length; i++) if (t >= cuts[i].s - 0.0001 && t <= cuts[i].e + 0.0001) return st[i] + (t - cuts[i].s) / (cuts[i].speed || 1);
  return null;
}
function outToSrc(t, cuts) {
  let acc = 0;
  for (const c of cuts) {
    const d = cutLen(c);
    if (t <= acc + d) return c.s + (t - acc) * (c.speed || 1);
    acc += d;
  }
  const last = cuts[cuts.length - 1];
  return last ? last.e : 0;
}

module.exports = { cutLen, sentences, cutsFromWords, removedForSentences, cutStarts, totalDuration, srcToOut, outToSrc };
