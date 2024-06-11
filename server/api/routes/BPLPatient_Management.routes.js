module.exports = function (app) {

   var Controller = require('../controllers/BPLPatient_Management.controller');

   app.post('/API/BPLPatient_Management/All_BPLPatients_List', Controller.All_BPLPatients_List); 
   app.post('/API/BPLPatient_Management/All_BPLPatients_CompleteList', Controller.All_BPLPatients_CompleteList); 
   app.post('/API/BPLPatient_Management/Coordinator_BPLPatients_List', Controller.Coordinator_BPLPatients_List); 
   app.post('/API/BPLPatient_Management/MultipleCluster_BPLPatients_List', Controller.MultipleCluster_BPLPatients_List);
   app.post('/API/BPLPatient_Management/SingleCluster_BPLPatients_List', Controller.SingleCluster_BPLPatients_List);
   app.post('/API/BPLPatient_Management/AdvancedCluster_BPLPatients_List', Controller.AdvancedCluster_BPLPatients_List);
   app.post('/API/BPLPatient_Management/HospitalBased_BPLPatients_List', Controller.HospitalBased_BPLPatients_List);
   app.post('/API/BPLPatient_Management/BPLPatient_AskCardiologist', Controller.BPLPatient_AskCardiologist);
   app.post('/API/BPLPatient_Management/BPLPatient_StemiConfirm', Controller.BPLPatient_StemiConfirm);
   app.post('/API/BPLPatient_Management/Update_BPLFollowUp_ECG', Controller.Update_BPLFollowUp_ECG);

   app.post('/API/BPLPatient_Management_Records/DownloadECGPDF_Records', Controller.DownloadECGPDF_Recordss)

};
