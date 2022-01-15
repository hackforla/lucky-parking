const db = require('../db/index');
const logger = require('../utils/logger');

const generateGeoData = (data) => {
  const dataSources = {
    type: 'FeatureCollection',
    features: [],
  };

  const dataFeatures = data.map((data) => {
    return {
      type: 'Feature',
      properties: {
        description: data.index,
      },
      geometry: JSON.parse(data.st_asgeojson),
    };
  });

  dataSources.features = dataFeatures;
  return dataSources;
}

const generateZipData = (data) => {
  const dataSources = {
    type: 'FeatureCollection',
    features: [],
  };

  const dataFeatures = data.map((data) => {
    return {
      type: 'Feature',
      properties: {
        zipcode: data.zip,
      },
      geometry: JSON.parse(data.st_asgeojson),
    };
  });

  dataSources.features = dataFeatures;
  return dataSources;
}

/*
Dictionary for keyed values "make_ind"
{'Mercury': 37, 'Alfa Romero': 50, 'Lamborghini': 64, 'Maserati': 43, 'Oldsmobile': 42, 'Yamaha': 53,
'Chevrolet': 4, 'Porsche': 26, 'Checker': 60, 'Other': 15, 'International': 39, 'Volkswagen': 7,
'Hino': 48, 'Suzuki': 40, 'Smart': 46, 'Dodge': 9, 'Geo Metro': 55, 'Merkur': 67, 'CIMC': 69,
'Infinity': 17, 'Pontiac': 33, 'Rolls-Royce': 57, 'Isuzu': 38, 'Cadillac': 24, 'Honda': 1, 'Hyundai': 8,
'Ford': 2, 'Mazda': 14, 'GMC': 16, 'Datsun': 61, 'Saab': 41, 'Grumman': 34, 'BMW': 5, 'Unknown': 27,
'Kia': 11, 'Mitsubishi': 23, 'Mack': 68, 'Sterling': 63, 'Land Rover': 22, 'Fiat': 35, 'Hummer': 51,
'Lincoln': 31, 'Acura': 20, 'Jaguar': 36, 'Freightliner': 29, 'Jeep': 12, 'Aston Martin': 65,
'Nissan': 3, 'Harley-Davidson': 49, 'Toyota': 0, 'Volvo': 21, 'Winnebago': 56, 'Mercedes Benz': 6,
'Kawasaki': 54, 'Chrysler': 18, 'Peterbuilt': 44, 'Triumph': 59, 'Scion': 58, 'Mini': 25, 'Saturn': 32,
'Bentley': 52, 'Tesla': 30, 'Plymouth': 47, 'Daewoo': 66, 'Subaru': 19, 'MISC.': 70, 'Buick': 28,
'Ferrari': 62, 'Lexus': 10, 'Kenworth': 45, 'Audi': 13}
*/

const getAll = async (req, res) => {
  const longitude = req.query.longitude;
  const latitude = req.query.latitude;
  const data = await db.query(
    `SELECT index, ST_AsGeoJSON(geometry) FROM test1 WHERE ST_X(geometry)
    BETWEEN ${longitude[0]} AND ${latitude[0]} AND ST_Y(geometry)
    BETWEEN ${longitude[1]} AND ${latitude[1]} LIMIT 15000`
  );
  
  if (data) {
    res.status(200).send(generateGeoData(data.rows));
  }
}

const getZipLayer = async (req, res) => {
  try {
    const data = await db.query(
      `SELECT zip, ST_AsGeoJSON(the_geom) FROM zipcodes;`
    );
    res.status(200).send(generateZipData(data.rows));
  }
  catch(err) {
    res.status(404).send(err);
    logger.error(err);
  }
}

const getPointData = async (req, res) => {
  try {
    const index = req.query.index;
    const data = await db.query(
      `SELECT * FROM test1 WHERE INDEX = '${index}';`
    );
    res.status(200).send(data.rows);
    logger.info(data.rows);
  }
  catch(err) {
    res.status(404).send(err);
    logger.error(err);
  }
}

const getTimestamps = async (req, res) => {
  try {
    const longitude = req.query.longitude;
    const latitude = req.query.latitude;
    const startDate = req.query.statDate;
    const endDate = req.query.endDate;
    const data = await db.query(
      `SELECT index, ST_AsGeoJSON(geometry) FROM test1 WHERE ST_X(geometry)
      BETWEEN ${longitude[0]} AND ${latitude[0]} AND ST_Y(geometry)
      BETWEEN ${longitude[1]} AND ${latitude[1]} AND datetime
      BETWEEN '${startDate}' AND '${endDate}' LIMIT 15000;`
    );
    res.status(200).send(generateGeoData(data.rows));
  }
  catch(err) {
    res.status(404).send(err);
  }
}

const drawSelect = async (req, res) => {
  try {
    const polygon = req.query.polygon;
    const data = await db.query(
      `SELECT ST_AsGeoJSON(geometry) FROM test1 WHERE ST_Contains(ST_GeomFromGeoJSON('{
        'type': 'Polygon',
        'coordinates': [${polygon}],
        'crs': {'type': 'name', 'properties': {'name': 'EPSG:4326'}}										                            
      }'), test1.geometry) LIMIT 30000;`
    );
    res.status(200).send(generateGeoData(data.rows));
  }
  catch(err) {
    res.status(404).send(err);
  }
}

const zipSelect = async (req, res) => {
  try {
    const zip = parseInt(req.query.zip);
    const data = await db.query(
      `SELECT ST_AsGeoJSON(geometry)
      FROM test1 AS citations
      JOIN zip_4326
      ON ST_WITHIN(citations.geometry, (SELECT ST_SetSRID(the_geom, 4326)
      FROM zipcodes
      WHERE zip=${zip}));`
    );
    res.status(200).send(generateGeoData(data.rows));
  }
  catch(err) {
    res.status(404).send(err);
    logger.error(err);
  }
}

const graph = async (req, res) => {
  try{
    const polygon = req.query.polygon;
    const filterBy = req.query.filterBy;
    const data = await db.query(
      `SELECT ${filterBy} AS "name",
      (COUNT(*) / (SUM(COUNT(*)) OVER() )) * 100 AS "y"
      FROM test1 WHERE ST_Contains(ST_GeomFromGeoJSON('{
        "type":"Polygon",
        "coordinates": [${polygon}],
        "crs": {"type": "name", "properties": {"name": "EPSG:4326"}}										                            
      }'), test1.geometry) GROUP BY ${filterBy};`
    );
    res.status(200).send(data.rows);
  }
  catch(err) {
    res.status(404).send(err);
  }
}

const zipGraph = async (req, res) => {
  try {
    const zip = req.query.zip;
    const filterBy = req.query.filterBy;
    const data = await db.query(
      `SELECT ${filterBy} AS "name",
      (COUNT(*) / (SUM(COUNT(*)) OVER() )) * 100 AS "y"
      FROM test1 WHERE ST_Contains((SELECT ST_SetSRID(the_geom, 4326)
      FROM zipcodes
      WHERE zip=${zip}), test1.geometry) GROUP BY ${filterBy};`
    );
    res.status(200).send(data.rows);
  }
  catch(err) {
    res.status(404).send(err);
  }
}

module.exports = {
  getAll,
  getZipLayer,
  getPointData,
  getTimestamps,
  drawSelect,
  zipSelect,
  graph,
  zipGraph,
}