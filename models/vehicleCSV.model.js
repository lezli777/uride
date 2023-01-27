const mongoose = require('mongoose');
const vehicleCSVSchema = mongoose.Schema({    
    make: { type: String },
    model: { type: String },
    year: { type: Number },
    created_date: { type: Date },    
})
module.exports = mongoose.model('vehicleCsvFiles', vehicleCSVSchema);
