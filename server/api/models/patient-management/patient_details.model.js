var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//  Patient Basic Details Schema
var PatientBasicDetailsSchema = mongoose.Schema({
   Patient_Code: { type: Number },
   Patient_Unique: { type: String },
   Patient_Unique_Identity: {type: String},
   Temp_Patient_Unique: {type: String},
   Patient_Name: { type: String },
   Patient_Age: { type: String },
   DateOfBirth: { type: Date },
   Patient_Gender: { type: String },
   Race: { type: String },
   Race_Other: { type: String }, 
   Patient_PhoneNo: { type : String },
   Patient_Address: { type : String },
   Patient_Payment: { type : String },
   Hospital_Id: { type : String },
   Telephone_Number: { type : String },
   Postal_Code: { type : String },
   Income: { type : String },
   consent_form:  { type: String },
   QR_image: { type : String },
   Symptom_Onset_Date_Time: { type : Date },
	First_Medical_Contact_Date_Time: { type : Date },
   Initiated_Hospital: { type: Schema.Types.ObjectId, ref: 'Hospital' },
   Initiated_Hospital_Arrival: { type: Date },
   EMS_Ambulance_Call_Date_Time: { type : Date },
   EMS_Ambulance_Departure_Date_Time: { type : Date },

// Hospital History
   Hospital_History: [{
      Hospital_Count: { type : Number },
      Hospital: { type: Schema.Types.ObjectId, ref: 'Hospital' },
      Handled_User: { type: Schema.Types.ObjectId, ref: 'User' },
      Patient_Admission_Type: { type: String },
      Hospital_Arrival_Date_Time: { type: Date },
   }],

   If_NonCluster: { type : Boolean },
	NonCluster_Hospital_Name: { type: Schema.Types.ObjectId, ref: 'Referral_Facility' },
   NonCluster_Hospital_Name_NonSpoke: { type : String },
   NonCluster_Hospital_Type: { type : String },
   NonCluster_Hospital_Address: { type : String },
   NonCluster_Hospital_Arrival_Date_Time: { type : Date },
	NonCluster_TransportMode: { type : String },
	NonCluster_TransportMode_Other: { type : String },
	NonCluster_Ambulance_Call_Date_Time: { type : Date },
	NonCluster_Ambulance_Arrival_Date_Time: { type : Date },
	NonCluster_Ambulance_Departure_Date_Time: { type: Date },

// Transport Details
   Transport_History: [{
      Transport_Count: { type : Number },
      Transport_From_Hospital: { type: Schema.Types.ObjectId, ref: 'Hospital' },
      Transport_To_Hospital: { type: Schema.Types.ObjectId, ref: 'Hospital' },
      TransportMode: { type : String },
      TransportMode_Other: { type : String },
      ClusterAmbulance: { type: Schema.Types.ObjectId, ref: 'Hospital' },
      Ambulance_Call_Date_Time: { type : Date },
      Ambulance_Arrival_Date_Time: { type : Date },
      Ambulance_Departure_Date_Time: { type: Date },
   }],

// STEMI Details
   ECG_Taken_Type: { type: String }, // Systemic, Manual
   ECG_File:  { type: String },
   All_ECG_Files: [{
      Name: {type: String},
      ECG_File: { type: String },
      DateTime: { type: Date },
      Hospital: { type: Schema.Types.ObjectId, ref: 'Hospital' },
   }],
   App_ECG_Files: [{
      Name: {type: String},
      ECG_File: { type: String },
      DateTime: { type: Date },
      Hospital: { type: Schema.Types.ObjectId, ref: 'Hospital' },
   }],
   Ninety_Min_ECG_Files: [{
      Name: {type: String},
      ECG_File: { type: String },
      DateTime: { type: Date },
      Hospital: { type: Schema.Types.ObjectId, ref: 'Hospital' },
   }],
   ECG_Taken_date_time: { type : Date },
   Stemi_Confirmed: { type : String }, // Yes, No
   Stemi_Confirmed_Date_Time: { type: Date },
   Stemi_Confirmed_Hospital: { type: Schema.Types.ObjectId, ref: 'Hospital' },
   Stemi_Confirmed_Type: { type: String }, // User, Doctor
   Stemi_Confirmed_By: { type: Schema.Types.ObjectId, ref: 'User' },
   Location_of_Infarction:  { type: String },

// Post Thrombolysis
   Post_Thrombolysis: { type : String }, // Yes, No
   Post_Thrombolysis_Data: {
		// Yes
      Thrombolytic_Agent: { type: String },
      Dosage: { type : String },
      Dosage_Units: { type : String },
      Post_Thrombolysis_Start_Date_Time: { type : Date },
      Post_Thrombolysis_End_Date_Time: { type: Date },
      Ninety_Min_ECG: { type: String }, // Yes, No
      Ninety_Min_ECG_Date_Time: { type: Date },
      Successful_Lysis: { type : String }, // Yes, No
		// No
		MissedSTEMI: { type: String }, // Yes, No\
		Autoreperfused: { type: String }, // Yes, No\
		Others: { type : String }
   },

// Clinical Examination
   Clinical_Examination_History: [{
      Hospital: { type: Schema.Types.ObjectId, ref: 'Hospital' },
      Patient_Height: { type : String },
      Patient_Weight: { type : String },
      BMI: { type: String },
      BP_Systolic: { type: String },
      BP_Diastolic: { type : String },
      Heart_Rate: { type : String },
      SP_O2: { type : String },
      Abdominal_Girth: { type : String },
      Kilip_Class: { type: String }
   }],
   Doctor_Notes: {type: String},
   LastCompletion: { type: String },
   LastCompletionChild: { type: String },

   ST_Elevation: [ { type: Object } ],
   ST_Depression: [ { type: Object } ],
   LBBB: {type: String},

   IfThrombolysis: { type: Boolean },
   ThrombolysisFrom: { type: Schema.Types.ObjectId, ref: 'Hospital' },
   IfPCI: { type: Boolean },
   PCIFrom: { type: Schema.Types.ObjectId, ref: 'Hospital' },
   IfDeath: { type: Boolean },
   IfDischarge: { type: Boolean },
   DidNotArrive: { type: Boolean },

   FirstAskTime: { type: Date },
   FirstRepailedTime: { type: Date },

   TransferBending: { type: Boolean },
   TransferBendingTo: { type: Schema.Types.ObjectId, ref: 'Hospital' },
   DischargeTransferId: { type: Schema.Types.ObjectId, ref: 'DischargeTransfer' },

   Data_Type: { type: String }, // Pre, Post

   Active_Status: { type : Boolean , required : true },
   If_Deleted: { type : Boolean , required : true },
   },
   { timestamps: true }
);
var VarPatientBasicDetails = mongoose.model('PatientBasicDetails', PatientBasicDetailsSchema, 'Patient_Basic_Details');

//  Patient Fibrinolytic Checklist Schema
var PatientFibrinolyticChecklistSchema = mongoose.Schema({
   PatientId: { type: Schema.Types.ObjectId, ref: 'PatientBasicDetails' },
   Hospital: { type: Schema.Types.ObjectId, ref: 'Hospital' },
   Systolic_BP_greater_than_180_mmHg: { type : String },
   Diastolic_BP_greater_than_110_mmHg: { type : String },
   Right_Left_arm_Systolic_BP_difference_greater_than_15_mmHg: { type : String },
   History_of_structural_central_nervous_system_disease: { type : String },
   Significant_closed_head_facial_trauma_within_the_previous_3_months: { type : String },
   Recent_major_trauma_surgery_GI_GU_bleed: { type : String },
   Bleeding_or_Clotting_problem_or_on_blood_thinners: { type : String },
   CPR_greater_than_10_min: { type : String },
   Pregnant_Female: { type : String },
   Serious_systemic_disease: { type : String },
   Does_the_Patient_have_severe_heart_failure_or_cardiogenic_shock_such_that_PCI_is_preferable: { type : String },
   Pulmonary_edema: { type : String },
   Systemic_hypoperfusion: { type : String },
	Other_contraindications_to_Lysis: { type : String },
   Specify_Other_contraindications: { type : String },
   Active_Status: { type : Boolean, required : true },
   If_Deleted: { type : Boolean, required : true },
   },
   { timestamps: true }
);
var VarPatientFibrinolyticChecklist = mongoose.model('PatientFibrinolyticChecklist', PatientFibrinolyticChecklistSchema, 'Patient_Fibrinolytic_Checklist');

// Patient Medication During Transportation
var PatientMedicationTransportationSchema = mongoose.Schema({
   PatientId: { type: Schema.Types.ObjectId, ref: 'PatientBasicDetails' },
   Hospital: { type: Schema.Types.ObjectId, ref: 'Hospital' },
   Transportation_Medication_Oxygen: { type: String },
   Transportation_Medication_Oxygen_Dosage: { type: String },
   Transportation_Medication_Aspirin: { type: String },
   Transportation_Medication_Aspirin_Dosage: { type: String },
   Transportation_Medication_Aspirin_Dosage_Date_Time: { type: Date },
   Transportation_Medication_Clopidogrel: { type: String },
   Transportation_Medication_Clopidogrel_Dosage: { type: String },
   Transportation_Medication_Clopidogrel_Dosage_Date_Time: { type: Date},
   Transportation_Medication_Prasugrel: { type: String },
   Transportation_Medication_Prasugrel_Dosage: { type: String },
   Transportation_Medication_Prasugrel_Dosage_Date_Time: { type: Date },
   Transportation_Medication_Ticagrelor: { type: String },
   Transportation_Medication_Ticagrelor_Dosage: { type: String },
   Transportation_Medication_Ticagrelor_Dosage_Date_Time: { type: Date },
   Transportation_Medication_UnFractionated_Heparin: { type: String },
   Transportation_Medication_UnFractionated_Heparin_Route: { type: String },
   UnFractionated_Heparin_Dosage: { type: String },
   Transportation_Medication_UnFractionated_Heparin_Dosage_Units: { type: String },
   Transportation_Medication_UnFractionated_Heparin_Date_Time: { type: Date },
   Transportation_Medication_LMW_Heparin: { type: String },
   Transportation_Medication_LMW_Heparin_Route: { type: String },
   Transportation_Medication_LMW_Heparin_Dosage: { type: String },
   Transportation_Medication_LMW_Heparin_Dosage_Units: { type: String },
   Transportation_Medication_LMW_Heparin_Date_Time: { type: Date },
   N_Saline: { type: String },
   Nitroglycerin: { type: String },
   Morphine: { type: String },
   Atropine: { type: String },
   Active_Status: { type: Boolean, required : true },
   If_Deleted: { type: Boolean, required : true },
   },
   { timestamps: true }
);
var VarPatientMedicationTransportation = mongoose.model('PatientMedicationTransportation', PatientMedicationTransportationSchema, 'Patient_Medication_Transportation');

// Patient Cardiac History
var PatientCardiacHistorySchema = mongoose.Schema({
   PatientId: { type: Schema.Types.ObjectId, ref: 'PatientBasicDetails' },
   Hospital: { type: Schema.Types.ObjectId, ref: 'Hospital' },
   Previous_MI: { type: String },
   Previous_MI1: { type: String },
   Previous_MI1_Date: { type: Date },
   Previous_MI1_Details: { type: String },
   Previous_MI2: { type: String },
   Previous_MI2_Date: { type: Date },
   Previous_MI2_Details: { type: String },
   Cardiac_History_Angina: { type: String },
   Cardiac_History_Angina_Duration_Years: { type: Number },
   Cardiac_History_Angina_Duration_Month: { type: Number },
   CABG: { type: String },
   CABG_Date: { type: Date },
	Cardiac_History_PCI: { type: String },
   PCI1: { type: String },
   PCI_Date: { type: Date },
   PCI1_Details: { type: String },
   PCI2: { type: String },
   PCI2_Date: { type: Date },
   PCI2_Details: { type: String },
	PCI3: { type: String },
   PCI3_Date: { type: Date },
   PCI4: { type: String },
   PCI4_Date: { type: Date },
   Chest_Discomfort: { type: String },
   Duration_of_Pain_Date_Time: { type: Date },
   Location_of_Pain: { type: String },
   Pain_Severity: { type: String },
   Palpitation: { type: String },
   Pallor: { type: String },
   Diaphoresis: { type: String },
   Shortness_of_breath: { type: String },
   Nausea_Vomiting: { type: String },
   Dizziness: { type: String },
   Syncope: { type: String },
   Active_Status: { type: Boolean, required : true },
   If_Deleted: { type: Boolean, required : true },
   },
   { timestamps: true }
);
var VarCardiacHistory = mongoose.model('CardiacHistory', PatientCardiacHistorySchema, 'Patient_Cardiac_History');

//Patient Co-Morbid Conditions
var PatientCoMorbidConditionSchema = mongoose.Schema({
   PatientId: { type: Schema.Types.ObjectId, ref: 'PatientBasicDetails' },
   Hospital: { type: Schema.Types.ObjectId, ref: 'Hospital' },
   Smoker: { type: String },
   Beedies: { type: Boolean },
   Cigarettes: { type: Boolean },
   Number_of_Beedies: { type: Number },
   Number_of_Beedies_Duration_Years: { type: Number },
   Number_of_Beedies_Duration_Months: { type: Number },
   Number_of_Cigarettes: { type: Number },
   Number_of_Cigarettes_Duration_Years: { type: Number },
   Number_of_Cigarettes_Duration_Months: { type: Number },
	Recreational_Drugs: { type: String },
   Previous_IHD: { type: String },
   Diabetes_Mellitus: { type: String },
   High_Cholesterol: { type: String },
   On_Statin_Therapy: { type: String }, 
   HIV: { type: String }, 
   On_ART: { type: String }, 
   Duration_Years: { type: Number },
   Duration_Months: { type: Number },
   OHA: { type: String },
   Insulin: { type: String },
   Family_history_of_IHD: { type: String },
   Hypertension: { type: String },
   Hypertension_Duration_Years: { type: Number },
   Hypertension_Duration_Months: { type: Number },
   Hypertension_Medications: { type: Boolean },
   Hypertension_Medications_Details: { type: String },
   Dyslipidemia: { type: String },
   Dyslipidemia_Medications: { type: Boolean },
   Dyslipidemia_Medications_Details: { type: String },
   Peripheral_Vascular_Disease: { type: String },
   Stroke: { type: String },
   Bronchial_Asthma: { type: String },
   Allergies: { type: String },
   Allergy_Details: { type: String },
	Previous_History_of_PreMature_CAD: { type: String },
   Active_Status: { type: Boolean, required : true },
   If_Deleted: { type: Boolean, required : true },
   },
   { timestamps: true}
);
var VarCoMorbidCondition = mongoose.model('CoMorbidConditions',PatientCoMorbidConditionSchema,'Patient_CoMorbid_Conditions');

var PatientContactDetailsSchema = mongoose.Schema({
   PatientId: { type: Schema.Types.ObjectId, ref: 'PatientBasicDetails' },
   Hospital: { type: Schema.Types.ObjectId, ref: 'Hospital' },
   Contact_Phone_Number: { type: Number },
   Address: { type: String },
   Relation_Name: { type: String },
   Relation_Type: { type: String },
   Contact_Details_Address2: { type: String },
   Contact_Details_City: { type: String },
   Additional_Contact_No: { type: String },
   Occupation: { type: String },
   Aadhaar_Card_No: { type: String },
   Select_Patient_Id_Proof: { type: String },
   Other_Proof_Name: { type: String },
   Upload_Aadhaar:{ type: String },
   Upload_Id_Proof: { type: String },
   Active_Status: { type: Boolean, required : true },
   If_Deleted: { type: Boolean, required : true }
},
{ timestamps: true }
);
var VarContactDetails = mongoose.model('ContactDetails',PatientContactDetailsSchema,'Patient_Contact_Details');

module.exports = {
   PatientBasicDetailsSchema : VarPatientBasicDetails,
   PatientFibrinolyticChecklistSchema: VarPatientFibrinolyticChecklist,
   PatientMedicationTransportationSchema: VarPatientMedicationTransportation,
   PatientCardiacHistorySchema: VarCardiacHistory,
   PatientCoMorbidConditionSchema: VarCoMorbidCondition,
   PatientContactDetailsSchema: VarContactDetails
};
