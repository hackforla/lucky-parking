#!/usr/bin/env python

"""Lambda function code to upload to S3"""

import urllib3
import datetime
import boto3

http = urllib3.PoolManager()
s3 = boto3.client('s3')
url = 'https://data.lacity.org/api/views/wjz9-h9np/rows.csv?accessType=DOWNLOAD'
date_string = datetime.date.today().strftime("%y-%m-%d")
bucket = '{your-bucket-here}'

def lambda_handler(event, context):
    try:
        s3.upload_fileobj(http.request('GET', url,preload_content=False), bucket, f'{date_string}.csv')
        return 'Success!'
    except Exception as e:
        print(e)
        raise e
