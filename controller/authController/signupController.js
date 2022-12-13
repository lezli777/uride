const signupDB = require('../../models/signup.model.js')
const config = require('../../config/db.js')
const jwt = require('jsonwebtoken');
const {
    success,
    successWithData,
    errorResponse,
    validationError
} = require('../../helpers/apifunctions.js')


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

            const user = await signupDB.create({
                email: email,
                username: username,
                password: password
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

            user.save((err, doc) => {
                if (err) {
                    return errorResponse(res, 'Error')
                } else {
                    return successWithData(res, 'Data Submitted Successfully', doc)
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
                    email,
                    password
                });
                if (data) {
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
                       return success(res, 'Login Successfully')
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
                return errorResponse(res, 'Username Already exist')
            }else{
                return success(res, 'Username Available')
            }
        } catch (err) {
            console.log(err);
        }
      }


   
}