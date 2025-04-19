"""
main.py — FastAPI Proxy Server for Lucky Parking Devs

This script runs a FastAPI app to serve citation data from:
- A local static JSON file (if USE_STATIC_DATA=true in .env), or
- The live LA Open Data API (if USE_STATIC_DATA=false)

Endpoints:
----------
1. GET /citations
   - Returns citation data from either static file or live API
   - Accepts ?limit=<int> (default 100, max 1000)

2. GET /ping
   - Always accessible
   - Returns:
     - "Running in static mode" if using mock data
     - "API is up" if using live mode and API responds
     - "Live API unreachable — please set USE_STATIC_DATA=true" if live mode
            but API is down

How to Use:
-----------
1. Navigate to this folder:
   scripts/api_data_proxy/

2. Install dependencies:
   pip install -r requirements.txt

3. Run the development server:
   uvicorn main:app --reload

4. Open in browser:
   http://localhost:8000/citations
   http://localhost:8000/ping
   http://localhost:8000/docs (Swagger UI)

5. Set mode in .env:
   USE_STATIC_DATA=true   → loads from static_data.json
   USE_STATIC_DATA=false  → tries to fetch from source API

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