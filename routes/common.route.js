const express=require('express')
const router=express.Router();
const commonController=require('../controller/commonController/profileController.js')

router.post('/createProfile',commonController.auth,commonController.uploadImg,commonController.createProfile);
router.post('/getProfile',commonController.getProfile);

module.exports=router;