#!/usr/bin/env conda run -n citation-analysis python
import click
from pathlib import Path
import os
import csv
import pandas as pd
from pyproj import Transformer
from typing import Union
import geopandas as gpd
from shapely.geometry import Point

# Load project directory
PROJECT_DIR = Path(os.path.abspath(__file__).replace(
    '\\', '/')).resolve().parents[2]


@click.command()
@click.argument("output_filedir", type=click.Path())
@click.argument("geo", type=click.BOOL)
def main(output_filedir: str, geo: bool):
    """Cleans and serializes more of the dataset to speed uploading time"""
    # Load newest raw data file
    raw_file_list = (PROJECT_DIR / 'data/interim').rglob('*.csv')
    if raw_file_list:
        serial_clean(max(raw_file_list, key=os.path.getctime),
                     (PROJECT_DIR / 'data/processed'), geojson=geo)
    else:
        print('Run make data first!')


def serial_clean(target_file: Union[Path, str], output_filedir: str, geojson: bool):
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
    df.columns = [_.lower().replace(' ', '_') for _ in df.columns]

    # Filter out data points with no time/date stamps
    df = df[
        (df["issue_date"].notna())
        & (df["issue_time"].notna())
        & (df["fine_amount"].notna())
    ]

    # Filter out data points with bad coordinates
    df = df[(df.latitude != 99999) & (df.longitude != 99999)]

    # Filter out bad coordinates
    df = df[
        (df['latitude'] < 6561666.667) &
        (df['latitude'] > 6332985.07046223) &
        (df['longitude'] < 2004341.8099511159) &
        (df['longitude'] > 1641269.8177664774)
    ]

    # Convert Issue time and Issue Date strings into a combined datetime type
    df["issue_time"] = df["issue_time"].apply(
        lambda x: "0" * (4 - len(str(int(x)))) + str(int(x))
    )
    df["datetime"] = pd.to_datetime(
        df["issue_date"] + " " + df["issue_time"], format="%m/%d/%Y %H%M", errors='coerce'
    )
    # Create shortened date string
    df["datetimestr"] = df["datetime"].dt.strftime('%Y%m%d%H%M')

    # Extract weekday and add as column
    df["weekday"] = df["datetime"].dt.weekday.astype(int)

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
    df.loc[~df.make.isin(make_list), "make"] = "MISC"
    make_list.append("MISC")

    # Enumerate list of car makes and replace with keys
    make_dict = {make: ind for ind, make in enumerate(make_list)}
    df["make_ind"] = df.make.replace(make_dict)

    # Read in violation regex rules
    vio_regex = pd.read_csv(
        PROJECT_DIR / "references/vio_regex.csv", delimiter=",")

    # Iterate over makes and replace aliases
    for row in vio_regex.itertuples():
        df = df.replace(row[2], row[1])

    # Top violations to keep (Top 59 by count)
    with open(PROJECT_DIR / 'references/top_violations.txt', 'r') as file:
        vio_desc_list = [_.strip('\n') for _ in file.readlines()]

    # Turn all other violations into "MISC."
    df.loc[~df.violation_description.isin(
        vio_desc_list), "violation_description"] = "MISC"
    vio_desc_list.append("MISC")

    # Enumerate list of violations and replace with keys
    vio_desc_dict = {vio_d: ind for ind, vio_d in enumerate(vio_desc_list)}
    df["vio_desc_ind"] = df.violation_description.replace(vio_desc_dict)

    # Top violation codes to keep (Top 60 by count)
    with open(PROJECT_DIR / 'references/top_violation_codes.txt', 'r') as file:
        vio_code_list = [_.strip('\n') for _ in file.readlines()]

    # Turn all other violation codes into "MISC."
    df.loc[~df.violation_code.isin(vio_code_list), "violation_code"] = "MISC"
    vio_code_list.append("MISC")

    # Enumerate list of violation codes and replace with keys
    vio_code_dict = {vio_c: ind for ind, vio_c in enumerate(vio_code_list)}
    df["vio_code_ind"] = df.violation_code.replace(vio_code_dict)

    # Instantiate projection converter and change projection
    transformer = Transformer.from_crs("EPSG:2229", "EPSG:4326")
    df["lat"], df["lon"] = transformer.transform(
        df["latitude"].values, df["longitude"].values
    )

    # Round the coordinates
    df[['lat', 'lon']] = df[['lat', 'lon']].round(5)

    # Create geometry column
    df['geometry'] = [Point(xy) for xy in zip(df['lon'], df['lat'])]

    # Save date string as datetime
    df["datetime"] = df["datetimestr"]

    # Drop original coordinate columns and datetimestr
    df = df.drop(["latitude", "longitude", "datetimestr"], axis=1)

    # Set fine amount as int
    df["fine_amount"] = df["fine_amount"].astype(int)

    # Drop filtered index and add new one
    df.reset_index(drop=True, inplace=True)

    # To keep compatibility with website
    df.rename(columns={"rp_state_plate": "state_plate"}, inplace=True)

    # Drop original columns
    df = df.drop(["make",
                  "violation_code",
                  "violation_description",
                  "lat",
                  'lon'],
                 axis=1
                 )

    # Column serialization
    column_dict = {colname: str(colind)         # Geopandas only accepted strings as column names
                   for colind, colname in enumerate(df.columns)}
    df.rename(columns=column_dict, inplace=True)

    # Writing the serialization documentation
    with open(PROJECT_DIR / 'references/serial_key_values.txt', 'w', encoding='utf-8') as f:
        for _ in [column_dict, make_dict, vio_desc_dict, vio_code_dict]:
            f.write(('\n'.join(str((k, v)).strip(r'\)\(')
                    for v, k in _.items())))
            f.write("\n\n")

    if geojson:
        gpd.GeoDataFrame(
            df,
            crs="EPSG:4326",
            geometry=df.columns[-1],  # Picks last column as geometry
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

    # Run main function
    # logger = logging.getLogger(__name__)
    # logger.info(
    #     'Starting download of raw dataset: this will take a few minutes'
    # )
    main()
    # logger.info('Finished downloading!')
