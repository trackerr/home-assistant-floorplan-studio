// Floorplan Studio – editor panel (sidebar → Floorplan).
import './floorplan-studio-card.js?v=1.3.0b29';
import {
  VERSION, THEMES, themeStyle, computeWalls, nearestWall, norm, roomBBox, roomAt, areaEntities, entityArea,
  PLACE_DOMAINS, placeCandidates, friendly, newPlan, DEFAULT_SETTINGS, settingsOf, levelMode, loadPlans, savePlan, esc, safeNumber, safeImageData,
  FURN_TYPES, furnSVG, planScale, fmtMeters, roomArea, radarEntities, FURN_HEIGHT, itemHeight,
} from './fps-core.js?v=1.3.0b29';
import { buildDashboard } from './fps-dashboard.js?v=1.3.0b29';

const L = {
  en: {
    steps: ['Background', 'Rooms', 'Doors & furniture', 'Devices', 'Settings', 'Finish'],
    save: 'Save', saved: 'Saved ✓', unsaved: 'Unsaved changes', new_plan: 'New floorplan', delete_plan: 'Delete floorplan', undo: 'Undo',
    confirm_delete: 'Delete this floorplan and its generated dashboard? You can’t undo this.', confirm_discard: 'You have unsaved changes. Discard them?', bg_load_failed: 'The picture could not be loaded. Check the connection and try again.', plan_name: 'Name', size: 'Canvas size (width × height)',
    bg_title: 'What do you want to trace over?', bg_adjust: 'Line up the picture', bg_upload: 'Upload a picture', bg_upload_hint: 'A building plan, a photo of it, or a screenshot from your vacuum’s app.',
    bg_entity: 'Your robot vacuum’s map (or a camera)', bg_entity_hint: 'Uses the map your vacuum makes itself, e.g. from Roborock or Valetudo.', use: 'Use',
    bg_none: 'Draw without an example', bg_none_hint: 'Just draw your rooms on the grid.', opacity: 'Opacity', scale: 'Size', offx: 'Shift left/right', offy: 'Shift up/down',
    fit: 'Fit to canvas', rotate: 'Rotate', rot_l: '90° left', rot_r: '90° right', flip: 'Mirror', remove_bg: 'Remove picture', next: 'Next', back: 'Back',
    bg_tip: 'The picture is only there to trace over. It isn’t shown on your dashboard.',
    rooms_title: 'Draw your rooms', tool_select: 'Pick and move', tool_draw: 'Draw room', tool_part: 'Add a piece to the room',
    rooms_tip: 'Drag a rectangle for each room. L-shaped room? Pick it and tap “Add a piece to the room”. The walls draw themselves.',
    from_areas: 'Take the rooms from Home Assistant', room: 'Room', area: 'Home Assistant area', none: '— none —', temp_sensor: 'Temperature sensor', hum_sensor: 'Humidity sensor', auto: 'automatic',
    delete_room: 'Delete room', delete_part: 'Delete this piece', rooms_list: 'Rooms', no_rooms: 'No rooms yet.',
    doors_title: 'Doors, windows and openings', door: 'Door', window: 'Window', opening: 'Open passage', doors_tip: 'Choose door, window or opening and tap a wall. An opening removes the wall, e.g. for an open kitchen. Link a door or window to its sensor and it turns orange on the plan while it is open.', o_sensor: 'Sensor (open / closed)', o_none: '— none —',
    length: 'Width', whole: 'Whole wall', delete: 'Delete', no_walls: 'Draw your rooms first; the walls come by themselves.',
    items_title: 'Devices on the map', auto_place: 'Place everything for me', auto_hint: 'Puts lights, switches, heating, curtains and TVs in the room they belong to in Home Assistant.',
    unplaced: 'Not on the map yet', add: 'Add', search: 'Search anything in Home Assistant…', item: 'Device', show_always: 'Always show (also in Simple mode)', color: 'Light colour (for a plug with a coloured lamp)', no_color: 'automatic', icon: 'Icon (optional)', label: 'Name (optional)',
    remove: 'Remove from map', items_tip: 'Drag the icons to the right spot. On your dashboard: tap = on/off, hold = more info.',
    finish_title: 'Ready!', theme: 'Theme', usage_days: 'Simple mode: show what was used in the last … days', make_dash: 'Create dashboard (Home · Floorplan · Kiosk · Energy · Outside · TV + a page per room)', dash_done: 'Dashboard created:', dash_conflict: 'A dashboard already exists at /{url}, and Floorplan Studio did not create it. It was left unchanged.', dash_error: 'The dashboard could not be created: ', open: 'Open',
    set_title: 'Settings', set_intro: 'This applies to every card that shows this floorplan.',
    set_light: 'Light', set_screens: 'Phones, tablets and 2.5D', set_look: 'Look', set_simple: 'Simple mode', set_room: 'Room text', set_behaviour: 'Tapping and holding', set_sun: 'Automatic (sun)', set_auto: 'Place automatically',
    default_mode: 'Default view', learning_days: 'Show everything until … days of history exist', plan_size: 'Floor plan size in %', icon_size: 'Size of all icons (%)', label_size: 'Room text size', glow: 'Glow strength',
    show_temp: 'Temperature', show_hum: 'Humidity', show_lights: 'Lights on (count)', show_tags: 'State labels under devices (21°, open…)',
    tap_zoom: 'Tap a room to zoom in', hold_ms: 'How long to hold for more info (1000 = 1 second)', hold_action: 'Holding an icon opens', hold_quick: 'a small window with on/off and sliders', hold_more: 'Home Assistant’s own window', sun_before: 'Starts getting light … minutes before sunrise', sun_ramp: 'Transition takes … minutes',
    auto_domains: 'Which kinds of devices', reset: 'Reset to defaults', simple: 'Simple', all: 'All',
    theme_entity: 'One theme for the whole house', theme_entity_hint: 'Every screen then shows the same theme, and an automation can switch it. No dropdown list yet? Create one with the button.', make_helper: 'Create the list', own_choice: 'each screen chooses',
    headline: 'Big value', headline_auto: 'temperature', extra_rows: 'Extra rows in the text block', floor: 'Floor', floor_plain: 'plain', floor_tiles: 'tiles', floor_wood: 'wood',
    set_text: 'Text block and light', glow_style: 'Glow', glow_lamp: 'soft pool of light per lamp', glow_room: 'whole room glows', glow_off: 'no glow', compact: 'Small screens', cmp_auto: 'room by room on narrow screens', cmp_on: 'always room by room', cmp_off: 'never, always the whole plan', compact_width: 'Narrow means less than (pixels)', lamp_level: 'How bright a lamp is', lvl_fixed: 'always under the lamp', lvl_hover: 'only when pointing at it', lvl_off: 'do not show',
    show_co2: 'CO2', show_covers: 'Curtains / shutters', show_climate: 'Heating / air conditioning', show_media: 'What is playing', info_rows: 'Maximum number of rows',
    compass: 'Compass (degrees, empty = none)', greeting: 'Greeting + who is home (with side column)',
    set_side: 'Side column', side_hint: 'Leave empty and it picks for you. You see the side column on the dashboard you create in step 6.',
    s_weather: 'Weather', s_main: 'Big button', s_main_auto: 'all lights on the plan off', s_buttons: 'Buttons (scenes / scripts)', s_solar: 'Solar now (W)',
    smart: 'Smart button', smart_hint: 'Give the big button its own name and action per part of the day (e.g. Good morning, Coming home, Bedtime). Start: a time (06:30) or sunrise / sunset, optionally with minutes added or taken off (sunset-30). Empty = the normal button above.',
    from: 'From', slot_name: 'Name', slot_action: 'Does', slot_sub: 'Caption', slot_on: 'While a light is on', same: 'the same', smart_on: 'What counts as “light on”', any_lamp: 'a lamp on the plan', lights_off: 'lights off',
    s_grid: 'Power from the grid (W)', s_grid_return: 'Power returned (W)', s_price: 'Electricity price', s_solar_today: 'Solar today (kWh)', s_status: 'Status list',
    import: 'Load a floorplan from a file', export: 'Save the floorplan as a file', import_bad: 'This is not a Floorplan Studio file.',
    room_tap: 'Tap on a room', tap_zoom_opt: 'Zoom in on the card', tap_page_opt: 'Open the room’s own page (created dashboards)', make_home: 'With a “Home” start page (greeting, smart button, rooms and energy)',
    set_temp: 'Temperature colours', temp_color: 'Colour rooms by temperature by default (also on/off with the thermometer button)', temp_min: 'Blue at … °C or colder', temp_max: 'Red at … °C or warmer',
    set_presence: 'Presence', presence: 'An icon when someone is in the room',
    people_hint: 'Want to see who is where? Pick, per person, the sensor that says which room they are in.',
    set_alerts: 'Alerts', alerts: 'Smoke, gas, carbon monoxide and water leak: the room flashes red + a banner on top', alert_open: 'Open doors and windows: orange edge',
    set_vacuum: 'Vacuum', vacuum: 'Vacuum', vacuum_live: 'Live map over the floorplan', live_cleaning: 'Only while cleaning', live_always: 'Always', live_off: 'Off',
    vacuum_map: 'Vacuum map', vacuum_map_hint: 'Only lines up exactly if you used the same map as the example in step 1.',
    vacuum_show: 'What you see while it cleans', vshow_robot: 'only the robot driving over your plan (with a trail)', vshow_map: 'the vacuum\'s own map', vshow_both: 'both',
    vacuum_opacity: 'Live map opacity', first_on_plan: 'first one on the plan', from_bg: 'the background one',
    segments: 'This room’s number in your vacuum (only if “Clean this room” doesn’t work by itself)', segments_hint: 'e.g. 16 or 16,17',
    yaml: 'Or put the card on a dashboard you already have:', preview: 'Preview', need_save: 'Save first.', loading: 'Loading…', default_name: 'Home',
    zoom_all: 'Whole floorplan', zoom_hint: 'or double-click a room', measure_pick: 'Real sizes: pick a room and fill in how wide or long it really is.', measure_done: 'Sizes are in metres. To correct them: pick a room and change its real width.',
    measure_w: 'Real width (m)', measure_l: 'Real length (m)', measure: 'Real width of this room (metres)', measure_hint: 'Fill in the real width or length of one room; the other side follows from your drawing. Then the plan knows how big everything is: you see sizes in metres, and the radar knows how far 2 metres is.', dims: 'Size',
    furn_title: 'Furniture and stairs', furn_tip: 'Tap a piece to put it on the plan, then drag it to the right spot. It is only a light outline on your dashboard.',
    f_sofa: 'Sofa', f_bed: 'Bed', f_table: 'Table', f_round: 'Round table', f_desk: 'Desk', f_counter: 'Kitchen counter', f_cabinet: 'Cupboard', f_bath: 'Bath', f_shower: 'Shower', f_toilet: 'Toilet', f_stairs: 'Stairs', f_tv: 'TV', f_plant: 'Plant',
    f_hob: 'Hob (on a worktop)', f_sink: 'Sink', f_stove: 'Cooker', f_fridge: 'Fridge', f_island: 'Kitchen island', f_wallcab: 'Wall cupboard', lamp_size: 'Lamps (size in %)', device_size: 'Other devices (size in %)', f_kind: 'Kind', f_w: 'Width', f_h: 'Depth', f_z: 'Height (cm, for the 2.5D view)', f_turn: 'Turn 90°',
    more_options_room: 'More options (sensors, text, floor…)', more_options: 'More options (icon, colour, height…)', kind_q: 'What is plugged in / connected?', kind_auto: 'automatic', kind_lamp: 'a lamp (lamp icon and glow)', kind_device: 'a device, no light (no glow)', kind_hint: 'A normal lamp on a smart plug? Choose “a lamp”: it then looks and glows like a lamp on the plan.',
    i_height: 'Height in metres (for the 2.5D view, empty = usual)',
    via: 'Power through a smart switch (may be empty)', via_hint: 'Is this lamp on a smart plug or switch? Pick it here. You then see one lamp, and tapping it switches the power on or off.',
    radar: 'Radar: show where someone is', radar_dist: 'distance', radar_dots: 'position per person', radar_scale: 'First fill in the real width of a room in step 2, otherwise the radar does not know how far a metre is.', radar_angle: 'Which way the sensor looks (degrees, 0 = down)', radar_height: 'On the ceiling? Height of the sensor in metres', radar_wall: 'empty = on the wall',
    motion_fade: 'Motion icon fades out over … minutes (0 = straight away)', height_25d: 'Height of walls and icons in the 2.5D view', perspective: 'Perspective in 2.5D (nearer looks a little bigger)', show_stalks: 'Thin lines from the floor to the icons (2.5D)', turn_hint: 'Turning in 2.5D: right mouse button (or Shift) and drag; on a phone or tablet twist two fingers. Up/down tilts.', h25_real: 'real size', h25_custom: 'own value (% of real)',
  },
  nl: {
    steps: ['Achtergrond', 'Ruimtes', 'Deuren & meubels', 'Apparaten', 'Instellingen', 'Klaar'],
    save: 'Opslaan', saved: 'Opgeslagen ✓', unsaved: 'Niet opgeslagen', new_plan: 'Nieuwe plattegrond', delete_plan: 'Plattegrond verwijderen', undo: 'Ongedaan maken',
    confirm_delete: 'Deze plattegrond en het dashboard dat ervoor is gemaakt verwijderen? Dit kun je niet terugdraaien.', confirm_discard: 'Je hebt wijzigingen die niet zijn opgeslagen. Wil je ze weggooien?', bg_load_failed: 'Het plaatje kon niet worden geladen. Controleer de verbinding en probeer het opnieuw.', plan_name: 'Naam', size: 'Grootte van het tekenvlak (breedte × hoogte)',
    bg_title: 'Waar wil je overheen tekenen?', bg_adjust: 'Plaatje goed leggen', bg_upload: 'Plaatje uploaden', bg_upload_hint: 'Een bouwtekening, een foto ervan, of een screenshot uit de app van je stofzuiger.',
    bg_entity: 'Kaart van je robotstofzuiger (of een camera)', bg_entity_hint: 'Gebruikt de kaart die je stofzuiger zelf maakt, bijvoorbeeld van Roborock of Valetudo.', use: 'Gebruiken',
    bg_none: 'Zonder voorbeeld tekenen', bg_none_hint: 'Je tekent de ruimtes gewoon op het raster.', opacity: 'Doorzichtigheid', scale: 'Grootte', offx: 'Naar links of rechts', offy: 'Omhoog of omlaag',
    fit: 'Passend maken', rotate: 'Draaien', rot_l: '90° links', rot_r: '90° rechts', flip: 'Spiegelen', remove_bg: 'Plaatje weghalen', next: 'Volgende', back: 'Vorige',
    bg_tip: 'Het plaatje is alleen om overheen te tekenen. Op je dashboard zie je het niet.',
    rooms_title: 'Teken je ruimtes', tool_select: 'Kiezen en verschuiven', tool_draw: 'Ruimte tekenen', tool_part: 'Stuk aan ruimte toevoegen',
    rooms_tip: 'Sleep een rechthoek voor elke ruimte. Is een ruimte L-vormig? Kies hem en tik op “Stuk aan ruimte toevoegen”. De muren tekenen zichzelf.',
    from_areas: 'Ruimtes overnemen uit Home Assistant', room: 'Ruimte', area: 'Ruimte in Home Assistant', none: '— geen —', temp_sensor: 'Temperatuursensor', hum_sensor: 'Vochtsensor', auto: 'automatisch',
    delete_room: 'Ruimte verwijderen', delete_part: 'Dit stuk verwijderen', rooms_list: 'Ruimtes', no_rooms: 'Nog geen ruimtes.',
    doors_title: 'Deuren, ramen en doorgangen', door: 'Deur', window: 'Raam', opening: 'Open doorgang', doors_tip: 'Kies deur, raam of doorgang en tik op een muur. Een doorgang haalt de muur weg, bijvoorbeeld bij een open keuken. Koppel een deur of raam aan zijn sensor: staat hij open, dan wordt hij oranje op de kaart.', o_sensor: 'Sensor (open / dicht)', o_none: '— geen —',
    length: 'Breedte', whole: 'Hele muur', delete: 'Verwijderen', no_walls: 'Teken eerst je ruimtes, dan komen de muren vanzelf.',
    items_title: 'Apparaten op de kaart', auto_place: 'Alles vanzelf neerzetten', auto_hint: 'Zet lampen, schakelaars, verwarming, gordijnen en tv’s neer in de ruimte waar ze in Home Assistant bij horen.',
    unplaced: 'Nog niet op de kaart', add: 'Toevoegen', search: 'Zoek iets uit Home Assistant…', item: 'Apparaat', show_always: 'Altijd laten zien (ook bij Eenvoudig)', color: 'Kleur van het licht (voor een stekker met een gekleurde lamp)', no_color: 'automatisch', icon: 'Ander icoon (mag leeg)', label: 'Andere naam (mag leeg)',
    remove: 'Van de kaart halen', items_tip: 'Sleep de iconen naar de goede plek. Op je dashboard: tikken = aan/uit, vasthouden = meer info.',
    finish_title: 'Klaar!', theme: 'Thema', usage_days: 'Laat zien wat de laatste … dagen gebruikt is', make_dash: 'Maak een dashboard (Thuis, Plattegrond, Kiosk, Energie, Buiten, TV en een pagina per ruimte)', dash_done: 'Dashboard gemaakt:', dash_conflict: 'Er bestaat al een dashboard op /{url} dat Floorplan Studio niet heeft gemaakt. Het is niet gewijzigd.', dash_error: 'Het dashboard kon niet worden gemaakt: ', open: 'Openen',
    set_title: 'Instellingen', set_intro: 'Dit geldt voor elke kaart met deze plattegrond.',
    set_light: 'Licht', set_screens: 'Telefoon, tablet en 2.5D', set_look: 'Uiterlijk', set_simple: 'Eenvoudig', set_room: 'Tekst bij de ruimtes', set_behaviour: 'Tikken en vasthouden', set_sun: 'Thema Automatisch (zon)', set_auto: 'Alles vanzelf neerzetten',
    default_mode: 'Begint op', learning_days: 'Laat alles zien zolang er minder dan … dagen geschiedenis is', plan_size: 'Grootte plattegrond in %', icon_size: 'Grootte van alle iconen (%)', label_size: 'Grootte tekst bij ruimtes', glow: 'Sterkte van de gloed',
    show_temp: 'Temperatuur', show_hum: 'Vochtigheid', show_lights: 'Aantal lampen aan', show_tags: 'Kleine labels onder apparaten (21°, open…)',
    tap_zoom: 'Tik op een ruimte om in te zoomen', hold_ms: 'Hoe lang vasthouden voor meer info (1000 = 1 seconde)', hold_action: 'Vasthouden op een icoon opent', hold_quick: 'een klein venster met aan/uit en schuifjes', hold_more: 'het venster van Home Assistant', sun_before: 'Wordt … minuten voor zonsopkomst licht', sun_ramp: 'Overgang duurt … minuten',
    auto_domains: 'Wat zet hij neer', reset: 'Alles terugzetten', simple: 'Eenvoudig', all: 'Alles',
    theme_entity: 'Eén thema voor het hele huis', theme_entity_hint: 'Dan hebben alle schermen hetzelfde thema, en kun je het ook met een automatisering wisselen. Geen keuzelijst? Maak er een met de knop.', make_helper: 'Keuzelijst maken', own_choice: 'elk scherm kiest zelf',
    headline: 'Grote waarde', headline_auto: 'temperatuur', extra_rows: 'Extra regels in het tekstblok', floor: 'Vloer', floor_plain: 'gewoon', floor_tiles: 'tegels', floor_wood: 'hout',
    set_text: 'Tekstblok en licht', glow_style: 'Gloed', glow_lamp: 'zachte lichtvlek per lamp', glow_room: 'hele ruimte gloeit', glow_off: 'geen gloed', compact: 'Kleine schermen', cmp_auto: 'per ruimte op smalle schermen', cmp_on: 'altijd per ruimte', cmp_off: 'nooit, altijd de hele plattegrond', compact_width: 'Smal is smaller dan (pixels)', lamp_level: 'Sterkte van lampen', lvl_fixed: 'altijd onder de lamp', lvl_hover: 'alleen bij aanwijzen', lvl_off: 'niet tonen',
    show_co2: 'CO2', show_covers: 'Gordijnen / rolluiken', show_climate: 'Verwarming / airco', show_media: 'Wat er speelt', info_rows: 'Hoeveel regels maximaal',
    compass: 'Noordpijl (graden, leeg = geen)', greeting: 'Begroeting en wie er thuis is (bij de zijkolom)',
    set_side: 'Zijkolom', side_hint: 'Leeg laten = hij kiest zelf. Je ziet de zijkolom op het dashboard dat je bij stap 6 maakt.',
    s_weather: 'Weer', s_main: 'Grote knop', s_main_auto: 'alle lampen uit', s_buttons: 'Knoppen', s_solar: 'Zonnepanelen nu',
    smart: 'Slimme knop', smart_hint: 'Geef de grote knop per moment van de dag een eigen naam en actie, zoals Goedemorgen, Thuiskomen en Naar bed. Bij “Vanaf” vul je een tijd in (06:30), of sunrise / sunset voor zonsopkomst / zonsondergang (sunset-30 = een half uur ervoor).',
    from: 'Vanaf', slot_name: 'Naam', slot_action: 'Doet', slot_sub: 'Tekst eronder', slot_on: 'Als er al licht aan is', same: 'hetzelfde', smart_on: 'Wanneer is er “licht aan”', any_lamp: 'een lamp op de kaart', lights_off: 'lampen uit',
    s_grid: 'Stroom van het net', s_grid_return: 'Stroom terug naar het net', s_price: 'Stroomprijs', s_solar_today: 'Zon vandaag', s_status: 'Lijstje onderaan',
    import: 'Plattegrond inladen uit een bestand', export: 'Plattegrond bewaren als bestand', import_bad: 'Dit bestand is geen plattegrond van Floorplan Studio.',
    room_tap: 'Tik op een ruimte', tap_zoom_opt: 'Inzoomen op de kaart', tap_page_opt: 'De eigen pagina van de ruimte openen', make_home: 'Met een startpagina “Thuis” (begroeting, slimme knop, kamers en energie)',
    set_temp: 'Kleur op temperatuur', temp_color: 'Ruimtes kleuren naar temperatuur (kan ook met het thermometer-knopje)', temp_min: 'Blauw bij … °C of kouder', temp_max: 'Rood bij … °C of warmer',
    set_presence: 'Aanwezigheid', presence: 'Icoontje als er iemand in de ruimte is',
    people_hint: 'Wil je zien wie waar is? Kies per persoon de sensor die zegt in welke ruimte hij of zij is.',
    set_alerts: 'Meldingen', alerts: 'Rook, gas, koolmonoxide of lekkage: de ruimte knippert rood en er komt een melding bovenaan', alert_open: 'Deur of raam open: oranje rand',
    set_vacuum: 'Stofzuiger', vacuum: 'Stofzuiger', vacuum_live: 'Stofzuiger live op de kaart', live_cleaning: 'Alleen tijdens het zuigen', live_always: 'Altijd', live_off: 'Uit',
    vacuum_map: 'Kaart van de stofzuiger', vacuum_map_hint: 'Klopt alleen precies als je bij stap 1 dezelfde kaart als voorbeeld hebt gebruikt.',
    vacuum_show: 'Wat je ziet tijdens het zuigen', vshow_robot: 'alleen de robot die over je plattegrond rijdt (met spoor)', vshow_map: 'de kaart van de stofzuiger', vshow_both: 'allebei',
    vacuum_opacity: 'Doorzichtigheid', first_on_plan: 'de eerste op de kaart', from_bg: 'die van stap 1',
    segments: 'Nummer van deze ruimte in je stofzuiger (alleen als “Deze ruimte zuigen” niet vanzelf werkt)', segments_hint: 'bijv. 16 of 16,17',
    yaml: 'Of zet de kaart op een dashboard dat je al hebt:', preview: 'Voorbeeld', need_save: 'Sla eerst op.', loading: 'Laden…', default_name: 'Thuis',
    zoom_all: 'Hele plattegrond', zoom_hint: 'of dubbelklik op een ruimte', measure_pick: 'Echte maten: kies een ruimte en vul in hoe breed of lang die echt is.', measure_done: 'De maten staan in meters. Klopt het niet? Kies een ruimte en pas de echte breedte of lengte aan. Klopt de ene kant wel en de andere niet, dan is de ruimte scheef getekend: maak hem groter of kleiner met de hoekjes.',
    measure_w: 'Echte breedte (m)', measure_l: 'Echte lengte (m)', measure: 'Echte breedte van deze ruimte (meter)', measure_hint: 'Vul bij één ruimte de echte breedte of lengte in; de andere kant volgt uit je tekening. Dan weet de plattegrond hoe groot alles is: je ziet maten in meters, en de radar weet hoe ver 2 meter is.', dims: 'Maat',
    furn_title: 'Meubels en trap', furn_tip: 'Tik op een meubel om het neer te zetten en sleep het daarna naar de goede plek. Op je dashboard is het alleen een lichte omtrek.',
    f_sofa: 'Bank', f_bed: 'Bed', f_table: 'Tafel', f_round: 'Ronde tafel', f_desk: 'Bureau', f_counter: 'Aanrecht (blad)', f_cabinet: 'Kast', f_bath: 'Bad', f_shower: 'Douche', f_toilet: 'Wc', f_stairs: 'Trap', f_tv: 'Tv', f_plant: 'Plant',
    f_hob: 'Kookplaat (op het aanrecht)', f_sink: 'Gootsteen', f_stove: 'Fornuis', f_fridge: 'Koelkast', f_island: 'Kookeiland', f_wallcab: 'Bovenkast', lamp_size: 'Lampen (grootte in %)', device_size: 'Andere apparaten (grootte in %)', f_kind: 'Soort', f_w: 'Breedte', f_h: 'Diepte', f_z: 'Hoogte (cm, voor de 2.5D-weergave)', f_turn: 'Kwartslag draaien',
    more_options_room: 'Meer opties (sensoren, tekst, vloer…)', more_options: 'Meer opties (icoon, kleur, hoogte…)', kind_q: 'Wat zit eraan?', kind_auto: 'automatisch', kind_lamp: 'een lamp (lampicoon en gloed)', kind_device: 'een apparaat, geen licht (geen gloed)', kind_hint: 'Een gewone lamp aan een slimme stekker? Kies “een lamp”: dan ziet hij eruit en gloeit hij als een lamp op de kaart.',
    i_height: 'Hoogte in meter (voor de 2.5D-weergave, leeg = gebruikelijk)',
    via: 'Stroom via een slimme schakelaar (mag leeg)', via_hint: 'Zit deze lamp aan een slimme stekker of schakelaar? Kies die hier. Dan zie je één lamp, en tikken zet de stroom aan of uit.',
    radar: 'Radar: laat zien waar iemand is', radar_dist: 'afstand', radar_dots: 'plek per persoon', radar_scale: 'Vul eerst bij stap 2 de echte breedte van een ruimte in, anders weet de radar niet hoe ver een meter is.', radar_angle: 'Kant waar de sensor naar kijkt (graden, 0 = naar beneden)', radar_height: 'Aan het plafond? Hoogte van de sensor in meter', radar_wall: 'leeg = aan de muur',
    motion_fade: 'Bewegingsicoontje dooft uit in … minuten (0 = meteen)', height_25d: 'Hoogte van muren en iconen in de 2.5D-weergave', perspective: 'Perspectief in 2.5D (dichterbij is iets groter)', show_stalks: 'Hulplijntjes van de vloer naar de iconen (2.5D)', turn_hint: 'Draaien in 2.5D: rechtermuisknop (of Shift) ingedrukt en slepen; op telefoon of tablet twee vingers draaien. Omhoog/omlaag kantelt.', h25_real: 'echte maat', h25_custom: 'eigen waarde (% van echt)',
  },
};

const CSS = `
  :host { display: block; height: 100%; background: var(--primary-background-color); color: var(--primary-text-color); font-family: var(--ha-font-family-body, Roboto, sans-serif); }
  * { box-sizing: border-box; }
  .top { display: flex; align-items: center; gap: 10px; padding: 0 12px; height: 56px; border-bottom: 1px solid var(--divider-color); background: var(--app-header-background-color, var(--card-background-color)); color: var(--app-header-text-color, var(--primary-text-color)); }
  .top h1 { font-size: 20px; font-weight: 400; margin: 0 12px 0 0; white-space: nowrap; }
  .top select { max-width: 200px; }
  .grow { flex: 1; }
  .status { font-size: 12px; opacity: .8; }
  button { font: inherit; cursor: pointer; border-radius: 8px; border: 1px solid var(--divider-color); background: var(--card-background-color); color: var(--primary-text-color); padding: 7px 12px; display: inline-flex; align-items: center; gap: 6px; }
  button.primary { background: var(--primary-color); color: var(--text-primary-color, #fff); border-color: transparent; }
  button.active { border-color: var(--primary-color); color: var(--primary-color); box-shadow: inset 0 0 0 1px var(--primary-color); }
  button.danger { color: var(--error-color, #db4437); }
  button:disabled { opacity: .5; cursor: default; }
  button ha-icon { --mdc-icon-size: 18px; }
  .menu-btn { border: none; background: none; padding: 6px; color: inherit; }
  input, select { font: inherit; padding: 7px 9px; border-radius: 8px; border: 1px solid var(--divider-color); background: var(--card-background-color); color: var(--primary-text-color); width: 100%; }
  input[type=range] { padding: 0; }
  input[type=checkbox] { width: auto; }
  .steps { display: flex; gap: 4px; padding: 8px 12px; border-bottom: 1px solid var(--divider-color); overflow-x: auto; }
  .steps button { border: none; background: none; border-radius: 999px; white-space: nowrap; }
  .steps button .n { display: inline-grid; place-items: center; width: 22px; height: 22px; border-radius: 50%; background: var(--divider-color); font-size: 12px; }
  .steps button.cur { background: var(--secondary-background-color); font-weight: 600; }
  .steps button.cur .n { background: var(--primary-color); color: var(--text-primary-color, #fff); }
  .main { display: grid; grid-template-columns: 1fr 340px; height: calc(100% - 56px - 49px); }
  .narrow .main { grid-template-columns: 1fr; grid-template-rows: auto auto; height: auto; }
  .canvaswrap { padding: 14px; overflow: auto; display: flex; align-items: flex-start; justify-content: center; }
  .canvas { position: relative; flex: none; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,.25); background: #0d1116; touch-action: none; user-select: none; }
  .canvas svg { position: absolute; inset: 0; width: 100%; height: 100%; }
  .side { border-left: 1px solid var(--divider-color); padding: 16px; overflow-y: auto; background: var(--card-background-color); }
  .narrow .side { border-left: none; border-top: 1px solid var(--divider-color); }
  .side h2 { font-size: 17px; margin: 0 0 10px; font-weight: 600; }
  .side h3 { font-size: 13px; margin: 18px 0 8px; text-transform: uppercase; letter-spacing: .08em; color: var(--secondary-text-color); }
  .side p, .hint { font-size: 13px; color: var(--secondary-text-color); line-height: 1.45; margin: 6px 0 10px; }
  .field { display: flex; flex-direction: column; gap: 4px; margin-bottom: 10px; font-size: 13px; }
  .field > span { color: var(--secondary-text-color); }
  .row { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
  .row > * { flex: 1; }
  .card { border: 1px solid var(--divider-color); border-radius: 12px; padding: 12px; margin-bottom: 10px; }
  .card.click { cursor: pointer; } .card.click:hover { border-color: var(--primary-color); }
  .card b { display: block; margin-bottom: 3px; }
  .list { display: flex; flex-direction: column; gap: 4px; }
  .li { display: flex; align-items: center; gap: 8px; padding: 6px 8px; border-radius: 8px; cursor: pointer; font-size: 13px; }
  .li:hover { background: var(--secondary-background-color); }
  .li.sel { background: rgba(var(--rgb-primary-color, 3,169,244), .15); }
  .li .sw { width: 12px; height: 12px; border-radius: 3px; flex: none; }
  .li small { color: var(--secondary-text-color); margin-left: auto; }
  .li ha-state-icon { --mdc-icon-size: 18px; color: var(--secondary-text-color); }
  .nav { display: flex; justify-content: space-between; margin-top: 18px; gap: 8px; }
  pre { background: var(--secondary-background-color); padding: 10px; border-radius: 8px; font-size: 12px; overflow-x: auto; user-select: all; }
  /* canvas content */
  .gridline { stroke: #ffffff; stroke-opacity: .06; }
  .gridline.major { stroke-opacity: .12; }
  .rect { stroke-width: 1.5; cursor: pointer; }
  .rect.sel { stroke-width: 3; stroke-dasharray: 6 4; }
  .rlabel { fill: #fff; font-size: 13px; font-weight: 600; pointer-events: none; paint-order: stroke; stroke: rgba(0,0,0,.6); stroke-width: 3px; }
  .wall { stroke: #c9d3df; stroke-linecap: square; pointer-events: none; }
  .wall.outer { stroke-width: 7; } .wall.inner { stroke-width: 3.5; stroke-opacity: .8; }
  .doors-mode .wall { pointer-events: stroke; cursor: crosshair; stroke-opacity: 1; }
  .doors-mode .wall:hover { stroke: var(--primary-color); }
  .op { stroke-width: 9; cursor: pointer; }
  .op.door { stroke: #ff6fd8; } .op.open { stroke: #36d399; stroke-dasharray: 8 5; } .op.window { stroke: #6fc3ff; stroke-dasharray: 3 3; }
  .op.sel { stroke: #fff; }
  .handle { fill: #fff; stroke: var(--primary-color); stroke-width: 2; cursor: nwse-resize; }
  .handle.ne, .handle.sw { cursor: nesw-resize; }
  .draft { fill: rgba(3,169,244,.15); stroke: #03a9f4; stroke-width: 2; stroke-dasharray: 6 4; pointer-events: none; }
  .items { position: absolute; inset: 0; pointer-events: none; }
  .it { position: absolute; transform: translate(-50%,-50%); width: 30px; height: 30px; border-radius: 50%; display: grid; place-items: center;
        background: #1c2430; border: 1.5px solid #f2a541; color: #f2a541; pointer-events: auto; cursor: grab; touch-action: none; }
  .it.dev { border-radius: 8px; border-color: #7fb0d6; color: #7fb0d6; }
  .it.sel { box-shadow: 0 0 0 3px #fff; }
  .it ha-state-icon, .it ha-icon { --mdc-icon-size: 17px; }
  .it .tip { position: absolute; top: 100%; margin-top: 3px; font-size: 10px; background: rgba(0,0,0,.75); color: #fff; padding: 1px 5px; border-radius: 4px; white-space: nowrap; pointer-events: none; opacity: 0; }
  .it:hover .tip, .it.sel .tip { opacity: 1; }
  .items.off .it { pointer-events: none; opacity: .55; }
  .preview { width: 100%; }
  details.sec { border: 1px solid var(--divider-color); border-radius: 12px; margin-bottom: 8px; }
  details.sec > summary { cursor: pointer; padding: 10px 12px; font-size: 14px; font-weight: 600; list-style: none; display: flex; align-items: center; }
  details.sec > summary::-webkit-details-marker { display: none; }
  details.sec > summary::after { content: '›'; margin-left: auto; font-size: 18px; transition: transform .2s; color: var(--secondary-text-color); }
  details.sec[open] > summary::after { transform: rotate(90deg); }
  details.sec .secb { padding: 0 12px 10px; }
  details.sec.sub { margin-top: 8px; }
  .cwcol { display: flex; flex-direction: column; align-items: center; gap: 8px; width: 100%; }
  .zoombar { display: flex; align-items: center; gap: 8px; align-self: stretch; font-size: 13px; } .zoombar select { width: auto; min-width: 180px; } .zoombar small { color: var(--secondary-text-color); } .zoombar ha-icon { --mdc-icon-size: 20px; color: var(--secondary-text-color); }
  .furn { fill: #ffffff; fill-opacity: .05; stroke: #d7dee8; stroke-opacity: .7; stroke-width: 1.5; pointer-events: none; }
  .furn .arrow { fill: none; }
  .doors-mode .furn { pointer-events: visiblePainted; cursor: move; }
  .fsel .furn { stroke: var(--primary-color); stroke-opacity: 1; stroke-width: 2.5; fill: var(--primary-color); fill-opacity: .12; }
  .furnbtns { display: grid; grid-template-columns: repeat(auto-fill, minmax(92px, 1fr)); gap: 6px; margin-bottom: 10px; }
  .furnbtns button { flex-direction: column; font-size: 12px; padding: 6px 4px; }
  .furnbtns ha-icon { --mdc-icon-size: 22px; }
  .rsize { fill: #fff; fill-opacity: .8; font-size: 11px; pointer-events: none; paint-order: stroke; stroke: rgba(0,0,0,.6); stroke-width: 3px; }
  .dimline line { stroke: #ffd54f; stroke-width: 1.5; pointer-events: none; }
  .dimline text, .fsize { fill: #ffd54f; font-size: 12px; font-weight: 600; pointer-events: none; paint-order: stroke; stroke: rgba(0,0,0,.75); stroke-width: 3px; }
  .rrange { fill: rgba(3,169,244,.08); stroke: #03a9f4; stroke-width: 1.5; stroke-dasharray: 6 5; pointer-events: none; }
  .sizeline { font-size: 13px; margin: -4px 0 10px; color: var(--primary-text-color); }
`;

const ROOM_COLORS = ['#f2a541', '#4fc3f7', '#81c784', '#ba68c8', '#ff8a65', '#4db6ac', '#f06292', '#aed581', '#7986cb', '#ffd54f', '#90a4ae', '#e57373'];
const uid = (p) => `${p}${Math.random().toString(36).slice(2, 8)}`;

class FloorplanStudioPanel extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.step = 0;
    this.tool = 'draw';
    this.doorType = 'door';
    this.sel = null;
    this.history = [];
    this.dirty = false;
    this.plans = null;
  }

  set hass(h) {
    const first = !this._hass;
    this._hass = h;
    if (first) this._init();
    else if (this._preview) this._preview.hass = h;
  }
  set narrow(v) { this._narrow = v; this.shadowRoot.host.classList.toggle('narrow', !!v); }
  set panel(p) { this._panel = p; }

  get L() { const l = (this._hass?.locale?.language || 'en').slice(0, 2); return L[l] || L.en; }

  async _init() {
    this.shadowRoot.innerHTML = `<style>${CSS}</style><div class="top"><h1>Floorplan</h1></div><p style="padding:20px">${this.L.loading}</p>`;
    this._keys = (ev) => {
      if ((ev.ctrlKey || ev.metaKey) && ev.key === 'z') { ev.preventDefault(); this.undo(); }
      if ((ev.key === 'Delete' || ev.key === 'Backspace') && this.sel && !['INPUT', 'SELECT', 'TEXTAREA'].includes(ev.composedPath()[0]?.tagName)) { ev.preventDefault(); this.deleteSel(); }
    };
    window.addEventListener('keydown', this._keys);
    try { this.plans = await loadPlans(this._hass, true); } catch (e) { this.plans = []; }
    if (this.plans.length) this.plan = structuredClone(this.plans[0]);
    else { this.plan = newPlan(this.L.default_name); this.dirty = true; }
    this.render();
  }

  disconnectedCallback() { window.removeEventListener('keydown', this._keys); }

  /* ------------------------------------------------------------- state */
  mut(fn, rerender = true) {
    this.history.push(JSON.stringify(this.plan));
    if (this.history.length > 60) this.history.shift();
    fn(this.plan);
    this.dirty = true;
    if (rerender) this.render();
  }
  undo() {
    if (!this.history.length) return;
    this.plan = JSON.parse(this.history.pop());
    this.sel = null; this.dirty = true; this.render();
  }
  snap(v) { const g = this.plan.grid || 10; return Math.round(v / g) * g; }
  room(id) { return this.plan.rooms.find((r) => r.id === id); }

  async save() {
    const btn = this.shadowRoot.getElementById('save');
    if (btn) btn.disabled = true;
    try {
      const saved = await savePlan(this._hass, this.plan);
      this.plan = structuredClone(saved);
      this.plans = await loadPlans(this._hass, true);
      this.dirty = false;
    } catch (e) {
      alert(`Floorplan Studio: ${e.message || e}`);
    }
    this.render();
  }

  /* ------------------------------------------------------------ render */
  render() {
    const l = this.L, p = this.plan;
    const planOpts = (this.plans || []).map((x) => `<option value="${esc(x.id)}" ${x.id === p.id ? 'selected' : ''}>${esc(x.name)}</option>`).join('');
    this.shadowRoot.innerHTML = `<style>${CSS}</style>
      <div class="top">
        <button class="menu-btn" id="menu" title="Menu"><ha-icon icon="mdi:menu"></ha-icon></button>
        <h1>Floorplan</h1>
        ${this.plans?.length ? `<select id="plansel">${planOpts}${p.id ? '' : `<option selected>${esc(p.name)} *</option>`}</select>` : ''}
        <button id="newplan" title="${l.new_plan}"><ha-icon icon="mdi:plus"></ha-icon></button>
        <button id="import" title="${l.import}"><ha-icon icon="mdi:file-import-outline"></ha-icon></button>
        <button id="export" title="${l.export}" ${p.rooms.length ? '' : 'disabled'}><ha-icon icon="mdi:file-export-outline"></ha-icon></button>
        <input type="file" id="importfile" accept=".json,application/json" hidden>
        <span class="grow"></span>
        <span class="status">${this.dirty ? l.unsaved : (p.id ? l.saved : '')}</span>
        <button id="undo" title="${l.undo}" ${this.history.length ? '' : 'disabled'}><ha-icon icon="mdi:undo"></ha-icon></button>
        <button class="primary" id="save" ${this.dirty ? '' : 'disabled'}><ha-icon icon="mdi:content-save"></ha-icon>${l.save}</button>
      </div>
      <div class="steps">${l.steps.map((s, i) => `<button data-step="${i}" class="${i === this.step ? 'cur' : ''}"><span class="n">${i + 1}</span>${s}</button>`).join('')}</div>
      <div class="main">
        <div class="canvaswrap">${this.step >= 4 ? '<div class="preview" id="preview"></div>' : `<div class="cwcol">${this.step >= 1 ? this.zoomBar() : ''}${this.canvasHTML()}</div>`}</div>
        <div class="side">${[this.sideBg, this.sideRooms, this.sideDoors, this.sideItems, this.sideSettings, this.sideFinish][this.step].call(this)}</div>
      </div>`;
    this.wire();
  }

  /** The part of the plan the canvas shows: everything, or one room (zoomed in) with a little space around it. */
  viewBox() {
    const p = this.plan, W = safeNumber(p.width, 1000), H = safeNumber(p.height, 700);
    const r = this.zoom && this.step >= 1 && this.step <= 3 ? this.room(this.zoom) : null;
    if (!r) return [0, 0, W, H];
    const [x0, y0, x1, y1] = roomBBox(r), pad = Math.max(30, (x1 - x0) * 0.12, (y1 - y0) * 0.12);
    return [x0 - pad, y0 - pad, x1 - x0 + 2 * pad, y1 - y0 + 2 * pad];
  }

  /** "Zoom in on" picker above the steps that work on the drawing. */
  zoomBar() {
    const l = this.L, p = this.plan;
    if (!p.rooms.length) return '';
    return `<div class="zoombar"><ha-icon icon="mdi:magnify-plus-outline"></ha-icon><select id="zoomsel"><option value="">${l.zoom_all}</option>${p.rooms.map((r) => `<option value="${esc(r.id)}" ${this.zoom === r.id ? 'selected' : ''}>${esc(r.name || '?')}</option>`).join('')}</select><small>${l.zoom_hint}</small></div>`;
  }

  canvasHTML() {
    const p = this.plan, W = safeNumber(p.width, 1000), H = safeNumber(p.height, 700), g = safeNumber(p.grid, 10) || 10;
    const out = [];
    const [vx, vy, vw, vh] = this.viewBox();
    const ratio = vw / vh;
    out.push(`<div class="canvas ${this.step === 2 ? 'doors-mode' : ''}" id="canvas" style="width: min(100%, calc((100vh - 150px) * ${ratio})); aspect-ratio: ${vw} / ${vh};">`);
    out.push(`<svg viewBox="${vx} ${vy} ${vw} ${vh}" id="svg">`);
    out.push(`<defs><pattern id="gm" width="${g}" height="${g}" patternUnits="userSpaceOnUse"><path class="gridline" d="M${g} 0H0V${g}" fill="none"/></pattern><pattern id="gM" width="${g * 5}" height="${g * 5}" patternUnits="userSpaceOnUse"><path class="gridline major" d="M${g * 5} 0H0V${g * 5}" fill="none"/></pattern></defs>`);
    out.push(`<rect width="${W}" height="${H}" fill="#0d1116" data-bg="1"/>`);
    if (safeImageData(p.background?.url)) {
      const b = p.background;
      out.push(`<image href="${safeImageData(b.url)}" x="${safeNumber(b.x)}" y="${safeNumber(b.y)}" width="${safeNumber(b.w, W)}" height="${safeNumber(b.h, H)}" opacity="${safeNumber(b.opacity, 0.5)}" preserveAspectRatio="none" style="pointer-events:none"/>`);
    }
    out.push(`<rect width="${W}" height="${H}" fill="url(#gm)" style="pointer-events:none"/><rect width="${W}" height="${H}" fill="url(#gM)" style="pointer-events:none"/>`);
    p.rooms.forEach((r, i) => {
      const c = ROOM_COLORS[i % ROOM_COLORS.length];
      r.rects.map(norm).forEach((q, k) => {
        const s = this.sel?.type === 'room' && this.sel.id === r.id;
        const sp = s && this.sel.part === k;
        out.push(`<rect class="rect ${sp ? 'sel' : ''}" data-room="${esc(r.id)}" data-part="${k}" x="${q[0]}" y="${q[1]}" width="${q[2] - q[0]}" height="${q[3] - q[1]}" fill="${c}" fill-opacity="${s ? 0.32 : 0.16}" stroke="${c}"/>`);
      });
    });
    for (const f of p.furniture || []) out.push(`<g data-furn="${esc(f.id)}" class="${this.sel?.type === 'furn' && this.sel.id === f.id ? 'fsel' : ''}">${furnSVG(f)}</g>`);
    for (const w of computeWalls(p.rooms)) out.push(`<line class="wall ${w.kind}" data-wall="${w.x1},${w.y1},${w.x2},${w.y2}" x1="${w.x1}" y1="${w.y1}" x2="${w.x2}" y2="${w.y2}"/>`);
    for (const o of p.openings) out.push(`<line class="op ${o.type === 'door' ? 'door' : o.type === 'window' ? 'window' : 'open'} ${this.sel?.type === 'opening' && this.sel.id === o.id ? 'sel' : ''}" data-op="${esc(o.id)}" x1="${safeNumber(o.x1)}" y1="${safeNumber(o.y1)}" x2="${safeNumber(o.x2)}" y2="${safeNumber(o.y2)}"/>`);
    const sc = planScale(p), m = (v) => (v / sc).toFixed(2).replace('.', ',');
    p.rooms.forEach((r) => {
      const [x0, y0, x1, y1] = roomBBox(r);
      out.push(`<text class="rlabel" x="${(x0 + x1) / 2}" y="${(y0 + y1) / 2}" text-anchor="middle" dominant-baseline="middle">${esc(r.name || '')}</text>`);
      // real size under the name once one room has been measured
      if (sc) out.push(`<text class="rsize" x="${(x0 + x1) / 2}" y="${(y0 + y1) / 2 + 17}" text-anchor="middle" dominant-baseline="middle">${m(x1 - x0)} × ${m(y1 - y0)} m</text>`);
    });
    // the selected room: dimension lines along its top and left side
    if (sc && this.step === 1 && this.sel?.type === 'room') {
      const r = this.room(this.sel.id);
      if (r) {
        const [x0, y0, x1, y1] = roomBBox(r), o = 16;
        out.push(`<g class="dimline"><line x1="${x0}" y1="${y0 + o}" x2="${x1}" y2="${y0 + o}"/><line x1="${x0}" y1="${y0 + o - 6}" x2="${x0}" y2="${y0 + o + 6}"/><line x1="${x1}" y1="${y0 + o - 6}" x2="${x1}" y2="${y0 + o + 6}"/>
          <text x="${(x0 + x1) / 2}" y="${y0 + o - 5}" text-anchor="middle">${m(x1 - x0)} m</text>
          <line x1="${x0 + o}" y1="${y0}" x2="${x0 + o}" y2="${y1}"/><line x1="${x0 + o - 6}" y1="${y0}" x2="${x0 + o + 6}" y2="${y0}"/><line x1="${x0 + o - 6}" y1="${y1}" x2="${x0 + o + 6}" y2="${y1}"/>
          <text x="${x0 + o + 6}" y="${(y0 + y1) / 2}" dominant-baseline="middle">${m(y1 - y0)} m</text></g>`);
      }
    }
    // the selected piece of furniture: its size in cm
    const fs = this.step === 2 && this.sel?.type === 'furn' ? (p.furniture || []).find((f) => f.id === this.sel.id) : null;
    if (fs) out.push(`<text class="fsize" x="${safeNumber(fs.x)}" y="${safeNumber(fs.y) - Math.max(fs.w, fs.h) / 2 - 10}" text-anchor="middle">${sc ? `${Math.round((fs.w / sc) * 100)} × ${Math.round((fs.h / sc) * 100)} cm` : `${Math.round(fs.w)} × ${Math.round(fs.h)}`}</text>`);
    // step 4: how far each radar reaches
    if (sc && this.step === 3) {
      for (const it of p.items) {
        if (!it.radar) continue;
        const st = this._hass.states[it.radar.range], u = (st?.attributes.unit_of_measurement || 'm').toLowerCase();
        const rm = st ? parseFloat(st.state) / (u === 'mm' ? 1000 : u === 'cm' ? 100 : 1) : 0;
        const he = Math.max(0, safeNumber(it.radar.height) - 1.1), rf = he > 0 ? Math.sqrt(Math.max(0, rm * rm - he * he)) : rm;
        if (rf > 0) out.push(`<circle class="rrange" cx="${safeNumber(it.x)}" cy="${safeNumber(it.y)}" r="${rf * sc}"/><text class="fsize" x="${safeNumber(it.x)}" y="${safeNumber(it.y) - rf * sc - 6}" text-anchor="middle">${rf.toFixed(1).replace('.', ',')} m</text>`);
      }
    }
    if (this.sel?.type === 'room' && this.step === 1 && this.tool === 'select') {
      const r = this.room(this.sel.id), q = r && norm(r.rects[this.sel.part] || r.rects[0]);
      if (q) for (const [cx, cy, n] of [[q[0], q[1], 'nw'], [q[2], q[1], 'ne'], [q[0], q[3], 'sw'], [q[2], q[3], 'se']]) out.push(`<rect class="handle ${n}" data-handle="${n}" x="${cx - 6}" y="${cy - 6}" width="12" height="12" rx="3"/>`);
    }
    out.push('<rect class="draft" id="draft" width="0" height="0"/></svg>');
    out.push(`<div class="items ${this.step === 3 ? '' : 'off'}" id="items">`);
    for (const it of p.items) {
      const d = it.entity_id.split('.')[0];
      const dev = it.kind === 'device' || (it.kind !== 'lamp' && !['light', 'switch', 'input_boolean', 'fan'].includes(d));
      out.push(`<div class="it ${dev ? 'dev' : ''} ${this.sel?.type === 'item' && this.sel.id === it.entity_id ? 'sel' : ''}" data-item="${esc(it.entity_id)}" style="left:${((safeNumber(it.x) - vx) / vw) * 100}%;top:${((safeNumber(it.y) - vy) / vh) * 100}%">${it.icon ? `<ha-icon icon="${esc(it.icon)}"></ha-icon>` : '<ha-state-icon></ha-state-icon>'}<span class="tip">${esc(it.name || friendly(this._hass, it.entity_id))}</span></div>`);
    }
    out.push('</div></div>');
    return out.join('');
  }

  /* --------------------------------------------------------- side panels */
  sideBg() {
    const l = this.L, p = this.plan, b = p.background;
    const ents = Object.keys(this._hass.states).filter((id) => id.startsWith('image.') || id.startsWith('camera.')).sort();
    const vac = ents.filter((id) => /map|kaart|vacuum|roborock|valetudo|xiaomi|dreame|robot/i.test(id + (this._hass.states[id].attributes.friendly_name || '')));
    const list = [...vac, ...ents.filter((e) => !vac.includes(e))];
    const scale = b ? Math.round((b.w / p.width) * 100) : 100;
    return `<h2>${l.bg_title}</h2>
      <div class="field"><span>${l.plan_name}</span><input id="pname" value="${esc(p.name || '')}"></div>
      <div class="card"><b>${l.bg_upload}</b><p>${l.bg_upload_hint}</p><input type="file" id="file" accept="image/*"></div>
      <div class="card"><b>${l.bg_entity}</b><p>${l.bg_entity_hint}</p>
        <div class="row"><select id="bgent">${list.map((id) => `<option value="${id}">${esc(friendly(this._hass, id))}</option>`).join('')}</select><button id="usebgent" style="flex:none">${l.use}</button></div></div>
      <div class="card click" id="nobg"><b>${l.bg_none}</b><p style="margin:0">${l.bg_none_hint}</p></div>
      ${b ? `<h3>${l.bg_adjust}</h3>
        <div class="field"><span>${l.opacity}</span><input type="range" min="0.1" max="1" step="0.05" value="${safeNumber(b.opacity, 0.5)}" data-bg="opacity"></div>
        <div class="field"><span>${l.scale} (${scale}%)</span><input type="range" min="20" max="300" step="1" value="${scale}" data-bg="scale"></div>
        <div class="field"><span>${l.offx}</span><input type="range" min="${-safeNumber(p.width, 1000)}" max="${safeNumber(p.width, 1000)}" step="1" value="${safeNumber(b.x)}" data-bg="x"></div>
        <div class="field"><span>${l.offy}</span><input type="range" min="${-safeNumber(p.height, 700)}" max="${safeNumber(p.height, 700)}" step="1" value="${safeNumber(b.y)}" data-bg="y"></div>
        <div class="field"><span>${l.rotate}</span><div class="row"><button id="rotl"><ha-icon icon="mdi:rotate-left"></ha-icon>${l.rot_l}</button><button id="rotr"><ha-icon icon="mdi:rotate-right"></ha-icon>${l.rot_r}</button><button id="flipbg"><ha-icon icon="mdi:flip-horizontal"></ha-icon>${l.flip}</button></div></div>
        <div class="row"><button id="fitbg">${l.fit}</button><button id="rmbg" class="danger">${l.remove_bg}</button></div>` : ''}
      <h3>${l.size}</h3>
      <div class="row"><input type="number" id="pw" value="${safeNumber(p.width, 1000)}" min="200" max="4000" step="10"><input type="number" id="ph" value="${safeNumber(p.height, 700)}" min="200" max="4000" step="10"></div>
      <p class="hint">${l.bg_tip}</p>
      ${this.navHTML()}
      ${p.id ? `<h3></h3><button class="danger" id="delplan"><ha-icon icon="mdi:delete"></ha-icon>${l.delete_plan}</button>` : ''}`;
  }

  sideRooms() {
    const l = this.L, p = this.plan;
    const areas = Object.values(this._hass.areas || {}).sort((a, b) => a.name.localeCompare(b.name));
    const r = this.sel?.type === 'room' ? this.room(this.sel.id) : null;
    const sensorOpts = (dc, cur) => {
      const ids = r?.area_id ? areaEntities(this._hass, r.area_id, ['sensor']).filter((id) => this._hass.states[id].attributes.device_class === dc) : [];
      const all = cur && !ids.includes(cur) ? [cur, ...ids] : ids;
      return `<option value="">${l.auto}</option>` + all.map((id) => `<option value="${id}" ${cur === id ? 'selected' : ''}>${esc(friendly(this._hass, id))}</option>`).join('');
    };
    return `<h2>${l.rooms_title}</h2>
      <div class="row" style="margin-bottom:10px">
        <button data-tool="draw" class="${this.tool === 'draw' ? 'active' : ''}"><ha-icon icon="mdi:vector-rectangle"></ha-icon>${l.tool_draw}</button>
        <button data-tool="select" class="${this.tool === 'select' ? 'active' : ''}"><ha-icon icon="mdi:cursor-default-outline"></ha-icon>${l.tool_select}</button>
      </div>
      ${r ? `<button data-tool="part" class="${this.tool === 'part' ? 'active' : ''}" style="width:100%;margin-bottom:10px"><ha-icon icon="mdi:shape-square-rounded-plus"></ha-icon>${l.tool_part}</button>` : ''}
      <p>${l.rooms_tip}</p>
      ${!r ? `<p class="hint">${planScale(p) ? l.measure_done : l.measure_pick}</p>` : ''}
      ${r ? `<div class="card">
          <div class="field"><span>${l.room}</span><input id="rname" value="${esc(r.name || '')}"></div>
          <div class="field"><span>${l.area}</span><select id="rarea"><option value="">${l.none}</option>${areas.map((a) => `<option value="${a.area_id}" ${a.area_id === r.area_id ? 'selected' : ''}>${esc(a.name)}</option>`).join('')}</select></div>
          ${(() => {
            const sc = planScale(p), [x0, y0, x1, y1] = roomBBox(r), m2 = roomArea(r, sc);
            const inp = (k, v, ph) => `<input data-measure="${k}" type="number" min="0.5" max="100" step="0.05" inputmode="decimal" value="${sc ? (v / sc).toFixed(2) : ''}" placeholder="${ph}">`;
            return `<div class="row" style="align-items:flex-end;margin-bottom:10px"><div class="field" style="margin:0"><span>${l.measure_w}</span>${inp('w', x1 - x0, '4,20')}</div><div class="field" style="margin:0"><span>${l.measure_l}</span>${inp('l', y1 - y0, '3,50')}</div></div>
              ${sc ? `<div class="sizeline">${l.dims}: ${fmtMeters(x1 - x0, sc)} × ${fmtMeters(y1 - y0, sc)} · ${String(m2.toFixed(1)).replace('.', ',')} m²</div>` : `<p class="hint">${l.measure_hint}</p>`}`;
          })()}
          <details class="sec sub" data-sec="roommore" ${this._secOpen?.roommore ? 'open' : ''}><summary>${l.more_options_room}</summary><div class="secb">
          ${r.area_id ? `<div class="field"><span>${l.temp_sensor}</span><select id="rtemp">${sensorOpts('temperature', r.temperature)}</select></div>
          <div class="field"><span>${l.hum_sensor}</span><select id="rhum">${sensorOpts('humidity', r.humidity)}</select></div>` : ''}
          ${r.area_id ? (() => {
            const ae = areaEntities(this._hass, r.area_id).sort();
            const opt = (cur, first) => `<option value="">${first}</option>` + ae.map((id) => `<option value="${id}" ${cur === id ? 'selected' : ''}>${esc(friendly(this._hass, id))}</option>`).join('');
            const info = r.info || [];
            return `<div class="field"><span>${l.headline}</span><select id="rhead">${opt(r.headline, l.headline_auto)}</select></div>
              <div class="field"><span>${l.extra_rows}</span>${[0, 1, 2].map((i) => `<select data-rinfo="${i}" style="margin-bottom:4px">${opt(info[i], l.none)}</select>`).join('')}</div>`;
          })() : ''}
          <div class="field"><span>${l.floor}</span><select id="rfloor">${['', 'tiles', 'wood'].map((f) => `<option value="${f}" ${(r.floor || '') === f ? 'selected' : ''}>${l['floor_' + (f || 'plain')]}</option>`).join('')}</select></div>
          ${this._hass.services?.vacuum?.clean_area ? '' : `<div class="field"><span>${l.segments}</span><input id="rseg" placeholder="${l.segments_hint}" value="${esc(r.vacuum_segments || '')}"></div>`}
          </div></details>
          <div class="row">${r.rects.length > 1 ? `<button id="delpart">${l.delete_part}</button>` : ''}<button class="danger" id="delroom">${l.delete_room}</button></div>
        </div>` : ''}
      <h3>${l.rooms_list}</h3>
      <div class="list">${p.rooms.length ? p.rooms.map((x, i) => `<div class="li ${r?.id === x.id ? 'sel' : ''}" data-selroom="${esc(x.id)}"><span class="sw" style="background:${ROOM_COLORS[i % ROOM_COLORS.length]}"></span>${esc(x.name || '?')}<small>${esc(this._hass.areas?.[x.area_id]?.name || '')}</small></div>`).join('') : `<p>${l.no_rooms}</p>`}</div>
      ${areas.some((a) => !p.rooms.find((x) => x.area_id === a.area_id)) ? `<button id="fromareas" style="margin-top:10px;width:100%"><ha-icon icon="mdi:auto-fix"></ha-icon>${l.from_areas}</button>` : ''}
      ${this.navHTML()}`;
  }

  sideDoors() {
    const l = this.L, p = this.plan;
    const o = this.sel?.type === 'opening' ? p.openings.find((x) => x.id === this.sel.id) : null;
    const len = o ? Math.round(Math.hypot(o.x2 - o.x1, o.y2 - o.y1)) : 0;
    return `<h2>${l.doors_title}</h2>
      ${p.rooms.length ? '' : `<p>${l.no_walls}</p>`}
      <div class="row" style="margin-bottom:10px">
        <button data-door="door" class="${this.doorType === 'door' ? 'active' : ''}"><ha-icon icon="mdi:door"></ha-icon>${l.door}</button>
        <button data-door="window" class="${this.doorType === 'window' ? 'active' : ''}"><ha-icon icon="mdi:window-closed-variant"></ha-icon>${l.window}</button>
        <button data-door="open" class="${this.doorType === 'open' ? 'active' : ''}"><ha-icon icon="mdi:arrow-expand-horizontal"></ha-icon>${l.opening}</button>
      </div>
      <p>${l.doors_tip}</p>
      ${o ? `<div class="card">
        <div class="field"><span>${l.door} / ${l.window} / ${l.opening}</span><select id="otype">${['door', 'window', 'open'].map((k) => `<option value="${k}" ${o.type === k ? 'selected' : ''}>${l[k === 'open' ? 'opening' : k]}</option>`).join('')}</select></div>
        ${o.type !== 'open' ? `<div class="field"><span>${l.o_sensor}</span><select id="osensor"><option value="">${l.o_none}</option>${this.openSensors().map((id) => `<option value="${esc(id)}" ${o.entity === id ? 'selected' : ''}>${esc(friendly(this._hass, id))}</option>`).join('')}</select></div>` : ''}
        <div class="field"><span>${l.length} (${len})</span><input type="range" id="olen" min="20" max="400" step="5" value="${len}"></div>
        <div class="row"><button id="owhole">${l.whole}</button><button class="danger" id="odel">${l.delete}</button></div></div>` : ''}
      <h3>${l.furn_title}</h3>
      <p>${l.furn_tip}</p>
      <div class="furnbtns">${Object.entries(FURN_TYPES).map(([k, v]) => `<button data-addfurn="${k}"><ha-icon icon="${v.icon}"></ha-icon>${l['f_' + k]}</button>`).join('')}</div>
      ${(() => {
        const f = this.sel?.type === 'furn' ? (p.furniture || []).find((x) => x.id === this.sel.id) : null;
        if (!f) return '';
        const sc = planScale(p);
        const dim = (k) => sc
          ? `<div class="field"><span>${l['f_' + k]} (cm)</span><input type="number" data-fdim="${k}" min="10" max="1000" step="5" value="${Math.round((f[k] / sc) * 100)}"></div>`
          : `<div class="field"><span>${l['f_' + k]}</span><input type="range" data-fdim="${k}" min="6" max="500" step="2" value="${Math.round(f[k])}"></div>`;
        return `<div class="card">
          <div class="field"><span>${l.f_kind}</span><select id="ftype">${Object.keys(FURN_TYPES).map((k) => `<option value="${k}" ${f.type === k ? 'selected' : ''}>${l['f_' + k]}</option>`).join('')}</select></div>
          ${dim('w')}${dim('h')}
          <div class="field"><span>${l.f_z}</span><input type="number" id="fz" min="0" max="400" step="5" placeholder="${Math.round((FURN_HEIGHT[f.type] || 0) * 100)}" value="${f.z != null ? Math.round(f.z * 100) : ''}"></div>
          <div class="row"><button id="fturn"><ha-icon icon="mdi:rotate-right"></ha-icon>${l.f_turn}</button><button class="danger" id="fdel">${l.delete}</button></div></div>`;
      })()}
      ${this.navHTML()}`;
  }

  sideItems() {
    const l = this.L, p = this.plan, h = this._hass;
    const placed = new Set(p.items.map((i) => i.entity_id));
    const it = this.sel?.type === 'item' ? p.items.find((x) => x.entity_id === this.sel.id) : null;
    const groups = p.rooms.filter((r) => r.area_id).map((r) => [r, areaEntities(h, r.area_id, PLACE_DOMAINS).filter((id) => !placed.has(id))]).filter(([, ids]) => ids.length);
    return `<h2>${l.items_title}</h2>
      <button class="primary" id="autoplace" style="width:100%"><ha-icon icon="mdi:auto-fix"></ha-icon>${l.auto_place}</button>
      <p>${l.auto_hint}</p>
      <p>${l.items_tip}</p>
      ${it ? `<div class="card"><b>${esc(friendly(h, it.entity_id))}</b><small class="hint">${esc(it.entity_id)}</small>
        <div class="field"><span>${l.label}</span><input id="iname" value="${esc(it.name || '')}"></div>
        <label class="row" style="font-size:13px"><input type="checkbox" id="ipin" ${it.pin ? 'checked' : ''} style="flex:none">${l.show_always}</label>
        ${['switch', 'input_boolean'].includes(it.entity_id.split('.')[0]) ? `<div class="field" style="margin-top:8px"><span>${l.kind_q}</span><select id="ikind">
          <option value="" ${!it.kind ? 'selected' : ''}>${l.kind_auto}</option><option value="lamp" ${it.kind === 'lamp' ? 'selected' : ''}>${l.kind_lamp}</option><option value="device" ${it.kind === 'device' ? 'selected' : ''}>${l.kind_device}</option></select></div>` : ''}
        <details class="sec sub" data-sec="itemmore" ${this._secOpen?.itemmore ? 'open' : ''}><summary>${l.more_options}</summary><div class="secb">
        <div class="field"><span>${l.icon}</span><input id="iicon" placeholder="mdi:lamp" value="${esc(it.icon || '')}"></div>
        ${it.entity_id.startsWith('light.') || it.kind === 'lamp' || ['switch', 'input_boolean'].includes(it.entity_id.split('.')[0]) && it.kind !== 'device' ? `<div class="field"><span>${l.color}</span><div class="row"><input type="color" id="icolor" value="${/^#[0-9a-f]{6}$/i.test(it.color || '') ? it.color : '#f2a541'}" style="flex:none;width:52px;padding:2px"><button id="icolorclr" style="flex:none">${l.no_color}</button></div></div>` : ''}
        <div class="field"><span>${l.i_height}</span><input type="number" id="iheight" min="0" max="6" step="0.1" placeholder="${String(itemHeight({ ...it, height: undefined }, h.states[it.entity_id])).replace('.', ',')}" value="${it.height != null ? it.height : ''}"></div>
        ${it.entity_id.startsWith('light.') ? (() => {
          const area = entityArea(h, it.entity_id);
          const sw = Object.keys(h.states).filter((id) => id.startsWith('switch.')).sort((a, b) => ((entityArea(h, b) === area) - (entityArea(h, a) === area)) || friendly(h, a).localeCompare(friendly(h, b)));
          return `<div class="field"><span>${l.via}</span><select id="ivia"><option value="">${l.none}</option>${sw.map((id) => `<option value="${esc(id)}" ${it.via === id ? 'selected' : ''}>${esc(friendly(h, id))}</option>`).join('')}</select></div><p class="hint">${l.via_hint}</p>`;
        })() : ''}
        </div></details>
        ${(() => {
          const found = it.radar || (it.entity_id.startsWith('binary_sensor.') && radarEntities(h, it.entity_id));
          if (!found) return '';
          const kind = (found.xy || []).length ? l.radar_dots : l.radar_dist;
          return `<label class="row" style="font-size:13px;margin-top:8px"><input type="checkbox" id="iradar" ${it.radar ? 'checked' : ''} style="flex:none">${l.radar} (${kind})</label>
            ${it.radar && !planScale(p) ? `<p class="hint">${l.radar_scale}</p>` : ''}
            ${it.radar ? `<div class="field"><span>${l.radar_height}</span><input type="number" id="iradarh" min="0" max="6" step="0.1" placeholder="${l.radar_wall}" value="${it.radar.height || ''}"></div>` : ''}
            ${it.radar && (it.radar.xy || []).length ? `<div class="field"><span>${l.radar_angle}</span><input type="number" id="iradarangle" step="15" value="${safeNumber(it.radar.angle)}"></div>` : ''}`;
        })()}
        <button class="danger" id="idel" style="margin-top:8px"><ha-icon icon="mdi:map-marker-remove"></ha-icon>${l.remove}</button></div>` : ''}
      <div class="field"><input id="isearch" list="entlist" placeholder="${l.search}"><datalist id="entlist">${Object.keys(h.states).filter((id) => !placed.has(id)).sort().map((id) => `<option value="${id}">${esc(friendly(h, id))}</option>`).join('')}</datalist></div>
      ${groups.length ? `<h3>${l.unplaced}</h3>` : ''}
      ${groups.map(([r, ids]) => `<b style="font-size:13px">${esc(r.name)}</b><div class="list" style="margin-bottom:8px">${ids.map((id) => `<div class="li" data-additem="${esc(id)}" data-room="${esc(r.id)}"><ha-state-icon data-sid="${esc(id)}"></ha-state-icon>${esc(friendly(h, id))}<small>+ ${l.add}</small></div>`).join('')}</div>`).join('')}
      ${this.navHTML()}`;
  }

  sideFinish() {
    const l = this.L, p = this.plan;
    const yaml = `type: custom:floorplan-studio-card\nplan: ${p.id || '<save first>'}\nshow_theme_toggle: true`;
    return `<h2>${l.finish_title}</h2>
      <label class="row" style="font-size:13px;margin-bottom:8px"><input type="checkbox" id="mkhome" checked style="flex:none">${l.make_home}</label>
      <button class="primary" id="mkdash" style="width:100%" ${p.id && !this.dirty ? '' : 'disabled'}><ha-icon icon="mdi:view-dashboard-variant"></ha-icon>${l.make_dash}</button>
      ${p.id && !this.dirty ? '' : `<p class="hint">${l.need_save}</p>`}
      <div id="dashdone"></div>
      <h3>YAML</h3><p>${l.yaml}</p><pre>${esc(yaml)}</pre>
      ${this.navHTML()}`;
  }

  navHTML() {
    const l = this.L;
    return `<div class="nav">${this.step > 0 ? `<button data-step="${this.step - 1}"><ha-icon icon="mdi:chevron-left"></ha-icon>${l.back}</button>` : '<span></span>'}${this.step < 5 ? `<button class="primary" data-step="${this.step + 1}">${l.next}<ha-icon icon="mdi:chevron-right"></ha-icon></button>` : ''}</div>`;
  }

  /* ------------------------------------------------------------ events */
  wire() {
    const $ = (s) => this.shadowRoot.querySelector(s), $$ = (s) => this.shadowRoot.querySelectorAll(s);
    const h = this._hass;
    $('#menu').addEventListener('click', () => this.dispatchEvent(new Event('hass-toggle-menu', { bubbles: true, composed: true })));
    $('#save').addEventListener('click', () => this.save());
    $('#undo').addEventListener('click', () => this.undo());
    $('#import').addEventListener('click', () => $('#importfile').click());
    $('#importfile').addEventListener('change', async (ev) => {
      const f = ev.target.files[0];
      if (!f) return;
      try {
        const data = JSON.parse(await f.text());
        const imported = this.normalizeImportedPlan(data);
        if (this.dirty && !confirm(this.L.confirm_discard)) { ev.target.value = ''; return; }
        // always a new plan: never overwrite an existing one by accident
        this.plan = imported;
        this.history = []; this.sel = null; this.step = 1; this.dirty = true; this.render();
      } catch (e) { alert(`${this.L.import_bad}\n${e.message || e}`); }
    });
    $('#export').addEventListener('click', () => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([JSON.stringify({ ...this.plan, id: undefined }, null, 1)], { type: 'application/json' }));
      a.download = `${(this.plan.name || 'floorplan').replace(/[^\w-]+/g, '_')}.json`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    });
    $('#newplan').addEventListener('click', () => {
      if (this.dirty && !confirm(this.L.confirm_discard)) return;
      this.plan = newPlan(`${this.L.default_name} ${(this.plans?.length || 0) + 1}`); this.history = []; this.sel = null; this.step = 0; this.dirty = true; this.render();
    });
    $('#plansel')?.addEventListener('change', (ev) => {
      const x = this.plans.find((q) => q.id === ev.target.value);
      if (!x) return;
      if (this.dirty && !confirm(this.L.confirm_discard)) { this.render(); return; }
      this.plan = structuredClone(x); this.history = []; this.sel = null; this.dirty = false; this.render();
    });
    $$('[data-step]').forEach((b) => b.addEventListener('click', () => { this.step = +b.dataset.step; this.sel = null; this.render(); }));

    // icons
    $$('ha-state-icon').forEach((ic) => {
      const id = ic.dataset.sid || ic.closest('[data-item]')?.dataset.item;
      if (id && h.states[id]) { ic.hass = h; ic.stateObj = h.states[id]; }
    });

    $('#zoomsel')?.addEventListener('change', (ev) => { this.zoom = ev.target.value || null; this.render(); });
    $('#svg')?.addEventListener('dblclick', (ev) => {
      // double-click a room to zoom in on it, double-click again to see everything
      if (this.step === 2 || (this.step === 1 && this.tool !== 'select')) return;   // there a click already draws or places a door
      const [x, y] = this.pt(ev), r = roomAt(this.plan.rooms, x, y);
      this.zoom = this.zoom ? null : r?.id || null; this.render();
    });
    const step = this.step;
    if (step === 0) this.wireBg($, $$);
    if (step === 1) this.wireRooms($, $$);
    if (step === 2) this.wireDoors($, $$);
    if (step === 3) this.wireItems($, $$);
    if (step === 4) this.wireSettings($, $$);
    if (step === 5) this.wireFinish($, $$);
    if (step >= 4) this.mountPreview($);
    if (step < 4) this.wireCanvas();
  }

  wireBg($, $$) {
    const p = this.plan;
    $('#pname').addEventListener('change', (ev) => this.mut((pl) => { pl.name = ev.target.value; }));
    $('#file').addEventListener('change', async (ev) => { const f = ev.target.files[0]; if (f) this.setBackground(await this.toDataURL(f)); });
    $('#usebgent').addEventListener('click', async () => {
      const id = $('#bgent').value, st = this._hass.states[id];
      if (!st?.attributes.entity_picture) return;
      try {
        const r = await fetch(st.attributes.entity_picture);
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const blob = await r.blob();
        if (blob.type && !blob.type.toLowerCase().startsWith('image/')) throw new Error('The response is not an image.');
        this.setBackground({ ...(await this.toDataURL(blob)), source: id });
      } catch (e) {
        alert(`${this.L.bg_load_failed}\n${e.message || e}`);
      }
    });
    $('#nobg').addEventListener('click', () => { this.mut((pl) => { pl.background = null; }, false); this.step = 1; this.render(); });
    $$('[data-bg]').forEach((el) => el.addEventListener('input', () => {
      const b = p.background, k = el.dataset.bg, v = parseFloat(el.value);
      if (k === 'scale') { const ar = b.h / b.w; b.w = (p.width * v) / 100; b.h = b.w * ar; } else b[k] = v;
      this.dirty = true;
      const img = this.shadowRoot.querySelector('svg image');
      if (img) { img.setAttribute('x', b.x || 0); img.setAttribute('y', b.y || 0); img.setAttribute('width', b.w); img.setAttribute('height', b.h); img.setAttribute('opacity', b.opacity); }
    }));
    $$('[data-bg]').forEach((el) => el.addEventListener('change', () => this.render()));
    $('#fitbg')?.addEventListener('click', () => this.mut((pl) => { const b = pl.background, ar = b.h / b.w; b.x = 0; b.y = 0; b.w = pl.width; b.h = pl.width * ar; if (b.h > pl.height) { b.h = pl.height; b.w = pl.height / ar; } }));
    $('#rmbg')?.addEventListener('click', () => this.mut((pl) => { pl.background = null; }));
    $('#rotl')?.addEventListener('click', () => this.transformBackground('left'));
    $('#rotr')?.addEventListener('click', () => this.transformBackground('right'));
    $('#flipbg')?.addEventListener('click', () => this.transformBackground('flip'));
    $('#pw').addEventListener('change', (ev) => this.mut((pl) => { pl.width = Math.max(200, +ev.target.value || 1000); }));
    $('#ph').addEventListener('change', (ev) => this.mut((pl) => { pl.height = Math.max(200, +ev.target.value || 700); }));
    $('#delplan')?.addEventListener('click', async () => {
      if (!confirm(this.L.confirm_delete)) return;
      await this._hass.connection.sendMessagePromise({ type: 'floorplan_studio/plan/delete', plan_id: p.id });
      await this.removeDashboards(p.id);   // ook het dashboard (en de link in de zijbalk) dat bij deze plattegrond hoort
      this.plans = await loadPlans(this._hass, true);
      window.__fpsPlansRev = (window.__fpsPlansRev || 0) + 1;
      window.dispatchEvent(new CustomEvent('fps-plans-changed'));
      this.plan = this.plans[0] ? structuredClone(this.plans[0]) : newPlan(this.L.default_name);
      this.history = []; this.dirty = !this.plans[0]; this.render();
    });
  }

  async toDataURL(blob, max = 1800) {
    const bmp = await createImageBitmap(blob);
    const s = Math.min(1, max / Math.max(bmp.width, bmp.height));
    const c = document.createElement('canvas');
    c.width = Math.round(bmp.width * s); c.height = Math.round(bmp.height * s);
    c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
    const png = c.toDataURL('image/png');
    const jpg = c.toDataURL('image/jpeg', 0.85);
    return { url: png.length < jpg.length * 1.3 ? png : jpg, w: c.width, h: c.height };
  }

  /** Delete dashboards that were made for a plan (Create dashboard), so no empty link stays in the sidebar. */
  async removeDashboards(planId) {
    const ws = this._hass.connection;
    let dashes = [];
    try { dashes = await ws.sendMessagePromise({ type: 'lovelace/dashboards/list' }); } catch (e) { return; }
    const url = this.dashboardPath(planId);
    for (const d of dashes) {
      if (d.url_path !== url) continue;
      let cfg = null;
      try { cfg = await ws.sendMessagePromise({ type: 'lovelace/config', url_path: d.url_path }); } catch (e) { /* empty */ }
      if (this.dashboardOwnedBy(cfg, planId)) {
        try { await ws.sendMessagePromise({ type: 'lovelace/dashboards/delete', dashboard_id: d.id }); } catch (e) { /* ignore */ }
      }
    }
  }

  dashboardPath(planId) {
    return `floorplan-${String(planId || '').replace(/_/g, '-').slice(0, 40)}`;
  }

  dashboardOwnedBy(config, planId) {
    const seen = new WeakSet();
    const visit = (value) => {
      if (!value || typeof value !== 'object' || seen.has(value)) return false;
      seen.add(value);
      if (value.type === 'custom:floorplan-studio-card' && value.floorplan_studio_managed_plan === planId) return true;
      return Object.values(value).some(visit);
    };
    return visit(config?.config || config) || this.legacyDashboardOwnedBy(config, planId);
  }

  /** v1.2.0 dashboards predate the ownership marker; recognize only the generated page structure. */
  legacyDashboardOwnedBy(config, planId) {
    const root = config?.config || config;
    if (!root || typeof root !== 'object' || !Array.isArray(root.views)) return false;
    const views = root.views;
    const cardsFor = (view) => Array.isArray(view?.cards) ? view.cards : [];
    const coreCard = (view) => {
      const cards = cardsFor(view);
      if (view?.type !== 'panel' || cards.length !== 1) return null;
      const card = cards[0];
      return card?.type === 'custom:floorplan-studio-card' && card.plan === planId && card.room_pages === true ? card : null;
    };
    const matching = (path) => views.filter((view) => view?.path === path);
    const planViews = matching('plan'), kioskViews = matching('kiosk');
    if (planViews.length !== 1 || kioskViews.length !== 1) return false;
    const planCard = coreCard(planViews[0]), kioskCard = coreCard(kioskViews[0]);
    if (planCard?.side !== true || kioskCard?.kiosk !== true) return false;

    const homeViews = matching('thuis');
    if (homeViews.length > 1 || (homeViews.length && coreCard(homeViews[0])?.home !== true)) return false;
    for (const view of views) {
      if (view?.type !== 'panel' || ['plan', 'kiosk', 'thuis'].includes(view.path)) continue;
      if (view?.subview !== true || typeof view.path !== 'string' || !view.path.startsWith('ruimte-') ||
          !['thuis', 'plan'].includes(view.back_path)) return false;
      const roomCard = coreCard(view);
      if (!roomCard || typeof roomCard.room !== 'string' || roomCard.show_theme_toggle !== false) return false;
    }
    return true;
  }

  normalizeImportedPlan(data) {
    const bad = () => new Error(this.L.import_bad);
    const isRecord = (value) => !!value && typeof value === 'object' && !Array.isArray(value);
    const number = (value) => {
      if (typeof value !== 'number' && !(typeof value === 'string' && value.trim())) return NaN;
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : NaN;
    };
    const uniqueId = (value, prefix, index, used) => {
      const base = typeof value === 'string' && value.trim() ? value : `${prefix}-${index + 1}`;
      let id = base, suffix = 2;
      while (used.has(id)) id = `${base}-${suffix++}`;
      used.add(id);
      return id;
    };
    if (!isRecord(data) || !Array.isArray(data.rooms) || (data.openings != null && !Array.isArray(data.openings)) ||
        (data.items != null && !Array.isArray(data.items)) || (data.settings != null && !isRecord(data.settings))) throw bad();

    const usedRoomIds = new Set();
    const rooms = data.rooms.map((room, index) => {
      if (!isRecord(room) || !Array.isArray(room.rects) || !room.rects.length) throw bad();
      const rects = room.rects.map((rect) => {
        if (!Array.isArray(rect) || rect.length !== 4) throw bad();
        const coordinates = rect.map(number);
        if (coordinates.some((coordinate) => !Number.isFinite(coordinate)) || coordinates[0] === coordinates[2] || coordinates[1] === coordinates[3]) throw bad();
        return coordinates;
      });
      const normalized = { ...room, id: uniqueId(room.id, 'room', index, usedRoomIds), name: typeof room.name === 'string' ? room.name : `Room ${index + 1}`, rects };
      if (room.area_id != null && typeof room.area_id !== 'string') delete normalized.area_id;
      if (room.label != null) {
        const x = isRecord(room.label) ? number(room.label.x) : NaN;
        const y = isRecord(room.label) ? number(room.label.y) : NaN;
        if (Number.isFinite(x) && Number.isFinite(y)) normalized.label = { x, y };
        else delete normalized.label;
      }
      if (room.label_scale != null) {
        const scale = number(room.label_scale);
        if (Number.isFinite(scale) && scale > 0) normalized.label_scale = scale;
        else delete normalized.label_scale;
      }
      normalized.label_hidden = room.label_hidden === true;
      return normalized;
    });

    const usedOpeningIds = new Set();
    const openings = (data.openings || []).map((opening, index) => {
      if (!isRecord(opening) || !['door', 'open', 'window'].includes(opening.type)) throw bad();
      const coordinates = ['x1', 'y1', 'x2', 'y2'].map((key) => number(opening[key]));
      if (coordinates.some((coordinate) => !Number.isFinite(coordinate))) throw bad();
      const out = { ...opening, id: uniqueId(opening.id, 'opening', index, usedOpeningIds), type: opening.type, x1: coordinates[0], y1: coordinates[1], x2: coordinates[2], y2: coordinates[3] };
      if (typeof out.entity !== 'string' || out.type === 'open') delete out.entity;
      return out;
    });

    const usedItems = new Set();
    const items = (data.items || []).map((item) => {
      if (!isRecord(item) || typeof item.entity_id !== 'string' || !item.entity_id.trim()) throw bad();
      if (usedItems.has(item.entity_id)) throw bad();
      usedItems.add(item.entity_id);
      const x = number(item.x), y = number(item.y);
      if (!Number.isFinite(x) || !Number.isFinite(y)) throw bad();
      const normalized = { ...item, entity_id: item.entity_id, x, y };
      for (const key of ['name', 'icon']) if (normalized[key] != null && typeof normalized[key] !== 'string') delete normalized[key];
      normalized.pin = item.pin === true;
      normalized.icon_only = item.icon_only === true;
      return normalized;
    });

    const settings = { ...DEFAULT_SETTINGS, ...(data.settings || {}) };
    if (data.settings?.auto_domains != null && (!Array.isArray(data.settings.auto_domains) || data.settings.auto_domains.some((domain) => typeof domain !== 'string'))) throw bad();
    for (const key of ['people', 'side']) if (data.settings?.[key] != null && !isRecord(data.settings[key])) throw bad();
    settings.people = { ...(settings.people || {}) };
    settings.side = { ...(settings.side || {}) };
    settings.people = Object.fromEntries(Object.entries(settings.people).filter(([, sensor]) => typeof sensor === 'string'));
    for (const key of ['buttons', 'status']) {
      if (settings.side[key] != null && (!Array.isArray(settings.side[key]) || settings.side[key].some((value) => typeof value !== 'string'))) throw bad();
    }
    if (settings.side.smart != null && (!Array.isArray(settings.side.smart) || settings.side.smart.some((slot) => !isRecord(slot)))) throw bad();
    if (settings.side.names != null && !isRecord(settings.side.names)) settings.side.names = {};
    settings.auto_domains = Array.isArray(settings.auto_domains) ? settings.auto_domains : [...DEFAULT_SETTINGS.auto_domains];

    const width = Math.min(4000, Math.max(200, safeNumber(data.width, 1000)));
    const height = Math.min(4000, Math.max(200, safeNumber(data.height, 700)));
    const backgroundDimension = (value, fallback) => Math.min(12000, Math.max(0.01, safeNumber(value, fallback)));
    const background = safeImageData(data.background?.url) && isRecord(data.background) ? {
      url: safeImageData(data.background.url), x: safeNumber(data.background.x), y: safeNumber(data.background.y),
      w: backgroundDimension(data.background.w, width), h: backgroundDimension(data.background.h, height),
      opacity: Math.min(1, Math.max(0.1, safeNumber(data.background.opacity, 0.5))),
      ...(typeof data.background.source === 'string' ? { source: data.background.source } : {}),
      ...(Array.isArray(data.background.ops) ? { ops: data.background.ops.filter((op) => ['left', 'right', 'flip'].includes(op)) } : {}),
    } : null;
    return { ...newPlan(typeof data.name === 'string' && data.name.trim() ? data.name : this.L.default_name), id: '', width, height,
      grid: Math.min(100, Math.max(2, safeNumber(data.grid, 10))), background, rooms, openings, items, settings,
      furniture: (Array.isArray(data.furniture) ? data.furniture : []).filter((f) => isRecord(f) && FURN_TYPES[f.type]).map((f, i) => ({
        id: typeof f.id === 'string' ? f.id : `f${i}`, type: f.type, x: safeNumber(f.x), y: safeNumber(f.y), w: Math.max(6, safeNumber(f.w, 100)), h: Math.max(6, safeNumber(f.h, 60)), rot: safeNumber(f.rot), ...(f.z != null && Number.isFinite(+f.z) ? { z: +f.z } : {}) })),
      ...(safeNumber(data.scale) > 0 ? { scale: safeNumber(data.scale) } : {}) };
  }

  /** Rotate the background 90° (or mirror it); the image itself is turned so it stays sharp and saves correctly. */
  async transformBackground(how) {
    const b = this.plan.background;
    if (!safeImageData(b?.url)) return;
    const img = new Image();
    img.src = b.url;
    await img.decode();
    const turn = how !== 'flip';
    const c = document.createElement('canvas');
    c.width = turn ? img.naturalHeight : img.naturalWidth;
    c.height = turn ? img.naturalWidth : img.naturalHeight;
    const g = c.getContext('2d');
    if (how === 'right') { g.translate(c.width, 0); g.rotate(Math.PI / 2); }
    else if (how === 'left') { g.translate(0, c.height); g.rotate(-Math.PI / 2); }
    else { g.translate(c.width, 0); g.scale(-1, 1); }
    g.drawImage(img, 0, 0);
    const url = b.url.startsWith('data:image/jpeg') ? c.toDataURL('image/jpeg', 0.9) : c.toDataURL('image/png');
    this.mut((pl) => {
      const bb = pl.background, cx = (bb.x || 0) + bb.w / 2, cy = (bb.y || 0) + bb.h / 2;
      bb.url = url;
      bb.ops = [...(bb.ops || []), how];   // remembered, so the live vacuum map can be turned the same way
      if (turn) { [bb.w, bb.h] = [bb.h, bb.w]; bb.x = Math.round(cx - bb.w / 2); bb.y = Math.round(cy - bb.h / 2); }
    });
  }

  setBackground({ url, w, h, source = null }) {
    this.mut((pl) => {
      const ar = h / w;
      if (!pl.rooms.length) { pl.width = 1000; pl.height = Math.max(300, Math.round((1000 * ar) / 10) * 10); }
      let bw = pl.width, bh = pl.width * ar;
      if (bh > pl.height) { bh = pl.height; bw = pl.height / ar; }
      pl.background = { url, x: 0, y: 0, w: bw, h: bh, opacity: 0.55, source, ops: [] };
    });
  }

  wireRooms($, $$) {
    $$('[data-tool]').forEach((b) => b.addEventListener('click', () => { this.tool = b.dataset.tool; this.render(); }));
    $$('[data-selroom]').forEach((el) => el.addEventListener('click', () => { this.sel = { type: 'room', id: el.dataset.selroom, part: 0 }; this.tool = 'select'; this.render(); }));
    const r = this.sel?.type === 'room' ? this.room(this.sel.id) : null;
    if (r) {
      $('#rname').addEventListener('change', (ev) => this.mut(() => { r.name = ev.target.value; }));
      $('#rarea').addEventListener('change', (ev) => this.mut(() => {
        r.area_id = ev.target.value || null;
        const a = this._hass.areas?.[r.area_id];
        if (a && (!r.name || r.name.startsWith('Room') || r.name.startsWith('Ruimte'))) r.name = a.name;
      }));
      $('#rtemp')?.addEventListener('change', (ev) => this.mut(() => { r.temperature = ev.target.value || undefined; }));
      $('#rhum')?.addEventListener('change', (ev) => this.mut(() => { r.humidity = ev.target.value || undefined; }));
      $('#rhead')?.addEventListener('change', (ev) => this.mut(() => { r.headline = ev.target.value || undefined; }));
      $('#rfloor')?.addEventListener('change', (ev) => this.mut(() => { r.floor = ev.target.value || undefined; }));
      // fill in the real width or length: that sets the scale for the whole plan, the other side follows from the drawing
      $$('[data-measure]').forEach((el) => el.addEventListener('change', () => this.mut((pl) => {
        const m = parseFloat(String(el.value).replace(',', '.')), [x0, y0, x1, y1] = roomBBox(r);
        const units = el.dataset.measure === 'w' ? x1 - x0 : y1 - y0;
        if (m > 0) pl.scale = Math.round((units / m) * 100) / 100; else delete pl.scale;
      })));
      $$('[data-rinfo]').forEach((el) => el.addEventListener('change', () => this.mut(() => {
        const v = [...this.shadowRoot.querySelectorAll('[data-rinfo]')].map((x) => x.value).filter(Boolean);
        r.info = v.length ? [...new Set(v)] : undefined;
      })));
      $('#rseg')?.addEventListener('change', (ev) => this.mut(() => { r.vacuum_segments = ev.target.value.trim() || undefined; }));
      $('#delroom').addEventListener('click', () => this.deleteSel());
      $$('details.sec').forEach((d) => d.addEventListener('toggle', () => { this._secOpen = this._secOpen || {}; this._secOpen[d.dataset.sec] = d.open; }));
      $('#delpart')?.addEventListener('click', () => this.mut(() => { r.rects.splice(this.sel.part, 1); this.sel.part = 0; }));
    }
    $('#fromareas')?.addEventListener('click', () => this.mut((pl) => {
      const areas = Object.values(this._hass.areas || {}).filter((a) => !pl.rooms.find((x) => x.area_id === a.area_id));
      const cols = Math.ceil(Math.sqrt(areas.length * 1.4)), cw = this.snap((pl.width - 40) / cols), chh = this.snap(Math.min(cw, (pl.height - 40) / Math.ceil(areas.length / cols)));
      areas.forEach((a, i) => {
        const x = 20 + (i % cols) * cw, y = 20 + Math.floor(i / cols) * chh;
        pl.rooms.push({ id: uid('r'), name: a.name, area_id: a.area_id, rects: [[x, y, x + cw - 10, y + chh - 10]] });
      });
      this.tool = 'select';
    }));
  }

  wireDoors($, $$) {
    $$('[data-door]').forEach((b) => b.addEventListener('click', () => { this.doorType = b.dataset.door; this.render(); }));
    $$('[data-addfurn]').forEach((b) => b.addEventListener('click', () => this.mut((pl) => {
      const type = b.dataset.addfurn, d = FURN_TYPES[type], sc = planScale(pl) || 70;   // without a measured room: about 70 units per metre
      const near = this.sel?.type === 'furn' && (pl.furniture || []).find((x) => x.id === this.sel.id);
      const f = { id: uid('f'), type, x: this.snap(near ? near.x + 30 : pl.width / 2), y: this.snap(near ? near.y + 30 : pl.height / 2), w: Math.round((d.w / 100) * sc), h: Math.round((d.h / 100) * sc), rot: 0 };
      pl.furniture = [...(pl.furniture || []), f];
      this.sel = { type: 'furn', id: f.id };
    })));
    const f = this.sel?.type === 'furn' ? (this.plan.furniture || []).find((x) => x.id === this.sel.id) : null;
    if (f) {
      const sc = planScale(this.plan);
      $('#ftype').addEventListener('change', (ev) => this.mut(() => { f.type = ev.target.value; }));
      $$('[data-fdim]').forEach((el) => el.addEventListener('change', () => this.mut(() => {
        const v = parseFloat(el.value);
        if (v > 0) f[el.dataset.fdim] = sc ? Math.round((v / 100) * sc) : v;
      })));
      $('#fz').addEventListener('change', (ev) => this.mut(() => { const v = parseFloat(ev.target.value); if (v >= 0 && ev.target.value !== '') f.z = Math.round(v) / 100; else delete f.z; }));
      $('#fturn').addEventListener('click', () => this.mut(() => { f.rot = ((safeNumber(f.rot) + 90) % 360); }));
      $('#fdel').addEventListener('click', () => this.deleteSel());
    }
    const o = this.sel?.type === 'opening' ? this.plan.openings.find((x) => x.id === this.sel.id) : null;
    if (!o) return;
    $('#otype').addEventListener('change', (ev) => this.mut(() => { o.type = ev.target.value; if (o.type === 'open') delete o.entity; }));
    $('#osensor')?.addEventListener('change', (ev) => this.mut(() => { if (ev.target.value) o.entity = ev.target.value; else delete o.entity; }));
    $('#olen').addEventListener('change', (ev) => this.mut(() => this.resizeOpening(o, +ev.target.value)));
    $('#owhole').addEventListener('click', () => this.mut(() => {
      const w = this.wallOf(o);
      if (w) Object.assign(o, { x1: w.x1, y1: w.y1, x2: w.x2, y2: w.y2 });
    }));
    $('#odel').addEventListener('click', () => this.deleteSel());
  }

  /** Door / window / opening sensors, the ones in a room's area first. */
  openSensors() {
    const h = this._hass, areas = new Set(this.plan.rooms.map((r) => r.area_id).filter(Boolean));
    const ids = Object.keys(h.states).filter((id) => id.startsWith('binary_sensor.') && ['door', 'window', 'opening', 'garage_door'].includes(h.states[id].attributes.device_class));
    const inArea = (id) => areas.has(entityArea(h, id));
    return ids.sort((a, b) => (inArea(b) - inArea(a)) || friendly(h, a).localeCompare(friendly(h, b)));
  }

  wallOf(o) {
    const mx = (o.x1 + o.x2) / 2, my = (o.y1 + o.y2) / 2;
    return nearestWall(computeWalls(this.plan.rooms), mx, my, 3);
  }

  resizeOpening(o, len) {
    const w = this.wallOf(o);
    const h = o.y1 === o.y2, c = h ? (o.x1 + o.x2) / 2 : (o.y1 + o.y2) / 2;
    let a = c - len / 2, b = c + len / 2;
    if (w) { const lo = h ? w.x1 : w.y1, hi = h ? w.x2 : w.y2; a = Math.max(lo, a); b = Math.min(hi, b); }
    if (h) { o.x1 = a; o.x2 = b; } else { o.y1 = a; o.y2 = b; }
  }

  wireItems($, $$) {
    const h = this._hass, p = this.plan;
    $('#autoplace').addEventListener('click', () => this.mut((pl) => this.autoPlace(pl)));
    $$('[data-additem]').forEach((el) => el.addEventListener('click', () => this.mut((pl) => {
      const r = this.room(el.dataset.room), [x0, y0, x1, y1] = roomBBox(r);
      pl.items.push({ entity_id: el.dataset.additem, x: this.snap((x0 + x1) / 2), y: this.snap((y0 + y1) / 2) });
      this.sel = { type: 'item', id: el.dataset.additem };
    })));
    $('#isearch').addEventListener('change', (ev) => {
      const id = ev.target.value.trim();
      if (!h.states[id] || p.items.find((i) => i.entity_id === id)) return;
      const area = entityArea(h, id), r = p.rooms.find((x) => x.area_id && x.area_id === area);
      const [x0, y0, x1, y1] = r ? roomBBox(r) : [0, 0, p.width, p.height];
      this.mut((pl) => { pl.items.push({ entity_id: id, x: this.snap((x0 + x1) / 2), y: this.snap((y0 + y1) / 2) }); this.sel = { type: 'item', id }; });
    });
    const it = this.sel?.type === 'item' ? p.items.find((x) => x.entity_id === this.sel.id) : null;
    if (!it) return;
    $('#iname').addEventListener('change', (ev) => this.mut(() => { it.name = ev.target.value || undefined; }));
    $('#iicon').addEventListener('change', (ev) => this.mut(() => { it.icon = ev.target.value || undefined; }));
    $('#icolor')?.addEventListener('change', (ev) => this.mut(() => { it.color = ev.target.value; }));
    $('#icolorclr')?.addEventListener('click', () => this.mut(() => { delete it.color; }));
    $('#ipin').addEventListener('change', (ev) => this.mut(() => { it.pin = ev.target.checked || undefined; }));
    $('#iheight').addEventListener('change', (ev) => this.mut(() => { const v = parseFloat(String(ev.target.value).replace(',', '.')); if (v >= 0 && ev.target.value !== '') it.height = v; else delete it.height; }));
    $$('details.sec').forEach((d) => d.addEventListener('toggle', () => { this._secOpen = this._secOpen || {}; this._secOpen[d.dataset.sec] = d.open; }));
    $('#ivia')?.addEventListener('change', (ev) => this.mut(() => { it.via = ev.target.value || undefined; }));
    $('#ikind')?.addEventListener('change', (ev) => this.mut(() => { it.kind = ev.target.value || undefined; }));
    $('#iradar')?.addEventListener('change', (ev) => this.mut(() => {
      if (!ev.target.checked) { delete it.radar; return; }
      const r = radarEntities(h, it.entity_id) || {};
      it.radar = { distance: r.distance || '', range: r.range || '', xy: r.xy || [], angle: 0 };
    }));
    $('#iradarh')?.addEventListener('change', (ev) => this.mut(() => { const v = parseFloat(String(ev.target.value).replace(',', '.')); if (v > 0) it.radar.height = v; else delete it.radar.height; }));
    $('#iradarangle')?.addEventListener('change', (ev) => this.mut(() => { it.radar.angle = safeNumber(ev.target.value); }));
    $('#idel').addEventListener('click', () => this.deleteSel());
  }

  autoPlace(pl) {
    const h = this._hass, placed = new Set(pl.items.map((i) => i.entity_id));
    for (const r of pl.rooms) {
      if (!r.area_id) continue;
      const doms = settingsOf(pl).auto_domains;
      const ids = placeCandidates(h, r.area_id).filter((id) => !placed.has(id) && doms.includes(id.split('.')[0]));
      if (!ids.length) continue;
      // spread along the inside of the largest part of the room, away from the label corner
      const q = r.rects.map(norm).sort((a, b) => (b[2] - b[0]) * (b[3] - b[1]) - (a[2] - a[0]) * (a[3] - a[1]))[0];
      const pad = 26, x0 = q[0] + pad, y0 = q[1] + Math.min(110, (q[3] - q[1]) * 0.45), x1 = q[2] - pad, y1 = q[3] - pad;
      const cols = Math.max(1, Math.floor((x1 - x0) / 46) + 1), rows = Math.max(1, Math.ceil(ids.length / cols));
      const dy = rows > 1 ? Math.max(0, (y1 - y0) / (rows - 1)) : 0;
      ids.forEach((id, i) => {
        const c = i % cols, rr = Math.floor(i / cols), n = Math.min(cols, ids.length - rr * cols);
        const dx = n > 1 ? (x1 - x0) / (n - 1) : 0;
        pl.items.push({ entity_id: id, x: Math.round(n > 1 ? x0 + c * dx : (x0 + x1) / 2), y: Math.round(rows > 1 ? y0 + rr * dy : (y0 + y1) / 2) });
        placed.add(id);
      });
    }
  }

  wireFinish($) {
    const p = this.plan;
    $('#mkdash').addEventListener('click', async () => {
      const url = this.dashboardPath(p.id);
      const ws = this._hass.connection;
      const done = $('#dashdone');
      try {
        const dashes = await ws.sendMessagePromise({ type: 'lovelace/dashboards/list' });
        const existing = dashes.find((d) => d.url_path === url);
        if (existing) {
          const config = await ws.sendMessagePromise({ type: 'lovelace/config', url_path: url });
          if (!this.dashboardOwnedBy(config, p.id)) {
            done.textContent = this.L.dash_conflict.replace('{url}', url);
            return;
          }
        } else {
          await ws.sendMessagePromise({ type: 'lovelace/dashboards/create', url_path: url, title: p.name || 'Floorplan', icon: 'mdi:floor-plan', show_in_sidebar: true, require_admin: false, mode: 'storage' });
        }
        const nl = (this._hass.locale?.language || 'en').startsWith('nl');
        await ws.sendMessagePromise({ type: 'lovelace/config/save', url_path: url, config: await buildDashboard(this._hass, p, nl, { home: $('#mkhome')?.checked !== false }) });
        const message = document.createElement('p');
        message.append(document.createTextNode(`${this.L.dash_done} `));
        const planLink = document.createElement('a');
        planLink.href = `/${url}/plan`; planLink.textContent = `/${url}`;
        const kioskLink = document.createElement('a');
        kioskLink.href = `/${url}/kiosk?kiosk`; kioskLink.textContent = `/${url}/kiosk?kiosk`;
        message.append(planLink, document.createTextNode(' · kiosk: '), kioskLink);
        done.replaceChildren(message);
      } catch (e) {
        done.textContent = `${this.L.dash_error}${e.message || e}`;
      }
    });
  }

  mountPreview($) {
    const p = this.plan;
    const card = document.createElement('floorplan-studio-card-impl');
    card.planOverride = p;   // live preview of the unsaved plan and settings
    card.setConfig({ plan: p.id, show_theme_toggle: false });
    card.hass = this._hass;
    this._preview = card;
    $('#preview').appendChild(card);
  }

  sideSettings() {
    const l = this.L, s = settingsOf(this.plan);
    const num = (k, min, max, step = 1) => {
      const value = safeNumber(s[k], safeNumber(DEFAULT_SETTINGS[k]));
      return `<div class="field"><span>${l[k]} (${value})</span><input type="range" min="${min}" max="${max}" step="${step}" value="${value}" data-set="${k}" data-num="1"></div>`;
    };
    const chk = (k) => `<label class="row" style="font-size:13px;margin-bottom:6px"><input type="checkbox" data-set="${k}" ${s[k] ? 'checked' : ''} style="flex:none">${l[k]}</label>`;
    const doms = ['light', 'switch', 'fan', 'cover', 'climate', 'media_player', 'vacuum', 'lock', 'humidifier', 'water_heater', 'valve', 'lawn_mower', 'camera'];
    const ids = Object.keys(this._hass.states).sort();
    const persons = ids.filter((id) => id.startsWith('person.'));
    const sensors = ids.filter((id) => id.startsWith('sensor.') && !this._hass.states[id].attributes.device_class && !this._hass.states[id].attributes.unit_of_measurement);
    const vacs = ids.filter((id) => id.startsWith('vacuum.'));
    const selects = ids.filter((id) => id.startsWith('input_select.') || id.startsWith('select.'));
    const side = s.side || {};
    const power = ids.filter((id) => id.startsWith('sensor.') && this._hass.states[id].attributes.device_class === 'power');
    const optsOf = (list, cur, first) => `<option value="">${first}</option>` + list.map((id) => `<option value="${id}" ${cur === id ? 'selected' : ''}>${esc(friendly(this._hass, id))}</option>`).join('');
    const sideSel = (k, list, first = l.auto) => `<div class="field"><span>${l['s_' + k]}</span><select data-side="${k}">${optsOf(list, side[k], first)}</select></div>`;
    const maps = ids.filter((id) => id.startsWith('image.') || id.startsWith('camera.'));
    // short and simple: sections fold open on demand, and settings only show when they matter
    this._secOpen = this._secOpen || { look: true };
    const sec = (id, title, body) => (body.trim() ? `<details class="sec" data-sec="${id}" ${this._secOpen[id] ? 'open' : ''}><summary>${title}</summary><div class="secb">${body}</div></details>` : '');
    const sel = (k, opts, cur) => `<div class="field"><span>${l[k]}</span><select data-set="${k}">${opts.map(([v, t]) => `<option value="${v}" ${cur === v ? 'selected' : ''}>${t}</option>`).join('')}</select></div>`;
    const sunTheme = ['sun', 'auto'].includes(s.theme) || !!s.theme_entity;
    const smartSlots = [0, 1, 2, 3].map((i) => { const x = side.smart?.[i] || {}; const acts = ids.filter((id) => /^(script|scene|automation|button|input_button)\./.test(id));
        return `<div class="card" data-slot="${i}" style="padding:8px 10px;margin-bottom:6px">
          <div class="row"><input data-k="from" placeholder="${l.from} 06:00" value="${esc(x.from || '')}" style="max-width:110px"><input data-k="name" placeholder="${l.slot_name}" value="${esc(x.name || '')}"></div>
          <div class="row" style="margin-top:4px"><select data-k="action">${optsOf(acts, x.action, l.lights_off)}</select><input data-k="sub" placeholder="${l.slot_sub}" value="${esc(x.sub || '')}"></div>
          <div style="font-size:12px;margin:6px 0 2px;opacity:.8">${l.slot_on}</div>
          <div class="row"><input data-k="name_on" placeholder="${l.slot_name}" value="${esc(x.name_on || '')}"><input data-k="sub_on" placeholder="${l.slot_sub}" value="${esc(x.sub_on || '')}"></div>
          <div class="row" style="margin-top:4px"><select data-k="action_on">${optsOf(acts, x.action_on, l.slot_action + ': ' + l.same)}</select></div></div>`; }).join('');
    const smartUsed = (side.smart || []).some((x) => x && (x.name || x.action || x.from));
    return `<h2>${l.set_title}</h2><p>${l.set_intro}</p>
      ${sec('look', l.set_look, `
        <div class="field"><span>${l.theme}</span><select data-set="theme">${Object.entries(THEMES).map(([k, v]) => `<option value="${k}" ${s.theme === k ? 'selected' : ''}>${v.label}</option>`).join('')}</select></div>
        <div class="field"><span>${l.theme_entity}</span><div class="row"><select data-set="theme_entity"><option value="">${l.own_choice}</option>${selects.map((id) => `<option value="${id}" ${s.theme_entity === id ? 'selected' : ''}>${esc(friendly(this._hass, id))}</option>`).join('')}</select>${selects.length ? '' : `<button id="mkhelper" style="flex:none">${l.make_helper}</button>`}</div></div>
        ${s.theme_entity ? '' : `<p class="hint">${l.theme_entity_hint}</p>`}
        ${num('plan_size', 50, 100, 5)}${num('icon_size', 60, 180, 5)}${num('lamp_size', 50, 200, 5)}${num('device_size', 50, 200, 5)}${num('label_size', 60, 180, 5)}`)}
      ${sec('light', l.set_light, `
        ${sel('glow_style', ['lamp', 'room', 'off'].map((k) => [k, l['glow_' + k]]), s.glow_style)}
        ${s.glow_style !== 'off' ? num('glow', 0, 150, 5) : ''}
        ${sel('lamp_level', ['fixed', 'hover', 'off'].map((k) => [k, l['lvl_' + k]]), levelMode(s))}`)}
      ${sec('room', l.set_room, `${chk('show_temp')}${chk('show_hum')}${chk('show_lights')}${chk('show_co2')}${chk('show_covers')}${chk('show_climate')}${chk('show_media')}${chk('show_tags')}${num('info_rows', 1, 8)}${chk('greeting')}
        <div class="field"><span>${l.compass}</span><input type="number" min="0" max="359" id="compass" value="${s.compass == null || s.compass === '' ? '' : safeNumber(s.compass, '')}"></div>`)}
      ${sec('screens', l.set_screens, `
        ${sel('compact', ['auto', 'on', 'off'].map((k) => [k, l['cmp_' + k]]), s.compact || 'auto')}
        ${(s.compact || 'auto') === 'auto' ? num('compact_width', 320, 1200, 20) : ''}
        <div class="field"><span>${l.height_25d}</span><select id="h25mode"><option value="real" ${s.height_25d === 'real' ? 'selected' : ''}>${l.h25_real}</option><option value="custom" ${s.height_25d !== 'real' ? 'selected' : ''}>${l.h25_custom}</option></select></div>
        ${s.height_25d !== 'real' ? num('height_25d', 30, 150, 5) : ''}${chk('perspective')}${chk('show_stalks')}<p class="hint">${l.turn_hint}</p>`)}
      ${sec('tap', l.set_behaviour, `${chk('tap_zoom')}
        ${s.tap_zoom ? sel('room_tap', [['zoom', l.tap_zoom_opt], ['page', l.tap_page_opt]], s.room_tap === 'page' ? 'page' : 'zoom') : ''}
        ${sel('hold_action', [['quick', l.hold_quick], ['more-info', l.hold_more]], s.hold_action === 'more-info' ? 'more-info' : 'quick')}
        ${num('hold_ms', 250, 1500, 50)}`)}
      ${sec('simple', l.set_simple, `${sel('default_mode', [['all', l.all], ['simple', l.simple]], s.default_mode === 'simple' ? 'simple' : 'all')}${num('usage_days', 1, 60)}${num('learning_days', 0, 14)}`)}
      ${sunTheme ? sec('sun', l.set_sun, `${num('sun_before', 0, 120, 5)}${num('sun_ramp', 15, 240, 5)}`) : ''}
      ${sec('temp', l.set_temp, `${chk('temp_color')}${num('temp_min', 10, 22, 0.5)}${num('temp_max', 18, 30, 0.5)}`)}
      ${sec('presence', l.set_presence, `${chk('presence')}
        ${s.presence ? `${num('motion_fade', 0, 30, 1)}
        ${persons.length ? `<p class="hint">${l.people_hint}</p>${persons.map((pid) => `<div class="field"><span>${esc(friendly(this._hass, pid))}</span><select data-person="${pid}"><option value="">${l.none}</option>${sensors.map((id) => `<option value="${id}" ${s.people?.[pid] === id ? 'selected' : ''}>${esc(friendly(this._hass, id))}</option>`).join('')}</select></div>`).join('')}` : ''}` : ''}`)}
      ${sec('alerts', l.set_alerts, `${chk('alerts')}${chk('alert_open')}`)}
      ${vacs.length ? sec('vacuum', l.set_vacuum, `
        <div class="field"><span>${l.vacuum}</span><select data-set="vacuum"><option value="">${l.auto} (${l.first_on_plan})</option>${vacs.map((id) => `<option value="${id}" ${s.vacuum === id ? 'selected' : ''}>${esc(friendly(this._hass, id))}</option>`).join('')}</select></div>
        ${sel('vacuum_live', ['cleaning', 'always', 'off'].map((k) => [k, l['live_' + k]]), s.vacuum_live)}
        ${s.vacuum_live !== 'off' ? `${sel('vacuum_show', ['robot', 'map', 'both'].map((k) => [k, l['vshow_' + k]]), s.vacuum_show || 'robot')}
        ${(s.vacuum_show || 'robot') !== 'robot' ? `<div class="field"><span>${l.vacuum_map}</span><select data-set="vacuum_map"><option value="">${l.auto} (${l.from_bg}${this.plan.background?.source ? ': ' + esc(friendly(this._hass, this.plan.background.source)) : ''})</option>${maps.map((id) => `<option value="${id}" ${s.vacuum_map === id ? 'selected' : ''}>${esc(friendly(this._hass, id))}</option>`).join('')}</select></div>
        <p class="hint">${l.vacuum_map_hint}</p>${num('vacuum_opacity', 0.2, 1, 0.05)}` : ''}` : ''}`) : ''}
      ${sec('side', l.set_side, `<p class="hint">${l.side_hint}</p>
        ${sideSel('weather', ids.filter((id) => id.startsWith('weather.')))}
        ${sideSel('main', ids.filter((id) => /^(script|scene)\./.test(id)), l.s_main_auto)}
        <div class="field"><span>${l.s_buttons}</span>${[0, 1, 2].map((i) => `<select data-sidelist="buttons" style="margin-bottom:4px">${optsOf(ids.filter((id) => /^(script|scene|input_button|button|switch|light)\./.test(id)), side.buttons?.[i], l.none)}</select>`).join('')}</div>
        ${sideSel('solar', power)}${sideSel('grid', power)}${sideSel('grid_return', power)}
        ${sideSel('price', ids.filter((id) => id.startsWith('sensor.') && /\/kwh/i.test(this._hass.states[id].attributes.unit_of_measurement || '')))}
        ${sideSel('solar_today', ids.filter((id) => id.startsWith('sensor.') && this._hass.states[id].attributes.device_class === 'energy'))}
        <div class="field"><span>${l.s_status}</span>${[0, 1, 2, 3, 4].map((i) => `<select data-sidelist="status" style="margin-bottom:4px">${optsOf(ids.filter((id) => !id.startsWith('sun.') && !id.startsWith('zone.')), side.status?.[i], l.none)}</select>`).join('')}</div>
        <details class="sec sub" data-sec="smart" ${this._secOpen.smart || smartUsed ? 'open' : ''}><summary>${l.smart}</summary><div class="secb"><p class="hint">${l.smart_hint}</p>${smartSlots}
          <div class="field"><span>${l.smart_on}</span><select data-side="smart_on">${optsOf(ids.filter((id) => /^(light|switch|input_boolean|binary_sensor|group)\./.test(id)), side.smart_on, l.any_lamp)}</select></div></div></details>`)}
      ${sec('auto', l.set_auto, `<p class="hint">${l.auto_domains}</p>
        <div class="row" style="flex-wrap:wrap;gap:6px 14px">${doms.map((d) => `<label style="flex:none;font-size:13px"><input type="checkbox" data-dom="${d}" ${s.auto_domains.includes(d) ? 'checked' : ''}> ${d}</label>`).join('')}</div>`)}
      <button id="setreset" style="margin-top:14px"><ha-icon icon="mdi:restore"></ha-icon>${l.reset}</button>
      ${this.navHTML()}`;
  }

  wireSettings($, $$) {
    const set = (k, v) => this.mut((pl) => { pl.settings = { ...settingsOf(pl), [k]: v }; });
    $$('[data-set]').forEach((el) => el.addEventListener('change', () => {
      const k = el.dataset.set;
      set(k, el.type === 'checkbox' ? el.checked : el.dataset.num ? +el.value : el.value);
    }));
    $('#h25mode')?.addEventListener('change', (ev) => set('height_25d', ev.target.value === 'real' ? 'real' : 80));
    $$('details.sec').forEach((d) => d.addEventListener('toggle', () => { this._secOpen[d.dataset.sec] = d.open; }));
    $$('[data-side]').forEach((el) => el.addEventListener('change', () => set('side', { ...(settingsOf(this.plan).side || {}), [el.dataset.side]: el.value || undefined })));
    $$('[data-sidelist]').forEach((el) => el.addEventListener('change', () => {
      const k = el.dataset.sidelist;
      const v = [...this.shadowRoot.querySelectorAll(`[data-sidelist="${k}"]`)].map((x) => x.value).filter(Boolean);
      set('side', { ...(settingsOf(this.plan).side || {}), [k]: v.length ? [...new Set(v)] : undefined });
    }));
    $$('[data-slot] [data-k]').forEach((el) => el.addEventListener('change', () => {
      const slots = [...this.shadowRoot.querySelectorAll('[data-slot]')].map((c) => Object.fromEntries([...c.querySelectorAll('[data-k]')].map((x) => [x.dataset.k, x.value.trim()]).filter(([, v]) => v)))
        .filter((x) => Object.keys(x).length);   // keep half-filled slots while typing; the card skips incomplete ones
      set('side', { ...(settingsOf(this.plan).side || {}), smart: slots.length ? slots : undefined });
    }));
    $('#compass')?.addEventListener('change', (ev) => set('compass', ev.target.value === '' ? null : +ev.target.value));
    $$('[data-person]').forEach((el) => el.addEventListener('change', () => {
      const people = { ...(settingsOf(this.plan).people || {}) };
      if (el.value) people[el.dataset.person] = el.value; else delete people[el.dataset.person];
      set('people', people);
    }));
    $$('[data-dom]').forEach((el) => el.addEventListener('change', () => {
      const cur = new Set(settingsOf(this.plan).auto_domains);
      if (el.checked) cur.add(el.dataset.dom); else cur.delete(el.dataset.dom);
      set('auto_domains', [...cur]);
    }));
    $('#mkhelper')?.addEventListener('click', async () => {
      try {
        const r = await this._hass.connection.sendMessagePromise({ type: 'input_select/create', name: 'Floorplan thema', icon: 'mdi:palette', options: Object.values(THEMES).map((t) => t.label) });
        const id = `input_select.${r.id}`;
        await new Promise((res) => setTimeout(res, 600));
        set('theme_entity', id);
      } catch (e) { alert(e.message || e); }
    });
    $('#setreset').addEventListener('click', () => this.mut((pl) => { pl.settings = { ...DEFAULT_SETTINGS }; }));
  }

  deleteSel() {
    const s = this.sel;
    if (!s) return;
    this.mut((pl) => {
      if (s.type === 'room') { pl.rooms = pl.rooms.filter((r) => r.id !== s.id); }
      if (s.type === 'opening') pl.openings = pl.openings.filter((o) => o.id !== s.id);
      if (s.type === 'item') pl.items = pl.items.filter((i) => i.entity_id !== s.id);
      if (s.type === 'furn') pl.furniture = (pl.furniture || []).filter((f) => f.id !== s.id);
    });
    this.sel = null;
    this.render();
  }

  /* ------------------------------------------------------- canvas input */
  pt(ev) {
    const svg = this.shadowRoot.getElementById('svg');
    const m = svg.getScreenCTM().inverse();
    const p = new DOMPoint(ev.clientX, ev.clientY).matrixTransform(m);
    return [p.x, p.y];
  }

  wireCanvas() {
    const svg = this.shadowRoot.getElementById('svg');
    const draft = this.shadowRoot.getElementById('draft');
    if (!svg) return;
    const p = this.plan;

    // items (step 4)
    this.shadowRoot.querySelectorAll('.it').forEach((el) => {
      el.addEventListener('pointerdown', (ev) => {
        if (this.step !== 3) return;
        ev.stopPropagation(); ev.preventDefault();
        const it = p.items.find((i) => i.entity_id === el.dataset.item);
        const before = JSON.stringify(p);
        el.setPointerCapture(ev.pointerId);
        const canvas = this.shadowRoot.getElementById('canvas').getBoundingClientRect(), [vx, vy, vw, vh] = this.viewBox();
        const move = (e) => {
          it.x = Math.round(Math.max(0, Math.min(p.width, vx + ((e.clientX - canvas.left) / canvas.width) * vw)));
          it.y = Math.round(Math.max(0, Math.min(p.height, vy + ((e.clientY - canvas.top) / canvas.height) * vh)));
          el.style.left = `${((it.x - vx) / vw) * 100}%`; el.style.top = `${((it.y - vy) / vh) * 100}%`;
        };
        const up = () => {
          el.removeEventListener('pointermove', move); el.removeEventListener('pointerup', up);
          if (JSON.stringify(p) !== before) { this.history.push(before); this.dirty = true; }
          this.sel = { type: 'item', id: it.entity_id };
          this.render();
        };
        el.addEventListener('pointermove', move); el.addEventListener('pointerup', up);
      });
    });

    svg.addEventListener('pointerdown', (ev) => {
      const tgt = ev.target, [x, y] = this.pt(ev);
      if (this.step === 1) this.roomsPointer(ev, tgt, x, y, svg, draft);
      else if (this.step === 2) this.doorsPointer(tgt, x, y, ev, svg);
      else if (this.step === 3 && this.sel) { this.sel = null; this.render(); }
    });
  }

  roomsPointer(ev, tgt, x, y, svg, draft) {
    const p = this.plan;
    if (tgt.dataset.handle) return this.dragHandle(ev, tgt.dataset.handle, svg);
    if (this.tool === 'select') {
      if (!tgt.dataset.room) { this.sel = null; this.render(); return; }
      const r = this.room(tgt.dataset.room), part = +tgt.dataset.part;
      this.sel = { type: 'room', id: r.id, part };
      // drag to move this part
      const q = r.rects[part], start = [x, y], orig = [...q], before = JSON.stringify(p);
      svg.setPointerCapture(ev.pointerId);
      let moved = false;
      const move = (e) => {
        const [mx, my] = this.pt(e), dx = this.snap(mx - start[0]), dy = this.snap(my - start[1]);
        if (dx || dy) moved = true;
        r.rects[part] = [orig[0] + dx, orig[1] + dy, orig[2] + dx, orig[3] + dy];
        tgt.setAttribute('x', Math.min(r.rects[part][0], r.rects[part][2])); tgt.setAttribute('y', Math.min(r.rects[part][1], r.rects[part][3]));
      };
      const up = () => {
        svg.removeEventListener('pointermove', move); svg.removeEventListener('pointerup', up);
        if (moved) { this.history.push(before); this.dirty = true; }
        this.render();
      };
      svg.addEventListener('pointermove', move); svg.addEventListener('pointerup', up);
      return;
    }
    // draw a new room / part
    const sx = this.snap(x), sy = this.snap(y);
    svg.setPointerCapture(ev.pointerId);
    let ex = sx, ey = sy;
    const move = (e) => {
      const [mx, my] = this.pt(e); ex = this.snap(mx); ey = this.snap(my);
      draft.setAttribute('x', Math.min(sx, ex)); draft.setAttribute('y', Math.min(sy, ey));
      draft.setAttribute('width', Math.abs(ex - sx)); draft.setAttribute('height', Math.abs(ey - sy));
    };
    const up = () => {
      svg.removeEventListener('pointermove', move); svg.removeEventListener('pointerup', up);
      const g = p.grid || 10;
      if (Math.abs(ex - sx) < g * 2 || Math.abs(ey - sy) < g * 2) {
        // a click: select whatever is under it
        const r = roomAt(p.rooms, x, y);
        this.sel = r ? { type: 'room', id: r.id, part: 0 } : null;
        this.render();
        return;
      }
      const rect = norm([sx, sy, ex, ey]);
      this.mut((pl) => {
        if (this.tool === 'part' && this.sel?.type === 'room') {
          const r = pl.rooms.find((q) => q.id === this.sel.id);
          r.rects.push(rect); this.sel.part = r.rects.length - 1;
        } else {
          const r = { id: uid('r'), name: `${this.L.room} ${pl.rooms.length + 1}`, area_id: null, rects: [rect] };
          pl.rooms.push(r); this.sel = { type: 'room', id: r.id, part: 0 };
        }
      });
    };
    svg.addEventListener('pointermove', move); svg.addEventListener('pointerup', up);
  }

  dragHandle(ev, corner, svg) {
    const r = this.room(this.sel.id), part = this.sel.part, before = JSON.stringify(this.plan);
    svg.setPointerCapture(ev.pointerId);
    const move = (e) => {
      const [mx, my] = this.pt(e), q = norm(r.rects[part]);
      const sx = this.snap(mx), sy = this.snap(my);
      if (corner.includes('w')) q[0] = Math.min(sx, q[2] - 20); else q[2] = Math.max(sx, q[0] + 20);
      if (corner.includes('n')) q[1] = Math.min(sy, q[3] - 20); else q[3] = Math.max(sy, q[1] + 20);
      r.rects[part] = q;
      const el = [...this.shadowRoot.querySelectorAll('.rect')].find((node) => node.dataset.room === r.id && +node.dataset.part === part);
      el.setAttribute('x', q[0]); el.setAttribute('y', q[1]); el.setAttribute('width', q[2] - q[0]); el.setAttribute('height', q[3] - q[1]);
    };
    const up = () => {
      svg.removeEventListener('pointermove', move); svg.removeEventListener('pointerup', up);
      this.history.push(before); this.dirty = true; this.render();
    };
    svg.addEventListener('pointermove', move); svg.addEventListener('pointerup', up);
  }

  doorsPointer(tgt, x, y, ev, svg) {
    const p = this.plan;
    if (tgt.dataset.op) { this.sel = { type: 'opening', id: tgt.dataset.op }; this.render(); return; }
    const fe = tgt.closest?.('[data-furn]');
    if (fe) {
      // drag a piece of furniture around
      const f = (p.furniture || []).find((q) => q.id === fe.dataset.furn);
      if (!f) return;
      const before = JSON.stringify(p), ox = f.x - x, oy = f.y - y, g = fe.firstElementChild;
      let moved = false;
      svg.setPointerCapture(ev.pointerId);
      const move = (e) => {
        const [mx, my] = this.pt(e), nx = this.snap(mx + ox), ny = this.snap(my + oy);
        if (nx !== f.x || ny !== f.y) moved = true;
        f.x = nx; f.y = ny;
        g.setAttribute('transform', `translate(${f.x} ${f.y}) rotate(${safeNumber(f.rot)})`);
      };
      const up = () => {
        svg.removeEventListener('pointermove', move); svg.removeEventListener('pointerup', up);
        if (moved) { this.history.push(before); this.dirty = true; }
        this.sel = { type: 'furn', id: f.id };
        this.render();
      };
      svg.addEventListener('pointermove', move); svg.addEventListener('pointerup', up);
      return;
    }
    const w = nearestWall(computeWalls(p.rooms), x, y, 20);
    if (!w) { this.sel = null; this.render(); return; }
    const hor = w.dir === 'h', len = this.doorType === 'door' ? 80 : 160;
    const lo = hor ? w.x1 : w.y1, hi = hor ? w.x2 : w.y2;
    const c = Math.max(lo + Math.min(len, hi - lo) / 2, Math.min(hi - Math.min(len, hi - lo) / 2, this.snap(hor ? x : y)));
    const a = Math.max(lo, c - len / 2), b = Math.min(hi, c + len / 2);
    const o = hor ? { x1: a, y1: w.y1, x2: b, y2: w.y1 } : { x1: w.x1, y1: a, x2: w.x1, y2: b };
    this.mut((pl) => { const id = uid('o'); pl.openings.push({ id, type: this.doorType, ...o }); this.sel = { type: 'opening', id }; });
  }
}

if (!customElements.get('floorplan-studio-panel')) customElements.define('floorplan-studio-panel', FloorplanStudioPanel);
console.info(`%c FLOORPLAN-STUDIO PANEL %c ${VERSION} `, 'background:#f2a541;color:#111;font-weight:700', 'background:#151b24;color:#eee');
