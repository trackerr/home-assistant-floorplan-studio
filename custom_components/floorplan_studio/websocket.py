"""Websocket API used by the card and the editor panel."""

from __future__ import annotations

import time
from typing import Any

import voluptuous as vol

from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant, callback

from .const import DEFAULT_USAGE_DAYS, DOMAIN


def _data(hass: HomeAssistant) -> dict[str, Any]:
    return hass.data[DOMAIN]


@callback
def async_register(hass: HomeAssistant) -> None:
    websocket_api.async_register_command(hass, ws_plans)
    websocket_api.async_register_command(hass, ws_save)
    websocket_api.async_register_command(hass, ws_delete)
    websocket_api.async_register_command(hass, ws_usage)


@websocket_api.websocket_command({vol.Required("type"): "floorplan_studio/plans"})
@callback
def ws_plans(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    """Return every floorplan."""
    plans = list(_data(hass)["plans"].plans.values())
    if not connection.user.is_admin:
        # The editor is admin-only, while dashboard cards are available to
        # regular users. Keep the plan layout and settings for cards, but do
        # not expose the original embedded floorplan image to those users.
        plans = [
            {
                **plan,
                "background": {
                    key: value
                    for key, value in plan["background"].items()
                    if not (
                        key == "url"
                        and isinstance(value, str)
                        and value.startswith("data:image/")
                    )
                },
            }
            if isinstance(plan.get("background"), dict)
            else plan
            for plan in plans
        ]
    connection.send_result(msg["id"], {"plans": plans})


@websocket_api.websocket_command(
    {vol.Required("type"): "floorplan_studio/plan/save", vol.Required("plan"): dict}
)
@websocket_api.require_admin
@websocket_api.async_response
async def ws_save(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    """Create or update a floorplan (admins only)."""
    plan = await _data(hass)["plans"].async_save_plan(msg["plan"])
    hass.bus.async_fire("floorplan_studio_updated", {"plan_id": plan["id"]})
    connection.send_result(msg["id"], {"plan": plan})


@websocket_api.websocket_command(
    {vol.Required("type"): "floorplan_studio/plan/delete", vol.Required("plan_id"): str}
)
@websocket_api.require_admin
@websocket_api.async_response
async def ws_delete(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    """Delete a floorplan (admins only)."""
    await _data(hass)["plans"].async_delete_plan(msg["plan_id"])
    connection.send_result(msg["id"], {})


@websocket_api.websocket_command(
    {
        vol.Required("type"): "floorplan_studio/usage",
        vol.Optional("days", default=DEFAULT_USAGE_DAYS): vol.All(int, vol.Range(min=1, max=60)),
    }
)
@callback
def ws_usage(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    """Entities a person operated in the last N days."""
    tracker = _data(hass)["usage"]
    connection.send_result(
        msg["id"],
        {
            "entities": tracker.used(msg["days"]),
            "tracking_days": round((time.time() - tracker.since) / 86400, 1),
        },
    )
