# -*- coding: utf-8 -*-
import click
# import logging
from pathlib import Path
from dotenv import find_dotenv, load_dotenv
import os
from os.path import isfile
import praw
import pandas as pd
from time import sleep
from datetime import date

@click.command()
@click.argument('input_filepath', type=click.Path(exists=True))
@click.argument('output_filepath', type=click.Path())
def main(input_filepath, output_filepath):
    """ Runs data processing scripts to turn raw data from (../raw) into
        cleaned data ready to be analyzed (saved in ../processed).
    """
    reddit = praw.Reddit()

    # Create name string using download date
    search_tuple = [
        ('LosAngeles', 'parking'), 
        ('all', 'Los Angeles parking'),
        ('LosAngeles', 'parking regulation'),
        ('all', 'Los Angeles parking regulation')]

    for tup1, tup2 in search_tuple:

        la_subreddit = reddit.subreddit(tup1)
        la_subreddit_new = la_subreddit.search(tup2, limit=5000)
        df = pd.DataFrame({'title':[]})
        for submission in la_subreddit_new:
            df = df.append({'title': submission.title, 
                            'selftext' : submission.selftext,
                            'votes': submission.score,
                            'upvote_ratio' : submission.upvote_ratio,
                            'url': submission.url,
                            'permalink': submission.permalink
                            }, ignore_index=True)
        df.to_json(PROJECT_DIR / input_filepath / (tup1.upper()
                .replace(' ', '_') + tup2.lower().replace(' ', '_')+ '.json'))


    # logger = logging.getLogger(__name__)
    # logger.info('making final data set from raw data')


if __name__ == '__main__':
    # log_fmt = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    # logging.basicConfig(level=logging.INFO, format=log_fmt)

    # not used in this stub but often useful for finding various files
    PROJECT_DIR = Path(__file__).resolve().parents[2]

    # find .env automagically by walking up directories until it's found, then
    # load up the .env entries as environment variables
    load_dotenv(find_dotenv())
    data_folders = ['raw', 'interim', 'external', 'processed']
    if not os.path.exists(project_dir / 'data'):
        os.makedirs(project_dir / 'data')
    for _ in data_folders:
        if not os.path.exists(project_dir / 'data' / _):
            os.makedirs(project_dir / 'data' / _)

    main()
