"""Persistent storage for floorplans and usage tracking."""

from __future__ import annotations

import logging
import re
import time
from typing import Any

from homeassistant.const import EVENT_STATE_CHANGED
from homeassistant.core import Event, HomeAssistant, callback
from homeassistant.helpers.storage import Store

from .const import STORAGE_KEY, STORAGE_KEY_USAGE, STORAGE_VERSION, USAGE_KEEP_DAYS

_LOGGER = logging.getLogger(__name__)
_SLUG = re.compile(r"[^a-z0-9_]+")


def slugify_id(text: str) -> str:
    """Create a safe plan id."""
    slug = _SLUG.sub("_", (text or "").lower()).strip("_")
    return slug or "plan"


class PlanStore:
    """Keeps all floorplans in .storage/floorplan_studio.plans."""

    def __init__(self, hass: HomeAssistant) -> None:
        self.hass = hass
        self._store: Store[dict[str, Any]] = Store(hass, STORAGE_VERSION, STORAGE_KEY)
        self.plans: dict[str, dict[str, Any]] = {}

    async def async_load(self) -> None:
        data = await self._store.async_load() or {}
        self.plans = data.get("plans", {})

    async def async_save_plan(self, plan: dict[str, Any]) -> dict[str, Any]:
        plan_id = plan.get("id")
        if not plan_id:
            base_id = slugify_id(plan.get("name", "plan"))
            plan_id = base_id
            suffix = 2
            while plan_id in self.plans:
                plan_id = f"{base_id}_{suffix}"
                suffix += 1
        plan["id"] = plan_id
        plan["updated"] = time.time()
        self.plans[plan_id] = plan
        await self._store.async_save({"plans": self.plans})
        return plan

    async def async_delete_plan(self, plan_id: str) -> None:
        self.plans.pop(plan_id, None)
        await self._store.async_save({"plans": self.plans})


class UsageTracker:
    """Remembers when a person (not an automation) last operated an entity.

    The card's "Simple" mode only shows entities that were used in the last
    N days. Live tracking listens to state changes whose context carries a
    user id (dashboard, companion app, voice assistants that use a HA user).
    At start-up the recorder is read once, so the feature works from day one.
    """

    def __init__(self, hass: HomeAssistant) -> None:
        self.hass = hass
        self._store: Store[dict[str, Any]] = Store(hass, STORAGE_VERSION, STORAGE_KEY_USAGE)
        self.last_used: dict[str, float] = {}
        self.since: float = time.time()
        self._unsub = None

    async def async_load(self) -> None:
        data = await self._store.async_load() or {}
        self.last_used = data.get("last_used", {})
        self.since = data.get("since", time.time())
        self._unsub = self.hass.bus.async_listen(EVENT_STATE_CHANGED, self._state_changed)

    async def async_backfill(self) -> None:
        """Read user-initiated state changes from the recorder (best effort)."""
        if "recorder" not in self.hass.config.components:
            return
        try:
            from sqlalchemy import text  # noqa: PLC0415

            from homeassistant.components.recorder import get_instance  # noqa: PLC0415
            from homeassistant.components.recorder.util import session_scope  # noqa: PLC0415
        except ImportError:  # pragma: no cover
            return
        cutoff = time.time() - USAGE_KEEP_DAYS * 86400
        query = text(
            "SELECT m.entity_id, MAX(s.last_updated_ts) FROM states s "
            "JOIN states_meta m ON s.metadata_id = m.metadata_id "
            "WHERE s.context_user_id_bin IS NOT NULL AND s.last_updated_ts > :t "
            "GROUP BY m.entity_id"
        )

        def _run() -> list[tuple[str, float]]:
            with session_scope(hass=self.hass, read_only=True) as session:
                return [(r[0], float(r[1])) for r in session.execute(query, {"t": cutoff})]

        try:
            rows = await get_instance(self.hass).async_add_executor_job(_run)
        except Exception as err:  # noqa: BLE001 - recorder schema may differ
            _LOGGER.debug("Usage backfill skipped: %s", err)
            return
        for entity_id, ts in rows:
            if ts > self.last_used.get(entity_id, 0):
                self.last_used[entity_id] = ts
        if rows:
            self.since = min(self.since, min(ts for _, ts in rows))
        self._schedule_save()

    @callback
    def _state_changed(self, event: Event) -> None:
        new = event.data.get("new_state")
        if new is None or new.context.user_id is None:
            return
        old = event.data.get("old_state")
        if old is not None and old.state == new.state and old.attributes == new.attributes:
            return
        self.last_used[new.entity_id] = time.time()
        self._schedule_save()

    @callback
    def _schedule_save(self) -> None:
        self._store.async_delay_save(self._data, 60)

    @callback
    def _data(self) -> dict[str, Any]:
        cutoff = time.time() - USAGE_KEEP_DAYS * 86400
        self.last_used = {k: v for k, v in self.last_used.items() if v > cutoff}
        return {"last_used": self.last_used, "since": self.since}

    def used(self, days: int) -> list[str]:
        cutoff = time.time() - days * 86400
        return sorted(k for k, v in self.last_used.items() if v > cutoff)

    @callback
    def async_unload(self) -> None:
        if self._unsub:
            self._unsub()
            self._unsub = None
