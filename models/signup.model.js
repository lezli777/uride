 const mongoose=require('mongoose');
 const signupSchema=mongoose.Schema({
    email:{type:String ,  unique: true },
    username:{type:String,  unique: true },
    password:{type:String},
    jwttoken:{type:String},
    fullname: { type: String },
    university_name: { type: String },
    student_id: { type: String },
    university_address: { type: String },
    mobile_no: { type: String },
    //student_university_email: { type: String },
    gender: { type: String },
    //payment_method: { type: String },
    destination_contact_number: { type: String },
    role: { type:String },
    gender_preferences: { type:String },
    rider_preference: { type:String },
    phone_code: { type:String },
    phone_no: { type:String },
    profile_photo: { type:String },

    status:{type: Number},	
    email_verified: 0,
	device_id:{type:String},
	device_token:{type:String},
	created_date:{type:String, default: Date.now},
	updated_date:{type:String}
 })
 module.exports=mongoose.model('signups',signupSchema);
 