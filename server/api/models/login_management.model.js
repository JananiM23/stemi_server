var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// User Management Schema APP
var LoginHistorySchema = mongoose.Schema({
   User: { type: Schema.Types.ObjectId, ref: 'User' },
   LoginToken: { type: String },
   Hash: { type: String },
   LastActive: { type: Date },
   LoginFrom: { type: String },
   Firebase_Token: {type: String},
   Device_Type: {type: String}, // Android , IOS , TAB
   Device_Id: {type: String},
   Active_Status: { type : Boolean },
   If_Deleted: { type : Boolean },
   },
   { timestamps: true }
);

var VarLoginHistory = mongoose.model('Login_App_History', LoginHistorySchema, 'StemiApp_Login_History');

module.exports = {
   LoginHistorySchema : VarLoginHistory
};
