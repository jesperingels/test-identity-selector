# Test Identity Selector

Kleine Chrome-extensie (MV3) voor interne tests om snel een testidentiteit
te selecteren in loginflows.

## Wat doet dit?

-   Opent een popup met een zoekveld.
-   Zoekt in de actieve tab naar een `<select class="form-control">`.
-   Selecteert automatisch de eerste match die de ingevoerde tekst bevat.
-   Toont alle matches in een resultatenlijst (altijd zichtbaar bij meerdere hits).
-   Laat je een andere match kiezen via klik of toetsenbord (pijltjestoetsen + Enter).
-   Slaat recente selecties op voor snelle herselectie.
-   Ondersteunt favorieten voor veelgebruikte identiteiten.
-   Triggert een `change` event zodat de pagina de keuze verwerkt.

## Gebruik

### Basis zoeken

1. Open de testloginpagina met de dropdown voor testgebruikers.
2. Klik op het extensie-icoon.
3. Typ een (deel van de) naam, bv. "Trivium".
4. Klik op "Selecteer gebruiker" of druk op Enter.

De eerste match wordt automatisch geselecteerd. Als er meerdere matches zijn, verschijnt er een resultatenlijst onder het zoekveld.

### Meerdere resultaten

-   Bij meerdere matches wordt de eerste automatisch geselecteerd.
-   De resultatenlijst blijft zichtbaar zolang er >1 match is.
-   Klik op een resultaat om die identiteit te selecteren.
-   Gebruik pijltjestoetsen (↑/↓) om door resultaten te navigeren en Enter om te selecteren.
-   Klik op de ster (☆) om een identiteit als favoriet te markeren.

### Recent en Favorieten

-   **Recent**: Toont de laatste 10 geselecteerde identiteiten. Klik op een item om opnieuw te selecteren.
-   **Favorieten**: Markeer veelgebruikte identiteiten met de ster. Klik op een favoriet om snel te selecteren.
-   Gebruik "Wissen" om de recente lijst te legen.

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
-   `popup.html` — UI van de popup (inclusief resultatenlijst, recent en favorieten secties).
-   `popup.js` — logica voor selectie, meerdere matches, opslag en statusmeldingen.
-   `popup.css` — styling van de popup en lijsten.

## Permissions

-   `activeTab` om de actieve tab te targeten.
-   `scripting` om het selectie-script uit te voeren.
-   `storage` om recente selecties en favorieten lokaal op te slaan.

## Beperkingen

-   Werkt alleen op pagina's waar een `select.form-control` aanwezig is.
-   Selecteert automatisch de **eerste** match die de zoekterm bevat.
-   Geen fuzzy matching of exacte filtering (gebruikt `includes()` voor matching).
-   Recente selecties worden opgeslagen per extensie-installatie (niet gesynchroniseerd tussen apparaten).
