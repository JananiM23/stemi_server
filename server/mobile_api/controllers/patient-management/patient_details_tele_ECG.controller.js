var PatientDetailsModel = require('../../../mobile_api/models/patient-management/patient_details.model');
var DeviceManagementModel = require('../../../api/models/device_management.model');
var StemiUserModel = require('../../../api/models/user_management.model');
var StemiAppUserModel = require('../../../mobile_api/models/login_management.model');
var NotificationModel = require('../../../api/models/notification_management.model');
var WebPatientDetailsModel = require('../../../api/models/patient-management/patient_details.model');
var mongoose = require('mongoose');
var moment = require('moment');
var FCM_App = require('./../../../../Config/fcm_config').first;
var FCM_Tab = require('./../../../../Config/fcm_config').second;
var options = {
   priority: 'high',
   timeToLive: 60 * 60 * 24
};
var QRCode = require('qrcode');
var fs = require('fs');
var svg2img = require('svg2img');

// SMS Notification System
const axios = require('axios');
var Schedule = require('node-schedule');

// Tele ECG Create
exports.NewECGFile = function (req, res) {
   var ReceivingData = req.body;
   
   if (!ReceivingData.patient_firstName || ReceivingData.patient_firstName === '' ) {
      res.status(403).send({ Success: false, Message: "Patient Name can not be empty" });
   } else if (!ReceivingData.patient_gender || ReceivingData.patient_gender === '') {
      res.status(403).send({ Success: false, Message: "Patient Gender can not be empty" });
   } else if (!ReceivingData.requestId || ReceivingData.requestId === '') {
      res.status(403).send({ Success: false, Message: "Request-Id can not be empty" });
   }  else if (!ReceivingData.deviceId || ReceivingData.deviceId === '') {
      res.status(403).send({ Success: false, Message: "Device-Id can not be empty" });
   }  else if (!ReceivingData.image || ReceivingData.image === '') {
      res.status(403).send({ Success: false, Message: "ECG Image can not be empty" });
   }  else if (!ReceivingData.ecgTime || ReceivingData.ecgTime === '') {
      res.status(403).send({ Success: false, Message: "ECG Date Time can not be empty" });
   } else {

      if (ReceivingData.ecgTime && ReceivingData.ecgTime !== '' && ReceivingData.ecgTime !== null) {
         ReceivingData.ecgTime = moment(ReceivingData.ecgTime, "YYYY-MM-DD HH:mm").toDate();
      } else {
         ReceivingData.ecgTime = null;
      }
      if (ReceivingData.patient_dob && ReceivingData.patient_dob !== '' && ReceivingData.patient_dob !== null) {
         ReceivingData.patient_dob = moment(ReceivingData.patient_dob, "YYYY-MM-DD").toDate();
      } else {
         ReceivingData.patient_dob = null;
      }
      ReceivingData.patient_gender = ReceivingData.patient_gender === 'M' ? 'Male' : ReceivingData.patient_gender === 'F' ? 'Female' : '';

      DeviceManagementModel.DeviceManagementSchema
      .findOne({Device_UID: { $regex: new RegExp("^" + ReceivingData.deviceId + "$", "i") }, Active_Status: true, If_Deleted: false}, {}, {})
      .exec((err, result) => {
         if (err) {
            res.status(500).send({ Success: false, Message: "Some Error Occured for validating Device-Id!" }); 
         } else {
            if (result !== null) {
               StemiUserModel.UserManagementSchema
               .findOne({Hospital: result.Hospital, User_Type: 'PU', Active_Status: true, If_Deleted: false}, {}, {'sort': { createdAt: -1 }})
               .exec((err_1, result_1) => {
                  if (err_1) {
                     res.status(500).send({ Success: false, Message: "Some Error Occured for finding User Details!" }); 
                  } else {
                     if (result_1 !== null) {

                        const Create_TeleECGPatientDetails = new PatientDetailsModel.TeleECGPatientDetailsSchema({
                           Request_Id: ReceivingData.requestId,
                           Device_Id: result.Device_UID,
                           Device_Management: result._id,
                           Patient_Id: ReceivingData.patientId || '',
                           Patient_FName: ReceivingData.patient_firstName || '',
                           Patient_LName: ReceivingData.patient_lastName || '',
                           Patient_Name: ReceivingData.patient_firstName + ' ' + ReceivingData.patient_lastName || '',
                           Patient_Age: ReceivingData.patient_age || '',
                           Patient_Gender: ReceivingData.patient_gender || '',
                           DateOfBirth: ReceivingData.patient_dob || null,
                           Mobile: ReceivingData.patient_mobile || '',
                           Email: ReceivingData.patient_email || '',
                           Height: ReceivingData.patient_height || '',
                           Weight: ReceivingData.patient_weight || '',
                           ECG_Taken_date_time: ReceivingData.ecgTime || null,
                           Confirmed_ECG: '',
                           Report_Status: '',
                           Report_Description: '',
                           ReportPDF: '',
                           ReportDateTime: null,
                           Hospital: result.Hospital,
                           User: result_1._id,
                           Confirmed_UserType: '',
                           Confirmed_By: null,
                           Admission_Type: 'Direct',
                           Stemi_Status: '',
                           'Findings.Severity': '',
                           'Findings.Heart_Rate.HR.AVG': '',
                           'Findings.Heart_Rate.HR.MIN': '',
                           'Findings.Heart_Rate.HR.MAX': '',
                           'Findings.Strip_Duration': '',
                           'Findings.Hr_Variability': '',
                           'Findings.ClassificationData': [],
                           Risk_Factors: [{
                              Diabetes: "",
                              Hypertension: "",
                              Smoker: "",
                              High_Cholesterol: "",
                              Previous_History_of_IHD: "",
                              Family_History_of_IHD: ""
                           }],
                           Symptoms: {
                              Chest_Discomfort: "",
                              Duration_of_Pain: "",
                              Location_of_Pain: ""
                           },
                           EntryFrom: "Device",
                           Case_Invite_Status: "",
                           Invited_To: null,
                           Case_Status: "Active",
                           Report_Added: false,
                           Active_Status: true,
                           If_Deleted: false,
                        });
                        Create_TeleECGPatientDetails.save( (err_2, result_2) => {
                           if (err_2) {
                              res.status(500).send({ Success: false, Message: "ECG Upload Failed Please Try Again!" });
                           } else {
                              const fineName = 'Uploads/Tele-TempECG/' + result_2._id + '.png';
                              svg2img(ReceivingData.image, function(error, buffer) {
                                 fs.writeFileSync(fineName, buffer);
                                 setTimeout(() => {
                                    fs.readFile(fineName, function(error_1, data) {
                                       var base64 = 'data:image/png;base64, '+ data.toString('base64');
                                       PatientDetailsModel.TeleECGPatientDetailsSchema.updateOne({_id: result_2._id}, {Confirmed_ECG: base64}).exec();
                                       fs.unlinkSync(fineName);
                                    });
                                 }, 100);
                              });
                              res.status(200).send({ Success: true, Message: "ECG Successfully Uploaded" });
                           }
                        });
                     } else {
                        res.status(401).send({ Success: false, Message: "User Auto-Sync Failed!" });  
                     }
                  }
               });
            } else {
               res.status(401).send({ Success: false, Message: "Device-Id is Invalid!" }); 
            }
         }
      });
   }
};


// Tele ECG Report
exports.NewECGReport = function(req, res) {
   var ReceivingData = req.body;
   
   if (!ReceivingData.patient_firstName || ReceivingData.patient_firstName === '') {
      res.status(403).send({ Success: false, Message: "patient Details can not be empty" });
   } else if (!ReceivingData.requestId || ReceivingData.requestId === '') {
      res.status(403).send({ Success: false, Message: "Request-Id can not be empty" });
   }  else if (!ReceivingData.deviceId || ReceivingData.deviceId === '') {
      res.status(403).send({ Success: false, Message: "Device-Id can not be empty" });
   }  else if (!ReceivingData.status || ReceivingData.status === '') {
      res.status(403).send({ Success: false, Message: "ECG Report Status can not be empty" });
   } else {

      if (ReceivingData.reportTime && ReceivingData.reportTime !== '' && ReceivingData.reportTime !== null) {
         ReceivingData.reportTime = moment(ReceivingData.reportTime, "YYYY-MM-DD HH:mm").toDate();
      } else {
         ReceivingData.reportTime = null;
      }



      PatientDetailsModel.TeleECGPatientDetailsSchema
      .findOne({Request_Id: ReceivingData.requestId, Device_Id: { $regex: new RegExp("^" + ReceivingData.deviceId + "$", "i") }, Report_Added: false, Active_Status: true, If_Deleted: false }, {}, {})
      .exec( (err, result) => {
         if (err) {
            res.status(500).send({ Success: false, Message: "Some Error Occured for validating Request-Id!" }); 
         } else {
            if (result !== null) {
               result.Report_Added = true;
               result.Report_Status = ReceivingData.status || 'Redo';
               result.Report_Description = ReceivingData.description || '';
               result.ReportPDF = ReceivingData.report || '';
               result.ReportDateTime = ReceivingData.reportTime || null;
               result.Findings.Severity = ReceivingData.Findings.severity || '';
               result.Findings.Heart_Rate.HR.AVG = ReceivingData.Findings.Heart_Rate.HR.AVG || '';
               result.Findings.Heart_Rate.HR.MIN = ReceivingData.Findings.Heart_Rate.HR.MIN || '';
               result.Findings.Heart_Rate.HR.MAX = ReceivingData.Findings.Heart_Rate.HR.MAX || '';
               result.Findings.Strip_Duration = ReceivingData.Findings.strip_duration || '';
               result.Findings.Hr_Variability = ReceivingData.Findings.hr_variability || '';
               result.Findings.ClassificationData = ReceivingData.Findings.classificationData || [];

               if (ReceivingData.status === 'completed') {
                  var reportData  = ReceivingData.report.replace(/^data:[a-z]+\/[a-z]+;base64,/, "").trim();
                  var buff = Buffer.from(reportData, 'base64');
                  const fineName = 'Uploads/Tele-ECG-Reports/' + result._id + '.pdf';
                  result.ReportPDF_File = result._id + '.pdf';
                  fs.writeFileSync(fineName, buff);
               }

               result.save();
               if (ReceivingData.status === 'completed') {
                  Promise.all([
                     StemiUserModel.UserManagementSchema.findOne({_id: result.User, Active_Status: true, If_Deleted: false }, {}, {}).exec(),
                     StemiAppUserModel.LoginHistorySchema.find({User: result.User, Active_Status: true, If_Deleted: false}, {Firebase_Token: 1, Device_Type: 1, Device_Id: 1, User: 1}, {}).exec()
                  ]).then( response => {
                     const UserDetails = response[0];
                     const UserLoginDetails = response[1];
                     if (UserDetails !== null) {
                        var AppUsers_FCMTokens = [];
                        var TabUsers_FCMTokens = [];
                        UserLoginDetails.map(obj => {
                           if ((obj.Device_Type === 'Android' || obj.Device_Type === 'IOS') && obj.Firebase_Token !== '') {
                              AppUsers_FCMTokens.push(obj.Firebase_Token);
                           } else if (obj.Device_Type === 'TAB' && obj.Firebase_Token !== '') {
                              TabUsers_FCMTokens.push(obj.Firebase_Token);
                           }
                        });
                        AppUsers_FCMTokens = AppUsers_FCMTokens.filter((obj, index) => AppUsers_FCMTokens.indexOf(obj) === index);
                        TabUsers_FCMTokens = TabUsers_FCMTokens.filter((obj, index) => TabUsers_FCMTokens.indexOf(obj) === index);
                        result.Patient_Gender  = result.Patient_Gender === 'Male_to_Female' ? 'Male to Female' : result.Patient_Gender === 'Female_to_Male' ? 'Female to Male' : result.Patient_Gender;
                        var payload = {
                           notification: {
                              title: 'New Tele ECG',
                              body: 'New Tele ECG for Patient: ' + result.Patient_Name + ', Age: ' + result.Patient_Age + ', Gender: ' + result.Patient_Gender,
                              sound: 'notify_tone.mp3'
                           },
                           data: {
                              patient: JSON.parse(JSON.stringify(result._id)),
                              notification_type: 'New_Tele_ECG',
                              click_action: 'FCM_PLUGIN_ACTIVITY',
                           }
                        };
                        if (AppUsers_FCMTokens.length > 0) {
                           FCM_App.messaging().sendToDevice(AppUsers_FCMTokens, payload, options).then((NotifyRes) => { });
                        }
                        // if (TabUsers_FCMTokens.length > 0) {
                        //    FCM_Tab.messaging().sendToDevice(TabUsers_FCMTokens, payload, options).then((NotifyRes) => { });
                        // }
                        var numbers = [];
                        numbers.push(UserDetails.Phone);
                        if (numbers.length > 0) {
                           var Msg = 'New Tele ECG for Patient: ' + result.Patient_Name + ', Age: ' + result.Patient_Age + ', Gender: ' + result.Patient_Gender;
                           axios({ method: 'post', url: 'http://bulksmsservice.co.in/httpapi/v1/sendsms?api-token=9)2_6eh0s,v3(*4.1alzcgjp8uxnotkdy7ibqr5f&numbers=' + numbers + '&route=2&message=' + Msg + '&sender=STEMIN', }).
                           then( (responseNew) =>{ });
                        }
                        const Notification = new NotificationModel.NotificationSchema({
                           User_ID: mongoose.Types.ObjectId(UserDetails._id),
                           Patient_ID: result._id,
                           Confirmed_PatientId: null,
                           Notification_Type: 'New_Tele_ECG',
                           Message: 'New Tele ECG for Patient: ' + result.Patient_Name + ', Age: ' + result.Patient_Age + ', Gender: ' + result.Patient_Gender,
                           Message_Received: false,
                           Message_Viewed: false,
                           Active_Status: true,
                           If_Deleted: false
                        });
                        Notification.save();
                        res.status(200).send({ Success: true, Message: "Report Details Successfully Updated" }); 
                     }
                  }).catch( error => {
                     res.status(500).send({ Success: false, Message: "Some Error Occured for Report Details Updating!" }); 
                  });
               } else {
                  res.status(200).send({ Success: true, Message: "Report Details Successfully Updated" }); 
               }
            } else {
               res.status(401).send({ Success: false, Message: "Request-Id Mismatch To Previous ECG Records!" }); 
            }
         }
      });
   }
};


// Tele ECG Patients List For User
exports.TeleECG_List_For_User = function (req, res) {
   var ReceivingData = req.body;

   if (!ReceivingData.User || ReceivingData.User === '') {
      res.status(400).send({ Success: false, Message: "User Details can not be empty" });
   } else {
      ReceivingData.User = mongoose.Types.ObjectId(ReceivingData.User);
      StemiUserModel.UserManagementSchema.findOne({ _id: ReceivingData.User }, {}, {})
      .exec(function (err, result) {
         if (err) {
            res.status(417).send({ Success: false, Message: "Some error occurred while Find The User Details!." });
         } else {
            if (result !== null) {
               PatientDetailsModel.TeleECGPatientDetailsSchema
               .find({ User: ReceivingData.User, $or: [{Case_Status: 'Active'}, {Case_Status: 'Dismissed'}], Report_Status: 'completed', Report_Added: true, Active_Status: true, If_Deleted: false }, { ReportPDF: 0, Confirmed_ECG: 0 }, {'sort': { createdAt: -1 }})
               .populate({path: 'Hospital', select: 'Hospital_Role'})
               .exec(function (err_1, result_1) {
                  if (err_1) {
                     res.status(417).send({ Success: false, Message: "Some error occurred while Find The Patient Details!.", Error: err_1 });
                  } else {
                     res.status(200).send({ Success: true, Message: "Success", Response: result_1 });
                  }
               });
            } else {
               res.status(417).send({ Success: true, Message: "Invalid User Details!" });
            }
         }
      });
   }
};


// Tele ECG Doctors List Specific by Hospital
exports.TeleECG_Doctors_List = function (req, res) {
   var ReceivingData = req.body;

   if (!ReceivingData.User || ReceivingData.User === '') {
      res.status(400).send({ Success: false, Message: "User Details can not be empty" });
   } else {
      ReceivingData.User = mongoose.Types.ObjectId(ReceivingData.User);
      StemiUserModel.UserManagementSchema.findOne({ _id: ReceivingData.User }, {}, {})
      .exec(function (err, result) {
         if (err) {
            res.status(417).send({ Success: false, Message: "Some error occurred while Find The User Details!." });
         } else {
            if (result !== null) {
               StemiUserModel.UserManagementSchema
               .find({ HospitalsArray: result.Hospital, User_Type: 'D', Active_Status: true, If_Deleted: false }, { Name: 1, Phone: 1 }, {'sort': { createdAt: -1 }})
               .exec(function (err_1, result_1) {
                  if (err_1) {
                     res.status(417).send({ Success: false, Message: "Some error occurred while Find The Doctors List!.", Error: err_1 });
                  } else {
                     res.status(200).send({ Success: true, Message: "Success", Response: result_1 });
                  }
               });
            } else {
               res.status(417).send({ Success: true, Message: "Invalid User Details!" });
            }
         }
      });
   }
};


// Tele ECG User To Doctor Invite
exports.TeleECG_Doctors_Invite = function (req, res) {
   var ReceivingData = req.body;

   if (!ReceivingData.User || ReceivingData.User === '') {
      res.status(400).send({ Success: false, Message: "User Details can not be empty" });
   } else if (!ReceivingData.Doctor || ReceivingData.Doctor === '') {
      res.status(400).send({ Success: false, Message: "Doctor Details can not be empty" });
   } else if (!ReceivingData.Patient || ReceivingData.Patient === '') {
      res.status(400).send({ Success: false, Message: "Patient Details can not be empty" });
   } else {
      ReceivingData.User = mongoose.Types.ObjectId(ReceivingData.User);
      ReceivingData.Doctor = mongoose.Types.ObjectId(ReceivingData.Doctor);
      ReceivingData.Patient = mongoose.Types.ObjectId(ReceivingData.Patient);

      Promise.all([
         StemiUserModel.UserManagementSchema.findOne({ _id: ReceivingData.User }, {}, {}).exec(),
         StemiUserModel.UserManagementSchema.findOne({ _id: ReceivingData.Doctor }, {}, {}).exec(),
         PatientDetailsModel.TeleECGPatientDetailsSchema.findOne({ _id: ReceivingData.Patient }, {}, {}).exec(),
         StemiAppUserModel.LoginHistorySchema.find({User: ReceivingData.Doctor, Active_Status: true, If_Deleted: false}, {}, {Firebase_Token: 1, Device_Type: 1, Device_Id: 1, User: 1}).exec()
      ]).then( response => {
         const User = response[0];
         const Doctor = response[1];
         const Patient = response[2];
         const DoctorLogins = response[3];
         if (User !== null && Doctor !== null && Patient !== null) {

            Patient.Case_Invite_Status = "Pending";
            Patient.Invited_To = Doctor._id;

            const Create_InviteRequest = new PatientDetailsModel.TeleECGInviteHistorySchema({
               Patient_Id: ReceivingData.Patient,
               InviteFrom: ReceivingData.User,
               InviteTo: ReceivingData.Doctor,
               InviteStatus: "Pending",
               InvitedDateTime: new Date(),
               InviteResponseDateTime: null,
               InviteType: "Manual",
               Active_Status: true,
               If_Deleted: false
            });

            Promise.all([
               Patient.save(),
               Create_InviteRequest.save(),
               StemiUserModel.UserManagementSchema.findOne({ ClustersArray: Doctor.Cluster, User_Type: 'CDA', Active_Status: true, If_Deleted: false}, {}, {}).exec(),
            ]).then( response_1 => {
               const ClusterDoctor = response_1[2];
               var AppUsers_FCMTokens = [];
               var TabUsers_FCMTokens = [];
               DoctorLogins.map(obj => {
                  if ((obj.Device_Type === 'Android' || obj.Device_Type === 'IOS') && obj.Firebase_Token !== '') {
                     AppUsers_FCMTokens.push(obj.Firebase_Token);
                  } else if (obj.Device_Type === 'TAB' && obj.Firebase_Token !== '') {
                     TabUsers_FCMTokens.push(obj.Firebase_Token);
                  }
               });
               AppUsers_FCMTokens = AppUsers_FCMTokens.filter((obj, index) => AppUsers_FCMTokens.indexOf(obj) === index);
               TabUsers_FCMTokens = TabUsers_FCMTokens.filter((obj, index) => TabUsers_FCMTokens.indexOf(obj) === index);
               Patient.Patient_Gender  = Patient.Patient_Gender === 'Male_to_Female' ? 'Male to Female' : Patient.Patient_Gender === 'Female_to_Male' ? 'Female to Male' : Patient.Patient_Gender;
               var payload = {
                  notification: {
                     title: 'Tele ECG Invite',
                     body: 'Tele ECG Invite for Patient: ' + Patient.Patient_Name + ', Age: ' + Patient.Patient_Age + ', Gender: ' + Patient.Patient_Gender,
                     sound: 'notify_tone.mp3'
                  },
                  data: {
                     patient: JSON.parse(JSON.stringify(Patient._id)),
                     notification_type: 'Tele_ECG_Invite',
                     click_action: 'FCM_PLUGIN_ACTIVITY',
                  }
               };
               if (AppUsers_FCMTokens.length > 0) {
                  FCM_App.messaging().sendToDevice(AppUsers_FCMTokens, payload, options).then((NotifyRes) => { });
               }
               // if (TabUsers_FCMTokens.length > 0) {
               //    FCM_Tab.messaging().sendToDevice(TabUsers_FCMTokens, payload, options).then((NotifyRes) => { });
               // }
               var numbers = [];
               numbers.push(Doctor.Phone);
               if (numbers.length > 0) {
                  var Msg = 'Tele ECG Invite for Patient: ' + Patient.Patient_Name + ', Age: ' + Patient.Patient_Age + ', Gender: ' + Patient.Patient_Gender;
                  axios({ method: 'post', url: 'http://bulksmsservice.co.in/httpapi/v1/sendsms?api-token=9)2_6eh0s,v3(*4.1alzcgjp8uxnotkdy7ibqr5f&numbers=' + numbers + '&route=2&message=' + Msg + '&sender=STEMIN', }).
                  then( (response) =>{ });
               }
               const Notification = new NotificationModel.NotificationSchema({
                  User_ID: mongoose.Types.ObjectId(Doctor._id),
                  Patient_ID: Patient._id,
                  Confirmed_PatientId: null,
                  Notification_Type: 'Tele_ECG_Invite',
                  Message: 'Tele ECG Invite for Patient: ' + Patient.Patient_Name + ', Age: ' + Patient.Patient_Age + ', Gender: ' + Patient.Patient_Gender,
                  Message_Received: false,
                  Message_Viewed: false,
                  Active_Status: true,
                  If_Deleted: false
               });
               Notification.save();
               // Cluster Doctor Schedule
               if (ClusterDoctor !== null) {
                  const Duration = ClusterDoctor.Alert_Duration !== undefined && !isNaN(ClusterDoctor.Alert_Duration) && ClusterDoctor.Alert_Duration > 0 ? (ClusterDoctor.Alert_Duration * 60000) : 300000;
                  var scheduleTime = new Date(Date.now() + Duration);
                  const S = Schedule.scheduleJob(scheduleTime, function(time) {
                     PatientDetailsModel.TeleECGPatientDetailsSchema
                     .findOne({_id: Patient._id, Case_Invite_Status: 'Pending',  Invited_To: Doctor._id })
                     .exec( (err, result) => {
                        if (!err && result !== null) {
                           const Create_InviteRequest = new PatientDetailsModel.TeleECGInviteHistorySchema({
                              Patient_Id: ReceivingData.Patient,
                              InviteFrom: ReceivingData.User,
                              InviteTo: ClusterDoctor._id,
                              InviteStatus: "Pending",
                              InvitedDateTime: new Date(),
                              InviteResponseDateTime: null,
                              InviteType: "Auto",
                              Active_Status: true,
                              If_Deleted: false
                           });

                           Promise.all([
                              Create_InviteRequest.save(),
                              PatientDetailsModel.TeleECGInviteHistorySchema.updateOne({Patient_Id: Patient._id, InviteTo: Doctor._id, Active_Status: true }, { $set: { Active_Status: false}}).exec(),
                              PatientDetailsModel.TeleECGPatientDetailsSchema.updateOne({_id: Patient._id }, { $set: { Invited_To: ClusterDoctor._id }}).exec(),
                              StemiAppUserModel.LoginHistorySchema.find({ User: ClusterDoctor._id, Active_Status: true, If_Deleted: false }).exec(),
                           ]).then( response_2 => {
                              var ClusterDoctorLogins = response_2[3];
                              var AppUsers_FCMTokens_1 = [];
                              var TabUsers_FCMTokens_1 = [];
                              ClusterDoctorLogins.map(obj => {
                                 if ((obj.Device_Type === 'Android' || obj.Device_Type === 'IOS') && obj.Firebase_Token !== '') {
                                    AppUsers_FCMTokens_1.push(obj.Firebase_Token);
                                 } else if (obj.Device_Type === 'TAB' && obj.Firebase_Token !== '') {
                                    TabUsers_FCMTokens_1.push(obj.Firebase_Token);
                                 }
                              });
                              AppUsers_FCMTokens_1 = AppUsers_FCMTokens_1.filter((obj, index) => AppUsers_FCMTokens_1.indexOf(obj) === index);
                              TabUsers_FCMTokens_1 = TabUsers_FCMTokens_1.filter((obj, index) => TabUsers_FCMTokens_1.indexOf(obj) === index);

                              if (AppUsers_FCMTokens_1.length > 0) {
                                 FCM_App.messaging().sendToDevice(AppUsers_FCMTokens_1, payload, options).then((NotifyRes) => { });
                              }
                              // if (TabUsers_FCMTokens_1.length > 0) {
                              //    FCM_Tab.messaging().sendToDevice(TabUsers_FCMTokens_1, payload, options).then((NotifyRes) => { });
                              // }
                              var numbers_1 = [];
                              numbers_1.push(ClusterDoctor.Phone);
                              if (numbers_1.length > 0) {
                                 var Msg_1 = 'Tele ECG Invite for Patient: ' + Patient.Patient_Name + ', Age: ' + Patient.Patient_Age + ', Gender: ' + Patient.Patient_Gender;
                                 axios({ method: 'post', url: 'http://bulksmsservice.co.in/httpapi/v1/sendsms?api-token=9)2_6eh0s,v3(*4.1alzcgjp8uxnotkdy7ibqr5f&numbers=' + numbers_1 + '&route=2&message=' + Msg_1 + '&sender=STEMIN', }).
                                 then( (response_3) =>{ });
                              }
                              const Notification = new NotificationModel.NotificationSchema({
                                 User_ID: mongoose.Types.ObjectId(ClusterDoctor._id),
                                 Patient_ID: Patient._id,
                                 Confirmed_PatientId: null,
                                 Notification_Type: 'Tele_ECG_Invite',
                                 Message: 'Tele ECG Invite for Patient: ' + Patient.Patient_Name + ', Age: ' + Patient.Patient_Age + ', Gender: ' + Patient.Patient_Gender,
                                 Message_Received: false,
                                 Message_Viewed: false,
                                 Active_Status: true,
                                 If_Deleted: false
                              });
                              Notification.save();
                           }).catch( error_2 => { });
                        }
                     });
                  });
               }
               res.status(200).send({ Success: true, Message: "Successfully Invited the Doctor" });
            }).catch( error_1 => {
               res.status(417).send({ Success: false, Message: "Some error occurred while Invite the Doctors!.", Error: error_1 });
            });
         } else {
            if (User === null) {
               res.status(417).send({ Success: true, Message: "Invalid User Details!" });
            } else if (Doctor === null) {
               res.status(417).send({ Success: true, Message: "Invalid Doctor Details!" });
            } else if (Patient === null) {
               res.status(417).send({ Success: true, Message: "Invalid Patient Details!" });
            } else {
               res.status(417).send({ Success: true, Message: "Invalid * Details!" });
            }
         }
      }).catch( error => {
         res.status(417).send({ Success: false, Message: "Some error occurred while Invite The Doctor!.", Error: error });
      });
   }
};

// Tele ECG Patients List For Doctor
exports.TeleECG_List_For_Doctor = function (req, res) {
   var ReceivingData = req.body;

   if (!ReceivingData.User || ReceivingData.User === '') {
      res.status(400).send({ Success: false, Message: "User Details can not be empty" });
   } else {
      ReceivingData.User = mongoose.Types.ObjectId(ReceivingData.User);
      StemiUserModel.UserManagementSchema.findOne({ _id: ReceivingData.User }, {}, {})
      .exec(function (err, result) {
         if (err) {
            res.status(417).send({ Success: false, Message: "Some error occurred while Find The User Details!." });
         } else {
            if (result !== null) {
               PatientDetailsModel.TeleECGPatientDetailsSchema
               .find({ Invited_To: ReceivingData.User, $or: [{Case_Status: 'Active'}, {Case_Status: 'Dismissed'}], Active_Status: true, If_Deleted: false }, { ReportPDF: 0, Confirmed_ECG: 0 }, {'sort': { createdAt: -1 }})
               .populate({path: 'Hospital', select: 'Hospital_Role'})
               .exec(function (err_1, result_1) {
                  if (err_1) {
                     res.status(417).send({ Success: false, Message: "Some error occurred while Find The Patient Details!.", Error: err_1 });
                  } else {
                     res.status(200).send({ Success: true, Message: "Success", Response: result_1 });
                  }
               });
            } else {
               res.status(417).send({ Success: true, Message: "Invalid User Details!" });
            }
         }
      });
   }
};


// Tele ECG Invite Accept by Doctor
exports.TeleECG_Invite_Accept = function (req, res) {
   var ReceivingData = req.body;

   if (!ReceivingData.User || ReceivingData.User === '') {
      res.status(400).send({ Success: false, Message: "User Details can not be empty" });
   } else if (!ReceivingData.Patient || ReceivingData.Patient === '') {
      res.status(400).send({ Success: false, Message: "Patient Details can not be empty" });
   } else {
      ReceivingData.User = mongoose.Types.ObjectId(ReceivingData.User);
      ReceivingData.Patient = mongoose.Types.ObjectId(ReceivingData.Patient);

      Promise.all([
         StemiUserModel.UserManagementSchema.findOne({ _id: ReceivingData.User }, {}, {}).exec(),
         PatientDetailsModel.TeleECGPatientDetailsSchema.findOne({ _id: ReceivingData.Patient }, {}, {}).exec(),
         PatientDetailsModel.TeleECGInviteHistorySchema.findOne({ Patient_Id: ReceivingData.Patient, InviteTo: ReceivingData.User, $or: [{InviteStatus: "Pending"}, {InviteStatus: "Accepted"}], Active_Status: true, If_Deleted: false }, {}, {}).exec(),
      ]).then( response => {
         const User = response[0];
         const Patient = response[1];
         const InviteHistory = response[2];
         if (User !== null && Patient !== null && InviteHistory !== null) {
            Patient.Case_Invite_Status = "Accepted";

            InviteHistory.InviteStatus = "Accepted";
            InviteHistory.InviteResponseDateTime = new Date();

            Promise.all([
               Patient.save(),
               InviteHistory.save(),
               StemiUserModel.UserManagementSchema.findOne({ _id: Patient.User }, {}, {}).exec(),
               StemiAppUserModel.LoginHistorySchema.find({User: Patient.User, Active_Status: true, If_Deleted: false}, {}, {Firebase_Token: 1, Device_Type: 1, Device_Id: 1, User: 1}).exec()
            ]).then( response_1 => {
               const PUserDetails = response_1[2];
               const PUserLogins = response_1[3];
               var AppUsers_FCMTokens = [];
               var TabUsers_FCMTokens = [];
               PUserLogins.map(obj => {
                  if ((obj.Device_Type === 'Android' || obj.Device_Type === 'IOS') && obj.Firebase_Token !== '') {
                     AppUsers_FCMTokens.push(obj.Firebase_Token);
                  } else if (obj.Device_Type === 'TAB' && obj.Firebase_Token !== '') {
                     TabUsers_FCMTokens.push(obj.Firebase_Token);
                  }
               });
               AppUsers_FCMTokens = AppUsers_FCMTokens.filter((obj, index) => AppUsers_FCMTokens.indexOf(obj) === index);
               TabUsers_FCMTokens = TabUsers_FCMTokens.filter((obj, index) => TabUsers_FCMTokens.indexOf(obj) === index);
               Patient.Patient_Gender  = Patient.Patient_Gender === 'Male_to_Female' ? 'Male to Female' : Patient.Patient_Gender === 'Female_to_Male' ? 'Female to Male' : Patient.Patient_Gender;
               var payload = {
                  notification: {
                     title: 'Tele ECG Invite Accepted',
                     body: 'Tele ECG Invite Accepted for Patient: ' + Patient.Patient_Name + ', Age: ' + Patient.Patient_Age + ', Gender: ' + Patient.Patient_Gender,
                     sound: 'notify_tone.mp3'
                  },
                  data: {
                     patient: JSON.parse(JSON.stringify(Patient._id)),
                     notification_type: 'Tele_ECG_Invite_Accepted',
                     click_action: 'FCM_PLUGIN_ACTIVITY',
                  }
               };
               if (AppUsers_FCMTokens.length > 0) {
                  FCM_App.messaging().sendToDevice(AppUsers_FCMTokens, payload, options).then((NotifyRes) => { });
               }
               // if (TabUsers_FCMTokens.length > 0) {
               //    FCM_Tab.messaging().sendToDevice(TabUsers_FCMTokens, payload, options).then((NotifyRes) => { });
               // }
               var numbers = [];
               numbers.push(PUserDetails.Phone);
               if (numbers.length > 0) {
                  var Msg = 'Tele ECG Invite Accepted for Patient: ' + Patient.Patient_Name + ', Age: ' + Patient.Patient_Age + ', Gender: ' + Patient.Patient_Gender;
                  axios({ method: 'post', url: 'http://bulksmsservice.co.in/httpapi/v1/sendsms?api-token=9)2_6eh0s,v3(*4.1alzcgjp8uxnotkdy7ibqr5f&numbers=' + numbers + '&route=2&message=' + Msg + '&sender=STEMIN', }).
                  then( (response) =>{ });
               }
               const Notification = new NotificationModel.NotificationSchema({
                  User_ID: mongoose.Types.ObjectId(PUserDetails._id),
                  Patient_ID: Patient._id,
                  Confirmed_PatientId: null,
                  Notification_Type: 'Tele_ECG_Invite_Accepted',
                  Message: 'Tele ECG Invite Accepted for Patient: ' + Patient.Patient_Name + ', Age: ' + Patient.Patient_Age + ', Gender: ' + Patient.Patient_Gender,
                  Message_Received: false,
                  Message_Viewed: false,
                  Active_Status: true,
                  If_Deleted: false
               });
               Notification.save();
               res.status(200).send({ Success: true, Message: "Successfully Invite Accepted" });
            }).catch( error_1 => {
               res.status(417).send({ Success: false, Message: "Some error occurred while Accept the Invite!.", Error: error_1 });
            });
         } else {
            if (User === null) {
               res.status(400).send({ Success: true, Message: "Invalid User Details!" });
            } else if (Patient === null) {
               res.status(400).send({ Success: true, Message: "Invalid Patient Details!" });
            } else if (InviteHistory === null) {
               res.status(400).send({ Success: true, Message: "Invalid Invite Details!" });
            } else {
               res.status(400).send({ Success: true, Message: "Invalid * Details!" });
            }
         }
      }).catch( error => {
         res.status(417).send({ Success: false, Message: "Some error occurred while Accept the Invite!.", Error: error });
      });
   }
};


// Tele ECG Invite Reject by Doctor
exports.TeleECG_Invite_Reject = function (req, res) {
   var ReceivingData = req.body;

   if (!ReceivingData.User || ReceivingData.User === '') {
      res.status(400).send({ Success: false, Message: "User Details can not be empty" });
   } else if (!ReceivingData.Patient || ReceivingData.Patient === '') {
      res.status(400).send({ Success: false, Message: "Patient Details can not be empty" });
   } else {
      ReceivingData.User = mongoose.Types.ObjectId(ReceivingData.User);
      ReceivingData.Patient = mongoose.Types.ObjectId(ReceivingData.Patient);

      Promise.all([
         StemiUserModel.UserManagementSchema.findOne({ _id: ReceivingData.User }, {}, {}).exec(),
         PatientDetailsModel.TeleECGPatientDetailsSchema.findOne({ _id: ReceivingData.Patient }, {}, {}).exec(),
         PatientDetailsModel.TeleECGInviteHistorySchema.findOne({ Patient_Id: ReceivingData.Patient, InviteTo: ReceivingData.User, $or: [{InviteStatus: "Pending"}, {InviteStatus: "Accepted"}], Active_Status: true, If_Deleted: false }, {}, {}).exec(),
      ]).then( response => {
         const User = response[0];
         const Patient = response[1];
         const InviteHistory = response[2];
         if (User !== null && Patient !== null && InviteHistory !== null) {
            Patient.Case_Invite_Status = "Rejected";
            Patient.Invited_To = null;

            InviteHistory.InviteStatus = "Rejected";
            InviteHistory.InviteResponseDateTime = new Date();
            InviteHistory.Active_Status = false;

            Promise.all([
               Patient.save(),
               InviteHistory.save(),
               StemiUserModel.UserManagementSchema.findOne({ _id: Patient.User }, {}, {}).exec(),
               StemiAppUserModel.LoginHistorySchema.find({User: Patient.User, Active_Status: true, If_Deleted: false}, {}, {Firebase_Token: 1, Device_Type: 1, Device_Id: 1, User: 1}).exec()
            ]).then( response_1 => {
               const PUserDetails = response_1[2];
               const PUserLogins = response_1[3];
               var AppUsers_FCMTokens = [];
               var TabUsers_FCMTokens = [];
               PUserLogins.map(obj => {
                  if ((obj.Device_Type === 'Android' || obj.Device_Type === 'IOS') && obj.Firebase_Token !== '') {
                     AppUsers_FCMTokens.push(obj.Firebase_Token);
                  } else if (obj.Device_Type === 'TAB' && obj.Firebase_Token !== '') {
                     TabUsers_FCMTokens.push(obj.Firebase_Token);
                  }
               });
               AppUsers_FCMTokens = AppUsers_FCMTokens.filter((obj, index) => AppUsers_FCMTokens.indexOf(obj) === index);
               TabUsers_FCMTokens = TabUsers_FCMTokens.filter((obj, index) => TabUsers_FCMTokens.indexOf(obj) === index);
               Patient.Patient_Gender  = Patient.Patient_Gender === 'Male_to_Female' ? 'Male to Female' : Patient.Patient_Gender === 'Female_to_Male' ? 'Female to Male' : Patient.Patient_Gender;
               var payload = {
                  notification: {
                     title: 'Tele ECG Invite Rejected',
                     body: 'Tele ECG Invite Rejected for Patient: ' + Patient.Patient_Name + ', Age: ' + Patient.Patient_Age + ', Gender: ' + Patient.Patient_Gender,
                     sound: 'notify_tone.mp3'
                  },
                  data: {
                     patient: JSON.parse(JSON.stringify(Patient._id)),
                     notification_type: 'Tele_ECG_Invite_Rejected',
                     click_action: 'FCM_PLUGIN_ACTIVITY',
                  }
               };
               if (AppUsers_FCMTokens.length > 0) {
                  FCM_App.messaging().sendToDevice(AppUsers_FCMTokens, payload, options).then((NotifyRes) => { });
               }
               // if (TabUsers_FCMTokens.length > 0) {
               //    FCM_Tab.messaging().sendToDevice(TabUsers_FCMTokens, payload, options).then((NotifyRes) => { });
               // }
               var numbers = [];
               numbers.push(PUserDetails.Phone);
               if (numbers.length > 0) {
                  var Msg = 'Tele ECG Invite Rejected for Patient: ' + Patient.Patient_Name + ', Age: ' + Patient.Patient_Age + ', Gender: ' + Patient.Patient_Gender;
                  axios({ method: 'post', url: 'http://bulksmsservice.co.in/httpapi/v1/sendsms?api-token=9)2_6eh0s,v3(*4.1alzcgjp8uxnotkdy7ibqr5f&numbers=' + numbers + '&route=2&message=' + Msg + '&sender=STEMIN', }).
                  then( (response) =>{ });
               }
               const Notification = new NotificationModel.NotificationSchema({
                  User_ID: mongoose.Types.ObjectId(PUserDetails._id),
                  Patient_ID: Patient._id,
                  Confirmed_PatientId: null,
                  Notification_Type: 'Tele_ECG_Invite_Rejected',
                  Message: 'Tele ECG Invite Rejected for Patient: ' + Patient.Patient_Name + ', Age: ' + Patient.Patient_Age + ', Gender: ' + Patient.Patient_Gender,
                  Message_Received: false,
                  Message_Viewed: false,
                  Active_Status: true,
                  If_Deleted: false
               });
               Notification.save();
               res.status(200).send({ Success: true, Message: "Successfully Invite Rejected" });
            }).catch( error_1 => {
               res.status(417).send({ Success: false, Message: "Some error occurred while Rejecte the Invite!.", Error: error_1 });
            });
         } else {
            if (User === null) {
               res.status(400).send({ Success: true, Message: "Invalid User Details!" });
            } else if (Patient === null) {
               res.status(400).send({ Success: true, Message: "Invalid Patient Details!" });
            } else if (InviteHistory === null) {
               res.status(400).send({ Success: true, Message: "Invalid Invite Details!" });
            } else {
               res.status(400).send({ Success: true, Message: "Invalid * Details!" });
            }
         }
      }).catch( error => {
         res.status(417).send({ Success: false, Message: "Some error occurred while Reject the Invite!.", Error: error });
      });
   }
};


// Tele ECG Patient View
exports.TeleECG_Patient_View = function (req, res) {
   var ReceivingData = req.body;

   if (!ReceivingData.User || ReceivingData.User === '') {
      res.status(400).send({ Success: false, Message: "User Details can not be empty" });
   } else if (!ReceivingData.Patient || ReceivingData.Patient === '') {
      res.status(400).send({ Success: false, Message: "Patient Details can not be empty" });
   } else {
      ReceivingData.User = mongoose.Types.ObjectId(ReceivingData.User);
      ReceivingData.Patient = mongoose.Types.ObjectId(ReceivingData.Patient);
      Promise.all([
         StemiUserModel.UserManagementSchema.findOne({ _id: ReceivingData.User }, {}, {}).exec(),
         PatientDetailsModel.TeleECGPatientDetailsSchema.findOne({ _id: ReceivingData.Patient }, {}, {})
         .populate({path: 'Hospital', select: 'Hospital_Role'}).exec(),
      ]).then( response => {
         const User = response[0];
         const Patient = response[1];
         if (User !== null && Patient !== null ) {
            res.status(200).send({ Success: true, Message: "Success", Response: Patient });
         } else {
            if (User === null) {
               res.status(417).send({ Success: true, Message: "Invalid User Details!" });
            } else if (Patient === null) {
               res.status(417).send({ Success: true, Message: "Invalid Patient Details!" });
            } else {
               res.status(417).send({ Success: true, Message: "Invalid * Details!" });
            }
         }
      }).catch(error => {
         res.status(417).send({ Success: false, Message: "Some error occurred while Find the Patient Details!.", Error: error });
      });
   }
};


// Tele ECG Patient Update
exports.TeleECG_Patient_Update = function (req, res) {
   var ReceivingData = req.body;

   if (!ReceivingData.User || ReceivingData.User === '') {
      res.status(400).send({ Success: false, Message: "User Details can not be empty" });
   } else if (!ReceivingData.Patient || ReceivingData.Patient === '') {
      res.status(400).send({ Success: false, Message: "Patient Details can not be empty" });
   } else {
      ReceivingData.User = mongoose.Types.ObjectId(ReceivingData.User);
      ReceivingData.Patient = mongoose.Types.ObjectId(ReceivingData.Patient);
      Promise.all([
         StemiUserModel.UserManagementSchema.findOne({ _id: ReceivingData.User }, {}, {}).exec(),
         PatientDetailsModel.TeleECGPatientDetailsSchema.findOne({ _id: ReceivingData.Patient }, {}, {}).exec(),
      ]).then( response => {
         const User = response[0];
         const Patient = response[1];
         if (User !== null && Patient !== null ) {
            // if (ReceivingData.Symptoms.Duration_of_Pain && ReceivingData.Symptoms.Duration_of_Pain !== '' && ReceivingData.Symptoms.Duration_of_Pain !== null) {
            //    ReceivingData.Symptoms.Duration_of_Pain = moment(ReceivingData.Symptoms.Duration_of_Pain, "YYYY-MM-DD HH:mm").toDate();
            // } else {
            //    ReceivingData.Symptoms.Duration_of_Pain = null;
            // }
            var Location_of_Pain = ReceivingData.Symptoms.Location_of_Pain;
            Patient.Risk_Factors = ReceivingData.Risk_Factors || [];
            Patient.Symptoms.Chest_Discomfort = ReceivingData.Symptoms.Chest_Discomfort || '';
            // Patient.Symptoms.Duration_of_Pain = ReceivingData.Symptoms.Duration_of_Pain || null;
            Patient.Symptoms.Duration_of_Pain = null;
            Patient.Symptoms.Location_of_Pain = Location_of_Pain || '';

            Patient.save( (err, result) => {
               if (err) {
                  res.status(417).send({ Success: false, Message: "Some error occurred while Update the Patient Details!.", Error: err });
               } else {   
                  res.status(200).send({ Success: true, Message: 'Patient Details Successfully Updated' });
               }
            });
         } else {
            if (User === null) {
               res.status(417).send({ Success: true, Message: "Invalid User Details!" });
            } else if (Patient === null) {
               res.status(417).send({ Success: true, Message: "Invalid Patient Details!" });
            } else {
               res.status(417).send({ Success: true, Message: "Invalid * Details!" });
            }
         }
      }).catch(error => {
         res.status(417).send({ Success: false, Message: "Some error occurred while Update the Patient Details!.", Error: error });
      });
   }
};


// Tele ECG Patient STEMI Confirm
exports.TeleECG_Patient_STEMI_Confirm = function (req, res) {
   var ReceivingData = req.body;

   if (!ReceivingData.User || ReceivingData.User === '') {
      res.status(400).send({ Success: false, Message: "User Details can not be empty" });
   } else if (!ReceivingData.PatientId || ReceivingData.PatientId === '') {
      res.status(400).send({ Success: false, Message: "Patient Details can not be empty" });
   } else {
      ReceivingData.User = mongoose.Types.ObjectId(ReceivingData.User);
      ReceivingData.PatientId = mongoose.Types.ObjectId(ReceivingData.PatientId);
      Promise.all([
         StemiUserModel.UserManagementSchema.findOne({ _id: ReceivingData.User }, {}, {}).exec(),
         PatientDetailsModel.TeleECGPatientDetailsSchema.findOne({ _id: ReceivingData.PatientId }, {}, {}).exec(),
      ]).then( response => {
         const User = response[0];
         const Patient = response[1];
         if (User !== null && Patient !== null ) {
            var ST_Elevation = [];
            if (ReceivingData.ST_Elevation && ReceivingData.ST_Elevation !== null && typeof ReceivingData.ST_Elevation === 'object') {
               ST_Elevation = ReceivingData.ST_Elevation;
            }
            var ST_Depression = [];
            if (ReceivingData.ST_Depression && ReceivingData.ST_Depression !== null && typeof ReceivingData.ST_Depression === 'object') {
               ST_Depression = ReceivingData.ST_Depression;
            }
            var LBBB = ReceivingData.LBBB !== undefined ? ReceivingData.LBBB : '';
            var Doctor_Notes = ReceivingData.Doctor_Notes !== undefined ? ReceivingData.Doctor_Notes : '';
            
            var NotifyUser = null;
            if (JSON.parse(JSON.stringify(ReceivingData.User)) === JSON.parse(JSON.stringify(Patient.User)) && Patient.Case_Invite_Status === 'Accepted' && Patient.Invited_To !== null) {
               NotifyUser = Patient.Invited_To;
            }
            if ( Patient.Case_Invite_Status === 'Accepted' && Patient.Invited_To !== null && JSON.parse(JSON.stringify(ReceivingData.User)) === JSON.parse(JSON.stringify(Patient.Invited_To)) ) {
               NotifyUser = Patient.User;
            }

            var User_Type = User.User_Type === 'PU' ? 'Peripheral User' : User.User_Type === 'D' || User.User_Type === 'CDA'  ? 'Doctor' : '';


            Patient.ST_Elevation = ST_Elevation || {};
            Patient.ST_Depression = ST_Depression || {};
            Patient.LBBB = LBBB || '';
            Patient.Doctor_Notes = Doctor_Notes || '';
            Patient.Stemi_Status = 'Confirmed';
            Patient.Confirmed_UserType = User_Type;
            Patient.Confirmed_By = ReceivingData.User;

            Promise.all([
               Patient.save(),
               WebPatientDetailsModel.PatientBasicDetailsSchema.findOne({}, {}, { 'sort': { createdAt: -1 } }).exec(),
               DeviceManagementModel.DeviceManagementSchema.findOne({_id: Patient.Device_Management}, {}, {})
               .populate({ path: 'Location', select: 'Location_Code' })
               .populate({ path: 'Cluster', select: 'Cluster_Code' })
               .populate({ path: 'Hospital', select: 'Hospital_Code' }).exec(),
               StemiUserModel.UserManagementSchema.findOne({ _id: NotifyUser }, {}, {}).exec(),
               StemiAppUserModel.LoginHistorySchema.find({User: NotifyUser, Active_Status: true, If_Deleted: false}, {}, {Firebase_Token: 1, Device_Type: 1, Device_Id: 1, User: 1}).exec()
            ]).then( response_1 => {
               var LastPatient = response_1[1];
               var DeviceDetails = response_1[2];
               var NotifyUserDetails = response_1[3];
               var NotifyUserLogins = response_1[4];
               var LastPatientCode = LastPatient !== null ? (LastPatient.Patient_Code + 1) : 1;
               var Patient_Code = (LastPatientCode.toString()).padStart(4, 0);
               var Location_Code = (DeviceDetails.Location.Location_Code).toString().padStart(2, 0);
               var Cluster_Code = (DeviceDetails.Cluster.Cluster_Code).toString().padStart(2, 0);
               var Hospital_Code = (DeviceDetails.Hospital.Hospital_Code).toString().padStart(3, 0);
               var Patient_Unique = Location_Code + Cluster_Code + Hospital_Code + Patient_Code;
               var Patient_Unique_Identity = Location_Code + '-' + Cluster_Code + '-' + Hospital_Code + '-' + Patient_Code;
               var NonCluster = Patient.Admission_Type === "Non_Cluster" ? true : false;

               var ECG_Arr = [{
                  "Name": Patient.ECG_Taken_date_time.valueOf() + '-' + 'Tele',
                  "ECG_File": Patient.Confirmed_ECG,
                  "DateTime": Patient.ECG_Taken_date_time
               }];

               const NewDbId = mongoose.Types.ObjectId();

               var QRid = NewDbId.toString() + '-Stemi';
               QRCode.toDataURL(QRid, function (err_4, url) {
                  if (err_4) {
                     res.status(417).send({ Success: false, Message: "Some error occurred while STEMI Confirm the Patient!.", Error: err_4 });
                  } else {
                     var QrFile = url;
                     const Create_WebPatientBasicDetails = new WebPatientDetailsModel.PatientBasicDetailsSchema({
                        _id: NewDbId,
                        Patient_Code: Patient_Code || 1,
                        Patient_Unique: Patient_Unique || '00000000000',
                        Patient_Unique_Identity: Patient_Unique_Identity,
                        Patient_Name: Patient.Patient_Name || '',
                        Patient_Age: Patient.Patient_Age || null,
                        Patient_Gender: Patient.Patient_Gender || '',
                        Hospital_History: [{
                           Hospital_Count: 1,
                           Hospital: Patient.Hospital || null,
                           Handled_User: Patient.User || null,
                           Patient_Admission_Type: Patient.Admission_Type || 'Direct',
                           Hospital_Arrival_Date_Time: null
                        }],
                        Transport_History: [{
                           Transport_Count: 1,
                           Transport_From_Hospital: null,
                           Transport_To_Hospital: Patient.Hospital,
                           TransportMode: null,
                           Ambulance_Call_Date_Time: null,
                           Ambulance_Arrival_Date_Time: null,
                           Ambulance_Departure_Date_Time: null,
                        }],
                        Location_of_Infarction: [{
                           Anterior_Wall_MI: null,
                           Inferior_Wall_MI: null,
                           Lateral_Wall_MI: null,
                           Posterior_Wall_MI: null,
                           RV_Infarction: null
                        }],
                        Clinical_Examination_History: [{
                           Hospital: Patient.Hospital || null,
                           Patient_Height: '',
                           Patient_Weight: '',
                           BMI: '',
                           BP_Systolic: '',
                           BP_Diastolic: '',
                           Heart_Rate: '',
                           SP_O2: '',
                           Abdominal_Girth: '',
                           Kilip_Class: null
                        }],
                        Post_Thrombolysis: "" || null,
                        "Post_Thrombolysis_Data.Thrombolytic_Agent": "" || null,
                        "Post_Thrombolysis_Data.Dosage": "" || '',
                        "Post_Thrombolysis_Data.Dosage_Units": "" || null,
                        "Post_Thrombolysis_Data.Post_Thrombolysis_Start_Date_Time": null,
                        "Post_Thrombolysis_Data.Post_Thrombolysis_End_Date_Time": null,
                        "Post_Thrombolysis_Data.Ninety_Min_ECG": "" || null,
                        "Post_Thrombolysis_Data.Ninety_Min_ECG_Date_Time": null,
                        "Post_Thrombolysis_Data.Successful_Lysis": "" || null,
                        Patient_Payment: '',
                        Symptom_Onset_Date_Time: null,
                        Initiated_Hospital: Patient.Hospital || null,
                        Initiated_Hospital_Arrival: null,
                        EMS_Ambulance_Call_Date_Time: null,
                        EMS_Ambulance_Departure_Date_Time: null,
                        If_NonCluster: NonCluster || false,
                        NonCluster_Hospital_Name: '',
                        NonCluster_Hospital_Address: '',
                        NonCluster_Hospital_Arrival_Date_Time: null,
                        ECG_File: Patient.Confirmed_ECG || '',
                        App_ECG_Files: ECG_Arr,
                        ECG_Taken_date_time: Patient.ECG_Taken_date_time || null,
                        Stemi_Confirmed: 'Yes',
                        QR_image: QrFile,
                        Stemi_Confirmed_Date_Time: new Date() || null,
                        Stemi_Confirmed_Hospital: Patient.Hospital || null,
                        Stemi_Confirmed_Type: User_Type,
                        Stemi_Confirmed_By: User._id || null,
                        ECG_Taken_Type: 'Systemic',
                        Doctor_Notes: Doctor_Notes || '',
                        ST_Elevation: [Patient.ST_Elevation] || [],
                        ST_Depression: [Patient.ST_Depression] || [],
                        LBBB: LBBB || '',
                        IfThrombolysis: null,
                        ThrombolysisFrom: null,
                        IfPCI: null,
                        PCIFrom: null,
                        IfDeath: null,
                        IfDischarge: null,
                        TransferBending: null,
                        TransferBendingTo: null,
                        Active_Status: true,
                        If_Deleted: false,
                        LastCompletionChild: 'Co-Morbid_Conditions'
                     });
                     const Create_PatientCardiacHistory = new WebPatientDetailsModel.PatientCardiacHistorySchema({
                        PatientId: NewDbId,
                        Hospital: Patient.Hospital,
                        Previous_MI: false,
                        Previous_MI1:  '',
                        Previous_MI1_Date: null,
                        Previous_MI1_Details:  '',
                        Previous_MI2:  '',
                        Previous_MI2_Date:  null,
                        Previous_MI2_Details:  '',
                        Cardiac_History_Angina:  '',
                        Cardiac_History_Angina_Duration_Years: null,
                        Cardiac_History_Angina_Duration_Month: null,
                        CABG:  '',
                        CABG_Date:  null,
                        PCI1:  '',
                        PCI_Date:  null,
                        PCI1_Details:  '',
                        PCI2:  '',
                        PCI2_Date:  null,
                        PCI2_Details:  '',
                        Chest_Discomfort: Patient.Symptoms.Chest_Discomfort || '',
                        // Duration_of_Pain_Date_Time: Patient.Symptoms.Duration_of_Pain || null,
                        Duration_of_Pain_Date_Time: null,
                        Location_of_Pain: Patient.Symptoms.Location_of_Pain || '',
                        Pain_Severity:  '',
                        Palpitation:  "", 
                        Pallor:  "",
                        Diaphoresis:  "",
                        Shortness_of_breath:  "",
                        Nausea_Vomiting:  "",
                        Dizziness:  "",
                        Syncope:  "",
                        Active_Status: true,
                        If_Deleted: false
                     });
                     const Create_PatientCoMorbidCondition = new WebPatientDetailsModel.PatientCoMorbidConditionSchema({
                        PatientId: NewDbId,
                        Hospital: Patient.Hospital,
                        Smoker: Patient.Risk_Factors[0].Smoker || '',
                        Beedies: false,
                        Cigarettes:  false,
                        Number_of_Beedies:  null,
                        Number_of_Beedies_Duration_Years: null,
                        Number_of_Beedies_Duration_Months: null,
                        Number_of_Cigarettes: null,
                        Number_of_Cigarettes_Duration_Years: null,
                        Number_of_Cigarettes_Duration_Months: null,
                        Previous_IHD: Patient.Risk_Factors[0].Previous_History_of_IHD || '',
                        Diabetes_Mellitus: Patient.Risk_Factors[0].Diabetes || '',
                        High_Cholesterol: Patient.Risk_Factors[0].High_Cholesterol || '',
                        Duration_Years: null,
                        Duration_Months: null,
                        OHA:  '',
                        Insulin: '',
                        Family_history_of_IHD: Patient.Risk_Factors[0].Family_History_of_IHD || '',
                        Hypertension: Patient.Risk_Factors[0].Hypertension || '',
                        Hypertension_Duration_Years:  null,
                        Hypertension_Duration_Months:  null,
                        Hypertension_Medications:  false,
                        Hypertension_Medications_Details:  '',
                        Dyslipidemia:  '',
                        Dyslipidemia_Medications: false,
                        Dyslipidemia_Medications_Details: '',
                        Peripheral_Vascular_Disease: '',
                        Stroke:  '',
                        Bronchial_Asthma: '',
                        Allergies: '',
                        Allergy_Details: '',
                        Active_Status: true,
                        If_Deleted: false
                     });

                     Promise.all([
                        Create_WebPatientBasicDetails.save(),
                        Create_PatientCardiacHistory.save(),
                        Create_PatientCoMorbidCondition.save()  
                     ]).then( response_2 => {
                        if (NotifyUser !== null) {
                           var AppUsers_FCMTokens = [];
                           var TabUsers_FCMTokens = [];
                           NotifyUserLogins.map(obj => {
                              if ((obj.Device_Type === 'Android' || obj.Device_Type === 'IOS') && obj.Firebase_Token !== '') {
                                 AppUsers_FCMTokens.push(obj.Firebase_Token);
                              } else if (obj.Device_Type === 'TAB' && obj.Firebase_Token !== '') {
                                 TabUsers_FCMTokens.push(obj.Firebase_Token);
                              }
                           });
                           AppUsers_FCMTokens = AppUsers_FCMTokens.filter((obj, index) => AppUsers_FCMTokens.indexOf(obj) === index);
                           TabUsers_FCMTokens = TabUsers_FCMTokens.filter((obj, index) => TabUsers_FCMTokens.indexOf(obj) === index);
                           Patient.Patient_Gender  = Patient.Patient_Gender === 'Male_to_Female' ? 'Male to Female' : Patient.Patient_Gender === 'Female_to_Male' ? 'Female to Male' : Patient.Patient_Gender;
                           var payload = {
                              notification: {
                                 title: 'Confirmed STEMI',
                                 body: 'Confirmed STEMI for Patient: ' + Patient.Patient_Name + ', Age: ' + Patient.Patient_Age + ', Gender: ' + Patient.Patient_Gender,
                                 sound: 'high.mp3'
                              },
                              data: {
                                 patient: JSON.parse(JSON.stringify(Patient._id)),
                                 notification_type: 'Tele_ECG_Stemi_Confirm',
                                 click_action: 'FCM_PLUGIN_ACTIVITY',
                              }
                           };
                           if (AppUsers_FCMTokens.length > 0) {
                              FCM_App.messaging().sendToDevice(AppUsers_FCMTokens, payload, options).then((NotifyRes) => { });
                           }
                           // if (TabUsers_FCMTokens.length > 0) {
                           //    FCM_Tab.messaging().sendToDevice(TabUsers_FCMTokens, payload, options).then((NotifyRes) => { });
                           // }
                           var numbers = [];
                           numbers.push(NotifyUserDetails.Phone);
                           if (numbers.length > 0) {
                              var Msg = 'Confirmed STEMI for Patient: ' + Patient.Patient_Name + ', Age: ' + Patient.Patient_Age + ', Gender: ' + Patient.Patient_Gender;
                              axios({ method: 'post', url: 'http://bulksmsservice.co.in/httpapi/v1/sendsms?api-token=9)2_6eh0s,v3(*4.1alzcgjp8uxnotkdy7ibqr5f&numbers=' + numbers + '&route=2&message=' + Msg + '&sender=STEMIN', }).
                              then( (response) =>{ });
                           }
                           const Notification = new NotificationModel.NotificationSchema({
                              User_ID: mongoose.Types.ObjectId(NotifyUserDetails._id),
                              Patient_ID: Patient._id,
                              Confirmed_PatientId: NewDbId,
                              Notification_Type: 'Tele_ECG_Stemi_Confirm',
                              Message: 'Confirmed STEMI for Patient: ' + Patient.Patient_Name + ', Age: ' + Patient.Patient_Age + ', Gender: ' + Patient.Patient_Gender,
                              Message_Received: false,
                              Message_Viewed: false,
                              Active_Status: true,
                              If_Deleted: false
                           });
                           Notification.save();
                           res.status(200).send({ Success: true, Message: "STEMI Status Successfully Updated" });
                        } else {
                           res.status(200).send({ Success: true, Message: "STEMI Status Successfully Updated" });
                        }
                     }).catch( error_2 => {
                        res.status(417).send({ Success: false, Message: "Some error occurred while Update the STEMI Status!.", Error: error_2 });
                     });
                  }
               });

            }).catch( error_1 => {
               res.status(417).send({ Success: false, Message: "Some error occurred while Update the STEMI Status!.", Error: error_1 });
            });

         } else {
            if (User === null) {
               res.status(417).send({ Success: true, Message: "Invalid User Details!" });
            } else if (Patient === null) {
               res.status(417).send({ Success: true, Message: "Invalid Patient Details!" });
            } else {
               res.status(417).send({ Success: true, Message: "Invalid * Details!" });
            }
         }
      }).catch(error => {
         res.status(417).send({ Success: false, Message: "Some error occurred while Update the Patient Details!.", Error: error });
      });
   }
};


// Tele ECG Patient STEMI Not Confirm
exports.TeleECG_Patient_STEMI_NotConfirm = function (req, res) {
   var ReceivingData = req.body;

   if (!ReceivingData.User || ReceivingData.User === '') {
      res.status(400).send({ Success: false, Message: "User Details can not be empty" });
   } else if (!ReceivingData.Patient || ReceivingData.Patient === '') {
      res.status(400).send({ Success: false, Message: "Patient Details can not be empty" });
   } else {
      ReceivingData.User = mongoose.Types.ObjectId(ReceivingData.User);
      ReceivingData.Patient = mongoose.Types.ObjectId(ReceivingData.Patient);
      Promise.all([
         StemiUserModel.UserManagementSchema.findOne({ _id: ReceivingData.User }, {}, {}).exec(),
         PatientDetailsModel.TeleECGPatientDetailsSchema.findOne({ _id: ReceivingData.Patient }, {}, {}).exec(),
      ]).then( response => {
         const User = response[0];
         const Patient = response[1];
         if (User !== null && Patient !== null ) {
            
            var NotifyUser = null;
            if (JSON.parse(JSON.stringify(ReceivingData.User)) === JSON.parse(JSON.stringify(Patient.User)) && Patient.Case_Invite_Status === 'Accepted' && Patient.Invited_To !== null) {
               NotifyUser = Patient.Invited_To;
            }
            if ( Patient.Case_Invite_Status === 'Accepted' && Patient.Invited_To !== null && JSON.parse(JSON.stringify(ReceivingData.User)) === JSON.parse(JSON.stringify(Patient.Invited_To)) ) {
               NotifyUser = Patient.User;
            }
            var User_Type = User.User_Type === 'PU' ? 'Peripheral User' : User.User_Type === 'D' || User.User_Type === 'CDA'  ? 'Doctor' : '';

            Patient.Stemi_Status = 'Not-Confirmed';
            Patient.Confirmed_UserType = User_Type;
            Patient.Confirmed_By = ReceivingData.User;

            Promise.all([
               Patient.save(),
               StemiUserModel.UserManagementSchema.findOne({ _id: NotifyUser }, {}, {}).exec(),
               StemiAppUserModel.LoginHistorySchema.find({User: NotifyUser, Active_Status: true, If_Deleted: false}, {}, {Firebase_Token: 1, Device_Type: 1, Device_Id: 1, User: 1}).exec()
            ]).then( response_1 => {
               var NotifyUserDetails = response_1[1];
               var NotifyUserLogins = response_1[2];
               if (NotifyUser !== null) {
                  var AppUsers_FCMTokens = [];
                  var TabUsers_FCMTokens = [];
                  NotifyUserLogins.map(obj => {
                     if ((obj.Device_Type === 'Android' || obj.Device_Type === 'IOS') && obj.Firebase_Token !== '') {
                        AppUsers_FCMTokens.push(obj.Firebase_Token);
                     } else if (obj.Device_Type === 'TAB' && obj.Firebase_Token !== '') {
                        TabUsers_FCMTokens.push(obj.Firebase_Token);
                     }
                  });
                  AppUsers_FCMTokens = AppUsers_FCMTokens.filter((obj, index) => AppUsers_FCMTokens.indexOf(obj) === index);
                  TabUsers_FCMTokens = TabUsers_FCMTokens.filter((obj, index) => TabUsers_FCMTokens.indexOf(obj) === index);
                  Patient.Patient_Gender  = Patient.Patient_Gender === 'Male_to_Female' ? 'Male to Female' : Patient.Patient_Gender === 'Female_to_Male' ? 'Female to Male' : Patient.Patient_Gender;
                  var payload = {
                     notification: {
                        title: 'STEMI Not Confirmed',
                        body: 'STEMI Not Confirmed for Patient: ' + Patient.Patient_Name + ', Age: ' + Patient.Patient_Age + ', Gender: ' + Patient.Patient_Gender,
                        sound: 'notify_tone.mp3'
                     },
                     data: {
                        patient: JSON.parse(JSON.stringify(Patient._id)),
                        notification_type: 'Tele_ECG_Stemi_NotConfirm',
                        click_action: 'FCM_PLUGIN_ACTIVITY',
                     }
                  };
                  if (AppUsers_FCMTokens.length > 0) {
                     FCM_App.messaging().sendToDevice(AppUsers_FCMTokens, payload, options).then((NotifyRes) => { });
                  }
                  // if (TabUsers_FCMTokens.length > 0) {
                  //    FCM_Tab.messaging().sendToDevice(TabUsers_FCMTokens, payload, options).then((NotifyRes) => { });
                  // }
                  var numbers = [];
                  numbers.push(NotifyUserDetails.Phone);
                  if (numbers.length > 0) {
                     var Msg = 'STEMI Not Confirmed for Patient: ' + Patient.Patient_Name + ', Age: ' + Patient.Patient_Age + ', Gender: ' + Patient.Patient_Gender;
                     axios({ method: 'post', url: 'http://bulksmsservice.co.in/httpapi/v1/sendsms?api-token=9)2_6eh0s,v3(*4.1alzcgjp8uxnotkdy7ibqr5f&numbers=' + numbers + '&route=2&message=' + Msg + '&sender=STEMIN', }).
                     then( (response) =>{ });
                  }
                  const Notification = new NotificationModel.NotificationSchema({
                     User_ID: mongoose.Types.ObjectId(NotifyUserDetails._id),
                     Patient_ID: Patient._id,
                     Confirmed_PatientId: null,
                     Notification_Type: 'Tele_ECG_Stemi_NotConfirm',
                     Message: 'STEMI Not Confirmed for Patient: ' + Patient.Patient_Name + ', Age: ' + Patient.Patient_Age + ', Gender: ' + Patient.Patient_Gender,
                     Message_Received: false,
                     Message_Viewed: false,
                     Active_Status: true,
                     If_Deleted: false
                  });
                  Notification.save();
                  res.status(200).send({ Success: true, Message: "STEMI Status Successfully Updated" });
               } else {
                  res.status(200).send({ Success: true, Message: "STEMI Status Successfully Updated" });
               }
            }).catch( error_1 => {
               res.status(417).send({ Success: false, Message: "Some error occurred while Update the STEMI Status!.", Error: error_1 });
            });
         } else {
            if (User === null) {
               res.status(417).send({ Success: true, Message: "Invalid User Details!" });
            } else if (Patient === null) {
               res.status(417).send({ Success: true, Message: "Invalid Patient Details!" });
            } else {
               res.status(417).send({ Success: true, Message: "Invalid * Details!" });
            }
         }
      }).catch(error => {
         res.status(417).send({ Success: false, Message: "Some error occurred while Update the Patient Details!.", Error: error });
      });
   }
};


// Tele ECG Case Dismiss
exports.TeleECG_Case_Dismiss = function (req, res) {
   var ReceivingData = req.body;

   if (!ReceivingData.User || ReceivingData.User === '') {
      res.status(400).send({ Success: false, Message: "User Details can not be empty" });
   } else if (!ReceivingData.Patient || ReceivingData.Patient === '') {
      res.status(400).send({ Success: false, Message: "Patient Details can not be empty" });
   } else {
      ReceivingData.User = mongoose.Types.ObjectId(ReceivingData.User);
      ReceivingData.Patient = mongoose.Types.ObjectId(ReceivingData.Patient);
      Promise.all([
         StemiUserModel.UserManagementSchema.findOne({ _id: ReceivingData.User }, {}, {}).exec(),
         PatientDetailsModel.TeleECGPatientDetailsSchema.findOne({ _id: ReceivingData.Patient }, {}, {}).exec(),
      ]).then( response => {
         const User = response[0];
         const Patient = response[1];
         if (User !== null && Patient !== null ) {
            
            var NotifyUser = null;
            if (Patient.Case_Invite_Status === 'Accepted' && Patient.Invited_To !== null) {
               NotifyUser = Patient.Invited_To;
            }

            if (ReceivingData.Thrombolysed_At && ReceivingData.Thrombolysed_At !== '' && ReceivingData.Thrombolysed_At !== null) {
               ReceivingData.Thrombolysed_At = moment(ReceivingData.Thrombolysed_At, "YYYY-MM-DD HH:mm").toDate();
            } else {
               ReceivingData.Thrombolysed_At = null;
            }
            ReceivingData.Was_Thrombolysed = ReceivingData.Was_Thrombolysed !== undefined ? ReceivingData.Was_Thrombolysed : '';
            ReceivingData.Lytic_Agent = ReceivingData.Lytic_Agent !== undefined ? ReceivingData.Lytic_Agent : '';
            ReceivingData.Other_Treatments = ReceivingData.Other_Treatments !== undefined ? ReceivingData.Other_Treatments : '';

            Patient.Case_Status = 'Dismissed';
            Patient.Was_Thrombolysed = ReceivingData.Was_Thrombolysed || '';
            Patient.Lytic_Agent = ReceivingData.Lytic_Agent || '';
            Patient.Thrombolysed_At = ReceivingData.Thrombolysed_At || null;
            Patient.Other_Treatments = ReceivingData.Other_Treatments || '';
            Patient.ReasonOfDismissal = ReceivingData.ReasonOfDismissal || '';

            Promise.all([
               Patient.save(),
               StemiUserModel.UserManagementSchema.findOne({ _id: NotifyUser }, {}, {}).exec(),
               StemiAppUserModel.LoginHistorySchema.find({User: NotifyUser, Active_Status: true, If_Deleted: false}, {}, {Firebase_Token: 1, Device_Type: 1, Device_Id: 1, User: 1}).exec()
            ]).then( response_1 => {
               var NotifyUserDetails = response_1[1];
               var NotifyUserLogins = response_1[2];
               if (NotifyUser !== null) {
                  var AppUsers_FCMTokens = [];
                  var TabUsers_FCMTokens = [];
                  NotifyUserLogins.map(obj => {
                     if ((obj.Device_Type === 'Android' || obj.Device_Type === 'IOS') && obj.Firebase_Token !== '') {
                        AppUsers_FCMTokens.push(obj.Firebase_Token);
                     } else if (obj.Device_Type === 'TAB' && obj.Firebase_Token !== '') {
                        TabUsers_FCMTokens.push(obj.Firebase_Token);
                     }
                  });
                  AppUsers_FCMTokens = AppUsers_FCMTokens.filter((obj, index) => AppUsers_FCMTokens.indexOf(obj) === index);
                  TabUsers_FCMTokens = TabUsers_FCMTokens.filter((obj, index) => TabUsers_FCMTokens.indexOf(obj) === index);
                  Patient.Patient_Gender  = Patient.Patient_Gender === 'Male_to_Female' ? 'Male to Female' : Patient.Patient_Gender === 'Female_to_Male' ? 'Female to Male' : Patient.Patient_Gender;
                  var payload = {
                     notification: {
                        title: 'Case Dismissed',
                        body: 'Case Dismissed for Patient: ' + Patient.Patient_Name + ', Age: ' + Patient.Patient_Age + ', Gender: ' + Patient.Patient_Gender,
                        sound: 'notify_tone.mp3'
                     },
                     data: {
                        patient: JSON.parse(JSON.stringify(Patient._id)),
                        notification_type: 'Tele_ECG_Case_Dismissed',
                        click_action: 'FCM_PLUGIN_ACTIVITY',
                     }
                  };
                  if (AppUsers_FCMTokens.length > 0) {
                     FCM_App.messaging().sendToDevice(AppUsers_FCMTokens, payload, options).then((NotifyRes) => { });
                  }
                  // if (TabUsers_FCMTokens.length > 0) {
                  //    FCM_Tab.messaging().sendToDevice(TabUsers_FCMTokens, payload, options).then((NotifyRes) => { });
                  // }
                  var numbers = [];
                  numbers.push(NotifyUserDetails.Phone);
                  if (numbers.length > 0) {
                     var Msg = 'Case Dismissed for Patient: ' + Patient.Patient_Name + ', Age: ' + Patient.Patient_Age + ', Gender: ' + Patient.Patient_Gender;
                     axios({ method: 'post', url: 'http://bulksmsservice.co.in/httpapi/v1/sendsms?api-token=9)2_6eh0s,v3(*4.1alzcgjp8uxnotkdy7ibqr5f&numbers=' + numbers + '&route=2&message=' + Msg + '&sender=STEMIN', }).
                     then( (response) =>{ });
                  }
                  const Notification = new NotificationModel.NotificationSchema({
                     User_ID: mongoose.Types.ObjectId(NotifyUserDetails._id),
                     Patient_ID: Patient._id,
                     Confirmed_PatientId: null,
                     Notification_Type: 'Tele_ECG_Case_Dismissed',
                     Message: 'Case Dismissed for Patient: ' + Patient.Patient_Name + ', Age: ' + Patient.Patient_Age + ', Gender: ' + Patient.Patient_Gender,
                     Message_Received: false,
                     Message_Viewed: false,
                     Active_Status: true,
                     If_Deleted: false
                  });
                  Notification.save();
                  res.status(200).send({ Success: true, Message: "Successfully Dismissed" });
               } else {
                  res.status(200).send({ Success: true, Message: "Successfully Dismissed" });
               }
            }).catch( error_1 => {
               res.status(417).send({ Success: false, Message: "Some error occurred while Patient case Dismissal!.", Error: error_1 });
            });
         } else {
            if (User === null) {
               res.status(417).send({ Success: true, Message: "Invalid User Details!" });
            } else if (Patient === null) {
               res.status(417).send({ Success: true, Message: "Invalid Patient Details!" });
            } else {
               res.status(417).send({ Success: true, Message: "Invalid * Details!" });
            }
         }
      }).catch(error => {
         res.status(417).send({ Success: false, Message: "Some error occurred while Patient case Dismissal!.", Error: error });
      });
   }
};


//Notification Counts
exports.Notification_Counts = function (req, res) {
   var ReceivingData = req.body;
   if (!ReceivingData.User || ReceivingData.User === '') {
      res.status(400).send({ Success: false, Message: "User ID can not be empty" });
   } else {
      ReceivingData.User = mongoose.Types.ObjectId(ReceivingData.User);
      const AccessibleTypes = ['Tele_ECG_Case_Dismissed', 'Tele_ECG_Stemi_NotConfirm', 'Tele_ECG_Stemi_Confirm', 'Tele_ECG_Invite_Rejected', 'Tele_ECG_Invite_Accepted', 'Tele_ECG_Invite', 'New_Tele_ECG'];
      NotificationModel.NotificationSchema.countDocuments({ Notification_Type: { $in: AccessibleTypes }, User_ID: ReceivingData.User, Active_Status: true, If_Deleted: false })
         .exec((err, result) => {
            if (err) {
               res.status(417).send({ Success: false, Message: "Some error occurred while Find The Notification Details!.", Error: err });
            } else {
               res.status(200).send({ Success: true, Message: "Success", Response: result });
            }
         });
   }
};


// All Notifications List
exports.All_Notifications_List = function (req, res) {
   var ReceivingData = req.body;
   if (!ReceivingData.User || ReceivingData.User === '') {
      res.status(400).send({ Success: false, Message: "User ID can not be empty" });
   } else {
      ReceivingData.User = mongoose.Types.ObjectId(ReceivingData.User);
      const AccessibleTypes = ['Tele_ECG_Case_Dismissed', 'Tele_ECG_Stemi_NotConfirm', 'Tele_ECG_Stemi_Confirm', 'Tele_ECG_Invite_Rejected', 'Tele_ECG_Invite_Accepted', 'Tele_ECG_Invite', 'New_Tele_ECG'];
      NotificationModel.NotificationSchema.find({ Notification_Type: { $in: AccessibleTypes }, User_ID: ReceivingData.User, Active_Status: true, If_Deleted: false }, {}, {'sort': { createdAt: -1 }})
         .exec(function (err, result) {
            if (err) {
               res.status(417).send({ Success: false, Message: "Some error occurred while Find The Notification Details!.", Error: err });
            } else {
               var Notification_Ids = [];
               result.map(obj => {
                  Notification_Ids.push(obj._id);
               });

               NotificationModel.NotificationSchema.updateMany({ _id: { $in: Notification_Ids } }, { $set: { Message_Received: true } }).exec();

               res.status(200).send({ Success: true, Message: 'Success', Response: result });
            }
         });
   }
};


// User Viewed for Notification
exports.Notification_Viewed_Update = function (req, res) {
   var ReceivingData = req.body;
   if (!ReceivingData.Notification_ID || ReceivingData.Notification_ID === '') {
      res.status(400).send({ Success: false, Message: "Notification Details can not be empty" });
   } else {
      ReceivingData.Notification_ID = mongoose.Types.ObjectId(ReceivingData.Notification_ID);
      NotificationModel.NotificationSchema.updateOne({ _id: ReceivingData.Notification_ID }, { $set: { Message_Viewed: true } })
         .exec(function (err, result) {
            if (err) {
               res.status(417).send({ Success: false, Message: "Some error occurred while Find The Notification Details!.", Error: err });
            } else {
               res.status(200).send({ Success: true, Message: 'Notification View Updated' });
            }
         });
   }
};


// User Viewed Notifications Delete
exports.Viewed_Notifications_Delete = function (req, res) {
   var ReceivingData = req.body;
   if (!ReceivingData.User || ReceivingData.User === '') {
      res.status(400).send({ Success: false, Message: "User Details can not be empty" });
   } else {
      ReceivingData.User = mongoose.Types.ObjectId(ReceivingData.User);
      const AccessibleTypes = ['Tele_ECG_Case_Dismissed', 'Tele_ECG_Stemi_NotConfirm', 'Tele_ECG_Stemi_Confirm', 'Tele_ECG_Invite_Rejected', 'Tele_ECG_Invite_Accepted', 'Tele_ECG_Invite', 'New_Tele_ECG'];
      NotificationModel.NotificationSchema.updateMany({ Notification_Type: { $in: AccessibleTypes }, User_ID: ReceivingData.User }, { $set: { If_Deleted: true } })
         .exec(function (err, result) {
            if (err) {
               res.status(417).send({ Success: false, Message: "Some error occurred while Find The Notification Details!.", Error: err });
            } else {
               res.status(200).send({ Success: true, Message: 'Viewed Notifications Deleted' });
            }
         });
   }
};




// Push Notification Test
exports.PushNotificationTest = function (req, res) {
   var ReceivingData = req.body;

   if (!ReceivingData.Firebase_Token || ReceivingData.Firebase_Token === '') {
      res.status(400).send({ Success: false, Message: "Firebase Token can not be empty" });
   } else if (!ReceivingData.Volume || ReceivingData.Volume === '') {
      res.status(400).send({ Success: false, Message: "Volume can not be empty" });
   } else {

      var AppUsers_FCMTokens = [];
      AppUsers_FCMTokens.push(ReceivingData.Firebase_Token);
      var payload = {
         notification: {
            title: 'NotificationTest',
            body: 'Notification Ringtone Test' + ReceivingData.Volume,
            sound: ReceivingData.Volume + '.mp3',
         },
         data: {
            patient: '123123123',
            notification_type: 'Notification_Test',
            click_action: 'FCM_PLUGIN_ACTIVITY',
         }
      };
      FCM_App.messaging().sendToDevice(AppUsers_FCMTokens, payload, options).then((NotifyRes) => {
         res.status(200).send({ Success: true, Message: "Successfully Send", Response: NotifyRes });
      }).catch(error => {
         res.status(417).send({ Success: false, Message: "Some error occurred!.", Error: error });
      });
   }
};



function DoctorNotifySchedule(ClusterDoctor, payload, Patient, Invited_To) {
   
   const Duration = ClusterDoctor.Alert_Duration !== undefined && !isNaN(ClusterDoctor.Alert_Duration) && ClusterDoctor.Alert_Duration > 0 ? (ClusterDoctor.Alert_Duration * 60000) : 300000;
   var scheduleTime = new Date(Date.now() + Duration);
   const S = Schedule.scheduleJob(scheduleTime, function(time) {
      PatientDetailsModel.TeleECGPatientDetailsSchema
      .findOne({_id: Patient._id, Case_Invite_Status: 'Pending',  Invited_To: Invited_To })
      .exec( (err, result) => {
         if (!err && result !== null) {
            StemiAppUserModel.LoginHistorySchema
            .find({ User: ClusterDoctor._id, Active_Status: true, If_Deleted: false })
            .exec((err_1, result_1) => {
               if (!err_1 && result_1.length > 0) {
                  var AppUsers_FCMTokens = [];
                  var TabUsers_FCMTokens = [];
                  result_1.map(obj => {
                     if ((obj.Device_Type === 'Android' || obj.Device_Type === 'IOS') && obj.Firebase_Token !== '') {
                        AppUsers_FCMTokens.push(obj.Firebase_Token);
                     } else if (obj.Device_Type === 'TAB' && obj.Firebase_Token !== '') {
                        TabUsers_FCMTokens.push(obj.Firebase_Token);
                     }
                  });
                  AppUsers_FCMTokens = AppUsers_FCMTokens.filter((obj, index) => AppUsers_FCMTokens.indexOf(obj) === index);
                  TabUsers_FCMTokens = TabUsers_FCMTokens.filter((obj, index) => TabUsers_FCMTokens.indexOf(obj) === index);
                  if (AppUsers_FCMTokens.length > 0) {
                     FCM_App.messaging().sendToDevice(AppUsers_FCMTokens, payload, options).then((NotifyRes) => { });
                  }
                  // if (TabUsers_FCMTokens.length > 0) {
                  //    FCM_Tab.messaging().sendToDevice(TabUsers_FCMTokens, payload, options).then((NotifyRes) => { });
                  // }
                  var numbers = [];
                  numbers.push(ClusterDoctor.Phone);
                  if (numbers.length > 0) {
                     var Msg = 'Tele ECG Invite for Patient: ' + Patient.Patient_Name + ', Age: ' + Patient.Patient_Age + ', Gender: ' + Patient.Patient_Gender;
                     axios({ method: 'post', url: 'http://bulksmsservice.co.in/httpapi/v1/sendsms?api-token=9)2_6eh0s,v3(*4.1alzcgjp8uxnotkdy7ibqr5f&numbers=' + numbers + '&route=2&message=' + Msg + '&sender=STEMIN', }).
                     then( (response) =>{ });
                  }
               }
            });
         }
      });
   });
}