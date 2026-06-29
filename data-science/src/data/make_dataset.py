#!/usr/bin/env conda run -n citation-analysis python

from contextlib import contextmanager
import click
from pathlib import Path
import urllib3
import shutil
import os
import csv
import datetime
from datetime import date
import time
import pandas as pd
import random
import io
import json
from pyproj import Transformer
from typing import Union
from multiprocessing import Process, Event
import signal


import geopandas as gpd
from shapely.geometry import Point
from pandas.api.types import is_numeric_dtype

"""
Downloads full dataset from lacity.org, and runs data processing
scripts to turn raw data into cleaned data ready
to be analyzed.

Sample usage:
    python src/data/make_dataset.py --input_filedir data/external --output_filedir data/processed --download_input
    python src/data/make_dataset.py --input_filedir data/external --output_filedir data/processed
    python src/data/make_dataset.py --input_filedir data/external/2026-06-22_raw.csv --output_filedir data/processed
"""

# Load project directory
PROJECT_DIR = Path(os.path.abspath(__file__).replace(
    '\\', '/')).resolve().parents[2]

INTERIM_DIR = PROJECT_DIR / "data" / "interim"
SKIP_RATE = 1  # Fraction of data to keep when creating sample dataset
CHUNK_SIZE = 100000


@click.command()
@click.option("-i", "--input_filedir", type=click.Path(), default=None)
@click.option("-o", "--output_filedir", type=click.Path(), default=None)
@click.option("-d", "--download_input", is_flag=True, default=False)
def main(input_filedir: str, output_filedir: str, download_input: bool):
    
    if download_input:
        # Make a new file or replace the existing one with the latest data
        raw_filepath = download_raw(input_filedir)
    elif os.path.isdir(input_filedir):
        # Load the latest file in the input directory
        latest_filename = sorted(os.listdir(input_filedir), key=lambda x: os.path.getmtime(os.path.join(input_filedir, x)))[-1]
        raw_filepath = os.path.join(input_filedir, latest_filename)
    else:
        # Load from the specified input file path
        raw_filepath = Path(input_filedir) / f"{date.today().strftime('%Y-%m-%d')}_raw.csv"
        if raw_filepath.exists():
            # Add minutes and seconds to the filename if the file already exists
            raw_filepath = Path(input_filedir) / f"{date.today().strftime('%Y-%m-%d_%H-%M-%S')}_raw.csv"

    interim_path = create_sample(raw_filepath, INTERIM_DIR, SKIP_RATE)
    clean(interim_path, output_filedir)

def watchdog(target_pid, seconds, timeout_triggered_event):
    """Sits in the background and waits. If time expires, kills the parent."""
    time.sleep(seconds)
    if not timeout_triggered_event.is_set():
        timeout_triggered_event.set()
        # On Windows, taskkill is used under the hood; on Unix, SIGTERM
        os.kill(target_pid, signal.SIGTERM)

@contextmanager
def multiprocessing_timeout(seconds):
    # Event to communicate between main process and watchdog
    timeout_triggered = Event()
    parent_pid = os.getpid()
    
    # Start the watchdog process
    p = Process(target=watchdog, args=(parent_pid, seconds, timeout_triggered))
    p.start()
    
    try:
        yield
    except ProcessLookupError:
        # Catching potential OS errors during termination
        pass
    finally:
        # Clean up the watchdog process if the block finishes on time
        if p.is_alive():
            p.terminate()
            p.join()
        
        # If the watchdog fired, raise the TimeoutError to the user
        if timeout_triggered.is_set():
            raise TimeoutError(f"Code block exceeded timeout of {seconds} seconds")

def download_raw(input_filedir: str) -> Path:
    """Downloads raw dataset from lacity.org to input_filedir as {date}
    raw.csv. Also updates environmental variable RAW_DATA_FILEPATH.
    """
    # Create name string using download date
    date_string = date.today().strftime("%Y-%m-%d")
    RAW_DATA_FILEPATH = PROJECT_DIR / \
        input_filedir / (date_string + "_raw.csv")

    # If raw file already exists, then it doesn't download
    if RAW_DATA_FILEPATH.is_file():
        print('Raw file already exists')

    else:

        print("This will take a few minutes")

        # Setup connection and download into raw data folder
        http = urllib3.PoolManager()
        # https://data.lacity.org/Transportation/Parking-Citations/4f5p-udkv/about_data
        url_template = "https://data.lacity.org/resource/4f5p-udkv.json?$offset=%s"

        page = 0
        error_count = 0
        with open(RAW_DATA_FILEPATH, "a") as out_file:
            while True:
                with multiprocessing_timeout(seconds=5):
                    with http.request("GET", url_template % (1000 * page), preload_content=False) as res:
                        raw_data = res.read()
                time.sleep(0.1) # To avoid overwhelming the server
                
                if "internal error" in raw_data.decode('utf-8').lower():
                    error_count += 1
                    print(f"Error encountered on page {page}, retrying... (Error count: {error_count})")
                    if error_count > 20:
                        print("Too many errors, stopping download.")
                        break
                    else:
                        continue
                data_list = json.loads(raw_data.decode('utf-8'))
                df = pd.json_normalize(data_list)
                
                out_file.write(df.to_csv(index=False, lineterminator="\n"))
                page += 1

                if page % 1000 == 0:
                    print(f"Downloaded {page * 1000} records...")

        print("Finished downloading raw dataset")

    return RAW_DATA_FILEPATH


def create_sample(
        interim_file: Union[Path, str],
        output_filedir: str,
        sample_frac: float) -> Path:
    """Samples the raw dataset to create a smaller dataset via random
    sampling according to sample_frac.
    """
    # Change str filepath into Path
    if isinstance(interim_file, str):
        interim_file = Path(interim_file)

    # Check if sample_frac is between 0 and 1
    assert (sample_frac <= 1) and (sample_frac > 0)

    # Create filename with sample fraction appended to the name
    # 0.1 turns into 01, 0.25 turns into 025, etc
    SAMPLE_FILEPATH = (
        PROJECT_DIR
        / output_filedir
        / (interim_file.stem + "_" + str(sample_frac).replace(".", "") + "samp.csv")
    )

    # If raw file already exists, then it doesn't download
    if SAMPLE_FILEPATH.is_file():
        print('Sampled file already exists')

    else:
        print(f"Creating {sample_frac * 100}% sample")

        # Read raw data and skiprows using random.random()
        pd.read_csv(
            interim_file,
            header=0,
            index_col=0,
            skiprows=lambda i: i > 0 and random.random() > sample_frac,
            low_memory=False,
        ).reset_index(drop=True).to_csv(SAMPLE_FILEPATH, index=False)

        print("Sample complete")

    return SAMPLE_FILEPATH


def isvalid(time: str) -> bool:
    if pd.isna(time):
        return False
    time = str(time)
    if type(time) != str:
        return False
    if len(time) < 3:
        return False
    if not time.isdigit():
        return False
    if int(time[-2:]) > 59:
        return False
    if int(time[:-2]) > 23:
        return False
    return True

def splittime(time: int) -> tuple[str, str] | tuple[None, None]:
    time = str(time).rjust(4, '0')
    return time[:len(time)-2], time[-2:]

def create_datetime(row):
    time_val = row['issue_time']
    if isvalid(time_val):
        time_str = str(int(float(time_val))).rjust(4, '0') # Handles floats/ints cleanly
        # date = row["issue_date"]
        hours = int(time_str[:-2])
        minutes = int(time_str[-2:])
    
        # Combine date with the calculated time
        date_part = row['issue_date'].split()[0]
        return pd.to_datetime(date_part).replace(hour=hours, minute=minutes)
    else:
        return pd.to_datetime(row['issue_date'])

def clean(target_file: Union[Path, str], output_filedir: str, geojson=False):
    """Removes unnecessary columns, erroneous data points and aliases,
    changes geometry projection from epsg:2229 to epsg:4326, and converts
    time to datetime type.
    """
    # Change str filepath into Path
    if isinstance(target_file, str):
        target_file = Path(target_file)

    print("Cleaning dataset")

    # Read file into dataframe
    df = pd.read_csv(target_file, low_memory=False)

    # Select columns of interest
    
    translation_dict = { "issue_date": "Issue Date", 
               "issue_time": "Issue time", 
               "rp_state_plate": "RP State Plate", 
               "make": "Make", 
               "body_style": "Body Style", 
               "color": "Color", 
               "location": "Location", 
               "violation_code": 
               "Violation code", 
               "violation_description": "Violation Description", 
               "fine_amount": "Fine amount", 
               "loc_lat": "Latitude", 
               "loc_long": "Longitude" }
    
    df.rename(columns=translation_dict, inplace=True)

    try:

        df = df[
            [
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
        ]
    except KeyError as e:
        print(f"Error: Missing expected column {e}. Please check the raw dataset for changes in column names.")
        raise

    # Make column names more coding friendly
    df.columns = [_.lower().replace(' ', '_') for _ in df.columns]

    # Convert columns to numeric, turning invalid values into NaN
    df['latitude'] = pd.to_numeric(df['latitude'], errors='coerce')
    df['longitude'] = pd.to_numeric(df['longitude'], errors='coerce')

    # Drop any rows that failed to convert (became NaN)
    df = df.dropna(subset=['latitude', 'longitude'])

    # Instantiate projection converter and change projection
    transformer = Transformer.from_crs("EPSG:2229", "EPSG:4326")
    df["lat"], df["lon"] = transformer.transform(
        df["latitude"].values, df["longitude"].values
    )

    # Filter out data points with bad coordinates
    df = df[(df['lat'] != 99999) & (df['lon'] != 99999)]

    df = df[
        (df['lat'] > 33.6) & (df['lat'] < 34.4) & 
        (df['lon'] > -118.7) & (df['lon'] < -118.1)
        ]
    
    # Filter out data points with no time/date stamps
    df = df[
        (df["issue_date"].notna())
        & (df["issue_time"].notna())
        & (df["fine_amount"].notna())
    ]

    df['datetime'] = df.apply(create_datetime, axis=1)

    # Drop original date/time columns
    df = df.drop(["issue_date", "issue_time"], axis=1)

    # Read in make aliases
    make_df = pd.read_csv(PROJECT_DIR / "references/make.csv", delimiter=",")
    make_df["alias"] = make_df.alias.apply(lambda x: x.split(","))

    # Iterate over makes and replace aliases
    for row in make_df.itertuples():
        df = df.replace(row[2], row[1])

    # Car makes to keep (Top 70 by count)
    with open(PROJECT_DIR / 'references/top_makes.txt', 'r') as file:
        make_list = [_.strip('\n') for _ in file.readlines()]

    # Turn all other makes into "MISC."
    df.loc[~df.make.isin(make_list), "make"] = "MISC."
    make_list.append("MISC.")

    # Read in violation regex rules
    vio_regex = pd.read_csv(
        PROJECT_DIR / "references/vio_regex.csv", delimiter=",")

    # Iterate over makes and replace aliases
    for key in vio_regex.itertuples():
        df.loc[df["violation_code"] == row[1],
               "violation_description"] = row[2]

    # Enumerate list of car makes and replace with keys
    make_dict = {make: ind for ind, make in enumerate(make_list)}
    df["make_ind"] = df.make.replace(make_dict)

    # Drop original coordinate columns
    df = df.drop(["latitude", "longitude"], axis=1)

    df["datetime"] = pd.to_datetime(df.datetime)

    # Extract weekday and add as column
    df["weekday"] = df['datetime'].dt.day_name()

    # Set fine amount as int
    df["fine_amount"] = df.fine_amount.astype(int)

    # Drop filtered index and add new one
    df.reset_index(inplace=True)

    # To keep compatibility with website
    df.rename(columns={"lat": "latitude", "lon": "longitude",
              "rp_state_plate": "state_plate"}, inplace=True)

    if geojson:
        destination = (PROJECT_DIR
            / output_filedir
            / (target_file.stem.replace("_raw", "_processed") + ".geojson"))
        gpd.GeoDataFrame(
            df,
            crs="EPSG:4326",
            geometry=[Point(xy) for xy in zip(df.latitude, df.longitude)],
        ).to_file(
            destination,
            driver="GeoJSON",
        )
        return print("Saved as geojson as %s" % destination)

    else:
        destination = (PROJECT_DIR
            / output_filedir
            / (target_file.stem.replace("_raw", "_processed") + ".csv"))
        df.to_csv(
            destination,
            index=False,
            quoting=csv.QUOTE_ALL,
        )
        return print("Saved to csv as %s" % destination)


if __name__ == "__main__":
    # log_fmt = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    # logging.basicConfig(level=logging.INFO, format=log_fmt)

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
