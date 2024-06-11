var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//Hospital Management Fields
var HospitalManagementSchema = mongoose.Schema({
    Hospital_Name: { type: String }, // Name of the hospital
    Hospital_Role: { type: String }, // Name of the hospital Role Hub H1, Hub H2, Spoke S1, Spoke S2, EMS
    Hospital_Code: { type: Number },
    Hospital_Type: { type:String }, // Government, Private
    Department_of_Administration: { type: String }, // If Government, Ministry/Dept. of administration
    Owned_Ambulance_Drop: { type: String },
    Address: { type: String },
    Country: { type: Schema.Types.ObjectId, ref: 'Global_Country' },
    State: { type: Schema.Types.ObjectId, ref: 'Global_State' },
    City: { type: Schema.Types.ObjectId, ref: 'Global_City' },
    Pin_Code: {type: String },
    Location: { type: Schema.Types.ObjectId, ref: 'Location' },
    Latitude: {type: String },
    Longitude: {type: String },
    Phone: {type: String },
    Mobile: {type: String },
    Is_EMS: {type: Boolean, require: true }, // Is EMS?
    Best_Mobile_Network: {type: String }, // Which mobile phone network has best coverage in the hospital?
    Wifi_Availability: {type: String }, // Do you have WiFi connectivity?
    NoOf_Own_Ambulances: {type: Number }, // How many ambulances does the hospital own?
    ECG_Availability: {type: String }, // Is there an ECG machine in the hospital
    Defibrillator: { type: String },
    BLS_ALS_Ambulance: { type: String },
    PMJAY_Availability: { type: String },
    ECG_Location: {type: String }, // Where is the ECG machine located (Emergency Room, CCU, Cardiology Department, Other)
    ECG_Brand_And_Model: {type: String }, // Brand and model of ECG machine
    Patch_Or_BulbElectrode: {type: String }, // Are patch or bulb electrode used? (Patch, Bulb, Both)
    NoOf_ECG_PerMonth: {type: Number },
    NoOf_Cardiology_Beds: {type: Number },
    NoOf_ICU_Or_CCU_Beds: {type: Number },
    Doctors_24in7_EmergencyRoom: {type: String }, // Are there doctors 24X7 in the Emergency Room?
    Doctors_24in7_CCU: {type: String }, // Are there doctors 24X7 in the CCU?
    NoOf_Cardiologists: {type: Number },
    NoOf_GeneralPhysicians: {type: Number },
    NoOf_CCUNurses: {type: Number },    
    Thrombolysis_Availability: {type: String }, // Is thrombolysis done?
    TypeOf_Thrombolytic: [{type: String}], // Streptokinase, Tenecteplase, Reteplase
    Thrombolytic_Other: { type: String },
    NoOf_Thrombolysed_patients_PerMonth: {type: Number },
    PercentageOf_Streptokinase_patients: {type: Number }, // What % of patients are given streptokinase?
    PercentageOf_Tenecteplase_patients: {type: Number }, // What % of patients are given tenecteplase?
    PercentageOf_Reteplase_patients: {type: Number }, // What % of patients are given reteplase?
    CathLab_Availability: {type:String }, // Is there a cath lab in the hospital?
    CathLab_24_7: {type: String},
    ClosestHospitals_with_CathLab: { type: String },
    PCI_Availability: { type:String }, // Is there a cath lab in the hospital?
    NoOf_PCI_Done_PerMonth: {type:Number },
    NoOf_PrimaryPCI_Done_PerMonth: {type:Number },
    If_PharmacoInvasive_Therapy: {type:String }, // Is Pharmaco-Invasive therapy given for patients referred here after thrombolysis?
    NoOf_PharmacoInvasive_PerMonth: {type:Number }, // No. of cases treated with Pharmaco-Invasive therapy per month
    Cardiology_Department_Head: {type:String }, // Name of the Head of the Cardiology Department
    NoOf_STEMI_Patients_PerMonth: {type:Number }, // Total no. of STEMI patients per month
    NoOf_Direct_STEMI_Patients_PerMonth: {type:Number }, // No. of direct STEMI admissions per month
    NoOf_Referral_STEMI_Patients_PerMonth: { type: Number}, // No. Of Referral STEMI Patients PerMonth
    NoOf_STEMI_Cases_ReferredFrom_PerMonth: {type:Number }, // No. of STEMI cases per month referred here from another hospital
    NoOf_STEMI_Cases_ReferredTo_PerMonth: {type:Number }, // No. of STEMI cases per month referred from here to another hospital
    Popular_FM_Channel: {type:String }, // Most popular FM channel in the region
    Popular_Newspaper: {type:String }, // Most widely read print newspaper in the region
    Heard_About_Project: {type: String },
    Help_Timely_Care_ToPatients: {type: String },
    Feedback_Remarks: {type: String },
    Cardiologist_Array: [
        {
            Cardiologist_Name: {type:String },
            Cardiologist_Phone: {type: String },
            Cardiologist_Email: {type:String },
            Cardiologist_Preferred_Contact: { type: Boolean }
        }
    ],
    GeneralPhysician_Array: [
        {
            GeneralPhysician_Name: {type:String },
            GeneralPhysician_Phone: {type:String },
            GeneralPhysician_Email: {type:String },
            GeneralPhysician_Preferred_Contact: { type: Boolean}
        }
    ],
    CoOrdinators_Array: [
        {
            CoOrdinators_Name: {type:String },
            CoOrdinators_Phone: {type:String },
            CoOrdinators_Email: {type:String },
            CoOrdinators_Preferred_Contact: {type: Boolean}
        }
    ],
    Hospitals_Refer_STEMI_Patients: [
        {   
            Referring_Hospital_Name: {type:String },
            Is_Cath_Lab: {type:String },
            Ambulance_Service: {type:String }, // Which ambulance service used
            Remarks: {type:String }
        }
    ], // Names of hospitals referring STEMI patients here
    ClosetHospital_Array: [
        {
            Closest_Hospital_Name: {type:String },
            Closest_Hospital_Address: {type:String },
            Closest_Hospital_Preference: {type:String }
        }
    ], // Closest hospital with a cath lab  
    Hospital_Status:  {type: String },   // Rejected, Pending, Approved, Blocked
    Active_Status: { type : Boolean, required : true },
    If_Deleted: { type : Boolean, required : true },
    If_Cluster_Mapped: { type : Boolean, required : true },
    Cluster_ConnectionType: { type : String }, // ClusterHub, ClusterSpoke
    Connected_Clusters: [{type: Schema.Types.ObjectId, ref: 'Cluster' }],
    Hospital_Status_Updated_Date:  {type: String },  
    Hospital_Status_Updated_By:  {type: String },  
    Patient_Created_Status: { type: Boolean}

},
{ timestamps: true } 
);
var VarHospitalManagement = mongoose.model('Hospital', HospitalManagementSchema, 'Stemi_Hospital_Management');

module.exports = { HospitalManagementSchema : VarHospitalManagement };