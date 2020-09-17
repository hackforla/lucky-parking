dbHelpers = require("../database/index.js");
module.exports = {
  getAll: (req, res) => {
    let longitude = JSON.parse(req.query.longitude);
    let latitude = JSON.parse(req.query.latitude);

    dbHelpers
      .query(
        `SELECT * FROM test2`
      )
      .then((data) => {
        res.status(200).send(data.rows);
      })
      .catch((err) => {
        res.status(404).send(err);
      });
  },
};
