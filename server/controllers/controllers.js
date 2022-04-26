const format = require('pg-format');
const db = require('../db/index');
// const logger = require('../utils/logger');

const generateGeoData = (data) => {
  const dataSources = {
    type: 'FeatureCollection',
    features: [],
  };

  const dataFeatures = data.map((datum) => ({
    type: 'Feature',
    properties: {
      description: datum.index,
    },
    geometry: JSON.parse(datum.st_asgeojson),
  }));

  dataSources.features = dataFeatures;

  return dataSources;
};

const generateZipData = (data) => {
  const dataSources = {
    type: 'FeatureCollection',
    features: [],
  };

  const dataFeatures = data.map((datum) => ({
    type: 'Feature',
    properties: {
      zipcode: datum.zip,
    },
    geometry: JSON.parse(datum.st_asgeojson),
  }));

  dataSources.features = dataFeatures;
  return dataSources;
};

/*
  To avoid SQL injections, use the format function from pg-format
  to escape parameters that are defined from the frontend.
  https://github.com/datalanche/node-pg-format
*/

const getAll = async (req, res) => {
  const { longitude } = req.query;
  const { latitude } = req.query;
  const query = format(
    `
    SELECT index, ST_AsGeoJSON(geometry) FROM test1
    WHERE ST_X(geometry) BETWEEN %L AND %L
    AND ST_Y(geometry) BETWEEN %L AND %L
    LIMIT 15000;`,
    longitude[0],
    latitude[0],
    longitude[1],
    latitude[1]
  );

  const data = await db.query(query);

  if (data) {
    res.status(200).send(generateGeoData(data.rows));
  } else {
    res.status(400).send({
      data: 'No data',
      success: false,
    });
  }
};

const getZipLayer = async (req, res) => {
  const query = format(`
    SELECT zip, ST_AsGeoJSON(the_geom) FROM zipcodes;`);

  const data = await db.query(query);

  if (data) {
    res.status(200).send(generateZipData(data.rows));
  } else {
    res.status(400).send({
      data: 'No data',
      success: false,
    });
  }
};

const getPointData = async (req, res) => {
  const { index } = req.query;
  const query = format(
    `
    SELECT * FROM test1 WHERE INDEX = %L;`,
    index
  );

  const data = await db.query(query);

  if (data) {
    res.status(200).send(data.rows);
  } else {
    res.status(400).send({
      data: 'No data',
      success: false,
    });
  }
};

const getTimestamps = async (req, res) => {
  const { longitude } = req.query;
  const { latitude } = req.query;
  const { startDate } = req.query;
  const { endDate } = req.query;
  const query = format(
    `
    SELECT index, ST_AsGeoJSON(geometry) FROM test1
    WHERE ST_X(geometry) BETWEEN %L AND %L
    AND ST_Y(geometry) BETWEEN %L AND %L
    AND datetime BETWEEN %L AND %L
    LIMIT 15000;`,
    longitude[0],
    latitude[0],
    longitude[1],
    latitude[1],
    startDate,
    endDate
  );

  const data = await db.query(query);

  if (data) {
    res.status(200).send(generateGeoData(data.rows));
  } else {
    res.status(400).send({
      data: 'No data',
      success: false,
    });
  }
};

// Queries and send geo data based on dates user requested
const drawSelect = async (req, res) => {
  const { polygon } = req.query;
  const { startDate } = req.query;
  const { endDate } = req.query;
  let datesConditionStr = '';

  if (
    (startDate !== undefined || startDate !== null) &&
    (endDate !== undefined || endDate !== null)
  ) {
    datesConditionStr = 'AND datetime BETWEEN %2L AND %3L';
  }

  const query = format(
    `
    SELECT ST_AsGeoJSON(geometry) 
    FROM test1
    WHERE ST_Contains(ST_GeomFromGeoJSON(
      '{
        "type": "Polygon",
        "coordinates": [%s],
        "crs": {
          "type": "name",
          "properties": {
            "name": "EPSG:4326"
          }
        }										                            
        }
      '
      ),
      test1.geometry
    )
    ${datesConditionStr} 
    LIMIT 30000;`,
    polygon[0],
    startDate,
    endDate
  );

  const data = await db.query(query);

  if (data) {
    res.status(200).send(generateGeoData(data.rows));
  } else {
    res.status(400).send({
      data: 'No data',
      success: false,
    });
  }
};

// Queries and sends coordinates based on a period of time directed by the user
const zipSelect = async (req, res) => {
  const { zip } = req.query;
  const { startDate } = req.query;
  const { endDate } = req.query;
  let datesConditionStr = ';';

  if (
    (startDate !== undefined || startDate !== null) &&
    (endDate !== undefined || endDate !== null)
  ) {
    datesConditionStr = 'AND datetime BETWEEN %2L AND %3L;';
  }

  const query = format(
    `
      SELECT ST_AsGeoJSON(geometry)
      FROM  test1 AS citations
      WHERE ST_WITHIN(
        citations.geometry, 
        (
          SELECT ST_SetSRID(the_geom, 4326)
          FROM zipcodes
          WHERE zip = %1L
        )
      )
      ${datesConditionStr}
    `,
    zip,
    startDate,
    endDate
  );

  const data = await db.query(query);

  if (data) {
    res.status(200).send(generateGeoData(data.rows));
  } else {
    res.status(400).send({
      data: 'No data',
      success: false,
    });
  }
};

const graph = async (req, res) => {
  const { polygon } = req.query;
  const { filterBy } = req.query;
  const query = format(
    `
    SELECT %1$s AS "name",
    (COUNT(*) / (SUM(COUNT(*)) OVER() )) * 100 AS "y"
    FROM test1 WHERE ST_Contains(ST_GeomFromGeoJSON('{
      "type":"Polygon",
      "coordinates": [%2$s],
      "crs": {
        "type": "name",
        "properties": {
          "name": "EPSG:4326"
        }
      }										                            
    }'), test1.geometry)
    GROUP BY %1$s;`,
    filterBy,
    polygon
  );

  const data = await db.query(query);

  if (data) {
    res.status(200).send(data.rows);
  } else {
    res.status(400).send({
      data: 'No data',
      success: false,
    });
  }
};

const zipGraph = async (req, res) => {
  const { zip } = req.query;
  const { filterBy } = req.query;

  const query = format(
    `
    SELECT %1$s AS "name",
    (COUNT(*) / (SUM(COUNT(*)) OVER() )) * 100 AS "y"
    FROM test1 WHERE ST_Contains(
      (SELECT ST_SetSRID(the_geom, 4326)
      FROM zipcodes
      WHERE zip = %2$L),
    test1.geometry)
    GROUP BY %1$s;`,
    filterBy,
    zip
  );

  const data = await db.query(query);

  if (data) {
    res.status(200).send(data.rows);
  } else {
    res.status(400).send({
      data: 'No data',
      success: false,
    });
  }
};

module.exports = {
  generateGeoData,
  generateZipData,
  getAll,
  getZipLayer,
  getPointData,
  getTimestamps,
  drawSelect,
  zipSelect,
  graph,
  zipGraph,
};
