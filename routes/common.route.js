const express = require('express')
const router = express.Router();
const commonController = require('../controller/common/commonController.js')

router.post('/createProfile', commonController.verifyToken, commonController.uploadImg, commonController.createProfile);
router.post('/createPaymentMethod', commonController.verifyToken, commonController.savePaymentMethod);

router.post('/getProfile', commonController.verifyToken, commonController.getUserProfileData);
router.post('/createTrip', commonController.verifyToken, commonController.createTrip);
router.post('/getTrips',commonController.verifyToken,commonController.getAllTrip);
router.post('/checkProfileStatus',commonController.verifyToken,commonController.checkUserProfileExist);
router.post('/addCSVFile', commonController.addVehicles);
router.post('/resetPassword',commonController.verifyToken, commonController.resetPassword);
router.post('/logout',commonController.verifyToken, commonController.logout);


module.exports = router;