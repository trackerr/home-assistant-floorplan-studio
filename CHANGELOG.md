# Changelog

## 1.4.0 (in ontwikkeling)
- Editor: stap 5 (Instellingen) opende niet meer (sinds de keuze *De rondleiding begint in*); werkt weer.
- Stap 3 (deuren & meubels): er staat niet meer standaard *Deur* aan. Een klik op een muur plaatst pas iets als je deur, raam of doorgang kiest; nog eens op die knop zet het weer uit.
- Wandeling: **beeldhoek instelbaar** bij stap 5 (*Wandeling: beeldhoek*, 60–120°, standaard 100°). Ctrl + scrollwiel (of knijpen) past hem even aan; die keuze onthoudt de browser tot je de instelling wijzigt.
- 2.5D: een verplaatst tekstblok van een ruimte komt na het slepen precies waar je het neerzet (eerder schoof het in 2.5D weg, soms buiten de plattegrond). Een tekstblok dat buiten zijn ruimte terecht was gekomen, staat weer vanzelf in zijn ruimte.
- Herkende apparaten (3D-printer, router, hub, printer…) kun je **draaien**: in de wandeling bij Bewerken (↺ 15°, ↻ 15°, ↻ 90°) of bij stap 4 (*Gedraaid*, in graden).
- Apparaten die **uit** staan zijn op de kaart en in de wandeling half doorzichtig (50 %), zodat wat aan staat eruit springt. Sensoren en onbereikbare apparaten blijven zoals ze waren.
- **Meer vanzelf herkend**, met een eigen model in de wandeling: knopdrukker (Fingerbot, SwitchBot Bot) op de lichtschakelaar, IR-hub / universele afstandsbediening (Harmony, Broadlink, IR-ontvanger), alarmbasis (Eufy HomeBase, Ajax…) en sirene (rood, gloeit als hij gaat). Een bedsensor wordt *bed bezet* in plaats van een bewegingsmelder.
- Apparatenoverzicht: de Zigbee2MQTT/Z-Wave-bridge en Frigate-zones (detecties van een camera) staan er niet meer in; een wasmachine of droger met alleen status-entiteiten wel. Een als meubel getekende vaatwasser, wasmachine of droger telt als *op de kaart*, en tikken op een ontbrekende zet hem als meubel in zijn ruimte (gekoppeld aan zijn status).
- Projectiescherm: *open* (of een hogere stand) is nu uitgerold, dicht/0 % opgerold — zoals de meeste schermmotoren het melden. Werkt het bij jou andersom, kies dan bij stap 4 *Projectiescherm: open betekent* → *Opgerold*.
- Eigen 3D-model: breedte, diepte en hoogte werken nu altijd (in de editor en in de wandeling); het model vult precies de maat die je geeft. Na het uploaden of kiezen nemen diepte en hoogte vanzelf de verhouding van het model aan; de knop *Eigen verhouding* zet ze later weer terug.
- **Hologramfan (P56) toont wat hij speelt**: zijn beeld-entiteit (bijv. `image.…_shown`) hoort vanzelf bij de fan. In de wandeling staat het beeld op de draaiende schijf (zwart = doorzichtig, zoals een echte hologramfan; gedimd als hij uit staat), op de kaart wordt het icoon dat beeld zolang hij aan staat. Tik op de fan (niet meer aan/uit): het beeld groot, de clip die speelt, een andere clip kiezen, afspelen/pauze en aan/uit. Werkt voor elk apparaat met een beeld-entiteit dat als hologramfan herkend wordt.
- **Eigen 3D-modellen** als meubel (*Eigen 3D-model* bij stap 3): upload een .glb (uit Blender, Sketchfab, van een fabrikant…) of .obj, tot 40 MB; het bestand blijft in Home Assistant (`/config/floorplan_studio/models`). In de wandeling staat het echte model, met de kleuren van zijn texturen, passend in de breedte en diepte (verhouding blijft; een hoogte begrenst het). Ligt het op zijn kant: kies *Rechtop* Z omhoog. Op de kaart een gestippeld blok met een kubus.
- Wandeling sneller en zonder vastlopers: de tekening wordt nooit groter dan ~2 miljoen pixels en vanzelf kleiner als de computer het niet bijhoudt; lampen in een andere ruimte kosten de grafische kaart niets meer.
- Licht: elke lamp geeft ook zijn hele ruimte wat licht (weerkaatsing via muren en plafond, afvlakkend als er veel lampen zijn), dus een verlichte keuken zie je ook vanuit de woonkamer; lampen verderop vallen niet meer weg uit de berekening.
- Camerawand: geen geflits meer. Het grote beeld is het live beeld van de lichte stream (bijv. SubStream / Profile_1), en de schermen laden een klein beeld op de achtergrond voor ze het tonen; een camera met een hoofd- en een substream krijgt één scherm.
- Wandeling: de rechtermuisknop wordt helemaal genegeerd.
- **Vaatwasser, wasmachine en droger als meubel**, met *Gekoppeld aan*: kies de sensor die zegt of hij draait — een status- of draait-sensor, een stroommeter (boven *Draait vanaf* watt, standaard 8 W) of een schakelaar. Automatisch kiest hij een status- of vermogenssensor van dat apparaat boven een stekker die altijd aan staat. In de wandeling een statuslampje dat groen brandt als hij draait (op de kaart een groene gloed); tik = draait / draait niet, met de andere sensoren van het apparaat. De stekker en sensoren met dezelfde naam in die ruimte krijgen geen eigen icoon meer (en een tik schakelt de stekker niet meer).
- Wandeling: met de muis boven een apparaat (ook een ledmatrix, klok, ledstrip of gordijn) verschijnen icoon én naam; het apparaat dat je echt aanwijst wint (een matrix naast een gordijn wordt niet meer het gordijn).
- Wandeling: **lang indrukken** op een apparaat opent zijn volledige menu — helderheid, kleur, wit, effect (lamp); modus, ventilator, voorkeur (klimaat); snelheid (ventilator); bron en volume (speler); stand (gordijn); keuzes (select). De rechtermuisknop doet niets meer.
- Camerawand: het gekozen beeld is twee keer zo groot; geen kruisje — klik op het beeld (of nog eens op het scherm) en het is weg.
- Lampen boven een tafel, kookeiland of bureau schijnen vooral naar beneden, op het blad. Een lamp die midden in een getekende ruimte zonder Home Assistant-ruimte hangt (bijv. de eettafel naast de keuken) verlicht die ruimte, in plaats van naar de keuken te worden getrokken.
- Plant: echte bladeren die uit de pot omhoog en naar buiten buigen, in plaats van een groene cilinder.
- Editor (ruimtes, deuren & meubels, apparaten): **vrij zoomen** met + en −, Ctrl + scrollwiel of knijpen; ingezoomd schuif je met het scrollwiel of de middelste muisknop.
- **Wandelen of rondleiding**: het wandelmannetje zet je stil in de startruimte (stap 5, anders de grootste) met zicht over de ruimte — geen rondleiding. De rondleiding start met de nieuwe knop ernaast (of *Rondleiding* in de wandeling). De route gaat eerst door open doorgangen (woonkamer → eettafel → keuken …), dan door deuren; in de startruimte kijk je rond bij de deur, zonder om te draaien.
- Wandeling: licht lekt niet meer door muren — een lamp verlicht precies zijn eigen ruimte (ook een L-vormige), niet de andere kant van de muur. Een kader-ledstrip die bijna recht is staat recht langs de muur.
- Een tv op een kast of tv-meubel heeft geen voet meer: alleen het scherm op kleine pootjes (wandeling en 2.5D).
- Stap 5: *De rondleiding begint in* — kies een ruimte; de wandeling begint daar, en de rondleiding bij de deur van die ruimte.
- Kaartoptie `walk: tour`: de wandeling opent vanzelf en de rondleiding loopt steeds opnieuw — voor een tv (Home Assistant Cast), wandtablet of kiosk. De kaart staat nu ook vanzelf bij de dashboard-resources (en houdt zijn versie bij), zodat Home Assistant Cast en kioskbrowsers hem vinden.
- **Camerawand** (controlekamer) als meubel: in de wandeling een donkere wand vol schermen met je camerabeelden, in perspectief op de wand, met naam per scherm; ververst één voor één (elke paar seconden). Breedte met de handvatten, onder- en bovenkant en welke camera's instelbaar (editor en wandeling); tik op een scherm voor het grote beeld.
- Wandeling: een apparaat blijft altijd in zijn eigen Home Assistant-ruimte; staat het (net) over de lijn getekend, dan komt het op de dichtstbijzijnde plek in die ruimte, aan de muur van die ruimte.
- **Ledstrip staand of als kader**: bij een ledstrip kies je *Liggend* (zoals altijd), *Staand* (rechtop bij elk getekend punt, van–tot hoogte) of *Kader* (een rechthoek rondom: de getekende lijn is de breedte) of *Kader open* (links, boven, rechts), in de editor en in de wandeling (bij een kader telt alleen de breedte: eerste tot laatste punt, dus ook een U op de plattegrond werkt); ook live met WLED en in 2.5D. De leds lopen vanaf het eerste getekende punt omhoog, langs de bovenkant en aan de andere kant omlaag; met evenveel WLED-segmenten als zijden krijgt elke zijde zijn eigen segment.
- **Constantere, live verlichting** in de wandeling: tot 32 lampen tegelijk (was 16) gekozen op wat ze echt bijdragen, zonder heen-en-weer wisselen; aan/uit, helderheid en kleur glijden in een kwart seconde mee met Home Assistant, en lampen die erbij komen of afvallen faden in plaats van te springen.
- **Kast op pootjes**: hoogte van de pootjes instelbaar (editor en wandeling).
- Wandeling voelt ruimer: een vaste, brede kijkhoek (100° in de breedte, zoals in games), dus ook op een telefoon of in een kleine kaart geen tunnelvisie; en in elke ruimte sta je op de plek met het verste zicht, aan de rand en over de ruimte heen kijkend, in plaats van in het midden.
- **WLED-ambilight live** rond de tv: met 4 segmenten worden dat links, boven, rechts en onder (zoals je naar de tv kijkt), elk met zijn eigen leds live; anders verdeeld over de randen. Op de kaart gloeit de tv in de gemiddelde kleur; in 2.5D als een lijst van licht rondom het scherm. Uit of offline = gewoon de tv.
- **Hoort bij** (stap 4): een lamp koppel je zelf aan een tv (ambilight, ook een HDMI-syncbox) of aan speakerboxen; een mediaspeler aan een getekende tv. Automatisch koppelen gebeurt alleen nog binnen dezelfde ruimte, en een syncbox telt nooit als speakerbox. Een HDMI-/sync-box wordt vanzelf de ambilight van de tv in zijn ruimte; kies je bij *Hoort bij* een tv of box, dan vervalt een getekende lijn.
- Wandeling: alles aan de muur (matrix, thermostaat, wandlampen, deurbel, klok, airco…) hangt nu op het muuroppervlak in plaats van in een dikke buitenmuur. Een WLED-matrix toont zijn pixels (uit = een zacht raster); het licht van een live WLED knippert niet meer tussen zijn ingestelde kleur en de live kleur.
- **Apparatenoverzicht** (stap 4): elk apparaat in Home Assistant en wat Floorplan Studio ervan maakt — op de kaart en herkend, op de kaart met alleen een icoon, of nog niet op de kaart (tik = in zijn eigen ruimte zetten). Telefoons, diensten en losse data (weer, prijzen, templates) laat hij weg; hetzelfde apparaat via een tweede integratie telt niet dubbel.
- **WLED live**: getekende WLED-ledstrips en een WLED-matrix tonen hun echte leds live (kleuren en effecten, per segment), op de kaart, in 2.5D en in de wandeling. De integratie haalt ze zelf op via de live-weergave van WLED (websocket, of `/json/live` bij oudere versies), dus het werkt ook via https/Nabu Casa.
- **Radiatoren** als meubel; gekoppeld aan de radiatorknop of verwarmingszone van die ruimte (Tado, Netatmo, Eurotronic, Danfoss, Aqara, Fritz!DECT, Homematic, Wiser…), ook als die niet op de kaart staat; zonder radiatorknop de thermostaat van die ruimte. Gloeit warm als hij verwarmt; tik voor temperatuur en knoppen.
- **Speakers/boxen** als meubel; een lamp die "boxen" of "speaker" heet (bijv. "TV Boxen") wordt de gloed van die boxen.
- **Hoekbank**: een bank kan recht zijn of een hoekbank met de lange kant links of rechts.
- **Ambilight**: een lamp die "TV" heet bij een getekende tv (bijv. een WLED achter de tv) wordt een gloed achter die tv, ook op de kaart.
- **Nog meer vanzelf herkend** (naam en merk), met een eigen model in de wandeling: 3D-printer (Bambu, Prusa, Creality…, met kamerlicht), hologramfan, kerstboom (met lichtjes), HDMI-syncbox, afzuigkap (boven de kookplaat), waterkoker, koffiezetapparaat, vaatwasser, wasmachine, droger, stekkerdoos, omvormer, NAS, router, printer, projectiescherm (rolt op en neer), thermometer en deurbel. Ledcontrollers onder de keukenkastjes worden een ledbalk.
- Een temperatuur/vocht-sensor die als zijn instel-schakelaar (bijv. "show smiley") op de kaart staat, wordt een thermometer: tik = temperatuur en vocht, zonder iets om te schakelen.
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
