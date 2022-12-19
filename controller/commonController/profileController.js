const signupDB = require('../../models/signup.model.js')
const verifyToken = require("../../middleware/authentication.js");
const {
    success,
    successWithData,
    errorResponse,
    validationError
} = require('../../helpers/apiResponse.js')

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
    verifyToken,
    uploadImg,
    createProfile: async function (req, res) {
        try {
            const profile_id = await req.user.id;
            if (profile_id) {  
                const {
                    fullname, university_name, student_id, university_address, mobile_no, student_university_email, gender, payment_method, destination_contact_number, role, gender_preferences , rider_preference, phone_code, phone_no, legal_first_name,legal_middle_name,legal_last_name,license_number,license_state,zip_code,dob,ssn
                } = req.body
                const profile_photo = req.file.path

                switch(req.body.role) {
                    case driver:
                        
                        if (!(fullname && university_name && student_id && university_address && mobile_no && student_university_email && gender && payment_method && destination_contact_number && role && gender_preferences && rider_preference && phone_code && phone_no && profile_photo 
                            )) {
                                return errorResponse(res, 'Required All Fields')
                            } else {
            
                                const finded = await signupDB.findOne({ _id:profile_id }).lean();
                                console.log("finded", finded)
                                if (finded) {
                                    var newvalues = {
                                        $set: {
                                            profile_id: profile_id,
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
            
                                        }
                                    }
                                    signupDB.updateOne({ _id:profile_id },newvalues, (err, basicInfo) => {
                                        if (err) {
                                            return errorResponse(res, 'Please Try Again')
                                        } else {
                                            if(basicInfo){

                                            }
                                            //return successWithData(res, 'Data Updated Successfully', doc);
                                        }
                                    })
            
                                } 
            
                            }
                      break;
                    case rider:
                        //const { gender_preferences , rider_preference } = req.body
                        if (!(gender_preferences && rider_preference)) {
                                return errorResponse(res, 'Required All Fields')
                            } else {            
                                const finded = await signupDB.findOne({ _id:profile_id });
                                console.log("finded", finded)
                                if (finded) {
                                    var newvalues = {
                                        $set: {                                           
                                            gender_preferences: gender_preferences,
                                            rider_preference: rider_preference,
                                        }
                                    }
                                    await finded.updateOne(newvalues, (err, doc) => {
                                        if (err) {
                                            return errorResponse(res, 'Please Try Again')
                                        } else {
                                            return successWithData(res, 'Data Updated Successfully', doc);
                                        }
                                    })
            
                                } 
            
                            }
                      break;
                      case background_check:
                        // const {legal_first_name,legal_middle_name,legal_last_name,license_number,license_state,zip_code,dob,ssn} = req.body
                        if (!(legal_first_name && legal_middle_name && legal_last_name && license_number&&license_state && zip_code && dob && ssn
                            )) {
                                return errorResponse(res, 'Required All Fields')
                            } else {
            
                                const finded = await signupDB.findOne({ _id:profile_id });
                                console.log("finded", finded)
                                if (finded) {           
                                     var background = backgroundcheckDB()
                                            background.driver_id = profile_id,
                                            background.legal_first_name = legal_first_name,
                                            background.legal_middle_name = legal_middle_name,
                                            background.legal_last_name = legal_last_name,
                                            background.license_number= license_number,
                                            background.license_state= license_state,
                                            background.zip_code= zip_code,
                                            background.dob= dob,
                                            background.ssn= ssn,
                                      
                                    await background.save((background),(err, doc) => {
                                        if (err) {
                                            return errorResponse(res, 'Please Try Again')
                                        } else {
                                            return successWithData(res, 'Save Successfully', doc);
                                        }
                                    })
            
                                } 
            
                            }
                      break;
                      case add_vehicle:
                        if (!(fullname && university_name && student_id && university_address && mobile_no && student_university_email && gender && payment_method && destination_contact_number && role && gender_preferences && rider_preference && phone_code && phone_no && profile_photo
                            )) {
                                return errorResponse(res, 'Required All Fields')
                            } else {
            
                                const finded = await signupDB.findOne({ _id:profile_id });
                                console.log("finded", finded)
                                if (finded) {
                                    var newvalues = {
                                        $set: {
                                            profile_id: profile_id,
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
            
                                        }
                                    }
                                    finded.updateOne(newvalues, (err, doc) => {
                                        if (err) {
                                            return errorResponse(res, 'Please Try Again')
                                        } else {
                                            return successWithData(res, 'Data Updated Successfully', doc);
                                        }
                                    })
            
                                } 
            
                            }
                      break;
                   // default:
                      // code block
                  }
                
                
            }

        } catch (err) {
            console.log(err)
        }
    },

    // createProfile: async function (req, res) {
    //     try {
    //         const profile_id = await req.user.id;
    //         if (profile_id) {
    //             const {
    //                 fullname, university_name, student_id, university_address, mobile_no, student_university_email, gender, payment_method, destination_contact_number, role
    //             } = req.body
    //             const profile_photo = req.file.path
    //             if (!(fullname && university_name && student_id && university_address && mobile_no && student_university_email && gender && payment_method && destination_contact_number && role 
    //             )) {
    //                 return errorResponse(res, 'Required All Fields')
    //             } else {

    //                 const finded = await signupDB.findOne({ _id : profile_id });
    //                 console.log("finded", finded)
    //                 if (finded) {
    //                     var newvalues = {
    //                         $set: {
    //                             profile_id: profile_id,
    //                             fullname: fullname,
    //                             university_name: university_name,
    //                             student_id: student_id,
    //                             university_address: university_address,
    //                             mobile_no: mobile_no,
    //                             student_university_email: student_university_email,
    //                             gender: gender,
    //                             payment_method: payment_method,
    //                             destination_contact_number: destination_contact_number,
    //                             role: role
                               
    //                         }
    //                     }
    //                     finded.updateOne(newvalues, (err, doc) => {
    //                         if (err) {
    //                             return errorResponse(res, 'Please Try Again')
    //                         } else {
    //                             return successWithData(res, 'Data Updated Successfully', doc);
    //                         }
    //                     })

    //                 } 

    //             }
                
    //         }

    //     } catch (err) {
    //         console.log(err)
    //     }
    // },

    createPreference: async function (req, res) {
        try {
            const profile_id = await req.user.id;
            if (profile_id) {
                const {
                    fullname, university_name, student_id, university_address, mobile_no, student_university_email, gender, payment_method, destination_contact_number, role, gender_preferences, rider_preference, phone_code, phone_no
                } = req.body
                const profile_photo = req.file.path
                if (!(fullname && university_name && student_id && university_address && mobile_no && student_university_email && gender && payment_method && destination_contact_number && role && gender_preferences && rider_preference && phone_code && phone_no && profile_photo
                )) {
                    return errorResponse(res, 'Required All Fields')
                } else {

                    const finded = await profileDB.findOne({ profile_id });
                    console.log("finded", finded)
                    if (finded) {
                        var newvalues = {
                            $set: {                                
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
                                //status: 1

                            }
                        }
                        finded.updateOne(newvalues, (err, doc) => {
                            if (err) {
                                return errorResponse(res, 'Please Try Again')
                            } else {
                                return successWithData(res, 'Data Updated Successfully', doc);
                            }
                        })

                    } else {
                        const user = await profileDB.create({
                            profile_id: profile_id,
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

                }
                
            }

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