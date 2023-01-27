const mongoose = require('mongoose');
const tripOfferSchema = mongoose.Schema({
    rider_id: { type: mongoose.Schema.Types.ObjectId, ref: 'signups' },    
    rider_depart_date_time: {type: Date},
    rider_amount: {type: Number} ,
    rider_seat_request: {type: Number},
    rider_trip_id: { type: mongoose.Schema.Types.ObjectId, ref: 'usertrips' },  
    is_trip_accepted_by_rider : {type : Number }, //1 : yes , 0 : no     

    driver_trip_id: { type: mongoose.Schema.Types.ObjectId, ref: 'usertrips' },
    driver_id: { type: mongoose.Schema.Types.ObjectId, ref: 'signups' }, 
    driver_seat_available: {type: Number},
    is_trip_accepted_by_driver : {type : Number }, //1 : yes , 0 : no  
    
    status:{type: Number},   // 0 : pending, 1: accepted, 2: cancel, 3: trip deleted by driver 4. complete 
    // offer_price_sent_by_rider : {type : Number},
    created_date: { type: Date },
    updated_date: { type: Date }
    

})
module.exports = mongoose.model('tripOffers', tripOfferSchema);
