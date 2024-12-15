const express = require('express');
const squadController = require('../controllers/squadController');

const router = express.Router();

router.get('/', squadController.getSquad);
router.post('/save', squadController.saveSquad);

module.exports = router;