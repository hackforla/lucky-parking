# Issue #640 ('https://github.com/hackforla/lucky-parking/issues/640')

This FastAPI app allows Lucky Parking developers to TEST features while the main data pipeline is under construction.

## 🚀 What It Does

- Serves citation data from:
  - Static file (`static_data.json`)
  - Or the live LA Open Data API (`https://data.lacity.org/resource/4f5p-udkv.json`)
- Provides two endpoints:
  - `GET /citations` – Returns data (supports `?limit=`)
  - `GET /ping` – Returns app mode and API status

## ⚙️ How to Use

1. From the root of the repo, install dependencies:
   ```bash
   pip install -r scripts/api_data_proxy/requirements.txt
   ```

2. Run the server:
   ```bash
   cd scripts/api_data_proxy
   uvicorn main:app --reload
   ```

3. Open your browser:
   - http://localhost:8000/citations
   - http://localhost:8000/ping
   - http://localhost:8000/docs

## 🌐 Environment Settings

Edit `.env` inside this folder:

```env
USE_STATIC_DATA=true       # Use mock JSON
# or
USE_STATIC_DATA=false      # Use live API
```

## 📂 Files

- `main.py`: FastAPI app and endpoints
- `static_loader.py`: Loads static JSON
- `source_api.py`: Calls LA Open Data API
- `ping` route: Shows current mode + connectivity
- `static_data.json`: Sample mock data
