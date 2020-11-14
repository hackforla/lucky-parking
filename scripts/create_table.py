import pandas as pd

from sqlalchemy import *
from sqlalchemy.exc import SQLAlchemyError

import io
import os
from dotenv import load_dotenv

load_dotenv()
user = os.getenv('DB_USER')
password = os.getenv('DB_PW')
host = os.getenv('DB_HOST')
port = os.getenv('DB_PORT')
database = os.getenv('DB_NAME')

try:
    engine = create_engine(f'postgresql+psycopg2://{user}:{password}@{host}:{port}/{database}')
    connection = engine.raw_connection()
    cursor = connection.cursor()
    command = "DROP TABLE IF EXISTS citations;"
    cursor.execute(command)
    connection.commit()
    cursor.close()
    df.read_csv('sample_data.csv', chunksize=20000)
    for chunk in reader:
        chunk.drop(["Unnamed: 0",'Ticket number'], axis=1).to_sql('citations', engine, if_exists='append', index=False, 
                          dtype={'Datetime': DateTime,
                            'Fine_amount':Numeric, 
                            'Latitude':Float,
                            'Longitude': Float,
                            })

except SQLAlchemyError as error:
    print('Error while creating table', error)

