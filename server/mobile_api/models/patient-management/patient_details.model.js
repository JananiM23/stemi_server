var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PatientBasicDetailsSchema = mongoose.Schema({
   Patient_Name: { type: String },
   Patient_Age: { type: String },
   Patient_Gender: { type: String },
   Hospital: { type: Schema.Types.ObjectId, ref: 'Hospital' },
   User: { type: Schema.Types.ObjectId, ref: 'User' },
   Confirmed_UserType: { type: String }, // PeripheralUser, Doctor, ClusterDoctor
   Confirmed_By: { type: Schema.Types.ObjectId, ref: 'User' },
   Admission_Type: {
      type: String,
      enum: ['Non_Cluster', 'EMS', 'Direct']
   },
   Stemi_Status: {
      type: String,
      enum: ['Stemi_Confirmed', 'Stemi_Not_Confirmed', 'Stemi_Ask_Cardiologist', 'Retake_ECG']
   },
   Risk_Factors: [{
      Diabetes: { type: String },
      Hypertension: { type: String },
      Smoker: { type: String },
      High_Cholesterol: { type: String },
      Previous_History_of_IHD: { type: String },
      Family_History_of_IHD: { type: String }
   }],
   Symptoms: {
      Chest_Discomfort: { type: String },
      Duration_of_Pain: { type: Date },
      Location_of_Pain: { type: String }
   },
   ECG_Taken_date_time: { type: Date },
   Confirmed_ECG: { type: String },
   ECGFile_Array: [{
      Name: {type: String},
      ECG_File: { type: String },
      DateTime: { type: Date }
   }],
   QR_image: { type : String },
   Current_ECG_File: { type: String },
   ST_Elevation: {
      avL: { type: String },
      L1: { type: String },
      avR: { type: String },
      L2: { type: String },
      avF: { type: String },
      L3: { type: String },
      V1: { type: String },
      V2: { type: String },
      V3: { type: String },
      V4: { type: String },
      V5: { type: String },
      V6: { type: String },
      V3R: { type: String },
      V4R: { type: String },
   },
   ST_Depression: {
      L1: {type:String},
      avL: {type:String},
      L2: {type:String},
      avF: {type:String},
      L3: {type:String},
      V1: {type:String},
      V2: {type:String},
      V3: {type:String}
   },
   LBBB: {type: String},
   Doctor_Notes: {type: String},
   EntryFrom:{type: String},
   BPL_Height:{type: String},
   BPL_Weight:{type: String},
   BPL_BP:{type: String},

   FirstAskTime: { type: Date },
   FirstRepailedTime: { type: Date },

   Active_Status: { type: Boolean, required: true },
   If_Deleted: { type: Boolean, required: true },
   },
  { timestamps: true }
);
var VarPatientBasicDetails = mongoose.model('PatientBasic_Mob_Details', PatientBasicDetailsSchema, 'Patient_Basic_Mob_Details');


// Offline Patient Details
var OffLinePatientBasicDetailsSchema = mongoose.Schema({
  Patient_Local:{type: String},
  Patient_Name: { type: String },
  Patient_Age: { type: String },
  Patient_Gender: { type: String },
  Hospital: { type: Schema.Types.ObjectId, ref: 'Hospital' },
  User: { type: Schema.Types.ObjectId, ref: 'User' },
  Confirmed_UserType: { type: String }, // PeripheralUser, Doctor, ClusterDoctor
  Confirmed_By: { type: Schema.Types.ObjectId, ref: 'User' },
  Admission_Type: {
     type: String,
     enum: ['Non_Cluster', 'EMS', 'Direct']
  },
  Stemi_Status: {
     type: String,        
  },
  Risk_Factors: [{
     Diabetes: { type: String },
     Hypertension: { type: String },
     Smoker: { type: String },
     High_Cholesterol: { type: String },
     Previous_History_of_IHD: { type: String },
     Family_History_of_IHD: { type: String }
  }],
  Symptoms: {
     Chest_Discomfort: { type: String },
     Duration_of_Pain: { type: Date },
     Location_of_Pain: { type: String }
  },
  ECG_Taken_date_time: { type: Date },
  Confirmed_ECG: { type: String },
  ECGFile_Array: [{
     Name: {type: String},
     ECG_File: { type: String },
     DateTime: { type: Date }
  }],
  QR_image: { type : String },
  Current_ECG_File: { type: String },
  ST_Elevation: {
     avL: { type: String },
     L1: { type: String },
     avR: { type: String },
     L2: { type: String },
     avF: { type: String },
     L3: { type: String },
     V1: { type: String },
     V2: { type: String },
     V3: { type: String },
     V4: { type: String },
     V5: { type: String },
     V6: { type: String },
     V3R: { type: String },
     V4R: { type: String },
  },
  ST_Depression: {
     L1: {type:String},
     avL: {type:String},
     L2: {type:String},
     avF: {type:String},
     L3: {type:String},
     V1: {type:String},
     V2: {type:String},
     V3: {type:String}
  },
  LBBB: {type: String},
  Active_Status: { type: Boolean, required: true },
  If_Deleted: { type: Boolean, required: true },
  },
 { timestamps: true }
);

var VarOfflinePatientBasicDetails = mongoose.model('PatientBasic_Mob_Offline_Details', OffLinePatientBasicDetailsSchema, 'Patient_Basic_Mob_Offline_Details');

module.exports = {
  PatientBasicDetailsSchema: VarPatientBasicDetails,
  OffLinePatientBasicDetailsSchema: VarOfflinePatientBasicDetails
};