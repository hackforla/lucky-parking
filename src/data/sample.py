# -*- coding: utf-8 -*-
import click
from pathlib import Path
from dotenv import find_dotenv, load_dotenv
import os
from make_dataset import clean, create_sample
import platform


@click.command()
@click.argument("frac", type=click.FLOAT)
@click.argument("cleaned", type=click.BOOL)
def main(frac: float, cleaned: bool):
    """Resamples and cleanes dataset using last download raw dataset.
    """
    if cleaned:
        clean(
            create_sample(RAW_DATA_FILEPATH, "data/interim", frac),
            "data/processed")
    else:
        create_sample(RAW_DATA_FILEPATH, "data/interim", frac)


if __name__ == "__main__":
    # log_fmt = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    # logging.basicConfig(level=logging.INFO, format=log_fmt)

    # find .env automagically by walking up directories until it's found, then
    # load up the .env entries as environment variables
    load_dotenv(find_dotenv())
    RAW_DATA_FILEPATH = os.environ["RAW_DATA_FILEPATH"]

    # Run main function
    # logger = logging.getLogger(__name__)
    # logger.info(
    #     'Starting download of raw dataset: this will take a few minutes'
    # )
    main()
    # logger.info('Finished downloading!')
