# Test Identity Selector

Kleine Chrome-extensie (MV3) voor interne tests om snel een testidentiteit
te selecteren in loginflows.

## Wat doet dit?

-   Opent een popup met een zoekveld.
-   Zoekt in de actieve tab naar een `<select class="form-control">`.
-   Selecteert de eerste optie die de ingevoerde tekst bevat.
-   Triggert een `change` event zodat de pagina de keuze verwerkt.

## Gebruik

1. Open de testloginpagina met de dropdown voor testgebruikers.
2. Klik op het extensie-icoon.
3. Typ een (deel van de) naam, bv. "Trivium".
4. Klik op "Selecteer gebruiker".

De statusbalk in de popup toont het resultaat (geselecteerd, geen match, of fout).

## Installatie (lokale ontwikkeling)

1. Open `chrome://extensions`.
2. Zet "Developer mode" aan.
3. Klik "Load unpacked" en selecteer deze map.

## Verwachte pagina-structuur

De extensie zoekt specifiek naar:

-   `select.form-control` in de actieve tab
-   Opties waarvan de zichtbare tekst de zoekterm bevat

Als de dropdown een andere class heeft, wordt er geen match gevonden.

## Bestanden

-   `manifest.json` — MV3 manifest en permissies.
-   `popup.html` — UI van de popup.
-   `popup.js` — logica voor selectie en statusmeldingen.
-   `popup.css` — styling van de popup.

## Permissions

-   `activeTab` om de actieve tab te targeten.
-   `scripting` om het selectie-script uit te voeren.

## Beperkingen

-   Werkt alleen op pagina’s waar een `select.form-control` aanwezig is.
-   Selecteert de **eerste** match die de zoekterm bevat.
-   Geen fuzzy matching of exacte filtering.
