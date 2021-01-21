#!/usr/bin/env python

from dotenv import find_dotenv, load_dotenv
import os
import glob
from sqlalchemy import *
import numpy as np
import pandas as pd
import pickle
from pathlib import Path
from geoalchemy2 import Geometry, WKTElement
import geopandas as gpd

load_dotenv(find_dotenv(), override=True)
user = os.getenv("DB_USER")
password = os.getenv("DB_PW")
host = os.getenv("DB_HOST")
port = os.getenv("DB_PORT")
database = os.getenv("DB_NAME")


# Load project directory
PROJECT_DIR = Path(os.getenv("PROJECT_DIR"))
latest_file = max(glob.glob(PROJECT_DIR / 'data' / 'processed' / '*.geojson'), key=os.path.getctime)

def main()
    engine = create_engine(
        f"postgresql+psycopg2://{user}:{password}@{host}:{port}/{database}"
    )

    df = gpd.read_file(latest_file,
    crs="EPSG:4326").set_index("index").dropna(subset=['geometry']).reset_index(drop=True)

    try:
        df.to_postgis(
            "test",
            engine,
            if_exists="replace",
            index=True,
            dtype={
                "datetime": DateTime,
                "fine_amount": Integer,
                "latitude": Float,
                "longitude": Float,
                "state_plate": String,
                "make": String,
                "body_style": String,
                "color": String,
                "location": String,
                "violation_code": String,
                "violation_description": String,
                "weekday": String,
                "geometry": Geometry(geometry_type="POINT", srid=4326),
            },
        )
        print('done!')
    except Exception as e:
        print(e)


if __name__ == '__main__':
    # log_fmt = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    # logging.basicConfig(level=logging.INFO, format=log_fmt)
    

    # find .env automagically by walking up directories until it's found, then
    # load up the .env entries as environment variables

    # Run main function
    # logger = logging.getLogger(__name__)
    # logger.info(
    #     'Starting download of raw dataset: this will take a few minutes'
    # )
    main()
    # logger.info('Finished downloading!')
