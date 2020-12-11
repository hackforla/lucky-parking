# -*- coding: utf-8 -*-
import click
import logging
from pathlib import Path
from dotenv import find_dotenv, load_dotenv
import urllib3
import shutil
import os
from datetime import date


@click.command()
@click.argument('input_filepath', type=click.Path(exists=True))
@click.argument('output_filepath', type=click.Path())
def main(input_filepath, output_filepath):
    """ Runs data processing scripts to turn raw data from (../raw) into
        cleaned data ready to be analyzed (saved in ../processed).
    """
    logger = logging.getLogger(__name__)
    logger.info('making final data set from raw data')


if __name__ == '__main__':
    log_fmt = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    logging.basicConfig(level=logging.INFO, format=log_fmt)

    # not used in this stub but often useful for finding various files
    project_dir = Path(__file__).resolve().parents[2]

    # find .env automagically by walking up directories until it's found, then
    # load up the .env entries as environment variables
    load_dotenv(find_dotenv())

    # Create data folders and download raw citation data
    date_string = date.today().strftime("%Y-%m-%d")
    data_folders = ['raw', 'interm', 'external', 'processed']
    if not os.path.exists(project_dir / 'data'):
        os.makedirs(project_dir / 'data')
    for _ in data_folders:
        if not os.path.exists(project_dir / 'data' / _):
            os.makedirs(project_dir / 'data' / _)
    http = urllib3.PoolManager()
    url = 'https://data.lacity.org/api/views/' +\
        'wjz9-h9np/rows.csv?accessType=DOWNLOAD'
    RAW_DATA_FILEPATH = project_dir.__str__() + '/data/raw/' +\
        date_string + '_raw.csv'
    with http.request('GET', url, preload_content=False) as res,\
            open(RAW_DATA_FILEPATH, 'wb') as out_file:
        shutil.copyfileobj(res, out_file)

    # Save raw file path as RAW_DATA_FILEPATH
    with open(project_dir / ".env", "a") as f:
        f.write(f"RAW_DATA_FILEPATH='{RAW_DATA_FILEPATH}'")

    main()
