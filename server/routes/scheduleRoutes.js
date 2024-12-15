const express = require('express');
const scheduleController = require('../controllers/scheduleController');

const router = express.Router();

router.get('/', scheduleController.getSchedule);
router.post('/', scheduleController.addMatch);
router.put('/:id', scheduleController.updateMatch);
router.delete('/:id', scheduleController.deleteMatch);

module.exports = router;