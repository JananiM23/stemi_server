var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Device Management Schema
var DeviceManagementSchema = mongoose.Schema({
    Device_UID: { type: String },
    Location: { type: Schema.Types.ObjectId,  ref: 'Location' },
    Cluster: { type: Schema.Types.ObjectId,  ref: 'Cluster' },
    Hospital: { type: Schema.Types.ObjectId,  ref: 'Hospital' },
    Active_Status: { type : Boolean },
    If_Deleted: { type : Boolean },
    },
    { timestamps: true }
);


var VarDevice_Management = mongoose.model('Device_Management', DeviceManagementSchema, 'Stemi_Device_Management');

module.exports = {
   DeviceManagementSchema : VarDevice_Management
};