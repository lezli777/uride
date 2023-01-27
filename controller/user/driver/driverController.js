const signupDB = require('../../../models/signup.model.js')
// const backgroudCheckDB = require('../../models/background.model.js')
// const vehicleInfosDB = require('../../models/vehicleInfo.model.js');
// const paymentMethodDB = require('../../models/paymentMethod.model.js');
 const tripDB = require('../../../models/usersTrip.model.js');
 const tripOfferDB = require('../../../models/tripOffer.model.js');
const profileDB = require('../../../models/profile.model.js');
// const roleDB = require('../../models/memberRole.model.js');
const verifyToken = require("../../../middleware/authentication.js");
const {
    success,
    successWithData,
    errorResponse,
    validationError
} = require('../../../helpers/apiResponse.js')
const path = require('path');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

module.exports = {
    verifyToken,

    //----------------- delete whole trip created by driver
        deleteTrip: async function(req,res){
            try{
                const profile_id = await req.user.id;
                if (profile_id) {
                    const {driver_trip_id} =req.body;
                    if(driver_trip_id == "" || driver_trip_id == null || driver_trip_id == undefined){
                        return validationError(res,"driver_trip_id is required")
                    }else{
                        const findtrip = await tripDB.findById({_id : driver_trip_id});
                        console.log("findtrip", findtrip)
                        if(findtrip){
                           tripDB.findByIdAndUpdate({_id : driver_trip_id},{status: 4}, (err,doc)=>{
                            console.log("doc", doc)
                            if(err){
                                return errorResponse(res,"network error")
                            }else{
                                
                                    tripOfferDB.deleteMany({driver_trip_id : ObjectId(driver_trip_id) },(err,doc1)=>{
                                        console.log("doc1", doc1)
                                        if(err){
                                            return errorResponse(res,"Issue While deleting trips")
                                        }else{
                                            return success(res,"Trip is cancelled/deleted")
                                        }
                                    })
                                    
                                
                            }
                          })
                        }else{
                            return errorResponse(res, "trip not found")
                        }
                    }
                }
                
            }catch(err){
                console.log(err);
            }
        },

        //------------ get all trips with their offers by riders

        getRiderOfferByTripId: async function(req,res){
            try{
                const profile_id = await req.user.id;
                if (profile_id) {
                    const newday = new Date();                        
                    var today = new Date(newday).toISOString().split('T')[0]+'T00:00:00.000Z';
                    console.log("today", today);
                    var arr = [];
                        var data = await tripDB.aggregate([
                            {$match: {
                                $and: [ 
                                    {type: 1}, 
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
                                                "$driver_trip_id"
                                                ]
                                            },

                                            {
                                                $eq: [
                                                "$driver_id",
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

                                
                                as: "findUpcomingtrips"
                                },
                              

                              
                             },
                           
                        ])
                        await Promise.all(data.map(async (row) => {
                            console.log('row',row)

                            if(row.findUpcomingtrips.length > 0 ){
                            console.log('row',row.findUpcomingtrips)
                            await Promise.all(row.findUpcomingtrips.map(async (row1) => {

                                const findtrip = await profileDB.findOne({profile_id : row1.rider_id});
                                console.log('findtrip',findtrip)
    
                                row1.fullname = findtrip.fullname;
                                row1.gender = findtrip.gender;
                               
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

        //-------------------- get all rider offer details of particular trip 

        getAllRiderTripOfferdetail: async function(req,res){
            try{
                const profile_id = await req.user.id;
                if (profile_id) {
                    const {driver_trip_id} = req.body;

                    if (!(driver_trip_id)) {
                        return validationError(res, 'driver_trip_id field is required')
                    } else { 
                        var data = await tripOfferDB.aggregate([{
                            $match: {
                                'driver_trip_id': ObjectId(driver_trip_id)                                                     
                            }
                        },                        
                        {
                            $lookup: {
                                from: 'profiles',
                                localField: 'rider_id',
                                foreignField: 'profile_id',
                                as: 'riderDetails',
                            }
    
                        },                        
    
                        {
                            $lookup: {
                                from: 'usertrips',
                                localField: 'rider_trip_id',
                                foreignField: '_id',
                                as: 'riderTripDetails',
                            }
    
                        },
                        
                        
                        {
                            $project: {                       
                                            
                                'rider_id': 1,    
                                'rider_depart_date_time': 1,
                                'rider_amount': 1,
                                'rider_seat_request': 1,
                                'rider_trip_id': 1,  
                                'is_trip_accepted_by_rider' : 1, //1 : yes , 0 : no     
                            
                                'driver_trip_id': 1,
                                'driver_id':1, 
                                'driver_seat_available': 1,
                                'is_trip_accepted_by_driver' : 1, //1 : yes , 0 : no  
                                
                                'status':1,   // 0 : pending, 1: accepted, 2: cancel  
                                // offer_price_sent_by_rider : {type : Number},
                                'updated_date': 1,
                                'updated_date': 1,                          
                                'riderDetails': 1,
                                'riderTripDetails' : 1
                                
    
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

        //-------------------- get single rider offer details of particular trip 

        getSingleRiderTripOfferdetail: async function(req,res){
            try{
                const profile_id = await req.user.id;
                if (profile_id) {
                    const {driver_trip_id, rider_id} = req.body;

                    if (!(driver_trip_id && rider_id)) {
                        return validationError(res, 'driver_trip_id or rider_id field is required')
                    } else { 
                        var data = await tripOfferDB.aggregate([{
                            $match: {
                                                                                   
                            }
                        },
                        {$match: {
                            $and: [ 
                                {driver_trip_id: ObjectId(driver_trip_id)},   
                                {rider_id: ObjectId(rider_id)}
                               
                            ]
                       }},                        
                        {
                            $lookup: {
                                from: 'profiles',
                                localField: 'rider_id',
                                foreignField: 'profile_id',
                                as: 'riderDetails',
                            }
    
                        },                        
    
                        {
                            $lookup: {
                                from: 'usertrips',
                                localField: 'rider_trip_id',
                                foreignField: '_id',
                                as: 'riderTripDetails',
                            }
    
                        },
                        
                        
                        {
                            $project: {                       
                                            
                                'rider_id': 1,    
                                'rider_depart_date_time': 1,
                                'rider_amount': 1,
                                'rider_seat_request': 1,
                                'rider_trip_id': 1,  
                                'is_trip_accepted_by_rider' : 1, //1 : yes , 0 : no     
                            
                                'driver_trip_id': 1,
                                'driver_id':1, 
                                'driver_seat_available': 1,
                                'is_trip_accepted_by_driver' : 1, //1 : yes , 0 : no  
                                
                                'status':1,   // 0 : pending, 1: accepted, 2: cancel  
                                // offer_price_sent_by_rider : {type : Number},
                                'updated_date': 1,
                                'updated_date': 1,                          
                                'riderDetails': 1,
                                'riderTripDetails' : 1
                                
    
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

         //-------------------- get particular rider details of offer 

        getSingleRiderTripdetail: async function(req,res){
            try{
                const profile_id = await req.user.id;
                if (profile_id) {
                    const {rider_id, rider_trip_id} = req.body;

                    if (!(rider_id && rider_trip_id)) {
                        return validationError(res, 'rider_id or rider_trip_id fields are required')
                    } else { 
                        var data = await tripDB.aggregate([
                            {$match: {
                                $and: [ 
                                    {_id: ObjectId(rider_trip_id)}, 
                                    {user_id: ObjectId(rider_id)}
                                   
                                ]
                           }},
                        {
                            $lookup: {
                                from: 'profiles',
                                localField: 'user_id',
                                foreignField: 'profile_id',
                                as: 'riderDetails',
                            }
    
                        },     
                        
                        {
                            $project: {                            
                                'pickup_lat': 1,
                                'pickup_location': 1,
                                'pickup_long': 1,
                                'destination_location': 1,
                                'destination_lat':1,
                                'destination_long': 1,    
                                'trip': 1,
                                'depart_date_time':1 ,
                                'return_date_time':1 ,                     
                                'request_expiration': 1,
                                'number_of_riders':1 ,  // seat_available for driver side
                                'number_of_bags':1 ,    // bag_allowed for driver side
                                'special_request':1,                                                
                                'offerDetail': 1,                            
                                'riderDetails': 1,                                
                                
    
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
        
         //---------------- get new ride rquest in your(driver) area
         getNewRiderRequestInArea: async function(req,res){
            try{
                const profile_id = await req.user.id;
                if (profile_id) {
                  const {driver_trip_id} = req.body;

                  if(!(driver_trip_id )){
                    return errorResponse(res,"driver_trip_id is required")
                  }else{
                    tripOfferDB.find({driver_trip_id : driver_trip_id, status : 0},async(err,doc)=>{
                        if(err){
                            return errorResponse(res," Error While updating status")
                        }else{
                            if(doc.length > 0){
                                const data ={
                                    new_ride_request_in_area : doc.length
                                }                           
                                    return successWithData(res,"New Request Found In Your Area", data);  
                            }else{
                                const data ={
                                    new_ride_request_in_area : 0
                                }                           
                                    return successWithData(res,"New Request Found In Your Area", data);
                            }
                                                     
                           
                        }
                    })
                  }
                }
               
            }catch(err){
                console.log(err);
            }
        },

         //---------------- get ride total distance
         getRideTotalDistance: async function(req,res){
            try{
                const profile_id = await req.user.id;
                if (profile_id) {
                  const {driver_trip_id} = req.body;

                  if(!(driver_trip_id )){
                    return errorResponse(res,"driver_trip_id is required")
                  }else{
                    tripDB.findOne({driver_trip_id : driver_trip_id},async(err,doc)=>{
                        if(err){
                            return errorResponse(res," Error While updating status")
                        }else{
                            if(doc){
                                const get_distance = (Number(doc.trip_distance) * 0.62137119223793).toFixed(2);
                                const data ={
                                    total_distance : get_distance
                                }                           
                                    return successWithData(res,"Total distance in miles", data);  
                            }
                                                     
                           
                        }
                    })
                  }
                }
               
            }catch(err){
                console.log(err);
            }
        },

        //---------------- accept rider offer

        acceptRiderOffer: async function(req,res){
            try{
                const profile_id = await req.user.id;
                if (profile_id) {
                  const {driver_trip_id, rider_id} = req.body;

                  if(!(driver_trip_id && rider_id)){
                    return errorResponse(res,"driver_trip_id or rider_id is required")
                  }else{
                    console.log("")
                    tripOfferDB.findOneAndUpdate({driver_trip_id : driver_trip_id, rider_id : rider_id}, {is_trip_accepted_by_driver: 1},async(err,doc)=>{
                        if(err){
                            return errorResponse(res," Error While updating status")
                        }else{  
                            console.log("doc", doc);                         
                                if(doc){
                                  return success(res,"Rider Offer Accepted")
                                }                    
                           
                        }
                    })
                  }
                }
               
            }catch(err){
                console.log(err);
            }
        },

         //---------------- cancel rider offer

        rejectRiderOffer: async function(req,res){
            try{
                const profile_id = await req.user.id;
                if (profile_id) {
                  const {driver_trip_id, rider_id} = req.body;

                  if(driver_trip_id == null || driver_trip_id == "" || driver_trip_id == undefined && rider_id == null || rider_id == "" || rider_id == undefined){
                    return errorResponse(res,"driver_trip_id or rider_id is required")
                  }else{
                    tripOfferDB.findOneAndUpdate({driver_trip_id : driver_trip_id, rider_id : rider_id}, {is_trip_accepted_by_driver: 2, status: 2},async(err,doc)=>{
                        if(err){
                            return errorResponse(res," Error While updating status")
                        }else{
                            return success(res,"Offer Rejected!");
                        }
                    })
                  }
                }
               
            }catch(err){
                console.log(err);
            }
        },

         //---------------- get new ride requests count

        getNewRideRequest: async function(req,res){
            try{
                const profile_id = await req.user.id;
                if (profile_id) {
                    //const newday = new Date();                        
                    //var today = new Date(newday).toISOString().split('T')[0]+'T00:00:00.000Z';
                    //if(today){
                        tripOfferDB.find({status : 0, driver_id : profile_id},(err,doc)=>{
                            if(err){
                                return errorResponse(res," Error While finding data")
                            }else{
                                if(doc.length > 0){
                                    const data ={
                                        new_ride_request : doc.length
                                    }
                                    return successWithData(res,"New Ride Request Found", data);
                                }else{
                                    const data ={
                                        new_ride_request : 0
                                    }
                                    return successWithData(res,"New Ride Request Found", data); 
                                }
                                
                            }
                        })
                    //}
                    
                  }
                
               
            }catch(err){
                console.log(err);
            }
        },

         //---------------- get active riders count
        getActiveRiders: async function(req,res){
            try{
                const profile_id = await req.user.id;
                if (profile_id) {
                    //const newday = new Date();                        
                    //var today = new Date(newday).toISOString().split('T')[0]+'T00:00:00.000Z';
                    //if(today){
                        signupDB.find({status : 1, role_id : {$in: [2, 3]}},(err,doc)=>{
                            if(err){
                                return errorResponse(res," Error While finding data")
                            }else{
                                console.log("doc",doc)
                                if(doc.length > 0){
                                    const data ={
                                        active_riders : doc.length
                                    }
                                    return successWithData(res,"Active Riders Found", data);
                                }else{
                                    const data ={
                                        active_riders : 0
                                    }
                                    return successWithData(res,"Active Riders Found", data);
                                }
                                
                            }
                        })
                   // }
                    
                  }
                
               
            }catch(err){
                console.log(err);
            }
        },

        //------------------ start trip-----------------------

        startTrip: async function(req,res){
            try{
                const profile_id = await req.user.id;
                if (profile_id) {
                        const {driver_trip_id} = req.body;
                        if(!(driver_trip_id)){
                            return validationError(res,"driver_trip_id is required")
                        }else{
                            tripDB.findByIdAndUpdate({_id: driver_trip_id},{status : 5},async(err,doc)=>{
                                if(err){
                                    return errorResponse(res," Error While updating start trip status")
                                }else{
                                   if(doc){
                                    var arr = [];
                                    var newarr =[];
                                    var data = await tripDB.aggregate([
                                        {$match: {
                                            $and: [ 
                                                {_id: ObjectId(driver_trip_id)}, 
                                                {user_id: ObjectId(profile_id)}
                                            
                                            ]
                                    }},
                                        {
                                        
                                            $lookup: {
                                            from: "tripoffers",
                                            let: {
                                                driver_trip_id: "$_id",
                                                
                                            },
                                            
                                            pipeline: [
                                                {
                                                $match: {
                                                    $expr: {
                                                    $and: [
                                                        {
                                                            $eq: [
                                                            "$$driver_trip_id",
                                                            "$driver_trip_id"
                                                            ]
                                                        },

                                                        {
                                                            $eq: [
                                                            "$driver_id",
                                                            ObjectId(profile_id) 
                                                            ]
                                                        },
                                                        {
                                                            $eq: [
                                                            "$status",
                                                            1 
                                                            ]
                                                        },
                                                      

                                                    ]
                                                    }
                                                }
                                                }
                                            ],

                                            
                                            as: "findRiderInfo"
                                            },
                                        

                                        
                                        },
                                    
                                    ])
                                    await Promise.all(data.map(async (row) => {
                                        console.log('row',row)

                                        if(row.findRiderInfo.length > 0 ){
                                        console.log('row',row.findRiderInfo)
                                        await Promise.all(row.findRiderInfo.map(async (row1) => {

                                            const findtrip = await profileDB.findOne({profile_id : row1.rider_id});
                                            console.log('findtrip',findtrip)

                                            row1.rider_fullname = findtrip.fullname;
                                            row1.rider_gender = findtrip.gender;
                                            row1.rider_profile_photo = findtrip.profile_photo;
                                            row1.rider_destination_contact_no = findtrip.destination_contact_number;
                                            row1.rider_mobile_no = findtrip.mobile_no;
                                            row1.rider_type = findtrip.type;
                                        
                                        }))
                                        }
                                
                                        arr.push(row);
                                        

                                    }));

                                    await Promise.all(arr.map(async (row) => {
                                        console.log('row',row)

                                        if(row.findRiderInfo.length > 0 ){
                                        console.log('row',row.findRiderInfo)
                                        await Promise.all(row.findRiderInfo.map(async (row1) => {

                                            const findtrip1 = await tripDB.findOne({_id : row1.driver_trip_id});
                                            console.log('findtrip1',findtrip1)

                                            row1.rider_pickup_location = findtrip1.pickup_location;
                                            row1.riderpickup_lat = findtrip1.pickup_lat;
                                            row1.rider_pickup_long = findtrip1.pickup_long;
                                            row1.rider_destination_location = findtrip1.destination_location;
                                            row1.rider_destination_lat = findtrip1.destination_lat;
                                            row1.rider_actionType = findtrip1.actionType;
                                            row1.rider_trip_type = findtrip1.trip;
                                            if(findtrip1.trip == "rounded"){
                                            row1.rider_return_date_time = findtrip1.return_date_time;  
                                            }
                                                

                                        }))
                                        }
                                
                                        newarr.push(row);
                                        

                                    }));
                                    
                                   // console.log("userinfo", arr)
                                    return successWithData(res, 'Details found Successfully', newarr);
                  
                                   }
                                       
                                    
                                    
                                }
                            })
                        }
                        
                  
                    
                  }
                
               
            }catch(err){
                console.log(err);
            }
        },


    }