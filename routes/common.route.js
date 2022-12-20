const express=require('express')
const router=express.Router();
const commonController=require('../controller/commonController/profileController.js')

router.post('/createProfile',commonController.verifyToken,commonController.uploadImg,commonController.createProfile);
router.post('/savePaymentMethod',commonController.verifyToken,commonController.savePaymentMethod);

router.post('/getUserProfileData',commonController.verifyToken,commonController.getUserProfileData);

module.exports=router;