/* ============================================================
   VVS-LIVE, de fetch-met-terugval-laag voor live-bewerkte data.

   Elke publieke pagina laadt EERST het statische assets/<naam>.js
   (window.VVS_ACTIES / VVS_SPONSOREN / VVS_WEDSTRIJDEN /
   VVS_UNITED_DEELNEMERS) zoals altijd: synchroon, cachebaar, werkt
   ook zonder verbinding met de Function. Dat is de instant-render
   en tegelijk het vangnet.

   Deze module haalt DAARNA de live-stand op bij de Netlify Function
   (netlify/functions/vvs-data.mjs) en roept, ALLEEN als het antwoord
   op tijd binnenkomt EN afwijkt van de statische data, een callback
   aan zodat de pagina zichzelf opnieuw tekent. Komt de Function niet
   op tijd terug of geeft hij een fout, dan gebeurt er niets: de al
   getekende statische data blijft gewoon staan. Zo kan een haperende
   Function of een Blobs-storing de site nooit breken, alleen "iets
   minder vers" maken.

   GEBRUIK, op elke pagina die live moet volgen:
     VVS_LIVE.volg("united", window.VVS_UNITED_DEELNEMERS, function (verse) {
       window.VVS_UNITED_DEELNEMERS = verse;
       tekenOpnieuw();
     });

   VEILIGHEIDSREGEL: een live-antwoord dat LEEG is terwijl de statische
   data dat niet is, wordt genegeerd. netlify/functions/vvs-data.mjs seedt
   een nog nooit beschreven blob normaal automatisch bij de eerste lezing
   (uit de meegedeployde momentopname in netlify/functions/seed/*.mjs),
   dus in de praktijk komt [] daar niet meer vandaan; deze regel is het
   laatste vangnet voor als dat een keer toch misgaat (Blobs tijdelijk
   onbereikbaar, een leeggehaalde store). Kleinere-maar-niet-lege
   verschillen (een echte verwijdering door de beheerder) worden wel
   gewoon doorgevoerd, dat is precies het doel.
   ============================================================ */
window.VVS_LIVE = (function () {
  "use strict";
  var TIMEOUT_MS = 3500;

  /* Draait deze pagina op een vreemde host (een kopie op bv. vvstaphorst.nl,
     of lokaal geopend als bestand)? Dan woont de Function niet op deze host
     en halen we de live-stand rechtstreeks bij de hub. Op de eigen hosts
     (eigen domein, netlify.app, lokaal testen met netlify dev/smoke) blijft
     het pad relatief, precies zoals het altijd was. De Function stuurt op
     GET Access-Control-Allow-Origin: * mee (zie netlify/functions/vvs-data.mjs),
     anders blokkeert de browser deze cross-origin fetch stil. */
  var EIGEN_HOST = /(^|\.)vvstaphorst-united\.nl$|\.netlify\.app$|^localhost$|^127\.0\.0\.1$/.test(location.hostname);
  var BASIS = EIGEN_HOST ? "" : "https://vvstaphorst-united.nl";

  function volg(naam, statischeData, callback) {
    var timer = null;
    var controller = ("AbortController" in window) ? new AbortController() : null;
    if (controller) timer = setTimeout(function () { controller.abort(); }, TIMEOUT_MS);

    fetch(BASIS + "/vvs-data/" + encodeURIComponent(naam), {
      signal: controller ? controller.signal : undefined,
      headers: { accept: "application/json" }
    })
      .then(function (r) {
        if (!r.ok) throw new Error("vvs-data " + naam + ": status " + r.status);
        return r.json();
      })
      .then(function (verse) {
        if (timer) clearTimeout(timer);
        if (!Array.isArray(verse)) return; // vormfout: negeer, statische data blijft staan
        if (verse.length === 0 && Array.isArray(statischeData) && statischeData.length > 0) return; // zie veiligheidsregel hierboven
        var gelijk;
        try { gelijk = JSON.stringify(verse) === JSON.stringify(statischeData); }
        catch (e) { gelijk = false; }
        if (gelijk) return; // niets veranderd, geen hertekenwerk nodig
        callback(verse);
      })
      .catch(function () {
        if (timer) clearTimeout(timer);
        // Stil. De statische data (al getekend bij het laden van de pagina)
        // blijft gewoon staan. Dit is het bedoelde gedrag bij een trage of
        // haperende Function, niet een fout die iemand moet zien.
      });
  }

  return { volg: volg };
})();
