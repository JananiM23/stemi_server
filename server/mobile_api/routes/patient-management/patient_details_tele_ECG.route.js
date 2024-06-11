module.exports = function (app) {

   var Controller = require('../../../mobile_api/controllers/patient-management/patient_details_tele_ECG.controller');

   app.post('/APP_API/TeleECG_Patient_Management/NewECGFile', Controller.NewECGFile);
   app.post('/APP_API/TeleECG_Patient_Management/NewECGReport', Controller.NewECGReport);
   app.post('/APP_API/TeleECG_Patient_Management/TeleECG_List_For_User', Controller.TeleECG_List_For_User);
   app.post('/APP_API/TeleECG_Patient_Management/TeleECG_Doctors_List', Controller.TeleECG_Doctors_List);
   app.post('/APP_API/TeleECG_Patient_Management/TeleECG_Doctors_Invite', Controller.TeleECG_Doctors_Invite);
   app.post('/APP_API/TeleECG_Patient_Management/TeleECG_List_For_Doctor', Controller.TeleECG_List_For_Doctor);
   app.post('/APP_API/TeleECG_Patient_Management/TeleECG_Invite_Accept', Controller.TeleECG_Invite_Accept);
   app.post('/APP_API/TeleECG_Patient_Management/TeleECG_Invite_Reject', Controller.TeleECG_Invite_Reject);
   app.post('/APP_API/TeleECG_Patient_Management/TeleECG_Patient_View', Controller.TeleECG_Patient_View);
   app.post('/APP_API/TeleECG_Patient_Management/TeleECG_Patient_Update', Controller.TeleECG_Patient_Update);
   app.post('/APP_API/TeleECG_Patient_Management/TeleECG_Patient_STEMI_Confirm', Controller.TeleECG_Patient_STEMI_Confirm);
   app.post('/APP_API/TeleECG_Patient_Management/TeleECG_Patient_STEMI_NotConfirm', Controller.TeleECG_Patient_STEMI_NotConfirm);
   app.post('/APP_API/TeleECG_Patient_Management/TeleECG_Case_Dismiss', Controller.TeleECG_Case_Dismiss);

   app.post('/APP_API/TeleECG_Patient_Management/Notification_Counts', Controller.Notification_Counts);
   app.post('/APP_API/TeleECG_Patient_Management/All_Notifications_List', Controller.All_Notifications_List);
   app.post('/APP_API/TeleECG_Patient_Management/Notification_Viewed_Update', Controller.Notification_Viewed_Update);
   app.post('/APP_API/TeleECG_Patient_Management/Viewed_Notifications_Delete', Controller.Viewed_Notifications_Delete);

   app.post('/APP_API/TeleECG_Patient_Management/PushNotificationTest', Controller.PushNotificationTest);

};