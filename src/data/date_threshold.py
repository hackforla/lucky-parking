# -*- coding: utf-8 -*-
import click
from pathlib import Path
from dotenv import find_dotenv, load_dotenv
import os
import pandas as pd
from pathlib import Path
from make_dataset import clean, create_sample

# Load project directory
PROJECT_DIR = Path(__file__).resolve().parents[2]

@click.command()
@click.argument("date_threshold", type=click.STRING)
def main(date_threshold: str):
    """Filters raw dataset by date threshold, only returning records
    from date threshold to latest records using input in the form of
    month-day-year saved as a geojson to data/processed folder.
    """
    df = pd.read_csv(RAW_DATA_FILEPATH, usecols=['Issue Date'])
    df['Issue Date'] = pd.to_datetime(df['Issue Date'], format="%m/%d/%Y")
    date_stamp = pd.Timestamp(date_threshold)
    
    skip_index = df[df['Issue Date'] < date_stamp].index.to_list()[1:]
    date_threshold = date_stamp.dt.strftime('%Y-%m-%d')
    file_name = PROJECT_DIR / 'data/interim' / (date_threshold +'_dt_raw.csv')
    del df
    
    pd.read_csv(RAW_DATA_FILEPATH, skiprows=skip_index).to_csv(file_name)

    clean(file_name,"data/processed", geojson=True)


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
