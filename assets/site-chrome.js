/* ============================================================
   SITE-CHROME, uniforme banner + footer + sponsorstrip op elke pagina.
   Eén scriptregel per pagina: <script src="assets/site-chrome.js" defer></script>
   BEHEER: club-links wijzigen? Pas alleen LINKS hieronder aan.
   Is het WhatsApp-kanaal aangemaakt? Plak de kanaal-link in LINKS.whatsapp
   en hij verschijnt overal vanzelf (footer + mobiel menu).
   Google Analytics? Plak het measurement-ID (G-XXXXXXXXXX) in GA_ID
   en elke pagina meet vanzelf mee (beheerpagina's niet).
   Logo's staan in assets/logos/sponsors/.
   ============================================================ */
(function () {
  "use strict";

  /* ---------- Embed-stand: ?embed=1 = geen chrome ----------
     Voor de United-embed op de echte clubsite (iframe op vvstaphorst.nl,
     sept 2026): binnen andermans pagina horen onze topbar, footer,
     sponsorwand, welkomstpopup en cookiebalk niet — dat wordt dubbele
     navigatie en een toestemmingsbalk in een frame waar niemand op rekent.
     Ook GA blijft dan bewust uit: zonder cookiebalk geen toestemming, dus
     geen meting (AVG). De pagina zelf (hero, teller, namen) doet gewoon
     alles; alleen dit gedeelde chrome slaan we over. */
  if (/[?&]embed=1(&|$)/.test(location.search)) return;

  /* ---------- Club-links: één plek voor de hele site ---------- */
  var LINKS = {
    club: "https://www.vvstaphorst.nl",
    insta: "https://www.instagram.com/vvstaphorst/",
    facebook: "https://www.facebook.com/VVStaphorst/",
    whatsapp: "https://whatsapp.com/channel/0029VbDavNbGzzKIzrdMPq2y",
    mail: "sponsor@vvstaphorst.nl"
  };

  /* ---------- Google Analytics (GA4): één plek voor de hele site ----------
     Leeg = geen meting. ID invullen → pageviews + UTM-campagnes (QR, WhatsApp)
     verschijnen vanzelf in GA. Formulier-inzendingen komen binnen als event
     "lead_submit" (zie actie.html/sponsoren.html). Beheerpagina's meten
     bewust niet mee, die vervuilen de bezoekcijfers. */
  var GA_ID = "G-HSXPR4B5GR"; // property "VV Staphorst Wedstrijdactie", stream "VVS Sponsorhub (jaarkalender)"

  /* ---------- Toestemming vóór meting ----------
     GA4 plaatst _ga-cookies en stuurt data naar Google. Dat mag pas ná
     toestemming (AVG + ePrivacy). Eerder laadde dit script GA meteen, zonder
     te vragen. Nu: niets laden tot de bezoeker "Ja" klikt. Weigeren betekent
     weigeren, en de keuze staat in localStorage, niet in een cookie.

     Betere route op termijn: cookieloze analytics (Plausible, Simple Analytics,
     Umami). Dan verdwijnt deze balk helemaal. Zie het rapport. */
  /* ---------- Pad-voorvoegsel ----------
     Berekend uit de diepte van het pad, niet uit een lijstje mapnamen. Het
     oude `pathname.indexOf("/beheer/") !== -1 ? "../" : ""` gaf voor een
     pagina in /actie/ het voorvoegsel "", waarna elke asset, de crest en de
     hele sponsorwand stil 404'den: de pagina laadde, maar was kaal. Elke
     nieuwe submap zou diezelfde val zetten. */
  function padVoorvoegsel() {
    var segmenten = location.pathname.split("/").filter(Boolean);
    if (!segmenten.length) return "";
    var laatste = segmenten[segmenten.length - 1];
    var diepte = laatste.indexOf(".") !== -1 ? segmenten.length - 1 : segmenten.length;
    return new Array(diepte + 1).join("../");
  }

  var TOESTEMMING_KEY = "vvs-analytics-toestemming";
  var opBeheerpagina = location.pathname.indexOf("/beheer/") !== -1;
  var Pc = padVoorvoegsel();

  /* ---------- Vreemde host? Paginalinks en live-data wijzen dan naar de hub ----------
     Sinds de staphorst-united-repo (sept 2026) kan een kopie van een pagina op
     een andere host draaien (de echte clubsite, of lokaal geopend als bestand).
     Assets blijven daar relatief (de kopie brengt ze zelf mee), maar links naar
     ANDERE pagina's (acties.html, sponsoren.html, beheer/ ...) bestaan op zo'n
     host niet — die moeten absoluut naar de hub. Zelfde regel voor de
     /vvs-data-fetch van de sponsorwand (zie ook assets/vvs-live.js; de Function
     stuurt op GET CORS-headers mee). Op de eigen hosts is HUB gelijk aan het
     gewone pad-voorvoegsel en verandert er niets. */
  var EIGEN_HOST = /(^|\.)vvstaphorst-united\.nl$|\.netlify\.app$|^localhost$|^127\.0\.0\.1$/.test(location.hostname);
  var HUB = EIGEN_HOST ? Pc : "https://vvstaphorst-united.nl/";

  function laadAnalytics() {
    if (!GA_ID || window.gtag || opBeheerpagina) return;
    var ga = document.createElement("script");
    ga.async = true;
    ga.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_ID;
    document.head.appendChild(ga);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", GA_ID, { anonymize_ip: true });
  }

  function wisAnalyticsCookies() {
    document.cookie.split(";").forEach(function (c) {
      var naam = c.split("=")[0].trim();
      if (naam.indexOf("_ga") === 0) {
        document.cookie = naam + "=; Max-Age=0; path=/";
        document.cookie = naam + "=; Max-Age=0; path=/; domain=." + location.hostname;
      }
    });
  }

  function toonToestemmingsbalk() {
    var bar = document.createElement("div");
    bar.className = "vvs-cookiebar";
    // role=region (geen dialog): de balk is bewust NIET modaal — de site werkt
    // met of zonder keuze hetzelfde. role=dialog zou focus-trap, aria-modal en
    // Esc-afhandeling beloven die er niet zijn; region dekt de werkelijkheid.
    bar.setAttribute("role", "region");
    bar.setAttribute("aria-label", "Meten van bezoek");
    bar.innerHTML =
      '<p>We meten graag welke acties aanslaan. Dat plaatst een statistiek-cookie van Google Analytics. ' +
      'Liever niet? Dan werkt de site precies hetzelfde. <a href="' + HUB + 'privacy.html">Privacyverklaring</a></p>' +
      '<div class="vvs-cookieknoppen">' +
        '<button type="button" class="vcb-nee">Nee, niet meten</button>' +
        '<button type="button" class="vcb-ja">Ja, meten mag</button>' +
      '</div>';
    document.body.appendChild(bar);

    /* De balk staat vast onderaan en dekte daar knoppen af (gezien op het
       interesseformulier van sponsormogelijkheden.html). Zolang hij er is,
       schuift de pagina evenveel op. De hoogte verandert nog nadat de fonts
       laden en bij draaien van het scherm, dus we blijven meten. */
    var observer = null;
    function ruimteMaken() { document.body.style.paddingBottom = bar.offsetHeight + "px"; }
    function ruimteTeruggeven() { document.body.style.paddingBottom = ""; }
    ruimteMaken();
    window.addEventListener("resize", ruimteMaken);
    if (window.ResizeObserver) { observer = new ResizeObserver(ruimteMaken); observer.observe(bar); }
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(ruimteMaken);

    function sluit(keuze, daarna) {
      try { localStorage.setItem(TOESTEMMING_KEY, keuze); } catch (e) {}
      window.removeEventListener("resize", ruimteMaken);
      if (observer) observer.disconnect();
      bar.remove();
      ruimteTeruggeven();
      daarna();
    }
    bar.querySelector(".vcb-ja").addEventListener("click", function () { sluit("ja", laadAnalytics); });
    bar.querySelector(".vcb-nee").addEventListener("click", function () { sluit("nee", wisAnalyticsCookies); });
  }

  /* Toestemming intrekken. AVG art. 7 lid 3: even makkelijk als geven.
     De privacyverklaring verwees naar de browserinstellingen; dat is geen
     intrekking, dat is de bezoeker het werk laten doen. Deze functie hangt
     onder de link "Meten aan- of uitzetten" in de footer. */
  window.VVSToestemmingHerzien = function () {
    try { localStorage.removeItem(TOESTEMMING_KEY); } catch (e) {}
    wisAnalyticsCookies();
    location.reload();
  };

  var keuze = null;
  try { keuze = localStorage.getItem(TOESTEMMING_KEY); } catch (e) {}
  if (keuze === "ja") {
    laadAnalytics();
  } else {
    // Geen toestemming (nog niet gevraagd, of geweigerd): geen meting, en oude
    // _ga-cookies van vóór deze toestemmingsbalk gaan er alsnog uit.
    wisAnalyticsCookies();
    if (keuze !== "nee" && !opBeheerpagina && GA_ID) {
      if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", toonToestemmingsbalk);
      else toonToestemmingsbalk();
    }
  }

  /* ---------- SPONSORS: de wand leest uit assets/sponsoren.js ----------
     Dat bestand is DE bron van waarheid. Sponsor erbij, tier gewijzigd of
     logo toegevoegd (veld "logo")? Alleen sponsoren.js aanpassen, de wand
     op elke pagina volgt automatisch (groepen: Hoofd, Top, Goud). */

  /* ---------- Pad-prefix (zie padVoorvoegsel bovenaan) ---------- */
  var P = Pc;

  /* ---------- Stijl (hardcoded: werkt op oude én nieuwe pagina's) ---------- */
  var css = document.createElement("style");
  css.textContent =
    /* POPPINS, de kopletter van de site (van het Staphorst United-bord,
       OFL-licentie, zelf gehost). Hier geïnjecteerd zodat ELKE pagina hem
       heeft, ook de gegenereerde actiepagina's en het beheer, zonder dat
       elk HTML-bestand een extra <link> nodig heeft. Pagina's die
       fonts-ds.css laden declareren hem dubbel; dat is onschuldig.
       Alleen de latin-subsets van 600/700/900; wie meer snedes nodig
       heeft (400, 900 italic, latin-ext) laadt fonts-ds.css. */
    "@font-face{font-family:'Poppins';font-style:normal;font-weight:600;font-display:swap;src:url('" + P + "assets/fonts/poppins-600-latin.woff2') format('woff2');unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}" +
    "@font-face{font-family:'Poppins';font-style:normal;font-weight:700;font-display:swap;src:url('" + P + "assets/fonts/poppins-700-latin.woff2') format('woff2');unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}" +
    "@font-face{font-family:'Poppins';font-style:normal;font-weight:900;font-display:swap;src:url('" + P + "assets/fonts/poppins-900-latin.woff2') format('woff2');unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}" +
    ".vvs-topbar{background:#071D60;color:#fff;position:sticky;top:0;z-index:60;font-family:'Poppins','Droid Sans',Verdana,Tahoma,sans-serif}" +
    ".vvs-topbar .vwrap{max-width:1120px;margin:0 auto;padding:0 22px;display:flex;align-items:center;justify-content:space-between;height:64px}" +
    ".vvs-brand{display:flex;align-items:center;gap:12px;text-decoration:none;color:#fff;font-weight:700}" +
    ".vvs-brand .vcrest{width:44px;height:48px;background:#FFF000;clip-path:polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%);display:grid;place-items:center;padding:6px;flex:none}" +
    ".vvs-brand .vcrest img{width:100%;height:100%;object-fit:contain;display:block}" +
    ".vvs-brand small{display:block;font-weight:500;opacity:.8;font-size:10.5px}" +
    ".vvs-nav{display:flex;gap:6px;align-items:center}" +
    /* nowrap + iets compacter sinds Poppins: die loopt breder dan Droid
       Sans en liet "Staphorst United" anders over twee regels wikkelen */
    ".vvs-nav a{color:#fff;text-decoration:none;font-size:13.5px;padding:8px 10px;border-radius:8px;opacity:.9;white-space:nowrap}" +
    ".vvs-nav a:hover{background:rgba(255,255,255,.12);opacity:1}" +
    ".vvs-nav a.vcta{background:#FFF000;color:#071D60;font-weight:700;opacity:1}" +
    /* 44x44 tapdoel: op mobiel is dit de enige navigatie die er is. */
    ".vvs-burger{display:none;background:none;border:0;color:#fff;font-size:22px;line-height:1;cursor:pointer;border-radius:8px;margin-left:4px;min-width:44px;min-height:44px;align-items:center;justify-content:center}" +
    ".vvs-burger:hover{background:rgba(255,255,255,.12)}" +
    ".vvs-burger:focus-visible{outline:3px solid #FFF000;outline-offset:2px}" +
    ".vvs-nav a:focus-visible{outline:3px solid #FFF000;outline-offset:2px}" +
    /* Toestemmingsbalk: onderaan, weigeren staat links en is even makkelijk als accepteren. */
    ".vvs-cookiebar{position:fixed;left:0;right:0;bottom:0;z-index:70;background:#071D60;color:#fff;padding:16px 22px;display:flex;align-items:center;justify-content:center;gap:20px;flex-wrap:wrap;font-family:'Poppins','Droid Sans',Verdana,Tahoma,sans-serif;box-shadow:0 -6px 24px rgba(8,21,66,.25)}" +
    ".vvs-cookiebar p{margin:0;font-size:14px;max-width:640px;line-height:1.5}" +
    ".vvs-cookiebar a{color:#FFF000;text-decoration:underline}" +
    ".vvs-cookieknoppen{display:flex;gap:10px;flex-wrap:wrap}" +
    ".vvs-cookiebar button{font-family:inherit;font-weight:700;font-size:14px;border-radius:9px;padding:11px 16px;min-height:44px;cursor:pointer;border:1.5px solid rgba(255,255,255,.45);background:transparent;color:#fff}" +
    ".vvs-cookiebar button.vcb-ja{background:#FFF000;color:#071D60;border-color:#FFF000}" +
    ".vvs-cookiebar button:focus-visible{outline:3px solid #FFF000;outline-offset:2px}" +
    "@media(max-width:640px){.vvs-cookiebar{flex-direction:column;align-items:stretch;gap:12px}.vvs-cookiebar .vvs-cookieknoppen button{flex:1}}" +
    "@media(max-width:1059px){.vvs-nav a:not(.vcta){display:none}.vvs-burger{display:inline-flex}.vvs-nav a.vcta{padding:11px 12px;font-size:13px;min-height:44px;display:inline-flex;align-items:center}}" +
    ".vvs-mobielmenu{display:none;background:#071D60;border-top:1px solid rgba(255,255,255,.14)}" +
    ".vvs-mobielmenu.open{display:block}" +
    "@media(min-width:1060px){.vvs-mobielmenu{display:none !important}}" +
    ".vvs-mobielmenu a{display:block;color:#fff;text-decoration:none;font-size:16px;font-weight:600;padding:13px 22px;border-bottom:1px solid rgba(255,255,255,.08)}" +
    ".vvs-mobielmenu a:active{background:rgba(255,255,255,.1)}" +
    ".vvs-mobielmenu .vm-kop{padding:14px 22px 6px;font-size:11.5px;letter-spacing:1px;text-transform:uppercase;color:#FFF000;font-weight:700;opacity:.9}" +
    ".vvs-mobielmenu .vm-soon{opacity:.55;font-weight:400;font-size:13px}" +
    ".sponsorwand{background:#fff;padding:44px 0 50px;font-family:'Poppins','Droid Sans',Verdana,Tahoma,sans-serif;border-top:1px solid #eceef3}" +
    ".sponsorwand .vwrap{max-width:1120px;margin:0 auto;padding:0 22px}" +
    ".sponsorwand .skicker{color:#1A4FB4;font-weight:700;font-size:13px;text-transform:uppercase;letter-spacing:1.2px;margin:0 0 4px}" +
    ".sponsorwand h2{font-family:'Poppins','Droid Sans',Verdana,sans-serif;font-weight:700;font-size:clamp(24px,3vw,34px);color:#071D60;margin:0 0 6px}" +
    ".sponsorwand .ssub{color:#3A4356;font-size:15px;margin:0 0 26px}" +
    ".tier-groep{margin-bottom:22px}" +
    ".tier-groep .tier-naam{font-family:'Poppins','Droid Sans',Verdana,sans-serif;font-weight:700;color:#3A4356;text-transform:uppercase;letter-spacing:1px;font-size:13px;margin:0 0 10px}" +
    ".tier-groep.hoofd .tier-naam{color:#071D60}" +
    ".hoofd-tile{background:#fff;border:2px solid #FFF000;border-radius:9px;padding:18px 26px;display:inline-flex;align-items:center;gap:16px;text-decoration:none;box-shadow:0 6px 24px rgba(8,21,66,.10)}" +
    ".hoofd-tile img{height:46px;width:auto;object-fit:contain}" +
    ".hoofd-tile .ht-txt{display:flex;flex-direction:column}" +
    ".hoofd-tile .ht-txt b{color:#071D60;font-size:16px;font-family:'Poppins','Droid Sans',Verdana,sans-serif;font-weight:700;font-size:18px}" +
    ".hoofd-tile .ht-txt span{color:#1A4FB4;font-size:13px;font-weight:600}" +
    ".logowall{display:flex;flex-wrap:wrap;gap:14px}" +
    ".logowall .tile{background:#fff;border:1px solid #eceef3;border-radius:9px;width:150px;height:92px;display:grid;place-items:center;padding:12px;box-sizing:border-box;color:#3A4356;font-size:13px;font-weight:600;text-align:center;overflow:hidden}" +
    /* Vaste px-max i.p.v. 100%: in een grid met auto-rij lost max-height:100% niet op en steken grote logo's buiten de tegel */
    ".logowall .tile img{max-width:126px;max-height:68px;object-fit:contain;filter:grayscale(1);opacity:.75;transition:filter .15s,opacity .15s}" +
    ".logowall .tile:hover img{filter:none;opacity:1}" +
    /* Donkere tegel voor logo's die op wit wegvallen of een donkere baked-in achtergrond hebben. */
    ".logowall .tile.donker{background:#0e2350;border-color:#0e2350}" +
    ".logowall .tile.donker img{filter:none;opacity:1}" +
    /* Fallback-tegel zonder logo: crest-watermerk + naam + diagonaal geel trots-lint */
    ".logowall .tile.vvs-fb{position:relative;overflow:hidden}" +
    ".logowall .tile.vvs-fb .fb-crest{position:absolute;inset:0;background-position:center;background-repeat:no-repeat;background-size:52px;opacity:.13}" +
    ".logowall .tile.vvs-fb .fb-naam{position:relative;font-weight:700;color:#071D60;font-size:13px;line-height:1.25;padding:0 6px}" +
    ".logowall .tile.vvs-fb .fb-lint{position:absolute;top:9px;right:-36px;transform:rotate(35deg);background:#FFF000;color:#071D60;font-size:8px;font-weight:700;letter-spacing:.6px;padding:2px 38px;white-space:nowrap}" +
    /* Mobiel: hoofdsponsor-tegel mag nooit breder zijn dan het scherm (was: vaste logo-hoogte -> 421px breed -> horizontale scroll) */
    "@media(max-width:560px){" +
      ".hoofd-tile{display:flex;max-width:100%;box-sizing:border-box;padding:14px 16px;gap:12px;align-items:center}" +
      ".hoofd-tile img{max-width:52%;width:auto;height:auto;max-height:40px;flex:none}" +
      ".hoofd-tile .ht-txt b{font-size:16px}" +
    "}" +
    /* Uniforme footer (vervangt de per-pagina footers) */
    ".vvs-footer{background:#071D60;color:#fff;font-family:'Poppins','Droid Sans',Verdana,Tahoma,sans-serif;padding:46px 0 0;margin:0}" +
    ".vvs-footer .vf-grid{max-width:1120px;margin:0 auto;padding:0 22px;display:grid;grid-template-columns:1.5fr 1fr 1fr 1fr;gap:30px}" +
    "@media(max-width:860px){.vvs-footer .vf-grid{grid-template-columns:1fr 1fr}}" +
    "@media(max-width:520px){.vvs-footer .vf-grid{grid-template-columns:1fr}}" +
    ".vvs-footer h2{font-family:'Poppins','Droid Sans',Verdana,sans-serif;font-size:14.5px;letter-spacing:1px;text-transform:uppercase;margin:0 0 10px;color:#FFF000;font-weight:700}" +
    ".vvs-footer a{color:#fff;text-decoration:none;opacity:.85;font-size:14px}" +
    ".vvs-footer a:hover{opacity:1;text-decoration:underline}" +
    ".vvs-footer .vf-col a{display:block;padding:3.5px 0}" +
    ".vvs-footer .vf-soon{opacity:.5;font-size:14px;display:block;padding:3.5px 0;cursor:default}" +
    ".vf-merk .vf-kop{display:flex;align-items:center;gap:11px;font-weight:700;font-size:16px}" +
    ".vf-merk .vf-crest{width:44px;height:48px;background:#FFF000;clip-path:polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%);padding:6px;flex:none;display:grid;place-items:center}" +
    ".vf-merk .vf-crest img{width:100%;height:100%;object-fit:contain;display:block}" +
    ".vf-merk p{font-size:14px;opacity:.8;line-height:1.55;margin:12px 0 0;max-width:34ch}" +
    ".vf-social{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px}" +
    ".vf-social a,.vf-social span{display:inline-flex;align-items:center;gap:7px;background:rgba(255,255,255,.09);padding:7px 12px;border-radius:9px;font-weight:600;font-size:13.5px;color:#fff;text-decoration:none}" +
    ".vf-social a:hover{background:rgba(255,255,255,.18);opacity:1;text-decoration:none}" +
    ".vf-social span{opacity:.55}" +
    ".vf-social svg{width:15px;height:15px;flex:none}" +
    ".vf-fineprint{max-width:1120px;margin:30px auto 0;padding:16px 22px 22px;border-top:1px solid rgba(255,255,255,.14);font-size:12.5px;opacity:.65;display:flex;flex-wrap:wrap;gap:6px 18px;justify-content:space-between}" +
    /* Welkomstpopup (pilotstatus + oproep vrijwilliger), zie sectie 1b hieronder. */
    ".vvs-popup-overlay{position:fixed;inset:0;z-index:80;background:rgba(7,29,96,.55);display:flex;align-items:center;justify-content:center;padding:20px}" +
    ".vvs-popup{background:#fff;color:#071D60;border-radius:16px;max-width:460px;width:100%;padding:30px 26px 26px;position:relative;box-shadow:0 20px 60px rgba(7,29,96,.35);border-top:5px solid #FFF000;font-family:'Poppins','Droid Sans',Verdana,Tahoma,sans-serif}" +
    ".vvs-popup h2{margin:0 0 12px;font-size:20px;font-weight:700;line-height:1.3;padding-right:24px}" +
    ".vvs-popup p{margin:0 0 20px;font-size:14.5px;line-height:1.6;color:#071D60;opacity:.88}" +
    ".vvs-popup .vp-close{position:absolute;top:10px;right:10px;background:none;border:0;font-size:18px;line-height:1;color:#071D60;opacity:.5;cursor:pointer;width:38px;height:38px;border-radius:8px}" +
    ".vvs-popup .vp-close:hover{opacity:.9;background:rgba(7,29,96,.06)}" +
    ".vvs-popup .vp-cta{display:inline-block;background:#FFF000;color:#071D60;font-weight:700;text-decoration:none;padding:13px 20px;border-radius:10px;font-size:15px;min-height:44px;box-sizing:border-box}" +
    ".vvs-popup .vp-links{display:flex;flex-wrap:wrap;align-items:center;gap:6px 16px;margin-top:16px}" +
    ".vvs-popup .vp-meer{color:#1A4FB4;font-weight:600;font-size:13.5px;text-decoration:underline}" +
    ".vvs-popup .vp-weg{background:none;border:0;color:#071D60;opacity:.6;font-size:13.5px;text-decoration:underline;cursor:pointer;padding:0;font-family:inherit}" +
    ".vvs-popup .vp-close:focus-visible,.vvs-popup .vp-cta:focus-visible,.vvs-popup .vp-meer:focus-visible,.vvs-popup .vp-weg:focus-visible{outline:3px solid #071D60;outline-offset:2px}" +
    "@media(max-width:480px){.vvs-popup{padding:26px 20px 22px}.vvs-popup .vp-cta{display:block;text-align:center}}";
  document.head.appendChild(css);

  /* ---------- 1. Uniforme banner ---------- */
  var oud = document.querySelector("header.topbar, .topbar");
  var banner = document.createElement("header");
  banner.className = "vvs-topbar";
  banner.innerHTML =
    '<div class="vwrap">' +
      '<a class="vvs-brand" href="' + HUB + 'index.html">' +
        '<span class="vcrest"><img src="' + P + 'assets/logos/vvs-crest.svg" alt="Clubcrest vv Staphorst"></span>' +
        '<span>VV Staphorst <small>Sponsoracties · Voor het dorp, door het dorp</small></span>' +
      '</a>' +
      '<nav class="vvs-nav">' +
        '<a href="' + HUB + 'acties.html">Acties</a>' +
        '<a href="' + HUB + 'staphorst-united.html">Staphorst United</a>' +
        '<a href="' + HUB + 'sponsoren.html">Sponsors</a>' +
        '<a href="' + HUB + 'waarom.html">Waarom</a>' +
        '<a href="' + HUB + 'werkgeelblauw.html">Vacaturebank</a>' +
        '<a href="' + HUB + 'sponsormogelijkheden.html#interesse">Voor sponsors</a>' +
        /* De gele nav-knop wijst naar de sponsorgids, niet naar de acties: zolang er
           geen actie live staat is de gids het enige dat een bezoeker echt kan doen.
           Staat de eerste actie live? Zet deze knop dan terug op acties.html. */
        '<a class="vcta" href="' + HUB + 'sponsoren.html">Sponsorgids</a>' +
        '<button class="vvs-burger" type="button" aria-label="Menu openen" aria-expanded="false">☰</button>' +
      '</nav>' +
    '</div>' +
    // Mobiel uitklapmenu (op smalle schermen verdwijnen de nav-links; dit menu brengt ze terug)
    '<div class="vvs-mobielmenu" id="vvs-mobielmenu">' +
      '<a href="' + HUB + 'staphorst-united.html">Staphorst United, het jeugdcollectief</a>' +
      '<a href="' + HUB + 'acties.html">Acties per maand</a>' +
      '<a href="' + HUB + 'sponsoren.html">Sponsorgids, doorzoek alle sponsors</a>' +
      '<a href="' + HUB + 'werkgeelblauw.html">Vacaturebank</a>' +
      '<a href="' + HUB + 'waarom.html">Waarom we dit doen</a>' +
      '<a href="' + HUB + 'sponsormogelijkheden.html">Sponsormogelijkheden</a>' +
      '<a href="' + HUB + 'sponsormogelijkheden.html#interesse">Voor sponsors, meld je interesse</a>' +
      '<a href="' + HUB + 'over-deze-site.html">Over deze site</a>' +
      '<a href="' + HUB + 'beheer/">Beheer</a>' +
      '<p class="vm-kop">vv Staphorst</p>' +
      '<a href="' + LINKS.club + '" target="_blank" rel="noopener">vvstaphorst.nl ↗</a>' +
      '<a href="' + LINKS.insta + '" target="_blank" rel="noopener">Instagram ↗</a>' +
      '<a href="' + LINKS.facebook + '" target="_blank" rel="noopener">Facebook ↗</a>' +
      (LINKS.whatsapp
        ? '<a href="' + LINKS.whatsapp + '" target="_blank" rel="noopener">WhatsApp-kanaal ↗</a>'
        : '<a class="vm-soon" href="' + HUB + 'hoe.html">WhatsApp-kanaal, komt eraan</a>') +
    '</div>';
  if (oud) { oud.parentNode.replaceChild(banner, oud); }
  else { document.body.insertBefore(banner, document.body.firstChild); }

  var burger = banner.querySelector(".vvs-burger");
  var mobiel = banner.querySelector(".vvs-mobielmenu");
  burger.addEventListener("click", function () {
    var open = mobiel.classList.toggle("open");
    burger.setAttribute("aria-expanded", open ? "true" : "false");
    burger.textContent = open ? "✕" : "☰";
  });
  mobiel.addEventListener("click", function (e) {
    if (e.target.tagName === "A") { mobiel.classList.remove("open"); burger.textContent = "☰"; }
  });

  /* ---------- 1b. Welkomstpopup: pilotstatus + oproep vrijwilliger ----------
     "Bij bezoek van de site" (Reinier, 20 aug 2026): één keer per bezoeker een
     modale popup die meteen duidelijk maakt dat dit een pilot is en dat de
     maandacties + vacaturebank nog in onderzoeksfase staan, met een directe
     uitnodiging om aan te sluiten als vrijwilliger. Onthouden via localStorage
     (zelfde principe als de toestemmingsbalk), dus maar 1x per bezoeker, niet
     bij elke pagina. Wél echt modaal (role=dialog, aria-modal, focus-trap, Esc
     sluit) in tegenstelling tot de niet-modale toestemmingsbalk hierboven: dit
     is een bewuste onderbreking bij het eerste bezoek, geen permanente balk.
     Niet op beheerpagina's. Ook niet op staphorst-united.html/​/united: die
     pagina is al écht live (QR op het bord, sponsors betalen er via Rabo) en
     verkoopt zichzelf niet als pilot — een "wij zijn nog in onderzoek"-popup
     zou daar de conversie ondermijnen in plaats van helpen. */
  var POPUP_KEY = "vvs-pilot-popup-gezien";
  var opUnitedpagina = /staphorst-united\.html$/.test(location.pathname) || /^\/united\/?$/.test(location.pathname);

  function popupTonen() {
    if (opBeheerpagina || opUnitedpagina) return false;
    try { return !localStorage.getItem(POPUP_KEY); } catch (e) { return false; }
  }
  function onthoudPopupGezien() {
    try { localStorage.setItem(POPUP_KEY, "1"); } catch (e) {}
  }

  function toonPilotPopup() {
    var overlay = document.createElement("div");
    overlay.className = "vvs-popup-overlay";
    overlay.innerHTML =
      '<div class="vvs-popup" role="dialog" aria-modal="true" aria-labelledby="vp-titel">' +
        '<button type="button" class="vp-close" aria-label="Sluiten">✕</button>' +
        '<h2 id="vp-titel">Welkom, dit platform is in opbouw</h2>' +
        '<p>Dit is een pilot van de sponsorcommissie. De sponsorgids en Staphorst United zijn al live. ' +
        'De maandacties en de vacaturebank staan nog in de <b>onderzoeksfase</b> — die gaan pas draaien ' +
        'met genoeg sponsors én vrijwilligers, bij de sponsorcommissie én de communicatiecommissie.</p>' +
        '<a class="vp-cta" href="' + HUB + 'over-deze-site.html#vrijwilliger">Sluit je aan als vrijwilliger →</a>' +
        '<div class="vp-links">' +
          '<a class="vp-meer" href="' + HUB + 'over-deze-site.html">Meer over deze pilot →</a>' +
          '<button type="button" class="vp-weg">Ik kijk eerst rond</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(overlay);

    var focusbaar = overlay.querySelectorAll("button, a[href]");
    var eerste = focusbaar[0];
    var laatste = focusbaar[focusbaar.length - 1];
    var actiefVoorPopup = document.activeElement;

    function sluit() {
      onthoudPopupGezien();
      overlay.remove();
      document.removeEventListener("keydown", opToets);
      if (actiefVoorPopup && actiefVoorPopup.focus) actiefVoorPopup.focus();
    }
    function opToets(e) {
      if (e.key === "Escape") { sluit(); return; }
      if (e.key !== "Tab") return;
      // Eenvoudige focus-trap, maar 4 focusbare elementen: Tab/Shift+Tab blijven erin.
      if (e.shiftKey && document.activeElement === eerste) { e.preventDefault(); laatste.focus(); }
      else if (!e.shiftKey && document.activeElement === laatste) { e.preventDefault(); eerste.focus(); }
    }
    overlay.addEventListener("click", function (e) { if (e.target === overlay) sluit(); });
    overlay.querySelector(".vp-close").addEventListener("click", sluit);
    overlay.querySelector(".vp-weg").addEventListener("click", sluit);
    // Doorklikken naar over-deze-site.html mag: onthoud "gezien" vóór de navigatie,
    // anders toont site-chrome.js daar meteen dezelfde popup overheen.
    overlay.querySelector(".vp-cta").addEventListener("click", onthoudPopupGezien);
    overlay.querySelector(".vp-meer").addEventListener("click", onthoudPopupGezien);
    document.addEventListener("keydown", opToets);
    eerste.focus();
  }

  if (popupTonen()) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", toonPilotPopup);
    else toonPilotPopup();
  }

  /* ---------- 2. Uniforme footer (vervangt de per-pagina footer) ---------- */
  var ICO = {
    globe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
    insta: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>',
    fb: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>',
    wa: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5 13.9c-.2.6-1.2 1.2-1.7 1.2-.4.1-1 .1-1.6-.1-.4-.1-.9-.3-1.5-.5-2.6-1.1-4.3-3.8-4.4-3.9-.1-.2-1.1-1.4-1.1-2.7 0-1.3.7-1.9.9-2.2.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.4.2.5.7 1.8.8 1.9.1.1.1.3 0 .4-.1.2-.1.3-.3.5l-.4.5c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.4 1.5.3.1.5.1.6-.1.2-.2.7-.8.9-1.1.2-.3.4-.2.6-.1.3.1 1.6.8 1.9.9.3.2.5.2.5.4 0 .1 0 .7-.2 1.3z"/></svg>'
  };

  function bouwFooter() {
    var f = document.createElement("footer");
    f.className = "vvs-footer";
    f.innerHTML =
      '<div class="vf-grid">' +
        '<div class="vf-col vf-merk">' +
          '<div class="vf-kop"><span class="vf-crest"><img src="' + P + 'assets/logos/vvs-crest.svg" alt="Clubcrest vv Staphorst"></span><span>vv Staphorst<br>Sponsoracties</span></div>' +
          '<p>Voor het dorp, door het dorp. Een pilot van de sponsorcommissie, de opbrengst blijft in de club.</p>' +
          '<div class="vf-social">' +
            '<a href="' + LINKS.club + '" target="_blank" rel="noopener">' + ICO.globe + 'vvstaphorst.nl</a>' +
            '<a href="' + LINKS.insta + '" target="_blank" rel="noopener">' + ICO.insta + 'Instagram</a>' +
            '<a href="' + LINKS.facebook + '" target="_blank" rel="noopener">' + ICO.fb + 'Facebook</a>' +
            (LINKS.whatsapp
              ? '<a href="' + LINKS.whatsapp + '" target="_blank" rel="noopener">' + ICO.wa + 'WhatsApp-kanaal</a>'
              : '<span title="Het WhatsApp-kanaal wordt aangemaakt">' + ICO.wa + 'Kanaal komt eraan</span>') +
          '</div>' +
        '</div>' +
        '<div class="vf-col"><h2>Op deze site</h2>' +
          '<a href="' + HUB + 'acties.html">Acties per maand</a>' +
          '<a href="' + HUB + 'staphorst-united.html">Staphorst United</a>' +
          '<a href="' + HUB + 'sponsoren.html">Sponsorgids</a>' +
          '<a href="' + HUB + 'werkgeelblauw.html">Vacaturebank</a>' +
          '<a href="' + HUB + 'archief.html">Archief 25/26</a>' +
          '<a href="' + HUB + 'waarom.html">Waarom we dit doen</a>' +
        '</div>' +
        '<div class="vf-col"><h2>Voor sponsors</h2>' +
          '<a href="' + HUB + 'sponsormogelijkheden.html">Sponsormogelijkheden</a>' +
          '<a href="' + HUB + 'sponsormogelijkheden.html#interesse">Meld je interesse</a>' +
          '<a href="' + HUB + 'hoe.html">Zo bereiken we het dorp</a>' +
          '<a href="mailto:' + LINKS.mail + '">' + LINKS.mail + '</a>' +
        '</div>' +
        /* Beheer-link: sinds 21 juli 2026 is /beheer/* wachtwoord-beveiligd
           (Netlify Edge Function, zie beheer-auth.js), geen 404-muur meer.
           Deze regel stond hier ooit uit met een reden die niet meer klopt
           ("staat niet op het internet") — dat was de oude situatie, vóór
           de login. Het wachtwoord is nu de beveiliging, niet de onvindbaarheid,
           dus een gewone footer-link kan gewoon weer. */
        '<div class="vf-col"><h2>Praktisch</h2>' +
          '<a href="' + HUB + 'over-deze-site.html">Over deze site</a>' +
          '<a href="' + HUB + 'privacy.html">Privacy</a>' +
          /* Toestemming intrekken moet net zo makkelijk zijn als geven (AVG art. 7 lid 3).
             De privacyverklaring verwees hiervoor naar de browserinstellingen. */
          '<a href="#" onclick="VVSToestemmingHerzien();return false;">Meten aan- of uitzetten</a>' +
          '<a href="' + HUB + 'sitemap.html">Sitemap</a>' +
          '<a href="' + HUB + 'beheer/">Beheer</a>' +
        '</div>' +
      '</div>' +
      '<div class="vf-fineprint"><span>© 2026 vv Staphorst, een initiatief van de sponsorcommissie. <a href="' + HUB + 'over-deze-site.html" style="opacity:1;text-decoration:underline">Demo: waarom deze site zo werkt</a>.</span><span>#kopdrveur 💛💙</span></div>';
    var oudFoot = document.querySelector("footer");
    if (oudFoot) { oudFoot.parentNode.replaceChild(f, oudFoot); }
    else { document.body.appendChild(f); }
  }
  bouwFooter();

  /* ---------- 3. Sponsorwand (Hoofd / Top / Goud) vóór de footer, data uit sponsoren.js ---------- */
  function tegel(s) {
    var fb = !s.logo;
    var binnen = s.logo
      ? '<img src="' + P + "assets/logos/" + s.logo + '" alt="' + s.naam + '" loading="lazy" onerror="this.parentNode.textContent=\'' + s.naam.replace(/'/g, "") + '\'">'
      // Geen logo? Dan een trotse VVS-tegel: crest-watermerk + naam + geel lint.
      : '<span class="fb-crest" style="background-image:url(' + P + 'assets/logos/vvs-crest.svg)"></span>' +
        '<span class="fb-naam">' + s.naam + '</span><span class="fb-lint">GEEL-BLAUW TROTS</span>';
    // donker: logo met een donkere achtergrond of een lichte tekst die op wit
    // wegvalt (bv. Mussche, Stiptwerk, Luyckx, LK) krijgt een donkere tegel.
    var klasse = "tile" + (fb ? " vvs-fb" : "") + (s.donker && s.logo ? " donker" : "");
    if (s.web) {
      return '<a class="' + klasse + '" href="' + s.web + '" target="_blank" rel="noopener" title="' + s.naam + '" style="text-decoration:none;color:#3A4356">' + binnen + "</a>";
    }
    return '<div class="' + klasse + '" title="' + s.naam + '">' + binnen + "</div>";
  }

  function bouwWand() {
    var data = window.VVS_SPONSOREN;
    if (!data || !data.length) return; // databestand niet geladen: dan geen wand
    var wand = document.createElement("section");
    wand.className = "sponsorwand";
    var html = '<div class="vwrap"><p class="skicker">Onze grootste sponsors</p><h2>Mede mogelijk gemaakt door</h2>' +
               '<p class="ssub">De hoofd-, top- en goudsponsors die de club dragen.</p>';

    var hoofd = data.filter(function (s) { return s.tier === "Hoofd"; });
    if (hoofd.length) {
      var h = hoofd[0];
      html += '<div class="tier-groep hoofd"><p class="tier-naam">Hoofdsponsor</p>' +
        '<a class="hoofd-tile" href="' + (h.web || HUB + "sponsoren.html") + '" target="_blank" rel="noopener">' +
        (h.logo ? '<img src="' + P + "assets/logos/" + h.logo + '" alt="' + h.naam + '">' : "") +
        '<span class="ht-txt"><b>' + h.naam.replace(" BV", "") + "</b><span>" + (h.web ? "Bezoek de webshop →" : "") + "</span></span></a></div>";
    }
    [["Top", "Topsponsors"], ["Goud", "Goudsponsors"]].forEach(function (g) {
      var groep = data.filter(function (s) { return s.tier === g[0]; })
                      .sort(function (a, b) { return a.naam.localeCompare(b.naam, "nl"); });
      if (!groep.length) return;
      html += '<div class="tier-groep"><p class="tier-naam">' + g[1] + '</p><div class="logowall">' +
              groep.map(tegel).join("") + "</div></div>";
    });
    html += '<p style="margin:6px 0 0"><a href="' + HUB + 'sponsoren.html" style="display:inline-block;background:#FFF000;color:#071D60;font-weight:700;text-decoration:none;padding:12px 20px;border-radius:11px;font-size:15px">Bekijk en doorzoek alle sponsors →</a></p></div>';
    wand.innerHTML = html;
    var foot = document.querySelector("footer");
    if (foot) { foot.parentNode.insertBefore(wand, foot); }
    else { document.body.appendChild(wand); }
  }

  /* De wand tekent eerst uit het statische sponsoren.js (instant, werkt
     altijd) en haalt daarna de live-stand op bij /vvs-data/sponsoren —
     dezelfde bron als de sponsorgids. Zonder dit toonde de wand na een
     "Direct publiceren" in beheer de oude stand, terwijl de gids op
     dezelfde pagina de nieuwe al liet zien (audit 22 aug 2026). Zelfde
     veiligheidsregels als assets/vvs-live.js: timeout, vormcontrole, en
     een leeg live-antwoord vervangt nooit een gevulde statische lijst. */
  function wandLiveVolgen() {
    var timer = null;
    var controller = ("AbortController" in window) ? new AbortController() : null;
    if (controller) timer = setTimeout(function () { controller.abort(); }, 3500);
    fetch(HUB + "vvs-data/sponsoren", { signal: controller ? controller.signal : undefined, headers: { accept: "application/json" } })
      .then(function (r) { if (!r.ok) throw new Error("status " + r.status); return r.json(); })
      .then(function (verse) {
        if (timer) clearTimeout(timer);
        if (!Array.isArray(verse) || !verse.length) return;
        var gelijk;
        try { gelijk = JSON.stringify(verse) === JSON.stringify(window.VVS_SPONSOREN); }
        catch (e) { gelijk = false; }
        if (gelijk) return;
        window.VVS_SPONSOREN = verse;
        var oude = document.querySelector(".sponsorwand");
        if (oude) oude.remove();
        bouwWand();
      })
      .catch(function () { if (timer) clearTimeout(timer); /* statische wand blijft staan */ });
  }

  // sponsoren.js is op de meeste pagina's nog niet geladen, dan laden we hem hier bij.
  if (window.VVS_SPONSOREN) { bouwWand(); wandLiveVolgen(); }
  else {
    var lader = document.createElement("script");
    lader.src = P + "assets/sponsoren.js";
    lader.onload = function () { bouwWand(); wandLiveVolgen(); };
    document.head.appendChild(lader);
  }
})();
