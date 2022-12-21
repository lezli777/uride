const express = require('express')
const router = express.Router();
const commonController = require('../controller/common/commonController.js')

router.post('/createProfile', commonController.verifyToken, commonController.uploadImg, commonController.createProfile);
router.post('/createPaymentMethod', commonController.verifyToken, commonController.savePaymentMethod);

router.get('/getProfile', commonController.verifyToken, commonController.getUserProfileData);

module.exports = router;