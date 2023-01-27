
const mongoose = require('mongoose');
const profileSchema = mongoose.Schema({
    profile_id: { type: mongoose.Schema.Types.ObjectId, ref: 'signups' },
    fullname: { type: String },
    university_name: { type: String },
    student_id: { type: String },
    university_address: { type: String },
    mobile_no: { type: String },
    //student_university_email: { type: String },
    gender: { type: String },
    car_model: { type: String },
    destination_contact_number: { type: String },
    type: { type: Number },
    gender_preferences: { type: String },
    rider_preference: { type: String },
    phone_code: { type: String },
    phone_no: { type: String },
    profile_photo: { type: String },   
    created_date: { type: Date},
    updated_date: { type: Date }
})

module.exports = mongoose.model('profiles', profileSchema);