var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//  All Fields Schema
var AllFieldsSchema = mongoose.Schema({
   Name: { type: String, required : true },
   Key_Name: { type: String, required : true, unique: true },
   Type: { type: String, required : true }, // (Text, Number, TextArea, Select, File, Date, Time, Boolean, YesNo)
   If_Child_Available: { type : Boolean , required : true},
   If_Parent_Available: { type : Boolean , required : true },
   Parent: { type: Schema.Types.ObjectId, ref: 'All_Fields' },
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
   Min_Date_Field: { type: Schema.Types.ObjectId, ref: 'All_Fields' },
   If_Min_Date_Array_Available: { type : Boolean , required : true },
   Min_Date_Array: [{
      Order_No: { type : Number , required : true },
      Min_Date_Field:  { type: Schema.Types.ObjectId, ref: 'All_Fields', required : true }
   }],
   If_Max_Date_Restriction: { type : Boolean , required : true },
   Max_Date_Field: { type: Schema.Types.ObjectId, ref: 'All_Fields' },
   If_Max_Date_Array_Available: { type : Boolean , required : true },
   Max_Date_Array: [{
      Order_No: { type : Number , required : true },
      Max_Date_Field:  { type: Schema.Types.ObjectId, ref: 'All_Fields', required : true }
   }],
   If_Future_Date_Available: { type : Boolean , required : true },
   If_Number_Restriction: { type : Boolean , required : true },
   If_Min_Number_Restriction: { type : Boolean , required : true },
   Min_Number_Value: { type : Number },
   If_Min_Number_Field_Restriction: { type : Boolean , required : true },
   Min_Number_Field: { type: Schema.Types.ObjectId, ref: 'All_Fields'},
   If_Max_Number_Restriction: { type : Boolean , required : true },
   Max_Number_Value: { type : Number },
   If_Max_Number_Field_Restriction: { type : Boolean , required : true },
   Max_Number_Field: { type: Schema.Types.ObjectId, ref: 'All_Fields'},
   Category: { type: String, required: true }, // Patient_Details, Thrombolysis, Pci, Hospital_Summary, Discharge, Follow_Up
   Sub_Category: { type: String },
   Sub_Junior_Category: { type: String },
   Active_Status: { type : Boolean , required : true },
   If_Deleted: { type : Boolean , required : true },
   },
   { timestamps: true }
);
var VarAllFields = mongoose.model('All_Fields', AllFieldsSchema, 'Stemi_All_Fields');



//  All Validations Schema
var AllValidationsSchema = mongoose.Schema({
    Name: { type: String, required : true, unique: true },
    Description: { type: String, required : true },
    Accessible_Type: { type: String, required : true }, // (Text, Number, TextArea, Select, File, Date, Time, Boolean, YesNo)
    If_Regex_Validation: { type : Boolean, required : true},
    Regex_Validation: { type : String},
    If_Function_Validation: { type : Boolean, required : true},
    Function_Validation: { type : String},
    Error_Message: { type : String, required : true },
    Active_Status: { type : Boolean, required : true },
    If_Deleted: { type : Boolean, required : true },
    },
    { timestamps: true }
);
var VarAllValidations = mongoose.model('All_Validations', AllValidationsSchema, 'Stemi_All_Validations');



module.exports = {
    AllFieldsSchema : VarAllFields,
    AllValidationsSchema: VarAllValidations
};
