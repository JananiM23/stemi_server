module.exports = function (app) {

   var Controller = require('../controllers/Ask_Cardiologist_patients.controller');

   app.post('/API/Ask_Cardiologist_Patient_Management/Cardiac_AllPatient_List', Controller.Cardiac_AllPatient_List); 
   app.post('/API/Ask_Cardiologist_Patient_Management/Coordinator_CardiacList', Controller.Coordinator_CardiacList); 
   app.post('/API/Ask_Cardiologist_Patient_Management/SingleCluster_CardiacPatients', Controller.SingleCluster_CardiacPatients);
   app.post('/API/Ask_Cardiologist_Patient_Management/MultipleCluster_CardiacPatients', Controller.MultipleCluster_CardiacPatients);
   app.post('/API/Ask_Cardiologist_Patient_Management/AdvancedCluster_CardiacPatients', Controller.AdvancedCluster_CardiacPatients);
   app.post('/API/Ask_Cardiologist_Patient_Management/HospitalBased_CardiacPatients', Controller.HospitalBased_CardiacPatients);

};
