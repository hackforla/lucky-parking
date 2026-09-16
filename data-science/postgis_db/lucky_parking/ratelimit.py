"""In-process sliding-window rate limiter.

Both apps run a single uvicorn worker, so one process sees every request. With
more workers the counters become per-worker and the effective ceiling
multiplies — move to a shared store before scaling out.
"""

from __future__ import annotations

import os
import threading
import time
from collections import deque

DEFAULT_WINDOW_SECONDS = 60.0
_SWEEP_INTERVAL_SECONDS = 300.0


def requests_per_minute(default: int = 60) -> int:
    """Limit from ``RATE_LIMIT_PER_MINUTE``; 0 or less disables limiting."""
    raw = os.getenv("RATE_LIMIT_PER_MINUTE", "").strip()
    if not raw:
        return default
    try:
        return int(raw)
    except ValueError:
        return default


class SlidingWindowLimiter:
    def __init__(self) -> None:
        self._hits: dict[str, deque[float]] = {}
        self._lock = threading.Lock()
        self._last_sweep = time.monotonic()

    def check(
        self,
        identity: str,
        *,
        max_requests: int,
        window_seconds: float = DEFAULT_WINDOW_SECONDS,
    ) -> float | None:
        """Record a request; return seconds to wait if over the limit, else None."""
        if max_requests <= 0:
            return None
        now = time.monotonic()
        cutoff = now - window_seconds
        with self._lock:
            hits = self._hits.setdefault(identity, deque())
            while hits and hits[0] <= cutoff:
                hits.popleft()
            if len(hits) >= max_requests:
                retry_after = hits[0] + window_seconds - now
                return max(retry_after, 0.0)
            hits.append(now)
            self._sweep(now, window_seconds)
        return None

    def reset(self) -> None:
        with self._lock:
            self._hits.clear()

    def _sweep(self, now: float, window_seconds: float) -> None:
        """Drop identities with no recent hits so the dict cannot grow forever."""
        if now - self._last_sweep < _SWEEP_INTERVAL_SECONDS:
            return
        self._last_sweep = now
        cutoff = now - window_seconds
        stale = [key for key, hits in self._hits.items() if not hits or hits[-1] <= cutoff]
        for key in stale:
            del self._hits[key]
