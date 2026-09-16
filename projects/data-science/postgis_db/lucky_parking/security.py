"""Credential checks shared by the contract API and the explorer UI.

Credentials are read from the environment on every request so that rotating a
key means editing ``.env`` and restarting the container — no image rebuild.

- ``API_KEYS``                  comma-separated keys for the ``X-API-Key`` header
- ``WEB_USER`` / ``WEB_PASSWORD``  HTTP basic auth for the explorer UI
- ``ALLOW_UNAUTHENTICATED``     set to 1 to disable both checks (local dev only)

Both checks fail closed: if no credentials are configured and
``ALLOW_UNAUTHENTICATED`` is unset, every request is rejected.
"""

from __future__ import annotations

import hashlib
import os
import secrets

API_KEY_HEADER = "X-API-Key"
_TRUTHY = {"1", "true", "yes", "on"}


def allow_unauthenticated() -> bool:
    return os.getenv("ALLOW_UNAUTHENTICATED", "").strip().lower() in _TRUTHY


def api_keys() -> frozenset[str]:
    raw = os.getenv("API_KEYS", "")
    return frozenset(key.strip() for key in raw.split(",") if key.strip())


def _matches(candidate: str, expected: str) -> bool:
    # Bytes rather than str: compare_digest rejects non-ASCII str, and client
    # headers are attacker-controlled.
    return secrets.compare_digest(candidate.encode("utf-8"), expected.encode("utf-8"))


def check_api_key(candidate: str | None) -> bool:
    """True if ``candidate`` matches a configured key.

    Every configured key is compared even after a match so that response time
    does not leak how many keys exist or where the match occurred.
    """
    keys = api_keys()
    if not keys or not candidate:
        return False
    matched = False
    for key in keys:
        if _matches(candidate, key):
            matched = True
    return matched


def basic_auth_configured() -> bool:
    return bool(os.getenv("WEB_USER", "").strip() and os.getenv("WEB_PASSWORD", ""))


def check_basic_auth(user: str | None, password: str | None) -> bool:
    expected_user = os.getenv("WEB_USER", "").strip()
    expected_password = os.getenv("WEB_PASSWORD", "")
    if not expected_user or not expected_password:
        return False
    if user is None or password is None:
        return False
    ok_user = _matches(user, expected_user)
    ok_password = _matches(password, expected_password)
    return ok_user and ok_password


def api_key_fingerprint(candidate: str | None) -> str:
    """Short, non-reversible label for logs and rate-limit buckets."""
    if not candidate:
        return "anonymous"
    return "key:" + hashlib.sha256(candidate.encode("utf-8")).hexdigest()[:12]
