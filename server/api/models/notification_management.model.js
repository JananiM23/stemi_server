var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var NotificationSchema = mongoose.Schema({
   User_ID: { type: Schema.Types.ObjectId, ref: 'User' },
   Patient_ID: { type: Schema.Types.ObjectId, ref: 'PatientBasic_Mob_Details' },
   Confirmed_PatientId: {type: Schema.Types.ObjectId, ref: 'PatientBasicDetails' },
   BPL_ID: { type: Schema.Types.ObjectId, ref: 'BPL_Patients' },
   Notification_Type: {type: String}, // Stemi_Confirmed_ByUser, Stemi_Ask_Cardiologist_ByUser, Stemi_Confirmed_ByDoctor, Stemi_Not_Confirmed_ByDoctor, AskingRepeat_ECG_ByDoctor, NewECG_Updated_ByUser, STEMI_Patient_Transfer
   Message: { type: String },
   TransferFrom: {type: Schema.Types.ObjectId, ref: 'Hospital' },
   TransferTo: {type: Schema.Types.ObjectId, ref: 'Hospital' },
   Message_Received: { type : Boolean , required : true },
   Message_Viewed: { type : Boolean , required : true },
   Active_Status: { type : Boolean , required : true },
   If_Deleted: { type : Boolean , required : true },
   },
   { timestamps: true }
);


var VarNotificationDetails = mongoose.model('Notification_Details', NotificationSchema, 'Notification_Details');

 module.exports = {
   NotificationSchema : VarNotificationDetails
 };