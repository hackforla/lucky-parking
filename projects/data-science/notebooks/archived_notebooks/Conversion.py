#!/usr/bin/env python

# Import data science packages
import pandas as pd
import numpy as np
import datetime

# Import visualization and geoanalytics packages
import geopandas as gpd
import matplotlib.pyplot as plt
from shapely.geometry import Point
from shapely.geometry import box
import pyproj

df = pd.read_csv('Original_data/Parking_Citations_After_July_1_2015.csv', usecols = 
                 ['Issue Date', 'Issue time', 'Location', 'Violation Description', 'Latitude', 'Longitude'])
df.columns = ['Issue_Date', 'Issue_Time', 'Location', 'Violation_Description', 'Latitude', 'Longitude']
df = df.dropna()
df = df[(df['Latitude'] > 100000)|(df['Longitude'] > 100000)]

# Filter for street cleaning violations
df = df[df['Violation_Description']  == 'NO PARK/STREET CLEAN']
# Fix Issue_Time and add padding zeros so the time can be recognized
def time_padding(time):
    time = str(int(time))
    return '0'*(4-len(time)) + time
# Apply padding to Issue_time
df['Issue_Time'] = df['Issue_Time'].apply(time_padding)
# Creating combined Datetime column
df['Issue_Date'] = df['Issue_Date'].apply(lambda x: x[:10])
df['Datetime'] = pd.to_datetime(df['Issue_Date'] + ' ' + df['Issue_Time'], format='%Y/%m/%d %H%M')
# Create hour feature
df['Hour'] = df['Datetime'].apply(lambda x: x.hour)
#create day of the week
weekdays=('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')
df['Weekday'] = df['Datetime'].apply(lambda x : weekdays[x.weekday()])

# Conversion using pyproj module
inProj = pyproj.Proj({'init': 'epsg:2229'}, preserve_units=True) # make sure unit preserve 
outProj = pyproj.Proj({'init': 'epsg:4326'})
y_1,x_1 = pyproj.transform(inProj,outProj,df["Latitude"].values, df["Longitude"].values)

# Add on the converted coordinates
df["Latitude"] = x_1
df["Longitude"] = y_1

del y_1
del x_1

# Turn citation coordinates into Geopandas geometry column
geometry = [Point(xy) for xy in zip(df.Longitude, df.Latitude)]
crs = {'init': 'epsg:4326'}
geo_df = gpd.GeoDataFrame(df, crs=crs, geometry=geometry)

geo_df = geo_df[['Location', 'Violation_Description', 'Datetime', 'Hour', 'Weekday', 'geometry']]

del df

# Import steet centerline geometry with Geopandas
st_df = gpd.read_file('Streets_Centerline/Streets_Centerline.shp')

geo_df['geometry'] = geo_df['geometry'].buffer(0.001)
sjoined = gpd.sjoin(geo_df, st_df, how='inner', op='intersects')

sjoined.to_file("s_joined.geojson", driver='GeoJSON')

exit()