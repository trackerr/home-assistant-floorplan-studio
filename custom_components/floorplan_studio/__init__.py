"""Floorplan Studio: an interactive floorplan for Home Assistant."""

from __future__ import annotations

import logging
from pathlib import Path

from homeassistant.components import frontend, panel_custom
from homeassistant.components.http import StaticPathConfig
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import EVENT_HOMEASSISTANT_STARTED
from homeassistant.core import CoreState, HomeAssistant
from homeassistant.helpers import device_registry as dr

from . import assist, websocket
from .const import (
    CARD_FILE,
    DOMAIN,
    MODELS_DIR,
    MODELS_URL,
    PANEL_COMPONENT,
    PANEL_FILE,
    PANEL_URL_PATH,
    REPO_URL,
    STATIC_URL,
    VERSION,
)
from .store import PlanStore, UsageTracker

_LOGGER = logging.getLogger(__name__)
FRONTEND_DIR = Path(__file__).parent / "frontend"


async def _async_resource(hass: HomeAssistant, url: str) -> None:
    """Add (or update) the card as a Lovelace resource, so Home Assistant Cast and kiosk browsers find it too."""
    try:
        lovelace = hass.data.get("lovelace")
        resources = getattr(lovelace, "resources", None) or (lovelace.get("resources") if isinstance(lovelace, dict) else None)
        if resources is None or not hasattr(resources, "async_create_item"):
            return   # dashboards in YAML: the user manages resources
        if not getattr(resources, "loaded", True):
            await resources.async_load()
            resources.loaded = True
        base = url.split("?")[0]
        mine = [r for r in resources.async_items() if str(r.get("url", "")).split("?")[0] == base]
        if not mine:
            await resources.async_create_item({"res_type": "module", "url": url})
        elif mine[0].get("url") != url:
            await resources.async_update_item(mine[0]["id"], {"res_type": "module", "url": url})
    except Exception:  # noqa: BLE001 - never stop the integration for this
        _LOGGER.debug("Floorplan Studio: could not add the card as a dashboard resource", exc_info=True)


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up Floorplan Studio from the UI."""
    plans = PlanStore(hass)
    usage = UsageTracker(hass)
    await plans.async_load()
    await usage.async_load()
    hass.data[DOMAIN] = {"plans": plans, "usage": usage}

    # A "service" entry on the integration page, with version and a link to the project on GitHub.
    dr.async_get(hass).async_get_or_create(
        config_entry_id=entry.entry_id,
        identifiers={(DOMAIN, "studio")},
        name="Floorplan Studio",
        manufacturer="trackerr",
        model="Floorplan editor and card",
        sw_version=VERSION,
        entry_type=dr.DeviceEntryType.SERVICE,
        configuration_url=REPO_URL,
    )

    if not hass.data.get(f"{DOMAIN}_static"):
        await hass.http.async_register_static_paths(
            # every file is loaded with ?v=<version>, so browsers may keep it: no check on every reload
            [StaticPathConfig(STATIC_URL, str(FRONTEND_DIR), True)]
        )
        # your own 3D models: the file names carry a content hash, so browsers may keep them
        models = Path(hass.config.path(MODELS_DIR))
        await hass.async_add_executor_job(lambda: models.mkdir(parents=True, exist_ok=True))
        await hass.http.async_register_static_paths([StaticPathConfig(MODELS_URL, str(models), True)])
        websocket.async_register(hass)
        hass.data[f"{DOMAIN}_static"] = True
    # Load the card on every dashboard; no manual "resource" needed.
    frontend.add_extra_js_url(hass, f"{STATIC_URL}/{CARD_FILE}?v={VERSION}")
    # Home Assistant Cast (a TV) and some kiosk browsers only load dashboard resources, not the line above:
    # also keep the card as a resource (and its version up to date), when dashboards are kept in storage
    hass.async_create_task(_async_resource(hass, f"{STATIC_URL}/{CARD_FILE}?v={VERSION}"))

    await panel_custom.async_register_panel(
        hass,
        frontend_url_path=PANEL_URL_PATH,
        webcomponent_name=PANEL_COMPONENT,
        # hidden from the sidebar when the user chose so in the options; still reachable at /floorplan-studio
        sidebar_title="Floorplan" if entry.options.get("show_in_sidebar", True) else None,
        sidebar_icon="mdi:floor-plan" if entry.options.get("show_in_sidebar", True) else None,
        module_url=f"{STATIC_URL}/{PANEL_FILE}?v={VERSION}",
        require_admin=True,
        config={"version": VERSION},
    )

    # actions and AI-assistant tools: "put the kitchen lamp above the dining table"
    await assist.async_setup(hass)

    # changing the options (sidebar on/off) reloads the integration
    entry.async_on_unload(entry.add_update_listener(_options_changed))

    async def _backfill(_=None) -> None:
        await usage.async_backfill()

    if hass.state is CoreState.running:
        hass.async_create_task(_backfill())
    else:
        hass.bus.async_listen_once(EVENT_HOMEASSISTANT_STARTED, _backfill)
    return True


async def _options_changed(hass: HomeAssistant, entry: ConfigEntry) -> None:
    await hass.config_entries.async_reload(entry.entry_id)


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload the integration."""
    assist.async_unload(hass)
    data = hass.data.pop(DOMAIN, None)
    if data:
        data["usage"].async_unload()
    frontend.async_remove_panel(hass, PANEL_URL_PATH)
    frontend.remove_extra_js_url(hass, f"{STATIC_URL}/{CARD_FILE}?v={VERSION}")
    return True
