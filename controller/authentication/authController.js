const signupDB = require('../../models/signup.model.js');
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const {
    success,
    successWithData,
    errorResponse,
    validationError
} = require('../../helpers/apiResponse.js');
const { generateotp } = require('../../services/otp.js');
const sgmail = require('@sendgrid/mail');
sgmail.setApiKey('SG.vNwQ4i-ySeuPYQRQesLB-w.14KBQjwAkyTsAAKYW_6weCwT6LJ-0LICm43Cv8Djb4w');
const fs = require('fs');
require('dotenv').config()



module.exports = {
    signup: async function (req, res) {
        try {
            const {
                email,
                username,
                password,
                confirmPassword
            } = req.body;
            if (!(email && username && password && confirmPassword)) {
                return validationError(res, "required all fields")
            }
            // Validate if user exist in our database
            //const validateuser = await adminDB.findOne({ email, username }).lean(); 

            //Encrypt user password
            if (password == confirmPassword) {
                encryptedPassword = await bcrypt.hash(password, 10);

                const user = await signupDB.create({
                    email: email,
                    username: username,
                    password: encryptedPassword
                })
                const otpGenerated = generateotp();              

                var token = jwt.sign({
                    id: user._id
                },
                    process.env.SECRET_KEY, {
                    expiresIn: 86400
                }
                )
                user.jwttoken = token;
                user.status = 1;
                user.otp = otpGenerated;
                user.save(async (err, doc) => {
                    if (err) {
                        return errorResponse(res, 'Error')
                    } else {
                        return successWithData(res, 'Data Submitted Successfully', doc.jwttoken)
                        // const otpGenerated = generateotp();
                        // if(otpGenerated){

                        // }
                        // if(doc){
                        //     const Apikey = 'SG.vNwQ4i-ySeuPYQRQesLB-w.14KBQjwAkyTsAAKYW_6weCwT6LJ-0LICm43Cv8Djb4w';
                        //     sgmail.setApiKey(process.env.SENDGRID_API_KEY);

                        //     const message = {
                        //         to: 'lezli04@gmail.com',
                        //         from: 'mohit.framero@gmail.com',
                        //         subject: 'Verify Your Email',
                        //         html: `
                        //     <div
                        //     class="container"
                        //    style="max-width: 90%; margin: auto; padding-top: 20px"
                        //   >
                        //    <h2>Welcome to MyURide</h2>

                        //     <p style="margin-bottom: 30px;">Please click on link to verify Email</p>

                        //     <p style="margin-top:50px;">If you do not request for verification please do not respond to the mail. You can in turn un subscribe to the mailing list and we will never bother you again.</p>
                        //  </div>
                        //  `
                        //     }
                        //     const mailSent = await sgmail.send(message)
                        //      console.log('email sent', mailSent);
                        //      if(mailSent){
                        //         return successWithData(res, 'Data Submitted Successfully', doc.jwttoken);
                        //      }

                        // } else {
                        //     console.log('error');

                        // }
                    }
                })
            } else {
                return errorResponse(res, 'Confirm Password does not match')
            }


        } catch (err) {
            console.log(err);
        }
    },

    login: async function (req, res) {
        try {
            const {
                email,
                password
            } = req.body
            if (!(email && password)) {
                return validationError(res, 'Required All fields')
            } else {

                const data = await signupDB.findOne({
                    email
                });
                if (data && (await bcrypt.compare(password, data.password))) {
                    var token = jwt.sign({
                        id: data._id
                    }, process.env.SECRET_KEY, {
                        expiresIn: 86400
                    })
                    data.jwttoken = token;
                    const update = await data.updateOne({
                        token
                    }, {
                        jwttoken: data.token
                    })
                    if (update) {
                        //return success(res, 'Login Successfully')
                        return successWithData(res, 'Login Successfully', data.jwttoken)
                    } else {
                        return errorResponse(res, 'Please Try Again')
                    }
                } else {
                    return errorResponse(res, 'Data Not Found')
                }
            }
        } catch (err) {
            console.log(err);
        }
    },

    validateEmail: async function (req, res) {
        try {
            const { email } = req.body;
            const validateuser = await signupDB.findOne({ email }).lean();
            if (validateuser) {
                return errorResponse(res, 'Email Already exist')
            } else {
                return success(res, 'Email Available')
            }
        } catch (err) {
            console.log(err);
        }
    },

    validateUsername: async function (req, res) {
        try {
            const { username } = req.body;
            const validateuser = await signupDB.findOne({ username }).lean();
            if (validateuser) {
                return errorResponse(res, 'Username Already Exist')
            } else {
                return success(res, 'Username Available')
            }
        } catch (err) {
            console.log(err);
        }
    },

    verifyEmail: async function (req, res) {
        try {
            const validateuser = await signupDB.findOne({ otp: req.query.otp, email_verified: 0 }).lean();
            if (validateuser) {
                var newvalues = {
                    $set: {
                        email_verified: 1
                    }
                }
                signupDB.updateOne({ _id: validateuser._id }, newvalues, (err, doc) => {
                    if (err) {
                        return errorResponse(res, 'Email Not Activated')
                    } else {
                        return successWithData(res, 'Email Activated', validateuser.jwttoken);
                        //res.send("<html> <head>server Response</head><body><h1> Success</p></h1></body></html>");
                    }

                });
                //return successWithData(res, 'Email Verified', validateuser.jwttoken)               
            } else {
                return errorResponse(res, 'Expired or Invalid')
            }
        } catch (err) {
            console.log(err);
        }
    },

    checkEmailVerificationStatus: async function (req, res) {
        try {
            const verifyuser = await signupDB.findOne({ email: req.body.email, email_verified: 1 }).lean();
            if (verifyuser) {
                return success(res, "Email Verified")
            } else {
                return errorResponse(res, 'Email not Verified')
            }
        } catch (err) {
            console.log(err);
        }
    },

    signupdemo: async function (req, res) {
        try {
            const {
                email,
                username,
                password,
                confirmPassword
            } = req.body;
            if (!(email && username && password && confirmPassword)) {
                return validationError(res, "required all fields")
            }
            // Validate if user exist in our database
            //const validateuser = await adminDB.findOne({ email, username }).lean(); 

            //Encrypt user password
            if (password == confirmPassword) {
                encryptedPassword = await bcrypt.hash(password, 10);

                const user = await signupDB.create({
                    email: email,
                    username: username,
                    password: encryptedPassword
                })

                const otpGenerated = generateotp();

                var token = jwt.sign({
                    id: user._id
                },
                    process.env.SECRET_KEY, {
                    expiresIn: 86400
                }
                )
                user.jwttoken = token;
                user.status = 1;
                user.otp = otpGenerated;
                user.save(async (err, doc) => {
                    if (err) {
                        return errorResponse(res, 'Error')
                    } else {
                        //return successWithData(res, 'Data Submitted Successfully', doc)


                        if (doc) {
                            //const Apikey = 'SG.vNwQ4i-ySeuPYQRQesLB-w.14KBQjwAkyTsAAKYW_6weCwT6LJ-0LICm43Cv8Djb4w';
                            sgmail.setApiKey(process.env.SENDGRID_API_KEY);

                            const message = {
                                to: 'lezli04@gmail.com',
                                from: 'mohit.framero@gmail.com',
                                subject: 'Verify Your Email',
                                html: `
                            <div
                            class="container"
                           style="max-width: 90%; margin: auto; padding-top: 20px"
                          >
                           <h2>Welcome to MyURide</h2>
                            
                            <p style="margin-bottom: 30px;">Please click on link to verify Email</p>
                            <a href = 'http://127.0.0.1:6000/verifyEmail/?otp=${doc.otp}'>http://127.0.0.1:6000/verifyEmail/?otp=${doc.otp}</a>
                            <p style="margin-top:50px;">If you do not request for verification please do not respond to the mail. You can in turn un subscribe to the mailing list and we will never bother you again.</p>
                         </div>
                         `
                            }
                            const mailSent = await sgmail.send(message)
                            console.log('email sent', mailSent);
                            if (mailSent) {
                                return successWithData(res, 'Data Submitted Successfully', doc.jwttoken);
                            }

                        } else {
                            console.log('error');

                        }
                    }
                })
            } else {
                return errorResponse(res, 'Confirm Password does not match')
            }


        } catch (err) {
            console.log(err);
        }
    },






}