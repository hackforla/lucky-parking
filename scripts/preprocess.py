#!/usr/bin/env python
"""preprocess.py: Cleaning and preprocessing of raw parking citation data"""
__author__      = "Hack for LA - Lucky Parking Project"


import numpy as np
import pandas as pd
import datetime as dt
import math
import requests
import seaborn as sns
import sys

# Function to prepare the time values so that they can be parsed
def time_padding(time):
  '''Adds extra zeros until there are 4 characters'''
  time = str(int(time))
  return '0'*(4-len(time)) + time

df['Issue time'].fillna(0, inplace=True)

# Apply padding to Issue_time
df['Issue time'] = df['Issue time'].apply(time_padding)
df['Datetime'] = pd.to_datetime(df['Issue Date'] + ' ' + df['Issue time'], 
                                format='%m/%d/%Y %H%M')
df = df.drop(['Issue Date', 'Issue time'], axis=1)
mask = (df['Datetime'].dt.year > 2008) & (df['Datetime'].dt.year <= 2020)

df = df.loc[mask].reset_index(drop=True)
df['Plate Expiry Date Parsed'] = pd.to_datetime(df['Plate Expiry Date'],format='%Y%m', errors='coerce')
df.loc[df['Plate Expiry Date Parsed'].dt.year > 2021, 'Plate Expiry Date Parsed'] = np.nan

makes_lemmas = pd.read_csv('make.csv', delimiter='\t')
makes_lemmas['alias'] = makes_lemmas.alias.apply(lambda x: x.split(','))
