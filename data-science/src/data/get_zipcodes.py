#!/usr/bin/env conda run -n citation-analysis python
import click
from pathlib import Path
from dotenv import find_dotenv, load_dotenv, set_key
import urllib3
import shutil
import os
import csv
from datetime import date
import pandas as pd
import random
from pyproj import Transformer
from typing import Union
import geopandas as gpd
from shapely.geometry import Point

# Load project directory
PROJECT_DIR = Path(__file__).resolve().parents[2]


@click.command()
@click.argument("input_filedir", type=click.Path(exists=True))
@click.argument("output_filedir", type=click.Path())
def main(input_filedir: str, output_filedir: str):
    """Downloads zipcodes from lacounty.gov, and runs data processing
    scripts to turn raw data into cleaned data ready
    to be analyzed. Also updates environmental
    variable RAW_DATA_FILEPATH.
    """
    # If run as main, data is downloaded,  10% sampled, and cleaned
    # If fails, it samples already downloaded data and samples at 1%, then cleans

    try:
        clean(
            create_sample(download_raw(input_filedir), "data/interim", 0.1),
            output_filedir,
        )
    except:
        print("Failed at 10% sampling, trying again")
        clean(create_sample(RAW_DATA_FILEPATH, output_filedir, 0.01), output_filedir)


def download_raw(input_filedir: str) -> Path:
    """Downloads zipcodes dataset from lacounty.gov to input_filedir as {date}
    raw.csv. Also updates environmental variable RAW_DATA_FILEPATH.
    """
    # Create name string using download date
    date_string = date.today().strftime("%Y-%m-%d")

    print("This will take a few minutes")

    # Setup connection and download into raw data folder
    http = urllib3.PoolManager()
    url = "https://data.lacounty.gov/api/views/dwvh-6kjy/rows.csv?accessType=DOWNLOAD"
    RAW_DATA_FILEPATH = PROJECT_DIR / input_filedir / ("zipcodes_raw.csv")
    with http.request("GET", url, preload_content=False) as res, open(
        RAW_DATA_FILEPATH, "wb"
    ) as out_file:
        shutil.copyfileobj(res, out_file)

    print("Finished downloading raw dataset")

    # Save raw file path as RAW_DATA_FILEPATH into .env
    set_key(find_dotenv(), "RAW_DATA_FILEPATH", str(RAW_DATA_FILEPATH))
    return RAW_DATA_FILEPATH


def create_sample(
    target_file: Union[Path, str], output_filedir: str, sample_frac: float
) -> Path:
    """Samples the raw dataset to create a smaller dataset via random
    sampling according to sample_frac.
    """
    # Change str filepath into Path
    if isinstance(target_file, str):
        target_file = Path(target_file)

    # Check if sample_frac is between 0 and 1
    assert (sample_frac <= 1) and (sample_frac > 0)

    # Create filename with sample fraction appended to the name
    # 0.1 turns into 01, 0.25 turns into 025, etc
    SAMPLE_FILEPATH = (
        PROJECT_DIR
        / output_filedir
        / (target_file.stem + "_" + str(sample_frac).replace(".", "") + "samp.csv")
    )

    print(f"Creating {sample_frac * 100}% sample")

    # Read raw data and skiprows using random.random()
    pd.read_csv(
        target_file,
        header=0,
        index_col=0,
        skiprows=lambda i: i > 0 and random.random() > sample_frac,
        low_memory=False,
    ).reset_index(drop=True).to_csv(SAMPLE_FILEPATH, index=False)

    print("Sample complete")

    return SAMPLE_FILEPATH


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
    df = df[
        [
            "OBJECTID",
            "ZIPCODE",
            "Shape_area",
            "Shape_len"
        ]
    ]

    # Make column names more coding friendly except for Lat/Lon
    df.columns = [
        "object_id",
        "zip",
        "Shape_area",
        "Shape_len"
    ]

    # Drop filtered index and add new one
    df.reset_index(drop=True, inplace=True)
    df.reset_index(inplace=True)

    if geojson:
        gpd.GeoDataFrame(
            df,
            crs="EPSG:4326",
            geometry=[Point(xy) for xy in zip(df.longitude, df.latitude)],
        ).to_file(
            PROJECT_DIR
            / output_filedir
            / (target_file.stem.replace("_raw", "_processed") + ".geojson"),
            driver="GeoJSON",
        )
        return print("Saved as geojson!")

    else:
        df.to_csv(
            PROJECT_DIR
            / output_filedir
            / (target_file.stem.replace("_raw", "_processed") + ".csv"),
            index=False,
            quoting=csv.QUOTE_ALL,
        )
        return print("Saved as csv!")


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
