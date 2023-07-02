# -*- coding: utf-8 -*-
import click
from pathlib import Path
from dotenv import find_dotenv, load_dotenv
import os
from make_dataset import clean, create_sample
# Load project directory
PROJECT_DIR = Path(__file__).resolve().parents[2]

@click.command()
@click.argument("frac", type=click.FLOAT)
@click.argument("cleaned", type=click.BOOL)
def main(frac: float, cleaned: bool):
    """Downloads full dataset from lacity.org, and runs data processing
    scripts to turn raw data into cleaned data ready
    to be analyzed.
    """
    raw_list = [_ for _ in (PROJECT_DIR / "data" /  "raw").glob("*.csv")]
    RAW_DATA_FILEPATH = raw_list[0]

    if cleaned:
        clean(
            create_sample(RAW_DATA_FILEPATH, "data/interim", frac),
            "data/processed")
    else:
        create_sample(RAW_DATA_FILEPATH, "data/interim", frac)


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
