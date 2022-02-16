const dbHelpers = require("../database/index.js");
const format = require('pg-format');

function generateGeoData(data) {
  let dataSources = {
    type: "FeatureCollection",
    features: [],
  };

  let dataFeatures = data.map((data) => {
    return {
      type: "Feature",
      properties: {
        description: data.index,
      },
      geometry: JSON.parse(data.st_asgeojson),
    };
  });

  dataSources.features = dataFeatures;

  return dataSources;
}

function generateZipData(data) {
  let dataSources = {
    type: "FeatureCollection",
    features: [],
  };

  let dataFeatures = data.map((data) => {
    //console.log("From server: " + data.st_asgeojson)
    return {
      id: data.zip,
      type: "Feature",
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
  To avoid SQL injections, use the format function from pg-format
  to escape parameters that are defined from the frontend.
  https://github.com/datalanche/node-pg-format
*/

module.exports = {
  getAll: (req, res) => {
    let longitude = req.query.longitude;
    let latitude = req.query.latitude;
    const query = format(`
      SELECT index, ST_AsGeoJSON(geometry) FROM test1
      WHERE ST_X(geometry) BETWEEN %L AND %L
      AND ST_Y(geometry) BETWEEN %L AND %L
      LIMIT 15000;`,
      longitude[0],
      latitude[0],
      longitude[1],
      latitude[1]
    );

    dbHelpers
      .query(query)
      .then((data) => {
        res.status(200).send(generateGeoData(data.rows));
      })
      .catch((err) => {
        res.status(404).send(err);
      });
  },
  getZipLayer: (req, res) => {
    const query = format(`
      SELECT zip, ST_AsGeoJSON(the_geom) FROM zipcodes;`
    );

    dbHelpers
      .query(query)
      .then((data) => {
        res.status(200).send(generateZipData(data.rows));
      })
      .catch((err) => {
        res.status(404).send(err);
      });
  },
  getPointData: (req, res) => {
    let index = req.query.index;
    const query = format(`
      SELECT * FROM test1 WHERE INDEX = %L;`,
      index
    );

    dbHelpers
      .query(query)
      .then((data) => {
        res.status(200).send(data.rows);
      })
      .catch((err) => {
        res.status(404).send(err);
      });
  },
  getTimestamps: (req, res) => {
    let longitude = req.query.longitude;
    let latitude = req.query.latitude;
    let startDate = req.query.startDate;
    let endDate = req.query.endDate;
    const query = format(`
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

    dbHelpers
      .query(query)
      .then((data) => {
        res.status(200).send(generateGeoData(data.rows));
      })
      .catch((err) => {
        res.status(404).send(err);
      });
  },
  drawSelect: (req, res) => {
    let polygon = req.query.polygon;
    const query = format(`
      SELECT ST_AsGeoJSON(geometry) FROM test1
      WHERE ST_Contains(ST_GeomFromGeoJSON('{
        "type": "Polygon",
        "coordinates": [%s],
        "crs": {
          "type": "name",
          "properties": {
            "name": "EPSG:4326"
          }
        }										                            
      }'), test1.geometry)
      LIMIT 30000;`,
      polygon[0]
    );

    dbHelpers
      .query(query)
      .then((data) => {
        res.status(200).send(generateGeoData(data.rows));
      })
      .catch((err) => {
        res.status(404).send(err);
      });
  },
  zipSelect: (req, res) => {
    let zip = parseInt(req.query.zip);
    const query = format(`
      SELECT ST_AsGeoJSON(geometry)
      FROM test1 AS citations
      WHERE ST_WITHIN(citations.geometry, (
        SELECT ST_SetSRID(the_geom, 4326)
        FROM zipcodes
        WHERE zip = %L
      ));`,
        zip
    );

    dbHelpers
      .query(query)
      .then((data) => {
        res.status(200).send(generateGeoData(data.rows));
      })
      .catch((err) => {
        res.status(404).send(err);
      });
  },
  graph: (req, res) => {
    let polygon = req.query.polygon;
    let filterBy = req.query.filterBy;
    const query = format(`
      SELECT %1$L AS "name",
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

    dbHelpers
      .query(query)
      .then((data) => {
        res.status(200).send(data.rows);
      })
      .catch((err) => {
        res.status(404).send(err);
      });
  },
  zipGraph: (req, res) => {
    let zip = req.query.zip;
    let filterBy = req.query.filterBy;
    const query = format(`
      SELECT %1$L AS "name",
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

    dbHelpers
      .query(query)
      .then((data) => {
        res.status(200).send(data.rows);
      })
      .catch((err) => {
        res.status(404).send(err);
      });
  },
};
