<img src="custom_components/floorplan_studio/brand/icon@2x.png" alt="" width="96" align="right">

# Floorplan Studio for Home Assistant

[![Open in HACS](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=trackerr&repository=home-assistant-floorplan-studio&category=integration)

[![HACS Custom](https://img.shields.io/badge/HACS-Custom-41BDF5.svg)](https://hacs.xyz) [![Release](https://img.shields.io/github/v/tag/trackerr/home-assistant-floorplan-studio?label=version)](CHANGELOG.md) [![Validate](https://github.com/trackerr/home-assistant-floorplan-studio/actions/workflows/validate.yml/badge.svg)](https://github.com/trackerr/home-assistant-floorplan-studio/actions/workflows/validate.yml)

An interactive floorplan of your home for your Home Assistant dashboards. You draw it in a few minutes without writing any code, or you trace it from your robot vacuum's map or a photo of the building plan.

**🇳🇱 Nederlandse handleiding met stap-voor-stap uitleg: [docs/HANDLEIDING.md](docs/HANDLEIDING.md)**

![Floorplan Studio – floorplan with side column](docs/img/dashboard.png)

<sub>All screenshots show the fictional "Voorbeeldhuis" with fake devices ([examples/voorbeeldhuis.json](examples/voorbeeldhuis.json)), not a real home.</sub>

| Room view | Smoke alarm | Live vacuum map |
|---|---|---|
| ![](docs/img/ruimte-zoom.png) | ![](docs/img/melding-rook.png) | ![](docs/img/stofzuiger-live.png) |
| **Temperature colours** | **Presence** | **Kiosk with menu** |
| ![](docs/img/temperatuur.png) | ![](docs/img/aanwezigheid.png) | ![](docs/img/kiosk-menu.png) |
| **High-tech** | **Rock** | **Automatic (sun)** |
| ![](docs/img/kaart-hightech.png) | ![](docs/img/kaart-rock.png) | ![](docs/img/kaart-zon.png) |

## What you get

- **A real floorplan.** You draw rooms as rectangles. Walls are created automatically: outer walls where nothing borders a room, inner walls where rooms touch. You can then add doors and open passages, for example to an open kitchen.
- **Live data in every room.** Temperature and humidity come from the room's Home Assistant area, together with a count of how many lights are on. When a light is on, its room softly glows in that light's colour.
- **Lights and devices on the map.** Lamps show as round icons that glow in their own colour. Other devices (climate, covers, media players, vacuums…) show as rounded squares with their state underneath.
  - **Tap** to switch a device on or off. **Hold** to open the details.
  - **Cameras** can be placed too: tap one for a full-screen live view, then tap the picture to close it.
  - Smart plugs with a coloured lamp in them can be given a fixed glow colour.
- **A dashboard, not just a map.** Next to the plan: a clock, the weather, one big *All off* button (or your own script, or a **smart button** that changes per part of the day: *Good morning*, *Coming home*, *Bedtime*, and *All off* while lights are on), quick buttons for scenes, an energy tile (solar, grid, price, solar today) and a short status list. On top: *Good afternoon · Home: Anna & Tom*.
- **Room text blocks with icons.** Name, a big value (temperature, or any sensor), and short rows: lights on, CO2, humidity, curtains, heating/AC, what's playing, plus rows you pick. Each block finds the emptiest spot in its room; drag it, resize it from its corner, or hold it for a menu (bigger, smaller, automatic, hide).
- **Soft light per lamp** in the lamp's own colour, tiled or wooden floors, and a compass.
- **Room view.** Tap a room: the rest of the house fades away, the room zooms in and a side panel lists everything in its area. Or choose that a tap opens the room's **own page** (same look, with its own link).
- **Temperature colours.** One tap on the thermometer colours every room from blue (cold) to red (warm).
- **Presence.** Rooms with active motion/occupancy/presence sensors get a pulsing dot; people tracked per room (Bermuda, ESPresense…) show as avatars.
- **Alerts on the map.** Smoke, gas, CO or water leak: the room flashes red and a banner appears (also in kiosk). Open doors and windows turn the room orange.
- **Vacuum.** While it cleans, the vacuum icon drives over your plan to where the robot really is, with a trail (or show the vacuum's own live map instead), lined up with the background you traced. *Vacuum this room* in the room view uses `vacuum.clean_area` (or Roborock segment ids on older HA).
- **Simple / All.** *Simple* only shows the devices that someone in the household actually operated in the last 14 days, by dashboard, app or voice assistant. Changes made by automations don't count. The list keeps adapting itself, and you can pin devices so they always show.
- **Themes.** All are selectable from a dropdown in the card editor, or by everyone from the toolbar.
  - **Automatic (sun):** light during the day and sliding through dusk to dark at night, in real time from today's sunrise and sunset. Text colour is chosen by contrast at every step, so it stays readable.
  - **Warm:** amber light on dark.
  - **High-tech:** neon HUD, cyan walls, scan lines.
  - **Blueprint:** architect's blue paper.
  - **Glass:** frosted glass over soft colour blobs.
  - **Terminal:** green phosphor.
  - **Rock:** black tread plate, chrome walls and red stage lights.
  - **Home Assistant:** follows your HA theme.
- **Theme for the whole house.** Link a dropdown helper and every screen follows the same theme; automations can switch it.
- **A complete dashboard in one click:** Home (a calm start page in your theme: greeting, smart button, a tile per room, energy), Floorplan, Kiosk (with a menu bar to the other tabs), Energy, Outside, TV, plus a page per room. Uses advanced-camera-card and clock-weather-card when you have them.
- **Editor in the sidebar** (*Floorplan*). It walks you through six steps, and the plan is stored inside Home Assistant itself (`.storage`), so no YAML files are involved. Plans can be imported and exported as JSON.
- **Full screen that stays.** ⛶ puts the whole page in full screen, hides Home Assistant's header and sidebar and shows a menu bar; switching tabs keeps you in full screen.
- **Phones: room by room.** On a narrow screen the card shows a bar with your rooms: an overview with names and temperatures, or one room filling the width with big, easy-to-tap icons. Swipe for the next room; everything outside the room is dimmed. Tablets and PCs get the same view with the *Room by room* button in the toolbar (each device remembers its choice).
- Works on tablets, wall panels and TVs too.

## Installation

**One click, in this order:**

1. [![Open in HACS](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=trackerr&repository=home-assistant-floorplan-studio&category=integration) → **Download**.
2. **Restart Home Assistant.**
3. [![Add integration to Home Assistant](https://my.home-assistant.io/badges/config_flow_start.svg)](https://my.home-assistant.io/redirect/config_flow_start/?domain=floorplan_studio) → **Submit**.

If step 3 says *"This integration does not support configuration via the UI"*, Home Assistant doesn't know Floorplan Studio yet: it hasn't been downloaded in HACS, or Home Assistant hasn't been restarted since. Do steps 1 and 2 and try again.

The buttons open your own Home Assistant (via my.home-assistant.io). The first time, it asks for your Home Assistant address.

### HACS (recommended)
1. Open HACS → ⋮ → **Custom repositories**.
2. Add `https://github.com/trackerr/home-assistant-floorplan-studio`, category **Integration**.
3. Install **Floorplan Studio** and restart Home Assistant.
4. Go to **Settings → Devices & services → Add integration → Floorplan Studio**.

### Manual
Copy `custom_components/floorplan_studio` into your `config/custom_components/` folder, restart Home Assistant, then add the integration as in step 4 above.

You don't have to add a dashboard *resource*: the integration loads the card automatically.

## Quick start

Open **Floorplan** in the sidebar and follow the steps.

1. **Background.** Choose one of these:
   - upload an image (a drawing, a photo of the plan, a screenshot);
   - pick your vacuum map or camera entity (Roborock, Valetudo, Xiaomi Cloud Map Extractor…);
   - draw from scratch.

   Scale, shift and fade the background until it lines up.
2. **Rooms.** Drag a rectangle for each room. For L-shaped rooms, select the room and use *Add part to room*.
   - Link each room to a **Home Assistant area**. This is what makes the room's devices and sensors appear automatically.
   - *Create rooms from my areas* gives you one rectangle per area to start with.
3. **Doors.** Choose *Door* or *Open passage* and click on a wall.
4. **Devices.** Press **Place everything automatically**, then drag the icons to their real positions. You can add any other entity with the search box.
5. **Settings.** Set the defaults for every card that shows this plan, with a live preview next to them:
   - theme (or a helper that sets it for the whole house), floor plan size, icon size, room text size and glow strength;
   - temperature colours, presence (and who is tracked by which sensor), alerts, the vacuum (robot driving over the plan, or its live map), the side column and the smart button;
   - which lines the room text shows;
   - *Simple* mode: how many days to look back and how long the learning period is;
   - tap a room = zoom in or open its page, and hold time;
   - timing of the *Automatic (sun)* theme;
   - which device types are placed automatically.
6. **Finish.**
   - Press **Create dashboard** (with or without the *Home* start page), or add the card to any dashboard.
   - Press **Save** (top right) whenever you like. Ctrl+Z undoes your last step.

## Card options

```yaml
type: custom:floorplan-studio-card
plan: home            # floorplan id (default: the first one)
theme: sun            # sun | warm | hightech | blueprint | glass | terminal | rock | ha
mode: simple          # simple | all  (default view; users can switch)
show_toolbar: true    # Simple/All, temperature colours, full screen and "Move icons"
show_theme_toggle: false   # with a theme helper: only the helper's themes, and it switches the whole house
title: Home           # optional, defaults to the plan name
usage_days: 14        # optional, overrides the plan setting
side: true            # optional: side column with clock, weather, buttons, energy and status
compact: auto         # optional: auto (room by room below 560 px, see the plan settings) | on | off
size: 90              # optional: the plan uses 90% of the width – a more compact page (overrides the plan setting)
greeting: true        # optional: "Good afternoon · Home: …" instead of the title (default: on with side)
home: true            # optional: show the start page (greeting, smart button, room tiles, energy) instead of the plan
room: keuken          # optional: show only this room (room id, area id or name) – a "room page"
room_pages: true      # set by Create dashboard: tapping a room may open its ruimte-<name> page
nav:                  # optional menu bar, shown in kiosk (?kiosk in the address)
  - { title: Energy, path: energie, icon: mdi:lightning-bolt }
```

There is also a tiny `custom:floorplan-studio-nav` card (same `nav:` list) that shows the kiosk menu bar on other views; it takes no space outside kiosk mode.

The card has a visual editor, so all of these options can be set without YAML.

Tip for wall tablets: install [kiosk-mode](https://github.com/NemesisRE/kiosk-mode) and open the generated *Kiosk* tab with `?kiosk` behind the address. The header and sidebar disappear and the menu bar takes you to the other tabs.

## Try it with the example house

Download [examples/voorbeeldhuis.json](examples/voorbeeldhuis.json) and use **Import** (next to **+**) in the editor. Its devices are fake, so link the rooms to your own areas and press *Place everything automatically*.

The screenshots are made from the same example with a fake Home Assistant: `cd scripts/screenshots && npm i && node shoot.mjs && python compress.py`.

## How "Simple" works

The integration records when an entity is changed by a **person**: Home Assistant attaches a user to state changes made through the dashboard, the companion app, or voice assistants that use a Home Assistant user. Changes made by automations and scripts are ignored.

At start-up it also reads the last 60 days from the recorder, so the mode works from day one. While there is less than about three days of data, *Simple* still shows everything.

## FAQ

**"This integration does not support configuration via the UI"?** Floorplan Studio isn't installed yet, or Home Assistant hasn't been restarted after downloading it in HACS. Download it, restart, then add the integration.

**Can I use my Roborock map?** Yes. The Roborock integration provides an `image.*_map` entity: choose it in step 1 and trace over it. Valetudo and the Xiaomi Cloud Map Extractor work the same way. While the vacuum cleans, that same map is shown live over your plan. Turning the map into walls automatically is planned.

**Can I have more than one floor?** Yes. Use *New floorplan* (+), then set `plan:` on each card.

**Who can edit?** Only administrators can open the editor or move icons. Everyone can use the card.

**Where is my data stored?** In `.storage/floorplan_studio.plans` and `.storage/floorplan_studio.usage`. Both are included in your normal backups.

## Roadmap
- Automatic wall detection from vacuum maps (Valetudo segments first)
- Your own themes from YAML
- Per-room scenes in the room view

## License
MIT © trackerr
