const express = require('express')
const router = express.Router();
const riderController = require('../controller/user/rider/riderController.js')
const driverController = require('../controller/user/driver/driverController.js')

// rider controller routes
router.get('/findDrivers', riderController.verifyToken, riderController.findDrivers);
router.get('/getDriverDetails', riderController.verifyToken, riderController.getDriverDetailsByID);
router.post('/sendOfferToDriver', riderController.verifyToken, riderController.sendOfferToDriver);
router.post('/confirmRideSentByDriver', riderController.verifyToken, riderController.confirmRideSentByDriver);
router.get('/getActiveDrivers', riderController.verifyToken, riderController.getActiveDrivers);
router.get('/getNewRequest', riderController.verifyToken, riderController.getNewRequest);  
router.get('/getDetailToConfirmRide', riderController.verifyToken, riderController.getDriverDetailToConfirmRide);
router.get('/getAllRideWithOfferStatus', riderController.verifyToken, riderController.getAllRideWithStatus);



// driver controller routes
router.get('/getOffersByTripID', driverController.verifyToken, driverController.getRiderOfferByTripId);
router.post('/deleteTrip', driverController.verifyToken, driverController.deleteTrip);
router.post('/acceptRiderOffer', driverController.verifyToken, driverController.acceptRiderOffer);
router.post('/rejectRiderOffer', driverController.verifyToken, driverController.rejectRiderOffer);
router.get('/getNewRideRequest', driverController.verifyToken, driverController.getNewRideRequest);
router.get('/getActiveRiders', driverController.verifyToken, driverController.getActiveRiders);
router.get('/getAllRiderOfferDetails', driverController.verifyToken, driverController.getAllRiderTripOfferdetail);
router.get('/getSingleRiderOfferDetails', driverController.verifyToken, driverController.getSingleRiderTripOfferdetail);

router.get('/getRiderTripDetails', driverController.verifyToken, driverController.getSingleRiderTripdetail);
router.get('/getNewRequestInArea', driverController.verifyToken, driverController.getNewRiderRequestInArea);
router.get('/getRideTotalDistance', driverController.verifyToken, driverController.getRideTotalDistance);
router.post('/startTrip', driverController.verifyToken, driverController.startTrip);



module.exports = router;