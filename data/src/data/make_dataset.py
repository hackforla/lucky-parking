# -*- coding: utf-8 -*-
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
    """Downloads full dataset from lacity.org, and runs data processing
    scripts to turn raw data into cleaned data ready
    to be analyzed. Also updates environmental
    variable RAW_DATA_FILEPATH.
    """
    # If run as main, data is downloaded,  10% sampled, and cleaned
    # If fails, it samples already downloaded data and samples at 1%, then cleans
    # Create name string using download date
    raw_list = [_ for _ in (PROJECT_DIR / "data" /  "raw").glob("*.csv")]
    try:
        if raw_list:
            RAW_DATA_FILEPATH = raw_list[0]
        else:
            RAW_DATA_FILEPATH = download_raw(input_filedir)
        clean(
            create_sample(RAW_DATA_FILEPATH, "data/interim", 0.01),
            output_filedir,
        )
    except:
        print("Failed")


def download_raw(input_filedir: Union[Path, str]) -> Path:
    """Downloads raw dataset from lacity.org to input_filedir as {date}
    raw.csv. Also updates environmental variable RAW_DATA_FILEPATH.
    """


    print("This will take a few minutes")
    # Create name string using download date
    date_string = date.today().strftime("%Y-%m-%d")
    # Setup connection and download into raw data folder
    http = urllib3.PoolManager()
    url = "https://data.lacity.org/api/views/wjz9-h9np/rows.csv?accessType=DOWNLOAD"
    RAW_DATA_FILEPATH = PROJECT_DIR / input_filedir / (date_string + "_raw.csv")
    with http.request("GET", url, preload_content=False) as res, open(
        RAW_DATA_FILEPATH, "wb"
    ) as out_file:
        shutil.copyfileobj(res, out_file)

    print("Finished downloading raw dataset")


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
        skiprows=lambda i: i > 0 and random.random() > sample_frac,
        low_memory=False,
    ).to_csv(SAMPLE_FILEPATH, index=False)

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
            "Ticket number",
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

    # Filter out data points with bad coordinates
    df = df[(df.Latitude != 99999) & (df.Longitude != 99999)]

    # Filter out data points with no time/date stamps
    df = df[
        (df["Issue Date"].notna())
        & (df["Issue time"].notna())
        & (df["Fine amount"].notna())
    ]

    # Convert Issue time and Issue Date strings into a combined datetime type
    df["Issue time"] = df["Issue time"].apply(
        lambda x: "0" * (4 - len(str(int(x)))) + str(int(x))
    )
    df["Datetime"] = pd.to_datetime(
        df["Issue Date"] + " " + df["Issue time"], format="%m/%d/%Y %H%M"
    )

    # Drop original date/time columns
    df = df.drop(["Issue Date", "Issue time"], axis=1)

    # Make column names more coding friendly except for Lat/Lon
    df.columns = [
        "ticket_number",
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
    for row in make_df.itertuples():
        df = df.replace(row[2], row[1])

    # Car makes to keep (Top 70 by count)
    make_list = [
        "Toyota",
        "Honda",
        "Ford",
        "Nissan",
        "Chevrolet",
        "BMW",
        "Mercedes Benz",
        "Volkswagen",
        "Hyundai",
        "Dodge",
        "Lexus",
        "Kia",
        "Jeep",
        "Audi",
        "Mazda",
        "Other",
        "GMC",
        "Infinity",
        "Chrysler",
        "Subaru",
        "Acura",
        "Volvo",
        "Land Rover",
        "Mitsubishi",
        "Cadillac",
        "Mini",
        "Porsche",
        "Unknown",
        "Buick",
        "Freightliner",
        "Tesla",
        "Lincoln",
        "Saturn",
        "Pontiac",
        "Grumman",
        "Fiat",
        "Jaguar",
        "Mercury",
        "Isuzu",
        "International",
        "Suzuki",
        "Saab",
        "Oldsmobile",
        "Maserati",
        "Peterbuilt",
        "Kenworth",
        "Smart",
        "Plymouth",
        "Hino",
        "Harley-Davidson",
        "Alfa Romero",
        "Hummer",
        "Bentley",
        "Yamaha",
        "Kawasaki",
        "Geo Metro",
        "Winnebago",
        "Rolls-Royce",
        "Scion",
        "Triumph",
        "Checker",
        "Datsun",
        "Ferrari",
        "Sterling",
        "Lamborghini",
        "Aston Martin",
        "Daewoo",
        "Merkur",
        "Mack",
        "CIMC",
    ]

    # Turn all other makes into "MISC."
    df.loc[~df.make.isin(make_list), "make"] = "MISC."
    make_list.append("MISC.")

    # Enumerate list of car makes and replace with keys
    make_dict = {make: ind for ind, make in enumerate(make_list)}
    df["make_ind"] = df.make.replace(make_dict)

    # Instantiate projection converter and change projection
    transformer = Transformer.from_crs("EPSG:2229", "EPSG:4326")
    df["latitude"], df["longitude"] = transformer.transform(
        df["Latitude"].values, df["Longitude"].values
    )

    # Drop original coordinate columns
    df = df.drop(["Latitude", "Longitude"], axis=1)
    # df.reset_index(drop=True,inplace=True)
    # df.drop('Ticket number', axis=1)

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
