# Staphorst United op vvstaphorst.nl · instructie

Voor: Stefan Spiker · Van: Reinier Veld (sponsorcommissie) · 8 september 2026

## Wat we willen

De Staphorst United-pagina als subpagina op vvstaphorst.nl. Het beheer blijft centraal: de deelnemerslijst en de sponsordata worden op één plek bijgehouden (de beheeromgeving van vvstaphorst-united.nl) en elke kopie leest daar automatisch uit. Jij hoeft dus nooit namen over te typen of bij te werken.

## Hoe het systeem werkt (1 minuut lezen)

Pagina en data zijn gescheiden. De pagina haalt de teller, de namenlijst en de sponsorwand live op bij `https://vvstaphorst-united.nl/vvs-data/...`. Publiceert de sponsorcommissie een nieuwe deelnemer, dan staat die vanzelf ook op de clubsite-versie. Alleen als de página zelf verandert (tekst, foto, opzet) is er iets nodig, en bij route A hieronder zelfs dan niets.

## Route A · iframe-embed (aanbevolen, ±10 minuten)

1. Maak in VoetbalAssist een nieuwe pagina aan, bijvoorbeeld "Staphorst United".
2. Zet de editor op **HTML/bronweergave** (de gewone tekstmodus verwijdert code bij het opslaan).
3. Plak dit, verder niets:

```html
<iframe src="https://vvstaphorst-united.nl/staphorst-united.html?embed=1"
        style="width:100%;height:85vh;min-height:640px;border:0"
        title="Staphorst United, het jeugdcollectief"
        loading="lazy"></iframe>
```

4. Opslaan, publiceren, klaar. Bij elke wijziging aan pagina of lijst loopt de embed vanzelf mee.

Goed om te weten:

- `?embed=1` zorgt dat de pagina zónder eigen menu, footer en cookiebalk laadt. Geen dubbele navigatie op de clubsite dus.
- De hoogte `85vh` geeft één binnen-scroll in het frame. Liever alles in één keer zichtbaar? Zet `height` op zoiets als `4300px` (kost onderaan wat witruimte).
- De United-site staat insluiten alleen toe vanaf vvstaphorst.nl (en VoetbalAssist-previews). Op elke andere site blijft het frame bewust leeg.
- Verwijdert VoetbalAssist de iframe toch bij het opslaan? Vraag hun support naar de module voor eigen HTML/embeds, of kies route B of C.

## Route B · volledige kopie (alleen bij echte webruimte)

Kan er op de hosting een eigen map met bestanden staan (dus niet alleen CMS-pagina's)?

1. Pak de kant-en-klare ZIP die Reinier meestuurt (`..._united-site-kopie-stefan_v1.zip`) en pak hem uit. Geen ZIP bij de hand? Dezelfde bestanden staan in de GitHub-repo **github.com/veldreinier-create/staphorst-united** (toegang via Reinier, knop Code, Download ZIP).
2. Upload `staphorst-united.html` plus de complete map `assets/` naar bijvoorbeeld `vvstaphorst.nl/united/`, mapstructuur intact.
3. Klaar. De pagina merkt zelf dat hij op de clubsite draait: menu- en footerlinks wijzen naar de hub en de data loopt live mee.

Bij deze route vraagt een tekstwijziging wél een nieuwe upload (Reinier levert dan een verse ZIP).

## Route C · menu-link (vangnet, 1 minuut)

Lukt A en B niet: maak een menu-item "Staphorst United" dat linkt naar `https://vvstaphorst-united.nl`. Werkt altijd.

## Checklist na plaatsing

- [ ] De teller toont de actuele stand (vandaag: 33 van 100), niet 0.
- [ ] De namenlijst staat gevuld, met LogicTrade en PlasmaMade erin.
- [ ] Op een telefoon: pagina leesbaar, geen zijwaarts scrollen.
- [ ] De knop "Ik doe mee" opent WhatsApp.
- [ ] Geen dubbele menubalken of dubbele footer.

## Afspraken

- Nooit tekst rechtstreeks in een kopie aanpassen; wijzigingen lopen via Reinier, dan blijft alles overal gelijk.
- Nieuwe deelnemers gaan via de beheeromgeving van de sponsorcommissie, nergens anders.
- Vragen: Reinier Veld, sponsor@vvstaphorst.nl.
