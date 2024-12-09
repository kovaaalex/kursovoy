const express = require('express');
const injuryController = require('../controllers/injuryController');

const router = express.Router();

router.get('/', injuryController.getInjuries);
router.put('/put/:id', injuryController.updateInjury);
router.get('/list', injuryController.getInjuriesList);
router.get('/:id', injuryController.getInjuryByID);
router.post('/', injuryController.addInjury);
router.delete('/:id', injuryController.deleteInjury);

module.exports = router;