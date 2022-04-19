# -*- coding: utf-8 -*-
import click
from pathlib import Path
import os
from make_dataset import clean, create_sample
import platform
import glob


# Load project directory
PROJECT_DIR = Path(__file__).resolve().parents[2]

@click.command()
@click.argument("frac", type=click.FLOAT)
@click.argument("cleaned", type=click.BOOL)
def main(frac: float, cleaned: bool):
    """Resamples and cleanes dataset using last download raw dataset.
    """
    try:
        raw_file_list = glob.glob(PROJECT_DIR / 'data/raw/*.csv')
        if raw_file_list:
            RAW_DATA_FILEPATH = max(raw_file_list, key=os.path.getctime)
            if cleaned:
                clean(
                    create_sample(RAW_DATA_FILEPATH, "data/interim", frac),
                    "data/processed")
            else:
                create_sample(RAW_DATA_FILEPATH, "data/interim", frac)
    except:
        print('No raw data. Try make data.')

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
