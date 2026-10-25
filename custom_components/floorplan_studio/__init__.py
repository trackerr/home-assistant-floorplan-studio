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

from . import websocket
from .const import (
    CARD_FILE,
    DOMAIN,
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
            [StaticPathConfig(STATIC_URL, str(FRONTEND_DIR), False)]
        )
        websocket.async_register(hass)
        hass.data[f"{DOMAIN}_static"] = True
    # Load the card on every dashboard; no manual "resource" needed.
    frontend.add_extra_js_url(hass, f"{STATIC_URL}/{CARD_FILE}?v={VERSION}")

    await panel_custom.async_register_panel(
        hass,
        frontend_url_path=PANEL_URL_PATH,
        webcomponent_name=PANEL_COMPONENT,
        sidebar_title="Floorplan",
        sidebar_icon="mdi:floor-plan",
        module_url=f"{STATIC_URL}/{PANEL_FILE}?v={VERSION}",
        require_admin=True,
        config={"version": VERSION},
    )

    async def _backfill(_=None) -> None:
        await usage.async_backfill()

    if hass.state is CoreState.running:
        hass.async_create_task(_backfill())
    else:
        hass.bus.async_listen_once(EVENT_HOMEASSISTANT_STARTED, _backfill)
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload the integration."""
    data = hass.data.pop(DOMAIN, None)
    if data:
        data["usage"].async_unload()
    frontend.async_remove_panel(hass, PANEL_URL_PATH)
    frontend.remove_extra_js_url(hass, f"{STATIC_URL}/{CARD_FILE}?v={VERSION}")
    return True
