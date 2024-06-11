var mongoose = require('mongoose');

// Referral Facility Schema
var ReferralFacilitySchema = mongoose.Schema({
    Hospital_Name: { type: String, required : true },
    Hospital_Type: { type: String, required : true },
	 Hospital_Address: { type: String, required : true },
    Active_Status: { type : Boolean, required : true },
    If_Deleted: { type : Boolean, required : true },
    },
    { timestamps: true }
);

var VarReferralFacility = mongoose.model('Referral_Facility', ReferralFacilitySchema, 'Referral_Facility');

module.exports = {
   ReferralFacilitySchema : VarReferralFacility
};
