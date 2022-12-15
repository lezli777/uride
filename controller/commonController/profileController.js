const signupDB = require('../../models/signup.model.js')
const profileDB = require('../../models/profile.model.js')
const auth = require("../../middleware/authentication.js");
const {
    success,
    successWithData,
    errorResponse,
    validationError
} = require('../../helpers/apifunctions.js')

const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './profileUploads',);
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const uploadImg = multer({
    storage: storage
}).single('profile_photo');



module.exports = {
     auth,
    uploadImg,
    createProfile: async function (req, res) {
        try {
            const {
                fullname, university_name, student_id, university_address, mobile_no, student_university_email, gender, payment_method, destination_contact_number, role, gender_preferences, rider_preference, phone_code, phone_no
            } = req.body
            const profile_photo = req.file.path
            if (!(fullname && university_name && student_id && university_address && mobile_no && student_university_email && gender && payment_method && destination_contact_number && role && gender_preferences && rider_preference && phone_code && phone_no && profile_photo
            )) {
                return errorResponse(res, 'Required All Fields')
            } else {
                const user = await profileDB.create({
                    fullname: fullname,
                    university_name: university_name,
                    student_id: student_id,
                    university_address: university_address,
                    mobile_no: mobile_no,
                    student_university_email: student_university_email,
                    gender: gender,
                    payment_method: payment_method,
                    destination_contact_number: destination_contact_number,
                    role: role,
                    gender_preferences: gender_preferences,
                    rider_preference: rider_preference,
                    phone_code: phone_code,
                    phone_no: phone_no,
                    profile_photo: profile_photo,
                    status: 1
                })
                await user.save((err, profiledoc) => {
                    if (err) {
                        return errorResponse(res, 'Please Try Again')
                    } else {
                        return successWithData(res, 'Data Submitted Successfully', profiledoc)
                    }

                })
            }
            //   });
        } catch (err) {
            console.log(err)
        }
    },

    getProfile: async function (req, res) {
        try {
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