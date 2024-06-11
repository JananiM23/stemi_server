var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//  In Hospital Summary - Lab Report
var HospitalSummaryLabReportSchema = mongoose.Schema({
  PatientId: { type: Schema.Types.ObjectId, ref: 'PatientBasicDetails' },
  Hospital: { type: Schema.Types.ObjectId, ref: 'Hospital' },
  Lab_Report_Haemoglobin: { type: String },
  Lab_Report_Haemoglobin_Dosage_Units: { type: String }, 
  Lab_Report_Creatinine: { type: String },
  Lab_Report_Creatinine_Dosage_Units: { type: String },
  Lab_Report_CPK_Mb: { type: String },
  Lab_Report_CPK_Mb_Dosage_Units: { type: String },
  Lab_Report_Trop: { type: Number },
  Lab_Report_TropT: { type: Number },
  Lab_Report_TropI: { type: Number },
  Lab_Report_Trop_Dosage_Units: { type: String },
  Lab_Report_Trop_T: { type: String },
  Lab_Report_RBS: { type: String },
  Lab_Report_RBS_Dosage_Units: { type: String },
  Lab_Report_LDL: { type: String },
  Lab_Report_LDL_Dosage_Units: { type: String },
  Lab_Report_HDL: { type: String },
  Lab_Report_HDL_Dosage_Units: { type: String },
  Lab_Report_Cholesterol: { type: String },
  Lab_Report_Cholesterol_Dosage_Units: { type: String },
  Lab_Report_HBA1c: { type: String },
  Lab_Report_HBA1c_Dosage_Units: { type: String },
  Lab_Report_eGFR: { type: String },
  Lab_Report_eGFR_Dosage_Units: { type: String },
  Active_Status: { type: Boolean, required : true },
  If_Deleted: { type: Boolean, required : true },
 },
 { timestamps: true }
);
var VarHospitalSummaryLabReport = mongoose.model('HospitalSummaryLabReport', HospitalSummaryLabReportSchema, 'Hospital_Summary_Lab_Report');

//  In Hospital Summary - Medication in Hospital
var HospitalSummaryMedicationInHospitalSchema = mongoose.Schema({
    PatientId: { type: Schema.Types.ObjectId, ref: 'PatientBasicDetails' },
    Hospital: { type: Schema.Types.ObjectId, ref: 'Hospital' },
    Medication_In_Hospital_Nitroglycerin: { type: String },
    Medication_In_Hospital_Nitroglycerin_Route: { type: String },
    Medication_In_Hospital_Nitroglycerin_Dosage: { type: String },
    Medication_In_Hospital_Nitroglycerin_Dosage_Units: { type: String },
    Medication_In_Hospital_Nitroglycerin_Date_Time: { type: Date },
    Medication_In_Hospital_Dopamine: { type: String },
    Medication_In_Hospital_Dopamine_Route: { type: String },
    Medication_In_Hospital_Dopamine_Dosage: { type: String },
    Medication_In_Hospital_Dopamine_Dosage_Units: { type: String },
    Medication_In_Hospital_Dopamine_Date_Time: { type: Date },
    Medication_In_Hospital_Dobutamine: { type: String },
    Medication_In_Hospital_Dobutamine_Route: { type: String },
    Medication_In_Hospital_Dobutamine_Dosage: { type: String },
    Medication_In_Hospital_Dobutamine_Dosage_Units: { type: String },
    Medication_In_Hospital_Dobutamine_Date_Time: { type: Date },
    Medication_In_Hospital_Adrenaline: { type: String },
    Medication_In_Hospital_Adrenaline_Route: { type: String },
    Medication_In_Hospital_Adrenaline_Dosage: { type: String },
    Medication_In_Hospital_Adrenaline_Dosage_Units: { type: String },
    Medication_In_Hospital_Adrenaline_Date_Time: { type: Date },
    Medication_In_Hospital_Nor_Aadrenaline: { type: String },
    Medication_In_Hospital_Nor_Aadrenaline_Route: { type: String },
    Medication_In_Hospital_Nor_Aadrenaline_Dosage: { type: String },
    Medication_In_Hospital_Nor_Aadrenaline_Dosage_Units: { type: String },
    Medication_In_Hospital_Nor_Aadrenaline_Date_Time: { type: Date },
    Medication_In_Hospital_Oxygen: { type: String },
    Medication_In_Hospital_Oxygen_Dosage: { type: String },
    Medication_In_Hospital_Aspirin: { type: String },
    Medication_In_Hospital_Aspirin_Dosage: { type: String },
    Medication_In_Hospital_Aspirin_Dosage_Date_Time: { type: Date },
    Medication_In_Hospital_Clopidogrel: { type: String },
    Medication_In_Hospital_Clopidogrel_Dosage: { type: String },
    Medication_In_Hospital_Clopidogrel_Dosage_Date_Time: { type: Date},
    Medication_In_Hospital_Prasugrel: { type: String },
    Medication_In_Hospital_Prasugrel_Dosage: { type: String },
    Medication_In_Hospital_Prasugrel_Dosage_Date_Time: { type: Date },
    Medication_In_Hospital_Ticagrelor: { type: String },
    Medication_In_Hospital_Ticagrelor_Dosage: { type: String },
    Medication_In_Hospital_Ticagrelor_Dosage_Date_Time: { type: Date },
    Medication_In_Hospital_IIbIIIa_inhibitor: { type: String },
    Medication_In_Hospital_IIbIIIa_inhibitor_Dosage: { type: String },
    Medication_In_Hospital_IIbIIIa_inhibitor_Date_Time: { type: Date },
    Medication_In_Hospital_Inotrope: { type: String },
    Medication_In_Hospital_Inotrope_Dosage: { type: String },
    Medication_In_Hospital_Inotrope_Date_Time: { type: Date },
	 Medication_In_Hospital_Enoxaparin: { type: String },
	 Medication_In_Hospital_Enoxaparin_Dosage: { type: String },
	 Medication_In_Hospital_Enoxaparin_Date_Time: { type: Date },
    Medication_In_Hospital_UnFractionated_Heparin: { type: String },
    Medication_In_Hospital_UnFractionated_Heparin_Route: { type: String },
    Medication_In_Hospital_UnFractionated_Heparin_Dosage: { type: String },
    Medication_In_Hospital_UnFractionated_Heparin_Dosage_Units: { type: String },
    Medication_In_Hospital_UnFractionated_Heparin_Date_Time: { type: Date },
    Medication_In_Hospital_LMW_Heparin: { type: String },
    Medication_In_Hospital_LMW_Heparin_Route: { type: String },
    Medication_In_Hospital_LMW_Heparin_Dosage: { type: String },
    Medication_In_Hospital_LMW_Heparin_Dosage_Units: { type: String },
    Medication_In_Hospital_LMW_Heparin_Date_Time: { type: Date },
    Medication_In_Hospital_Fondaparinux: { type: String },
    Medication_In_Hospital_Fondaparinux_Route: { type: String },
    Medication_In_Hospital_Fondaparinux_Dosage: { type: String },
    Medication_In_Hospital_Fondaparinux_Dosage_Units: { type: Date },
	 Medication_In_Hospital_Fondaparinux_Date_Time: { type: Date },
    Medication_In_Hospital_N_Saline: { type: String },
    Medication_In_Hospital_Morphine: { type: String },
    Medication_In_Hospital_Atropine: { type: String },
    OtherMedicationArray: [{
      Medication_In_Hospital_Other_Medicine_Name: { type: String },
      Medication_In_Hospital_Other_Medicine_Route: { type: String },
      Medication_In_Hospital_Other_Medicine_Dosage: { type: String },
      Medication_In_Hospital_Other_Medicine_Dosage_Units: { type: String },
      Medication_In_Hospital_Other_Medicine_Dosage_Date_Time: { type: Date }
    }],
    Active_Status: { type: Boolean, required: true },
    If_Deleted: { type: Boolean, required: true },
   },
   { timestamps: true }
);
var VarHospitalSummaryMedicationInHospital = mongoose.model('HospitalSummaryMedicationInHospital', HospitalSummaryMedicationInHospitalSchema, 'Hospital_Summary_Medication_In_Hospital');

//  In Hospital Summary - Adverse Events
var HospitalSummaryAdverseEventsSchema = mongoose.Schema({
    PatientId: { type: Schema.Types.ObjectId, ref: 'PatientBasicDetails' },
    Hospital: { type: Schema.Types.ObjectId, ref: 'Hospital' },
    Adverse_Events_Primary_Reperfusion_therapy: { type: String },
    Adverse_Events_Reperfusion_Late_presentation: { type: String },
    Adverse_Events_Reperfusion_Other: { type: String },
    Adverse_Events_Reperfusion_Specify_Other: { type: String },
    Adverse_Events_Recurrence_Of_Angina: { type: String },
    Adverse_Events_Recurrence_Of_Angina_Date: { type: Date },
    Adverse_Events_Re_infarction: { type: String },
    Adverse_Events_Location_Of_Re_infarction: { type: String },
    Adverse_Events_Re_infarction_Date: { type: Date },
    Adverse_Events_Repeat_Pci: { type: String },
    Adverse_Events_Repeat_Pci_Date: { type: Date },
    Adverse_Events_Repeat_Cabg: { type: String },
    Adverse_Events_Repeat_Cabg_Date: { type: Date },
    Adverse_Events_Stroke: { type: String },
    Adverse_Events_Stroke_Date: { type: Date },
    Adverse_Events_Cardiogenic_Shock: { type: String },
    Adverse_Events_Cardiogenic_Shock_Date: { type: Date },
    Adverse_Events_Hemorrhage: { type: String },
    Adverse_Events_Hemorrhage_Date: { type: Date },
    Adverse_Events_Major_Bleed: { type: String },
    Adverse_Events_Major_Bleed_Date: { type: Date },
    Adverse_Events_Minor_Bleed: { type: String },
    Adverse_Events_Minor_Bleed_Date: { type: Date },
    Adverse_Events_In_stent_thrombosis: { type: String },
	 Adverse_Events_Prolonged_Admission_Beyond30Days: { type: String },
    Adverse_Events_Death: { type: String },
	 Adverse_Events_Cause_of_Death: { type: String },
    Adverse_Events_Death_Date_Time: { type: Date },
    Adverse_Events_Death_Remarks: { type: String },

    OtherMedicationArrayAdverseEvent: [{
      Adverse_Events_Others: { type: String },
    }],
    Active_Status: { type: Boolean, required : true },
    If_Deleted: { type: Boolean, required : true },
   },
   { timestamps: true }
);
var VarHospitalSummaryAdverseEvents = mongoose.model('HospitalSummaryAdverseEvents', HospitalSummaryAdverseEventsSchema, 'Hospital_Summary_Adverse_Events');


module.exports = {
    HospitalSummaryLabReportSchema : VarHospitalSummaryLabReport,
    HospitalSummaryMedicationInHospitalSchema : VarHospitalSummaryMedicationInHospital,
    HospitalSummaryAdverseEventsSchema : VarHospitalSummaryAdverseEvents
};