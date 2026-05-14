"""Rate limiting 20 req / 60s / IP (scope chat) — mémoire ou Redis."""
from __future__ import annotations

import time
from typing import TYPE_CHECKING

from src.config import get_settings

if TYPE_CHECKING:
    import redis as redis_lib

_redis: redis_lib.Redis | None = None
_memory: dict[str, tuple[int, float]] = {}


def _redis() -> redis_lib.Redis | None:
    global _redis
    if _redis is not None:
        return _redis
    url = get_settings().redis_url
    if not url:
        return None
    import redis

    _redis = redis.from_url(url, decode_responses=True)
    return _redis


def check_rate_limit_chat(client_ip: str) -> bool:
    """Retourne True si la requête est autorisée."""
    s = get_settings()
    key = f"rl:chat:{client_ip}"
    limit = s.rate_limit_chat_per_minute
    window = s.rate_limit_window_seconds

    r = _redis()
    if r:
        try:
            pipe = r.pipeline()
            pipe.incr(key, 1)
            pipe.expire(key, window)
            n, _ = pipe.execute()
            return int(n) <= limit
        except Exception:
            return _check_memory(key, limit, window)
    return _check_memory(key, limit, window)


def _check_memory(key: str, limit: int, window: float) -> bool:
    now = time.time()
    entry = _memory.get(key)
    if not entry or now > entry[1]:
        _memory[key] = (1, now + window)
        return True
    count, reset_at = entry
    if count >= limit:
        return False
    _memory[key] = (count + 1, reset_at)
    return True
