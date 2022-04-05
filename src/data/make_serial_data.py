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
@click.argument("output_filedir", type=click.Path())
def main(output_filedir: str):
    """Cleans and serializes more of the dataset to speed uploading time"""
    # If run as main, data is downloaded,  10% sampled, and cleaned
    # If fails, it samples already downloaded data and samples at 1%, then cleans

    try:
        clean(
            SAMPLED_DATA_FILEPATH,
            output_filedir
        )
    except:
        print("Failed")


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
        #    "Location",
        #    "Violation code",
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
        "state_plate",
        "make",
        "body_style",
        "color",
    #    "location",
    #    "violation_code",
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
    df = df.drop(["Latitude", "Longitude", "make"], axis=1)
    # df.reset_index(drop=True,inplace=True)
    # df.drop('Ticket number', axis=1)

    # Filter out bad coordinates
    df = df[
        (df['latitude'] < 34.5) &
        (df['latitude'] > 33.5) &
        (df['longitude'] < -118) &
        (df['longitude'] > -118.75)
        ].reset_index(drop=True)
        
    # Extract weekday and add as column
    df["weekday"] = df.datetime.dt.weekday.astype(str)
    # Set fine amount as int
    df["fine_amount"] = df.fine_amount.astype(int)

    # Drop filtered index and add new one
    df.reset_index(drop=True, inplace=True)

    df.to_csv(
        PROJECT_DIR
        / output_filedir
        / (target_file.stem.replace("_raw", "_serialized") + ".csv"),
        index=False,
        quoting=csv.QUOTE_ALL,
    )

    return print("Saved as csv!")


if __name__ == "__main__":
    # log_fmt = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    # logging.basicConfig(level=logging.INFO, format=log_fmt)

    # find .env automagically by walking up directories until it's found, then
    # load up the .env entries as environment variables
    load_dotenv(find_dotenv())
    SAMPLED_DATA_FILEPATH = os.environ["SAMPLED_DATA_FILEPATH"]

    # Run main function
    # logger = logging.getLogger(__name__)
    # logger.info(
    #     'Starting download of raw dataset: this will take a few minutes'
    # )
    main()
    # logger.info('Finished downloading!')
