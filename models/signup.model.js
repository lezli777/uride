 const mongoose=require('mongoose');
 const signupSchema=mongoose.Schema({
    email:{type:String},
    username:{type:String},
    password:{type:String},
    jwttoken:{type:String},
    status:{type:Number}
 })
 module.exports=mongoose.model('signups',signupSchema);
 