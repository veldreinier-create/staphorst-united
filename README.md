# Staphorst United — de pagina, compleet en zelfstandig

Dit is de volledige, zelfstandige kopie van de Staphorst United-pagina zoals die live draait op **https://vvstaphorst-united.nl**. Alles wat de pagina nodig heeft zit erin: HTML, fonts, clubcrest, teamfoto, sponsorlogo's en de scripts. Geen buildstap, geen dependencies — uploaden is genoeg.

## Voor wie de pagina wil overnemen (bijv. op vvstaphorst.nl)

1. Kopieer **`staphorst-united.html` en de hele map `assets/`** naar de webserver, met behoud van de mapstructuur (ze moeten naast elkaar staan).
2. Klaar. De pagina werkt direct, ook op een ander domein.

De map `tools/` en dit README horen niet mee op de server (mogen wel, ze doen niets).

### Wat er automatisch gebeurt op een ander domein

De pagina merkt zelf dat hij niet op vvstaphorst-united.nl draait en schakelt dan om:

- **De deelnemerslijst** (namen, teller, balk) wordt live opgehaald bij `https://vvstaphorst-united.nl/vvs-data/united`. Een nieuwe deelnemer die daar in beheer wordt gepubliceerd, verschijnt dus **vanzelf** ook op de kopie — opnieuw kopiëren is niet nodig. Is de hub even onbereikbaar, dan toont de pagina de meegeleverde lijst uit `assets/united-deelnemers.js` (vangnet).
- **De sponsorwand** onderaan doet hetzelfde met `https://vvstaphorst-united.nl/vvs-data/sponsoren`.
- **Menu- en footerlinks** naar andere pagina's (Acties, Sponsorgids, Beheer …) wijzen absoluut naar de hub, want die pagina's bestaan alleen daar.

Alleen bij een wijziging aan de **pagina zelf** (tekst, opzet, foto) is een nieuwe kopie uit deze repo nodig; de data loopt live mee.

## Beheer: waar de lijst wordt bijgehouden

De deelnemerslijst en de sponsordata worden **uitsluitend** beheerd via de beheeromgeving op vvstaphorst-united.nl (wachtwoord bij de sponsorcommissie). Deze repo en elke kopie lezen daar alleen uit. Zo staat er overal dezelfde stand en is er één plek waar iets kan worden aangepast.

## Voor de beheerder van deze repo (sync met de hub)

De bron van waarheid voor de pagina is de sponsorhub-broncode (map `_OUTPUTS/affiliate-vvstaphorst` op de werk-pc). Na een wijziging daar:

```
node tools/sync-vanuit-hub.mjs
```

Dat kopieert de actuele pagina plus precies de benodigde assets hierheen (fonts uit `fonts-ds.css`, wand-logo's van de tiers Hoofd/Top/Goud uit `sponsoren.js`). Daarna gewoon committen en pushen. `--controleer` meldt alleen de verschillen zonder iets te wijzigen.

## Wat hier bewust níét in zit

- De overige hub-pagina's (acties, sponsorgids, vacaturebank …) — die wonen op vvstaphorst-united.nl.
- De beheeromgeving en de Netlify-functions — beheer blijft op de hub.
- Logo's van sponsor-tiers die niet op deze pagina staan.

## Contact

Sponsorcommissie vv Staphorst — sponsor@vvstaphorst.nl
