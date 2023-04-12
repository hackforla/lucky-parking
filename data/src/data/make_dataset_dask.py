# -*- coding: utf-8 -*-
import click
from pathlib import Path
from dotenv import find_dotenv, load_dotenv, set_key
import urllib3
import shutil
import os
import json
import csv
import pytz
import datetime
from datetime import date
import pandas as pd
import random
from pyproj import Transformer
from typing import Union
import geopandas as gpd
from shapely.geometry import Point
import dask.dataframe as dd
from dask.diagnostics import ProgressBar

# Load project directory
PROJECT_DIR = Path(__file__).resolve().parents[2]

# Find latest update of dataset and create name string
def find_latest_update():
    """Returns the time in epoch that lacity.org last updated their dataset.
    """
    http = urllib3.PoolManager()
    metadata = http.request('GET', 'https://data.lacity.org/api/views/wjz9-h9np')
    return str(json.loads(metadata.data.decode('utf8').replace("'", '"'))['rowsUpdatedAt'])
latest_update = find_latest_update()
filename_string = latest_update + "_" + datetime.datetime.fromtimestamp(int(latest_update), pytz.timezone('US/Pacific')).strftime("%Y-%m-%d")
data_schema = {'Ticket number': 'object',
                'Issue Date': 'object',
                'Issue time': 'float64',
                'Meter Id': 'object',
                'Marked Time': 'object',
                'RP State Plate': 'object',
                'Plate Expiry Date': 'object',
                'VIN': 'object',
                'Make': 'object',
                'Body Style': 'object',
                'Color': 'object',
                'Location': 'object',
                'Route': 'object',
                'Agency': 'float64',
                'Violation code': 'object',
                'Violation Description': 'object',
                'Fine amount': 'float64',
                'Latitude': 'float64',
                'Longitude': 'float64',
                'Agency Description': 'object',
                'Color Description': 'object',
                'Body Style Description': 'object'
}

@click.command()
@click.argument("input_filedir", type=click.Path(exists=True))
@click.argument("output_filedir", type=click.Path())
def main(input_filedir: str, output_filedir: str):
    """Downloads full dataset from lacity.org, and runs data processing
    scripts to turn raw data into cleaned data ready
    to be analyzed. Also updates environmental
    variables.
    """
    
    # download updated csv if not updated
    if is_file_updated("RAW_CSV_FILEPATH"):
        print("Raw CSV is updated. It is located at {}".format(os.environ.get("RAW_CSV_FILEPATH")))
    else:
        download_raw_csv(input_filedir)
    
    if is_file_updated("RAW_PARQUET_FILEPATH"):
        print("Raw PARQUET is updated. It is located at {}".format(os.environ.get("RAW_PARQUET_FILEPATH")))
    else:
        download_raw_parquet(input_filedir)
    
    # clean
    if find_dotenv():
        load_dotenv(find_dotenv())
    clean(os.environ.get("RAW_PARQUET_FILEPATH"), output_filedir)


def download_raw_csv(input_filedir: str) -> Path:
    """Downloads raw dataset from lacity.org to input_filedir as {date}
    raw.csv. Also updates environmental variable RAW_DATA_FILEPATH.
    """
    print("Downloading Raw CSV. This will take a few minutes...")

    # Setup connection and download into raw data folder
    http = urllib3.PoolManager()
    url = "https://data.lacity.org/api/views/wjz9-h9np/rows.csv?accessType=DOWNLOAD"
    RAW_CSV_FILEPATH = PROJECT_DIR / input_filedir / (filename_string + "_raw.csv")
    with http.request("GET", url, preload_content=False) as res, open(
        RAW_CSV_FILEPATH, "wb"
    ) as out_file:
        shutil.copyfileobj(res, out_file)

    print("Successfully downloaded Raw CSV to {}".format(RAW_CSV_FILEPATH))

    # Save csv file path as RAW_CSV_FILEPATH into .env
    set_key(find_dotenv(), "RAW_CSV_FILEPATH", str(RAW_CSV_FILEPATH))


def download_raw_parquet(input_filedir: str) -> Path:
    """Transforms raw CSV to raw PARQUET
    """
    if find_dotenv():
        load_dotenv(find_dotenv())
    if os.environ.get("RAW_CSV_FILEPATH"):
        print("Transforming CSV to PARQUET...")

        # read raw CSV with determined schema
        ddf = dd.read_csv(os.environ.get("RAW_CSV_FILEPATH"), dtype=data_schema)
        RAW_PARQUET_FILEPATH = PROJECT_DIR / input_filedir / (filename_string + "_raw.parquet")
        
        # transform CSV to PARQUET
        with ProgressBar():
            ddf.to_parquet(RAW_PARQUET_FILEPATH, schema="infer")
        print("Successfully downloaded Raw PARQUET to {}".format(RAW_PARQUET_FILEPATH))

        # Save csv file path as RAW_CSV_FILEPATH into .env
        set_key(find_dotenv(), "RAW_PARQUET_FILEPATH", str(RAW_PARQUET_FILEPATH))
    else:
        download_raw_csv(input_filedir)


def clean(target_file: Union[Path, str], output_filedir: str):
    """Removes unnecessary columns, erroneous data points and aliases,
    changes geometry projection from epsg:2229 to epsg:4326, and converts
    time to datetime type.
    """
    # Change str filepath into Path
    if isinstance(target_file, str):
        target_file = Path(target_file)
    if find_dotenv():
        load_dotenv(find_dotenv())
    
    print("Cleaning dataset ...")

    # Read file into dataframe and select columns of interest
    cols = [
        "Issue Date",
        "Issue time",
        "RP State Plate",
        "Make",
        "Body Style",
        "Color",
        "Location",
        "Violation code",
        "Violation Description",
        "Fine amount",
        "Latitude",
        "Longitude",
    ]
    if target_file.suffix == ".parquet":
        ddf = dd.read_parquet(target_file, columns=cols, engine='pyarrow')
    elif target_file.suffix == ".csv":
        ddf = dd.read_csv(target_file, columns=cols)
    
    # Filter out data points with bad coordinates
    ddf = ddf[(ddf.Latitude != 99999) & (ddf.Longitude != 99999)]

    # Filter out data points with no time/date stamps
    ddf = ddf[
        (ddf["Issue Date"].notnull())
        & (ddf["Issue time"].notnull())
        & (ddf["Fine amount"].notnull())
    ]

    # Convert Issue time and Issue Date strings into a combined datetime type
    ddf["Issue time"] = ddf["Issue time"].apply(
        lambda x: "0" * (4 - len(str(int(x)))) + str(int(x)),
        meta=('Issue time', 'object')
    )
    ddf["Datetime"] = dd.to_datetime(
        ddf["Issue Date"] + " " + ddf["Issue time"], format="%m/%d/%Y %H%M"
    )

    # Drop original date/time columns
    ddf = ddf.drop(["Issue Date", "Issue time"], axis=1)

    # Make column names more coding friendly except for Lat/Lon
    ddf.columns = [
        "state_plate",
        "make",
        "body_style",
        "color",
        "location",
        "violation_code",
        "violation_description",
        "fine_amount",
        "Latitude",
        "Longitude",
        "datetime",
    ]

    # Read in make aliases
    make_df = pd.read_csv(PROJECT_DIR / "references/make.csv", delimiter=",")
    make_df["alias"] = make_df.alias.apply(lambda x: x.split(","))

    # Iterate over makes and replace aliases
    for _, data in make_df.iterrows():
        ddf = ddf.replace(data["alias"], data["make"])

    # Instantiate projection converter and change projection
    transformer = Transformer.from_crs("EPSG:2229", "EPSG:4326")
    ddf['coord'] = ddf.apply(lambda x: list(transformer.transform(x["Latitude"], x["Longitude"])), axis=1, meta=(None, 'object'))
    ddf = ddf.assign(latitude=ddf.coord.map(lambda x: x[0]), longitude=ddf.coord.map(lambda x: x[1]))

    # Drop original coordinate columns
    ddf = ddf.drop(["coord", "Latitude", "Longitude"], axis=1)

    # Extract weekday and add as column
    ddf["weekday"] = ddf.datetime.dt.weekday.astype(str).replace(
        {
            "0": "Monday",
            "1": "Tuesday",
            "2": "Wednesday",
            "3": "Thursday",
            "4": "Friday",
            "5": "Saturday",
            "6": "Sunday",
        }
    )

    # Set fine amount as int
    ddf["fine_amount"] = ddf.fine_amount.astype(int)

    # Drop filtered index and add new one
    ddf = ddf.reset_index(drop=True)
    
    if not is_file_updated("PROCESSED_CSV_FILEPATH"):
        # Save to CSV
        PROCESSED_CSV_FILEPATH = PROJECT_DIR / output_filedir / (target_file.stem.replace("_raw", "_processed") + ".csv")
        print("Creating processed CSV...")
        with ProgressBar():
            ddf.to_csv(PROCESSED_CSV_FILEPATH, single_file = True)
        print("Successfully saved processed CSV to {}".format(PROCESSED_CSV_FILEPATH))

        # Save csv file path as PROCESSED_CSV_FILEPATH into .env
        set_key(find_dotenv(), "PROCESSED_CSV_FILEPATH", str(PROCESSED_CSV_FILEPATH))
    else:
        print("CSV is already processed. It is located at {}".format(os.environ.get("PROCESSED_CSV_FILEPATH")))

    PROCESSED_PARQUET_FILEPATH = PROJECT_DIR / output_filedir / (target_file.stem.replace("_raw", "_processed") + ".parquet")
    if not is_file_updated("PROCESSED_PARQUET_FILEPATH"):
        # Save to PARQUET
        PROCESSED_PARQUET_FILEPATH = PROJECT_DIR / output_filedir / (target_file.stem.replace("_raw", "_processed") + ".parquet")
        print("Creating processed PARQUET...")
        with ProgressBar():
            ddf.to_parquet(PROCESSED_PARQUET_FILEPATH)
        print("Successfully saved processed PARQUET to {}".format(PROCESSED_PARQUET_FILEPATH))

        # Save parquet file path as PROCESSED_PARQUET_FILEPATH into .env
        set_key(find_dotenv(), "PROCESSED_PARQUET_FILEPATH", str(PROCESSED_PARQUET_FILEPATH))
    else:
        print("PARQUET is already processed. It is located at {}".format(os.environ.get("PROCESSED_PARQUET_FILEPATH")))


def is_file_updated(filename):
    if find_dotenv():
        load_dotenv(find_dotenv())
    if os.environ.get(filename):
        if latest_update in os.environ.get(filename):
            return True
    return False


if __name__ == "__main__":
    # log_fmt = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    # logging.basicConfig(level=logging.INFO, format=log_fmt)

    # find .env automagically by walking up directories until it's found, then
    # load up the .env entries as environment variables
    if find_dotenv():
        load_dotenv(find_dotenv())
    else:
        with open(PROJECT_DIR / ".env", "w"):
            pass
    # Create data folders
    data_folders = ["raw", "interim", "external", "processed"]
    if not os.path.exists(PROJECT_DIR / "data"):
        os.makedirs(PROJECT_DIR / "data")
    for _ in data_folders:
        if not os.path.exists(PROJECT_DIR / "data" / _):
            os.makedirs(PROJECT_DIR / "data" / _)
            with open(PROJECT_DIR / "data" / _ / ".gitkeep", "w"):
                pass

    # Run main function
    # logger = logging.getLogger(__name__)
    # logger.info(
    #     'Starting download of raw dataset: this will take a few minutes'
    # )
    main()
    # logger.info('Finished downloading!')
