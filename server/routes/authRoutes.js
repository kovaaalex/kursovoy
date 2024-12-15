const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/forgot', authController.forgotPassword);
router.put('/newpassword', authController.updatePassword);
router.get('/protected', authController.protectedRoute);

module.exports = router;