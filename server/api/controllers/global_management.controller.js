var GlobalModel = require('../models/global_management.model');
var mongoose = require('mongoose');

// -------------------------------------------------- Countries List----------------------------------------------------------
exports.Country_List = function(req, res) {    
   var ReceivingData = req.body;
   GlobalModel.Global_Country.find({}, {Country_Name: 1}, {}, function(err, result) {
      if(err) {             
         res.status(417).send({status: false, Message: "Some error occurred while Find the Countries List!."});
      } else {
         result = result.sort(function(Obj1, Obj2) { return Obj1.Country_Name.localeCompare(Obj2.Country_Name); });
         var ReturnData = result;         
         res.status(200).send({Status: true, Response: ReturnData });
      }
   });
};

// -------------------------------------------------- States List ----------------------------------------------------------
exports.State_List = function(req, res) {
   var ReceivingData = req.body;
   if(!ReceivingData.Country_Id || ReceivingData.Country_Id === '') {
      res.status(200).send({Status:"True", Output:"False", Message: "Country Id can not be empty" });
   }else{
      GlobalModel.Global_State.find({ Country_DatabaseId: ReceivingData.Country_Id }, { State_Name: 1}, {}, function(err, result) {
         if(err) {
            res.status(417).send({status: false, Message: "Some error occurred while Find the States List!."});
         } else {
            result = result.sort(function(Obj1, Obj2) { return Obj1.State_Name.localeCompare(Obj2.State_Name); });
            var ReturnData = result;            
            res.status(200).send({Status: true, Response: ReturnData });
         }
      });
   }
};

// -------------------------------------------------- Cities List ----------------------------------------------------------
 exports.City_List = function(req, res) {
   var ReceivingData = req.body;
   if(!ReceivingData.State_Id || ReceivingData.State_Id === '') {
      res.status(200).send({Status:"True", Output:"False", Message: "State Id can not be empty" });
   }else{
      GlobalModel.Global_City.find({ State_DatabaseId: ReceivingData.State_Id }, { City_Name: 1}, {}, function(err, result) {
         if(err) {
            res.status(417).send({status: false, Message: "Some error occurred while Find the Cities List!."});
         } else {
            result = result.sort(function(Obj1, Obj2) { return Obj1.City_Name.localeCompare(Obj2.City_Name); });
            var ReturnData = result;
            res.status(200).send({Status: true, Response: ReturnData });
         }
      });
   }
};