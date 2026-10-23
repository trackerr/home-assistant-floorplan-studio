// Floorplan Studio – editor panel (sidebar → Floorplan).
import './floorplan-studio-card.js?v=1.0.4';
import {
  VERSION, THEMES, themeStyle, computeWalls, nearestWall, norm, roomBBox, roomAt, areaEntities, entityArea,
  PLACE_DOMAINS, placeCandidates, friendly, newPlan, DEFAULT_SETTINGS, settingsOf, levelMode, loadPlans, savePlan, esc,
} from './fps-core.js?v=1.0.4';
import { buildDashboard } from './fps-dashboard.js?v=1.0.4';

const L = {
  en: {
    steps: ['Background', 'Rooms', 'Doors', 'Devices', 'Settings', 'Finish'],
    save: 'Save', saved: 'Saved ✓', unsaved: 'Unsaved changes', new_plan: 'New floorplan', delete_plan: 'Delete floorplan', undo: 'Undo',
    confirm_delete: 'Delete this floorplan and its dashboard? This cannot be undone.', plan_name: 'Name', size: 'Canvas size (width × height)',
    bg_title: 'Where does your floorplan come from?', bg_upload: 'Upload an image', bg_upload_hint: 'A drawing, a photo of the building plan, a screenshot of your vacuum app…',
    bg_entity: 'Vacuum map or camera', bg_entity_hint: 'Uses the current map image of e.g. Roborock, Valetudo or Xiaomi Cloud Map Extractor.', use: 'Use',
    bg_none: 'Draw from scratch', bg_none_hint: 'No background – just draw rooms on the grid.', opacity: 'Opacity', scale: 'Scale', offx: 'Shift left/right', offy: 'Shift up/down',
    fit: 'Fit to canvas', rotate: 'Rotate', rot_l: '90° left', rot_r: '90° right', flip: 'Mirror', remove_bg: 'Remove background', next: 'Next', back: 'Back',
    bg_tip: 'Tip: the background is only a guide for tracing. It is not shown on the dashboard.',
    rooms_title: 'Draw your rooms', tool_select: 'Select / move', tool_draw: 'Draw room', tool_part: 'Add part to room',
    rooms_tip: 'Drag a rectangle for each room. For L-shaped rooms select the room and use “Add part to room”. Walls appear automatically where rooms touch; where a room borders nothing you get an outer wall.',
    from_areas: 'Create rooms from my areas', room: 'Room', area: 'Home Assistant area', none: '— none —', temp_sensor: 'Temperature sensor', hum_sensor: 'Humidity sensor', auto: 'automatic',
    delete_room: 'Delete room', delete_part: 'Delete this part', rooms_list: 'Rooms', no_rooms: 'No rooms yet.',
    doors_title: 'Doors and openings', door: 'Door', opening: 'Open passage', doors_tip: 'Choose a type and click on a wall. A door shows small jambs; an open passage removes the wall (e.g. open kitchen).',
    length: 'Width', whole: 'Whole wall', delete: 'Delete', no_walls: 'Draw rooms first – walls are created from them.',
    items_title: 'Devices on the map', auto_place: 'Place everything automatically', auto_hint: 'Lights, switches, climate, covers, media players… from the area linked to each room.',
    unplaced: 'Not on the map yet', add: 'Add', search: 'Search any entity…', item: 'Device', show_always: 'Always show (also in Simple mode)', color: 'Glow colour (for plugs/switches with a coloured lamp)', no_color: 'automatic', icon: 'Icon (optional)', label: 'Name (optional)',
    remove: 'Remove from map', items_tip: 'Drag icons to the right spot. On the dashboard: tap = on/off, hold = details.',
    finish_title: 'Ready!', theme: 'Theme', usage_days: 'Simple mode: show what was used in the last … days', make_dash: 'Create dashboard (Home · Floorplan · Kiosk · Energy · Outside · TV + a page per room)', dash_done: 'Dashboard created:', open: 'Open',
    set_title: 'Settings', set_intro: 'These are the defaults for every card that shows this floorplan. A card can still override them in its own options.',
    set_look: 'Look', set_simple: 'Simple mode', set_room: 'Room text', set_behaviour: 'Behaviour', set_sun: 'Automatic (sun)', set_auto: 'Place automatically',
    default_mode: 'Default view', learning_days: 'Show everything until … days of history exist', plan_size: 'Floor plan size (%)', icon_size: 'Icon size', label_size: 'Room text size', glow: 'Glow strength',
    show_temp: 'Temperature', show_hum: 'Humidity', show_lights: 'Lights on (count)', show_tags: 'State labels under devices (21°, open…)',
    tap_zoom: 'Tap a room to zoom in', hold_ms: 'Hold time for details (ms)', sun_before: 'Starts getting light … minutes before sunrise', sun_ramp: 'Transition takes … minutes',
    auto_domains: 'Which kinds of devices', reset: 'Reset to defaults', simple: 'Simple', all: 'All',
    theme_entity: 'Theme for the whole house (helper)', theme_entity_hint: 'Pick a dropdown helper: every screen then follows the same theme, and automations can switch it.', make_helper: 'Create helper', own_choice: 'each device chooses',
    headline: 'Big value', headline_auto: 'temperature', extra_rows: 'Extra rows in the text block', floor: 'Floor', floor_plain: 'plain', floor_tiles: 'tiles', floor_wood: 'wood',
    set_text: 'Text block and light', glow_style: 'Light', glow_lamp: 'soft pool of light per lamp', glow_room: 'whole room glows', glow_off: 'no glow', lamp_level: 'How bright a lamp is', lvl_fixed: 'always under the lamp', lvl_hover: 'only when pointing at it', lvl_off: 'do not show',
    show_co2: 'CO2', show_covers: 'Curtains / shutters', show_climate: 'Heating / air conditioning', show_media: 'What is playing', info_rows: 'Maximum number of rows',
    compass: 'Compass (degrees, empty = none)', greeting: 'Greeting + who is home (with side column)',
    set_side: 'Side column', side_hint: 'Shown when the card has “side: true” (Create dashboard does that). Empty = chosen automatically.',
    s_weather: 'Weather', s_main: 'Big button', s_main_auto: 'all lights on the plan off', s_buttons: 'Buttons (scenes / scripts)', s_solar: 'Solar now (W)',
    smart: 'Smart button', smart_hint: 'Give the big button its own name and action per part of the day (e.g. Good morning, Coming home, Bedtime). Start: a time (06:30) or sunrise / sunset, optionally with minutes added or taken off (sunset-30). Empty = the normal button above.',
    from: 'From', slot_name: 'Name', slot_action: 'Does', slot_sub: 'Caption', slot_on: 'While a light is on', same: 'the same', smart_on: 'What counts as “light on”', any_lamp: 'a lamp on the plan', lights_off: 'lights off',
    s_grid: 'Power from the grid (W)', s_grid_return: 'Power returned (W)', s_price: 'Electricity price', s_solar_today: 'Solar today (kWh)', s_status: 'Status list',
    import: 'Import floorplan (JSON)', export: 'Export floorplan (JSON)', import_bad: 'This is not a Floorplan Studio file.',
    room_tap: 'Tap on a room', tap_zoom_opt: 'Zoom in on the card', tap_page_opt: 'Open the room’s own page (created dashboards)', make_home: 'With a “Home” start page (a card per room)',
    set_temp: 'Temperature colours', temp_color: 'Colour rooms by temperature by default (also on/off with the thermometer button)', temp_min: 'Blue at … °C or colder', temp_max: 'Red at … °C or warmer',
    set_presence: 'Presence', presence: 'Show a dot when someone is in the room (motion, presence and occupancy sensors in the area)',
    people_hint: 'Track people per room? Pick, per person, the sensor that reports the room (e.g. Bermuda or ESPresense). Its value must be the room or area name.',
    set_alerts: 'Alerts', alerts: 'Smoke, gas, carbon monoxide and water leak: the room flashes red + a banner on top', alert_open: 'Open doors and windows: orange edge',
    set_vacuum: 'Vacuum', vacuum: 'Vacuum', vacuum_live: 'Live map over the floorplan', live_cleaning: 'Only while cleaning', live_always: 'Always', live_off: 'Off',
    vacuum_map: 'Map entity', vacuum_map_hint: 'The live map only lines up when your background (step 1) came from the same map. Rotating and mirroring are applied automatically.',
    vacuum_show: 'What you see while it cleans', vshow_robot: 'only the robot driving over your plan (with a trail)', vshow_map: 'the vacuum\'s own map', vshow_both: 'both',
    vacuum_opacity: 'Live map opacity', first_on_plan: 'first one on the plan', from_bg: 'the background one',
    segments: 'Vacuum segments (only if your HA has no “clean by area”)', segments_hint: 'e.g. 16 or 16,17',
    yaml: 'Or add the card to any dashboard:', preview: 'Preview', need_save: 'Save first.', loading: 'Loading…', default_name: 'Home',
  },
  nl: {
    steps: ['Achtergrond', 'Ruimtes', 'Deuren', 'Apparaten', 'Instellingen', 'Klaar'],
    save: 'Opslaan', saved: 'Opgeslagen ✓', unsaved: 'Niet opgeslagen', new_plan: 'Nieuwe plattegrond', delete_plan: 'Plattegrond verwijderen', undo: 'Ongedaan maken',
    confirm_delete: 'Deze plattegrond en het bijbehorende dashboard verwijderen? Dit kan niet ongedaan worden.', plan_name: 'Naam', size: 'Tekenvlak (breedte × hoogte)',
    bg_title: 'Waar komt je plattegrond vandaan?', bg_upload: 'Afbeelding uploaden', bg_upload_hint: 'Een tekening, foto van de bouwtekening, screenshot uit je stofzuiger-app…',
    bg_entity: 'Stofzuigerkaart of camera', bg_entity_hint: 'Gebruikt het actuele kaartbeeld van bv. Roborock, Valetudo of Xiaomi Cloud Map Extractor.', use: 'Gebruiken',
    bg_none: 'Zelf tekenen', bg_none_hint: 'Geen achtergrond – teken de ruimtes op het raster.', opacity: 'Doorzichtigheid', scale: 'Schaal', offx: 'Schuif links/rechts', offy: 'Schuif omhoog/omlaag',
    fit: 'Passend maken', rotate: 'Draaien', rot_l: '90° links', rot_r: '90° rechts', flip: 'Spiegelen', remove_bg: 'Achtergrond weghalen', next: 'Volgende', back: 'Vorige',
    bg_tip: 'Tip: de achtergrond is alleen een hulp om over te trekken. Op het dashboard zie je hem niet.',
    rooms_title: 'Teken je ruimtes', tool_select: 'Selecteren / schuiven', tool_draw: 'Ruimte tekenen', tool_part: 'Deel toevoegen aan ruimte',
    rooms_tip: 'Sleep een rechthoek voor elke ruimte. Voor een L-vormige ruimte: selecteer de ruimte en kies “Deel toevoegen aan ruimte”. Muren ontstaan vanzelf waar ruimtes elkaar raken; waar niets naast ligt komt een buitenmuur.',
    from_areas: 'Ruimtes maken uit mijn areas', room: 'Ruimte', area: 'Home Assistant-area', none: '— geen —', temp_sensor: 'Temperatuursensor', hum_sensor: 'Vochtsensor', auto: 'automatisch',
    delete_room: 'Ruimte verwijderen', delete_part: 'Dit deel verwijderen', rooms_list: 'Ruimtes', no_rooms: 'Nog geen ruimtes.',
    doors_title: 'Deuren en doorgangen', door: 'Deur', opening: 'Open doorgang', doors_tip: 'Kies een soort en klik op een muur. Een deur krijgt kleine posten; een open doorgang haalt de muur weg (bv. open keuken).',
    length: 'Breedte', whole: 'Hele wand', delete: 'Verwijderen', no_walls: 'Teken eerst ruimtes – de muren ontstaan daaruit.',
    items_title: 'Apparaten op de kaart', auto_place: 'Alles automatisch plaatsen', auto_hint: 'Lampen, schakelaars, klimaat, gordijnen, mediaspelers… uit de area die aan elke ruimte gekoppeld is.',
    unplaced: 'Nog niet op de kaart', add: 'Toevoegen', search: 'Zoek een willekeurige entiteit…', item: 'Apparaat', show_always: 'Altijd tonen (ook in Eenvoudig)', color: 'Gloedkleur (voor stekkers/schakelaars met een gekleurde lamp)', no_color: 'automatisch', icon: 'Icoon (optioneel)', label: 'Naam (optioneel)',
    remove: 'Van de kaart halen', items_tip: 'Sleep de iconen naar de juiste plek. Op het dashboard: tikken = aan/uit, vasthouden = details.',
    finish_title: 'Klaar!', theme: 'Thema', usage_days: 'Eenvoudig: toon wat de laatste … dagen gebruikt is', make_dash: 'Dashboard maken (Thuis · Plattegrond · Kiosk · Energie · Buiten · TV + pagina per ruimte)', dash_done: 'Dashboard gemaakt:', open: 'Openen',
    set_title: 'Instellingen', set_intro: 'Dit zijn de standaardwaarden voor elke kaart met deze plattegrond. Een kaart kan ze in zijn eigen opties nog overschrijven.',
    set_look: 'Uiterlijk', set_simple: 'Eenvoudig-modus', set_room: 'Tekst bij de ruimtes', set_behaviour: 'Bediening', set_sun: 'Automatisch (zon)', set_auto: 'Automatisch plaatsen',
    default_mode: 'Standaard weergave', learning_days: 'Toon alles tot er … dagen geschiedenis is', plan_size: 'Grootte plattegrond (%)', icon_size: 'Grootte iconen', label_size: 'Grootte kamertekst', glow: 'Sterkte gloed',
    show_temp: 'Temperatuur', show_hum: 'Vochtigheid', show_lights: 'Lampen aan (aantal)', show_tags: 'Statuslabels onder apparaten (21°, open…)',
    tap_zoom: 'Tik op ruimte = inzoomen', hold_ms: 'Vasthouden voor details (ms)', sun_before: 'Begint … minuten vóór zonsopkomst licht te worden', sun_ramp: 'Overgang duurt … minuten',
    auto_domains: 'Welke soorten apparaten', reset: 'Standaardwaarden herstellen', simple: 'Eenvoudig', all: 'Alles',
    theme_entity: 'Thema voor het hele huis (helper)', theme_entity_hint: 'Kies een invoerlijst-helper: elk scherm volgt dan hetzelfde thema, en je kunt het thema met automatiseringen wisselen.', make_helper: 'Helper aanmaken', own_choice: 'per apparaat zelf kiezen',
    headline: 'Grote waarde', headline_auto: 'temperatuur', extra_rows: 'Extra regels in het tekstblok', floor: 'Vloer', floor_plain: 'gewoon', floor_tiles: 'tegels', floor_wood: 'hout',
    set_text: 'Tekstblok en licht', glow_style: 'Licht', glow_lamp: 'zachte lichtvlek per lamp', glow_room: 'hele ruimte gloeit', glow_off: 'geen gloed', lamp_level: 'Sterkte van lampen', lvl_fixed: 'altijd onder de lamp', lvl_hover: 'alleen bij aanwijzen', lvl_off: 'niet tonen',
    show_co2: 'CO2', show_covers: 'Gordijnen / rolluiken', show_climate: 'Verwarming / airco', show_media: 'Wat er speelt', info_rows: 'Maximaal aantal regels',
    compass: 'Kompas (graden, leeg = geen)', greeting: 'Begroeting + wie er thuis is (met zijkolom)',
    set_side: 'Zijkolom', side_hint: 'Wordt getoond als de kaart “side: true” heeft (zo maakt Dashboard maken hem). Leeg = automatisch gekozen.',
    s_weather: 'Weer', s_main: 'Grote knop', s_main_auto: 'alle lampen op de kaart uit', s_buttons: 'Knoppen (scènes / scripts)', s_solar: 'Zonnepanelen nu (W)',
    smart: 'Slimme knop', smart_hint: 'Geef de grote knop per tijdvak een eigen naam en actie (bijv. Goedemorgen, Thuiskomen, Naar bed). Begin: een tijd (06:30) of sunrise / sunset, eventueel met minuten erbij of eraf (sunset-30). Leeg = de gewone knop hierboven.',
    from: 'Vanaf', slot_name: 'Naam', slot_action: 'Doet', slot_sub: 'Onderschrift', slot_on: 'Als er licht aan is', same: 'hetzelfde', smart_on: 'Wat telt als “licht aan”', any_lamp: 'een lamp op de kaart', lights_off: 'lampen uit',
    s_grid: 'Verbruik van het net (W)', s_grid_return: 'Teruglevering (W)', s_price: 'Stroomprijs', s_solar_today: 'Zon vandaag (kWh)', s_status: 'Statuslijst',
    import: 'Plattegrond importeren (JSON)', export: 'Plattegrond exporteren (JSON)', import_bad: 'Dit is geen Floorplan Studio-bestand.',
    room_tap: 'Tik op een ruimte', tap_zoom_opt: 'Inzoomen op de kaart', tap_page_opt: 'Eigen pagina van de ruimte openen (gemaakte dashboards)', make_home: 'Met startpagina “Thuis” (een kaart per ruimte)',
    set_temp: 'Kleur op temperatuur', temp_color: 'Ruimtes standaard kleuren op temperatuur (ook aan/uit met het thermometer-knopje)', temp_min: 'Blauw bij … °C of kouder', temp_max: 'Rood bij … °C of warmer',
    set_presence: 'Aanwezigheid', presence: 'Toon een stip als er iemand in de ruimte is (beweging-, aanwezigheids- en bezettingssensoren in de area)',
    people_hint: 'Personen per kamer volgen? Kies per persoon de sensor die de ruimte geeft (bijv. Bermuda of ESPresense). Hij moet de naam van de ruimte of area als waarde hebben.',
    set_alerts: 'Meldingen', alerts: 'Rook, gas, koolmonoxide en lekkage: ruimte knippert rood + melding bovenaan', alert_open: 'Open deuren en ramen: oranje rand',
    set_vacuum: 'Stofzuiger', vacuum: 'Stofzuiger', vacuum_live: 'Live kaart over de plattegrond', live_cleaning: 'Alleen tijdens het zuigen', live_always: 'Altijd', live_off: 'Uit',
    vacuum_map: 'Kaart-entiteit', vacuum_map_hint: 'De live kaart past alleen precies als je achtergrond (stap 1) van dezelfde kaart komt. Draaien en spiegelen worden automatisch overgenomen.',
    vacuum_show: 'Wat je ziet tijdens het zuigen', vshow_robot: 'alleen de robot die over je plattegrond rijdt (met spoor)', vshow_map: 'de kaart van de stofzuiger', vshow_both: 'allebei',
    vacuum_opacity: 'Doorzichtigheid live kaart', first_on_plan: 'eerste op de kaart', from_bg: 'die van de achtergrond',
    segments: 'Stofzuiger-segmenten (alleen als je HA geen “Schoonmaken per area” kent)', segments_hint: 'bijv. 16 of 16,17',
    yaml: 'Of zet de kaart op een bestaand dashboard:', preview: 'Voorbeeld', need_save: 'Eerst opslaan.', loading: 'Laden…', default_name: 'Thuis',
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
  .op.door { stroke: #ff6fd8; } .op.open { stroke: #36d399; stroke-dasharray: 8 5; }
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
    const planOpts = (this.plans || []).map((x) => `<option value="${x.id}" ${x.id === p.id ? 'selected' : ''}>${esc(x.name)}</option>`).join('');
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
        <div class="canvaswrap">${this.step >= 4 ? '<div class="preview" id="preview"></div>' : this.canvasHTML()}</div>
        <div class="side">${[this.sideBg, this.sideRooms, this.sideDoors, this.sideItems, this.sideSettings, this.sideFinish][this.step].call(this)}</div>
      </div>`;
    this.wire();
  }

  canvasHTML() {
    const p = this.plan, W = p.width, H = p.height, g = p.grid || 10;
    const out = [];
    const ratio = W / H;
    out.push(`<div class="canvas ${this.step === 2 ? 'doors-mode' : ''}" id="canvas" style="width: min(100%, calc((100vh - 150px) * ${ratio})); aspect-ratio: ${W} / ${H};">`);
    out.push(`<svg viewBox="0 0 ${W} ${H}" id="svg">`);
    out.push(`<defs><pattern id="gm" width="${g}" height="${g}" patternUnits="userSpaceOnUse"><path class="gridline" d="M${g} 0H0V${g}" fill="none"/></pattern><pattern id="gM" width="${g * 5}" height="${g * 5}" patternUnits="userSpaceOnUse"><path class="gridline major" d="M${g * 5} 0H0V${g * 5}" fill="none"/></pattern></defs>`);
    out.push(`<rect width="${W}" height="${H}" fill="#0d1116" data-bg="1"/>`);
    if (p.background?.url) {
      const b = p.background;
      out.push(`<image href="${b.url}" x="${b.x || 0}" y="${b.y || 0}" width="${b.w}" height="${b.h}" opacity="${b.opacity ?? 0.5}" preserveAspectRatio="none" style="pointer-events:none"/>`);
    }
    out.push(`<rect width="${W}" height="${H}" fill="url(#gm)" style="pointer-events:none"/><rect width="${W}" height="${H}" fill="url(#gM)" style="pointer-events:none"/>`);
    p.rooms.forEach((r, i) => {
      const c = ROOM_COLORS[i % ROOM_COLORS.length];
      r.rects.map(norm).forEach((q, k) => {
        const s = this.sel?.type === 'room' && this.sel.id === r.id;
        const sp = s && this.sel.part === k;
        out.push(`<rect class="rect ${sp ? 'sel' : ''}" data-room="${r.id}" data-part="${k}" x="${q[0]}" y="${q[1]}" width="${q[2] - q[0]}" height="${q[3] - q[1]}" fill="${c}" fill-opacity="${s ? 0.32 : 0.16}" stroke="${c}"/>`);
      });
    });
    for (const w of computeWalls(p.rooms)) out.push(`<line class="wall ${w.kind}" data-wall="${w.x1},${w.y1},${w.x2},${w.y2}" x1="${w.x1}" y1="${w.y1}" x2="${w.x2}" y2="${w.y2}"/>`);
    for (const o of p.openings) out.push(`<line class="op ${o.type} ${this.sel?.type === 'opening' && this.sel.id === o.id ? 'sel' : ''}" data-op="${o.id}" x1="${o.x1}" y1="${o.y1}" x2="${o.x2}" y2="${o.y2}"/>`);
    p.rooms.forEach((r) => {
      const [x0, y0, x1, y1] = roomBBox(r);
      out.push(`<text class="rlabel" x="${(x0 + x1) / 2}" y="${(y0 + y1) / 2}" text-anchor="middle" dominant-baseline="middle">${esc(r.name || '')}</text>`);
    });
    if (this.sel?.type === 'room' && this.step === 1 && this.tool === 'select') {
      const r = this.room(this.sel.id), q = r && norm(r.rects[this.sel.part] || r.rects[0]);
      if (q) for (const [cx, cy, n] of [[q[0], q[1], 'nw'], [q[2], q[1], 'ne'], [q[0], q[3], 'sw'], [q[2], q[3], 'se']]) out.push(`<rect class="handle ${n}" data-handle="${n}" x="${cx - 6}" y="${cy - 6}" width="12" height="12" rx="3"/>`);
    }
    out.push('<rect class="draft" id="draft" width="0" height="0"/></svg>');
    out.push(`<div class="items ${this.step === 3 ? '' : 'off'}" id="items">`);
    for (const it of p.items) {
      const d = it.entity_id.split('.')[0];
      const dev = !['light', 'switch', 'input_boolean', 'fan'].includes(d);
      out.push(`<div class="it ${dev ? 'dev' : ''} ${this.sel?.type === 'item' && this.sel.id === it.entity_id ? 'sel' : ''}" data-item="${it.entity_id}" style="left:${(it.x / W) * 100}%;top:${(it.y / H) * 100}%">${it.icon ? `<ha-icon icon="${esc(it.icon)}"></ha-icon>` : '<ha-state-icon></ha-state-icon>'}<span class="tip">${esc(it.name || friendly(this._hass, it.entity_id))}</span></div>`);
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
      ${b ? `<h3>${l.bg_title.split('?')[0]}</h3>
        <div class="field"><span>${l.opacity}</span><input type="range" min="0.1" max="1" step="0.05" value="${b.opacity ?? 0.5}" data-bg="opacity"></div>
        <div class="field"><span>${l.scale} (${scale}%)</span><input type="range" min="20" max="300" step="1" value="${scale}" data-bg="scale"></div>
        <div class="field"><span>${l.offx}</span><input type="range" min="${-p.width}" max="${p.width}" step="1" value="${b.x || 0}" data-bg="x"></div>
        <div class="field"><span>${l.offy}</span><input type="range" min="${-p.height}" max="${p.height}" step="1" value="${b.y || 0}" data-bg="y"></div>
        <div class="field"><span>${l.rotate}</span><div class="row"><button id="rotl"><ha-icon icon="mdi:rotate-left"></ha-icon>${l.rot_l}</button><button id="rotr"><ha-icon icon="mdi:rotate-right"></ha-icon>${l.rot_r}</button><button id="flipbg"><ha-icon icon="mdi:flip-horizontal"></ha-icon>${l.flip}</button></div></div>
        <div class="row"><button id="fitbg">${l.fit}</button><button id="rmbg" class="danger">${l.remove_bg}</button></div>` : ''}
      <h3>${l.size}</h3>
      <div class="row"><input type="number" id="pw" value="${p.width}" min="200" max="4000" step="10"><input type="number" id="ph" value="${p.height}" min="200" max="4000" step="10"></div>
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
      ${r ? `<div class="card">
          <div class="field"><span>${l.room}</span><input id="rname" value="${esc(r.name || '')}"></div>
          <div class="field"><span>${l.area}</span><select id="rarea"><option value="">${l.none}</option>${areas.map((a) => `<option value="${a.area_id}" ${a.area_id === r.area_id ? 'selected' : ''}>${esc(a.name)}</option>`).join('')}</select></div>
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
          <div class="row">${r.rects.length > 1 ? `<button id="delpart">${l.delete_part}</button>` : ''}<button class="danger" id="delroom">${l.delete_room}</button></div>
        </div>` : ''}
      <h3>${l.rooms_list}</h3>
      <div class="list">${p.rooms.length ? p.rooms.map((x, i) => `<div class="li ${r?.id === x.id ? 'sel' : ''}" data-selroom="${x.id}"><span class="sw" style="background:${ROOM_COLORS[i % ROOM_COLORS.length]}"></span>${esc(x.name || '?')}<small>${esc(this._hass.areas?.[x.area_id]?.name || '')}</small></div>`).join('') : `<p>${l.no_rooms}</p>`}</div>
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
        <button data-door="open" class="${this.doorType === 'open' ? 'active' : ''}"><ha-icon icon="mdi:arrow-expand-horizontal"></ha-icon>${l.opening}</button>
      </div>
      <p>${l.doors_tip}</p>
      ${o ? `<div class="card">
        <div class="field"><span>${l.door} / ${l.opening}</span><select id="otype"><option value="door" ${o.type === 'door' ? 'selected' : ''}>${l.door}</option><option value="open" ${o.type === 'open' ? 'selected' : ''}>${l.opening}</option></select></div>
        <div class="field"><span>${l.length} (${len})</span><input type="range" id="olen" min="20" max="400" step="5" value="${len}"></div>
        <div class="row"><button id="owhole">${l.whole}</button><button class="danger" id="odel">${l.delete}</button></div></div>` : ''}
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
      ${it ? `<div class="card"><b>${esc(friendly(h, it.entity_id))}</b><small class="hint">${it.entity_id}</small>
        <div class="field"><span>${l.label}</span><input id="iname" value="${esc(it.name || '')}"></div>
        <div class="field"><span>${l.icon}</span><input id="iicon" placeholder="mdi:lamp" value="${esc(it.icon || '')}"></div>
        <div class="field"><span>${l.color}</span><div class="row"><input type="color" id="icolor" value="${it.color || '#f2a541'}" style="flex:none;width:52px;padding:2px"><button id="icolorclr" style="flex:none">${l.no_color}</button></div></div>
        <label class="row" style="font-size:13px"><input type="checkbox" id="ipin" ${it.pin ? 'checked' : ''} style="flex:none">${l.show_always}</label>
        <button class="danger" id="idel" style="margin-top:8px"><ha-icon icon="mdi:map-marker-remove"></ha-icon>${l.remove}</button></div>` : ''}
      <div class="field"><input id="isearch" list="entlist" placeholder="${l.search}"><datalist id="entlist">${Object.keys(h.states).filter((id) => !placed.has(id)).sort().map((id) => `<option value="${id}">${esc(friendly(h, id))}</option>`).join('')}</datalist></div>
      ${groups.length ? `<h3>${l.unplaced}</h3>` : ''}
      ${groups.map(([r, ids]) => `<b style="font-size:13px">${esc(r.name)}</b><div class="list" style="margin-bottom:8px">${ids.map((id) => `<div class="li" data-additem="${id}" data-room="${r.id}"><ha-state-icon data-sid="${id}"></ha-state-icon>${esc(friendly(h, id))}<small>+ ${l.add}</small></div>`).join('')}</div>`).join('')}
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
        if (!Array.isArray(data.rooms)) throw new Error(this.L.import_bad);
        // always a new plan: never overwrite an existing one by accident
        this.plan = { ...newPlan(data.name || this.L.default_name), ...data, id: '', settings: { ...DEFAULT_SETTINGS, ...(data.settings || {}) } };
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
    $('#newplan').addEventListener('click', () => { this.plan = newPlan(`${this.L.default_name} ${(this.plans?.length || 0) + 1}`); this.history = []; this.sel = null; this.step = 0; this.dirty = true; this.render(); });
    $('#plansel')?.addEventListener('change', (ev) => { const x = this.plans.find((q) => q.id === ev.target.value); if (x) { this.plan = structuredClone(x); this.history = []; this.sel = null; this.dirty = false; this.render(); } });
    $$('[data-step]').forEach((b) => b.addEventListener('click', () => { this.step = +b.dataset.step; this.sel = null; this.render(); }));

    // icons
    $$('ha-state-icon').forEach((ic) => {
      const id = ic.dataset.sid || ic.closest('[data-item]')?.dataset.item;
      if (id && h.states[id]) { ic.hass = h; ic.stateObj = h.states[id]; }
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
      const r = await fetch(st.attributes.entity_picture);
      this.setBackground({ ...(await this.toDataURL(await r.blob())), source: id });
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
    for (const d of dashes) {
      if (!d.url_path?.startsWith('floorplan-')) continue;
      let cfg = null;
      try { cfg = await ws.sendMessagePromise({ type: 'lovelace/config', url_path: d.url_path }); } catch (e) { /* empty */ }
      const used = JSON.stringify(cfg || {});
      const ours = used.includes('custom:floorplan-studio-card');
      const forThis = used.includes(`"plan":"${planId}"`) || d.url_path === `floorplan-${planId}`.replace(/_/g, '-').slice(0, 40);
      if (ours && forThis) {
        try { await ws.sendMessagePromise({ type: 'lovelace/dashboards/delete', dashboard_id: d.id }); } catch (e) { /* ignore */ }
      }
    }
  }

  /** Rotate the background 90° (or mirror it); the image itself is turned so it stays sharp and saves correctly. */
  async transformBackground(how) {
    const b = this.plan.background;
    if (!b?.url) return;
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
      $$('[data-rinfo]').forEach((el) => el.addEventListener('change', () => this.mut(() => {
        const v = [...this.shadowRoot.querySelectorAll('[data-rinfo]')].map((x) => x.value).filter(Boolean);
        r.info = v.length ? [...new Set(v)] : undefined;
      })));
      $('#rseg')?.addEventListener('change', (ev) => this.mut(() => { r.vacuum_segments = ev.target.value.trim() || undefined; }));
      $('#delroom').addEventListener('click', () => this.deleteSel());
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
    const o = this.sel?.type === 'opening' ? this.plan.openings.find((x) => x.id === this.sel.id) : null;
    if (!o) return;
    $('#otype').addEventListener('change', (ev) => this.mut(() => { o.type = ev.target.value; }));
    $('#olen').addEventListener('change', (ev) => this.mut(() => this.resizeOpening(o, +ev.target.value)));
    $('#owhole').addEventListener('click', () => this.mut(() => {
      const w = this.wallOf(o);
      if (w) Object.assign(o, { x1: w.x1, y1: w.y1, x2: w.x2, y2: w.y2 });
    }));
    $('#odel').addEventListener('click', () => this.deleteSel());
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
    $('#icolor').addEventListener('change', (ev) => this.mut(() => { it.color = ev.target.value; }));
    $('#icolorclr').addEventListener('click', () => this.mut(() => { delete it.color; }));
    $('#ipin').addEventListener('change', (ev) => this.mut(() => { it.pin = ev.target.checked || undefined; }));
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
      const url = `floorplan-${p.id}`.replace(/_/g, '-').slice(0, 40);
      const ws = this._hass.connection;
      const dashes = await ws.sendMessagePromise({ type: 'lovelace/dashboards/list' });
      if (!dashes.find((d) => d.url_path === url)) {
        await ws.sendMessagePromise({ type: 'lovelace/dashboards/create', url_path: url, title: p.name || 'Floorplan', icon: 'mdi:floor-plan', show_in_sidebar: true, require_admin: false, mode: 'storage' });
      }
      const nl = (this._hass.locale?.language || 'en').startsWith('nl');
      await ws.sendMessagePromise({ type: 'lovelace/config/save', url_path: url, config: await buildDashboard(this._hass, p, nl, { home: $('#mkhome')?.checked !== false }) });
      $('#dashdone').innerHTML = `<p>${this.L.dash_done} <a href="/${url}/plan">/${url}</a> · kiosk: <a href="/${url}/kiosk?kiosk">/${url}/kiosk?kiosk</a></p>`;
    });
  }

  mountPreview($) {
    const p = this.plan;
    const card = document.createElement('floorplan-studio-card');
    card.planOverride = p;   // live preview of the unsaved plan and settings
    card.setConfig({ plan: p.id, show_theme_toggle: false });
    card.hass = this._hass;
    this._preview = card;
    $('#preview').appendChild(card);
  }

  sideSettings() {
    const l = this.L, s = settingsOf(this.plan);
    const num = (k, min, max, step = 1) => `<div class="field"><span>${l[k]} (${s[k]})</span><input type="range" min="${min}" max="${max}" step="${step}" value="${s[k]}" data-set="${k}" data-num="1"></div>`;
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
    return `<h2>${l.set_title}</h2><p>${l.set_intro}</p>
      <h3>${l.set_look}</h3>
      <div class="field"><span>${l.theme}</span><select data-set="theme">${Object.entries(THEMES).map(([k, v]) => `<option value="${k}" ${s.theme === k ? 'selected' : ''}>${v.label}</option>`).join('')}</select></div>
      <div class="field"><span>${l.theme_entity}</span><div class="row"><select data-set="theme_entity"><option value="">${l.own_choice}</option>${selects.map((id) => `<option value="${id}" ${s.theme_entity === id ? 'selected' : ''}>${esc(friendly(this._hass, id))}</option>`).join('')}</select><button id="mkhelper" style="flex:none">${l.make_helper}</button></div></div>
      <p>${l.theme_entity_hint}</p>
      ${num('plan_size', 50, 100, 5)}${num('icon_size', 60, 180, 5)}${num('label_size', 60, 180, 5)}${num('glow', 0, 150, 5)}
      <h3>${l.set_room}</h3>${chk('show_temp')}${chk('show_hum')}${chk('show_lights')}${chk('show_tags')}
      <h3>${l.set_simple}</h3>
      <div class="field"><span>${l.default_mode}</span><select data-set="default_mode"><option value="all" ${s.default_mode === 'all' ? 'selected' : ''}>${l.all}</option><option value="simple" ${s.default_mode === 'simple' ? 'selected' : ''}>${l.simple}</option></select></div>
      ${num('usage_days', 1, 60)}${num('learning_days', 0, 14)}
      <h3>${l.set_behaviour}</h3>${chk('tap_zoom')}
      <div class="field"><span>${l.room_tap}</span><select data-set="room_tap"><option value="zoom" ${s.room_tap !== 'page' ? 'selected' : ''}>${l.tap_zoom_opt}</option><option value="page" ${s.room_tap === 'page' ? 'selected' : ''}>${l.tap_page_opt}</option></select></div>${num('hold_ms', 250, 1500, 50)}
      <h3>${l.set_sun}</h3>${num('sun_before', 0, 120, 5)}${num('sun_ramp', 15, 240, 5)}
      <h3>${l.set_text}</h3>
      <div class="field"><span>${l.glow_style}</span><select data-set="glow_style">${['lamp', 'room', 'off'].map((k) => `<option value="${k}" ${s.glow_style === k ? 'selected' : ''}>${l['glow_' + k]}</option>`).join('')}</select></div>
      <div class="field"><span>${l.lamp_level}</span><select data-set="lamp_level">${['fixed', 'hover', 'off'].map((k) => `<option value="${k}" ${levelMode(s) === k ? 'selected' : ''}>${l['lvl_' + k]}</option>`).join('')}</select></div>${chk('show_co2')}${chk('show_covers')}${chk('show_climate')}${chk('show_media')}${num('info_rows', 1, 8)}
      <div class="field"><span>${l.compass}</span><input type="number" min="0" max="359" id="compass" value="${s.compass ?? ''}"></div>
      ${chk('greeting')}
      <h3>${l.set_side}</h3><p>${l.side_hint}</p>
      ${sideSel('weather', ids.filter((id) => id.startsWith('weather.')))}
      ${sideSel('main', ids.filter((id) => /^(script|scene)\./.test(id)), l.s_main_auto)}
      <h3>${l.smart}</h3><p>${l.smart_hint}</p>
      ${[0, 1, 2, 3].map((i) => { const x = side.smart?.[i] || {}; const acts = ids.filter((id) => /^(script|scene|automation|button|input_button)\./.test(id));
        return `<div class="card" data-slot="${i}" style="padding:8px 10px;margin-bottom:6px">
          <div class="row"><input data-k="from" placeholder="${l.from} 06:00" value="${esc(x.from || '')}" style="max-width:110px"><input data-k="name" placeholder="${l.slot_name}" value="${esc(x.name || '')}"></div>
          <div class="row" style="margin-top:4px"><select data-k="action">${optsOf(acts, x.action, l.lights_off)}</select><input data-k="sub" placeholder="${l.slot_sub}" value="${esc(x.sub || '')}"></div>
          <div style="font-size:12px;margin:6px 0 2px;opacity:.8">${l.slot_on}</div>
          <div class="row"><input data-k="name_on" placeholder="${l.slot_name}" value="${esc(x.name_on || '')}"><input data-k="sub_on" placeholder="${l.slot_sub}" value="${esc(x.sub_on || '')}"></div>
          <div class="row" style="margin-top:4px"><select data-k="action_on">${optsOf(acts, x.action_on, l.slot_action + ': ' + l.same)}</select></div></div>`; }).join('')}
      <div class="field"><span>${l.smart_on}</span><select data-side="smart_on">${optsOf(ids.filter((id) => /^(light|switch|input_boolean|binary_sensor|group)\./.test(id)), side.smart_on, l.any_lamp)}</select></div>
      <div class="field"><span>${l.s_buttons}</span>${[0, 1, 2].map((i) => `<select data-sidelist="buttons" style="margin-bottom:4px">${optsOf(ids.filter((id) => /^(script|scene|input_button|button|switch|light)\./.test(id)), side.buttons?.[i], l.none)}</select>`).join('')}</div>
      ${sideSel('solar', power)}${sideSel('grid', power)}${sideSel('grid_return', power)}
      ${sideSel('price', ids.filter((id) => id.startsWith('sensor.') && /\/kwh/i.test(this._hass.states[id].attributes.unit_of_measurement || '')))}
      ${sideSel('solar_today', ids.filter((id) => id.startsWith('sensor.') && this._hass.states[id].attributes.device_class === 'energy'))}
      <div class="field"><span>${l.s_status}</span>${[0, 1, 2, 3, 4].map((i) => `<select data-sidelist="status" style="margin-bottom:4px">${optsOf(ids.filter((id) => !id.startsWith('sun.') && !id.startsWith('zone.')), side.status?.[i], l.none)}</select>`).join('')}</div>
      <h3>${l.set_temp}</h3>${chk('temp_color')}${num('temp_min', 10, 22, 0.5)}${num('temp_max', 18, 30, 0.5)}
      <h3>${l.set_presence}</h3>${chk('presence')}
      ${persons.length ? `<p>${l.people_hint}</p>${persons.map((pid) => `<div class="field"><span>${esc(friendly(this._hass, pid))}</span><select data-person="${pid}"><option value="">${l.none}</option>${sensors.map((id) => `<option value="${id}" ${s.people?.[pid] === id ? 'selected' : ''}>${esc(friendly(this._hass, id))}</option>`).join('')}</select></div>`).join('')}` : ''}
      <h3>${l.set_alerts}</h3>${chk('alerts')}${chk('alert_open')}
      <h3>${l.set_vacuum}</h3>
      <div class="field"><span>${l.vacuum}</span><select data-set="vacuum"><option value="">${l.auto} (${l.first_on_plan})</option>${vacs.map((id) => `<option value="${id}" ${s.vacuum === id ? 'selected' : ''}>${esc(friendly(this._hass, id))}</option>`).join('')}</select></div>
      <div class="field"><span>${l.vacuum_live}</span><select data-set="vacuum_live">${['cleaning', 'always', 'off'].map((k) => `<option value="${k}" ${s.vacuum_live === k ? 'selected' : ''}>${l['live_' + k]}</option>`).join('')}</select></div>
      <div class="field"><span>${l.vacuum_map}</span><select data-set="vacuum_map"><option value="">${l.auto} (${l.from_bg}${this.plan.background?.source ? ': ' + esc(friendly(this._hass, this.plan.background.source)) : ''})</option>${maps.map((id) => `<option value="${id}" ${s.vacuum_map === id ? 'selected' : ''}>${esc(friendly(this._hass, id))}</option>`).join('')}</select></div>
      <div class="field"><span>${l.vacuum_show}</span><select data-set="vacuum_show">${['robot', 'map', 'both'].map((k) => `<option value="${k}" ${(s.vacuum_show || 'robot') === k ? 'selected' : ''}>${l['vshow_' + k]}</option>`).join('')}</select></div>
      <p>${l.vacuum_map_hint}</p>${num('vacuum_opacity', 0.2, 1, 0.05)}
      <h3>${l.set_auto}</h3><p>${l.auto_domains}</p>
      <div class="row" style="flex-wrap:wrap;gap:6px 14px">${doms.map((d) => `<label style="flex:none;font-size:13px"><input type="checkbox" data-dom="${d}" ${s.auto_domains.includes(d) ? 'checked' : ''}> ${d}</label>`).join('')}</div>
      <button id="setreset" style="margin-top:14px"><ha-icon icon="mdi:restore"></ha-icon>${l.reset}</button>
      ${this.navHTML()}`;
  }

  wireSettings($, $$) {
    const set = (k, v) => this.mut((pl) => { pl.settings = { ...settingsOf(pl), [k]: v }; });
    $$('[data-set]').forEach((el) => el.addEventListener('change', () => {
      const k = el.dataset.set;
      set(k, el.type === 'checkbox' ? el.checked : el.dataset.num ? +el.value : el.value);
    }));
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
        const canvas = this.shadowRoot.getElementById('canvas').getBoundingClientRect();
        const move = (e) => {
          it.x = Math.round(Math.max(0, Math.min(p.width, ((e.clientX - canvas.left) / canvas.width) * p.width)));
          it.y = Math.round(Math.max(0, Math.min(p.height, ((e.clientY - canvas.top) / canvas.height) * p.height)));
          el.style.left = `${(it.x / p.width) * 100}%`; el.style.top = `${(it.y / p.height) * 100}%`;
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
      else if (this.step === 2) this.doorsPointer(tgt, x, y);
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
      const el = this.shadowRoot.querySelector(`.rect[data-room="${r.id}"][data-part="${part}"]`);
      el.setAttribute('x', q[0]); el.setAttribute('y', q[1]); el.setAttribute('width', q[2] - q[0]); el.setAttribute('height', q[3] - q[1]);
    };
    const up = () => {
      svg.removeEventListener('pointermove', move); svg.removeEventListener('pointerup', up);
      this.history.push(before); this.dirty = true; this.render();
    };
    svg.addEventListener('pointermove', move); svg.addEventListener('pointerup', up);
  }

  doorsPointer(tgt, x, y) {
    const p = this.plan;
    if (tgt.dataset.op) { this.sel = { type: 'opening', id: tgt.dataset.op }; this.render(); return; }
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
