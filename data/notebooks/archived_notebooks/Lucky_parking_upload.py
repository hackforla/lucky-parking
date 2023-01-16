#!/usr/bin/env python

"""Lucky_parking_upload.py: Description of what foobar does."""

__author__      = "Greg Pawin"


import sqlalchemy
import numpy as np
import pandas as pd
import pickle
from sqlalchemy import *

from sqlalchemy import create_engine
engine = create_engine('')

# Opening pickle file
with open( "lucky_parking.p", "rb" ) as f:
  df = pickle.load(f)

try:
	df.drop('Ticket number', axis=1).to_sql('citations', engine, if_exists='replace', index=False, 
		              dtype={'Datetime': DateTime,
		                'Fine_amount':Integer, 
		                'Latitude':Float,
		                'Longitude': Float,
		                'Plate Expiry Date': Date
                        })
except:
	print('error')
