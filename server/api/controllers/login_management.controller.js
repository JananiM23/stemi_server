var StemiUserModel = require('./../models/user_management.model');
var StemiAppUserModel = require('../../mobile_api/models/login_management.model');
var CryptoJS = require("crypto-js");
var crypto = require("crypto");
var parser = require('ua-parser-js');
var mongoose = require('mongoose');


exports.StemiUser_Login = function(req, res) {

   var ReceivingData = req.body;

   var today = new Date();
   today.setHours(today.getHours() - 2);
   StemiUserModel.LoginHistorySchema.updateMany(
      { LastActive : { $lte: today }, Active_Status: true, If_Deleted: false },
      { $set: { Active_Status: false } }
   ).exec();

   if(!ReceivingData.User_Name || ReceivingData.User_Name === '' ) {
      res.status(400).send({Status: false, Message: "User_Name can not be empty" });
   } else if (!ReceivingData.User_Password || ReceivingData.User_Password === ''  ) {
      res.status(400).send({Status: false, Message: "User Password can not be empty" });
   } else {
      StemiUserModel.UserManagementSchema
      .findOne({  'User_Name': { $regex : new RegExp("^" + ReceivingData.User_Name + "$", "i") },
                  'Password': ReceivingData.User_Password,
                  $or: [ {'User_Type': 'SA'}, {'User_Type': 'CO'}, {'User_Type': 'PU'} ],
                  'Active_Status': true,
                  'If_Deleted': false }, { Password : 0}, {})
      .populate({ path: 'Location', select: ['Location_Name', 'Location_Code']})
      .populate({ path: 'Cluster', select: ['Cluster_Name', 'Cluster_Code', 'Cluster_Type'] })
      .populate({ path: 'ClustersArray', select: ['Cluster_Name', 'Cluster_Code'] })
      .populate({ path: 'HospitalsArray', select: ['Hospital_Name', 'Hospital_Code', 'Hospital_Role', 'Location', 'If_Cluster_Mapped', 'Cluster_ConnectionType', 'Country'] })
      .populate({ path: 'Hospital', select: ['Hospital_Name', 'Hospital_Code', 'Hospital_Role', 'Location', 'If_Cluster_Mapped', 'Cluster_ConnectionType', 'Country'] })
      .exec(function(err, result) {
         if(err) {
            res.status(417).send({Status: false, ErrorCode: 417, Message: "Some error occurred while Validate The User Details!."});
         } else {
            if(result === null){
               StemiUserModel.UserManagementSchema.findOne({'User_Name': ReceivingData.User_Name }, function(err_1, result_1) {
                  if(err_1) {
                     res.status(417).send({Status: false, ErrorCode: 417, Message: "Some error occurred while Validate the User Name!"});           
                  } else {
                     if (result_1 === null) {
                        res.status(200).send({ Status: false, Message: "Invalid account details!" });
                     } else {
                        if (result_1.User_Type === 'D' || result_1.User_Type === 'CDA') {
                           res.status(200).send({ Status: false, Message: "Your Web Access Unavailable!" });
                        } else if (result_1.Active_Status && !result_1.If_Deleted ) {
                           res.status(200).send({ Status: false, Message: "User Name and password do not match!" });
                        } else {
                           res.status(200).send({ Status: false, Message: "Your Account has Deactivated or Removed!" });
                        }
                     }
                  }
               });
            } else {
               const RandomToken = crypto.randomBytes(32).toString("hex");
               const UserData = JSON.parse(JSON.stringify(result));
               UserData.Token = RandomToken;
               const UserHash = CryptoJS.SHA512(JSON.stringify(UserData)).toString(CryptoJS.enc.Hex);
               var Ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
               var DeviceInfo = parser(req.headers['user-agent']);
               var LoginFrom = JSON.stringify({
                                    Ip: Ip,
                                    Request_From_Origin: req.headers.origin,
                                    Request_From: req.headers.referer,
                                    Request_Url: req.url,
                                    Request_Body: req.body,
                                    If_Get : req.params,
                                    Device_Info: DeviceInfo,
                                 });
               var LoginHistory = new StemiUserModel.LoginHistorySchema({
                  User: result._id,
                  LoginToken: RandomToken,
                  Hash: UserHash,
                  LastActive: new Date(),
                  LoginFrom: LoginFrom,
                  Active_Status: true,
                  If_Deleted: false,
               });
               LoginHistory.save((err_2, result_2) => {
                  if(err_2) {
                     res.status(417).send({Status: false, Message: "Some error occurred while Validate Update the User Details!"});           
                  } else {
                     if (ReceivingData.UpdateKey && ReceivingData.UpdateKey !== null && ReceivingData.UpdateKey !== '' ) {
                        StemiUserModel.LoginHistorySchema.findOne(
                           { LoginToken : ReceivingData.UpdateKey, Active_Status: true, If_Deleted: false }
                        ).exec((err_3, result_3) => {
                           if (err_3 || result_3 === null) {
                              console.log('Previous Session UnFindable!');
                           } else {
                              StemiUserModel.LoginHistorySchema.updateOne(
                                 { LoginToken : ReceivingData.UpdateKey, Active_Status: true, If_Deleted: false },
                                 { $set: { Active_Status: false } }
                              ).exec();
                           }
                        });
                     }
                     const ReturnResponse = CryptoJS.AES.encrypt(JSON.stringify(result), RandomToken.slice(3, 10)).toString();
                     res.status(200).send({ Status: true, Key: RandomToken, Response: ReturnResponse });
                  }
               });
            }
         }
      });
   }
};


exports.StemiUser_AutoLogin = function(req, res) {
   var ReceivingData = req.body;

   var today = new Date();
   today.setHours(today.getHours() - 2);
   StemiUserModel.LoginHistorySchema.updateMany(
      { LastActive : { $lte: today }, Active_Status: true, If_Deleted: false },
      { $set: { Active_Status: false } }
   ).exec();

   if(!ReceivingData.User || ReceivingData.User === '' ) {
      res.status(400).send({Status: false, Message: "User can not be empty" });
   } else if (!ReceivingData.Token || ReceivingData.Token === ''  ) {
      res.status(400).send({Status: false, Message: "Token can not be empty" });
   } else if (!ReceivingData.DeviceId || ReceivingData.DeviceId === ''  ) {
      res.status(400).send({Status: false, Message: "Device Info can not be empty" });
   } else {
      ReceivingData.User = mongoose.Types.ObjectId(ReceivingData.User);
      StemiAppUserModel.LoginHistorySchema.findOne({ User: ReceivingData.User, LoginToken: ReceivingData.Token, Device_Id: ReceivingData.DeviceId, Active_Status: true, If_Deleted: false}, {}, {})
      .exec((error, response) => {
         if (error) {
            res.status(417).send({ Success: false, Message: "Some error occurred!.", Error: error });
         } else {
            if (response === null) {
               res.status(417).send({ Success: false, Message: "Invalid User Credentials!." });
            } else {
               StemiUserModel.UserManagementSchema
               .findOne({  '_id': response.User, 'User_Type': 'PU', 'Active_Status': true, 'If_Deleted': false }, { Password : 0}, {})
               .populate({ path: 'Location', select: ['Location_Name', 'Location_Code']})
               .populate({ path: 'Cluster', select: ['Cluster_Name', 'Cluster_Code', 'Cluster_Type'] })
               .populate({ path: 'ClustersArray', select: ['Cluster_Name', 'Cluster_Code'] })
               .populate({ path: 'HospitalsArray', select: ['Hospital_Name', 'Hospital_Code', 'Hospital_Role', 'If_Cluster_Mapped', 'Cluster_ConnectionType', 'Country'] })
               .populate({ path: 'Hospital', select: ['Hospital_Name', 'Hospital_Code', 'Hospital_Role', 'If_Cluster_Mapped', 'Cluster_ConnectionType', 'Country'] })
               .exec(function(err, result) {
                  if(err) {
                     res.status(417).send({Status: false, ErrorCode: 417, Message: "Some error occurred while Validate The User Details!."});
                  } else {
                     if(result !== null){
                        const RandomToken = crypto.randomBytes(32).toString("hex");
                        const UserData = JSON.parse(JSON.stringify(result));
                        UserData.Token = RandomToken;
                        const UserHash = CryptoJS.SHA512(JSON.stringify(UserData)).toString(CryptoJS.enc.Hex);
                        var Ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
                        var DeviceInfo = parser(req.headers['user-agent']);
                        var LoginFrom = JSON.stringify({
                                             Ip: Ip,
                                             Request_From_Origin: req.headers.origin,
                                             Request_From: req.headers.referer,
                                             Request_Url: req.url,
                                             Request_Body: req.body,
                                             If_Get : req.params,
                                             Device_Info: DeviceInfo,
                                          });
                        var LoginHistory = new StemiUserModel.LoginHistorySchema({
                           User: result._id,
                           LoginToken: RandomToken,
                           Hash: UserHash,
                           LastActive: new Date(),
                           LoginFrom: LoginFrom,
                           Active_Status: true,
                           If_Deleted: false,
                        });
                        LoginHistory.save((err_2, result_2) => {
                           if(err_2) {
                              res.status(417).send({Status: false, Message: "Some error occurred while Validate Update the User Details!"});           
                           } else {
                              const ReturnResponse = CryptoJS.AES.encrypt(JSON.stringify(result), RandomToken.slice(3, 10)).toString();
                              res.status(200).send({ Status: true, Key: RandomToken, Response: ReturnResponse });
                           }
                        });
                     } else {
                        res.status(417).send({ Success: false, Message: "Invalid User Credentials!." });
                     }
                  }
               });
            }
         }
      });
   }
};