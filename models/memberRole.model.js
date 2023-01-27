const mongoose = require('mongoose');
const roleSchema = mongoose.Schema({
    //driver_id: { type: mongoose.Schema.Types.ObjectId, ref: 'signups' },
    role: { type: String },
    role_id: { type: String },    
})
module.exports = mongoose.model('roles', roleSchema);
