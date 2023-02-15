const mongoose = require('mongoose');
const riderRatingSchema = mongoose.Schema({
    rider_id: { type: mongoose.Schema.Types.ObjectId, ref: 'signups' },
    driver_id: { type: mongoose.Schema.Types.ObjectId, ref: 'signups' },
    ride_id: { type: mongoose.Schema.Types.ObjectId, ref: 'userTrips' },
    rating: {type : Number},
    issue: { type: String },
    issue_desc: { type: String },    
    created_date: { type: Date },
})
module.exports = mongoose.model('riderRatings', riderRatingSchema);