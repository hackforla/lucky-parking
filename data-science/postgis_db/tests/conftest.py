"""Shared test setup.

Both apps now fail closed, so tests must say which credential mode they want.
The default here is "auth off" to keep the existing route tests focused on
behaviour; tests/test_security.py opts back in per test.
"""

from __future__ import annotations

import pytest

AUTH_ENV_VARS = (
    "ALLOW_UNAUTHENTICATED",
    "API_KEYS",
    "WEB_USER",
    "WEB_PASSWORD",
    "RATE_LIMIT_PER_MINUTE",
    "DATABASE_URL",
)


@pytest.fixture(autouse=True)
def _isolate_auth_env(monkeypatch: pytest.MonkeyPatch):
    """Start every test from a known credential state, ignoring the real .env."""
    for name in AUTH_ENV_VARS:
        monkeypatch.delenv(name, raising=False)
    monkeypatch.setenv("ALLOW_UNAUTHENTICATED", "1")
    monkeypatch.setenv("RATE_LIMIT_PER_MINUTE", "0")
