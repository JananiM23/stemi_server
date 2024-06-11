module.exports = function (app) {

    var Controller = require('../../../mobile_api/controllers/patient-management/patient_details.controller');
 
    app.post('/APP_API/Patient_Management/PatientConfirm_By_User', Controller.PatientConfirm_By_User);
    app.post('/APP_API/patient_management/Stemi_Ask_To_Cardiologist', Controller.Stemi_Ask_To_Cardiologist);
    app.post('/APP_API/patient_management/Patient_Mob_View', Controller.PatientBasicDetails_Mob_View);
    app.post('/APP_API/patient_management/Patient_Mob_View_Ios', Controller.PatientBasicDetails_Mob_View_Ios);
    app.post('/APP_API/patient_management/Stemi_Ask_Cardiologist_List', Controller.Stemi_Ask_Cardiologist_List);
    app.post('/APP_API/patient_management/Stemi_Confirmed_By_Doctor', Controller.Stemi_Confirmed_By_Doctor); 
    app.post('/APP_API/patient_management/Stemi_Not_Confirmed_By_Doctor', Controller.Stemi_Not_Confirmed_By_Doctor);
    app.post('/APP_API/patient_management/Repeat_ECG_To_User', Controller.Repeat_ECG_To_User);
    app.post('/APP_API/patient_management/User_Update_ECG', Controller.User_Update_ECG);
    
    app.post('/APP_API/patient_management/User_QRCodeVerify', Controller.User_QRCodeVerify);
    app.post('/APP_API/patient_management/User_Update_Ninety_Min_ECG', Controller.User_Update_Ninety_Min_ECG);
    app.post('/APP_API/patient_management/Offline_Patient_Details', Controller.Offline_Patient_Details);
    app.post('/APP_API/patient_management/User_Update_Offline_Patient_Details', Controller.User_Update_Offline_Patient_Details);    

    app.post('/APP_API/patient_management/Notification_Counts', Controller.Notification_Counts);  
    app.post('/APP_API/patient_management/All_Notifications_List', Controller.All_Notifications_List);
    app.post('/APP_API/patient_management/Notification_Viewed_Update', Controller.Notification_Viewed_Update);
    app.post('/APP_API/patient_management/Viewed_Notifications_Delete', Controller.Viewed_Notifications_Delete); 

   
 };