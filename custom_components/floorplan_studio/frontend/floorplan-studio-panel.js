// Floorplan Studio – editor panel (sidebar → Floorplan).
import './floorplan-studio-card.js?v=1.4.0b66';
import {
  VERSION, isScreenLabel, ambilightTv, speakerBoxes, deviceKind, applianceKind, THEMES, themeStyle, computeWalls, nearestWall, norm, roomBBox, roomAt, isCeilingLamp, ceilingMount, curtainFor, isSpot, stripPath, pathLength, pathMid, areaEntities, entityArea,
  PLACE_DOMAINS, placeCandidates, friendly, newPlan, DEFAULT_SETTINGS, settingsOf, levelMode, loadPlans, savePlan, esc, safeNumber, safeImageData,
  FURN_TYPES, furnSVG, planScale, fmtMeters, roomArea, radarEntities, FURN_HEIGHT, itemHeight, deviceHeight, ownHeight, setLinkedTvHeight, tvLinks, tvOnWall, deviceIndex, stripTop, videoWallSpan, videoWallCams, applianceEntity,
} from './fps-core.js?v=1.4.0b66';
import { buildDashboard } from './fps-dashboard.js?v=1.4.0b66';

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
    doors_title: 'Doors, windows and openings', door: 'Door', window: 'Window', opening: 'Open passage', doors_tip: 'Choose door, window or opening and tap a wall (tap the button again to stop). An opening removes the wall, e.g. for an open kitchen. Link a door or window to its sensor and it turns orange on the plan while it is open.', o_sensor: 'Sensor (open / closed)', o_none: '— none —',
    length: 'Width', whole: 'Whole wall', delete: 'Delete', no_walls: 'Draw your rooms first; the walls come by themselves.',
    items_title: 'Devices on the map', auto_place: 'Place everything for me', wled_auto: 'Set up WLED automatically', wled_hint: 'Reads every WLED: number of LEDs, segments and matrix. Segments of a strip you drew get their own part of it, strips without a line get one along the nearest wall (assuming 60 LEDs per metre; redraw it for the exact spot), and WLED lights are never treated as ceiling lamps.', wled_none: 'No WLED found (or not reachable).', wled_done: 'WLED set up', wled_split: '{n}: split into {k} segments', wled_line: '{n}: line of {m} m added ({l} LEDs)', wled_matrix: '{n}: LED matrix {w}×{h}', wled_off: '{n}: not reachable', auto_hint: 'Puts lights, switches, heating, curtains and TVs in the room they belong to in Home Assistant.',
    unplaced: 'Not on the map yet', add: 'Add', search: 'Search anything in Home Assistant…', item: 'Device', show_always: 'Always show (also in Simple mode)', color: 'Light colour (for a plug with a coloured lamp)', no_color: 'automatic', icon: 'Icon (optional)', label: 'Name (optional)',
    remove: 'Remove from map', items_tip: 'Drag the icons to the right spot. On your dashboard: tap = on/off, hold = more info.',
    finish_title: 'Ready!', theme: 'Theme', usage_days: 'Simple mode: show what was used in the last … days', make_dash: 'Create dashboard (Home · Floorplan · Kiosk · Energy · Outside · TV + a page per room)', dash_done: 'Dashboard created:', dash_conflict: 'A dashboard already exists at /{url}, and Floorplan Studio did not create it. It was left unchanged.', dash_error: 'The dashboard could not be created: ', open: 'Open',
    set_title: 'Settings', set_intro: 'This applies to every card that shows this floorplan.',
    set_light: 'Light', set_screens: 'Phones, tablets and 2.5D', set_look: 'Look', set_simple: 'Simple mode', set_room: 'Room text', set_behaviour: 'Tapping and holding', set_sun: 'Automatic (sun)', set_auto: 'Place automatically',
    default_mode: 'Default view', none_mode: 'None (no icons, a calm map)', learning_days: 'Show everything until … days of history exist', plan_size: 'Floor plan size in %', icon_size: 'Size of all icons (%)', label_size: 'Room text size', glow: 'Glow strength',
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
    zoom_all: 'Whole floorplan', zoom_hint: 'or double-click a room', zoom_in: 'Zoom in (Ctrl + scroll wheel)', zoom_out: 'Zoom out', zoom_fit: 'Whole view again', measure_pick: 'Real sizes: pick a room and fill in how wide or long it really is.', measure_done: 'Sizes are in metres. To correct them: pick a room and change its real width.',
    measure_w: 'Real width (m)', measure_l: 'Real length (m)', measure: 'Real width of this room (metres)', measure_hint: 'Fill in the real width or length of one room; the other side follows from your drawing. Then the plan knows how big everything is: you see sizes in metres, and the radar knows how far 2 metres is.', dims: 'Size',
    furn_title: 'Furniture and stairs', furn_tip: 'Tap a piece to put it on the plan, then drag it to the right spot. It is only a light outline on your dashboard.',
    f_sofa: 'Sofa', f_bed: 'Bed', f_table: 'Table', f_round: 'Round table', f_coffee: 'Coffee table', f_radiator: 'Radiator', f_speakerbox: 'Speaker / box', f_speakerbox: 'Speaker / box', f_desk: 'Desk', f_counter: 'Kitchen counter', f_cabinet: 'Cupboard', f_bath: 'Bath', f_shower: 'Shower', f_toilet: 'Toilet', f_stairs: 'Stairs', f_tv: 'TV', f_plant: 'Plant',
    f_hob: 'Hob (on a worktop)', f_sink: 'Sink', f_stove: 'Cooker', f_fridge: 'Fridge', f_island: 'Kitchen island', f_wallcab: 'Wall cupboard', lamp_size: 'Lamps (size in %)', device_size: 'Other devices (size in %)', f_kind: 'Kind', f_w: 'Width', f_h: 'Depth', f_z: 'Height (cm, for the 2.5D view)', f_chairs: 'Chairs', f_videowall: 'Camera wall', f_mirror: 'Mirror', f_model: 'Own 3D model', mdl_file: '3D model', mdl_none: '– choose or upload –', mdl_upload: 'Upload .glb / .obj', mdl_del: 'Remove file', mdl_del_t: 'Remove this model file from Home Assistant', mdl_del_q: 'Remove this 3D model file from Home Assistant? Other furniture using it shows a box.', mdl_up: 'Upright', mdl_y: 'Y up (glTF, Blender export)', mdl_z: 'Z up (SketchUp, 3ds Max, CAD)', mdl_z2: 'Z up, other way round', mdl_hint: 'Your own model as furniture: a .glb (from Blender, Sketchfab, a manufacturer…) or .obj, up to 40 MB, kept in Home Assistant. It fills the width, depth and height you give it; after uploading (or with Own proportions) they follow the model itself. Textures give its colours. Lying on its side? Change Upright.', mdl_err: 'Upload failed', i_rot: 'Turned (degrees, in the walk)', i_model: 'Own 3D model (walk)', i_model_none: 'None (the built-in one)', i_model_h: 'Model height (m)', i_model_auto: 'usual for what it is', i_model_hint: 'Your own model instead of the built-in one. It gets a size and place that fit what it is: a ceiling lamp hangs from the ceiling, a wall lamp or camera on the wall, a floor lamp on the floor, the rest on the furniture under it. A lamp still lights the room; tap it to switch it.', scr_q: 'Projection screen: open means', scr_down: 'Rolled down', scr_up: 'Rolled up', mdl_fit: 'Own proportions', mdl_fit_t: 'Depth and height as in the model (the width stays)', f_dishwasher: 'Dishwasher', f_washer: 'Washing machine', f_dryer: 'Dryer', app_ent: 'Linked to (shows when it runs)', app_on_w: 'Running above (W, for a power sensor)', app_hint: 'Pick the sensor that tells whether it runs: a status or running sensor, a power meter (above the watts here = running) or a switch. A smart plug that is always on is not much use: take its power sensor.', vw_from: 'Bottom (m)', vw_to: 'Top (m)', vw_cams: 'Cameras (none ticked = all)', vw_none: 'No cameras found in Home Assistant.', vw_hint: 'A control room: in the walk the wall fills with screens showing your cameras (the grid adapts to the size). Make it wider with the handles or the width field.', f_legs: 'On legs: leg height (cm), empty = none', strip_dir: 'Direction', strip_flat: 'Lying (along the line, at one height)', strip_up: 'Standing (upright at each point)', strip_frame: 'Frame (rectangle all round)', strip_frame3: 'Open frame (left, top, right)', strip_from: 'From (m)', strip_to: 'To (m)', strip_up_hint: 'An upright strip at every point you drew, from the first to the second height.', strip_seg_hint: 'With WLED: the LEDs go up the left, along the top, down the right (and back along the bottom); with as many segments as sides, each side shows its own segment.', strip_frame_hint: 'A rectangle: the line you drew is its width, the heights its bottom and top (e.g. around a stained-glass panel or a mirror).', link_q: 'Belongs to', link_own: 'Chosen myself (tick below)', f_linklight: 'Light in it (glow / ambilight)', f_media: 'Player (tap = its buttons, glows while playing)', left: 'left', right: 'right', link_auto: 'Automatic (nearest in this room)', link_none: 'Nothing', link_hint: 'A light behind a TV becomes its ambilight; a light in speaker boxes their glow (also an HDMI sync box: pick the TV it lights).', link_tv_hint: 'The TV you drew that this player is (then it has no icon of its own).', idx_title: 'Device overview', idx_hint: 'Every device in Home Assistant and what Floorplan Studio makes of it. Tap a missing one to put it on the plan (in its own room).', idx_model: 'On the plan, recognised', idx_icon: 'On the plan, icon only', idx_missing: 'Not on the plan yet', idx_none: 'Nothing here.', idx_icon_tip: 'Icon only? A fitting icon or name in Home Assistant often helps (desk lamp, mirror, fireplace, kettle…).', f_shape: 'Shape', f_sofa_straight: 'Straight', f_sofa_left: 'Corner sofa, long side left', f_sofa_right: 'Corner sofa, long side right', f_mount: 'Mounting', f_mount_stand: 'On its stand / a cabinet', f_mount_wall: 'On the wall', f_elev: 'Bottom of the screen above the floor (cm)', f_turn: 'Turn 90°',
    more_options_room: 'More options (sensors, text, floor…)', more_options: 'More options (icon, colour, height…)', kind_q: 'What is plugged in / connected?', kind_auto: 'automatic', kind_lamp: 'a lamp (lamp icon and glow)', kind_device: 'a device, no light (no glow)', kind_hint: 'A normal lamp on a smart plug? Choose “a lamp”: it then looks and glows like a lamp on the plan.',
    i_tvheight: 'TV on the wall: bottom of the screen (m); empty = on its stand', i_tvstand: 'on stand', i_height: 'Height in metres, e.g. 1.2 (centimetres also work: 120); empty = usual', ceil_q: 'Ceiling lamp?', spot_q: 'Spotlight (shines one way)', spot_aim: 'Aim on the map', spot_aiming: 'Click where the spot should shine…', spot_down: 'Straight down', spot_hint: 'Aimed spots show their beam on the map, in 2.5D and in the walk (there you can also aim by clicking on a wall or the floor).', cur_q: 'Curtain or blind at a window', cur_auto: 'Automatic', cur_none: 'Not a curtain', cur_win: 'Window', cur_style: 'Kind', cur_split: 'Curtains that open in the middle', cur_left: 'One curtain, opens to the left', cur_right: 'One curtain, opens to the right', cur_roller: 'Roller blind (from the top)', cur_bottom: 'Hangs down to', cur_floor: 'the floor', cur_sill: 'the windowsill', cur_own: 'own height (m)', cur_hint: 'On the map, in 2.5D and in the walk the curtain slides open and closed as it really is.', cur_found: 'found: {w}', cur_nowin: 'no window nearby – draw the window in step 3 or pick one', ai: 'AI help', ai_local: 'Floorplan Studio (no AI needed)', ai_local_hint: 'Without an AI assistant I understand short commands such as “put Kitchen lamp above the dining table” or “hang Hall lamp in the middle of the hall at 2.4 m”. Use the device name as in Home Assistant. Choose an AI assistant at the top for real conversations.', ai_ph: 'Ask something, e.g. put the kitchen lamps above the dining table', ai_send: 'Send', ai_agent: 'Assistant', ai_busy: 'Thinking…', ai_saved_first: 'Your changes were saved first, so the assistant sees them.', ai_err: 'The assistant did not answer', ai_hello: 'Hi! I can move devices for you, tell you what is where, or help you get started. What would you like?', ai_s1: 'Which devices are not on the map yet?', ai_s2: 'Put the lamps above the dining table', ai_s3: 'Place the motion sensors in the corners of their rooms', ai_proto: 'You help in the Floorplan Studio editor of Home Assistant. Below: the plan (metres, x right, y down) and devices not on it yet. Reply ONLY with one compact JSON object, no other text, no functions or tools: {"r":"short answer (max 2 sentences)","a":[["entity_id","room","spot in max 6 words",height_m_or_null,"ceiling|hanging|wall|floor|table|null"]]}. Spot examples: above dining table, next to sofa, on the windowsill, left wall, top right corner, middle. At most 10 moves per reply; if more are needed, do the first 10 and say the user can type "more". Empty a when nothing moves. Only a new height: room and spot null (the device stays where it is). Never move an LED-strip unless the user explicitly asks to move it. Question:', ai_actions: 'Done on the plan:', ai_again: 'answer in the same compact JSON as before', ai_sel: 'About', ai_pick: 'Tip: first tap a device on the map (step 4); then the question is about that device.', ai_selctx: 'SELECTED DEVICE (the question is about this one unless it says otherwise):', ai_toobig: 'That was too much at once for this assistant. Ask per room or for a few devices at a time (e.g. “hang the dining table lamps above the table”), or pick another assistant at the top.', ai_ctx: '(You are helping in the Floorplan Studio editor of Home Assistant. To see the floorplan use the tool FloorplanDescribe or the action floorplan_studio.describe; to move a device use the tool FloorplanPlaceDevice or the action floorplan_studio.place_device with device, room, spot (plain words such as above the dining table, left wall, middle), and optionally height in metres and mount (ceiling, hanging, wall, floor, table). Answer briefly.)', shape_q: 'Shape on the map', shape_icon: 'Icon', shape_strip: 'Line (LED strip)', strip_draw: 'Draw the line', strip_redraw: 'Draw again', strip_done: 'Done', strip_clear: 'Remove line', strip_hint: 'Tap point by point along the strip; double-tap or Done to stop. Lines snap to 45°; hold Shift for any angle. Set the height of the strip under More options.', strip_len: 'Length', strip_none: 'No line drawn yet.', yes: 'yes', no: 'no', ceil_auto: 'Automatic (from the name)', ceil_yes: 'Yes, against the ceiling', ceil_hang: 'Yes, hanging (pendant)', hang_h: 'Hangs at (m above the floor)', hang_auto: 'hanging', ceil_no: 'No (floor, table, wall or strip)',
    via: 'Power through a smart switch (may be empty)', via_hint: 'Is this lamp on a smart plug or switch? Pick it here. You then see one lamp, and tapping it switches the power on or off.',
    radar: 'Radar: show where someone is', radar_dist: 'distance', radar_dots: 'position per person', radar_scale: 'First fill in the real width of a room in step 2, otherwise the radar does not know how far a metre is.', radar_angle: 'Which way the sensor looks (degrees, 0 = down)', radar_height: 'On the ceiling? Height of the sensor in metres', radar_wall: 'empty = on the wall',
    wall_color: 'Wall colour (plan, 2.5D and walk)', wall_default: 'Back to default', wall_theme: 'now: the theme’s', room_wall: 'Walls of this room (walk)', room_wall_same: 'now: like all walls', walk_fov: 'Walk: field of view (degrees across; Ctrl + scroll wheel changes it for the moment)', walk_start: 'The tour starts in', walk_start_auto: 'Automatic (at the front door)', motion_fade: 'Motion icon fades out over … minutes (0 = straight away)', height_25d: 'Height of walls and icons in the 2.5D view', perspective: 'Perspective in 2.5D (nearer looks a little bigger)', show_stalks: 'Thin lines from the floor to the icons (2.5D)', turn_ghost: 'Fade the icons while turning (2.5D)', walk_edit: 'Allow editing inside the walk-through (admins only)', turn_ghost_pct: 'Visible while turning, in %', turn_hint: 'Turning in 2.5D: right mouse button (or Shift) and drag; on a phone or tablet twist two fingers. Up/down tilts.', h25_real: 'real size', h25_custom: 'own value (% of real)',
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
    doors_title: 'Deuren, ramen en doorgangen', door: 'Deur', window: 'Raam', opening: 'Open doorgang', doors_tip: 'Kies deur, raam of doorgang en tik op een muur (nog eens op de knop = stoppen). Een doorgang haalt de muur weg, bijvoorbeeld bij een open keuken. Koppel een deur of raam aan zijn sensor: staat hij open, dan wordt hij oranje op de kaart.', o_sensor: 'Sensor (open / dicht)', o_none: '— geen —',
    length: 'Breedte', whole: 'Hele muur', delete: 'Verwijderen', no_walls: 'Teken eerst je ruimtes, dan komen de muren vanzelf.',
    items_title: 'Apparaten op de kaart', wled_auto: 'WLED automatisch instellen', wled_hint: 'Leest elke WLED uit: aantal leds, segmenten en matrix. Segmenten van een strip die je tekende krijgen hun eigen stuk ervan, strips zonder lijn krijgen er een langs de dichtstbijzijnde muur (uitgaande van 60 leds per meter; teken hem na voor de precieze plek), en WLED-lampen worden nooit als plafondlamp gezien.', wled_none: 'Geen WLED gevonden (of niet bereikbaar).', wled_done: 'WLED ingesteld', wled_split: '{n}: verdeeld over {k} segmenten', wled_line: '{n}: lijn van {m} m toegevoegd ({l} leds)', wled_matrix: '{n}: ledmatrix {w}×{h}', wled_off: '{n}: niet bereikbaar', auto_place: 'Alles vanzelf neerzetten', auto_hint: 'Zet lampen, schakelaars, verwarming, gordijnen en tv’s neer in de ruimte waar ze in Home Assistant bij horen.',
    unplaced: 'Nog niet op de kaart', add: 'Toevoegen', search: 'Zoek iets uit Home Assistant…', item: 'Apparaat', show_always: 'Altijd laten zien (ook bij Eenvoudig)', color: 'Kleur van het licht (voor een stekker met een gekleurde lamp)', no_color: 'automatisch', icon: 'Ander icoon (mag leeg)', label: 'Andere naam (mag leeg)',
    remove: 'Van de kaart halen', items_tip: 'Sleep de iconen naar de goede plek. Op je dashboard: tikken = aan/uit, vasthouden = meer info.',
    finish_title: 'Klaar!', theme: 'Thema', usage_days: 'Laat zien wat de laatste … dagen gebruikt is', make_dash: 'Maak een dashboard (Thuis, Plattegrond, Kiosk, Energie, Buiten, TV en een pagina per ruimte)', dash_done: 'Dashboard gemaakt:', dash_conflict: 'Er bestaat al een dashboard op /{url} dat Floorplan Studio niet heeft gemaakt. Het is niet gewijzigd.', dash_error: 'Het dashboard kon niet worden gemaakt: ', open: 'Openen',
    set_title: 'Instellingen', set_intro: 'Dit geldt voor elke kaart met deze plattegrond.',
    set_light: 'Licht', set_screens: 'Telefoon, tablet en 2.5D', set_look: 'Uiterlijk', set_simple: 'Eenvoudig', set_room: 'Tekst bij de ruimtes', set_behaviour: 'Tikken en vasthouden', set_sun: 'Thema Automatisch (zon)', set_auto: 'Alles vanzelf neerzetten',
    default_mode: 'Begint op', none_mode: 'Geen (geen iconen, rustige kaart)', learning_days: 'Laat alles zien zolang er minder dan … dagen geschiedenis is', plan_size: 'Grootte plattegrond in %', icon_size: 'Grootte van alle iconen (%)', label_size: 'Grootte tekst bij ruimtes', glow: 'Sterkte van de gloed',
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
    zoom_all: 'Hele plattegrond', zoom_hint: 'of dubbelklik op een ruimte', zoom_in: 'Inzoomen (Ctrl + scrollwiel)', zoom_out: 'Uitzoomen', zoom_fit: 'Weer alles', measure_pick: 'Echte maten: kies een ruimte en vul in hoe breed of lang die echt is.', measure_done: 'De maten staan in meters. Klopt het niet? Kies een ruimte en pas de echte breedte of lengte aan. Klopt de ene kant wel en de andere niet, dan is de ruimte scheef getekend: maak hem groter of kleiner met de hoekjes.',
    measure_w: 'Echte breedte (m)', measure_l: 'Echte lengte (m)', measure: 'Echte breedte van deze ruimte (meter)', measure_hint: 'Vul bij één ruimte de echte breedte of lengte in; de andere kant volgt uit je tekening. Dan weet de plattegrond hoe groot alles is: je ziet maten in meters, en de radar weet hoe ver 2 meter is.', dims: 'Maat',
    furn_title: 'Meubels en trap', furn_tip: 'Tik op een meubel om het neer te zetten en sleep het daarna naar de goede plek. Op je dashboard is het alleen een lichte omtrek.',
    f_sofa: 'Bank', f_bed: 'Bed', f_table: 'Tafel', f_round: 'Ronde tafel', f_coffee: 'Salontafel', f_radiator: 'Radiator', f_speakerbox: 'Speaker / box', f_desk: 'Bureau', f_counter: 'Aanrecht (blad)', f_cabinet: 'Kast', f_bath: 'Bad', f_shower: 'Douche', f_toilet: 'Wc', f_stairs: 'Trap', f_tv: 'Tv', f_plant: 'Plant',
    f_hob: 'Kookplaat (op het aanrecht)', f_sink: 'Gootsteen', f_stove: 'Fornuis', f_fridge: 'Koelkast', f_island: 'Kookeiland', f_wallcab: 'Bovenkast', lamp_size: 'Lampen (grootte in %)', device_size: 'Andere apparaten (grootte in %)', f_kind: 'Soort', f_w: 'Breedte', f_h: 'Diepte', f_z: 'Hoogte (cm, voor de 2.5D-weergave)', f_chairs: 'Stoelen', f_videowall: 'Camerawand', f_mirror: 'Spiegel', f_model: 'Eigen 3D-model', mdl_file: '3D-model', mdl_none: '– kies of upload –', mdl_upload: 'Upload .glb / .obj', mdl_del: 'Bestand wissen', mdl_del_t: 'Dit modelbestand uit Home Assistant wissen', mdl_del_q: 'Dit 3D-modelbestand uit Home Assistant wissen? Andere meubels die het gebruiken worden een blok.', mdl_up: 'Rechtop', mdl_y: 'Y omhoog (glTF, Blender-export)', mdl_z: 'Z omhoog (SketchUp, 3ds Max, CAD)', mdl_z2: 'Z omhoog, andersom', mdl_hint: 'Je eigen model als meubel: een .glb (uit Blender, Sketchfab, van een fabrikant…) of .obj, tot 40 MB, bewaard in Home Assistant. Het vult de breedte, diepte en hoogte die je geeft; na het uploaden (of met Eigen verhouding) volgen die het model zelf. Texturen geven de kleuren. Ligt hij op zijn kant? Kies een andere Rechtop.', mdl_err: 'Uploaden mislukt', i_rot: 'Gedraaid (graden, in de wandeling)', i_model: 'Eigen 3D-model (wandeling)', i_model_none: 'Geen (het ingebouwde)', i_model_h: 'Hoogte model (m)', i_model_auto: 'gebruikelijk voor wat het is', i_model_hint: 'Je eigen model in plaats van het ingebouwde. Het krijgt een maat en plek die passen bij wat het is: een plafondlamp hangt aan het plafond, een wandlamp of camera aan de muur, een staande lamp op de vloer, de rest op het meubel eronder. Een lamp blijft de kamer verlichten; tik erop om hem te schakelen.', scr_q: 'Projectiescherm: open betekent', scr_down: 'Uitgerold', scr_up: 'Opgerold', mdl_fit: 'Eigen verhouding', mdl_fit_t: 'Diepte en hoogte zoals in het model (de breedte blijft)', f_dishwasher: 'Vaatwasser', f_washer: 'Wasmachine', f_dryer: 'Droger', app_ent: 'Gekoppeld aan (toont of hij draait)', app_on_w: 'Draait vanaf (W, bij een stroommeter)', app_hint: 'Kies de sensor die zegt of hij draait: een status- of draait-sensor, een stroommeter (boven de watts hier = draait) of een schakelaar. Een slimme stekker die altijd aan staat zegt weinig: neem dan zijn vermogenssensor.', vw_from: 'Onderkant (m)', vw_to: 'Bovenkant (m)', vw_cams: "Camera's (niets aangevinkt = alle)", vw_none: "Geen camera's gevonden in Home Assistant.", vw_hint: "Een controlekamer: in de wandeling vult de wand zich met schermen met je camerabeelden (het raster past zich aan de maat aan). Breder maken met de handvatten of het veld breedte.", f_legs: 'Op pootjes: hoogte pootjes (cm), leeg = geen', strip_dir: 'Richting', strip_flat: 'Liggend (langs de lijn, op één hoogte)', strip_up: 'Staand (rechtop bij elk punt)', strip_frame: 'Kader (rechthoek rondom)', strip_frame3: 'Kader open (links, boven, rechts)', strip_from: 'Van (m)', strip_to: 'Tot (m)', strip_up_hint: 'Een rechtopstaande strip bij elk punt dat je tekende, van de eerste tot de tweede hoogte.', strip_seg_hint: 'Met WLED: de leds lopen links omhoog, langs de bovenkant, rechts omlaag (en langs de onderkant terug); met evenveel segmenten als zijden krijgt elke zijde zijn eigen segment.', strip_frame_hint: 'Een rechthoek: de getekende lijn is de breedte, de hoogtes zijn onder- en bovenkant (bijv. rond glas-in-lood of een spiegel).', link_q: 'Hoort bij', link_own: 'Zelf kiezen (hieronder aanvinken)', f_linklight: 'Lamp erin (gloed / ambilight)', f_media: 'Speler (tik = bediening, gloeit als hij speelt)', left: 'links', right: 'rechts', link_auto: 'Automatisch (dichtstbij in deze ruimte)', link_none: 'Niets', link_hint: 'Een lamp achter een tv wordt de ambilight van die tv; een lamp in speakerboxen hun gloed (ook een HDMI-syncbox: kies de tv die hij verlicht).', link_tv_hint: 'De getekende tv die deze speler is (dan heeft hij geen eigen icoon).', idx_title: 'Apparatenoverzicht', idx_hint: 'Elk apparaat in Home Assistant en wat Floorplan Studio ervan maakt. Tik op een ontbrekend apparaat om het op de kaart te zetten (in zijn eigen ruimte).', idx_model: 'Op de kaart, herkend', idx_icon: 'Op de kaart, alleen icoon', idx_missing: 'Nog niet op de kaart', idx_none: 'Niets.', idx_icon_tip: 'Alleen een icoon? Een passend icoon of naam in Home Assistant helpt vaak (bureaulamp, spiegel, openhaard, waterkoker…).', f_shape: 'Vorm', f_sofa_straight: 'Recht', f_sofa_left: 'Hoekbank, lange kant links', f_sofa_right: 'Hoekbank, lange kant rechts', f_mount: 'Bevestiging', f_mount_stand: 'Op voet / meubel', f_mount_wall: 'Aan de muur', f_elev: 'Onderkant scherm boven de vloer (cm)', f_turn: 'Kwartslag draaien',
    more_options_room: 'Meer opties (sensoren, tekst, vloer…)', more_options: 'Meer opties (icoon, kleur, hoogte…)', kind_q: 'Wat zit eraan?', kind_auto: 'automatisch', kind_lamp: 'een lamp (lampicoon en gloed)', kind_device: 'een apparaat, geen licht (geen gloed)', kind_hint: 'Een gewone lamp aan een slimme stekker? Kies “een lamp”: dan ziet hij eruit en gloeit hij als een lamp op de kaart.',
    i_tvheight: 'TV aan de muur: onderkant scherm (m); leeg = op voet/meubel', i_tvstand: 'op voet', i_height: 'Hoogte in meter, bijv. 1,2 (centimeters mag ook: 120); leeg = gebruikelijk', ceil_q: 'Plafondlamp?', spot_q: 'Spot (schijnt één kant op)', spot_aim: 'Richten op de kaart', spot_aiming: 'Klik waar de spot op moet schijnen…', spot_down: 'Recht naar beneden', spot_hint: 'Een gerichte spot toont zijn lichtbundel op de kaart, in 2.5D en in de wandeling (daar kun je ook richten door op een muur of de vloer te klikken).', cur_q: 'Gordijn of rolgordijn bij een raam', cur_auto: 'Automatisch', cur_none: 'Geen gordijn', cur_win: 'Raam', cur_style: 'Soort', cur_split: 'Gordijnen die in het midden opengaan', cur_left: 'Eén gordijn, opent naar links', cur_right: 'Eén gordijn, opent naar rechts', cur_roller: 'Rolgordijn (van boven)', cur_bottom: 'Hangt tot', cur_floor: 'de vloer', cur_sill: 'de vensterbank', cur_own: 'eigen hoogte (m)', cur_hint: 'Op de kaart, in 2.5D en in de wandeling schuift het gordijn open en dicht zoals het echt is.', cur_found: 'gevonden: {w}', cur_nowin: 'geen raam in de buurt – teken het raam bij stap 3 of kies er een', ai: 'AI-hulp', ai_local: 'Floorplan Studio (zonder AI)', ai_local_hint: 'Zonder AI-assistent begrijp ik korte opdrachten zoals “zet Keukenlamp boven de eettafel” of “hang Lamp hal in het midden van de hal op 2,4 m”. Noem het apparaat zoals het in Home Assistant heet. Kies bovenin een AI-assistent voor echte gesprekken.', ai_ph: 'Vraag iets, bijv. zet de keukenlampen boven de eettafel', ai_send: 'Verstuur', ai_agent: 'Assistent', ai_busy: 'Even denken…', ai_saved_first: 'Je wijzigingen zijn eerst opgeslagen, zodat de assistent ze ziet.', ai_err: 'De assistent gaf geen antwoord', ai_hello: 'Hoi! Ik kan apparaten voor je verplaatsen, vertellen wat waar staat, of je op weg helpen. Wat wil je?', ai_s1: 'Welke apparaten staan nog niet op de kaart?', ai_s2: 'Zet de lampen boven de eettafel', ai_s3: 'Zet de bewegingssensoren in de hoek van hun ruimte', ai_proto: 'Je helpt in de Floorplan Studio-editor van Home Assistant. Hieronder: de plattegrond (meters, x naar rechts, y naar beneden) en apparaten die er nog niet op staan. Antwoord ALLEEN met één compact JSON-object, geen andere tekst, geen functies of tools: {"r":"kort antwoord in het Nederlands (max 2 zinnen)","a":[["entity_id","ruimte","plek in max 6 woorden",hoogte_m_of_null,"ceiling|hanging|wall|floor|table|null"]]}. Voorbeelden plek: boven de eettafel, naast de bank, op de vensterbank, linker muur, rechtsboven in de hoek, midden. Maximaal 10 verplaatsingen per antwoord; zijn het er meer, doe dan de eerste 10 en zeg dat de gebruiker "verder" kan typen. Lege a als er niets verplaatst. Alleen een andere hoogte: ruimte en plek null (dan blijft het apparaat staan). Verplaats een LED-strip nooit, tenzij de gebruiker daar echt om vraagt. Vraag:', ai_actions: 'Gedaan op de plattegrond:', ai_again: 'antwoord weer in hetzelfde compacte JSON', ai_sel: 'Over', ai_pick: 'Tip: tik eerst een apparaat aan op de kaart (stap 4); dan gaat je vraag over dat apparaat.', ai_selctx: 'GEKOZEN APPARAAT (de vraag gaat hierover, tenzij er iets anders staat):', ai_toobig: 'Dat was te veel tegelijk voor deze assistent. Vraag het per ruimte of voor een paar apparaten (bijv. “hang de eettafellampen boven de tafel”), of kies bovenin een andere assistent.', ai_ctx: '(Je helpt in de Floorplan Studio-editor van Home Assistant. Om de plattegrond te zien gebruik je de tool FloorplanDescribe of de actie floorplan_studio.describe; om een apparaat te verplaatsen de tool FloorplanPlaceDevice of de actie floorplan_studio.place_device met device, room, spot (gewone woorden zoals boven de eettafel, linker muur, midden), en eventueel height in meter en mount (ceiling, hanging, wall, floor, table). Antwoord kort, in het Nederlands.)', shape_q: 'Vorm op de kaart', shape_icon: 'Icoon', shape_strip: 'Lijn (ledstrip)', strip_draw: 'Lijn tekenen', strip_redraw: 'Opnieuw tekenen', strip_done: 'Klaar', strip_clear: 'Lijn weghalen', strip_hint: 'Tik punt voor punt langs de strip; dubbeltik of Klaar om te stoppen. Lijnen springen naar 45°; houd Shift ingedrukt voor een vrije hoek. De hoogte van de strip zet je onder Meer opties.', strip_len: 'Lengte', strip_none: 'Nog geen lijn getekend.', yes: 'ja', no: 'nee', ceil_auto: 'Automatisch (uit de naam)', ceil_yes: 'Ja, tegen het plafond', ceil_hang: 'Ja, hangend (hanglamp)', hang_h: 'Hangt op (m boven de vloer)', hang_auto: 'hangend', ceil_no: 'Nee (staand, tafel, wand of strip)',
    via: 'Stroom via een slimme schakelaar (mag leeg)', via_hint: 'Zit deze lamp aan een slimme stekker of schakelaar? Kies die hier. Dan zie je één lamp, en tikken zet de stroom aan of uit.',
    radar: 'Radar: laat zien waar iemand is', radar_dist: 'afstand', radar_dots: 'plek per persoon', radar_scale: 'Vul eerst bij stap 2 de echte breedte van een ruimte in, anders weet de radar niet hoe ver een meter is.', radar_angle: 'Kant waar de sensor naar kijkt (graden, 0 = naar beneden)', radar_height: 'Aan het plafond? Hoogte van de sensor in meter', radar_wall: 'leeg = aan de muur',
    wall_color: 'Kleur van de muren (kaart, 2.5D en wandeling)', wall_default: 'Terug naar standaard', wall_theme: 'nu: die van het thema', room_wall: 'Muren van deze ruimte (wandeling)', room_wall_same: 'nu: zoals alle muren', walk_fov: 'Wandeling: beeldhoek (graden in de breedte; Ctrl + scrollwiel past hem even aan)', walk_start: 'De rondleiding begint in', walk_start_auto: 'Automatisch (bij de voordeur)', motion_fade: 'Bewegingsicoontje dooft uit in … minuten (0 = meteen)', height_25d: 'Hoogte van muren en iconen in de 2.5D-weergave', perspective: 'Perspectief in 2.5D (dichterbij is iets groter)', show_stalks: 'Hulplijntjes van de vloer naar de iconen (2.5D)', turn_ghost: 'Iconen vervagen tijdens draaien (2.5D)', walk_edit: 'Bewerken in de wandeling toestaan (alleen beheerders)', turn_ghost_pct: 'Zichtbaar tijdens draaien, in %', turn_hint: 'Draaien in 2.5D: rechtermuisknop (of Shift) ingedrukt en slepen; op telefoon of tablet twee vingers draaien. Omhoog/omlaag kantelt.', h25_real: 'echte maat', h25_custom: 'eigen waarde (% van echt)',
  },
};

const CSS = `
  .aibtn { position: fixed; right: 18px; bottom: 18px; z-index: 5000; display: inline-flex; align-items: center; gap: 8px; height: 44px; padding: 0 16px; border-radius: 22px; border: 0; background: var(--primary-color, #03a9f4); color: #fff; font: inherit; font-weight: 600; cursor: pointer; box-shadow: 0 4px 16px rgba(0,0,0,.35); }
  .aichat { position: fixed; right: 18px; bottom: 18px; z-index: 5000; width: min(380px, calc(100vw - 36px)); height: min(520px, calc(100vh - 120px)); display: flex; flex-direction: column; border-radius: 16px; overflow: hidden; background: var(--card-background-color, #1c1f26); color: var(--primary-text-color, #eee); box-shadow: 0 8px 32px rgba(0,0,0,.45); border: 1px solid var(--divider-color, rgba(255,255,255,.12)); }
  .aihead { display: flex; align-items: center; gap: 8px; padding: 10px 12px; border-bottom: 1px solid var(--divider-color, rgba(255,255,255,.12)); }
  .aihead b { flex: 1; } .aihead select { max-width: 150px; } .aihead button { border: 0; background: none; color: inherit; cursor: pointer; padding: 4px; }
  .aimsgs { flex: 1; overflow-y: auto; padding: 12px; display: flex; flex-direction: column; gap: 8px; }
  .aim { max-width: 85%; padding: 8px 12px; border-radius: 14px; font-size: 14px; line-height: 1.4; white-space: normal; }
  .aim.me { align-self: flex-end; background: var(--primary-color, #03a9f4); color: #fff; border-bottom-right-radius: 4px; }
  .aim.ai { align-self: flex-start; background: rgba(127,127,127,.18); border-bottom-left-radius: 4px; }
  .aim.busy { opacity: .7; font-style: italic; } .aim.note { align-self: center; max-width: 95%; font-size: 12px; opacity: .8; text-align: center; background: none; }
  .aisugg { display: flex; flex-direction: column; gap: 6px; align-items: flex-start; }
  .aisugg button { border: 1px solid var(--divider-color, rgba(255,255,255,.2)); background: none; color: inherit; border-radius: 12px; padding: 6px 10px; font: inherit; font-size: 13px; cursor: pointer; text-align: left; }
  .aisel { display: flex; align-items: center; gap: 6px; padding: 6px 12px; font-size: 13px; border-top: 1px solid var(--divider-color, rgba(255,255,255,.12)); } .aisel ha-icon { --mdc-icon-size: 16px; color: var(--primary-color, #03a9f4); } .aisel.tip { opacity: .7; font-size: 12px; }
  .aiform { display: flex; gap: 6px; padding: 10px; border-top: 1px solid var(--divider-color, rgba(255,255,255,.12)); }
  .aiform input { flex: 1; min-width: 0; }
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
  .doors-mode.placing .wall { pointer-events: stroke; cursor: crosshair; stroke-opacity: 1; }
  .doors-mode.placing .wall:hover { stroke: var(--primary-color); }
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
  .zoombar { display: flex; align-items: center; gap: 8px; align-self: stretch; font-size: 13px; } .zoombar select { width: auto; min-width: 180px; } .zoombar small { color: var(--secondary-text-color); } .zoombar ha-icon { --mdc-icon-size: 20px; color: var(--secondary-text-color); } .zoombar .zb { flex: none; width: 32px; height: 32px; min-width: 32px; padding: 0; display: inline-grid; place-items: center; border-radius: 50%; }
  .furn { fill: #ffffff; fill-opacity: .05; stroke: #d7dee8; stroke-opacity: .7; stroke-width: 1.5; pointer-events: none; }
  .furn .arrow { fill: none; }
  .doors-mode .furn { pointer-events: visiblePainted; cursor: move; }
  .handle.fh { fill: #fff; stroke: var(--primary-color, #03a9f4); stroke-width: 2; cursor: nwse-resize; } .handle.fh.side { cursor: ew-resize; }
  .fsel .furn { stroke: var(--primary-color); stroke-opacity: 1; stroke-width: 2.5; fill: var(--primary-color); fill-opacity: .12; }
  .furnbtns { display: grid; grid-template-columns: repeat(auto-fill, minmax(92px, 1fr)); gap: 6px; margin-bottom: 10px; }
  .furnbtns button { flex-direction: column; font-size: 12px; padding: 6px 4px; }
  .furnbtns ha-icon { --mdc-icon-size: 22px; }
  .rsize { fill: #fff; fill-opacity: .8; font-size: 11px; pointer-events: none; paint-order: stroke; stroke: rgba(0,0,0,.6); stroke-width: 3px; }
  .dimline line { stroke: #ffd54f; stroke-width: 1.5; pointer-events: none; }
  .dimline text, .fsize { fill: #ffd54f; font-size: 12px; font-weight: 600; pointer-events: none; paint-order: stroke; stroke: rgba(0,0,0,.75); stroke-width: 3px; }
  .aimline line { stroke: #ffd54f; stroke-width: 2; stroke-dasharray: 6 5; pointer-events: none; } .aimline circle { fill: none; stroke: #ffd54f; stroke-width: 2; pointer-events: none; }
  .aiming svg { cursor: crosshair; }
  .strip { fill: none; stroke: #ffb74d; stroke-width: 5; stroke-linecap: round; stroke-linejoin: round; opacity: .75; pointer-events: none; }
  .strip.sel, .strip.draw { opacity: 1; stroke: #ffd54f; filter: drop-shadow(0 0 4px rgba(255,200,80,.8)); }
  .strip.rubber { stroke-dasharray: 6 6; }
  .strippt { fill: #fff; stroke: #ffb74d; stroke-width: 2; pointer-events: none; }
  .drawing-strip svg { cursor: crosshair; } .drawing-strip .it { pointer-events: none; opacity: .5; }
  .rrange { fill: rgba(3,169,244,.08); stroke: #03a9f4; stroke-width: 1.5; stroke-dasharray: 6 5; pointer-events: none; }
  .sizeline { font-size: 13px; margin: -4px 0 10px; color: var(--primary-text-color); }
`;

/** Lamps and plugs/switches with a lamp on them: these can be drawn as a line (LED strip). */
const lampish = (it) => it.entity_id.startsWith('light.') || it.kind === 'lamp' || (['switch', 'input_boolean'].includes(it.entity_id.split('.')[0]) && it.kind !== 'device');
const ROOM_COLORS = ['#f2a541', '#4fc3f7', '#81c784', '#ba68c8', '#ff8a65', '#4db6ac', '#f06292', '#aed581', '#7986cb', '#ffd54f', '#90a4ae', '#e57373'];
const uid = (p) => `${p}${Math.random().toString(36).slice(2, 8)}`;

class FloorplanStudioPanel extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.step = 0;
    this.tool = 'draw';
    this.doorType = null;   // step 3: nothing is placed on a wall until you pick door, window or opening
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

  /* ------------------------------------------------------------ AI chat */
  /** A chat with the AI assistant of Home Assistant, which can move devices on the plan for you. */
  chatHTML() {
    const l = this.L, c = (this._chat = this._chat || { open: false, msgs: [], draft: '', busy: false });
    if (!c.open) return `<button class="aibtn" id="aiopen"><ha-icon icon="mdi:robot-outline"></ha-icon>${l.ai}</button>`;
    const agents = c.agents || [];
    const msgs = c.msgs.length ? c.msgs : [{ who: 'ai', text: l.ai_hello }];
    return `<div class="aichat">
      <div class="aihead"><ha-icon icon="mdi:robot-outline"></ha-icon><b>${l.ai}</b>
        ${agents.length ? `<select id="aiagent" title="${l.ai_agent}">${agents.map((a) => `<option value="${esc(a.id)}" ${a.id === c.agent ? 'selected' : ''}>${esc(a.name)}</option>`).join('')}</select>` : ''}
        <button id="aiclose" title="×"><ha-icon icon="mdi:close"></ha-icon></button></div>
      <div class="aimsgs" id="aimsgs">${msgs.map((m) => `<div class="aim ${m.who}">${esc(m.text).replace(/\n/g, '<br>')}</div>`).join('')}
        ${c.busy ? `<div class="aim ai busy">${l.ai_busy}</div>` : ''}
        ${!c.msgs.length ? `<div class="aisugg">${[l.ai_s1, l.ai_s2, l.ai_s3].map((t) => `<button data-sugg="${esc(t)}">${esc(t)}</button>`).join('')}</div>` : ''}
        ${c.agent === 'fps-local' && !c.msgs.length ? `<div class="aim note">${l.ai_local_hint}</div>` : ''}</div>
      ${(() => { const si = this.sel?.type === 'item' ? this.plan.items.find((i) => i.entity_id === this.sel.id) : null; return si ? `<div class="aisel"><ha-icon icon="mdi:target"></ha-icon>${l.ai_sel}: <b>${esc(si.name || friendly(this._hass, si.entity_id))}</b></div>` : `<div class="aisel tip">${l.ai_pick}</div>`; })()}
      <form class="aiform" id="aiform"><input id="aiinput" placeholder="${esc(l.ai_ph)}" value="${esc(c.draft)}" ${c.busy ? 'disabled' : ''} autocomplete="off"><button class="primary" ${c.busy ? 'disabled' : ''} title="${l.ai_send}"><ha-icon icon="mdi:send"></ha-icon></button></form>
    </div>`;
  }
  wireChat() {
    const $ = (s) => this.shadowRoot.querySelector(s), c = this._chat;
    $('#aiopen')?.addEventListener('click', async () => { c.open = true; this.render(); await this.loadAgents(); this.render(); $('#aiinput')?.focus(); });
    $('#aiclose')?.addEventListener('click', () => { c.open = false; this.render(); });
    $('#aiagent')?.addEventListener('change', (ev) => { c.agent = ev.target.value; c.conv = null; c.ctx = null; try { localStorage.setItem('fps-ai-agent', c.agent); } catch (e) { /* ignore */ } this.render(); });
    $('#aiinput')?.addEventListener('input', (ev) => { c.draft = ev.target.value; });
    $('#aiform')?.addEventListener('submit', (ev) => { ev.preventDefault(); this.askAI(c.draft); });
    this.shadowRoot.querySelectorAll('[data-sugg]').forEach((b) => b.addEventListener('click', () => this.askAI(b.dataset.sugg)));
    const box = $('#aimsgs'); if (box) box.scrollTop = box.scrollHeight;
  }
  async loadAgents() {
    const c = this._chat, h = this._hass, lang = h.locale?.language || h.language || 'en';
    if (c.agents) return;
    let list = [];
    try { list = (await h.callWS({ type: 'conversation/agent/list', language: lang })).agents || []; } catch (e) { list = []; }
    // the built-in agent can't use tools; "Floorplan Studio" understands short commands without any AI
    c.agents = [{ id: 'fps-local', name: this.L.ai_local }, ...list.filter((a) => !['conversation.home_assistant', 'homeassistant'].includes(a.id))];
    let saved = null;
    try { saved = localStorage.getItem('fps-ai-agent'); } catch (e) { /* ignore */ }
    if (saved && c.agents.some((a) => a.id === saved)) { c.agent = saved; return; }
    // the agent of the preferred voice assistant, otherwise the first one that is not the built-in agent
    try {
      const pl = await h.callWS({ type: 'assist_pipeline/pipeline/list' });
      const pref = (pl.pipelines || []).find((p) => p.id === pl.preferred_pipeline);
      if (pref?.conversation_engine && c.agents.some((a) => a.id === pref.conversation_engine)) c.agent = pref.conversation_engine;
    } catch (e) { /* ignore */ }
    if (!c.agent) c.agent = 'fps-local';
  }
  async askAI(text) {
    const c = this._chat, l = this.L, h = this._hass;
    text = (text || '').trim();
    if (!text || c.busy) return;
    c.msgs.push({ who: 'me', text }); c.draft = ''; c.busy = true;
    // the assistant works on the saved plan: save first, so it sees what you just changed
    if (this.dirty && this.plan.id) { await this.save(); c.msgs.push({ who: 'note', text: l.ai_saved_first }); }
    this.render();
    try {
      if (c.agent === 'fps-local') {
        // no AI: the integration reads the sentence itself
        const si = this.sel?.type === 'item' ? this.plan.items.find((i) => i.entity_id === this.sel.id) : null;
        const r = await h.callWS({ type: 'call_service', domain: 'floorplan_studio', service: 'place_device', service_data: si ? { device: si.entity_id, spot: text } : { text }, return_response: true });
        c.msgs.push({ who: 'ai', text: r.response?.message || '…' });
      } else {
        // any AI assistant: it gets the plan and answers with a small JSON list of moves, which the integration
        // then carries out - so it works with every assistant, without setting up tools or functions
        const svc = (service, data) => h.callWS({ type: 'call_service', domain: 'floorplan_studio', service, service_data: data, return_response: true }).then((r) => r.response);
        const plan = await svc('describe', {});
        const placed = new Set((this.plan.items || []).map((i) => i.entity_id));
        const unplaced = this.plan.rooms.filter((r) => r.area_id).flatMap((r) => placeCandidates(h, r.area_id).filter((id) => !placed.has(id)).map((id) => `${id} "${friendly(h, id)}" (${r.name})`));
        // a short text version of the plan, so it fits any assistant's limits
        const f1 = (v) => Math.round(v * 10) / 10;
        const planTxt = (plan.plans || []).filter((pl) => pl.id === this.plan.id || (plan.plans || []).length === 1).flatMap((pl) => pl.rooms.map((r) => `${r.name} [${r.box_m.map(f1).join(',')}]` + (r.windows?.length ? ` windows: ${r.windows.map((w) => `${f1(w.x_m)},${f1(w.y_m)} (${f1(w.w_m)} m)`).join('; ')}` : '') + (r.furniture.length ? ` furniture: ${r.furniture.map((f) => `${f.type}@${f1(f.x_m)},${f1(f.y_m)}`).join('; ')}` : '')
          + (r.devices.length ? ` devices: ${r.devices.map((d) => `${d.entity_id}${d.name && !d.entity_id.endsWith(d.name.toLowerCase().replace(/\s+/g, '_')) ? ` "${d.name}"` : ''}@${f1(d.x_m)},${f1(d.y_m)}${d.height_m != null ? ` h${d.height_m}` : ''}${d.strip ? ' LED-strip' : ''}`).join('; ')}` : ''))).join('\n');
        const ctx = `PLAN:\n${planTxt}\n\nNOT ON THE PLAN YET: ${unplaced.slice(0, 60).join('; ') || '-'}`;
        // the plan only goes along when the assistant hasn't seen this version yet (keeps every message small)
        const si = this.sel?.type === 'item' ? this.plan.items.find((i) => i.entity_id === this.sel.id) : null;
        const q = si ? `${text}\n${l.ai_selctx} ${si.entity_id} "${si.name || friendly(h, si.entity_id)}"` : text;
        const prompt = c.conv && c.ctx === ctx ? `${q}\n(${l.ai_again})` : `${l.ai_proto} ${q}\n\n${ctx}`;
        c.ctx = ctx;
        const r = await h.callWS({ type: 'conversation/process', text: prompt, agent_id: c.agent, conversation_id: c.conv || undefined, language: h.locale?.language || h.language });
        c.conv = r.conversation_id || c.conv;
        const said = r.response?.speech?.plain?.speech || '';
        let parsed = null;
        try { const a = said.indexOf('{'), b = said.lastIndexOf('}'); if (a >= 0 && b > a) parsed = JSON.parse(said.slice(a, b + 1)); } catch (e) { parsed = null; }
        if (!parsed && /token length|max(imum)?[_ ]tokens|context length|too long/i.test(said)) c.msgs.push({ who: 'note', text: l.ai_toobig });
        else if (!parsed) c.msgs.push({ who: 'ai', text: said || r.response?.data?.code || '…' });
        else {
          const reply = parsed.r ?? parsed.reply, acts = parsed.a ?? parsed.actions;
          if (reply) c.msgs.push({ who: 'ai', text: String(reply) });
          const done = [];
          for (const raw of Array.isArray(acts) ? acts.slice(0, 25) : []) {
            const act = Array.isArray(raw) ? { device: raw[0], room: raw[1], spot: raw[2], height: raw[3], mount: raw[4] } : raw;
            if (!act || !act.device) continue;
            const data = { device: String(act.device) };
            for (const k of ['room', 'spot']) if (act[k] && act[k] !== 'null') data[k] = String(act[k]);
            if (act.height != null && Number.isFinite(+act.height)) data.height = +act.height;
            if (['ceiling', 'hanging', 'wall', 'floor', 'table'].includes(act.mount)) data.mount = act.mount;
            try { done.push((await svc('place_device', data))?.message || act.device); } catch (e) { done.push(`${act.device}: ${e.message || e}`); }
          }
          if (done.length) c.msgs.push({ who: 'note', text: `${l.ai_actions}\n${done.join('\n')}` });
          if (!reply && !done.length) c.msgs.push({ who: 'ai', text: said });
        }
      }
    } catch (e) { c.msgs.push({ who: 'note', text: `${l.ai_err}: ${e.message || e.code || e}` }); }
    c.busy = false;
    // show what the assistant changed
    try {
      this.plans = await loadPlans(h, true);
      const fresh = this.plans.find((p) => p.id === this.plan.id);
      if (fresh && fresh.updated !== this.plan.updated && !this.dirty) this.plan = structuredClone(fresh);
    } catch (e) { /* ignore */ }
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
      </div>${this.chatHTML()}`;
    this.wire();
    this.wireChat();
  }

  /** The part of the plan the canvas shows: everything, or one room (zoomed in) with a little space around it. */
  viewBox() {
    const p = this.plan, W = safeNumber(p.width, 1000), H = safeNumber(p.height, 700);
    const on = this.step >= 1 && this.step <= 3, r = this.zoom && on ? this.room(this.zoom) : null;
    let bx = 0, by = 0, bw = W, bh = H;
    if (r) { const [x0, y0, x1, y1] = roomBBox(r), pad = Math.max(30, (x1 - x0) * 0.12, (y1 - y0) * 0.12); [bx, by, bw, bh] = [x0 - pad, y0 - pad, x1 - x0 + 2 * pad, y1 - y0 + 2 * pad]; }
    // free zoom on top of that (the + / − buttons, Ctrl + scroll wheel or pinching): same shape, a part of it
    const z = on ? this.fz : null;
    if (!z || !(z.k > 1)) return [bx, by, bw, bh];
    const vw = bw / z.k, vh = bh / z.k;
    z.cx = Math.max(bx + vw / 2, Math.min(bx + bw - vw / 2, z.cx ?? bx + bw / 2));
    z.cy = Math.max(by + vh / 2, Math.min(by + bh - vh / 2, z.cy ?? by + bh / 2));
    return [z.cx - vw / 2, z.cy - vh / 2, vw, vh];
  }
  /** Zoom by a factor, keeping the plan point (px, py) under the same spot (or the middle). */
  zoomBy(f, px, py) {
    const [vx, vy, vw, vh] = this.viewBox(), k0 = this.fz?.k || 1, k = Math.max(1, Math.min(10, k0 * f));
    if (k === k0) return;
    if (k <= 1.001) { this.fz = null; this._zr(); return; }
    const fx = px == null ? 0.5 : (px - vx) / vw, fy = py == null ? 0.5 : (py - vy) / vh, nw = (vw * k0) / k, nh = (vh * k0) / k;
    const X = px ?? vx + vw / 2, Y = py ?? vy + vh / 2;
    this.fz = { k, cx: X - fx * nw + nw / 2, cy: Y - fy * nh + nh / 2 };
    this._zr();
  }
  /** Redraw after zooming / panning, at most once per frame. */
  _zr() { if (this._zraf) return; this._zraf = requestAnimationFrame(() => { this._zraf = 0; this.render(); }); }

  /** Upload a 3D model file to Home Assistant in parts (shows the progress in prog); returns { file, url, size }. */
  async _uploadModel(file, prog) {
    const id = Math.random().toString(36).slice(2, 12).padEnd(8, 'x'), CH = 256 * 1024, bytes = new Uint8Array(await file.arrayBuffer());
    let res = null;
    for (let off = 0, part = 0; off < bytes.length || part === 0; off += CH, part++) {
      const sl = bytes.subarray(off, Math.min(bytes.length, off + CH));
      let bin = ''; for (let i = 0; i < sl.length; i += 0x8000) bin += String.fromCharCode.apply(null, sl.subarray(i, i + 0x8000));
      res = await this._hass.connection.sendMessagePromise({ type: 'floorplan_studio/model/upload', name: file.name, upload_id: id, part, data: btoa(bin), last: off + CH >= bytes.length });
      if (prog) prog.textContent = `${Math.min(100, Math.round(((off + CH) / bytes.length) * 100))}%`;
    }
    this._models = [...(this._models || []).filter((m) => m.file !== res.file), { file: res.file, url: res.url, size: res.size }];
    return res;
  }
  /** The uploaded 3D models (loaded once). */
  modelList() {
    if (!this._models) { this._models = []; this._hass?.connection.sendMessagePromise({ type: 'floorplan_studio/model/list' }).then((r) => { this._models = r.models || []; this.render(); }).catch(() => {}); }
    return this._models;
  }

  /** "Zoom in on" picker above the steps that work on the drawing. */
  zoomBar() {
    const l = this.L, p = this.plan;
    if (!p.rooms.length) return '';
    return `<div class="zoombar"><ha-icon icon="mdi:magnify-plus-outline"></ha-icon><select id="zoomsel"><option value="">${l.zoom_all}</option>${p.rooms.map((r) => `<option value="${esc(r.id)}" ${this.zoom === r.id ? 'selected' : ''}>${esc(r.name || '?')}</option>`).join('')}</select><small>${l.zoom_hint}</small><span style="flex:1"></span><button class="zb" id="zout" title="${l.zoom_out}"><ha-icon icon="mdi:minus"></ha-icon></button><small id="zpct" style="min-width:42px;text-align:center">${Math.round((this.fz?.k || 1) * 100)}%</small><button class="zb" id="zin" title="${l.zoom_in}"><ha-icon icon="mdi:plus"></ha-icon></button>${this.fz ? `<button class="zb" id="zfit" title="${l.zoom_fit}"><ha-icon icon="mdi:fit-to-screen-outline"></ha-icon></button>` : ''}</div>`;
  }

  canvasHTML() {
    const p = this.plan, W = safeNumber(p.width, 1000), H = safeNumber(p.height, 700), g = safeNumber(p.grid, 10) || 10;
    const out = [];
    const [vx, vy, vw, vh] = this.viewBox();
    const ratio = vw / vh;
    out.push(`<div class="canvas ${this.step === 2 ? `doors-mode ${this.doorType ? 'placing' : ''}` : ''} ${this.stripDraw && this.step === 3 ? 'drawing-strip' : ''} ${this.aimFor && this.step === 3 ? 'aiming drawing-strip' : ''}" id="canvas" style="width: min(100%, calc((100vh - 150px) * ${ratio})); aspect-ratio: ${vw} / ${vh};">`);
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
    if (fs) {
      // handles to resize with the mouse: corners change width and depth together, sides just one of them
      const r = (safeNumber(fs.rot) * Math.PI) / 180, cr = Math.cos(r), sr = Math.sin(r), hw = safeNumber(fs.w, 100) / 2, hd = safeNumber(fs.h, 60) / 2;
      for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1], [0, -1], [1, 0], [0, 1], [-1, 0]]) {
        const lx = sx * hw, ly = sy * hd, X = safeNumber(fs.x) + lx * cr - ly * sr, Y = safeNumber(fs.y) + lx * sr + ly * cr, corner = sx && sy;
        out.push(`<rect class="handle fh ${corner ? 'corner' : 'side'}" data-fhandle="${sx},${sy}" x="${X - (corner ? 6 : 5)}" y="${Y - (corner ? 6 : 5)}" width="${corner ? 12 : 10}" height="${corner ? 12 : 10}" rx="${corner ? 3 : 5}"/>`);
      }
    }
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
    // LED strips: their line, and in step 4 how long each piece is
    for (const it of p.items) {
      const sp = stripPath(it);
      if (!sp || this.stripDraw === it.entity_id) continue;
      const selS = this.sel?.type === 'item' && this.sel.id === it.entity_id;
      out.push(`<polyline class="strip ${selS ? 'sel' : ''}" points="${sp.map((q) => q.join(',')).join(' ')}"/>`);
      if (sc && this.step === 3 && selS) for (let i = 1; i < sp.length; i++) {
        const [ax, ay] = sp[i - 1], [bx, by] = sp[i];
        out.push(`<text class="fsize" x="${(ax + bx) / 2}" y="${(ay + by) / 2 - 7}" text-anchor="middle">${m(Math.hypot(bx - ax, by - ay))} m</text>`);
      }
    }
    {
      const si = this.step === 3 && this.sel?.type === 'item' ? p.items.find((i) => i.entity_id === this.sel.id) : null;
      if (si?.aim) out.push(`<g class="aimline"><line x1="${safeNumber(si.x)}" y1="${safeNumber(si.y)}" x2="${safeNumber(si.aim.x)}" y2="${safeNumber(si.aim.y)}"/><circle cx="${safeNumber(si.aim.x)}" cy="${safeNumber(si.aim.y)}" r="9"/><circle cx="${safeNumber(si.aim.x)}" cy="${safeNumber(si.aim.y)}" r="2.5"/></g>`);
    }
    if (this.stripDraw && this.step === 3) {
      const pts = this.stripPts || [];
      out.push(`<polyline class="strip draw" id="stripline" points="${pts.map((q) => q.join(',')).join(' ')}"/>${pts.map(([x, y]) => `<circle class="strippt" cx="${x}" cy="${y}" r="4"/>`).join('')}<line class="strip draw rubber" id="striprubber" x1="0" y1="0" x2="0" y2="0" style="display:none"/><text class="fsize" id="striplen" text-anchor="middle"></text>`);
    }
    out.push('<rect class="draft" id="draft" width="0" height="0"/></svg>');
    out.push(`<div class="items ${this.step === 3 ? '' : 'off'}" id="items">`);
    for (const it of p.items) {
      const d = it.entity_id.split('.')[0];
      const dev = it.kind === 'device' || (it.kind !== 'lamp' && !['light', 'switch', 'input_boolean', 'fan'].includes(d));
      out.push(`<div class="it ${dev ? 'dev' : ''} ${this.sel?.type === 'item' && this.sel.id === it.entity_id ? 'sel' : ''}" data-item="${esc(it.entity_id)}" style="left:${((safeNumber(it.x) - vx) / vw) * 100}%;top:${((safeNumber(it.y) - vy) / vh) * 100}%">${(() => { const st = this._hass?.states[it.entity_id], ic = it.icon || (!st?.attributes?.icon && (it.entity_id.startsWith('light.') || it.kind === 'lamp') && isCeilingLamp(it, st) ? 'mdi:ceiling-light' : ''); return ic ? `<ha-icon icon="${esc(ic)}"></ha-icon>` : '<ha-state-icon></ha-state-icon>'; })()}<span class="tip">${esc(it.name || friendly(this._hass, it.entity_id))}</span></div>`);
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
          <div class="field"><span>${l.room_wall}</span><div class="row"><input type="color" id="rwallc" value="${/^#[0-9a-f]{6}$/i.test(r.wall_color || '') ? r.wall_color : /^#[0-9a-f]{6}$/i.test(p.settings?.wall_color || '') ? p.settings.wall_color : '#ede8de'}" style="flex:none;width:52px;height:34px">${r.wall_color ? `<button id="rwallx">${l.wall_default}</button>` : `<small class="hint">${l.room_wall_same}</small>`}</div></div>
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
          ${f.type === 'videowall' ? (() => {
            const [b0, b1] = videoWallSpan(f), allCams = videoWallCams({}, this._hass), sel = Array.isArray(f.cams) ? f.cams : [];
            return `<div class="field"><span>${l.vw_from}</span><input type="number" id="vwbot" min="0" max="3" step="0.05" value="${String(b0).replace('.', ',')}"></div>
              <div class="field"><span>${l.vw_to}</span><input type="number" id="vwtop" min="0.3" max="3.2" step="0.05" value="${String(b1).replace('.', ',')}"></div>
              <div class="field"><span>${l.vw_cams}</span><div class="list" style="max-height:220px;overflow:auto">${allCams.map((id) => `<label class="row" style="font-size:13px"><input type="checkbox" data-vwcam="${esc(id)}" ${sel.includes(id) ? 'checked' : ''} style="flex:none">${esc(friendly(this._hass, id))}</label>`).join('') || `<p class="hint">${l.vw_none}</p>`}</div></div>
              <p class="hint">${l.vw_hint}</p>`;
          })() : ''}
          ${f.type === 'model' ? (() => {
            if (!this._models) { this._models = []; this._hass?.connection.sendMessagePromise({ type: 'floorplan_studio/model/list' }).then((r) => { this._models = r.models || []; this.render(); }).catch(() => {}); }
            const ms = this._models, cur = f.model || '';
            return `<div class="field"><span>${l.mdl_file}</span><select id="fmodel"><option value="">${l.mdl_none}</option>${ms.map((m) => `<option value="${esc(m.url)}" ${cur === m.url ? 'selected' : ''}>${esc(m.file.replace(/-[0-9a-f]{10}(\.\w+)$/, '$1'))} (${(m.size / 1048576).toFixed(1)} MB)</option>`).join('')}</select></div>
              <div class="row" style="gap:8px;flex-wrap:wrap"><button id="fmup"><ha-icon icon="mdi:upload"></ha-icon>${l.mdl_upload}</button>${cur ? `<button id="fmfit" title="${l.mdl_fit_t}"><ha-icon icon="mdi:aspect-ratio"></ha-icon>${l.mdl_fit}</button>` : ''}${cur ? `<button id="fmdel" title="${l.mdl_del_t}"><ha-icon icon="mdi:delete-outline"></ha-icon>${l.mdl_del}</button>` : ''}<input type="file" id="fmfile" accept=".glb,.gltf,.obj" style="display:none"><small id="fmprog"></small></div>
              <div class="field"><span>${l.mdl_up}</span><select id="fmupax">${[['', l.mdl_y], ['z', l.mdl_z], ['-z', l.mdl_z2]].map(([k, t]) => `<option value="${k}" ${(f.up || '') === k ? 'selected' : ''}>${t}</option>`).join('')}</select></div>
              <p class="hint">${l.mdl_hint}</p>`;
          })() : ''}
          ${['dishwasher', 'washer', 'dryer'].includes(f.type) ? (() => {
            const hs = this._hass, auto = applianceEntity(this.plan, { ...f, entity: undefined }, hs), cur = f.entity || '';
            const cand = Object.keys(hs?.states || {}).filter((id) => /^(binary_sensor|sensor|switch|input_boolean|input_select|select)\./.test(id) && (!id.startsWith('sensor.') || isNaN(parseFloat(hs.states[id].state)) || /^k?W$/.test(hs.states[id].attributes?.unit_of_measurement || '')))
              .sort((a, b) => friendly(hs, a).localeCompare(friendly(hs, b)));
            const o = (id) => `<option value="${esc(id)}" ${cur === id ? 'selected' : ''}>${esc(friendly(hs, id))} (${esc(id)})</option>`;
            return `<div class="field"><span>${l.app_ent}</span><select id="fapp"><option value="">${l.link_auto}${auto ? ` – ${esc(friendly(hs, auto))}` : ''}</option><option value="-" ${f.entity === '' ? 'selected' : ''}>${l.link_none}</option>${cand.map(o).join('')}</select></div>
              <div class="field"><span>${l.app_on_w}</span><input type="number" id="fappw" min="0" max="3000" step="1" placeholder="8" value="${f.on_w ?? ''}"></div>
              <p class="hint">${l.app_hint}</p>`;
          })() : ''}
          ${['speakerbox', 'tv'].includes(f.type) ? (() => {
            const hs = this._hass, lamps = p.items.filter((i) => i.entity_id.startsWith('light.') && !stripPath(i));
            const own = lamps.find((i) => (Array.isArray(i.link) ? i.link : [i.link]).includes(f.id));
            const auto = own ? null : lamps.find((i) => i.link == null && (f.type === 'tv' ? ambilightTv(p, i, hs?.states[i.entity_id]) === f : speakerBoxes(p, i, hs?.states[i.entity_id]).includes(f)));
            const players = Object.keys(hs?.states || {}).filter((id) => id.startsWith('media_player.')).sort((a2, b2) => friendly(hs, a2).localeCompare(friendly(hs, b2)));
            const media = f.type === 'speakerbox' ? `<div class="field"><span>${l.f_media}</span><select id="fmedia"><option value="">${l.link_none}</option>${players.map((id) => `<option value="${esc(id)}" ${f.media === id ? 'selected' : ''}>${esc(friendly(hs, id))}</option>`).join('')}</select></div>` : '';
            return media + `<div class="field"><span>${l.f_linklight}</span><select id="flinklight"><option value="">${l.link_auto}${auto ? ` – ${esc(friendly(hs, auto.entity_id))}` : ''}</option>${lamps.map((i) => `<option value="${esc(i.entity_id)}" ${own === i ? 'selected' : ''}>${esc(i.name || friendly(hs, i.entity_id))}</option>`).join('')}</select></div>`;
          })() : ''}
          ${f.type === 'mirror' ? (() => { const [b0, b1] = videoWallSpan(f); return `<div class="field"><span>${l.vw_from}</span><input type="number" id="vwbot" min="0" max="3" step="0.05" value="${String(b0).replace('.', ',')}"></div><div class="field"><span>${l.vw_to}</span><input type="number" id="vwtop" min="0.2" max="3.2" step="0.05" value="${String(b1).replace('.', ',')}"></div>`; })() : ''}
          ${f.type === 'cabinet' ? `<div class="field"><span>${l.f_legs}</span><input type="number" id="flegs" min="0" max="150" step="1" placeholder="0" value="${f.legs ? Math.round(f.legs * 100) : ''}"></div>` : ''}
          ${f.type === 'sofa' ? `<div class="field"><span>${l.f_shape}</span><select id="fshape">${[['', l.f_sofa_straight], ['left', l.f_sofa_left], ['right', l.f_sofa_right]].map(([k, t]) => `<option value="${k}" ${(f.shape || '') === k ? 'selected' : ''}>${t}</option>`).join('')}</select></div>` : ''}
          ${['table', 'round'].includes(f.type) ? `<div class="field"><span>${l.f_chairs}</span><input type="number" id="fchairs" min="0" max="20" step="1" placeholder="${f.type === 'round' ? 4 : Math.max(1, Math.floor(f.w / 60)) * 2}" value="${f.chairs ?? ''}"></div>` : ''}
          ${f.type === 'tv' ? `<div class="field"><span>${l.f_mount}</span><select id="fmount"><option value="">${l.f_mount_stand}</option><option value="wall" ${f.mount === 'wall' ? 'selected' : ''}>${l.f_mount_wall}</option></select></div>` : ''}
          ${f.type === 'tv' && f.mount === 'wall'
            ? `<div class="field"><span>${l.f_elev}</span><input type="number" id="felev" min="0" max="250" step="5" placeholder="100" value="${f.elev != null ? Math.round(f.elev * 100) : ''}"></div>`
            : `<div class="field"><span>${l.f_z}</span><input type="number" id="fz" min="0" max="400" step="5" placeholder="${Math.round((FURN_HEIGHT[f.type] || 0) * 100)}" value="${f.z != null ? Math.round(f.z * 100) : ''}"></div>`}
          <div class="row"><button id="fturn"><ha-icon icon="mdi:rotate-right"></ha-icon>${l.f_turn}</button><button class="danger" id="fdel">${l.delete}</button></div></div>`;
      })()}
      ${this.navHTML()}`;
  }

  /** Step 4: every device in Home Assistant and what Floorplan Studio makes of it, with what is still missing. */
  indexHTML() {
    const l = this.L, p = this.plan, h = this._hass, rows = deviceIndex(p, h, (h?.locale?.language || 'en').slice(0, 2) === 'nl' ? 'nl' : 'en');
    const groups = [['model', l.idx_model, rows.filter((r) => r.placed && r.model)], ['icon', l.idx_icon, rows.filter((r) => r.placed && !r.model)], ['missing', l.idx_missing, rows.filter((r) => !r.placed)]];
    const roomFor = (r) => p.rooms.find((x) => x.area_id && x.area_id === r.area_id) || p.rooms[0];
    return `<div class="card idx">
      <p class="hint">${l.idx_hint}</p>
      ${groups.map(([k, title, list]) => `<details ${k !== 'model' ? 'open' : ''} style="margin-top:6px"><summary style="cursor:pointer"><b style="display:inline">${title}</b> (${list.length})</summary>
        <div class="list">${list.map((r) => `<div class="li" ${k === 'missing' && roomFor(r) ? (['dishwasher', 'washer', 'dryer'].includes(r.what) ? `data-idxfurn="${r.what}" data-room="${esc(roomFor(r).id)}"` : `data-additem="${esc(r.entity_id)}" data-room="${esc(roomFor(r).id)}"`) : ''} title="${esc(r.entity_id)}"><ha-state-icon data-sid="${esc(r.entity_id)}"></ha-state-icon><span>${esc(r.name)}<small style="display:block;opacity:.7">${esc([r.area, r.what].filter(Boolean).join(' · '))}</small></span>${k === 'missing' && roomFor(r) ? `<small>+ ${l.add}</small>` : ''}</div>`).join('') || `<p class="hint">${l.idx_none}</p>`}</div></details>`).join('')}
      ${groups[1][2].length ? `<p class="hint">${l.idx_icon_tip}</p>` : ''}
    </div>`;
  }

  sideItems() {
    const l = this.L, p = this.plan, h = this._hass;
    const placed = new Set(p.items.map((i) => i.entity_id));
    const it = this.sel?.type === 'item' ? p.items.find((x) => x.entity_id === this.sel.id) : null;
    const groups = p.rooms.filter((r) => r.area_id).map((r) => [r, areaEntities(h, r.area_id, PLACE_DOMAINS).filter((id) => !placed.has(id))]).filter(([, ids]) => ids.length);
    return `<h2>${l.items_title}</h2>
      <button class="primary" id="autoplace" style="width:100%"><ha-icon icon="mdi:auto-fix"></ha-icon>${l.auto_place}</button>
      ${Object.values(h.entities || {}).some((e) => e.platform === 'wled') ? `<button id="wledauto" style="width:100%;margin-top:6px"><ha-icon icon="mdi:led-strip-variant"></ha-icon>${l.wled_auto}</button>${this._wledMsg ? `<p class="hint">${esc(this._wledMsg).replace(/\n/g, '<br>')}</p>` : `<p class="hint">${l.wled_hint}</p>`}` : ''}
      <button id="idxbtn" style="width:100%;margin-top:6px"><ha-icon icon="mdi:format-list-checks"></ha-icon>${l.idx_title}</button>
      ${this._showIdx ? this.indexHTML() : ''}
      <p>${l.auto_hint}</p>
      <p>${l.items_tip}</p>
      ${it ? `<div class="card"><b>${esc(friendly(h, it.entity_id))}</b><small class="hint">${esc(it.entity_id)}</small>
        <div class="field"><span>${l.label}</span><input id="iname" value="${esc(it.name || '')}"></div>
        <label class="row" style="font-size:13px"><input type="checkbox" id="ipin" ${it.pin ? 'checked' : ''} style="flex:none">${l.show_always}</label>
        ${(() => {
          // what it belongs to: a light behind a TV (ambilight) or in speaker boxes, a media player that is a TV you drew
          const d = it.entity_id.split('.')[0], furn = (p.furniture || []).filter((f) => (d === 'media_player' ? ['tv'] : ['tv', 'speakerbox']).includes(f.type));
          if (!['light', 'media_player'].includes(d) || !furn.length) return '';
          // boxes in one room told apart: left / right (or 1, 2, 3...) as they stand on the plan
          const side = (f) => { const rm = roomAt(p.rooms, +f.x || 0, +f.y || 0), same = furn.filter((g) => g.type === f.type && roomAt(p.rooms, +g.x || 0, +g.y || 0) === rm).sort((a2, b2) => (+a2.x || 0) - (+b2.x || 0)); if (same.length < 2) return ''; const i = same.indexOf(f); return same.length === 2 ? ` (${i ? l.right : l.left})` : ` (${i + 1})`; };
          const name = (f) => `${f.type === 'tv' ? l.f_tv : l.f_speakerbox} – ${esc(roomAt(p.rooms, +f.x || 0, +f.y || 0)?.name || "")}${side(f)}`;
          const links = Array.isArray(it.link) ? it.link : it.link && it.link !== 'none' ? [it.link] : [];
          if (d === 'media_player') {
            const cur = it.tvlink === false ? 'none' : it.tvlink || '';
            return `<div class="field" style="margin-top:8px"><span>${l.link_q}</span><select id="ilink"><option value="">${l.link_auto}</option><option value="none" ${cur === 'none' ? 'selected' : ''}>${l.link_none}</option>${furn.map((f) => `<option value="${esc(f.id)}" ${cur === f.id ? 'selected' : ''}>${name(f)}</option>`).join('')}</select></div><p class="hint">${l.link_tv_hint}</p>`;
          }
          // a light: automatic, nothing, or tick the TV / boxes it lights (several boxes = the same light in each)
          const mode = it.link === 'none' ? 'none' : links.length ? 'own' : '';
          return `<div class="field" style="margin-top:8px"><span>${l.link_q}</span><select id="ilinkmode"><option value="">${l.link_auto}</option><option value="none" ${mode === 'none' ? 'selected' : ''}>${l.link_none}</option><option value="own" ${mode === 'own' ? 'selected' : ''}>${l.link_own}</option></select></div>
            ${mode === 'own' ? `<div class="list" style="margin-bottom:6px">${furn.map((f) => `<label class="row" style="font-size:13px"><input type="checkbox" data-linkf="${esc(f.id)}" ${links.includes(f.id) ? 'checked' : ''} style="flex:none">${name(f)}</label>`).join('')}</div>` : ''}
            <p class="hint">${l.link_hint}</p>`;
        })()}
        ${['switch', 'input_boolean'].includes(it.entity_id.split('.')[0]) ? `<div class="field" style="margin-top:8px"><span>${l.kind_q}</span><select id="ikind">
          <option value="" ${!it.kind ? 'selected' : ''}>${l.kind_auto}</option><option value="lamp" ${it.kind === 'lamp' ? 'selected' : ''}>${l.kind_lamp}</option><option value="device" ${it.kind === 'device' ? 'selected' : ''}>${l.kind_device}</option></select></div>` : ''}
        ${it.entity_id.startsWith('light.') || it.kind === 'lamp' ? (() => {
          const st = h.states[it.entity_id], mount = ceilingMount(it, st), auto = mount === 'hanging' ? l.hang_auto : mount ? l.yes : l.no;
          return `<div class="field" style="margin-top:8px"><span>${l.ceil_q}</span><select id="iceil">
          <option value="" ${it.ceiling == null ? 'selected' : ''}>${l.ceil_auto}${it.ceiling == null ? ` — ${auto}` : ''}</option><option value="1" ${it.ceiling === true ? 'selected' : ''}>${l.ceil_yes}</option><option value="hang" ${it.ceiling === 'hanging' ? 'selected' : ''}>${l.ceil_hang}</option><option value="0" ${it.ceiling === false ? 'selected' : ''}>${l.ceil_no}</option></select></div>
          ${mount === 'hanging' ? `<div class="field"><span>${l.hang_h}</span><input type="number" id="ihang" min="0.3" max="6" step="0.05" placeholder="${String(Math.round(deviceHeight(p, { ...it, height: undefined }, st, h) * 100) / 100).replace('.', ',')}" value="${ownHeight(it) ?? ''}"></div>` : ''}`;
        })() : ''}
        ${lampish(it) ? (() => {
          const sp = stripPath(it), sc = planScale(p), len = sp ? pathLength(sp) : 0, drawing = this.stripDraw === it.entity_id;
          return `<div class="field" style="margin-top:8px"><span>${l.shape_q}</span><select id="ishape"><option value="" ${it.shape !== 'strip' ? 'selected' : ''}>${l.shape_icon}</option><option value="strip" ${it.shape === 'strip' ? 'selected' : ''}>${l.shape_strip}</option></select></div>
          ${it.shape === 'strip' ? `<div class="row" style="gap:6px;flex-wrap:wrap">${drawing ? `<button class="primary" id="stripdone"><ha-icon icon="mdi:check"></ha-icon>${l.strip_done}</button>` : `<button class="primary" id="stripdraw"><ha-icon icon="mdi:vector-polyline"></ha-icon>${sp ? l.strip_redraw : l.strip_draw}</button>`}${sp && !drawing ? `<button id="stripclr">${l.strip_clear}</button>` : ''}</div>
            <p class="hint">${sp ? `${l.strip_len}: <b>${sc ? `${(len / sc).toFixed(2).replace('.', ',')} m` : Math.round(len)}</b>` : l.strip_none}${drawing || !sp ? `<br>${l.strip_hint}` : ''}</p>
            <div class="field"><span>${l.strip_dir}</span><select id="istripdir">${[['', l.strip_flat], ['up', l.strip_up], ['frame3', l.strip_frame3], ['frame', l.strip_frame]].map(([k, t]) => `<option value="${k}" ${(it.strip_dir || '') === k ? 'selected' : ''}>${t}</option>`).join('')}</select></div>
            ${it.strip_dir ? `<div class="field"><span>${l.strip_from}</span><input type="number" id="istripbot" min="0" max="6" step="0.05" value="${String(ownHeight(it) ?? 1).replace('.', ',')}"></div><div class="field"><span>${l.strip_to}</span><input type="number" id="istriptop" min="0" max="6" step="0.05" value="${String(stripTop(it)).replace('.', ',')}"></div><p class="hint">${it.strip_dir === 'up' ? l.strip_up_hint : l.strip_frame_hint} ${it.strip_dir !== 'up' ? l.strip_seg_hint : ''}</p>` : ''}` : ''}`;
        })() : ''}
        ${it.entity_id.startsWith('light.') || it.kind === 'lamp' ? (() => {
          const st = h.states[it.entity_id], spot = isSpot(it, st);
          return `<div class="field" style="margin-top:8px"><span>${l.spot_q}</span><select id="ispot"><option value="" ${it.spot == null ? 'selected' : ''}>${l.ceil_auto} — ${spot ? l.yes : l.no}</option><option value="1" ${it.spot === true ? 'selected' : ''}>${l.yes}</option><option value="0" ${it.spot === false ? 'selected' : ''}>${l.no}</option></select></div>
            ${spot ? `<div class="row" style="gap:6px;flex-wrap:wrap"><button class="${this.aimFor === it.entity_id ? 'primary' : ''}" id="spotaim"><ha-icon icon="mdi:crosshairs-gps"></ha-icon>${this.aimFor === it.entity_id ? l.spot_aiming : l.spot_aim}</button>${it.aim ? `<button id="spotdown">${l.spot_down}</button>` : ''}</div><p class="hint">${l.spot_hint}</p>` : ''}`;
        })() : ''}
        ${(applianceKind(it, h.states[it.entity_id], h) || deviceKind(it, h.states[it.entity_id], h)) ? `<div class="field" style="margin-top:8px"><span>${l.i_rot}</span><input type="number" id="irot" min="0" max="359" step="15" placeholder="0" value="${it.rot ?? ''}"></div>` : ''}
        ${it.entity_id.startsWith('cover.') && isScreenLabel(`${it.entity_id} ${friendly(h, it.entity_id)}`) ? `<div class="field" style="margin-top:8px"><span>${l.scr_q}</span><select id="iscreen"><option value="">${l.scr_down}</option><option value="up" ${it.screen_open === 'up' ? 'selected' : ''}>${l.scr_up}</option></select></div>` : ''}
        ${it.entity_id.startsWith('cover.') ? (() => {
          const st = h.states[it.entity_id], info = curtainFor(p, it, st), set = it.curtain && typeof it.curtain === 'object' ? it.curtain : null;
          const wins = (p.openings || []).filter((o) => o.type === 'window');
          const wname = (o) => { const r = roomAt(p.rooms, (safeNumber(o.x1) + safeNumber(o.x2)) / 2 + 6, (safeNumber(o.y1) + safeNumber(o.y2)) / 2 + 6) || roomAt(p.rooms, (safeNumber(o.x1) + safeNumber(o.x2)) / 2 - 6, (safeNumber(o.y1) + safeNumber(o.y2)) / 2 - 6); return `${l.cur_win} ${wins.indexOf(o) + 1}${r ? ` (${r.name})` : ''}`; };
          const auto = info ? l.cur_found.replace('{w}', wname(info.o)) : l.cur_nowin;
          return `<div class="field" style="margin-top:8px"><span>${l.cur_q}</span><select id="icurwin">
              <option value="" ${!set && it.curtain !== false ? 'selected' : ''}>${l.cur_auto} — ${esc(auto)}</option>
              ${wins.map((o) => `<option value="${esc(o.id)}" ${set?.window === o.id ? 'selected' : ''}>${esc(wname(o))}</option>`).join('')}
              <option value="none" ${it.curtain === false ? 'selected' : ''}>${l.cur_none}</option></select></div>
            ${info ? `<div class="field"><span>${l.cur_style}</span><select id="icurstyle">${['split', 'left', 'right', 'roller'].map((k) => `<option value="${k}" ${info.style === k ? 'selected' : ''}>${l['cur_' + k]}</option>`).join('')}</select></div>
            <div class="field"><span>${l.cur_bottom}</span><div class="row"><select id="icurbot"><option value="" ${set?.bottom == null ? 'selected' : ''}>${l.cur_floor}</option><option value="sill" ${set?.bottom === 'sill' ? 'selected' : ''}>${l.cur_sill}</option><option value="own" ${set?.bottom != null && set.bottom !== 'sill' ? 'selected' : ''}>${l.cur_own}</option></select>${set?.bottom != null && set.bottom !== 'sill' ? `<input type="number" id="icurbotv" min="0" max="2.4" step="0.05" value="${set.bottom}" style="width:80px">` : ''}</div></div><p class="hint">${l.cur_hint}</p>` : ''}`;
        })() : ''}
        <details class="sec sub" data-sec="itemmore" ${this._secOpen?.itemmore ? 'open' : ''}><summary>${l.more_options}</summary><div class="secb">
        <div class="field"><span>${l.icon}</span><input id="iicon" placeholder="mdi:lamp" value="${esc(it.icon || '')}"></div>
        <div class="field"><span>${l.i_model}</span><select id="imodel"><option value="">${l.i_model_none}</option>${this.modelList().map((m) => `<option value="${esc(m.url)}" ${it.model === m.url ? 'selected' : ''}>${esc(m.file.replace(/-[0-9a-f]{10}(\.\w+)$/, '$1'))}</option>`).join('')}</select></div>
        <div class="row" style="gap:8px;flex-wrap:wrap;margin-bottom:6px"><button id="imup"><ha-icon icon="mdi:upload"></ha-icon>${l.mdl_upload}</button><input type="file" id="imfile" accept=".glb,.gltf,.obj" style="display:none"><small id="improg"></small></div>
        ${it.model ? `<div class="field"><span>${l.i_model_h}</span><input type="number" id="imh" min="0.03" max="3" step="0.05" placeholder="${l.i_model_auto}" value="${it.model_h ?? ''}"></div>
          <div class="field"><span>${l.mdl_up}</span><select id="imupax">${[['', l.mdl_y], ['z', l.mdl_z], ['-z', l.mdl_z2]].map(([k, t]) => `<option value="${k}" ${(it.up || '') === k ? 'selected' : ''}>${t}</option>`).join('')}</select></div>
          <p class="hint">${l.i_model_hint}</p>` : ''}
        ${it.entity_id.startsWith('light.') || it.kind === 'lamp' || ['switch', 'input_boolean'].includes(it.entity_id.split('.')[0]) && it.kind !== 'device' ? `<div class="field"><span>${l.color}</span><div class="row"><input type="color" id="icolor" value="${/^#[0-9a-f]{6}$/i.test(it.color || '') ? it.color : '#f2a541'}" style="flex:none;width:52px;padding:2px"><button id="icolorclr" style="flex:none">${l.no_color}</button></div></div>` : ''}
        ${(() => {
          // a TV linked to TV furniture: its height is that TV's height on the wall
          const tf = tvLinks(p, h).get(it.entity_id);
          if (tf) return `<div class="field"><span>${l.i_tvheight}</span><input type="number" id="iheight" min="0" max="6" step="0.05" placeholder="${l.i_tvstand}" value="${tvOnWall(tf) ? (tf.elev ?? 1) : ''}"></div>`;
          return `<div class="field"><span>${l.i_height}</span><input type="number" id="iheight" min="0" max="6" step="0.05" placeholder="${String(Math.round(deviceHeight(p, { ...it, height: undefined }, h.states[it.entity_id], h) * 100) / 100).replace('.', ',')}" value="${ownHeight(it) ?? ''}"></div>`;
        })()}
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

    $('#zoomsel')?.addEventListener('change', (ev) => { this.zoom = ev.target.value || null; this.fz = null; this.render(); });
    $('#zin')?.addEventListener('click', () => this.zoomBy(1.4));
    $('#zout')?.addEventListener('click', () => this.zoomBy(1 / 1.4));
    $('#zfit')?.addEventListener('click', () => { this.fz = null; this.render(); });
    const cv = $('#canvas');
    if (cv && this.step >= 1 && this.step <= 3) {
      // Ctrl + scroll wheel (or pinching a touchpad) zooms where the mouse is; zoomed in, the scroll wheel moves the plan
      cv.addEventListener('wheel', (ev) => {
        if (ev.ctrlKey || ev.metaKey) { ev.preventDefault(); const [x, y] = this.pt(ev); this.zoomBy(Math.exp(-Math.max(-120, Math.min(120, ev.deltaY)) * 0.0012), x, y); return; }
        if (!this.fz) return;
        ev.preventDefault();
        const [, , vw, vh] = this.viewBox(), b = cv.getBoundingClientRect();
        this.fz.cx += ((ev.shiftKey ? ev.deltaY : ev.deltaX) * vw) / b.width; this.fz.cy += (ev.shiftKey ? 0 : (ev.deltaY * vh) / b.height);
        this._zr();
      }, { passive: false });
      // the middle mouse button (or two fingers) drags the plan
      cv.addEventListener('pointerdown', (ev) => {
        if (ev.button !== 1 || !this.fz) return;
        ev.preventDefault(); ev.stopPropagation();
        const b = cv.getBoundingClientRect(), [, , vw, vh] = this.viewBox(), x0 = ev.clientX, y0 = ev.clientY, c0 = [this.fz.cx, this.fz.cy];
        const mv = (e) => { this.fz.cx = c0[0] - ((e.clientX - x0) * vw) / b.width; this.fz.cy = c0[1] - ((e.clientY - y0) * vh) / b.height; const [vx2, vy2, vw2, vh2] = this.viewBox(); $('#svg')?.setAttribute('viewBox', `${vx2} ${vy2} ${vw2} ${vh2}`); };
        const up = () => { window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up); this.render(); };
        window.addEventListener('pointermove', mv); window.addEventListener('pointerup', up);
      }, true);
      const pinch = new Map();
      let pd = 0;
      cv.addEventListener('touchstart', (ev) => { if (ev.touches.length === 2) { pd = Math.hypot(ev.touches[0].clientX - ev.touches[1].clientX, ev.touches[0].clientY - ev.touches[1].clientY); pinch.set('c', [(ev.touches[0].clientX + ev.touches[1].clientX) / 2, (ev.touches[0].clientY + ev.touches[1].clientY) / 2]); } }, { passive: true });
      cv.addEventListener('touchmove', (ev) => {
        if (ev.touches.length !== 2 || !pd) return;
        ev.preventDefault();
        const d = Math.hypot(ev.touches[0].clientX - ev.touches[1].clientX, ev.touches[0].clientY - ev.touches[1].clientY), [cx, cy] = pinch.get('c');
        const [x, y] = this.pt({ clientX: cx, clientY: cy });
        if (Math.abs(d / pd - 1) > 0.04) { this.zoomBy(d / pd, x, y); pd = d; }
      }, { passive: false });
      cv.addEventListener('touchend', () => { pd = 0; });
    }
    $('#svg')?.addEventListener('dblclick', (ev) => {
      // double-click a room to zoom in on it, double-click again to see everything
      if (this.step === 3 && this.stripDraw) { ev.preventDefault(); this.finishStrip(); return; }
      if (this.step === 2 || (this.step === 1 && this.tool !== 'select')) return;   // there a click already draws or places a door
      const [x, y] = this.pt(ev), r = roomAt(this.plan.rooms, x, y);
      this.zoom = this.zoom ? null : r?.id || null; this.fz = null; this.render();
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
      $('#rwallc')?.addEventListener('change', (ev) => this.mut(() => { r.wall_color = ev.target.value; }));
      $('#rwallx')?.addEventListener('click', () => this.mut(() => { delete r.wall_color; }));
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
    $$('[data-door]').forEach((b) => b.addEventListener('click', () => { this.doorType = this.doorType === b.dataset.door ? null : b.dataset.door; this.render(); }));   // tap again = off
    $$('[data-addfurn]').forEach((b) => b.addEventListener('click', () => this.mut((pl) => {
      const type = b.dataset.addfurn, d = FURN_TYPES[type], sc = planScale(pl) || 70;   // without a measured room: about 70 units per metre
      // Zoomed in on a room: the new piece lands in that room (middle of its biggest part), not in the middle of the whole plan.
      const zr = this.zoom && this.room(this.zoom);
      let near = this.sel?.type === 'furn' && (pl.furniture || []).find((x) => x.id === this.sel.id);
      if (near && zr && roomAt([zr], near.x, near.y) !== zr) near = null;
      let cx = pl.width / 2, cy = pl.height / 2;
      if (zr) {
        const q = zr.rects.map(norm).sort((a, b) => (b[2] - b[0]) * (b[3] - b[1]) - (a[2] - a[0]) * (a[3] - a[1]))[0];
        cx = (q[0] + q[2]) / 2; cy = (q[1] + q[3]) / 2;
      }
      const f = { id: uid('f'), type, x: this.snap(near ? near.x + 30 : cx), y: this.snap(near ? near.y + 30 : cy), w: Math.round((d.w / 100) * sc), h: Math.round((d.h / 100) * sc), rot: 0 };
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
      $('#fz')?.addEventListener('change', (ev) => this.mut(() => { const v = parseFloat(ev.target.value); if (v >= 0 && ev.target.value !== '') f.z = Math.round(v) / 100; else delete f.z; }));
      const mv = (v0) => { const v = parseFloat(String(v0).replace(',', '.')); return Number.isFinite(v) ? (v > 6 ? v / 100 : v) : null; };
      $('#vwbot')?.addEventListener('change', (ev) => this.mut(() => { const v = mv(ev.target.value); if (v != null) f.elev = Math.round(v * 100) / 100; }));
      $('#vwtop')?.addEventListener('change', (ev) => this.mut(() => { const v = mv(ev.target.value); if (v != null) f.top = Math.round(v * 100) / 100; }));
      $$('[data-vwcam]').forEach((el) => el.addEventListener('change', () => this.mut(() => { const ids = [...this.shadowRoot.querySelectorAll('[data-vwcam]')].filter((x) => x.checked).map((x) => x.dataset.vwcam); if (ids.length) f.cams = ids; else delete f.cams; })));
      // a model you pick: its own proportions (width stays, depth and height follow), also after turning it upright
      const fitModel = async () => {
        if (!f.model) return;
        try {
          const m = await import(`./fps-model.js?v=${VERSION}`), sz = m.modelSize(await m.loadModel(f.model), f.up), sc = planScale(this.plan) || 70;
          if (!(sz.w > 0)) return;
          this.mut(() => { f.h = Math.max(6, Math.round((f.w * sz.d) / sz.w)); f.z = Math.max(0.05, Math.round(((f.w / sc) * sz.h * 100) / sz.w) / 100); });
        } catch (e) { /* unreadable: it stays a box, the walk says why in the console */ }
      };
      $('#fmodel')?.addEventListener('change', (ev) => { this.mut(() => { if (ev.target.value) f.model = ev.target.value; else delete f.model; }); fitModel(); });
      $('#fmupax')?.addEventListener('change', (ev) => { this.mut(() => { if (ev.target.value) f.up = ev.target.value; else delete f.up; }); fitModel(); });
      $('#fmfit')?.addEventListener('click', () => fitModel());
      $('#fmup')?.addEventListener('click', () => $('#fmfile')?.click());
      $('#fmdel')?.addEventListener('click', async () => {
        const file = (f.model || '').split('/').pop();
        if (!file || !confirm(this.L.mdl_del_q)) return;
        try { await this._hass.connection.sendMessagePromise({ type: 'floorplan_studio/model/delete', file }); } catch (e) { alert(e.message || e); return; }
        this._models = (this._models || []).filter((m) => m.file !== file);
        this.mut(() => { delete f.model; });
      });
      $('#fmfile')?.addEventListener('change', async (ev) => {
        const file = ev.target.files?.[0];
        if (!file) return;
        const prog = $('#fmprog');
        try {
          const res = await this._uploadModel(file, prog);
          this.mut(() => { f.model = res.url; if (!f.name) f.name = file.name.replace(/\.\w+$/, ''); });
          fitModel();
        } catch (e) { if (prog) prog.textContent = ''; alert(`${this.L.mdl_err}: ${e.message || e}`); }
      });
      $('#fapp')?.addEventListener('change', (ev) => this.mut(() => { const v = ev.target.value; if (v === '-') f.entity = ''; else if (v) f.entity = v; else delete f.entity; }));
      $('#fappw')?.addEventListener('change', (ev) => this.mut(() => { const v = parseFloat(ev.target.value); if (v >= 0 && ev.target.value !== '') f.on_w = v; else delete f.on_w; }));
      $('#fmedia')?.addEventListener('change', (ev) => this.mut(() => { if (ev.target.value) f.media = ev.target.value; else delete f.media; }));
      $('#flinklight')?.addEventListener('change', (ev) => this.mut((pl) => {
        // the light you pick lights this box / TV (next to whatever else it already lights); no other light does
        const v = ev.target.value;
        for (const i of pl.items) {
          const ls = Array.isArray(i.link) ? i.link : i.link && i.link !== 'none' ? [i.link] : [];
          if (i.entity_id === v) { i.link = [...new Set([...ls, f.id])]; delete i.path; if (i.shape === 'strip') delete i.shape; }
          else if (ls.includes(f.id)) { const rest = ls.filter((x) => x !== f.id); if (rest.length) i.link = rest; else delete i.link; }
        }
      }));
      $('#flegs')?.addEventListener('change', (ev) => this.mut(() => { const v = parseFloat(ev.target.value); if (v > 0) f.legs = Math.round(v) / 100; else delete f.legs; }));
      $('#fshape')?.addEventListener('change', (ev) => this.mut(() => { const k = ev.target.value; if (k) { f.shape = k; if (f.h < f.w * 0.6) f.h = Math.round(f.w * 0.7); } else delete f.shape; }));
      $('#fchairs')?.addEventListener('change', (ev) => this.mut(() => { const v = parseInt(ev.target.value, 10); if (v >= 0 && ev.target.value !== '') f.chairs = Math.min(20, v); else delete f.chairs; }));
      $('#fmount')?.addEventListener('change', (ev) => this.mut(() => { if (ev.target.value === 'wall') { f.mount = 'wall'; delete f.z; } else { delete f.mount; delete f.elev; } }));
      $('#felev')?.addEventListener('change', (ev) => this.mut(() => { const v = parseFloat(ev.target.value); if (v >= 0 && ev.target.value !== '') f.elev = Math.round(v) / 100; else delete f.elev; }));
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
    $('#wledauto')?.addEventListener('click', () => this.autoWled());
    $('#idxbtn')?.addEventListener('click', () => { this._showIdx = !this._showIdx; this.render(); });
    // a washing machine, dryer or dishwasher becomes furniture in its room (it finds its status entity itself)
    $$('[data-idxfurn]').forEach((el) => el.addEventListener('click', () => this.mut((pl) => {
      const r = this.room(el.dataset.room), [x0, y0, x1, y1] = roomBBox(r), t = el.dataset.idxfurn, ft = FURN_TYPES[t], sc = planScale(pl) || 70;
      const f = { id: uid('f'), type: t, x: this.snap((x0 + x1) / 2), y: this.snap((y0 + y1) / 2), w: Math.round((ft.w / 100) * sc), h: Math.round((ft.h / 100) * sc), rot: 0 };
      pl.furniture = [...(pl.furniture || []), f];
    })));
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
    if (this.stripDraw && it?.entity_id !== this.stripDraw) { this.stripDraw = null; this.stripPts = []; }
    if (!it) return;
    $('#iname').addEventListener('change', (ev) => this.mut(() => { it.name = ev.target.value || undefined; }));
    $('#iicon').addEventListener('change', (ev) => this.mut(() => { it.icon = ev.target.value || undefined; }));
    $('#icolor')?.addEventListener('change', (ev) => this.mut(() => { it.color = ev.target.value; }));
    $('#icolorclr')?.addEventListener('click', () => this.mut(() => { delete it.color; }));
    $('#ipin').addEventListener('change', (ev) => this.mut(() => { it.pin = ev.target.checked || undefined; }));
    $('#istripdir')?.addEventListener('change', (ev) => this.mut(() => { if (ev.target.value) { it.strip_dir = ev.target.value; if (it.top == null) it.top = Math.round(((ownHeight(it) ?? 1) + 0.6) * 100) / 100; } else { delete it.strip_dir; delete it.top; } }));
    const mval = (v0) => { const v = parseFloat(String(v0).replace(',', '.')); return Number.isFinite(v) ? (v > 6 ? v / 100 : v) : null; };
    $('#istripbot')?.addEventListener('change', (ev) => this.mut(() => { const v = mval(ev.target.value); if (v != null) it.height = Math.round(v * 100) / 100; }));
    $('#istriptop')?.addEventListener('change', (ev) => this.mut(() => { const v = mval(ev.target.value); if (v != null) it.top = Math.round(v * 100) / 100; }));
    $('#ilink')?.addEventListener('change', (ev) => this.mut(() => {
      const v = ev.target.value;
      if (it.entity_id.startsWith('media_player.')) { if (v === 'none') it.tvlink = false; else if (v) it.tvlink = v; else delete it.tvlink; }
      else if (v) {
        // keep the other boxes ticked when the first one changes to another box
        const rest = Array.isArray(it.link) ? it.link.slice(1).filter((x) => x !== v) : [];
        const box = (this.plan.furniture || []).find((f) => f.id === v)?.type === 'speakerbox';
        it.link = box && rest.length ? [v, ...rest] : v;
        // linked to a TV or speaker boxes: it is drawn as their light, not as its own line
        if (v !== 'none') { delete it.path; if (it.shape === 'strip') delete it.shape; }
      } else delete it.link;
    }));
    $('#ilinkmode')?.addEventListener('change', (ev) => this.mut(() => {
      const v = ev.target.value;
      if (v === 'none') it.link = 'none';
      else if (v === 'own') { const auto = [...speakerBoxes(this.plan, { ...it, link: undefined }, this._hass?.states[it.entity_id]), ambilightTv(this.plan, { ...it, link: undefined }, this._hass?.states[it.entity_id])].filter(Boolean).map((f) => f.id); it.link = auto.length ? auto : []; }
      else delete it.link;
    }));
    $$('[data-linkf]').forEach((el) => el.addEventListener('change', () => this.mut(() => {
      it.link = [...this.shadowRoot.querySelectorAll('[data-linkf]')].filter((x) => x.checked).map((x) => x.dataset.linkf);
      // drawn as the light of what it belongs to, not as its own line
      if (it.link.length) { delete it.path; if (it.shape === 'strip') delete it.shape; }
    })));
    $('#iheight').addEventListener('change', (ev) => this.mut((pl) => { const v0 = parseFloat(String(ev.target.value).replace(',', '.')), v = v0 > 6 ? v0 / 100 : v0; if (setLinkedTvHeight(pl, this._hass, it, v >= 0 && ev.target.value !== '' ? v : null)) return; if (v >= 0 && ev.target.value !== '') it.height = Math.round(v * 100) / 100; else delete it.height; }));
    $$('details.sec').forEach((d) => d.addEventListener('toggle', () => { this._secOpen = this._secOpen || {}; this._secOpen[d.dataset.sec] = d.open; }));
    $('#ivia')?.addEventListener('change', (ev) => this.mut(() => { it.via = ev.target.value || undefined; }));
    $('#ikind')?.addEventListener('change', (ev) => this.mut(() => { it.kind = ev.target.value || undefined; }));
    $('#ishape')?.addEventListener('change', (ev) => this.mut(() => { if (ev.target.value === 'strip') { it.shape = 'strip'; this.stripDraw = stripPath(it) ? null : it.entity_id; } else { delete it.shape; this.stripDraw = null; } }));
    $('#stripdraw')?.addEventListener('click', () => { this.stripDraw = it.entity_id; this.stripPts = []; this.render(); });
    $('#stripdone')?.addEventListener('click', () => this.finishStrip());
    $('#stripclr')?.addEventListener('click', () => this.mut(() => { delete it.path; }));
    $('#ispot')?.addEventListener('change', (ev) => this.mut(() => { const v = ev.target.value; if (v === '') delete it.spot; else it.spot = v === '1'; }));
    $('#spotaim')?.addEventListener('click', () => { this.aimFor = this.aimFor === it.entity_id ? null : it.entity_id; this.render(); });
    $('#spotdown')?.addEventListener('click', () => this.mut(() => { delete it.aim; }));
    $('#imodel')?.addEventListener('change', (ev) => this.mut(() => { if (ev.target.value) it.model = ev.target.value; else { delete it.model; delete it.model_h; delete it.up; } }));
    $('#imh')?.addEventListener('change', (ev) => this.mut(() => { const v = parseFloat(String(ev.target.value).replace(',', '.')); if (v > 0) it.model_h = Math.round((v > 6 ? v / 100 : v) * 100) / 100; else delete it.model_h; }));
    $('#imupax')?.addEventListener('change', (ev) => this.mut(() => { if (ev.target.value) it.up = ev.target.value; else delete it.up; }));
    $('#imup')?.addEventListener('click', () => $('#imfile')?.click());
    $('#imfile')?.addEventListener('change', async (ev) => {
      const file = ev.target.files?.[0];
      if (!file) return;
      try { const res = await this._uploadModel(file, $('#improg')); this.mut(() => { it.model = res.url; }); } catch (e) { const pg = $('#improg'); if (pg) pg.textContent = ''; alert(`${this.L.mdl_err}: ${e.message || e}`); }
    });
    $('#irot')?.addEventListener('change', (ev) => this.mut(() => { const v = ((parseFloat(ev.target.value) % 360) + 360) % 360; if (v) it.rot = Math.round(v); else delete it.rot; }));
    $('#iscreen')?.addEventListener('change', (ev) => this.mut(() => { if (ev.target.value) it.screen_open = ev.target.value; else delete it.screen_open; }));
    $('#icurwin')?.addEventListener('change', (ev) => this.mut(() => { const v = ev.target.value; if (v === '') delete it.curtain; else if (v === 'none') it.curtain = false; else it.curtain = { ...(it.curtain && typeof it.curtain === 'object' ? it.curtain : {}), window: v }; }));
    $('#icurbot')?.addEventListener('change', (ev) => this.mut(() => { const base = it.curtain && typeof it.curtain === 'object' ? { ...it.curtain } : { window: 'auto' }; const v = ev.target.value; if (v === '') delete base.bottom; else base.bottom = v === 'sill' ? 'sill' : 1.0; it.curtain = base; }));
    $('#icurbotv')?.addEventListener('change', (ev) => this.mut(() => { const v = parseFloat(String(ev.target.value).replace(',', '.')); if (v >= 0) it.curtain = { ...(it.curtain || { window: 'auto' }), bottom: v > 6 ? v / 100 : v }; }));
    $('#icurstyle')?.addEventListener('change', (ev) => this.mut(() => { const base = it.curtain && typeof it.curtain === 'object' ? it.curtain : { window: 'auto' }; it.curtain = { ...base, style: ev.target.value }; }));
    $('#iceil')?.addEventListener('change', (ev) => this.mut(() => { const v = ev.target.value; if (v === '') delete it.ceiling; else it.ceiling = v === 'hang' ? 'hanging' : v === '1'; }));
    $('#ihang')?.addEventListener('change', (ev) => this.mut(() => { const v0 = parseFloat(String(ev.target.value).replace(',', '.')), v = v0 > 6 ? v0 / 100 : v0; if (v >= 0 && ev.target.value !== '') it.height = Math.round(v * 100) / 100; else delete it.height; }));
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
        <div class="field"><span>${l.wall_color}</span><div class="row"><input type="color" id="swallc" value="${/^#[0-9a-f]{6}$/i.test(s.wall_color || '') ? s.wall_color : '#d9d4ca'}" style="flex:none;width:52px;height:34px">${s.wall_color ? `<button id="swallx">${l.wall_default}</button>` : `<small class="hint">${l.wall_theme}</small>`}</div></div>
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
        ${s.height_25d !== 'real' ? num('height_25d', 30, 150, 5) : ''}${chk('perspective')}${chk('show_stalks')}${chk('turn_ghost')}${chk('walk_edit')}${num('walk_fov', 60, 120, 5)}${sel('walk_start', [['', l.walk_start_auto], ...this.plan.rooms.map((r) => [r.id, esc(r.name || r.id)])], s.walk_start || '')}${s.turn_ghost ? num('turn_ghost_pct', 0, 100, 5) : ''}<p class="hint">${l.turn_hint}</p>`)}
      ${sec('tap', l.set_behaviour, `${chk('tap_zoom')}
        ${s.tap_zoom ? sel('room_tap', [['zoom', l.tap_zoom_opt], ['page', l.tap_page_opt]], s.room_tap === 'page' ? 'page' : 'zoom') : ''}
        ${sel('hold_action', [['quick', l.hold_quick], ['more-info', l.hold_more]], s.hold_action === 'more-info' ? 'more-info' : 'quick')}
        ${num('hold_ms', 250, 1500, 50)}`)}
      ${sec('simple', l.set_simple, `${sel('default_mode', [['all', l.all], ['simple', l.simple], ['none', l.none_mode]], ['simple', 'none'].includes(s.default_mode) ? s.default_mode : 'all')}${num('usage_days', 1, 60)}${num('learning_days', 0, 14)}`)}
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
    $('#swallc')?.addEventListener('change', (ev) => set('wall_color', ev.target.value));
    $('#swallx')?.addEventListener('click', () => set('wall_color', ''));
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
      else if (this.step === 3 && this.stripDraw) this.addStripPoint(ev);
      else if (this.step === 3 && this.aimFor) { const id = this.aimFor; this.aimFor = null; this.mut((pl) => { const it2 = pl.items.find((i) => i.entity_id === id); if (it2) it2.aim = { x: Math.round(x), y: Math.round(y) }; }); }
      else if (this.step === 3 && this.sel) { this.sel = null; this.render(); }
    });
    if (this.step === 3 && this.stripDraw) {
      // rubber band from the last point to the pointer, with its length
      svg.addEventListener('pointermove', (ev) => {
        const pts = this.stripPts || [], rb = this.shadowRoot.getElementById('striprubber'), lt = this.shadowRoot.getElementById('striplen');
        if (!pts.length || !rb) return;
        const [x, y] = this.stripSnap(ev), [ax, ay] = pts[pts.length - 1], sc = planScale(p);
        Object.entries({ x1: ax, y1: ay, x2: x, y2: y }).forEach(([k, v]) => rb.setAttribute(k, v));
        rb.style.display = '';
        lt.setAttribute('x', (ax + x) / 2); lt.setAttribute('y', (ay + y) / 2 - 8);
        const seg = Math.hypot(x - ax, y - ay), tot = pathLength([...pts, [x, y]]);
        lt.textContent = sc ? `${(seg / sc).toFixed(2).replace('.', ',')} m  (${(tot / sc).toFixed(2).replace('.', ',')} m)` : String(Math.round(seg));
      });
    }
  }

  /**
   * WLED: read every device (LEDs, segments, matrix) through the integration and set up its lights on the plan:
   * a strip drawn for the whole device is shared out over its segments, a strip without a line gets one along the
   * nearest wall, and WLED lights are not ceiling lamps.
   */
  async autoWled() {
    const l = this.L, h = this._hass, fmt = (t, v) => Object.entries(v).reduce((a, [k, x]) => a.replace(`{${k}}`, x), t);
    let devices = [];
    try { devices = (await h.callWS({ type: 'floorplan_studio/wled' })).devices || []; } catch (e) { this._wledMsg = `${l.wled_none} (${e.message || e.code || e})`; this.render(); return; }
    if (!devices.length) { this._wledMsg = l.wled_none; this.render(); return; }
    const lines = [];
    this.mut((pl) => {
      const sc = planScale(pl) || 70, find = (id) => id && pl.items.find((i) => i.entity_id === id);
      for (const dev of devices) {
        const segs = (dev.segments || []).filter((sg) => sg.entity_id);
        const main = find(dev.main), placed = [main, ...segs.map((sg) => find(sg.entity_id))].filter(Boolean);
        if (!placed.length) continue;
        const name = dev.title || dev.host;
        if (dev.offline) { lines.push(fmt(l.wled_off, { n: name })); continue; }
        for (const it of placed) if (it.ceiling == null) it.ceiling = false;   // a strip or panel, not a ceiling lamp
        if (dev.matrix?.w) {
          for (const it of placed) if (!it.icon) it.icon = 'mdi:grid';
          lines.push(fmt(l.wled_matrix, { n: name, w: dev.matrix.w, h: dev.matrix.h }));
          continue;
        }
        // one line drawn for the whole device (on the main light, or a segment holding all LEDs): share it out
        const total = dev.leds || segs.reduce((a, sg) => Math.max(a, sg.stop), 0);
        const base = main && stripPath(main) ? main : null;
        if (base && segs.length > 1) {
          const path = stripPath(base), L = pathLength(path);
          const at = (d) => { let left = d; for (let i = 1; i < path.length; i++) { const [ax, ay] = path[i - 1], [bx, by] = path[i], sl = Math.hypot(bx - ax, by - ay); if (sl >= left) { const k = sl ? left / sl : 0; return [ax + (bx - ax) * k, ay + (by - ay) * k]; } left -= sl; } return path[path.length - 1]; };
          const cut = (d0, d1) => { const pts = [at(d0)]; let acc = 0; for (let i = 1; i < path.length; i++) { acc += Math.hypot(path[i][0] - path[i - 1][0], path[i][1] - path[i - 1][1]); if (acc > d0 && acc < d1) pts.push(path[i]); } pts.push(at(d1)); return pts.map((q) => q.map(Math.round)); };
          let k = 0;
          for (const sg of segs) {
            const it = find(sg.entity_id);
            if (!it || stripPath(it)) continue;
            it.shape = 'strip'; it.path = cut((sg.start / total) * L, (sg.stop / total) * L); it.leds = sg.len;
            if (base.height != null && it.height == null) it.height = base.height;
            [it.x, it.y] = pathMid(it.path).map(Math.round); k++;
          }
          if (k) { delete base.shape; lines.push(fmt(l.wled_split, { n: name, k: segs.length })); }   // the main light stays an icon (no double glow)
          continue;
        }
        // strips without a line: one along the nearest wall of their room, as long as the LEDs make it
        for (const sg of segs.length ? segs : []) {
          const it = find(sg.entity_id);
          // clocks, bulbs and little objects with a WLED inside are not strips
          const label = `${dev.title || ''} ${friendly(h, sg.entity_id)} ${sg.entity_id}`;
          if (!it || stripPath(it) || (sg.len || 0) < 20 || /klok|clock|nixie|bulb|lamp|luna|mandala|matrix|panel|stick|quad|leeuw|lion/i.test(label)) continue;
          const r = roomAt(pl.rooms, it.x, it.y) || pl.rooms.find((x) => x.rects.some((q) => { const n = norm(q); return it.x >= n[0] - 10 && it.x <= n[2] + 10 && it.y >= n[1] - 10 && it.y <= n[3] + 10; }));
          const q = r ? r.rects.map(norm).find((n) => it.x >= n[0] - 10 && it.x <= n[2] + 10 && it.y >= n[1] - 10 && it.y <= n[3] + 10) : null;
          const len = (sg.len / 60) * sc;
          let a, b;
          if (q) {
            const dl = it.x - q[0], dr = q[2] - it.x, dt = it.y - q[1], db = q[3] - it.y, m = Math.min(dl, dr, dt, db), inset = 0.05 * sc;
            if (m === dl || m === dr) { const x = m === dl ? q[0] + inset : q[2] - inset, half = Math.min(len, q[3] - q[1]) / 2, c = Math.max(q[1] + half, Math.min(q[3] - half, it.y)); a = [x, c - half]; b = [x, c + half]; }
            else { const y = m === dt ? q[1] + inset : q[3] - inset, half = Math.min(len, q[2] - q[0]) / 2, c = Math.max(q[0] + half, Math.min(q[2] - half, it.x)); a = [c - half, y]; b = [c + half, y]; }
          } else { a = [it.x - len / 2, it.y]; b = [it.x + len / 2, it.y]; }
          it.shape = 'strip'; it.path = [a.map(Math.round), b.map(Math.round)]; it.leds = sg.len;
          [it.x, it.y] = pathMid(it.path).map(Math.round);
          lines.push(fmt(l.wled_line, { n: friendly(h, it.entity_id), m: (sg.len / 60).toFixed(1).replace('.', ','), l: sg.len }));
        }
      }
    });
    this._wledMsg = `${l.wled_done}:\n${lines.length ? lines.join('\n') : '–'}`;
    this.render();
  }

  /** LED strip: where the next point goes (grid, and 45° steps unless Shift is held). */
  stripSnap(ev) {
    const [x, y] = this.pt(ev), pts = this.stripPts || [];
    if (!pts.length || ev.shiftKey) return [this.snap(x), this.snap(y)];
    const [ax, ay] = pts[pts.length - 1], a = Math.round(Math.atan2(y - ay, x - ax) / (Math.PI / 4)) * (Math.PI / 4), g = this.plan.grid || 10;
    const L = Math.round(Math.hypot(x - ax, y - ay) / g) * g;
    return [Math.round(ax + L * Math.cos(a)), Math.round(ay + L * Math.sin(a))];
  }
  addStripPoint(ev) {
    const q = this.stripSnap(ev), pts = (this.stripPts = this.stripPts || []), last = pts[pts.length - 1];
    if (last && last[0] === q[0] && last[1] === q[1]) return;
    pts.push(q);
    this.render();
  }
  finishStrip() {
    const id = this.stripDraw, pts = (this.stripPts || []).filter((q, i, a) => !i || q[0] !== a[i - 1][0] || q[1] !== a[i - 1][1]);
    this.stripDraw = null; this.stripPts = [];
    if (pts.length < 2) { this.render(); return; }
    this.mut((pl) => {
      const it = pl.items.find((i) => i.entity_id === id);
      if (!it) return;
      it.shape = 'strip'; it.path = pts;
      [it.x, it.y] = pathMid(pts).map(Math.round);   // the icon (to tap) in the middle of the strip
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

  /** Drag a handle of the selected piece of furniture: the opposite side stays put (Shift = keep its proportions). */
  resizeFurn(ev, handle, svg) {
    const p = this.plan, f = (p.furniture || []).find((q) => this.sel?.type === 'furn' && q.id === this.sel.id);
    if (!f) return;
    const [sx, sy] = handle.split(',').map(Number), before = JSON.stringify(p), r = (safeNumber(f.rot) * Math.PI) / 180, cr = Math.cos(r), sr = Math.sin(r);
    const w0 = safeNumber(f.w, 100), h0 = safeNumber(f.h, 60), fx = safeNumber(f.x), fy = safeNumber(f.y), sc = planScale(p);
    // the fixed point: the opposite corner (or side)
    const ax = -sx * w0 / 2, ay = -sy * h0 / 2, AX = fx + ax * cr - ay * sr, AY = fy + ax * sr + ay * cr;
    const step = sc ? sc / 100 : 1;   // whole centimetres once the plan has a real size
    svg.setPointerCapture(ev.pointerId);
    let moved = false;
    const move = (e) => {
      const [mx, my] = this.pt(e), dx = mx - AX, dy = my - AY, lx = dx * cr + dy * sr, ly = -dx * sr + dy * cr;
      let w = sx ? Math.max(8, Math.abs(lx)) : w0, h = sy ? Math.max(6, Math.abs(ly)) : h0;
      if (e.shiftKey && sx && sy) { const k = Math.max(w / w0, h / h0); w = w0 * k; h = h0 * k; }
      w = Math.round(w / step) * step; h = Math.round(h / step) * step;
      // keep the fixed side where it is: the new centre is halfway between it and the pointer
      const ox = sx ? (Math.sign(lx) || sx) * w / 2 : 0, oy = sy ? (Math.sign(ly) || sy) * h / 2 : 0;
      const ncx = AX + ox * cr - oy * sr, ncy = AY + ox * sr + oy * cr;
      f.w = Math.round(w * 10) / 10; f.h = Math.round(h * 10) / 10; f.x = Math.round(ncx * 10) / 10; f.y = Math.round(ncy * 10) / 10;
      moved = true;
      const g = [...svg.querySelectorAll('[data-furn]')].find((n) => n.dataset.furn === f.id);
      if (g) g.innerHTML = furnSVG(f);
      const lbl = svg.querySelector('.fsize');
      if (lbl) lbl.textContent = sc ? `${Math.round((f.w / sc) * 100)} × ${Math.round((f.h / sc) * 100)} cm` : `${Math.round(f.w)} × ${Math.round(f.h)}`;
    };
    const up = () => {
      svg.removeEventListener('pointermove', move); svg.removeEventListener('pointerup', up);
      if (moved) { this.history.push(before); this.dirty = true; }
      this.render();
    };
    svg.addEventListener('pointermove', move); svg.addEventListener('pointerup', up);
  }

  doorsPointer(tgt, x, y, ev, svg) {
    const p = this.plan;
    if (tgt.dataset.fhandle) return this.resizeFurn(ev, tgt.dataset.fhandle, svg);
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
    const w = this.doorType ? nearestWall(computeWalls(p.rooms), x, y, 20) : null;   // nothing picked: a click only deselects
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
