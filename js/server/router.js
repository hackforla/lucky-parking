const router = require("express").Router();
const controllers = require("./controllers.js");

router.route("/citation").get(controllers.getAll);
router.route("/citation/draw").get(controllers.drawSelect);
router.route("/citation/point").get(controllers.getPointData);
router.route("/timestamp").get(controllers.getTimestamps);


module.exports = router;
