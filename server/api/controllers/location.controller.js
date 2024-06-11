var StemiLocationModel = require('./../models/location.model');
var mongoose = require('mongoose');


// Industry Type Async Validate -----------------------------------------------
exports.StemiLocation_AsyncValidate = function(req, res) {
   var ReceivingData = req.body;

   if(!ReceivingData.Location_Name || ReceivingData.Location_Name === '' ) {
      res.status(400).send({Status: false, Message: "Location Name can not be empty" });
   }else {
      StemiLocationModel.LocationSchema.findOne({'Location_Name': { $regex : new RegExp("^" + ReceivingData.Location_Name + "$", "i") }, 'If_Deleted': false }, {}, {}, function(err, result) {
         if(err) {
            res.status(417).send({status: false, Message: "Some error occurred while Find the Location!."});
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

// Stemi location Create ---------------------------------------------
exports.StemiLocation_Create = function (req, res) {
   var ReceivingData = req.body;
      
   if (!ReceivingData.Location_Name || ReceivingData.Location_Name === '') {
      res.status(400).send({ Status: false, Message: "Location Name can not be empty" });
   } else {
      StemiLocationModel.LocationSchema.findOne({}, {}, {'sort': {createdAt: -1} }, function(err, result) {
         if (err) {
            res.status(417).send({ Status: false, Message: "Some error occurred while Find the Location!.", Error: err });
         } else {
            var Location_Code = result !== null ? (result.Location_Code + 1) : 1 ;
            const Create_StemiLocation = new StemiLocationModel.LocationSchema({
               Location_Name: ReceivingData.Location_Name,
               Location_Code: Location_Code,      
               Active_Status: true,
               If_Deleted: false
            });
            Create_StemiLocation.save(function (err_1, result_1) {
               if (err_1) {
                  res.status(417).send({ Status: false, Message: "Some error occurred while Creating the Location!.", Error: err_1 });
               } else {
                  res.status(200).send({ Status: true, Response: result_1 });
               }
            });
         }
      });
   }
};


// Stemi locations List ---------------------------------------------
exports.StemiLocations_List = function(req, res) {
   var ReceivingData = req.body;

   const Skip_Count = parseInt(ReceivingData.Skip_Count, 0) || 0;
   const Limit_Count = parseInt(ReceivingData.Limit_Count, 0) || 5;
   var ShortOrder = {updatedAt: -1};
   var ShortKey = ReceivingData.ShortKey;
   var ShortCondition = ReceivingData.ShortCondition;
   var FindQuery = {'If_Deleted': false};
   if ( ShortKey && ShortKey !== null && ShortKey !== '' && ShortCondition && ShortCondition !== null && ShortCondition !== ''){           
      ShortOrder = {};
      ShortOrder[ShortKey] = ShortCondition === 'Ascending' ? 1 : -1 ;
   }
   if (ReceivingData.FilterQuery && typeof ReceivingData.FilterQuery === 'object' && ReceivingData.FilterQuery !== null && ReceivingData.FilterQuery.length > 0) {
      ReceivingData.FilterQuery.map(obj => {
         if (obj.Type === 'String') {
            FindQuery[obj.DBName] = { $regex : new RegExp(".*" + obj.Value + ".*", "i") };
         }
         if (obj.Type === 'Number') {
            FindQuery[obj.DBName] = parseInt(obj.Value, 10);
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
      });
   }   
   Promise.all([
      StemiLocationModel.LocationSchema
      .aggregate([
         { $match: FindQuery},
         { $addFields: { LocationNameSort: { $toLower: "$Location_Name" } } },
         { $sort : ShortOrder },
         { $skip : Skip_Count },
         { $limit : Limit_Count }
      ]).exec(),
      StemiLocationModel.LocationSchema.countDocuments(FindQuery).exec()
   ]).then(result => {
      res.status(200).send({Status: true, Response: result[0], SubResponse: result[1] });
   }).catch(err => {
      console.log(err);
      res.status(417).send({Status: false, ErrorCode: 417, ErrorMessage: "Some error occurred while Find The Locations list!."});
   });
};


exports.StemiLocations_SimpleList = function(req, res){
   var ReceivingData = req.body;
   StemiLocationModel.LocationSchema
      .find({'If_Deleted': false}, {Location_Name: 1}, {'short': {createdAt: 1}})
      .exec(function(err,result){
         if(err) {
            res.status(417).send({status: false, ErrorCode: 417, Message: "Some error occurred!.", Error: err });
         } else {
            result = result.sort(function(Obj1, Obj2) { return Obj1.Location_Name.localeCompare(Obj2.Location_Name); });
            res.status(200).send({Status: true, Response: result });
         }
      });
};


// Stemi location Update ---------------------------------------------
exports.StemiLocation_Update = function (req, res) {
   var ReceivingData = req.body;

   if (!ReceivingData.LocationId || ReceivingData.LocationId === '') {
      res.status(400).send({ Status: false, Message: "Location Details can not be empty" });
   }else if (!ReceivingData.Location_Name || ReceivingData.Location_Name === '') {
      res.status(400).send({ Status: false, Message: "Location Name can not be empty" });
   } else {
      StemiLocationModel.LocationSchema.updateOne(
         { "_id": mongoose.Types.ObjectId(ReceivingData.LocationId)}, { $set: { "Location_Name": ReceivingData.Location_Name } }
      ).exec(function (err, result) {
         if (err) {
            res.status(417).send({ Status: false, Message: "Some error occurred while Updating the Location!.", Error: err });
         } else {
            StemiLocationModel.LocationSchema.findOne({"_id": mongoose.Types.ObjectId(ReceivingData.LocationId)}, {}, {}, function(err_1, result_1) {
               if (err_1) {
                  res.status(417).send({ Status: false, Message: "Some error occurred while Find the Location!.", Error: err_1 });
               } else {
                  res.status(200).send({ Status: true, Response: result_1 });
               }
            });
         }
      });
   }
};