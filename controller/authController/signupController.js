const signupDB = require('../../models/signup.model.js');
const config = require('../../config/db.js');
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


module.exports = {
    signup: async function (req, res) {
        try {
            const {
                email,
                username,
                password
            } = req.body;
            if (!(email && username && password)) {
                return validationError(res, "required all fields")
            }
            // Validate if user exist in our database
            //const validateuser = await adminDB.findOne({ email, username }).lean(); 
            
            //Encrypt user password
            encryptedPassword = await bcrypt.hash(password, 10);

            const user = await signupDB.create({
                email: email,
                username: username,
                password: encryptedPassword
            })

            var token = jwt.sign({
                    id: user._id
                },
                config.secert, {
                    expiresIn: 86400
                }
            )
            user.jwttoken = token;
            user.status = 1;

            user.save( async(err, doc) => {
                if (err) {
                    return errorResponse(res, 'Error')
                } else {
                    //return successWithData(res, 'Data Submitted Successfully', doc)
                    // const otpGenerated = generateotp();
                    // if(otpGenerated){

                    // }
                    if(doc){
                        const Apikey = 'SG.vNwQ4i-ySeuPYQRQesLB-w.14KBQjwAkyTsAAKYW_6weCwT6LJ-0LICm43Cv8Djb4w';
                        sgmail.setApiKey(Apikey);

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
                       
                        <p style="margin-top:50px;">If you do not request for verification please do not respond to the mail. You can in turn un subscribe to the mailing list and we will never bother you again.</p>
                     </div>
                     `
                        }
                        const mailSent = await sgmail.send(message)
                         console.log('email sent', mailSent);
                         if(mailSent){
                            return successWithData(res, 'Data Submitted Successfully', doc.jwttoken);
                         }
                       
                    } else {
                        console.log('error');
                     
                    }
                }
            })

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
                    }, config.secert, {
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
        try{
            const {email} = req.body;
            const validateuser = await signupDB.findOne({ email }).lean();
            if(validateuser){
                return errorResponse(res, 'Email Already exist')
            }else{
                return success(res, 'Email Available')
            }
        } catch (err) {
            console.log(err);
        }
      },

      validateUsername: async function (req, res) {
        try{
            const {username} = req.body;
            const validateuser = await signupDB.findOne({ username }).lean();
            if(validateuser){
                return errorResponse(res, 'Username Already Exist')
            }else{
                return success(res, 'Username Available')
            }
        } catch (err) {
            console.log(err);
        }
      },

      verifyEmail: async function (req, res) {
        try{          
            const validateuser = await signupDB.findById(req.query.user_id).lean();            
            if(validateuser){
                var newvalues={
                    $set:{
                        status:2
                    }
                }
                signupDB.updateOne({_id:req.query.user_id},newvalues,(err,doc)=>{
                    if(err){
                        return errorResponse(res,'Email Not Verified')
                    }else{
                       // return successWithData(res,'Email Verified',validateuser.jwttoken);
                       res.send("<html> <head>server Response</head><body><h1> Success</p></h1></body></html>");
                    }

                });
                //return successWithData(res, 'Email Verified', validateuser.jwttoken)               
            }else{
                return errorResponse(res, 'Please Try Again')
            }
        } catch (err) {
            console.log(err);
        }
      },

      checkEmailVerificationStatus: async function (req, res) {
        try{         
            const verifyuser = await signupDB.findOne({email :req.body.email , status : 2}).lean();           
            if(verifyuser){
                 return success(res, "Email Verified")         
            }else{
                return errorResponse(res, 'Email not Verified')
            }
        } catch (err) {
            console.log(err);
        }
      },

      //function getMessage() {
        getMessage: async function (req, res) {
        const body = 'This is a test email using SendGrid from Node.js';
        return {
          to: 'leela.stealthtechnocrats@gmail.com',
          from: 'mohit.framero@gmail.com',
          subject: 'Test email with Node.js and SendGrid',
          text: body,
          html: `<strong>${body}</strong>`,
        };
      },
      
      //async function sendEmail() {
        sendEmails: async function (req, res) {
        try {
            const body = 'This is a test email using SendGrid from Node.js';
            const message = { 
                to: 'leela.stealthtechnocrats@gmail.com',
                from: 'mohit.framero@gmail.com',
                subject: 'Test email with Node.js and SendGrid',
                text: body,
                html: `<strong>${body}</strong>`,  
            }
          const successmail = await sgmail.send(message);
          if(successmail){
            console.log('Test email sent successfully', successmail);
          }
         
        } catch (error) {
          console.error('Error sending test email');
          console.error(error);
          if (error.response) {
            console.error(error.response.body)
          }
        }
      },
      
      //(async () => {
        sendEmail: async function (req, res) {
        console.log('Sending test email');
        await sendEmail();
      }


   
}