const express = require('express')
const router = express.Router();
const authController = require('../controller/authentication/authController.js')
router.post('/register', authController.signup);
router.post('/login', authController.login);
router.post('/validateEmail', authController.validateEmail);
router.post('/validateUsername', authController.validateUsername);
router.post('/verifyEmail', authController.verifyEmail);
router.post('/getStatus', authController.checkEmailVerificationStatus);

router.post('/signupdemo', authController.signupdemo);

module.exports = router;