// Floorplan Studio card – live floorplan with lights, devices, room zoom and themes.
import {
  VERSION, t, THEMES, themeStyle, resolveTheme, daylightVars, planSVG, PLAN_CSS, roomBBox, roomAt, areaEntities, roomSummary,
  PLACE_DOMAINS, LAMP_DOMAINS, entityArea, settingsOf, levelMode, isOn, friendly, lightColor, shortState, loadPlans, savePlan, loadUsage, fire, esc,
  themeFromEntity, themeKey, roomPath, navigate, tempColor, roomPresence, roomAlerts, planVacuum, vacuumMapEntity, VACUUM_BUSY, transformImage, safeNumber, safeSvgId,
  labelSpot, roomTextWidth, motionFade, isMotion, planScale, radarState, makeProj, itemHeight, isCeilingLamp, ceilingMount, deviceHeight, ownHeight, curtainFor, curtainPanels, isAircon, tvScreen, ambilightTv, wledLive, stripPath, radiatorLinks, isHeating, speakerBoxes, airconMode, tvLinks, ringClock, ringClockLeds, isSpot, spotDir, lampStyle, mediaKind, MEDIA_ICON, furnAt, furnHeight, raisedSVG, computeWalls,
} from './fps-core.js?v=1.4.0b32';
import { roomInfo, greeting, sideConfig, weatherInfo, mainAction, energyInfo, statusRow } from './fps-info.js?v=1.4.0b32';


const CSS = `
  :host { display: block; }
  ha-card { overflow: hidden; background: var(--fps-bg); color: var(--fps-fg); font-family: var(--fps-font); border-radius: var(--ha-card-border-radius, 12px); }
  .toolbar { display: flex; align-items: center; gap: 8px; padding: 10px 12px 6px; flex-wrap: wrap; }
  .title { font-size: 18px; font-weight: 700; margin-right: auto; letter-spacing: -.01em; }
  .seg { display: inline-flex; background: var(--fps-chip); border: 1px solid var(--fps-line); border-radius: 999px; padding: 2px; }
  .seg button, .btn { all: unset; cursor: pointer; padding: 5px 12px; border-radius: 999px; font-size: 12.5px; font-weight: 600; color: var(--fps-muted); display: inline-flex; align-items: center; gap: 6px; }
  .seg button.active { background: var(--fps-accent); color: #10161d; }
  .btn { border: 1px solid var(--fps-line); background: var(--fps-chip); color: var(--fps-fg); }
  .btn.active { border-color: var(--fps-accent); color: var(--fps-accent); }
  .btn ha-icon, .seg ha-icon, .themesel ha-icon { --mdc-icon-size: 16px; }
  .themesel { display: inline-flex; align-items: center; gap: 6px; padding: 3px 4px 3px 10px; border-radius: 999px; background: var(--fps-chip); border: 1px solid var(--fps-line); color: var(--fps-accent); }
  .themesel select { all: unset; cursor: pointer; font-size: 12.5px; font-weight: 600; color: var(--fps-fg); padding: 3px 8px 3px 0; }
  .themesel option { color: #111; }
  .viewport { position: relative; overflow: hidden; touch-action: pan-y; }
  .viewport.freezoom { touch-action: none; cursor: grab; }
  .freereset { all: unset; position: absolute; right: 10px; bottom: 10px; z-index: 1500; display: none; align-items: center; gap: 6px; cursor: pointer; padding: 7px 12px;
               border-radius: 999px; font-size: 12.5px; font-weight: 600; background: var(--fps-bg); color: var(--fps-fg); border: 1px solid var(--fps-line); box-shadow: 0 6px 18px rgba(0,0,0,.4); --mdc-icon-size: 16px; }
  .freereset ha-icon { color: var(--fps-accent); }
  .viewport.freezoom .freereset { display: inline-flex; }
  .zoomed .freereset { display: none !important; }
  .stage { position: relative; width: 100%; transform-origin: 0 0; transition: transform .55s cubic-bezier(.2,.8,.2,1); container-type: inline-size; }
  .stage > svg { position: absolute; inset: 0; }
  .items { position: absolute; inset: 0; pointer-events: none; }
  ${PLAN_CSS}
  .floor { cursor: pointer; }
  .floor:hover { fill: color-mix(in srgb, var(--fps-floor) 88%, var(--fps-accent)); }
  .item { position: absolute; transform: translate(-50%, -50%) scale(var(--k, 1)); pointer-events: auto; cursor: pointer; display: flex; flex-direction: column; align-items: center; touch-action: none; transition: transform .55s cubic-bezier(.2,.8,.2,1), opacity .3s; -webkit-tap-highlight-color: transparent; }
  .item.hidden { opacity: 0; pointer-events: none; }
  .item { --fps-k: var(--fps-dev-scale, 1); } .item.lamp { --fps-k: var(--fps-lamp-scale, 1); }   /* lamps and devices each their own size */
  .bub { width: calc(2.9cqw * var(--fps-icon-scale, 1) * var(--fps-k, 1)); height: calc(2.9cqw * var(--fps-icon-scale, 1) * var(--fps-k, 1)); min-width: calc(24px * var(--fps-icon-scale, 1) * var(--fps-k, 1)); min-height: calc(24px * var(--fps-icon-scale, 1) * var(--fps-k, 1)); border-radius: 50%; display: grid; place-items: center;
         background: var(--fps-off); border: 1.5px solid var(--fps-lamp-border, var(--fps-line)); color: var(--fps-muted); transition: background .3s, box-shadow .3s, color .3s; }
  .bub ha-state-icon, .bub ha-icon { --mdc-icon-size: calc(max(14px, 1.6cqw) * var(--fps-icon-scale, 1) * var(--fps-k, 1)); }
  .item.on .bub { background: rgb(var(--c, var(--fps-accent-rgb))); color: #10161d; border: 2px solid var(--fps-ring, transparent);
                  box-shadow: 0 0 1.2cqw rgba(var(--c, var(--fps-accent-rgb)), .9), 0 0 3cqw rgba(var(--c, var(--fps-accent-rgb)), .45); }
  .item.lamp.on .bub { background: color-mix(in srgb, rgb(var(--c, var(--fps-accent-rgb))) calc(45% + 55% * var(--b, 1)), var(--fps-off));
                       box-shadow: 0 0 1.2cqw rgba(var(--c, var(--fps-accent-rgb)), calc(.25 + .65 * var(--b, 1))), 0 0 3cqw rgba(var(--c, var(--fps-accent-rgb)), calc(.1 + .35 * var(--b, 1))); }
  .nolevel .item.lamp.on .bub { --b: 1; }
  .item.device .bub { border-radius: 22%; border-color: rgba(var(--fps-device-rgb), .5); color: var(--fps-device); }
  .item.device.on .bub { background: rgba(var(--fps-device-rgb), .25); color: var(--fps-device); border-color: var(--fps-device); box-shadow: 0 0 1cqw rgba(var(--fps-device-rgb), .55); }
  .item.sensor .bub { border-radius: 999px; width: auto; padding: 0 .8cqw; font-size: max(10px, 1.05cqw); font-weight: 600; color: var(--fps-fg); }
  .tag { margin-top: .25cqw; font-size: max(9px, .8cqw); line-height: 1.2; padding: 0 .4cqw; border-radius: 4px; background: var(--fps-tag, var(--fps-off)); color: var(--fps-fg); border: 1px solid var(--fps-line); white-space: nowrap; }
  .tag:empty, .notags .tag { display: none; }
  .name { position: absolute; top: 100%; margin-top: .3cqw; white-space: nowrap; font-size: max(10px, .9cqw); padding: .2cqw .6cqw; border-radius: 6px;
          background: rgba(0,0,0,.75); color: #fff; opacity: 0; pointer-events: none; transition: opacity .15s; z-index: 3; }
  .item:hover .name { opacity: 1; }
  .item:hover { z-index: 999 !important; }
  .stage { isolation: isolate; }   /* icons stack among themselves; the quick window and menus always stay on top */
  .p25 .rinfo .rrows { display: none; }
  .p25 .rinfo { transform: translate(-50%, -50%); text-align: center; }
  .item.onfurn .bub { opacity: 0; } .item.onfurn .tag { display: none; } .item.onfurn:hover .bub { opacity: .35; }
  svg.plan .tvglows polygon { fill: rgba(80, 160, 255, .7); filter: url(#fps-stripblur); pointer-events: none; }
  svg.plan .tvglows polygon.ambi { opacity: .5; stroke-width: 6; }
  .item.ringclock .bub { padding: 0; } .item.ringclock .ring { width: 100%; height: 100%; display: block; }
  .item.ringclock .ring circle { fill: currentColor; opacity: .25; } .item.ringclock.on .bub { background: rgba(10, 12, 16, .85); color: #ddd; }
  .item.ringclock .ring circle.h { fill: rgb(var(--c, 255, 120, 60)); opacity: 1; r: 1.6px; } .item.ringclock .ring circle.m { fill: rgb(var(--c, 255, 120, 60)); opacity: 1; r: 1.25px; } .item.ringclock .ring circle.s { fill: #fff; opacity: .9; }
  .item.aircon.ac-cool .bub { box-shadow: 0 0 0 2px rgba(90, 170, 255, .9), 0 0 14px rgba(90, 170, 255, .8); animation: fps-blow 2s ease-in-out infinite; }
  .item.aircon.ac-heat .bub { box-shadow: 0 0 0 2px rgba(255, 140, 60, .9), 0 0 14px rgba(255, 140, 60, .8); animation: fps-blow 2s ease-in-out infinite; }
  .item.aircon.ac-dry .bub, .item.aircon.ac-fan .bub { box-shadow: 0 0 0 2px rgba(220, 230, 240, .8); animation: fps-blow 2.4s ease-in-out infinite; }
  @keyframes fps-blow { 50% { box-shadow: 0 0 0 5px rgba(150, 190, 255, .15), 0 0 22px rgba(150, 190, 255, .35); } }
  svg.plan .stalks { transition: opacity .2s; }
  .turning .item, .turning svg.plan .stalks { opacity: var(--fps-turn-op, .1) !important; }   /* 2.5D: only name and temperature, so it stays calm */
  .zoomhint { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); z-index: 2300; padding: 10px 16px; border-radius: 12px; background: rgba(0,0,0,.72); color: #fff; font-size: 14px; pointer-events: none; opacity: 0; transition: opacity .25s; white-space: nowrap; }
  .zoomhint.on { opacity: 1; }
  .btn.view3 { font-size: 12px; font-weight: 700; letter-spacing: .02em; width: auto; padding: 0 9px; }
  /* motion: on = accent colour; just quiet = the colour slowly fades back to grey (--pf 1 → 0) */
  .item.motion.on .bub { background: rgba(var(--fps-accent-rgb), .2); color: var(--fps-accent); border-color: var(--fps-accent); box-shadow: 0 0 1cqw rgba(var(--fps-accent-rgb), .6); }
  .item.motion.recent .bub { color: color-mix(in srgb, var(--fps-accent) calc(var(--pf, 0) * 100%), var(--fps-muted)); border-color: color-mix(in srgb, var(--fps-accent) calc(var(--pf, 0) * 100%), var(--fps-line)); }
  .rinfo.recent .pd { display: inline-flex; animation: none; filter: none; color: color-mix(in srgb, var(--fps-accent) calc(var(--pf, 0) * 100%), var(--fps-muted)); opacity: calc(.4 + .6 * var(--pf, 0)); }
  /* playing media: a TV gets a soft blue screen glow, a speaker sends out sound waves */
  .item.playing .bub { position: relative; }
  .item.tv.playing .bub { background: rgba(70,150,255,.22); color: #9fd0ff; border-color: #5aa9ff; box-shadow: 0 0 1.2cqw rgba(70,150,255,.75), 0 0 3cqw rgba(70,150,255,.35); animation: fpsTv 3s ease-in-out infinite; }
  .item.speaker.playing .bub::before, .item.speaker.playing .bub::after { content: ''; position: absolute; inset: -2px; border-radius: inherit; border: 2px solid rgba(var(--fps-device-rgb), .7); animation: fpsWave 1.8s ease-out infinite; pointer-events: none; }
  .item.speaker.playing .bub::after { animation-delay: .9s; }
  @keyframes fpsTv { 0%, 100% { box-shadow: 0 0 1.2cqw rgba(70,150,255,.75), 0 0 3cqw rgba(70,150,255,.35); } 50% { box-shadow: 0 0 1.6cqw rgba(70,150,255,.95), 0 0 4cqw rgba(70,150,255,.5); } }
  @keyframes fpsWave { from { transform: scale(1); opacity: .8; } to { transform: scale(2); opacity: 0; } }
  @media (prefers-reduced-motion: reduce) { .item.tv.playing .bub, .item.speaker.playing .bub::before, .item.speaker.playing .bub::after { animation: none; } }   /* the item you point at, with its name, comes to the front */
  .moving .item { cursor: grab; } .moving .item .bub { outline: 1px dashed var(--fps-accent); outline-offset: 3px; }
  .floor, .glow, .walls { transition: opacity .5s ease; }
  .floor.dim { opacity: .12; } .glow.dim { opacity: 0 !important; } .walls.dim { opacity: .35; }
  .item.out { opacity: 0; pointer-events: none; }
  .item.driving { transition: left 5s linear, top 5s linear, transform .55s, opacity .3s; z-index: 6; }
  .item.driving .bub { box-shadow: 0 0 0 .35cqw rgba(var(--fps-device-rgb), .35), 0 0 1.4cqw rgba(var(--fps-device-rgb), .6); }
  .roompanel { position: absolute; top: 0; right: 0; bottom: 0; width: 36%; z-index: 2000; box-sizing: border-box; padding: 14px 16px; overflow-y: auto;
               background: color-mix(in srgb, var(--fps-bg) 82%, transparent); backdrop-filter: blur(6px); border-left: 1px solid var(--fps-line);
               transform: translateX(105%); transition: transform .45s cubic-bezier(.2,.8,.2,1); }
  .roompanel.open { transform: none; }
  .ptop { display: flex; align-items: center; gap: 6px; } .ptop .grow { flex: 1; }
  .roompanel.min, .roompanel.narrow.min { top: 10px; right: 10px; bottom: auto; left: auto; width: auto; height: auto; padding: 6px 8px; border: 1px solid var(--fps-line); border-radius: 14px; overflow: visible; }
  .pminbar { display: flex; align-items: center; gap: 10px; white-space: nowrap; }
  .pminbar .pname { margin: 0; font-size: 12px; } .pminbar .pmt { font-size: 18px; font-weight: 300; color: var(--fps-fg); }
  .roompanel.narrow { top: auto; width: 100%; height: 46%; border-left: none; border-top: 1px solid var(--fps-line); transform: translateY(105%); }
  .roompanel.narrow.open { transform: none; }
  .pname { margin-top: 12px; font-size: 13px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: var(--fps-muted); }
  .pname.on { color: var(--fps-accent); }
  .ptemp { font-size: 44px; font-weight: 300; line-height: 1.1; color: var(--fps-fg); }
  .pline { font-size: 13px; color: var(--fps-muted); margin-top: 2px; }
  .prow2 { display: flex; align-items: center; gap: 8px; margin-top: 5px; --mdc-icon-size: 16px; }
  .prow2.on { color: var(--fps-fg); } .prow2.on ha-icon, .prow2.on ha-state-icon { color: var(--fps-accent); } .prow2.warn, .prow2.warn ha-icon { color: #ff9f1c; }
  .phead.fold { cursor: pointer; display: flex; align-items: center; gap: 6px; user-select: none; } .phead.fold ha-icon { --mdc-icon-size: 18px; transition: transform .2s; margin-left: auto; } .phead.fold.open ha-icon { transform: rotate(180deg); } .phead .cnt { opacity: .7; }
  .phead { margin: 16px 0 6px; font-size: 11px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: var(--fps-muted); }
  .prow { display: grid; grid-template-columns: 22px 1fr auto; gap: 10px; align-items: center; padding: 7px 8px; border-radius: 10px; cursor: pointer; font-size: 13px; color: var(--fps-fg); }
  .prow:hover { background: var(--fps-chip); }
  .prow ha-state-icon { --mdc-icon-size: 20px; color: var(--fps-muted); }
  .prow.on ha-state-icon { color: var(--fps-accent); }
  .prow .n { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .prow .v { color: var(--fps-muted); font-size: 12px; white-space: nowrap; }
  .chip { all: unset; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; padding: 5px 10px; border-radius: 999px; font-size: 12px;
          background: var(--fps-chip); border: 1px solid var(--fps-line); color: var(--fps-fg); }
  .chip.on { border-color: var(--fps-accent); color: var(--fps-accent); }
  .chip ha-state-icon { --mdc-icon-size: 16px; }
  .chip small { color: var(--fps-muted); }
  .item.camera .bub { border-radius: 22%; color: var(--fps-device); border-color: rgba(var(--fps-device-rgb), .55); }
  .camview { position: absolute; inset: 0; z-index: 2200; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,.82);
             cursor: zoom-out; animation: fpsfade .2s ease; }
  .camview .frame { position: relative; width: 94%; max-height: 94%; border-radius: 14px; overflow: hidden; box-shadow: 0 0 0 1px var(--fps-line), 0 10px 40px rgba(0,0,0,.6); }
  .camview ha-camera-stream, .camview img { display: block; width: 100%; height: 100%; object-fit: contain; pointer-events: none; }
  .camview .cap { position: absolute; left: 12px; bottom: 10px; font-size: 13px; font-weight: 600; color: #fff; text-shadow: 0 1px 3px #000; pointer-events: none; }
  .camview .x { position: absolute; right: 12px; top: 10px; color: #fff; --mdc-icon-size: 22px; pointer-events: none; }
  @keyframes fpsfade { from { opacity: 0; } to { opacity: 1; } }
  .btn.icon { padding: 5px 8px; }
  .kioskstart { position: absolute; inset: 0; z-index: 2400; display: flex; flex-direction: column; gap: 10px; align-items: center; justify-content: center;
                background: rgba(0,0,0,.55); color: #fff; font-size: 18px; font-weight: 600; cursor: pointer; --mdc-icon-size: 64px; }
  ha-card { position: relative; }
  .msg { padding: 28px; color: var(--fps-muted); text-align: center; }
  .note { font-size: 11px; color: var(--fps-muted); padding: 0 12px 8px; }
  .t-hightech .title { text-transform: uppercase; letter-spacing: .12em; }
  .alertbar { display: none; margin: 0 12px 8px; padding: 8px 12px; border-radius: 10px; font-size: 13px; font-weight: 600; gap: 8px; align-items: center; flex-wrap: wrap; }
  .alertbar.alarm { display: flex; background: #d81b1b; color: #fff; animation: fpsBar 1s steps(2, jump-none) infinite; }
  .alertbar.warn { display: flex; background: rgba(255, 159, 28, .16); color: #ffb347; border: 1px solid rgba(255, 159, 28, .5); }
  .alertbar ha-icon { --mdc-icon-size: 18px; }
  .alertbar span { cursor: pointer; }
  @keyframes fpsBar { 0% { filter: brightness(1.15); } 100% { filter: brightness(.8); } }
  .people { position: absolute; display: flex; gap: .3cqw; transform: translateY(-100%); pointer-events: none; transition: opacity .3s; }
  .person { width: max(20px, 2.2cqw); height: max(20px, 2.2cqw); border-radius: 50%; display: grid; place-items: center; font-size: max(9px, .9cqw); font-weight: 700;
            background: var(--fps-accent); color: #10161d; background-size: cover; background-position: center; box-shadow: 0 0 0 2px var(--fps-bg), 0 0 .8cqw rgba(var(--fps-accent-rgb), .7); }
  .zoomed .people { opacity: 0; }
  .pbtn { margin-top: 14px; display: flex; gap: 8px; flex-wrap: wrap; }
  .palert { margin-top: 10px; padding: 6px 10px; border-radius: 8px; font-size: 13px; font-weight: 600; }
  .palert.alarm { background: #d81b1b; color: #fff; } .palert.warn { background: rgba(255, 159, 28, .16); color: #ffb347; }
  .ppres { font-size: 13px; color: var(--fps-accent); margin-top: 6px; display: flex; gap: 6px; align-items: center; --mdc-icon-size: 16px; }
  /* small screens: room by room */
  .crooms { display: flex; gap: 6px; overflow-x: auto; padding: 4px 12px 8px; scrollbar-width: none; -webkit-overflow-scrolling: touch; }
  .crooms::-webkit-scrollbar { display: none; }
  .crooms button { all: unset; flex: none; cursor: pointer; padding: 7px 14px; border-radius: 999px; font-size: 13.5px; font-weight: 600; white-space: nowrap;
                   border: 1px solid var(--fps-line); background: var(--fps-chip); color: var(--fps-muted); display: inline-flex; align-items: center; gap: 6px; }
  .crooms button i { display: none; width: 6px; height: 6px; border-radius: 50%; background: var(--fps-accent); }
  .crooms button.lit i { display: inline-block; }
  .crooms button.active { background: var(--fps-accent); border-color: var(--fps-accent); color: #10161d; }
  .crooms button.active i { background: #10161d; }
  .chead { padding: 2px 16px 8px; }
  .chead:empty { display: none; }
  .chead .cn { font-size: 13px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: var(--fps-accent); }
  .chead .ch { font-size: 34px; font-weight: 300; line-height: 1.1; font-variant-numeric: tabular-nums; }
  .chead .crows { display: flex; flex-wrap: wrap; gap: 4px 14px; margin-top: 4px; font-size: 13px; color: var(--fps-muted); }
  .chead .crows span { display: inline-flex; align-items: center; gap: 5px; }
  .chead .crows span.on { color: var(--fps-fg); } .chead .crows span.warn { color: #ff9f1c; }
  .chead .crows ha-icon, .chead .crows ha-state-icon { --mdc-icon-size: 16px; width: 16px; height: 16px; display: inline-flex; opacity: .85; }
  .chead .crows span.on ha-icon, .chead .crows span.on ha-state-icon { color: var(--fps-accent); opacity: 1; }
  .compact .viewport { transition: height .35s ease; }
  .compact .stage { transition: transform .45s cubic-bezier(.2,.8,.2,1); }
  .compact.cov .items { display: none; }
  .compact.cov .rinfo .rrows { display: none; }
  .compact.cov .rinfo { font-size: max(8px, var(--fs)); }
  .compact .floor.dim { opacity: .25; }
  .compact .toolbar .lbl { display: none; }
  .compact .toolbar { gap: 6px; padding: 10px 12px 4px; }
  .compact .themesel select { max-width: 110px; }
  svg.ghost { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; pointer-events: none; opacity: 0; transition: opacity .35s; }
  svg.ghost rect:not([fill]) { fill: var(--fps-bg); } svg.ghost.on { opacity: .82; }
  /* home page (home: true): same theme, calm start screen */
  .side.home { padding: 22px; gap: 0; }
  .home .hgrid { display: grid; grid-template-columns: repeat(auto-fit, minmax(290px, 1fr)); gap: 22px; align-items: start; }
  .home .hc { display: flex; flex-direction: column; gap: 12px; min-width: 0; }
  .home .hello b { font-size: 28px; font-weight: 700; display: block; letter-spacing: -.01em; margin-bottom: 4px; }
  .home .mainbtn.big { padding: 16px 18px; min-height: 104px; }
  .home .mainbtn.big b { font-size: 24px; margin: 6px 0 4px; }
  .home .mainbtn label, .home .hlabel, .home .etiles label { font-size: 10.5px; letter-spacing: .14em; font-weight: 700; text-transform: uppercase; color: var(--fps-accent); }
  .home .mainbtn .pwr { width: 54px; height: 54px; --mdc-icon-size: 26px; }
  .home .btns.two { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .home .btns.two .sbtn { padding: 12px 14px; border-radius: 999px; }
  .home .tiles { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
  .home .tile { cursor: pointer; user-select: none; -webkit-user-select: none; touch-action: manipulation; background: var(--fps-chip); border: 1px solid var(--fps-line);
                border-radius: 16px; padding: 12px 14px; display: flex; flex-direction: column; min-height: 78px; transition: background .3s, border-color .3s; }
  .home .tile .ti { width: 34px; height: 34px; border-radius: 50%; display: grid; place-items: center; background: rgba(var(--fps-accent-rgb), .14); color: var(--fps-accent);
                    margin-bottom: 10px; --mdc-icon-size: 19px; transition: background .3s, box-shadow .3s; }
  .home .tile.on { border-color: rgba(var(--fps-accent-rgb), .45); background: linear-gradient(135deg, rgba(var(--fps-accent-rgb), .22), var(--fps-chip) 72%); }
  .home .tile.on .ti { background: var(--fps-accent); color: #10161d; box-shadow: 0 0 14px rgba(var(--fps-accent-rgb), .55); }
  .home .tile { position: relative; }
  .home .tile .tpres { position: absolute; top: 12px; right: 12px; --mdc-icon-size: 18px; color: var(--fps-accent); filter: drop-shadow(0 0 5px rgba(var(--fps-accent-rgb), .7)); animation: fpsPres 2.4s ease-in-out infinite; }
  .home .tile b { font-size: 14px; font-weight: 700; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .home .tile small { margin-top: 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .home .etiles { display: grid; grid-template-columns: repeat(auto-fit, minmax(90px, 1fr)); gap: 10px; cursor: pointer; }
  .home .etiles .box { padding: 12px 14px; }
  .home .etiles label { color: var(--fps-muted); }
  .home .etiles b { display: block; font-size: 21px; font-weight: 700; margin-top: 10px; font-variant-numeric: tabular-nums; white-space: nowrap; }
  .home .etiles b.exp { color: #4cd38a; }
  .home .esub .bar { margin-top: 0; }
  .home .etiles label { display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  @container (max-width: 520px) { .side.home { padding: 14px; } .home .etiles { gap: 8px; } .home .etiles .box { padding: 10px 11px; } .home .etiles label { font-size: 9.5px; letter-spacing: .08em; } .home .etiles b { font-size: 17px; margin-top: 8px; } .home .hello b { font-size: 24px; } }
  /* quick controls (hold an icon) */
  .quick { position: absolute; z-index: 5000; width: 240px; padding: 12px; border-radius: 16px; background: var(--fps-bg); color: var(--fps-fg); font-family: var(--fps-font);
           border: 1px solid var(--fps-line); box-shadow: 0 14px 40px rgba(0,0,0,.55); animation: fpsfade .15s ease; }
  .quick .qh { display: flex; gap: 10px; align-items: center; margin-bottom: 8px; }
  .quick .qh ha-state-icon { color: var(--fps-accent); --mdc-icon-size: 26px; }
  .quick .qh b { display: block; font-size: 14px; line-height: 1.2; } .quick .qh small { font-size: 12px; color: var(--fps-muted); }
  .quick .qs { display: block; margin: 10px 0 4px; font-size: 12px; color: var(--fps-muted); }
  .quick .qs span { display: flex; justify-content: space-between; } .quick .qs b { color: var(--fps-fg); font-variant-numeric: tabular-nums; }
  .quick .qs input { width: 100%; margin: 6px 0 0; accent-color: var(--fps-accent); }
  .quick .qt { display: flex; align-items: center; justify-content: center; gap: 18px; margin: 8px 0; }
  .quick .qt b { font-size: 26px; font-weight: 300; min-width: 70px; text-align: center; }
  .quick .qt button, .quick .qb button { all: unset; cursor: pointer; border: 1px solid var(--fps-line); background: var(--fps-chip); border-radius: 999px; text-align: center; }
  .quick .qt button { width: 38px; height: 38px; font-size: 22px; line-height: 38px; }
  .quick .qb { display: flex; gap: 8px; margin-top: 12px; }
  .quick .qb button { flex: 1; padding: 9px 10px; font-size: 13px; font-weight: 600; }
  .quick .qb .qon.on { background: var(--fps-accent); border-color: var(--fps-accent); color: #10161d; }
  /* layout: plan + optional side column */
  ha-card { container-type: inline-size; }
  .layout { display: block; }
  .layout.withside { display: grid; grid-template-columns: minmax(0, 1fr) clamp(250px, 25%, 340px); align-items: start; }
  @container (max-width: 760px) { .layout.withside { grid-template-columns: 1fr; } }
  .main { position: relative; min-width: 0; overflow: hidden; }
  .title.greet { display: flex; flex-direction: column; gap: 2px; font-size: 26px; font-weight: 700; letter-spacing: -.01em; line-height: 1.1; }
  .title.greet small { font-size: 12.5px; font-weight: 500; color: var(--fps-muted); letter-spacing: 0; }
  /* room text blocks */
  .labels { position: absolute; inset: 0; pointer-events: none; }
  .rinfo { position: absolute; font-size: var(--fs); line-height: 1.25; color: var(--fps-fg); font-family: var(--fps-font); transition: opacity .4s; white-space: nowrap;
           text-shadow: 0 0 .5em var(--fps-bg), 0 0 .2em var(--fps-bg); }
  .rinfo .rn { font-size: .92em; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: var(--fps-muted); display: flex; align-items: center; gap: .5em; }
  .rinfo.on .rn { color: var(--fps-accent); }
  .rinfo .rh { font-size: 2.3em; font-weight: 300; line-height: 1.12; margin-top: .1em; font-variant-numeric: tabular-nums; }
  .rinfo .rh:empty { display: none; }
  .rinfo .rr { display: flex; align-items: center; gap: .45em; font-size: .9em; color: var(--fps-muted); margin-top: .28em; }
  .rinfo .rr ha-icon, .rinfo .rr ha-state-icon { --mdc-icon-size: 1.15em; width: 1.15em; height: 1.15em; display: inline-flex; color: var(--fps-muted); opacity: .85; }
  .rinfo .rr.on { color: var(--fps-fg); } .rinfo .rr.on ha-icon, .rinfo .rr.on ha-state-icon { color: var(--fps-accent); opacity: 1; }
  .rinfo .rr.warn, .rinfo .rr.warn ha-icon { color: #ff9f1c; }
  /* someone in the room: a small motion-sensor icon that breathes */
  .rinfo .pd { display: none; --mdc-icon-size: 1.25em; width: 1.25em; height: 1.25em; align-items: center; justify-content: center; color: var(--fps-accent); filter: drop-shadow(0 0 .35em rgba(var(--fps-accent-rgb), .7)); animation: fpsPres 2.4s ease-in-out infinite; }
  .rinfo.present .pd { display: inline-flex; }
  @keyframes fpsPres { 50% { opacity: .45; } }
  .zoomed .rinfo { opacity: 0; pointer-events: none; }
  .zoomed.pmin .rinfo.cur { opacity: 1; font-size: calc(var(--fs) * var(--k, 1)); }   /* panel made small: the room's own text shows on the plan */
  .labels .rinfo { pointer-events: auto; cursor: pointer; -webkit-tap-highlight-color: transparent; touch-action: none; user-select: none; -webkit-user-select: none; }
  .rinfo.off { display: none; }
  .moving .rinfo { cursor: grab; outline: 1px dashed rgba(var(--fps-accent-rgb), .7); outline-offset: .4em; border-radius: 4px; }
  .moving .rinfo.off { display: block; opacity: .35; }
  .rinfo.dragging { cursor: grabbing; opacity: .85; }
  .rinfo .rsz { display: none; position: absolute; right: -.9em; bottom: -.9em; width: 1.1em; height: 1.1em; min-width: 14px; min-height: 14px; border-radius: 3px;
                background: var(--fps-accent); cursor: nwse-resize; box-shadow: 0 0 0 2px var(--fps-bg); }
  .moving .rinfo .rsz, .can-edit .rinfo:hover .rsz { display: block; }
  .can-edit .labels .rinfo { cursor: grab; }
  .lmenu { position: absolute; z-index: 2100; transform: translate(0, -4px); min-width: 170px; padding: 6px; border-radius: 12px; background: var(--fps-bg);
           border: 1px solid var(--fps-line); box-shadow: 0 10px 30px rgba(0,0,0,.5); font-family: var(--fps-font); animation: fpsfade .15s ease; }
  .lmenu .lm-t { font-size: 11px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: var(--fps-muted); padding: 4px 8px 6px; }
  .lmenu button { all: unset; display: flex; align-items: center; gap: 8px; width: calc(100% - 16px); padding: 7px 8px; border-radius: 8px; font-size: 13px; color: var(--fps-fg); cursor: pointer; --mdc-icon-size: 17px; }
  .lmenu button:hover { background: var(--fps-chip); } .lmenu button ha-icon { color: var(--fps-accent); }
  /* side column */
  .side { padding: 10px 14px 14px 4px; display: flex; flex-direction: column; gap: 12px; font-family: var(--fps-font); }
  .side .box { background: var(--fps-chip); border: 1px solid var(--fps-line); border-radius: 16px; padding: 12px 14px; }
  .side .clock .time { font-size: 54px; font-weight: 300; line-height: 1; letter-spacing: -.02em; font-variant-numeric: tabular-nums; }
  .side .clock .date { font-size: 13px; color: var(--fps-muted); margin-top: 6px; }
  .side .wx { display: flex; gap: 12px; align-items: center; cursor: pointer; }
  .side .wx ha-icon { --mdc-icon-size: 34px; color: var(--fps-accent); }
  .side .wx b { font-size: 22px; font-weight: 600; display: block; }
  .side small { font-size: 11.5px; color: var(--fps-muted); display: block; line-height: 1.35; }
  .side .mainbtn { display: flex; align-items: center; gap: 12px; cursor: pointer; border-color: rgba(var(--fps-accent-rgb), .35);
                   background: linear-gradient(135deg, rgba(var(--fps-accent-rgb), .16), var(--fps-chip) 70%); }
  .side .mainbtn b { font-size: 19px; display: block; margin-bottom: 3px; }
  .side .mainbtn > div:first-child { flex: 1; min-width: 0; }
  .side .pwr { width: 46px; height: 46px; border-radius: 50%; display: grid; place-items: center; background: var(--fps-off); color: var(--fps-muted); flex: none; --mdc-icon-size: 22px; }
  .side .mainbtn.on .pwr { background: var(--fps-accent); color: #10161d; box-shadow: 0 0 18px rgba(var(--fps-accent-rgb), .5); }
  .side .btns { display: grid; grid-template-columns: repeat(auto-fit, minmax(80px, 1fr)); gap: 8px; }
  .side .sbtn { all: unset; cursor: pointer; display: flex; align-items: center; gap: 7px; padding: 9px 11px; border-radius: 12px; font-size: 12.5px; font-weight: 600;
                background: var(--fps-chip); border: 1px solid var(--fps-line); color: var(--fps-fg); --mdc-icon-size: 16px; overflow: hidden; }
  .side .sbtn ha-icon { color: var(--fps-accent); flex: none; }
  .side .sbtn span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .side .energy { cursor: pointer; }
  .side .energy .cols { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; }
  .side .energy label { font-size: 10px; letter-spacing: .14em; color: var(--fps-muted); font-weight: 700; text-transform: uppercase; }
  .side .energy b { display: block; font-size: 19px; font-weight: 700; font-variant-numeric: tabular-nums; margin-top: 2px; white-space: nowrap; }
  .side .energy b.exp { color: #4cd38a; }
  .side .bar { height: 4px; border-radius: 4px; background: var(--fps-off); margin: 10px 0 6px; overflow: hidden; }
  .side .bar i { display: block; height: 100%; background: var(--fps-accent); border-radius: 4px; transition: width .6s; }
  .side .status { display: flex; flex-direction: column; }
  .side .srow { display: grid; grid-template-columns: 20px 1fr auto; gap: 10px; align-items: center; padding: 7px 2px; font-size: 13px; cursor: pointer;
                border-bottom: 1px solid var(--fps-line); --mdc-icon-size: 17px; }
  .side .srow:last-child { border-bottom: none; }
  .side .srow ha-state-icon { color: var(--fps-accent); }
  .side .srow .n { color: var(--fps-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .side .srow .v { font-weight: 600; white-space: nowrap; }
  .side .navbar { padding: 0; justify-content: flex-start; }
  .navbar { display: flex; justify-content: center; gap: 8px; padding: 8px 12px 12px; flex-wrap: wrap; }
  .toast { position: absolute; left: 50%; bottom: 14px; transform: translateX(-50%); z-index: 2300; padding: 8px 14px; border-radius: 999px; font-size: 13px;
           background: rgba(0,0,0,.8); color: #fff; animation: fpsfade .2s ease; pointer-events: none; }
`;

/** Convex hull of a few points (outline around a raised room for the 2.5D fade). */
function hull(pts) {
  const p = [...pts].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo = [], up = [];
  for (const q of p) { while (lo.length >= 2 && cross(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
  for (const q of p.reverse()) { while (up.length >= 2 && cross(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); }
  return lo.slice(0, -1).concat(up.slice(0, -1));
}

/** A media player that is a TV (by its type, icon or name); everything else counts as a speaker. */
function isTv(st, it) {
  if (st?.attributes?.device_class === 'tv') return true;
  if (st?.attributes?.device_class === 'speaker') return false;
  return /tv|television|televisie/i.test(`${it.icon || ''} ${it.name || ''} ${st?.attributes?.friendly_name || ''} ${it.entity_id}`);
}

class FloorplanStudioCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._items = new Map();
    this._zoomRoom = null;
    this._moving = false;
  }

  static getStubConfig() { return { theme: 'warm', mode: 'all' }; }
  static getConfigElement() { return document.createElement('floorplan-studio-card-editor'); }
  getCardSize() { return 9; }
  getGridOptions() { return { columns: 'full', rows: 'auto', min_columns: 6 }; }

  setConfig(config) {
    this._config = { show_toolbar: true, show_theme_toggle: false, ...config };
    this._plan = null;
    if (this._hass) this._load();
  }

  set hass(hass) {
    const first = !this._hass;
    this._hass = hass;
    this._walk?.setHass(hass);
    if (first) this._load();
    else this._update();
  }

  connectedCallback() {
    this._onChanged = async (ev) => { if (!this._dragging && !this.planOverride) { await this._load(true); this._walk?.setPlan?.(this._plan); } };
    window.addEventListener('fps-plans-changed', this._onChanged);
    // back on screen (e.g. from a room page): the plan may have been changed elsewhere in the meantime
    if (this._built && !this.planOverride && (window.__fpsPlansRev || 0) !== this._rev) this._load(true);
    this._fsHook = this._fsHook || (() => { if (this._built) this._build(); });
    window.addEventListener('fps-fullscreen', this._fsHook);
    this._usageTimer = setInterval(() => this._loadUsage(), 10 * 60 * 1000);
    this._clock = setInterval(() => { if (this._config?.side || this._greet || this._fading) this._update(); }, 20000);
    // wait until the size has settled (full screen, rotating, a scrollbar) before switching
    this._ro = this._ro || new ResizeObserver(() => { clearTimeout(this._roT); this._roT = setTimeout(() => this._compactCheck(), 150); });
    this._ro.observe(this);
  }

  disconnectedCallback() {
    window.removeEventListener('fps-plans-changed', this._onChanged);
    window.removeEventListener('fps-fullscreen', this._fsHook);
    clearInterval(this._usageTimer);
    clearTimeout(this._liveTimer);
    clearInterval(this._clock);
    clearInterval(this._clockTimer); this._clockTimer = 0;
    this._ro?.disconnect();
    clearTimeout(this._roT);
    this._live?.stop(); this._live = null;
  }
  /** Drawn WLED strips show their real LEDs, live (WLED's own colours and effects), while the card is on screen. */
  _wledLiveSync() {
    const h = this._hass, ids = (this._plan?.items || []).filter((it) => stripPath(it) && h?.entities?.[it.entity_id]?.platform === 'wled').map((it) => it.entity_id);
    const key = [...new Set(ids)].sort().join(',');
    if (this._live?.key === key) return;
    this._live?.stop(); this._live = null;
    if (key) this._live = wledLive(h, ids, (m) => this._wledLiveShow(m));
  }
  _wledLiveShow(m) {
    for (const [id, leds] of Object.entries(m.leds || {})) {
      const g = [...this.shadowRoot.querySelectorAll('svg.plan [data-strip]')].find((n) => n.dataset.strip === id);
      const core = g?.querySelector('.score');
      if (!core || !leds.length) continue;
      const pts = core.getAttribute('points').trim().split(/\s+/).map((q) => q.split(',').map(Number));
      const K = Math.min(leds.length, 72);
      let live = g.querySelector('.slive');
      if (!live || live.childNodes.length !== K || live.dataset.pts !== core.getAttribute('points')) {
        // the line in K equal pieces, one per (group of) LED(s)
        live?.remove();
        live = document.createElementNS('http://www.w3.org/2000/svg', 'g'); live.setAttribute('class', 'slive'); live.dataset.pts = core.getAttribute('points');
        const lens = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1])), tot = lens.reduce((a, b) => a + b, 0) || 1;
        const at = (d) => { for (let i = 0; i < lens.length; i++) { if (d <= lens[i] || i === lens.length - 1) { const f = lens[i] ? Math.min(1, d / lens[i]) : 0; return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * f, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * f]; } d -= lens[i]; } return pts[0]; };
        for (let k = 0; k < K; k++) {
          const a = at((tot * k) / K), b = at((tot * (k + 1)) / K), ln = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          ln.setAttribute('x1', a[0].toFixed(1)); ln.setAttribute('y1', a[1].toFixed(1)); ln.setAttribute('x2', b[0].toFixed(1)); ln.setAttribute('y2', b[1].toFixed(1));
          ln.setAttribute('style', `stroke-width:${core.style.strokeWidth || '4px'}`);
          live.appendChild(ln);
        }
        g.appendChild(live);
      }
      let r = 0, gg = 0, bb = 0;
      [...live.childNodes].forEach((ln, k) => { const hx = leds[Math.floor((k * leds.length) / K)] || '000000'; ln.style.stroke = `#${hx}`; const v = parseInt(hx, 16); r += (v >> 16) & 255; gg += (v >> 8) & 255; bb += v & 255; });
      g.classList.add('live');
      // the glow around it: the average colour of its LEDs right now
      if (K) g.style.setProperty('--c', `${Math.round(r / K)},${Math.round(gg / K)},${Math.round(bb / K)}`);
    }
  }

  /* ---------------------------------------------------------- state */
  _pref(key, fallback) {
    try { return localStorage.getItem(`fps-${key}-${this._plan?.id}`) || fallback; } catch (e) { return fallback; }
  }
  _setPref(key, val) {
    try { localStorage.setItem(`fps-${key}-${this._plan?.id}`, val); } catch (e) { /* private mode */ }
  }
  get _s() { return settingsOf(this._plan); }
  get _mode() { return this._pref('mode', this._config.mode || this._s.default_mode); }
  get _theme() { const ent = themeFromEntity(this._hass, this._s); if (ent) return ent; const base = this._config.theme || this._s.theme; return this._config.show_theme_toggle ? this._pref('theme', base) : base; }
  get _realTheme() { return resolveTheme(this._theme, this._hass); }
  get _view25() { return this._pref('view', this._config.view || '2d') === '2.5d'; }
  get _tilt() { return Math.max(20, Math.min(80, safeNumber(this._pref('tilt', this._s.tilt ?? 50), 50))); }
  get _rot() { return safeNumber(this._pref('rot', this._config.rotation || 0), 0) % 360; }
  /** Where a floor point of the plan ends up on screen (2.5D turns and tilts it), as % of the plan box. */
  _at(x, y, m = 0) { const p = this._proj, [a, b] = p ? p.P(x, y, m * p.sc * p.lift) : [x, y]; return [`${(a / this._plan.width) * 100}%`, `${(b / this._plan.height) * 100}%`]; }
  get _tempOn() { return this._pref('temp', this._s.temp_color ? 'on' : 'off') === 'on'; }
  get _showNav() { return Array.isArray(this._config.nav) && this._config.nav.length > 0 && (this._config.kiosk || isKiosk()); }
  get _greet() { return this._config.greeting ?? (this._s.greeting && !!this._config.side); }
  /** Themes you can pick: with a theme helper only the ones the helper has (in the helper's own words). */
  get _themeChoices() {
    const st = this._s.theme_entity && this._hass?.states[this._s.theme_entity];
    if (st) {
      const out = (st.attributes.options || []).map((o) => [themeKey(o), o]).filter(([k]) => k);
      if (out.length) return out;
    }
    return Object.entries(THEMES).map(([k, v]) => [k, v.label]);
  }
  get _isAdmin() { return !!this._hass?.user?.is_admin; }

  async _load(force = false) {
    if (!this._hass) return;
    if (this.planOverride) { this._plan = this.planOverride; this._build(); this._loadUsage(); return; }
    // show the plan this screen had last time right away; the fresh one from Home Assistant follows
    if (!this._plan && !this._floorIds.length) {
      try { const c = JSON.parse(localStorage.getItem(this._cacheKey) || 'null'); if (c?.rooms) { this._plan = c; this._build(); } } catch (e) { /* no cache */ }
    }
    if (!this._plan) this._message(t(this._hass, 'loading'));
    const shown = this._plan;
    this._rev = window.__fpsPlansRev || 0;
    try {
      const plans = await loadPlans(this._hass, force);
      this._plans = plans;
      let want = this._config.plan;
      const floors = this._floorIds;
      if (floors.length) {          // floors: the one this screen showed last, else the card's plan, else the first floor
        let last = null;
        try { last = localStorage.getItem(this._floorKey); } catch (e) { /* ignore */ }
        want = floors.includes(this._plan?.id) ? this._plan.id : floors.includes(last) ? last : floors.includes(want) ? want : floors[0];
      }
      this._plan = (want && plans.find((p) => p.id === want)) || plans[0] || null;
    } catch (e) {
      this._message(`Floorplan Studio: ${esc(e.message || e)}`);
      return;
    }
    if (!this._plan) { this._message(t(this._hass, 'no_plan')); return; }
    // the usage history (for Simple) comes in afterwards, it doesn't hold up the plan
    if (!shown || shown.updated !== this._plan.updated || shown.id !== this._plan.id || force || !this._built) this._build();
    else { shown.background = this._plan.background; this._plan = shown; }   // unchanged: keep the plan already on screen (with its picture back)
    this._loadUsage();
    try {
      const b = this._plan.background;
      localStorage.setItem(this._cacheKey, JSON.stringify({ ...this._plan, background: b ? { ...b, url: undefined } : null }));
    } catch (e) { /* storage full or blocked: no cache, no problem */ }
  }

  get _cacheKey() { return `fps-plan-cache-${this._config.plan || 'first'}`; }

  async _loadUsage() {
    if (!this._hass || !this._plan) return;
    const days = this._config.usage_days || this._s.usage_days;
    try {
      this._usage = await loadUsage(this._hass, days);
    } catch (e) {
      this._usage = null;
    }
    this._update();
  }

  _message(text) {
    this.shadowRoot.innerHTML = `<style>${CSS}</style><ha-card class="t-${resolveTheme(this._config.theme, this._hass)}" style="${themeStyle(this._config.theme, this._hass)}"><div class="msg">${text}</div></ha-card>`;
    this._built = false;
  }

  /* ---------------------------------------------------------- build */
  _build() {
    if (this._config.home) return this._buildHome();
    this._compact = this._compactWanted;
    const plan = this._plan, h = this._hass, theme = this._theme;
    // 2.5D (tilted, walls up) per screen; moving icons happens in 2D (exact), the 2.5D view follows
    this._walls = null; this._view = null;
    this._proj = this._view25 && !this._moving ? makeProj(plan, { rot: this._rot, tilt: this._tilt, height: this._s.height_25d === 'real' ? 'real' : safeNumber(this._s.height_25d, 80), persp: this._s.perspective !== false }) : null;
    const mode = this._mode;
    const tb = this._config.show_toolbar ? `
      <div class="toolbar">
        ${this._greet ? `<div class="title greet"><span class="g1"></span><small class="g2"></small></div>` : `<div class="title">${esc(this._config.title ?? plan.name ?? '')}</div>`}
        ${this._floorIds.length > 1 ? `<div class="seg floors">${this._floorIds.map((id) => `<button data-floor="${esc(id)}" class="${id === plan.id ? 'active' : ''}"><ha-icon icon="mdi:layers-outline"></ha-icon>${esc(this._floorName(id))}</button>`).join('')}</div>` : ''}
        <div class="seg" id="mode">
          <button data-mode="simple" class="${mode === 'simple' ? 'active' : ''}"><ha-icon icon="mdi:star-outline"></ha-icon>${t(h, 'simple')}</button>
          <button data-mode="all" class="${mode === 'all' ? 'active' : ''}"><ha-icon icon="mdi:view-grid-outline"></ha-icon>${t(h, 'all')}</button>
          <button data-mode="none" class="${mode === 'none' ? 'active' : ''}"><ha-icon icon="mdi:eye-off-outline"></ha-icon>${t(h, 'none_mode')}</button>
        </div>
        ${this._config.show_theme_toggle ? `<label class="themesel"><ha-icon icon="mdi:palette"></ha-icon><select id="theme">${this._themeChoices.map(([k, v]) => `<option value="${k}" ${k === this._realTheme ? 'selected' : ''}>${v}</option>`).join('')}</select></label>` : ''}
        <button class="btn icon ${this._tempOn ? 'active' : ''}" id="tempc" title="${t(h, 'temp_colors')}"><ha-icon icon="mdi:thermometer"></ha-icon></button>
        <button class="btn icon view3 ${this._proj ? 'active' : ''}" id="view3" title="${this._proj ? '2D' : '2.5D'}">2.5D</button>
        ${this._proj ? `<button class="btn icon" id="rot" title="${t(h, 'rotate')}"><ha-icon icon="mdi:rotate-right"></ha-icon></button>` : ''}
        ${plan.rooms?.length ? `<button class="btn icon" id="walk" title="${t(h, 'walk')}"><ha-icon icon="mdi:walk"></ha-icon></button>` : ''}
        ${this._compactButton ? `<button class="btn icon ${this._compact ? 'active' : ''}" id="cmp" title="${t(h, this._compact ? 'whole_plan' : 'by_room')}"><ha-icon icon="${this._compact ? 'mdi:floor-plan' : 'mdi:view-carousel-outline'}"></ha-icon></button>` : ''}
        <button class="btn icon" id="fs" title="Kiosk"><ha-icon icon="${isFull() ? 'mdi:fullscreen-exit' : 'mdi:fullscreen'}"></ha-icon></button>
        ${this._isAdmin ? `<button class="btn ${this._moving ? 'active' : ''}" id="move"><ha-icon icon="mdi:cursor-move"></ha-icon><span class="lbl">${t(h, this._moving ? 'done' : 'move')}</span></button>` : ''}
      </div>` : '';
    this.shadowRoot.innerHTML = `<style>${CSS}</style>
      <ha-card class="t-${this._realTheme}${this._compact ? ' compact' : ''}" style="${themeStyle(theme, h, this._s)}">
        <div class="layout ${this._config.side ? 'withside' : ''}"><div class="main">
        ${tb}
        ${this._compact ? `<div class="crooms">${[['', t(h, 'overview')], ...this._compactRooms().map((r) => [r.id, r.name])].map(([id, n]) => `<button data-croom="${esc(id)}">${esc(n)}<i></i></button>`).join('')}</div><div class="chead"></div>` : ''}
        <div class="alertbar"></div>
        <div class="viewport" style="${this._sizeStyle()}"><div class="stage" style="aspect-ratio: ${safeNumber(plan.width, 1000)} / ${safeNumber(plan.height, 700)}; --ar: ${safeNumber(plan.width, 1000) / safeNumber(plan.height, 700)}">
          ${planSVG(plan, { proj: this._proj })}
          <svg class="ghost" viewBox="0 0 ${safeNumber(plan.width, 1000)} ${safeNumber(plan.height, 700)}" preserveAspectRatio="none"></svg>
          <div class="labels"></div>
          <div class="items"></div>
          <div class="peoplelayer" style="position:absolute;inset:0;pointer-events:none"></div>
        </div></div>
        <div class="roompanel"></div>
        <div class="note"></div>
        ${this._showNav && !this._config.side ? navHTML(this._config.nav) : ''}
        </div>${this._config.side ? '<aside class="side"></aside>' : ''}</div>
        ${this._config.kiosk && !isFull() ? `<div class="kioskstart"><ha-icon icon="mdi:fullscreen"></ha-icon><span>${t(h, 'kiosk_tap')}</span></div>` : ''}
      </ha-card>`;
    const root = this.shadowRoot;
    this._card = root.querySelector('ha-card');
    this._stage = root.querySelector('.stage');
    this._compactWire(root);
    this._doubleTapWire(root);
    this._freeWire(root);
    this._layer = root.querySelector('.items');
    this._items.clear();
    this._tvl = tvLinks(plan, this._hass);   // TVs that are the TV furniture you drew
    clearInterval(this._clockTimer); this._clockTimer = 0;
    for (const it of plan.items || []) this._addItem(it);
    this._buildLabels();
    this._glows = new Map();

    root.querySelectorAll('#mode button').forEach((b) => b.addEventListener('click', () => { this._setPref('mode', b.dataset.mode); this._build(); }));
    root.querySelector('#theme')?.addEventListener('change', (ev) => {
      const ent = this._s.theme_entity;
      if (ent && this._hass.states[ent]) {   // the whole house follows the helper
        const opts = this._hass.states[ent].attributes.options || [];
        const opt = opts.find((o) => themeKey(o) === ev.target.value) || THEMES[ev.target.value].label;
        this._hass.callService(ent.split('.')[0], 'select_option', { entity_id: ent, option: opt });
      } else { this._setPref('theme', ev.target.value); this._build(); }
    });
    root.querySelector('#tempc')?.addEventListener('click', () => { this._setPref('temp', this._tempOn ? 'off' : 'on'); this._build(); });
    root.querySelector('#view3')?.addEventListener('click', () => { this._setPref('view', this._view25 ? '2d' : '2.5d'); this._zoomRoom = null; this._build(); });
    root.querySelector('#rot')?.addEventListener('click', () => { this._setPref('rot', String(((Math.floor(this._rot / 45 + 0.01) + 1) * 45) % 360)); this._zoomRoom = null; this._build(); });
    root.querySelector('#move')?.addEventListener('click', () => this._toggleMove());
    root.querySelector('#walk')?.addEventListener('click', () => this._openWalk());
    root.querySelectorAll('[data-floor]').forEach((b) => b.addEventListener('click', (ev) => { ev.stopPropagation(); this._setFloor(b.dataset.floor); }));
    root.querySelector('#cmp')?.addEventListener('click', () => { this._setPref('compact', this._compact ? 'off' : 'on'); this._zoomRoom = null; try { sessionStorage.setItem(`fps-croom-${this._plan.id}`, ''); } catch (e) { /* ignore */ } this._build(); });
    const fs = () => toggleFull();
    root.querySelector('#fs')?.addEventListener('click', fs);
    root.querySelector('.kioskstart')?.addEventListener('click', (ev) => { ev.stopPropagation(); ev.currentTarget.remove(); fs(); });
    this._svgClick = this._svgClick || ((ev) => {
      if (Date.now() - (this._freeDragged || 0) < 350) return;   // that was a drag or pinch, not a tap
      this._roomTap(ev.target.dataset?.room && this._plan.rooms.find((r) => r.id === ev.target.dataset.room));
    });
    root.querySelector('svg.plan').addEventListener('click', this._svgClick);
    root.addEventListener('pointerdown', (ev) => { if (!ev.composedPath().some((n) => n.classList?.contains('lmenu'))) this._closeLabelMenu(); });
    this._card.classList.toggle('moving', this._moving);
    this._card.classList.toggle('p25', !!this._proj);
    this._card.classList.toggle('can-edit', this._isAdmin && !this.planOverride);
    this._card.classList.toggle('notags', !this._s.show_tags);
    this._card.classList.toggle('nolevel', levelMode(this._s) === 'off');
    this._built = true;
    this._themeKey = undefined;
    this._last = new Map();
    if (!this._zoomRoom && this._config.room) {
      const want = String(this._config.room).toLowerCase();
      this._zoomRoom = plan.rooms.find((r) => [r.id, r.area_id, r.name].some((v) => v && String(v).toLowerCase() === want)) || null;
    }
    this._update(true);
    if (this._compact) {
      // decided when the frame runs (a hidden tab delays it), so a room picked in between is kept
      requestAnimationFrame(() => {
        let want = this._zoomRoom?.id;
        if (want === undefined) try { want = sessionStorage.getItem(`fps-croom-${plan.id}`) || ''; } catch (e) { want = ''; }
        this._compactZoom(this._compactRooms().find((r) => r.id === want) || null);
      });
    } else if (this._zoomRoom) requestAnimationFrame(() => this._zoom(plan.rooms.find((r) => r.id === this._zoomRoom.id) || null, false));
    root.querySelectorAll('.navbar [data-nav]').forEach((b) => b.addEventListener('click', (ev) => { ev.stopPropagation(); kioskGo(b.dataset.nav); }));
  }

  /** Tap on a room (or its text block): zoom in, or open the room's page. */
  _roomTap(room) {
    if (Date.now() - (this._zoomOutAt || 0) < 450) return;   // the second tap of a double tap that just zoomed out
    if (this._compact) { if (!this._zoomRoom && room) this._compactZoom(room); return; }
    if (this._moving || !this._s.tap_zoom || this._config.room) return;
    if (room && this._s.room_tap === 'page' && this._config.room_pages && !this._zoomRoom) {
      navigate(location.pathname.replace(/[^/]*$/, roomPath(room)) + location.search);
      return;
    }
    this._zoom(room && room !== this._zoomRoom ? room : null);
  }

  _addItem(it) {
    const st = this._hass.states[it.entity_id];
    const domain = it.entity_id.split('.')[0];
    // a plug or switch can say what hangs on it: a lamp (lamp icon + glow) or a device (no light)
    const kind = it.kind === 'lamp' ? 'lamp' : it.kind === 'device' ? 'device' : LAMP_DOMAINS.includes(domain) ? 'lamp' : domain === 'camera' ? 'device camera' : (domain === 'sensor' || domain === 'binary_sensor') && !it.icon_only ? 'sensor' : 'device';
    const el = document.createElement('div');
    el.className = `item ${kind}`;
    if (domain === 'media_player') { const mk0 = mediaKind(it, this._hass); el.classList.add(mk0 === 'tv' || (!mk0 && isTv(st, it)) ? 'tv' : 'speaker'); if (mk0) el.classList.add(`media-${mk0}`); }
    if (isMotion(st)) el.classList.add('motion');
    const ceil = kind === 'lamp' && isCeilingLamp(it, st) && !isSpot(it, st);   // a spot has its own beam
    if (ceil) el.classList.add('ceil');
    this._place(el, it, st);
    el.innerHTML = `<div class="bub"></div><div class="tag"></div><div class="name"></div>`;
    const bub = el.querySelector('.bub');
    const ring = ringClock(it, this._hass), ac = isAircon(it, st);
    if (ac) el.classList.add('aircon');
    if (this._tvl?.has(it.entity_id) || ambilightTv(this._plan, it, st) || speakerBoxes(this._plan, it, st).length || radiatorLinks(this._plan, this._hass).byEntity.has(it.entity_id)) el.classList.add('onfurn');   // the TV furniture is the TV (and its ambilight): no separate icon
    if (ring) {
      // a WLED ring clock: its ring of LEDs, showing the time
      el.classList.add('ringclock');
      bub.innerHTML = `<svg viewBox="-12 -12 24 24" class="ring">${Array.from({ length: ring }, (_, i) => { const a = (i / ring) * 2 * Math.PI; return `<circle cx="${(Math.sin(a) * 10).toFixed(2)}" cy="${(-Math.cos(a) * 10).toFixed(2)}" r="${ring > 60 ? 0.55 : 0.8}"/>`; }).join('')}</svg>`;
      if (!this._clockTimer) this._clockTimer = setInterval(() => this._ringClocks(), 1000);
    } else if (kind !== 'sensor') {
      // a ceiling lamp gets the ceiling-lamp icon, unless you or Home Assistant chose another one
      const mk = mediaKind(it, this._hass);
      const ic = it.icon || (mk && MEDIA_ICON[mk] && !st?.attributes?.icon ? MEDIA_ICON[mk] : ac && !st?.attributes?.icon ? 'mdi:air-conditioner' : kind === 'lamp' && isSpot(it, st) && !st?.attributes?.icon ? 'mdi:spotlight-beam' : ceil && !st?.attributes?.icon ? 'mdi:ceiling-light' : it.kind === 'lamp' && domain !== 'light' ? 'mdi:lightbulb' : '');
      const icon = document.createElement(ic ? 'ha-icon' : 'ha-state-icon');
      if (ic) icon.icon = ic;
      bub.appendChild(icon);
    }
    const label = it.name || friendly(this._hass, it.entity_id);
    el.querySelector('.name').textContent = label;
    this._pointer(el, it);
    this._layer.appendChild(el);
    this._items.set(it.entity_id, { el, it, kind, label, icon: bub.firstChild, st: null });
    if (!st && !it.via) el.style.opacity = '.35';
  }

  /**
   * Where an icon goes. 2.5D: a device over a table, desk or cupboard sits just above it (lamps over the
   * dining table), otherwise at its own or its usual height; icons further back go behind the ones in front.
   */
  _place(el, it, st) {
    const tvf = this._tvl?.get(it.entity_id);
    if (tvf) it = { ...it, x: safeNumber(tvf.x), y: safeNumber(tvf.y), height: it.height ?? furnHeight(tvf) * 0.75 };   // on the TV furniture
    const p = this._proj, under = p ? furnAt(this._plan, it.x, it.y) : null, own = ownHeight(it) != null;
    // the same height as in the walk-through: your own, or what fits the kind of lamp or device
    const hm = !p ? 0 : deviceHeight(this._plan, it, st, this._hass);
    [el.style.left, el.style.top] = this._at(it.x, it.y, hm);
    el._hm = hm;
    if (!p) return;
    const base = under ? Math.min(hm, furnHeight(under)) * p.sc * p.lift : 0, z = hm * p.sc * p.lift;
    const [fx, fy] = p.P(it.x, it.y, base), [, ty] = p.P(it.x, it.y, z);
    el.style.zIndex = String(10 + Math.round((fy / this._plan.height) * 100));
    // a ceiling lamp hangs from a small rose on the ceiling and, when on, shines a soft cone down to the floor
    if (el.classList.contains('ceil')) {
      const g = this.shadowRoot.querySelector('svg.plan .stalks'), top = Math.max(p.wallH, z), [cx, cy] = p.P(it.x, it.y, top);
      if (g) {
        const cosT = Math.max(0.25, Math.cos((p.tilt * Math.PI) / 180)), r = 8 * p.s, R = 0.9 * p.sc;
        const [gx, gy] = p.P(it.x, it.y, base), [hx] = p.P(it.x + R * p.co, it.y - R * p.si, base), rx = Math.abs(hx - gx), ry = rx * cosT;
        const [lx] = p.P(it.x, it.y, z), tw = 3 * p.s, n = (this._coneN = (this._coneN || 0) + 1), f = (v) => v.toFixed(1);
        const cone = gy - ty > 4 ? `<linearGradient id="fps-cone-${n}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" class="c0"/><stop offset="1" class="c1"/></linearGradient>`
          + `<path class="cone" fill="url(#fps-cone-${n})" d="M${f(lx - tw)},${f(ty)} L${f(gx - rx)},${f(gy)} A${f(rx)},${f(ry)} 0 0 0 ${f(gx + rx)},${f(gy)} L${f(lx + tw)},${f(ty)} Z"/>` : '';
        const cord = top > z ? `<line class="cord" x1="${f(cx)}" y1="${f(cy)}" x2="${f(lx)}" y2="${f(ty)}"/><ellipse class="rose" cx="${f(cx)}" cy="${f(cy)}" rx="${f(r)}" ry="${f(r * cosT)}"/>` : '';
        const rec = this._items?.get(it.entity_id), css = rec?.el?.style;
        g.insertAdjacentHTML('beforeend', `<g data-stalk="${esc(it.entity_id)}" class="${el.classList.contains('on') ? 'on' : ''}" style="${el.classList.contains('hidden') ? 'display:none;' : ''}${css?.getPropertyValue('--c') ? `--c:${css.getPropertyValue('--c')};` : ''}${css?.getPropertyValue('--b') ? `--b:${css.getPropertyValue('--b')};` : ''}">${cone}${cord}</g>`);
      }
      return;
    }
    // optional thin line from the floor up to the icon
    const g = this._s.show_stalks && this.shadowRoot.querySelector('svg.plan .stalks');
    if (g && z - base > 1) {
      g.insertAdjacentHTML('beforeend', `<g data-stalk="${esc(it.entity_id)}" style="${el.classList.contains('hidden') ? 'display:none' : ''}"><ellipse cx="${fx.toFixed(1)}" cy="${fy.toFixed(1)}" rx="${(3.2 * p.s).toFixed(1)}" ry="${(3.2 * p.s * Math.cos((p.tilt * Math.PI) / 180)).toFixed(1)}"/><line x1="${fx.toFixed(1)}" y1="${fy.toFixed(1)}" x2="${fx.toFixed(1)}" y2="${ty.toFixed(1)}"/></g>`);
    }
  }

  /** Walk through the house in first person (loaded only when you ask for it). */
  async _openWalk() {
    if (this._walk) return;
    this._walk = { setHass() {}, close() {} };
    try {
      const { openWalk } = await import('./fps-walk.js?v=1.4.0b32');
      this._walk = openWalk(this, { plan: this._plan, hass: this._hass, canEdit: this._canMove && this._s.walk_edit !== false, onClose: () => { this._walk = null; } });
    } catch (e) { console.warn('Floorplan Studio: walk', e); this._walk = null; }
  }

  /** Turn or tilt the 2.5D view without rebuilding the card (used while dragging to turn it). */
  _reproject(rot, tilt) {
    const plan = this._plan, svg = this.shadowRoot.querySelector('svg.plan');
    if (!svg || !this._proj) return;
    this._proj = makeProj(plan, { rot, tilt, height: this._s.height_25d === 'real' ? 'real' : safeNumber(this._s.height_25d, 80), persp: this._s.perspective !== false });
    this._view = { rot, tilt };
    // a fresh drawing for the new angle (with perspective the floor can't follow one matrix)
    svg.insertAdjacentHTML('afterend', planSVG(plan, { proj: this._proj }));
    svg.remove();
    this.shadowRoot.querySelector('svg.plan').addEventListener('click', this._svgClick);
    this._glows = new Map(); this._radar = new Map(); this._last = new Map();
    for (const rec of this._items.values()) { rec.stalk = null; rec.strip = undefined; this._place(rec.el, rec.it, this._hass.states[rec.it.entity_id]); }
    this.shadowRoot.querySelectorAll('.rinfo').forEach((d) => { if (d._fx != null) [d.style.left, d.style.top] = this._at(d._fx, d._fy); });
    this._update(true);
  }
  /**
   * Curtains and blinds at their window, as far open as they really are; they slide (or roll) to a new position.
   * 2D: panels along the window. 2.5D: hanging panels from the rail to the floor (a blind: from the top of the window).
   */
  _curtainsUpdate() {
    const svg = this.shadowRoot.querySelector('svg.plan'), plan = this._plan, h = this._hass;
    if (!svg || !plan) return;
    this._curt = this._curt || new Map();
    const seen = new Set();
    for (const it of plan.items || []) {
      const st = h.states[it.entity_id], info = curtainFor(plan, it, st);
      if (!info) continue;
      seen.add(it.entity_id);
      const rec = this._curt.get(it.entity_id) || { c: info.closed };
      rec.it = it; rec.info = info; rec.target = info.closed;
      this._curt.set(it.entity_id, rec);
    }
    for (const id of [...this._curt.keys()]) if (!seen.has(id)) this._curt.delete(id);
    let g = svg.querySelector('g.curtains');
    if (!this._curt.size) { g?.remove(); return; }
    if (!g) { g = document.createElementNS('http://www.w3.org/2000/svg', 'g'); g.setAttribute('class', 'curtains'); const before = svg.querySelector('.stalks') || svg.querySelector('.d-scan'); svg.insertBefore(g, before); }
    const draw = () => {
      const p = this._proj, out = [];
      for (const rec of this._curt.values()) {
        const { panels, a, u, n } = curtainPanels(plan, rec.it, rec.info, rec.c);
        const off = 6, th = 9, at = (s, d) => [a[0] + u[0] * s + n[0] * d, a[1] + u[1] * s + n[1] * d];
        for (const pn of panels) {
          if (!p) {
            // 2D: the fabric along the window, a little into the room, with a few folds
            if (rec.info.style === 'roller') {
              const q = [at(pn.a0, off), at(pn.a1, off), at(pn.a1, off + th), at(pn.a0, off + th)];
              out.push(`<polygon class="roller" style="opacity:${(0.15 + 0.85 * rec.c).toFixed(2)}" points="${q.map((v) => v.map((w) => w.toFixed(1)).join(',')).join(' ')}"/>`);
              continue;
            }
            const q = [at(pn.a0, off), at(pn.a1, off), at(pn.a1, off + th), at(pn.a0, off + th)];
            out.push(`<polygon points="${q.map((v) => v.map((w) => w.toFixed(1)).join(',')).join(' ')}"/>`);
            const folds = Math.max(1, Math.round((pn.a1 - pn.a0) / 9));
            for (let k = 1; k < folds; k++) { const sa = pn.a0 + ((pn.a1 - pn.a0) * k) / folds, f1 = at(sa, off), f2 = at(sa, off + th); out.push(`<line x1="${f1[0].toFixed(1)}" y1="${f1[1].toFixed(1)}" x2="${f2[0].toFixed(1)}" y2="${f2[1].toFixed(1)}"/>`); }
          } else {
            // 2.5D: a hanging panel (rail just under the ceiling to the floor); a blind rolls down over the glass
            const k = p.sc * p.lift, roller = rec.info.style === 'roller';
            const zt = (roller ? 2.15 : 2.4) * k, zb = roller ? (2.15 - rec.c * (2.15 - Math.max(rec.info.bottom, 0.88))) * k : rec.info.bottom * k;
            if (zt - zb < 0.5) continue;
            const P = (s, z) => p.P(...at(s, off), z);
            const q = [P(pn.a0, zb), P(pn.a1, zb), P(pn.a1, zt), P(pn.a0, zt)];
            out.push(`<polygon ${roller ? 'class="roller"' : ''} points="${q.map((v) => v.map((w) => w.toFixed(1)).join(',')).join(' ')}"/>`);
            if (!roller) {
              const folds = Math.max(1, Math.round((pn.a1 - pn.a0) / 9));
              for (let f = 1; f < folds; f++) { const sa = pn.a0 + ((pn.a1 - pn.a0) * f) / folds, f1 = P(sa, zb), f2 = P(sa, zt); out.push(`<line x1="${f1[0].toFixed(1)}" y1="${f1[1].toFixed(1)}" x2="${f2[0].toFixed(1)}" y2="${f2[1].toFixed(1)}"/>`); }
            }
          }
        }
      }
      g.innerHTML = out.join('');
    };
    // slide towards the real position (about 1.5 s for fully open to closed)
    const step = (t) => {
      const dt = this._curtT ? Math.min(0.1, (t - this._curtT) / 1000) : 0.016;
      this._curtT = t;
      let moving = false;
      for (const rec of this._curt.values()) {
        const d = rec.target - rec.c;
        if (Math.abs(d) > 0.002) { rec.c += Math.sign(d) * Math.min(Math.abs(d), dt * 0.7); moving = true; } else rec.c = rec.target;
      }
      draw();
      this._curtRaf = moving ? requestAnimationFrame(step) : 0;
      if (!moving) this._curtT = 0;
    };
    if (!this._curtRaf) this._curtRaf = requestAnimationFrame(step);
  }

  /** Air conditioners blow (blue when cooling, orange when heating); linked TVs light up their furniture. */
  _tvGlow() {
    const svg = this.shadowRoot.querySelector('svg.plan'), h = this._hass, plan = this._plan;
    for (const [id, rec] of this._items) {
      if (!rec.el.classList.contains('aircon')) continue;
      const m = airconMode(h.states[id]);
      for (const k of ['cool', 'heat', 'dry', 'fan']) rec.el.classList.toggle(`ac-${k}`, m === k);
    }
    if (!svg) return;
    let g = svg.querySelector('g.tvglows');
    const ambi = (plan.items || []).map((it) => [it, ambilightTv(plan, it, h.states[it.entity_id])]).filter(([, f]) => f);
    const rads = radiatorLinks(plan, h);
    if (!this._tvl?.size && !ambi.length && !rads.byFurn.size && !(plan.furniture || []).some((f) => f.type === 'speakerbox')) { g?.remove(); return; }
    if (!g) { g = document.createElementNS('http://www.w3.org/2000/svg', 'g'); g.setAttribute('class', 'tvglows'); svg.insertBefore(g, svg.querySelector('.stalks') || svg.querySelector('.d-scan')); }
    const out = [], p = this._proj;
    for (const [id, f] of this._tvl) {
      const st = h.states[id];
      if (!st || !['on', 'playing', 'paused', 'idle', 'buffering'].includes(st.state)) continue;
      const r = (safeNumber(f.rot) * Math.PI) / 180, w = safeNumber(f.w, 100) / 2 + 6, d = Math.max(safeNumber(f.h, 12), 10) / 2 + 6, fx = safeNumber(f.x), fy = safeNumber(f.y);
      const sc2 = tvScreen(f, planScale(plan) || 70, plan), z = p ? ((sc2[0] + sc2[1]) / 2) * p.sc * p.lift : 0;
      const pts = [[-w, -d], [w, -d], [w, d], [-w, d]].map(([x, y]) => { const X = fx + x * Math.cos(r) - y * Math.sin(r), Y = fy + x * Math.sin(r) + y * Math.cos(r); return p ? p.P(X, Y, z) : [X, Y]; });
      out.push(`<polygon points="${pts.map((q) => q.map((v) => v.toFixed(1)).join(',')).join(' ')}"/>`);
    }
    // radiators that are heating: a warm glow
    for (const f of plan.furniture || []) {
      const id = rads.byFurn.get(f.id);
      if (!id || !isHeating(h.states[id])) continue;
      const r = (safeNumber(f.rot) * Math.PI) / 180, w = safeNumber(f.w, 80) / 2 + 8, d = Math.max(safeNumber(f.h, 10), 8) / 2 + 10, fx = safeNumber(f.x), fy = safeNumber(f.y), z = p ? 0.4 * p.sc * p.lift : 0;
      const pts = [[-w, -d], [w, -d], [w, d], [-w, d]].map(([x, y]) => { const X = fx + x * Math.cos(r) - y * Math.sin(r), Y = fy + x * Math.sin(r) + y * Math.cos(r); return p ? p.P(X, Y, z) : [X, Y]; });
      out.unshift(`<polygon class="ambi" style="fill:rgb(255,120,50);stroke:rgb(255,120,50)" points="${pts.map((q) => q.map((v) => v.toFixed(1)).join(',')).join(' ')}"/>`);
    }
    // ambilight: a glow around the TV in the colour of its light (and lights in speaker boxes around those boxes)
    for (const it of plan.items || []) for (const f of speakerBoxes(plan, it, h.states[it.entity_id])) ambi.push([it, f]);
    for (const [it, f] of ambi) {
      const st = h.states[it.entity_id];
      if (!isOn(st)) continue;
      const c = lightColor(st) || '255,190,110', r = (safeNumber(f.rot) * Math.PI) / 180, w = safeNumber(f.w, 100) / 2 + 14, d = Math.max(safeNumber(f.h, 12), 10) / 2 + 14, fx = safeNumber(f.x), fy = safeNumber(f.y);
      const z = p ? ((tvScreen(f, planScale(plan) || 70, plan)[0] + tvScreen(f, planScale(plan) || 70, plan)[1]) / 2) * p.sc * p.lift : 0;
      const pts = [[-w, -d], [w, -d], [w, d], [-w, d]].map(([x, y]) => { const X = fx + x * Math.cos(r) - y * Math.sin(r), Y = fy + x * Math.sin(r) + y * Math.cos(r); return p ? p.P(X, Y, z) : [X, Y]; });
      out.unshift(`<polygon class="ambi" style="fill:rgb(${c});stroke:rgb(${c})" points="${pts.map((q) => q.map((v) => v.toFixed(1)).join(',')).join(' ')}"/>`);
    }
    g.innerHTML = out.join('');
  }
  /** Spots that are aimed somewhere: a beam of light to where they shine (in the lamp's colour, when on). */
  _beams() {
    const svg = this.shadowRoot.querySelector('svg.plan'), plan = this._plan, h = this._hass;
    if (!svg) return;
    let g = svg.querySelector('g.beams');
    const out = [], p = this._proj;
    for (const [id, rec] of this._items) {
      const it = rec.it, st = h.states[id];
      if (!it.aim || rec.kind !== 'lamp' || !isOn(st) || !isSpot(it, st)) continue;
      const hm = deviceHeight(plan, it, st, h), S = planScale(plan) || 70, ax = safeNumber(it.aim.x), ay = safeNumber(it.aim.y), az = Number.isFinite(+it.aim.z) ? +it.aim.z : 0;
      const x0 = safeNumber(it.x), y0 = safeNumber(it.y), d3 = Math.hypot((ax - x0) / S, (ay - y0) / S, hm - az), r = Math.max(0.12, d3 * Math.tan(0.24)) * S;
      const dx = ax - x0, dy = ay - y0, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
      const k = p ? p.sc * p.lift : 0, Q = (x, y, z) => (p ? p.P(x, y, z * k) : [x, y]);
      const tip = Q(x0, y0, hm), b1 = Q(ax + nx * r, ay + ny * r, az), b2 = Q(ax - nx * r, ay - ny * r, az);
      const c = rec.el.style.getPropertyValue('--c') || '';
      out.push(`<g style="${c ? `--c:${c}` : ''}"><polygon points="${[tip, b1, b2].map((q) => q.map((v) => v.toFixed(1)).join(',')).join(' ')}"/>${p ? `<polygon points="${Array.from({ length: 14 }, (_, i) => { const a = (i / 14) * 2 * Math.PI; return Q(ax + Math.cos(a) * r, ay + Math.sin(a) * r, az).map((v) => v.toFixed(1)).join(','); }).join(' ')}" style="opacity:.4"/>` : `<ellipse cx="${ax}" cy="${ay}" rx="${r.toFixed(1)}" ry="${r.toFixed(1)}"/>`}</g>`);
    }
    if (!out.length) { g?.remove(); return; }
    if (!g) { g = document.createElementNS('http://www.w3.org/2000/svg', 'g'); g.setAttribute('class', 'beams'); svg.insertBefore(g, svg.querySelector('.stalks') || svg.querySelector('.d-scan')); }
    g.innerHTML = out.join('');
  }
  /** WLED ring clocks: light up the LEDs for the hour, minute and second (in the lamp's colour when it is on). */
  _ringClocks() {
    const now = new Date();
    for (const [id, rec] of this._items) {
      if (!rec.el.classList.contains('ringclock')) continue;
      const dots = rec.el.querySelectorAll('.ring circle'), n = dots.length, on = isOn(this._hass.states[id]);
      if (!n) continue;
      const { hour, minute, second } = ringClockLeds(n, now);
      dots.forEach((c, i) => c.setAttribute('class', !on ? '' : i === hour ? 'h' : i === minute ? 'm' : i === second ? 's' : ''));
    }
  }

  _turnTo(rot, tilt) {
    this._turn = { rot: ((rot % 360) + 360) % 360, tilt: Math.max(20, Math.min(80, tilt)) };
    clearTimeout(this._turnGhostT);
    this.shadowRoot.querySelector('ha-card')?.classList.add('turning');   // icons ghosted while turning (setting)
    if (this._turnRaf) return;
    this._turnRaf = requestAnimationFrame(() => { this._turnRaf = 0; this._reproject(this._turn.rot, this._turn.tilt); });
  }
  _turnDone() {
    if (!this._turn) return;
    clearTimeout(this._turnGhostT);
    this._turnGhostT = setTimeout(() => this.shadowRoot.querySelector('ha-card')?.classList.remove('turning'), 120);
    this._setPref('rot', String(Math.round(this._turn.rot)));
    this._setPref('tilt', String(Math.round(this._turn.tilt)));
    this._turn = null;
  }

  /* ---------------------------------------------------------- update */
  _visible(entityId, it) {
    // 'none': a calm map without icons; what is drawn as itself (LED strips, curtains, TV, spots, a ring clock) still shows what it does
    if (this._mode === 'none') return !!ringClock(it, this._hass);
    if (this._mode !== 'simple' || it.pin) return true;
    if (entityId.startsWith('vacuum.') && VACUUM_BUSY.includes(this._hass?.states[entityId]?.state)) return true;   // a vacuum on the move is always shown
    const u = this._usage;
    if (!u || (u.tracking_days < this._s.learning_days && u.entities.length < 3)) return true; // still learning
    return u.entities.includes(entityId);
  }

  _update(force = false) {
    if (!this._built || !this._hass) return;
    const h = this._hass;
    this._themeTick();
    if (this._config.home) { this._updateHome(force); return; }
    this._fading = false;
    this._wledLiveSync();
    this._curtainsUpdate();
    this._tvGlow();
    this._ringClocks();
    this._beams();
    for (const [id, rec] of this._items) {
      const st = h.states[id];
      const vis = this._visible(id, rec.it);
      rec.el.classList.toggle('hidden', !vis);
      if (this._proj) { const sk = rec.stalk || (rec.stalk = [...this.shadowRoot.querySelectorAll('[data-stalk]')].find((n) => n.dataset.stalk === id) || null); if (sk) sk.style.display = vis ? '' : 'none'; }
      if (isMotion(st)) {
        // fades from the accent colour back to grey over a few minutes after the last movement
        const f = motionFade(st, this._s);
        rec.el.classList.toggle('recent', f > 0);
        rec.el.style.setProperty('--pf', f);
        if (f > 0) this._fading = true;
      }
      // a lamp powered through a smart switch: the switch decides whether it is on at all
      const vs = rec.it.via ? h.states[rec.it.via] : null;
      if (!force && st === rec.st && vs === rec.vs) continue;
      rec.st = st; rec.vs = vs;
      if (!st && !vs) continue;
      if (rec.icon && rec.icon.tagName === 'HA-STATE-ICON' && st) { rec.icon.hass = h; rec.icon.stateObj = st; }
      if (vs) rec.el.style.opacity = '';
      const on = vs ? vs.state === 'on' && (!st || isOn(st) || ['unavailable', 'unknown'].includes(st.state)) : isOn(st);
      if (!st) { rec.el.classList.toggle('on', on); rec.el.querySelector('.tag').textContent = ''; continue; }
      rec.el.classList.toggle('on', on);
      rec.stalk?.classList.toggle('on', on);
      if (rec.strip === undefined) rec.strip = [...this.shadowRoot.querySelectorAll('svg.plan [data-strip]')].find((n) => n.dataset.strip === id) || null;
      rec.strip?.classList.toggle('on', on);
      if (rec.kind === 'lamp') {
        // a fixed colour from the editor wins (e.g. a smart plug with a purple lamp in it)
        const fixed = rec.it.color && /^#[0-9a-f]{6}$/i.test(rec.it.color) ? [1, 3, 5].map((i) => parseInt(rec.it.color.slice(i, i + 2), 16)).join(',') : null;
        const c = fixed || lightColor(st);
        if (c) rec.el.style.setProperty('--c', c); else rec.el.style.removeProperty('--c');
        for (const g of [rec.stalk, rec.strip]) if (g) { if (c) g.style.setProperty('--c', c); else g.style.removeProperty('--c'); }
        // brightness: a dimmed lamp gets a softer button and glow, and its level as a small tag
        const br = st.attributes.brightness, lvl = on && br != null ? Math.max(1, Math.round(br / 2.55)) : null;
        rec.el.style.setProperty('--b', lvl != null ? (lvl / 100).toFixed(2) : '1');
        rec.stalk?.style.setProperty('--b', lvl != null ? (lvl / 100).toFixed(2) : '1');
        rec.strip?.style.setProperty('--b', lvl != null ? (lvl / 100).toFixed(2) : '1');
        // lamp_level: fixed = always a small tag, hover = only in the name when you point at the lamp, off = nothing
        const lm = levelMode(this._s);
        rec.el.querySelector('.tag').textContent = lvl != null && lm === 'fixed' ? `${lvl}%` : '';
        rec.el.querySelector('.name').textContent = lm === 'off' ? rec.label : `${rec.label} · ${lvl != null ? `${lvl}%` : shortState(h, st)}`;
      } else if (rec.kind === 'sensor') {
        rec.el.querySelector('.bub').textContent = shortState(h, st);
      } else {
        const dom = st.entity_id.split('.')[0];
        rec.el.querySelector('.tag').textContent = ['climate', 'cover', 'media_player', 'vacuum'].includes(dom) ? shortState(h, st) : '';
        // pointing at a device shows its name and what it is doing ("Televisie · Speelt")
        const now = shortState(h, st);
        rec.el.querySelector('.name').textContent = now && now !== rec.label ? `${rec.label} · ${now}` : rec.label;
        // a TV glows while it is on or playing, a speaker only sends out waves while it plays
        rec.el.classList.toggle('playing', dom === 'media_player' && (st.state === 'playing' || (st.state === 'on' && rec.el.classList.contains('tv'))));
      }
    }
    for (const room of this._plan.rooms) this._updateRoom(room);
    this._updateRadars();
    // doors and windows with a sensor: orange and dashed while open
    this.shadowRoot.querySelectorAll('.opening[data-entity]').forEach((g) => g.classList.toggle('isopen', ['on', 'open', 'opening'].includes(h.states[g.dataset.entity]?.state)));
    if (this._compact) this._compactUpdate();
    this._updateGlows();
    this._updateSide();
    this._renderQuick();
    if (this._greet) {
      const g = greeting(h), root = this.shadowRoot;
      const g1 = root.querySelector('.g1'), g2 = root.querySelector('.g2');
      if (g1 && g1.textContent !== g.title) g1.textContent = g.title;
      if (g2 && g2.textContent !== g.sub) g2.textContent = g.sub;
    }
    this._updateAlerts();
    this._liveMap();
    if (this._zoomRoom) this._renderPanel();
    const note = this.shadowRoot.querySelector('.note');
    if (note) {
      const u = this._usage;
      note.textContent = this._mode === 'simple' && u && u.tracking_days < this._s.learning_days && u.entities.length < 3 ? t(h, 'learning', { d: u.tracking_days }) : '';
    }
  }

  /** mmWave radars: a dashed circle for the range, a ring at the distance (or a dot per person). */
  _updateRadars() {
    const layer = this.shadowRoot.querySelector('svg.plan .radars');
    if (!layer) return;
    const scale = planScale(this._plan), ns = 'http://www.w3.org/2000/svg';
    this._radar = this._radar || new Map();
    for (const it of this._plan.items || []) {
      if (!it.radar) continue;
      const r = radarState(this._hass, it, scale);
      let el = this._radar.get(it.entity_id);
      if (!el || !layer.contains(el.g)) {
        const g = document.createElementNS(ns, 'g');
        const mk = (cls) => { const c = document.createElementNS(ns, this._proj ? 'ellipse' : 'circle'); c.setAttribute('class', cls); g.appendChild(c); return c; };
        el = { g, range: mk('radar-range'), ring: mk('radar-ring'), dots: [] };
        el.label = document.createElementNS(ns, 'text'); el.label.setAttribute('class', 'radar-label'); el.label.setAttribute('text-anchor', 'middle'); g.appendChild(el.label);
        // the radar only "sees" inside its own room
        const room = roomAt(this._plan.rooms, it.x, it.y);
        if (room) g.setAttribute('clip-path', `url(#${this._proj ? 'cp' : 'c'}-${safeSvgId(room.id)})`);
        layer.appendChild(g); this._radar.set(it.entity_id, el);
      }
      const show = !!r && this._visible(it.entity_id, it);
      el.g.style.display = show ? '' : 'none';
      if (!show) continue;
      const p = this._proj;
      if (p) {
        // 2.5D: circles on the floor become (tilted) ellipses
        const [sx, sy] = p.P(r.x, r.y), [a, b2, cc, d] = p.J(r.x, r.y), kx = Math.hypot(a, cc), ky = Math.hypot(b2, d);
        for (const c of [el.range, el.ring]) { c.setAttribute('cx', sx); c.setAttribute('cy', sy); }
        el.range.setAttribute('rx', r.range * kx); el.range.setAttribute('ry', r.range * ky);
        el.ring.setAttribute('rx', (r.ring || 1) * kx); el.ring.setAttribute('ry', (r.ring || 1) * ky);
      } else {
        for (const c of [el.range, el.ring]) { c.setAttribute('cx', r.x); c.setAttribute('cy', r.y); }
        el.range.setAttribute('r', r.range); el.ring.style.r = `${r.ring || 1}px`;
      }
      el.range.style.display = r.range ? '' : 'none';
      el.ring.style.display = r.ring ? '' : 'none';
      // the measured distance as a small label just above the sensor
      el.label.setAttribute('x', r.x); el.label.setAttribute('y', r.y - 24);
      el.label.textContent = r.meters && !this._proj ? `${r.meters.toFixed(1).replace('.', ',')} m` : '';
      while (el.dots.length < r.dots.length) { const c = document.createElementNS(ns, 'circle'); c.setAttribute('class', 'radar-dot'); c.setAttribute('r', 9); el.g.appendChild(c); el.dots.push(c); }
      el.dots.forEach((c, i) => {
        const d = r.dots[i];
        c.style.display = d ? '' : 'none';
        if (d) { const q = p ? p.P(d[0], d[1]) : d; c.style.cx = `${q[0]}px`; c.style.cy = `${q[1]}px`; }
      });
    }
  }

  _updateRoom(room) {
    const h = this._hass, s = roomSummary(h, room), S = this._s;
    const pres = S.presence ? roomPresence(h, room, S) : { occupied: false, by: [], people: [] };
    const al = roomAlerts(h, room, S);
    this._roomState = this._roomState || new Map();
    this._roomState.set(room.id, { pres, al });
    const tempOn = this._tempOn;
    const info = roomInfo(h, room, S);
    if (pres.fade > 0) this._fading = true;
    const key = [JSON.stringify(info), s.lit.join(), s.colors.join('|'), pres.by.join(), pres.people.join(), pres.fade, al.items.map((a) => a.id).join(), tempOn, S.glow_style].join('/');
    if (this._last.get(room.id) === key) return;
    this._last.set(room.id, key);
    const root = this.shadowRoot;
    // temperature colour + alerts on the floor
    const tv = s.temp ? parseFloat(s.temp.state) : NaN;
    root.querySelectorAll('.floor').forEach((f) => {
      if (f.dataset.room !== room.id) return;
      if (tempOn && !isNaN(tv)) f.style.fill = `color-mix(in srgb, var(--fps-floor) 62%, rgb(${tempColor(tv, S.temp_min, S.temp_max)}))`;
      else f.style.removeProperty('fill');
      f.classList.toggle('alarm', al.level === 'alarm');
      f.classList.toggle('warn', al.level === 'warn');
    });
    this._updatePeople(room, pres);
    const glow = root.getElementById(`glow-${safeSvgId(room.id)}`);
    glow?.classList.toggle('on', s.lit.length > 0 && S.glow_style === 'room');
    if (s.colors.length) {
      const avg = [0, 1, 2].map((i) => Math.round(s.colors.reduce((a, c) => a + +c.split(',')[i], 0) / s.colors.length)).join(',');
      root.getElementById(`g-${safeSvgId(room.id)}`)?.style.setProperty('--glow', avg);
    }
    const box = [...root.querySelectorAll('.rinfo')].find((el) => el.dataset.room === room.id);
    if (!box) return;
    box.classList.toggle('on', s.lit.length > 0);
    box.classList.toggle('present', pres.occupied);
    box.classList.toggle('recent', pres.fade > 0);
    box.style.setProperty('--pf', pres.fade || 0);
    box.querySelector('.rh').textContent = info.headline;
    const rows = box.querySelector('.rrows');
    rows.innerHTML = '';
    for (const r of info.rows) {
      const d = document.createElement('div');
      d.className = `rr ${r.on ? 'on' : ''} ${r.warn ? 'warn' : ''}`;
      let ic;
      if (r.icon) { ic = document.createElement('ha-icon'); ic.icon = r.icon; }
      else { ic = document.createElement('ha-state-icon'); ic.hass = h; ic.stateObj = h.states[r.entity]; }
      const sp = document.createElement('span'); sp.textContent = r.text;
      d.append(ic, sp);
      rows.appendChild(d);
    }
  }

  /** Room text blocks as HTML (icons + rows), each on the freest spot of its room. */
  _buildLabels() {
    const layer = this.shadowRoot.querySelector('.labels'), plan = this._plan, S = this._s;
    if (!layer) return;
    layer.innerHTML = '';
    for (const room of plan.rooms) {
      const fs0 = Math.max(9, Math.min(13, roomTextWidth(room) / 12)) * (S.label_size / 100);
      const fs = fs0 * (room.label_scale || 1);
      const rows = this._hass ? roomInfo(this._hass, room, S).rows.length : 2;
      const [x, y] = room.label ? [room.label.x, room.label.y] : labelSpot(plan, room, fs0, rows);
      const d = document.createElement('div');
      d.className = `rinfo ${room.label_hidden ? 'off' : ''}`; d.dataset.room = room.id; d._fs = fs0;
      if (this._proj) {
        // 2.5D: hang the (short) block by its middle, so turning and tilting keeps it inside the room
        const name = String(room.name || ''), bw = Math.max(name.length * fs0 * 0.84, fs0 * 9.5), bh = fs0 * 3.9;
        d._fx = x + bw / 2; d._fy = y + bh / 2;
      } else { d._fx = x; d._fy = y; }
      [d.style.left, d.style.top] = this._at(d._fx, d._fy);
      d.style.setProperty('--fs', `${((fs * (this._proj ? Math.min(1, this._proj.s * 1.1) : 1)) / plan.width) * 100}cqw`);
      d.innerHTML = '<div class="rn"><span></span><span class="pd"><ha-icon icon="mdi:motion-sensor"></ha-icon></span></div><div class="rh"></div><div class="rrows"></div>';
      d.querySelector('.rn span').textContent = room.name || '';
      if (this._isAdmin && !this.planOverride) d.insertAdjacentHTML('beforeend', '<i class="rsz" title="Groter / kleiner"></i>');
      this._labelPointer(d, room);
      layer.appendChild(d);
    }
  }

  /**
   * Text block: tap = like tapping the room; hold = menu (admins); while moving icons: drag it,
   * and drag the little corner to make it bigger or smaller.
   */
  _labelPointer(d, room) {
    let timer = null, down = null, held = false;
    const editable = () => this._isAdmin && !this.planOverride;
    d.addEventListener('click', (ev) => ev.stopPropagation());
    d.addEventListener('contextmenu', (ev) => ev.preventDefault());
    d.addEventListener('pointerdown', (ev) => {
      ev.stopPropagation();
      if (this._zoomRoom) return;
      if (editable() && ev.target.classList.contains('rsz')) { this._labelResize(ev, d, room); return; }
      if (editable() && this._moving) { this._labelDrag(ev, d, room); return; }
      held = false; down = ev;
      if (editable()) timer = setTimeout(() => { timer = null; held = true; this._labelMenu(d, room); }, this._s.hold_ms);
    });
    const cancel = () => { clearTimeout(timer); timer = null; };
    d.addEventListener('pointermove', (ev) => {
      if (!down || held || Math.hypot(ev.clientX - down.clientX, ev.clientY - down.clientY) <= 8) return;
      cancel();
      const from = down; down = null;
      if (editable()) this._labelDrag(from, d, room);   // press and move = drag the block straight away
    });
    d.addEventListener('pointercancel', () => { cancel(); down = null; });
    d.addEventListener('pointerup', (ev) => {
      ev.stopPropagation();
      const tap = down && !held && !this._moving;
      cancel(); down = null;
      if (tap) this._roomTap(room);
    });
  }

  _labelDrag(ev, d, room) {
    const rect = this._stage.getBoundingClientRect(), plan = this._plan;
    const px = (e) => [((e.clientX - rect.left) / rect.width) * plan.width, ((e.clientY - rect.top) / rect.height) * plan.height];
    const [sx, sy] = px(ev);
    const ox = sx - (parseFloat(d.style.left) / 100) * plan.width, oy = sy - (parseFloat(d.style.top) / 100) * plan.height;
    this._dragging = true;
    d.setPointerCapture(ev.pointerId);
    d.classList.add('dragging');
    let pos = null;
    const move = (e) => {
      const [x, y] = px(e);
      pos = { x: Math.round(Math.max(0, Math.min(plan.width - 20, x - ox))), y: Math.round(Math.max(0, Math.min(plan.height - 20, y - oy))) };
      d.style.left = `${(pos.x / plan.width) * 100}%`; d.style.top = `${(pos.y / plan.height) * 100}%`;
    };
    const up = async () => {
      d.removeEventListener('pointermove', move); d.removeEventListener('pointerup', up);
      d.classList.remove('dragging');
      if (pos && this._proj) { const [fx, fy] = this._proj.inv(pos.x, pos.y); pos = { x: Math.round(fx), y: Math.round(fy) }; }
      if (pos) await this._saveRoom(room, (r) => { r.label = pos; }, false); else this._dragging = false;
    };
    d.addEventListener('pointermove', move); d.addEventListener('pointerup', up);
  }

  _labelResize(ev, d, room) {
    const r0 = d.getBoundingClientRect(), base = room.label_scale || 1;
    const dist0 = Math.hypot(ev.clientX - r0.left, ev.clientY - r0.top) || 1;
    const plan = this._plan;
    this._dragging = true;
    const handle = ev.target;
    handle.setPointerCapture(ev.pointerId);
    let scale = base;
    const move = (e) => {
      scale = Math.round(Math.max(0.5, Math.min(3, base * (Math.hypot(e.clientX - r0.left, e.clientY - r0.top) / dist0))) * 100) / 100;
      d.style.setProperty('--fs', `${((d._fs * scale) / plan.width) * 100}cqw`);
    };
    const up = async () => {
      handle.removeEventListener('pointermove', move); handle.removeEventListener('pointerup', up);
      await this._saveRoom(room, (r) => { r.label_scale = scale; }, false);
    };
    handle.addEventListener('pointermove', move); handle.addEventListener('pointerup', up);
  }

  _labelMenu(d, room) {
    this._closeLabelMenu();
    const h = this._hass, m = document.createElement('div');
    m.className = 'lmenu';
    m.style.left = d.style.left; m.style.top = d.style.top;
    const items = [
      ['move', 'mdi:cursor-move', t(h, 'lbl_move')],
      ['bigger', 'mdi:magnify-plus-outline', t(h, 'lbl_bigger')],
      ['smaller', 'mdi:magnify-minus-outline', t(h, 'lbl_smaller')],
      ['auto', 'mdi:auto-fix', t(h, 'lbl_auto')],
      ['hide', room.label_hidden ? 'mdi:eye-outline' : 'mdi:eye-off-outline', t(h, room.label_hidden ? 'lbl_show' : 'lbl_hide')],
    ];
    m.innerHTML = `<div class="lm-t">${esc(room.name || '')}</div>` + items.map(([k, ic, txt]) => `<button data-a="${k}"><ha-icon icon="${ic}"></ha-icon>${esc(txt)}</button>`).join('');
    m.addEventListener('pointerdown', (ev) => ev.stopPropagation());
    m.addEventListener('click', async (ev) => {
      ev.stopPropagation();
      const a = ev.target.closest('button')?.dataset.a;
      if (!a) return;
      this._closeLabelMenu();
      if (a === 'move') { this._moving = true; this._build(); return; }
      if (a === 'bigger' || a === 'smaller') await this._saveRoom(room, (r) => { r.label_scale = Math.round(Math.max(0.5, Math.min(3, (r.label_scale || 1) * (a === 'bigger' ? 1.15 : 1 / 1.15))) * 100) / 100; });
      if (a === 'auto') await this._saveRoom(room, (r) => { delete r.label; delete r.label_scale; });
      if (a === 'hide') await this._saveRoom(room, (r) => { r.label_hidden = !r.label_hidden || undefined; });
    });
    this._stage.appendChild(m);
    this._lmenu = m;
    if (navigator.vibrate) try { navigator.vibrate(15); } catch (e) { /* ignore */ }
  }
  _closeLabelMenu() { this._lmenu?.remove(); this._lmenu = null; }

  /** Change one room of the plan, save it, and redraw the text blocks. */
  async _saveRoom(room, fn, rebuild = true) {
    const r = this._plan.rooms.find((x) => x.id === room.id);
    if (!r) return;
    fn(r);
    this._dragging = true;
    try { await savePlan(this._hass, this._plan); } catch (e) { this._toast(String(e.message || e)); } finally { this._dragging = false; }
    if (rebuild) { this._buildLabels(); this._last = new Map(); this._update(true); }
  }

  /** A soft pool of light around every lamp that is on, in the lamp's colour. */
  /** plan_size (or the card's own `size`): the plan uses less of the width, so the page gets more compact. */
  _sizeStyle() {
    if (this._compact) return '';   // phones use the full width
    const n = Number(this._config.size ?? this._s.plan_size ?? 100);
    return n > 0 && n < 100 ? `width: ${n}%; margin: 0 auto;` : '';
  }

  _updateGlows() {
    const g = this.shadowRoot.querySelector('.lampglows > g');
    if (!g) return;
    const on = this._s.glow_style === 'lamp';
    for (const [id, rec] of this._items) {
      const d = id.split('.')[0];
      if (d !== 'light' && !rec.it.color && rec.it.kind !== 'lamp') continue;
      let c = this._glows.get(id);
      if (!c) {
        c = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
        g.appendChild(c); this._glows.set(id, c);
      }
      // the pool of light on the floor under the lamp (in 2.5D: tilted with the floor), follows it when moved
      const p = this._proj, r0 = this._plan.width * 0.06;
      if (p) {
        const [gx, gy] = p.P(rec.it.x, rec.it.y), [a, b2, cc, d] = p.J(rec.it.x, rec.it.y);
        c.setAttribute('cx', gx); c.setAttribute('cy', gy); c.setAttribute('rx', r0 * Math.hypot(a, cc)); c.setAttribute('ry', r0 * Math.hypot(b2, d));
      } else { c.setAttribute('cx', rec.it.x); c.setAttribute('cy', rec.it.y); c.setAttribute('rx', r0); c.setAttribute('ry', r0); }
      const lit = on && rec.el.classList.contains('on') && !rec.el.classList.contains('hidden');
      const col = rec.el.style.getPropertyValue('--c') || '255,176,90';
      const b = levelMode(this._s) !== 'off' ? parseFloat(rec.el.style.getPropertyValue('--b')) || 1 : 1;
      c.setAttribute('fill', `rgb(${col})`);
      c.style.opacity = lit ? (0.3 + 0.7 * b).toFixed(2) : '0';
    }
  }

  /** Right-hand column: clock, weather, the big button, quick buttons, energy and a status list. */
  _updateSide() {
    const el = this.shadowRoot.querySelector('.side');
    if (!el) return;
    const h = this._hass, plan = this._plan, cfg = sideConfig(h, plan);
    const now = new Date(), lang = (h.locale?.language || 'en');
    const wx = weatherInfo(h, cfg.weather), main = mainAction(h, plan, cfg), en = energyInfo(h, cfg);
    const stRows = cfg.status.map((id) => statusRow(h, id, cfg.names)).filter(Boolean);
    const key = JSON.stringify([now.getHours(), now.getMinutes(), wx, main.title, main.sub, main.on, en, stRows, cfg.buttons.map((id) => h.states[id]?.state)]);
    if (el.dataset.key === key) return;
    el.dataset.key = key;
    const date = now.toLocaleDateString(lang, { weekday: 'long', day: 'numeric', month: 'long' });
    el.innerHTML = `
      <div class="clock"><div class="time">${now.toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit' })}</div><div class="date">${esc(date[0].toUpperCase() + date.slice(1))}</div></div>
      ${wx ? `<div class="wx" data-more="${esc(cfg.weather)}"><ha-icon icon="${wx.icon}"></ha-icon><div><b>${esc(wx.temp)}</b><small>${esc(wx.text)}</small></div></div>` : ''}
      <div class="box mainbtn ${main.on ? 'on' : ''}" id="mainbtn"><div><b>${esc(main.title)}</b><small>${esc(main.sub)}</small></div><div class="pwr"><ha-icon icon="${esc(main.icon || 'mdi:power')}"></ha-icon></div></div>
      ${cfg.buttons.length ? `<div class="btns">${cfg.buttons.map((id) => `<button class="sbtn" data-btn="${esc(id)}"><ha-icon icon="${esc(h.states[id].attributes.icon || (id.startsWith('scene.') ? 'mdi:palette' : id.startsWith('script.') ? 'mdi:script-text-play' : 'mdi:gesture-tap'))}"></ha-icon><span>${esc(friendly(h, id))}</span></button>`).join('')}</div>` : ''}
      ${en ? `<div class="box energy" data-more="${esc(cfg.solar || cfg.grid)}"><div class="cols">
          ${en.solar != null ? `<div><label>${t(h, 'e_solar')}</label><b>${esc(en.solar)}</b></div>` : ''}
          <div><label>${t(h, 'e_grid')}</label><b class="${en.exporting ? 'exp' : ''}">${esc(en.net)}</b></div>
          ${en.price ? `<div><label>${t(h, 'e_price')}</label><b>${esc(en.price)}</b></div>` : ''}</div>
          ${en.share != null ? `<div class="bar"><i style="width:${Math.round(en.share * 100)}%"></i></div>` : ''}${en.today ? `<small>${esc(en.today)}</small>` : ''}</div>` : ''}
      ${stRows.length ? `<div class="status">${stRows.map((r) => `<div class="srow" data-more="${esc(r.id)}"><ha-state-icon data-id="${esc(r.id)}"></ha-state-icon><span class="n">${esc(r.name)}</span><span class="v">${esc(r.value)}</span></div>`).join('')}</div>` : ''}
      ${this._showNav ? navHTML(this._config.nav) : ''}`;
    el.querySelectorAll('ha-state-icon[data-id]').forEach((ic) => { ic.hass = h; ic.stateObj = h.states[ic.dataset.id]; });
    el.querySelectorAll('[data-more]').forEach((x) => x.addEventListener('click', () => fire(this, 'hass-more-info', { entityId: x.dataset.more })));
    el.querySelector('#mainbtn')?.addEventListener('click', () => { if (main.call) h.callService(...main.call); });
    el.querySelectorAll('[data-btn]').forEach((b) => b.addEventListener('click', () => {
      const id = b.dataset.btn, d = id.split('.')[0];
      h.callService(d, ['scene', 'script'].includes(d) ? 'turn_on' : 'toggle', { entity_id: id });
    }));
    el.querySelectorAll('.navbar [data-nav]').forEach((b) => b.addEventListener('click', () => kioskGo(b.dataset.nav)));
  }

  /** Little avatars for people that are tracked to this room. */
  _updatePeople(room, pres) {
    const layer = this.shadowRoot.querySelector('.peoplelayer');
    if (!layer) return;
    let box = [...layer.querySelectorAll('.people')].find((el) => el.dataset.room === room.id);
    if (!pres.people.length) { box?.remove(); return; }
    if (!box) {
      box = document.createElement('div');
      box.className = 'people'; box.dataset.room = room.id;
      const [x0, , , y1] = roomBBox(room);
      [box.style.left, box.style.top] = this._at(x0 + 10, y1 - 10);
      layer.appendChild(box);
    }
    box.innerHTML = '';
    for (const p of pres.people) {
      const st = this._hass.states[p], name = friendly(this._hass, p);
      const d = document.createElement('div');
      d.className = 'person'; d.title = name;
      if (st?.attributes.entity_picture) d.style.backgroundImage = `url("${st.attributes.entity_picture}")`;
      else d.textContent = name.split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase();
      box.appendChild(d);
    }
  }

  /** One banner with every alarm (red, flashing) or open door/window (orange). */
  _updateAlerts() {
    const bar = this.shadowRoot.querySelector('.alertbar');
    if (!bar || !this._roomState) return;
    const all = [];
    for (const room of this._plan.rooms) for (const a of this._roomState.get(room.id)?.al.items || []) all.push({ ...a, room });
    const alarms = all.filter((a) => a.level === 'alarm'), list = alarms.length ? alarms : all;
    const key = list.map((a) => a.id).join();
    if (bar.dataset.key === key) return;
    bar.dataset.key = key;
    bar.className = 'alertbar' + (alarms.length ? ' alarm' : list.length ? ' warn' : '');
    bar.innerHTML = list.length ? `<ha-icon icon="${alarms.length ? 'mdi:alert' : 'mdi:door-open'}"></ha-icon>` : '';
    for (const a of list) {
      const sp = document.createElement('span');
      sp.textContent = `${t(this._hass, 'a_' + a.dc)} – ${a.room.name}`;
      sp.addEventListener('click', () => this._zoom(a.room));
      bar.appendChild(sp);
    }
  }

  /** The vacuum's own live map over the plan while it cleans, lined up with the traced background. */
  _liveMap() {
    const el = this.shadowRoot.querySelector('.livemap');
    if (!el) return;
    const h = this._hass, S = this._s, vac = planVacuum(h, this._plan), mapId = vacuumMapEntity(h, this._plan);
    const busy = vac && VACUUM_BUSY.includes(h.states[vac]?.state);
    const show = !!mapId && (S.vacuum_live === 'always' || (S.vacuum_live === 'cleaning' && busy));
    const mode = S.vacuum_show || 'robot';              // robot: only the robot drives over your plan | map: the vacuum's own map | both
    const showMap = show && mode !== 'robot';
    el.classList.toggle('on', showMap && !!this._liveUrl);
    el.setAttribute('opacity', S.vacuum_opacity);
    if (!show || mode === 'map') this._robotAt(vac, null);
    if (!show) return;
    const st = h.states[mapId];
    const src = st.attributes.entity_picture;
    if (!src) return;
    const stamp = `${src}|${st.last_updated || st.state}`;
    const now = Date.now();
    if (this._liveStamp === stamp && now - (this._liveAt || 0) < 5000) return;
    if (this._liveBusy) return;
    this._liveStamp = stamp; this._liveAt = now; this._liveBusy = true;
    const img = new Image();
    img.onload = () => {
      this._liveBusy = false;
      let c = img;
      try { c = transformImage(img, this._plan.background?.ops || []); } catch (e) { /* use as is */ }
      if (showMap) {
        try { this._liveUrl = c.toDataURL ? c.toDataURL('image/png') : img.src; } catch (e) { this._liveUrl = img.src; }
        el.setAttribute('href', this._liveUrl);
        el.classList.add('on');
      }
      if (mode !== 'map') this._robotAt(vac, findRobot(c), c);
    };
    img.onerror = () => { this._liveBusy = false; };
    img.src = src + (src.includes('?') ? '&' : '?') + '_=' + now;
    clearTimeout(this._liveTimer);
    this._liveTimer = setTimeout(() => this._update(), 5500);   // keep refreshing while it drives
  }

  /** Move the vacuum's icon to where the robot is on its map (null = back to its own spot), with a short trail. */
  _robotAt(vac, pos, canvas) {
    const rec = vac && this._items.get(vac), trail = this.shadowRoot.querySelector('.vactrail');
    if (!rec) return;
    const b = this._plan.background;
    if (!pos || !b || !canvas) {
      if (rec.el.classList.contains('driving')) {
        rec.el.classList.remove('driving');
        [rec.el.style.left, rec.el.style.top] = this._at(rec.it.x, rec.it.y);
      }
      this._trail = [];
      trail?.setAttribute('points', '');
      return;
    }
    const w = canvas.width || canvas.naturalWidth, hh = canvas.height || canvas.naturalHeight;
    const x = (b.x || 0) + (pos[0] / w) * b.w, y = (b.y || 0) + (pos[1] / hh) * b.h;
    rec.el.classList.add('driving');
    [rec.el.style.left, rec.el.style.top] = this._at(x, y);
    this._trail = [...(this._trail || []), [Math.round(x), Math.round(y)]].slice(-60);
    trail?.setAttribute('points', this._trail.map((p) => p.join(',')).join(' '));
  }


  _toast(text) {
    const old = this.shadowRoot.querySelector('.toast'); old?.remove();
    const d = document.createElement('div');
    d.className = 'toast'; d.textContent = text;
    this._card.appendChild(d);
    setTimeout(() => d.remove(), 3500);
  }

  /** Clean one room: vacuum.clean_area (HA areas) or, as a fallback, Roborock segment ids. */
  async _cleanRoom(room) {
    const h = this._hass, vac = planVacuum(h, this._plan);
    if (!vac) return;
    try {
      if (h.services?.vacuum?.clean_area && room.area_id) {
        await h.callService('vacuum', 'clean_area', { entity_id: vac, cleaning_area_id: room.area_id });
      } else if (room.vacuum_segments) {
        const segs = String(room.vacuum_segments).split(/[\s,;]+/).filter(Boolean).map((v) => (isNaN(+v) ? v : +v));
        await h.callService('vacuum', 'send_command', { entity_id: vac, command: 'app_segment_clean', params: [{ segments: segs, repeat: 1 }] });
      } else return;
      this._toast(t(h, 'cleaning_sent'));
    } catch (e) {
      this._toast(t(h, 'clean_failed', { e: e.message || e }));
    }
  }
  _canClean(room) {
    const h = this._hass;
    return !!planVacuum(h, this._plan) && ((h.services?.vacuum?.clean_area && room.area_id) || !!room.vacuum_segments);
  }

  /* theme follows the clock / the sun: re-apply when the effective look changes */
  _themeTick() {
    const real = this._realTheme;
    const key = real + (THEMES[real]?.daylight ? '|' + daylightVars(this._hass, this._s).key : '');
    const first = this._themeKey === undefined;
    if (this._themeKey === key) return;
    this._themeKey = key;
    if (first) return;
    this._card.className = 't-' + real + (this._zoomRoom ? ' zoomed' : '') + (this._moving ? ' moving' : '') + (this._s.show_tags ? '' : ' notags') + (levelMode(this._s) === 'off' ? ' nolevel' : '') + (this._compact ? ' compact' + (this._zoomRoom ? '' : ' cov') : '');
    this._card.setAttribute('style', themeStyle(this._theme, this._hass, this._s));
    const sel = this.shadowRoot.querySelector('#theme');            // keep the dropdown in step when the theme changes elsewhere
    if (sel && sel.value !== real) sel.value = real;
  }

  /* ---------------------------------------------------------- home page */
  /**
   * `home: true`: a calm start page instead of the plan, in the plan's theme. Greeting, the smart button and
   * quick buttons; a tile per room (tap = its lights on/off, hold = its own page); energy and a status list.
   */
  _buildHome() {
    const h = this._hass;
    this.shadowRoot.innerHTML = `<style>${CSS}</style>
      <ha-card class="t-${this._realTheme}" style="${themeStyle(this._theme, h, this._s)}">
        <div class="side home"><div class="hgrid"><div class="hc hc1"></div><div class="hc hc2"></div><div class="hc hc3"></div></div></div>
      </ha-card>`;
    this._card = this.shadowRoot.querySelector('ha-card');
    this._built = true;
    this._themeKey = undefined;
    this._update(true);
  }
  _homeIcon(room) {
    const a = this._hass.areas?.[room.area_id];
    if (a?.icon) return a.icon;
    const n = (room.name || '').toLowerCase();
    const M = [[/woon|living|lounge/, 'mdi:sofa'], [/keuken|kitchen/, 'mdi:countertop'], [/eet|tafel|dining/, 'mdi:silverware-fork-knife'], [/slaap|bed/, 'mdi:bed'],
      [/bad|douche|bath|shower/, 'mdi:shower'], [/wc|toilet/, 'mdi:toilet'], [/kantoor|werk|office|studeer|study/, 'mdi:desk'], [/hal|gang|entree|hall/, 'mdi:door'],
      [/closet|kast|wardrobe/, 'mdi:hanger'], [/kind|baby|nursery|kids/, 'mdi:teddy-bear'], [/berging|zolder|storage|attic/, 'mdi:archive'], [/garage/, 'mdi:garage'],
      [/tuin|garden|terras|patio|balkon/, 'mdi:flower'], [/was|laundry/, 'mdi:washing-machine']];
    return (M.find(([re]) => re.test(n)) || [, 'mdi:floor-plan'])[1];
  }
  _homeDevices() {
    const h = this._hass, items = this._plan.items.map((i) => i.entity_id).filter((id) => h.states[id]);
    const pick = (d, test = () => true) => items.find((id) => id.startsWith(d + '.') && test(h.states[id]));
    return [pick('cover'), pick('climate'), pick('media_player', (s) => s.attributes.device_class === 'tv') || pick('media_player')].filter(Boolean);
  }
  _updateHome(force = false) {
    const h = this._hass, plan = this._plan, root = this.shadowRoot, S = this._s;
    const c1 = root.querySelector('.hc1'), c2 = root.querySelector('.hc2'), c3 = root.querySelector('.hc3');
    if (!c1) return;
    const cfg = sideConfig(h, plan), now = new Date(), lang = h.locale?.language || 'en';
    const wx = weatherInfo(h, cfg.weather), main = mainAction(h, plan, cfg), en = energyInfo(h, cfg), g = greeting(h);
    const rooms = plan.rooms.filter((r) => r.name).map((r) => {
      const s = roomSummary(h, r), info = roomInfo(h, r, S);
      const sub = s.lit.length ? t(h, 'n_on', { n: s.lit.length }) : info.headline || (s.lights.length ? t(h, 'off') : '');
      const pres = S.presence ? roomPresence(h, r, S).occupied : false;
      return { id: r.id, name: r.name, icon: this._homeIcon(r), on: s.lit.length > 0, sub, lights: s.lights, pres };
    });
    const devs = this._homeDevices();
    const stRows = cfg.status.map((id) => statusRow(h, id, cfg.names)).filter(Boolean);
    const time = now.toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit' });
    const key = JSON.stringify([time, wx, main.title, main.sub, main.on, en, g, rooms.map((r) => [r.on, r.sub, r.pres]), devs.map((id) => h.states[id].state), stRows, cfg.buttons.map((id) => h.states[id]?.state), this._realTheme]);
    if (!force && this._homeKey === key) return;
    this._homeKey = key;
    const hello = [time, wx ? `${wx.temp} ${t(h, 'outside')}` : '', g.sub].filter(Boolean).join(' · ');
    c1.innerHTML = `
      <div class="box hello"><b>${esc(g.title)}</b><small>${esc(hello)}</small></div>
      <div class="box mainbtn big ${main.on ? 'on' : ''}" id="mainbtn"><div><label>${t(h, 'right_now')}</label><b>${esc(main.title)}</b><small>${esc(main.sub)}</small></div><div class="pwr"><ha-icon icon="${esc(main.icon || 'mdi:power')}"></ha-icon></div></div>
      ${cfg.buttons.length ? `<div class="btns two">${cfg.buttons.map((id) => `<button class="sbtn" data-btn="${esc(id)}"><ha-icon icon="${esc(h.states[id].attributes.icon || (id.startsWith('scene.') ? 'mdi:palette' : id.startsWith('script.') ? 'mdi:script-text-play' : 'mdi:gesture-tap'))}"></ha-icon><span>${esc(friendly(h, id))}</span></button>`).join('')}</div>` : ''}
      ${this._showNav ? navHTML(this._config.nav) : ''}`;
    c2.innerHTML = `<div class="hlabel">${t(h, 'rooms')}</div><div class="tiles">
      ${rooms.map((r) => `<div class="tile ${r.on ? 'on' : ''}" data-room="${esc(r.id)}">${r.pres ? '<ha-icon class="tpres" icon="mdi:motion-sensor"></ha-icon>' : ''}<div class="ti"><ha-icon icon="${esc(r.icon)}"></ha-icon></div><b>${esc(r.name)}</b><small>${esc(r.sub)}</small></div>`).join('')}
      ${devs.map((id) => `<div class="tile ${isOn(h.states[id]) ? 'on' : ''}" data-dev="${esc(id)}"><div class="ti"><ha-state-icon data-id="${esc(id)}"></ha-state-icon></div><b>${esc(plan.items.find((i) => i.entity_id === id)?.name || friendly(h, id))}</b><small>${esc(shortState(h, h.states[id]))}</small></div>`).join('')}
    </div>`;
    c3.innerHTML = `${en ? `<div class="hlabel">${t(h, 'energy_now')}</div><div class="etiles" data-more="${esc(cfg.solar || cfg.grid)}">
        ${en.solar != null ? `<div class="box"><label>${t(h, 'h_solar')}</label><b>${esc(en.solar)}</b></div>` : ''}
        <div class="box"><label>${t(h, en.exporting ? 'h_return' : 'h_grid')}</label><b class="${en.exporting ? 'exp' : ''}">${esc(en.net)}</b></div>
        ${en.price ? `<div class="box"><label>${t(h, 'h_price')}</label><b>${esc(en.price)}</b></div>` : ''}</div>
        ${en.share != null || en.today ? `<div class="esub">${en.share != null ? `<div class="bar"><i style="width:${Math.round(en.share * 100)}%"></i></div>` : ''}${en.today ? `<small>${esc(en.today)}</small>` : ''}</div>` : ''}` : ''}
      ${wx ? `<div class="box wx" data-more="${esc(cfg.weather)}"><ha-icon icon="${wx.icon}"></ha-icon><div><b>${esc(wx.temp)}</b><small>${esc(wx.text)}</small></div></div>` : ''}
      ${stRows.length ? `<div class="status">${stRows.map((r) => `<div class="srow" data-more="${esc(r.id)}"><ha-state-icon data-id="${esc(r.id)}"></ha-state-icon><span class="n">${esc(r.name)}</span><span class="v">${esc(r.value)}</span></div>`).join('')}</div>` : ''}`;
    root.querySelectorAll('.home ha-state-icon[data-id]').forEach((ic) => { ic.hass = h; ic.stateObj = h.states[ic.dataset.id]; });
    root.querySelectorAll('.home [data-more]').forEach((x) => x.addEventListener('click', () => fire(this, 'hass-more-info', { entityId: x.dataset.more })));
    root.querySelector('#mainbtn')?.addEventListener('click', () => { if (main.call) h.callService(...main.call); });
    root.querySelectorAll('.home [data-btn]').forEach((b) => b.addEventListener('click', () => {
      const id = b.dataset.btn, d = id.split('.')[0];
      h.callService(d, ['scene', 'script'].includes(d) ? 'turn_on' : 'toggle', { entity_id: id });
    }));
    root.querySelectorAll('.home .navbar [data-nav]').forEach((b) => b.addEventListener('click', () => kioskGo(b.dataset.nav)));
    // room tile: tap = its lights on/off, hold = the room's own page (or its details)
    root.querySelectorAll('.home .tile').forEach((tile) => {
      let timer = null, held = false;
      tile.addEventListener('pointerdown', () => {
        held = false;
        timer = setTimeout(() => {
          held = true;
          if (tile.dataset.dev) { fire(this, 'hass-more-info', { entityId: tile.dataset.dev }); return; }
          const room = plan.rooms.find((r) => r.id === tile.dataset.room);
          if (room && this._config.room_pages) navigate(location.pathname.replace(/[^/]*$/, roomPath(room)) + location.search);
        }, S.hold_ms);
      });
      const cancel = () => clearTimeout(timer);
      tile.addEventListener('pointerleave', cancel);
      tile.addEventListener('pointercancel', cancel);
      tile.addEventListener('pointerup', () => {
        clearTimeout(timer);
        if (held) return;
        if (tile.dataset.dev) {
          const id = tile.dataset.dev, d = id.split('.')[0];
          if (d === 'climate') fire(this, 'hass-more-info', { entityId: id });
          else h.callService(d, 'toggle', { entity_id: id });
          return;
        }
        const r = rooms.find((x) => x.id === tile.dataset.room);
        if (!r) return;
        if (r.lights.length) h.callService('homeassistant', r.on ? 'turn_off' : 'turn_on', { entity_id: r.lights });
        else if (this._config.room_pages) navigate(location.pathname.replace(/[^/]*$/, roomPath(plan.rooms.find((x) => x.id === r.id))) + location.search);
      });
    });
  }

  /* ---------------------------------------------------------- small screens: room by room */
  /** Narrow card (phone): the plan is too small for its icons, so it is shown room by room. */
  get _compactWanted() {
    if (this._config.room || this.planOverride || !this._plan) return false;
    const card = this._config.compact;                       // the card's own option wins
    if (card === 'off' || card === false) return false;
    if (card === 'on' || card === true) return true;
    const mine = this._pref('compact', '');                  // then this device's choice (the toolbar button)
    if (mine === 'on') return true;
    if (mine === 'off') return false;
    const mode = this._s.compact ?? 'auto';
    if (mode === 'off' || mode === false) return false;
    if (mode === 'on' || mode === true) return true;
    const w = this.clientWidth, limit = Number(this._s.compact_width) || 560;
    if (!w) return !!this._compact;                       // hidden or mid-transition (e.g. entering full screen): keep what we have
    return this._compact ? w < limit + 48 : w < limit;     // a margin, so a scrollbar coming and going can't flip it back and forth
  }
  /** Double tap on the plan while a room is open: back to the whole plan (full screen stays on). */
  _doubleTapWire(root) {
    const vp = root.querySelector('.viewport');
    let last = null;
    vp.addEventListener('pointerup', (ev) => {
      if (!ev.isPrimary || this._moving || !this._zoomRoom) { last = null; return; }
      if (ev.composedPath().some((n) => n.classList?.contains('item') || n.classList?.contains('lmenu'))) { last = null; return; }
      const now = Date.now();
      if (last && now - last.t < 380 && Math.hypot(ev.clientX - last.x, ev.clientY - last.y) < 40) { last = null; this._goBack(); return; }
      last = { t: now, x: ev.clientX, y: ev.clientY };
    });
  }
  /** Leave the open room: the overview (phones), the whole plan, or from a room page back to where you came from. */
  _goBack() {
    if (this._compact) { if (this._zoomRoom) this._compactZoom(null); return; }
    if (this._config.room) {
      // a generated room page (ruimte-…) goes to the dashboard's Floorplan tab, inside the app so full screen stays
      if (/\/ruimte-[^/]*$/.test(location.pathname)) navigate(location.pathname.replace(/[^/]*$/, 'plan') + location.search);
      else history.back();
      return;
    }
    if (this._zoomRoom) this._zoom(null);
  }

  /** The toolbar button to switch this device between room by room and the whole plan. */
  get _compactButton() {
    return this._config.compact == null && !this._config.room && !this.planOverride && this._s.compact !== 'off';
  }
  _compactCheck() {
    const want = this._compactWanted;
    if (!this._built) { this._compact = want; return; }
    if (want !== !!this._compact) {
      if (!want) this._zoomRoom = null;
      this._build();
    } else if (want && this._zoomRoom) this._compactLayout();
  }
  _compactRooms() {
    return (this._plan?.rooms || []).filter((r) => r.name && r.rects?.length);
  }
  _compactWire(root) {
    if (!this._compact) return;
    root.querySelectorAll('[data-croom]').forEach((b) => b.addEventListener('click', (ev) => {
      ev.stopPropagation();
      this._compactZoom(this._compactRooms().find((r) => r.id === b.dataset.croom) || null);
    }));
    // swipe left / right over the plan: next / previous room
    const vp = root.querySelector('.viewport');
    let t0 = null;
    vp.addEventListener('touchstart', (ev) => { const p = ev.touches[0]; t0 = [p.clientX, p.clientY]; }, { passive: true });
    vp.addEventListener('touchend', (ev) => {
      if (!t0 || this._moving) return;
      const p = ev.changedTouches[0], dx = p.clientX - t0[0], dy = p.clientY - t0[1];
      t0 = null;
      if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy) * 1.8) return;
      const list = [null, ...this._compactRooms()];
      const i = list.findIndex((r) => (r?.id || null) === (this._zoomRoom?.id || null));
      this._compactZoom(list[(i + (dx < 0 ? 1 : -1) + list.length) % list.length]);
    }, { passive: true });
  }
  _compactZoom(room) {
    this._zoomRoom = room || null;
    try { sessionStorage.setItem(`fps-croom-${this._plan.id}`, room?.id || ''); } catch (e) { /* ignore */ }
    this._card.classList.toggle('zoomed', !!room);
    this._card.classList.toggle('cov', !room);
    this.shadowRoot.querySelectorAll('[data-croom]').forEach((b) => {
      const on = b.dataset.croom === (room?.id || '');
      b.classList.toggle('active', on);
      if (on) b.parentElement.scrollTo({ left: b.offsetLeft - (b.parentElement.clientWidth - b.offsetWidth) / 2, behavior: 'smooth' });
    });
    this.shadowRoot.querySelectorAll('.floor, .glow').forEach((el) => el.classList.toggle('dim', !!room && el.dataset.room !== room.id));
    for (const rec of this._items.values()) rec.el.classList.toggle('out', !!room && this._itemRoom(rec.it) !== room);
    this._ghost(room);
    this._compactLayout();
    this._compactUpdate(true);
  }
  /** Everything outside the open room fades away: other rooms, their walls, light spilling over. */
  _ghost(room) {
    const g = this.shadowRoot.querySelector('svg.ghost');
    if (!g) return;
    if (!room) { g.classList.remove('on'); return; }
    const W = safeNumber(this._plan.width, 1000), H = safeNumber(this._plan.height, 700), e = 5;   // keep the room's own walls clear
    const holes = room.rects.map((q) => {
      const x0 = Math.min(q[0], q[2]) - e, y0 = Math.min(q[1], q[3]) - e, x1 = Math.max(q[0], q[2]) + e, y1 = Math.max(q[1], q[3]) + e;
      if (this._proj) return `<polygon points="${[[x0, y0], [x1, y0], [x1, y1], [x0, y1]].map(([x, y]) => this._proj.P(x, y).map((v) => v.toFixed(1)).join(',')).join(' ')}" fill="#000"/>`;
      return `<rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" fill="#000"/>`;
    }).join('');
    const m = `fpsghost-${room.id}`.replace(/[^\w-]/g, '');
    const mx = '';
    // 2.5D: keep the room's own raised walls clear too (the outline around its floor and its wall tops)
    let tall = '';
    if (this._proj) {
      const { P, wallH } = this._proj;
      tall = room.rects.map((q) => {
        const [a0, b0, a1, b1] = [Math.min(q[0], q[2]) - e, Math.min(q[1], q[3]) - e, Math.max(q[0], q[2]) + e, Math.max(q[1], q[3]) + e];
        const pts = [[a0, b0], [a1, b0], [a1, b1], [a0, b1]].flatMap(([x, y]) => [P(x, y), P(x, y, wallH)]);
        return `<polygon points="${hull(pts).map((p) => p.map((v) => v.toFixed(1)).join(',')).join(' ')}" fill="#000"/>`;
      }).join('');
    }
    g.innerHTML = `<defs><mask id="${m}" maskUnits="userSpaceOnUse" x="-${W}" y="-${H}" width="${3 * W}" height="${3 * H}"><rect x="-${W}" y="-${H}" width="${3 * W}" height="${3 * H}" fill="#fff"/><g${mx}>${holes}</g>${tall}</mask></defs>
      <rect x="-${W}" y="-${H}" width="${3 * W}" height="${3 * H}" mask="url(#${m})"/>`;
    g.classList.add('on');
  }

  /** Fit the room to the card width (and at most ~60% of the screen height). */
  _compactLayout() {
    const vp = this.shadowRoot.querySelector('.viewport'), room = this._zoomRoom;
    if (!vp || !this._stage) return;
    if (!room) { vp.style.height = ''; this._stage.style.transform = ''; this._stage.style.setProperty('--k', 1); return; }
    const W = this._plan.width, vw = vp.clientWidth || this.clientWidth, base = vw / W;
    const [x0, y0, x1, y1] = this._screenBox(room), pad = Math.max(12, (x1 - x0) * 0.05);
    const bw = x1 - x0 + 2 * pad, bh = y1 - y0 + 2 * pad;
    const maxH = Math.min(vw * 1.25, (window.innerHeight || 800) * 0.6);
    const s = Math.min(8, W / bw, maxH / (bh * base));
    const tx = (vw - (x1 - x0) * base * s) / 2 - x0 * base * s, ty = pad * base * s - y0 * base * s;
    vp.style.height = `${Math.round(bh * base * s)}px`;
    this._stage.style.transform = `translate(${tx}px, ${ty}px) scale(${s})`;
    this._stage.style.setProperty('--k', (1.2 / s).toFixed(3));
  }
  /** Header above the plan with the room's own text block, and a dot on room chips with a light on. */
  _compactUpdate(force = false) {
    const h = this._hass, head = this.shadowRoot.querySelector('.chead');
    for (const b of this.shadowRoot.querySelectorAll('[data-croom]')) {
      const r = this._plan.rooms.find((x) => x.id === b.dataset.croom);
      b.classList.toggle('lit', !!r && roomSummary(h, r).lit.length > 0);
    }
    if (!head) return;
    const room = this._zoomRoom;
    if (!room) { head.innerHTML = ''; head.dataset.key = ''; return; }
    const info = roomInfo(h, room, { ...this._s, info_rows: 8 });
    const key = room.id + JSON.stringify(info);
    if (!force && head.dataset.key === key) return;
    head.dataset.key = key;
    head.innerHTML = `<div class="cn">${esc(room.name || '')}</div>${info.headline ? `<div class="ch">${esc(info.headline)}</div>` : ''}
      <div class="crows">${info.rows.map((r) => `<span class="${r.on ? 'on' : ''} ${r.warn ? 'warn' : ''}">${r.icon ? `<ha-icon icon="${r.icon}"></ha-icon>` : `<ha-state-icon data-id="${esc(r.entity)}"></ha-state-icon>`}${esc(r.text)}</span>`).join('')}</div>`;
    head.querySelectorAll('ha-state-icon[data-id]').forEach((ic) => { ic.hass = h; ic.stateObj = h.states[ic.dataset.id]; });
  }

  /* ---------------------------------------------------------- zoom */
  /**
   * Room view: the room is isolated (everything else dims away), zoomed into the left part of
   * the card, and a side panel shows the room's data and everything in its area.
   */
  /**
   * The room a device belongs to: the room of its Home Assistant area; without an area, the room
   * most of its icon stands in (an icon on a wall goes to the side it mostly sits on).
   */
  _itemRoom(it) {
    const plan = this._plan, area = entityArea(this._hass, it.entity_id);
    if (area) { const r = plan.rooms.find((x) => x.area_id === area); if (r) return r; }
    const half = safeNumber(plan.width, 1000) * 0.0145;
    let best = null, most = 0;
    for (const r of plan.rooms) {
      let a = 0;
      for (const q of r.rects) {
        const [x0, y0, x1, y1] = [Math.min(q[0], q[2]), Math.min(q[1], q[3]), Math.max(q[0], q[2]), Math.max(q[1], q[3])];
        a += Math.max(0, Math.min(x1, it.x + half) - Math.max(x0, it.x - half)) * Math.max(0, Math.min(y1, it.y + half) - Math.max(y0, it.y - half));
      }
      if (a > most) { most = a; best = r; }
    }
    return best;
  }

  get _canMove() { return this._isAdmin && !this.planOverride; }
  /** "Move icons" on/off; a zoomed-in room stays zoomed in. */
  _toggleMove() { this._moving = !this._moving; this._build(); }

  /** A room's box on screen: in 2.5D the box around its turned and tilted corners (and the raised walls). */
  _screenBox(room) {
    if (!this._proj) return roomBBox(room);
    const { P, wallH } = this._proj, pts = [];
    for (const q of room.rects) for (const [x, y] of [[q[0], q[1]], [q[2], q[1]], [q[0], q[3]], [q[2], q[3]]]) { pts.push(P(x, y)); pts.push(P(x, y, wallH * 0.5)); }
    return [Math.min(...pts.map((p) => p[0])), Math.min(...pts.map((p) => p[1])), Math.max(...pts.map((p) => p[0])), Math.max(...pts.map((p) => p[1]))];
  }

  _zoom(room, animate = true) {
    if (this._compact) return this._compactZoom(room);
    if (!room && this._zoomRoom) this._zoomOutAt = Date.now();
    if (room) this._free = { s: 1, x: 0, y: 0 };
    this._zoomRoom = room;
    const plan = this._plan, W = plan.width, H = plan.height;
    this._card.classList.toggle('zoomed', !!room);
    this._stage.style.transition = animate ? '' : 'none';
    const panel = this.shadowRoot.querySelector('.roompanel');
    let k = 1;
    if (!room) {
      this._stage.style.transform = '';
      panel.classList.remove('open');
    } else {
      const [x0, y0, x1, y1] = this._screenBox(room);
      const wide = this._stage.clientWidth > 520;
      const side = wide && !this._panelMin ? 0.36 : 0;              // room panel takes the right 36% on wide cards (unless made small)
      const availW = W * (1 - side), cxT = availW / 2;
      // only the part of the plan you can actually see counts (a tall plan can run below the screen)
      const vp = this.shadowRoot.querySelector('.viewport').getBoundingClientRect(), sh = this._stage.clientHeight || 1, ih = window.innerHeight || sh;
      const vTop = Math.max(0, -vp.top), vBot = Math.max(vTop + 60, Math.min(sh, ih - vp.top));
      let yv0 = (vTop / sh) * H, yv1 = (vBot / sh) * H;
      if (!wide && !this._panelMin) yv1 = yv0 + (yv1 - yv0) * 0.54;  // the panel covers the bottom on narrow cards
      const s = Math.min(5, Math.min(availW / (x1 - x0), (yv1 - yv0) / (y1 - y0)) * 0.86);
      const tx = ((cxT - ((x0 + x1) / 2) * s) / W) * 100;
      const ty = (((yv0 + yv1) / 2 - ((y0 + y1) / 2) * s) / H) * 100;
      this._stage.style.transform = `translate(${tx}%, ${ty}%) scale(${s})`;
      k = Math.min(1, 1.9 / s);
      panel.classList.toggle('narrow', !wide);
      panel.classList.toggle('min', !!this._panelMin);
      panel.classList.add('open');
      this._renderPanel(true);
    }
    this._stage.style.setProperty('--k', k);
    this._card.classList.toggle('pmin', !!room && !!this._panelMin);
    this.shadowRoot.querySelectorAll('.rinfo').forEach((el) => el.classList.toggle('cur', !!room && el.dataset.room === room.id));
    this.shadowRoot.querySelectorAll('.floor, .glow').forEach((el) => el.classList.toggle('dim', !!room && el.dataset.room !== room.id));
    for (const rec of this._items.values()) rec.el.classList.toggle('out', !!room && this._itemRoom(rec.it) !== room);
    this._ghost(room);
    // the room's text moves to the side panel while zoomed (.zoomed .rinfo hides it)
  }

  _renderPanel(force = false) {
    const room = this._zoomRoom, h = this._hass;
    if (!room) return;
    const panel = this.shadowRoot.querySelector('.roompanel');
    const s = roomSummary(h, room), S = this._s;
    const ids = areaEntities(h, room.area_id, [...PLACE_DOMAINS, 'sensor', 'binary_sensor', 'scene', 'script', 'button', 'select', 'number', 'input_boolean'])
      .sort((a, b) => (isOn(h.states[b]) - isOn(h.states[a])) || friendly(h, a).localeCompare(friendly(h, b))).slice(0, 40);
    const rs = this._roomState?.get(room.id) || { pres: { occupied: false, by: [], people: [] }, al: { items: [] } };
    const key = [JSON.stringify(roomInfo(h, room, S)), s.lit.length, rs.pres.by.join(), rs.pres.people.join(), rs.al.items.map((a) => a.id).join(), ...ids.map((id) => `${id}=${h.states[id]?.state}`)].join('|');
    if (!force && panel.dataset.key === key) return;
    panel.dataset.key = key;
    const info = roomInfo(h, room, S);
    if (this._panelMin) {
      // made small: just the room, its temperature and a button to open the panel again
      panel.innerHTML = `<div class="pminbar"><button class="btn icon" id="back" title="${t(h, 'back')}"><ha-icon icon="mdi:arrow-left"></ha-icon></button>
        <span class="pname ${s.lit.length ? 'on' : ''}">${esc(room.name || '')}</span>${info.headline ? `<span class="pmt">${esc(info.headline)}</span>` : ''}
        ${this._canMove ? `<button class="btn icon ${this._moving ? 'active' : ''}" id="pmove" title="${t(h, this._moving ? 'done' : 'move')}"><ha-icon icon="mdi:cursor-move"></ha-icon></button>` : ''}
        <button class="btn icon" id="pmin" title="${t(h, 'panel_open')}"><ha-icon icon="mdi:arrow-expand-left"></ha-icon></button></div>`;
      panel.querySelector('#pmove')?.addEventListener('click', (ev) => { ev.stopPropagation(); this._toggleMove(); });
      panel.querySelector('#back').addEventListener('click', (ev) => { ev.stopPropagation(); this._goBack(); });
      panel.querySelector('#pmin').addEventListener('click', (ev) => { ev.stopPropagation(); this._panelMin = false; this._zoom(this._zoomRoom); });
      return;
    }
    panel.innerHTML = `<div class="ptop"><button class="btn" id="back"><ha-icon icon="mdi:arrow-left"></ha-icon>${t(h, 'back')}</button><span class="grow"></span>${this._canMove ? `<button class="btn ${this._moving ? 'active' : ''}" id="pmove"><ha-icon icon="mdi:cursor-move"></ha-icon>${t(h, this._moving ? 'done' : 'move')}</button>` : ''}<button class="btn icon" id="pmin" title="${t(h, 'panel_min')}"><ha-icon icon="mdi:arrow-collapse-right"></ha-icon></button></div>
      <div class="pname ${s.lit.length ? 'on' : ''}">${esc(room.name || '')}</div>
      ${info.headline ? `<div class="ptemp">${esc(info.headline)}</div>` : ''}
      <div class="prows">${info.rows.map((r) => `<div class="pline prow2 ${r.on ? 'on' : ''} ${r.warn ? 'warn' : ''}">${r.icon ? `<ha-icon icon="${r.icon}"></ha-icon>` : `<ha-state-icon data-id="${esc(r.entity)}"></ha-state-icon>`}<span>${esc(r.text)}</span></div>`).join('')}</div>
      ${rs.pres.occupied ? `<div class="ppres"><ha-icon icon="mdi:account"></ha-icon>${esc(rs.pres.people.length ? rs.pres.people.map((p) => friendly(h, p)).join(', ') : t(h, 'present'))}</div>` : ''}
      ${rs.al.items.map((a) => `<div class="palert ${a.level}">${esc(t(h, 'a_' + a.dc))} · ${esc(friendly(h, a.id))}</div>`).join('')}
      ${this._canClean(room) ? `<div class="pbtn"><button class="btn" id="clean"><ha-icon icon="mdi:robot-vacuum"></ha-icon>${t(h, 'clean_room')}</button></div>` : ''}
      <div class="phead fold ${this._plistOpen ? 'open' : ''}" id="pfold">${t(h, 'in_room')} <span class="cnt">(${ids.length})</span><ha-icon icon="mdi:chevron-down"></ha-icon></div><div class="plist" ${this._plistOpen ? '' : 'hidden'}></div>`;
    panel.querySelectorAll('.prows ha-state-icon[data-id]').forEach((ic) => { ic.hass = h; ic.stateObj = h.states[ic.dataset.id]; });
    panel.querySelector('#back')?.addEventListener('click', (ev) => { ev.stopPropagation(); this._goBack(); });
    panel.querySelector('#clean')?.addEventListener('click', (ev) => { ev.stopPropagation(); this._cleanRoom(room); });
    panel.querySelector('#pmin')?.addEventListener('click', (ev) => { ev.stopPropagation(); this._panelMin = true; this._zoom(this._zoomRoom); });
    panel.querySelector('#pmove')?.addEventListener('click', (ev) => { ev.stopPropagation(); this._toggleMove(); });
    // "In this room" starts folded; tap the heading to open it (kept while you go from room to room)
    panel.querySelector('#pfold')?.addEventListener('click', (ev) => {
      ev.stopPropagation(); this._plistOpen = !this._plistOpen;
      ev.currentTarget.classList.toggle('open', this._plistOpen); panel.querySelector('.plist').hidden = !this._plistOpen;
    });
    const list = panel.querySelector('.plist');
    for (const id of ids) {
      const st = h.states[id];
      const row = document.createElement('div');
      row.className = `prow ${isOn(st) ? 'on' : ''}`;
      row.innerHTML = '<ha-state-icon></ha-state-icon><span class="n"></span><span class="v"></span>';
      const ic = row.querySelector('ha-state-icon'); ic.hass = h; ic.stateObj = st;
      row.querySelector('.n').textContent = friendly(h, id);
      row.querySelector('.v').textContent = shortState(h, st);
      this._pointer(row, { entity_id: id });
      list.appendChild(row);
    }
  }

  /* ---------------------------------------------------------- input */
  _pointer(el, it) {
    let timer = null, held = false, start = null;
    el.addEventListener('pointerdown', (ev) => {
      ev.stopPropagation();
      held = false; start = [ev.clientX, ev.clientY];
      if (this._moving && el.classList.contains('item')) { this._startDrag(ev, el, it); return; }
      timer = setTimeout(() => { held = true; this._quick(it.entity_id, el); }, this._s.hold_ms);
    });
    const cancel = () => { clearTimeout(timer); timer = null; };
    el.addEventListener('pointerleave', cancel);
    el.addEventListener('pointercancel', cancel);
    el.addEventListener('pointermove', (ev) => { if (start && Math.hypot(ev.clientX - start[0], ev.clientY - start[1]) > 10) cancel(); });
    el.addEventListener('pointerup', (ev) => {
      ev.stopPropagation();
      if (this._moving || !timer) { cancel(); return; }
      cancel();
      if (!held) this._tap(it.entity_id);
    });
    el.addEventListener('click', (ev) => ev.stopPropagation());
    el.addEventListener('contextmenu', (ev) => ev.preventDefault());
  }

  /* ---------------------------------------------------------- floors */
  /** `floors: [plan, plan, …]` (or `floors: true` for every plan): tabs at the top to switch between floors. */
  get _floorIds() {
    const f = this._config.floors;
    if (!f || this.planOverride) return [];
    const ids = f === true ? (this._plans || []).map((p) => p.id) : (Array.isArray(f) ? f : []).map((x) => (typeof x === 'object' ? x.plan : x));
    return ids.filter((id) => (this._plans || []).some((p) => p.id === id));
  }
  get _floorKey() { return `fps-floor-${this._floorIds.join('|')}`; }
  _floorName(id) {
    const f = Array.isArray(this._config.floors) && this._config.floors.find((x) => typeof x === 'object' && x.plan === id);
    return f?.name || this._plans?.find((p) => p.id === id)?.name || id;
  }
  async _setFloor(id) {
    const plan = this._plans?.find((p) => p.id === id);
    if (!plan || plan.id === this._plan?.id) return;
    try { localStorage.setItem(this._floorKey, id); } catch (e) { /* private mode */ }
    this._plan = plan; this._zoomRoom = null; this._free = { s: 1, x: 0, y: 0 };
    this._items = new Map();
    try { sessionStorage.removeItem(`fps-croom-${id}`); } catch (e) { /* ignore */ }
    await this._loadUsage();
    this._build();
  }

  /* ---------------------------------------------------------- free zoom (pinch / Ctrl+wheel) */
  /** Pinch with two fingers or Ctrl+scroll to zoom the whole plan, drag to move around; the button resets it. */
  _freeWire(root) {
    const vp = root.querySelector('.viewport');
    if (!vp || this._config.room) return;
    this._free = this._free || { s: 1, x: 0, y: 0 };
    const btn = document.createElement('button');
    btn.className = 'freereset';
    btn.innerHTML = `<ha-icon icon="mdi:magnify-minus-outline"></ha-icon><span>${t(this._hass, 'zoom_reset')}</span>`;
    btn.addEventListener('pointerdown', (ev) => ev.stopPropagation());
    btn.addEventListener('click', (ev) => { ev.stopPropagation(); this._freeSet(1, 0, 0); });
    vp.appendChild(btn);
    const pts = new Map();
    let pinch = null, pan = null, turn = null;
    const allowed = () => !this._zoomRoom && !this._moving && !this._compact;
    // 2.5D, mouse: right button (or Shift) + drag turns the house left/right and tilts it up/down
    vp.addEventListener('contextmenu', (ev) => { if (this._proj) ev.preventDefault(); });
    vp.addEventListener('pointerdown', (ev) => {
      if (this._zoomRoom || this._moving || !this._proj || ev.pointerType !== 'mouse' || !(ev.button === 2 || (ev.button === 0 && ev.shiftKey))) return;
      const v = this._view || { rot: this._rot, tilt: this._tilt };
      turn = { id: ev.pointerId, x0: ev.clientX, y0: ev.clientY, ...v };
      vp.setPointerCapture(ev.pointerId); ev.preventDefault(); ev.stopPropagation();
    }, { capture: true });
    vp.addEventListener('pointermove', (ev) => {
      if (!turn || ev.pointerId !== turn.id) return;
      this._turnTo(turn.rot + (ev.clientX - turn.x0) * 0.4, turn.tilt - (ev.clientY - turn.y0) * 0.25);
      this._freeDragged = Date.now(); ev.stopPropagation();
    }, { capture: true });
    const turnEnd = (ev) => { if (turn && ev.pointerId === turn.id) { turn = null; this._turnDone(); this._freeDragged = Date.now(); } };
    vp.addEventListener('pointerup', turnEnd, { capture: true });
    vp.addEventListener('pointercancel', turnEnd, { capture: true });
    vp.addEventListener('pointerdown', (ev) => {
      // free zoom on the whole plan; turning 2.5D with two fingers also room by room (phones)
      if (turn || !(allowed() || (this._proj && !this._zoomRoom && !this._moving)) || ev.target.closest?.('.freereset')) return;
      pts.set(ev.pointerId, [ev.clientX, ev.clientY]);
      if (pts.size === 2) {
        const [a, b] = [...pts.values()];
        const v = this._view || { rot: this._rot, tilt: this._tilt };
        pinch = { d: Math.hypot(a[0] - b[0], a[1] - b[1]), ...this._free, cx: (a[0] + b[0]) / 2, cy: (a[1] + b[1]) / 2, ang: Math.atan2(b[1] - a[1], b[0] - a[0]), rot: v.rot, tilt: v.tilt };
        pan = null;
      } else if (pts.size === 1 && this._free.s > 1 && !this._compact) pan = { x0: ev.clientX, y0: ev.clientY, ...this._free, moved: false };
    }, { capture: true });
    vp.addEventListener('pointermove', (ev) => {
      if (!pts.has(ev.pointerId)) return;
      pts.set(ev.pointerId, [ev.clientX, ev.clientY]);
      const r = vp.getBoundingClientRect();
      if (pinch && pts.size >= 2) {
        const [a, b] = [...pts.values()];
        const s = Math.max(1, Math.min(4, pinch.s * Math.hypot(a[0] - b[0], a[1] - b[1]) / pinch.d));
        const px = pinch.cx - r.left, py = pinch.cy - r.top;       // keep the point between the fingers in place
        if (!this._compact) this._freeSet(s, px - (px - pinch.x) * (s / pinch.s), py - (py - pinch.y) * (s / pinch.s));
        // 2.5D, touch: twist two fingers to turn, move them up or down together to tilt
        if (this._proj) {
          let da = (Math.atan2(b[1] - a[1], b[0] - a[0]) - pinch.ang) * 180 / Math.PI;
          da = ((da + 540) % 360) - 180;
          const dy = (a[1] + b[1]) / 2 - pinch.cy;
          this._turnTo(pinch.rot + da, pinch.tilt - dy * 0.3);
        }
        this._freeDragged = Date.now();
      } else if (pan) {
        const dx = ev.clientX - pan.x0, dy = ev.clientY - pan.y0;
        if (!pan.moved && Math.hypot(dx, dy) < 8) return;
        pan.moved = true;
        this._freeSet(pan.s, pan.x + dx, pan.y + dy);
        this._freeDragged = Date.now();
      }
    }, { capture: true });
    const up = (ev) => { pts.delete(ev.pointerId); if (pts.size < 2) { if (pinch) this._turnDone(); pinch = null; } if (!pts.size) pan = null; };
    vp.addEventListener('pointerup', up, { capture: true });
    vp.addEventListener('pointercancel', up, { capture: true });
    vp.addEventListener('wheel', (ev) => {
      if (allowed() && !(ev.ctrlKey || ev.metaKey) && Math.abs(ev.deltaY) > 0) {
        // plain scrolling keeps scrolling the page; a short hint shows how to zoom (like on a map)
        let hint = vp.querySelector('.zoomhint');
        if (!hint) { hint = document.createElement('div'); hint.className = 'zoomhint'; vp.appendChild(hint); }
        hint.textContent = t(this._hass, /Mac/i.test(navigator.platform) ? 'zoom_hint_mac' : 'zoom_hint');
        hint.classList.add('on'); clearTimeout(this._hintT); this._hintT = setTimeout(() => hint.classList.remove('on'), 1400);
      }
      if (!allowed() || !(ev.ctrlKey || ev.metaKey)) return;
      ev.preventDefault();
      const r = vp.getBoundingClientRect(), f = this._free;
      const s = Math.max(1, Math.min(4, f.s * Math.exp(-ev.deltaY * 0.0011)));
      const px = ev.clientX - r.left, py = ev.clientY - r.top;
      this._freeSet(s, px - (px - f.x) * (s / f.s), py - (py - f.y) * (s / f.s));
    }, { passive: false });
    this._freeSet(this._free.s, this._free.x, this._free.y);
  }
  _freeSet(s, x, y) {
    const vp = this.shadowRoot.querySelector('.viewport');
    if (!vp || !this._stage) return;
    const w = vp.clientWidth, h = vp.clientHeight;
    s = Math.max(1, Math.min(4, s));
    x = Math.min(0, Math.max(w - w * s, x)); y = Math.min(0, Math.max(h - h * s, y));
    this._free = { s, x, y };
    vp.classList.toggle('freezoom', s > 1.01);
    if (this._zoomRoom || this._compact) return;
    this._stage.style.transition = 'none';
    this._stage.style.transform = s > 1.01 ? `translate(${x}px, ${y}px) scale(${s})` : '';
    this._stage.style.setProperty('--k', s > 1.01 ? Math.min(1, 1.6 / s).toFixed(3) : 1);
  }

  /* ---------------------------------------------------------- quick controls (hold) */
  /**
   * Hold an icon: a small window right next to it with the controls you use most – on/off, brightness,
   * colour temperature, position, volume or target temperature – and "More…" for Home Assistant's own dialog.
   */
  _quick(entityId, anchor) {
    const h = this._hass, st = h.states[entityId];
    if (!st || this._s.hold_action === 'more-info') { fire(this, 'hass-more-info', { entityId }); return; }
    this._closeQuick();
    const main = this.shadowRoot.querySelector('.main') || this.shadowRoot.querySelector('ha-card');
    const q = document.createElement('div');
    q.className = 'quick';
    q.dataset.id = entityId;
    main.appendChild(q);
    this._qk = q;
    this._renderQuick(true);
    // next to the icon, inside the card
    const mr = main.getBoundingClientRect(), ar = anchor.getBoundingClientRect(), qr = q.getBoundingClientRect();
    let x = ar.left - mr.left + ar.width / 2 - qr.width / 2, y = ar.bottom - mr.top + 8;
    if (y + qr.height > main.clientHeight - 6) y = ar.top - mr.top - qr.height - 8;
    q.style.left = `${Math.max(6, Math.min(main.clientWidth - qr.width - 6, x))}px`;
    q.style.top = `${Math.max(6, y)}px`;
    const away = (ev) => { if (!ev.composedPath().includes(q)) this._closeQuick(); };
    setTimeout(() => this.shadowRoot.addEventListener('pointerdown', away, true), 0);
    this._qkAway = away;
    if (navigator.vibrate) try { navigator.vibrate(12); } catch (e) { /* ignore */ }
  }
  _closeQuick() {
    if (this._qkAway) this.shadowRoot.removeEventListener('pointerdown', this._qkAway, true);
    this._qk?.remove(); this._qk = null; this._qkAway = null;
  }
  /** (Re)draw the quick window; skipped while a slider is being dragged. */
  _renderQuick(force = false) {
    const q = this._qk, h = this._hass;
    if (!q || (!force && q.dataset.busy)) return;
    const id = q.dataset.id, st = h.states[id];
    if (!st) { this._closeQuick(); return; }
    const key = JSON.stringify([st.state, st.attributes]);
    if (!force && q.dataset.key === key) return;
    q.dataset.key = key;
    const d = id.split('.')[0], a = st.attributes, on = isOn(st), nl = (h.locale?.language || 'en').startsWith('nl');
    const W = (n, e) => (nl ? n : e);
    const modes = a.supported_color_modes || [];
    const rows = [];
    const slider = (key2, label, min, max, step, value, unit) => rows.push(`<label class="qs"><span>${label}<b data-v="${key2}">${value}${unit}</b></span>
      <input type="range" min="${min}" max="${max}" step="${step}" value="${value}" data-k="${key2}" data-unit="${unit}"></label>`);
    if (d === 'light' && on && modes.some((m) => m !== 'onoff')) slider('bri', W('Helderheid', 'Brightness'), 1, 100, 1, Math.max(1, Math.round((a.brightness || 255) / 2.55)), '%');
    if (d === 'light' && on && modes.includes('color_temp') && a.min_color_temp_kelvin) {
      slider('ct', W('Kleur', 'Colour'), a.min_color_temp_kelvin, a.max_color_temp_kelvin, 50, a.color_temp_kelvin || Math.round((a.min_color_temp_kelvin + a.max_color_temp_kelvin) / 2), 'K');
    }
    if (d === 'cover' && a.current_position != null) slider('pos', W('Positie', 'Position'), 0, 100, 1, a.current_position, '%');
    if (d === 'fan' && on && a.percentage != null) slider('fan', W('Snelheid', 'Speed'), 0, 100, a.percentage_step || 1, a.percentage, '%');
    if (d === 'media_player' && a.volume_level != null) slider('vol', W('Volume', 'Volume'), 0, 100, 1, Math.round(a.volume_level * 100), '%');
    let temp = '';
    if (d === 'climate' && a.temperature != null) {
      temp = `<div class="qt"><button data-t="-">−</button><b>${num(a.temperature)}°</b><button data-t="+">+</button></div>`;
    }
    const canToggle = ['light', 'switch', 'fan', 'input_boolean', 'humidifier', 'siren', 'cover', 'valve', 'media_player', 'climate'].includes(d);
    const toggleLabel = d === 'cover' ? (st.state === 'closed' ? W('Openen', 'Open') : W('Sluiten', 'Close')) : on ? W('Uitzetten', 'Turn off') : W('Aanzetten', 'Turn on');
    q.innerHTML = `<div class="qh"><ha-state-icon></ha-state-icon><div><b>${esc(friendly(h, id))}</b><small>${esc(shortState(h, st))}</small></div></div>
      ${temp}${rows.join('')}
      <div class="qb">${canToggle ? `<button class="qon ${on ? 'on' : ''}" data-a="toggle">${toggleLabel}</button>` : ''}<button data-a="more">${W('Meer…', 'More…')}</button></div>`;
    const ic = q.querySelector('ha-state-icon'); ic.hass = h; ic.stateObj = st;
    q.querySelectorAll('input[type=range]').forEach((inp) => {
      inp.addEventListener('pointerdown', () => { q.dataset.busy = '1'; });
      inp.addEventListener('input', () => { q.querySelector(`[data-v="${inp.dataset.k}"]`).textContent = inp.value + inp.dataset.unit; });
      inp.addEventListener('change', () => {
        const v = +inp.value, k = inp.dataset.k;
        delete q.dataset.busy;
        if (k === 'bri') h.callService('light', 'turn_on', { entity_id: id, brightness_pct: v });
        else if (k === 'ct') h.callService('light', 'turn_on', { entity_id: id, color_temp_kelvin: v });
        else if (k === 'pos') h.callService('cover', 'set_cover_position', { entity_id: id, position: v });
        else if (k === 'fan') h.callService('fan', 'set_percentage', { entity_id: id, percentage: v });
        else if (k === 'vol') h.callService('media_player', 'volume_set', { entity_id: id, volume_level: v / 100 });
      });
    });
    q.querySelectorAll('[data-t]').forEach((b) => b.addEventListener('click', () => {
      const step = a.target_temp_step || (a.temperature % 1 ? 0.5 : 0.5);
      h.callService('climate', 'set_temperature', { entity_id: id, temperature: +(a.temperature + (b.dataset.t === '+' ? step : -step)).toFixed(1) });
    }));
    q.querySelector('[data-a="toggle"]')?.addEventListener('click', () => {
      if (d === 'climate') h.callService('climate', on ? 'turn_off' : 'turn_on', { entity_id: id });
      else this._tap(id);
    });
    q.querySelector('[data-a="more"]').addEventListener('click', () => { this._closeQuick(); fire(this, 'hass-more-info', { entityId: id }); });
    function num(v) { return (Math.round(v * 10) / 10).toLocaleString(nl ? 'nl-NL' : 'en-US'); }
  }

  _tap(entityId) {
    const h = this._hass, st = h.states[entityId], d = entityId.split('.')[0];
    const via = this._items?.get(entityId)?.it.via;
    if (via && h.states[via]) {
      // lamp on a smart switch: the switch gives and cuts the power
      const powered = h.states[via].state === 'on' && st && !['unavailable', 'unknown'].includes(st.state);
      h.callService('homeassistant', powered && isOn(st) ? 'turn_off' : 'turn_on', { entity_id: powered && !isOn(st) ? entityId : via });
      if (navigator.vibrate) try { navigator.vibrate(10); } catch (e) { /* ignore */ }
      return;
    }
    if (!st) return;
    if (['light', 'switch', 'fan', 'input_boolean', 'humidifier', 'siren'].includes(d)) h.callService(d, 'toggle', { entity_id: entityId });
    else if (d === 'cover' || d === 'valve') h.callService(d, 'toggle', { entity_id: entityId });
    else if (d === 'media_player' && st.attributes.supported_features & 128) h.callService(d, 'toggle', { entity_id: entityId });
    else if (d === 'scene' || d === 'script') h.callService(d, 'turn_on', { entity_id: entityId });
    else if (d === 'button') h.callService(d, 'press', { entity_id: entityId });
    else if (d === 'camera') this._showCamera(entityId);
    else fire(this, 'hass-more-info', { entityId });
    if (navigator.vibrate) try { navigator.vibrate(10); } catch (e) { /* ignore */ }
  }

  /** Live camera view over the floorplan; tap anywhere on it to close. */
  _showCamera(entityId) {
    const h = this._hass, st = h.states[entityId];
    this.shadowRoot.querySelector('.camview')?.remove();
    const v = document.createElement('div');
    v.className = 'camview';
    v.innerHTML = '<div class="frame"></div>';
    const frame = v.firstChild;
    // a snapshot right away, with the live MJPEG stream on top (works for every camera integration)
    const tok = st.attributes.access_token;
    const snap = document.createElement('img');
    snap.src = `/api/camera_proxy/${entityId}?token=${tok}&t=${Date.now()}`;
    snap.style.minHeight = '30%';
    const live = document.createElement('img');
    live.src = `/api/camera_proxy_stream/${entityId}?token=${tok}`;
    live.style.cssText = 'position:absolute;inset:0;';
    frame.append(snap, live);
    frame.insertAdjacentHTML('beforeend', `<div class="cap">${esc(friendly(h, entityId))}</div><ha-icon class="x" icon="mdi:close"></ha-icon>`);
    v.addEventListener('click', (ev) => { ev.stopPropagation(); live.src = ''; snap.src = ''; v.remove(); });
    this.shadowRoot.querySelector('.viewport').appendChild(v);
  }

  _startDrag(ev, el, it) {
    const rect = this._stage.getBoundingClientRect();
    const plan = this._plan, grid = 5, p = this._proj, hz = p ? (el._hm || 0) * p.sc * p.lift : 0;
    this._dragging = true;
    el.setPointerCapture(ev.pointerId);
    const move = (e) => {
      let x = ((e.clientX - rect.left) / rect.width) * plan.width, y = ((e.clientY - rect.top) / rect.height) * plan.height;
      if (p) [x, y] = p.inv(x, y - p.dz(hz));   // 2.5D: back from the screen to the spot on the floor
      x = Math.max(0, Math.min(plan.width, x)); y = Math.max(0, Math.min(plan.height, y));
      it.x = Math.round(x / grid) * grid; it.y = Math.round(y / grid) * grid;
      [el.style.left, el.style.top] = this._at(it.x, it.y, p ? el._hm || 0 : 0);
    };
    const up = async () => {
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up);
      try { await savePlan(this._hass, this._plan); } finally { this._dragging = false; }
      if (p) this._build();   // the line to the floor and the height above furniture follow
    };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
  }
}

/* ---------------------------------------------------------- visual editor */
/* ------------------------------------------------------------ kiosk menu */
/*
 * Full screen that survives switching tabs: the whole page goes full screen (not just the card),
 * HA's header and sidebar are hidden (like kiosk-mode does), and the menu bar appears.
 * Tabs are switched inside the app, so the browser stays in full screen.
 */
/** Where the robot is drawn on a vacuum map image: the centre of its white body (null if not found). */
function findRobot(src) {
  try {
    const w = src.width || src.naturalWidth, h = src.height || src.naturalHeight, k = Math.min(1, 700 / Math.max(w, h));
    const c = document.createElement('canvas');
    c.width = Math.max(1, Math.round(w * k)); c.height = Math.max(1, Math.round(h * k));
    const g = c.getContext('2d', { willReadFrequently: true });
    g.drawImage(src, 0, 0, c.width, c.height);
    const d = g.getImageData(0, 0, c.width, c.height).data;
    // the robot is a filled white disc; a path may be white too but is thin: take the densest white spot
    const cell = 6, gw = Math.ceil(c.width / cell), grid = new Uint16Array(gw * Math.ceil(c.height / cell));
    const white = (i) => d[i + 3] > 200 && d[i] > 235 && d[i + 1] > 235 && d[i + 2] > 235;
    let total = 0;
    for (let i = 0; i < d.length; i += 4) if (white(i)) { const p = i / 4; grid[Math.floor(Math.floor(p / c.width) / cell) * gw + Math.floor((p % c.width) / cell)]++; total++; }
    if (total < 6 || total > c.width * c.height * 0.05) return null;    // nothing, or a white map background: no robot to find
    let best = 0, bi = 0;
    for (let i = 0; i < grid.length; i++) {
      const gx = i % gw, gy = Math.floor(i / gw);
      let sum = 0;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const x = gx + dx, y = gy + dy; if (x >= 0 && x < gw && y >= 0) sum += grid[y * gw + x] || 0; }
      if (sum > best) { best = sum; bi = i; }
    }
    const cx = (bi % gw) * cell + cell / 2, cy = Math.floor(bi / gw) * cell + cell / 2, r = cell * 2.5;
    let sx = 0, sy = 0, n = 0;
    for (let y = Math.max(0, Math.floor(cy - r)); y < Math.min(c.height, cy + r); y++) {
      for (let x = Math.max(0, Math.floor(cx - r)); x < Math.min(c.width, cx + r); x++) { if (white((y * c.width + x) * 4)) { sx += x; sy += y; n++; } }
    }
    return n ? [sx / n / k, sy / n / k] : null;
  } catch (e) { return null; }
}

const FS_KEY = 'fps-fullscreen';
const isFull = () => !!document.fullscreenElement && (() => { try { return sessionStorage.getItem(FS_KEY) === '1'; } catch (e) { return true; } })();
const CHROME_CSS = {
  main: 'ha-sidebar { display: none !important; } ha-drawer { --mdc-drawer-width: 0px !important; }',
  drawer: '.sidebar-shell, .mdc-drawer { display: none !important; } .app-content, .mdc-drawer-app-content { padding-left: 0 !important; padding-inline-start: 0 !important; margin-left: 0 !important; margin-inline-start: 0 !important; }',
  root: '.header { display: none !important; } :host { --header-height: 0px !important; } #view, hui-view-container { padding-top: 0 !important; margin-top: 0 !important; min-height: 100vh !important; }',
};
function haChrome(hide) {
  const put = (root, css) => {
    if (!root) return;
    let st = root.querySelector('#fps-full');
    if (!hide) { st?.remove(); return; }
    if (!st) { st = document.createElement('style'); st.id = 'fps-full'; root.appendChild(st); }
    st.textContent = css;
  };
  try {
    const ms = document.querySelector('home-assistant')?.shadowRoot?.querySelector('home-assistant-main')?.shadowRoot;
    put(ms, CHROME_CSS.main);
    put(ms?.querySelector('ha-drawer')?.shadowRoot, CHROME_CSS.drawer);
    put(ms?.querySelector('partial-panel-resolver ha-panel-lovelace, ha-panel-lovelace')?.shadowRoot?.querySelector('hui-root')?.shadowRoot, CHROME_CSS.root);
  } catch (e) { /* HA changed its layout: full screen still works, the bars just stay */ }
}
function toggleFull() {
  if (document.fullscreenElement) { document.exitFullscreen?.(); return; }
  try { sessionStorage.setItem(FS_KEY, '1'); } catch (e) { /* private mode */ }
  document.documentElement.requestFullscreen?.().catch(() => {});
}
if (!window.__fpsFullHook) {
  window.__fpsFullHook = true;
  const sync = () => {
    const on = isFull();
    if (!document.fullscreenElement) { try { sessionStorage.removeItem(FS_KEY); } catch (e) { /* ignore */ } }
    haChrome(on);
    window.dispatchEvent(new CustomEvent('fps-fullscreen', { detail: { on } }));
  };
  document.addEventListener('fullscreenchange', sync);
  // another tab or dashboard has its own header: hide that one too
  window.addEventListener('location-changed', () => { if (isFull()) [50, 400, 1200].forEach((ms) => setTimeout(() => haChrome(true), ms)); });
}

const isKiosk = () => /[?&]kiosk(=|&|$)/.test(location.search) || isFull();
/** Go to another tab of the same dashboard and stay in kiosk (full reload, so kiosk-mode applies). */
function kioskGo(path) {
  // inside the app (no reload), so full screen and kiosk-mode stay on
  navigate(location.pathname.replace(/[^/]*$/, path) + (/[?&]kiosk(=|&|$)/.test(location.search) ? location.search : ''));
}
function navHTML(nav = []) {
  const here = location.pathname.split('/').pop();
  return `<div class="navbar">${nav.map((n) => `<button class="btn ${n.path === here ? 'active' : ''}" data-nav="${esc(n.path)}"><ha-icon icon="${esc(n.icon || 'mdi:circle-small')}"></ha-icon>${esc(n.title)}</button>`).join('')}</div>`;
}

/**
 * Menu bar for the other tabs while in kiosk mode (?kiosk in the address).
 * Outside kiosk mode it takes no space, because the normal tabs are visible then.
 */
class FloorplanStudioNav extends HTMLElement {
  constructor() { super(); this.attachShadow({ mode: 'open' }); this._onFull = () => this._render(); }
  connectedCallback() { window.addEventListener('fps-fullscreen', this._onFull); window.addEventListener('location-changed', this._onFull); this._render(); }
  disconnectedCallback() { window.removeEventListener('fps-fullscreen', this._onFull); window.removeEventListener('location-changed', this._onFull); }
  setConfig(c) { this._config = c; this._render(); }
  set hass(h) { if (!this._hass) { this._hass = h; this._render(); } }
  getCardSize() { return isKiosk() ? 1 : 0; }
  _render() {
    if (!this._config) return;
    if (!isKiosk()) { this.shadowRoot.innerHTML = ''; this.style.display = 'none'; return; }
    this.style.display = 'block';
    const style = themeStyle(this._config.theme || 'warm', this._hass);
    this.shadowRoot.innerHTML = `<style>
      .navbar { display: flex; justify-content: center; gap: 8px; padding: 6px 0; flex-wrap: wrap; font-family: var(--fps-font); }
      .btn { all: unset; cursor: pointer; padding: 6px 14px; border-radius: 999px; font-size: 13px; font-weight: 600; display: inline-flex; align-items: center; gap: 6px;
             border: 1px solid var(--fps-line); background: var(--fps-chip); color: var(--fps-fg); --mdc-icon-size: 16px; }
      .btn.active { border-color: var(--fps-accent); color: var(--fps-accent); }
    </style><div style="${style}">${navHTML(this._config.nav)}</div>`;
    this.shadowRoot.querySelectorAll('[data-nav]').forEach((b) => b.addEventListener('click', () => kioskGo(b.dataset.nav)));
  }
}

class FloorplanStudioCardEditor extends HTMLElement {
  setConfig(config) { this._config = { ...config }; this._render(); }
  set hass(hass) {
    const first = !this._hass; this._hass = hass;
    if (first) loadPlans(hass).then((p) => { this._plans = p; this._render(); }).catch(() => {});
  }
  _render() {
    if (!this._config) return;
    const c = this._config, plans = this._plans || [];
    const nl = (this._hass?.locale?.language || 'en').startsWith('nl');
    const L = nl
      ? { plan: 'Plattegrond', theme: 'Thema', mode: 'Standaard weergave', simple: 'Eenvoudig (laatst gebruikt)', all: 'Alles', none_mode: 'Geen (geen iconen, rustige kaart)', toolbar: 'Knoppenbalk tonen', themetoggle: 'Thema-knoppen tonen', title: 'Titel (leeg = naam plattegrond)', open: 'Plattegronden tekenen en bewerken doe je via Floorplan in de zijbalk.' }
      : { plan: 'Floorplan', theme: 'Theme', mode: 'Default view', simple: 'Simple (recently used)', all: 'All', none_mode: 'None (no icons, a calm map)', toolbar: 'Show toolbar', themetoggle: 'Show theme buttons', title: 'Title (empty = plan name)', open: 'Draw and edit floorplans via Floorplan in the sidebar.' };
    this.innerHTML = `<style>.r{display:flex;flex-direction:column;gap:4px;margin-bottom:12px}label{font-size:13px;color:var(--secondary-text-color)}select,input[type=text]{padding:8px;border-radius:6px;border:1px solid var(--divider-color);background:var(--card-background-color);color:var(--primary-text-color)}.c{flex-direction:row;align-items:center;gap:8px}p{font-size:12px;color:var(--secondary-text-color)}</style>
      <div class="r"><label>${L.plan}</label><select data-k="plan">${plans.map((p) => `<option value="${p.id}" ${c.plan === p.id ? 'selected' : ''}>${esc(p.name)}</option>`).join('')}</select></div>
      <div class="r"><label>${L.title}</label><input type="text" data-k="title" value="${esc(c.title || '')}"></div>
      <div class="r"><label>${L.theme}</label><select data-k="theme">${Object.entries(THEMES).map(([k, v]) => `<option value="${k}" ${c.theme === k ? 'selected' : ''}>${v.label}</option>`).join('')}</select></div>
      <div class="r"><label>${L.mode}</label><select data-k="mode"><option value="all" ${!['simple', 'none'].includes(c.mode) ? 'selected' : ''}>${L.all}</option><option value="simple" ${c.mode === 'simple' ? 'selected' : ''}>${L.simple}</option><option value="none" ${c.mode === 'none' ? 'selected' : ''}>${L.none_mode}</option></select></div>
      <div class="r c"><input type="checkbox" data-k="show_toolbar" ${c.show_toolbar !== false ? 'checked' : ''}><label>${L.toolbar}</label></div>
      <div class="r c"><input type="checkbox" data-k="show_theme_toggle" ${c.show_theme_toggle ? 'checked' : ''}><label>${L.themetoggle}</label></div>
      <p>${L.open}</p>`;
    this.querySelectorAll('[data-k]').forEach((el) => el.addEventListener('change', () => {
      const v = el.type === 'checkbox' ? el.checked : el.value;
      this._config = { ...this._config, [el.dataset.k]: v };
      if (v === '' ) delete this._config[el.dataset.k];
      fire(this, 'config-changed', { config: this._config });
    }));
  }
}

// the real card; dashboards use custom:floorplan-studio-card, which the small starter (fps-loader.js) fills with this
if (!customElements.get('floorplan-studio-card-impl')) {
  customElements.define('floorplan-studio-card-impl', FloorplanStudioCard);
  customElements.define('floorplan-studio-card-editor', FloorplanStudioCardEditor);
  customElements.define('floorplan-studio-nav-impl', FloorplanStudioNav);
  console.info(`%c FLOORPLAN-STUDIO %c ${VERSION} `, 'background:#f2a541;color:#111;font-weight:700', 'background:#151b24;color:#eee');
}
