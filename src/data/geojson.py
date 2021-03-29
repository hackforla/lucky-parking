# -*- coding: utf-8 -*-
import click
from pathlib import Path
from dotenv import find_dotenv, load_dotenv
import os
from make_dataset import clean, create_sample


@click.command()
@click.argument("frac", type=click.FLOAT)
def main(frac: float):
    """Creates sample from "frac" and outputs geojson file
    """

    clean(
        create_sample(RAW_DATA_FILEPATH, "data/interim", frac),
        "data/processed",
        geojson=True,
    )


if __name__ == "__main__":
    load_dotenv(find_dotenv())
    RAW_DATA_FILEPATH = os.environ["RAW_DATA_FILEPATH"]
    main()
