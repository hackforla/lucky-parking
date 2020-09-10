const router = require("express").Router();
const controllers = require("./controllers.js");

router.route("/citation").get(controllers.getAll);

module.exports = router;
