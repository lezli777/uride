const signupDB = require('../../models/signup.model.js')
const profileDB = require('../../models/profile.model.js')
const config = require('../../config/db.js')
const jwt = require('jsonwebtoken');
const {
    success,
    successWithData,
    errorResponse,
    validationError
} = require('../../helpers/apifunctions.js')


module.exports = {
   
      createProfile: async function (req, res) {
        try{
            // const {username} = req.body;
            // const validateuser = await signupDB.findOne({ username }).lean();
            // if(validateuser){
            //     return errorResponse(res, 'Username Already exist')
            // }else{
            //     return success(res, 'Username Available')
            // }
        } catch (err) {
            console.log(err);
        }
      }


   
}