const router = require('express').Router();
const controller = require('../controllers/controllers');

router.get('/citation', controller.getAll);
router.get('/citation/draw', controller.drawSelect);
router.get('/citation/graph', controller.graph);
router.get('/citation/point', controller.getPointData);
router.get('/timestamp', controller.getTimestamps);
router.get('/zipcodes', controller.getZipLayer);
router.get('/citation/draw/zip', controller.zipSelect);
router.get('/citation/graph/zip', controller.zipGraph);

module.exports = router;
