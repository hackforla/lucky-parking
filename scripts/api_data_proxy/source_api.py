import requests
from config import SOURCE_API_URL


def fetch_live_data(limit=100):
    params = {"$limit": limit}
    response = requests.get(SOURCE_API_URL, params=params)
    response.raise_for_status()
    return response.json()
