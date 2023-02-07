const signupDB = require('../../models/signup.model.js')
const backgroudCheckDB = require('../../models/background.model.js')
const vehicleInfosDB = require('../../models/vehicleInfo.model.js');
const paymentMethodDB = require('../../models/paymentMethod.model.js');
const tripDB = require('../../models/usersTrip.model.js');
const profileDB = require('../../models/profile.model.js');
const roleDB = require('../../models/memberRole.model.js');
const verifyToken = require("../../middleware/authentication.js");
const csvtojson = require("csvtojson");
const {
    success,
    successWithData,
    errorResponse,
    validationError
} = require('../../helpers/apiResponse.js')
const path = require('path');
const multer = require('multer');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, './profileUploads',);
//     },
//     filename: function (req, file, cb) {
//         cb(null, file.originalname);
//     }
// });

// const uploadImg = multer({
//     storage: storage
// }).single('profile_photo');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // console.log('file', file.fieldname);
        if (file.fieldname === 'upload_profile_photo') {
            cb(null, 'profileUploads/');

        } else if (file.fieldname === 'upload_driver_licence') {
            cb(null, 'uploadDriverlicenceUploads/');

        } else if (file.fieldname === 'upload_inssurance_card') {
            cb(null, 'uploadInssurancecardUploads/');

        } else if (file.fieldname === 'upload_vehicle_registration') {
            cb(null, 'vehicleRegistrationUploads/');

        }
    },
    filename: function (req, file, cb) {
        if (file.fieldname === 'upload_profile_photo') {
            cb(null, file.fieldname + Date.now() + path.extname(file.originalname));
        } else if (file.fieldname === 'upload_driver_licence') {
            cb(null, file.fieldname + Date.now() + path.extname(file.originalname));
        } else if (file.fieldname === "upload_inssurance_card") {
            cb(null, file.fieldname + Date.now() + path.extname(file.originalname));
        } else if (file.fieldname === "upload_vehicle_registration") {
            cb(null, file.fieldname + Date.now() + path.extname(file.originalname));
        }
    }
});
const uploadImg = multer({
    storage: storage,
}).fields(
    [
        {
            name: 'upload_profile_photo',
            maxCount: 1
        },
        {
            name: 'upload_driver_licence',
            maxCount: 1
        },
        {
            name: 'upload_inssurance_card',
            maxCount: 1
        },
        {
            name: 'upload_vehicle_registration',
            maxCount: 1
        }
    ]
);



module.exports = {
    verifyToken,
    uploadImg,
    // createProfile: async function (req, res) {
    //     try {
    //         const profile_id = await req.user.id;
    //         if (profile_id) {
    //             const {
    //                 fullname, university_name, student_id, university_address, mobile_no, student_university_email, gender, destination_contact_number, role, gender_preferences, rider_preference, phone_code, phone_no, legal_first_name, legal_middle_name, legal_last_name, license_number, license_state, zip_code, dob, ssn, make, model, year
    //             } = req.body
    //             var profile_photo;
    //             if (req.files.upload_profile_photo) {
    //                 profile_photo = req.files.upload_profile_photo[0].destination + req.files.upload_profile_photo[0].filename
    //             } else {
    //                 profile_photo = '';
    //             }

    //             switch (role) {
    //                 case 'driver':

    //                     if (!(fullname && university_name && student_id && university_address && mobile_no && student_university_email && gender && destination_contact_number && role && gender_preferences && rider_preference && phone_code && phone_no && make && model && year && req.files.upload_vehicle_registration[0].path && req.files.upload_inssurance_card[0].path && req.files.upload_driver_licence[0].path
    //                     )) {
    //                         return errorResponse(res, 'Required All Fields')
    //                     } else {

    //                         const finded = await signupDB.findOne({ _id: profile_id }).lean();

    //                         if (finded) {
    //                             var newvalues = {
    //                                 $set: {
    //                                     profile_id: profile_id,
    //                                     fullname: fullname,
    //                                     university_name: university_name,
    //                                     student_id: student_id,
    //                                     university_address: university_address,
    //                                     mobile_no: mobile_no,
    //                                     email: student_university_email,
    //                                     gender: gender,
    //                                     destination_contact_number: destination_contact_number,
    //                                     role: role,
    //                                     gender_preferences: gender_preferences,
    //                                     rider_preference: rider_preference,
    //                                     phone_code: phone_code,
    //                                     phone_no: phone_no,
    //                                     profile_photo: profile_photo,

    //                                 }
    //                             }
    //                             signupDB.updateOne({ _id: profile_id }, newvalues, (err, basicInfo) => {
    //                                 if (err) {
    //                                     return errorResponse(res, 'Please Try Again')
    //                                 } else {
    //                                     if (basicInfo) {
    //                                         const backgroundCheckExist = backgroudCheckDB.findOne({ driver_id: profile_id }).lean();

    //                                         if (backgroundCheckExist) {
    //                                             backgroudCheckDB.deleteMany({ driver_id: profile_id }, (err, deletedDoc) => {
    //                                                 if (err) {
    //                                                     return errorResponse(res, 'Please Try Again')
    //                                                 } else {
    //                                                     if (deletedDoc) {
    //                                                         if (legal_middle_name) {
    //                                                             var middle_name = legal_middle_name;
    //                                                         } else {
    //                                                             var middle_name = "";
    //                                                         }
    //                                                         let backgroundCheck = new backgroudCheckDB();

    //                                                         backgroundCheck.driver_id = profile_id,
    //                                                             backgroundCheck.legal_first_name = legal_first_name,
    //                                                             backgroundCheck.legal_middle_name = middle_name,
    //                                                             backgroundCheck.legal_last_name = legal_last_name,
    //                                                             backgroundCheck.license_number = license_number,
    //                                                             backgroundCheck.license_state = license_state,
    //                                                             backgroundCheck.zip_code = zip_code,
    //                                                             backgroundCheck.dob = dob,
    //                                                             backgroundCheck.ssn = ssn,
    //                                                             backgroundCheck.status = 1


    //                                                         backgroundCheck.save((err, backgroundCheckDoc) => {
    //                                                             if (err) {
    //                                                                 return errorResponse(res, 'Error')
    //                                                             } else {

    //                                                                 if (backgroundCheckDoc) {

    //                                                                     const vehicleInfoExist = vehicleInfosDB.findOne({ driver_id: profile_id }).lean();

    //                                                                     if (vehicleInfoExist) {

    //                                                                         vehicleInfosDB.deleteMany({ driver_id: profile_id }, (err, deletedDocFound) => {
    //                                                                             if (err) {
    //                                                                                 return errorResponse(res, 'Please Try Again')
    //                                                                             } else {
    //                                                                                 if (deletedDocFound) {
    //                                                                                     let vehicleInfo = new vehicleInfosDB();

    //                                                                                     vehicleInfo.driver_id = profile_id,
    //                                                                                         vehicleInfo.make = make,
    //                                                                                         vehicleInfo.model = model,
    //                                                                                         vehicleInfo.year = year,
    //                                                                                         vehicleInfo.upload_vehicle_registration = req.files.upload_vehicle_registration[0].destination + req.files.upload_vehicle_registration[0].filename,
    //                                                                                         vehicleInfo.upload_inssurance_card = req.files.upload_inssurance_card[0].destination + req.files.upload_inssurance_card[0].filename,
    //                                                                                         vehicleInfo.upload_driver_licence = req.files.upload_driver_licence[0].destination + req.files.upload_driver_licence[0].filename,
    //                                                                                         vehicleInfo.status = 1


    //                                                                                     vehicleInfo.save((err, vehicleCheckDoc) => {
    //                                                                                         if (err) {
    //                                                                                             return errorResponse(res, 'Error')
    //                                                                                         } else {
    //                                                                                             return success(res, 'Data Submitted Successfully')

    //                                                                                         }
    //                                                                                     })
    //                                                                                 }
    //                                                                             }
    //                                                                         });
    //                                                                     }


    //                                                                 }
    //                                                             }
    //                                                         })
    //                                                     }
    //                                                 }
    //                                             })
    //                                         }

    //                                     }
    //                                     //return successWithData(res, 'Data Updated Successfully', doc);
    //                                 }
    //                             })

    //                         }

    //                     }
    //                     break;
    //                 case 'rider':
    //                     if (!(fullname && university_name && student_id && university_address && mobile_no && student_university_email && gender && destination_contact_number && role && gender_preferences && rider_preference
    //                     )) {
    //                         return errorResponse(res, 'Required All Fields')
    //                     } else {

    //                         const finded = await signupDB.findOne({ _id: profile_id }).lean();

    //                         if (finded) {
    //                             var newvalues = {
    //                                 $set: {
    //                                     profile_id: profile_id,
    //                                     fullname: fullname,
    //                                     university_name: university_name,
    //                                     student_id: student_id,
    //                                     university_address: university_address,
    //                                     mobile_no: mobile_no,
    //                                     email: student_university_email,
    //                                     gender: gender,
    //                                     destination_contact_number: destination_contact_number,
    //                                     role: role,
    //                                     profile_photo: profile_photo,

    //                                 }
    //                             }
    //                             signupDB.updateOne({ _id: profile_id }, newvalues, (err, basicInfo) => {
    //                                 if (err) {
    //                                     return errorResponse(res, 'Please Try Again')
    //                                 } else {
    //                                     return success(res, 'Data Updated Successfully');
    //                                 }
    //                             })

    //                         }

    //                     }
    //                     break;

    //                 // default:
    //                 // code block
    //             }


    //         }

    //     } catch (err) {
    //         console.log(err)
    //     }
    // },

    createProfile: async function (req, res) {
        try {
            const profile_id = await req.user.id;
            if (profile_id) {
                const {
                    fullname, university_name, student_id, university_address, mobile_no,car_model, student_university_email, gender, destination_contact_number, type, gender_preferences, rider_preference, phone_code, phone_no, legal_first_name, legal_middle_name, legal_last_name, license_number, license_state, zip_code, dob, ssn, make, model, year
                } = req.body
                var profile_photo;

                if (req.files.upload_profile_photo) {
                    profile_photo = req.files.upload_profile_photo[0].destination + req.files.upload_profile_photo[0].filename
                } else {
                    profile_photo = '';
                }

                const finded = await signupDB.findOne({ _id: profile_id }).lean();
                //console.log("finded", finded)
                if (finded) {
                    const findProfile = await profileDB.findOne({ profile_id: profile_id, type: type }).lean();
                    //console.log("findProfile", findProfile)
                    if (findProfile) {
                        //return errorResponse(res, "User already exist with this type");
                         //-------------------------------------------
                         console.log("type", type)
                         switch (type) {
                             case '1':
                                //  console.log("1")
                                //  console.log(req.files.upload_vehicle_registration[0].filename );
                                //  console.log(req.files.upload_inssurance_card[0].filename);
                                //  console.log(req.files.upload_driver_licence[0].filename);
                                 
                                 if (!(fullname && university_name && car_model && student_id && university_address && mobile_no && student_university_email && gender && destination_contact_number && type && gender_preferences && rider_preference && phone_code && phone_no && make && model && year && req.files.upload_vehicle_registration[0].filename && req.files.upload_inssurance_card[0].filename && req.files.upload_driver_licence[0].filename
                                 )) {
                                     return errorResponse(res, 'Required All Fields')
                                 } else {   
                                     var newvalues = {
                                                     $set: {
                                                         profile_id: profile_id,
                                                         fullname: fullname,
                                                         university_name: university_name,
                                                         student_id: student_id,
                                                         university_address: university_address,
                                                         mobile_no: mobile_no,
                                                         email: student_university_email.toLowerCase(),
                                                         gender: gender,
                                                         car_model: car_model,
                                                         destination_contact_number: destination_contact_number,
                                                         type: type,
                                                         gender_preferences: gender_preferences,
                                                         rider_preference: rider_preference,
                                                         phone_code: phone_code,
                                                         phone_no: phone_no,
                                                         profile_photo: profile_photo,
                                                         updated_date: Date.now()                                                        
                 
                                                     }
                                                 }
                                                 profileDB.updateOne({ profile_id: profile_id , type: type }, newvalues, (err, updateBasicInfo) => { 

                                             if (err) {
                                                 return errorResponse(res, 'Please Try Again')
                                             } else {
                                                 if (updateBasicInfo) {
                                                     const backgroundCheckExist = backgroudCheckDB.findOne({ driver_id: profile_id }).lean();
 
                                                     if (backgroundCheckExist) {
                                                         backgroudCheckDB.deleteMany({ driver_id: profile_id }, (err, deletedDoc) => {
                                                             if (err) {
                                                                 return errorResponse(res, 'Please Try Again')
                                                             } else {
                                                                 if (deletedDoc) {
                                                                     if (legal_middle_name) {
                                                                         var middle_name = legal_middle_name;
                                                                     } else {
                                                                         var middle_name = "";
                                                                     }
                                                                     let backgroundCheck = new backgroudCheckDB();
 
                                                                     backgroundCheck.driver_id = profile_id,
                                                                         backgroundCheck.legal_first_name = legal_first_name,
                                                                         backgroundCheck.legal_middle_name = middle_name,
                                                                         backgroundCheck.legal_last_name = legal_last_name,
                                                                         backgroundCheck.license_number = license_number,
                                                                         backgroundCheck.license_state = license_state,
                                                                         backgroundCheck.zip_code = zip_code,
                                                                         backgroundCheck.dob = dob,
                                                                         backgroundCheck.ssn = ssn,
                                                                         backgroundCheck.status = 1,
                                                                         backgroundCheck.created_date = Date.now() 
 
                                                                     backgroundCheck.save((err, backgroundCheckDoc) => {
                                                                         if (err) {
                                                                             return errorResponse(res, 'Error')
                                                                         } else {
 
                                                                             if (backgroundCheckDoc) {
 
                                                                                 const vehicleInfoExist = vehicleInfosDB.findOne({ driver_id: profile_id }).lean();
 
                                                                                 if (vehicleInfoExist) {
 
                                                                                     vehicleInfosDB.deleteMany({ driver_id: profile_id }, (err, deletedDocFound) => {
                                                                                         if (err) {
                                                                                             return errorResponse(res, 'Please Try Again')
                                                                                         } else {
                                                                                             if (deletedDocFound) {
                                                                                                 let vehicleInfo = new vehicleInfosDB();
 
                                                                                                 vehicleInfo.driver_id = profile_id,
                                                                                                     vehicleInfo.make = make,
                                                                                                     vehicleInfo.model = model,
                                                                                                     vehicleInfo.year = year,
                                                                                                     vehicleInfo.upload_vehicle_registration = req.files.upload_vehicle_registration[0].destination + req.files.upload_vehicle_registration[0].filename,
                                                                                                     vehicleInfo.upload_inssurance_card = req.files.upload_inssurance_card[0].destination + req.files.upload_inssurance_card[0].filename,
                                                                                                     vehicleInfo.upload_driver_licence = req.files.upload_driver_licence[0].destination + req.files.upload_driver_licence[0].filename,
                                                                                                     vehicleInfo.status = 1,
                                                                                                     vehicleInfo.created_date = Date.now() 
 
                                                                                                 vehicleInfo.save(async (err, vehicleCheckDoc) => {
                                                                                                     if (err) {
                                                                                                         return errorResponse(res, 'Error')
                                                                                                     } else {
                                                                                                         //return success(res, 'Data Submitted Successfully')
                                                                                                         if (vehicleCheckDoc) {
                                                                                                             return success(res, 'Data Updated Successfully')
                                                                                                             
                                                                                                             
                                                                                                         }
 
                                                                                                     }
                                                                                                 })
                                                                                             }
                                                                                         }
                                                                                     });
                                                                                 }
 
 
                                                                             }
                                                                         }
                                                                     })
                                                                 }
                                                             }
                                                         })
                                                     }
 
                                                 }
                                                 //return successWithData(res, 'Data Updated Successfully', doc);
                                             }
                                         })
 
                                    
 
                                 }
                                 break;
                             case '2':
                                 if (!(fullname && university_name && student_id && university_address && mobile_no && student_university_email && gender && destination_contact_number && type && gender_preferences && rider_preference
                                 )) {
                                     return errorResponse(res, 'Required All Fields')
                                 } else {  
                                     var newvalues = {
                                         $set: {
                                             profile_id: profile_id,
                                             fullname: fullname,
                                             university_name: university_name,
                                             student_id: student_id,
                                             university_address: university_address,
                                             mobile_no: mobile_no,
                                             email: student_university_email.toLowerCase(),
                                             gender: gender,
                                             destination_contact_number: destination_contact_number,
                                             type: type,
                                             gender_preferences : gender_preferences,
                                             rider_preference : rider_preference,   
                                             profile_photo: profile_photo,
                                             updated_date: Date.now() 
                                         }
                                     }   
                                     

                                     await profileDB.updateOne({ profile_id: profile_id , type: type }, newvalues, async(err, updateBasicInfo) => {                              
 
                                             if (err) {
                                                 return errorResponse(res, 'Please Try Again')
                                             } else {                                                   
                                                 if(updateBasicInfo.modifiedCount == 1){                                                       
                                                     return success(res, 'Data Updated Successfully')   
                                                        
                                                 }
                                             }
                                         })
 
                                 }
                                 break;
                         }
                     
                    } else {
                        if(findProfile == null){
                            //console.log("type", type)
                            switch (type) {
                                case '1':
                                    // console.log("1")
                                    // console.log(req.files.upload_vehicle_registration[0].filename );
                                    // console.log(req.files.upload_inssurance_card[0].filename);
                                    // console.log(req.files.upload_driver_licence[0].filename);
                                    
                                    if (!(fullname && university_name && car_model && student_id && university_address && mobile_no && student_university_email && gender && destination_contact_number && type && gender_preferences && rider_preference && phone_code && phone_no && make && model && year && req.files.upload_vehicle_registration[0].filename && req.files.upload_inssurance_card[0].filename && req.files.upload_driver_licence[0].filename
                                    )) {
                                        return errorResponse(res, 'Required All Fields')
                                    } else {                                  
    
                                            let profileInfo = new profileDB();
    
                                            profileInfo.profile_id = profile_id,
                                            profileInfo.fullname = fullname,
                                            profileInfo.university_name = university_name,
                                            profileInfo.student_id = student_id,
                                            profileInfo.university_address = university_address,
                                            profileInfo.mobile_no = mobile_no,
                                            profileInfo.email = student_university_email.toLowerCase(),
                                            profileInfo.gender = gender,
                                            profileInfo.car_model = car_model,
                                            profileInfo.destination_contact_number = destination_contact_number,
                                            profileInfo.type = type,
                                            profileInfo.gender_preferences = gender_preferences,
                                            profileInfo.rider_preference = rider_preference,
                                            profileInfo.phone_code = phone_code,
                                            profileInfo.phone_no = phone_no,
                                            profileInfo.profile_photo = profile_photo,
                                            profileInfo.created_date= Date.now() 
                                            await profileInfo.save((err, basicInfo) => {
                                                if (err) {
                                                    return errorResponse(res, 'Please Try Again')
                                                } else {
                                                    if (basicInfo) {
                                                        const backgroundCheckExist = backgroudCheckDB.findOne({ driver_id: profile_id }).lean();
    
                                                        if (backgroundCheckExist) {
                                                            backgroudCheckDB.deleteMany({ driver_id: profile_id }, (err, deletedDoc) => {
                                                                if (err) {
                                                                    return errorResponse(res, 'Please Try Again')
                                                                } else {
                                                                    if (deletedDoc) {
                                                                        if (legal_middle_name) {
                                                                            var middle_name = legal_middle_name;
                                                                        } else {
                                                                            var middle_name = "";
                                                                        }
                                                                        let backgroundCheck = new backgroudCheckDB();
    
                                                                        backgroundCheck.driver_id = profile_id,
                                                                            backgroundCheck.legal_first_name = legal_first_name,
                                                                            backgroundCheck.legal_middle_name = middle_name,
                                                                            backgroundCheck.legal_last_name = legal_last_name,
                                                                            backgroundCheck.license_number = license_number,
                                                                            backgroundCheck.license_state = license_state,
                                                                            backgroundCheck.zip_code = zip_code,
                                                                            backgroundCheck.dob = dob,
                                                                            backgroundCheck.ssn = ssn,
                                                                            backgroundCheck.status = 1,
                                                                            backgroundCheck.created_date= Date.now() 
    
                                                                        backgroundCheck.save((err, backgroundCheckDoc) => {
                                                                            if (err) {
                                                                                return errorResponse(res, 'Error')
                                                                            } else {
    
                                                                                if (backgroundCheckDoc) {
    
                                                                                    const vehicleInfoExist = vehicleInfosDB.findOne({ driver_id: profile_id }).lean();
    
                                                                                    if (vehicleInfoExist) {
    
                                                                                        vehicleInfosDB.deleteMany({ driver_id: profile_id }, (err, deletedDocFound) => {
                                                                                            if (err) {
                                                                                                return errorResponse(res, 'Please Try Again')
                                                                                            } else {
                                                                                                if (deletedDocFound) {
                                                                                                    let vehicleInfo = new vehicleInfosDB();
    
                                                                                                    vehicleInfo.driver_id = profile_id,
                                                                                                        vehicleInfo.make = make,
                                                                                                        vehicleInfo.model = model,
                                                                                                        vehicleInfo.year = year,
                                                                                                        vehicleInfo.upload_vehicle_registration = req.files.upload_vehicle_registration[0].destination + req.files.upload_vehicle_registration[0].filename,
                                                                                                        vehicleInfo.upload_inssurance_card = req.files.upload_inssurance_card[0].destination + req.files.upload_inssurance_card[0].filename,
                                                                                                        vehicleInfo.upload_driver_licence = req.files.upload_driver_licence[0].destination + req.files.upload_driver_licence[0].filename,
                                                                                                        vehicleInfo.status = 1,
                                                                                                        vehicleInfo.created_date= Date.now()
    
                                                                                                    vehicleInfo.save(async (err, vehicleCheckDoc) => {
                                                                                                        if (err) {
                                                                                                            return errorResponse(res, 'Error')
                                                                                                        } else {
                                                                                                            //return success(res, 'Data Submitted Successfully')
                                                                                                            if (vehicleCheckDoc) {
                                                                                                                const findCountOfProfile = await profileDB.find({ profile_id: profile_id }).lean();
                                                                                                                //console.log("findCountOfProfile", findCountOfProfile.length)
                                                                                                                if(findCountOfProfile.length == 2){
                                                                                                                    var newvalues = {
                                                                                                                        $set: {
                                                                                                                            role_id: 3,
        
                                                                                                                        }
                                                                                                                    }
                                                                                                                    signupDB.updateOne({ _id: profile_id }, newvalues, (err, updateRoleInfo) => { 
                                                                                                                        if (err) {
                                                                                                                            return errorResponse(res, 'Error while updating roles')
                                                                                                                        }else{
                                                                                                                            return successWithData(res, 'Data Submitted Successfully', updateRoleInfo)
                                                                                                                           
                                                                                                                        }
                                                                                                                    })
                                                                                                                } else{
                                                                                                                    var newvalues = {
                                                                                                                        $set: {
                                                                                                                            role_id: type,
        
                                                                                                                        }
                                                                                                                    }
                                                                                                                    signupDB.updateOne({ _id: profile_id }, newvalues, (err, updateRoleInfo) => { 
                                                                                                                        if (err) {
                                                                                                                            return errorResponse(res, 'Error while updating roles')
                                                                                                                        }else{
                                                                                                                            return successWithData(res, 'Data Submitted Successfully', updateRoleInfo)
                                                                                                                           
                                                                                                                        }
                                                                                                                    })
                                                                                                                }   
                                                                                                                
                                                                                                                
                                                                                                            }
    
                                                                                                        }
                                                                                                    })
                                                                                                }
                                                                                            }
                                                                                        });
                                                                                    }
    
    
                                                                                }
                                                                            }
                                                                        })
                                                                    }
                                                                }
                                                            })
                                                        }
    
                                                    }
                                                    //return successWithData(res, 'Data Updated Successfully', doc);
                                                }
                                            })
    
                                       
    
                                    }
                                    break;
                                case '2':
                                    if (!(fullname && university_name && student_id && university_address && mobile_no && student_university_email && gender && destination_contact_number && type && gender_preferences && rider_preference
                                    )) {
                                        return errorResponse(res, 'Required All Fields')
                                    } else {     
                                        
                                        let profileInfo = new profileDB();
    
                                        profileInfo.profile_id = profile_id,
                                        profileInfo.fullname = fullname,
                                        profileInfo.university_name = university_name,
                                        profileInfo.student_id = student_id,
                                        profileInfo.university_address = university_address,
                                        profileInfo.mobile_no = mobile_no,
                                        profileInfo.email = student_university_email.toLowerCase(),
                                        profileInfo.gender = gender,
                                        profileInfo.destination_contact_number = destination_contact_number,
                                        profileInfo.type = type,
                                        profileInfo.gender_preferences = gender_preferences,
                                        profileInfo.rider_preference = rider_preference,                                        
                                        profileInfo.profile_photo = profile_photo,
                                        profileInfo.created_date = Date.now()

                                        await profileInfo.save(async(err, basicInfo) => {                              
    
                                                if (err) {
                                                    return errorResponse(res, 'Please Try Again')
                                                } else {
                                                    //return success(res, 'Data Updated Successfully');
                                                    if(basicInfo){
                                                       
                                                            const findCountOfProfile = await profileDB.find({ profile_id: profile_id }).lean();
                                                            //console.log("findCountOfProfile", findCountOfProfile)
                                                            if(findCountOfProfile.length == 2){
                                                                var newvalues = {
                                                                    $set: {
                                                                        role_id: 3,

                                                                    }
                                                                }
                                                                signupDB.updateOne({ _id: profile_id }, newvalues, (err, updateRoleInfo) => { 
                                                                    if (err) {
                                                                        return errorResponse(res, 'Error while updating roles')
                                                                    }else{
                                                                        return successWithData(res, 'Data Submitted Successfully', updateRoleInfo)
                                                                       
                                                                    }
                                                                })
                                                            }else{
                                                                var newvalues = {
                                                                    $set: {
                                                                        role_id: type,

                                                                    }
                                                                }
                                                                signupDB.updateOne({ _id: profile_id }, newvalues, (err, updateRoleInfo) => {
                                                                    if (err) {
                                                                        return errorResponse(res, 'Error while updating roles')
                                                                    }else{
                                                                        if(updateRoleInfo){
                                                                        return successWithData(res, 'Data Submitted Successfully', updateRoleInfo)
                                                                        }

                                                                    }
                                                                 })
                                                            } 
                                                    }
                                                }
                                            })
    
                                      
    
                                    }
                                    break;
                            }
                        }
                           
                       
                    }

                }
            }

            } catch (err) {
                console.log(err)
            }
        },

        savePaymentMethod: async function (req, res) {
            try {
                const profile_id = await req.user.id;
                if (profile_id) {
                    const {
                        payment_type, card_no, name_on_card, expiration_date, cvv
                    } = req.body

                    switch (payment_type) {
                        case 'mastercard':
                            if (!(payment_type && card_no && name_on_card && expiration_date && cvv)) {
                                return errorResponse(res, 'Required All Fields')
                            } else {
                                let paymentMethod = new paymentMethodDB();

                                paymentMethod.user_id = profile_id,
                                    paymentMethod.payment_type = payment_type,
                                    paymentMethod.card_no = card_no,
                                    paymentMethod.name_on_card = name_on_card,
                                    paymentMethod.expiration_date = expiration_date,
                                    paymentMethod.cvv = cvv,
                                    paymentMethod.status = 1

                                paymentMethod.save((err, paymentmethodDoc) => {
                                    if (err) {
                                        return errorResponse(res, 'Error')
                                    } else {
                                        return success(res, 'Payment Method Added Successfully');
                                    }

                                });
                            }
                            break;

                        case 'visa':
                            if (!(payment_type && card_no && name_on_card && expiration_date && cvv)) {
                                return errorResponse(res, 'Required All Fields')
                            } else {
                                let paymentMethod = new paymentMethodDB();

                                paymentMethod.user_id = profile_id,
                                    paymentMethod.payment_type = payment_type,
                                    paymentMethod.card_no = card_no,
                                    paymentMethod.name_on_card = name_on_card,
                                    paymentMethod.expiration_date = expiration_date,
                                    paymentMethod.cvv = cvv,
                                    paymentMethod.status = 1

                                paymentMethod.save((err, paymentmethodDoc) => {
                                    if (err) {
                                        return errorResponse(res, 'Error')
                                    } else {
                                        return success(res, 'Payment Method Added Successfully');
                                    }

                                });
                            }
                            break;

                    }



                }
            } catch (err) {
                console.log(err);
            }
        },

        getUserProfileData: async function (req, res) {
            try {
                const profile_id = await req.user.id;
                if (profile_id) {
                    var data = await signupDB.aggregate([{
                        $match: {
                            '_id': ObjectId(profile_id)                                                     
                        }
                    },
                    {
                        $lookup: {
                            from: 'profiles',
                            localField: '_id',
                            foreignField: 'profile_id',
                            as: 'profileDetails',
                        },

                    },
                    {
                        $lookup: {
                            from: 'backgroundchecks',
                            localField: '_id',
                            foreignField: 'driver_id',
                            as: 'backgroundcheckDetails',
                        }

                    },

                    {
                        $lookup: {
                            from: 'paymentmethods',
                            localField: '_id',
                            foreignField: 'user_id',
                            as: 'paymentmethodDetails'
                        }
                    },

                    {
                        $lookup: {
                            from: 'vehicleinfos',
                            localField: '_id',
                            foreignField: 'driver_id',
                            as: 'vehicleinfoDetails',
                        },
                    },

                    {
                        $lookup: {
                            from: 'usertrips',
                            localField: '_id',
                            foreignField: 'user_id',
                            as: 'usertripDetails',
                        },
                    },

                    {
                        $project: {
                            'email': 1,
                            'username': 1,                            
                            'profileDetails': 1,                            
                            'backgroundcheckDetails': 1,
                            'paymentmethodDetails': 1,
                            'vehicleinfoDetails': 1,
                            'usertripDetails' : 1

                        }
                    }

                    ])
                    return successWithData(res, 'Details found Successfully', data);
                }
            } catch (err) {
                console.log(err);
            }
        },
        addVehicles: async function (req, res) { 
            
                csvtojson().fromFile("demo.csv").then(csvData => {
                    //console.log(csvData);
                    signupDB.insertMany(csvData).then(function () {
                        //console.log("success");
                        return success(res,"Csv data inserted successfully")
                    }).catch(function (err){
                        console.log(err)
                    })
                })
           
        },

        createTrip: async function (req, res) {
            try {
                const profile_id = await req.user.id;
                if (profile_id) {
                    //console.log(profile_id)

                    if (req.body.type == '' || req.body.type == null || req.body.type == undefined) {
                        return validationError(res, 'type Field is required')
                    } else {
                        const finded = await signupDB.findOne({ _id: profile_id }).lean();
                        if (finded) {

                            switch (req.body.type) {
                                case '1':

                                    const requiredParam = [
                                        'actionType',
                                        'pickup_location',
                                        'pickup_lat',
                                        'pickup_long',
                                        'destination_location',
                                        'destination_lat',
                                        'destination_long',
                                        'trip_distance',
                                        'trip',
                                        'depart_date_time',
                                        //'depart_time',
                                        'amount',
                                        //'payment',
                                        'number_of_riders',
                                        'number_of_bags',
                                        'special_request'
                                    ];

                                    var emptyArry = [];
                                    var formdata = req.body;
                                    var data = Object.keys(req.body);

                                    let excludeFields = ['return_date_time','request_expiration'];                                    
                                    data = data.filter(item => !excludeFields.includes(item))

                                    var result = requiredParam.filter(n => !data.includes(n));
                                    if (result != '') {
                                        var responseMessageRequired = result + " " + 'fields are required.';
                                        return validationError(res, responseMessageRequired);
                                    }
                                    data.forEach(element => {
                                        if (formdata[element] == '') {
                                            emptyArry.push(element);
                                        }
                                    });
                                    var responseMessage = emptyArry + ". " + "Data can't be empty.    ";
                                    if (emptyArry != '') {
                                        return validationError(res, responseMessage);
                                    }else{
                                        var returnDateTime;
                                        //var returnTime;
                                        if (req.body.trip == 'rounded') {
                                            //console.log('roundddd', req.body.special_request)
                                            if ((!(req.body.return_date_time == '' || req.body.return_date_time == undefined))) {
                                                returnDateTime = new Date(req.body.return_date_time);
                                                //returnTime = req.body.return_time;
                                            } else {
                                                return validationError(res, "return_date_time field are required")
                                            }
                                        } else {
                                            returnDateTime = "0000-01-01T00:00:00.000Z";
                                            //returnTime = "NA";
                                        }
    
                                        if (returnDateTime) {
                                            //console.log("returnDateTime", returnDateTime)
                                            let userTrip = await new tripDB();
    
                                            userTrip.user_id = profile_id,
                                            userTrip.type = req.body.type,
                                            userTrip.actionType = req.body.actionType,
                                            userTrip.pickup_location = req.body.pickup_location;
                                            userTrip.pickup_lat = req.body.pickup_lat;
                                            userTrip.pickup_long = req.body.pickup_long;
                                            userTrip.destination_location = req.body.destination_location;
                                            userTrip.destination_lat = req.body.destination_lat;
                                            userTrip.destination_long = req.body.destination_long;
                                            userTrip.trip_distance = req.body.trip_distance;
                                            userTrip.trip = req.body.trip;
                                            userTrip.depart_date_time = req.body.depart_date_time;
                                            //userTrip.depart_time = req.body.depart_time;
                                            userTrip.return_date_time = returnDateTime;
                                            //userTrip.return_time = returnTime;
                                            userTrip.amount = req.body.amount;
                                            userTrip.payment = "";
                                            userTrip.request_expiration = "";
                                            userTrip.number_of_riders = req.body.number_of_riders;
                                            userTrip.number_of_bags = req.body.number_of_bags;
                                            userTrip.special_request = req.body.special_request;
                                            userTrip.status = 0;                                        
                                            userTrip.trip_accepted = 0 ;
                                            userTrip.seat_left_need = req.body.number_of_riders;
                                            userTrip.is_trip_full = 0;
                                            userTrip.received_offer = 0;
                                            userTrip.created_date = Date.now(); 
                                            userTrip.updated_date = Date.now();    
                                            //console.log("userTrip", userTrip)
    
                                            await userTrip.save((err, tripDoc) => {
                                                if (err) {
                                                    //console.log("err",err)
                                                    return errorResponse(res, 'Issue while submitting data')
                                                    //return err;
                                                } else {
                                                    if(tripDoc){
                                                        return success(res, 'Trip Added Successfully');
                                                    }                                                
                                                }
    
                                            });
                                        }
                                    }

                                    break;

                                case '2':

                                    if (req.body.actionType == 'ride') {
                                        const requiredParams = [
                                            //'actionType',
                                            'pickup_location',
                                            'pickup_lat',
                                            'pickup_long',
                                            'destination_location',
                                            'destination_lat',
                                            'destination_long',
                                             'trip_distance',
                                            'trip',
                                            'depart_date_time',
                                            //'depart_time',
                                            'amount',
                                            'payment',
                                            'number_of_riders',
                                            'number_of_bags',
                                            'special_request',
                                            'request_expiration'
                                        ];
    
                                        var emptyArry = [];
                                        var formdata = req.body;
                                        var data = Object.keys(req.body);
                                        let excludeField = ['return_date_time'];                                    
                                        data = data.filter(item => !excludeField.includes(item))
                                       
                                        var result = requiredParams.filter(n => !data.includes(n));
                                        if (result != '') {
                                            var responseMessageRequired = result + " " + 'fields are required.';
                                            return validationError(res, responseMessageRequired);
                                        }
                                        data.forEach(element => {
                                            if (formdata[element] == '') {
                                                emptyArry.push(element);
                                            }
                                        });
                                        var responseMessage = emptyArry + ". " + "Data can't be empty.    ";
                                        if (emptyArry != '') {
                                            return validationError(res, responseMessage);
                                        }else{
                                            var returnDateTime;
                                            //var returnTime;                                    
                                            if (req.body.trip == 'rounded') {
                                                //console.log('roundddd', req.body.special_request)
                                                if ((!(req.body.return_date_time == '' || req.body.return_date_time == undefined)) 
                                                    ) {
                                                    returnDateTime = new Date(req.body.return_date_time);
                                                    //returnTime = req.body.return_time;
                                                } else {
                                                    return validationError(res, "return_date or return_time fields are required")
                                                }
                                            } else {
                                                returnDateTime = "0000-01-01T00:00:00.000Z";
                                                //returnTime = "NA";
                                            }
                                            if(returnDateTime){
                                                let riderTrip = new tripDB();
    
                                                riderTrip.user_id = profile_id,
                                                riderTrip.type = req.body.type,
                                                riderTrip.actionType = 'ride',
                                                riderTrip.pickup_location = req.body.pickup_location;
                                                riderTrip.pickup_lat = req.body.pickup_lat;
                                                riderTrip.pickup_long = req.body.pickup_long;
                                                riderTrip.destination_location = req.body.destination_location;
                                                riderTrip.destination_lat = req.body.destination_lat;
                                                riderTrip.destination_long = req.body.destination_long;
                                                riderTrip.trip_distance = req.body.trip_distance;
                                                riderTrip.trip = req.body.trip;
                                                riderTrip.depart_date_time = req.body.depart_date_time;
                                                //riderTrip.depart_time = req.body.depart_time;
                                                riderTrip.return_date_time = returnDateTime;
                                                //riderTrip.return_time = returnTime;
                                                riderTrip.amount = req.body.amount;
                                                riderTrip.payment = req.body.payment;
                                                riderTrip.request_expiration = req.body.request_expiration;
                                                riderTrip.number_of_riders = req.body.number_of_riders;
                                                riderTrip.number_of_bags = req.body.number_of_bags;
                                                riderTrip.special_request = req.body.special_request;                                        
                                                riderTrip.status = 0;
                                                riderTrip.trip_accepted = 0 ;
                                                riderTrip.seat_left_need = req.body.number_of_riders;
                                                riderTrip.is_trip_full = 0;
                                                riderTrip.received_offer = 0;
                                                riderTrip.created_date = Date.now(); 
                                                riderTrip.updated_date = Date.now(); 
                                                await riderTrip.save((err, tripDoc) => {
                                                    if (err) {
                                                        //console.log("err",err)
                                                        return errorResponse(res, 'Issue while submitting data')
                                                    } else {
                                                        if(tripDoc){
                                                            return success(res, 'Trip Added Successfully');
                                                        }
                                                    
                                                    }
            
                                                }); 
                                            }  
                                        }
    
                                       
                                                                  
                                        
                                    } else {

                                        const requiredParams = [
                                            //'actionType',
                                            'pickup_location',
                                            'pickup_lat',
                                            'pickup_long',
                                            'destination_location',
                                            'destination_lat',
                                            'destination_long',
                                             'trip_distance',
                                            'trip',
                                            'depart_date_time',
                                            //'depart_time',
                                            'amount',
                                            'payment',
                                            //'number_of_riders',
                                            //'number_of_bags',
                                            //'special_request',
                                            //'request_expiration'
                                        ];
    
                                        var emptyArry = [];
                                        var formdata = req.body;
                                        var data = Object.keys(req.body);
                                        //let excludeField = ['return_date_time'];                                    
                                        //data = data.filter(item => !excludeField.includes(item))
                                       
                                        var result = requiredParams.filter(n => !data.includes(n));
                                        if (result != '') {
                                            var responseMessageRequired = result + " " + 'fields are required.';
                                            return validationError(res, responseMessageRequired);
                                        }
                                        data.forEach(element => {
                                            if (formdata[element] == '') {
                                                emptyArry.push(element);
                                            }
                                        });
                                        var responseMessage = emptyArry + ". " + "Data can't be empty.    ";
                                        if (emptyArry != '') {
                                            return validationError(res, responseMessage);
                                        }else{
                                            let riderTrip = new tripDB();

                                            riderTrip.user_id = profile_id,
                                            riderTrip.type = req.body.type,
                                            riderTrip.actionType = 'delivery',
                                            riderTrip.pickup_location = req.body.pickup_location;
                                            riderTrip.pickup_lat = req.body.pickup_lat;
                                            riderTrip.pickup_long = req.body.pickup_long;
                                            riderTrip.destination_location = req.body.destination_location;
                                            riderTrip.destination_lat = req.body.destination_lat;
                                            riderTrip.destination_long = req.body.destination_long;
                                            riderTrip.trip_distance = req.body.trip_distance;
                                            riderTrip.trip = req.body.trip;
                                            riderTrip.depart_date_time = req.body.depart_date_time;
                                            //riderTrip.depart_time = req.body.depart_time;
                                            riderTrip.return_date_time = returnDateTime;
                                            //riderTrip.return_time = returnTime;
                                            riderTrip.amount = req.body.amount;
                                            riderTrip.payment = req.body.payment;
                                            riderTrip.request_expiration = 0;
                                            riderTrip.number_of_riders = 0;
                                            riderTrip.number_of_bags = 0;
                                            riderTrip.special_request = 'NA';                                        
                                            riderTrip.status = 0;
                                            riderTrip.trip_accepted = 0 ;
                                            riderTrip.seat_left_need = 0;
                                            riderTrip.is_trip_full = 0;
                                            riderTrip.received_offer = 0;
                                            riderTrip.created_date = Date.now(); 
                                            riderTrip.updated_date = Date.now(); 
                                            await riderTrip.save((err, tripDoc) => {
                                                if (err) {
                                                    //console.log("err",err)
                                                    return errorResponse(res, 'Issue while submitting data')
                                                } else {
                                                    if(tripDoc){
                                                        return success(res, 'Trip Added Successfully');
                                                    }
                                                
                                                }
        
                                            });                             
                                        }                                       

                                                                   
                                    }

                                    //if (actionType) {  
                                        
                                    // }

                                    break;
                            }


                        } else {
                            return errorResponse(res, 'User is not active')
                        }
                    }

                }
            } catch (err) {
                console.log(err);
            }
        },

        getAllTrip: async function(req,res){
            try{
                const profile_id = await req.user.id;
                if (profile_id) {
                    if (req.body.type == '' || req.body.type == null || req.body.type == undefined) {
                        return validationError(res, 'type Field is required')
                    } else { 
                        const Trip=await tripDB.find({ user_id : profile_id,type: req.body.type });
                        //console.log("Trip", Trip)
                    if(Trip.length > 0){
                        return successWithData(res,'Trip Found',Trip);
                        
                    }else{
                        return success(res,'Trip Not Found');
                    }
                    }
                    
                }
                
            }catch(err){
                console.log(err);
            }
        },

        checkUserProfileExist: async function(req,res){
            try{
                const profile_id = await req.user.id;
                if (profile_id) {
                 const userProfile=await profileDB.find({ profile_id : profile_id }); 
                 //console.log("userProfile", userProfile)
                 if(userProfile.length > 0){
                    return successWithData(res,"Profile already submitted", userProfile)
                 }else{
                    return success(res,"Profile not created yet")
                 }
                    
                }
                
            }catch(err){
                console.log(err);
            }
        }


    }