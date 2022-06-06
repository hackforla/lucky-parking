# -*- coding: utf-8 -*-
import click
from pathlib import Path
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
PROJECT_DIR = Path(os.path.abspath(__file__).replace('\\', '/')).resolve().parents[2]


@click.command()
@click.argument("input_filedir", type=click.Path(exists=True))
@click.argument("output_filedir", type=click.Path())
def main(input_filedir: str, output_filedir: str):
    """
    Downloads full dataset from lacity.org, and runs data processing
    scripts to turn raw data into cleaned data ready
    to be analyzed. 
    """
    try: 
        clean(
            create_sample(download_raw(input_filedir), "data/interim", 0.01),
            output_filedir,
        )
    except Exception as e: 
        print(e.message, e.args)


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
        url = "https://data.lacity.org/api/views/wjz9-h9np/rows.csv?accessType=DOWNLOAD"
        with http.request("GET", url, preload_content=False) as res, open(
            RAW_DATA_FILEPATH, "wb"
        ) as out_file:
            shutil.copyfileobj(res, out_file)

        print("Finished downloading raw dataset")

    return RAW_DATA_FILEPATH


def create_sample(
        target_file: Union[Path, str],
        output_filedir: str,
        sample_frac: float) -> Path:
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

    # If raw file already exists, then it doesn't download
    if SAMPLE_FILEPATH.is_file():
        print('Sampled file already exists')

    else:
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

    # Make column names more coding friendly 
    df.columns = [_.lower().replace(' ','_') for _ in df.columns]

    # Filter out data points with bad coordinates
    df = df[(df['latitude'] != 99999) & (df['longitude'] != 99999)]

    # Filter out bad coordinates
    df = df[
        (df['latitude'] < 6561666.667) &
        (df['latitude'] > 6332985.07046223) &
        (df['longitude'] < 2004341.8099511159) &
        (df['longitude'] > 1641269.8177664774)
    ]
    # Filter out data points with no time/date stamps
    df = df[
        (df["issue_date"].notna())
        & (df["issue_time"].notna())
        & (df["fine_amount"].notna())
    ]

    # Convert Issue time and Issue Date strings into a combined datetime type
    df["issue_time"] = df["issue_time"].apply(
        lambda x: "0" * (4 - len(str(int(x)))) + str(int(x))
    )
    df["datetime"] = pd.to_datetime(
        df["issue_date"] + " " + df["issue_time"], format="%m/%d/%Y %H%M"
    )

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
    vio_regex = pd.read_csv(PROJECT_DIR / "references/vio_regex.csv", delimiter=",")

    # Iterate over makes and replace aliases
    for key in vio_regex.itertuples():
        df.loc[df["violation_code"] == row[1], "violation_description"] = row[2]

    # Enumerate list of car makes and replace with keys
    make_dict = {make: ind for ind, make in enumerate(make_list)}
    df["make_ind"] = df.make.replace(make_dict)

    # Instantiate projection converter and change projection
    transformer = Transformer.from_crs("EPSG:2229", "EPSG:4326")
    df["lat"], df["lon"] = transformer.transform(
        df["latitude"].values, df["longitude"].values
    )

    # Drop original coordinate columns
    df = df.drop(["latitude", "longitude"], axis=1)

    # Extract weekday and add as column
    df["weekday"] = df.datetime.dt.weekday.astype(str).replace(
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
    df["fine_amount"] = df.fine_amount.astype(int)

    # Drop filtered index and add new one
    df.reset_index(inplace=True)

    # To keep compatibility with website
    df.rename(columns={"lat": "latitude", "lon": "longitude", "rp_state_plate": "state_plate"}, inplace=True)
    
    if geojson:
        gpd.GeoDataFrame(
            df,
            crs="EPSG:4326",
            geometry=[Point(xy) for xy in zip(df.latitude, df.longitude)],
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
