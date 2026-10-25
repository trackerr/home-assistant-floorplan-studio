# Changelog

## 1.4.0 (in ontwikkeling)
- **Lampen zoals hun icoon**: soort, hoogte en model in de wandeling volgen het icoon (en de naam): bureaulamp, tafellamp, lavalamp, staande lamp, uplighter, kroonluchter, inbouwspot, wandlamp, platte wandlamp, spiegellamp, buitenlantaarn, openhaard, ledmatrix/pixelscherm (op ware grootte), lichtpaneel (glas-in-lood), ledbalk en peertje. Een lamp die nergens op staat krijgt een bijzettafeltje. Een spot-icoon maakt er een richtbare spot van.
- **Stoelen per tafel** instelbaar (editor en wandeling); bij een oneven aantal of veel stoelen ook aan de kopse kanten. Ronde tafel ook.
- Gordijnen: een cover hoort alleen bij een raam in zijn eigen ruimte, en een projectiescherm (beamer) is nooit een gordijn.
- Wandeling, bewerken: een apparaat aan de muur schuift bij opzij slepen langs die muur, ook als je schuin naar de muur kijkt; het verdwijnt niet meer achter de muur. Slepen blijft binnen de eigen ruimte.
- **Weergave "Geen"** naast Eenvoudig en Alles: geen iconen, een rustige kaart. Ruimtes en meubels blijven aantikbaar, en wat als zichzelf getekend is laat zien wat het doet (ledstrips, gordijnen, tv-gloed, spotbundels, WLED-klok). Ook als standaard te kiezen.
- **Salontafel** als meubel (laag, met plank), ook voor de AI: "zet de lamp op de salontafel".
- **Tv aan de muur:** bij een tv-meubel *Bevestiging: aan de muur* met de hoogte van de onderkant van het scherm (editor en wandeling). Een tv op voet op een kast staat nu óp die kast. Een hoogte die je aan een gekoppelde tv geeft, gaat naar die tv.
- Een tv met meerdere entiteiten (bijv. Chromecast met Google TV: cast + Android TV; Sony: Bravia + cast) hoort helemaal bij de getekende tv: geen losse iconen meer.
- **Meer apparaten vanzelf herkend** en in de wandeling getekend als wat ze zijn: robotstofzuiger, camera, slot (naast de deur), radiatorknop, thermostaat, plafondventilator, ventilator, luchtreiniger/-bevochtiger, slimme stekker en bewegingsmelder, elk op de gebruikelijke hoogte (ook in 2.5D).
- Wandeling: wat getekend is (lamp, ledstrip, speaker, tv, airco, gordijn, klok en de apparaten hierboven) heeft geen icoon meer: **tik op het apparaat zelf** (lamp/schakelaar aan/uit, de rest info en bediening; stofzuiger, slot en camerabeeld erbij). Met de muis erboven verschijnt het icoon met de naam.
- Wandeling: je komt niet meer buiten het huis terecht (een tik op een muur of raam loopt naar die muur in plaats van naar de vloer erachter; door een buitendeur lopen kan niet meer).
- Pop-ups (ruimtepaneel, menu's, camerabeeld, meldingen, AI-hulp, info in de wandeling) liggen altijd boven de iconen.
- Wandeling: volgt wijzigingen in de plattegrond die elders gebeuren (editor, assistent); een WLED-klok heeft geen lamp-blokje meer.
- Gordijnen: *Hangt tot* de vloer, de vensterbank of een eigen hoogte. In de wandeling heeft een wandklok geen extra icoon meer (tik op de klok zelf).
- Mediaspelers herkend aan hun apparaat (Nest Mini, Nest Audio/Google Home/Sonos, Nest Hub, soundbar, Chromecast, spraak-satelliet): passend icoon, staat op het meubel, en in de wandeling het echte apparaatje met lampje.
- Bewerken in de wandeling uitgebreid: apparaten toevoegen/weghalen, meubels toevoegen (maat, hoogte, soort), ramen en deuren plaatsen, wijzigen en weghalen. Aan/uit bij stap 5 (alleen beheerders).
- **Spots** herkend aan de naam (of zelf aanzetten) en te **richten**: op de kaart (klik waar hij op schijnt) of in de wandeling (klik op muur/vloer/meubel). Lichtbundel op de kaart en in 2.5D; in de wandeling een echte lichtkegel.
- Editor: meubels met de muis van formaat veranderen (hoek = breedte en diepte tegelijk, zijkant = één maat, Shift = in verhouding).
- **Vanzelf herkend:** tv's worden de getekende tv (licht op, geen los icoon), airco's hangen hoog aan de muur en gloeien bij koelen/verwarmen, WLED-klokken tonen hun ledring met de tijd. Ook in de wandeling (scherm, unit, ring).
- Wandeling: tik op een tv, speaker, airco of gordijn voor info en bediening.
- **Gordijnen** bij hun raam, geanimeerd open/dicht op de kaart, in 2.5D en in de wandeling (stand uit Home Assistant). Automatisch gekoppeld, instelbaar bij stap 4 (raam en soort: midden, links, rechts, rolgordijn).
- Plaatsen kent ramen: "op de vensterbank" / "bij het raam" (ook voor ledstrips, langs het raam). AI-hulp: kies eerst een apparaat, dan gaat de vraag daarover.
- Plaatsen (AI of actie): alleen een nieuwe hoogte laat het apparaat staan waar het staat; een ledstrip verschuift als geheel (lijn en icoon samen) en de AI verplaatst strips alleen als je daar echt om vraagt.
- Wandeling: tijdens het lopen stopt een klik je meteen; stilstaand loop je met een klik op de vloer daarheen.
- AI-hulp: veel kleinere berichten (korte plattegrond-tekst, compact antwoord, max 20 verplaatsingen per keer, plattegrond alleen opnieuw als hij veranderd is), zodat het binnen de limieten van elke assistent past.
- AI-hulp werkt met elke AI-assistent, zonder tools of functies in te stellen: de assistent krijgt de plattegrond en antwoordt met een lijstje verplaatsingen dat de integratie uitvoert.
- Ledstrip langs de muur van twee ruimtes blijft in de wandeling heel (elk stuk net binnen de dichtstbijzijnde ruimte).
- Wandeling: zoomen met Ctrl + scrollwiel of knijpen (de ruimte, niet de iconen); gewoon scrollen = stapje vooruit/achteruit.
- **WLED automatisch instellen** (stap 4): leest leds, segmenten en matrix van elke WLED uit en deelt een getekende strip over de segmenten, zet strips zonder lijn langs de muur, en ziet WLED nooit als plafondlamp.
- Wandeling, bewerken: een apparaat slepen gaat in één richting per keer (opzij = over de vloer, omhoog/omlaag = hoogte).
- Een hoogte boven 6 wordt als centimeters gelezen (100 = 1 m), in de editor, 2.5D en de wandeling. Een ledstrip op een muurlijn loopt in de wandeling net vóór de muur. In de wandeling werkt − / + nu altijd vanaf de hoogte die je ziet.
- 2.5D en de wandeling gebruiken nu precies dezelfde hoogte en dezelfde lampsoort (plafond, hanglamp, staande lamp, tafellamp, ledstrip); een hoogte die je in de wandeling instelt staat ook zo in 2.5D. Apparaten staan in de wandeling op exact hun plek uit de plattegrond.
- **AI-assistent**: apparaten plaatsen door het te vragen (*"hang de lamp boven de eettafel"*). Hulpmiddelen voor de AI van Home Assistant, de acties `floorplan_studio.place_device` en `floorplan_studio.describe`, en een **AI-hulp**-chat in de editor. Werkt ook zonder AI: korte opdrachten als *"zet Keukenlamp boven de eettafel"* begrijpt de integratie zelf.
- Kaarten werken zichzelf bij als de plattegrond ergens anders verandert (ander scherm, assistent of actie).
- **Hanglampen**: *Plafondlamp? → Ja, hangend* met een eigen hoogte; plafondlamp-icoon, in 2.5D en de wandeling aan een snoer op die hoogte.
- **Ledstrips als lijn**: bij stap 4 een lamp als lijn tekenen (punt voor punt, 45° of vrij, met lengtes in meters). Gloeit op de kaart in de kleur van de lamp, ook in 2.5D en de wandeling.
- **Bewerken in de wandeling**: apparaten slepen en hun hoogte aanpassen, ledstrips op de muur tekenen, meubels slepen, draaien en weghalen; opslaan of annuleren.
- Wandeling: apparaten in hun eigen ruimte, echte lampen (plafond, hanglamp, staande lamp, tafellamp), en nooit meer door muren lopen.
- **Door je huis lopen** (wandelmannetje): door je eigen huis lopen met echte muren, deuren en ramen, meubels en lampen die hun ruimte verlichten. Met een rondleiding langs alle ruimtes, tikken op de vloer om te lopen, en lampen aan/uit.

## 1.3.0
**2.5D en echte maten**
- **2.5D-weergave** met echt perspectief: één knop kantelt de plattegrond. Muren komen omhoog, ramen worden glas, meubels worden blokken en iconen hangen op hun hoogte. Draaien per 45° of vrij (rechtermuisknop/Shift + slepen, of twee vingers draaien), kantelen en zoomen. Elk scherm onthoudt zijn eigen weergave; werkt ook ruimte per ruimte op de telefoon. Hoogte instelbaar (echte maat of eigen percentage).
- **Meubels en trap** tekenen bij stap 3 (bank, bed, tafel, bureau, aanrecht, gootsteen, kookplaat, fornuis, koelkast, kookeiland, bovenkast, kast, bad, douche, wc, trap, tv, plant), met breedte, diepte en hoogte; in 2.5D opgebouwd uit losse delen. Een kookplaat of gootsteen op een aanrecht wordt in het blad getekend, zodat ook een L-keuken klopt.
- **Grootte van lampen en apparaten** apart in te stellen.
- **Echte maten**: vul bij één ruimte de echte breedte of lengte in; daarna maten in meters en m² op de tekening, meubels in cm.
- **Hoogte per apparaat** voor 2.5D; boven een tafel of kast hangt een apparaat vanzelf net daarboven. Optionele hulplijntjes naar de vloer.

**Bediening**
- **Snelmenu** bij vasthouden: aan/uit en schuifjes (helderheid, kleurtemperatuur, gordijnstand, ventilator, volume, verwarming − / +).
- **Vrij zoomen** met knijpen of Ctrl + scrollwiel, met een korte hint bij gewoon scrollen.
- **Verdiepingen**: tabjes bovenin met `floors:`.
- Ingezoomd op een ruimte: lijst **In deze ruimte** ingeklapt, paneel **klein te maken** (kamertekst komt dan op de kaart), en iconen verplaatsen kan ook daar.

**Sensoren en apparaten**
- **Ramen** tekenen; **deuren en ramen koppelen aan hun sensor**: open = oranje en gestippeld.
- **mmWave-radar**: ring op de gemeten afstand (Tuya 24G, LD2410) of een stip per persoon (LD2450), met plafondhoogte.
- **Iconen vervagen tijdens draaien** in 2.5D (standaard tot 10%, instelbaar bij stap 5), zodat je de vorm van het huis ziet.
- **Plafondlampen herkenbaar**: plafondlamp-icoon, in 2.5D een rozet aan het plafond met snoer en een lichtbundel naar de vloer als hij aan is. Automatisch herkend aan de naam, of zelf kiezen bij stap 4.
- **Beweging dooft uit**: het icoontje kleurt na de laatste beweging langzaam terug naar grijs.
- **Wat zit eraan?** bij stekkers en schakelaars: een lamp of een apparaat. **Stroom via een slimme schakelaar** voor een slimme lamp aan een slimme schakelaar.
- Aanwijzen toont naam en status; een tv die aan staat gloeit blauw, een speaker die speelt zendt golfjes uit.

**Editor en integratie**
- Instellingen in **inklapbare onderdelen**, en alleen wat er op dat moment toe doet; zelden gebruikte opties onder **Meer opties**.
- **Inzoomen op een ruimte** in de editor om precies te plaatsen.
- **Floorplan uit de zijbalk** halen via de opties van de integratie (Configureren).
- **Sneller starten**: de kaart is meteen aangemeld (geen "configuratiefout" meer tijdens het laden), toont direct de laatst bekende plattegrond, en de browser bewaart de bestanden.
- Kaarten die even niet zichtbaar waren laden een gewijzigde plattegrond opnieuw zodra ze terugkomen.

## 1.2.3
- Floorplan Studio staat nu als **dienst** op de integratiepagina, met de versie en een knop **Bezoek** naar de GitHub-pagina van het project.

## 1.2.2
- Aanwezigheid: in plaats van een stipje staat er een zacht knipperend **bewegingsicoontje** achter de naam van een bezette ruimte, en ook op de kamertegel van de startpagina.

## 1.2.1
- Beschermt niet-opgeslagen wijzigingen bij wisselen, importeren en een nieuwe plattegrond maken; foutmeldingen bij het laden van achtergrondafbeeldingen zijn duidelijker.
- Controleert geïmporteerde plattegronden en tekent gebruikersgegevens veilig in de editor en kaart.
- Beheert alleen dashboards die bij de plattegrond horen, met herkenning van ongewijzigde dashboards uit versie 1.2.0.
- Geeft nieuwe plattegronden met dezelfde naam een eigen ID en verbergt ingebedde achtergrondafbeeldingen voor niet-beheerders.
- Zet GitHub Actions vast op specifieke revisies.

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
