 const signupDB = require('../../../models/signup.model.js')
 const tripDB = require('../../../models/usersTrip.model.js');
 const tripOfferDB = require('../../../models/tripOffer.model.js');
 const profileDB = require('../../../models/profile.model.js');
 const riderRatingDB = require('../../../models/riderRating.model.js');
const verifyToken = require("../../../middleware/authentication.js");
const {
    success,
    successWithData,
    errorResponse,
    validationError,
    notifySuccess,
    notifyError
} = require('../../../helpers/apiResponse.js')
const mongoose = require('mongoose');
const e = require('cors');
const ObjectId = mongoose.Types.ObjectId;
var FCM = require('fcm-node');
const serverKey = 'AAAA142o9fo:APA91bH9KNp5i9pfreN1_KLInFl0VXcEuh82Mjn07P47sKeE7-kTEy8cKPe7XXZFUEsAYhGvZSMh0j5nML2EHeJEPFzkrclVN0L2bjDWI6K3-CH-hs9-HHd4m4EBSmaNV4dFaUgazZgF';

//var admin =require("firebase-admin");
//var fcm = require("fcm-notification");

//var serviceAccount = require("../../../config/push-notification-key.json")
//const certPath = admin.credential(serviceAccount);
//var FCM = new fcm(certPath);
module.exports = {
    verifyToken,

    //------------------- push notification
     pushNotifications: async function(req, res){
      try{
        var fcm = new FCM(serverKey);
        let message = {
            to:'d9NvTmqwQPGRznmzKFBOST:APA91bFdUPtgFGrpqpWT7FttjgmZah2kJpDkfM67p1WrUUE8kRD9FW80Lis9m1hmWpy1yrtlaP-0qeZEXI7_Da5h1UyYfBYrU-vNnJTYxrKOGHxMdTjm3Zn03mLEZ6EGTbdmfVe0EjyN',
            notification: {
                title: "testing notification",
                body: "Notification message",
            },

            data: { 
                title: 'ok',
                body: '{"name" : "okg ooggle ogrlrl","product_id" : "123","final_price" : "0.00035"}'
            }
           
        };

        console.log("message",message);
        fcm.send(message, function(err,response){           
            if(err){                
                console.log(err);
            }else{
                console.log(response);                
            }
        })
      }
      catch(err){
        return errorResponse(res,err);
      }
     },

    //------------------------find drivers 
        findDrivers: async function(req,res){
            try{
                const profile_id = await req.user.id;
                if (profile_id) {
                    const requiredParams = [ 
                                        'trip',                       
                                        'pickup_location',
                                        'pickup_lat',
                                        'pickup_long',                        
                                        'depart_date_time',                       
                                        'amount'                      
                                    ];
                
                                    var emptyArry = [];
                                    var formdata = req.body;
                                    var data = Object.keys(req.body);                   
                                   
                                    var result = requiredParams.filter(n => !data.includes(n));
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
                                            const newday = new Date(req.body.depart_date_time);                         
                                            const makenextday = newday.setDate(newday.getDate() + 1 );
                                            var nextday = new Date(makenextday).toISOString().split('T')[0]+'T00:00:00.000Z';
                                            //console.log("next day", nextday);
                                            if(profile_id){
                                                //console.log("profile_id", profile_id)
                                                var data = await profileDB.aggregate(  [
                                                
                                                    {
                                                        $lookup: {
                                                        from: "usertrips",
                                                        let: {
                                                            id: "$profile_id",
                                                            
                                                        },
                                                        pipeline: [
                                                            {
                                                            $match: {
                                                                $expr: {
                                                                $and: [
                                                                    {
                                                                        $eq: [
                                                                        "$$id",
                                                                        "$user_id"
                                                                        ]
                                                                    },
                                                                    {
                                                                        $eq: [
                                                                            "$pickup_location",
                                                                            req.body.pickup_location
                                                                        ]
                                                                        
                                                                    },
                                                                    {
                                                                        $eq: [
                                                                            "$type",
                                                                            1
                                                                        ]
                                                                        
                                                                    },
                                                                    {
                                                                        $eq: [
                                                                            "$status",
                                                                            0
                                                                        ]
                                                                        
                                                                    },
                                                                    
                                                                    {
                                                                        $gte: [
                                                                            "$depart_date_time",
                                                                            new Date(req.body.depart_date_time)
                                                                        ]
                                                                    },
                                                                    {
                                                                        $lt: [
                                                                            "$depart_date_time",
                                                                            new Date(nextday)
                                                                        ]
                                                                    },
                                                                    {
                                                                        $lte: [
                                                                            "$amount",
                                                                            Number(req.body.amount)
                                                                        ]
                                                                    }

                                                                ]
                                                                }
                                                            }
                                                            }
                                                        ],

                                                        
                                                        as: "findDrivers"
                                                        },
                                                      
                                                     },
                                                    {$unwind:"$findDrivers"}
                                                    
                                                    ])
                                               
                                                            
                                                return successWithData(res,'Data Found',data);
            
                    
                       
                   
                    
                        }
                                        }                    
                    }
                }
            }catch(err){
                console.log(err);
            }
        },

         //------------------------get driver detail by id
         getDriverDetailsByID: async function(req,res){
            try{
                const profile_id = await req.user.id;
                if (profile_id) {
                 const {driver_id,driver_trip_id} = req.body;
                 if(!(driver_id && driver_trip_id)){
                    return errorResponse(res,"driver_id and driver_trip_id is required")
                 }else{
                    var data = await tripDB.aggregate([{
                        $match: {
                            $and: [ 
                                {type: 1}, 
                                {user_id: ObjectId(driver_id)},
                                {_id: ObjectId(driver_trip_id)},
                               
                            ]}
                        },

                            {
                                $lookup: {
                                    from: 'profiles',
                                    localField: 'user_id',
                                    foreignField: 'profile_id',
                                    as: 'driverDetails',
                                }
        
                            }, 

                    ])
                    return successWithData(res,'Driver Details Found',data);
                 }
                }
            }catch(err){
                console.log(err);
            }
        },



        //------------------------find all rides with ride status (confirm)
        getAllRideWithStatus: async function(req,res){
            try{
                const profile_id = await req.user.id;
                if (profile_id) {
                    //console.log("profile_id", profile_id)
                    var arr = [];
                    var data = await tripDB.aggregate([
                        {$match: {
                            $and: [ 
                                {type: 2}, 
                                {user_id: ObjectId(profile_id)}
                               
                            ]
                       }},
                        {
                        
                            $lookup: {
                            from: "tripoffers",
                            let: {
                                id: "$_id",
                                
                            },
                            
                            pipeline: [
                                {
                                $match: {
                                    $expr: {
                                    $and: [
                                        {
                                            $eq: [
                                            "$$id",
                                            "$rider_trip_id"
                                            ]
                                        },

                                        {
                                            $eq: [
                                            "$rider_id",
                                            ObjectId(profile_id) 
                                            ]
                                        },

                                        {
                                            $gte: [
                                                "$rider_depart_date_time",
                                                "$depart_date_time"
                                            ]
                                        }
                                        
                                        // {
                                        //     $gte: [
                                        //         "$rider_depart_date_time",
                                        //         new Date(today)
                                        //     ]
                                        // }
                                        

                                    ]
                                    }
                                }
                                }
                            ],

                            
                            as: "findRideStatus"
                            },
                          

                          
                         },
                       
                    ])
                    await Promise.all(data.map(async (row) => {
                        //console.log('row',row)

                        if(row.findRideStatus.length > 0 ){
                        //console.log('row',row.findRideStatus)
                        await Promise.all(row.findRideStatus.map(async (row1) => {

                            const findtrip = await profileDB.findOne({profile_id : row1.driver_id});
                            //console.log('findtrip',findtrip)

                            row1.drive_fullname = findtrip.fullname;
                            row1.driver_gender = findtrip.gender;
                           
                        }))
                        }
                   
                        arr.push(row);

                    }));
                    return successWithData(res, 'Details found Successfully', arr);
                  
                  
                }
            }catch(err){
                console.log(err);
            }
        },



        //---------------------- send offer to driver
         sendOfferToDriver: async function(req,res){
            try{
                const profile_id = await req.user.id;
                if (profile_id) {
                    const {driver_id, rider_trip_id, rider_depart_date_time, rider_amount,rider_seat_request, driver_seat_available, driver_trip_id  } = req.body;
                    //console.log("---",driver_id, rider_trip_id, rider_depart_date_time, rider_amount,rider_seat_request, driver_seat_available, driver_trip_id)
                    if(!(driver_id && rider_trip_id && rider_depart_date_time &&  rider_amount && rider_seat_request && driver_seat_available && driver_trip_id)){
                        return errorResponse(res,"driver_id, rider_trip_id, rider_depart_date_time, rider_amount,rider_seat_request, driver_seat_available, driver_trip_id are required"); 
                        
                    }else{
                        const findOfferLimitExceed = await tripOfferDB.find({ rider_id : profile_id,rider_trip_id: rider_trip_id});
                        //console.log("findOfferLimitExceed", findOfferLimitExceed.length)
                        if(findOfferLimitExceed.length >= 3){
                            return errorResponse(res, "You can send offer to 3 Drivers")
                        }else{

                            const checkTripOffer = await tripOfferDB.findOne({ rider_id : profile_id,driver_trip_id: driver_trip_id, driver_id: driver_id});
                            //console.log("checkTripOffer", checkTripOffer)
                            if(checkTripOffer){
                                return errorResponse(res,"This offer is already sent")
                            }else{
                                const find_driver_trip=await tripDB.findOne({ user_id :driver_id,_id: driver_trip_id,type: 1 });
                            //console.log("find_driver_trip", find_driver_trip)
                            
                            if(find_driver_trip.trip_accepted == 0){
                                var newvalues = {
                                    $set: {                                   
                                        trip_accepted:1
                                    }
                                }
                                tripDB.updateOne({ _id: req.body.driver_trip_id }, newvalues, async(err, updateTripStatus) => { 
                                    if (err) {
                                        return errorResponse(res, 'Error while updating status')
                                    }else{ 
                                        if(updateTripStatus.modifiedCount == 1){
                                            let trip_offer = new tripOfferDB();
        
                                            trip_offer.rider_id = profile_id;
                                            trip_offer.rider_depart_date_time = rider_depart_date_time;
                                            trip_offer.rider_amount = rider_amount;
                                            trip_offer.rider_seat_request = rider_seat_request;
                                            trip_offer.rider_trip_id = rider_trip_id;
                                            trip_offer.is_trip_accepted_by_rider = 0; 
                                            trip_offer.driver_id = driver_id;     
                                            trip_offer.driver_trip_id = driver_trip_id;
                                            trip_offer.driver_seat_available = driver_seat_available;
                                            trip_offer.is_trip_accepted_by_driver = 0;
                                            trip_offer.status = 0;                                   
                                            trip_offer.created_date = Date.now();                                        
                                         
                                            
                                        await trip_offer.save(async (err, checkTripOffer) => {
                                                if (err) {
                                                    return errorResponse(res, 'Error')
                                                } else {
                                                    tripDB.findByIdAndUpdate({_id : rider_trip_id},{status: 1}, (err,updateRiderStatus)=>{
                                                        //console.log("updateRiderStatus", updateRiderStatus)
                                                        if(err){
                                                            return errorResponse(res,"network error")
                                                        }else{ 
                                                            //return success(res,"Offer successfully sent")
                                                            signupDB.findById({_id:driver_id},(err,getDevicedoc)=>{
                                                                if(err){
                                                                    return errorResponse(res, 'Error')
                                                                }else{
                                                                    if(getDevicedoc){
                                                                        profileDB.findOne({profile_id:profile_id},(err,getRiderdoc)=>{
                                                                            if(err){
                                                                                return errorResponse(res, 'Error')
                                                                            }else{ 
                                                                                if(getRiderdoc){
                                                                                    console.log("----------",getRiderdoc.fullname)
                                                                                    var fcm = new FCM(serverKey);
                                                                                    let message = {
                                                                                        to: getDevicedoc.device_token,
                                                                                        notification: {
                                                                                            title: "Ride Offer",
                                                                                            body: getRiderdoc.fullname+" sent you an offer",
                                                                                        },
                                                                            
                                                                                        data: { 
                                                                                            title: 'ok',
                                                                                            body: getRiderdoc.fullname+" sent you an offer"
                                                                                        }
                                                                                    
                                                                                    };
                                                                            
                                                                                    console.log("message",message);
                                                                                    fcm.send(message, function(err,response){           
                                                                                        if(err){                
                                                                                            return notifyError(response, 'Error')
                                                                                        }else{
                                                                                            return notifySuccess(res, 'Offer successfully sent')
                                                                                        }
                                                                                    })
                                                                                }
                                                                            }
                                                                        });
                                                                        
                                                                    }
                                                                }
                                                            })
                                                            
                                                        }
                                                     });
                                                    
                                                }
                                            });                                   
                                            //return successWithData(res, 'Data Submitted Successfully', updateRoleInfo)
                                            }
                                    
                                    } 
                                }); 
                            }else{
                                let trip_offers = new tripOfferDB();
        
                                trip_offers.rider_id = profile_id;
                                trip_offers.rider_depart_date_time = rider_depart_date_time;
                                trip_offers.rider_amount = rider_amount;
                                trip_offers.rider_seat_request = rider_seat_request;
                                trip_offers.rider_trip_id = rider_trip_id;
                                trip_offers.is_trip_accepted_by_rider = 0; 
                                trip_offers.driver_id = driver_id;     
                                trip_offers.driver_trip_id = driver_trip_id;
                                trip_offers.driver_seat_available = driver_seat_available;
                                trip_offers.is_trip_accepted_by_driver = 0;
                                trip_offers.status = 0;                                   
                                trip_offers.created_date = Date.now();                           
                                
                            await trip_offers.save(async (err, checkTripOffer) => {
                                    if (err) {
                                        return errorResponse(res, 'Error')
                                    } else {
                                        tripDB.findByIdAndUpdate({_id : rider_trip_id},{status: 1}, (err,updateRiderStatus)=>{
                                            //console.log("updateRiderStatus", updateRiderStatus)
                                            if(err){
                                                return errorResponse(res,"network error")
                                            }else{ 
                                                //return success(res,"Offer successfully sent")
                                                signupDB.findById({_id:driver_id},(err,getDevicedoc)=>{
                                                    if(err){
                                                        return errorResponse(res, 'Error')
                                                    }else{
                                                        if(getDevicedoc){
                                                            profileDB.findOne({profile_id:profile_id},(err,getRiderdoc)=>{
                                                                if(err){
                                                                    return errorResponse(res, 'Error')
                                                                }else{ 
                                                                    if(getRiderdoc){
                                                                        console.log("--------",getDevicedoc.fullname)
                                                                        var fcm = new FCM(serverKey);
                                                                        let message = {
                                                                            to: getDevicedoc.device_token,
                                                                            notification: {
                                                                                title: "Ride Offer",
                                                                                body: getRiderdoc.fullname+" sent you an offer",
                                                                            },
                                                                
                                                                            data: { 
                                                                                title: 'ok',
                                                                                body: getRiderdoc.fullname+" sent you an offer"
                                                                            }
                                                                        
                                                                        };
                                                                
                                                                        console.log("message",message);
                                                                        fcm.send(message, function(err,response){           
                                                                            if(err){                
                                                                                return notifyError(response, 'Error')
                                                                            }else{
                                                                                return notifySuccess(res, 'Offer successfully sent')
                                                                            }
                                                                        })
                                                                    }
                                                                }
                                                            });
                                                            
                                                        }
                                                    }
                                                })
                                                
                                            }
                                         });
                                    }
                                });
                                                    
                            }
                           //console.log("find_driver_trip", find_driver_trip); 
                            }
                           
                            }
                       
                    }
    
                }
               
            }catch(err){
                console.log(err);
            }
        },

        //------------------- confirm ride sent by driver
        getDriverDetailToConfirmRide: async function(req,res){
            try{
                const profile_id = await req.user.id;
                if (profile_id) {
                      const {driver_id, driver_trip_id} = req.body;

                      if(!(driver_id && driver_trip_id)){
                        return errorResponse(res, "driver_id or driver_trip_id is required")
                      }else{
                        var data = await tripDB.aggregate([{
                            $match: {
                                '_id': ObjectId(driver_trip_id)                                                     
                            }
                        },                        
                        {
                            $lookup: {
                                from: 'profiles',
                                localField: 'user_id',
                                foreignField: 'profile_id',
                                as: 'driverDetails',
                            }
    
                        },     
                        
                        {
                            $project: { 
                                '_id': 1,
                                'user_id': 1,                           
                                'amount': 1, 
                                'number_of_riders':1 ,  // seat_available for driver side
                                'number_of_bags':1 ,    // bag_allowed for driver side
                                'driverDetails.fullname':1,                                         
                                'driverDetails.profile_id':1, 
                            }
                        }
    
                        ])
                        return successWithData(res, 'Details found Successfully', data);
                       
                      }
                                          
                  }
                
               
            }catch(err){
                console.log(err);
            }
        },

         //-------------------(Accept button) final confirmation of ride sent by driver
         confirmRideSentByDriver: async function(req,res){
            try{
                const profile_id = await req.user.id;
                if (profile_id) {
                    const {driver_trip_id} = req.body;

                    if(!(driver_trip_id)){
                      return errorResponse(res, "driver_trip_id is required")
                    }else{ 
                         tripOfferDB.find({driver_trip_id : driver_trip_id , rider_id: profile_id, status: 0, is_trip_accepted_by_driver: 1},async(err,doc)=>{
                            //console.log("doc", doc)
                            if(err){
                                return errorResponse(res," Error While finding data")
                            }else{
                               if(doc.length > 0){
                                var rider_requested_seat =  doc[0].rider_seat_request;
                                //console.log("deducted_seat",rider_requested_seat)
                                    // var newvalues = {
                                    //     $set: {                                   
                                    //         is_trip_accepted_by_rider: 1,
                                    //         status: 1                                           
                                    //     }
                                    // }
                                     tripOfferDB.updateOne({ _id: doc[0]._id }, {is_trip_accepted_by_rider: 1, status: 1 }, async(err, updateTripStatus) => { 
                                        if (err) {
                                            return errorResponse(res, 'Error while updating status')
                                        }else{ 
                                            tripDB.updateOne({ _id: doc[0].rider_trip_id, type: 2 }, {status: 3}, async(err, updateRiderStatus) => { 
                                                if (err) {
                                                    return errorResponse(res, 'Error while updating status')
                                                }else{ 
                                                    //console.log("updateTripStatus",updateTripStatus,  doc[0]._id)
                                           
                                                    tripDB.findOne({_id : doc[0].driver_trip_id},async(err,findTripofDriver)=>{
                                                           //console.log("findTripofDriver", findTripofDriver);
                                                           if(err){
                                                               return errorResponse(res," Error While finding data")
                                                           }else{
                                                               if(findTripofDriver.seat_left_need ){
                                                                   var seat_left = Number(findTripofDriver.seat_left_need) - Number(rider_requested_seat); 
                                                                   //console.log("seat_left", seat_left)
                                                                   if(Number(seat_left) != 0){
                                                                    //    var newvalues = {
                                                                    //        $set: {                                   
                                                                    //            seat_left_need: Number(seat_left),
                                                                    //            //status: 3                                           
                                                                    //        }
                                                                    //    }
                                                                        tripDB.updateOne({ _id: doc[0].driver_trip_id }, { seat_left_need: Number(seat_left)}, async(err, updateSeatStatus) => { 
                                                                           if (err) {
                                                                               return errorResponse(res, 'Error while updating status')
                                                                           }else{ 
                                                                               //console.log("updateSeatStatus", updateSeatStatus);
                                                                               if(updateSeatStatus.modifiedCount === 1){
                                                                                   //return successWithData(res, "Trip accepted by rider",updateSeatStatus )
                                                                                   signupDB.findById({_id:doc[0].driver_id},(err,getDevicedoc)=>{
                                                                                    if(err){
                                                                                        return errorResponse(res, 'Error')
                                                                                    }else{
                                                                                        if(getDevicedoc){
                                                                                            profileDB.findOne({profile_id:profile_id},(err,getRiderdoc)=>{
                                                                                                if(err){
                                                                                                    return errorResponse(res, 'Error')
                                                                                                }else{ 
                                                                                                    if(getRiderdoc){
                                                                                                        console.log("----------",getRiderdoc.fullname)
                                                                                                        var fcm = new FCM(serverKey);
                                                                                                        let message = {
                                                                                                            to: getDevicedoc.device_token,
                                                                                                            notification: {
                                                                                                                title: "Trip Accepted",
                                                                                                                body: "Trip accepted by "+getRiderdoc.fullname,
                                                                                                            },
                                                                                                
                                                                                                            data: { 
                                                                                                                title: 'ok',
                                                                                                                body: "Trip accepted by "+getRiderdoc.fullname
                                                                                                            }
                                                                                                        
                                                                                                        };
                                                                                                
                                                                                                        console.log("message",message);
                                                                                                        fcm.send(message, function(err,response){           
                                                                                                            if(err){                
                                                                                                                return notifyError(response, 'Error')
                                                                                                            }else{
                                                                                                                return notifySuccess(res, 'Trip accepted by rider')
                                                                                                            }
                                                                                                        })
                                                                                                    }
                                                                                                }
                                                                                            });
                                                                                            
                                                                                        }
                                                                                    }
                                                                                })
                                                                               }
                                                                              
                                                                           }
                                                                       })
                                                                   }else{
                                                                    //    var newvalues = {
                                                                    //        $set: {                                   
                                                                    //            seat_left_need: Number(seat_left),
                                                                    //            is_trip_full:1,
                                                                    //            status: 3                                           
                                                                    //        }
                                                                    //    }
                                                                        tripDB.updateOne({ _id: doc[0].driver_trip_id }, {seat_left_need: Number(seat_left), is_trip_full:1,  status: 3 }, async(err, updateSeatStatus) => { 
                                                                           if (err) {
                                                                               return errorResponse(res, 'Error while updating status')
                                                                           }else{ 
                                                                               //console.log("updateSeatStatus", updateSeatStatus);
                                                                               if(updateSeatStatus.modifiedCount === 1){
                                                                                   //return successWithData(res, "Trip accepted by rider",updateSeatStatus )
                                                                                   signupDB.findById({_id:doc[0].driver_id},(err,getDevicedoc)=>{
                                                                                    if(err){
                                                                                        return errorResponse(res, 'Error')
                                                                                    }else{
                                                                                        if(getDevicedoc){
                                                                                            profileDB.findOne({profile_id:profile_id},(err,getRiderdoc)=>{
                                                                                                if(err){
                                                                                                    return errorResponse(res, 'Error')
                                                                                                }else{ 
                                                                                                    if(getRiderdoc){
                                                                                                        console.log("----------",getRiderdoc.fullname)
                                                                                                        var fcm = new FCM(serverKey);
                                                                                                        let message = {
                                                                                                            to: getDevicedoc.device_token,
                                                                                                            notification: {
                                                                                                                title: "Trip Accepted",
                                                                                                                body: "Trip accepted by "+getRiderdoc.fullname,
                                                                                                            },
                                                                                                
                                                                                                            data: { 
                                                                                                                title: 'ok',
                                                                                                                body: "Trip accepted by "+getRiderdoc.fullname
                                                                                                            }
                                                                                                        
                                                                                                        };
                                                                                                
                                                                                                        console.log("message",message);
                                                                                                        fcm.send(message, function(err,response){           
                                                                                                            if(err){                
                                                                                                                return notifyError(response, 'Error')
                                                                                                            }else{
                                                                                                                return notifySuccess(res, 'Trip accepted by rider')
                                                                                                            }
                                                                                                        })
                                                                                                    }
                                                                                                }
                                                                                            });
                                                                                            
                                                                                        }
                                                                                    }
                                                                                })
                                                                               }
                                                                              
                                                                           }
                                                                       }) 
                                                                   }
                                                                  
                                                                   
                                                               }else{
                                                                   return errorResponse(res,"Trip not found")
                                                               }
                                                           }
                                                       })
                                                 } 
                                                })
                                           
                                            //---
                                        }
                                    })
                               }else{
                                return errorResponse(res, "Rider Offer not found")
                               }
                            }
                        })
                     }
                    
                  }
                
               
            }catch(err){
                console.log(err);
            }
        },

         //---------------- cancel driver offer

         cancelDriverOffer: async function(req,res){
            try{
                const profile_id = await req.user.id;
                if (profile_id) {
                  const {rider_trip_id, driver_id} = req.body;

                  if(rider_trip_id == null || rider_trip_id == "" || rider_trip_id == undefined && driver_id == null || driver_id == "" || driver_id == undefined){
                    return errorResponse(res,"rider_trip_id or driver_id is required")
                  }else{
                    tripOfferDB.findOneAndUpdate({rider_trip_id : rider_trip_id, driver_id : driver_id}, {is_trip_accepted_by_rider: 2, status: 2},async(err,doc)=>{
                        if(err){
                            return errorResponse(res," Error While updating status")
                        }else{
                            //return success(res,"Offer Rejected!");
                            signupDB.findById({_id:driver_id},(err,getDevicedoc)=>{
                                if(err){
                                    return errorResponse(res, 'Error')
                                }else{
                                    if(getDevicedoc){
                                        profileDB.findOne({profile_id:profile_id},(err,getRiderdoc)=>{
                                            if(err){
                                                return errorResponse(res, 'Error')
                                            }else{ 
                                                if(getRiderdoc){
                                                    console.log("----------",getRiderdoc.fullname)
                                                    var fcm = new FCM(serverKey);
                                                    let message = {
                                                        to: getDevicedoc.device_token,
                                                        notification: {
                                                            title: "Offer Rejected",
                                                            body: getRiderdoc.fullname+" cancelled the ride",
                                                        },
                                            
                                                        data: { 
                                                            title: 'ok',
                                                            body: getRiderdoc.fullname+" cancelled the ride"
                                                        }
                                                    
                                                    };
                                            
                                                    console.log("message",message);
                                                    fcm.send(message, function(err,response){           
                                                        if(err){                
                                                            return notifyError(response, 'Error')
                                                        }else{
                                                            return notifySuccess(res, 'Offer Rejected!')
                                                        }
                                                    })
                                                }
                                            }
                                        });
                                        
                                    }
                                }
                            })
                        }
                    })
                  }
                }
               
            }catch(err){
                console.log(err);
            }
        },

        //----------------------------- new offer request by driver
        getNewRequest: async function(req,res){
            try{
                const profile_id = await req.user.id;
                if (profile_id) {
                    //const newday = new Date();                        
                    //var today = new Date(newday).toISOString().split('T')[0]+'T00:00:00.000Z';
                    //if(today){
                        tripOfferDB.find({is_trip_accepted_by_driver : 1, rider_id : ObjectId(profile_id), status : {$in : [0,1]}},(err,doc)=>{
                            if(err){
                                return errorResponse(res," Error While finding data")
                            }else{
                                if(doc.length > 0){
                                    const data ={
                                        new_ride_offer_request : doc.length
                                    }
                                    return successWithData(res,"New Ride Offer Request By Driver Found", data);
                                }else{
                                    const data ={
                                        new_ride_offer_request : 0
                                    }
                                    return successWithData(res,"New Ride Offer Request By Driver Found", data); 
                                }
                                
                            }
                        })
                    //}
                    
                  }
                
               
            }catch(err){
                console.log(err);
            }
        },

        //--------------------get active drivers count 
        getActiveDrivers: async function(req,res){
            try{
                const profile_id = await req.user.id;
                if (profile_id) {
                    //const newday = new Date();                        
                    //var today = new Date(newday).toISOString().split('T')[0]+'T00:00:00.000Z';
                    //if(today){
                        signupDB.find({status : 1, role_id : 1},(err,doc)=>{
                            if(err){
                                return errorResponse(res," Error While finding data")
                            }else{
                                //console.log("doc",doc)
                                if(doc.length > 0){
                                    const data ={
                                        active_drivers : doc.length
                                    }
                                    return successWithData(res,"Active Drivers Found", data);
                                }else{
                                    const data ={
                                        active_drivers : 0
                                    }
                                    return successWithData(res,"Active Drivers Found", data);
                                }
                                
                            }
                        })
                   // }
                    
                  }
                
               
            }catch(err){
                console.log(err);
            }
        },

         //---------------- rate driver after ride completion

         rateDriver: async function(req,res){
            try{
                const profile_id = await req.user.id;
                if (profile_id) {    
                    //console.log("profile_id", profile_id)
                    const {rider_trip_id, driver_id, rating, issue} = req.body;
                    if(!(rider_trip_id && driver_id && rating && issue )){
                        return validationError(res, "rider_trip_id, driver_id,rating and issue  is required")
                    }else{
                        riderRatingDB.findOne({driver_id: driver_id, ride_id: rider_trip_id},async(err,doc)=>{
                            if (err) {
                                return errorResponse(res, 'Error')
                            } else { 
                                if(doc){
                                    return errorResponse(res,"Rating already submitted")
                                }else{
                                   
                                    let issue_desc;

                                    if(issue == "other"){
                                        issue_desc = req.body.issue_desc;
                                    }else{
                                        issue_desc = ""
                                    }
                                    let driver_rating = new riderRatingDB();
                    
                                    driver_rating.driver_id = driver_id;
                                    driver_rating.ride_id = rider_trip_id;
                                    driver_rating.rating = rating; 
                                    driver_rating.issue = issue;   
                                    driver_rating.issue_desc = issue_desc;                                                    
                                    driver_rating.created_date = Date.now();                                        
                                    
                                    //console.log("driver_rating",driver_rating)
                                await driver_rating.save(async (err, ratingdoc) => {
                                        if (err) {
                                            return errorResponse(res, 'Error')
                                        } else { 
                                            //return success(res,"rating submitted")
                                            signupDB.findById({_id:driver_id},(err,getDevicedoc)=>{
                                                if(err){
                                                    return errorResponse(res, 'Error')
                                                }else{
                                                    if(getDevicedoc){
                                                        profileDB.findOne({profile_id:profile_id},(err,getRiderdoc)=>{
                                                            if(err){
                                                                return errorResponse(res, 'Error')
                                                            }else{ 
                                                                if(getRiderdoc){
                                                                    console.log("----------",getRiderdoc.fullname)
                                                                    var fcm = new FCM(serverKey);
                                                                    let message = {
                                                                        to: getDevicedoc.device_token,
                                                                        notification: {
                                                                            title: "Review Completed",
                                                                            body: getRiderdoc.fullname+" gave you review.",
                                                                        },
                                                            
                                                                        data: { 
                                                                            title: 'ok',
                                                                            body: getRiderdoc.fullname+" gave you review."
                                                                        }
                                                                    
                                                                    };
                                                            
                                                                    console.log("message",message);
                                                                    fcm.send(message, function(err,response){           
                                                                        if(err){                
                                                                            return notifyError(response, 'Error')
                                                                        }else{
                                                                            return success(res,"rating submitted")
                                                                        }
                                                                    })
                                                                }
                                                            }
                                                        });
                                                        
                                                    }
                                                }
                                            }) 
                                        }
                                    });
                                }
                            }
                        });
                       
                    }             
                                          
                    
                  }
                
               
            }catch(err){
                console.log(err);
            }
        },

        

    }

   