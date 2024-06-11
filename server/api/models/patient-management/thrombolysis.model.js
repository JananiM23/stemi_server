var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//  Medication prior to Thrombolysis Schema
var ThrombolysisMedicationSchema = mongoose.Schema({
   PatientId: { type: Schema.Types.ObjectId, ref: 'PatientBasicDetails' },
   Hospital: { type: Schema.Types.ObjectId, ref: 'Hospital' },
   Medication_Prior_to_Thrombolysis_Aspirin: { type: String },
   Medication_Prior_to_Thrombolysis_Aspirin_Dosage: { type: Number },
   Medication_Prior_to_Thrombolysis_Aspirin_Dosage_Units: { type: String },
   Aspirin_Date_Time: { type: Date },
   Medication_Prior_to_Thrombolysis_Clopidogrel: { type: String },
   Medication_Prior_to_Thrombolysis_Clopidogrel_Dosage: { type: Number },
   Medication_Prior_to_Thrombolysis_Clopidogrel_Dosage_Units: { type: String },
   Medication_Prior_to_Thrombolysis_Clopidogrel_Dosage_Date_Time: { type: Date },
   Unfractionated_Heparin: { type: String },
   Unfractionated_Heparin_Dosage: { type: String },
   Unfractionated_Heparin_Dosage_Units: { type: String },
   Unfractionated_Heparin_Dosage_Date_Time: { type: Date },
   Medication_Prior_to_Thrombolysis_LMW_Heparin: { type: String },
   Medication_Prior_to_Thrombolysis_LMW_Heparin_Dosage: { type: Number },
   Medication_Prior_to_Thrombolysis_LMW_Heparin_Dosage_Units: { type: String },
   Medication_Prior_to_Thrombolysis_LMW_Heparin_Dosage_Date_Time: { type: Date },
   Medication_Prior_to_Thrombolysis_Ticagrelor: { type: String },
   Medication_Prior_to_Thrombolysis_Ticagrelor_Dosage: { type: Number },
   Medication_Prior_to_Thrombolysis_Ticagrelor_Dosage_Units: { type: String },
   Medication_Prior_to_Thrombolysis_Ticagrelor_Dosage_Units_Date_Time: { type: Date },
	Medication_Prior_to_Thrombolysis_Enoxaparin: { type: String },
   Medication_Prior_to_Thrombolysis_Enoxaparin_Dosage: { type: Number },
   Medication_Prior_to_Thrombolysis_Enoxaparin_Dosage_Units: { type: String },
   Medication_Prior_to_Thrombolysis_Enoxaparin_Dosage_Units_Date_Time: { type: Date },
   OtherMedicationArray: [{
      Medication_Prior_to_Thrombolysis_Other_Medicine: { type: String },
      Medication_Prior_to_Thrombolysis_Other_Medicine_Dosage: { type: Number },
      Medication_Prior_to_Thrombolysis_Other_Medicine_Dosage_Units: { type: String },
      Medication_Prior_to_Thrombolysis_Other_Medicine_Date_Time: { type: Date },
   }],
   Active_Status: { type: Boolean, required: true },
   If_Deleted: { type: Boolean, required: true },
   },
   { timestamps: true }
);
var VarThrombolysisMedicationSchema = mongoose.model('ThrombolysisMedication', ThrombolysisMedicationSchema, 'Thrombolysis-Medication-Thrombolysis');

// Thrombolysis - Thrombolysis
var ThrombolysisSchema = mongoose.Schema({
   PatientId: { type: Schema.Types.ObjectId, ref: 'PatientBasicDetails' },
   Hospital: { type: Schema.Types.ObjectId, ref: 'Hospital' },
   Thrombolysis: { type: String },
   Reason_to_proceed_for_thrombolysis: { type: String },
   Thrombolysis_Agent_Select_any_one: { type: String },
   Thrombolysis_Agent_Completed: { type: String },
   Thrombolysis_Agent_Dosage: { type: Number },
   Thrombolysis_Agent_Dosage_Units: { type: String },
   Thrombolysis_Agent_Dosage_Start_Date_time: { type: Date },
   Thrombolysis_Agent_Dosage_End_Date_time: { type: Date },
   Thrombolysis_90_120_Min_ECG: { type: String },
   Thrombolysis_90_120_Min_ECG_Date_Time: { type: Date },
   Thrombolysis_Successful_Lysis: { type: String },
	Thrombolysis_MissedSTEMI: { type: String },
   Thrombolysis_Autoreperfused: { type: String },
   Thrombolysis_Others: { type: String },
	Reperfusion_Markers: { type: String },
   Ongoing_pain: { type: String },
   lessThan50_reduction_ST_elevation: { type: String },
   Haemodynamic_instability: { type: String },
   Electrical_instability: { type: String },
   Active_Status: { type: Boolean, required: true },
   If_Deleted: { type: Boolean, required: true },
   },
   { timestamps: true }
);
var VarThrombolysisSchema = mongoose.model('Thrombolysis', ThrombolysisSchema, 'Thrombolysis');

module.exports = {
    ThrombolysisMedicationSchema : VarThrombolysisMedicationSchema,
    ThrombolysisSchema : VarThrombolysisSchema
};