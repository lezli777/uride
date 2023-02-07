const mongoose = require('mongoose');
const usersTripSchema = mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'signups' },
    type:{type : Number},
    actionType:{type : String},  //trip for driver, ride for rider, delivery for rider
    pickup_location: { type: String },
    pickup_lat: { type: Number },
    pickup_long: { type: Number },
    destination_location: { type: String },
    destination_lat: { type: Number },
    destination_long: { type: Number },    
    trip: { type: String },
    depart_date_time: { type: Date },
    //depart_time: { type: String },
    return_date_time: { type: Date},
    //return_time: { tlype: String },
    amount: { type: Number },
    payment: { type: String },
    request_expiration: { type: Number  },
    number_of_riders: { type: Number },  // seat_available for driver side
    number_of_bags: { type: Number },    // bag_allowed for driver side
    special_request: { type: String },    
    status:{type: Number},   // 0 : trip created/upcoming, 1: pending, 2: accepted, 3: approved 4: cancelled, 5: running 6 : completed
    received_offer : {type: Number},
    trip_accepted : {type : Number }, //1 : yes , 0 : no
    seat_left_need :{type : Number }, 
    is_trip_full :{type : Number }, //1 : full , 0 : not full
    // offer_price_sent_by_rider : {type : Number},
    trip_distance:{type: Number},
    created_date: { type: Date},
    updated_date: { type: Date }
    

    
    

})
module.exports = mongoose.model('userTrips', usersTripSchema);
