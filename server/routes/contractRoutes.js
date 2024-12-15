const express = require('express');
const contractController = require('../controllers/contractController');

const router = express.Router();

router.post('/requests', contractController.putContractRequests);
router.get('/requests', contractController.contractRequests);
router.get('/requests/:id', contractController.contractRequestsById);
router.put('/requests/:id', contractController.putContractById);

module.exports = router;