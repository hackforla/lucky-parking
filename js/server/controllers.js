dbHelpers = require("../database/index.js");
module.exports = {
  getAll: (req, res) => {
    let longitude = req.query.longitude
    let latitude = req.query.latitude

    dbHelpers
      .query(
        `SELECT index, ST_AsGeoJSON(geometry) FROM citations WHERE longitude BETWEEN ${longitude[0]} AND ${latitude[0]} AND latitude BETWEEN ${longitude[1]} AND ${latitude[1]} LIMIT 15000`
      )
      .then((data) => {
        res.status(200).send(data.rows);
      })
      .catch((err) => {
        res.status(404).send(err);
      });
  },
  getPointData: (req, res) => {
    let index = req.query.index;

    dbHelpers
      .query(
        `SELECT * FROM citations WHERE INDEX = '${index}'`
      )
      .then((data) => {
        res.status(200).send(data.rows);
      })
      .catch((err) => {
        res.status(404).send(err)
      })
  },
  getTimestamps: (req, res) => {
    let longitude = req.query.longitude;
    let latitude = req.query.latitude;
    let startDate = req.query.startDate;
    let endDate = req.query.endDate;

    dbHelpers
      .query(
        `SELECT index, ST_AsGeoJSON(geometry) FROM citations WHERE longitude BETWEEN ${longitude[0]} AND ${latitude[0]} AND latitude BETWEEN ${longitude[1]} AND ${latitude[1]} AND datetime BETWEEN '${startDate}' AND '${endDate}'`
      )
      .then((data) => {
        res.status(200).send(data.rows);
      })
      .catch((err) => {
        res.status(404).send(err);
      });
  },
  drawSelect: (req, res) => {
    let polygon = req.query.polygon
    

    dbHelpers
      .query(
        `SELECT *, ST_AsGeoJSON(geometry) FROM citations WHERE ST_Contains(ST_GeomFromGeoJSON('{
          "type":"Polygon",
          "coordinates": [${polygon}],
          "crs": {"type": "name", "properties": {"name": "EPSG:4326"}}										                            
        }'), citations.geometry);`
      )
      .then((data) => {
        res.status(200).send(data.rows);
      })
      .catch((err) => {
        res.status(404).send(err);
      });
  },
};
