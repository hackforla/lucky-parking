import os
from dotenv import load_dotenv

load_dotenv()

SOURCE_API_URL = os.getenv("SOURCE_API_URL",
                           "https://data.lacity.org/resource/4f5p-udkv.json")
USE_STATIC_DATA = os.getenv("USE_STATIC_DATA", "false").lower() == "true"
