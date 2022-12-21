const signupDB = require('../../models/signup.model.js')
const backgroudCheckDB = require('../../models/background.model.js')
const vehicleInfosDB = require('../../models/vehicleInfo.model.js');
const paymentMethodDB = require('../../models/paymentMethod.model');
const verifyToken = require("../../middleware/authentication.js");
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
    createProfile: async function (req, res) {
        try {
            const profile_id = await req.user.id;
            if (profile_id) {
                const {
                    fullname, university_name, student_id, university_address, mobile_no, student_university_email, gender, destination_contact_number, role, gender_preferences, rider_preference, phone_code, phone_no, legal_first_name, legal_middle_name, legal_last_name, license_number, license_state, zip_code, dob, ssn, make, model, year
                } = req.body
                var profile_photo;
                if (req.files.upload_profile_photo) {
                    profile_photo = req.files.upload_profile_photo[0].destination + req.files.upload_profile_photo[0].filename
                } else {
                    profile_photo = '';
                }

                switch (role) {
                    case 'driver':

                        if (!(fullname && university_name && student_id && university_address && mobile_no && student_university_email && gender && destination_contact_number && role && gender_preferences && rider_preference && phone_code && phone_no && make && model && year && req.files.upload_vehicle_registration[0].path && req.files.upload_inssurance_card[0].path && req.files.upload_driver_licence[0].path
                        )) {
                            return errorResponse(res, 'Required All Fields')
                        } else {

                            const finded = await signupDB.findOne({ _id: profile_id }).lean();

                            if (finded) {
                                var newvalues = {
                                    $set: {
                                        profile_id: profile_id,
                                        fullname: fullname,
                                        university_name: university_name,
                                        student_id: student_id,
                                        university_address: university_address,
                                        mobile_no: mobile_no,
                                        email: student_university_email,
                                        gender: gender,
                                        destination_contact_number: destination_contact_number,
                                        role: role,
                                        gender_preferences: gender_preferences,
                                        rider_preference: rider_preference,
                                        phone_code: phone_code,
                                        phone_no: phone_no,
                                        profile_photo: profile_photo,

                                    }
                                }
                                signupDB.updateOne({ _id: profile_id }, newvalues, (err, basicInfo) => {
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
                                                                backgroundCheck.status = 1


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
                                                                                            vehicleInfo.status = 1


                                                                                        vehicleInfo.save((err, vehicleCheckDoc) => {
                                                                                            if (err) {
                                                                                                return errorResponse(res, 'Error')
                                                                                            } else {
                                                                                                return success(res, 'Data Submitted Successfully')

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

                        }
                        break;
                    case 'rider':
                        if (!(fullname && university_name && student_id && university_address && mobile_no && student_university_email && gender && destination_contact_number && role && gender_preferences && rider_preference
                        )) {
                            return errorResponse(res, 'Required All Fields')
                        } else {

                            const finded = await signupDB.findOne({ _id: profile_id }).lean();

                            if (finded) {
                                var newvalues = {
                                    $set: {
                                        profile_id: profile_id,
                                        fullname: fullname,
                                        university_name: university_name,
                                        student_id: student_id,
                                        university_address: university_address,
                                        mobile_no: mobile_no,
                                        email: student_university_email,
                                        gender: gender,
                                        destination_contact_number: destination_contact_number,
                                        role: role,
                                        profile_photo: profile_photo,

                                    }
                                }
                                signupDB.updateOne({ _id: profile_id }, newvalues, (err, basicInfo) => {
                                    if (err) {
                                        return errorResponse(res, 'Please Try Again')
                                    } else {
                                        return success(res, 'Data Updated Successfully');
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
                    $project: {
                        'email': 1,
                        'username': 1,
                        'destination_contact_number': 1,
                        'fullname': 1,
                        'gender': 1,
                        'mobile_no': 1,
                        'profile_photo': 1,
                        'role': 1,
                        'student_id': 1,
                        'university_address': 1,
                        'university_name': 1,
                        'backgroundcheckDetails': 1,
                        'paymentmethodDetails': 1,
                        'vehicleinfoDetails': 1

                    }
                }

                ])
                return successWithData(res, 'Details found Successfully', data);
            }
        } catch (err) {
            console.log(err);
        }
    }

}