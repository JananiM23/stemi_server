var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var BPLPatientsSchema = mongoose.Schema({
   Patient_Id: { type: String },
   Patient_Name: { type: String },
   Patient_Age: { type: String },
   Patient_Gender: { type: String },
   Patient_Height: { type: String },
   Patient_Weight: { type: String },
   Patient_BP: { type: String },
   Device_Id: { type: String },
   Device_Management: { type: Schema.Types.ObjectId, ref: 'Device_Management' },
   Hospital: { type: Schema.Types.ObjectId, ref: 'Hospital' },
   User: { type: Schema.Types.ObjectId, ref: 'User' },
   Confirmed_UserType: { type: String }, // PeripheralUser, Doctor, ClusterDoctor
   Confirmed_By: { type: Schema.Types.ObjectId, ref: 'User' },
   ECG_Taken_date_time: { type: Date },
   ECG_Report: { type: String }, // PDF Report
   ECG_File: { type: String }, // ECG Image
   Patient_Status: {
      type: String,
      enum: ['Pending', 'Stemi_Confirmed', 'Stemi_Ask_Cardiologist', 'FollowUp']
   },
   Active_Status: { type: Boolean, required: true },
   If_Deleted: { type: Boolean, required: true },
   },
  { timestamps: true }
 );
 
 var VarBPL_Patients = mongoose.model('BPL_Patients', BPLPatientsSchema, 'BPL_Patients');
 
 module.exports = {
   BPLPatientsSchema: VarBPL_Patients,
 };
