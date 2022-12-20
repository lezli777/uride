const otpGenerator=require('otp-generator');
const {otp_length,otp_config}=require('../config/db.js')
module.exports.generateotp=()=>{
    const otp=otpGenerator.generate(otp_length,otp_config);
    return otp;
}
