// Stili di montaggio moderni (tutti con i colori di Correre Naturale). Claude ne usa uno diverso a ogni reel.
const LOOKS = {
  energico: {
    name: 'Energico', desc: 'Sottotitoli grossi stile Hormozi, parole chiave che pulsano, stacchi veloci con zoom.',
    style: { titleFont: 'bebas', filter: 'vivido', captions: { style: 'hormozi', wordFx: 'pulsa', position: 'low', size: 1, wordsPerLine: 3, highlight: '#49762E', emphColor: '#B8D7EA' }, gradient: true, cutZoom: true, breathing: true, progressBar: true, vignette: false },
    hook: { style: 'kinetic' }, cta: { style: 'button' }, music: 'energica-allenamento', transitions: ['zoomThrough', 'flash'],
  },
  editoriale: {
    name: 'Editoriale', desc: 'Elegante: serif con parola in corsivo, parole sottolineate a mano, toni morbidi.',
    style: { titleFont: 'editoriale', filter: 'morbido', captions: { style: 'serif', wordFx: 'sottolinea', position: 'low', size: 1, wordsPerLine: 4, emphColor: '#B8D7EA' }, gradient: true, cutZoom: false, breathing: true, progressBar: false, vignette: true },
    hook: { style: 'mix' }, cta: { style: 'minimal' }, music: 'riflessiva', transitions: ['blurIn'],
  },
  pop: {
    name: 'Pop', desc: 'Colorato e giocoso: parole a timbro, scritte che rimbalzano, sticker.',
    style: { titleFont: 'archivo', filter: 'vivido', captions: { style: 'bounce', wordFx: 'timbro', position: 'low', size: 1, wordsPerLine: 3, highlight: '#B8D7EA', emphColor: '#B8D7EA' }, gradient: true, cutZoom: true, breathing: false, progressBar: true, vignette: false },
    hook: { style: 'boxed' }, cta: { style: 'sticker' }, music: 'pop-solare', transitions: ['pixel', 'flash'],
  },
  pulito: {
    name: 'Pulito', desc: 'Minimal e chiaro: parole in un riquadro verde, niente fronzoli.',
    style: { titleFont: 'dmsans', filter: 'none', captions: { style: 'minimal', wordFx: 'box', position: 'low', size: 1.05, wordsPerLine: 4, emphColor: '#49762E' }, gradient: true, cutZoom: false, breathing: true, progressBar: true, vignette: false },
    hook: { style: 'top' }, cta: { style: 'card' }, music: 'lofi-corsa-mattutina', transitions: ['blurIn'],
  },
  cinema: {
    name: 'Cinema', desc: 'Storytelling: colori da film, grana, parole che si illuminano.',
    style: { titleFont: 'playfair', filter: 'cinema', captions: { style: 'cinema', wordFx: 'glow', position: 'low', size: 1, wordsPerLine: 4, emphColor: '#B8D7EA' }, gradient: true, cutZoom: false, breathing: true, progressBar: false, vignette: true, adjust: { grain: 0.12 } },
    hook: { style: 'fullscreen' }, cta: { style: 'endcard' }, music: 'motivazionale', transitions: ['pullBack', 'blurIn'],
  },
  social: {
    name: 'Social', desc: 'Stile TikTok: parole cerchiate a mano, hook a domanda, ritmo alto.',
    style: { titleFont: 'montserrat', filter: 'vivido', captions: { style: 'tiktok', wordFx: 'cerchio', position: 'low', size: 1, wordsPerLine: 3, emphColor: '#B8D7EA' }, gradient: true, cutZoom: true, breathing: false, progressBar: true, vignette: false },
    hook: { style: 'question' }, cta: { style: 'comment' }, music: 'hiphop-grinta', transitions: ['zoomThrough'],
  },
  tech: {
    name: 'Tech', desc: 'Moderno e digitale: scritte neon, parole che si rompono come vetro, glitch.',
    style: { titleFont: 'spacegrotesk', filter: 'freddo', captions: { style: 'neon', wordFx: 'vetro', position: 'low', size: 1, wordsPerLine: 3, emphColor: '#B8D7EA' }, gradient: true, cutZoom: true, breathing: false, progressBar: true, vignette: true },
    hook: { style: 'typewriter' }, cta: { style: 'dm' }, music: 'elettronica-notte', transitions: ['glitch', 'pixel'],
  },
};
module.exports = { LOOKS };
