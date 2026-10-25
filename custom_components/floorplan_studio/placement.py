"""Place devices on the floorplan from a sentence-like request (services and AI assistants)."""

from __future__ import annotations

import math
import re
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers import area_registry as ar
from homeassistant.helpers import entity_registry as er

# words for furniture, Dutch and English (longest first when matching)
FURN_WORDS: dict[str, list[str]] = {
    "round": ["ronde tafel", "round table"],
    "island": ["kookeiland", "keukeneiland", "eiland", "kitchen island", "island"],
    "wallcab": ["bovenkast", "wandkast", "wall cabinet", "wall cupboard"],
    "table": ["eettafel", "keukentafel", "eetkamertafel", "tafel", "dining table", "table"],
    "sofa": ["bank", "zitbank", "sofa", "couch"],
    "bed": ["bed"],
    "desk": ["bureau", "desk"],
    "cabinet": ["kledingkast", "kast", "wardrobe", "cupboard", "cabinet"],
    "counter": ["aanrecht", "werkblad", "counter", "worktop"],
    "tv": ["televisie", "tv", "television"],
    "bath": ["bad", "bath", "bathtub"],
    "shower": ["douche", "shower"],
    "toilet": ["wc", "toilet"],
    "fridge": ["koelkast", "fridge", "refrigerator"],
    "stove": ["fornuis", "stove", "cooker", "oven"],
    "hob": ["kookplaat", "hob", "cooktop"],
    "sink": ["gootsteen", "spoelbak", "sink"],
    "plant": ["plant"],
    "stairs": ["trap", "stairs", "staircase"],
}
FURN_SAY = {
    "nl": {"round": "de ronde tafel", "island": "het kookeiland", "wallcab": "de bovenkast", "table": "de tafel", "sofa": "de bank", "bed": "het bed", "desk": "het bureau", "cabinet": "de kast", "counter": "het aanrecht", "tv": "de tv", "bath": "het bad", "shower": "de douche", "toilet": "de wc", "fridge": "de koelkast", "stove": "het fornuis", "hob": "de kookplaat", "sink": "de gootsteen", "plant": "de plant", "stairs": "de trap"},
    "en": {"round": "the round table", "island": "the kitchen island", "wallcab": "the wall cupboard", "table": "the table", "sofa": "the sofa", "bed": "the bed", "desk": "the desk", "cabinet": "the cupboard", "counter": "the counter", "tv": "the TV", "bath": "the bath", "shower": "the shower", "toilet": "the toilet", "fridge": "the fridge", "stove": "the cooker", "hob": "the hob", "sink": "the sink", "plant": "the plant", "stairs": "the stairs"},
}
FURN_HEIGHT = {"hob": 0.9, "sink": 0.9, "stove": 0.9, "fridge": 1.85, "island": 0.92, "wallcab": 2.1, "sofa": 0.85, "bed": 0.95, "table": 0.9, "round": 0.76, "desk": 0.76, "counter": 0.9, "cabinet": 2, "bath": 0.58, "shower": 2, "toilet": 0.8, "stairs": 2.4, "tv": 1.15, "plant": 0.9}


def _norm(text: str) -> str:
    return re.sub(r"[\s_\-.]+", " ", (text or "").lower()).strip()


def _rects(room: dict[str, Any]) -> list[tuple[float, float, float, float]]:
    out = []
    for q in room.get("rects", []):
        out.append((min(q[0], q[2]), min(q[1], q[3]), max(q[0], q[2]), max(q[1], q[3])))
    return out


def _in_room(room: dict[str, Any], x: float, y: float) -> bool:
    return any(x0 < x < x1 and y0 < y < y1 for x0, y0, x1, y1 in _rects(room))


def _scale(plan: dict[str, Any]) -> float:
    try:
        s = float(plan.get("scale") or 0)
    except (TypeError, ValueError):
        s = 0
    return s if s > 0 else 70.0


def _furn_at(f: dict[str, Any], x: float, y: float) -> bool:
    r = -math.radians(float(f.get("rot") or 0))
    dx, dy = x - float(f.get("x", 0)), y - float(f.get("y", 0))
    lx, ly = dx * math.cos(r) - dy * math.sin(r), dx * math.sin(r) + dy * math.cos(r)
    return abs(lx) <= float(f.get("w", 100)) / 2 and abs(ly) <= float(f.get("h", 60)) / 2


def _friendly(hass: HomeAssistant, entity_id: str) -> str:
    st = hass.states.get(entity_id)
    return (st and st.attributes.get("friendly_name")) or entity_id


def resolve_entity(hass: HomeAssistant, plans: list[dict[str, Any]], text: str) -> str | None:
    """An entity id from an id, a friendly name, a name on the plan or an alias."""
    t = (text or "").strip()
    if not t:
        return None
    if hass.states.get(t):
        return t
    want = _norm(t)
    names: dict[str, str] = {}
    for st in hass.states.async_all():
        names[st.entity_id] = _norm(st.attributes.get("friendly_name") or "")
    for plan in plans:
        for it in plan.get("items", []):
            if it.get("name"):
                names.setdefault(it["entity_id"] + "#plan", _norm(it["name"]))
    reg = er.async_get(hass)
    for ent in reg.entities.values():
        for alias in ent.aliases or []:
            names.setdefault(ent.entity_id + "#alias", _norm(alias))
    exact = [k for k, v in names.items() if v == want]
    if not exact:
        exact = [k for k, v in names.items() if v and (want in v or v in want)]
        # prefer the shortest name that matches (most specific)
        exact.sort(key=lambda k: len(names[k]))
    return exact[0].split("#")[0] if exact else None


def resolve_room(hass: HomeAssistant, plans: list[dict[str, Any]], text: str) -> tuple[dict[str, Any], dict[str, Any]] | None:
    """(plan, room) for a room name or a Home Assistant area name."""
    want = _norm(text)
    if not want:
        return None
    areas = ar.async_get(hass)
    for exact in (True, False):
        for plan in plans:
            for room in plan.get("rooms", []):
                names = [_norm(room.get("name", ""))]
                area = room.get("area_id") and areas.async_get_area(room["area_id"])
                if area:
                    names.append(_norm(area.name))
                    names += [_norm(a) for a in (area.aliases or [])]
                if any(n and (n == want if exact else (want in n or n in want)) for n in names):
                    return plan, room
    return None


def _room_of(plan: dict[str, Any], x: float, y: float) -> dict[str, Any] | None:
    for room in plan.get("rooms", []):
        if _in_room(room, x, y):
            return room
    return None


def _find_furniture(plan: dict[str, Any], room: dict[str, Any] | None, text: str) -> dict[str, Any] | None:
    t = f" {_norm(text)} "
    words = sorted(((w, k) for k, ws in FURN_WORDS.items() for w in ws), key=lambda p: -len(p[0]))
    for word, kind in words:
        if f" {word} " not in t:
            continue
        kinds = {kind, "round"} if kind == "table" else {kind}
        cands = [f for f in plan.get("furniture", []) if f.get("type") in kinds]
        inside = [f for f in cands if room and _in_room(room, float(f.get("x", 0)), float(f.get("y", 0)))]
        pick = inside or ([] if room else cands)
        if pick:
            return pick[0]
    return None


WINDOW_WORDS = (" vensterbank", " raam", " ramen", " window", " sill", " kozijn", " vensters", " venster ")


def _room_windows(plan: dict[str, Any], room: dict[str, Any]) -> list[dict[str, Any]]:
    """Windows on the walls of a room: centre, direction along the wall, and the way into the room."""
    out = []
    for o in plan.get("openings", []):
        if o.get("type") != "window":
            continue
        x1, y1, x2, y2 = (float(o.get(k, 0)) for k in ("x1", "y1", "x2", "y2"))
        mx, my = (x1 + x2) / 2, (y1 + y2) / 2
        hor = abs(y1 - y2) < 1
        nx, ny = (0.0, 1.0) if hor else (1.0, 0.0)
        side = 1 if _in_room(room, mx + nx * 6, my + ny * 6) else -1 if _in_room(room, mx - nx * 6, my - ny * 6) else 0
        if side:
            out.append({"x": mx, "y": my, "len": math.hypot(x2 - x1, y2 - y1), "dir": (1.0, 0.0) if hor else (0.0, 1.0), "in": (nx * side, ny * side)})
    return out


def _largest_rect(room: dict[str, Any]) -> tuple[float, float, float, float]:
    return max(_rects(room), key=lambda q: (q[2] - q[0]) * (q[3] - q[1]))


def place(hass: HomeAssistant, plans: list[dict[str, Any]], device: str, room_text: str = "", spot: str = "",
          height: float | None = None, mount: str | None = None) -> tuple[dict[str, Any] | None, str]:
    """Move (or add) a device. Returns (changed plan or None, message)."""
    nl = (hass.config.language or "en").startswith("nl")
    entity_id = resolve_entity(hass, plans, device)
    if not entity_id:
        return None, (f"Ik vind geen apparaat dat '{device}' heet." if nl else f"I can't find a device called '{device}'.")
    # which plan and room
    found = resolve_room(hass, plans, room_text) if room_text else None
    if room_text and not found:
        return None, (f"Ik vind geen ruimte '{room_text}' op de plattegrond." if nl else f"I can't find a room '{room_text}' on the floorplan.")
    plan = found[0] if found else next((p for p in plans if any(i["entity_id"] == entity_id for i in p.get("items", []))), plans[0] if plans else None)
    if plan is None:
        return None, ("Er is nog geen plattegrond." if nl else "There is no floorplan yet.")
    item = next((i for i in plan.get("items", []) if i["entity_id"] == entity_id), None)
    room = found[1] if found else None
    if room is None and spot:
        # "boven de eettafel" without a room: the room that piece of furniture stands in
        f = _find_furniture(plan, None, spot)
        if f:
            room = _room_of(plan, float(f.get("x", 0)), float(f.get("y", 0)))
    if room is None and item:
        room = _room_of(plan, float(item.get("x", 0)), float(item.get("y", 0)))
    if room is None:
        # no room given and the device is not on the plan yet: its Home Assistant area
        ent = er.async_get(hass).async_get(entity_id)
        area_id = ent and ent.area_id
        room = next((r for r in plan.get("rooms", []) if area_id and r.get("area_id") == area_id), None)
    if room is None:
        return None, ("In welke ruimte moet het komen?" if nl else "Which room should it go in?")

    S = _scale(plan)
    s = f" {_norm(spot)} "
    x0, y0, x1, y1 = _largest_rect(room)
    inset = 0.2 * S
    x, y = (x0 + x1) / 2, (y0 + y1) / 2
    where = "in het midden" if nl else "in the middle"
    furn = _find_furniture(plan, room, spot) if spot else None
    wins = _room_windows(plan, room) if spot and any(w in s for w in WINDOW_WORDS) else []
    if wins and not furn:
        # on the windowsill / at the window: the window of this room nearest to where the device is now
        cx0, cy0 = (float(item.get("x", 0)), float(item.get("y", 0))) if item else ((x0 + x1) / 2, (y0 + y1) / 2)
        win = min(wins, key=lambda w: math.hypot(w["x"] - cx0, w["y"] - cy0))
        x, y = win["x"] + win["in"][0] * 0.15 * S, win["y"] + win["in"][1] * 0.15 * S
        where = "op de vensterbank" if nl else "on the windowsill"
        if height is None and any(w in s for w in (" vensterbank", " sill", " kozijn")):
            height = 0.92
        win_dir = win["dir"]
    else:
        win_dir = None
    if furn:
        fx, fy = float(furn.get("x", 0)), float(furn.get("y", 0))
        beside = any(w in s for w in (" naast ", " next to ", " beside ", " bij ", " near ", " by "))
        above = any(w in s for w in (" boven ", " above ", " over ", " hangend", " hanging"))
        on = not above and any(w in s for w in (" op de ", " op het ", " op een ", " on top of ", " on the ", " on a "))
        if beside:
            # next to it, on the side towards the middle of the room
            half = max(float(furn.get("w", 100)), float(furn.get("h", 60))) / 2 + 0.3 * S
            cx, cy = (x0 + x1) / 2 - fx, (y0 + y1) / 2 - fy
            ln = math.hypot(cx, cy) or 1
            x, y = fx + cx / ln * half, fy + cy / ln * half
            where = ("naast " if nl else "next to ") + FURN_SAY["nl" if nl else "en"].get(furn["type"], furn["type"])
        else:
            x, y = fx, fy
            where = ("op " if on and nl else "on " if on else "boven " if nl else "above ") + FURN_SAY["nl" if nl else "en"].get(furn["type"], furn["type"])
            if on and height is None:
                height = FURN_HEIGHT.get(furn.get("type"), 0.8) + 0.1
    elif not win_dir:
        left = any(w in s for w in (" links ", " linker", " left ", " west "))
        right = any(w in s for w in (" rechts ", " rechter", " right ", " east ", " oost "))
        top = any(w in s for w in (" boven", " top ", " north ", " noord", " achter"))
        bottom = any(w in s for w in (" onder", " bottom ", " south ", " zuid", " voor "))
        for w in ("linksboven", "rechtsboven", "linksonder", "rechtsonder"):
            if w in s:
                left, right = w.startswith("links"), w.startswith("rechts")
                top, bottom = w.endswith("boven"), w.endswith("onder")
        if left:
            x = x0 + inset
        if right:
            x = x1 - inset
        if top:
            y = y0 + inset
        if bottom:
            y = y1 - inset
        if left or right or top or bottom:
            where = ("tegen de muur" if nl else "against the wall") if (left or right) != (top or bottom) else ("in de hoek" if nl else "in the corner")
    # don't land exactly on top of another device
    others = [(float(i.get("x", 0)), float(i.get("y", 0))) for i in plan.get("items", []) if i["entity_id"] != entity_id]
    is_strip = bool(item and item.get("shape") == "strip" and item.get("path"))
    for k in range(0 if is_strip else 8):   # a strip sits where its line goes
        if all(math.hypot(x - ox, y - oy) > 0.25 * S for ox, oy in others):
            break
        x += 0.35 * S * (1 if k % 2 == 0 else -1) * (k // 2 + 1)
        x = max(x0 + inset / 2, min(x1 - inset / 2, x))
    # a height in the request itself ("op 1,2 m")
    if height is None:
        m = re.search(r"(\d+(?:[.,]\d+)?)\s*(m|meter|cm)\b", s)
        if m:
            v = float(m.group(1).replace(",", "."))
            height = v / 100 if m.group(2) == "cm" else v
    mount = (mount or "").lower()
    if not mount:
        if any(w in s for w in (" hangend", " hanging", " hangt ", " aan een snoer")):
            mount = "hanging"
        elif any(w in s for w in (" plafond", " ceiling")):
            mount = "ceiling"

    if item is None:
        item = {"entity_id": entity_id}
        plan.setdefault("items", []).append(item)
    path = item.get("path") if item.get("shape") == "strip" and isinstance(item.get("path"), list) and len(item["path"]) >= 2 else None
    keep = "x" in item and not (spot or room_text)
    if keep:
        # only a new height or mounting: the device (or strip) stays exactly where it is
        x, y = float(item.get("x", 0)), float(item.get("y", 0))
        where = ""
    elif path and win_dir:
        # an LED strip on the windowsill: as long as it was, along the window
        ln = sum(math.hypot(float(path[i][0]) - float(path[i - 1][0]), float(path[i][1]) - float(path[i - 1][1])) for i in range(1, len(path)))
        hx, hy = win_dir[0] * ln / 2, win_dir[1] * ln / 2
        item["path"] = [[round(x - hx), round(y - hy)], [round(x + hx), round(y + hy)]]
    elif path:
        # an LED strip moves as a whole: the drawn line shifts along with its icon
        dx, dy = x - float(item.get("x", 0)), y - float(item.get("y", 0))
        item["path"] = [[round(float(p[0]) + dx), round(float(p[1]) + dy)] for p in path]
    item["x"], item["y"] = round(x), round(y)
    if height is not None:
        item["height"] = round(float(height), 2)
    if mount in ("ceiling", "flush", "plafond"):
        item["ceiling"] = True
    elif mount in ("hanging", "pendant", "hangend"):
        item["ceiling"] = "hanging"
    elif mount in ("wall", "floor", "table", "muur", "vloer"):
        item["ceiling"] = False
    name = item.get("name") or _friendly(hass, entity_id)
    hs = f", {item['height']:.2f} m".replace(".", "," if nl else ".") if height is not None else ""
    msg = f"{name} staat nu in {room.get('name', '')}{' ' + where if where else ''}{hs}." if nl else f"{name} is now in {room.get('name', '')}{' ' + where if where else ''}{hs}."
    return plan, msg


def parse_request(hass: HomeAssistant, plans: list[dict[str, Any]], text: str) -> dict[str, Any] | None:
    """Understand a plain sentence without any AI: find the device and the room named in it; the rest is the spot.

    "hang keukentafel 1 boven de eettafel op 1,8 m" -> device Keukentafel 1, room (from the furniture/area), spot "boven de eettafel op 1,8 m".
    """
    t = f" {_norm(text)} "
    names: list[tuple[str, str]] = []
    on_plan = {i["entity_id"] for p in plans for i in p.get("items", [])}
    for plan in plans:
        for it in plan.get("items", []):
            if it.get("name"):
                names.append((_norm(it["name"]), it["entity_id"]))
    for st in hass.states.async_all():
        fn = _norm(st.attributes.get("friendly_name") or "")
        if fn and (st.entity_id in on_plan or st.domain in ("light", "switch", "sensor", "binary_sensor", "media_player", "climate", "cover", "fan", "camera", "lock", "vacuum")):
            names.append((fn, st.entity_id))
        names.append((_norm(st.entity_id), st.entity_id))
    # the longest name that appears as whole words in the sentence (devices on the plan win a tie)
    best = None
    for n, eid in names:
        if len(n) < 2 or f" {n} " not in t:
            continue
        key = (len(n), eid in on_plan)
        if best is None or key > best[0]:
            best = (key, n, eid)
    if not best:
        return None
    rest = t.replace(f" {best[1]} ", " ", 1)
    room_text = ""
    for plan in plans:
        for room in plan.get("rooms", []):
            rn = _norm(room.get("name", ""))
            if rn and f" {rn} " in rest and len(rn) > len(room_text):
                room_text = rn
    if not room_text:
        areas = ar.async_get(hass)
        for plan in plans:
            for room in plan.get("rooms", []):
                area = room.get("area_id") and areas.async_get_area(room["area_id"])
                for n in ([area.name] + list(area.aliases or [])) if area else []:
                    if _norm(n) and f" {_norm(n)} " in rest and len(_norm(n)) > len(room_text):
                        room_text = _norm(n)
    # the spot keeps every word (a room can share its name with furniture: "Eettafel")
    return {"device": best[2], "room": room_text, "spot": rest.strip()}


def describe(hass: HomeAssistant, plans: list[dict[str, Any]]) -> dict[str, Any]:
    """The floorplan in metres: rooms, furniture and devices (for assistants that want to reason about it)."""
    out = []
    for plan in plans:
        S = _scale(plan)
        m = lambda v: round(float(v) / S, 2)  # noqa: E731
        rooms = []
        for room in plan.get("rooms", []):
            rs = _rects(room)
            rooms.append({
                "name": room.get("name"), "area_id": room.get("area_id"),
                "box_m": [m(min(q[0] for q in rs)), m(min(q[1] for q in rs)), m(max(q[2] for q in rs)), m(max(q[3] for q in rs))],
                "windows": [{"x_m": m(w["x"]), "y_m": m(w["y"]), "w_m": m(w["len"])} for w in _room_windows(plan, room)],
                "furniture": [{"type": f.get("type"), "x_m": m(f.get("x", 0)), "y_m": m(f.get("y", 0)), "w_m": m(f.get("w", 100)), "d_m": m(f.get("h", 60))}
                              for f in plan.get("furniture", []) if _in_room(room, float(f.get("x", 0)), float(f.get("y", 0)))],
                "devices": [{"entity_id": i["entity_id"], "name": i.get("name") or _friendly(hass, i["entity_id"]), "x_m": m(i.get("x", 0)), "y_m": m(i.get("y", 0)),
                             **({"height_m": i["height"]} if i.get("height") is not None else {}),
                             **({"strip": True} if i.get("shape") == "strip" and i.get("path") else {})}
                            for i in plan.get("items", []) if _in_room(room, float(i.get("x", 0)), float(i.get("y", 0)))],
            })
        out.append({"plan": plan.get("name"), "id": plan.get("id"), "note": "x to the right, y downwards (top of the plan = 0)", "rooms": rooms})
    return {"plans": out}
