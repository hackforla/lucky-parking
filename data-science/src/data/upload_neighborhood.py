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
password = os.getenv("DB_PW")
host = os.getenv("DB_HOST")
port = os.getenv("DB_PORT")
database = os.getenv("DB_NAME")


# Load project directory
PROJECT_DIR = Path(__file__).resolve().parents[2]
latest_file = max(
    (PROJECT_DIR / "data" / "external").glob('neighborhood_councils.geojson'), key=os.path.getctime
)


def main():
    engine = create_engine(
        f"postgresql+psycopg2://{user}:{password}@{host}:{port}/{database}"
    )

    df = (
        gpd.read_file(latest_file, crs="EPSG:4326")
        # .set_index("index")
        # .dropna(subset=["the_geom"])
        # .reset_index(drop=True)
    )
    print(df.head())
    try:
        df.to_postgis(
            "neighborhood_councils",
            engine,
            if_exists="replace",
            # index=True,
            dtype={
                "objectid": BIGINT,
                "zipcode": Numeric,
                "shape_area": Numeric,
                "shape_len": Numeric,
                "geometry": Geometry(geometry_type="MultiPolygon", srid=4326),
            },
        )
        # print("changing column names...")
        # with engine.connect() as con:
        #   con.execute("""
        #     ALTER TABLE zipcodes
        #     RENAME COLUMN objectid TO object_id;
        #     ALTER TABLE zipcodes
        #     RENAME COLUMN zipcode TO zip;
        #     ALTER TABLE zipcodes
        #     RENAME COLUMN geometry TO the_geom;
        #   """)
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
