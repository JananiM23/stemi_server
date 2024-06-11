var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Follow Up Details
var FollowUpDetailsSchema = mongoose.Schema({
    PatientId: { type: Schema.Types.ObjectId, ref: 'PatientBasicDetails' },
    Hospital: { type: Schema.Types.ObjectId, ref: 'Hospital' },
   //  Duration_Of_Follow_Up_Visit: { type: String },
    Follow_Up_Date: { type: Date },
    Mode_Of_Follow_Up: { type: String },
    Type_Of_Follow_Up_Hospital: { type: String },
    Name_Of_The_Stemi_Follow_Up_Cluster:  { type: Schema.Types.ObjectId, ref: 'Cluster' },
    Name_Of_The_Stemi_Follow_Up_Hospital: { type: Schema.Types.ObjectId, ref: 'Hospital' },
    Name_Of_The_Non_Stemi_Follow_Up_Hospital: { type: String },
    Location_Of_Follow_Up_Hospital: { type: String },
    Follow_Up_Comments: { type: String },
    Active_Status: { type: Boolean, required : true },
    If_Deleted: { type: Boolean, required : true },
   },
   { timestamps: true }
);
var VarFollowUpDetails = mongoose.model('FollowUpDetails', FollowUpDetailsSchema, 'FollowUp_Details');

// Follow Up Medications
var FollowUpMedicationsSchema = mongoose.Schema({
   PatientId: { type: Schema.Types.ObjectId, ref: 'PatientBasicDetails' },
   Hospital: { type: Schema.Types.ObjectId, ref: 'Hospital' },
   // Duration_Of_Follow_Up_Medication: { type: String },
	Follow_Up_Date: { type: Date },
   Follow_Up_Medication_Aspirin: { type: String },
   Follow_Up_Medication_Clopidogrel: { type: String },
   Follow_Up_Medication_Prasugral: { type: String },
   Follow_Up_Medication_Nitrate: { type: String },
   Follow_Up_Medication_Betablocker: { type: String },
   Follow_Up_Medication_ACEI: { type: String },
   Follow_Up_Medication_ARB: { type: String },
   Follow_Up_Medication_Statins: { type: String },
   Follow_Up_Medication_OHA: { type: String },
   Follow_Up_Medication_Insulin: { type: String },
   Active_Status: { type: Boolean, required : true },
   If_Deleted: { type: Boolean, required : true },
  },
  { timestamps: true }
);
var VarFollowUpMedications = mongoose.model('FollowUpMedications', FollowUpMedicationsSchema, 'FollowUp_Medications');

// Follow Up Events
var FollowUpEventsSchema = mongoose.Schema({
   PatientId: { type: Schema.Types.ObjectId, ref: 'PatientBasicDetails' },
   Hospital: { type: Schema.Types.ObjectId, ref: 'Hospital' },
   // Duration_Of_Follow_Up_Event: { type: String },
	Follow_Up_Date: { type: Date },
   Follow_Up_Events_Readmission: { type: String },
   Follow_Up_Events_Readmission_Reason: { type: String },
   Follow_Up_Events_Readmission_Date: { type: Date },
   Follow_Up_Events_Additional_cardiac_procedures: { type: String },
   Follow_Up_Events_CABG: { type: String },
   Follow_Up_Events_CABG_Date: { type: Date },
   Follow_Up_Events_PCI: { type: String },
   Follow_Up_Events_PCI_Date: { type: Date },
   Follow_Up_Events_Others: { type: String },
   Follow_Up_Events_Specify_Others: { type: String },
   Follow_Up_Events_Others_Date: { type: Date },
   Follow_Up_Events_Recurrence_Of_Angina: { type: String },
   Follow_Up_Events_TMT: { type: String },
   Follow_Up_Events_Echo_LVEF: { type: String },
   Follow_Up_Events_Re_CART: { type: String },
   Follow_Up_Events_Re_CART_Date: { type: Date },
   Follow_Up_Events_Restenosis: { type: String },
   Follow_Up_Events_Restenosis_Date: { type: Date },
   Follow_Up_Events_Re_MI: { type: String },
   Follow_Up_Events_Re_MI_Date: { type: Date },
   Follow_Up_Events_Re_Intervention: { type: String },
   Follow_Up_Events_TLR_PCI1: { type: String },
   Follow_Up_Events_TLR_PCI1_Date: { type: Date },
   Follow_Up_Events_TVR_PCI: { type: String },
   Follow_Up_Events_TVR_PCI_Date: { type: Date },
   Follow_Up_Events_Non_TVR_PCI: { type: String },
   Follow_Up_Events_Non_TVR_PCI_Date: { type: Date },
   Follow_Up_Events_Stroke: { type: String },
   Follow_Up_Events_Stroke_Date: { type: Date },
   Follow_Up_Death: { type: String },
	Follow_Up_Death_Date: { type: Date },
   Follow_Up_Reason_Of_Death: { type: String },
   Follow_Up_Event_Comments: { type: String },
   Active_Status: { type: Boolean, required : true },
   If_Deleted: { type: Boolean, required : true },
  },
  { timestamps: true }
);
var VarFollowUpEvents = mongoose.model('FollowUpEvents', FollowUpEventsSchema, 'FollowUp_Events');


module.exports = {
   FollowUpDetailsSchema : VarFollowUpDetails,
   FollowUpMedicationsSchema : VarFollowUpMedications,
   FollowUpEventsSchema : VarFollowUpEvents
};