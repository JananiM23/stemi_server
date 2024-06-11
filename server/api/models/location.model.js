var mongoose = require('mongoose');

// Location Schema
var LocationSchema = mongoose.Schema({
    Location_Name: { type: String, required : true },
    Location_Code: { type: Number, required : true },
    Active_Status: { type : Boolean, required : true },
    If_Deleted: { type : Boolean, required : true },
    },
    { timestamps: true }
);

var VarLocation = mongoose.model('Location', LocationSchema, 'Stemi_Location');

module.exports = {
   LocationSchema : VarLocation
};
