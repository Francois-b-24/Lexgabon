"""Sessions conversationnelles — Redis ou dict mémoire, TTL 30 min, max 30 messages."""
from __future__ import annotations

import json
import time
import uuid
from typing import Any

from src.config import get_settings


def _now() -> float:
    return time.time()


class SessionStore:
    def get_history(self, session_id: str) -> list[dict[str, Any]] | None:
        raise NotImplementedError

    def set_history(self, session_id: str, history: list[dict[str, Any]]) -> None:
        raise NotImplementedError

    def append_turn(self, session_id: str, user_msg: str, assistant_msg: str) -> list[dict[str, Any]]:
        s = get_settings()
        hist = self.get_history(session_id) or []
        hist.append({"role": "user", "content": user_msg})
        hist.append({"role": "assistant", "content": assistant_msg})
        # troncature : garder les N derniers messages (paires user/assistant)
        max_msgs = s.session_max_messages
        if len(hist) > max_msgs:
            hist = hist[-max_msgs:]
        self.set_history(session_id, hist)
        return hist

    def clear(self, session_id: str) -> None:
        raise NotImplementedError

    def touch_ttl(self, session_id: str) -> None:
        raise NotImplementedError


class MemorySessionStore(SessionStore):
    def __init__(self) -> None:
        self._data: dict[str, tuple[list[dict[str, Any]], float]] = {}

    def get_history(self, session_id: str) -> list[dict[str, Any]] | None:
        s = get_settings()
        entry = self._data.get(session_id)
        if not entry:
            return None
        hist, exp = entry
        if _now() > exp:
            del self._data[session_id]
            return None
        return list(hist)

    def set_history(self, session_id: str, history: list[dict[str, Any]]) -> None:
        s = get_settings()
        self._data[session_id] = (list(history), _now() + s.session_ttl_seconds)

    def clear(self, session_id: str) -> None:
        self._data.pop(session_id, None)

    def touch_ttl(self, session_id: str) -> None:
        s = get_settings()
        if session_id in self._data:
            hist, _ = self._data[session_id]
            self._data[session_id] = (hist, _now() + s.session_ttl_seconds)


class RedisSessionStore(SessionStore):
    def __init__(self, url: str) -> None:
        import redis

        self._r = redis.from_url(url, decode_responses=True)
        self._prefix = "sess:legal:"

    def _key(self, session_id: str) -> str:
        return f"{self._prefix}{session_id}"

    def get_history(self, session_id: str) -> list[dict[str, Any]] | None:
        s = get_settings()
        raw = self._r.get(self._key(session_id))
        if not raw:
            return None
        data = json.loads(raw)
        hist = data.get("history", [])
        return hist

    def set_history(self, session_id: str, history: list[dict[str, Any]]) -> None:
        s = get_settings()
        payload = json.dumps({"history": history}, ensure_ascii=False)
        self._r.setex(self._key(session_id), s.session_ttl_seconds, payload)

    def clear(self, session_id: str) -> None:
        self._r.delete(self._key(session_id))

    def touch_ttl(self, session_id: str) -> None:
        hist = self.get_history(session_id)
        if hist is not None:
            self.set_history(session_id, hist)

    def append_turn(self, session_id: str, user_msg: str, assistant_msg: str) -> list[dict[str, Any]]:
        return super().append_turn(session_id, user_msg, assistant_msg)


_store: SessionStore | None = None


def get_session_store() -> SessionStore:
    global _store
    if _store is not None:
        return _store
    url = get_settings().redis_url
    if url:
        _store = RedisSessionStore(url)
    else:
        _store = MemorySessionStore()
    return _store


def new_session_id() -> str:
    return uuid.uuid4().hex
