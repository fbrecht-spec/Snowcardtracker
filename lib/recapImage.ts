import { SeasonStats } from './stats';
import { formatEuro, shortSeasonLabel } from './format';

export interface RecapData {
  seasonLabel: string;
  stats: SeasonStats;
  favorite?: { name: string; count: number };
  buddy?: { name: string; count: number };
  powderDays: number;
  avgRating: number;
}

export const recapQuote = ({ stats }: RecapData) =>
  stats.freeDays > 0
    ? `Du hast den Winter gerockt, Flo. Ab Tag ${stats.daysCount - stats.freeDays + 1} bist du gratis gefahren!`
    : stats.daysCount > 0
      ? `Noch ${formatEuro(Math.max(0, -stats.net))} bis zum Break-even. Der Berg wartet, Flo!`
      : 'Noch keine Skitage – der Winter kann kommen, Flo!';

const W = 1080;
const H = 1920;
const FONT = '-apple-system, "SF Pro Display", "Inter Variable", system-ui, sans-serif';

const roundRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
};

/** Bricht Text in Zeilen um, die maxWidth nicht überschreiten. */
const wrap = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number) => {
  const lines: string[] = [];
  let line = '';
  text.split(' ').forEach(word => {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else line = test;
  });
  if (line) lines.push(line);
  return lines;
};

/** Zeichnet die Rückblick-Karte im Story-Format und liefert sie als JPEG-Datei. */
export const createRecapImage = async (data: RecapData): Promise<File> => {
  await document.fonts?.ready;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;
  const { stats } = data;

  // Hintergrund
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#1e1b4b');
  bg.addColorStop(0.5, '#1d4ed8');
  bg.addColorStop(1, '#0891b2');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
  const glow = ctx.createRadialGradient(W * 0.85, 160, 0, W * 0.85, 160, 600);
  glow.addColorStop(0, 'rgba(255,255,255,0.18)');
  glow.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // Bergsilhouette unten
  ctx.fillStyle = 'rgba(255,255,255,0.07)';
  ctx.beginPath();
  ctx.moveTo(0, H);
  [[0, 1640], [160, 1500], [300, 1600], [470, 1420], [640, 1580], [800, 1460], [960, 1560], [W, 1500], [W, H]].forEach(([x, y]) => ctx.lineTo(x, y));
  ctx.fill();

  const M = 90;
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.font = `600 34px ${FONT}`;
  ctx.fillText(`SAISON ${shortSeasonLabel(data.seasonLabel)}  ·  SNOWCARD TIROL`, M, 200);

  ctx.fillStyle = '#fff';
  ctx.font = `800 108px ${FONT}`;
  wrap(ctx, 'Dein Winter im Rückblick.', W - 2 * M).forEach((l, i) => ctx.fillText(l, M, 330 + i * 118));

  // Kacheln
  const tiles = [
    ['📅', String(stats.daysCount), 'Skitage'],
    ['🎁', String(stats.freeDays), 'Gratis-Tage'],
    ['🎿', formatEuro(stats.totalValue), 'Gesamtwert'],
    ['💰', formatEuro(Math.max(0, stats.net)), 'Ersparnis'],
  ];
  const gap = 30;
  const tw = (W - 2 * M - gap) / 2;
  const th = 250;
  const ty = 620;
  tiles.forEach(([emoji, value, label], i) => {
    const x = M + (i % 2) * (tw + gap);
    const y = ty + Math.floor(i / 2) * (th + gap);
    ctx.fillStyle = 'rgba(255,255,255,0.13)';
    roundRect(ctx, x, y, tw, th, 44);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = `48px ${FONT}`;
    ctx.fillText(emoji, x + 40, y + 82);
    ctx.fillStyle = '#fff';
    ctx.font = `800 76px ${FONT}`;
    ctx.fillText(value, x + 40, y + 172);
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = `500 32px ${FONT}`;
    ctx.fillText(label, x + 40, y + 218);
    ctx.fillStyle = '#fff';
  });

  // Highlights
  const highlights = [
    data.favorite && ['🏔️', 'Lieblingsgebiet', `${data.favorite.name} · ${data.favorite.count}×`],
    data.buddy && ['🤝', 'Ski-Buddy', `${data.buddy.name} · ${data.buddy.count}×`],
    data.powderDays > 0 && ['❄️', 'Pulvertage', String(data.powderDays)],
    data.avgRating > 0 && ['⭐', 'Ø Bewertung', `${data.avgRating.toFixed(1).replace('.', ',')} von 5`],
  ].filter(Boolean).slice(0, 3) as string[][];
  let hy = ty + 2 * (th + gap) + 10;
  highlights.forEach(([emoji, label, value]) => {
    ctx.fillStyle = 'rgba(255,255,255,0.13)';
    roundRect(ctx, M, hy, W - 2 * M, 130, 40);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = `52px ${FONT}`;
    ctx.fillText(emoji, M + 36, hy + 86);
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = `500 30px ${FONT}`;
    ctx.fillText(label, M + 130, hy + 54);
    ctx.fillStyle = '#fff';
    ctx.font = `700 44px ${FONT}`;
    const text = wrap(ctx, value, W - 2 * M - 170)[0];
    ctx.fillText(text, M + 130, hy + 102);
    hy += 150;
  });

  // Zitat
  ctx.fillStyle = 'rgba(255,255,255,0.92)';
  ctx.font = `italic 500 42px ${FONT}`;
  ctx.textAlign = 'center';
  wrap(ctx, `„${recapQuote(data)}“`, W - 2 * M - 40).forEach((l, i) => ctx.fillText(l, W / 2, hy + 70 + i * 56));

  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.font = `600 30px ${FONT}`;
  ctx.fillText("❄  Flo's Snowcard Tracker", W / 2, H - 90);

  const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(b => (b ? resolve(b) : reject(new Error('Bild konnte nicht erzeugt werden'))), 'image/jpeg', 0.92));
  return new File([blob], `saison-rueckblick-${shortSeasonLabel(data.seasonLabel).replace('/', '-')}.jpg`, { type: 'image/jpeg' });
};
