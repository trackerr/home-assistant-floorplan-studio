"""Websocket API used by the card and the editor panel."""

from __future__ import annotations

import asyncio
import logging
import time
from typing import Any

import voluptuous as vol

from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.dispatcher import async_dispatcher_connect, async_dispatcher_send

from .const import (
    DEFAULT_USAGE_DAYS,
    DOMAIN,
    MODEL_EXTS,
    MODEL_MAX_BYTES,
    MODEL_MAX_CHUNK_BASE64_CHARS,
    MODEL_MAX_CHUNK_BYTES,
    MODEL_UPLOAD_CLEANUP_INTERVAL,
    MODEL_UPLOAD_TMP_DIR,
    MODEL_UPLOAD_TTL,
    MODELS_DIR,
    MODELS_URL,
    SIGNAL_PLAN_SAVED,
)

_LOGGER = logging.getLogger(__name__)
_MODEL_UPLOAD_LOCK_KEY = f"{DOMAIN}_model_upload_lock"
_MODEL_UPLOAD_CLEANUP_TASK_KEY = f"{DOMAIN}_model_upload_cleanup_task"


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
    websocket_api.async_register_command(hass, ws_model_upload)
    websocket_api.async_register_command(hass, ws_model_list)
    websocket_api.async_register_command(hass, ws_model_delete)
    if _MODEL_UPLOAD_LOCK_KEY not in hass.data:
        hass.data[_MODEL_UPLOAD_LOCK_KEY] = asyncio.Lock()
    cleanup_task = hass.data.get(_MODEL_UPLOAD_CLEANUP_TASK_KEY)
    if cleanup_task is None or cleanup_task.done():
        hass.data[_MODEL_UPLOAD_CLEANUP_TASK_KEY] = hass.async_create_background_task(
            _async_cleanup_expired_model_uploads(hass),
            "floorplan_studio_model_upload_cleanup",
        )


def _remove_expired_model_uploads(*folders) -> None:
    """Remove incomplete uploads that have had no activity for an hour."""
    cutoff = time.time() - MODEL_UPLOAD_TTL
    for folder in folders:
        if not folder.is_dir():
            continue
        for path in folder.glob(".upload-*"):
            try:
                info = path.lstat()
                if cutoff - info.st_mtime >= 0 and (path.is_symlink() or path.is_file()):
                    path.unlink()
            except FileNotFoundError:
                continue
            except OSError as err:
                _LOGGER.debug("Could not remove expired Floorplan Studio upload %s: %s", path.name, err)


async def _async_cleanup_expired_model_uploads(hass: HomeAssistant) -> None:
    """Periodically remove abandoned upload parts, including after a HA restart."""
    folder = _model_upload_tmp_dir(hass)
    legacy_folder = _models_dir(hass)
    lock = hass.data[_MODEL_UPLOAD_LOCK_KEY]
    while True:
        try:
            async with lock:
                await hass.async_add_executor_job(
                    _remove_expired_model_uploads, folder, legacy_folder
                )
        except asyncio.CancelledError:
            raise
        except Exception:  # noqa: BLE001 - cleanup must not interrupt Home Assistant
            _LOGGER.debug("Could not clean expired Floorplan Studio model uploads", exc_info=True)
        await asyncio.sleep(MODEL_UPLOAD_CLEANUP_INTERVAL)


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


@websocket_api.websocket_command({vol.Required("type"): "floorplan_studio/wled_live", vol.Required("entity_ids"): [str], vol.Optional("full", default=[]): [str]})
@websocket_api.async_response
async def ws_wled_live(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    """Live LED colours of WLED lights (WLED's /json/live), per segment, a few times a second while a card or walk shows them.

    Sends {"leds": {entity_id: ["rrggbb", ...]}, "matrix": {entity_id: [w, h]}} whenever they change.
    The integration fetches them itself, so this also works when Home Assistant is opened over https.
    """
    import asyncio  # noqa: PLC0415

    import aiohttp  # noqa: PLC0415

    from homeassistant.helpers import entity_registry as er  # noqa: PLC0415
    from homeassistant.helpers.aiohttp_client import async_get_clientsession  # noqa: PLC0415

    session = async_get_clientsession(hass)
    reg = er.async_get(hass)
    wanted = set(msg["entity_ids"]) | set(msg.get("full") or [])
    full = set(msg.get("full") or [])   # these want the whole device (all segments), e.g. an ambilight around a TV
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

    frames: dict[str, dict[str, Any]] = {}   # host -> {"leds": ["rrggbb", ...], "w": int|None, "h": int|None}

    async def watch(host: str) -> None:
        """WLED's own live preview: its websocket sends the LEDs as binary frames ("L", version, [w, h], rgb...)."""
        while True:
            try:
                async with session.ws_connect(f"ws://{host}/ws", heartbeat=30, timeout=5) as ws:
                    await ws.send_str('{"lv":true}')
                    async for m in ws:
                        if m.type != aiohttp.WSMsgType.BINARY:
                            continue
                        b = m.data
                        if len(b) < 2 or b[0] != 0x4C:   # "L"
                            continue
                        w = h = None
                        off = 2
                        if b[1] == 2 and len(b) >= 4:
                            w, h, off = b[2], b[3], 4
                        rgb = b[off:]
                        frames[host] = {"leds": [rgb[i:i + 3].hex() for i in range(0, len(rgb) - 2, 3)], "w": w, "h": h}
            except asyncio.CancelledError:
                raise
            except Exception:  # noqa: BLE001 - offline, or no websocket: try the JSON live API
                try:
                    live = await get(host, "/json/live")
                    step = max(1, int(live.get("n") or 1))
                    frames[host] = {"leds": live.get("leds") or [], "w": live.get("w"), "h": live.get("h"), "step": step}
                    await asyncio.sleep(0.4)
                    continue
                except Exception:  # noqa: BLE001
                    pass
                await asyncio.sleep(10)

    async def run() -> None:
        segs: dict[str, dict[int, dict[str, Any]]] = {}
        dims: dict[str, tuple[int, int] | None] = {}
        counts: dict[str, int] = {}
        last: dict[str, Any] = {}
        tick = 0
        watchers = [hass.async_create_background_task(watch(host), "floorplan_studio_wled_watch") for host in hosts]
        try:
            while True:
                for host, ents in hosts.items():
                    try:
                        if tick % 90 == 0 or host not in segs:
                            data = await get(host, "/json")
                            segs[host] = {sg.get("id", i): sg for i, sg in enumerate(data.get("state", {}).get("seg", [])) if isinstance(sg, dict)}
                            leds_info = data.get("info", {}).get("leds", {}) or {}
                            counts[host] = int(leds_info.get("count") or 0)
                            m = leds_info.get("matrix")
                            dims[host] = (int(m["w"]), int(m["h"])) if isinstance(m, dict) and m.get("w") and m.get("h") else None
                    except Exception:  # noqa: BLE001 - device offline: try again later
                        continue
                    fr = frames.get(host)
                    if not fr or not fr["leds"]:
                        continue
                    leds = fr["leds"]
                    # the preview may skip LEDs to fit: map LED numbers onto it
                    total = counts.get(host) or len(leds)
                    scale = len(leds) / total if total else 1
                    out: dict[str, list[str]] = {}
                    mat: dict[str, list[int]] = {}
                    seglens: dict[str, list[int]] = {}
                    for eid, sid in ents.items():
                        if eid in full:
                            # the whole strip, and how long each segment is (an ambilight: left, top, right, bottom)
                            part = leds if len(leds) <= 240 else [leds[int(i * len(leds) / 240)] for i in range(240)]
                            out[eid] = part
                            seglens[eid] = [max(0, int(sg.get("stop", 0)) - int(sg.get("start", 0))) for _, sg in sorted(segs[host].items())]
                            continue
                        seg = segs[host].get(sid) if sid is not None else None
                        if seg is None and sid is None and len(segs[host]) == 1:
                            seg = next(iter(segs[host].values()))
                        if dims.get(host) and (fr.get("w") or seg is None or "startY" in (seg or {})):
                            w = int(fr.get("w") or dims[host][0])
                            h = int(fr.get("h") or max(1, len(leds) // max(1, w)))
                            out[eid] = leds[: w * h]
                            mat[eid] = [w, h]
                            continue
                        a, b = (int(seg.get("start", 0)), int(seg.get("stop", 0))) if seg else (0, total)
                        part = leds[int(a * scale): max(int(a * scale) + 1, int(b * scale))]
                        if len(part) > 96:
                            k = len(part) / 96
                            part = [part[int(i * k)] for i in range(96)]
                        out[eid] = part
                    key = repr((out, mat))
                    if out and last.get(host) != key:
                        last[host] = key
                        connection.send_message(websocket_api.event_message(msg["id"], {"leds": out, "matrix": mat, "segments": seglens}))
                tick += 1
                await asyncio.sleep(0.3)
        finally:
            for t in watchers:
                t.cancel()

    task = hass.async_create_background_task(run(), "floorplan_studio_wled_live")
    connection.subscriptions[msg["id"]] = task.cancel
    connection.send_result(msg["id"])


# ------------------------------------------------------------------ your own 3D models
def _models_dir(hass: HomeAssistant):
    from pathlib import Path  # noqa: PLC0415

    return Path(hass.config.path(MODELS_DIR))


def _model_upload_tmp_dir(hass: HomeAssistant):
    from pathlib import Path  # noqa: PLC0415

    return Path(hass.config.path(MODEL_UPLOAD_TMP_DIR))


def _safe_stem(name: str) -> str:
    import re  # noqa: PLC0415

    stem = re.sub(r"[^a-zA-Z0-9_-]+", "-", name.rsplit(".", 1)[0]).strip("-").lower()
    return stem[:40] or "model"


@websocket_api.websocket_command(
    {
        vol.Required("type"): "floorplan_studio/model/upload",
        vol.Required("name"): str,
        vol.Required("upload_id"): vol.Match(r"^[a-z0-9]{6,24}$"),
        vol.Required("part"): vol.All(int, vol.Range(min=0, max=4000)),
        vol.Required("data"): vol.All(
            str, vol.Length(min=1, max=MODEL_MAX_CHUNK_BASE64_CHARS)
        ),
        vol.Optional("last", default=False): bool,
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def ws_model_upload(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    """Receive a 3D model (.glb, .gltf, .obj) in base64 parts; the last part stores it as <name>-<hash>.<ext>."""
    import base64  # noqa: PLC0415
    import hashlib  # noqa: PLC0415

    name = msg["name"]
    ext = "." + name.rsplit(".", 1)[-1].lower() if "." in name else ""
    if ext not in MODEL_EXTS:
        connection.send_error(msg["id"], "bad_type", "Only .glb, .gltf or .obj files")
        return
    folder = _models_dir(hass)
    tmp_folder = _model_upload_tmp_dir(hass)
    tmp = tmp_folder / f".upload-{msg['upload_id']}"
    encoded = msg["data"]
    # The schema caps this too; keep the guard next to decoding so future callers
    # cannot accidentally allocate an unbounded decoded chunk.
    if len(encoded) > MODEL_MAX_CHUNK_BASE64_CHARS:
        connection.send_error(msg["id"], "chunk_too_big", "An upload part is too large")
        return
    try:
        chunk = base64.b64decode(encoded, validate=True)
    except ValueError:
        connection.send_error(msg["id"], "bad_data", "Not base64")
        return
    if not chunk or len(chunk) > MODEL_MAX_CHUNK_BYTES:
        connection.send_error(msg["id"], "chunk_too_big", "An upload part must contain 1 to 256 KiB")
        return

    def write() -> dict[str, Any] | str:
        folder.mkdir(parents=True, exist_ok=True)
        tmp_folder.mkdir(parents=True, exist_ok=True)
        if msg["part"] == 0:
            current_size = 0
        else:
            try:
                current_size = tmp.stat().st_size
            except FileNotFoundError:
                return "expired"
        if current_size + len(chunk) > MODEL_MAX_BYTES:
            tmp.unlink(missing_ok=True)
            return "too_big"
        with open(tmp, "wb" if msg["part"] == 0 else "ab") as fh:
            fh.write(chunk)
        size = tmp.stat().st_size
        if not msg["last"]:
            return {"received": size}
        data = tmp.read_bytes()
        final = folder / f"{_safe_stem(name)}-{hashlib.sha1(data).hexdigest()[:10]}{ext}"
        tmp.replace(final)
        return {"file": final.name, "url": f"{MODELS_URL}/{final.name}", "size": size}

    lock = hass.data.get(_MODEL_UPLOAD_LOCK_KEY)
    if lock is None:
        lock = hass.data[_MODEL_UPLOAD_LOCK_KEY] = asyncio.Lock()
    async with lock:
        if msg["part"] == 0:
            await hass.async_add_executor_job(
                _remove_expired_model_uploads, tmp_folder, folder
            )
        job = hass.async_add_executor_job(write)
        try:
            result = await asyncio.shield(job)
        except asyncio.CancelledError:
            # Let the executor finish before the lock is released or a cleanup
            # pass can race its file operation.
            try:
                await job
            except Exception:  # noqa: BLE001 - preserve cancellation after cleanup
                pass
            finally:
                await hass.async_add_executor_job(lambda: tmp.unlink(missing_ok=True))
            raise
        except OSError:
            await hass.async_add_executor_job(lambda: tmp.unlink(missing_ok=True))
            connection.send_error(msg["id"], "upload_failed", "Could not store the model")
            return
    if result == "too_big":
        connection.send_error(msg["id"], "too_big", f"The model is larger than {MODEL_MAX_BYTES // 1048576} MiB")
        return
    if result == "expired":
        connection.send_error(msg["id"], "upload_expired", "The upload expired; please start it again")
        return
    connection.send_result(msg["id"], result)


@websocket_api.websocket_command({vol.Required("type"): "floorplan_studio/model/list"})
@websocket_api.async_response
async def ws_model_list(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    """The 3D models you uploaded."""
    folder = _models_dir(hass)

    def scan() -> list[dict[str, Any]]:
        if not folder.is_dir():
            return []
        return [
            {"file": p.name, "url": f"{MODELS_URL}/{p.name}", "size": p.stat().st_size}
            for p in sorted(folder.iterdir())
            if p.is_file() and not p.name.startswith(".") and p.suffix.lower() in MODEL_EXTS
        ]

    connection.send_result(msg["id"], {"models": await hass.async_add_executor_job(scan)})


@websocket_api.websocket_command({vol.Required("type"): "floorplan_studio/model/delete", vol.Required("file"): vol.Match(r"^[a-z0-9_-]+\.(glb|gltf|obj)$")})
@websocket_api.require_admin
@websocket_api.async_response
async def ws_model_delete(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    """Remove an uploaded 3D model."""
    path = _models_dir(hass) / msg["file"]
    await hass.async_add_executor_job(lambda: path.unlink(missing_ok=True))
    connection.send_result(msg["id"], {})
