"""Actions and AI-assistant tools: put a device in the right place on the floorplan by asking."""

from __future__ import annotations

import json
import logging
from typing import Any

import voluptuous as vol

from homeassistant.core import HomeAssistant, ServiceCall, ServiceResponse, SupportsResponse
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers import intent
from homeassistant.helpers.dispatcher import async_dispatcher_send

from .const import DOMAIN, SIGNAL_PLAN_SAVED
from .placement import describe, parse_request, place

_LOGGER = logging.getLogger(__name__)

MOUNTS = ["ceiling", "hanging", "wall", "floor", "table"]
PLACE_SCHEMA = {
    vol.Required("device"): cv.string,
    vol.Optional("room"): cv.string,
    vol.Optional("spot"): cv.string,
    vol.Optional("height"): vol.All(vol.Coerce(float), vol.Range(min=0, max=10)),
    vol.Optional("mount"): vol.In(MOUNTS),
}
INTENT_PLACE = "FloorplanPlaceDevice"
INTENT_DESCRIBE = "FloorplanDescribe"


async def _save(hass: HomeAssistant, plan: dict[str, Any]) -> dict[str, Any]:
    saved = await hass.data[DOMAIN]["plans"].async_save_plan(plan)
    hass.bus.async_fire("floorplan_studio_updated", {"plan_id": saved["id"]})
    async_dispatcher_send(hass, SIGNAL_PLAN_SAVED, saved)
    return saved


async def async_place(hass: HomeAssistant, data: dict[str, Any]) -> tuple[bool, str]:
    plans = list(hass.data[DOMAIN]["plans"].plans.values())
    # work on a copy, so a request that fails halfway changes nothing
    copies = json.loads(json.dumps(plans))
    if not data.get("device") and data.get("text"):
        # a plain sentence, no AI needed: find the device and room in it
        parsed = parse_request(hass, copies, data["text"])
        nl = (hass.config.language or "en").startswith("nl")
        if not parsed:
            return False, ("Ik weet niet welk apparaat je bedoelt. Noem de naam zoals hij in Home Assistant heet, bijv. 'zet Keukenlamp boven de eettafel'."
                           if nl else "I don't know which device you mean. Use its name as in Home Assistant, e.g. 'put Kitchen lamp above the dining table'.")
        data = {**parsed, **{k: v for k, v in data.items() if k in ("height", "mount", "room") and v}}
    plan, msg = place(hass, copies, data["device"], data.get("room", ""), data.get("spot", ""), data.get("height"), data.get("mount"))
    if plan is None:
        return False, msg
    await _save(hass, plan)
    return True, msg


class PlaceDeviceIntent(intent.IntentHandler):
    """Lets an AI assistant move a device on the floorplan."""

    intent_type = INTENT_PLACE
    description = (
        "Moves a device (lamp, sensor, speaker, switch...) to a spot on the Floorplan Studio floorplan. "
        "device = the device name or entity id. room = the room or area. "
        "spot = where in the room, in plain words, e.g. 'above the dining table', 'next to the sofa', "
        "'on the desk', 'left wall', 'top right corner', 'middle'. "
        "height = metres above the floor (optional). mount = ceiling, hanging, wall, floor or table (optional). "
        "Use FloorplanDescribe first if you need to know which rooms and furniture there are."
    )
    slot_schema = PLACE_SCHEMA

    async def async_handle(self, intent_obj: intent.Intent) -> intent.IntentResponse:
        slots = self.async_validate_slots(intent_obj.slots)
        data = {k: v["value"] for k, v in slots.items()}
        ok, msg = await async_place(intent_obj.hass, data)
        response = intent_obj.create_response()
        response.async_set_speech(msg)
        if not ok:
            response.async_set_error(intent.IntentResponseErrorCode.FAILED_TO_HANDLE, msg)
        return response


class DescribeIntent(intent.IntentHandler):
    """Gives an AI assistant the floorplan: rooms, furniture and devices with positions in metres."""

    intent_type = INTENT_DESCRIBE
    description = (
        "Returns the Floorplan Studio floorplan as JSON: every room with its box in metres, the furniture in it "
        "and the devices with their position (x to the right, y downwards, metres). Use it before moving devices."
    )
    slot_schema: dict = {}

    async def async_handle(self, intent_obj: intent.Intent) -> intent.IntentResponse:
        data = describe(intent_obj.hass, list(intent_obj.hass.data[DOMAIN]["plans"].plans.values()))
        response = intent_obj.create_response()
        response.async_set_speech(json.dumps(data, ensure_ascii=False, separators=(",", ":")))
        return response


async def async_setup(hass: HomeAssistant) -> None:
    """Register the actions (floorplan_studio.place_device / describe) and the assistant tools."""

    async def _place(call: ServiceCall) -> ServiceResponse:
        ok, msg = await async_place(hass, dict(call.data))
        if not ok and not call.return_response:
            _LOGGER.warning("floorplan_studio.place_device: %s", msg)
        return {"ok": ok, "message": msg} if call.return_response else None

    async def _describe(call: ServiceCall) -> ServiceResponse:
        return describe(hass, list(hass.data[DOMAIN]["plans"].plans.values()))

    service_schema = vol.Schema(vol.All(
        {**{vol.Optional(k.schema if hasattr(k, "schema") else k): v for k, v in PLACE_SCHEMA.items()}, vol.Optional("text"): cv.string},
        cv.has_at_least_one_key("device", "text"),
    ))
    hass.services.async_register(DOMAIN, "place_device", _place, schema=service_schema, supports_response=SupportsResponse.OPTIONAL)
    hass.services.async_register(DOMAIN, "describe", _describe, schema=vol.Schema({}), supports_response=SupportsResponse.ONLY)
    intent.async_register(hass, PlaceDeviceIntent())
    intent.async_register(hass, DescribeIntent())


def async_unload(hass: HomeAssistant) -> None:
    for service in ("place_device", "describe"):
        hass.services.async_remove(DOMAIN, service)
    remove = getattr(intent, "async_remove", None)
    if remove:
        for it in (INTENT_PLACE, INTENT_DESCRIBE):
            try:
                remove(hass, it)
            except Exception:  # noqa: BLE001 - older Home Assistant versions
                pass
