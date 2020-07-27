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
    df = pd.read_csv('sample_data.csv', index_col=0)
    engine = create_engine(f'postgresql+psycopg2://{user}:{password}@{host}:{port}/{database}')

    df.head(0).to_sql('citations', engine, if_exists='replace', index=False)
    conn = engine.raw_connection()
    cur = conn.cursor()
    output = io.StringIO()
    df.to_csv(output, sep='\t', header=False, index=False)
    output.seek(0)
    cur.copy_from(output, 'citations', null='')
    conn.commit()
    conn.close()

except SQLAlchemyError as error:
    print('Error while creating table', error)

