var ConfigModel = require('./../models/config_idproof.model');
var StemiClusterModel = require('./../models/cluster_management.model');

var mongoose = require('mongoose');


exports.IdProofConfig_Create = function (req, res) {
   var ReceivingData = req.body;
      
   if (!ReceivingData.Name || ReceivingData.Name === '') {
      res.status(400).send({ Status: false, Message: "Proof can not be empty" });
   } else if (!ReceivingData.Key_Name || ReceivingData.Key_Name === '') {
      res.status(400).send({ Status: false, Message: "Key Name can not be empty" });
   } else {     
      const Create_Proof = new ConfigModel.IdProofConfigSchema({
         Name: ReceivingData.Name,
         Key_Name: ReceivingData.Key_Name,
         Active_Status: true,
         If_Deleted: false
      });
      Create_Proof.save(function (err_1, result_1) {
         if (err_1) {
            res.status(417).send({ Status: false, Message: "Some error occurred while creating the Id Proof!.", Error: err_1 });
         } else {
            ConfigModel.IdProofConfigSchema
            .find({If_Deleted: false}, {}, {'short': {createdAt: -1}})
            .exec(function(err,result){
               if(err) {
                  res.status(417).send({status: false, ErrorCode: 417, Message: "Some error occurred!.", Error: err });
               } else {
                  res.status(200).send({Status: true, Response: result });
               }
            });
         }
      });
   }
};


exports.Cluster_IdProofUpdate = function (req, res) {
   var ReceivingData = req.body;
      
   if (!ReceivingData.Config_Details || typeof ReceivingData.Config_Details !== 'object' || ReceivingData.Config_Details === []) {
      res.status(400).send({ Status: false, Message: "Config Details can not be empty" });
   } else if (!ReceivingData.ConfigId || ReceivingData.ConfigId === '') {
      res.status(400).send({ Status: false, Message: "Id-Proof Config can not be empty" });
   } else {
      ReceivingData.ConfigId = mongoose.Types.ObjectId(ReceivingData.ConfigId);
      ReceivingData.Config_Details = ReceivingData.Config_Details.map(obj => {
         obj.IdProof = mongoose.Types.ObjectId(obj);
         return obj;
      });
      ConfigModel.Cluster_IdProofControlSchema.findOne({_id: ReceivingData.ConfigId}, {}, {}, function(err_5, result_5) {
         if (err_5) {
            res.status(417).send({ Status: false, Message: "Some error occurred while Find the Cluster Config!.", Error: err_5 });
         } else {
            if (result_5 !== null) {
               ConfigModel.Cluster_IdProofControlSchema.updateOne({ _id: ReceivingData.ConfigId}, { $set: { Config_Details: ReceivingData.Config_Details } }
               ).exec(function (err_7, result_7) {
                  if (err_7) {
                     res.status(417).send({ Status: false, Message: "Some error occurred while Updating the Config!.", Error: err_7 });
                  } else {
                     res.status(200).send({ Status: true, Message: 'Successfully ID Proof Config Updated' });
                  }
               });
            } else {
               res.status(400).send({ Status: false, Message: 'invalid Cluster Id-Proof Config' }); 
            }
         }
      });     
   }
};


exports.IdProof_ConfigList = function(req, res) {
   var ReceivingData = req.body;

   ConfigModel.IdProofConfigSchema
   .find({If_Deleted: false}, {}, {'short': {createdAt: -1}})
   .exec(function(err,result){
      if(err) {
         res.status(417).send({status: false, ErrorCode: 417, Message: "Some error occurred!.", Error: err });
      } else {
         res.status(200).send({Status: true, Response: result });
      }
   });
};


exports.ClusterConfig_View = function(req, res) {
   var ReceivingData = req.body;
         
   if (!ReceivingData.Cluster || ReceivingData.Cluster === '') {
      res.status(400).send({ Status: false, Message: "Cluster can not be empty" });
   } else {
      ReceivingData.Cluster = mongoose.Types.ObjectId(ReceivingData.Cluster);
      ConfigModel.Cluster_IdProofControlSchema.findOne({Cluster: ReceivingData.Cluster}, {}, {'short': {createdAt: -1}})
      .exec(function(err,result){
         if(err) {
            res.status(417).send({status: false, ErrorCode: 417, Message: "Some error occurred!.", Error: err });
         } else {
            res.status(200).send({Status: true, Response: result });
         }
      });
   }
};


exports.ClusterConfig_DetailedView = function(req, res) {
   var ReceivingData = req.body;
         
   if (!ReceivingData.Cluster || ReceivingData.Cluster === '') {
      res.status(400).send({ Status: false, Message: "Cluster can not be empty" });
   } else {
      ReceivingData.Cluster = mongoose.Types.ObjectId(ReceivingData.Cluster._id);
      ConfigModel.Cluster_IdProofControlSchema.findOne({Cluster: ReceivingData.Cluster}, {}, {'short': {createdAt: -1}})
      .populate({path: 'Config_Details', select: ['Name', 'Key_Name']})
      .exec(function(err,result){
         if(err) {
            res.status(417).send({status: false, ErrorCode: 417, Message: "Some error occurred!.", Error: err });
         } else {
            res.status(200).send({Status: true, Response: result });
         }
      });
   }
};



exports.IdProofConfig_Delete = function (req, res) {
   var ReceivingData = req.body;

   if (!ReceivingData.ConfigId || ReceivingData.ConfigId === '') {
      res.status(400).send({ Status: false, Message: "Config Details can not be empty" });
   } else {
      ReceivingData.ConfigId = mongoose.Types.ObjectId(ReceivingData.ConfigId);

      ConfigModel.IdProofConfigSchema.updateOne( { _id: ReceivingData.ConfigId}, { $set: { "If_Deleted": true, "Active_Status": false } })
      .exec(function (err, result) {
         if (err) {
            res.status(417).send({ Status: false, Message: "Some error occurred while Updating the ID-Proof!.", Error: err });
         } else {
            ConfigModel.IdProofConfigSchema
            .find({If_Deleted: false}, {}, {'short': {createdAt: -1}})
            .exec(function(err_1,result_1){
               if(err_1) {
                  res.status(417).send({status: false, ErrorCode: 417, Message: "Some error occurred!.", Error: err_1 });
               } else {
                  res.status(200).send({Status: true, Response: result_1 });
               }
            });
         }
      });
   }
};