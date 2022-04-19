# -*- coding: utf-8 -*-
import click
from pathlib import Path
import glob
import os
from make_dataset import clean, create_sample

# Load project directory
PROJECT_DIR = Path(__file__).resolve().parents[2]


@click.command()
@click.argument("frac", type=click.FLOAT)
def main(frac: float):
    """Creates sample from "frac" and outputs geojson file
    """
    try:
        # Load newest raw data file
        raw_file_list = glob.glob(PROJECT_DIR / 'data/raw/*.csv')
        if raw_file_list:
            RAW_DATA_FILEPATH = max(
                glob.glob(PROJECT_DIR / 'data/raw/*.csv', key=os.path.getctime))
            clean(
                create_sample(RAW_DATA_FILEPATH,
                              "data/interim", frac),
                "data/processed",
                geojson=True,
            )
    except:
        print('No raw data. Try make data.')

if __name__ == "__main__":
    main()
