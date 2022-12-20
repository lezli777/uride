const mongoose = require('mongoose');
const paymentmethodSchema = mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'signups' },
    payment_type: { type: String },
    card_no: { type: String },
    name_on_card: { type: String },
    expiration_date: { type: String },
    cvv: { type: String },
    status: { type: Number }
})
module.exports = mongoose.model('paymentmethods', paymentmethodSchema);
