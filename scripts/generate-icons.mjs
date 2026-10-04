// Erzeugt die App-Icons aus einer SVG (blauer Hintergrund, CloudSnow-Motiv aus lucide).
// Aufruf: npm run icons  →  schreibt nach public/
import sharp from 'sharp';
import { writeFile } from 'node:fs/promises';

const BLUE = '#2563EB'; // Tailwind blue-600, wie das Logo im Header

// lucide "cloud-snow" (ISC-Lizenz), viewBox 24x24
const CLOUD_SNOW = `
  <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/>
  <path d="M8 15h.01"/><path d="M8 19h.01"/><path d="M12 17h.01"/>
  <path d="M12 21h.01"/><path d="M16 15h.01"/><path d="M16 19h.01"/>`;

/** @param {number} motifScale Anteil der Kantenlänge, den das Motiv einnimmt */
const svg = (motifScale, rounded) => {
  const size = 512;
  const motif = size * motifScale;
  const offset = (size - motif) / 2;
  const s = motif / 24;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  <rect width="${size}" height="${size}" rx="${rounded ? 112 : 0}" fill="${BLUE}"/>
  <g transform="translate(${offset} ${offset}) scale(${s})" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${CLOUD_SNOW}
  </g>
</svg>`;
};

const render = (source, size, file) =>
  sharp(Buffer.from(source)).resize(size, size).png().toFile(`public/${file}`);

// Favicon/Quelle mit runden Ecken; PNG-Icons vollflächig (iOS/Android maskieren selbst)
await writeFile('public/icon.svg', svg(0.6, true));
await render(svg(0.6, false), 192, 'pwa-192x192.png');
await render(svg(0.6, false), 512, 'pwa-512x512.png');
await render(svg(0.6, false), 180, 'apple-touch-icon.png');
// Maskable: Motiv innerhalb der 80%-Safe-Zone
await render(svg(0.5, false), 512, 'maskable-icon-512x512.png');
console.log('Icons in public/ erzeugt.');
