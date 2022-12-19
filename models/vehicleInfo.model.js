const mongoose=require('mongoose');
const vehicleInfoSchema=mongoose.Schema({
    driver_id:{type : mongoose.Schema.Types.ObjectId ,ref : 'profiles'},
    make:{type:String},
    model:{type:String},
    year:{type:String},
    upload_vehicle_registration:{type:String},
    upload_inssurance_card:{type:String},
    upload_driver_licence:{type:String},
    status : 1
})
module.exports=mongoose.model('vehicleInfos',vehicleInfoSchema);
