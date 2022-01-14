const router = require('express').Router();
const controller = require('../controllers/controllers');

// router.route('/citation').get(controller.getAll);
router.get('/citation', controller.getAll);
router.route('/citation/draw').get(controller.drawSelect);
router.route('/citation/graph').get(controller.graph);
router.route('/citation/point').get(controller.getPointData);
router.route('/timestamp').get(controller.getTimestamps);
router.route('/zipcodes').get(controller.getZipLayer);
router.route('/citation/draw/zip').get(controller.zipSelect);
router.route('/citation/graph/zip').get(controller.zipGraph);

module.exports = router;