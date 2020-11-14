dbHelpers = require("../database/index.js");
module.exports = {
  getAll: (req, res) => {
    let longitude = req.query.longitude
    let latitude = req.query.latitude

    dbHelpers
      .query(
        `SELECT * FROM citations WHERE longitude BETWEEN ${longitude[0]} AND ${latitude[0]} AND latitude BETWEEN ${longitude[1]} AND ${latitude[1]} LIMIT 10000`
      )
      .then((data) => {
        res.status(200).send(data.rows);
      })
      .catch((err) => {
        res.status(404).send(err);
      });
  },
};
