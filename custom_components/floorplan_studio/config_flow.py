"""Config flow: one click, no questions. Options: show the editor in the sidebar or not."""

from __future__ import annotations

from typing import Any

import voluptuous as vol

from homeassistant.config_entries import ConfigEntry, ConfigFlow, ConfigFlowResult, OptionsFlow
from homeassistant.core import callback

from .const import DOMAIN

SHOW_IN_SIDEBAR = "show_in_sidebar"


class FloorplanStudioConfigFlow(ConfigFlow, domain=DOMAIN):
    """Add Floorplan Studio."""

    VERSION = 1

    async def async_step_user(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        await self.async_set_unique_id(DOMAIN)
        self._abort_if_unique_id_configured()
        if user_input is not None:
            return self.async_create_entry(title="Floorplan Studio", data={})
        return self.async_show_form(step_id="user")

    @staticmethod
    @callback
    def async_get_options_flow(config_entry: ConfigEntry) -> OptionsFlow:
        return FloorplanStudioOptionsFlow()


class FloorplanStudioOptionsFlow(OptionsFlow):
    """Show or hide the Floorplan editor in the sidebar (the card keeps working either way)."""

    async def async_step_init(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        if user_input is not None:
            return self.async_create_entry(data=user_input)
        current = self.config_entry.options.get(SHOW_IN_SIDEBAR, True)
        return self.async_show_form(
            step_id="init",
            data_schema=vol.Schema({vol.Required(SHOW_IN_SIDEBAR, default=current): bool}),
        )
