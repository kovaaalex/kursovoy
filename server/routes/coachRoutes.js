const express = require('express');
const coachController = require('../controllers/coachController');

const router = express.Router();

router.get('/', coachController.getCoaches);
router.get('/:id', coachController.getCoachesById);
router.post('/', coachController.addCoach);
router.delete('/:id', coachController.deleteCoach);

module.exports = router;