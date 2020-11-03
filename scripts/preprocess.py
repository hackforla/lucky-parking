#!/usr/bin/env python
"""preprocess.py: Cleaning and preprocessing of raw parking citation data"""

import numpy as np
import pandas as pd

# Function to prepare the time values so that they can be parsed
def time_padding(time):
  '''Adds extra zeros until there are 4 characters'''
  time = str(int(time))
  return '0'*(4-len(time)) + time

def dataset_cleaning(df):

	df['issue_time'].fillna(0, inplace=True)

	# Apply padding to Issue_time
	df['issue_time'] = df['issue_time'].apply(time_padding)
	df['datetime'] = pd.to_datetime(df['issue_date'] + ' ' + df['issue_time'], 
		                        format='%m/%d/%Y %H%M')
	df = df.drop(['issue_date', 'issue_time', 'plate_expiry_date', 'VIN'], axis=1)
	mask = (df['datetime'].dt.year > 2008) & (df['datetime'].dt.year <= 2020)
	df = df.loc[mask].reset_index(drop=True)
	makes_lemmas = pd.read_csv('make.csv', delimiter='\t')
	makes_lemmas['alias'] = makes_lemmas.alias.apply(lambda x: x.split(','))
	for ind, data in makes_lemmas.iterrows():
		df.make.replace(data['alias'], data['make']
return df
