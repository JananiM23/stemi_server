var BPLPatientsModel = require('./../models/bpl_patients.model');
var StemiClusterModel = require('../models/cluster_management.model');
var PatientDetailsModel = require('../../mobile_api/models/patient-management/patient_details.model');
var HospitalManagementModel = require('../models/hospital_management.model');
var StemiUserModel = require('../models/user_management.model');
var StemiAppUserModel = require('../../mobile_api/models/login_management.model');
var NotificationModel = require('../models/notification_management.model');
var StemiClusterModel = require('../models/cluster_management.model');
var WebPatientDetailsModel = require('../models/patient-management/patient_details.model');

var mongoose = require('mongoose');
var FCM_App = require('./../../../Config/fcm_config').first;
var FCM_Tab = require('./../../../Config/fcm_config').second;
var options = {
   priority: 'high',
   timeToLive: 60 * 60 * 24
};
var QRCode = require('qrcode');

// SMS Notification System
const axios = require('axios');
var Schedule = require('node-schedule');

// Super Admin BPL Patient List
exports.All_BPLPatients_List = function(req, res) {
   var ReceivingData = req.body;

   const Skip_Count = parseInt(ReceivingData.Skip_Count, 0) || 0;
   const Limit_Count = parseInt(ReceivingData.Limit_Count, 0) || 5;

   var ShortOrder = {createdAt: -1};
   var ShortKey = ReceivingData.ShortKey;
   var ShortCondition = ReceivingData.ShortCondition;
   if ( ShortKey && ShortKey !== null && ShortKey !== '' && ShortCondition && ShortCondition !== null && ShortCondition !== ''){           
      ShortOrder = {};
      ShortOrder[ShortKey] = ShortCondition === 'Ascending' ? 1 : -1 ;
   }
   var FindQuery = {'If_Deleted': false, 'Patient_Status': 'Pending' };
   var LocationFilter = {};

   if (ReceivingData.FilterQuery && typeof ReceivingData.FilterQuery === 'object' && ReceivingData.FilterQuery !== null && ReceivingData.FilterQuery.length > 0) {
      ReceivingData.FilterQuery.map(obj => {
         if (obj.Type === 'String') {
            FindQuery[obj.DBName] = { $regex : new RegExp(".*" + obj.Value + ".*", "i") };
         }
         if (obj.Type === 'Select') {
            FindQuery[obj.DBName] = obj.Value;
         }
         if (obj.Type === 'Date') {
            if (FindQuery[obj.DBName] === undefined) {
               FindQuery[obj.DBName] = obj.Option === 'LTE' ? {$lt:new Date(new Date(obj.Value).setDate(new Date(obj.Value).getDate() + 1))} : obj.Option === 'GTE' ? {$gte: new Date(obj.Value)} : new Date(obj.Value);
            } else {
               const DBName = obj.DBName;
               const AndQuery = obj.Option === 'LTE' ? {$lt:new Date(new Date(obj.Value).setDate(new Date(obj.Value).getDate() + 1))} : obj.Option === 'GTE' ? {$gte: new Date(obj.Value)} :new Date(obj.Value);
               FindQuery['$and'] = [{[DBName]: FindQuery[obj.DBName] }, {[DBName]: AndQuery}];
            }
         }
         if (obj.Type === 'Object') {
            if (obj.Key === 'Location') {
               LocationFilter = { 'Initiated_Hospital.Location': mongoose.Types.ObjectId(obj.Value._id) };
            } else {
               FindQuery[obj.DBName] = mongoose.Types.ObjectId(obj.Value._id);
            }
         }
      });
   }  
   Promise.all([
      BPLPatientsModel.BPLPatientsSchema
      .aggregate([
         { $match: FindQuery},
         { $lookup: {
            from: "Stemi_Hospital_Management",
            let: { "hospital": "$Hospital"},
            pipeline: [
               { $match: { $expr: { $eq: ["$$hospital", "$_id"] } } },
               { $project: { "Hospital_Name": 1, "Hospital_Code": 1, "Hospital_Role": 1, "Location": 1 }}
            ],
            as: 'Initiated_Hospital' }
         },
         { $unwind: { path: "$Initiated_Hospital",  preserveNullAndEmptyArrays: true } },
         { $match: LocationFilter },
         // {
         //    $lookup:{
         //          from: "Stemi_User", 
         //          let: { "user": "$User"},
         //          pipeline: [
         //             { $match: { $expr: { $eq: ["$$user", "$_id"] } } },
         //             { $project: { "Name": 1, "User_Type": 1, }}
         //          ],
         //          as: 'UserInfo'
         //    }
         // },
         // { $unwind: { path: "$UserInfo",  preserveNullAndEmptyArrays: true } },
         { $addFields: { Initiated_Hospital: { $ifNull: [ "$Initiated_Hospital", null ] }  } },
         { $addFields: { HospitalSort: { $ifNull: [ "$Initiated_Hospital.Hospital_Name", null ] }  } },
         { $addFields: { PatientNameSort: { $ifNull: [ "$Patient_Name", null ] }  } },
         { $addFields: { HospitalSort: { $toLower: "$HospitalSort" } } },
         { $addFields: { PatientNameSort: { $toLower: "$PatientNameSort" } } },
         // { $addFields: { Patient_Age: {$toDouble: {$cond: { if: { $eq: ["$Patient_Age", ''] },  then: '0', else: "$Patient_Age" }}}} },
         { $addFields: { Patient_Age: {$cond: { if: { $eq: ["$Patient_Age", ''] },  then: '0', else: "$Patient_Age" }}} },
         { $project: { Patient_Id: 1, Patient_Name: 1, PatientNameSort: 1, Patient_Age:1, Patient_Gender: 1, Patient_Height: 1, Patient_Weight: 1, Patient_BP: 1, Initiated_Hospital: 1,
                        Hospital: 1, HospitalSort: 1, User: 1, ECG_Taken_date_time: 1, ECG_Report: 1, createdAt: 1 } },
         { $sort : ShortOrder },
         { $skip : Skip_Count },
         { $limit : Limit_Count }
      ]).exec(),
      BPLPatientsModel.BPLPatientsSchema
      .aggregate([
         { $match: FindQuery},
         { $lookup: {
            from: "Stemi_Hospital_Management",
            let: { "hospital": "$Hospital"},
            pipeline: [
               { $match: { $expr: { $eq: ["$$hospital", "$_id"] } } },
               { $project: { "Hospital_Name": 1, "Hospital_Code": 1, "Hospital_Role": 1, "Location": 1 }}
            ],
            as: 'Initiated_Hospital' }
         },
         { $unwind: { path: "$Initiated_Hospital",  preserveNullAndEmptyArrays: true } },
         { $match: LocationFilter },
         { $project: { Patient_Id: 1 } }
      ]).exec()
   ]).then(result => {
      res.status(200).send({Status: true, Response: result[0], SubResponse: result[1].length });
   }).catch(err => {
      res.status(417).send({Status: false, ErrorCode: 417, ErrorMessage: "Some error occurred while Find The Patients list!."});
   });
};

// Super Admin BPL Patient Complete List
exports.All_BPLPatients_CompleteList = function(req, res) {
   var ReceivingData = req.body;

   const Skip_Count = parseInt(ReceivingData.Skip_Count, 0) || 0;
   const Limit_Count = parseInt(ReceivingData.Limit_Count, 0) || 5;

   var ShortOrder = {createdAt: -1};
   var ShortKey = ReceivingData.ShortKey;
   var ShortCondition = ReceivingData.ShortCondition;
   if ( ShortKey && ShortKey !== null && ShortKey !== '' && ShortCondition && ShortCondition !== null && ShortCondition !== ''){           
      ShortOrder = {};
      ShortOrder[ShortKey] = ShortCondition === 'Ascending' ? 1 : -1 ;
   }
   var FindQuery = {'If_Deleted': false};
   var LocationFilter = {};

   if (ReceivingData.FilterQuery && typeof ReceivingData.FilterQuery === 'object' && ReceivingData.FilterQuery !== null && ReceivingData.FilterQuery.length > 0) {
      ReceivingData.FilterQuery.map(obj => {
         if (obj.Type === 'String') {
            FindQuery[obj.DBName] = { $regex : new RegExp(".*" + obj.Value + ".*", "i") };
         }
         if (obj.Type === 'Select') {
            FindQuery[obj.DBName] = obj.Value;
         }
         if (obj.Type === 'Date') {
            if (FindQuery[obj.DBName] === undefined) {
               FindQuery[obj.DBName] = obj.Option === 'LTE' ? {$lt:new Date(new Date(obj.Value).setDate(new Date(obj.Value).getDate() + 1))} : obj.Option === 'GTE' ? {$gte: new Date(obj.Value)} : new Date(obj.Value);
            } else {
               const DBName = obj.DBName;
               const AndQuery = obj.Option === 'LTE' ? {$lt:new Date(new Date(obj.Value).setDate(new Date(obj.Value).getDate() + 1))} : obj.Option === 'GTE' ? {$gte: new Date(obj.Value)} :new Date(obj.Value);
               FindQuery['$and'] = [{[DBName]: FindQuery[obj.DBName] }, {[DBName]: AndQuery}];
            }
         }
         if (obj.Type === 'Object') {
            if (obj.Key === 'Location') {
               LocationFilter = { 'Initiated_Hospital.Location': mongoose.Types.ObjectId(obj.Value._id) };
            } else {
               FindQuery[obj.DBName] = mongoose.Types.ObjectId(obj.Value._id);
            }
         }
      });
   }  
   Promise.all([
      BPLPatientsModel.BPLPatientsSchema
      .aggregate([
         { $match: FindQuery},
         { $lookup: {
            from: "Stemi_Hospital_Management",
            let: { "hospital": "$Hospital"},
            pipeline: [
               { $match: { $expr: { $eq: ["$$hospital", "$_id"] } } },
               { $project: { "Hospital_Name": 1, "Hospital_Code": 1, "Hospital_Role": 1, "Location": 1 }}
            ],
            as: 'Initiated_Hospital' }
         },
         { $unwind: { path: "$Initiated_Hospital",  preserveNullAndEmptyArrays: true } },
         { $match: LocationFilter },
         // {
         //    $lookup:{
         //          from: "Stemi_User", 
         //          let: { "user": "$User"},
         //          pipeline: [
         //             { $match: { $expr: { $eq: ["$$user", "$_id"] } } },
         //             { $project: { "Name": 1, "User_Type": 1, }}
         //          ],
         //          as: 'UserInfo'
         //    }
         // },
         // { $unwind: { path: "$UserInfo",  preserveNullAndEmptyArrays: true } },
         { $addFields: { Initiated_Hospital: { $ifNull: [ "$Initiated_Hospital", null ] }  } },
         { $addFields: { HospitalSort: { $ifNull: [ "$Initiated_Hospital.Hospital_Name", null ] }  } },
         { $addFields: { PatientNameSort: { $ifNull: [ "$Patient_Name", null ] }  } },
         { $addFields: { HospitalSort: { $toLower: "$HospitalSort" } } },
         { $addFields: { PatientNameSort: { $toLower: "$PatientNameSort" } } },
         { $addFields: { PatientStatusSort: { $toLower: "$Patient_Status" } } },
         // { $addFields: { Patient_Age: {$toDouble: {$cond: { if: { $eq: ["$Patient_Age", ''] },  then: '0', else: "$Patient_Age" }}}} },
         { $addFields: { Patient_Age: {$cond: { if: { $eq: ["$Patient_Age", ''] },  then: '0', else: "$Patient_Age" }}} },
         { $project: { Patient_Id: 1, Patient_Name: 1, PatientNameSort: 1, Patient_Age:1, Patient_Gender: 1, Patient_Height: 1, Patient_Weight: 1, Patient_BP: 1, Initiated_Hospital: 1,
                        Hospital: 1, HospitalSort: 1, PatientStatusSort: 1, User: 1, ECG_Taken_date_time: 1, ECG_Report: 1, createdAt: 1 } },
         { $sort : ShortOrder },
         { $skip : Skip_Count },
         { $limit : Limit_Count }
      ]).exec(),
      BPLPatientsModel.BPLPatientsSchema
      .aggregate([
         { $match: FindQuery},
         { $lookup: {
            from: "Stemi_Hospital_Management",
            let: { "hospital": "$Hospital"},
            pipeline: [
               { $match: { $expr: { $eq: ["$$hospital", "$_id"] } } },
               { $project: { "Hospital_Name": 1, "Hospital_Code": 1, "Hospital_Role": 1, "Location": 1 }}
            ],
            as: 'Initiated_Hospital' }
         },
         { $unwind: { path: "$Initiated_Hospital",  preserveNullAndEmptyArrays: true } },
         { $match: LocationFilter },
         { $project: { Patient_Id: 1 } }
      ]).exec()
   ]).then(result => {
      res.status(200).send({Status: true, Response: result[0], SubResponse: result[1].length });
   }).catch(err => {
      res.status(417).send({Status: false, ErrorCode: 417, ErrorMessage: "Some error occurred while Find The Patients list!."});
   });
};

// CO User Clusters Based BPL Patients List
exports.Coordinator_BPLPatients_List = function(req, res) {
   var ReceivingData = req.body;
   
   if (!ReceivingData.User || ReceivingData.User === '') {
      res.status(400).send({ Status: false, Message: "User Details is Required!" });
   } else if (!ReceivingData.User_Type || ReceivingData.User_Type !== 'CO') {
      res.status(400).send({ Status: false, Message: "User Rights is not Proper!" });
   } else if (!ReceivingData.ClustersArray || typeof ReceivingData.ClustersArray !== 'object' || ReceivingData.ClustersArray.length <= 0) {
      res.status(400).send({ Status: false, Message: "Coordinators Detail not valid!" });
   } else {
      const ClusterArr = ReceivingData.ClustersArray.map(obj => mongoose.Types.ObjectId(obj._id));
      StemiClusterModel.ClusterMappingSchema.find( {'Cluster': { $in: ClusterArr } }, {}, {})
      .exec(function(err, result) {
         if(err) {
            res.status(417).send({status: false, Message: "Some error occurred while Find The Cluster Details!.", Error: err });
         } else {
            const HospitalResult = result.map(obj => obj.ClusterHospital);
            const HospitalArr = HospitalResult.filter((element, index, thisArg) => thisArg.indexOf(element) === index);

            const Skip_Count = parseInt(ReceivingData.Skip_Count, 0) || 0;
            const Limit_Count = parseInt(ReceivingData.Limit_Count, 0) || 5;
         
            var ShortOrder = {createdAt: -1};
            var ShortKey = ReceivingData.ShortKey;
            var ShortCondition = ReceivingData.ShortCondition;
            if ( ShortKey && ShortKey !== null && ShortKey !== '' && ShortCondition && ShortCondition !== null && ShortCondition !== ''){           
               ShortOrder = {};
               ShortOrder[ShortKey] = ShortCondition === 'Ascending' ? 1 : -1 ;
            }

            var FindQuery = {'If_Deleted': false,  'Patient_Status': 'Pending', 'Hospital': { $in: HospitalArr } };
            
            if (ReceivingData.FilterQuery && typeof ReceivingData.FilterQuery === 'object' && ReceivingData.FilterQuery !== null && ReceivingData.FilterQuery.length > 0) {
               ReceivingData.FilterQuery.map(obj => {
                  if (obj.Type === 'String') {
                     FindQuery[obj.DBName] = { $regex : new RegExp(".*" + obj.Value + ".*", "i") };
                  }
                  if (obj.Type === 'Select') {
                     FindQuery[obj.DBName] = obj.Value;
                  }
                  if (obj.Type === 'Date') {
                     if (FindQuery[obj.DBName] === undefined) {
                        FindQuery[obj.DBName] = obj.Option === 'LTE' ? {$lt:new Date(new Date(obj.Value).setDate(new Date(obj.Value).getDate() + 1))} : obj.Option === 'GTE' ? {$gte: new Date(obj.Value)} : new Date(obj.Value);
                     } else {
                        const DBName = obj.DBName;
                        const AndQuery = obj.Option === 'LTE' ? {$lt:new Date(new Date(obj.Value).setDate(new Date(obj.Value).getDate() + 1))} : obj.Option === 'GTE' ? {$gte: new Date(obj.Value)} :new Date(obj.Value);
                        FindQuery['$and'] = [{[DBName]: FindQuery[obj.DBName] }, {[DBName]: AndQuery}];
                     }
                  }
                  if (obj.Type === 'Object') {
                     FindQuery[obj.DBName] = mongoose.Types.ObjectId(obj.Value._id);
                  }
               });
            } 
            Promise.all([
               BPLPatientsModel.BPLPatientsSchema
               .aggregate([
                  { $match: FindQuery},
                  { $lookup: {
                     from: "Stemi_Hospital_Management",
                     let: { "hospital": "$Hospital"},
                     pipeline: [
                        { $match: { $expr: { $eq: ["$$hospital", "$_id"] } } },
                        { $project: { "Hospital_Name": 1, "Hospital_Code": 1, "Hospital_Role": 1 }}
                     ],
                     as: 'Initiated_Hospital' }
                  },
                  { $unwind: { path: "$Initiated_Hospital",  preserveNullAndEmptyArrays: true } },
                  // {
                  //    $lookup:{
                  //       from: "Stemi_User", 
                  //       let: { "user": "$User"},
                  //       pipeline: [
                  //          { $match: { $expr: { $eq: ["$$user", "$_id"] } } },
                  //          { $project: { "Name": 1, "User_Type": 1, }}
                  //       ],
                  //       as: 'UserInfo'
                  //    }
                  // },
                  // { $unwind: { path: "$UserInfo",  preserveNullAndEmptyArrays: true } },
                  { $addFields: { Initiated_Hospital: { $ifNull: [ "$Initiated_Hospital", null ] }  } },
                  { $addFields: { HospitalSort: { $ifNull: [ "$Initiated_Hospital.Hospital_Name", null ] }  } },
                  { $addFields: { PatientNameSort: { $ifNull: [ "$Patient_Name", null ] }  } },
                  { $addFields: { HospitalSort: { $toLower: "$HospitalSort" } } },
                  { $addFields: { PatientNameSort: { $toLower: "$PatientNameSort" } } },
                  { $addFields: { Patient_Age: {$cond: { if: { $eq: ["$Patient_Age", ''] },  then: '0', else: "$Patient_Age" }}} },
                  { $project: { Patient_Id: 1, Patient_Name: 1, PatientNameSort: 1, Patient_Age:1, Patient_Gender: 1, Patient_Height: 1, Patient_Weight: 1, Patient_BP: 1, Initiated_Hospital: 1,
                                 Hospital: 1, HospitalSort: 1, User: 1, ECG_Taken_date_time: 1, ECG_Report: 1, createdAt: 1 } },
                  { $sort : ShortOrder },
                  { $skip : Skip_Count },
                  { $limit : Limit_Count }
               ]).exec(),
               BPLPatientsModel.BPLPatientsSchema.countDocuments(FindQuery).exec()
            ]).then(result => {
               res.status(200).send({Status: true, Response: result[0], SubResponse: result[1] });
            }).catch(err => {
               res.status(417).send({Status: false, ErrorCode: 417, ErrorMessage: "Some error occurred while Find The Patients list!."});
            });
         }
      });
   }
};


// PU User Single Cluster Based BPL Patients List
exports.SingleCluster_BPLPatients_List = function(req, res) {
   var ReceivingData = req.body;
   if (!ReceivingData.User || ReceivingData.User === '') {
       res.status(400).send({ Status: false, Message: "User Details is Required!" });
    } else if (!ReceivingData.User_Type || ReceivingData.User_Type !== 'PU') {
       res.status(400).send({ Status: false, Message: "User Rights is not Proper!" });
    } else if (!ReceivingData.Cluster || typeof ReceivingData.Cluster !== 'object' || ReceivingData.Cluster === null ) {
       res.status(400).send({ Status: false, Message: "Cluster Details not valid!" });
    } else {
       var ClusterId = mongoose.Types.ObjectId(ReceivingData.Cluster._id);
       StemiClusterModel.ClusterMappingSchema.find( {'Cluster': ClusterId }, {}, {}) 
       .exec(function(err, result) {
          if(err) {
             res.status(417).send({status: false, Message: "Some error occurred while Find The Cluster Details!.", Error: err });
       } else {
 
          const HospitalResult = result.map(obj => obj.ClusterHospital);
          const HospitalArr = HospitalResult.filter((element, index, thisArg) => thisArg.indexOf(element) === index);
 
          const Skip_Count = parseInt(ReceivingData.Skip_Count, 0) || 0;
          const Limit_Count = parseInt(ReceivingData.Limit_Count, 0) || 5;
       
          var ShortOrder = {createdAt: -1};
          var ShortKey = ReceivingData.ShortKey;
          var ShortCondition = ReceivingData.ShortCondition;
          if ( ShortKey && ShortKey !== null && ShortKey !== '' && ShortCondition && ShortCondition !== null && ShortCondition !== ''){           
             ShortOrder = {};
             ShortOrder[ShortKey] = ShortCondition === 'Ascending' ? 1 : -1 ;
          }
 

          var FindQuery = {'If_Deleted': false, 'Patient_Status': 'Pending', 'Hospital': { $in: HospitalArr } };

          if (ReceivingData.FilterQuery && typeof ReceivingData.FilterQuery === 'object' && ReceivingData.FilterQuery !== null && ReceivingData.FilterQuery.length > 0) {
             ReceivingData.FilterQuery.map(obj => {
                if (obj.Type === 'String') {
                   FindQuery[obj.DBName] = { $regex : new RegExp(".*" + obj.Value + ".*", "i") };
                }
                if (obj.Type === 'Select') {
                   FindQuery[obj.DBName] = obj.Value;
                }
                if (obj.Type === 'Date') {
                   if (FindQuery[obj.DBName] === undefined) {
                      FindQuery[obj.DBName] = obj.Option === 'LTE' ? {$lt:new Date(new Date(obj.Value).setDate(new Date(obj.Value).getDate() + 1))} : obj.Option === 'GTE' ? {$gte: new Date(obj.Value)} : new Date(obj.Value);
                   } else {
                      const DBName = obj.DBName;
                      const AndQuery = obj.Option === 'LTE' ? {$lt:new Date(new Date(obj.Value).setDate(new Date(obj.Value).getDate() + 1))} : obj.Option === 'GTE' ? {$gte: new Date(obj.Value)} :new Date(obj.Value);
                      FindQuery['$and'] = [{[DBName]: FindQuery[obj.DBName] }, {[DBName]: AndQuery}];
                   }
                }
                if (obj.Type === 'Object') {
                   FindQuery[obj.DBName] = mongoose.Types.ObjectId(obj.Value._id);
                }
             });
          } 
          Promise.all([
            BPLPatientsModel.BPLPatientsSchema
            .aggregate([
               { $match: FindQuery},
               { $lookup: {
                  from: "Stemi_Hospital_Management",
                  let: { "hospital": "$Hospital"},
                  pipeline: [
                     { $match: { $expr: { $eq: ["$$hospital", "$_id"] } } },
                     { $project: { "Hospital_Name": 1, "Hospital_Code": 1, "Hospital_Role": 1 }}
                  ],
                  as: 'Initiated_Hospital' }
               },
               { $unwind: { path: "$Initiated_Hospital",  preserveNullAndEmptyArrays: true } },
               // {
               //    $lookup:{
               //          from: "Stemi_User", 
               //          let: { "user": "$User"},
               //          pipeline: [
               //             { $match: { $expr: { $eq: ["$$user", "$_id"] } } },
               //             { $project: { "Name": 1, "User_Type": 1, }}
               //          ],
               //          as: 'UserInfo'
               //    }
               // },
               // { $unwind: { path: "$UserInfo",  preserveNullAndEmptyArrays: true } },
               { $addFields: { Initiated_Hospital: { $ifNull: [ "$Initiated_Hospital", null ] }  } },
               { $addFields: { HospitalSort: { $ifNull: [ "$Initiated_Hospital.Hospital_Name", null ] }  } },
               { $addFields: { PatientNameSort: { $ifNull: [ "$Patient_Name", null ] }  } },
               { $addFields: { HospitalSort: { $toLower: "$HospitalSort" } } },
               { $addFields: { PatientNameSort: { $toLower: "$PatientNameSort" } } },
               { $addFields: { Patient_Age: {$cond: { if: { $eq: ["$Patient_Age", ''] },  then: '0', else: "$Patient_Age" }}} },
               { $project: { Patient_Id: 1, Patient_Name: 1, PatientNameSort: 1, Patient_Age:1, Patient_Gender: 1, Patient_Height: 1, Patient_Weight: 1, Patient_BP: 1, Initiated_Hospital: 1,
                              Hospital: 1, HospitalSort: 1, User: 1, ECG_Taken_date_time: 1, ECG_Report: 1, createdAt: 1 } },
               { $sort : ShortOrder },
               { $skip : Skip_Count },
               { $limit : Limit_Count }
            ]).exec(),
            BPLPatientsModel.BPLPatientsSchema.countDocuments(FindQuery).exec()
         ]).then(result => {
            res.status(200).send({Status: true, Response: result[0], SubResponse: result[1] });
         }).catch(err => {
            res.status(417).send({Status: false, ErrorCode: 417, ErrorMessage: "Some error occurred while Find The Patients list!."});
         });
       }
          
       });
       }
};


// PU User Multiple Cluster Cardiac Based BPL Patients List
exports.MultipleCluster_BPLPatients_List = function(req, res) {
   var ReceivingData = req.body;

   if (!ReceivingData.User || ReceivingData.User === '') {
      res.status(400).send({ Status: false, Message: "User Details is Required!" });
   } else if (!ReceivingData.User_Type || ReceivingData.User_Type !== 'PU') {
      res.status(400).send({ Status: false, Message: "User Rights is not Proper!" });
   } else if (!ReceivingData.Hospital || typeof ReceivingData.Hospital !== 'object' || ReceivingData.Hospital._id === undefined) {
      res.status(400).send({ Status: false, Message: "Hospital Details Not proper!" });
   } else {
      const ClusterId = mongoose.Types.ObjectId(ReceivingData.Cluster._id);
      StemiClusterModel.ClusterSchema.findOne( {'_id':  ClusterId }, {}, {})
      .exec(function(err, result) {
         if(err) {
            res.status(417).send({status: false, Message: "Some error occurred while Find The Cluster Details!.", Error: err });
         } else {
            result = JSON.parse(JSON.stringify(result)); 
            const HospitalsId = mongoose.Types.ObjectId(ReceivingData.Hospital._id);
            const ConnectionType = result.Hospital === JSON.parse(JSON.stringify(HospitalsId)) ? 'Primary' : 'Secondary';
            Promise.all([
               StemiClusterModel.ClusterMappingSchema.find({'Cluster': ClusterId }, {}, {}).exec(),
               StemiClusterModel.ClusterMappingSchema.find({'Connected_ClusterHub': HospitalsId }, {}, {}).exec()
            ]).then(response => {
               var PrimaryHospitals = JSON.parse(JSON.stringify(response[0]));
               var SecondaryHospitals = JSON.parse(JSON.stringify(response[1]));
               var Hospitals = [];
               Hospitals.push(HospitalsId);
               if (ConnectionType === 'Primary') {
                  PrimaryHospitals.map(obj => {
                     Hospitals.push(obj.ClusterHospital);
                  });
               }
               if (ConnectionType === 'Secondary') {
                  SecondaryHospitals.map(obj => {
                     Hospitals.push(obj.ClusterHospital);
                  });
               }
               Hospitals = Hospitals.map(obj => mongoose.Types.ObjectId(obj));
               const Skip_Count = parseInt(ReceivingData.Skip_Count, 0) || 0;
               const Limit_Count = parseInt(ReceivingData.Limit_Count, 0) || 5;
               var ShortOrder = {createdAt: -1};
               var ShortKey = ReceivingData.ShortKey;
               var ShortCondition = ReceivingData.ShortCondition;
               if ( ShortKey && ShortKey !== null && ShortKey !== '' && ShortCondition && ShortCondition !== null && ShortCondition !== ''){           
                  ShortOrder = {};
                  ShortOrder[ShortKey] = ShortCondition === 'Ascending' ? 1 : -1 ;
               } 

               var FindQuery = {'If_Deleted': false, 'Hospital': { $in: Hospitals }, 'Patient_Status': 'Pending' };

               if (ReceivingData.FilterQuery && typeof ReceivingData.FilterQuery === 'object' && ReceivingData.FilterQuery !== null && ReceivingData.FilterQuery.length > 0) {
                  ReceivingData.FilterQuery.map(obj => {
                     if (obj.Type === 'String') {
                        FindQuery[obj.DBName] = { $regex : new RegExp(".*" + obj.Value + ".*", "i") };
                     }
                     if (obj.Type === 'Select') {
                        FindQuery[obj.DBName] = obj.Value;
                     }
                     if (obj.Type === 'Date') {
                        if (FindQuery[obj.DBName] === undefined) {
                           FindQuery[obj.DBName] = obj.Option === 'LTE' ? {$lt:new Date(new Date(obj.Value).setDate(new Date(obj.Value).getDate() + 1))} : obj.Option === 'GTE' ? {$gte: new Date(obj.Value)} : new Date(obj.Value);
                        } else {
                           const DBName = obj.DBName;
                           const AndQuery = obj.Option === 'LTE' ? {$lt:new Date(new Date(obj.Value).setDate(new Date(obj.Value).getDate() + 1))} : obj.Option === 'GTE' ? {$gte: new Date(obj.Value)} :new Date(obj.Value);
                           FindQuery['$and'] = [{[DBName]: FindQuery[obj.DBName] }, {[DBName]: AndQuery}];
                        }
                     }
                     if (obj.Type === 'Object') {
                        FindQuery[obj.DBName] = mongoose.Types.ObjectId(obj.Value._id);
                     }
                  });
               }
               Promise.all([
                  BPLPatientsModel.BPLPatientsSchema
                  .aggregate([
                     { $match: FindQuery},
                     { $lookup: {
                        from: "Stemi_Hospital_Management",
                        let: { "hospital": "$Hospital"},
                        pipeline: [
                           { $match: { $expr: { $eq: ["$$hospital", "$_id"] } } },
                           { $project: { "Hospital_Name": 1, "Hospital_Code": 1, "Hospital_Role": 1 }}
                        ],
                        as: 'Initiated_Hospital' }
                     },
                     { $unwind: { path: "$Initiated_Hospital",  preserveNullAndEmptyArrays: true } },
                     // {
                     //    $lookup:{
                     //          from: "Stemi_User", 
                     //          let: { "user": "$User"},
                     //          pipeline: [
                     //             { $match: { $expr: { $eq: ["$$user", "$_id"] } } },
                     //             { $project: { "Name": 1, "User_Type": 1, }}
                     //          ],
                     //          as: 'UserInfo'
                     //    }
                     // },
                     // { $unwind: { path: "$UserInfo",  preserveNullAndEmptyArrays: true } },
                     { $addFields: { Initiated_Hospital: { $ifNull: [ "$Initiated_Hospital", null ] }  } },
                     { $addFields: { HospitalSort: { $ifNull: [ "$Initiated_Hospital.Hospital_Name", null ] }  } },
                     { $addFields: { PatientNameSort: { $ifNull: [ "$Patient_Name", null ] }  } },
                     { $addFields: { HospitalSort: { $toLower: "$HospitalSort" } } },
                     { $addFields: { PatientNameSort: { $toLower: "$PatientNameSort" } } },
                     { $addFields: { Patient_Age: {$cond: { if: { $eq: ["$Patient_Age", ''] },  then: '0', else: "$Patient_Age" }}} },
                     { $project: { Patient_Id: 1, Patient_Name: 1, PatientNameSort: 1, Patient_Age:1, Patient_Gender: 1, Patient_Height: 1, Patient_Weight: 1, Patient_BP: 1, Initiated_Hospital: 1,
                                    Hospital: 1, HospitalSort: 1, User: 1, ECG_Taken_date_time: 1, ECG_Report: 1, createdAt: 1 } },
                     { $sort : ShortOrder },
                     { $skip : Skip_Count },
                     { $limit : Limit_Count }
                  ]).exec(),
                  BPLPatientsModel.BPLPatientsSchema.countDocuments(FindQuery).exec()
               ]).then(result => {
                  res.status(200).send({Status: true, Response: result[0], SubResponse: result[1] });
               }).catch(err => {
                  res.status(417).send({Status: false, ErrorCode: 417, ErrorMessage: "Some error occurred while Find The Patients list!."});
               });
            });
         }
      });
   }
};


// PU User Advanced Cluster Cardiac Based BPL Patients List
exports.AdvancedCluster_BPLPatients_List = function(req, res) {
   var ReceivingData = req.body;
   if (!ReceivingData.User || ReceivingData.User === '') {
      res.status(400).send({ Status: false, Message: "User Details is Required!" });
   } else if (!ReceivingData.Cluster || typeof ReceivingData.Cluster !== 'object' || ReceivingData.Cluster === null ) { 
      res.status(400).send({ Status: false, Message: "Cluster Detail not valid!" });
   } else {
      var ClusterId = mongoose.Types.ObjectId(ReceivingData.Cluster._id);
      StemiClusterModel.ClusterMappingSchema.find( {'Cluster': ClusterId }, {}, {})
      .exec(function(err, result) {
         if(err) {
            res.status(417).send({status: false, Message: "Some error occurred while Find The Cluster Details!.", Error: err });
         } else {
            const HospitalResult = result.map(obj => obj.ClusterHospital);
            const HospitalArr = HospitalResult.filter((element, index, thisArg) => thisArg.indexOf(element) === index);

            const Skip_Count = parseInt(ReceivingData.Skip_Count, 0) || 0;
            const Limit_Count = parseInt(ReceivingData.Limit_Count, 0) || 5;
         
            var ShortOrder = {createdAt: -1};
            var ShortKey = ReceivingData.ShortKey;
            var ShortCondition = ReceivingData.ShortCondition;
            if ( ShortKey && ShortKey !== null && ShortKey !== '' && ShortCondition && ShortCondition !== null && ShortCondition !== ''){           
               ShortOrder = {};
               ShortOrder[ShortKey] = ShortCondition === 'Ascending' ? 1 : -1 ;
            }

            var FindQuery = {'If_Deleted': false, 'Hospital': { $in: HospitalArr }, 'Patient_Status': 'Pending' };
                                  
            if (ReceivingData.FilterQuery && typeof ReceivingData.FilterQuery === 'object' && ReceivingData.FilterQuery !== null && ReceivingData.FilterQuery.length > 0) {
               ReceivingData.FilterQuery.map(obj => {
                  if (obj.Type === 'String') {
                     FindQuery[obj.DBName] = { $regex : new RegExp(".*" + obj.Value + ".*", "i") };
                  }
                  if (obj.Type === 'Select') {
                     FindQuery[obj.DBName] = obj.Value;
                  }
                  if (obj.Type === 'Date') {
                     if (FindQuery[obj.DBName] === undefined) {
                        FindQuery[obj.DBName] = obj.Option === 'LTE' ? {$lt:new Date(new Date(obj.Value).setDate(new Date(obj.Value).getDate() + 1))} : obj.Option === 'GTE' ? {$gte: new Date(obj.Value)} : new Date(obj.Value);
                     } else {
                        const DBName = obj.DBName;
                        const AndQuery = obj.Option === 'LTE' ? {$lt:new Date(new Date(obj.Value).setDate(new Date(obj.Value).getDate() + 1))} : obj.Option === 'GTE' ? {$gte: new Date(obj.Value)} :new Date(obj.Value);
                        FindQuery['$and'] = [{[DBName]: FindQuery[obj.DBName] }, {[DBName]: AndQuery}];
                     }
                  }
                  if (obj.Type === 'Object') {
                     FindQuery[obj.DBName] = mongoose.Types.ObjectId(obj.Value._id);
                  }
               });
            } 

            Promise.all([
               BPLPatientsModel.BPLPatientsSchema
               .aggregate([
                  { $match: FindQuery},
                  { $lookup: {
                     from: "Stemi_Hospital_Management",
                     let: { "hospital": "$Hospital"},
                     pipeline: [
                        { $match: { $expr: { $eq: ["$$hospital", "$_id"] } } },
                        { $project: { "Hospital_Name": 1, "Hospital_Code": 1, "Hospital_Role": 1 }}
                     ],
                     as: 'Initiated_Hospital' }
                  },
                  { $unwind: { path: "$Initiated_Hospital",  preserveNullAndEmptyArrays: true } },
                  // {
                  //    $lookup:{
                  //          from: "Stemi_User", 
                  //          let: { "user": "$User"},
                  //          pipeline: [
                  //             { $match: { $expr: { $eq: ["$$user", "$_id"] } } },
                  //             { $project: { "Name": 1, "User_Type": 1, }}
                  //          ],
                  //          as: 'UserInfo'
                  //    }
                  // },
                  // { $unwind: { path: "$UserInfo",  preserveNullAndEmptyArrays: true } },
                  { $addFields: { Initiated_Hospital: { $ifNull: [ "$Initiated_Hospital", null ] }  } },
                  { $addFields: { HospitalSort: { $ifNull: [ "$Initiated_Hospital.Hospital_Name", null ] }  } },
                  { $addFields: { PatientNameSort: { $ifNull: [ "$Patient_Name", null ] }  } },
                  { $addFields: { HospitalSort: { $toLower: "$HospitalSort" } } },
                  { $addFields: { PatientNameSort: { $toLower: "$PatientNameSort" } } },
                  { $addFields: { Patient_Age: {$cond: { if: { $eq: ["$Patient_Age", ''] },  then: '0', else: "$Patient_Age" }}} },
                  { $project: { Patient_Id: 1, Patient_Name: 1, PatientNameSort: 1, Patient_Age:1, Patient_Gender: 1, Patient_Height: 1, Patient_Weight: 1, Patient_BP: 1, Initiated_Hospital: 1,
                                 Hospital: 1, HospitalSort: 1, User: 1, ECG_Taken_date_time: 1, ECG_Report: 1, createdAt: 1 } },
                  { $sort : ShortOrder },
                  { $skip : Skip_Count },
                  { $limit : Limit_Count }
               ]).exec(),
               BPLPatientsModel.BPLPatientsSchema.countDocuments(FindQuery).exec()
            ]).then(result => {
               res.status(200).send({Status: true, Response: result[0], SubResponse: result[1] });
            }).catch(err => {
               res.status(417).send({Status: false, ErrorCode: 417, ErrorMessage: "Some error occurred while Find The Patients list!."});
            });
         }
      });
   }
};


// PU User Hospital Based BPL Patients List
exports.HospitalBased_BPLPatients_List = function(req, res) {
   var ReceivingData = req.body;

   if (!ReceivingData.User || ReceivingData.User === '') {
      res.status(400).send({ Status: false, Message: "User Details is Required!" });
   } else if (!ReceivingData.Hospital || typeof ReceivingData.Hospital !== 'object' || ReceivingData.Hospital._id === undefined) {
      res.status(400).send({ Status: false, Message: "Hospital Details Not proper!" });
   } else {
      const Skip_Count = parseInt(ReceivingData.Skip_Count, 0) || 0;
      const Limit_Count = parseInt(ReceivingData.Limit_Count, 0) || 5;

      var ShortOrder = {createdAt: -1};
      var ShortKey = ReceivingData.ShortKey;
      var ShortCondition = ReceivingData.ShortCondition;
      if ( ShortKey && ShortKey !== null && ShortKey !== '' && ShortCondition && ShortCondition !== null && ShortCondition !== ''){           
         ShortOrder = {};
         ShortOrder[ShortKey] = ShortCondition === 'Ascending' ? 1 : -1 ;
      }
      ReceivingData.Hospital = mongoose.Types.ObjectId(ReceivingData.Hospital._id);
      
      var FindQuery = {'If_Deleted': false, 'Hospital': ReceivingData.Hospital, 'Patient_Status': 'Pending' };

      if (ReceivingData.FilterQuery && typeof ReceivingData.FilterQuery === 'object' && ReceivingData.FilterQuery !== null && ReceivingData.FilterQuery.length > 0) {
         ReceivingData.FilterQuery.map(obj => {
            if (obj.Type === 'String') {
               FindQuery[obj.DBName] = { $regex : new RegExp(".*" + obj.Value + ".*", "i") };
            }
            if (obj.Type === 'Select') {
               FindQuery[obj.DBName] = obj.Value;
            }
            if (obj.Type === 'Date') {
               if (FindQuery[obj.DBName] === undefined) {
                  FindQuery[obj.DBName] = obj.Option === 'LTE' ? {$lt:new Date(new Date(obj.Value).setDate(new Date(obj.Value).getDate() + 1))} : obj.Option === 'GTE' ? {$gte: new Date(obj.Value)} : new Date(obj.Value);
               } else {
                  const DBName = obj.DBName;
                  const AndQuery = obj.Option === 'LTE' ? {$lt:new Date(new Date(obj.Value).setDate(new Date(obj.Value).getDate() + 1))} : obj.Option === 'GTE' ? {$gte: new Date(obj.Value)} :new Date(obj.Value);
                  FindQuery['$and'] = [{[DBName]: FindQuery[obj.DBName] }, {[DBName]: AndQuery}];
               }
            }
            if (obj.Type === 'Object') {
               FindQuery[obj.DBName] = mongoose.Types.ObjectId(obj.Value._id);
            }
         });
      }
   
      Promise.all([
         BPLPatientsModel.BPLPatientsSchema
         .aggregate([
            { $match: FindQuery},
            { $lookup: {
               from: "Stemi_Hospital_Management",
               let: { "hospital": "$Hospital"},
               pipeline: [
                  { $match: { $expr: { $eq: ["$$hospital", "$_id"] } } },
                  { $project: { "Hospital_Name": 1, "Hospital_Code": 1, "Hospital_Role": 1 }}
               ],
               as: 'Initiated_Hospital' }
            },
            { $unwind: { path: "$Initiated_Hospital",  preserveNullAndEmptyArrays: true } },
            // {
            //    $lookup:{
            //          from: "Stemi_User", 
            //          let: { "user": "$User"},
            //          pipeline: [
            //             { $match: { $expr: { $eq: ["$$user", "$_id"] } } },
            //             { $project: { "Name": 1, "User_Type": 1, }}
            //          ],
            //          as: 'UserInfo'
            //    }
            // },
            // { $unwind: { path: "$UserInfo",  preserveNullAndEmptyArrays: true } },
            { $addFields: { Initiated_Hospital: { $ifNull: [ "$Initiated_Hospital", null ] }  } },
            { $addFields: { HospitalSort: { $ifNull: [ "$Initiated_Hospital.Hospital_Name", null ] }  } },
            { $addFields: { PatientNameSort: { $ifNull: [ "$Patient_Name", null ] }  } },
            { $addFields: { HospitalSort: { $toLower: "$HospitalSort" } } },
            { $addFields: { PatientNameSort: { $toLower: "$PatientNameSort" } } },
            { $addFields: { Patient_Age: {$cond: { if: { $eq: ["$Patient_Age", ''] },  then: '0', else: "$Patient_Age" }}} },
            { $project: { Patient_Id: 1, Patient_Name: 1, PatientNameSort: 1, Patient_Age:1, Patient_Gender: 1, Patient_Height: 1, Patient_Weight: 1, Patient_BP: 1, Initiated_Hospital: 1,
                           Hospital: 1, HospitalSort: 1, User: 1, ECG_Taken_date_time: 1, ECG_Report: 1, createdAt: 1 } },
            { $sort : ShortOrder },
            { $skip : Skip_Count },
            { $limit : Limit_Count }
         ]).exec(),
         BPLPatientsModel.BPLPatientsSchema.countDocuments(FindQuery).exec()
      ]).then(result => {
         res.status(200).send({Status: true, Response: result[0], SubResponse: result[1] });
      }).catch(err => {
         res.status(417).send({Status: false, ErrorCode: 417, ErrorMessage: "Some error occurred while Find The Patients list!."});
      });
   }
};


// BPL Patient Ask Cardiologist
exports.BPLPatient_AskCardiologist = function (req, res) {
   var ReceivingData = req.body;
   
   if (!ReceivingData.User || ReceivingData.User === '') {
      res.status(400).send({ Status: false, Message: "User Details can not be empty" });
   } else if (!ReceivingData.BplId || ReceivingData.BplId === '') {
      res.status(400).send({ Status: false, Message: "BPL Details can not be empty" });
   } else {
      ReceivingData.User = mongoose.Types.ObjectId(ReceivingData.User);
      ReceivingData.BplId = mongoose.Types.ObjectId(ReceivingData.BplId);

      BPLPatientsModel.BPLPatientsSchema.findOne({_id: ReceivingData.BplId}).exec( (error, result) => {
         if (error) {
            res.status(417).send({ Status: false, Message: "Some error occurred while find the BPL Patient!.", Error: error });
         } else {
            if (result !== null) {
               var Risk_Factors = [{
                  Diabetes: ReceivingData.Diabetes,
                  Hypertension: ReceivingData.Hypertension,
                  Smoker: ReceivingData.Smoker,
                  High_Cholesterol: ReceivingData.High_Cholesterol,
                  Previous_History_of_IHD: ReceivingData.Previous_History_of_IHD,
                  Family_History_of_IHD: ReceivingData.Family_History_of_IHD
               }];
               if (typeof ReceivingData.Location_of_Pain === 'object') {
                  ReceivingData.Location_of_Pain = ReceivingData.Location_of_Pain.join(',');
               }
               const Create_PatientBasicDetails = new PatientDetailsModel.PatientBasicDetailsSchema({
                  Patient_Name: result.Patient_Name || '',
                  Patient_Age: result.Patient_Age || null,
                  Patient_Gender: result.Patient_Gender || '',
                  Admission_Type: 'Direct',
                  User: result.User,
                  Confirmed_UserType: '',
                  Confirmed_By: null,
                  Risk_Factors: Risk_Factors || [],
                  Confirmed_ECG: '',
                  ECGFile_Array: [],
                  Current_ECG_File: result.ECG_File || '',
                  Stemi_Status: 'Stemi_Ask_Cardiologist',
                  'Symptoms.Chest_Discomfort': ReceivingData.Chest_Discomfort || '',
                  'Symptoms.Duration_of_Pain': null,
                  'Symptoms.Location_of_Pain': ReceivingData.Location_of_Pain || '',
                  ECG_Taken_date_time: result.ECG_Taken_date_time || null,
                  Hospital: result.Hospital || null,
                  EntryFrom: 'BPL',
                  BPL_Height: result.Patient_Height,
                  BPL_Weight: result.Patient_Weight,
                  BPL_BP: result.Patient_BP,
                  FirstAskTime: new Date(),
                  FirstRepailedTime: null,
                  Active_Status: true,
                  If_Deleted: false
               });

               Create_PatientBasicDetails.save(function (err, resultNew) {
                  if (err) {
                     res.status(417).send({ Status: false, Message: "Some error occurred while Creating the New Patient!.", Error: err });
                  } else {
                     // Notification System
                     Promise.all([
                        HospitalManagementModel.HospitalManagementSchema.findOne({ _id: result.Hospital }, { Connected_Clusters: 1, Cardiologist_Array: 1 }, {}).exec(),
                        StemiUserModel.UserManagementSchema.find({ User_Type: 'D', HospitalsArray: result.Hospital }, {}, {}).exec(),
                        BPLPatientsModel.BPLPatientsSchema.updateOne({_id: ReceivingData.BplId}, {$set: {Patient_Status: 'Stemi_Ask_Cardiologist', Active_Status: false}}).exec()
                     ]).then(response => {
                        const HosDetails = response[0];
                        const Doctors = response[1];
                        const Clusters = HosDetails.Connected_Clusters;
                        var NotifyToUsers = [];
                        var NotifyToMobUser = [];              
                        Doctors.map(obj => NotifyToUsers.push(obj._id));
                        HosDetails.Cardiologist_Array.map(objMob => {
                           if (objMob.Cardiologist_Preferred_Contact === true) {
                              NotifyToMobUser.push(objMob.Cardiologist_Phone);
                           }
                        });
                        Promise.all(
                           Clusters.map(obj => {
                              return StemiUserModel.UserManagementSchema.find({ User_Type: 'CDA', ClustersArray: obj }, {}, {}).exec();
                           })
                        ).then(responseOne => {
                           var ClusterDoctors = [];
                           responseOne.map(obj => obj.map(objNew => ClusterDoctors.push(objNew)));
                           ClusterDoctors = Array.from(new Set(ClusterDoctors.map(JSON.stringify))).map(JSON.parse);                  
                           // responseOne.map(obj => {
                           //    obj.map(objNew => {
                           //       NotifyToUsers.push(objNew._id);
                           //    });
                           // });
                           NotifyToUsers = NotifyToUsers.filter((obj, index) => NotifyToUsers.indexOf(obj) === index);
                           //  FCM Push Notification
                           StemiAppUserModel.LoginHistorySchema.find({ User: { $in: NotifyToUsers }, Active_Status: true, If_Deleted: false }).exec((err_1, result_1) => {
                              if (!err_1) {
                                 var AppUsers_FCMTokens = [];
                                 var TabUsers_FCMTokens = [];
                                 result_1.map(obj => {
                                    if ((obj.Device_Type === 'Android' || obj.Device_Type === 'IOS') && obj.Firebase_Token !== '') {
                                       AppUsers_FCMTokens.push(obj.Firebase_Token);
                                    } else if (obj.Device_Type === 'TAB' && obj.Firebase_Token !== '') {
                                       TabUsers_FCMTokens.push(obj.Firebase_Token);
                                    }
                                 });
                                 AppUsers_FCMTokens = AppUsers_FCMTokens.filter((obj, index) => AppUsers_FCMTokens.indexOf(obj) === index);
                                 TabUsers_FCMTokens = TabUsers_FCMTokens.filter((obj, index) => TabUsers_FCMTokens.indexOf(obj) === index);
                                 resultNew = JSON.parse(JSON.stringify(resultNew));
                                 resultNew.Patient_Gender  = resultNew.Patient_Gender === 'Male_to_Female' ? 'Male to Female' : resultNew.Patient_Gender === 'Female_to_Male' ? 'Female to Male' : resultNew.Patient_Gender;
                                 var payload = {
                                    notification: {
                                       title: 'Identify STEMI',
                                       body: 'Request to identify STEMI for Patient: ' + resultNew.Patient_Name + ', Age: ' + resultNew.Patient_Age + ', Gender: ' + resultNew.Patient_Gender,
                                       sound: 'notify_tone.mp3'
                                    },
                                    data: {
                                       patient: resultNew._id,
                                       notification_type: 'Stemi_Ask_Cardiologist_ByUser',
                                       click_action: 'FCM_PLUGIN_ACTIVITY',
                                    }
                                 };
                                 if (AppUsers_FCMTokens.length > 0) {
                                    FCM_App.messaging().sendToDevice(AppUsers_FCMTokens, payload, options).then((NotifyRes) => { });
                                 }
                                 if (TabUsers_FCMTokens.length > 0) {
                                    FCM_Tab.messaging().sendToDevice(TabUsers_FCMTokens, payload, options).then((NotifyRes) => { });
                                 }
                                 // Schedule Create
                                 // DoctorNotifySchedule(ClusterDoctors, payload, resultNew);

                                 var numbers = NotifyToMobUser;
                                 if (numbers.length > 0) {
                                    var Msg = 'Request to identify STEMI for Patient: ' + resultNew.Patient_Name + ', Age: ' + resultNew.Patient_Age + ', Gender: ' + resultNew.Patient_Gender;
                                    axios({   method: 'post',   url: 'http://bulksmsservice.co.in/httpapi/v1/sendsms?api-token=9)2_6eh0s,v3(*4.1alzcgjp8uxnotkdy7ibqr5f&numbers=' + numbers + '&route=2&message=' + Msg + '&sender=STEMIN', }).
                                    then( (response) => { });
                                 }

                                 // Cluster Doctor Schedule Create
                                 ClusterDoctors.map(obj => {
                                    const Duration = obj.Alert_Duration !== undefined && !isNaN(obj.Alert_Duration) && obj.Alert_Duration > 0 ? (obj.Alert_Duration * 60000) : 300000;
                                    var scheduleTime = new Date(Date.now() + Duration);
                                    const S = Schedule.scheduleJob(scheduleTime, function(time) {
                                       PatientDetailsModel.PatientBasicDetailsSchema
                                       .findOne({_id: resultNew._id, $or: [ {Stemi_Status: 'Stemi_Ask_Cardiologist'}, { Stemi_Status: 'Retake_ECG' } ] })
                                       .exec( (err123, result123) => {
                                          if (!err123 && result123 !== null) {
                                             StemiAppUserModel.LoginHistorySchema
                                             .find({ User: obj._id, Active_Status: true, If_Deleted: false })
                                             .exec((err132, result_132) => {
                                                if (!err132 && result_132.length > 0) {
                                                   var AppUsers_FCMTokens = [];
                                                   var TabUsers_FCMTokens = [];
                                                   result_132.map(obj_1 => {
                                                      if ((obj_1.Device_Type === 'Android' || obj_1.Device_Type === 'IOS') && obj_1.Firebase_Token !== '') {
                                                         AppUsers_FCMTokens.push(obj_1.Firebase_Token);
                                                      } else if (obj_1.Device_Type === 'TAB' && obj_1.Firebase_Token !== '') {
                                                         TabUsers_FCMTokens.push(obj_1.Firebase_Token);
                                                      }
                                                   });
                                                   AppUsers_FCMTokens = AppUsers_FCMTokens.filter((obj_1, index) => AppUsers_FCMTokens.indexOf(obj_1) === index);
                                                   TabUsers_FCMTokens = TabUsers_FCMTokens.filter((obj_1, index) => TabUsers_FCMTokens.indexOf(obj_1) === index);
                                                   if (AppUsers_FCMTokens.length > 0) {
                                                      FCM_App.messaging().sendToDevice(AppUsers_FCMTokens, payload, options).then((NotifyRes) => { });
                                                   }
                                                   if (TabUsers_FCMTokens.length > 0) {
                                                      FCM_Tab.messaging().sendToDevice(TabUsers_FCMTokens, payload, options).then((NotifyRes) => { });
                                                   }
                                                   var numbers_1 = [];
                                                   numbers_1.push(obj.Phone);
                                                   if (numbers_1.length > 0) {
                                                      var Msg_1 = 'Identify STEMI for Patient: ' + resultNew.Patient_Name + ', Age: ' + resultNew.Patient_Age + ', Gender: ' + resultNew.Patient_Gender;
                                                      axios({ method: 'post', url: 'http://bulksmsservice.co.in/httpapi/v1/sendsms?api-token=9)2_6eh0s,v3(*4.1alzcgjp8uxnotkdy7ibqr5f&numbers=' + numbers_1 + '&route=2&message=' + Msg_1 + '&sender=STEMIN', }).
                                                      then( (response_3) =>{ });
                                                   }
                                                   const Notification = new NotificationModel.NotificationSchema({
                                                      User_ID: mongoose.Types.ObjectId(obj._id),
                                                      Patient_ID: resultNew._id,
                                                      Confirmed_PatientId: null,
                                                      Notification_Type: 'Stemi_Ask_Cardiologist_ByUser',
                                                      Message: 'Request to identify STEMI for Patient: ' + resultNew.Patient_Name + ', Age: ' + resultNew.Patient_Age + ', Gender: ' + resultNew.Patient_Gender,
                                                      Message_Received: false,
                                                      Message_Viewed: true,
                                                      Active_Status: true,
                                                      If_Deleted: false
                                                   });
                                                   Notification.save();
                                                }
                                             });
                                          }
                                       });
                                    });
                                 });

                              }
                           });
                           NotifyToUsers.map(obj => {
                              const Notification = new NotificationModel.NotificationSchema({
                                 User_ID: mongoose.Types.ObjectId(obj),
                                 Patient_ID: resultNew._id,
                                 Notification_Type: 'Stemi_Ask_Cardiologist_ByUser',
                                 Message: 'Request to identify STEMI for Patient: ' + resultNew.Patient_Name + ', Age: ' + resultNew.Patient_Age + ', Gender: ' + resultNew.Patient_Gender,
                                 Message_Received: false,
                                 Message_Viewed: false,
                                 Active_Status: true,
                                 If_Deleted: false
                              });
                              Notification.save();
                           });
                        }).catch(errorOne => {
                           // console.log(errorOne);
                           console.log('Some Error Occured!');
                        });
                     }).catch(error => {
                        // console.log(error);
                        console.log('Some Error Occured!');
                     });
                     res.status(200).send({ Status: true, Message: 'Patient Details Sent to Cardiologist' });
                  }
               });
            } else {
               res.status(417).send({ Status: false, Message: "Invalid BPL Patient!" });
            }
         }
      });
   }
};


// BPL Patient Stemi Confirm ---------------------------------------------
exports.BPLPatient_StemiConfirm = function (req, res) {
   var ReceivingData = req.body;  
   if (!ReceivingData.User || ReceivingData.User === '') {
      res.status(400).send({ Status: false, Message: "User Details can not be empty" });
   } else if (!ReceivingData.BplId || ReceivingData.BplId === '') {
      res.status(400).send({ Status: false, Message: "BPL Details can not be empty" });
   } else {
      ReceivingData.BplId = mongoose.Types.ObjectId(ReceivingData.BplId);
      BPLPatientsModel.BPLPatientsSchema.findOne({_id: ReceivingData.BplId}).exec( (error, result) => {
         if (error) {
            res.status(417).send({ Status: false, Message: "Some error occurred while find the BPL Patient!.", Error: error });
         } else {
            if (result !== null) {
               var Risk_Factors = [{
                  Diabetes: ReceivingData.Diabetes,
                  Hypertension: ReceivingData.Hypertension,
                  Smoker: ReceivingData.Smoker,
                  High_Cholesterol: ReceivingData.High_Cholesterol,
                  Previous_History_of_IHD: ReceivingData.Previous_History_of_IHD,
                  Family_History_of_IHD: ReceivingData.Family_History_of_IHD
               }];
               var Date_Time = result.ECG_Taken_date_time;              
               var ECG_Arr = [{
                  "Name": Date_Time.valueOf() + '-' + 'BPL',
                  "ECG_File": result.ECG_File,
                  "DateTime":Date_Time
               }];
               if (typeof ReceivingData.Location_of_Pain === 'object') {
                  ReceivingData.Location_of_Pain = ReceivingData.Location_of_Pain.join(',');
               }
               const Create_PatientBasicDetails = new PatientDetailsModel.PatientBasicDetailsSchema({
                  Patient_Name: result.Patient_Name || '',
                  Patient_Age: result.Patient_Age || null,
                  Patient_Gender: result.Patient_Gender || '',
                  Admission_Type: 'Direct',
                  User: result.User || '',
                  Confirmed_UserType: 'Peripheral User',
                  Confirmed_By: mongoose.Types.ObjectId(ReceivingData.User) || '',
                  Risk_Factors: Risk_Factors || [],
                  Confirmed_ECG: result.ECG_File || '',
                  ECGFile_Array: ECG_Arr,
                  Current_ECG_File: ReceivingData.ECG_File || '',
                  Stemi_Status: 'Stemi_Confirmed',
                  'Symptoms.Chest_Discomfort': ReceivingData.Chest_Discomfort || '',
                  'Symptoms.Duration_of_Pain': null,
                  'Symptoms.Location_of_Pain': ReceivingData.Location_of_Pain || '',
                  ECG_Taken_date_time: Date_Time || null,
                  QR_image: '',
                  Hospital: result.Hospital,
                  EntryFrom: 'BPL',
                  BPL_Height: result.Patient_Height,
                  BPL_Weight: result.Patient_Weight,
                  BPL_BP: result.Patient_BP,
                  Active_Status: true,
                  If_Deleted: false
               });
               
               Create_PatientBasicDetails.save(function (err, resultNew) {
                  if (err) {
                     res.status(417).send({ Status: false, Message: "Some error occurred while Creating the New Patient!.", Error: err });
                  } else {                     
                     // Notification System
                     Promise.all([
                        HospitalManagementModel.HospitalManagementSchema.findOne({ _id: result.Hospital }, { Connected_Clusters: 1, Hospital_Code: 1, Cardiologist_Array: 1 }, {}).exec(),
                        StemiUserModel.UserManagementSchema.find({ User_Type: 'D', HospitalsArray: result.Hospital }, {}, {}).exec(),
                        StemiUserModel.UserManagementSchema.findOne({ _id: result.User }, {}, {}).populate({ path: 'Cluster' }).populate({ path: 'Location' }).exec(),
                     ]).then(response => {
                        const HosDetails = response[0];
                        const Doctors = response[1];
                        const ClustersDetails = response[2];

                        var NotifyToUsers = [];
                        var NotifyToMobUser = [];

                        Doctors.map(obj => { NotifyToUsers.push(obj._id); NotifyToMobUser.push(obj.Phone); });
                        NotifyToUsers = NotifyToUsers.filter((obj, index) => NotifyToUsers.indexOf(obj) === index);

                        var Taken_Type;
                        if (resultNew.EntryFrom === "TAB") {
                           Taken_Type = 'Systemic';
                        } else {
                           Taken_Type = 'Manual';
                        }
                        WebPatientDetailsModel.PatientBasicDetailsSchema.findOne({}, {}, { 'sort': { createdAt: -1 } }, function (errNew, resultNEW) {
                           if (errNew) {
                              res.status(417).send({ Status: false, Message: "Some error occurred while STEMI Confirm the Patient!.", Error: errNew });
                           } else {
                              var LastPatientCode = resultNEW !== null ? (resultNEW.Patient_Code + 1) : 1;
                              var Patient_Code = (LastPatientCode.toString()).padStart(4, 0);
                              var Location_Code = (ClustersDetails.Location.Location_Code).toString().padStart(2, 0);
                              var Cluster_Code = (ClustersDetails.Cluster.Cluster_Code).toString().padStart(2, 0);
                              var Hospital_Code = (HosDetails.Hospital_Code).toString().padStart(3, 0);
                              var Patient_Unique = Location_Code + Cluster_Code + Hospital_Code + Patient_Code;
                              var Patient_Unique_Identity = Location_Code + '-' + Cluster_Code + '-' + Hospital_Code + '-' + Patient_Code;
                              var NonCluster = resultNew.Admission_Type === "Non_Cluster" ? true : false;
                              var Temp_Patient_Unique = Patient_Unique_Identity;

                              const NewDbId = mongoose.Types.ObjectId();
                              var Data_Type = 'Pre';
                              if (ClustersDetails.Cluster.Data_Type) {
                                 Data_Type = ClustersDetails.Cluster.Data_Type;
                              }
                              var QRid = NewDbId.toString() + '-Stemi';
                              QRCode.toDataURL(QRid, function (err_4, url) {
                                 if (err_4) {
                                    res.status(417).send({ Status: false, Message: "Some error occurred while STEMI Confirm the Patient!.", Error: err_4 });
                                 } else {
                                    var QrFile = url;
                                    const BP_Systolic = result.Patient_BP.split('/').length > 1 ? result.Patient_BP.split('/')[0] : '';
                                    const BP_Diastolic = result.Patient_BP.split('/').length > 1 ? result.Patient_BP.split('/')[1] : '';
                                    const Create_WebPatientBasicDetails = new WebPatientDetailsModel.PatientBasicDetailsSchema({
                                       _id: NewDbId,
                                       Patient_Code: Patient_Code || 1,
                                       Patient_Unique: Patient_Unique || '00000000000',
                                       Patient_Unique_Identity: Patient_Unique_Identity,
                                       Temp_Patient_Unique: Temp_Patient_Unique,
                                       Patient_Name: resultNew.Patient_Name || '',
                                       Patient_Age: resultNew.Patient_Age || null,
                                       Patient_Gender: resultNew.Patient_Gender || '',
                                       Hospital_Id: result.Patient_Id,
                                       Hospital_History: [{
                                          Hospital_Count: 1,
                                          Hospital: mongoose.Types.ObjectId(resultNew.Hospital) || null,
                                          Handled_User: mongoose.Types.ObjectId(resultNew.User) || null,
                                          Patient_Admission_Type: resultNew.Admission_Type || 'Direct',
                                          Hospital_Arrival_Date_Time: null
                                       }],
                                       Transport_History: [{
                                          Transport_Count: 1,
                                          Transport_From_Hospital: null,
                                          Transport_To_Hospital: mongoose.Types.ObjectId(resultNew.Hospital),
                                          TransportMode: null,
                                          ClusterAmbulance: null,
                                          Ambulance_Call_Date_Time: null,
                                          Ambulance_Arrival_Date_Time: null,
                                          Ambulance_Departure_Date_Time: null,
                                       }],
                                       Location_of_Infarction: [{
                                          Anterior_Wall_MI: null,
                                          Inferior_Wall_MI: null,
                                          Lateral_Wall_MI: null,
                                          Posterior_Wall_MI: null,
                                          RV_Infarction: null
                                       }],
                                       Clinical_Examination_History: [{
                                          Hospital: mongoose.Types.ObjectId(resultNew.Hospital) || null,
                                          Patient_Height: result.Patient_Height,
                                          Patient_Weight: result.Patient_Weight,
                                          BMI: '',
                                          BP_Systolic: BP_Systolic,
                                          BP_Diastolic: BP_Diastolic,
                                          Heart_Rate: '',
                                          SP_O2: '',
                                          Abdominal_Girth: '',
                                          Kilip_Class: null
                                       }],
                                       Post_Thrombolysis: "",
                                       "Post_Thrombolysis_Data.Thrombolytic_Agent": "",
                                       "Post_Thrombolysis_Data.Dosage": "",
                                       "Post_Thrombolysis_Data.Dosage_Units": "",
                                       "Post_Thrombolysis_Data.Post_Thrombolysis_Start_Date_Time": null,
                                       "Post_Thrombolysis_Data.Post_Thrombolysis_End_Date_Time": null,
                                       "Post_Thrombolysis_Data.Ninety_Min_ECG": "",
                                       "Post_Thrombolysis_Data.Ninety_Min_ECG_Date_Time": null,
                                       "Post_Thrombolysis_Data.Successful_Lysis": "",
													"Post_Thrombolysis_Data.MissedSTEMI": "",
                                       "Post_Thrombolysis_Data.Autoreperfused": "",
                                       "Post_Thrombolysis_Data.Others": "",

                                       Patient_Payment: '',
                                       Symptom_Onset_Date_Time: null,
                                       Initiated_Hospital: mongoose.Types.ObjectId(resultNew.Hospital) || null,
                                       Initiated_Hospital_Arrival: null,
                                       EMS_Ambulance_Call_Date_Time: null,
                                       EMS_Ambulance_Departure_Date_Time: null,
                                       If_NonCluster: NonCluster || false,
                                       NonCluster_Hospital_Name: '',
                                       NonCluster_Hospital_Address: '',
                                       NonCluster_Hospital_Arrival_Date_Time: null,
                                       ECG_File: resultNew.Confirmed_ECG || '',
                                       App_ECG_Files: resultNew.ECGFile_Array,
                                       ECG_Taken_date_time: resultNew.ECG_Taken_date_time || null,
                                       Stemi_Confirmed: 'Yes',
                                       QR_image: QrFile,
                                       Stemi_Confirmed_Date_Time: new Date() || null,
                                       Stemi_Confirmed_Hospital: mongoose.Types.ObjectId(resultNew.Hospital) || null,
                                       Stemi_Confirmed_Type: 'Peripheral User',
                                       Stemi_Confirmed_By: mongoose.Types.ObjectId(ReceivingData.User) || null,
                                       ECG_Taken_Type: Taken_Type,
                                       Doctor_Notes: '',
                                       IfThrombolysis: null,
                                       ThrombolysisFrom: null,
                                       IfPCI: null,
                                       PCIFrom: null,
                                       IfDeath: null,
                                       IfDischarge: null,
                                       TransferBending: null,
                                       TransferBendingTo: null,
                                       Data_Type: Data_Type,
                                       Active_Status: true,
                                       If_Deleted: false,
                                       LastCompletionChild: 'Co-Morbid_Conditions'
                                    });
                                    const Create_PatientCardiacHistory = new WebPatientDetailsModel.PatientCardiacHistorySchema({
                                       PatientId: NewDbId,
                                       Hospital: resultNew.Hospital,
                                       Previous_MI: false,
                                       Previous_MI1:  '',
                                       Previous_MI1_Date: null,
                                       Previous_MI1_Details:  '',
                                       Previous_MI2:  '',
                                       Previous_MI2_Date:  null,
                                       Previous_MI2_Details:  '',
                                       Cardiac_History_Angina:  '',
                                       Cardiac_History_Angina_Duration_Years: null,
                                       Cardiac_History_Angina_Duration_Month: null,
                                       CABG:  '',
                                       CABG_Date:  null,
                                       PCI1:  '',
                                       PCI_Date:  null,
                                       PCI1_Details:  '',
                                       PCI2:  '',
                                       PCI2_Date:  null,
                                       PCI2_Details:  '',
                                       Chest_Discomfort: resultNew.Symptoms.Chest_Discomfort || '',
                                       // Duration_of_Pain_Date_Time: resultNew.Symptoms.Duration_of_Pain || null,
                                       Duration_of_Pain_Date_Time: null,
                                       Location_of_Pain: resultNew.Symptoms.Location_of_Pain || '',
                                       Pain_Severity:  '',
                                       Palpitation:  "", 
                                       Pallor:  "",
                                       Diaphoresis:  "",
                                       Shortness_of_breath:  "",
                                       Nausea_Vomiting:  "",
                                       Dizziness:  "",
                                       Syncope:  "",
                                       Active_Status: true,
                                       If_Deleted: false
                                    });
                                    const Create_PatientCoMorbidCondition = new WebPatientDetailsModel.PatientCoMorbidConditionSchema({
                                       PatientId: NewDbId,
                                       Hospital: resultNew.Hospital,
                                       Smoker: resultNew.Risk_Factors[0].Smoker || '',
                                       Beedies: false,
                                       Cigarettes:  false,
                                       Number_of_Beedies:  null,
                                       Number_of_Beedies_Duration_Years: null,
                                       Number_of_Beedies_Duration_Months: null,
                                       Number_of_Cigarettes: null,
                                       Number_of_Cigarettes_Duration_Years: null,
                                       Number_of_Cigarettes_Duration_Months: null,
                                       Previous_IHD: resultNew.Risk_Factors[0].Previous_History_of_IHD || '',
                                       Diabetes_Mellitus: resultNew.Risk_Factors[0].Diabetes || '',
                                       High_Cholesterol: resultNew.Risk_Factors[0].High_Cholesterol || '',
                                       Duration_Years: null,
                                       Duration_Months: null,
                                       OHA:  '',
                                       Insulin: '',
                                       Family_history_of_IHD: resultNew.Risk_Factors[0].Family_History_of_IHD || '',
                                       Hypertension: resultNew.Risk_Factors[0].Hypertension || '',
                                       Hypertension_Duration_Years:  null,
                                       Hypertension_Duration_Months:  null,
                                       Hypertension_Medications:  false,
                                       Hypertension_Medications_Details:  '',
                                       Dyslipidemia:  '',
                                       Dyslipidemia_Medications: false,
                                       Dyslipidemia_Medications_Details: '',
                                       Peripheral_Vascular_Disease: '',
                                       Stroke:  '',
                                       Bronchial_Asthma: '',
                                       Allergies: '',
                                       Allergy_Details: '',
                                       Active_Status: true,
                                       If_Deleted: false
                                    });

                                    Promise.all([
                                       Create_WebPatientBasicDetails.save(),
                                       Create_PatientCardiacHistory.save(),
                                       Create_PatientCoMorbidCondition.save(),
                                       BPLPatientsModel.BPLPatientsSchema.updateOne({_id: ReceivingData.BplId}, {$set: {Patient_Status: 'Stemi_Confirmed', Active_Status: false}}).exec()
                                    ]).then( response => {
                                       res.status(200).send({ Status: true, Message: 'Patient Added and Stemi Confirmed' });
                                       //  FCM Push Notification
                                       StemiAppUserModel.LoginHistorySchema.find({ User: { $in: NotifyToUsers }, Active_Status: true, If_Deleted: false }).exec((err_1, result_1) => {
                                          if (!err_1) {
                                             var AppUsers_FCMTokens = [];
                                             var TabUsers_FCMTokens = [];
                                             result_1.map(obj => {
                                                if ((obj.Device_Type === 'Android' || obj.Device_Type === 'IOS') && obj.Firebase_Token !== '') {
                                                   AppUsers_FCMTokens.push(obj.Firebase_Token);
                                                } else if (obj.Device_Type === 'TAB' && obj.Firebase_Token !== '') {
                                                   TabUsers_FCMTokens.push(obj.Firebase_Token);
                                                }
                                             });
                                             AppUsers_FCMTokens = AppUsers_FCMTokens.filter((obj, index) => AppUsers_FCMTokens.indexOf(obj) === index);
                                             TabUsers_FCMTokens = TabUsers_FCMTokens.filter((obj, index) => TabUsers_FCMTokens.indexOf(obj) === index);
                                             resultNew = JSON.parse(JSON.stringify(resultNew));
                                             resultNew.Patient_Gender  = resultNew.Patient_Gender === 'Male_to_Female' ? 'Male to Female' : resultNew.Patient_Gender === 'Female_to_Male' ? 'Female to Male' : resultNew.Patient_Gender;
                                             var payload = {
                                                notification: {
                                                   title: 'STEMI Confirm',
                                                   body: 'Confirmed STEMI for Patient: ' + resultNew.Patient_Name + ', Age: ' + resultNew.Patient_Age + ', Gender: ' + resultNew.Patient_Gender,
                                                   sound: 'notify_tone.mp3'
                                                },
                                                data: {
                                                   patient: resultNew._id,
                                                   notification_type: 'Stemi_Confirmed_ByUser',
                                                   click_action: 'FCM_PLUGIN_ACTIVITY',
                                                }
                                             };
                                             if (AppUsers_FCMTokens.length > 0) {
                                                FCM_App.messaging().sendToDevice(AppUsers_FCMTokens, payload, options).then((NotifyRes) => { });
                                             }
                                             if (TabUsers_FCMTokens.length > 0) {
                                                FCM_Tab.messaging().sendToDevice(TabUsers_FCMTokens, payload, options).then((NotifyRes) => { });
                                             }

                                             var numbers = NotifyToMobUser;
                                             if (numbers.length > 0) {
                                                var Msg = 'Confirmed STEMI for Patient: ' + resultNew.Patient_Name + ', Age: ' + resultNew.Patient_Age + ', Gender: ' + resultNew.Patient_Gender;
                                                axios({   method: 'post',   url: 'http://bulksmsservice.co.in/httpapi/v1/sendsms?api-token=9)2_6eh0s,v3(*4.1alzcgjp8uxnotkdy7ibqr5f&numbers=' + numbers + '&route=2&message=' + Msg + '&sender=STEMIN', }).
                                                then( (response) =>{ });
                                             }
                                          
                                          }
                                       });
                                       NotifyToUsers.map(obj => {
                                          const Notification = new NotificationModel.NotificationSchema({
                                             User_ID: mongoose.Types.ObjectId(obj),
                                             Patient_ID: resultNew._id,
                                             Confirmed_PatientId: NewDbId,
                                             Notification_Type: 'Stemi_Confirmed_ByUser',
                                             Message: 'Confirmed STEMI for Patient: ' + resultNew.Patient_Name + ', Age: ' + resultNew.Patient_Age + ', Gender: ' + resultNew.Patient_Gender,
                                             Message_Received: false,
                                             Message_Viewed: true,
                                             Active_Status: true,
                                             If_Deleted: false
                                          });
                                          Notification.save();
                                       });
                                    }).catch( catchErr => {
                                       res.status(417).send({ Status: false, Message: "Some error occurred while Creating the New Patient Details!.", Error: catchErr });
                                    });
                                 }
                              });
                           }
                        });
                     }).catch(error => {
                        res.status(417).send({ Status: false, Message: "Some error occurred while Creating the New Patient Details!.", Error: error });
                     });
                  }
               });
            } else {
               res.status(417).send({ Status: false, Message: "Invalid BPL Patient!" });
            }
         }
      });
   }
};


// User Update BPL Follow-Up ECG
exports.Update_BPLFollowUp_ECG = function (req, res) {
   var ReceivingData = req.body;
    if (!ReceivingData.Patient || ReceivingData.Patient === '') {
      res.status(400).send({ Success: false, Message: "Patient Details can not be empty" });
   } else if (!ReceivingData.BplId || ReceivingData.BplId === '') {
      res.status(400).send({ Status: false, Message: "BPL Details can not be empty" });
   } else if (!ReceivingData.User || ReceivingData.User === '') {
      res.status(400).send({ Success: false, Message: "User Details can not be empty" });
   } else {
      ReceivingData.BplId = mongoose.Types.ObjectId(ReceivingData.BplId);
      ReceivingData.Patient = mongoose.Types.ObjectId(ReceivingData.Patient);
      Promise.all([
         BPLPatientsModel.BPLPatientsSchema.findOne({_id: ReceivingData.BplId}).exec(),
         WebPatientDetailsModel.PatientBasicDetailsSchema.findOne({ _id: ReceivingData.Patient, Active_Status: true, If_Deleted: false }, {}, {}).exec()
      ]).then(response => {
         var BplInfo = response[0];
         var PatientInfo = response[1];
         if (BplInfo !== null && PatientInfo !== null) {
            var ECG_Arr = PatientInfo.All_ECG_Files;
            const AddOn = (ECG_Arr.length !== undefined && ECG_Arr.length > 0) ? ECG_Arr.length + 1 : 1;
            var Date_Time = (BplInfo.ECG_Taken_date_time !== null && BplInfo.ECG_Taken_date_time !== '') ? BplInfo.ECG_Taken_date_time : new Date();             
            ECG_Arr.push({
               "Name": Date_Time.valueOf() + '-BPL-' + AddOn,
               "ECG_File": BplInfo.ECG_File,
               "DateTime": Date_Time,
               "Hospital": PatientInfo.Initiated_Hospital
            });
            WebPatientDetailsModel.PatientBasicDetailsSchema
            .updateOne({ _id: ReceivingData.Patient }, { $set: { All_ECG_Files: ECG_Arr } })
            .exec(function (error3, result_3) {
               if (error3) {
                  res.status(417).send({ Status: false, Message: "Some error occurred!.", Error: error3 });
               } else {
                  BPLPatientsModel.BPLPatientsSchema.updateOne({_id: ReceivingData.BplId}, {$set: {Patient_Status: 'FollowUp', Active_Status: false}}).exec();
                  res.status(200).send({ Status: true, Message: 'Patient Follow-up Updated Successfully' });
               }
            });
         } else {
            res.status(417).send({ Status: false, Message: "Invalid Patient Details!" });
         }
      }).catch(error => {
         res.status(417).send({ Status: false, Message: "Some error occurred while find the BPL Patient!.", Error: error });
      });
   }
};

// Download ECG_File Images
exports.DownloadECGPDF_Recordss = async(req, res) => {
   try {

      const DeviceID = "JHRNBDURFS10";
      const Limit_Count = 100;
      const Skip_Count = 0;
      const HospitalId = '5f6c3533ea654c77dfa7bcad';
      
      const aggregationPipeline = [
         {
           '$project': {
             'Current_ECG_File': 1, 
             'ECGFile_Array.Name': 1, 
             'ECGFile_Array.ECG_File': 1, 
             'Hospital': 1, 
             'EntryFrom': 1
           }
         }, {
           '$unwind': {
             'path': '$ECGFile_Array', 
             'preserveNullAndEmptyArrays': true
           }
         }, {
           '$match': {
             'Hospital': new ObjectId('5f6c3533ea654c77dfa7bcad')
           }
         }, {
           '$match': {
             'ECGFile_Array.Name': {
               '$regex': new RegExp('B')
             }
           }
         },
         { $skip: Skip_Count },
         { $limit: Limit_Count }
       ]
         
       
         
       const BPLPatientFiles = await PatientDetailsModel.PatientBasicDetailsSchema.aggregate(aggregationPipeline).exec();
       if(!BPLPatientFiles || BPLPatientFiles.length === 0) {
         return res.status(404).json({ error: 'No files found' });
      }
      // return res.json({ message: 'Files downloaded and saved to desktop successfully', Files: BPLPatientFiles });
      const directoryPath = 'Stemi_IndiaECGFile_Images';
      const desktopDir = path.join(OS.homedir(), 'Desktop', directoryPath);
      const download = BPLPatientFiles.map(async (item) => {
         const value = item.ECGFile_Array.ECG_File;  // here already ECG_Report has saved in format of local system location only  
         console.log(`Value`, value);
         const url = value.split(';base64,')[1];
         const decodedPdfData = Buffer.from(url, 'base64');
         const fileId = DeviceID;
         const filedName = item.ECGFile_Array.Name;
         const fileName = `${fileId}_${filedName}.jpeg`;
         const filePath = path.join(desktopDir, fileName);

         return new Promise((resolve, reject) => {
            fs.writeFile(filePath, decodedPdfData, (err) => {
               if (err) {
                  console.log(err);
                  reject(err);
               } else {
                  console.log(`File ${fileName} saved to desktop`);
                  resolve({ fileName });
               }
            })
         })
      })

      Promise.all(download).then((results) => {
         res.status(200).send({ message: 'Files downloaded and saved to desktop successfully', Files: results });
      }).catch((error) => {
         console.log(error);
         res.status(417).json({ error: 'Error downloading or saving files '});
      })
      return res.status(200).json({ message: 'Files downloaded and saved to desktop successfully', Files: BPLPatientFiles });
   } catch(error) {
      console.log(error);
      return res.status(500).json({ error: 'Internal Server Error', Error: error.message });
   }
}