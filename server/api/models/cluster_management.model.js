var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Cluster Schema
var ClusterSchema = mongoose.Schema({
    Location: { type: Schema.Types.ObjectId, ref: 'Location' },
    Cluster_Name: { type: String },
    Data_Type: { type: String },
    Cluster_Code: { type: Number },
    Cluster_Type: { type: String },
    Post_Date: { type: Date },
    Hospital: { type: Schema.Types.ObjectId, ref: 'Hospital' },
    HospitalsArray: [{ type: Schema.Types.ObjectId, ref: 'Hospital' }],
    IfControlPanelDuplicate: { type : Boolean },
    DuplicateFrom: { type: Schema.Types.ObjectId, ref: 'Cluster' },
    Active_Status: { type : Boolean },
    If_Deleted: { type : Boolean },
    },
    { timestamps: true }
);
var ClusterMappingSchema = mongoose.Schema({
   Cluster: { type: Schema.Types.ObjectId, ref: 'Cluster' },
   ClusterHospital: { type: Schema.Types.ObjectId, ref: 'Hospital' },
   ClusterHospital_Code: { type: Number },
   ClusterHospital_Type: { type: String }, // ClusterHub (H1, H2), ClusterSpoke ( H2, S1, S2)
   Connected_ClusterHub: { type: Schema.Types.ObjectId, ref: 'Hospital' },
   Active_Status: { type : Boolean },
   If_Deleted: { type : Boolean },
   },
   { timestamps: true }
);

var ClusterControlPanelSchema = mongoose.Schema({
   Cluster: { type: Schema.Types.ObjectId, ref: 'Cluster' },
   Name: { type: String, required : true },
   Key_Name: { type: String, required : true },
   Type: { type: String, required : true }, // (Text, Number, TextArea, Select, File, Date, Time, Boolean, YesNo)
   If_Child_Available: { type : Boolean , required : true},
   If_Parent_Available: { type : Boolean , required : true },
   Parent: { type: Schema.Types.ObjectId, ref: 'Cluster_ControlPanel' },
   Visibility: { type : Boolean, required : true},
   Mandatory: { type : Boolean, required : true},
   Validation: { type : Boolean, required : true},
   If_Validation_Control_Array: { type : Boolean, required : true},
   Validation_Control_Array: [{
      Order_No: { type : Number , required : true },
      Validation_Control: { type: Schema.Types.ObjectId, ref: 'All_Validations', required : true},
   }],
   If_Date_Restriction: { type : Boolean , required : true },
   If_Min_Date_Restriction: { type : Boolean , required : true },
   Min_Date_Field: { type: Schema.Types.ObjectId, ref: 'Cluster_ControlPanel' },
   If_Min_Date_Array_Available: { type : Boolean , required : true },
   Min_Date_Array: [{
      Order_No: { type : Number , required : true },
      Min_Date_Field:  { type: Schema.Types.ObjectId, ref: 'Cluster_ControlPanel', required : true }
   }],
   If_Max_Date_Restriction: { type : Boolean , required : true },
   Max_Date_Field: { type: Schema.Types.ObjectId, ref: 'Cluster_ControlPanel' },
   If_Max_Date_Array_Available: { type : Boolean , required : true },
   Max_Date_Array: [{
      Order_No: { type : Number , required : true },
      Max_Date_Field:  { type: Schema.Types.ObjectId, ref: 'Cluster_ControlPanel', required : true }
   }],
   If_Future_Date_Available: { type : Boolean , required : true },
   If_Number_Restriction: { type : Boolean , required : true },
   If_Min_Number_Restriction: { type : Boolean , required : true },
   Min_Number_Value: { type : Number },
   If_Min_Number_Field_Restriction: { type : Boolean , required : true },
   Min_Number_Field: { type: Schema.Types.ObjectId, ref: 'Cluster_ControlPanel'},
   If_Max_Number_Restriction: { type : Boolean , required : true },
   Max_Number_Value: { type : Number },
   If_Max_Number_Field_Restriction: { type : Boolean , required : true },
   Max_Number_Field: { type: Schema.Types.ObjectId, ref: 'Cluster_ControlPanel'},
   Category: { type: String, required: true }, // Patient_Details, Thrombolysis, Pci, Hospital_Summary, Discharge, Follow_Up
   Sub_Category: { type: String },
   Sub_Junior_Category: { type: String },
   Active_Status: { type : Boolean , required : true },
   If_Deleted: { type : Boolean , required : true },
   },
   { timestamps: true }
);

var VarCluster = mongoose.model('Cluster', ClusterSchema, 'Stemi_Cluster');
var VarClusterMapping = mongoose.model('ClusterMapping', ClusterMappingSchema, 'Stemi_ClusterMapping');
var VarClusterControlPanel = mongoose.model('Cluster_ControlPanel', ClusterControlPanelSchema, 'Stemi_Cluster_ControlPanel');


module.exports = {
   ClusterSchema : VarCluster,
   ClusterMappingSchema : VarClusterMapping,
   ClusterControlPanelSchema: VarClusterControlPanel
};
