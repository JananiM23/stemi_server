var HospitalManagementModel = require('../models/hospital_management.model');
var UserManagementModel = require('../models/user_management.model');

var mongoose = require('mongoose');


// Hospital Management Details Create ---------------------------------------------
exports.Create_Hospital = function (req, res) {
   var ReceivingData = req.body;
      
   if (!ReceivingData.Hospital_Name || ReceivingData.Hospital_Name === '') {
      res.status(400).send({ Status: false, Message: "Hospital Name can not be empty" });
   } else {

      if(ReceivingData.Country && typeof ReceivingData.Country === 'object' && ReceivingData.Country._id !== '') {
         ReceivingData.Country = mongoose.Types.ObjectId(ReceivingData.Country._id);
      } else {
         ReceivingData.Country = null;
      }
      if(ReceivingData.State && typeof ReceivingData.State === 'object' && ReceivingData.State._id !== '') {
         ReceivingData.State = mongoose.Types.ObjectId(ReceivingData.State._id);
      } else {
         ReceivingData.State = null;
      }
      if(ReceivingData.City && typeof ReceivingData.City === 'object' && ReceivingData.City._id !== '') {
         ReceivingData.City = mongoose.Types.ObjectId(ReceivingData.City._id);
      } else {
         ReceivingData.City = null;
      }

      if(ReceivingData.Location && typeof ReceivingData.Location === 'object' && ReceivingData.Location._id !== '') {
         ReceivingData.Location = mongoose.Types.ObjectId(ReceivingData.Location._id);
      } else {
         ReceivingData.Location = null;
      }

      if(ReceivingData.Is_EMS !== undefined && ReceivingData.Is_EMS !== null) {
         ReceivingData.Is_EMS = ReceivingData.Is_EMS;
      } else {
         ReceivingData.Is_EMS = false;
      }

      if(ReceivingData.Hospital_Status_Updated_Date !== undefined && ReceivingData.Hospital_Status_Updated_Date !== null && ReceivingData.Hospital_Status_Updated_Date !== '') {
         ReceivingData.Hospital_Status_Updated_Date = new Date();
      }

      if(ReceivingData.Hospital_Status_Updated_By !== undefined && ReceivingData.Hospital_Status_Updated_By !== null && ReceivingData.Hospital_Status_Updated_By !==''){
         ReceivingData.Hospital_Status_Updated_By = '';
      } else {
         ReceivingData.Hospital_Status_Updated_By = '';
      }

      ReceivingData.Hospital_Role = '';


      if(ReceivingData.CathLab_Availability !== null && ReceivingData.CathLab_Availability !== '' && ReceivingData.CathLab_Availability === 'Yes' &&
         ReceivingData.CathLab_24_7 !== null && ReceivingData.CathLab_24_7 !== '' && ReceivingData.CathLab_24_7 === 'Yes') {
            ReceivingData.Hospital_Role = 'Hub H1';
      } else {
         if(ReceivingData.CathLab_Availability !== null && ReceivingData.CathLab_Availability !== '' && ReceivingData.CathLab_Availability === 'Yes' &&
            ( ReceivingData.CathLab_24_7 === null || ReceivingData.CathLab_24_7 !== '' || ReceivingData.CathLab_24_7 === 'No' ) ) {
            ReceivingData.Hospital_Role = 'Hub H2';
         } else {
            if(( ReceivingData.CathLab_Availability === null || ReceivingData.CathLab_Availability === '' || ReceivingData.CathLab_Availability === 'No' ) &&
               ( ReceivingData.CathLab_24_7 === null || ReceivingData.CathLab_24_7 === '' || ReceivingData.CathLab_24_7 === 'No' ) &&
               ReceivingData.Thrombolysis_Availability !== null && ReceivingData.Thrombolysis_Availability !== '' && ReceivingData.Thrombolysis_Availability === 'Yes' ) {
               ReceivingData.Hospital_Role = 'Spoke S1';
            } else {
               if(( ReceivingData.CathLab_Availability === null || ReceivingData.CathLab_Availability === '' || ReceivingData.CathLab_Availability === 'No' ) &&
                  ( ReceivingData.CathLab_24_7 === null || ReceivingData.CathLab_24_7 === '' || ReceivingData.CathLab_24_7 === 'No' ) &&
                  ( ReceivingData.Thrombolysis_Availability === null || ReceivingData.Thrombolysis_Availability === '' || ReceivingData.Thrombolysis_Availability === 'No') &&
                  ( ReceivingData.Is_EMS === null || ReceivingData.Is_EMS === '' || !ReceivingData.Is_EMS ) ) {
                  ReceivingData.Hospital_Role = 'Spoke S2';
               } else {
                  if(ReceivingData.Is_EMS !== null && ReceivingData.Is_EMS !== '' && ReceivingData.Is_EMS ) {
                     ReceivingData.Hospital_Role = 'EMS';
                  }
               }  
            }
         }
      }

      HospitalManagementModel.HospitalManagementSchema.findOne({}, {Hospital_Code: 1}, {'sort': {createdAt: -1} }, function(err, result) {
         if (err) {
            res.status(417).send({ Status: false, Message: "Some error occurred while Find the Hospital!.", Error: err });
         } else {
            ReceivingData.Hospital_Code = result !== null ? (result.Hospital_Code + 1) : 1 ;  
            const Create_HospitalManagementDetails = new HospitalManagementModel.HospitalManagementSchema({
               Hospital_Name: ReceivingData.Hospital_Name || '',
               Hospital_Code: ReceivingData.Hospital_Code || 1,
               Hospital_Role: ReceivingData.Hospital_Role || '',
               Hospital_Type: ReceivingData.Hospital_Type || '',
               Department_of_Administration: ReceivingData.Department_of_Administration || null,
               Owned_Ambulance_Drop: ReceivingData.Owned_Ambulance_Drop || null,
               Address: ReceivingData.Address || '',
               Country: ReceivingData.Country || '',
               State: ReceivingData.State || '',
               City: ReceivingData.City || '',
               Pin_Code: ReceivingData.Pin_Code || null,
               Location: ReceivingData.Location || null,
               Latitude: ReceivingData.Latitude || '',
               Longitude: ReceivingData.Longitude || '',
               Phone: ReceivingData.Phone || null,
               Mobile: ReceivingData.Mobile || null,         
               Is_EMS: ReceivingData.Is_EMS || null,
               Best_Mobile_Network: ReceivingData.Best_Mobile_Network || '',
               Wifi_Availability: ReceivingData.Wifi_Availability || '',
               NoOf_Own_Ambulances: ReceivingData.NoOf_Own_Ambulances || null,
               BLS_ALS_Ambulance: ReceivingData.BLS_ALS_Ambulance || null,
               ECG_Availability: ReceivingData.ECG_Availability || '',
               Defibrillator: ReceivingData.Defibrillator || '',
               PMJAY_Availability: ReceivingData.PMJAY_Availability || '',
               ECG_Location: ReceivingData.ECG_Location || '',
               ECG_Brand_And_Model: ReceivingData.ECG_Brand_And_Model || '',
               Patch_Or_BulbElectrode: ReceivingData.Patch_Or_BulbElectrode || '',
               NoOf_ECG_PerMonth: ReceivingData.NoOf_ECG_PerMonth || null,
               NoOf_Cardiology_Beds: ReceivingData.NoOf_Cardiology_Beds || '',
               NoOf_ICU_Or_CCU_Beds: ReceivingData.NoOf_ICU_Or_CCU_Beds || '',
               Doctors_24in7_EmergencyRoom: ReceivingData.Doctors_24in7_EmergencyRoom || null,
               Doctors_24in7_CCU: ReceivingData.Doctors_24in7_CCU || '',
               NoOf_Cardiologists: ReceivingData.NoOf_Cardiologists || null,
               NoOf_GeneralPhysicians: ReceivingData.NoOf_GeneralPhysicians || null,
               NoOf_CCUNurses: ReceivingData.NoOf_CCUNurses || '',
               Thrombolysis_Availability: ReceivingData.Thrombolysis_Availability || '',
               TypeOf_Thrombolytic: ReceivingData.TypeOf_Thrombolytic || [],
               Thrombolytic_Other: ReceivingData.Thrombolytic_Other || '',
               NoOf_Thrombolysed_patients_PerMonth: ReceivingData.NoOf_Thrombolysed_patients_PerMonth || '',
               PercentageOf_Streptokinase_patients: ReceivingData.PercentageOf_Streptokinase_patients || '',
               PercentageOf_Tenecteplase_patients: ReceivingData.PercentageOf_Tenecteplase_patients || '',
               PercentageOf_Reteplase_patients: ReceivingData.PercentageOf_Reteplase_patients || '',
               CathLab_Availability: ReceivingData.CathLab_Availability || '',
               CathLab_24_7:ReceivingData.CathLab_24_7 || '',
               PCI_Availability: ReceivingData.PCI_Availability || '',
               NoOf_PCI_Done_PerMonth: ReceivingData.NoOf_PCI_Done_PerMonth || '',
               NoOf_PrimaryPCI_Done_PerMonth: ReceivingData.NoOf_PrimaryPCI_Done_PerMonth || '',
               If_PharmacoInvasive_Therapy: ReceivingData.If_PharmacoInvasive_Therapy || '',
               NoOf_PharmacoInvasive_PerMonth: ReceivingData.NoOf_PharmacoInvasive_PerMonth || '',
               Cardiology_Department_Head: ReceivingData.Cardiology_Department_Head || '',
               NoOf_STEMI_Patients_PerMonth: ReceivingData.NoOf_STEMI_Patients_PerMonth || '',
               NoOf_Direct_STEMI_Patients_PerMonth: ReceivingData.NoOf_Direct_STEMI_Patients_PerMonth || '',
               NoOf_Referral_STEMI_Patients_PerMonth: ReceivingData.NoOf_Referral_STEMI_Patients_PerMonth || '',
               // NoOf_STEMI_Cases_ReferredFrom_PerMonth: ReceivingData.NoOf_STEMI_Cases_ReferredFrom_PerMonth || '',
               NoOf_STEMI_Cases_ReferredTo_PerMonth: ReceivingData.NoOf_STEMI_Cases_ReferredTo_PerMonth || '',
               Popular_FM_Channel: ReceivingData.Popular_FM_Channel || '',
               Popular_Newspaper: ReceivingData.Popular_Newspaper || '',
               Heard_About_Project: ReceivingData.Heard_About_Project || '',
               Help_Timely_Care_ToPatients: ReceivingData.Help_Timely_Care_ToPatients || '',
               Feedback_Remarks: ReceivingData.Feedback_Remarks || '',
               Cardiologist_Array: ReceivingData.CardiologistArray || [],
               GeneralPhysician_Array: ReceivingData.GeneralPhysicianArray || [],
               CoOrdinators_Array: ReceivingData.CoOrdinatorsArray || [],
               Hospitals_Refer_STEMI_Patients: ReceivingData.HospitalReferringArray || [],
               ClosetHospital_Array: ReceivingData.ClosetHospitalArray || [], 
               ClosestHospitals_with_CathLab: ReceivingData.ClosestHospitals_with_CathLab || '',
               Hospital_Status: 'Pending',        
               Active_Status: true,
               If_Cluster_Mapped: false,
               Cluster_ConnectionType: '',
               Cluster_Id: [],
               Hospital_Status_Updated_Date: ReceivingData.Hospital_Status_Updated_Date || '',
               Hospital_Status_Updated_By: ReceivingData.Hospital_Status_Updated_By || '',
               Patient_Created_Status: false,
               If_Deleted: false
            });
            Create_HospitalManagementDetails.save(function (err_1, result_1) {
               if (err_1) {
                  res.status(417).send({ Status: false, Message: "Some error occurred while Creating the Hospital Entry!.", Error: err_1 });
               } else {
                  res.status(200).send({ Status: true, Response: result_1 });
               }
            });
         }
      });
   }
};

// hospitals Table List
exports.Hospitals_List = function(req, res) {
   var ReceivingData = req.body;

   const Skip_Count = parseInt(ReceivingData.Skip_Count, 0) || 0;
   const Limit_Count = parseInt(ReceivingData.Limit_Count, 0) || 5;

   var ShortOrder = {updatedAt: -1};
   var ShortKey = ReceivingData.ShortKey;
   var ShortCondition = ReceivingData.ShortCondition;
   if ( ShortKey && ShortKey !== null && ShortKey !== '' && ShortCondition && ShortCondition !== null && ShortCondition !== ''){
      ShortOrder = {};
      ShortOrder[ShortKey] = ShortCondition === 'Ascending' ? 1 : -1 ;
   }

   var FindQuery = {'If_Deleted': false};
   if (ReceivingData.Clusters !== undefined && ReceivingData.Clusters !== null && typeof ReceivingData.Clusters === 'object' ) {
      ReceivingData.Clusters = ReceivingData.Clusters.map(obj => mongoose.Types.ObjectId(obj));
      FindQuery.Connected_Clusters = { $in: ReceivingData.Clusters };
   }
   if (ReceivingData.FilterQuery && typeof ReceivingData.FilterQuery === 'object' && ReceivingData.FilterQuery !== null && ReceivingData.FilterQuery.length > 0) {
      ReceivingData.FilterQuery.map(obj => {
         if (obj.Type === 'String') {
            FindQuery[obj.DBName] = { $regex : new RegExp(".*" + obj.Value + ".*", "i") };
         }
         if (obj.Type === 'Select') {
            FindQuery[obj.DBName] = obj.Value;
         }
         if (obj.Type === 'Object') {
            FindQuery[obj.DBName] = mongoose.Types.ObjectId(obj.Value._id);
         }
         if (obj.Type === 'Date') {
            if (FindQuery[obj.DBName] === undefined) {
               FindQuery[obj.DBName] = obj.Option === 'LTE' ? {$lt:new Date(new Date(obj.Value).setDate(new Date(obj.Value).getDate() + 1))} : obj.Option === 'GTE' ? {$gte: new Date(obj.Value)} : new Date(obj.Value);
            } else {
               const DBName = obj.DBName;
               const AndQuery = obj.Option === 'LTE' ? {$lt:new Date(new Date(obj.Value).setDate(new Date(obj.Value).getDate() + 1))} : obj.Option === 'GTE' ? {$gte: new Date(obj.Value)} : new Date(obj.Value);
               FindQuery['$and'] = [{[DBName]: FindQuery[obj.DBName] }, {[DBName]: AndQuery}];
            }
         }
      });
   } 
   
   Promise.all([
      HospitalManagementModel.HospitalManagementSchema
      .aggregate([
         { $match: FindQuery},
         { $lookup: {
            from: "Stemi_Location",
            let: { "location": "$Location"},
            pipeline: [
               { $match: { $expr: { $eq: ["$$location", "$_id"] } } },
               { $project: { "Location_Name": 1 }}
            ],
            as: 'Location' } },
         { $unwind: { path: "$Location",  preserveNullAndEmptyArrays: true } },
         { $addFields: { Location: { $ifNull: [ "$Location", null ] }  } },
         { $lookup: {
            from: "Global_Country",
            let: { "country": "$Country"},
            pipeline: [
               { $match: { $expr: { $eq: ["$$country", "$_id"] } } },
               { $project: { "Country_Name": 1 }}
            ],
            as: 'Country' } },
         { $unwind: { path: "$Country",  preserveNullAndEmptyArrays: true } },
         { $addFields: { Country: { $ifNull: [ "$Country", null ] }  } },
         { $lookup: {
            from: "Global_State",
            let: { "state": "$State"},
            pipeline: [
               { $match: { $expr: { $eq: ["$$state", "$_id"] } } },
               { $project: { "State_Name": 1 }}
            ],
            as: 'State' } },
         { $unwind: { path: "$State",  preserveNullAndEmptyArrays: true } },
         { $addFields: { State: { $ifNull: [ "$State", null ] }  } },
         { $lookup: {
            from: "Global_City",
            let: { "city": "$City"},
            pipeline: [
               { $match: { $expr: { $eq: ["$$city", "$_id"] } } },
               { $project: { "City_Name": 1 }}
            ],
            as: 'City' } },
         { $unwind: { path: "$City",  preserveNullAndEmptyArrays: true } },
         { $addFields: { City: { $ifNull: [ "$City", null ] }  } },

         { $addFields: { HospitalNameSort: { $toLower: "$Hospital_Name" } } },
         { $addFields: { HospitalRoleSort: { $toLower: "$Hospital_Role" } } },
         { $addFields: { AddressSort: { $toLower: "$Address" } } },
         { $addFields: { LocationSort: { $toLower: "$Location.Location_Name" } } },
         { $addFields: { CountrySort: { $toLower: "$Country.Country_Name" } } },
         { $addFields: { StateSort: { $toLower: "$State.State_Name" } } },
         { $addFields: { CitySort: { $toLower: "$City.City_Name" } } },

         { $sort : ShortOrder },
         { $skip : Skip_Count },
         { $limit : Limit_Count }
      ]).exec(),
      HospitalManagementModel.HospitalManagementSchema.countDocuments(FindQuery).exec()
   ]).then(result => {
      res.status(200).send({Status: true, Response: result[0], SubResponse: result[1] });
   }).catch(err => {
      res.status(417).send({Status: false, ErrorCode: 417, ErrorMessage: "Some error occurred while Find The Hospitals list!."});
   });
};

// hospitals All List
exports.Hospitals_All_List = function(req, res) {
   var ReceivingData = req.body;

   var ShortOrder = {updatedAt: -1};
   var ShortKey = ReceivingData.ShortKey;
   var ShortCondition = ReceivingData.ShortCondition;
   if ( ShortKey && ShortKey !== null && ShortKey !== '' && ShortCondition && ShortCondition !== null && ShortCondition !== ''){
      ShortOrder = {};
      ShortOrder[ShortKey] = ShortCondition === 'Ascending' ? 1 : -1 ;
   }

   var FindQuery = {'If_Deleted': false};
   if (ReceivingData.FilterQuery && typeof ReceivingData.FilterQuery === 'object' && ReceivingData.FilterQuery !== null && ReceivingData.FilterQuery.length > 0) {
      ReceivingData.FilterQuery.map(obj => {
         if (obj.Type === 'String') {
            FindQuery[obj.DBName] = { $regex : new RegExp(".*" + obj.Value + ".*", "i") };
         }
         if (obj.Type === 'Select') {
            FindQuery[obj.DBName] = obj.Value;
         }
         if (obj.Type === 'Object') {
            FindQuery[obj.DBName] = mongoose.Types.ObjectId(obj.Value._id);
         }
         if (obj.Type === 'Date') {
            if (FindQuery[obj.DBName] === undefined) {
               FindQuery[obj.DBName] = obj.Option === 'LTE' ? {$lt:new Date(new Date(obj.Value).setDate(new Date(obj.Value).getDate() + 1))} : obj.Option === 'GTE' ? {$gte: new Date(obj.Value)} : new Date(obj.Value);
            } else {
               const DBName = obj.DBName;
               const AndQuery = obj.Option === 'LTE' ? {$lt:new Date(new Date(obj.Value).setDate(new Date(obj.Value).getDate() + 1))} : obj.Option === 'GTE' ? {$gte: new Date(obj.Value)} : new Date(obj.Value);
               FindQuery['$and'] = [{[DBName]: FindQuery[obj.DBName] }, {[DBName]: AndQuery}];
            }
         }
      });
   } 
   
   HospitalManagementModel.HospitalManagementSchema
   .aggregate([
      { $match: FindQuery},
      { $lookup: {
         from: "Stemi_Location",
         let: { "location": "$Location"},
         pipeline: [
            { $match: { $expr: { $eq: ["$$location", "$_id"] } } },
            { $project: { "Location_Name": 1 }}
         ],
         as: 'Location' } },
      { $unwind: { path: "$Location",  preserveNullAndEmptyArrays: true } },
      { $addFields: { Location: { $ifNull: [ "$Location", null ] }  } },
      { $lookup: {
         from: "Global_Country",
         let: { "country": "$Country"},
         pipeline: [
            { $match: { $expr: { $eq: ["$$country", "$_id"] } } },
            { $project: { "Country_Name": 1 }}
         ],
         as: 'Country' } },
      { $unwind: { path: "$Country",  preserveNullAndEmptyArrays: true } },
      { $addFields: { Country: { $ifNull: [ "$Country", null ] }  } },
      { $lookup: {
         from: "Global_State",
         let: { "state": "$State"},
         pipeline: [
            { $match: { $expr: { $eq: ["$$state", "$_id"] } } },
            { $project: { "State_Name": 1 }}
         ],
         as: 'State' } },
      { $unwind: { path: "$State",  preserveNullAndEmptyArrays: true } },
      { $addFields: { State: { $ifNull: [ "$State", null ] }  } },
      { $lookup: {
         from: "Global_City",
         let: { "city": "$City"},
         pipeline: [
            { $match: { $expr: { $eq: ["$$city", "$_id"] } } },
            { $project: { "City_Name": 1 }}
         ],
         as: 'City' } },
      { $unwind: { path: "$City",  preserveNullAndEmptyArrays: true } },
      { $addFields: { City: { $ifNull: [ "$City", null ] }  } },

      { $addFields: { HospitalNameSort: { $toLower: "$Hospital_Name" } } },
      { $addFields: { HospitalRoleSort: { $toLower: "$Hospital_Role" } } },
      { $addFields: { AddressSort: { $toLower: "$Address" } } },
      { $addFields: { LocationSort: { $toLower: "$Location.Location_Name" } } },
      { $addFields: { CountrySort: { $toLower: "$Country.Country_Name" } } },
      { $addFields: { StateSort: { $toLower: "$State.State_Name" } } },
      { $addFields: { CitySort: { $toLower: "$City.City_Name" } } },

      { $sort : ShortOrder },
   ]).exec( function(err, result) {
      if (err) {
         res.status(417).send({Status: false, ErrorCode: 417, ErrorMessage: "Some error occurred while Find The Hospitals list!."}); 
      } else {
         res.status(200).send({Status: true, Response: result });
      }
   });
};

// hospital View By ID
exports.Hospital_view = function(req, res){
   var ReceivingData = req.body;
   HospitalManagementModel.HospitalManagementSchema
   .findOne({_id: ReceivingData._id},{},{})
   .populate({ path: 'Country', select: 'Country_Name'})
   .populate({ path: 'State', select: 'State_Name'})
   .populate({ path: 'City', select: 'City_Name'})
   .populate({ path: 'Location', select: 'Location_Name'})
   .exec(function(err,result){
      if(err) {
         res.status(417).send({Status: false, Message: "Some error occurred!.", Error: err });
      } else {
         res.status(200).send({Status: true, Response: result });
      }
   });

};

// Hospital Approved 
exports.Hospital_Approve = function(req, res){
   var ReceivingData = req.body;
   HospitalManagementModel.HospitalManagementSchema
   .updateOne({_id: mongoose.Types.ObjectId(ReceivingData._id)}, { $set: {Hospital_Status : 'Approved'}})
   .exec(function(err, result){
      if(err) {
         res.status(417).send({Status: false, Message: "Some error occurred!.", Error: err });
      } else {
         res.status(200).send({Status: true, Response: result });
      }
   });
};

// Hospital Rejected
exports.Hospital_Reject = function(req, res){
   var ReceivingData = req.body;
   HospitalManagementModel.HospitalManagementSchema
   .updateOne({_id: mongoose.Types.ObjectId(ReceivingData._id)}, { $set: {Hospital_Status : 'Rejected'}})
   .exec(function(err, result){
      if(err) {
         res.status(417).send({Status: false, Message: "Some error occurred!.", Error: err });
      } else {
         res.status(200).send({Status: true, Response: result });
      }
   });
};


// Hospital Blocked
exports.Hospital_Block = function(req, res){
   var ReceivingData = req.body;
   HospitalManagementModel.HospitalManagementSchema
   .updateOne({_id: mongoose.Types.ObjectId(ReceivingData._id)}, { $set: {Hospital_Status : 'Blocked', Active_Status: false }})
   .exec(function(err, result){
      if(err) {
         res.status(417).send({Status: false, Message: "Some error occurred!.", Error: err });
      } else {
         UserManagementModel.UserManagementSchema.updateMany(
            { $or: [
               { Hospital: mongoose.Types.ObjectId(ReceivingData._id)},
               { $and: [
                  { HospitalsArray: mongoose.Types.ObjectId(ReceivingData._id) },
                  { HospitalsArray: { $size: 1 } } ] } ] },
            { $set: { Active_Status: false } }
         ).exec();
         UserManagementModel.UserManagementSchema.updateMany(
            { HospitalsArray: mongoose.Types.ObjectId(ReceivingData._id), "HospitalsArray.1": { "$exists": true } },
            { $pull: { HospitalsArray: mongoose.Types.ObjectId(ReceivingData._id) }  }
         ).exec();
         res.status(200).send({Status: true, Response: result });
      }
   });
};

// Hospital UnBlock
exports.Hospital_UnBlock = function(req, res){
   var ReceivingData = req.body;
   HospitalManagementModel.HospitalManagementSchema
   .updateOne({_id: mongoose.Types.ObjectId(ReceivingData._id)}, { $set: {Hospital_Status : 'Approved', Active_Status: true }})
   .exec(function(err, result){
      if(err) {
         res.status(417).send({Status: false, Message: "Some error occurred!.", Error: err });
      } else {
         res.status(200).send({Status: true, Response: result });
      }
   });
};

// Hospital Delete 
exports.Hospital_Delete = function(req, res){
   var ReceivingData = req.body;
   HospitalManagementModel.HospitalManagementSchema
   .updateOne({_id: mongoose.Types.ObjectId(ReceivingData._id)},{ $set: { If_Deleted: 'true'}})
   .exec(function(err, result){
      if(err) {
         res.status(417).send({Status: false, Message: "Some error occurred!.", Error: err });
      } else {
         res.status(200).send({Status: true, Response: result });
      }
   });
};

// Location Based Hub Hospitals List with Unmapped
exports.HubHospitals_SimpleList = function(req, res) {
   var ReceivingData = req.body;

   HospitalManagementModel.HospitalManagementSchema
   .find({  Hospital_Status: 'Approved',
            Active_Status: true,
            If_Deleted: false,
            Cluster_ConnectionType: { $ne: 'ClusterSpoke'},
            $or: [{ Hospital_Role: 'Hub H1'},
                  {Hospital_Role: 'Hub H2'}]
         }, {Hospital_Name: 1})
   .exec(function(err, result){
      if(err) {
         res.status(417).send({Status: false, Message: "Some error occurred!.", Error: err });
      } else {
         result = result.sort(function(Obj1, Obj2) { return Obj1.Hospital_Name.localeCompare(Obj2.Hospital_Name); });
         res.status(200).send({Status: true, Response: result });
      }
   });  
};

// Location Based Hub Hospitals List with Unmapped
exports.Location_HubHospitals = function(req, res) {
   var ReceivingData = req.body;   
   if (!ReceivingData.Location || ReceivingData.Location === '') {
      res.status(400).send({ Status: false, Message: "Location can not be empty" });
   } else {
      HospitalManagementModel.HospitalManagementSchema
      .find({  Location: mongoose.Types.ObjectId(ReceivingData.Location),
               Hospital_Status: 'Approved',
               If_Cluster_Mapped: false,
               Active_Status: true,
               If_Deleted: false,
               Cluster_ConnectionType: { $ne: 'ClusterSpoke'},
               $or: [{ Hospital_Role: 'Hub H1'},
                     {Hospital_Role: 'Hub H2'}]
            }, {Hospital_Name: 1})
      .exec(function(err, result){
         if(err) {
            res.status(417).send({Status: false, Message: "Some error occurred!.", Error: err });
         } else {
            result = result.sort(function(Obj1, Obj2) { return Obj1.Hospital_Name.localeCompare(Obj2.Hospital_Name); });
            res.status(200).send({Status: true, Response: result });
         }
      });  
   }
};

// Location Based Hub Hospitals List with Mapped
exports.ClusterEdit_HubHospitals = function(req, res){
   var ReceivingData = req.body;

   if (!ReceivingData.Location || ReceivingData.Location === '') {
      res.status(400).send({ Status: false, Message: "Location can not be empty" });
   } else if (!ReceivingData.Cluster_ID || ReceivingData.Cluster_ID === '') {
      res.status(400).send({ Status: false, Message: "Cluster Details can not be empty" });
   } else {
      HospitalManagementModel.HospitalManagementSchema
      .find({  Location: mongoose.Types.ObjectId(ReceivingData.Location),
               Hospital_Status: 'Approved',
               Active_Status: true,
               If_Deleted: false,
               Cluster_ConnectionType: { $ne: 'ClusterSpoke'},
               $and: [{ Hospital_Role: { $ne:'Spoke S1' } }, {Hospital_Role: { $ne:'Spoke S2' } }, {Hospital_Role: { $ne:'EMS'} }],               
               $or: [{Connected_Clusters: ReceivingData.Cluster_ID}, {If_Cluster_Mapped: false }]
            }, {Hospital_Name: 1})
      .exec(function(err, result){
         if(err) {
            res.status(417).send({Status: false, Message: "Some error occurred!.", Error: err });
         } else {
            result = result.sort(function(Obj1, Obj2) { return Obj1.Hospital_Name.localeCompare(Obj2.Hospital_Name); });
            res.status(200).send({Status: true, Response: result });
         }
      });  
   }
};


// Location Based Hub Hospitals List Also Cluster Mapped
exports.Location_HubHospitals_AlsoMapped = function(req, res) {
   var ReceivingData = req.body;

   if (!ReceivingData.Location || ReceivingData.Location === '') {
      res.status(400).send({ Status: false, Message: "Location can not be empty" });
   } else {
      HospitalManagementModel.HospitalManagementSchema
      .find({  Location: mongoose.Types.ObjectId(ReceivingData.Location),
               Hospital_Status: 'Approved',
               Active_Status: true,
               If_Deleted: false,
               Cluster_ConnectionType: { $ne: 'ClusterSpoke'},
               $or: [{ Hospital_Role: 'Hub H1'},
                     {Hospital_Role: 'Hub H2'}]
            }, {Hospital_Name: 1})
      .exec(function(err, result){
         if(err) {
            res.status(417).send({Status: false, Message: "Some error occurred!.", Error: err });
         } else {
            result = result.sort(function(Obj1, Obj2) { return Obj1.Hospital_Name.localeCompare(Obj2.Hospital_Name); });
            res.status(200).send({Status: true, Response: result });
         }
      });  
   }
};

// Hospital Details Update 
exports.Update_Hospital = function(req, res) {
   var ReceivingData = req.body;
      
   if (!ReceivingData.HospitalId || ReceivingData.HospitalId === '') {
      res.status(400).send({ Status: false, Message: "Hospital Details can not be valid" });
   } else {

      if(ReceivingData.Country && typeof ReceivingData.Country === 'object' && ReceivingData.Country._id !== '') {
         ReceivingData.Country = mongoose.Types.ObjectId(ReceivingData.Country._id);
      } else {
         ReceivingData.Country = null;
      }
      if(ReceivingData.State && typeof ReceivingData.State === 'object' && ReceivingData.State._id !== '') {
         ReceivingData.State = mongoose.Types.ObjectId(ReceivingData.State._id);
      } else {
         ReceivingData.State = null;
      }
      if(ReceivingData.City && typeof ReceivingData.City === 'object' && ReceivingData.City._id !== '') {
         ReceivingData.City = mongoose.Types.ObjectId(ReceivingData.City._id);
      } else {
         ReceivingData.City = null;
      }
      if(ReceivingData.Location && typeof ReceivingData.Location === 'object' && ReceivingData.Location._id !== '') {
         ReceivingData.Location = mongoose.Types.ObjectId(ReceivingData.Location._id);
      } else {
         ReceivingData.Location = null;
      }
      if(ReceivingData.Is_EMS !== undefined && ReceivingData.Is_EMS !== null) {
         ReceivingData.Is_EMS = ReceivingData.Is_EMS;
      } else {
         ReceivingData.Is_EMS = false;
      }

      ReceivingData.Hospital_Role = '';

      if(ReceivingData.CathLab_Availability !== null && ReceivingData.CathLab_Availability !== '' && ReceivingData.CathLab_Availability === 'Yes' &&
         ReceivingData.CathLab_24_7 !== null && ReceivingData.CathLab_24_7 !== '' && ReceivingData.CathLab_24_7 === 'Yes') {
            ReceivingData.Hospital_Role = 'Hub H1';
      } else {
         if(ReceivingData.CathLab_Availability !== null && ReceivingData.CathLab_Availability !== '' && ReceivingData.CathLab_Availability === 'Yes' &&
            ( ReceivingData.CathLab_24_7 === null || ReceivingData.CathLab_24_7 !== '' || ReceivingData.CathLab_24_7 === 'No' ) ) {
            ReceivingData.Hospital_Role = 'Hub H2';
         } else {
            if(( ReceivingData.CathLab_Availability === null || ReceivingData.CathLab_Availability === '' || ReceivingData.CathLab_Availability === 'No' ) &&
               ( ReceivingData.CathLab_24_7 === null || ReceivingData.CathLab_24_7 === '' || ReceivingData.CathLab_24_7 === 'No' ) &&
               ReceivingData.Thrombolysis_Availability !== null && ReceivingData.Thrombolysis_Availability !== '' && ReceivingData.Thrombolysis_Availability === 'Yes' ) {
               ReceivingData.Hospital_Role = 'Spoke S1';
            } else {
               if(( ReceivingData.CathLab_Availability === null || ReceivingData.CathLab_Availability === '' || ReceivingData.CathLab_Availability === 'No' ) &&
                  ( ReceivingData.CathLab_24_7 === null || ReceivingData.CathLab_24_7 === '' || ReceivingData.CathLab_24_7 === 'No' ) &&
                  ( ReceivingData.Thrombolysis_Availability === null || ReceivingData.Thrombolysis_Availability === '' || ReceivingData.Thrombolysis_Availability === 'No') &&
                  ( ReceivingData.Is_EMS === null || ReceivingData.Is_EMS === '' || !ReceivingData.Is_EMS ) ) {
                  ReceivingData.Hospital_Role = 'Spoke S2';
               } else {
                  if(ReceivingData.Is_EMS !== null && ReceivingData.Is_EMS !== '' && ReceivingData.Is_EMS ) {
                     ReceivingData.Hospital_Role = 'EMS';
                  }
               }  
            }
         }
      }

      HospitalManagementModel.HospitalManagementSchema.findOne({_id: ReceivingData.HospitalId}, {}, {}, function(err, result){
         if(err) {
            res.status(417).send({Status: false, Message: "Some error occurred!.", Error: err });
         } else {

            result.Hospital_Name = ReceivingData.Hospital_Name || '';
            result.Hospital_Role = ReceivingData.Hospital_Role || '';
            result.Hospital_Type = ReceivingData.Hospital_Type || '';
            result.Department_of_Administration = ReceivingData.Department_of_Administration || null;
            result.Owned_Ambulance_Drop = ReceivingData.Owned_Ambulance_Drop || null;
            result.Address = ReceivingData.Address || '';
            result.Country = ReceivingData.Country || '';
            result.State = ReceivingData.State || '';
            result.City = ReceivingData.City || '';
            result.Pin_Code = ReceivingData.Pin_Code || null;
            result.Location = ReceivingData.Location || null;
            result.Latitude = ReceivingData.Latitude || '';
            result.Longitude = ReceivingData.Longitude || '';
            result.Phone = ReceivingData.Phone || null;
            result.Mobile = ReceivingData.Mobile || null;
            result.Is_EMS = ReceivingData.Is_EMS || null;
            result.Best_Mobile_Network = ReceivingData.Best_Mobile_Network || '';
            result.Wifi_Availability = ReceivingData.Wifi_Availability || '';
            result.NoOf_Own_Ambulances = ReceivingData.NoOf_Own_Ambulances || null;
            result.BLS_ALS_Ambulance = ReceivingData.BLS_ALS_Ambulance || null;
            result.ECG_Availability = ReceivingData.ECG_Availability || '';
            result.Defibrillator = ReceivingData.Defibrillator || '';
            result.PMJAY_Availability = ReceivingData.PMJAY_Availability || '';
            result.ECG_Location = ReceivingData.ECG_Location || '';
            result.ECG_Brand_And_Model = ReceivingData.ECG_Brand_And_Model || '';
            result.Patch_Or_BulbElectrode = ReceivingData.Patch_Or_BulbElectrode || '';
            result.NoOf_ECG_PerMonth = ReceivingData.NoOf_ECG_PerMonth || null;
            result.NoOf_Cardiology_Beds = ReceivingData.NoOf_Cardiology_Beds || '';
            result.NoOf_ICU_Or_CCU_Beds = ReceivingData.NoOf_ICU_Or_CCU_Beds || '';
            result.Doctors_24in7_EmergencyRoom = ReceivingData.Doctors_24in7_EmergencyRoom || null;
            result.Doctors_24in7_CCU = ReceivingData.Doctors_24in7_CCU || '';
            result.NoOf_Cardiologists = ReceivingData.NoOf_Cardiologists || null;
            result.NoOf_GeneralPhysicians = ReceivingData.NoOf_GeneralPhysicians || null;
            result.NoOf_CCUNurses = ReceivingData.NoOf_CCUNurses || '';
            result.Thrombolysis_Availability = ReceivingData.Thrombolysis_Availability || '';
            result.TypeOf_Thrombolytic = ReceivingData.TypeOf_Thrombolytic || [];
            result.Thrombolytic_Other = ReceivingData.Thrombolytic_Other || '';
            result.NoOf_Thrombolysed_patients_PerMonth = ReceivingData.NoOf_Thrombolysed_patients_PerMonth || '';
            result.PercentageOf_Streptokinase_patients = ReceivingData.PercentageOf_Streptokinase_patients || '';
            result.PercentageOf_Tenecteplase_patients = ReceivingData.PercentageOf_Tenecteplase_patients || '';
            result.PercentageOf_Reteplase_patients = ReceivingData.PercentageOf_Reteplase_patients || '';
            result.CathLab_Availability = ReceivingData.CathLab_Availability || '';
            result.CathLab_24_7 =ReceivingData.CathLab_24_7 || '';
            result.PCI_Availability = ReceivingData.PCI_Availability || '';
            result.NoOf_PCI_Done_PerMonth = ReceivingData.NoOf_PCI_Done_PerMonth || '';
            result.NoOf_PrimaryPCI_Done_PerMonth = ReceivingData.NoOf_PrimaryPCI_Done_PerMonth || '';
            result.If_PharmacoInvasive_Therapy = ReceivingData.If_PharmacoInvasive_Therapy || '';
            result.NoOf_PharmacoInvasive_PerMonth = ReceivingData.NoOf_PharmacoInvasive_PerMonth || '';
            result.Cardiology_Department_Head = ReceivingData.Cardiology_Department_Head || '';
            result.NoOf_STEMI_Patients_PerMonth = ReceivingData.NoOf_STEMI_Patients_PerMonth || '';
            result.NoOf_Direct_STEMI_Patients_PerMonth = ReceivingData.NoOf_Direct_STEMI_Patients_PerMonth || '';
            result.NoOf_Referral_STEMI_Patients_PerMonth = ReceivingData.NoOf_Referral_STEMI_Patients_PerMonth || '';
            // result.NoOf_STEMI_Cases_ReferredFrom_PerMonth = ReceivingData.NoOf_STEMI_Cases_ReferredFrom_PerMonth || '';
            result.NoOf_STEMI_Cases_ReferredTo_PerMonth = ReceivingData.NoOf_STEMI_Cases_ReferredTo_PerMonth || '';
            result.Popular_FM_Channel = ReceivingData.Popular_FM_Channel || '';
            result.Popular_Newspaper = ReceivingData.Popular_Newspaper || '';
            result.Heard_About_Project = ReceivingData.Heard_About_Project || '';
            result.Help_Timely_Care_ToPatients = ReceivingData.Help_Timely_Care_ToPatients || '';
            result.Feedback_Remarks = ReceivingData.Feedback_Remarks || '';
            result.Cardiologist_Array = ReceivingData.CardiologistArray || [];
            result.GeneralPhysician_Array = ReceivingData.GeneralPhysicianArray || [];
            result.CoOrdinators_Array = ReceivingData.CoOrdinatorsArray || [];
            result.Hospitals_Refer_STEMI_Patients = ReceivingData.HospitalReferringArray || [];
            result.ClosetHospital_Array = ReceivingData.ClosetHospitalArray || [];
            result.ClosestHospitals_with_CathLab = ReceivingData.ClosestHospitals_with_CathLab || '';

            result.save(function(err_1, result_1){
               if(err_1) {
                  res.status(417).send({Status: false, Message: "Some error occurred!.", Error: err_1 });
               } else {
                  res.status(200).send({Status: true, Message: "Hospital Detail Successfully Updated", Response: result_1 });
               }
            });
         }
      });
   }
};

exports.Hospital_SimpleList = function(req, res){
   var ReceivingData = req.body;
   HospitalManagementModel.HospitalManagementSchema
      .find({'If_Deleted': false}, {Hospital_Name: 1}, {'short': {createdAt: 1}})
      .exec(function(err,result){
         if(err) {
            res.status(417).send({status: false, Message: "Some error occurred!.", Error: err });
         } else {
            result = result.sort(function(Obj1, Obj2) { return Obj1.Hospital_Name.localeCompare(Obj2.Hospital_Name); });
            res.status(200).send({Status: true, Response: result });
         }
      });
};
