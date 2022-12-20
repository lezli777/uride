const express = require('express')
const router = express.Router();
const authController = require('../controller/authController/signupController.js')
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/validateEmail', authController.validateEmail);
router.post('/validateUsername', authController.validateUsername);
router.post('/verifyEmail', authController.verifyEmail);
router.post('/checkEmailVerificationStatus', authController.checkEmailVerificationStatus);

router.post('/signupdemo', authController.signupdemo);

module.exports = router;