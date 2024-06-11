var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Discharge-Transfer Death
var DischargeTransferDeathSchema = mongoose.Schema({
   PatientId: { type: Schema.Types.ObjectId, ref: 'PatientBasicDetails' },
   Hospital: { type: Schema.Types.ObjectId, ref: 'Hospital' },
   Discharge_Transfer_Death: { type: String },
   Discharge_Transfer_Cause_of_Death: { type: String },
   Discharge_Transfer_Death_Date_Time: { type: Date },
   Discharge_Transfer_Remarks: { type: String },
   Active_Status: { type: Boolean, required : true },
   If_Deleted: { type: Boolean, required : true },
   },
   { timestamps: true }
);
var VarDischargeTransferDeath = mongoose.model('DischargeTransferDeath', DischargeTransferDeathSchema, 'Discharge_Transfer_Death');

// Discharge-Transfer Medications
var DischargeTransferMedicationsSchema = mongoose.Schema({
   PatientId: { type: Schema.Types.ObjectId, ref: 'PatientBasicDetails' },
   Hospital: { type: Schema.Types.ObjectId, ref: 'Hospital' },
   Discharge_Medications_Aspirin: { type: String },
   Discharge_Medications_Clopidogrel: { type: String },
   Discharge_Medications_Prasugrel: { type: String },
   Discharge_Medications_Ticagrelor: { type: String },
   Discharge_Medications_ACEI: { type: String },
   Discharge_Medications_ARB: { type: String },
   Discharge_Medications_Beta_Blocker: { type: String },
   Discharge_Medications_Nitrate: { type: String },
   Discharge_Medications_Statin: { type: String },
	Discharge_Medications_Statin_Option: { type: String },
   Discharge_Medications_Echocardiography: { type: String },
   Discharge_Medications_Ejection_Fraction: { type: Number },
   OtherMedicationArray: [{
      Discharge_Medications_Other_Medicine: { type: String },
   }],
   Active_Status: { type: Boolean, required : true },
   If_Deleted: { type: Boolean, required : true },
  },
  { timestamps: true }
);
var VarDischargeTransferMedications = mongoose.model('DischargeTransferMedications', DischargeTransferMedicationsSchema, 'Discharge_Transfer_Medications');

// Discharge-Transfer
var DischargeTransferSchema = mongoose.Schema({
   PatientId: { type: Schema.Types.ObjectId, ref: 'PatientBasicDetails' },
   Hospital: { type: Schema.Types.ObjectId, ref: 'Hospital' },
   Discharge_Transfer_ICU_CCU_HCU_Date_Time: { type: Date },
   Discharge_Transfer_from_Hospital_Date_Time: { type: Date },
   Discharge_Transfer_To: { type: String },
   Discharge_Details_Remarks: { type: String },
   Transfer_to_Stemi_Cluster: { type: Schema.Types.ObjectId, ref: 'Cluster' },
   Transfer_to_Stemi_Cluster_Hospital_Name: { type: Schema.Types.ObjectId, ref: 'Hospital' },
   Transfer_to_Stemi_Cluster_Hospital_Address: { type: String },
   Transfer_to_Non_Stemi_Cluster_Hospital_Hospital_Name: { type: String },
   Transfer_to_Non_Stemi_Cluster_Hospital_Hospital_Address: { type: String },
   Transport_Vehicle: { type: String },
	Transport_Vehicle_Other: { type: String },
   Discharge_Cluster_Ambulance: { type: Schema.Types.ObjectId, ref: 'Hospital' },
   Discharge_Ambulance_Call_Date_Time: { type: Date },
   Discharge_Ambulance_Arrival_Date_Time: { type: Date },
   Discharge_Ambulance_Departure_Date_Time: { type: Date },
   Active_Status: { type: Boolean, required : true },
   If_Deleted: { type: Boolean, required : true },
  },
  { timestamps: true }
);
var VarDischargeTransfer = mongoose.model('DischargeTransfer', DischargeTransferSchema, 'Discharge_Transfer');


module.exports = {
   DischargeTransferDeathSchema : VarDischargeTransferDeath,
   DischargeTransferMedicationsSchema : VarDischargeTransferMedications,
   DischargeTransferSchema : VarDischargeTransfer
};