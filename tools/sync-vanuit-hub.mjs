/* ============================================================
   SYNC-VANUIT-HUB, ververst deze repo vanuit de sponsorhub-bron.

   DE BRON VAN WAARHEID is en blijft de hub:
   _OUTPUTS/affiliate-vvstaphorst (op Reiniers werk-pc, twee mappen
   omhoog naast 01_CODE). Deze repo is een zelfstandige, deelbare
   kopie van alleen de Staphorst United-pagina met precies de
   bestanden die die pagina nodig heeft. Wijzig de pagina dus in de
   hub-bron (met de vaste keten: check → publiceer → deploy) en draai
   daarna dit script om deze repo bij te werken. Niet andersom.

   WAT ER MEEGAAT
   - staphorst-united.html (de pagina zelf)
   - alles waar de pagina met een relatief pad naar verwijst
     (fonts-ds.css, crest, teamfoto, site-chrome.js, vvs-live.js,
     united-deelnemers.js)
   - de fonts die assets/fonts-ds.css noemt (site-chrome injecteert
     Poppins 600/700/900; die staan daar ook al in)
   - assets/sponsoren.js plus de logo's van de tiers Hoofd/Top/Goud:
     site-chrome.js tekent daar de sponsorwand mee. Logo's van andere
     tiers staan niet op deze pagina en blijven bewust achter.

   GEBRUIK
     node tools/sync-vanuit-hub.mjs             kopieer hub -> repo
     node tools/sync-vanuit-hub.mjs --controleer  meld alleen verschillen
                                                  (exit 1 bij afwijking)
   ============================================================ */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(__dirname, "..");
const BRON = path.resolve(REPO, "..", "..", "_OUTPUTS", "affiliate-vvstaphorst");

if (!fs.existsSync(path.join(BRON, "staphorst-united.html"))) {
  console.error("Hub-bron niet gevonden op " + BRON);
  console.error("Dit script draait alleen op de machine met de volledige CLAUDE-map.");
  process.exit(1);
}

const controleer = process.argv.includes("--controleer");

/* ---------- 1. De vaste lijst ---------- */
const VAST = [
  "staphorst-united.html",
  "assets/fonts-ds.css",
  "assets/site-chrome.js",
  "assets/vvs-live.js",
  "assets/united-deelnemers.js",
  "assets/sponsoren.js",
  "assets/logos/vvs-crest.svg",
  "assets/photos/kampioenen-2026.jpg"
];

/* ---------- 2. Fonts: precies wat fonts-ds.css noemt ---------- */
const fontsCss = fs.readFileSync(path.join(BRON, "assets/fonts-ds.css"), "utf8");
const fonts = [...new Set(fontsCss.match(/fonts\/[a-z0-9-]+\.woff2/g) || [])]
  .map((f) => "assets/" + f);

/* ---------- 3. Wand-logo's: tiers Hoofd/Top/Goud uit sponsoren.js ---------- */
globalThis.window = {};
await import(pathToFileURL(path.join(BRON, "assets/sponsoren.js")).href);
const wandLogos = (window.VVS_SPONSOREN || [])
  .filter((s) => ["Hoofd", "Top", "Goud"].includes(s.tier) && s.logo && s.logo.trim())
  .map((s) => "assets/logos/" + s.logo);

/* ---------- Kopieer / vergelijk ---------- */
const alles = [...VAST, ...fonts, ...wandLogos];
let gewijzigd = 0, ontbreekt = 0;
for (const rel of alles) {
  const van = path.join(BRON, rel);
  const naar = path.join(REPO, rel);
  if (!fs.existsSync(van)) {
    console.error("  ONTBREEKT IN BRON: " + rel);
    ontbreekt++;
    continue;
  }
  const nieuw = fs.readFileSync(van);
  const oud = fs.existsSync(naar) ? fs.readFileSync(naar) : null;
  if (oud && nieuw.equals(oud)) continue;
  gewijzigd++;
  if (controleer) {
    console.log("  wijkt af: " + rel);
  } else {
    fs.mkdirSync(path.dirname(naar), { recursive: true });
    fs.writeFileSync(naar, nieuw);
    console.log("  bijgewerkt: " + rel);
  }
}

if (ontbreekt) process.exit(1);
if (controleer && gewijzigd) {
  console.log("\n" + gewijzigd + " bestand(en) wijken af. Draai zonder --controleer om te verversen.");
  process.exit(1);
}
console.log(controleer
  ? "Repo is gelijk aan de hub-bron (" + alles.length + " bestanden gecontroleerd)."
  : "Klaar: " + gewijzigd + " bijgewerkt, " + alles.length + " bestanden totaal. Vergeet commit + push niet.");
