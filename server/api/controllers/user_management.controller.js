var StemiUserModel = require('./../models/user_management.model');
var StemiAPPUserLoginModel = require('./../../mobile_api/models/login_management.model');
var mongoose = require('mongoose');

// User Name Async Validate -----------------------------------------------
exports.StemiUser_AsyncValidate = function(req, res) {
   var ReceivingData = req.body;

   if(!ReceivingData.User_Name || ReceivingData.User_Name === '' ) {
      res.status(400).send({Status: false, Message: "User Name can not be empty" });
   }else {
      StemiUserModel.UserManagementSchema.findOne({'User_Name': { $regex : new RegExp("^" + ReceivingData.User_Name + "$", "i") } }, {}, {}, function(err, result) {
         if(err) {
            res.status(417).send({status: false, Message: "Some error occurred while Find the User Name!."});
         } else {
            if ( result !== null) {
               res.status(200).send({Status: true, Available: false });
            } else {
               res.status(200).send({Status: true, Available: true });
            }
         }
      });
   }
}; 

// Stemi User Create ---------------------------------------------
exports.StemiUser_Create = function (req, res) {
   var ReceivingData = req.body;
      
   if (!ReceivingData.User_Name || ReceivingData.User_Name === '') {
      res.status(400).send({ Status: false, Message: "User Name can not be empty" });
   } else {
      StemiUserModel.UserManagementSchema.findOne({}, {}, {'sort': {createdAt: -1} }, function(err, result) {
         if (err) {
            res.status(417).send({ Status: false, Message: "Some error occurred while Find the User!.", Error: err });
         } else {    
            
            if(ReceivingData.Location && ReceivingData.Location !== '') {
               ReceivingData.Location = mongoose.Types.ObjectId(ReceivingData.Location._id);
            } else {
               ReceivingData.Location = null;
            }

            if(ReceivingData.Cluster && ReceivingData.Cluster !== '') {
               ReceivingData.Cluster = mongoose.Types.ObjectId(ReceivingData.Cluster._id);
            } else {
               ReceivingData.Cluster = null;
            }

            if(ReceivingData.Hospital && ReceivingData.Hospital !== '') {
               ReceivingData.Hospital = mongoose.Types.ObjectId(ReceivingData.Hospital._id);
            } else {
               ReceivingData.Hospital = null;
            }

            if(ReceivingData.HospitalsArray && typeof ReceivingData.HospitalsArray === 'object' && ReceivingData.HospitalsArray !== '' && ReceivingData.HospitalsArray !== null) {
               ReceivingData.HospitalsArray = ReceivingData.HospitalsArray.map(obj => {
                  obj = mongoose.Types.ObjectId(obj);
                  return obj;
               });    
            } else {
               ReceivingData.HospitalsArray = null;
            }

            if(ReceivingData.ClustersArray && typeof ReceivingData.ClustersArray === 'object' && ReceivingData.ClustersArray !== '' && ReceivingData.ClustersArray !== null) {
               ReceivingData.ClustersArray = ReceivingData.ClustersArray.map(obj => {
                  obj = mongoose.Types.ObjectId(obj);
                  return obj;
               });    
            } else {
               ReceivingData.ClustersArray = null;
            }

            const Create_StemiUser = new StemiUserModel.UserManagementSchema({
               User_Name: ReceivingData.User_Name || '',
               Password: ReceivingData.Password || '',
               Name: ReceivingData.Name || '',
               Email: ReceivingData.Email || '',
               Phone: ReceivingData.Phone || '',
               User_Type: ReceivingData.User_Type || '',
               DocRegID: ReceivingData.DocRegID || '',
               Qualification: ReceivingData.Qualification || '',
               Designation: ReceivingData.Designation || '',
               Location: ReceivingData.Location || null,
               Cluster: ReceivingData.Cluster || null,
               Hospital: ReceivingData.Hospital || null,
               ClustersArray: ReceivingData.ClustersArray || [],
               HospitalsArray: ReceivingData.HospitalsArray || [],
               Alert_Duration: ReceivingData.Alert_Duration || '',
               onlyViewAccess: ReceivingData.onlyViewAccess || false,
               Active_Status: true,
               If_Deleted: false
            });
            Create_StemiUser.save(function (err_1, result_1) {
               if (err_1) {
                  res.status(417).send({ Status: false, Message: "Some error occurred while Creating the User Management!.", Error: err_1 });
               } else {
                  res.status(200).send({ Status: true, Response: result_1 });
               }
            });
         }
      });
   }
};

// Stemi Users View
exports.StemiUsers_List = function(req, res) {
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
   var FindQuery = {'If_Deleted': false, 'User_Type': {$ne: 'SA'}};
   if (ReceivingData.FilterQuery && typeof ReceivingData.FilterQuery === 'object' && ReceivingData.FilterQuery !== null && ReceivingData.FilterQuery.length > 0) {
      ReceivingData.FilterQuery.map(obj => {
         if (obj.Type === 'String') {
            FindQuery[obj.DBName] = { $regex : new RegExp(".*" + obj.Value + ".*", "i") };
         }
         if (obj.Type === 'Select') {
            FindQuery[obj.DBName] = obj.Value;
         }
         if (obj.Type === 'Boolean') {
            FindQuery[obj.DBName] = obj.Value === 'true' ? true : false;
         }
         if (obj.Type === 'Object') {
            if (obj.Key === 'ClusterName') {
               FindQuery['$or'] = [ {'Cluster': mongoose.Types.ObjectId(obj.Value._id) }, { 'ClustersArray': mongoose.Types.ObjectId(obj.Value._id)}];
            } else if (obj.Key === 'HospitalName') {
               FindQuery['$or'] = [ {'Hospital': mongoose.Types.ObjectId(obj.Value._id) }, { 'HospitalsArray': mongoose.Types.ObjectId(obj.Value._id)}];
            } else {
               FindQuery[obj.DBName] = mongoose.Types.ObjectId(obj.Value._id);
            }
         }
      });
   }
  
   Promise.all([
      StemiUserModel.UserManagementSchema
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
            from: "Stemi_Hospital_Management",
            let: { "hospital": "$Hospital"},
            pipeline: [
               { $match: { $expr: { $eq: ["$$hospital", "$_id"] } } },
               { $project: { "Hospital_Name": 1, "Hospital_Role": 1, "Active_Status": 1}}
            ],
            as: "Hospital" } },
         { $unwind: { path: "$Hospital",  preserveNullAndEmptyArrays: true } },
         { $addFields: { Hospital: { $ifNull: [ "$Hospital", null ] }  } },
         { $lookup: {
            from: "Stemi_Cluster",
            let: { "cluster": "$Cluster"},
            pipeline: [
               { $match: { $expr: { $eq: ["$$cluster", "$_id"] } } },
               { $project: { "Cluster_Name": 1 }}
            ],
            as: "Cluster" } },
         { $unwind: { path: "$Cluster",  preserveNullAndEmptyArrays: true } },
         { $addFields: { Cluster: { $ifNull: [ "$Cluster", null ] }  } },

         { $lookup: {
            from: "Stemi_Hospital_Management",
            let: { "hospitalsArray": "$HospitalsArray"},
            pipeline: [
               { $match: { $expr: { $in: ["$_id", "$$hospitalsArray"] } } },
               { $project: { "Hospital_Name": 1, "Hospital_Role": 1, "Active_Status": 1}}
            ],
            as: "HospitalsArray" } },
         { $lookup: {
            from: "Stemi_Cluster",
            let: { "clustersArray": "$ClustersArray"},
            pipeline: [
               { $match: { $expr: { $in: ["$_id", "$$clustersArray"] } } },
               { $project: { "Cluster_Name": 1 }}
            ],
            as: "ClustersArray" } },
         { $addFields: { HospitalSort: { $ifNull: [ "$Hospital.Hospital_Name", null ] }  } },
         { $addFields: { HospitalSort:
            { $ifNull: [ "$HospitalSort",
               { $cond:{
                  if: { $gt: [ { $size: "$HospitalsArray.Hospital_Name" } , 0 ] },
                  then: {  $arrayElemAt: [ "$HospitalsArray.Hospital_Name", 0 ]  },
                  else: null } } ] }  } },
         { $addFields: { ClusterSort: { $ifNull: [ "$Cluster.Cluster_Name", null ] }  } },
         { $addFields: { ClusterSort:
            { $ifNull: [ "$ClusterSort",
               { $cond:{
                  if: { $gt: [ { $size: "$ClustersArray.Cluster_Name" } , 0 ] },
                  then: {  $arrayElemAt: [ "$ClustersArray.Cluster_Name", 0 ]  },
                  else: null } } ] }  } },


         { $addFields: { HospitalSort: { $toLower: "$HospitalSort" } } },
         { $addFields: { ClusterSort: { $toLower: "$ClusterSort" } } },
         { $addFields: { LocationSort: { $toLower: "$Location.Location_Name" } } },
         { $addFields: { UserNameSort: { $toLower: "$User_Name" } } },
         { $addFields: { UserTypeSort: { $toLower: "$User_Type" } } },
         { $addFields: { EmailSort: { $toLower: "$Email" } } },

         { $sort : ShortOrder },
         { $skip : Skip_Count },
         { $limit : Limit_Count }
      ]).exec(),
      StemiUserModel.UserManagementSchema.countDocuments(FindQuery).exec()
   ]).then(result => {
      res.status(200).send({Status: true, Response: result[0], SubResponse: result[1] });
   }).catch(err => {
      res.status(417).send({Status: false, ErrorCode: 417, ErrorMessage: "Some error occurred while Find The Users list!."});
   });
};



// Stemi Users Delete Status 
exports.StemiUsers_Delete = function(req, res){
   var ReceivingData = req.body;
   StemiUserModel.UserManagementSchema
   .updateOne({_id: mongoose.Types.ObjectId(ReceivingData._id)},{ $set: { If_Deleted: 'true'}})
   .exec(function(err, result){
      if(err) {
         res.status(417).send({Status: false, Message: "Some error occurred!.", Error: err });
      } else {
         StemiUserModel.LoginHistorySchema.updateMany({User: mongoose.Types.ObjectId(ReceivingData._id)}, {$set: {Active_Status : false}}).exec();
         StemiAPPUserLoginModel.LoginHistorySchema.updateMany({User: mongoose.Types.ObjectId(ReceivingData._id)}, {$set: {Active_Status : false}}).exec();
         res.status(200).send({Status: true, Response: result });
      }
   });
};

// Stemi User Details Update ---------------------------------------------
exports.StemiUser_Update = function (req, res) {
   var ReceivingData = req.body;
   
   if (!ReceivingData.UserId || ReceivingData.UserId === '') {
      res.status(400).send({ Status: false, Message: "User Details can not be empty" });
   }else if (!ReceivingData.User_Name || ReceivingData.User_Name === '') {
      res.status(400).send({ Status: false, Message: "User Name can not be empty" });
   } else {

      StemiUserModel.UserManagementSchema.findOne({"_id": mongoose.Types.ObjectId(ReceivingData.UserId)}, {}, {}).exec((err, result) => {
         if (err) {
            res.status(417).send({ Status: false, Message: "Some error occurred while Find the User Details!.", Error: err });
         } else {

            if (result !== null) {
               if(ReceivingData.HospitalsArray && typeof ReceivingData.HospitalsArray === 'object' && ReceivingData.HospitalsArray !== '' && ReceivingData.HospitalsArray !== null) {
                  ReceivingData.HospitalsArray = ReceivingData.HospitalsArray.map(obj => {
                     obj = mongoose.Types.ObjectId(obj);
                     return obj;
                  });    
               } else {
                  ReceivingData.HospitalsArray = result.HospitalsArray;
               }

               if(ReceivingData.ClustersArray && typeof ReceivingData.ClustersArray === 'object' && ReceivingData.ClustersArray !== '' && ReceivingData.ClustersArray !== null) {
                  ReceivingData.ClustersArray = ReceivingData.ClustersArray.map(obj => {
                     obj = mongoose.Types.ObjectId(obj);
                     return obj;
                  });    
               } else {
                  ReceivingData.ClustersArray = result.ClustersArray;
               }

               result.User_Name = ReceivingData.User_Name || '';
               result.Password = ReceivingData.Password || '';
               result.Name = ReceivingData.Name || '';
               result.Email = ReceivingData.Email || '';
               result.Phone = ReceivingData.Phone || '';
               result.DocRegID = ReceivingData.DocRegID || '';
               result.Qualification = ReceivingData.Qualification || '';
               result.Designation = ReceivingData.Designation || '';
               result.Alert_Duration = ReceivingData.Alert_Duration || '';
               result.HospitalsArray = ReceivingData.HospitalsArray || result.HospitalsArray;
               result.ClustersArray = ReceivingData.ClustersArray || result.ClustersArray;
               result.onlyViewAccess = ReceivingData.onlyViewAccess || false;


               result.save(function (err_1, result_1) {
                  if (err_1) {
                     res.status(417).send({ Status: false, Message: "Some error occurred while Updating the User Details!.", Error: err_1 });
                  } else {
                     StemiUserModel.UserManagementSchema.findOne({"_id": mongoose.Types.ObjectId(ReceivingData.UserId)}, {}, {})
                     .populate({ path: 'Location', select: 'Location_Name'})
                     .populate({ path: 'Cluster', select: 'Cluster_Name' })
                     .populate({ path: 'ClustersArray', select: 'Cluster_Name' })
                     .populate({ path: 'HospitalsArray', select: 'Hospital_Name' })
                     .populate({ path: 'Hospital', select: 'Hospital_Name' })
                     .exec(function(err_2, result_2) {
                        if (err_2) {
                           res.status(417).send({ Status: false, Message: "Some error occurred while Find the User Details!.", Error: err_2 });
                        } else {
                           res.status(200).send({ Status: true, Response: result_2 });
                        }
                     });
                  }
               });

            } else {
               res.status(400).send({ Status: false, Message: "User Details Invalid!" });
            }

         }
      });

   }
};

// User Active/Inactive Status 
exports.StemiUserActive_Status = function(req, res){
   var ReceivingData = req.body;
   StemiUserModel.UserManagementSchema
   .updateOne({_id: mongoose.Types.ObjectId(ReceivingData._id)}, { $set: {Active_Status : ReceivingData.Active_Status}})
   .exec(function(err, result){
      if(err) {
         res.status(417).send({Status: false, Message: "Some error occurred!.", Error: err });
      } else {
         StemiUserModel.LoginHistorySchema.updateMany({User: mongoose.Types.ObjectId(ReceivingData._id)}, {$set: {Active_Status : false}}).exec();
         StemiAPPUserLoginModel.LoginHistorySchema.updateMany({User: mongoose.Types.ObjectId(ReceivingData._id)}, {$set: {Active_Status : false}}).exec();
         res.status(200).send({Status: true, Response: result });
      }
   });
};

