const { Router } = require('express');
const mongoose = require('mongoose');
const profileSchema = mongoose.Schema({
    fullname: {
        type: String
    },
    university_name: {
        type: String
    },
    student_id: {
        type: String
    },
    university_address: {
        type: String
    },
    mobile_no: {
        type: String
    },
    student_university_email: {
        type: String
    },
    gender: {
        type: String
    },
    payment_method: {
        type: String
    },
    destination_contact_number: {
        type: String
    },
    role: {
        type:String
    },
    gender_preferences: {
        type:String
    },
    rider_preference: {
        type:String
    },
    phone_code: {
        type:String
    },
    phone_no: {
        type:String
    },
    profile_photo: {
        type:String
    },
    
})

module.exports=mongoose.model('profiles',profileSchema);