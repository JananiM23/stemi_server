var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// User Management Schema
var UserManagementSchema = mongoose.Schema({
    User_Name: { type: String, unique: true },
    Password: { type: String },
    Name: { type: String },
    Email: { type: String },
    Phone: { type: String },
    User_Type: { type: String }, // SA: Super Admin,  CO: Coordinators, D: Doctors, CDA: Cluster Doctors, PU: Peripheral Users
    DocRegID: { type: String },
    Qualification: { type: String },
    Designation: { type: String },
    Location: { type: Schema.Types.ObjectId,  ref: 'Location' },
    Cluster: { type: Schema.Types.ObjectId,  ref: 'Cluster' },
    ClustersArray: [{ type: Schema.Types.ObjectId, ref: 'Cluster' }],
    Hospital: { type: Schema.Types.ObjectId,  ref: 'Hospital' },
    HospitalsArray: [{ type: Schema.Types.ObjectId, ref: 'Hospital' }],
    Alert_Duration: { type: Number},
    onlyViewAccess: { type: Boolean},
    Active_Status: { type : Boolean },
    If_Deleted: { type : Boolean },
    },
    { timestamps: true }
);

var LoginHistorySchema = mongoose.Schema({
   User: { type: Schema.Types.ObjectId, ref: 'User' },
   LoginToken: { type: String },
   Hash: { type: String },
   LastActive: { type: Date },
   LoginFrom: { type: String },
   Active_Status: { type : Boolean },
   If_Deleted: { type : Boolean },
   },
   { timestamps: true }
);

var VarUser = mongoose.model('User', UserManagementSchema, 'Stemi_User');
var VarLoginHistory = mongoose.model('LoginHistory', LoginHistorySchema, 'Stemi_Login_History');

module.exports = {
   UserManagementSchema : VarUser,
   LoginHistorySchema : VarLoginHistory

};
