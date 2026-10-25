"""Websocket API used by the card and the editor panel."""

from __future__ import annotations

import time
from typing import Any

import voluptuous as vol

from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.dispatcher import async_dispatcher_connect, async_dispatcher_send

from .const import DEFAULT_USAGE_DAYS, DOMAIN, SIGNAL_PLAN_SAVED


def _data(hass: HomeAssistant) -> dict[str, Any]:
    return hass.data[DOMAIN]


@callback
def async_register(hass: HomeAssistant) -> None:
    websocket_api.async_register_command(hass, ws_plans)
    websocket_api.async_register_command(hass, ws_save)
    websocket_api.async_register_command(hass, ws_delete)
    websocket_api.async_register_command(hass, ws_usage)
    websocket_api.async_register_command(hass, ws_subscribe)
    websocket_api.async_register_command(hass, ws_wled)
    websocket_api.async_register_command(hass, ws_wled_live)


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
    async_dispatcher_send(hass, SIGNAL_PLAN_SAVED, plan)
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


@websocket_api.websocket_command({vol.Required("type"): "floorplan_studio/subscribe"})
@callback
def ws_subscribe(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    """Tell open cards when a plan changed elsewhere (another screen, an assistant, an action)."""

    @callback
    def _saved(plan: dict[str, Any]) -> None:
        connection.send_message(websocket_api.event_message(msg["id"], {"plan_id": plan.get("id"), "updated": plan.get("updated")}))

    connection.subscriptions[msg["id"]] = async_dispatcher_connect(hass, SIGNAL_PLAN_SAVED, _saved)
    connection.send_result(msg["id"])


@websocket_api.websocket_command({vol.Required("type"): "floorplan_studio/wled"})
@websocket_api.require_admin
@websocket_api.async_response
async def ws_wled(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    """Every WLED device with its LED count, matrix size and segments (from the WLED JSON API), mapped to its light entities."""
    import asyncio  # noqa: PLC0415

    from homeassistant.helpers import entity_registry as er  # noqa: PLC0415
    from homeassistant.helpers.aiohttp_client import async_get_clientsession  # noqa: PLC0415

    session = async_get_clientsession(hass)
    reg = er.async_get(hass)
    lights: dict[str, str] = {}
    for ent in reg.entities.values():
        if ent.platform == "wled" and ent.domain == "light" and ent.unique_id:
            lights[ent.unique_id.lower()] = ent.entity_id

    async def one(entry) -> dict[str, Any] | None:
        host = entry.data.get("host")
        if not host:
            return None
        try:
            async with asyncio.timeout(4):
                resp = await session.get(f"http://{host}/json")
                data = await resp.json(content_type=None)
        except Exception:  # noqa: BLE001 - device offline or not reachable
            return {"title": entry.title, "host": host, "offline": True}
        info, state = data.get("info", {}), data.get("state", {})
        mac = (info.get("mac") or entry.unique_id or "").lower()
        leds = info.get("leds", {}) or {}
        matrix = leds.get("matrix") or None
        segs = []
        for seg in state.get("seg", []):
            if not isinstance(seg, dict) or seg.get("stop", 0) <= seg.get("start", 0):
                continue
            sid = seg.get("id", len(segs))
            segs.append({"id": sid, "start": seg.get("start", 0), "stop": seg.get("stop", 0), "len": seg.get("len", seg.get("stop", 0) - seg.get("start", 0)),
                         "entity_id": lights.get(f"{mac}_{sid}")})
        return {"title": entry.title, "host": host, "mac": mac, "leds": leds.get("count"), "matrix": matrix, "segments": segs, "main": lights.get(mac)}

    results = await asyncio.gather(*(one(e) for e in hass.config_entries.async_entries("wled")))
    connection.send_result(msg["id"], {"devices": [r for r in results if r]})


@websocket_api.websocket_command({vol.Required("type"): "floorplan_studio/wled_live", vol.Required("entity_ids"): [str]})
@websocket_api.async_response
async def ws_wled_live(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    """Live LED colours of WLED lights (WLED's /json/live), per segment, a few times a second while a card or walk shows them.

    Sends {"leds": {entity_id: ["rrggbb", ...]}, "matrix": {entity_id: [w, h]}} whenever they change.
    The integration fetches them itself, so this also works when Home Assistant is opened over https.
    """
    import asyncio  # noqa: PLC0415

    from homeassistant.helpers import entity_registry as er  # noqa: PLC0415
    from homeassistant.helpers.aiohttp_client import async_get_clientsession  # noqa: PLC0415

    session = async_get_clientsession(hass)
    reg = er.async_get(hass)
    wanted = set(msg["entity_ids"])
    # which device (host) and segment every wanted light is
    hosts: dict[str, dict[str, Any]] = {}
    for entry in hass.config_entries.async_entries("wled"):
        host = entry.data.get("host")
        if not host:
            continue
        for ent in er.async_entries_for_config_entry(reg, entry.entry_id):
            if ent.domain != "light" or ent.entity_id not in wanted or not ent.unique_id:
                continue
            uid = ent.unique_id.lower()
            seg = None
            if "_" in uid:
                tail = uid.rsplit("_", 1)[1]
                seg = int(tail) if tail.isdigit() else None
            hosts.setdefault(host, {})[ent.entity_id] = seg
    if not hosts:
        connection.send_error(msg["id"], "not_found", "no WLED lights")
        return

    async def get(host: str, path: str) -> Any:
        async with asyncio.timeout(3):
            resp = await session.get(f"http://{host}{path}")
            return await resp.json(content_type=None)

    async def run() -> None:
        segs: dict[str, dict[int, dict[str, Any]]] = {}
        dims: dict[str, tuple[int, int] | None] = {}
        last: dict[str, Any] = {}
        tick = 0
        while True:
            for host, ents in hosts.items():
                try:
                    if tick % 60 == 0 or host not in segs:
                        data = await get(host, "/json")
                        segs[host] = {s.get("id", i): s for i, s in enumerate(data.get("state", {}).get("seg", [])) if isinstance(s, dict)}
                        m = (data.get("info", {}).get("leds", {}) or {}).get("matrix")
                        dims[host] = (int(m["w"]), int(m["h"])) if isinstance(m, dict) and m.get("w") and m.get("h") else None
                    live = await get(host, "/json/live")
                except Exception:  # noqa: BLE001 - device offline: try again later
                    continue
                leds = live.get("leds") or []
                step = max(1, int(live.get("n") or 1))
                out: dict[str, list[str]] = {}
                mat: dict[str, list[int]] = {}
                for eid, sid in ents.items():
                    seg = segs[host].get(sid) if sid is not None else None
                    if seg is None and sid is None and len(segs[host]) == 1:
                        seg = next(iter(segs[host].values()))
                    if dims.get(host) and (live.get("w") or seg is None or "startY" in (seg or {})):
                        # a matrix: the whole picture, row by row
                        w = int(live.get("w") or dims[host][0])
                        h = int(live.get("h") or max(1, len(leds) // max(1, w)))
                        out[eid] = leds[: w * h]
                        mat[eid] = [w, h]
                        continue
                    a, b = (int(seg.get("start", 0)), int(seg.get("stop", 0))) if seg else (0, len(leds) * step)
                    part = leds[a // step: max(a // step + 1, b // step)]
                    if seg and seg.get("rev"):
                        part = part[::-1]
                    if len(part) > 96:
                        k = len(part) / 96
                        part = [part[int(i * k)] for i in range(96)]
                    out[eid] = part
                key = repr((out, mat))
                if out and last.get(host) != key:
                    last[host] = key
                    connection.send_message(websocket_api.event_message(msg["id"], {"leds": out, "matrix": mat}))
            tick += 1
            await asyncio.sleep(0.35)

    task = hass.async_create_background_task(run(), "floorplan_studio_wled_live")
    connection.subscriptions[msg["id"]] = task.cancel
    connection.send_result(msg["id"])
