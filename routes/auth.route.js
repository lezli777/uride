const express=require('express')
const router=express.Router();
const authController=require('../controller/authController/signupController.js')
router.post('/signup',authController.signup);
router.post('/login',authController.login);
router.post('/validateEmail',authController.validateEmail);
router.post('/validateUsername',authController.validateUsername);

module.exports=router;