const router = require('express').Router();
const controller = require('../controllers/controllers');

router.get('/citation', controller.getAll);
// router.get('/citation/draw', controller.drawSelect);
// router.get('/citation/draw/in-timestamps', controller.drawSelectInDates);
// router.get('/citation/graph', controller.graph);
// router.get('/citation/point', controller.getPointData);
// router.get('/timestamp', controller.getTimestamps);
// router.get('/zipcodes', controller.getZipLayer);
// router.get('/citation/draw/zip', controller.zipSelect);
// router.get('/citation/draw/zip/in-timestamps', controller.zipSelectInDates);
// router.get('/citation/graph/zip', controller.zipGraph);
// router.get('/citation/graph/zip/in-timestamps', controller.zipGraphInDates);

module.exports = router;
