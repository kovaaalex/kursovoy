const express = require('express');
const employeeController = require('../controllers/employeeController');

const router = express.Router();

router.post('/add', employeeController.addEmployee);
router.get('/', employeeController.getEmployees);
router.get('/other', employeeController.getOtherEmployees);
router.delete('/delete/:employeeId', employeeController.deleteEmployee);

module.exports = router;