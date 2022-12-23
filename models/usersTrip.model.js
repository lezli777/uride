const mongoose = require('mongoose');
const usersTripSchema = mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'signups' },
    role:{type : String},
    pickup_location: { type: String },
    pickup_lat: { type: String },
    pickup_long: { type: String },
    destination_location: { type: String },
    destination_lat: { type: String },
    destination_long: { type: String },
    trip: { type: String },
    depart_date: { type: String },
    depart_time: { type: String },
    return_date: { type: String },
    return_time: { type: String },
    amount: { type: String },
    payment: { type: String },
    request_expiration: { type: String  },
    number_of_riders: { type: Number },  // seat_available for driver side
    number_of_bags: { type: Number },    // bag_allowed for driver side
    special_request: { type: String },
    payment: { type: String },
    status:{type: Number},
    created_date: { type: String, default: Date.now },
    updated_date: { type: String }

})
module.exports = mongoose.model('userTrips', usersTripSchema);
