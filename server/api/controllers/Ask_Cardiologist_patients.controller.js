var PatientDetailsModel = require('../../mobile_api/models/patient-management/patient_details.model');
var StemiClusterModel = require('../models/cluster_management.model');

var mongoose = require('mongoose');


// Cardiologist Super Admin Patient List
exports.Cardiac_AllPatient_List = function(req, res) {
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
   var FindQuery = {'If_Deleted': false, };
   FindQuery['$or']  = [{ 'Stemi_Status': 'Stemi_Ask_Cardiologist'}, {'Stemi_Status': 'Retake_ECG'}];

   // { $or: [ <expression1>, <expression2>, ... ] }

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
      PatientDetailsModel.PatientBasicDetailsSchema
      .aggregate([
         { $match: FindQuery},
         { $lookup: {
            from: "Stemi_Hospital_Management",
            let: { "hospital": "$Hospital"},
            pipeline: [
               { $match: { $expr: { $eq: ["$$hospital", "$_id"] } } },
               { $project: { "Hospital_Name": 1, "Hospital_Code": 1, "Hospital_Role": 1 }}
            ],
            as: 'Initiated_Hospital' } },
            { $unwind: { path: "$Initiated_Hospital",  preserveNullAndEmptyArrays: true } },
            {
               $lookup:{
                   from: "Stemi_User", 
                   let: { "user": "$User"},
                   pipeline: [
                      { $match: { $expr: { $eq: ["$$user", "$_id"] } } },
                      { $project: { "Name": 1, "User_Type": 1, }}
                   ],
                   as: 'UserInfo'
               }
           },
         { $unwind: { path: "$UserInfo",  preserveNullAndEmptyArrays: true } },
         { $addFields: { Initiated_Hospital: { $ifNull: [ "$Initiated_Hospital", null ] }  } },
         { $addFields: { HospitalSort: { $ifNull: [ "$Initiated_Hospital.Hospital_Name", null ] }  } },
         { $addFields: { PatientNameSort: { $ifNull: [ "$Patient_Name", null ] }  } },
         { $addFields: { HospitalSort: { $toLower: "$HospitalSort" } } },
         { $addFields: { PatientNameSort: { $toLower: "$PatientNameSort" } } },
         { $addFields: { Patient_GenderSort: { $toLower: "$Patient_Gender" } } },
         { $addFields: { Patient_AgeSort: { $toLower: "$Patient_Age" } } },
         { $addFields: { ECG_Taken_date_timeSort: { $toLower: "$ECG_Taken_date_time" } } },
         { $addFields: { Stemi_StatusSort: { $ifNull: [ "$Patient_Status", null ] }  } },
         { $project: {  PatientNameSort: 1, HospitalSort: 1, Patient_Name: 1, Hospital:1, Patient_Unique: 1, 
            Patient_Age: 1, Stemi_Status:1, Patient_Gender:1, Stemi_Confirmed: 1, Initiated_Hospital: 1, 
            Symptoms: 1,       
            Admission_Type: 1,
            User:1,
            Confirmed_UserType: 1,
            Confirmed_By: 1,
            Risk_Factors: 1,
            Confirmed_ECG: 1,
            ST_Depression: 1, 
            ST_Elevation: 1,
            EntryFrom: 1,
            UserInfo: 1,
            Current_ECG_File: 1,
            LastCompletionChild: 1, Active_Status: 1,ECG_Taken_date_time: 1, If_Deleted: 1, createdAt: 1 } },
         { $sort : ShortOrder },
         { $skip : Skip_Count },
         { $limit : Limit_Count }
      ]).exec(),
      PatientDetailsModel.PatientBasicDetailsSchema.countDocuments(FindQuery).exec()
   ]).then(result => {
      res.status(200).send({Status: true, Response: result[0], SubResponse: result[1] });
   }).catch(err => {
      res.status(417).send({Status: false, ErrorCode: 417, ErrorMessage: "Some error occurred while Find The Users list!."});
   });
};


// CO User Clusters Based Patients
exports.Coordinator_CardiacList = function(req, res) {
   var ReceivingData = req.body;
   
   if (!ReceivingData.User || ReceivingData.User === '') {
      res.status(400).send({ Status: false, Message: "User Details is Required!" });
   } else if (!ReceivingData.User_Type || ReceivingData.User_Type !== 'CO') {
      res.status(400).send({ Status: false, Message: "User Rights is not Proper!" });
      //  
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

            var FindQuery = {'If_Deleted': false, 'Hospital': { $in: HospitalArr } };
            FindQuery['$or'] = [{ 'Stemi_Status': 'Stemi_Ask_Cardiologist'}, {'Stemi_Status': 'Retake_ECG'}];
            
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
               PatientDetailsModel.PatientBasicDetailsSchema
               .aggregate([
                  { $match: FindQuery},
                  { $lookup: {
                     from: "Stemi_Hospital_Management",
                     let: { "hospital": "$Hospital"},
                     pipeline: [
                        { $match: { $expr: { $eq: ["$$hospital", "$_id"] } } },
                        { $project: { "Hospital_Name": 1, "Hospital_Code": 1, "Hospital_Role": 1 }}
                     ],
                     as: 'Initiated_Hospital' } },
                     { $unwind: { path: "$Initiated_Hospital",  preserveNullAndEmptyArrays: true } },
                     {
                        $lookup:{
                            from: "Stemi_User", 
                            let: { "user": "$User"},
                            pipeline: [
                               { $match: { $expr: { $eq: ["$$user", "$_id"] } } },
                               { $project: { "Name": 1, "User_Type": 1, }}
                            ],
                            as: 'UserInfo'
                        }
                    },
                  { $unwind: { path: "$UserInfo",  preserveNullAndEmptyArrays: true } },
                  // { $addFields: { Initiated_Hospital: { $ifNull: [ "$Initiated_Hospital", null ] }  } },
                  { $addFields: { HospitalSort: { $ifNull: [ "$Initiated_Hospital.Hospital_Name", null ] }  } },
                  { $addFields: { PatientNameSort: { $ifNull: [ "$Patient_Name", null ] }  } },
                  { $addFields: { HospitalSort: { $toLower: "$HospitalSort" } } },
                  { $addFields: { PatientNameSort: { $toLower: "$PatientNameSort" } } },
                  { $addFields: { Patient_GenderSort: { $toLower: "$Patient_Gender" } } },
                  { $addFields: { Patient_AgeSort: { $toLower: "$Patient_Age" } } },
                  { $addFields: { ECG_Taken_date_timeSort: { $toLower: "$ECG_Taken_date_time" } } },
                  { $addFields: { Stemi_StatusSort: { $ifNull: [ "$Patient_Status", null ] }  } },
                  { $project: {  PatientNameSort: 1, HospitalSort: 1, Patient_Name: 1, Hospital:1, Patient_Unique: 1, 
                     Patient_Age: 1, Stemi_Status:1, Patient_Gender:1, Stemi_Confirmed: 1, Initiated_Hospital: 1, 
                     Symptoms: 1,       
                     Admission_Type: 1,
                     User:1,
                     Confirmed_UserType: 1,
                     Confirmed_By: 1,
                     Risk_Factors: 1,
                     Confirmed_ECG: 1,
                     ST_Depression: 1, 
                     ST_Elevation: 1,
                     EntryFrom: 1,
                     UserInfo: 1,
                     Current_ECG_File: 1,
                     LastCompletionChild: 1, Active_Status: 1,ECG_Taken_date_time: 1, If_Deleted: 1, createdAt: 1 } },
                  { $sort : ShortOrder },
                  { $skip : Skip_Count },
                  { $limit : Limit_Count }
               ]).exec(),
               PatientDetailsModel.PatientBasicDetailsSchema.countDocuments(FindQuery).exec()
            ]).then(result => {
               res.status(200).send({Status: true, Response: result[0], SubResponse: result[1] });
            }).catch(err => {
               res.status(417).send({Status: false, ErrorCode: 417, ErrorMessage: "Some error occurred while Find The Users list!."});
            });
         }
      });
   }
};


// PU User Single Cluster Cardioc Patients
exports.SingleCluster_CardiacPatients = function(req, res) {
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
 

          var FindQuery = {'If_Deleted': false, 'Hospital': { $in: HospitalArr } };
          FindQuery['$or'] = [{ 'Stemi_Status': 'Stemi_Ask_Cardiologist'}, {'Stemi_Status': 'Retake_ECG'}];

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
            PatientDetailsModel.PatientBasicDetailsSchema
            .aggregate([
               { $match: FindQuery},
               { $lookup: {
                  from: "Stemi_Hospital_Management",
                  let: { "hospital": "$Hospital"},
                  pipeline: [
                     { $match: { $expr: { $eq: ["$$hospital", "$_id"] } } },
                     { $project: { "Hospital_Name": 1, "Hospital_Code": 1, "Hospital_Role": 1 }}
                  ],
                  as: 'Initiated_Hospital' } },
                  { $unwind: { path: "$Initiated_Hospital",  preserveNullAndEmptyArrays: true } },
                  {
                     $lookup:{
                         from: "Stemi_User", 
                         let: { "user": "$User"},
                         pipeline: [
                            { $match: { $expr: { $eq: ["$$user", "$_id"] } } },
                            { $project: { "Name": 1, "User_Type": 1, }}
                         ],
                         as: 'UserInfo'
                     }
                 },
               { $unwind: { path: "$UserInfo",  preserveNullAndEmptyArrays: true } },
               // { $addFields: { Initiated_Hospital: { $ifNull: [ "$Initiated_Hospital", null ] }  } },
               { $addFields: { HospitalSort: { $ifNull: [ "$Initiated_Hospital.Hospital_Name", null ] }  } },
               { $addFields: { PatientNameSort: { $ifNull: [ "$Patient_Name", null ] }  } },
               { $addFields: { HospitalSort: { $toLower: "$HospitalSort" } } },
               { $addFields: { PatientNameSort: { $toLower: "$PatientNameSort" } } },
               { $addFields: { Patient_GenderSort: { $toLower: "$Patient_Gender" } } },
               { $addFields: { Patient_AgeSort: { $toLower: "$Patient_Age" } } },
               { $addFields: { ECG_Taken_date_timeSort: { $toLower: "$ECG_Taken_date_time" } } },
               { $addFields: { Stemi_StatusSort: { $ifNull: [ "$Patient_Status", null ] }  } },
               { $project: {  PatientNameSort: 1, HospitalSort: 1, Patient_Name: 1, Hospital:1, Patient_Unique: 1, 
                  Patient_Age: 1, Stemi_Status:1, Patient_Gender:1, Stemi_Confirmed: 1, Initiated_Hospital: 1, 
                  Symptoms: 1,       
                  Admission_Type: 1,
                  User:1,
                  Confirmed_UserType: 1,
                  Confirmed_By: 1,
                  Risk_Factors: 1,
                  Confirmed_ECG: 1,
                  ST_Depression: 1, 
                  ST_Elevation: 1,
                  EntryFrom: 1,
                  UserInfo: 1,
                  Current_ECG_File: 1,
                  LastCompletionChild: 1, Active_Status: 1,ECG_Taken_date_time: 1, If_Deleted: 1, createdAt: 1 } },
               { $sort : ShortOrder },
               { $skip : Skip_Count },
               { $limit : Limit_Count }
            ]).exec(),
            PatientDetailsModel.PatientBasicDetailsSchema.countDocuments(FindQuery).exec()
         ]).then(result => {
            res.status(200).send({Status: true, Response: result[0], SubResponse: result[1] });
         }).catch(err => {
            res.status(417).send({Status: false, ErrorCode: 417, ErrorMessage: "Some error occurred while Find The Users list!."});
         });
       }
          
       });
       }
};


// PU User Multiple Cluster Cardiac Patients
exports.MultipleCluster_CardiacPatients = function(req, res) {
   var ReceivingData = req.body;
   // console.log(req.body);
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


               var FindQuery = {'If_Deleted': false, 'Hospital': { $in: Hospitals } };
               FindQuery['$or'] = [{ 'Stemi_Status': 'Stemi_Ask_Cardiologist'}, {'Stemi_Status': 'Retake_ECG'}];

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
                  PatientDetailsModel.PatientBasicDetailsSchema
                  .aggregate([
                     { $match: FindQuery},
                     { $lookup: {
                        from: "Stemi_Hospital_Management",
                        let: { "hospital": "$Hospital"},
                        pipeline: [
                           { $match: { $expr: { $eq: ["$$hospital", "$_id"] } } },
                           { $project: { "Hospital_Name": 1, "Hospital_Code": 1, "Hospital_Role": 1 }}
                        ],
                        as: 'Initiated_Hospital' } },
                        { $unwind: { path: "$Initiated_Hospital",  preserveNullAndEmptyArrays: true } },
                        {
                           $lookup:{
                               from: "Stemi_User", 
                               let: { "user": "$User"},
                               pipeline: [
                                  { $match: { $expr: { $eq: ["$$user", "$_id"] } } },
                                  { $project: { "Name": 1, "User_Type": 1, }}
                               ],
                               as: 'UserInfo'
                           }
                       },
                     { $unwind: { path: "$UserInfo",  preserveNullAndEmptyArrays: true } },
                     // { $addFields: { Initiated_Hospital: { $ifNull: [ "$Initiated_Hospital", null ] }  } },
                     { $addFields: { HospitalSort: { $ifNull: [ "$Initiated_Hospital.Hospital_Name", null ] }  } },
                     { $addFields: { PatientNameSort: { $ifNull: [ "$Patient_Name", null ] }  } },
                     { $addFields: { HospitalSort: { $toLower: "$HospitalSort" } } },
                     { $addFields: { PatientNameSort: { $toLower: "$PatientNameSort" } } },
                     { $addFields: { Patient_GenderSort: { $toLower: "$Patient_Gender" } } },
                     { $addFields: { Patient_AgeSort: { $toLower: "$Patient_Age" } } },
                     { $addFields: { ECG_Taken_date_timeSort: { $toLower: "$ECG_Taken_date_time" } } },
                     { $addFields: { Stemi_StatusSort: { $ifNull: [ "$Patient_Status", null ] }  } },
                     { $project: {  PatientNameSort: 1, HospitalSort: 1, Patient_Name: 1, Hospital:1, Patient_Unique: 1, 
                        Patient_Age: 1, Stemi_Status:1, Patient_Gender:1, Stemi_Confirmed: 1, Initiated_Hospital: 1, 
                        Symptoms: 1,       
                        Admission_Type: 1,
                        User:1,
                        Confirmed_UserType: 1,
                        Confirmed_By: 1,
                        Risk_Factors: 1,
                        Confirmed_ECG: 1,
                        ST_Depression: 1, 
                        ST_Elevation: 1,
                        EntryFrom: 1,
                        UserInfo: 1,
                        Current_ECG_File: 1,
                        LastCompletionChild: 1, Active_Status: 1,ECG_Taken_date_time: 1, If_Deleted: 1, createdAt: 1 } },
                     { $sort : ShortOrder },
                     { $skip : Skip_Count },
                     { $limit : Limit_Count }
                  ]).exec(),
                  PatientDetailsModel.PatientBasicDetailsSchema.countDocuments(FindQuery).exec()
               ]).then(result => {
                  res.status(200).send({Status: true, Response: result[0], SubResponse: result[1] });
               }).catch(err => {
                  res.status(417).send({Status: false, ErrorCode: 417, ErrorMessage: "Some error occurred while Find The Users list!."});
               });
            });
         }
      });
   }
};


// PU User Advanced Cluster Cardiac Patients
exports.AdvancedCluster_CardiacPatients = function(req, res) {
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

            var FindQuery = {'If_Deleted': false, 'Hospital': { $in: HospitalArr } };
            FindQuery['$or'] = [{ 'Stemi_Status': 'Stemi_Ask_Cardiologist'}, {'Stemi_Status': 'Retake_ECG'}];
                                  
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
               PatientDetailsModel.PatientBasicDetailsSchema
               .aggregate([
                  { $match: FindQuery},
                  { $lookup: {
                     from: "Stemi_Hospital_Management",
                     let: { "hospital": "$Hospital"},
                     pipeline: [
                        { $match: { $expr: { $eq: ["$$hospital", "$_id"] } } },
                        { $project: { "Hospital_Name": 1, "Hospital_Code": 1, "Hospital_Role": 1 }}
                     ],
                     as: 'Initiated_Hospital' } },
                     { $unwind: { path: "$Initiated_Hospital",  preserveNullAndEmptyArrays: true } },
                     {
                        $lookup:{
                            from: "Stemi_User", 
                            let: { "user": "$User"},
                            pipeline: [
                               { $match: { $expr: { $eq: ["$$user", "$_id"] } } },
                               { $project: { "Name": 1, "User_Type": 1, }}
                            ],
                            as: 'UserInfo'
                        }
                    },
                  { $unwind: { path: "$UserInfo",  preserveNullAndEmptyArrays: true } },
                  // { $addFields: { Initiated_Hospital: { $ifNull: [ "$Initiated_Hospital", null ] }  } },
                  { $addFields: { HospitalSort: { $ifNull: [ "$Initiated_Hospital.Hospital_Name", null ] }  } },
                  { $addFields: { PatientNameSort: { $ifNull: [ "$Patient_Name", null ] }  } },
                  { $addFields: { HospitalSort: { $toLower: "$HospitalSort" } } },
                  { $addFields: { PatientNameSort: { $toLower: "$PatientNameSort" } } },
                  { $addFields: { Patient_GenderSort: { $toLower: "$Patient_Gender" } } },
                  { $addFields: { Patient_AgeSort: { $toLower: "$Patient_Age" } } },
                  { $addFields: { ECG_Taken_date_timeSort: { $toLower: "$ECG_Taken_date_time" } } },
                  { $addFields: { Stemi_StatusSort: { $ifNull: [ "$Patient_Status", null ] }  } },
                  { $project: {  PatientNameSort: 1, HospitalSort: 1, Patient_Name: 1, Hospital:1, Patient_Unique: 1, 
                     Patient_Age: 1, Stemi_Status:1, Patient_Gender:1, Stemi_Confirmed: 1, Initiated_Hospital: 1, 
                     Symptoms: 1,       
                     Admission_Type: 1,
                     User:1,
                     Confirmed_UserType: 1,
                     Confirmed_By: 1,
                     Risk_Factors: 1,
                     Confirmed_ECG: 1,
                     ST_Depression: 1, 
                     ST_Elevation: 1,
                     EntryFrom: 1,
                     UserInfo: 1,
                     Current_ECG_File: 1,
                     LastCompletionChild: 1, Active_Status: 1,ECG_Taken_date_time: 1, If_Deleted: 1, createdAt: 1 } },
                  { $sort : ShortOrder },
                  { $skip : Skip_Count },
                  { $limit : Limit_Count }
               ]).exec(),
               PatientDetailsModel.PatientBasicDetailsSchema.countDocuments(FindQuery).exec()
            ]).then(result => {
               res.status(200).send({Status: true, Response: result[0], SubResponse: result[1] });
            }).catch(err => {
               res.status(417).send({Status: false, ErrorCode: 417, ErrorMessage: "Some error occurred while Find The Users list!."});
            });
         }
      });
   }
};


// PU User Hospital Based  Cardiac Patients
exports.HospitalBased_CardiacPatients = function(req, res) {
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
      
      var FindQuery = {'If_Deleted': false, 'Hospital': ReceivingData.Hospital };
      FindQuery['$or']  = [{ 'Stemi_Status': 'Stemi_Ask_Cardiologist'}, {'Stemi_Status': 'Retake_ECG'}];

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
         PatientDetailsModel.PatientBasicDetailsSchema
         .aggregate([
            { $match: FindQuery},
            { $lookup: {
               from: "Stemi_Hospital_Management",
               let: { "hospital": "$Hospital"},
               pipeline: [
                  { $match: { $expr: { $eq: ["$$hospital", "$_id"] } } },
                  { $project: { "Hospital_Name": 1, "Hospital_Code": 1, "Hospital_Role": 1 }}
               ],
               as: 'Initiated_Hospital' } },
               { $unwind: { path: "$Initiated_Hospital",  preserveNullAndEmptyArrays: true } },
               {
                  $lookup:{
                      from: "Stemi_User", 
                      let: { "user": "$User"},
                      pipeline: [
                         { $match: { $expr: { $eq: ["$$user", "$_id"] } } },
                         { $project: { "Name": 1, "User_Type": 1, }}
                      ],
                      as: 'UserInfo'
                  }
              },
            { $unwind: { path: "$UserInfo",  preserveNullAndEmptyArrays: true } },
            // { $addFields: { Initiated_Hospital: { $ifNull: [ "$Initiated_Hospital", null ] }  } },
            { $addFields: { HospitalSort: { $ifNull: [ "$Initiated_Hospital.Hospital_Name", null ] }  } },
            { $addFields: { PatientNameSort: { $ifNull: [ "$Patient_Name", null ] }  } },
            { $addFields: { HospitalSort: { $toLower: "$HospitalSort" } } },
            { $addFields: { PatientNameSort: { $toLower: "$PatientNameSort" } } },
            { $addFields: { Patient_GenderSort: { $toLower: "$Patient_Gender" } } },
            { $addFields: { Patient_AgeSort: { $toLower: "$Patient_Age" } } },
            { $addFields: { ECG_Taken_date_timeSort: { $toLower: "$ECG_Taken_date_time" } } },
            { $addFields: { Stemi_StatusSort: { $ifNull: [ "$Patient_Status", null ] }  } },
            { $project: {  PatientNameSort: 1, HospitalSort: 1, Patient_Name: 1, Hospital:1, Patient_Unique: 1, 
               Patient_Age: 1, Stemi_Status:1, Patient_Gender:1, Stemi_Confirmed: 1, Initiated_Hospital: 1, 
               Symptoms: 1,       
               Admission_Type: 1,
               User:1,
               Confirmed_UserType: 1,
               Confirmed_By: 1,
               Risk_Factors: 1,
               Confirmed_ECG: 1,
               ST_Depression: 1, 
               ST_Elevation: 1,
               EntryFrom: 1,
               UserInfo: 1,
               Current_ECG_File: 1,
               LastCompletionChild: 1, Active_Status: 1,ECG_Taken_date_time: 1, If_Deleted: 1, createdAt: 1 } },
            { $sort : ShortOrder },
            { $skip : Skip_Count },
            { $limit : Limit_Count }
         ]).exec(),
         PatientDetailsModel.PatientBasicDetailsSchema.countDocuments(FindQuery).exec()
      ]).then(result => {
         res.status(200).send({Status: true, Response: result[0], SubResponse: result[1] });
      }).catch(err => {
         res.status(417).send({Status: false, ErrorCode: 417, ErrorMessage: "Some error occurred while Find The Users list!."});
      });
   }
};