const express = require('express');
const playerController = require('../controllers/playerController');

const router = express.Router();

router.get('/', playerController.getPlayers);
router.get('/current', playerController.getCurrentPlayers);
router.put('/updatePermission/:id', playerController.updatePlayerPermission);
router.post('/injury', playerController.addPlayerInjury);
router.get('/withoutStats', playerController.getNewPlayersWithoutStats);
router.put('/stats/:player_id', playerController.postPlayerStats);

module.exports = router;