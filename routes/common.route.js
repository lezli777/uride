const express=require('express')
const router=express.Router();
const commonController=require('../controller/commonController/profileController.js')
router.post('/createProfile',commonController.signup);


module.exports=router;