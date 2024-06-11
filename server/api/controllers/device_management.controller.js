var DeviceManagementModel = require('./../models/device_management.model');
var mongoose = require('mongoose');

// DeviceUID Async Validate -----------------------------------------------
exports.Device_AsyncValidate = function(req, res) {
   var ReceivingData = req.body;

   if(!ReceivingData.Device_UID || ReceivingData.Device_UID === '' ) {
      res.status(400).send({Status: false, Message: "Device UID can not be empty" });
   }else {
      DeviceManagementModel.DeviceManagementSchema.findOne({'Device_UID': ReceivingData.Device_UID, Active_Status: true, If_Deleted: false }, {}, {}, function(err, result) {
         if(err) {
            res.status(417).send({status: false, Message: "Some error occurred while Validate the Device UID Unique!."});
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


// Device Create ---------------------------------------------
exports.Device_Create = function (req, res) {
   var ReceivingData = req.body;
      
   if (!ReceivingData.Device_UID || ReceivingData.Device_UID === '') {
      res.status(400).send({ Status: false, Message: "Device UID can not be empty" });
   } else if (!ReceivingData.Location || ReceivingData.Location === null) {
      res.status(400).send({ Status: false, Message: "Location can not be empty" });
   } else if (!ReceivingData.Cluster || ReceivingData.Cluster === null) {
      res.status(400).send({ Status: false, Message: "Cluster can not be empty" });
   } else if (!ReceivingData.Hospital || ReceivingData.Hospital === null) {
      res.status(400).send({ Status: false, Message: "Hospital can not be empty" });
   } else {  
            
      if(ReceivingData.Location && ReceivingData.Location !== null && ReceivingData.Location._id) {
         ReceivingData.Location = mongoose.Types.ObjectId(ReceivingData.Location._id);
      } else {
         ReceivingData.Location = null;
      }
      if(ReceivingData.Cluster && ReceivingData.Cluster !== null && ReceivingData.Cluster._id) {
         ReceivingData.Cluster = mongoose.Types.ObjectId(ReceivingData.Cluster._id);
      } else {
         ReceivingData.Cluster = null;
      }
      if(ReceivingData.Hospital && ReceivingData.Hospital !== null && ReceivingData.Hospital._id) {
         ReceivingData.Hospital = mongoose.Types.ObjectId(ReceivingData.Hospital._id);
      } else {
         ReceivingData.Hospital = null;
      }

      const Create_Device = new DeviceManagementModel.DeviceManagementSchema({
         Device_UID: ReceivingData.Device_UID || '',
         Location: ReceivingData.Location || null,
         Cluster: ReceivingData.Cluster || null,
         Hospital: ReceivingData.Hospital || null,
         Active_Status: true,
         If_Deleted: false
      });
      Create_Device.save(function (err, result) {
         if (err) {
            res.status(417).send({ Status: false, Message: "Some error occurred while Creating the New Device!.", Error: err });
         } else {
            res.status(200).send({ Status: true, Response: result });
         }
      });
   }
};


// Devices List
exports.Devices_List = function(req, res) {
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
   if (ReceivingData.FilterQuery && typeof ReceivingData.FilterQuery === 'object' && ReceivingData.FilterQuery !== null && ReceivingData.FilterQuery.length > 0) {
      ReceivingData.FilterQuery.map(obj => {
         if (obj.Type === 'String') {
            FindQuery[obj.DBName] = { $regex : new RegExp(".*" + obj.Value + ".*", "i") };
         }
         if (obj.Type === 'Object') {
            FindQuery[obj.DBName] = mongoose.Types.ObjectId(obj.Value._id);
         }
      });
   }
  
   Promise.all([
      DeviceManagementModel.DeviceManagementSchema
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
               { $project: { "Hospital_Name": 1, "Active_Status": 1}}
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

         { $addFields: { LocationSort: { $ifNull: [ "$Location.Location_Name", null ] }  } },
         { $addFields: { HospitalSort: { $ifNull: [ "$Hospital.Hospital_Name", null ] }  } },
         { $addFields: { ClusterSort: { $ifNull: [ "$Cluster.Cluster_Name", null ] }  } },

         { $addFields: { HospitalSort: { $toLower: "$HospitalSort" } } },
         { $addFields: { ClusterSort: { $toLower: "$ClusterSort" } } },
         { $addFields: { LocationSort: { $toLower: "$LocationSort" } } },
         { $addFields: { DeviceUIDSort: { $toLower: "$Device_UID" } } },

         { $sort : ShortOrder },
         { $skip : Skip_Count },
         { $limit : Limit_Count }
      ]).exec(),
      DeviceManagementModel.DeviceManagementSchema.countDocuments(FindQuery).exec()
   ]).then(result => {
      res.status(200).send({Status: true, Response: result[0], SubResponse: result[1] });
   }).catch(err => {
      res.status(417).send({Status: false, ErrorCode: 417, ErrorMessage: "Some error occurred while Find The Devices list!."});
   });
};


// Device Update ---------------------------------------------
exports.Device_Update = function (req, res) {
   var ReceivingData = req.body;
   
   if (!ReceivingData.Device || ReceivingData.Device === '') {
      res.status(400).send({ Status: false, Message: "Device Details can not be empty" });
   }else if (!ReceivingData.Device_UID || ReceivingData.Device_UID === '') {
      res.status(400).send({ Status: false, Message: "Device UID can not be empty" });
   } else if (!ReceivingData.Location || ReceivingData.Location === null) {
      res.status(400).send({ Status: false, Message: "Location can not be empty" });
   } else if (!ReceivingData.Cluster || ReceivingData.Cluster === null) {
      res.status(400).send({ Status: false, Message: "Cluster can not be empty" });
   } else if (!ReceivingData.Hospital || ReceivingData.Hospital === null) {
      res.status(400).send({ Status: false, Message: "Hospital can not be empty" });
   } else {

      if(ReceivingData.Location && ReceivingData.Location !== null && ReceivingData.Location._id) {
         ReceivingData.Location = mongoose.Types.ObjectId(ReceivingData.Location._id);
      } else {
         ReceivingData.Location = null;
      }
      if(ReceivingData.Cluster && ReceivingData.Cluster !== null && ReceivingData.Cluster._id) {
         ReceivingData.Cluster = mongoose.Types.ObjectId(ReceivingData.Cluster._id);
      } else {
         ReceivingData.Cluster = null;
      }
      if(ReceivingData.Hospital && ReceivingData.Hospital !== null && ReceivingData.Hospital._id) {
         ReceivingData.Hospital = mongoose.Types.ObjectId(ReceivingData.Hospital._id);
      } else {
         ReceivingData.Hospital = null;
      }

      DeviceManagementModel.DeviceManagementSchema.updateOne(
         { "_id": mongoose.Types.ObjectId(ReceivingData.Device)}, { $set: { 
            "Device_UID": ReceivingData.Device_UID || '',
            "Location": ReceivingData.Location || null,
            "Cluster": ReceivingData.Cluster || null,
            "Hospital": ReceivingData.Hospital || null} }
      ).exec(function (err, result) {
         if (err) {
            res.status(417).send({ Status: false, Message: "Some error occurred while Updating the Device Details!.", Error: err });
         } else {
            DeviceManagementModel.DeviceManagementSchema.findOne({"_id": mongoose.Types.ObjectId(ReceivingData.Device)}, {}, {})
            .populate({ path: 'Location', select: 'Location_Name'})
            .populate({ path: 'Cluster', select: 'Cluster_Name' })
            .populate({ path: 'Hospital', select: 'Hospital_Name' })
            .exec(function(err_1, result_1) {
               if (err_1) {
                  res.status(417).send({ Status: false, Message: "Some error occurred while Find the Device Details!.", Error: err_1 });
               } else {
                  res.status(200).send({ Status: true, Response: result_1 });
               }
            });
         }
      });
   }
};


// Device Delete 
exports.Device_Delete = function(req, res){
   var ReceivingData = req.body;
   if(!ReceivingData.Device || ReceivingData.Device === '' ) {
      res.status(400).send({Status: false, Message: "Device Details can not be empty" });
   } else {
      DeviceManagementModel.DeviceManagementSchema
      .updateOne({_id: mongoose.Types.ObjectId(ReceivingData.Device)},{ $set: { If_Deleted: 'true'}})
      .exec(function(err, result){
         if(err) {
            res.status(417).send({Status: false, Message: "Some error occurred!.", Error: err });
         } else {
            res.status(200).send({Status: true, Response: result });
         }
      });
   }
};