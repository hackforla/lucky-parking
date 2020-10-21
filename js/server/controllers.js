dbHelpers = require("../database/index.js");
module.exports = {
  getAll: (req, res) => {
    let longitude = JSON.parse(req.query.Longitude);
    let latitude = JSON.parse(req.query.Latitude);

    dbHelpers
      .query(
        `SELECT * FROM citations`
      )
      .then((data) => {
        res.status(200).send(data.rows);
      })
      .catch((err) => {
        res.status(404).send(err);
      });
  },
};
