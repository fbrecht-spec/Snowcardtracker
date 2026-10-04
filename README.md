# Flo's Snowcard Tracker

Kleine Web-App (PWA) zum Erfassen meiner Skitage in Tirol. Sie vergleicht den Preis der
Snowcard Tirol (drei Tarife) mit der Summe der Tageskartenpreise und zeigt den Break-even.

- React 19, TypeScript, Vite, Tailwind CSS
- Kein Backend, keine KI. Alle Daten bleiben im `localStorage` des Geräts.
- Datensicherung über Export/Import (JSON) in den Optionen.

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
