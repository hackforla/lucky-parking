import os
import requests
from dotenv import load_dotenv
from flask import Flask

load_dotenv()

MAPBOX_BASE_PATH = 'https://api.mapbox.com'
MAPBOX_API_KEY = os.getenv('MAPBOX_API_KEY')

app = Flask(
    __name__
)

@app.route('/')
def home():
    return ''

@app.route('/get_tileset/<tileset_id>/<lat>,<lon>/<radius>.json')
def get_tileset(tileset_id,lat,lon,radius):
    # tileset API documentation: https://docs.mapbox.com/api/maps/#tilequery

    url = MAPBOX_BASE_PATH + '/v4/' + tileset_id + '/tilequery/' + lon + ',' + lat + '.json?radius=' + radius
    url += '&access_token=' + MAPBOX_API_KEY
    tileset = requests.get(url)
    
    return tileset.content