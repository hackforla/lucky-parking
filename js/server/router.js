const router = require("express").Router();
const controllers = require("./controllers.js");

router.route("/citation").get(controllers.getAll);
router.route("/citation/draw").get(controllers.drawSelect);
router.route("/timestamp").get(controllers.getTimestamps);


module.exports = router;
