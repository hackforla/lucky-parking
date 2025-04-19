import json
from pathlib import Path

STATIC_FILE = Path(__file__).parent / "static_data.json"


def load_static_data(limit=100):
    with open(STATIC_FILE, "r") as f:
        data = json.load(f)
    return data[:limit]