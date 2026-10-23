<img src="../custom_components/floorplan_studio/brand/icon@2x.png" alt="" width="80" align="right">

# Floorplan Studio – handleiding

Met Floorplan Studio maak je een interactieve plattegrond van je huis voor je Home Assistant-dashboards. Je tekent hem zelf in een paar minuten zonder code, of je trekt hem over van de kaart van je robotstofzuiger of van een foto van de bouwtekening.

![Het dashboard met plattegrond en zijkolom](img/dashboard.png)

> Alle schermafbeeldingen in deze handleiding komen uit het **Voorbeeldhuis**: een verzonnen huis met nep-apparaten (Anna, Tom, "Camera voordeur"…). Je kunt het zelf inladen, zie [Uitproberen met het voorbeeldhuis](#7-uitproberen-met-het-voorbeeldhuis).

**Inhoud**
1. [Installeren](#1-installeren)
2. [Je plattegrond maken – stap voor stap](#2-je-plattegrond-maken--stap-voor-stap)
3. [Het dashboard](#3-het-dashboard)
4. [De kaart gebruiken](#4-de-kaart-gebruiken)
5. [Extra's: zijkolom, tekstblokken, temperatuur, aanwezigheid, meldingen, stofzuiger](#5-extras)
6. [Thema's](#6-themas)
7. [Uitproberen met het voorbeeldhuis](#7-uitproberen-met-het-voorbeeldhuis)
8. [Tips](#8-tips)
9. [Problemen oplossen](#9-problemen-oplossen)

---

## 1. Installeren

### Met één klik
1. [![Open in HACS](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=trackerr&repository=home-assistant-floorplan-studio&category=integration)  
   Opent Floorplan Studio meteen in HACS. Klik **Downloaden** en **herstart Home Assistant**.
2. Pas **na de herstart**: [![Add integration to Home Assistant](https://my.home-assistant.io/badges/config_flow_start.svg)](https://my.home-assistant.io/redirect/config_flow_start/?domain=floorplan_studio)  
   Voegt de integratie toe. Klik **Verzenden**.

Klik je knop 2 vóór het downloaden of vóór de herstart, dan zegt Home Assistant *"Deze integratie ondersteunt geen configuratie via de UI"*. Er is dan niets mis: Home Assistant kent Floorplan Studio gewoon nog niet. Download hem in HACS, herstart, en klik dan opnieuw op knop 2.

De knoppen openen je eigen Home Assistant via my.home-assistant.io. De eerste keer vraagt die om het adres van je Home Assistant (bijv. `http://homeassistant.local:8123`).

### Via HACS (met de hand)
1. Open **HACS** → menu **⋮** rechtsboven → **Aangepaste repositories**.
2. Plak `https://github.com/trackerr/home-assistant-floorplan-studio` en kies type **Integratie**.
3. Zoek **Floorplan Studio**, klik **Downloaden** en **herstart Home Assistant**.
4. Ga naar **Instellingen → Apparaten & diensten → Integratie toevoegen** en kies **Floorplan Studio**. Klik op **Verzenden**.

Daarna staat **Floorplan** in je zijbalk. De kaart wordt automatisch geladen, dus je hoeft geen *resource* toe te voegen.

### Met de hand
Kopieer de map `custom_components/floorplan_studio` naar `config/custom_components/` in je Home Assistant-configuratie, herstart HA en voeg de integratie toe zoals in stap 4 hierboven.

> **Tip:** Floorplan Studio haalt veel informatie uit je **areas** (ruimtes in HA). Kijk voor je begint even of je lampen, sensoren en apparaten aan de juiste area hangen: **Instellingen → Areas, labels & zones**.

---

## 2. Je plattegrond maken – stap voor stap

Klik in de zijbalk op **Floorplan**. Bovenaan staan zes stappen; je kunt altijd heen en weer springen.

- **Opslaan** zit rechtsboven en kan op elk moment.
- **Ongedaan maken** gaat met de ↶-knop of **Ctrl+Z**.
- **Verwijderen** van wat geselecteerd is gaat met de **Delete**-toets.
- Met **+** maak je een nieuwe plattegrond (bijv. een tweede verdieping), met de knoppen ernaast **importeer** of **exporteer** je een plattegrond als JSON-bestand.

### Stap 1 – Achtergrond

![Stap 1: de stofzuigerkaart als achtergrond](img/stap1-achtergrond.png)

1. Geef je plattegrond een **naam**, bijvoorbeeld "Begane grond".
2. Kies waar je plattegrond vandaan komt:

   | Keuze | Wanneer |
   |---|---|
   | **Plaatje uploaden** | Je hebt een bouwtekening, foto, schets of screenshot uit je stofzuiger-app. |
   | **Kaart van je robotstofzuiger (of een camera)** | Je hebt Roborock, Valetudo, Xiaomi Cloud Map Extractor of een andere integratie met een `image.`-entiteit van de kaart. Kies hem in de lijst en klik **Gebruiken**. |
   | **Zonder voorbeeld tekenen** | Je hebt geen afbeelding. Je tekent dan gewoon op het raster. |

3. Stel met de schuifjes de **doorzichtigheid**, **schaal** en **positie** in, zodat de achtergrond mooi op het raster valt. **Passend maken** zet hem in één klik passend.
4. Ligt de kaart een kwartslag gedraaid of gespiegeld (stofzuigerkaarten doen dat vaak)? Gebruik bij **Draaien** de knoppen **90° links** / **90° rechts** en **Spiegelen** tot hij goed ligt.

De achtergrond is alleen een hulp om over te trekken: op je dashboard zie je hem niet. Komt hij van je stofzuigerkaart, dan onthoudt Floorplan Studio dat (ook hoe je hem gedraaid hebt). Daardoor kan de **live stofzuigerkaart** later precies over je plattegrond vallen, zie [hoofdstuk 5](#de-stofzuiger-live-op-de-kaart).

Klik **Volgende**.

### Stap 2 – Ruimtes

![Stap 2: ruimtes tekenen, de woonkamer is geselecteerd](img/stap2-ruimtes.png)

1. Kies **Ruimte tekenen** en **sleep een rechthoek** over elke kamer.
2. Is een kamer L-vormig, zoals de woonkamer hierboven? Selecteer de ruimte, kies **Stuk aan ruimte toevoegen** en teken het extra stuk erbij. Samen vormen ze één ruimte zonder muur ertussen.
3. Met **Kiezen en verschuiven** kun je een ruimte verslepen, de **hoekpuntjes** verslepen om de maat te veranderen, en de ruimte een naam geven.
4. Optioneel per ruimte:
   - **Grote waarde**: wat groot in het tekstblok staat. Standaard de temperatuur, maar het kan elke sensor zijn (bijv. het vermogen van de zonnepanelen bij het kantoor).
   - **Extra regels in het tekstblok**: tot drie apparaten of sensoren uit die area, bijv. de vaatwasser of de 3D-printer.
   - **Vloer**: gewoon, tegels (badkamer, wc) of hout.
5. **Koppel elke ruimte aan een Home Assistant-area.** Dat is de belangrijkste stap. Daardoor:
   - weet de ruimte welke lampen en apparaten erbij horen;
   - zoekt hij automatisch de **temperatuur** en **vochtigheid** (zijn er meerdere sensoren, dan kies je er hier één);
   - werken aanwezigheid, meldingen en "deze ruimte zuigen" vanzelf.

**Muren hoef je niet te tekenen.** Waar twee ruimtes elkaar raken komt een binnenmuur, waar niets naast ligt een buitenmuur.

> **Snel beginnen:** met **Ruimtes overnemen uit Home Assistant** krijg je voor elke area alvast een rechthoek. Die schuif en rek je daarna op de goede plek.

### Stap 3 – Deuren

![Stap 3: deuren (roze) en een open doorgang (groen)](img/stap3-deuren.png)

1. Kies **Deur** of **Open doorgang** en **klik op een muur**.
   - Een **deur** maakt een opening met kleine deurposten.
   - Een **open doorgang** haalt de muur weg, bijvoorbeeld tussen woonkamer en open keuken. Met **Hele wand** wordt de complete muur open.
2. Klik op een deur om de **breedte** of de soort aan te passen, of om hem te verwijderen.

### Stap 4 – Apparaten

![Stap 4: apparaten op de kaart](img/stap4-apparaten.png)

1. Klik op **Alles vanzelf neerzetten**. Alle lampen, schakelaars, thermostaten, gordijnen, mediaspelers, camera's enz. uit de gekoppelde areas komen in hun kamer te staan.
2. **Sleep** de iconen naar de plek waar ze echt staan.
3. Mist er iets? Zoek een entiteit in het zoekveld, of klik bij **Nog niet op de kaart** op een apparaat.
4. Klik op een icoon om:
   - een eigen **naam** of **icoon** te kiezen;
   - een vaste **gloedkleur** te geven (handig voor een slimme stekker met een gekleurde lamp erin);
   - **Altijd tonen** aan te zetten (zie *Eenvoudig* in hoofdstuk 4);
   - het van de kaart te halen.

### Stap 5 – Instellingen

![Stap 5: instellingen met live voorbeeld](img/stap5-instellingen.png)

Alles wat je hier instelt geldt voor elke kaart die deze plattegrond toont. Rechts zie je meteen een live voorbeeld.

| Onderdeel | Wat stel je in |
|---|---|
| **Uiterlijk** | Standaardthema, **één thema voor het hele huis** (keuzelijst, zie hoofdstuk 6), grootte van de plattegrond (kleiner = compactere pagina, alles op de kaart schaalt mee), **kleine schermen** (per ruimte onder een bepaalde breedte, altijd of nooit; zie hoofdstuk 4), grootte van iconen en kamertekst, sterkte van de gloed. |
| **Tekst bij de ruimtes** | Temperatuur, vochtigheid, lampen aan en statuslabels onder apparaten, elk los aan of uit. |
| **Eenvoudig-modus** | Standaardweergave, hoeveel dagen hij terugkijkt (1–60), en tot hoeveel dagen geschiedenis hij nog alles toont terwijl hij leert. |
| **Bediening** | Tikken op een ruimte aan/uit, wat er dan gebeurt (**inzoomen** of de **eigen pagina** van de ruimte openen) en hoe lang je moet vasthouden voor de details. |
| **Automatisch (zon)** | Hoeveel minuten vóór zonsopkomst het licht wordt, en hoe lang de overgang duurt. |
| **Tekstblok en licht** | Lichtvlek per lamp, hele ruimte laten gloeien of geen gloed; welke regels het tekstblok toont (CO2, gordijnen, verwarming/airco, wat er speelt) en hoeveel; het kompas; de begroeting. |
| **Zijkolom** | Weer, de grote knop, drie knoppen, de energiesensoren en de statuslijst. Leeg laten = automatisch gekozen. |
| **Kleur op temperatuur** | Standaard aan of uit, en bij welke temperatuur een ruimte blauw (koud) en rood (warm) is. |
| **Aanwezigheid** | Stip bij bezette ruimtes aan/uit, en per persoon de sensor die zegt in welke ruimte hij of zij is. |
| **Meldingen** | Alarm (rook, gas, koolmonoxide, lekkage) en open deuren/ramen, elk los aan of uit. |
| **Stofzuiger** | Welke stofzuiger, wanneer de live kaart verschijnt, welke kaart-entiteit en hoe doorzichtig. |
| **Automatisch plaatsen** | Welke soorten apparaten *Alles vanzelf neerzetten* meeneemt. |

Met **Alles terugzetten** zet je alles in één keer terug.

### Stap 6 – Klaar

![Stap 6: dashboard maken](img/stap6-klaar.png)

1. Klik op **Opslaan**.
2. Laat **Met startpagina "Thuis"** aangevinkt als je een overzichtspagina wilt (zie hoofdstuk 3).
3. Klik op **Dashboard maken**. Je krijgt een nieuw dashboard in de zijbalk, zie hieronder.

Je kunt de kaart ook op een bestaand dashboard zetten: bewerk het dashboard, kies **Kaart toevoegen** en dan **Floorplan Studio**.

---

## 3. Het dashboard

**Dashboard maken** zet een compleet dashboard voor je klaar. Tabbladen zonder inhoud (bijv. geen mediaspelers) worden overgeslagen.

| Tabblad | Wat staat erop |
|---|---|
| **Thuis** *(optioneel)* | Startpagina met het weer, wie er thuis is, en per ruimte een kaart. Tik op een ruimte om de pagina van die ruimte te openen. |
| **Plattegrond** | De plattegrond schermvullend. |
| **Kiosk** | De plattegrond voor een wandtablet of tv, met een menubalk naar de andere tabbladen. |
| **Energie** | Het HA-energiedashboard (of, als dat niet is ingesteld, je stroomsensoren). |
| **Buiten** | Weer, buitensensoren en buitencamera's. |
| **TV** | Je mediaspelers. |
| **Pagina per ruimte** | Elke ruimte heeft een eigen pagina (bijv. `/floorplan-…/ruimte-keuken`) die er precies zo uitziet als inzoomen op de kaart. Ze staan niet als tabblad bovenin, maar je kunt er rechtstreeks naar linken, en ze hebben een terug-pijl. |

![Een ruimte als eigen pagina](img/ruimte-pagina.png)

Heb je via HACS **advanced-camera-card** of **clock-weather-card** geïnstalleerd, dan gebruikt het dashboard die automatisch voor de camera's en de klok. Zonder die kaarten werkt alles ook, met de standaardkaarten van HA.

### Volledig scherm

Tik op **⛶** in de werkbalk. De hele pagina gaat op volledig scherm, de kop- en zijbalk van Home Assistant verdwijnen en in de zijkolom (en bovenaan Energie, Buiten en TV) verschijnt de menubalk. Wissel je via die menubalk van tabblad, dan blijft alles op volledig scherm. Met **Esc** of nog een keer **⛶** ga je terug.

### Kiosk (wandtablet / tv)

![Kiosk met menubalk](img/kiosk-menu.png)

1. Installeer via HACS **[Kiosk Mode](https://github.com/NemesisRE/kiosk-mode)**. Die verbergt de kopbalk en zijbalk van HA.
2. Open op de tablet het kiosk-tabblad met `?kiosk` erachter, bijvoorbeeld `http://homeassistant.local:8123/floorplan-thuis/kiosk?kiosk`. De link staat ook bij stap 6 na het maken.
3. Onderaan de plattegrond (en bovenaan Energie, Buiten en TV) verschijnt een **menubalk**. Daarmee wissel je van tabblad terwijl je in kiosk blijft.

Zonder `?kiosk` in het adres is de menubalk onzichtbaar; dan gebruik je gewoon de normale tabbladen.

---

## 4. De kaart gebruiken

| Actie | Wat er gebeurt |
|---|---|
| **Tik op een lamp of apparaat** | Aan/uit (lampen, schakelaars, gordijnen, mediaspelers). Andere apparaten openen de details. |
| **Tik op een camera** | Live beeld over de kaart. Tik op het beeld om het te sluiten. |
| **Houd een icoon vast** | De details openen, zoals helderheid, kleur, temperatuur of grafieken. |
| **Tik op een kamer** | Inzoomen op die kamer, of de eigen pagina van de kamer openen (instelling bij stap 5). |
| **Terug / tik buiten de kamer** | Weer uitzoomen. |
| **Eenvoudig / Alles** | Alleen wat jullie de laatste tijd gebruiken, of alles. |
| **🌡 (thermometer)** | Ruimtes kleuren op temperatuur aan/uit. |
| **Grote knop in de zijkolom** | Alles uit (of je eigen script/scène). |
| **⛶ (volledig scherm)** | De hele pagina op volledig scherm, zonder de balken van Home Assistant, met een menubalk. Blijft aan als je van tabblad wisselt; **Esc** of nog eens ⛶ = terug. |
| **Tekstblok slepen / vasthouden** (alleen beheerders) | Slepen = verplaatsen, het oranje hoekje = groter/kleiner, vasthouden = menu. Zie [De tekstblokken bij de ruimtes](#de-tekstblokken-bij-de-ruimtes). |
| **Iconen verplaatsen** (alleen beheerders) | Iconen (en tekstblokken) direct op de kaart verslepen. Ze worden meteen opgeslagen. |

### Inzoomen op een ruimte

![Ingezoomd op de woonkamer](img/ruimte-zoom.png)

De rest van het huis wordt gedimd, zodat alleen de ruimte zelf helder blijft (ook muren en licht van andere ruimtes vallen weg), de ruimte komt groot in beeld en rechts staat alles uit die area: temperatuur, vocht, wie er is, meldingen, en een lijst van alle apparaten en sensoren. Tik op een regel om iets te schakelen, houd vast voor de details.

Terug naar de hele plattegrond: **dubbeltik op de ruimte**, of tik op **Terug**. Dat werkt ook op de eigen pagina van een ruimte, en volledig scherm blijft aan.

### Op je telefoon: ruimte per ruimte

| Overzicht | Een ruimte |
|---|---|
| ![Telefoon: overzicht](img/telefoon-overzicht.png) | ![Telefoon: één ruimte](img/telefoon-ruimte.png) |

Op een smal scherm (standaard smaller dan 560 pixels, dus de meeste telefoons) is de hele plattegrond te klein voor alle iconen. De kaart toont het huis dan **ruimte per ruimte**:

- Bovenaan staat een balk met **Overzicht** en al je ruimtes; schuif hem opzij. Een stipje betekent dat daar licht aan is.
- **Overzicht** toont het hele huis met alleen de namen en temperaturen. Tik op een ruimte om hem te openen.
- Een **ruimte** vult de hele breedte, met grote iconen die je makkelijk raakt. Erboven staan de naam, de temperatuur en de regels van het tekstblok. Alles buiten de ruimte wordt gedimd.
- **Veeg** over de plattegrond naar links of rechts voor de volgende of vorige ruimte.
- **Dubbeltik** op de ruimte om terug te gaan naar het overzicht.

Wil je dit ook op een tablet of pc? Tik in de werkbalk op het knopje **Per ruimte** (het icoon met de kaartjes). Nog een keer tikken geeft weer de **hele plattegrond**. Elk apparaat onthoudt zijn eigen keuze, dus je tablet kan per ruimte staan terwijl je pc de hele kaart laat zien.

Bij stap 5 stel je onder *Kleine schermen* in vanaf welke breedte dit vanzelf gebeurt, of zet je het altijd aan of uit. Per kaart kan dat ook met `compact: on` of `compact: off`.

### Camera

![Camerabeeld over de kaart](img/camera.png)

### Wat doet "Eenvoudig"?

![Eenvoudig: alleen wat gebruikt wordt](img/kaart-eenvoudig.png)

Home Assistant onthoudt wie iets heeft bediend. Floorplan Studio telt alleen bediening door **mensen**: via het dashboard, de app, of een spraakassistent die via een HA-gebruiker werkt. Wat automatiseringen doen telt niet mee.

In Eenvoudig zie je alleen wat de laatste 14 dagen is gebruikt (instelbaar). De lijst past zich vanzelf aan: gebruik je iets nieuws, dan verschijnt het, en wat lang niet gebruikt is verdwijnt. Wat je op **Altijd tonen** zet, blijft altijd staan. In de eerste dagen na installatie toont hij nog alles, terwijl hij leert.

---

## 5. Extra's

### De zijkolom en de begroeting

![Zijkolom met klok, weer, grote knop, knoppen, energie en status](img/dashboard.png)

Op het tabblad **Plattegrond** (en in kiosk) staat rechts een zijkolom, en linksboven een begroeting met wie er thuis is (personen met de status *thuis*).

| Onderdeel | Wat het doet |
|---|---|
| **Klok en datum** | Altijd zichtbaar. |
| **Weer** | Temperatuur, omschrijving, gevoelstemperatuur en wind. Tik voor de verwachting. |
| **Grote knop** | Standaard *Alles uit*: zet alle lampen op de kaart uit en laat zien in welke ruimtes nog licht brandt. Je kunt er ook een eigen script of scène aan hangen. |
| **Slimme knop** | Optioneel: per tijdvak een eigen naam en actie, zie hieronder. |
| **Knoppen** | Tot drie scènes, scripts of schakelaars (standaard je eerste scènes). |
| **Energie** | Zon nu, verbruik van het net (groen = je levert terug), stroomprijs, een balk hoeveel van je verbruik nu uit zon komt, en de zon-opbrengst van vandaag. |
| **Status** | Een korte lijst, bijv. stofzuiger en tv. |

Alles kies je bij stap 5 → **Zijkolom**; wat je leeg laat zoekt Floorplan Studio zelf. Op een smal scherm schuift de zijkolom onder de kaart. Wil je de kaart zonder zijkolom (bijv. op een ander dashboard)? Zet dan in de kaart `side: false`.

### De slimme knop

Bij stap 5 → **Zijkolom → Slimme knop** geef je de grote knop per deel van de dag een eigen naam, onderschrift en actie (een scène, script of automatisering). Zolang er nog licht aan is kan hij iets anders doen. Een voorbeeld:

| Vanaf | Naam | Doet | Als er licht aan is |
|---|---|---|---|
| `05:00` | Goedemorgen | scène *Ochtend* | – |
| `11:00` | Thuiskomen | scène *Avond* | **Alles uit** (lampen uit) |
| `22:30` | Naar bed | script *Slapen* | – |

- **Vanaf** is een tijd (`06:30`) of `sunrise` / `sunset`, eventueel met minuten erbij of eraf: `sunset-30` is een half uur voor zonsondergang.
- Na middernacht geldt het laatste tijdvak van de vorige dag nog, tot het eerste tijdvak begint.
- Laat je **Doet** leeg, dan zet de knop alle lampen op de kaart uit.
- **Wat telt als "licht aan"**: standaard een lamp op de kaart, maar je kunt ook één lamp of groep kiezen.
- Het icoon past zich aan de naam aan (bed, zonsopkomst, huis, aan/uit).

### De tekstblokken bij de ruimtes

Elke ruimte heeft een tekstblok met de naam, een grote waarde (meestal de temperatuur) en korte regels met een icoon:
- lampen aan (bijv. *13 / 14 lampen aan*);
- CO2, met *luchten* in oranje boven 1000 ppm;
- vochtigheid;
- gordijnen of rolluiken (*open*, *dicht* of een percentage);
- verwarming of airco (*airco verwarmt · 21°*);
- wat er speelt;
- en tot drie extra regels die je zelf kiest (stap 2).

![Vasthouden op een tekstblok geeft een menu](img/tekstblok-menu.png)

Het blok zoekt zelf de plek in de ruimte met de minste iconen eronder. Wil je het anders (alleen beheerders):
- **Sleep een blok** gewoon naar een andere plek (indrukken en bewegen).
- **Groter of kleiner**: wijs het blok aan met de muis; rechtsonder verschijnt een **oranje hoekje** om aan te trekken.
- **Houd het blok even vast** (zonder te bewegen) voor een menu: *Verplaatsen*, *Groter*, *Kleiner*, *Automatische plek en grootte* (terug naar de vrijste plek) en *Verbergen* (of weer *Tonen*).
- In **Iconen verplaatsen** zie je ook verborgen blokken doorschijnend, zodat je ze terug kunt zetten.
- Kort tikken op een blok doet hetzelfde als tikken op de ruimte.
 Een pulserende stip achter de naam betekent dat er iemand is. Regels die je niet wilt zet je uit bij stap 5.

### Licht

Een lamp die aan is geeft een zachte lichtvlek in zijn eigen kleur op de vloer. Bij stap 5 kun je in plaats daarvan de hele ruimte laten gloeien, of de gloed uitzetten.

Een dimbare lamp laat ook zien hoe fel hij staat: hoe lager de lamp staat, hoe zachter de knop en de lichtvlek, en het percentage staat erbij. Bij stap 5 kies je bij *Sterkte van lampen*: *altijd onder de lamp*, *alleen bij aanwijzen* (dan zie je het percentage naast de naam als je met de muis op de lamp staat) of *niet tonen*.

### Ruimtes kleuren op temperatuur

![Ruimtes gekleurd op temperatuur](img/temperatuur.png)

Tik op de **thermometer** in de werkbalk. Elke ruimte kleurt dan van **blauw** (koud) via **groen** naar **oranje/rood** (warm). Bij welke temperaturen dat gebeurt stel je in bij stap 5 (standaard 17 °C en 24 °C). Daar kun je het ook standaard aanzetten. Ruimtes zonder temperatuursensor houden hun gewone kleur.

### Aanwezigheid

![Aanwezigheid: stip bij de naam en Anna/Tom per ruimte](img/aanwezigheid.png)

- **Stip bij de naam:** staat er in de area van een ruimte een **beweging-, aanwezigheids- of bezettingssensor** aan, dan krijgt de naam een pulserende stip. Detectie van dieren of auto's door camera's (bijv. Frigate `…_dog_occupancy`) telt niet mee.
- **Personen per ruimte:** heb je per persoon een sensor die zegt in welke ruimte iemand is (bijv. [Bermuda](https://github.com/agittins/bermuda) of [ESPresense](https://espresense.com)), koppel die dan bij stap 5 → **Aanwezigheid**. De waarde van de sensor moet de naam van de ruimte of de area zijn. Er verschijnt dan een rondje met de foto of de initialen van die persoon in de ruimte. Wie op "niet thuis" staat, wordt niet getoond.

### Meldingen op de kaart

![Rookmelder gaat af in de keuken](img/melding-rook.png)

- **Alarm** – rook, gas, koolmonoxide en lekkage: de ruimte **knippert rood** en bovenaan verschijnt een rode balk met wat er aan de hand is. Tik op de melding om naar de ruimte te zoomen.
- **Open deur of raam** – de ruimte kleurt rustig **oranje** en er staat een oranje balk bovenaan.

![Achterdeur staat open](img/melding-deur.png)

Het werkt met elke `binary_sensor` met de juiste *apparaatklasse* in de area van de ruimte. Sensoren met de klasse *hitte* of *veiligheid* tellen bewust niet mee: die worden vaak gebruikt voor een brandende ketelvlam of de status van een NAS, en zouden dan steeds alarm geven. Het werkt ook in kiosk. Beide soorten kun je bij stap 5 uitzetten.

### De stofzuiger live op de kaart

![De stofzuiger rijdt over de plattegrond](img/stofzuiger-live.png)

Terwijl de stofzuiger zuigt, **rijdt zijn icoon over je plattegrond** naar waar hij echt is, met een stippellijn van waar hij net geweest is. Staat hij weer in het dock, dan gaat het icoon terug naar zijn eigen plek. In *Eenvoudig* is een rijdende stofzuiger altijd zichtbaar.

Floorplan Studio haalt de positie uit de kaart van de stofzuiger zelf (de robot is daar het witte rondje); die kaart hoef je niet te zien. Wil je hem toch zien, kies dan bij stap 5 → **Stofzuiger → Wat je ziet tijdens het zuigen** voor *de kaart van de stofzuiger* of *allebei*.

- **Nodig:** kies bij stap 1 de **stofzuigerkaart als achtergrond** en leg hem over je ruimtes. Zo weet Floorplan Studio hoe zijn kaart op jouw plattegrond valt (ook als je hem gedraaid of gespiegeld hebt). Zonder achtergrond blijft het icoon op zijn vaste plek.
- Bij stap 5 → **Stofzuiger** kies je: alleen tijdens het zuigen (standaard), altijd, of uit; wat je ziet (alleen de robot, de kaart, of allebei); en hoe doorzichtig de kaart is.
- Het werkt met elke integratie die de kaart als `image.`- of `camera.`-entiteit geeft (Roborock, Valetudo, Xiaomi Cloud Map Extractor, Dreame…).

### Deze ruimte zuigen

![Knop "Deze ruimte zuigen"](img/stofzuiger-ruimte.png)

Zoom in op een ruimte en tik op **Deze ruimte zuigen**.

- Op nieuwere Home Assistant-versies gebruikt dit **Schoonmaken per area** (`vacuum.clean_area`). Koppel daarvoor eenmalig in HA de segmenten van je stofzuiger aan je areas: open de stofzuiger-entiteit → tandwiel → *Map vacuum segments to areas* (in het Nederlands iets als "segmenten aan areas koppelen").
- Kent je HA dat nog niet, dan zie je bij stap 2 per ruimte een veld **Nummer van deze ruimte in je stofzuiger** waar je dat nummer invult (Roborock: `app_segment_clean`).

---

## 6. Thema's

| | |
|---|---|
| ![Automatisch (zon)](img/kaart-zon.png) **Automatisch (zon)** – overdag licht, rond zonsondergang via een warme schemer naar donker en 's ochtends weer terug. Rekent met de zonsopkomst en -ondergang van vandaag; de tekst blijft altijd leesbaar. | ![Warm](img/kaart-warm.png) **Warm** – donker met amberkleurig licht. Rustig voor de huiskamer. |
| ![High-tech](img/kaart-hightech.png) **High-tech** – neon-HUD met cyaan muren, raster en scanlijnen. | ![Rock](img/kaart-rock.png) **Rock** – zwarte traanplaat, chromen muren en rode podiumspots. |
| ![Blueprint](img/kaart-blueprint.png) **Blueprint** – blauw bouwtekening-papier met witte lijnen. | ![Glas](img/kaart-glass.png) **Glas** – matglas over zachte kleurvlekken. |

Verder: **Terminal** (groene fosforkleur) en **Home Assistant** (volgt je HA-thema).

### Thema kiezen
- **Per kaart:** in de kaartinstellingen. Met **Thema-knoppen tonen** kan iedereen zelf wisselen; zonder thema-keuzelijst onthoudt elk apparaat zijn eigen keuze. Met een thema-keuzelijst wissel je het thema voor het hele huis, en zie je alleen de thema's die in die lijst staan.
- **Voor het hele huis tegelijk:** stap 5 → **Eén thema voor het hele huis**. Klik **Keuzelijst maken** (of kies een keuzelijst die je al hebt). Elk scherm volgt dan die lijst, en wisselen op één scherm wisselt overal. Je kunt het thema dan ook met een automatisering zetten, bijvoorbeeld:

  ```yaml
  action: input_select.select_option
  target:
    entity_id: input_select.floorplan_thema
  data:
    option: Rock
  ```

---

## 7. Uitproberen met het voorbeeldhuis

In de map [`examples`](../examples) staat [`voorbeeldhuis.json`](../examples/voorbeeldhuis.json): het verzonnen huis uit deze handleiding (9 ruimtes, deuren en 22 apparaten).

1. Download het bestand.
2. Open **Floorplan** → knop **Importeren** (naast de **+**) → kies het bestand.
3. Je krijgt een nieuwe plattegrond. De apparaten heten `light.woonkamer_plafond` enz. en bestaan bij jou niet; ze staan grijs op de kaart. Koppel bij stap 2 de ruimtes aan je eigen areas en klik bij stap 4 op **Alles vanzelf neerzetten** om je eigen apparaten te krijgen.

Met **Exporteren** maak je zo'n bestand van je eigen plattegrond, bijvoorbeeld als back-up of om te delen.

---

## 8. Tips

- **Meerdere verdiepingen:** maak met **+** een tweede plattegrond en zet in de kaart `plan: <id>`.
- **Groepen:** heb je een lampengroep, bijvoorbeeld "Woonkamer sfeer"? Zet dan de groep op de kaart, of juist de losse lampen. Voor de gloed van een kamer tellen alleen echte lampen mee.
- **Een plattegrond verwijderen:** met het prullenbak-icoon in de editor. Heb je bij stap 6 een dashboard laten maken, dan verdwijnt dat dashboard (en de link in de zijbalk) automatisch mee. Dashboards waarin je de kaart zelf hebt geplaatst blijven staan.
- **Back-up:** alles staat in `.storage/floorplan_studio.*` en zit dus in je gewone HA-back-up.

## 9. Problemen oplossen

| Probleem | Oplossing |
|---|---|
| "Deze integratie ondersteunt geen configuratie via de UI" | Floorplan Studio is nog niet gedownload in HACS, of Home Assistant is daarna nog niet herstart. Download, herstart, en voeg de integratie dan toe. |
| *Floorplan* staat niet in de zijbalk | Ben je beheerder? Is de integratie toegevoegd (stap 4 van installeren)? |
| Kaart zegt "Nog geen plattegrond" | Open Floorplan, teken iets en klik **Opslaan**. |
| Kamer toont geen temperatuur | Zit de sensor in dezelfde area? Of kies hem bij de ruimte in stap 2. |
| Apparaat komt niet bij "automatisch plaatsen" | Hangt het apparaat aan de area? Verborgen entiteiten en configuratie-entiteiten worden overgeslagen. Voeg het anders toe via het zoekveld. |
| Stofzuiger beweegt niet over de kaart | Heeft je plattegrond een achtergrond van de stofzuigerkaart (stap 1)? Zonder die achtergrond weet Floorplan Studio niet waar zijn kaart op jouw plattegrond valt. Kies bij stap 5 ook de juiste stofzuiger en kaart. |
| Stofzuiger rijdt op de verkeerde plek | Leg de achtergrond bij stap 1 nauwkeuriger over je ruimtes (schuifjes, draaien, spiegelen). |
| "Ongeldige optie" bij het wisselen van thema | Het thema staat niet in je thema-keuzelijst. Voeg het toe aan die lijst (Instellingen → Apparaten & diensten → Helpers). |
| Tekstblok laat zich niet slepen | Alleen beheerders kunnen tekstblokken verplaatsen. Ververs na een update de pagina (Ctrl+F5). |
| "Deze ruimte zuigen" ontbreekt | Er moet een stofzuiger op de kaart staan (of gekozen zijn bij stap 5), en de ruimte moet aan een area hangen. Op oudere HA: vul de segmenten in bij stap 2. |
| Menubalk in kiosk ontbreekt | Staat `?kiosk` achter het adres? Maak het dashboard opnieuw (stap 6) als het met een oudere versie gemaakt is. |
| Oude versie na update | Ververs de browser met Ctrl+F5, of in de app: Instellingen → App-configuratie → Frontend-cache wissen. |

Vragen of ideeën? Open een issue op [GitHub](https://github.com/trackerr/home-assistant-floorplan-studio/issues).
