// Floorplan Studio – tiny starter. Home Assistant loads this first: it registers the cards at once
// (so the dashboard never shows "configuration error" while waiting) and fetches the real card code.
const IMPL = './floorplan-studio-card.js?v=1.4.0b71';
let loading = null;
const load = () => (loading = loading || import(IMPL));
load();   // start right away, before any card asks for it

const nl = () => (document.querySelector('home-assistant')?.hass?.locale?.language || navigator.language || 'en').startsWith('nl');

/** Stands in for the card: forwards everything to the real card as soon as its code is there. */
function stand(tag, impl, size) {
  if (customElements.get(tag)) return;
  customElements.define(tag, class extends HTMLElement {
    static async getConfigElement() { await load(); return document.createElement('floorplan-studio-card-editor'); }
    static getStubConfig() { return { theme: 'warm', mode: 'all' }; }
    getCardSize() { return this._inner?.getCardSize?.() ?? size; }
    getGridOptions() { return this._inner?.getGridOptions?.() ?? { columns: 'full', rows: 'auto', min_columns: 6 }; }
    setConfig(c) { this._config = c; this._inner?.setConfig(c); }
    set hass(h) { this._hass = h; if (this._inner) this._inner.hass = h; }
    get hass() { return this._hass; }
    set planOverride(p) { this._po = p; if (this._inner) this._inner.planOverride = p; }
    connectedCallback() {
      this.style.display = 'block';
      if (this._inner) return;
      if (tag === 'floorplan-studio-card') this.innerHTML = `<ha-card style="padding:24px;text-align:center;opacity:.7">${nl() ? 'Plattegrond laden…' : 'Loading floorplan…'}</ha-card>`;
      load().then(() => this._mount()).catch((e) => { this.innerHTML = `<ha-card style="padding:16px">Floorplan Studio: ${String(e?.message || e).replace(/</g, '&lt;')}</ha-card>`; });
    }
    _mount() {
      if (this._inner) return;
      const el = document.createElement(impl);
      if (this._po) el.planOverride = this._po;
      if (this._config) el.setConfig(this._config);
      if (this._hass) el.hass = this._hass;
      this._inner = el;
      this.replaceChildren(el);
    }
  });
}
const register = () => {
  stand('floorplan-studio-card', 'floorplan-studio-card-impl', 9);
  stand('floorplan-studio-nav', 'floorplan-studio-nav-impl', 0);
};
register();
// Home Assistant can swap its element registry while it starts, which drops what was registered before;
// check a few times (cheap) and register again in the new one
let tries = 0;
const again = setInterval(() => { register(); if (++tries > 100) clearInterval(again); }, 100);
load().then(register).catch(() => {});
window.addEventListener('load', register);

window.customCards = window.customCards || [];
if (!window.customCards.some((c) => c.type === 'floorplan-studio-card')) {
  window.customCards.push({ type: 'floorplan-studio-card', name: 'Floorplan Studio', description: 'Interactive floorplan with live lights, devices and room zoom.', preview: false, documentationURL: 'https://github.com/trackerr/home-assistant-floorplan-studio' });
}
