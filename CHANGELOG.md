# Changelog

## 1.2.0
- **Nieuwe startpagina Thuis** in het thema van je plattegrond: begroeting met tijd, buitentemperatuur en wie er thuis is; de slimme knop en je knoppen; een tegel per kamer (gloeit als er licht aan is, tik = lampen aan/uit, vasthouden = pagina van de kamer) plus gordijnen, klimaat en tv; energie nu, weer en status. Op een eigen dashboard met `home: true`.

## 1.1.4
- **Dubbeltik** op een geopende ruimte: terug naar de hele plattegrond (telefoon: naar het overzicht). Werkt ook op de eigen pagina van een ruimte, en volledig scherm blijft aan.
- De eigen pagina van een ruimte heeft nu ook een knop **Terug**.

## 1.1.3
- Knop **Per ruimte / Hele plattegrond** in de werkbalk: zet de telefoonweergave ook aan op een tablet of pc. Elk apparaat onthoudt zijn eigen keuze.

## 1.1.2
- Volledig scherm op Android sprong terug: tijdens de overgang meet de kaart heel even breedte 0 en schakelde dan uit de telefoonweergave. Dat gebeurt niet meer.
- Geen heen-en-weer meer rond de grens van de telefoonweergave (een schuifbalk kon de pagina laten vastlopen): er zit nu marge op en de kaart wacht tot de breedte stil staat.
- Editor: alle teksten eenvoudiger en zonder vakjargon.

## 1.1.1
- Telefoon: een gekozen ruimte blijft staan, ook als de kaart smal werd terwijl het tabblad op de achtergrond stond.

## 1.1.0
- **Telefoon: ruimte per ruimte.** Op een smal scherm (standaard < 560 px) toont de kaart een balk met *Overzicht* en je ruimtes. Het overzicht toont namen en temperaturen; een ruimte vult de breedte met grote iconen en het tekstblok erboven. Vegen = volgende of vorige ruimte. Instelbaar bij stap 5 (*Kleine schermen*), per kaart met `compact: auto | on | off`.
- Bij inzoomen en op ruimtepagina's wordt alles buiten de ruimte gedimd, ook muren en licht van andere ruimtes.
- Op de telefoon gebruikt de plattegrond altijd de volle breedte, en "Iconen verplaatsen" is daar alleen een icoon.

## 1.0.5
- Eigen icoon in Home Assistant (Instellingen → Integraties), ook scherp op hoge resolutie. Vanaf Home Assistant 2026.3.
- Installatie: duidelijke volgorde (downloaden, herstarten, toevoegen) en uitleg bij de melding *"Deze integratie ondersteunt geen configuratie via de UI"*.

## 1.0.4
- Het icoon dat je aanwijst komt met zijn naam naar de voorgrond, ook als het naast of onder andere iconen staat.

## 1.0.3
- *Sterkte van lampen*: kies *altijd onder de lamp*, *alleen bij aanwijzen* (percentage naast de naam als je de lamp aanwijst) of *niet tonen*.

## 1.0.2
- *Grootte plattegrond*: laat de plattegrond bijvoorbeeld 90% van de breedte gebruiken voor een compactere pagina; iconen, tekst en gloed schalen mee. Per kaart ook als `size: 90`.

## 1.0.1
- Lampen tonen hun sterkte: het percentage onder de knop, en een gedimde lamp heeft een zachtere knop en lichtvlek (uit te zetten met *Sterkte van lampen tonen*).
- De lichtvlek verhuist mee als je een lamp versleept.

## 1.0.0
Eerste versie.

- **Editor in de zijbalk** in 6 stappen: achtergrond (bouwtekening, foto of stofzuigerkaart, draaien en spiegelen), ruimtes (ook L-vormig, muren ontstaan vanzelf), deuren en open doorgangen, apparaten (automatisch plaatsen uit je areas), instellingen en klaar. Importeren en exporteren als JSON.
- **Live plattegrond**: lampen in hun eigen kleur met een zachte lichtvlek, tikken = aan/uit, vasthouden = details, camera's met live beeld.
- **Tekstblokken per ruimte** met een grote waarde en regels met iconen (lampen, CO2, vocht, gordijnen, verwarming/airco, wat er speelt, eigen regels). Ze zoeken zelf de vrijste plek en zijn te slepen, te schalen en te verbergen.
- **Eenvoudig / Alles**: Eenvoudig toont alleen wat mensen de laatste dagen echt bedienen.
- **Ruimte openen**: inzoomen met een zijpaneel, of een eigen pagina per ruimte.
- **Temperatuurkleuren**, **aanwezigheid** (sensoren en personen per kamer) en **meldingen** (rook, gas, CO en lekkage rood; open deur of raam oranje).
- **Stofzuiger**: rijdt live over de plattegrond met een spoor; *Deze ruimte zuigen*.
- **Zijkolom**: klok, weer, begroeting met wie er thuis is, een slimme knop per tijdvak, knoppen, energie en status.
- **Thema's**: Automatisch (zon), Warm, High-tech, Blueprint, Glas, Terminal, Rock en Home Assistant; één thema voor het hele huis via een helper.
- **Dashboard in één klik**: Thuis, Plattegrond, Kiosk, Energie, Buiten, TV en een pagina per ruimte; volledig scherm dat blijft bij het wisselen van tabblad.
- Nederlands en Engels.
