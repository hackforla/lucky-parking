"""
main.py — FastAPI Proxy Server for Lucky Parking Devs

This script runs a FastAPI app to serve citation data from:
- A local static JSON file (if USE_STATIC_DATA=true in .env), or
- The live LA Open Data API (if USE_STATIC_DATA=false)

Endpoints:
----------

1. GET /citations
   - Returns citation data from either the static file or the live API
   - Accepts a `?limit=<int>` parameter (default 100, max 1000)

2. GET /ping
   - Always accessible
   - Returns:
     - "Running in static mode" — using mock data
     - "API is up" — using live mode and the API is responsive
     - "Live API unreachable — please set USE_STATIC_DATA=true"
       — using live mode, but the API is down

How to Use:
-----------

1. Navigate to this folder:
   scripts/api_data_proxy/

2. Install dependencies:
   pip install -r requirements.txt

3. Run the development server:
   uvicorn main:app --reload

4. Open in your browser:
   http://localhost:8000/citations  
   http://localhost:8000/ping  
   http://localhost:8000/docs  (Swagger UI)

5. To switch modes, edit the .env file:
   USE_STATIC_DATA=true    # Loads from static_data.json
   USE_STATIC_DATA=false   # Uses live LA Open Data API
"""

from fastapi import FastAPI, Query
from source_api import fetch_live_data
from static_loader import load_static_data
from config import USE_STATIC_DATA
import requests

app = FastAPI()


@app.get("/citations")
def get_citations(limit: int = Query(default=100, le=1000)):
    if USE_STATIC_DATA:
        return load_static_data(limit)
    return fetch_live_data(limit)


@app.get("/ping")
def ping():
    if USE_STATIC_DATA:
        return {
            "status": "ok",
            "mode": "static",
            "message": "Running in static mode"
        }
    try:
        response = requests.get(
            "https://data.lacity.org/resource/4f5p-udkv.json?$limit=1",
            timeout=5
        )
        response.raise_for_status()
        return {
            "status": "ok",
            "mode": "live",
            "message": "API is up"
        }
    except Exception:
        return {
            "status": "error",
            "mode": "live",
            "message": "Live API unreachable — please set USE_STATIC_DATA=true"
        }
