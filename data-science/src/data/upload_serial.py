#!/usr/bin/env conda run -n citation-analysis python
from dotenv import find_dotenv, load_dotenv
import os
from sqlalchemy import *
import numpy as np
import pandas as pd
import pickle
from pathlib import Path
from geoalchemy2 import Geometry
import geopandas as gpd
import psycopg2

load_dotenv(find_dotenv(), override=True)
user = os.getenv("DB_USER")
password = os.getenv("DB_PASSWORD")
host = os.getenv("DB_HOST")
port = os.getenv("DB_PORT")
database = os.getenv("DB_DATABASE")


# Load project directory
PROJECT_DIR = Path(__file__).resolve().parents[2]
latest_file = max(
    (PROJECT_DIR / "data" / "processed").glob('*.geojson'), key=os.path.getctime
)


def main():
    engine = create_engine(
        f"postgresql+psycopg2://{user}:{password}@{host}:{port}/{database}"
    )

    df = (
        gpd.read_file(latest_file, crs="EPSG:4326")
    )
    try:
        df.to_postgis(
            "serial",
            engine,
            if_exists="replace",
            index=True,
            dtype={
                "0": String,
                "1": String,
                "2": String,
                "3": String,
                "4": Integer,
                "5": BigInteger,
                "6": Integer,
                "7": Integer,
                "8": Integer,
                "9": Integer,
                "geometry": Geometry(geometry_type="POINT", srid=4326),
            },
        )
        print("done!")
    except Exception as e:
        print(e)


if __name__ == "__main__":
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
