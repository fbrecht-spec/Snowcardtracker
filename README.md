# Flo's Snowcard Tracker

Kleine Web-App (PWA) zum Erfassen meiner Skitage in Tirol. Sie vergleicht den Preis der
Snowcard Tirol (drei Tarife) mit der Summe der Tageskartenpreise und zeigt den Break-even.

- React 19, TypeScript, Vite, Tailwind CSS, Motion (Animationen), Recharts
- iOS-nahes Design mit automatischem Hell-/Dunkelmodus
- Übersicht mit Break-even-Ring, Logbuch mit Archiv, Gebiete mit Karte und Suche,
  Statistik mit interaktiven Diagrammen, Saisonvergleich und Erfolgen
- Kein Backend, keine KI. Alle Daten bleiben im `localStorage` des Geräts.
- Datensicherung über Export/Import (JSON) in den Optionen.

## Projektstruktur

- `App.tsx` – Tabs, Sheets, Toasts
- `views/` – die fünf Bildschirme
- `components/` – fachliche Bausteine (Karte, Diagramme, Sheets), `components/ui/` – iOS-Bausteine
- `lib/` – State-Hook, Speicherung/Migration, Statistik, Formatierung

## Entwicklung

Voraussetzung: Node.js (LTS).

```bash
npm install     # Abhängigkeiten installieren
npm run dev     # Entwicklungsserver auf http://localhost:3000/Snowcardtracker/
npm run build   # Produktions-Build nach dist/
npm run preview # Build lokal testen auf http://localhost:4173/Snowcardtracker/
```

## Deployment

Jeder Push auf `main` baut die App per GitHub Actions (`.github/workflows/deploy.yml`) und
veröffentlicht sie auf GitHub Pages:

https://fbrecht-spec.github.io/Snowcardtracker/

Einmalig nötig: im Repo unter **Settings → Pages → Source** „GitHub Actions“ auswählen.
Details siehe [DEPLOYMENT.md](DEPLOYMENT.md).
