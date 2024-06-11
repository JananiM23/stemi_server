var StemiUserModel = require('../../api/models/user_management.model');
var StemiAppUserModel = require('../models/login_management.model');
var CryptoJS = require("crypto-js");
var crypto = require("crypto");
var parser = require('ua-parser-js');
var mongoose = require('mongoose');


//Login with Stemi_Mob_User

exports.StemiApp_Login = function (req, res) {
   var ReceivingData = req.body;

   if (!ReceivingData.User_Name || ReceivingData.User_Name === '') {
      res.status(400).send({ Success: false, Message: "User Name can not be empty" });
   } else if (!ReceivingData.User_Password || ReceivingData.User_Password === '') {
      res.status(400).send({ Success: false, Message: "User Password can not be empty" });
   } else if (!ReceivingData.Firebase_Token || ReceivingData.Firebase_Token === '') {
      res.status(400).send({ Success: false, Message: "Device Details can not be empty" });
   } else if (!ReceivingData.Device_Id || ReceivingData.Device_Id === '') {
      res.status(400).send({ Success: false, Message: "Device Details can not be empty" });
   } else if (!ReceivingData.Device_Type || ReceivingData.Device_Type === '') {
      res.status(400).send({ Success: false, Message: "Device Details can not be empty" });
   } else {
      StemiUserModel.UserManagementSchema
      .findOne({
            $and: [  {$or: [ {'User_Name': { $regex: new RegExp("^" + ReceivingData.User_Name  + "$", "i") } }, { 'Email': { $regex: new RegExp("^" +  ReceivingData.User_Name  + "$", "i") } } ]},
                  {$or: [ { 'User_Type': 'PU' }, { 'User_Type': 'CDA' }, { 'User_Type': 'D' } ]} ],
            'Password': ReceivingData.User_Password,
            'Active_Status': true,
            'If_Deleted': false
         }, { Password: 0 }, {})
         .populate({ path: 'Location', select: ['Location_Name', 'Location_Code'] })
         .populate({ path: 'Cluster', select: ['Cluster_Name', 'Cluster_Code'] })
         .populate({ path: 'ClustersArray', select: ['Cluster_Name', 'Cluster_Code'] })
         .populate({ path: 'HospitalsArray', select: ['Hospital_Name', 'Hospital_Code', 'Hospital_Role', 'If_Cluster_Mapped'] })
         .populate({ path: 'Hospital', select: ['Hospital_Name', 'Hospital_Code', 'Hospital_Role', 'If_Cluster_Mapped' ] })
         .exec(function (err, result) {
            if (err) {
               res.status(417).send({ Success: false, ErrorCode: 417, Message: "Some error occurred while Validate The User Details!." });
            } else {
               if (result === null) {
                  StemiUserModel.UserManagementSchema
                  .findOne({ $or: [ {'User_Name': { $regex: new RegExp("^" + ReceivingData.User_Name + "$", "i") }},
                                    { 'Email': { $regex: new RegExp("^" + ReceivingData.User_Name + "$", "i") }} ] }, function (err_1, result_1) {
                  // .findOne({ 'User_Name': { $regex : new RegExp("^" + ReceivingData.User_Name + "$", "i") }}, function (err_1, result_1) {
                     if (err_1) {
                        res.status(417).send({ Success: false, ErrorCode: 417, Message: "Some error occurred while Validate the User Name!" });
                     } else {
                        if (result_1 === null) {
                           res.status(200).send({ Success: false, Message: "Invalid account details!" });
                        } else {
                           if (result_1.User_Type === 'CO' || result_1.User_Type === 'SA') {
                              res.status(200).send({ Status: false, Message: "Your App Access Unavailable!" });
                           } else if (result_1.Active_Status && !result_1.If_Deleted) {
                              res.status(200).send({ Success: false, Message: "User Name and password do not match!" });
                           } else {
                              res.status(200).send({ Success: false, Message: "Your Account has Deactivated or Removed!" });
                           }
                        }
                     }
                  });
               } else {
                  if ( (result.User_Type === 'PU' && result.Hospital.If_Cluster_Mapped === true) || result.User_Type === 'D' || result.User_Type === 'CDA' ) {
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
                        If_Get: req.params,
                        Device_Info: DeviceInfo,
                     });
                     var LoginHistory = new StemiAppUserModel.LoginHistorySchema({
                        User: result._id,
                        LoginToken: RandomToken,
                        Hash: UserHash,
                        Firebase_Token: ReceivingData.Firebase_Token || '',
                        Device_Id: ReceivingData.Device_Id || '',
                        Device_Type: ReceivingData.Device_Type,
                        LastActive: new Date(),
                        LoginFrom: LoginFrom,
                        Active_Status: true,
                        If_Deleted: false,
                     });
                     LoginHistory.save((err_2, result_2) => {
                        if (err_2) {
                           res.status(417).send({ Success: false, Message: "Some error occurred while Validate Update the User Details!" });
                        } else {
                           StemiAppUserModel.LoginHistorySchema
                           .updateMany( { _id: { $ne: result_2._id }, Device_Id: ReceivingData.Device_Id, Active_Status: true, If_Deleted: false }, 
                                       { $set: { Active_Status: false } }).exec();
                           const ReturnResponse = CryptoJS.AES.encrypt(JSON.stringify(result), RandomToken.slice(3, 10)).toString();
                           res.status(200).send({ Success: true, Key: RandomToken, Response: ReturnResponse });
                        }
                     });
                  } else {
                     res.status(200).send({ Success: false, Message: "Your Account Permissions Restricted!" });
                  }
               }
            }
         });
   }
};

exports.StemiApp_Logout = function (req, res) {
   var ReceivingData = req.body;
   if (!ReceivingData.token || ReceivingData.token === '') {
      res.status(400).send({ Success: false, Message: "Token can not be empty" });
   } else if (!ReceivingData.User || ReceivingData.User === '') {
      res.status(400).send({ Success: false, Message: "User Details can not be empty" });
   } else if (!ReceivingData.Device_Id || ReceivingData.Device_Id === '') {
      res.status(400).send({ Success: false, Message: "Device Details can not be empty" });
   } else {
      ReceivingData.User = mongoose.Types.ObjectId(ReceivingData.User);
      StemiAppUserModel.LoginHistorySchema
      .updateOne({ User: ReceivingData.User, LoginToken: ReceivingData.token, Device_Id: ReceivingData.Device_Id, Active_Status: true, If_Deleted: false }, { $set: { Active_Status: false } })
      .exec(function (err, result_1) {
         if (err) {
            res.status(417).send({ Success: false, Message: "Some error occurred!.", Error: err });
         } else {
            res.status(200).send({ Success: true, Message: "User Successfully Logout" });
         }
      });
   }
};

exports.StemiApp_LoginVerify = function (req, res) {
   var ReceivingData = req.body;
   if (!ReceivingData.token || ReceivingData.token === '') {
      res.status(400).send({ Success: false, Message: "Token can not be empty" });
   } else if (!ReceivingData.User || ReceivingData.User === '') {
      res.status(400).send({ Success: false, Message: "User Details can not be empty" });
   } else if (!ReceivingData.Device_Id || ReceivingData.Device_Id === '') {
      res.status(400).send({ Success: false, Message: "Device Details can not be empty" });
   } else {
      ReceivingData.User = mongoose.Types.ObjectId(ReceivingData.User);
      StemiAppUserModel.LoginHistorySchema.findOne({ User: ReceivingData.User, LoginToken: ReceivingData.token, Device_Id: ReceivingData.Device_Id }, {}, {})
      .exec((err, result) => {
         if (err) {
            res.status(417).send({ Success: false, Message: "Some error occurred!.", Error: err });
         } else {
            if (result === null) {
               res.status(417).send({ Success: false, Message: "Invalid User Credentials!." });
            } else {
               if (result.Active_Status === true && result.If_Deleted === false ) {
                  res.status(200).send({ Success: true, Message: "User Credentials Verified" });
               } else {
                  res.status(400).send({ Success: false, Message: "User Session Expired!." });
               }
            }
         }
      });
   }
};