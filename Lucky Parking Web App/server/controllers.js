dbHelpers = require("../database/index.js");

module.exports = {
  getAll: (req, res) => {
    dbHelpers
      .query("SELECT longitude, latitude FROM location;")
      .then(data => {
        res.status(200).send(data.rows);
      })
      .catch(err => {
        res.status(404).send(err);
      });
  }
};
