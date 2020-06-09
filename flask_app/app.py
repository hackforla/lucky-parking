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


@app.route('/get_tileset/<string:tileset_id>/<int:zoom>/<int:x>/<int:y>.<string:format>')
def get_tileset(tileset_id,zoom,x,y,format):
    # tileset API documentation: https://docs.mapbox.com/api/maps/#tilesets
    assert zoom <= 18 and zoom >= 0, "zoom must be in range [0, 18]"
    assert x <= (zoom**2-1) and x >= 0, "x must be in range [0, zoom^2 - 1]"
    assert y <= (zoom**2-1) and y >= 0, "y must be in range [0, zoom^2 - 1]"
    assert format in ['mvt', 'vector.pbf'], "format must be mvt or vector.pbf"

    url = MAPBOX_BASE_PATH + '/v4/' + tileset_id + '/' + str(zoom) + '/' + str(x) + '/' + str(y) + '.' + format
    url += '?access_token=' + MAPBOX_API_KEY
    tileset = requests.get(url)
    
    return tileset.content