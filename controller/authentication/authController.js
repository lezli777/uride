const signupDB = require('../../models/signup.model.js');
const roleDB = require('../../models/memberRole.model.js');
const profileDB = require('../../models/profile.model.js');
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const {
    success,
    successWithData,
    errorResponse,
    validationError,
    notFound
} = require('../../helpers/apiResponse.js');
const { generateotp } = require('../../services/otp.js');
const sgmail = require('@sendgrid/mail');
sgmail.setApiKey('SG.vNwQ4i-ySeuPYQRQesLB-w.14KBQjwAkyTsAAKYW_6weCwT6LJ-0LICm43Cv8Djb4w');
const fs = require('fs');
require('dotenv').config();
var passwordValidator = require('password-validator');

module.exports = {
    signup: async function (req, res) {
        try {
            
            const requiredParam = [
                'email',
                'username',
                'password',
                'confirmPassword',
                'device_id',
                'device_token',
                'device_type'
            ];

            var emptyArry = [];
            var formdata = req.body;
            var data = Object.keys(req.body);           

            var result = requiredParam.filter(n => !data.includes(n));
            if (result != '') {
                var responseMessageRequired = result + " " + 'fields are required.';
                return validationError(res, responseMessageRequired);
            }else{
                data.forEach(element => {
                    if (formdata[element] == '') {
                        emptyArry.push(element);
                    }
                });
                var responseMessage = emptyArry + ". " + "Data can't be empty.    ";
                if (emptyArry != '') {
                    return validationError(res, responseMessage);
                }else{
                            const {
                        email,
                        username,
                        password,
                        confirmPassword,
                        device_id,
                        device_token,
                        device_type
                    } = req.body;
                    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
   
                    if(re.test(email)){                
                        if(email.indexOf("@creighton.edu", email.length - "@creighton.edu".length) !== -1){                   
                                const validateemail = await signupDB.findOne({  email: email.toLowerCase() }).lean();
                                if (validateemail) {
                                    return errorResponse(res, 'Email Already exist')
                                } 

                                const validateuser = await signupDB.findOne({ username }).lean();
                                if (validateuser) {
                                    return errorResponse(res, 'Username Already Exist')
                                }

                                // Create a schema
                                var schema = new passwordValidator();

                                // Adding properties to it
                                schema
                                .is().min(8)                                    // Minimum length 8
                                .is().max(25)                                   // Maximum length 25
                                .has().uppercase()                              // Must have uppercase letters
                                .has().lowercase()                              // Must have lowercase letters
                                .has().digits(2)                                // Must have at least 2 digits
                                .has().not().spaces()                           // Should not have spaces
                                .is().not().oneOf(['Passw0rd', 'Password123']); // Blacklist these values

                                
                                const validatePassword = await schema.validate(password);
                                console.log("validatePassword",validatePassword);
                                if (validatePassword == false) {
                                    return errorResponse(res, 'Password must have min 8 length, max 25 length, uppercase letters, lowercase letters, at least 2 digits with no spaces ')
                                }

                                //Encrypt user password
                                if (validatePassword == true && password == confirmPassword) {
                                    encryptedPassword = await bcrypt.hash(password, 10);

                                    const user = await signupDB.create({
                                        email: email.toLowerCase(),
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

                                    var refreshToken = jwt.sign({
                                        id: user._id
                                    },
                                        process.env.REFRESH_TOKEN_SECRET, {
                                        expiresIn: 2592000
                                    }
                                    )
                                    user.jwttoken = token;
                                    user.refreshToken = refreshToken;
                                    user.status = 1;
                                    user.role_id = 0;
                                    user.otp = otpGenerated;
                                    user.device_id = device_id;
                                    user.device_token = device_token;
                                    user.device_type = device_type;
                                    user.created_date = Date.now();                            
                                    await user.save(async (err, doc) => {
                                        if (err) {
                                            return errorResponse(res, 'Error')
                                        } else {
                                            if(doc){
                                                const data ={
                                                token: doc.jwttoken, 
                                                refreshToken: doc.jwttoken
                                                }
                                                return successWithData(res, 'Data Submitted Successfully', data);
                                            }
                                            
                                            
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
                        }else{
                            return await errorResponse(res, 'Only domain with @creighton.edu is acceptable')
                        }
                    }

                }
            }
           
        } catch (err) {
            console.log(err);
        }
    },

    login: async function (req, res) {
        try {
            const {
                email,
                password,
                device_id,
                device_token,
                device_type
            } = req.body
            if (!(email && password &&  device_id && device_token && device_type)) {
                return validationError(res, 'Required All fields')
            } else {

                const data = await signupDB.findOne({
                    email : email.toLowerCase()
                });
                if (data && (await bcrypt.compare(password, data.password))) {                    

                    var token = jwt.sign({
                        id: data._id
                    }, process.env.SECRET_KEY, {
                        //expiresIn: 86400
                        expiresIn: 2592000
                    })

                    var refreshtoken = jwt.sign({
                        id: data._id
                    },
                        process.env.REFRESH_TOKEN_SECRET, {
                        expiresIn: 2592000
                    })
                    // data.jwttoken = token;
                    // data.refreshtoken = refreshtoken;
                    var newvalues = {
                        $set: {
                            jwttoken : token,
                            refreshToken : refreshtoken,
                            device_id : device_id,
                            device_token : device_token,
                            device_type : device_type,
                            updated_date : Date.now()
                        }
                    }
                    //console.log("newvalues", newvalues)
                     signupDB.updateOne({ _id: data._id }, newvalues, async (err, updateInfo) => { 
                        if(err){
                            return errorResponse(res, 'Network error')
                        }else{
                            if (updateInfo) {
                                console.log("updateInfo",updateInfo);
                                const userdata = await signupDB.findOne({
                                    _id: data._id
                                });
                                if(userdata){
                                    const result ={
                                    token: userdata.jwttoken, 
                                    refreshToken: userdata.refreshToken
                                 }
                                //return success(res, 'Login Successfully')
                                return successWithData(res, 'Login Successfully', result)
                                }
                                // const result ={
                                //     token: updateInfo.jwttoken, 
                                //     refreshToken: updateInfo.jwttoken
                                //  }
                                // //return success(res, 'Login Successfully')
                                // return successWithData(res, 'Login Successfully', updateInfo)
                            } else {
                                return errorResponse(res, 'Please Try Again')
                            }
                        }
                     }) 
                    // const update = await data.updateOne({
                    //     token,refreshtoken
                    // }, {
                    //     jwttoken: data.token,
                    //     refreshToken: data.refreshtoken
                    // })
                    
                } else {
                    return errorResponse(res, 'Data Not Found')
                }
            }
        } catch (err) {
            console.log(err);
        }
    },
   
        refreshTokenUser: async function (req, res) {
        try {
            const { refreshToken } = req.body;
    
            if (!refreshToken) {
                return errorResponse(res, 'No refresh token provided')                
            }
    
             await jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
            
                const data = await signupDB.findOne( refreshToken._id ).exec();
           
                if (!data) {
                    return success(res, 'User not found')                
                }else{
                    var token = jwt.sign({
                        id: data._id
                    }, process.env.SECRET_KEY, {
                        expiresIn: 86400
                    })
                    
                    var newvalues = {
                        $set: {
                            jwttoken : token                 

                        }
                    }               
                    await signupDB.updateOne({ _id: data._id }, newvalues, async (err, updateInfo) => { 
                        if(err){
                            return errorResponse(res, 'Network error')
                        }else{
                            const newdata = {
                                jwttoken: data.jwttoken 
                            } 
                            return successWithData(res, 'Refresh Token Successful', newdata)
                        } });
                
                }
           

        } catch (error) {            
            return errorResponse(res, 'Refresh Token expired')            
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
            const verifyuser = await signupDB.findOne({ email: req.body.email.toLowerCase(), email_verified: 1 }).lean();
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
                    email: email.toLowerCase(),
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
                user.role_id = 0;
                user.otp = otpGenerated;                
                await user.save(async (err, doc) => {
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

    createRole: async function (req, res) {
        try {
            const {
                role,
                role_id
            } = req.body;
            if (!(role && role_id)) {
                return validationError(res, "required all fields")
            }

       
                const createrole = await roleDB.create({
                    role_id: role_id,
                    role: role                    
                })
                
                createrole.save(async (err, roledoc) => {
                    if (err) {
                        return errorResponse(res, 'Error')
                    } else {
                        return successWithData(res, 'Data Submitted Successfully', roledoc)
                      
                    }
                })
            


        } catch (err) {
            console.log(err);
        }
    },




}