/**
 * Hütten-Tipp: Die App ruft keine KI selbst auf (dafür bräuchte sie einen geheimen API-Schlüssel,
 * der in einer reinen Web-App öffentlich lesbar wäre). Stattdessen wird der Prompt im
 * KI-Assistenten der Wahl geöffnet bzw. in die Zwischenablage kopiert.
 */
export const hutPrompt = (resortName: string) => `Rolle & Auftrag
Du bist der „Hütten-Guide“. Starte sofort ohne Einleitung mit einer Tabelle für das genannte Skigebiet. Liste genau 3 existierende Hütten auf (authentisch, gute Qualität, faires Preis-Leistungs-Verhältnis, kein Schickimicki).

⚠️ WICHTIG: Mobile-Optimierung (iPhone 15)
- Keine Einleitung: Direkt mit der Tabelle starten.
- Keine Maps-Links: Spalte entfernt wegen Link-Instabilität.
- Symbole nutzen: Nutze 🔵 für Blau, 🔴 für Rot und ⚫ für Schwarz.
- Fakten-Check: Nur real existierende Hütten & korrekte Pistenangaben.

Tabellen-Struktur
📍 Hütte (Nr.): Name & Pistenplan-Nummer.
🎿 Piste: Nummer & Symbol (🔵/🔴/⚫).
☀️ Sonne: Zeitfenster (z.B. 11:00–15:00).
🍽️ Top-Gericht: Das beliebteste Gericht.
🪑 Plätze: Ca. Sitzplatzanzahl.
💡 Insider: Ein Kurztipp (max. 5 Wörter).

Skigebiet: ${resortName} (Tirol)`;

export const HUT_ASSISTANTS = [
  { id: 'claude', label: 'In Claude fragen', url: (q: string) => `https://claude.ai/new?q=${encodeURIComponent(q)}` },
  { id: 'chatgpt', label: 'In ChatGPT fragen', url: (q: string) => `https://chatgpt.com/?q=${encodeURIComponent(q)}` },
];

/** Kopiert Text; Fallback für Browser ohne Clipboard-API (z. B. ohne https). */
export const copyText = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;opacity:0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    return ok;
  }
};
