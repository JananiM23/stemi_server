module.exports = function(app) {

   var Controller = require('../../controllers/patient-management/discharge_transfer.controller');
   
   app.post('/API/patient_management/DischargeTransferDeath_Create', Controller.DischargeTransferDeath_Create);
   app.post('/API/patient_management/DischargeTransferDeath_View', Controller.DischargeTransferDeath_View);
   app.post('/API/patient_management/DischargeTransferDeath_Update', Controller.DischargeTransferDeath_Update);

   app.post('/API/patient_management/DischargeTransferMedication_Create', Controller.DischargeTransferMedication_Create);
   app.post('/API/patient_management/DischargeTransferMedication_Update', Controller.DischargeTransferMedication_Update);
   app.post('/API/patient_management/DischargeTransferMedication_View', Controller.DischargeTransferMedication_View);
   app.post('/API/patient_management/TransferHistoryMedication_Update', Controller.TransferHistoryMedication_Update);
   app.post('/API/patient_management/TransferHistoryMedication_Create', Controller.TransferHistoryMedication_Create);
  
  
   app.post('/API/patient_management/DischargeTransferDischarge_Create', Controller.DischargeTransferDischarge_Create);
   app.post('/API/patient_management/DischargeTransferDischarge_Update', Controller.DischargeTransferDischarge_Update);
   app.post('/API/patient_management/DischargeTransferDischarge_View', Controller.DischargeTransferDischarge_View);
   app.post('/API/patient_management/DischargeHistory_Update', Controller.DischargeHistory_Update);


   app.post('/API/patient_management/DischargeOther_Clusters', Controller.DischargeOther_Clusters);
   app.post('/API/patient_management/DischargeHospitals_ClusterBased', Controller.DischargeHospitals_ClusterBased);
   app.post('/API/patient_management/DischargeAmbulance_LocationBased', Controller.DischargeAmbulance_LocationBased);

};