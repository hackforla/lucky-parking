import pandas as pd

from sqlalchemy import create_engine
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
    # Read GeoJson into GeoPandas
    df = gpd.read_file('sample_data.geojson')
    # Convert geometry into WKTElements
    df['geometry'] = df['geometry'].apply(lambda x: WKTElement(x.wkt, srid=4326))
    # Drop ticket number (for privacy)
    df.drop('ticket_number', axis=1, inplace=True)

    # Use 'dtype' to specify column's type
    # For the geom column, we will use GeoAlchemy's type 'Geometry'
    df.to_sql('citations', engine, if_exists='replace', index=False, 
                         dtype={'issue_date': Date,
                            'fine_amount':Integer, 
                            'geometry': Geometry('POINT', srid=4326)})

except SQLAlchemyError as error:
    print('Error while creating table', error)

