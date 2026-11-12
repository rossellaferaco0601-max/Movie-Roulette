import { AbsoluteFill, Img, OffthreadVideo, staticFile } from "remotion";
import { BRAND, W } from "./types";

/** Copertina dei reel: un solo formato per tutti, così il feed resta ordinato (Oscar 12/11).
 *  Fotogramma pulito di Daniele (senza grafiche né sottotitoli), sfumatura verde scuro dal basso, occhiello della serie,
 *  titolo sempre nella stessa posizione e con lo stesso stile, logo Correre Naturale in basso. Tutto il contenuto sta tra
 *  y 285 e y 1635, cioè dentro il ritaglio 4:5 della griglia (e quindi anche nel 3:4); il volto resta libero sopra. */
export type CoverProps = { master: string; frame: number; kicker: string; lines: string[]; accent?: string };

const FONT = "Blinker, sans-serif";

export const CNCover: React.FC<CoverProps> = ({ master, frame, kicker, lines, accent }) => {
  const longest = Math.max(...lines.map((l) => l.length));
  // stessa grandezza per tutti i titoli (feed ordinato): si riduce solo se una riga supera le 16 lettere
  const size = Math.min(104, Math.floor(1700 / Math.max(8, longest)));
  return (
    <AbsoluteFill style={{ background: "#0B0F0A", fontFamily: FONT }}>
      <OffthreadVideo src={staticFile(master)} startFrom={frame} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(11,15,10,0) 44%, rgba(20,44,15,0.82) 60%, rgba(11,15,10,0.97) 78%, #0B0F0A 100%)" }} />
      {/* blocco titolo: occhiello sempre a y 1066, titolo subito sotto */}
      <div style={{ position: "absolute", left: 0, width: W, top: 1066, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        <div style={{ background: BRAND.lime, color: BRAND.ink, fontWeight: 900, fontSize: 38, letterSpacing: 3, textTransform: "uppercase", padding: "8px 26px", borderRadius: 12, marginBottom: 26 }}>{kicker}</div>
        {lines.map((l, i) => {
          const hit = accent && l.includes(accent) ? [l.slice(0, l.indexOf(accent)), accent, l.slice(l.indexOf(accent) + accent.length)] : [l, "", ""];
          return (
            <div key={i} style={{ fontWeight: 900, fontSize: size, lineHeight: 1.02, textTransform: "uppercase", color: BRAND.white, whiteSpace: "nowrap" }}>
              {hit[0]}<span style={{ color: BRAND.lime }}>{hit[1]}</span>{hit[2]}
            </div>
          );
        })}
      </div>
      {/* logo: sempre nello stesso punto, dentro il ritaglio della griglia */}
      <div style={{ position: "absolute", left: 0, width: W, top: 1478, display: "flex", justifyContent: "center" }}>
        <Img src={staticFile("brand/logo-cn-orizzontale-bianco.png")} style={{ height: 128 }} />
      </div>
    </AbsoluteFill>
  );
};
