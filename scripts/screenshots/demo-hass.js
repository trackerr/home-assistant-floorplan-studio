// A fake Home Assistant for screenshots and demos: the fictional "Voorbeeldhuis".
// None of this is real data. Used by demo.html (see README in this folder).

const S = (entity_id, state, attributes = {}) => ({ entity_id, state, attributes, last_changed: new Date().toISOString(), last_updated: new Date().toISOString(), context: {} });

const AREAS = {
  woonkamer: 'Woonkamer', keuken: 'Keuken', berging: 'Berging', hal: 'Hal', toilet: 'Toilet',
  badkamer: 'Badkamer', slaapkamer: 'Slaapkamer', werkkamer: 'Werkkamer', kinderkamer: 'Kinderkamer',
};

// [entity_id, state, attributes, area]
const DEF = [
  ['light.woonkamer_plafond', 'on', { friendly_name: 'Plafondlamp woonkamer', color_temp_kelvin: 2700, brightness: 200, supported_color_modes: ['color_temp'], min_color_temp_kelvin: 2200, max_color_temp_kelvin: 6500 }, 'woonkamer'],
  ['light.staande_lamp', 'on', { friendly_name: 'Staande lamp', rgb_color: [255, 140, 60], brightness: 90 }, 'woonkamer'],
  ['light.leeslamp', 'off', { friendly_name: 'Leeslamp' }, 'woonkamer'],
  ['media_player.keuken_speaker', 'playing', { friendly_name: 'Speaker keuken', supported_features: 152463, media_title: 'Radio 2', volume_level: 0.3, device_class: 'speaker' }, 'keuken'],
  ['media_player.woonkamer_tv', 'playing', { friendly_name: 'Televisie', supported_features: 152463, media_title: 'Journaal', device_class: 'tv' }, 'woonkamer'],
  ['climate.woonkamer', 'heat', { friendly_name: 'Thermostaat', current_temperature: 21.3, temperature: 21, hvac_modes: ['off', 'heat'] }, 'woonkamer'],
  ['cover.woonkamer_gordijn', 'open', { friendly_name: 'Gordijn', current_position: 100, device_class: 'curtain' }, 'woonkamer'],
  ['sensor.woonkamer_temperatuur', '21.3', { friendly_name: 'Temperatuur woonkamer', device_class: 'temperature', unit_of_measurement: '°C' }, 'woonkamer'],
  ['sensor.woonkamer_vochtigheid', '48', { friendly_name: 'Vochtigheid woonkamer', device_class: 'humidity', unit_of_measurement: '%' }, 'woonkamer'],

  ['light.keuken_spots', 'on', { friendly_name: 'Spots keuken', color_temp_kelvin: 4000 }, 'keuken'],
  ['switch.koffiezetapparaat', 'off', { friendly_name: 'Koffiezetapparaat', icon: 'mdi:coffee-maker' }, 'keuken'],
  ['sensor.keuken_temperatuur', '20.1', { friendly_name: 'Temperatuur keuken', device_class: 'temperature', unit_of_measurement: '°C' }, 'keuken'],
  ['sensor.keuken_vochtigheid', '55', { friendly_name: 'Vochtigheid keuken', device_class: 'humidity', unit_of_measurement: '%' }, 'keuken'],

  ['vacuum.robotstofzuiger', 'docked', { friendly_name: 'Robotstofzuiger', battery_level: 100 }, 'berging'],
  ['switch.wasmachine', 'on', { friendly_name: 'Wasmachine', icon: 'mdi:washing-machine' }, 'berging'],
  ['image.robotstofzuiger_kaart', '2026-10-23T10:00:00', { friendly_name: 'Robotstofzuiger kaart', entity_picture: '/scripts/screenshots/vacuum-map.svg' }, 'berging'],

  ['light.hal', 'off', { friendly_name: 'Lamp hal' }, 'hal'],
  ['lock.voordeur', 'locked', { friendly_name: 'Voordeur' }, 'hal'],
  ['camera.voordeur', 'streaming', { friendly_name: 'Camera voordeur', access_token: 'demo', entity_picture: '/api/camera_proxy/camera.voordeur?token=demo' }, 'hal'],

  ['light.toilet', 'off', { friendly_name: 'Lamp toilet' }, 'toilet'],
  ['light.badkamer', 'off', { friendly_name: 'Lamp badkamer' }, 'badkamer'],
  ['fan.badkamer_ventilator', 'on', { friendly_name: 'Ventilator' }, 'badkamer'],
  ['sensor.badkamer_temperatuur', '22.4', { friendly_name: 'Temperatuur badkamer', device_class: 'temperature', unit_of_measurement: '°C' }, 'badkamer'],
  ['sensor.badkamer_vochtigheid', '71', { friendly_name: 'Vochtigheid badkamer', device_class: 'humidity', unit_of_measurement: '%' }, 'badkamer'],

  ['light.slaapkamer', 'off', { friendly_name: 'Lamp slaapkamer' }, 'slaapkamer'],
  ['cover.slaapkamer_rolluik', 'closed', { friendly_name: 'Rolluik', current_position: 0, device_class: 'shutter' }, 'slaapkamer'],
  ['sensor.slaapkamer_temperatuur', '18.6', { friendly_name: 'Temperatuur slaapkamer', device_class: 'temperature', unit_of_measurement: '°C' }, 'slaapkamer'],
  ['sensor.slaapkamer_vochtigheid', '52', { friendly_name: 'Vochtigheid slaapkamer', device_class: 'humidity', unit_of_measurement: '%' }, 'slaapkamer'],

  ['light.bureaulamp', 'on', { friendly_name: 'Bureaulamp', color_temp_kelvin: 4500 }, 'werkkamer'],
  ['switch.werkkamer_pc', 'on', { friendly_name: 'Computer', icon: 'mdi:desktop-tower-monitor' }, 'werkkamer'],
  ['sensor.werkkamer_temperatuur', '20.8', { friendly_name: 'Temperatuur werkkamer', device_class: 'temperature', unit_of_measurement: '°C' }, 'werkkamer'],

  ['light.nachtlampje', 'on', { friendly_name: 'Nachtlampje', rgb_color: [140, 90, 255] }, 'kinderkamer'],
  ['sensor.kinderkamer_temperatuur', '19.5', { friendly_name: 'Temperatuur kinderkamer', device_class: 'temperature', unit_of_measurement: '°C' }, 'kinderkamer'],
  ['sensor.kinderkamer_vochtigheid', '50', { friendly_name: 'Vochtigheid kinderkamer', device_class: 'humidity', unit_of_measurement: '%' }, 'kinderkamer'],

  ['binary_sensor.beweging_keuken', 'off', { friendly_name: 'Beweging keuken', device_class: 'motion' }, 'keuken'],
  ['binary_sensor.aanwezig_werkkamer', 'on', { friendly_name: 'Aanwezigheid werkkamer', device_class: 'presence' }, 'werkkamer'],
  ['binary_sensor.rookmelder_keuken', 'off', { friendly_name: 'Rookmelder keuken', device_class: 'smoke' }, 'keuken'],
  ['binary_sensor.lekkage_badkamer', 'off', { friendly_name: 'Lekkagesensor badkamer', device_class: 'moisture' }, 'badkamer'],
  ['binary_sensor.achterdeur', 'off', { friendly_name: 'Achterdeur', device_class: 'door' }, 'berging'],
  ['binary_sensor.radar_keuken', 'on', { friendly_name: 'Radar keuken', device_class: 'presence' }, 'keuken', { device: 'radar_k' }],
  ['sensor.radar_keuken_target_distance', '1.6', { friendly_name: 'Radar keuken afstand', unit_of_measurement: 'm', device_class: 'distance' }, 'keuken', { device: 'radar_k' }],
  ['number.radar_keuken_detection_range', '3.5', { friendly_name: 'Radar keuken bereik', unit_of_measurement: 'm' }, 'keuken', { device: 'radar_k' }],
  ['binary_sensor.radar_woonkamer', 'on', { friendly_name: 'Radar woonkamer', device_class: 'occupancy' }, 'woonkamer', { device: 'radar_w' }],
  ['sensor.radar_woonkamer_target_1_x', '-600', { unit_of_measurement: 'mm' }, 'woonkamer', { device: 'radar_w' }],
  ['sensor.radar_woonkamer_target_1_y', '1800', { unit_of_measurement: 'mm' }, 'woonkamer', { device: 'radar_w' }],
  ['sensor.radar_woonkamer_target_2_x', '900', { unit_of_measurement: 'mm' }, 'woonkamer', { device: 'radar_w' }],
  ['sensor.radar_woonkamer_target_2_y', '3000', { unit_of_measurement: 'mm' }, 'woonkamer', { device: 'radar_w' }],
  ['number.radar_woonkamer_max_distance', '4', { unit_of_measurement: 'm' }, 'woonkamer', { device: 'radar_w' }],
  ['binary_sensor.beweging_hal', 'off', { friendly_name: 'Beweging hal', device_class: 'motion' }, 'hal', { ago: 1.5 }],
  ['switch.stekker_kinderkamer', 'on', { friendly_name: 'Stekker kinderkamer' }, 'kinderkamer'],
  ['binary_sensor.raam_woonkamer', 'off', { friendly_name: 'Raam woonkamer', device_class: 'window' }, 'woonkamer'],
  ['person.anna', 'home', { friendly_name: 'Anna' }, null],
  ['person.tom', 'home', { friendly_name: 'Tom' }, null],
  ['sensor.anna_ruimte', 'Woonkamer', { friendly_name: 'Anna ruimte' }, null],
  ['sensor.tom_ruimte', 'Werkkamer', { friendly_name: 'Tom ruimte' }, null],
  ['camera.tuin', 'streaming', { friendly_name: 'Camera tuin', access_token: 'demo' }, null],
  ['sensor.buiten_temperatuur', '12.4', { friendly_name: 'Buitentemperatuur', device_class: 'temperature', unit_of_measurement: '°C' }, null],
  ['weather.thuis', 'partlycloudy', { friendly_name: 'Weer', temperature: 12.4, apparent_temperature: 10.8, wind_speed: 21, wind_speed_unit: 'km/h' }, null],
  ['sensor.woonkamer_co2', '640', { friendly_name: 'CO2 woonkamer', device_class: 'carbon_dioxide', unit_of_measurement: 'ppm' }, 'woonkamer'],
  ['scene.avond', 'scening', { friendly_name: 'Avond', icon: 'mdi:weather-sunset' }, null],
  ['scene.film', 'scening', { friendly_name: 'Film', icon: 'mdi:movie-open' }, null],
  ['script.gordijnen', 'off', { friendly_name: 'Gordijnen', icon: 'mdi:curtains' }, null],
  ['sensor.zonnepanelen_vermogen', '1840', { friendly_name: 'Zonnepanelen', device_class: 'power', unit_of_measurement: 'W' }, null],
  ['sensor.p1_verbruik', '0.62', { friendly_name: 'Verbruik net', device_class: 'power', unit_of_measurement: 'kW' }, null],
  ['sensor.p1_teruglevering', '0', { friendly_name: 'Teruglevering', device_class: 'power', unit_of_measurement: 'kW' }, null],
  ['sensor.stroomprijs', '0.21', { friendly_name: 'Stroomprijs', unit_of_measurement: '€/kWh' }, null],
  ['sensor.zonnepanelen_vandaag', '9.4', { friendly_name: 'Zon vandaag', device_class: 'energy', unit_of_measurement: 'kWh' }, null],
];

export function makeHass(plan, { sun = 'day', set = {}, extraPlans = [] } = {}) {
  const now = Date.now(), h = 3600e3;
  const sunAttr = sun === 'night'
    ? { next_rising: new Date(now + 7 * h).toISOString(), next_setting: new Date(now + 17 * h).toISOString() }
    : { next_rising: new Date(now + 18 * h).toISOString(), next_setting: new Date(now + 5 * h).toISOString() };
  const states = {}, entities = {}, areas = {};
  for (const [id, name] of Object.entries(AREAS)) areas[id] = { area_id: id, name, icon: null };
  for (const [id, state, attr, area, ex = {}] of DEF) {
    states[id] = S(id, state, attr);
    if (ex.ago) states[id].last_changed = new Date(now - ex.ago * 60e3).toISOString();
    entities[id] = { entity_id: id, area_id: area, device_id: ex.device || null, platform: 'demo', hidden: false, entity_category: null };
  }
  for (const [id, state] of Object.entries(set)) if (states[id]) states[id] = { ...states[id], state };
  states['sun.sun'] = S('sun.sun', sun === 'night' ? 'below_horizon' : 'above_horizon', { friendly_name: 'Zon', ...sunAttr });

  const plans = plan ? [plan, ...extraPlans] : [];
  const hass = {
    states, entities, areas, devices: {},
    services: { vacuum: { clean_area: {}, send_command: {}, start: {} }, light: { toggle: {} }, switch: { toggle: {} } },
    language: 'nl', locale: { language: 'nl', number_format: 'language' },
    user: { id: 'demo', name: 'Demo', is_admin: true },
    themes: { darkMode: true }, selectedTheme: null,
    formatEntityState: (st) => ({ on: 'Aan', off: 'Uit', open: 'Open', closed: 'Dicht', locked: 'Op slot', unlocked: 'Open', docked: 'Gedockt', playing: 'Speelt', heat: 'Verwarmen', streaming: 'Live' }[st.state] || st.state),
    callService: async (domain, service, data) => {
      window.demoCalls = [...(window.demoCalls || []), { domain, service, data }];
      const id = data.entity_id, st = hass.states[id];
      if (domain === 'vacuum') { hass.states = { ...hass.states, [id]: { ...st, state: 'cleaning' } }; window.dispatchEvent(new CustomEvent('demo-hass-changed')); return; }
      if (!st) return;
      let next = { ...st, state: st.state === 'on' || st.state === 'open' ? (domain === 'cover' ? 'closed' : 'off') : (domain === 'cover' ? 'open' : 'on') };
      const at = { ...st.attributes };
      if (service === 'turn_on') { next = { ...st, state: 'on' }; if (data.brightness_pct != null) at.brightness = Math.round(data.brightness_pct * 2.55); if (data.color_temp_kelvin) at.color_temp_kelvin = data.color_temp_kelvin; next.attributes = at; }
      else if (service === 'turn_off') next = { ...st, state: 'off' };
      else if (service === 'set_cover_position') { at.current_position = data.position; next = { ...st, state: data.position > 0 ? 'open' : 'closed', attributes: at }; }
      else if (service === 'volume_set') { at.volume_level = data.volume_level; next = { ...st, attributes: at }; }
      else if (service === 'set_temperature') { at.temperature = data.temperature; next = { ...st, attributes: at }; }
      hass.states = { ...hass.states, [id]: next };
      window.dispatchEvent(new CustomEvent('demo-hass-changed'));
    },
    callWS: (msg) => hass.connection.sendMessagePromise(msg),
    connection: {
      sendMessagePromise: async (msg) => {
        switch (msg.type) {
          case 'floorplan_studio/plans': return { plans: structuredClone(plans) };
          case 'floorplan_studio/plan/save': { const p = { ...msg.plan, id: msg.plan.id || 'voorbeeldhuis' }; plans.splice(0, plans.length, p); return { plan: p }; }
          case 'floorplan_studio/plan/delete': return {};
          case 'floorplan_studio/usage': return { entities: ['light.woonkamer_plafond', 'light.staande_lamp', 'media_player.woonkamer_tv', 'climate.woonkamer', 'light.keuken_spots', 'light.bureaulamp', 'light.nachtlampje', 'lock.voordeur', 'camera.voordeur'], tracking_days: 21 };
          case 'lovelace/dashboards/list': return [];
          case 'energy/get_prefs': throw new Error('not configured');
          default: return {};
        }
      },
      subscribeMessage: async () => () => {},
      subscribeEvents: async () => () => {},
    },
  };
  return hass;
}
