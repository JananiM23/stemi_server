var PatientDetailsModel = require('../../../mobile_api/models/patient-management/patient_details.model');
var HospitalManagementModel = require('../../../api/models/hospital_management.model');
var StemiUserModel = require('../../../api/models/user_management.model');
var StemiAppUserModel = require('../../../mobile_api/models/login_management.model');
var NotificationModel = require('../../../api/models/notification_management.model');
var StemiClusterModel = require('../../../api/models/cluster_management.model');
var WebPatientDetailsModel = require('../../../api/models/patient-management/patient_details.model');
var mongoose = require('mongoose');
var moment = require('moment');
var CryptoJS = require("crypto-js");
var crypto = require("crypto");
var FCM_App = require('./../../../../Config/fcm_config').first;
var FCM_Tab = require('./../../../../Config/fcm_config').second;
var options = {
   priority: 'high',
   timeToLive: 60 * 60 * 24
};
var QRCode = require('qrcode');

// SMS Notification System
const axios = require('axios');
var Schedule = require('node-schedule');

// PatientConfirm_By_User ---------------------------------------------
exports.PatientConfirm_By_User = function (req, res) {
   var ReceivingData = req.body;  
   if (!ReceivingData.User || ReceivingData.User === '') {
      res.status(400).send({ Status: false, Message: "User Details can not be empty" });
   } else if (!ReceivingData.Hospital || ReceivingData.Hospital === '') {
      res.status(400).send({ Status: false, Message: "Hospital Details can not be empty" });
   } else if (!ReceivingData.Patient_Name || ReceivingData.Patient_Name === '') {
      res.status(400).send({ Status: false, Message: "Patient Name can not be empty" });
   } else {
      var ECG_Arr = [];
      ReceivingData.Hospital = mongoose.Types.ObjectId(ReceivingData.Hospital);
      StemiAppUserModel.LoginHistorySchema.findOne({ User: ReceivingData.User, Active_Status: true, If_Deleted: false }).exec((err_5,  result_5) => {
         if (err_5) {
            res.status(417).send({ Success: false, Message: "Some error occurred while Find The User Details!.", Error: err });
         } else {
            if (result_5 !== null) {
               var Date_Time = moment(ReceivingData.ECG_Taken_date_time, "YYYY-MM-DD HH:mm").toDate();              
               if (result_5.Device_Type === 'Android' || result_5.Device_Type === 'IOS') {
                  ECG_Arr.push({
                     "Name": Date_Time.valueOf() + '-' + 'APP-1',
                     "ECG_File": ReceivingData.ECG_File,
                     "DateTime":Date_Time
                  });
               } else {
                  ECG_Arr.push({
                     "Name": Date_Time.valueOf() + '-' + 'TAB-1',
                     "ECG_File": ReceivingData.ECG_File,
                     "DateTime": Date_Time
                  });
               }
               // if (ReceivingData.Symptoms.Duration_of_Pain && ReceivingData.Symptoms.Duration_of_Pain !== '' && ReceivingData.Symptoms.Duration_of_Pain !== null) {
               //    ReceivingData.Symptoms.Duration_of_Pain = moment(ReceivingData.Symptoms.Duration_of_Pain, "YYYY-MM-DD HH:mm").toDate();
               // } else {
               //    ReceivingData.Symptoms.Duration_of_Pain = null;
               // }
               var Location_of_Pain = ReceivingData.Symptoms.Location_of_Pain;
               const Create_PatientBasicDetails = new PatientDetailsModel.PatientBasicDetailsSchema({
                  Patient_Name: ReceivingData.Patient_Name || '',
                  Patient_Age: ReceivingData.Patient_Age || null,
                  Patient_Gender: ReceivingData.Patient_Gender || '',
                  Admission_Type: ReceivingData.Admission_Type || 'Direct',
                  User: mongoose.Types.ObjectId(ReceivingData.User) || '',
                  Confirmed_UserType: 'Peripheral User',
                  Confirmed_By: mongoose.Types.ObjectId(ReceivingData.User) || '',
                  Risk_Factors: ReceivingData.Risk_Factors || [],
                  Confirmed_ECG: ReceivingData.ECG_File || '',
                  ECGFile_Array: ECG_Arr,
                  Current_ECG_File: ReceivingData.ECG_File || '',
                  Stemi_Status: 'Stemi_Confirmed',
                  'Symptoms.Chest_Discomfort': ReceivingData.Symptoms.Chest_Discomfort || '',
                  // 'Symptoms.Duration_of_Pain': ReceivingData.Symptoms.Duration_of_Pain || null,
                  'Symptoms.Duration_of_Pain': null,
                  'Symptoms.Location_of_Pain': Location_of_Pain || '',
                  ECG_Taken_date_time: Date_Time || null,
                  QR_image: '',
                  Hospital: ReceivingData.Hospital || null,
                  EntryFrom: ReceivingData.EntryFrom  || '',
                  Active_Status: true,
                  If_Deleted: false
               });
               
               Create_PatientBasicDetails.save(function (err, resultNew) {
                  if (err) {
                     res.status(417).send({ Status: false, Message: "Some error occurred while Creating the New Patient!.", Error: err });
                  } else {                     
                     // Notification System
                     Promise.all([
                        HospitalManagementModel.HospitalManagementSchema.findOne({ _id: ReceivingData.Hospital }, { Connected_Clusters: 1, Hospital_Code: 1, Cardiologist_Array: 1 }, {}).exec(),
                        StemiUserModel.UserManagementSchema.find({ User_Type: 'D', HospitalsArray: ReceivingData.Hospital }, {}, {}).exec(),
                        StemiUserModel.UserManagementSchema.findOne({ _id: ReceivingData.User }, {}, {}).populate({ path: 'Cluster' }).populate({ path: 'Location' }).exec(),
                     ]).then(response => {
                        const HosDetails = response[0];
                        const Doctors = response[1];
                        const ClustersDetails = response[2];

                        var NotifyToUsers = [];
                        var NotifyToMobUser = [];

                        Doctors.map(obj => { NotifyToUsers.push(obj._id); NotifyToMobUser.push(obj.Phone); });
                        NotifyToUsers = NotifyToUsers.filter((obj, index) => NotifyToUsers.indexOf(obj) === index);

                        var Taken_Type;
                        if (resultNew.EntryFrom === "TAB") {
                           Taken_Type = 'Systemic';
                        } else {
                           Taken_Type = 'Manual';
                        }
                        WebPatientDetailsModel.PatientBasicDetailsSchema.findOne({}, {}, { 'sort': { createdAt: -1 } }, function (errNew, resultNEW) {
                           if (errNew) {
                              res.status(417).send({ Status: false, Message: "Some error occurred while STEMI Confirm the Patient!.", Error: errNew });
                           } else {
                              var LastPatientCode = resultNEW !== null ? (resultNEW.Patient_Code + 1) : 1;
                              var Patient_Code = (LastPatientCode.toString()).padStart(4, 0);
                              var Location_Code = (ClustersDetails.Location.Location_Code).toString().padStart(2, 0);
                              var Cluster_Code = (ClustersDetails.Cluster.Cluster_Code).toString().padStart(2, 0);
                              var Hospital_Code = (HosDetails.Hospital_Code).toString().padStart(3, 0);
                              var Patient_Unique = Location_Code + Cluster_Code + Hospital_Code + Patient_Code;
                              var Patient_Unique_Identity = Location_Code + '-' + Cluster_Code + '-' + Hospital_Code + '-' + Patient_Code;
                              var NonCluster = resultNew.Admission_Type === "Non_Cluster" ? true : false;
                              var Temp_Patient_Unique = Patient_Unique_Identity;
                              // if (resultNew.Symptoms.Duration_of_Pain && resultNew.Symptoms.Duration_of_Pain !== '' && resultNew.Symptoms.Duration_of_Pain !== null) {
                              //    resultNew.Symptoms.Duration_of_Pain = moment(resultNew.Symptoms.Duration_of_Pain, "YYYY-MM-DD HH:mm").toDate();
                              // } else {
                              //    resultNew.Symptoms.Duration_of_Pain = null;
                              // }
                              var Data_Type = 'Pre';
                              if (ClustersDetails.Cluster.Data_Type) {
                                 Data_Type = ClustersDetails.Cluster.Data_Type;
                              }
                              const NewDbId = mongoose.Types.ObjectId();
                              resultNew.ECGFile_Array = resultNew.ECGFile_Array.map(obj => {
                                 obj.Hospital = mongoose.Types.ObjectId(resultNew.Hospital);
                                 return obj;
                              });
                              
                              var QRid = NewDbId.toString() + '-Stemi';
                              QRCode.toDataURL(QRid, function (err_4, url) {
                                 if (err_4) {
                                    res.status(417).send({ Status: false, Message: "Some error occurred while STEMI Confirm the Patient!.", Error: err_4 });
                                 } else {
                                    var QrFile = url;
                                    const Create_WebPatientBasicDetails = new WebPatientDetailsModel.PatientBasicDetailsSchema({
                                       _id: NewDbId,
                                       Patient_Code: Patient_Code || 1,
                                       Patient_Unique: Patient_Unique || '00000000000',
                                       Patient_Unique_Identity: Patient_Unique_Identity,
                                       Temp_Patient_Unique: Temp_Patient_Unique,
                                       Patient_Name: resultNew.Patient_Name || '',
                                       Patient_Age: resultNew.Patient_Age || null,
                                       Patient_Gender: resultNew.Patient_Gender || '',
                                       Hospital_History: [{
                                          Hospital_Count: 1,
                                          Hospital: mongoose.Types.ObjectId(resultNew.Hospital) || null,
                                          Handled_User: mongoose.Types.ObjectId(resultNew.User) || null,
                                          Patient_Admission_Type: resultNew.Admission_Type || 'Direct',
                                          Hospital_Arrival_Date_Time: null
                                       }],
                                       Transport_History: [{
                                          Transport_Count: 1,
                                          Transport_From_Hospital: null,
                                          Transport_To_Hospital: mongoose.Types.ObjectId(resultNew.Hospital),
                                          TransportMode: null,
                                          ClusterAmbulance: null,
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
                                          Hospital: mongoose.Types.ObjectId(resultNew.Hospital) || null,
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
                                       Post_Thrombolysis: "",
                                       "Post_Thrombolysis_Data.Thrombolytic_Agent": "",
                                       "Post_Thrombolysis_Data.Dosage": "",
                                       "Post_Thrombolysis_Data.Dosage_Units": "",
                                       "Post_Thrombolysis_Data.Post_Thrombolysis_Start_Date_Time": null,
                                       "Post_Thrombolysis_Data.Post_Thrombolysis_End_Date_Time": null,
                                       "Post_Thrombolysis_Data.Ninety_Min_ECG": "",
                                       "Post_Thrombolysis_Data.Ninety_Min_ECG_Date_Time": null,
                                       "Post_Thrombolysis_Data.Successful_Lysis": "",
													"Post_Thrombolysis_Data.MissedSTEMI": "",
                                       "Post_Thrombolysis_Data.Autoreperfused": "",
                                       "Post_Thrombolysis_Data.Others": "",
                                       Patient_Payment: '',
                                       Symptom_Onset_Date_Time: null,
                                       Initiated_Hospital: mongoose.Types.ObjectId(resultNew.Hospital) || null,
                                       Initiated_Hospital_Arrival: null,
                                       EMS_Ambulance_Call_Date_Time: null,
                                       EMS_Ambulance_Departure_Date_Time: null,
                                       If_NonCluster: NonCluster || false,
                                       NonCluster_Hospital_Name: '',
                                       NonCluster_Hospital_Address: '',
                                       NonCluster_Hospital_Arrival_Date_Time: null,
                                       ECG_File: resultNew.Confirmed_ECG || '',
                                       All_ECG_Files: resultNew.ECGFile_Array,
                                       ECG_Taken_date_time: resultNew.ECG_Taken_date_time || null,
                                       Stemi_Confirmed: 'Yes',
                                       QR_image: QrFile,
                                       Stemi_Confirmed_Date_Time: new Date() || null,
                                       Stemi_Confirmed_Hospital: mongoose.Types.ObjectId(resultNew.Hospital) || null,
                                       Stemi_Confirmed_Type: 'Peripheral User',
                                       Stemi_Confirmed_By: mongoose.Types.ObjectId(ReceivingData.User) || null,
                                       ECG_Taken_Type: Taken_Type,
                                       Doctor_Notes: '',
                                       IfThrombolysis: null,
                                       ThrombolysisFrom: null,
                                       IfPCI: null,
                                       PCIFrom: null,
                                       IfDeath: null,
                                       IfDischarge: null,
                                       TransferBending: null,
                                       TransferBendingTo: null,
                                       Data_Type: Data_Type,
                                       Active_Status: true,
                                       If_Deleted: false,
                                       LastCompletionChild: 'Co-Morbid_Conditions'
                                    });
                                    const Create_PatientCardiacHistory = new WebPatientDetailsModel.PatientCardiacHistorySchema({
                                       PatientId: NewDbId,
                                       Hospital: resultNew.Hospital,
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
                                       Chest_Discomfort: resultNew.Symptoms.Chest_Discomfort || '',
                                       // Duration_of_Pain_Date_Time: resultNew.Symptoms.Duration_of_Pain || null,
                                       Duration_of_Pain_Date_Time: null,
                                       Location_of_Pain: resultNew.Symptoms.Location_of_Pain || '',
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
                                       Hospital: resultNew.Hospital,
                                       Smoker: resultNew.Risk_Factors[0].Smoker || '',
                                       Beedies: false,
                                       Cigarettes:  false,
                                       Number_of_Beedies:  null,
                                       Number_of_Beedies_Duration_Years: null,
                                       Number_of_Beedies_Duration_Months: null,
                                       Number_of_Cigarettes: null,
                                       Number_of_Cigarettes_Duration_Years: null,
                                       Number_of_Cigarettes_Duration_Months: null,
                                       Previous_IHD: resultNew.Risk_Factors[0].Previous_History_of_IHD || '',
                                       Diabetes_Mellitus: resultNew.Risk_Factors[0].Diabetes || '',
                                       High_Cholesterol: resultNew.Risk_Factors[0].High_Cholesterol || '',
                                       Duration_Years: null,
                                       Duration_Months: null,
                                       OHA:  '',
                                       Insulin: '',
                                       Family_history_of_IHD: resultNew.Risk_Factors[0].Family_History_of_IHD || '',
                                       Hypertension: resultNew.Risk_Factors[0].Hypertension || '',
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
                                    ]).then( response => {
                                       res.status(200).send({ Success: true, Message: 'Patient Added and Stemi Confirmed' });
                                       //  FCM Push Notification
                                       StemiAppUserModel.LoginHistorySchema.find({ User: { $in: NotifyToUsers }, Active_Status: true, If_Deleted: false }).exec((err_1, result_1) => {
                                          if (!err_1) {
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
                                             resultNew = JSON.parse(JSON.stringify(resultNew));
                                             resultNew.Patient_Gender  = resultNew.Patient_Gender === 'Male_to_Female' ? 'Male to Female' : resultNew.Patient_Gender === 'Female_to_Male' ? 'Female to Male' : resultNew.Patient_Gender;
                                             var payload = {
                                                notification: {
                                                   title: 'STEMI Confirm',
                                                   body: 'Confirmed STEMI for Patient: ' + resultNew.Patient_Name + ', Age: ' + resultNew.Patient_Age + ', Gender: ' + resultNew.Patient_Gender,
                                                   sound: 'notify_tone.mp3'
                                                },
                                                data: {
                                                   patient: resultNew._id,
                                                   notification_type: 'Stemi_Confirmed_ByUser',
                                                   click_action: 'FCM_PLUGIN_ACTIVITY',
                                                }
                                             };
                                             if (AppUsers_FCMTokens.length > 0) {
                                                FCM_App.messaging().sendToDevice(AppUsers_FCMTokens, payload, options).then((NotifyRes) => { });
                                             }
                                             if (TabUsers_FCMTokens.length > 0) {
                                                FCM_Tab.messaging().sendToDevice(TabUsers_FCMTokens, payload, options).then((NotifyRes) => { });
                                             }

                                             var numbers = NotifyToMobUser;
                                             if (numbers.length > 0) {
                                                var Msg = 'Confirmed STEMI for Patient: ' + resultNew.Patient_Name + ', Age: ' + resultNew.Patient_Age + ', Gender: ' + resultNew.Patient_Gender;
                                                axios({   method: 'post',   url: 'http://bulksmsservice.co.in/httpapi/v1/sendsms?api-token=9)2_6eh0s,v3(*4.1alzcgjp8uxnotkdy7ibqr5f&numbers=' + numbers + '&route=2&message=' + Msg + '&sender=STEMIN', }).
                                                then( (response) =>{ });
                                             }
                                          
                                          }
                                       });
                                       NotifyToUsers.map(obj => {
                                          const Notification = new NotificationModel.NotificationSchema({
                                             User_ID: mongoose.Types.ObjectId(obj),
                                             Patient_ID: resultNew._id,
                                             Confirmed_PatientId: NewDbId,
                                             Notification_Type: 'Stemi_Confirmed_ByUser',
                                             Message: 'Confirmed STEMI for Patient: ' + resultNew.Patient_Name + ', Age: ' + resultNew.Patient_Age + ', Gender: ' + resultNew.Patient_Gender,
                                             Message_Received: false,
                                             Message_Viewed: true,
                                             Active_Status: true,
                                             If_Deleted: false
                                          });
                                          Notification.save();
                                       });
                                    }).catch( catchErr => {
                                       res.status(417).send({ Status: false, Message: "Some error occurred while Creating the New Patient Details!.", Error: catchErr });
                                    });
                                 }
                              });
                           }
                        });
                     }).catch(error => {
                        res.status(417).send({ Status: false, Message: "Some error occurred while Creating the New Patient Details!.", Error: error });
                     });
                  }
               });
            } else {
               res.status(400).send({ Success: true, Message: "Invalid User Details" });
            }
         }
      });
   }
};

// Stemi_Ask_Cardiologist
exports.Stemi_Ask_To_Cardiologist = function (req, res) {
   var ReceivingData = req.body;
   
   if (!ReceivingData.User || ReceivingData.User === '') {
      res.status(400).send({ Status: false, Message: "User Details can not be empty" });
   } else if (!ReceivingData.Hospital || ReceivingData.Hospital === '') {
      res.status(400).send({ Status: false, Message: "Hospital Details can not be empty" });
   } else if (!ReceivingData.Patient_Name || ReceivingData.Patient_Name === '') {
      res.status(400).send({ Status: false, Message: "Patient Name can not be empty" });
   }  else if (!ReceivingData.EntryFrom || ReceivingData.EntryFrom === '') {
      res.status(400).send({ Status: false, Message: "Entry From can not be empty" });
   } else {

      ReceivingData.Hospital = mongoose.Types.ObjectId(ReceivingData.Hospital);
      // if (ReceivingData.Symptoms.Duration_of_Pain && ReceivingData.Symptoms.Duration_of_Pain !== '' && ReceivingData.Symptoms.Duration_of_Pain !== null) {
      //    ReceivingData.Symptoms.Duration_of_Pain = moment(ReceivingData.Symptoms.Duration_of_Pain, "YYYY-MM-DD HH:mm").toDate();
      // } else {
      //    ReceivingData.Symptoms.Duration_of_Pain = null;
      // }
      var Location_of_Pain = ReceivingData.Symptoms.Location_of_Pain;
      const Create_PatientBasicDetails = new PatientDetailsModel.PatientBasicDetailsSchema({
         Patient_Name: ReceivingData.Patient_Name || '',
         Patient_Age: ReceivingData.Patient_Age || null,
         Patient_Gender: ReceivingData.Patient_Gender || '',
         Admission_Type: ReceivingData.Admission_Type || 'Direct',
         User: mongoose.Types.ObjectId(ReceivingData.User) || '',
         Confirmed_UserType: '',
         Confirmed_By: null,
         Risk_Factors: ReceivingData.Risk_Factors || [],
         Confirmed_ECG: '',
         ECGFile_Array: [],
         Current_ECG_File: ReceivingData.ECG_File || '',
         Stemi_Status: 'Stemi_Ask_Cardiologist',
         'Symptoms.Chest_Discomfort': ReceivingData.Symptoms.Chest_Discomfort || '',
         // 'Symptoms.Duration_of_Pain': ReceivingData.Symptoms.Duration_of_Pain || null,
         'Symptoms.Duration_of_Pain': null,
         'Symptoms.Location_of_Pain': Location_of_Pain || '',
         ECG_Taken_date_time: moment(ReceivingData.ECG_Taken_date_time, "YYYY-MM-DD HH:mm").toDate() || null,
         Hospital: ReceivingData.Hospital || null,
         EntryFrom:ReceivingData.EntryFrom,

         FirstAskTime: new Date(),
         FirstRepailedTime: null,

         Active_Status: true,
         If_Deleted: false
      });

      Create_PatientBasicDetails.save(function (err, resultNew) {
         if (err) {
            res.status(417).send({ Status: false, Message: "Some error occurred while Creating the New Patient!.", Error: err });
         } else {
            // Notification System
            Promise.all([
               HospitalManagementModel.HospitalManagementSchema.findOne({ _id: ReceivingData.Hospital }, { Connected_Clusters: 1, Cardiologist_Array: 1 }, {}).exec(),
               StemiUserModel.UserManagementSchema.find({ User_Type: 'D', HospitalsArray: ReceivingData.Hospital }, {}, {}).exec()
            ]).then(response => {
               const HosDetails = response[0];
               const Doctors = response[1];
               const Clusters = HosDetails.Connected_Clusters;
               var NotifyToUsers = [];
               var NotifyToMobUser = [];              
               Doctors.map(obj => NotifyToUsers.push(obj._id));
               HosDetails.Cardiologist_Array.map(objMob => {
                  if (objMob.Cardiologist_Preferred_Contact === true) {
                     NotifyToMobUser.push(objMob.Cardiologist_Phone);
                  }
               });
               Promise.all(
                  Clusters.map(obj => {
                     return StemiUserModel.UserManagementSchema.find({ User_Type: 'CDA', ClustersArray: obj }, {}, {}).exec();
                  })
               ).then(responseOne => {
                  var ClusterDoctors = [];
                  responseOne.map(obj => obj.map(objNew => ClusterDoctors.push(objNew)));
                  ClusterDoctors = Array.from(new Set(ClusterDoctors.map(JSON.stringify))).map(JSON.parse);                  
                  // responseOne.map(obj => {
                  //    obj.map(objNew => {
                  //       NotifyToUsers.push(objNew._id);
                  //    });
                  // });
                  NotifyToUsers = NotifyToUsers.filter((obj, index) => NotifyToUsers.indexOf(obj) === index);
                  //  FCM Push Notification
                  StemiAppUserModel.LoginHistorySchema.find({ User: { $in: NotifyToUsers }, Active_Status: true, If_Deleted: false }).exec((err_1, result_1) => {
                     if (!err_1) {
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
                        resultNew = JSON.parse(JSON.stringify(resultNew));
                        resultNew.Patient_Gender  = resultNew.Patient_Gender === 'Male_to_Female' ? 'Male to Female' : resultNew.Patient_Gender === 'Female_to_Male' ? 'Female to Male' : resultNew.Patient_Gender;
                        var payload = {
                           notification: {
                              title: 'Identify STEMI',
                              body: 'Request to identify STEMI for Patient: ' + resultNew.Patient_Name + ', Age: ' + resultNew.Patient_Age + ', Gender: ' + resultNew.Patient_Gender,
                              sound: 'notify_tone.mp3'
                           },
                           data: {
                              patient: resultNew._id,
                              notification_type: 'Stemi_Ask_Cardiologist_ByUser',
                              click_action: 'FCM_PLUGIN_ACTIVITY',
                           }
                        };
                        if (AppUsers_FCMTokens.length > 0) {
                           FCM_App.messaging().sendToDevice(AppUsers_FCMTokens, payload, options).then((NotifyRes) => { });
                        }
                        if (TabUsers_FCMTokens.length > 0) {
                           FCM_Tab.messaging().sendToDevice(TabUsers_FCMTokens, payload, options).then((NotifyRes) => { });
                        }
                        // Schedule Create
                        // DoctorNotifySchedule(ClusterDoctors, payload, resultNew);

                        var numbers = NotifyToMobUser;
                        if (numbers.length > 0) {
                           var Msg = 'Request to identify STEMI for Patient: ' + resultNew.Patient_Name + ', Age: ' + resultNew.Patient_Age + ', Gender: ' + resultNew.Patient_Gender;
                           axios({   method: 'post',   url: 'http://bulksmsservice.co.in/httpapi/v1/sendsms?api-token=9)2_6eh0s,v3(*4.1alzcgjp8uxnotkdy7ibqr5f&numbers=' + numbers + '&route=2&message=' + Msg + '&sender=STEMIN', }).
                           then( (response) => { });
                        }

                        // Cluster Doctor Schedule Create
                        ClusterDoctors.map(obj => {
                           const Duration = obj.Alert_Duration !== undefined && !isNaN(obj.Alert_Duration) && obj.Alert_Duration > 0 ? (obj.Alert_Duration * 60000) : 300000;
                           var scheduleTime = new Date(Date.now() + Duration);
                           const S = Schedule.scheduleJob(scheduleTime, function(time) {
                              PatientDetailsModel.PatientBasicDetailsSchema
                              .findOne({_id: resultNew._id, $or: [ {Stemi_Status: 'Stemi_Ask_Cardiologist'}, { Stemi_Status: 'Retake_ECG' } ] })
                              .exec( (err123, result123) => {
                                 if (!err123 && result123 !== null) {
                                    StemiAppUserModel.LoginHistorySchema
                                    .find({ User: obj._id, Active_Status: true, If_Deleted: false })
                                    .exec((err132, result_132) => {
                                       if (!err132 && result_132.length > 0) {
                                          var AppUsers_FCMTokens = [];
                                          var TabUsers_FCMTokens = [];
                                          result_132.map(obj_1 => {
                                             if ((obj_1.Device_Type === 'Android' || obj_1.Device_Type === 'IOS') && obj_1.Firebase_Token !== '') {
                                                AppUsers_FCMTokens.push(obj_1.Firebase_Token);
                                             } else if (obj_1.Device_Type === 'TAB' && obj_1.Firebase_Token !== '') {
                                                TabUsers_FCMTokens.push(obj_1.Firebase_Token);
                                             }
                                          });
                                          AppUsers_FCMTokens = AppUsers_FCMTokens.filter((obj_1, index) => AppUsers_FCMTokens.indexOf(obj_1) === index);
                                          TabUsers_FCMTokens = TabUsers_FCMTokens.filter((obj_1, index) => TabUsers_FCMTokens.indexOf(obj_1) === index);
                                          if (AppUsers_FCMTokens.length > 0) {
                                             FCM_App.messaging().sendToDevice(AppUsers_FCMTokens, payload, options).then((NotifyRes) => { });
                                          }
                                          if (TabUsers_FCMTokens.length > 0) {
                                             FCM_Tab.messaging().sendToDevice(TabUsers_FCMTokens, payload, options).then((NotifyRes) => { });
                                          }
                                          var numbers_1 = [];
                                          numbers_1.push(obj.Phone);
                                          if (numbers_1.length > 0) {
                                             var Msg_1 = 'Identify STEMI for Patient: ' + resultNew.Patient_Name + ', Age: ' + resultNew.Patient_Age + ', Gender: ' + resultNew.Patient_Gender;
                                             axios({ method: 'post', url: 'http://bulksmsservice.co.in/httpapi/v1/sendsms?api-token=9)2_6eh0s,v3(*4.1alzcgjp8uxnotkdy7ibqr5f&numbers=' + numbers_1 + '&route=2&message=' + Msg_1 + '&sender=STEMIN', }).
                                             then( (response_3) =>{ });
                                          }
                                          const Notification = new NotificationModel.NotificationSchema({
                                             User_ID: mongoose.Types.ObjectId(obj._id),
                                             Patient_ID: resultNew._id,
                                             Confirmed_PatientId: null,
                                             Notification_Type: 'Stemi_Ask_Cardiologist_ByUser',
                                             Message: 'Request to identify STEMI for Patient: ' + resultNew.Patient_Name + ', Age: ' + resultNew.Patient_Age + ', Gender: ' + resultNew.Patient_Gender,
                                             Message_Received: false,
                                             Message_Viewed: true,
                                             Active_Status: true,
                                             If_Deleted: false
                                          });
                                          Notification.save();
                                       }
                                    });
                                 }
                              });
                           });
                        });

                     }
                  });
                  NotifyToUsers.map(obj => {
                     const Notification = new NotificationModel.NotificationSchema({
                        User_ID: mongoose.Types.ObjectId(obj),
                        Patient_ID: resultNew._id,
                        Notification_Type: 'Stemi_Ask_Cardiologist_ByUser',
                        Message: 'Request to identify STEMI for Patient: ' + resultNew.Patient_Name + ', Age: ' + resultNew.Patient_Age + ', Gender: ' + resultNew.Patient_Gender,
                        Message_Received: false,
                        Message_Viewed: false,
                        Active_Status: true,
                        If_Deleted: false
                     });
                     Notification.save();
                  });
               }).catch(errorOne => {
                  // console.log(errorOne);
                  console.log('Some Error Occured!');
               });
            }).catch(error => {
               // console.log(error);
               console.log('Some Error Occured!');
            });
            res.status(200).send({ Success: true, Message: 'Patient Details Sent to Cardiologist' });
         }
      });
   }
};

// Patient Basic Details View---------------------------------------------------------
exports.PatientBasicDetails_Mob_View = function (req, res) {
   var ReceivingData = req.body;

   if (!ReceivingData.User || ReceivingData.User === '') {
      res.status(400).send({ Success: false, Message: "User Details is Required!" });
   } else if (!ReceivingData.PatientId || ReceivingData.PatientId === '') {
      res.status(400).send({ Success: false, Message: "Patient Detail not valid!" });
   } else {

      PatientDetailsModel.PatientBasicDetailsSchema.findOne({ _id: mongoose.Types.ObjectId(ReceivingData.PatientId) }, {}, {})
      .populate({ path: 'Hospital', select: 'Hospital_Role'})
      .populate({ path: 'User', select: 'Phone'})
         .exec(function (err, result) {
            if (err) {
               res.status(417).send({ Success: false, Message: "Some error occurred while Find The Patient Details!.", Error: err });
            } else {
               if (result !== null) {
                  const RandomToken = crypto.randomBytes(32).toString("hex");
                  const ReturnResponse = CryptoJS.AES.encrypt(JSON.stringify(result), RandomToken.slice(3, 10)).toString();
                  res.status(200).send({ Success: true, Key: RandomToken, Response: ReturnResponse });
               } else {
                  res.status(400).send({ Success: true, Message: "Invalid Patient Details" });
               }
            }
         });
   }
};


// Patient Basic Details View For IOS---------------------------------------------------------
exports.PatientBasicDetails_Mob_View_Ios = function (req, res) {
   var ReceivingData = req.body;

   if (!ReceivingData.User || ReceivingData.User === '') {
      res.status(400).send({ Success: false, Message: "User Details is Required!" });
   } else if (!ReceivingData.PatientId || ReceivingData.PatientId === '') {
      res.status(400).send({ Success: false, Message: "Patient Detail not valid!" });
   } else {

      PatientDetailsModel.PatientBasicDetailsSchema.findOne({ _id: mongoose.Types.ObjectId(ReceivingData.PatientId) }, { Confirmed_ECG: 0, ECGFile_Array: 0 }, {})
      .populate({ path: 'Hospital', select: 'Hospital_Role'})
      .populate({ path: 'User', select: 'Phone'})
         .exec(function (err, result) {
            if (err) {
               res.status(417).send({ Success: false, Message: "Some error occurred while Find The Patient Details!.", Error: err });
            } else {
               if (result !== null) {
                  res.status(200).send({ Success: true, Response: result });
               } else {
                  res.status(400).send({ Success: true, Message: "Invalid Patient Details" });
               }
            }
         });
   }
};

// Stemi Doctor and ClusterDoctor View
exports.Stemi_Ask_Cardiologist_List = function (req, res) {
   var ReceivingData = req.body;
   var Filter = {
      Doctor: 'D',
      ClusterDoctor: 'CDA'
   };
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
                  if (result.User_Type === Filter.Doctor) {
                     PatientDetailsModel.PatientBasicDetailsSchema
                        .find({ Hospital: { $in: result.HospitalsArray }, $or: [{Stemi_Status: 'Stemi_Ask_Cardiologist'},{ Stemi_Status: 'Retake_ECG' }] , Active_Status: true, If_Deleted: false }, { Current_ECG_File: 0, ECGFile_Array: 0, Confirmed_ECG: 0 }, {'sort': { createdAt: -1 }})
                        .exec(function (err_1, result_1) {
                           if (err_1) {
                              res.status(417).send({ Success: false, Message: "Some error occurred while Find The Patient Details!.", Error: err_1 });
                           } else {
                              var RandomToken = crypto.randomBytes(32).toString("hex");
                              var ReturnResponse = CryptoJS.AES.encrypt(JSON.stringify(result_1), RandomToken.slice(3, 10)).toString();
                              res.status(200).send({ Success: true, Key: RandomToken, Response: ReturnResponse });
                           }
                        });
                  } else if (result.User_Type === Filter.ClusterDoctor) {
                     StemiClusterModel.ClusterMappingSchema.find({ Cluster: { $in: result.ClustersArray }, Active_Status: true, If_Deleted: false }, {}, {})
                        .exec(function (error, result_1) {
                           if (error) {
                              res.status(417).send({ Success: false, Message: "Some error occurred while Find The User Details!." });
                           } else {
                              var HospitalsArr = [];
                              result_1.map(obj => {
                                 HospitalsArr.push(obj.ClusterHospital);
                              });
                              PatientDetailsModel.PatientBasicDetailsSchema.find({ Hospital: { $in: HospitalsArr }, $or: [{Stemi_Status: 'Stemi_Ask_Cardiologist'},{ Stemi_Status: 'Retake_ECG' }] , Active_Status: true, If_Deleted: false }, { Current_ECG_File: 0, ECGFile_Array: 0, Confirmed_ECG: 0  }, {'sort': { createdAt: -1}})
                                 .exec(function (err, result_2) {
                                    if (err) {
                                       res.status(417).send({ Success: false, Message: "Some error occurred while Find The Patient Details!.", Error: err });
                                    } else {
                                       var RandomToken = crypto.randomBytes(32).toString("hex");
                                       var ReturnResponse = CryptoJS.AES.encrypt(JSON.stringify(result_2), RandomToken.slice(3, 10)).toString();
                                       res.status(200).send({ Success: true, Key: RandomToken, Response: ReturnResponse });
                                    }
                                 });
                           }
                        });
                  }
               } else {
                  res.status(417).send({ Success: true, Message: "INVALID USER ID!" });
               }
            }
         });
   }
};

//Stemi_Confirmed_By_Doctor
exports.Stemi_Confirmed_By_Doctor = function (req, res) {
   var ReceivingData = req.body;
   if (!ReceivingData.PatientId || ReceivingData.PatientId === '') {
      res.status(400).send({ Success: false, Message: "Patient ID is Required!" });
   } else if (!ReceivingData.User || ReceivingData.User === '') {
      res.status(400).send({ Status: false, Message: "User ID can not be empty" });
   } else {
      ReceivingData.User = mongoose.Types.ObjectId(ReceivingData.User);
      ReceivingData.PatientId = mongoose.Types.ObjectId(ReceivingData.PatientId);
      Promise.all([
         StemiUserModel.UserManagementSchema.findOne({ _id: ReceivingData.User }, {}, {}).exec(),
         PatientDetailsModel.PatientBasicDetailsSchema.findOne({ _id: ReceivingData.PatientId }, {}, {})
            .populate({ path: 'User' }).exec(),
      ]).then(response => {
         var NotifyToUsers = [];
         var UserDetails = response[0];
         var PatientsDetails = response[1];
       
         if (PatientsDetails !== null && PatientsDetails.Stemi_Status !== 'Stemi_Confirmed') {
            var Hospital = PatientsDetails.Hospital;
            var ECG_Arr = PatientsDetails.ECGFile_Array;           
            var Date_Time = PatientsDetails.ECG_Taken_date_time;
            const AddOn = (ECG_Arr.length !== undefined && ECG_Arr.length > 0) ? ECG_Arr.length + 1 : 1;
            if (PatientsDetails.EntryFrom === 'Android' || PatientsDetails.EntryFrom === 'IOS') {
               ECG_Arr.push({
                  "Name": Date_Time.valueOf() + '-' + 'APP-' + AddOn,
                  "ECG_File": PatientsDetails.Current_ECG_File,
                  "DateTime": PatientsDetails.ECG_Taken_date_time
               });
            } else if (PatientsDetails.EntryFrom === 'BPL') {
               ECG_Arr.push({
                  "Name": Date_Time.valueOf() + '-' + 'BPL-' + AddOn,
                  "ECG_File": PatientsDetails.Current_ECG_File,
                  "DateTime": PatientsDetails.ECG_Taken_date_time
               });
            } else {
               ECG_Arr.push({
                  "Name": Date_Time.valueOf() + '-' + 'TAB-' + AddOn,
                  "ECG_File": PatientsDetails.Current_ECG_File,
                  "DateTime": PatientsDetails.ECG_Taken_date_time
               });
            }
            Promise.all([
               HospitalManagementModel.HospitalManagementSchema.findOne({ _id: Hospital }, { Connected_Clusters: 1, Hospital_Code: 1, Cardiologist_Array: 1 }, {}).exec(),
               StemiUserModel.UserManagementSchema.find({ User_Type: 'D', HospitalsArray: mongoose.Types.ObjectId(Hospital) }, {}, {}).exec(),
               StemiUserModel.UserManagementSchema.findOne({ _id: PatientsDetails.User._id }, {}, {})
                  .populate({ path: 'Location' }).populate({ path: 'Cluster' }).exec(),
            ]).then(responseOne => {
               var Cardiologist_Array = [];
               var ClusterDetails = responseOne[0].Connected_Clusters;
               var CardiologistPH = responseOne[0];
               var Doctors = responseOne[1];
               var Cluster_Codes = responseOne[2];
               Doctors.map(obj_6 => {
                  NotifyToUsers.push(obj_6._id);
               });
               CardiologistPH.Cardiologist_Array.map(objCard => {
                  if (objCard.Cardiologist_Preferred_Contact === true) {
                     Cardiologist_Array.push(objCard.Cardiologist_Phone);
                  }
               });
               Promise.all(
                  ClusterDetails.map(obj_4 => {
                     return StemiUserModel.UserManagementSchema.find({ User_Type: 'CDA', ClustersArray: mongoose.Types.ObjectId(obj_4) }, {}, {}).exec();
                  })
               ).then(responseThree => {
                  // var ClusterDoctor = responseThree[0];
                  // ClusterDoctor.map(objC => {
                  //    NotifyToUsers.push(objC._id);
                  // });
                  NotifyToUsers.push(PatientsDetails.User._id);
                  NotifyToUsers = NotifyToUsers.filter((obj, index) => NotifyToUsers.indexOf(obj) === index);
                  const FirstRepailedTime = (PatientsDetails.FirstRepailedTime === undefined || PatientsDetails.FirstRepailedTime === null) ? new Date() : PatientsDetails.FirstRepailedTime;
                  PatientDetailsModel.PatientBasicDetailsSchema
                     .updateOne({ _id: PatientsDetails._id }, {
                        $set: {
                           Stemi_Status: "Stemi_Confirmed",
                           Confirmed_By: UserDetails._id,
                           Confirmed_UserType: 'Doctor',
                           Confirmed_ECG: PatientsDetails.Current_ECG_File,
                           ECGFile_Array: ECG_Arr,
                           FirstRepailedTime: FirstRepailedTime,
                           Doctor_Notes: ReceivingData.Doctor_Notes || '',
                           'ST_Elevation.avL': ReceivingData.ST_Elevation.avL || '',
                           'ST_Elevation.L1': ReceivingData.ST_Elevation.L1 || '',
                           'ST_Elevation.avR': ReceivingData.ST_Elevation.avR || '',
                           'ST_Elevation.L2': ReceivingData.ST_Elevation.L2 || '',
                           'ST_Elevation.avF': ReceivingData.ST_Elevation.avF || '',
                           'ST_Elevation.L3': ReceivingData.ST_Elevation.L3 || '',
                           'ST_Elevation.V1': ReceivingData.ST_Elevation.V1 || '',
                           'ST_Elevation.V2': ReceivingData.ST_Elevation.V2 || '',
                           'ST_Elevation.V3': ReceivingData.ST_Elevation.V3 || '',
                           'ST_Elevation.V4': ReceivingData.ST_Elevation.V4 || '',
                           'ST_Elevation.V5': ReceivingData.ST_Elevation.V5 || '',
                           'ST_Elevation.V6': ReceivingData.ST_Elevation.V6 || '',
                           'ST_Elevation.V3R': ReceivingData.ST_Elevation.V3R || '',
                           'ST_Elevation.V4R': ReceivingData.ST_Elevation.V4R || '',
                           'ST_Depression.L1': ReceivingData.ST_Depression.L1 || '',
                           'ST_Depression.avL': ReceivingData.ST_Depression.avL || '',
                           'ST_Depression.L2': ReceivingData.ST_Depression.L2 || '',
                           'ST_Depression.avF': ReceivingData.ST_Depression.avF || '',
                           'ST_Depression.L3': ReceivingData.ST_Depression.L3 || '',
                           'ST_Depression.V1': ReceivingData.ST_Depression.V1 || '',
                           'ST_Depression.V2': ReceivingData.ST_Depression.V2 || '',
                           'ST_Depression.V3': ReceivingData.ST_Depression.V3 || '',
                           LBBB: ReceivingData.LBBB || ''
                        }
                     })
                     .exec(function (err, result_1) {
                        if (err) {
                           res.status(417).send({ Success: false, Message: "Some error occurred!.", Error: err });
                        } else {
                           var Taken_Type;
                           if (PatientsDetails.EntryFrom === "TAB") {
                              Taken_Type = 'Systemic';
                           } else {
                              Taken_Type = 'Manual';
                           }
                           WebPatientDetailsModel.PatientBasicDetailsSchema.findOne({}, {}, { 'sort': { createdAt: -1 } }, function (errNew, resultNEW) {
                              if (errNew) {
                                 res.status(417).send({ Status: false, Message: "Some error occurred while Find the Location!.", Error: errNew });
                              } else {
                                 var LastPatientCode = resultNEW !== null ? (resultNEW.Patient_Code + 1) : 1;
                                 var Patient_Code = (LastPatientCode.toString()).padStart(4, 0);
                                 var Location_Code = (Cluster_Codes.Location.Location_Code).toString().padStart(2, 0);
                                 var Cluster_Code = (Cluster_Codes.Cluster.Cluster_Code).toString().padStart(2, 0);
                                 var Hospital_Code = (responseOne[0].Hospital_Code).toString().padStart(3, 0);
                                 var Patient_Unique = Location_Code + Cluster_Code + Hospital_Code + Patient_Code;
                                 var Patient_Unique_Identity = Location_Code + '-' + Cluster_Code + '-' + Hospital_Code + '-' + Patient_Code;
                                 var Temp_Patient_Unique = Patient_Unique_Identity;
                                 var NonCluster = PatientsDetails.Admission_Type === "Non_Cluster" ? true : false;
                                 var Patient_Height = '';
                                 var Patient_Weight = '';
                                 var BP_Systolic = '';
                                 var BP_Diastolic = '';
                                 if (PatientsDetails.EntryFrom === 'BPL') {
                                    Patient_Height = PatientsDetails.BPL_Height ? PatientsDetails.BPL_Height : '';
                                    Patient_Height = PatientsDetails.BPL_Weight ? PatientsDetails.BPL_Weight : '';
                                    if (PatientsDetails.BPL_BP !== undefined && PatientsDetails.BPL_BP.split('/').length > 1 ) {
                                       BP_Systolic = PatientsDetails.BPL_BP.split('/')[0];
                                       BP_Diastolic = PatientsDetails.BPL_BP.split('/')[1];
                                    }
                                 }
                                 var Data_Type = 'Pre';
                                 if (Cluster_Codes.Cluster.Data_Type) {
                                    Data_Type = Cluster_Codes.Cluster.Data_Type;
                                 }
                                 ECG_Arr = ECG_Arr.map(obj => {
                                    obj.Hospital = mongoose.Types.ObjectId(PatientsDetails.Hospital);
                                    return obj;
                                 });

                                 const Create_PatientBasicDetails = new WebPatientDetailsModel.PatientBasicDetailsSchema({
                                    Patient_Code: Patient_Code || 1,
                                    Patient_Unique: Patient_Unique || '00000000000',
                                    Patient_Unique_Identity: Patient_Unique_Identity,
                                    Temp_Patient_Unique: Temp_Patient_Unique,
                                    Patient_Name: PatientsDetails.Patient_Name || '',
                                    Patient_Age: PatientsDetails.Patient_Age || null,
                                    Patient_Gender: PatientsDetails.Patient_Gender || '',
                                    Hospital_History: [{
                                       Hospital_Count: 1,
                                       Hospital: mongoose.Types.ObjectId(PatientsDetails.Hospital) || null,
                                       Handled_User: mongoose.Types.ObjectId(PatientsDetails.User._id) || null,
                                       Patient_Admission_Type: PatientsDetails.Admission_Type || 'Direct',
                                       Hospital_Arrival_Date_Time: null
                                    }],
                                    Post_Thrombolysis: "",
                                    "Post_Thrombolysis_Data.Thrombolytic_Agent": "",
                                    "Post_Thrombolysis_Data.Dosage": "",
                                    "Post_Thrombolysis_Data.Dosage_Units": "",
                                    "Post_Thrombolysis_Data.Post_Thrombolysis_Start_Date_Time": null,
                                    "Post_Thrombolysis_Data.Post_Thrombolysis_End_Date_Time": null,
                                    "Post_Thrombolysis_Data.Ninety_Min_ECG": "",
                                    "Post_Thrombolysis_Data.Ninety_Min_ECG_Date_Time": null,
                                    "Post_Thrombolysis_Data.Successful_Lysis": "",
												"Post_Thrombolysis_Data.MissedSTEMI": "",
                                    "Post_Thrombolysis_Data.Autoreperfused": "",
                                    "Post_Thrombolysis_Data.Others": "",
                                    Patient_Payment: '',
                                    Transport_History: [{
                                       Transport_Count: 1,
                                       Transport_From_Hospital: null,
                                       Transport_To_Hospital: mongoose.Types.ObjectId(PatientsDetails.Hospital) || null,
                                       TransportMode: null,
                                       ClusterAmbulance: null,
                                       Ambulance_Call_Date_Time: null,
                                       Ambulance_Arrival_Date_Time: null,
                                       Ambulance_Departure_Date_Time: null,
                                    }],
                                    Location_of_Infarction: [{
                                       Anterior_Wall_MI: false,
                                       Inferior_Wall_MI: false,
                                       Lateral_Wall_MI: false,
                                       Posterior_Wall_MI: false,
                                       RV_Infarction: false
                                    }],
                                    Clinical_Examination_History: [{
                                       Hospital: mongoose.Types.ObjectId(PatientsDetails.Hospital) || null,
                                       Patient_Height: Patient_Height,
                                       Patient_Weight: Patient_Weight,
                                       BMI: '',
                                       BP_Systolic: BP_Systolic,
                                       BP_Diastolic: BP_Diastolic,
                                       Heart_Rate: '',
                                       SP_O2: '',
                                       Abdominal_Girth: '',
                                       Kilip_Class: null
                                    }],
                                    Symptom_Onset_Date_Time: null,
                                    Initiated_Hospital: mongoose.Types.ObjectId(PatientsDetails.Hospital) || null,
                                    Initiated_Hospital_Arrival: null,
                                    EMS_Ambulance_Call_Date_Time: null,
                                    EMS_Ambulance_Departure_Date_Time: null,
                                    If_NonCluster: NonCluster || false,
                                    NonCluster_Hospital_Name: '',
                                    NonCluster_Hospital_Address: '',
                                    NonCluster_Hospital_Arrival_Date_Time: null,
                                    ECG_File: PatientsDetails.Current_ECG_File || '',
                                    All_ECG_Files: ECG_Arr,
                                    ECG_Taken_date_time: PatientsDetails.ECG_Taken_date_time || null,
                                    Stemi_Confirmed: 'Yes',
                                    Stemi_Confirmed_Date_Time: new Date() || null,
                                    Stemi_Confirmed_Hospital: mongoose.Types.ObjectId(PatientsDetails.Hospital) || null,
                                    Stemi_Confirmed_Type: 'Doctor',
                                    Stemi_Confirmed_By: mongoose.Types.ObjectId(ReceivingData.User) || null,
                                    ECG_Taken_Type: Taken_Type,
                                    QR_image: '',
                                    Doctor_Notes: ReceivingData.Doctor_Notes || '',
                                    ST_Elevation: [ReceivingData.ST_Elevation] || [],    
                                    ST_Depression: [ReceivingData.ST_Depression] || [],
                                    LBBB: ReceivingData.LBBB || '',
                                    IfThrombolysis: null,
                                    ThrombolysisFrom: null,
                                    IfPCI: null,
                                    PCIFrom: null,
                                    IfDeath: null,
                                    IfDischarge: null,
                                    TransferBending: null,
                                    TransferBendingTo: null,
                                    Data_Type: Data_Type,
                                    Active_Status: true,
                                    If_Deleted: false,
                                    LastCompletionChild: 'Co-Morbid_Conditions',
                                    FirstAskTime: PatientsDetails.FirstAskTime || null,
                                    FirstRepailedTime: PatientsDetails.FirstRepailedTime || null,
                                 });

                                 Create_PatientBasicDetails.save(function (errNew1, resultNew1) {
                                    if (errNew1) {
                                       res.status(417).send({ Success: false, Message: "Some error occurred while Creating the New Patient Basic Details!.", Error: errNew1 });
                                    } else {
                                       var QRid = resultNew1._id.toString() + '-Stemi';
                                       QRCode.toDataURL(QRid, function (err, url) {
                                          var QrFile = url;
                                          resultNew1.QR_image = QrFile;
                                          resultNew1.save(function (errNew2, resultsQR) {
                                             if (errNew2) {
                                                res.status(417).send({ Status: false, Message: "Some error occurred while Update the Patient QR Code!.", Error: errNew2 });
                                             } else {
                                                // if (PatientsDetails.Symptoms.Duration_of_Pain && PatientsDetails.Symptoms.Duration_of_Pain !== '' && PatientsDetails.Symptoms.Duration_of_Pain !== null) {
                                                //    PatientsDetails.Symptoms.Duration_of_Pain = moment(PatientsDetails.Symptoms.Duration_of_Pain, "YYYY-MM-DD HH:mm").toDate();
                                                // } else {
                                                //    PatientsDetails.Symptoms.Duration_of_Pain = null;
                                                // }
                                                const Create_PatientCardiacHistory = new WebPatientDetailsModel.PatientCardiacHistorySchema({
                                                   PatientId: mongoose.Types.ObjectId(resultNew1._id),
                                                   Hospital: mongoose.Types.ObjectId(resultNew1.Stemi_Confirmed_Hospital),
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
                                                   Chest_Discomfort: PatientsDetails.Symptoms.Chest_Discomfort || '',
                                                   // Duration_of_Pain_Date_Time: PatientsDetails.Symptoms.Duration_of_Pain || null,
                                                   Duration_of_Pain_Date_Time: null,
                                                   Location_of_Pain: PatientsDetails.Symptoms.Location_of_Pain || '',
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
                                                Create_PatientCardiacHistory.save(function (errNew3, resultNew2) {
                                                   if (errNew3) {
                                                      res.status(417).send({ Success: false, Message: "Some error occurred while Creating the Patient CardiacHistory!.", Error: errNew3 });
                                                   } else { 
                                                      const Create_PatientCoMorbidCondition = new WebPatientDetailsModel.PatientCoMorbidConditionSchema({
                                                         PatientId: mongoose.Types.ObjectId(resultNew1._id),
                                                         Hospital: mongoose.Types.ObjectId(resultNew1.Stemi_Confirmed_Hospital),
                                                         Smoker: PatientsDetails.Risk_Factors[0].Smoker || '',
                                                         Beedies: false,
                                                         Cigarettes:  false,
                                                         Number_of_Beedies:  null,
                                                         Number_of_Beedies_Duration_Years: null,
                                                         Number_of_Beedies_Duration_Months: null,
                                                         Number_of_Cigarettes: null,
                                                         Number_of_Cigarettes_Duration_Years: null,
                                                         Number_of_Cigarettes_Duration_Months: null,
                                                         Previous_IHD: PatientsDetails.Risk_Factors[0].Previous_History_of_IHD || '',
                                                         Diabetes_Mellitus: PatientsDetails.Risk_Factors[0].Diabetes || '',
                                                         High_Cholesterol: PatientsDetails.Risk_Factors[0].High_Cholesterol || '',
                                                         Duration_Years: null,
                                                         Duration_Months: null,
                                                         OHA:  '',
                                                         Insulin: '',
                                                         Family_history_of_IHD: PatientsDetails.Risk_Factors[0].Family_History_of_IHD || '',
                                                         Hypertension: PatientsDetails.Risk_Factors[0].Hypertension || '',
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
                                                      Create_PatientCoMorbidCondition.save(function (errNew4, resultNew3) {
                                                         if (errNew4) {    
                                                            res.status(417).send({ Success: false, Message: "Some error occurred while Creating the Patient CoMorbidCondition!.", Error: errNew4 });
                                                         } else {
                                                            NotificationModel.NotificationSchema
                                                            .updateMany({
                                                               $or: [{ Notification_Type: 'Stemi_Ask_Cardiologist_ByUser' },
                                                               { Notification_Type: 'AskingRepeat_ECG_ByDoctor' },
                                                               { Notification_Type: 'NewECG_Updated_ByUser' }],
                                                               Patient_ID: PatientsDetails._id,
                                                               User_ID: { $in: NotifyToUsers }
                                                            },
                                                               { $set: { Message_Viewed: true } }).exec();
                                                         NotifyToUsers = NotifyToUsers.filter(obj => JSON.parse(JSON.stringify(obj)) !== JSON.parse(JSON.stringify(ReceivingData.User)));
         
                                                         //  FCM Push Notification
                                                         StemiAppUserModel.LoginHistorySchema.find({ User: { $in: NotifyToUsers }, Active_Status: true, If_Deleted: false }).exec((err_1, result_1) => {
                                                            if (!err_1) {
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
                                                               PatientsDetails = JSON.parse(JSON.stringify(PatientsDetails));
                                                               PatientsDetails.Patient_Gender  = PatientsDetails.Patient_Gender === 'Male_to_Female' ? 'Male to Female' : PatientsDetails.Patient_Gender === 'Female_to_Male' ? 'Female to Male' : PatientsDetails.Patient_Gender;
                                                               var payload = {
                                                                  notification: {
                                                                     title: 'STEMI Confirmed',
                                                                     body: 'STEMI Confirmed for Patient: ' + PatientsDetails.Patient_Name + ', Age: ' + PatientsDetails.Patient_Age + ', Gender: ' + PatientsDetails.Patient_Gender,
                                                                     sound: 'notify_tone.mp3'
                                                                  },
                                                                  data: {
                                                                     patient: PatientsDetails._id,
                                                                     notification_type: 'Stemi_Confirmed_ByDoctor',
                                                                     click_action: 'FCM_PLUGIN_ACTIVITY',
                                                                  }
                                                               };
                                                               if (AppUsers_FCMTokens.length > 0) {
                                                                  FCM_App.messaging().sendToDevice(AppUsers_FCMTokens, payload, options).then((NotifyRes) => { });
                                                               }
                                                               if (TabUsers_FCMTokens.length > 0) {
                                                                  FCM_Tab.messaging().sendToDevice(TabUsers_FCMTokens, payload, options).then((NotifyRes) => { });
                                                               }
         
                                                               var numbers = Cardiologist_Array;
                                                               if (numbers.length > 0) {
                                                                  var Msg = 'STEMI Confirmed for Patient: ' + PatientsDetails.Patient_Name + ', Age: ' + PatientsDetails.Patient_Age + ', Gender: ' + PatientsDetails.Patient_Gender;
                                                                  axios({   method: 'post',   url: 'http://bulksmsservice.co.in/httpapi/v1/sendsms?api-token=9)2_6eh0s,v3(*4.1alzcgjp8uxnotkdy7ibqr5f&numbers=' + numbers + '&route=2&message=' + Msg + '&sender=STEMIN', }).
                                                                  then( (response) =>{ });
                                                               }
                                                            }
                                                         });
         
                                                         NotifyToUsers.map(obj => {
                                                            const Notification = new NotificationModel.NotificationSchema({
                                                               User_ID: mongoose.Types.ObjectId(obj),
                                                               Patient_ID: PatientsDetails._id,
                                                               Confirmed_PatientId: resultNew1._id,
                                                               Notification_Type: 'Stemi_Confirmed_ByDoctor',
                                                               Message: 'STEMI Confirmed for Patient: ' + PatientsDetails.Patient_Name + ', Age: ' + PatientsDetails.Patient_Age + ', Gender: ' + PatientsDetails.Patient_Gender,
                                                               Message_Received: false,
                                                               Message_Viewed: true,
                                                               Active_Status: true,
                                                               If_Deleted: false
                                                            });
                                                            Notification.save();
                                                         });
                                                            res.status(200).send({ Success: true, Message: "STEMI Confirmed for Patient" });
                                                         }
                                                      });
                                                   }
                                                });
                                                
                                                }
                                          });
                                       });
                                    
                                    }
                                 });
                              }
                           });                          
                        }
                     });
               }).catch(errorThree => {
                  // console.log(errorThree);
                  console.log('Some Error Occured!');
               });
            }).catch(errorOne => {
               // console.log(errorOne);
               console.log('Some Error Occured!');
            });
         } else {
            if (PatientsDetails !== null && PatientsDetails.Stemi_Status === 'Stemi_Confirmed') {
               res.status(400).send({ Success: true, Message: "Someone Already STEMI Confirmed to this Patient" });
            } else {
               res.status(400).send({ Success: true, Message: "Invalid Patient Details" });
            }
         }
      }).catch(error => {
         // console.log(error);
         console.log('Some Error Occured!');
      });
   }
};

// Stemi_Not_Confirmed_By_Doctor
exports.Stemi_Not_Confirmed_By_Doctor = function (req, res) {
   var ReceivingData = req.body;
   if (!ReceivingData.PatientId || ReceivingData.PatientId === '') {
      res.status(400).send({ Success: false, Message: "Patient ID is Required!" });
   } else if (!ReceivingData.User || ReceivingData.User === '') {
      res.status(400).send({ Status: false, Message: "User ID can not be empty" });
   } else {
      ReceivingData.User = mongoose.Types.ObjectId(ReceivingData.User);
      ReceivingData.PatientId = mongoose.Types.ObjectId(ReceivingData.PatientId);
      Promise.all([
         StemiUserModel.UserManagementSchema.findOne({ _id: ReceivingData.User }, {}, {}).exec(),
         PatientDetailsModel.PatientBasicDetailsSchema.findOne({ _id: ReceivingData.PatientId }, {}, {}).exec(),
      ]).then(response => {
         var NotifyToUsers = [];
         var UserDetails = response[0];
         var PatientsDetails = response[1];
         if (PatientsDetails !== null && PatientsDetails.Stemi_Status !== 'Stemi_Confirmed' && PatientsDetails.Stemi_Status !== 'Stemi_Not_Confirmed') {
            var Hospital = PatientsDetails.Hospital;
            Promise.all([
               HospitalManagementModel.HospitalManagementSchema.findOne({ _id: Hospital }, { Hospital_Code: 1, Connected_Clusters: 1, Cardiologist_Array: 1 }, {}).exec(),
               StemiUserModel.UserManagementSchema.find({ User_Type: 'D', HospitalsArray: mongoose.Types.ObjectId(Hospital) }, {}, {}).exec()
            ]).then(responseOne => {
               var ClusterDetails = responseOne[0].Connected_Clusters;
               var Doctors = responseOne[1];
               var Cardiologist = responseOne[0];
               var Cardiologist_Array = [];
               Doctors.map(obj_6 => {
                  NotifyToUsers.push(obj_6._id);
               });
               Cardiologist.Cardiologist_Array.map(objCard => {
                  if (objCard.Cardiologist_Preferred_Contact === true) {
                     Cardiologist_Array.push(objCard.Cardiologist_Phone);
                  }
               });
               Promise.all([
                  WebPatientDetailsModel.PatientBasicDetailsSchema.findOne({}, {}, { 'sort': { createdAt: -1 } }).exec(),
                  StemiUserModel.UserManagementSchema.findOne({ _id: PatientsDetails.User }, {}, {})
                  .populate({ path: 'Location' }).populate({ path: 'Cluster' }).exec()
               ]).then(responseThree => {
                  // var ClusterDoctor = responseThree[0];
                  // ClusterDoctor.map(objC => {
                  //    NotifyToUsers.push(objC._id);
                  // });
                  var resultNEW = responseThree[0];
                  var Cluster_Codes = responseThree[1];
                  NotifyToUsers.push(PatientsDetails.User);
                  NotifyToUsers = NotifyToUsers.filter((obj, index) => NotifyToUsers.indexOf(obj) === index);
                  const FirstRepailedTime = (PatientsDetails.FirstRepailedTime === undefined || PatientsDetails.FirstRepailedTime === null) ? new Date() : PatientsDetails.FirstRepailedTime;
                  PatientDetailsModel.PatientBasicDetailsSchema
                     .updateOne({ _id: PatientsDetails._id }, {
                        $set: {
                           Stemi_Status: "Stemi_Not_Confirmed",
                           Confirmed_By: UserDetails._id,
                           Confirmed_UserType: 'Doctor',
                           FirstRepailedTime: FirstRepailedTime
                        }
                     })
                     .exec(function (err, result_1) {
                        if (err) {
                           res.status(417).send({ Success: false, Message: "Some error occurred!.", Error: err });
                        } else {
                           var LastPatientCode = resultNEW !== null ? (resultNEW.Patient_Code + 1) : 1;
                           var Patient_Code = (LastPatientCode.toString()).padStart(4, 0);
                           var Location_Code = (Cluster_Codes.Location.Location_Code).toString().padStart(2, 0);
                           var Cluster_Code = (Cluster_Codes.Cluster.Cluster_Code).toString().padStart(2, 0);
                           var Hospital_Code = (responseOne[0].Hospital_Code).toString().padStart(3, 0);
                           var Patient_Unique = Location_Code + Cluster_Code + Hospital_Code + Patient_Code;
                           var Patient_Unique_Identity = Location_Code + '-' + Cluster_Code + '-' + Hospital_Code + '-' + Patient_Code;
                           var Temp_Patient_Unique = Patient_Unique_Identity;
                           var NonCluster = PatientsDetails.Admission_Type === "Non_Cluster" ? true : false;
                           var Patient_Height = '';
                           var Patient_Weight = '';
                           var BP_Systolic = '';
                           var BP_Diastolic = '';
                           if (PatientsDetails.EntryFrom === 'BPL') {
                              Patient_Height = PatientsDetails.BPL_Height ? PatientsDetails.BPL_Height : '';
                              Patient_Height = PatientsDetails.BPL_Weight ? PatientsDetails.BPL_Weight : '';
                              if (PatientsDetails.BPL_BP !== undefined && PatientsDetails.BPL_BP.split('/').length > 1 ) {
                                 BP_Systolic = PatientsDetails.BPL_BP.split('/')[0];
                                 BP_Diastolic = PatientsDetails.BPL_BP.split('/')[1];
                              }
                           }
                           var ECG_Arr = PatientsDetails.ECGFile_Array;           
                           var Date_Time = PatientsDetails.ECG_Taken_date_time;
                           const AddOn = (ECG_Arr.length !== undefined && ECG_Arr.length > 0) ? ECG_Arr.length + 1 : 1;
                           if (PatientsDetails.EntryFrom === 'Android' || PatientsDetails.EntryFrom === 'IOS') {
                              ECG_Arr.push({
                                 "Name": Date_Time.valueOf() + '-' + 'APP-' + AddOn,
                                 "ECG_File": PatientsDetails.Current_ECG_File,
                                 "DateTime": PatientsDetails.ECG_Taken_date_time
                              });
                           } else if (PatientsDetails.EntryFrom === 'BPL') {
                              ECG_Arr.push({
                                 "Name": Date_Time.valueOf() + '-' + 'BPL-' + AddOn,
                                 "ECG_File": PatientsDetails.Current_ECG_File,
                                 "DateTime": PatientsDetails.ECG_Taken_date_time
                              });
                           } else {
                              ECG_Arr.push({
                                 "Name": Date_Time.valueOf() + '-' + 'TAB-' + AddOn,
                                 "ECG_File": PatientsDetails.Current_ECG_File,
                                 "DateTime": PatientsDetails.ECG_Taken_date_time
                              });
                           }
                           var Data_Type = 'Pre';
                           if (Cluster_Codes.Cluster.Data_Type) {
                              Data_Type = Cluster_Codes.Cluster.Data_Type;
                           }
                           ECG_Arr = ECG_Arr.map(obj => {
                              obj.Hospital = mongoose.Types.ObjectId(PatientsDetails.Hospital);
                              return obj;
                           });
                           var Taken_Type;
                           if (PatientsDetails.EntryFrom === "TAB") {
                              Taken_Type = 'Systemic';
                           } else {
                              Taken_Type = 'Manual';
                           }
                           const Create_PatientBasicDetails = new WebPatientDetailsModel.PatientBasicDetailsSchema({
                              Patient_Code: Patient_Code || 1,
                              Patient_Unique: '00000000000',
                              Patient_Unique_Identity: '00-00-000-0000',
                              Temp_Patient_Unique: Temp_Patient_Unique,
                              Patient_Name: PatientsDetails.Patient_Name || '',
                              Patient_Age: PatientsDetails.Patient_Age || null,
                              Patient_Gender: PatientsDetails.Patient_Gender || '',
                              Hospital_History: [{
                                 Hospital_Count: 1,
                                 Hospital: mongoose.Types.ObjectId(PatientsDetails.Hospital) || null,
                                 Handled_User: mongoose.Types.ObjectId(PatientsDetails.User) || null,
                                 Patient_Admission_Type: PatientsDetails.Admission_Type || 'Direct',
                                 Hospital_Arrival_Date_Time: null
                              }],
                              Post_Thrombolysis: "",
                              "Post_Thrombolysis_Data.Thrombolytic_Agent": "",
                              "Post_Thrombolysis_Data.Dosage": "",
                              "Post_Thrombolysis_Data.Dosage_Units": "",
                              "Post_Thrombolysis_Data.Post_Thrombolysis_Start_Date_Time": null,
                              "Post_Thrombolysis_Data.Post_Thrombolysis_End_Date_Time": null,
                              "Post_Thrombolysis_Data.Ninety_Min_ECG": "",
                              "Post_Thrombolysis_Data.Ninety_Min_ECG_Date_Time": null,
                              "Post_Thrombolysis_Data.Successful_Lysis": "",
										"Post_Thrombolysis_Data.MissedSTEMI": "",
                              "Post_Thrombolysis_Data.Autoreperfused": "",
                              "Post_Thrombolysis_Data.Others": "",
                              Patient_Payment: '',
                              Transport_History: [{
                                 Transport_Count: 1,
                                 Transport_From_Hospital: null,
                                 Transport_To_Hospital: mongoose.Types.ObjectId(PatientsDetails.Hospital) || null,
                                 TransportMode: null,
                                 ClusterAmbulance: null,
                                 Ambulance_Call_Date_Time: null,
                                 Ambulance_Arrival_Date_Time: null,
                                 Ambulance_Departure_Date_Time: null,
                              }],
                              Location_of_Infarction: [{
                                 Anterior_Wall_MI: false,
                                 Inferior_Wall_MI: false,
                                 Lateral_Wall_MI: false,
                                 Posterior_Wall_MI: false,
                                 RV_Infarction: false
                              }],
                              Clinical_Examination_History: [{
                                 Hospital: mongoose.Types.ObjectId(PatientsDetails.Hospital) || null,
                                 Patient_Height: Patient_Height,
                                 Patient_Weight: Patient_Weight,
                                 BMI: '',
                                 BP_Systolic: BP_Systolic,
                                 BP_Diastolic: BP_Diastolic,
                                 Heart_Rate: '',
                                 SP_O2: '',
                                 Abdominal_Girth: '',
                                 Kilip_Class: null
                              }],
                              Symptom_Onset_Date_Time: null,
                              Initiated_Hospital: mongoose.Types.ObjectId(PatientsDetails.Hospital) || null,
                              Initiated_Hospital_Arrival: null,
                              EMS_Ambulance_Call_Date_Time: null,
                              EMS_Ambulance_Departure_Date_Time: null,
                              If_NonCluster: NonCluster || false,
                              NonCluster_Hospital_Name: '',
                              NonCluster_Hospital_Address: '',
                              NonCluster_Hospital_Arrival_Date_Time: null,
                              ECG_File: PatientsDetails.Current_ECG_File || '',
                              All_ECG_Files: ECG_Arr,
                              ECG_Taken_date_time: PatientsDetails.ECG_Taken_date_time || null,
                              Stemi_Confirmed: 'No',
                              Stemi_Confirmed_Date_Time: null,
                              Stemi_Confirmed_Hospital: null,
                              Stemi_Confirmed_Type: 'Doctor',
                              Stemi_Confirmed_By: mongoose.Types.ObjectId(ReceivingData.User) || null,
                              ECG_Taken_Type: Taken_Type,
                              QR_image: '',
                              Doctor_Notes: '',
                              ST_Elevation: [],    
                              ST_Depression: [],
                              LBBB: '',
                              IfThrombolysis: null,
                              ThrombolysisFrom: null,
                              IfPCI: null,
                              PCIFrom: null,
                              IfDeath: null,
                              IfDischarge: null,
                              TransferBending: null,
                              TransferBendingTo: null,
                              Data_Type: Data_Type,
                              Active_Status: true,
                              If_Deleted: false,
                              LastCompletionChild: 'Co-Morbid_Conditions',
                              FirstAskTime: PatientsDetails.FirstAskTime || null,
                              FirstRepailedTime: PatientsDetails.FirstRepailedTime || null,
                           });
                           Create_PatientBasicDetails.save(function (errNew1, resultNew1) {
                              if (errNew1) {
                                 res.status(417).send({ Success: false, Message: "Some error occurred while Creating the New Patient Basic Details!.", Error: errNew1 });
                              } else {
                                 var QRid = resultNew1._id.toString() + '-Stemi';
                                 QRCode.toDataURL(QRid, function (err, url) {
                                    var QrFile = url;
                                    resultNew1.QR_image = QrFile;
                                    resultNew1.save(function (errNew2, resultsQR) {
                                       if (errNew2) {
                                          res.status(417).send({ Status: false, Message: "Some error occurred while Update the Patient QR Code!.", Error: errNew2 });
                                       } else {
                                          const Create_PatientCardiacHistory = new WebPatientDetailsModel.PatientCardiacHistorySchema({
                                             PatientId: mongoose.Types.ObjectId(resultNew1._id),
                                             Hospital: mongoose.Types.ObjectId(resultNew1.Initiated_Hospital),
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
                                             Chest_Discomfort: PatientsDetails.Symptoms.Chest_Discomfort || '',
                                             // Duration_of_Pain_Date_Time: PatientsDetails.Symptoms.Duration_of_Pain || null,
                                             Duration_of_Pain_Date_Time: null,
                                             Location_of_Pain: PatientsDetails.Symptoms.Location_of_Pain || '',
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
                                          Create_PatientCardiacHistory.save(function (errNew3, resultNew2) {
                                             if (errNew3) {
                                                res.status(417).send({ Success: false, Message: "Some error occurred while Creating the Patient CardiacHistory!.", Error: errNew3 });
                                             } else { 
                                                const Create_PatientCoMorbidCondition = new WebPatientDetailsModel.PatientCoMorbidConditionSchema({
                                                   PatientId: mongoose.Types.ObjectId(resultNew1._id),
                                                   Hospital: mongoose.Types.ObjectId(resultNew1.Initiated_Hospital),
                                                   Smoker: PatientsDetails.Risk_Factors[0].Smoker || '',
                                                   Beedies: false,
                                                   Cigarettes:  false,
                                                   Number_of_Beedies:  null,
                                                   Number_of_Beedies_Duration_Years: null,
                                                   Number_of_Beedies_Duration_Months: null,
                                                   Number_of_Cigarettes: null,
                                                   Number_of_Cigarettes_Duration_Years: null,
                                                   Number_of_Cigarettes_Duration_Months: null,
                                                   Previous_IHD: PatientsDetails.Risk_Factors[0].Previous_History_of_IHD || '',
                                                   Diabetes_Mellitus: PatientsDetails.Risk_Factors[0].Diabetes || '',
                                                   High_Cholesterol: PatientsDetails.Risk_Factors[0].High_Cholesterol || '',
                                                   Duration_Years: null,
                                                   Duration_Months: null,
                                                   OHA:  '',
                                                   Insulin: '',
                                                   Family_history_of_IHD: PatientsDetails.Risk_Factors[0].Family_History_of_IHD || '',
                                                   Hypertension: PatientsDetails.Risk_Factors[0].Hypertension || '',
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
                                                Create_PatientCoMorbidCondition.save(function (errNew4, resultNew3) {
                                                   if (errNew4) {    
                                                      res.status(417).send({ Success: false, Message: "Some error occurred while Creating the Patient CoMorbidCondition!.", Error: errNew4 });
                                                   } else {
                                                      NotificationModel.NotificationSchema
                                                         .updateMany({
                                                            $or: [{ Notification_Type: 'Stemi_Ask_Cardiologist_ByUser' },
                                                                  { Notification_Type: 'AskingRepeat_ECG_ByDoctor' },
                                                                  { Notification_Type: 'NewECG_Updated_ByUser' }],
                                                            Patient_ID: PatientsDetails._id,
                                                            User_ID: { $in: NotifyToUsers }},
                                                            { $set: { Message_Viewed: true } }).exec();
                                                      NotifyToUsers = NotifyToUsers.filter(obj => JSON.parse(JSON.stringify(obj)) !== JSON.parse(JSON.stringify(ReceivingData.User)));
                        
                                                      //  FCM Push Notification
                                                      StemiAppUserModel.LoginHistorySchema.find({ User: { $in: NotifyToUsers }, Active_Status: true, If_Deleted: false }).exec((err_2, result_2) => {
                                                         if (!err_2) {
                                                            var AppUsers_FCMTokens = [];
                                                            var TabUsers_FCMTokens = [];
                                                            result_2.map(obj => {
                                                               if ((obj.Device_Type === 'Android' || obj.Device_Type === 'IOS') && obj.Firebase_Token !== '') {
                                                                  AppUsers_FCMTokens.push(obj.Firebase_Token);
                                                               } else if (obj.Device_Type === 'TAB' && obj.Firebase_Token !== '') {
                                                                  TabUsers_FCMTokens.push(obj.Firebase_Token);
                                                               }
                                                            });
                                                            AppUsers_FCMTokens = AppUsers_FCMTokens.filter((obj, index) => AppUsers_FCMTokens.indexOf(obj) === index);
                                                            TabUsers_FCMTokens = TabUsers_FCMTokens.filter((obj, index) => TabUsers_FCMTokens.indexOf(obj) === index);
                                                            PatientsDetails = JSON.parse(JSON.stringify(PatientsDetails));
                                                            PatientsDetails.Patient_Gender  = PatientsDetails.Patient_Gender === 'Male_to_Female' ? 'Male to Female' : PatientsDetails.Patient_Gender === 'Female_to_Male' ? 'Female to Male' : PatientsDetails.Patient_Gender;
                                                            var payload = {
                                                               notification: {
                                                                  title: 'STEMI Not Confirmed',
                                                                  body: 'STEMI Not Confirmed for Patient: ' + PatientsDetails.Patient_Name + ', Age: ' + PatientsDetails.Patient_Age + ', Gender: ' + PatientsDetails.Patient_Gender,
                                                                  sound: 'notify_tone.mp3'
                                                               },
                                                               data: {
                                                                  patient: PatientsDetails._id,
                                                                  notification_type: 'Stemi_Not_Confirmed_ByDoctor',
                                                                  click_action: 'FCM_PLUGIN_ACTIVITY',
                                                               }
                                                            };
                                                            if (AppUsers_FCMTokens.length > 0) {
                                                               FCM_App.messaging().sendToDevice(AppUsers_FCMTokens, payload, options).then((NotifyRes) => { });
                                                            }
                                                            if (TabUsers_FCMTokens.length > 0) {
                                                               FCM_Tab.messaging().sendToDevice(TabUsers_FCMTokens, payload, options).then((NotifyRes) => { });
                                                            }
                           
                                                            var numbers = Cardiologist_Array;
                                                            if (numbers.length > 0) {
                                                               var Msg = 'STEMI Not Confirmed for Patient: ' + PatientsDetails.Patient_Name + ', Age: ' + PatientsDetails.Patient_Age + ', Gender: ' + PatientsDetails.Patient_Gender;
                                                               axios({   method: 'post',   url: 'http://bulksmsservice.co.in/httpapi/v1/sendsms?api-token=9)2_6eh0s,v3(*4.1alzcgjp8uxnotkdy7ibqr5f&numbers=' + numbers + '&route=2&message=' + Msg + '&sender=STEMIN', }).
                                                               then( (response) =>{ });
                                                            }
                                                         }
                                                      });
                        
                                                      NotifyToUsers.map(obj => {
                                                         const Notification = new NotificationModel.NotificationSchema({
                                                            User_ID: mongoose.Types.ObjectId(obj),
                                                            Patient_ID: PatientsDetails._id,
                                                            Notification_Type: 'Stemi_Not_Confirmed_ByDoctor',
                                                            Message: 'STEMI Not Confirmed for Patient: ' + PatientsDetails.Patient_Name + ', Age: ' + PatientsDetails.Patient_Age + ', Gender: ' + PatientsDetails.Patient_Gender,
                                                            Message_Received: false,
                                                            Message_Viewed: true,
                                                            Active_Status: true,
                                                            If_Deleted: false
                                                         });
                                                         Notification.save();
                                                      });
                                                      res.status(200).send({ Success: true, Message: "STEMI Not Confirmed for Patient" });
                                                   }
                                                });
                                             }
                                          });
                                       }
                                    });
                                 });
                              }
                           });
                        }
                     });
               }).catch(errorThree => {
                  // console.log(errorThree);
                  console.log('Some Error Occured!');
               });
            }).catch(errorOne => {
               // console.log(errorOne);
               console.log('Some Error Occured!');
            });
         } else {
            if (PatientsDetails !== null && PatientsDetails.Stemi_Status === 'Stemi_Confirmed') {
               res.status(400).send({ Success: true, Message: "Someone Already STEMI Confirmed to this Patient" });
            } else if (PatientsDetails !== null && PatientsDetails.Stemi_Status === 'Stemi_Not_Confirmed') {
               res.status(400).send({ Success: true, Message: "STEMI Not Confirmed for Patient" });
            } else {
               res.status(400).send({ Success: true, Message: "Invalid Patient Details" });
            }
         }
      }).catch(error => {
         // console.log(error);
         console.log('Some Error Occured!');
      });
   }
};

// Repeat_ECG_To_User
exports.Repeat_ECG_To_User = function (req, res) {
   var ReceivingData = req.body;

   if (!ReceivingData.PatientId || ReceivingData.PatientId === '') {
      res.status(400).send({ Success: false, Message: "Patient ID is Required!" });
   } else if (!ReceivingData.User || ReceivingData.User === '') {
      res.status(400).send({ Status: false, Message: "User ID can not be empty" });
   } else {
      ReceivingData.PatientId = mongoose.Types.ObjectId(ReceivingData.PatientId);
      Promise.all([
         PatientDetailsModel.PatientBasicDetailsSchema.findOne({ _id: ReceivingData.PatientId }, {}, {})
         .populate({path: 'User', select: 'Phone'}).exec(),
      ]).then(response => {
         var PatientsDetails = response[0];
         if (PatientsDetails !== null && PatientsDetails.Stemi_Status !== 'Stemi_Confirmed' && PatientsDetails.Stemi_Status !== 'Stemi_Not_Confirmed' && PatientsDetails.Stemi_Status !== 'Retake_ECG') {
            const FirstRepailedTime = (PatientsDetails.FirstRepailedTime === undefined || PatientsDetails.FirstRepailedTime === null) ? new Date() : PatientsDetails.FirstRepailedTime;
            PatientDetailsModel.PatientBasicDetailsSchema
               .updateOne({ _id: PatientsDetails._id }, { $set: { Stemi_Status: 'Retake_ECG', FirstRepailedTime: FirstRepailedTime } })
               .exec(function (err, result_1) {
                  if (err) {
                     res.status(417).send({ Success: false, Message: "Some error occurred!.", Error: err });
                  } else {
                     //  FCM Push Notification
                     StemiAppUserModel.LoginHistorySchema.find({ User: mongoose.Types.ObjectId(PatientsDetails.User._id), Active_Status: true, If_Deleted: false }).exec((err_2, result_2) => {
                        if (!err_2) {
                           var AppUsers_FCMTokens = [];
                           var TabUsers_FCMTokens = [];
                           result_2.map(obj => {
                              if ((obj.Device_Type === 'Android' || obj.Device_Type === 'IOS') && obj.Firebase_Token !== '') {
                                 AppUsers_FCMTokens.push(obj.Firebase_Token);
                              } else if (obj.Device_Type === 'TAB' && obj.Firebase_Token !== '') {
                                 TabUsers_FCMTokens.push(obj.Firebase_Token);
                              }
                           });
                           AppUsers_FCMTokens = AppUsers_FCMTokens.filter((obj, index) => AppUsers_FCMTokens.indexOf(obj) === index);
                           TabUsers_FCMTokens = TabUsers_FCMTokens.filter((obj, index) => TabUsers_FCMTokens.indexOf(obj) === index);
                           PatientsDetails = JSON.parse(JSON.stringify(PatientsDetails));
                           PatientsDetails.Patient_Gender  = PatientsDetails.Patient_Gender === 'Male_to_Female' ? 'Male to Female' : PatientsDetails.Patient_Gender === 'Female_to_Male' ? 'Female to Male' : PatientsDetails.Patient_Gender;
                           var payload = {
                              notification: {
                                 title: 'Repeat ECG',
                                 body: 'Request to Repeat ECG for Patient: ' + PatientsDetails.Patient_Name + ', Age: ' + PatientsDetails.Patient_Age + ', Gender: ' + PatientsDetails.Patient_Gender,
                                 sound: 'notify_tone.mp3'
                              },
                              data: {
                                 patient: PatientsDetails._id,
                                 notification_type: 'AskingRepeat_ECG_ByDoctor',
                                 click_action: 'FCM_PLUGIN_ACTIVITY',
                              }
                           };
                           if (AppUsers_FCMTokens.length > 0) {
                              FCM_App.messaging().sendToDevice(AppUsers_FCMTokens, payload, options).then((NotifyRes) => { });
                           }
                           if (TabUsers_FCMTokens.length > 0) {
                              FCM_Tab.messaging().sendToDevice(TabUsers_FCMTokens, payload, options).then((NotifyRes) => { });
                           }

                           var numbers = [];
                           numbers.push(PatientsDetails.User.Phone);
                           if (numbers.length > 0) {
                              var Msg = 'Request to Repeat ECG for Patient: ' + PatientsDetails.Patient_Name + ', Age: ' + PatientsDetails.Patient_Age + ', Gender: ' + PatientsDetails.Patient_Gender;
                              axios({   method: 'post',   url: 'http://bulksmsservice.co.in/httpapi/v1/sendsms?api-token=9)2_6eh0s,v3(*4.1alzcgjp8uxnotkdy7ibqr5f&numbers=' + numbers + '&route=2&message=' + Msg + '&sender=STEMIN', }).
                              then( (response) =>{ });
                           }                                  

                        }
                     });

                     var Notification = new NotificationModel.NotificationSchema({
                        User_ID: mongoose.Types.ObjectId(PatientsDetails.User._id),
                        Patient_ID: PatientsDetails._id,
                        Notification_Type: 'AskingRepeat_ECG_ByDoctor',
                        Message: 'Request to Repeat ECG for Patient: ' + PatientsDetails.Patient_Name + ', Age: ' + PatientsDetails.Patient_Age + ', Gender: ' + PatientsDetails.Patient_Gender,
                        Message_Received: false,
                        Message_Viewed: false,
                        Active_Status: true,
                        If_Deleted: false
                     });
                     Notification.save((err_2, result_2) => {
                        if (err_2) {
                           res.status(417).send({ Success: false, Message: "Some error occurred while Validate Update the Notification Details!" });
                        } else {
                           res.status(200).send({ Success: true, Message: "Request to Repeat ECG for Patient" });
                        }
                     });
                  }
               });
         } else {
            if (PatientsDetails !== null && PatientsDetails.Stemi_Status === 'Stemi_Confirmed') {
               res.status(200).send({ Success: true, Message: "Someone Already STEMI Confirmed for this Patient" });
            } else if (PatientsDetails !== null && PatientsDetails.Stemi_Status === 'Stemi_Not_Confirmed') {
               res.status(200).send({ Success: true, Message: "Someone Already STEMI Confirmed for this Patient" });
            } else if (PatientsDetails !== null && PatientsDetails.Stemi_Status === 'Retake_ECG') {
               res.status(200).send({ Success: true, Message: "Repeat ECG Request Already Sent for this Patient" });
            } else {
               res.status(400).send({ Success: true, Message: "Invalid Patient Details" });
            }
         }
      }).catch(error => {
         // console.log(error);
         console.log('Some Error Occured!');
      });
   }
};

// User Ask To Doctor
exports.User_Update_ECG = function (req, res) {
   var ReceivingData = req.body;

   if (!ReceivingData.PatientId || ReceivingData.PatientId === '') {
      res.status(400).send({ Success: false, Message: "Patient Details can not be empty!" });
   } else if (!ReceivingData.ECG_File || ReceivingData.ECG_File === '') {
      res.status(400).send({ Success: false, Message: "ECG_File can not be empty!" });
   } else if (!ReceivingData.User || ReceivingData.User === '') {
      res.status(400).send({ Success: false, Message: "User can not be empty!" });
   } else if (!ReceivingData.Hospital || ReceivingData.Hospital === '') {
      res.status(400).send({ Success: false, Message: "Hospital can not be empty!" });
   } else if (!ReceivingData.ECG_Taken_date_time || ReceivingData.ECG_Taken_date_time === '') {
      res.status(400).send({ Success: false, Message: "ECG Taken Date Time can not be empty!" });
   } else {
      ReceivingData.PatientId = mongoose.Types.ObjectId(ReceivingData.PatientId);
      ReceivingData.Hospital = mongoose.Types.ObjectId(ReceivingData.Hospital);
      ReceivingData.User = mongoose.Types.ObjectId(ReceivingData.User);
      Promise.all([
         PatientDetailsModel.PatientBasicDetailsSchema.findOne({ _id: ReceivingData.PatientId }, {}, {}).exec(),
         HospitalManagementModel.HospitalManagementSchema.findOne({ _id: ReceivingData.Hospital }, { Connected_Clusters: 1, Cardiologist_Array: 1 }, {}).exec(),
         StemiUserModel.UserManagementSchema.find({ User_Type: 'D', HospitalsArray: ReceivingData.Hospital }, {}, {}).exec(),
      ]).then(response => {
         var PatientsDetails = response[0];
         if (PatientsDetails !== null && PatientsDetails.Stemi_Status === 'Retake_ECG') {
            const HosDetails = response[1];
            const Doctors = response[2];
            const Clusters = HosDetails.Connected_Clusters;
            var NotifyToUsers = [];
            var Cardiologist = [];
            Doctors.map(obj => NotifyToUsers.push(obj._id));
            var ECGArr = PatientsDetails.ECGFile_Array;         
            var Date_Time = PatientsDetails.ECG_Taken_date_time;
            const AddOn = (ECGArr.length !== undefined && ECGArr.length > 0) ? ECGArr.length + 1 : 1;
            if (PatientsDetails.EntryFrom === 'Android' || PatientsDetails.EntryFrom === 'IOS') {
               ECGArr.push({
                  "Name": Date_Time.valueOf() + '-' + 'APP-' + AddOn ,
                  "ECG_File": PatientsDetails.Current_ECG_File,
                  "DateTime": PatientsDetails.ECG_Taken_date_time
               });
            } else if (PatientsDetails.EntryFrom === 'BPL') {
               ECG_Arr.push({
                  "Name": Date_Time.valueOf() + '-' + 'BPL-' + AddOn,
                  "ECG_File": PatientsDetails.Current_ECG_File,
                  "DateTime": PatientsDetails.ECG_Taken_date_time
               });
            } else {
               ECGArr.push({
                  "Name": Date_Time.valueOf() + '-' + 'TAB-' + AddOn,
                  "ECG_File": PatientsDetails.Current_ECG_File,
                  "DateTime": PatientsDetails.ECG_Taken_date_time
               });
            }
            HosDetails.Cardiologist_Array.map(objCard => {
               if (objCard.Cardiologist_Preferred_Contact === true) {
                  Cardiologist.push(objCard.Cardiologist_Phone);
               }
            });
            PatientDetailsModel.PatientBasicDetailsSchema
               .updateOne({ _id: PatientsDetails._id },
                  {
                     $set: {
                        Stemi_Status: 'Stemi_Ask_Cardiologist',
                        Current_ECG_File: ReceivingData.ECG_File,
                        ECGFile_Array: ECGArr,
                        ECG_Taken_date_time: moment(ReceivingData.ECG_Taken_date_time, "YYYY-MM-DD HH:mm").toDate()
                     }
                  })
               .exec(function (err, result_1) {
                  if (err) {
                     res.status(417).send({ Success: false, Message: "Some error occurred!.", Error: err });
                  } else {
                     NotificationModel.NotificationSchema
                        .updateMany({ Notification_Type: 'AskingRepeat_ECG_ByDoctor', Patient_ID: ReceivingData.PatientId, User_ID: ReceivingData.User },
                           { $set: { Message_Viewed: true } }).exec();

                     Promise.all(
                        Clusters.map(obj => {
                           return StemiUserModel.UserManagementSchema.find({ User_Type: 'CDA', ClustersArray: obj }, {}, {}).exec();
                        })
                     ).then(responseOne => {
                        // responseOne.map(obj => {
                        //    obj.map(objNew => {
                        //       NotifyToUsers.push(objNew._id);
                        //    });
                        // });
                        NotifyToUsers = NotifyToUsers.filter((obj, index) => NotifyToUsers.indexOf(obj) === index);
                        //  FCM Push Notification
                        StemiAppUserModel.LoginHistorySchema.find({ User: { $in: NotifyToUsers }, Active_Status: true, If_Deleted: false }).exec((err_2, result_2) => {
                           if (!err_2) {
                              var AppUsers_FCMTokens = [];
                              var TabUsers_FCMTokens = [];
                              result_2.map(obj => {
                                 if ((obj.Device_Type === 'Android' || obj.Device_Type === 'IOS') && obj.Firebase_Token !== '') {
                                    AppUsers_FCMTokens.push(obj.Firebase_Token);
                                 } else if (obj.Device_Type === 'TAB' && obj.Firebase_Token !== '') {
                                    TabUsers_FCMTokens.push(obj.Firebase_Token);
                                 }
                              });
                              AppUsers_FCMTokens = AppUsers_FCMTokens.filter((obj, index) => AppUsers_FCMTokens.indexOf(obj) === index);
                              TabUsers_FCMTokens = TabUsers_FCMTokens.filter((obj, index) => TabUsers_FCMTokens.indexOf(obj) === index);
                              PatientsDetails = JSON.parse(JSON.stringify(PatientsDetails));
                              PatientsDetails.Patient_Gender  = PatientsDetails.Patient_Gender === 'Male_to_Female' ? 'Male to Female' : PatientsDetails.Patient_Gender === 'Female_to_Male' ? 'Female to Male' : PatientsDetails.Patient_Gender;
                              var payload = {
                                 notification: {
                                    title: 'ECG Update',
                                    body: 'New ECG Updated for Patient: ' + PatientsDetails.Patient_Name + ', Age: ' + PatientsDetails.Patient_Age + ', Gender: ' + PatientsDetails.Patient_Gender,
                                    sound: 'notify_tone.mp3'
                                 },
                                 data: {
                                    patient: PatientsDetails._id,
                                    notification_type: 'NewECG_Updated_ByUser',
                                    click_action: 'FCM_PLUGIN_ACTIVITY',
                                 }
                              };
                              if (AppUsers_FCMTokens.length > 0) {
                                 FCM_App.messaging().sendToDevice(AppUsers_FCMTokens, payload, options).then((NotifyRes) => { });
                              }
                              if (TabUsers_FCMTokens.length > 0) {
                                 FCM_Tab.messaging().sendToDevice(TabUsers_FCMTokens, payload, options).then((NotifyRes) => { });
                              }

                              var numbers = Cardiologist;
                              if (numbers.length > 0) {
                                 var Msg = 'New ECG Updated for Patient: ' + PatientsDetails.Patient_Name + ', Age: ' + PatientsDetails.Patient_Age + ', Gender: ' + PatientsDetails.Patient_Gender;
                                 axios({   method: 'post',   url: 'http://bulksmsservice.co.in/httpapi/v1/sendsms?api-token=9)2_6eh0s,v3(*4.1alzcgjp8uxnotkdy7ibqr5f&numbers=' + numbers + '&route=2&message=' + Msg + '&sender=STEMIN', }).
                                 then( (response) =>{ });
                              }
                           }
                        });

                        NotifyToUsers.map(obj => {
                           const Notification = new NotificationModel.NotificationSchema({
                              User_ID: mongoose.Types.ObjectId(obj),
                              Patient_ID: PatientsDetails._id,
                              Notification_Type: 'NewECG_Updated_ByUser',
                              Message: 'New ECG Updated for Patient: ' + PatientsDetails.Patient_Name + ', Age: ' + PatientsDetails.Patient_Age + ', Gender: ' + PatientsDetails.Patient_Gender,
                              Message_Received: false,
                              Message_Viewed: false,
                              Active_Status: true,
                              If_Deleted: false
                           });
                           Notification.save();
                        });
                        res.status(200).send({ Success: true, Message: "New ECG Updated for Patient" });
                     }).catch(errorOne => {
                        // console.log(errorOne);
                        console.log('Some Error Occured!');
                     });
                  }
               });
         } else {
            if (PatientsDetails !== null && PatientsDetails.Stemi_Status === 'Retake_ECG') {
               res.status(400).send({ Success: true, Message: "Someone Already Updated STEMI Status to this Patient" });
            } else {
               res.status(400).send({ Success: true, Message: "Invalid Patient Details" });
            }
         }
      }).catch(error => {
         // console.log(error);
         console.log('Some Error Occured!');
      });
   }
};

//Notification Counts
exports.Notification_Counts = function (req, res) {
   var ReceivingData = req.body;
   if (!ReceivingData.User || ReceivingData.User === '') {
      res.status(400).send({ Success: false, Message: "User ID can not be empty" });
   } else {
      const AccessibleTypes = ['Stemi_Confirmed_ByUser', 'Stemi_Ask_Cardiologist_ByUser', 'Stemi_Confirmed_ByDoctor', 'Stemi_Not_Confirmed_ByDoctor', 'AskingRepeat_ECG_ByDoctor', 'NewECG_Updated_ByUser'];
      NotificationModel.NotificationSchema.countDocuments({ Notification_Type: { $in: AccessibleTypes }, User_ID: ReceivingData.User, Active_Status: true, If_Deleted: false })
         .exec((err, result) => {
            if (err) {
               res.status(417).send({ Success: false, Message: "Some error occurred while Find The Notification Details!.", Error: err });
            } else {
               const RandomToken = crypto.randomBytes(32).toString("hex");
               const ReturnResponse = CryptoJS.AES.encrypt(JSON.stringify(result), RandomToken.slice(3, 10)).toString();
               res.status(200).send({ Success: true, Key: RandomToken, Response: ReturnResponse });
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
      const AccessibleTypes = ['Stemi_Confirmed_ByUser', 'Stemi_Ask_Cardiologist_ByUser', 'Stemi_Confirmed_ByDoctor', 'Stemi_Not_Confirmed_ByDoctor', 'AskingRepeat_ECG_ByDoctor', 'NewECG_Updated_ByUser'];
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

               const RandomToken = crypto.randomBytes(32).toString("hex");
               const ReturnResponse = CryptoJS.AES.encrypt(JSON.stringify(result), RandomToken.slice(3, 10)).toString();
               res.status(200).send({ Success: true, Key: RandomToken, Response: ReturnResponse });
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
      NotificationModel.NotificationSchema.updateMany({ User_ID: ReceivingData.User, Message_Viewed: true }, { $set: { If_Deleted: true } })
         .exec(function (err, result) {
            if (err) {
               res.status(417).send({ Success: false, Message: "Some error occurred while Find The Notification Details!.", Error: err });
            } else {
               res.status(200).send({ Success: true, Message: 'Viewed Notifications Deleted' });
            }
         });
   }
};


// User_QRCodeVerify
exports.User_QRCodeVerify = function (req, res) {
   var ReceivingData = req.body;
   if (!ReceivingData.token || ReceivingData.token === '') {
      res.status(400).send({ Success: false, Message: "User Details can not be empty" });
   } else if (!ReceivingData.PatientId || ReceivingData.PatientId === '') {
      res.status(400).send({ Success: false, Message: "Patient Details can not be empty" });
   } else {
      ReceivingData.PatientId = mongoose.Types.ObjectId(ReceivingData.PatientId);
      WebPatientDetailsModel.PatientBasicDetailsSchema.findOne({ _id: ReceivingData.PatientId, Active_Status: true, If_Deleted: false }, {}, {}).exec(function (err, results) {
         if (err) {
            res.status(417).send({ Success: false, Message: "Some error occurred while Find The Patient Details!.", Error: err });
         } else {
            if (results !== null) {
               StemiAppUserModel.LoginHistorySchema.findOne({ LoginToken: ReceivingData.token, Active_Status: true, If_Deleted: false }, {}, {}).exec(function (error_1, result_1) {
                  if (error_1) {
                     res.status(417).send({ Success: false, Message: "Some error occurred while Find The User Details!.", Error: error_1 });
                  } else {
                     if (result_1 !== null) {
                        res.status(200).send({ Success: true, Message: "Patient QR Code Verified" });
                     } else {
                        res.status(400).send({ Success: true, Message: "Invalid User Details" });
                     }
                  }
               });
            } else {
               res.status(400).send({ Success: true, Message: "Invalid Patient Details" });
            }
         }
      });
   }
};


// User Update 90Min ECG File
exports.User_Update_Ninety_Min_ECG = function (req, res) {
   var ReceivingData = req.body;   
   if (!ReceivingData.token || ReceivingData.token === '') {
      res.status(400).send({ Success: false, Message: "User Details can not be empty" });
   } else if (!ReceivingData.PatientId || ReceivingData.PatientId === '') {
      res.status(400).send({ Success: false, Message: "Patient Details can not be empty" });
   } else if (!ReceivingData.ECG_File || ReceivingData.ECG_File === '') {
      res.status(400).send({ Success: false, Message: "ECG File can not be empty" });
   } else if (!ReceivingData.ECG_Taken_date_time || ReceivingData.ECG_Taken_date_time === '') {
      res.status(400).send({ Success: false, Message: "ECG Taken Date Time can not be empty" });
   } else {
      ReceivingData.PatientId = mongoose.Types.ObjectId(ReceivingData.PatientId);
      WebPatientDetailsModel.PatientBasicDetailsSchema.findOne({ _id: ReceivingData.PatientId, Active_Status: true, If_Deleted: false }, {}, {}).exec(function (error_2, result_2) {
         if (error_2) {
            res.status(417).send({ Success: false, Message: "Some error occurred while Find The Patient Details!.", Error: error_2 });
         } else {
            if (result_2 !== null) {
              var ECG_Arr = result_2.Ninety_Min_ECG_Files;
              const AddOn = (ECG_Arr.length !== undefined && ECG_Arr.length > 0) ? ECG_Arr.length + 1 : 1;
              var Date_Time = moment(ReceivingData.ECG_Taken_date_time, "YYYY-MM-DD HH:mm").toDate();
               if (ReceivingData.EntryFrom === 'Android' || ReceivingData.EntryFrom === 'IOS') {
                  ECG_Arr.push({
                     "Name": Date_Time.valueOf() + '-' + 'APP' + '-' + '90min-' + AddOn,
                     "ECG_File": ReceivingData.ECG_File,
                     "DateTime": Date_Time,
                     "Hospital": result_2.Initiated_Hospital
                  });
               } else {
                  ECG_Arr.push({
                     "Name": Date_Time.valueOf() + '-' + 'TAB' + '-' + '90min-' + AddOn,
                     "ECG_File": ReceivingData.ECG_File,
                     "DateTime": Date_Time,
                     "Hospital": result_2.Initiated_Hospital
                  });
               }
            
               WebPatientDetailsModel.PatientBasicDetailsSchema
               .updateOne({ _id: ReceivingData.PatientId },
                  {
                     $set: {
                       Ninety_Min_ECG_Files: ECG_Arr
                     }
                  }).exec(function (error3, result_3) {
                     if (error3) {
                        res.status(417).send({ Success: false, Message: "Some error occurred!.", Error: error3 });
                     } else {
                        res.status(200).send({ Success: true, Message: "90Min ECG File Updated for Patient" });
                     }
                  });
            } else {
               res.status(400).send({ Success: true, Message: "Invalid Patient Details" });
            }
         }
      });
   }
};


// Offline Patient Details
exports.Offline_Patient_Details = function (req, res) {
   var ReceivingData = req.body;
   if (!ReceivingData.Offline_Patient_Details || ReceivingData.Offline_Patient_Details === []) {
      res.status(400).send({ Success: false, Message: "Offline Patient Details can not be empty" });
   } else {
      var Patient_Records = [];
      ReceivingData.Offline_Patient_Details.map(obj => {
         var Location_of_Pain = obj.Symptoms.Location_of_Pain;
         // if (obj.Symptoms.Duration_of_Pain && obj.Symptoms.Duration_of_Pain !== '' && obj.Symptoms.Duration_of_Pain !== null) {
         //    obj.Symptoms.Duration_of_Pain = moment(obj.Symptoms.Duration_of_Pain, "YYYY-MM-DD HH:mm").toDate();
         // } else {
         //    obj.Symptoms.Duration_of_Pain = null;
         // }
         const Create_PatientBasicDetails = new PatientDetailsModel.OffLinePatientBasicDetailsSchema({
            Patient_Local: obj.Patient_Local || '',
            Patient_Name: obj.Patient_Name || '',
            Patient_Age: obj.Patient_Age || null,
            Patient_Gender: obj.Patient_Gender || '',
            Admission_Type: obj.Admission_Type || 'Direct',
            User: mongoose.Types.ObjectId(obj.User) || '',
            Confirmed_UserType: 'Peripheral User',
            Confirmed_By: mongoose.Types.ObjectId(obj.User) || '',
            Risk_Factors: obj.Risk_Factors || [],
            Confirmed_ECG: '',
            ECGFile_Array: [],
            Current_ECG_File: obj.Confirmed_ECG || '',
            Stemi_Status: '',
            'Symptoms.Chest_Discomfort': obj.Symptoms.Chest_Discomfort || '',
            // 'Symptoms.Duration_of_Pain': obj.Symptoms.Duration_of_Pain,
            'Symptoms.Duration_of_Pain': null,
            'Symptoms.Location_of_Pain': Location_of_Pain || '',
            ECG_Taken_date_time: moment(obj.ECG_Taken_date_time, "YYYY-MM-DD HH:mm").toDate() || null,
            QR_image: '',
            Hospital: mongoose.Types.ObjectId(obj.Hospital) || null,
            Active_Status: true,
            If_Deleted: false
         });
         Patient_Records.push(Create_PatientBasicDetails);
      });
      Promise.all(
         Patient_Records.map(objNew => {
            return objNew.save();
         })
      ).then(response => {
         var OfflinePatient = JSON.parse(JSON.stringify(response));
         var ReturnResponse = [];
         OfflinePatient.map(obj1 => {
            const Obj = {
               Local: obj1.Patient_Local,
               Live: obj1._id
            };
            ReturnResponse.push(Obj);
         });
         if (ReturnResponse.length > 0) {
            const RandomToken = crypto.randomBytes(32).toString("hex");
            const ReturnSubResponse = CryptoJS.AES.encrypt(JSON.stringify(ReturnResponse), RandomToken.slice(3, 10)).toString();
            res.status(200).send({ Success: true, Message: 'Offline Patient Details Added', Key:RandomToken, Response: ReturnSubResponse });
         }
      }).catch(error => {
         // console.log(error);
         console.log('Some Error Occured!');
      });

   }
};


// User Update Offline Patient Details
exports.User_Update_Offline_Patient_Details = function (req, res) {
   var ReceivingData = req.body;
   if (!ReceivingData.PatientId || ReceivingData.PatientId === '') {
      res.status(400).send({ Success: false, Message: "Patient Details can not be empty" });
   } else if (!ReceivingData.Stemi_Status || ReceivingData.Stemi_Status === '') {
      res.status(400).send({ Success: false, Message: "Stemi Status can not be empty" });
   } else {
      ReceivingData.PatientId = mongoose.Types.ObjectId(ReceivingData.PatientId);
      PatientDetailsModel.OffLinePatientBasicDetailsSchema.updateOne({ _id: ReceivingData.PatientId }, { $set: { Stemi_Status: ReceivingData.Stemi_Status } })
         .exec(function (err, result) {
            if (err) {
               res.status(417).send({ Success: false, Message: "Some error occurred while Find The Patient Details!.", Error: err });
            } else {
               res.status(200).send({ Success: true, Message: 'Patient Details Updated' });
            }
         });
   }
};


function DoctorNotifySchedule(ClusterDoctors, payload, Patient) {
   ClusterDoctors.map(obj => {
      const Duration = obj.Alert_Duration !== undefined && !isNaN(obj.Alert_Duration) && obj.Alert_Duration > 0 ? (obj.Alert_Duration * 60000) : 300000;
      var scheduleTime = new Date(Date.now() + Duration);
      const S = Schedule.scheduleJob(scheduleTime, function(time) {
         PatientDetailsModel.PatientBasicDetailsSchema
         .findOne({_id: Patient._id, $or: [ {Stemi_Status: 'Stemi_Ask_Cardiologist'}, { Stemi_Status: 'Retake_ECG' } ] })
         .exec( (err, result) => {
            if (!err && result !== null) {
               StemiAppUserModel.LoginHistorySchema
               .find({ User: obj._id, Active_Status: true, If_Deleted: false })
               .exec((err_1, result_1) => {
                  if (!err_1 && result_1.length > 0) {
                     var AppUsers_FCMTokens = [];
                     var TabUsers_FCMTokens = [];
                     result_1.map(obj_1 => {
                        if ((obj_1.Device_Type === 'Android' || obj_1.Device_Type === 'IOS') && obj_1.Firebase_Token !== '') {
                           AppUsers_FCMTokens.push(obj_1.Firebase_Token);
                        } else if (obj_1.Device_Type === 'TAB' && obj_1.Firebase_Token !== '') {
                           TabUsers_FCMTokens.push(obj_1.Firebase_Token);
                        }
                     });
                     AppUsers_FCMTokens = AppUsers_FCMTokens.filter((obj_1, index) => AppUsers_FCMTokens.indexOf(obj_1) === index);
                     TabUsers_FCMTokens = TabUsers_FCMTokens.filter((obj_1, index) => TabUsers_FCMTokens.indexOf(obj_1) === index);
                     if (AppUsers_FCMTokens.length > 0) {
                        FCM_App.messaging().sendToDevice(AppUsers_FCMTokens, payload, options).then((NotifyRes) => { });
                     }
                     if (TabUsers_FCMTokens.length > 0) {
                        FCM_Tab.messaging().sendToDevice(TabUsers_FCMTokens, payload, options).then((NotifyRes) => { });
                     }
                  }
               });
            }
         });
      });
   });
}
