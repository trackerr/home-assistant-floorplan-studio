// Floorplan Studio – builds a complete dashboard around a floorplan:
// Home · Floorplan · Kiosk · Energy · Outside · TV, plus a page per room (tabs are only added when there is something to show).
// Uses only built-in cards, and nicer HACS cards (advanced-camera-card, clock-weather-card) when they are installed.
import { entityArea, roomPath } from './fps-core.js?v=1.4.0b71';

const OUTSIDE = /buiten|tuin|outside|outdoor|garden|yard|oprit|driveway|terras|patio|balkon|balcony|garage|voortuin|achtertuin|poort|gate|dak|roof|straat|street/i;

export async function buildDashboard(hass, plan, nl, { home = true } = {}) {
  const T = nl
    ? { home: 'Thuis', rooms: 'Ruimtes', plan: 'Plattegrond', kiosk: 'Kiosk', energy: 'Energie', outside: 'Buiten', tv: 'TV', now: 'Nu', today: 'Vandaag', cams: "Camera's", weather: 'Weer', sensors: 'Sensoren', media: 'Media' }
    : { home: 'Home', rooms: 'Rooms', plan: 'Floorplan', kiosk: 'Kiosk', energy: 'Energy', outside: 'Outside', tv: 'TV', now: 'Now', today: 'Today', cams: 'Cameras', weather: 'Weather', sensors: 'Sensors', media: 'Media' };
  const st = hass.states, ids = Object.keys(st);
  const areaName = (id) => hass.areas?.[entityArea(hass, id)]?.name || '';
  const visible = (id) => { const e = hass.entities?.[id]; return !e || (!e.hidden && !e.entity_category); };
  const ok = (id) => st[id] && !['unavailable', 'unknown'].includes(st[id].state);
  const has = (tag) => !!customElements.get(tag);
  const card = { type: 'custom:floorplan-studio-card', plan: plan.id, show_theme_toggle: true, room_pages: true, floorplan_studio_managed_plan: plan.id };

  const views = [];
  // Home: a calm start page in the plan's theme (greeting, smart button, a tile per room, energy)
  if (home && plan.rooms.length) views.push({ title: T.home, path: 'thuis', icon: 'mdi:home', type: 'panel', cards: [{ ...card, home: true }] });
  views.push(
    { title: T.plan, path: 'plan', icon: 'mdi:floor-plan', type: 'panel', cards: [{ ...card, side: true }] },
    { title: T.kiosk, path: 'kiosk', icon: 'mdi:fullscreen', type: 'panel', cards: [{ ...card, kiosk: true, side: true }] },
  );

  // ---- Energy: the built-in energy cards when the Energy dashboard is set up, otherwise power sensors
  let prefs = null;
  try { prefs = await hass.connection.sendMessagePromise({ type: 'energy/get_prefs' }); } catch (e) { /* not configured */ }
  const sources = prefs?.energy_sources || [];
  if (sources.length) {
    const solar = sources.some((s) => s.type === 'solar');
    views.push({ title: T.energy, path: 'energie', icon: 'mdi:lightning-bolt', type: 'sections', max_columns: 3, sections: [
      { type: 'grid', cards: [{ type: 'heading', heading: T.now }, { type: 'energy-date-selection' }, { type: 'energy-distribution', link_dashboard: true }] },
      { type: 'grid', cards: [{ type: 'heading', heading: T.today }, { type: 'energy-usage-graph' }, ...(solar ? [{ type: 'energy-solar-graph' }] : [])] },
      { type: 'grid', cards: [{ type: 'energy-sources-table' }] },
    ] });
  } else {
    const power = ids.filter((id) => id.startsWith('sensor.') && visible(id) && ok(id) && ['power', 'energy'].includes(st[id].attributes.device_class)).slice(0, 12);
    if (power.length) views.push({ title: T.energy, path: 'energie', icon: 'mdi:lightning-bolt', type: 'sections', max_columns: 3, sections: [
      { type: 'grid', cards: [{ type: 'heading', heading: T.now }, ...power.map((id) => ({ type: 'tile', entity: id, grid_options: { columns: 6 } }))] },
      { type: 'grid', cards: [{ type: 'statistics-graph', entities: power.filter((id) => st[id].attributes.device_class === 'power').slice(0, 4), chart_type: 'line', days_to_show: 1, stat_types: ['mean'] }] },
    ] });
  }

  // ---- Outside: weather, outdoor cameras, outdoor sensors
  const weather = ids.find((id) => id.startsWith('weather.') && ok(id));
  const cams = ids.filter((id) => id.startsWith('camera.') && visible(id) && ok(id) && (OUTSIDE.test(areaName(id)) || OUTSIDE.test(st[id].attributes.friendly_name || id))).slice(0, 6);
  const outSensors = ids.filter((id) => id.startsWith('sensor.') && visible(id) && ok(id) && OUTSIDE.test(areaName(id)) &&
    ['temperature', 'humidity', 'illuminance', 'wind_speed', 'precipitation', 'pressure'].includes(st[id].attributes.device_class)).slice(0, 8);
  if (weather || cams.length || outSensors.length) {
    const sections = [];
    if (weather || outSensors.length) sections.push({ type: 'grid', cards: [{ type: 'heading', heading: T.weather },
      ...(weather ? [{ type: 'weather-forecast', entity: weather, forecast_type: 'daily' }] : []),
      ...outSensors.map((id) => ({ type: 'tile', entity: id, grid_options: { columns: 6 } }))] });
    if (cams.length) sections.push({ type: 'grid', column_span: 2, cards: [{ type: 'heading', heading: T.cams },
      ...(has('advanced-camera-card')
        ? [{ type: 'custom:advanced-camera-card', cameras: cams.map((id) => ({ camera_entity: id })), grid_options: { columns: 12 } }]
        : cams.map((id) => ({ type: 'picture-entity', entity: id, camera_view: 'auto', show_state: false, grid_options: { columns: 6 } })))] });
    views.push({ title: T.outside, path: 'buiten', icon: 'mdi:pine-tree', type: 'sections', max_columns: 3, sections });
  }

  // ---- TV / media
  const media = ids.filter((id) => id.startsWith('media_player.') && visible(id) && ok(id)).slice(0, 8);
  if (media.length) views.push({ title: T.tv, path: 'tv', icon: 'mdi:television', type: 'sections', max_columns: 3, sections: [
    ...(weather && has('clock-weather-card') ? [{ type: 'grid', cards: [{ type: 'custom:clock-weather-card', entity: weather }] }] : []),
    { type: 'grid', column_span: 3, cards: [{ type: 'heading', heading: T.media }, ...media.map((id) => ({ type: 'media-control', entity: id, grid_options: { columns: 6 } }))] },
  ] });

  // ---- kiosk: a menu bar to the other tabs (only visible with ?kiosk in the address)
  const nav = views.filter((v) => v.path !== 'kiosk').map((v) => ({ title: v.title, path: v.path, icon: v.icon }));
  for (const v of views) {
    if (v.type === 'panel') v.cards = v.cards.map((c) => ({ ...c, nav }));
    else v.header = { card: { type: 'custom:floorplan-studio-nav', nav, theme: plan.settings?.theme || 'warm' } };
  }

  // ---- a page per room (sub-view: not a tab, but you can link to it and it has a back arrow)
  for (const r of plan.rooms) {
    views.push({ title: r.name || T.plan, path: roomPath(r), subview: true, back_path: home && plan.rooms.length ? 'thuis' : 'plan', type: 'panel',
      cards: [{ ...card, show_theme_toggle: false, room: r.id }] });
  }

  return { title: plan.name || T.plan, views };
}
