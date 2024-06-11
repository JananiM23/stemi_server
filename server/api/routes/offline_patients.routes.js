module.exports = function (app) {

   var Controller = require('../controllers/offline_patients.controller');

   app.post('/API/Offline_Patient_Management/Offline_AllPatientDetails_List', Controller.Offline_AllPatientDetails_List); 
   app.post('/API/Offline_Patient_Management/CoordinatorBasedOffline_List', Controller.CoordinatorBasedOffline_List); 
   app.post('/API/Offline_Patient_Management/SingleClusterBased_OfflinePatients', Controller.SingleClusterBased_OfflinePatients); 
   app.post('/API/Offline_Patient_Management/AdvancedClusterOffline_Patients', Controller.AdvancedClusterOffline_Patients);
   app.post('/API/Offline_Patient_Management/MultipleClusterOffline_Patients', Controller.MultipleClusterOffline_Patients);
   app.post('/API/Offline_Patient_Management/HospitalBasedOffline_Patients', Controller.HospitalBasedOffline_Patients);
} 
