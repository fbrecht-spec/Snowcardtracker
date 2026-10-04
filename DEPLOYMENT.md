# Deployment auf GitHub Pages – Schritt für Schritt

Ziel: Die App läuft unter **https://fbrecht-spec.github.io/Snowcardtracker/** und ist auf dem
iPhone als App auf dem Home-Bildschirm installiert.

## 0. Wichtig vorab: Daten sichern

Safari und die Home-Bildschirm-App haben **getrennte Speicher**. Die Daten wandern also
nicht automatisch mit. Wenn du die App schon in Safari benutzt hast:

1. In Safari die App öffnen → **Optionen** → **Exportieren**.
2. Im Teilen-Menü **„In Dateien sichern“** wählen (z. B. iCloud Drive).
3. Nach der Installation (Schritt 5) in der Home-Bildschirm-App → **Optionen** →
   **Importieren** → die gesicherte Datei auswählen → bestätigen.

Tipp: Mach das Exportieren auch sonst ab und zu. Wenn du die App vom Home-Bildschirm löschst,
sind ihre Daten weg.

## 1. Repository auf GitHub öffentlich anlegen

GitHub Pages ist im **kostenlosen Tarif (GitHub Free) nur für öffentliche Repositories**
verfügbar. Für private Repositories braucht man GitHub Pro (kostenpflichtig). Die
veröffentlichte Seite selbst wäre ohnehin immer öffentlich erreichbar.

Das Repo enthält nach der Bereinigung keine Schlüssel oder Passwörter. Deine Skitage liegen
nur auf deinem iPhone und nicht im Repo. Es kann also bedenkenlos öffentlich sein.

- Falls das Repo noch nicht existiert: auf github.com → **New repository** → Name
  `Snowcardtracker` (genau diese Schreibweise) → **Public** → *ohne* README/.gitignore/Lizenz
  anlegen (sonst gibt es beim ersten Push einen Konflikt).
- Falls es schon existiert und privat ist: **Settings → General → ganz unten „Danger Zone“
  → Change visibility → Public**.

## 2. Code hochladen (Push)

Im Projektordner (Terminal / Git Bash):

```bash
git remote -v
```

Es muss zweimal `https://github.com/fbrecht-spec/Snowcardtracker.git` erscheinen. Dann:

```bash
git push -u origin main
```

**Anmeldung:** Git für Windows bringt den *Git Credential Manager* mit. Beim ersten Push
öffnet sich ein Fenster bzw. der Browser mit dem GitHub-Login („Sign in with your browser“).
Dort anmelden und den Zugriff erlauben. Die Zugangsdaten speichert Windows sicher in der
Anmeldeinformationsverwaltung, nicht in einer Datei im Projekt.

Falls stattdessen nach Benutzername/Passwort gefragt wird: Dein GitHub-Passwort funktioniert
dort **nicht**. Erstelle dann einen *Personal Access Token*:
GitHub → Profilbild → **Settings → Developer settings → Personal access tokens →
Fine-grained tokens → Generate new token**, nur für das Repo `Snowcardtracker`, Berechtigung
**Contents: Read and write** (für Workflow-Dateien zusätzlich **Workflows: Read and write**).
Den Token beim Passwort-Prompt einfügen. Nicht in Dateien speichern, nicht weitergeben.

Hinweis E-Mail: Die Commits tragen die Adresse aus `git config user.email`. Bei einem öffentlichen
Repo ist sie für alle sichtbar. Wenn du das nicht willst, vor dem Push die anonyme Adresse
setzen (zu finden unter GitHub → Settings → Emails, Format `…@users.noreply.github.com`) und
die bisherigen Commits umschreiben lassen. Falls GitHub den Push mit „push declined due to
email privacy restrictions“ ablehnt, ist genau das die Ursache.

## 3. GitHub Pages aktivieren

Auf github.com im Repo: **Settings → Pages → Build and deployment → Source:
„GitHub Actions“** auswählen. Mehr ist nicht einzustellen.

## 4. Workflow abwarten

Reiter **Actions** im Repo: Der Workflow „Deploy to GitHub Pages“ läuft bei jedem Push auf
`main` (ca. 1–2 Minuten). Grüner Haken = fertig. Falls der erste Lauf vor Schritt 3 gestartet
ist und fehlschlägt: Lauf öffnen → **Re-run all jobs**.

## 5. Auf dem iPhone installieren

1. **Safari** öffnen (nicht Chrome) → https://fbrecht-spec.github.io/Snowcardtracker/
2. Teilen-Symbol (Quadrat mit Pfeil) → **„Zum Home-Bildschirm“** → Hinzufügen.
3. App vom Home-Bildschirm starten → **Optionen → Importieren** (siehe Schritt 0).

Die App funktioniert danach auch offline. Updates holt sie sich automatisch, wenn sie online
gestartet wird. Eventuell ist ein zweiter Start nötig, bis die neue Version sichtbar ist.

## Export/Import auf dem iPhone

- **Exportieren** öffnet das Teilen-Menü mit der Datei
  `snowcard-tracker-backup-JJJJ-MM-TT.json`. „In Dateien sichern“ legt sie in iCloud Drive
  bzw. „Auf meinem iPhone“ ab. Alternativ per AirDrop oder Mail an dich selbst schicken.
- **Importieren** öffnet die Dateien-App. Backup auswählen, die Zusammenfassung prüfen und
  bestätigen. Die Daten auf dem Gerät werden dabei vollständig ersetzt.
