const mongoose = require('mongoose');
const signupSchema = mongoose.Schema({
    email: { type: String, unique: true },
    username: { type: String, unique: true },    
    password: { type: String },
    status: { type: Number },
    role_id:{ type: Number },
    otp: { type: Number },    
    email_verified: 0,
    jwttoken: { type: String }, 
    refreshToken: { type: String },   
    device_id: { type: String },
    device_token: { type: String },
    device_type : {type: String},
    created_date: { type: Date },
    updated_date: { type: Date }
})

// signupSchema.methods.generateAuthToken = function () {
//     const User = this;
//     const secret = process.env.SECRET_KEY;
//     const token = jwt.sign({ _id: User._id }, secret, {
//         expiresIn: '2m',
//       },);
//     User.token = token;
// }

// signupSchema.methods.generateRefreshToken = function () {
//     const User = this;
//     const secret = process.env.REFRESH_TOKEN_SECRET;
//     const refreshToken = jwt.sign({ _id: User._id }, secret, {
//         expiresIn: '5m',
//       },);
//     User.refreshToken = refreshToken;
// }

module.exports = mongoose.model('signups', signupSchema);
