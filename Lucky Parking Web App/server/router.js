const router = require("express").Router();
const controllers = require("./controllers.js");

router.route("/location").get(controllers.getAll);

module.exports = router;
