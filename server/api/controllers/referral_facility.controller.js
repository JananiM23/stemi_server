var ReferralFacilityModel = require('./../models/referral_facility.model');
var mongoose = require('mongoose');


// Hospital Name Async Validate -----------------------------------------------
exports.ReferralFacility_AsyncValidate = function(req, res) {
   var ReceivingData = req.body;

   if(!ReceivingData.Hospital_Name || ReceivingData.Hospital_Name === '' ) {
      res.status(400).send({Status: false, Message: "Hospital Name can not be empty" });
   }else {
      ReferralFacilityModel.ReferralFacilitySchema.findOne({'Hospital_Name': { $regex : new RegExp("^" + ReceivingData.Hospital_Name + "$", "i") }, 'If_Deleted': false }, {}, {}, function(err, result) {
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

// Referral Facility Create ---------------------------------------------
exports.ReferralFacility_Create = function (req, res) {
   var ReceivingData = req.body;
      
   if (!ReceivingData.Hospital_Name || ReceivingData.Hospital_Name === '') {
      res.status(400).send({ Status: false, Message: "Hospital Name can not be empty" });
	} else if (!ReceivingData.Hospital_Type || ReceivingData.Hospital_Type === '') {
      res.status(400).send({ Status: false, Message: "Hospital type can not be empty" });
	} else if (!ReceivingData.Hospital_Address || ReceivingData.Hospital_Address === '') {
      res.status(400).send({ Status: false, Message: "Hospital Address can not be empty" });
   } else {
		const Create_ReferralFacility = new ReferralFacilityModel.ReferralFacilitySchema({
			Hospital_Name: ReceivingData.Hospital_Name,
			Hospital_Type: ReceivingData.Hospital_Type,
			Hospital_Address: ReceivingData.Hospital_Address,            
			Active_Status: true,
			If_Deleted: false
		});
		Create_ReferralFacility.save(function (err_1, result_1) {
			if (err_1) {
				res.status(417).send({ Status: false, Message: "Some error occurred while Creating the Referral Facility!.", Error: err_1 });
			} else {
				res.status(200).send({ Status: true, Response: result_1 });
			}
		});
   }
};


// Referral Facilities List ---------------------------------------------
exports.ReferralFacilities_List = function(req, res) {
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
      ReferralFacilityModel.ReferralFacilitySchema
      .aggregate([
         { $match: FindQuery},
         { $addFields: { HospitalNameSort: { $toLower: "$Hospital_Name" } } },
         { $sort : ShortOrder },
         { $skip : Skip_Count },
         { $limit : Limit_Count }
      ]).exec(),
      ReferralFacilityModel.ReferralFacilitySchema.countDocuments(FindQuery).exec()
   ]).then(result => {
      res.status(200).send({Status: true, Response: result[0], SubResponse: result[1] });
   }).catch(err => {
      console.log(err);
      res.status(417).send({Status: false, ErrorCode: 417, ErrorMessage: "Some error occurred while Find The Referral Facilities list!."});
   });
};


exports.ReferralFacilities_SimpleList = function(req, res){
   var ReceivingData = req.body;
   ReferralFacilityModel.ReferralFacilitySchema
      .find({'If_Deleted': false}, {Hospital_Name: 1, Hospital_Type: 1, Hospital_Address: 1}, {'short': {createdAt: 1}})
      .exec(function(err,result){
         if(err) {
            res.status(417).send({status: false, ErrorCode: 417, Message: "Some error occurred!.", Error: err });
         } else {
            result = result.sort(function(Obj1, Obj2) { return Obj1.Hospital_Name.localeCompare(Obj2.Hospital_Name); });
            res.status(200).send({Status: true, Response: result });
         }
      });
};


// Referral Facility Update ---------------------------------------------
exports.ReferralFacility_Update = function (req, res) {
   var ReceivingData = req.body;

   if (!ReceivingData.HospitalId || ReceivingData.HospitalId === '') {
      res.status(400).send({ Status: false, Message: "Hospital Details can not be empty" });
   } else if (!ReceivingData.Hospital_Name || ReceivingData.Hospital_Name === '') {
      res.status(400).send({ Status: false, Message: "Hospital Name can not be empty" });
	} else if (!ReceivingData.Hospital_Type || ReceivingData.Hospital_Type === '') {
      res.status(400).send({ Status: false, Message: "Hospital Type can not be empty" });
	} else if (!ReceivingData.Hospital_Address || ReceivingData.Hospital_Address === '') {
      res.status(400).send({ Status: false, Message: "Hospital Address can not be empty" });
   } else {
      ReferralFacilityModel.ReferralFacilitySchema.updateOne(
         { "_id": mongoose.Types.ObjectId(ReceivingData.HospitalId)}, { $set: { "Hospital_Name": ReceivingData.Hospital_Name, "Hospital_Type": ReceivingData.Hospital_Type, "Hospital_Address": ReceivingData.Hospital_Address } }
      ).exec(function (err, result) {
         if (err) {
            res.status(417).send({ Status: false, Message: "Some error occurred while Updating the Referral Facility!.", Error: err });
         } else {
            ReferralFacilityModel.ReferralFacilitySchema.findOne({"_id": mongoose.Types.ObjectId(ReceivingData.HospitalId)}, {}, {}, function(err_1, result_1) {
               if (err_1) {
                  res.status(417).send({ Status: false, Message: "Some error occurred while Find the Referral Facility!.", Error: err_1 });
               } else {
                  res.status(200).send({ Status: true, Response: result_1 });
               }
            });
         }
      });
   }
};