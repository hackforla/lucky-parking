const router = require("express").Router();
const controllers = require("./controllers.js");

router.route("/citation").get(controllers.getAll);
router.route("/citation/draw").get(controllers.drawSelect);
router.route("/citation/graph").get(controllers.graph);
router.route("/citation/point").get(controllers.getPointData);
router.route("/timestamp").get(controllers.getTimestamps);
router.route("/zipcodes").get(controllers.getZipLayer);
router.route("/citation/draw/zip").get(controllers.zipSelect);
router.route("/citation/graph/zip").get(controllers.zipGraph);


module.exports = router;
