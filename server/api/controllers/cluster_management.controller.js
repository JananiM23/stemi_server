var StemiClusterModel = require('./../models/cluster_management.model');
var ControlPanelModel = require('./../models/control_panel.model');
var HospitalManagementModel = require('../models/hospital_management.model');
var IdProofConfigModel = require('./../models/config_idproof.model');
var mongoose = require('mongoose');


// Stemi Cluster Create ---------------------------------------------
exports.StemiCluster_Create = function (req, res) {
   var ReceivingData = req.body;

   if (!ReceivingData.Cluster_Name || ReceivingData.Cluster_Name === '') {
      res.status(400).send({ Status: false, Message: "Cluster Name can not be empty" });
   } else if(!ReceivingData.Location || ReceivingData.Location === null ) {
      res.status(400).send({ Status: false, Message: "Location can not be empty" });
    } else if(!ReceivingData.Cluster_Type || ReceivingData.Cluster_Type === '') {
      res.status(400).send({ Status: false, Message: "Cluster Type can not be empty" });
    } else {
       
      if(ReceivingData.Location && typeof ReceivingData.Location === 'object' && ReceivingData.Location !== '' && ReceivingData.Location !== null) {
         ReceivingData.Location = mongoose.Types.ObjectId(ReceivingData.Location._id);    
      } else {
         ReceivingData.Location = null;
      }
       
      if(ReceivingData.IfControlPanelDuplicate && ReceivingData.DuplicateFrom && typeof ReceivingData.DuplicateFrom === 'object' && ReceivingData.DuplicateFrom !== '' && ReceivingData.DuplicateFrom !== null) {
         ReceivingData.DuplicateFrom = mongoose.Types.ObjectId(ReceivingData.DuplicateFrom._id);    
      } else {
         ReceivingData.DuplicateFrom = null;
      }

      Promise.all([
         StemiClusterModel.ClusterSchema.findOne({Location: ReceivingData.Location}, {}, {'sort': {Cluster_Code: -1} }).exec(),
         ControlPanelModel.AllFieldsSchema.find({If_Deleted: false, Active_Status: true}, {}, {sort: {createdAt: 1} }).exec(),
         StemiClusterModel.ClusterControlPanelSchema.find({Cluster: ReceivingData.DuplicateFrom, If_Deleted: false, Active_Status: true}, {}, {sort: {createdAt: 1} }).exec(),
         IdProofConfigModel.IdProofConfigSchema.findOne({}).exec()
      ]).then(response => {
         if(ReceivingData.Hospital && typeof ReceivingData.Hospital === 'object' && ReceivingData.Hospital !== '' && ReceivingData.Hospital !== null) {
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
         var IdProofConfig = response[3];
         var Cluster_Code = response[0] !== null ? (response[0].Cluster_Code + 1) : 1 ;
         const Create_StemiCluster = new StemiClusterModel.ClusterSchema({
            Location: ReceivingData.Location || null,
            Data_Type: ReceivingData.Data_Type || '',
            Cluster_Name: ReceivingData.Cluster_Name || '',
            Cluster_Type: ReceivingData.Cluster_Type || '',
            Post_Date: ReceivingData.Post_Date,
            Hospital: ReceivingData.Hospital || null,
            HospitalsArray: ReceivingData.HospitalsArray || [],
            Cluster_Code: Cluster_Code || '', 
            IfControlPanelDuplicate: ReceivingData.IfControlPanelDuplicate || null,
            DuplicateFrom: ReceivingData.DuplicateFrom,
            Active_Status: true,
            If_Deleted: false
         });
         Create_StemiCluster.save(function (err_1, result_1) {
            if (err_1) {
               res.status(417).send({ Status: false, Message: "Some error occurred while Creating the Cluster!.", Error: err_1 });
            } else {
               var Hospitals = [];
               if (ReceivingData.Hospital && ReceivingData.Hospital !== null && ReceivingData.Hospital !== '') {
                  Hospitals.push(mongoose.Types.ObjectId(ReceivingData.Hospital));
               }
               if (ReceivingData.HospitalsArray && typeof ReceivingData.HospitalsArray === 'object' && ReceivingData.HospitalsArray !== '' && ReceivingData.HospitalsArray !== null) {
                  ReceivingData.HospitalsArray.map(obj => {
                     Hospitals.push(mongoose.Types.ObjectId(obj));
                  });
               }
               const Create_ClusterConfig = new IdProofConfigModel.Cluster_IdProofControlSchema({
                  Cluster: result_1._id,
                  Config_Details: [],  
                  Active_Status: true,
                  If_Deleted: false
               });
               Create_ClusterConfig.save();

               var ClusterMappings_Schema = [];
               Hospitals.map((obj, i)=> {
                  const Create_ClusterMapping = new StemiClusterModel.ClusterMappingSchema({
                     Cluster: result_1._id,
                     ClusterHospital: obj,
                     ClusterHospital_Code: i+1,
                     ClusterHospital_Type: 'ClusterHub',
                     Connected_ClusterHub: null,   
                     Active_Status: true,
                     If_Deleted: false
                  });
                  ClusterMappings_Schema.push(Create_ClusterMapping);
               });
               var Controls = [];
               if (result_1.IfControlPanelDuplicate && response[2].length > 0) {
                  Controls = response[2];
               } else {
                  Controls = response[1];
               }

               var ClusterControlPanel_Schema = [];
               Controls.map(obj => {
                  if (obj.Parent && obj.Parent !== null) {
                     const PIndex = Controls.findIndex(objNew => (objNew._id).toString() === (obj.Parent).toString());
                     obj.Parent = ClusterControlPanel_Schema[PIndex]._id;
                  }
                  if (obj.Min_Number_Field && obj.Min_Number_Field !== null) {
                     const PIndex = Controls.findIndex(objNew => (objNew._id).toString() === (obj.Min_Number_Field).toString());
                     obj.Min_Number_Field = ClusterControlPanel_Schema[PIndex]._id;
                  }
                  if (obj.Max_Number_Field && obj.Max_Number_Field !== null) {
                     const PIndex = Controls.findIndex(objNew => (objNew._id).toString() === (obj.Max_Number_Field).toString());
                     obj.Max_Number_Field = ClusterControlPanel_Schema[PIndex]._id;
                  }
                  if (obj.Min_Date_Field && obj.Min_Date_Field !== null) {
                     const PIndex = Controls.findIndex(objNew => (objNew._id).toString() === (obj.Min_Date_Field).toString());
                     obj.Min_Date_Field = ClusterControlPanel_Schema[PIndex]._id;
                  }
                  if (obj.Max_Date_Field && obj.Max_Date_Field !== null) {
                     const PIndex = Controls.findIndex(objNew => (objNew._id).toString() === (obj.Max_Date_Field).toString());
                     obj.Max_Date_Field = ClusterControlPanel_Schema[PIndex]._id;
                  }
                  if (obj.Min_Date_Array && obj.Min_Date_Array.length > 0) {
                     obj.Min_Date_Array = obj.Min_Date_Array.map( objNew => {
                        const PIndex = Controls.findIndex(objNewNew => (objNewNew._id).toString() === (objNew.Min_Date_Field).toString());
                        objNew.Min_Date_Field = ClusterControlPanel_Schema[PIndex]._id;
                        return objNew;
                     });
                  }
                  if (obj.Max_Date_Array && obj.Max_Date_Array.length > 0) {
                     obj.Max_Date_Array = obj.Max_Date_Array.map( objNew => {
                        const PIndex = Controls.findIndex(objNewNew => (objNewNew._id).toString() === (objNew.Max_Date_Field).toString());
                        objNew.Max_Date_Field = ClusterControlPanel_Schema[PIndex]._id;
                        return objNew;
                     });
                  }
                  const Create_ClusterControlPanel = new StemiClusterModel.ClusterControlPanelSchema({
                     _id: mongoose.Types.ObjectId(),
                     Cluster: result_1._id,
                     Name: obj.Name,
                     Key_Name: obj.Key_Name,
                     Type: obj.Type,
                     If_Child_Available: obj.If_Child_Available,
                     If_Parent_Available: obj.If_Parent_Available,
                     Parent: obj.Parent,
                     Visibility: obj.Visibility,
                     Mandatory: obj.Mandatory,
                     Validation: obj.Validation,
                     If_Validation_Control_Array: obj.If_Validation_Control_Array,
                     Validation_Control_Array: obj.Validation_Control_Array,
                     If_Date_Restriction: obj.If_Date_Restriction,
                     If_Min_Date_Restriction: obj.If_Min_Date_Restriction,
                     Min_Date_Field: obj.Min_Date_Field,
                     If_Min_Date_Array_Available: obj.If_Min_Date_Array_Available,
                     Min_Date_Array: obj.Min_Date_Array,
                     If_Max_Date_Restriction: obj.If_Max_Date_Restriction,
                     Max_Date_Field: obj.Max_Date_Field,
                     If_Max_Date_Array_Available: obj.If_Max_Date_Array_Available,
                     Max_Date_Array: obj.Max_Date_Array,
                     If_Future_Date_Available: obj.If_Future_Date_Available,
                     If_Number_Restriction: obj.If_Number_Restriction,
                     If_Min_Number_Restriction: obj.If_Min_Number_Restriction,
                     Min_Number_Value: obj.Min_Number_Value,
                     If_Min_Number_Field_Restriction: obj.If_Min_Number_Field_Restriction,
                     Min_Number_Field: obj.Min_Number_Field,
                     If_Max_Number_Restriction: obj.If_Max_Number_Restriction,
                     Max_Number_Value: obj.Max_Number_Value,
                     If_Max_Number_Field_Restriction: obj.If_Max_Number_Field_Restriction,
                     Max_Number_Field: obj.Max_Number_Field,
                     Category: obj.Category,
                     Sub_Category: obj.Sub_Category,
                     Sub_Junior_Category: obj.Sub_Junior_Category,
                     Active_Status: obj.Active_Status,
                     If_Deleted: obj.If_Deleted,
                  });
                  ClusterControlPanel_Schema.push(Create_ClusterControlPanel);
               });

               Promise.all(
                  ClusterMappings_Schema.map(obj => {
                     return obj.save();
                  })
               ).then(response => {
                  Promise.all(
                     ClusterControlPanel_Schema.map( (obj, i) => {
                        setTimeout(() => {
                           return obj.save();
                        }, 100 * i);
                     })
                  ).then(response_1 => {
                     Promise.all(
                        response.map(obj => {
                           return HospitalManagementModel.HospitalManagementSchema
                           .updateOne( { _id: obj.ClusterHospital},
                                       {  $set: { If_Cluster_Mapped: true, Cluster_ConnectionType: 'ClusterHub' },
                                          $push: { Connected_Clusters: obj.Cluster } })
                           .exec();
                        })
                     ).then(response_2 => {
                        res.status(200).send({ Status: true, Response: response_2 });
                     }).catch(err_4 => {
                        console.log( 'Cluster Mapping Created But Hospital Not Updated');
                        // console.log(err_4);
                     });
                  }).catch(err_3 => {
                     console.log( 'Cluster Created But Cluster Control Panel Not Created');
                     // console.log(err_3);
                  });
               }).catch(err_2 => {
                  console.log( 'Cluster Created But Mapping Not Created');
                  // console.log(err_2);
               });
            }
         });
      }).catch(Err => {
         console.log( 'Cluster Created But Mapping Not Created');
         // console.log(Err);
      });

   }
};

// Stemi Cluster Update
exports.StemiCluster_Update =  function(req, res) {
   var ReceivingData = req.body;

   if(!ReceivingData.Cluster_id || ReceivingData.Cluster_id === '' ) {
      res.status(400).send({Status: false, Message: "Cluster can not be empty" });
   } else if(!ReceivingData.Cluster_Name || ReceivingData.Cluster_Name === '' ) {
      res.status(400).send({Status: false, Message: "Cluster Name can not be empty" });
   } else if(!ReceivingData.Data_Type || ReceivingData.Data_Type === '' ) {
      res.status(400).send({Status: false, Message: "Data Type can not be empty" });
   }  else {
      ReceivingData.Cluster_id = mongoose.Types.ObjectId(ReceivingData.Cluster_id);
      StemiClusterModel.ClusterSchema.updateOne({_id: ReceivingData.Cluster_id}, { $set: { Cluster_Name: ReceivingData.Cluster_Name, Data_Type: ReceivingData.Data_Type, Post_Date: ReceivingData.Post_Date }}).exec( function(err, result){
         if(err) {
            res.status(417).send({Status: false, Message: "Some error occurred!.", Error: err });
         } else {
            StemiClusterModel.ClusterSchema
            .findOne({_id: ReceivingData.Cluster_id}, {}, {})
            .populate({ path: 'Location', select: ['Location_Name', 'Location_Code']})
            .populate({ path: 'Hospital', select: 'Hospital_Name'})
            .populate({ path: 'HospitalsArray', select: 'Hospital_Name'})
            .exec( function(err_1, result_1){
               if(err_1) {
                  res.status(417).send({Status: false, Message: "Some error occurred!.", Error: err_1 });
               } else {
                  res.status(200).send({Status: true, Message: "Cluster Details Successfully Updated", Response: result_1 });
               }
            });
         }
      });
   } 
};


// Stemi Cluster View ---------------------------------------------
exports.StemiCluster_View = function(req, res) {
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
         if (obj.Type === 'Number') {
            FindQuery[obj.DBName] = parseInt(obj.Value, 10);
         }        
         if (obj.Type === 'Select') {
            FindQuery[obj.DBName] = obj.Value;
         }
         if (obj.Type === 'Object') {
            if (obj.Key === 'HospitalName') {
               FindQuery['$or'] = [ {'Hospital': mongoose.Types.ObjectId(obj.Value._id) }, { 'HospitalsArray': mongoose.Types.ObjectId(obj.Value._id)}];
            } else {
               FindQuery[obj.DBName] = mongoose.Types.ObjectId(obj.Value._id);
            }
         }
      });
   } 
   Promise.all([
      StemiClusterModel.ClusterSchema
      .aggregate([
         { $match: FindQuery},
         { $lookup: {
            from: "Stemi_Location",
            let: { "location": "$Location"},
            pipeline: [
               { $match: { $expr: { $eq: ["$$location", "$_id"] } } },
               { $project: { "Location_Name": 1, "Location_Code": 1 }}
            ],
            as: 'Location' } },
         { $unwind: { path: "$Location",  preserveNullAndEmptyArrays: true } },
         { $addFields: { Location: { $ifNull: [ "$Location", null ] }  } },
         { $lookup: {
            from: "Stemi_Hospital_Management",
            let: { "hospital": "$Hospital"},
            pipeline: [
               { $match: { $expr: { $eq: ["$$hospital", "$_id"] } } },
               { $project: { "Hospital_Name": 1 }}
            ],
            as: "Hospital" } },
         { $unwind: { path: "$Hospital",  preserveNullAndEmptyArrays: true } },
         { $addFields: { Hospital: { $ifNull: [ "$Hospital", null ] }  } },
         { $lookup: {
            from: "Stemi_Hospital_Management",
            let: { "hospitalsArray": "$HospitalsArray"},
            pipeline: [
               { $match: { $expr: { $in: ["$_id", "$$hospitalsArray"] } } },
               { $project: { "Hospital_Name": 1 }}
            ],
            as: "HospitalsArray" } },

         { $lookup: {
            from: "Stemi_Cluster",
            let: { "duplicateFrom": "$DuplicateFrom"},
            pipeline: [
               { $match: { $expr: { $eq: ["$$duplicateFrom", "$_id"] } } },
               { $project: { "Cluster_Name": 1 }}
            ],
            as: 'DuplicateFrom' } },
         { $unwind: { path: "$DuplicateFrom",  preserveNullAndEmptyArrays: true } },
         { $addFields: { DuplicateFrom: { $ifNull: [ "$DuplicateFrom", null ] }  } },

         { $addFields: { HospitalSort: { $ifNull: [ "$Hospital.Hospital_Name", null ] }  } },
         { $addFields: { HospitalSort:
            { $ifNull: [ "$HospitalSort",
               { $cond:{
                  if: { $gt: [ { $size: "$HospitalsArray.Hospital_Name" } , 0 ] },
                  then: {  $arrayElemAt: [ "$HospitalsArray.Hospital_Name", 0 ]  },
                  else: null } } ] }  } },
         { $addFields: { HospitalSort: { $toLower: "$HospitalSort" } } },
         { $addFields: { LocationSort: { $toLower: "$Location.Location_Name" } } },
         { $addFields: { ClusterSort: { $toLower: "$Cluster_Name" } } },
         { $addFields: { ClusterTypeSort: { $toLower: "$Cluster_Type" } } },

         { $sort : ShortOrder },
         { $skip : Skip_Count },
         { $limit : Limit_Count }
      ]).exec(),
      StemiClusterModel.ClusterSchema.countDocuments(FindQuery).exec()
   ]).then(result => {
      res.status(200).send({Status: true, Response: result[0], SubResponse: result[1] });
   }).catch(err => {
      res.status(417).send({Status: false, ErrorCode: 417, ErrorMessage: "Some error occurred while Find The Locations list!."});
   });
};


exports.Clusters_SimpleList = function(req, res) {
   var ReceivingData = req.body;
   StemiClusterModel.ClusterSchema
   .find({ Active_Status: true }, {Cluster_Name: 1})
   .exec(function(err, result){
      if(err) {
         res.status(417).send({Status: false, Message: "Some error occurred!.", Error: err });
      } else {
         result = result.sort(function(Obj1, Obj2) { return Obj1.Cluster_Name.localeCompare(Obj2.Cluster_Name); });
         res.status(200).send({Status: true, Response: result });
      }
   });  
};


// Cluster Name Async Validate -----------------------------------------------
exports.StemiCluster_AsyncValidate = function(req, res) {
   var ReceivingData = req.body;

   if(!ReceivingData.Cluster_Name || ReceivingData.Cluster_Name === '' ) {
      res.status(400).send({Status: false, Message: "Cluster Name can not be empty" });
   } else if (!ReceivingData.Location || ReceivingData.Location === '') {
      res.status(400).send({Status: false, Message: "Location can not be empty" });
   } else {
      StemiClusterModel.ClusterSchema.findOne({ 'Cluster_Name': { $regex : new RegExp("^" + ReceivingData.Cluster_Name + "$", "i") },
                                                'If_Deleted': false,
                                                'Location': mongoose.Types.ObjectId(ReceivingData.Location)}, {}, {}, function(err, result) {
         if(err) {
            res.status(417).send({status: false, Message: "Some error occurred while Find the Cluster!."});
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


exports.ClusterBased_Hospitals = function(req, res){
   var ReceivingData = req.body;
   if(!ReceivingData.Cluster_Id || ReceivingData.Cluster_Id === '' ) {
      res.status(400).send({Status: false, ErrorCode: 400, Message: "Cluster Details can not be empty" });
   }else {
      StemiClusterModel.ClusterMappingSchema
      .find({ 'Cluster': mongoose.Types.ObjectId(ReceivingData.Cluster_Id), 'Active_Status': true, 'If_Deleted': false}, {ClusterHospital: 1}, {'short': {createdAt: 1}})
      .populate({ path: 'ClusterHospital', select: ['Hospital_Name', 'Hospital_Role'] })
      .exec(function(err,result){
         if(err) {
            res.status(417).send({status: false, ErrorCode: 417, Message: "Some error occurred!.", Error: err });
         } else {
            result = result.map(obj => { return {Hospital_Name: obj.ClusterHospital.Hospital_Name, Hospital_Role: obj.ClusterHospital.Hospital_Role, _id: obj.ClusterHospital._id}; } );
            result = result.sort(function(Obj1, Obj2) { return Obj1.Hospital_Name.localeCompare(Obj2.Hospital_Name); });
            res.status(200).send({Status: true, Response: result });
         }
      });
   }
};


exports.ClusterBased_ControlPanelFields = function(req, res){
   var ReceivingData = req.body;
   if(!ReceivingData.Cluster_Id || ReceivingData.Cluster_Id === '' ) {
      res.status(400).send({Status: false, ErrorCode: 400, Message: "Cluster Details can not be empty" });
   }else {
      StemiClusterModel.ClusterControlPanelSchema
      .find({ 'Cluster': mongoose.Types.ObjectId(ReceivingData.Cluster_Id), 'Active_Status': true, 'If_Deleted': false}, {}, {'short': {createdAt: 1}})
      .populate({ path: 'Cluster', select: 'Cluster_Name' })
      .populate({ path: 'Parent', select: ['Name', 'Key_Name'] })
      .populate({ path: 'Validation_Control_Array.Validation_Control', select: ['Name', 'Description'] })
      .populate({ path: 'Min_Date_Field', select: ['Name', 'Key_Name'] })
      .populate({ path: 'Max_Date_Field', select: ['Name', 'Key_Name'] })
      .populate({ path: 'Min_Date_Array.Min_Date_Field', select: ['Name', 'Key_Name'] })
      .populate({ path: 'Max_Date_Array.Max_Date_Field', select: ['Name', 'Key_Name'] })
      .populate({ path: 'Min_Number_Field', select: ['Name', 'Key_Name'] })
      .populate({ path: 'Max_Number_Field', select: ['Name', 'Key_Name'] })
      .exec(function(err,result){
         if(err) {
            res.status(417).send({status: false, ErrorCode: 417, Message: "Some error occurred!.", Error: err });
         } else {
				result = result.sort((a,b) => { return new Date(a.createdAt) - new Date(b.createdAt); });
            res.status(200).send({Status: true, Response: result });
         }
      });
   }
};

exports.ClusterControlPanel_Update= function(req, res) {
   var ReceivingData = req.body;

   if (ReceivingData.ModifiedRecords !== null && typeof ReceivingData.ModifiedRecords !== 'object') {
      res.status(400).send({ Status: false, Message: "Some Error Occurred !, Please Try Again" });
   } else if(!ReceivingData.Cluster_Id || ReceivingData.Cluster_Id === '' ) {
      res.status(400).send({Status: false, ErrorCode: 400, Message: "Cluster Details can not be empty" });
   } else {

      Promise.all(
         ReceivingData.ModifiedRecords.map(Obj => UpdateData(Obj) )
      ).then(response => {
         StemiClusterModel.ClusterControlPanelSchema
         .find({'Cluster': mongoose.Types.ObjectId(ReceivingData.Cluster_Id), 'Active_Status': true, 'If_Deleted': false}, {}, {sort: { createdAt: 1 }})
         .populate({ path: 'Parent', select: ['Name', 'Key_Name'] })
         .populate({ path: 'Validation_Control_Array.Validation_Control', select: ['Name', 'Description'] })
         .populate({ path: 'Min_Date_Field', select: ['Name', 'Key_Name'] })
         .populate({ path: 'Max_Date_Field', select: ['Name', 'Key_Name'] })
         .populate({ path: 'Min_Date_Array.Min_Date_Field', select: ['Name', 'Key_Name'] })
         .populate({ path: 'Max_Date_Array.Max_Date_Field', select: ['Name', 'Key_Name'] })
         .populate({ path: 'Min_Number_Field', select: ['Name', 'Key_Name'] })
         .populate({ path: 'Max_Number_Field', select: ['Name', 'Key_Name'] })
         .exec(function(err, result) {
            if(err) {
               res.status(417).send({status: false, Message: "Some error occurred while Find The Fields!.", Error: err });
            } else {
               res.status(200).send({Status: true, Response: result });
            }
         });
      }).catch(err => {
         res.status(200).send({Status: true, Response: err });
      });


      function UpdateData(Obj) {
         return new Promise( (resolve, reject) => {

            // Validations -------------------------------
            if (Obj.Validation_Control_Array && Obj.Validation_Control_Array !== null && typeof Obj.Validation_Control_Array === 'object') {
               Obj.Validation_Control_Array = Obj.Validation_Control_Array.map((Obj_1, index) => {
                  const ReturnObj = {
                     Order_No: index + 1,
                     Validation_Control: mongoose.Types.ObjectId(Obj_1)
                  };
                  return ReturnObj;
               });
            }
            Obj.If_Date_Restriction = (Obj.If_Min_Date_Restriction || Obj.If_Min_Date_Array_Available || Obj.If_Max_Date_Restriction || Obj.If_Max_Date_Array_Available ) ? true : false;
            Obj.Min_Date_Field = (Obj.Min_Date_Field && Obj.Min_Date_Field !== null) ? mongoose.Types.ObjectId(Obj.Min_Date_Field) : null;
            if (Obj.Min_Date_Array && Obj.Min_Date_Array !== null && typeof Obj.Min_Date_Array === 'object') {
               Obj.Min_Date_Array = Obj.Min_Date_Array.map((Obj_1, index) => {
                  const ReturnObj = {
                     Order_No: index + 1,
                     Min_Date_Field: mongoose.Types.ObjectId(Obj_1)
                  };
                  return ReturnObj;
               });
            }
            Obj.Max_Date_Field = (Obj.Max_Date_Field && Obj.Max_Date_Field !== null) ? mongoose.Types.ObjectId(Obj.Max_Date_Field) : null;
            if (Obj.Max_Date_Array && Obj.Max_Date_Array !== null && typeof Obj.Max_Date_Array === 'object') {
               Obj.Max_Date_Array = Obj.Max_Date_Array.map((Obj_1, index) => {
                  const ReturnObj = {
                     Order_No: index + 1,
                     Max_Date_Field: mongoose.Types.ObjectId(Obj_1)
                  };
                  return ReturnObj;
               });
            }
            Obj.If_Number_Restriction = (Obj.If_Min_Number_Restriction || Obj.If_Min_Number_Field_Restriction || Obj.If_Max_Number_Restriction || Obj.If_Max_Number_Field_Restriction ) ? true : false;
            Obj.Min_Number_Field = (Obj.Min_Number_Field && Obj.Min_Number_Field !== null) ? mongoose.Types.ObjectId(Obj.Min_Number_Field) : null;
            Obj.Max_Number_Field = (Obj.Max_Number_Field && Obj.Max_Number_Field !== null) ? mongoose.Types.ObjectId(Obj.Max_Number_Field) : null;

            // Update Query ------------------------------
            StemiClusterModel.ClusterControlPanelSchema.updateOne(
               { _id: mongoose.Types.ObjectId(Obj._id) },
               { $set: {
                  Visibility : Obj.Visibility,
                  Mandatory: Obj.Mandatory,
                  Validation: Obj.Validation,
                  If_Validation_Control_Array: Obj.If_Validation_Control_Array,
                  Validation_Control_Array: Obj.Validation_Control_Array,
                  If_Date_Restriction: Obj.If_Date_Restriction,
                  If_Min_Date_Restriction: Obj.If_Min_Date_Restriction,
                  Min_Date_Field: Obj.Min_Date_Field,
                  If_Min_Date_Array_Available: Obj.If_Min_Date_Array_Available,
                  Min_Date_Array: Obj.Min_Date_Array,
                  If_Max_Date_Restriction: Obj.If_Max_Date_Restriction,
                  Max_Date_Field: Obj.Max_Date_Field,
                  If_Max_Date_Array_Available: Obj.If_Max_Date_Array_Available,
                  Max_Date_Array: Obj.Max_Date_Array,
                  If_Future_Date_Available: Obj.If_Future_Date_Available,
                  If_Number_Restriction: Obj.If_Number_Restriction,
                  If_Min_Number_Restriction: Obj.If_Min_Number_Restriction,
                  Min_Number_Value: Obj.Min_Number_Value,
                  If_Min_Number_Field_Restriction: Obj.If_Min_Number_Field_Restriction,
                  Min_Number_Field: Obj.Min_Number_Field,
                  If_Max_Number_Restriction: Obj.If_Max_Number_Restriction,
                  Max_Number_Value: Obj.Max_Number_Value,
                  If_Max_Number_Field_Restriction: Obj.If_Max_Number_Field_Restriction,
                  Max_Number_Field: Obj.Max_Number_Field
               }}
            ).exec( function(err, result) {
               if (err) {
                  reject(err);
               } else {
                  resolve(result);
               }
            });

         });
      }
   }

};

exports.ClustersSimpleList_LocationBased = function(req, res){
   var ReceivingData = req.body;
   if(!ReceivingData.Location_Id || ReceivingData.Location_Id === '' ) {
      res.status(400).send({Status: false, ErrorCode: 400, Message: "Location Details can not be empty" });
   }else {
      StemiClusterModel.ClusterSchema
      .find({ 'Location': mongoose.Types.ObjectId(ReceivingData.Location_Id), 'If_Deleted': false}, {Cluster_Name: 1}, {'short': {createdAt: 1}})
      .exec(function(err,result){
         if(err) {
            res.status(417).send({status: false, ErrorCode: 417, Message: "Some error occurred!.", Error: err });
         } else {
            result = result.sort(function(Obj1, Obj2) { return Obj1.Cluster_Name.localeCompare(Obj2.Cluster_Name); });
            res.status(200).send({Status: true, Response: result });
         }
      });
   }
};


exports.ClusterDetails_RequiredForMapping = function(req, res) {
   var ReceivingData = req.body;
   if(!ReceivingData.Cluster_Id || ReceivingData.Cluster_Id === '' ) {
      res.status(400).send({Status: false, ErrorCode: 400, Message: "Cluster Details can not be empty" });
   }else {
      var Hospital_SelectArr = [ 'Hospital_Name', 'Hospital_Code', 'Hospital_Role',
                                 'Address', 'Country', 'State', 'City', 'Pin_Code',
                                 'Location', 'Latitude', 'Longitude', 'Hospital_Status',
                                 'If_Cluster_Mapped', 'Connected_Clusters', 'Active_Status', 'If_Deleted' ];
      var Hospital_SelectObj = { 'Hospital_Name': 1, 'Hospital_Code': 1, 'Hospital_Role': 1,
                                 'Address': 1, 'Country': 1, 'State': 1, 'City': 1, 'Pin_Code': 1,
                                 'Location': 1, 'Latitude': 1, 'Longitude': 1, 'Hospital_Status': 1,
                                 'If_Cluster_Mapped': 1, 'Connected_Clusters': 1, 'Active_Status': 1, 'If_Deleted': 1 };
      StemiClusterModel.ClusterSchema
      .findOne({ '_id': mongoose.Types.ObjectId(ReceivingData.Cluster_Id)}, {}, {})   
      .populate({ path: 'Location', select: ['Location_Name','Location_Code']})
      .populate({ path: 'Hospital', select: Hospital_SelectArr })
      .populate({ path: 'HospitalsArray', select: Hospital_SelectArr })
      .exec(function(err,result){
         if(err) {
            res.status(417).send({Status: false, ErrorCode: 417, Message: "Some error occurred!.", Error: err });
         } else {
            StemiClusterModel.ClusterMappingSchema
            .find({ 'Cluster': result._id, 'Active_Status': true, 'If_Deleted': false })
            .populate({ path: 'ClusterHospital', select: Hospital_SelectArr })
            .populate({ path: 'Connected_ClusterHub', select: Hospital_SelectArr })
            .exec(function(err_1, result_1){
               if(err_1) {
                  res.status(417).send({Status: false, Message: "Some error occurred!.", Error: err_1 });
               } else {
                  HospitalManagementModel.HospitalManagementSchema
                  .find({  'Location': mongoose.Types.ObjectId(result.Location._id),
                           'If_Cluster_Mapped': false,
                           'Hospital_Status': 'Approved',
                           'Active_Status': true,
                           'If_Deleted': false,
                           'Hospital_Role': { $ne: 'Hub H1'}}, Hospital_SelectObj)
                  .populate({ path: 'Connected_Clusters', select: ['Cluster_Name', 'Cluster_Type', 'Active_Status'] })
                  .exec(function(err_2, result_2){
                     if(err_2) {
                        res.status(417).send({Status: false, Message: "Some error occurred!.", Error: err_2 });
                     } else {
                        if (result.Cluster_Type === 'virtual') {
                           result_2 = result_2.filter(obj => obj.Hospital_Role !== 'Hub H2');
                        }
                        if (result.Cluster_Type === 'advanced') {
                           HospitalManagementModel.HospitalManagementSchema
                           .find({  'Location': mongoose.Types.ObjectId(result.Location._id),
                                    'Hospital_Status': 'Approved',
                                    'Active_Status': true,
                                    'If_Deleted': false,
                                    'Connected_Clusters': { $ne: result._id }}, Hospital_SelectObj)
                           .populate({ path: 'Connected_Clusters', select: ['Cluster_Name', 'Cluster_Type', 'Active_Status'] })
                           .exec(function(err_3, result_3) {
                              if(err_3) {
                                 res.status(417).send({Status: false, Message: "Some error occurred!.", Error: err_3 });
                              } else {
                                 var Response = { ClusterDetails: result, ClusterMappingDetails: result_1, UnLinkedHospitals: result_2, AllHospitals: result_3 };
                                 res.status(200).send({Status: true, Response: Response,  });
                              }
                           });
                        } else {
                           var Response = { ClusterDetails: result, ClusterMappingDetails: result_1, UnLinkedHospitals: result_2, AllHospitals: [] };
                           res.status(200).send({Status: true, Response: Response,  });
                        }
                     }
                  });
               }
            });
         }
      });
   }
};




exports.Add_HospitalTo_Cluster = function (req, res) {
   var ReceivingData = req.body;
      
   if (!ReceivingData.Cluster_Id || ReceivingData.Cluster_Id === '') {
      res.status(400).send({ Status: false, Message: "Cluster Details can not be empty" });
   } else if (!ReceivingData.Hospital_id || ReceivingData.Hospital_id === '') {
      res.status(400).send({ Status: false, Message: "Hospital Details can not be empty" });
   } else {
      ReceivingData.Cluster_Id = mongoose.Types.ObjectId(ReceivingData.Cluster_Id);
      ReceivingData.Hospital_id = mongoose.Types.ObjectId(ReceivingData.Hospital_id);

      if(ReceivingData.ConnectedHub && ReceivingData.ConnectedHub !== '') {
         ReceivingData.ConnectedHub = mongoose.Types.ObjectId(ReceivingData.ConnectedHub);
      } else {
         ReceivingData.ConnectedHub = null;
      }

      StemiClusterModel.ClusterMappingSchema.findOne({Cluster: ReceivingData.Cluster_Id}, {}, { 'sort': {ClusterHospital_Code: -1} }, function(err, result) {
         if (err) {
            res.status(417).send({ Status: false, Message: "Some error occurred while Find the Cluster!.", Error: err });
         } else {
            var NewClusterHospital_Code = result !== null ? result.ClusterHospital_Code + 1 : 1;
            const Create_ClusterMapping = new StemiClusterModel.ClusterMappingSchema({
               Cluster: ReceivingData.Cluster_Id,
               ClusterHospital: ReceivingData.Hospital_id,
               ClusterHospital_Code: NewClusterHospital_Code,
               ClusterHospital_Type: 'ClusterSpoke',
               Connected_ClusterHub: ReceivingData.ConnectedHub,
               Active_Status: true,
               If_Deleted: false
            });
            Create_ClusterMapping.save(function (err_1, result_1) {
               if (err_1) {
                  res.status(417).send({ Status: false, Message: "Some error occurred while Add the Hospital To the Cluster!.", Error: err_1 });
               } else {
                  HospitalManagementModel.HospitalManagementSchema
                  .updateOne( { _id: ReceivingData.Hospital_id },
                              { $set: { If_Cluster_Mapped: true, Cluster_ConnectionType: 'ClusterSpoke' },
                                 $push: { Connected_Clusters: ReceivingData.Cluster_Id } })
                  .exec(function (err_2, result_2) {
                     if (err_2) {
                        res.status(417).send({ Status: false, Message: "Some error occurred while Update the Hospital Cluster Details!.", Error: err_2 });
                     } else {
                        res.status(200).send({ Status: true, Message: 'Hospital Successfully Added to this Cluster' });
                     }
                  });
               }
            });
         }
      });
   }
};

exports.Remove_HospitalFrom_Cluster = function (req, res) {
   var ReceivingData = req.body;
      
   if (!ReceivingData.Cluster_Id || ReceivingData.Cluster_Id === '') {
      res.status(400).send({ Status: false, Message: "Cluster Details can not be empty" });
   } else if (!ReceivingData.Hospital_id || ReceivingData.Hospital_id === '') {
      res.status(400).send({ Status: false, Message: "Hospital Details can not be empty" });
   } else {
      ReceivingData.Cluster_Id = mongoose.Types.ObjectId(ReceivingData.Cluster_Id);
      ReceivingData.Hospital_id = mongoose.Types.ObjectId(ReceivingData.Hospital_id);
      Promise.all([
         HospitalManagementModel.HospitalManagementSchema
         .updateOne( { _id: ReceivingData.Hospital_id },
                     { $set: { If_Cluster_Mapped: false, Cluster_ConnectionType: '' },
                        $pull: { Connected_Clusters: ReceivingData.Cluster_Id } } )
         .exec(),
         StemiClusterModel.ClusterMappingSchema
         .updateOne( { Cluster: ReceivingData.Cluster_Id, ClusterHospital: ReceivingData.Hospital_id, Active_Status: true },
                     { $set: { Active_Status: false } } )
         .exec()
      ]).then(response => {
         res.status(200).send({ Status: true, Message: 'Hospital Successfully Removed From this Cluster' });
      }).catch( err => {
         res.status(417).send({ Status: false, Message: "Some error occurred while Remove the Hospital From this Cluster!.", Error: err_2 });
      });
   }
};

