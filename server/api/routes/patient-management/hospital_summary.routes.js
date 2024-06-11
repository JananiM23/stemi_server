module.exports = function (app) {

   var Controller = require('./../../controllers/patient-management/hospital_summary.controller');

   app.post('/API/patient_management/HospitalSummaryLabReport_Create', Controller.HospitalSummaryLabReport_Create);
   app.post('/API/patient_management/HospitalSummaryLabReport_View', Controller.HospitalSummaryLabReport_View);
   app.post('/API/patient_management/HospitalSummaryLabReport_Update', Controller.HospitalSummaryLabReport_Update);
   app.post('/API/patient_management/LabReportHistory_CardiacUpdate', Controller.LabReportHistory_CardiacUpdate);
   app.post('/API/patient_management/LabReportHistory_SerumUpdate', Controller.LabReportHistory_SerumUpdate);
   app.post('/API/patient_management/LabReportHistory_Create', Controller.LabReportHistory_Create);


   app.post('/API/patient_management/HospitalSummaryMedicationInHospital_Create', Controller.HospitalSummaryMedicationInHospital_Create);
   app.post('/API/patient_management/HospitalSummaryMedicationInHospital_Update', Controller.HospitalSummaryMedicationInHospital_Update);
   app.post('/API/patient_management/HospitalSummaryMedicationInHospital_View', Controller.HospitalSummaryMedicationInHospital_View);
   app.post('/API/patient_management/MedicationInHospitalHistory_Update', Controller.MedicationInHospitalHistory_Update);
   app.post('/API/patient_management/MedicationInHospitalHistory_Create', Controller.MedicationInHospitalHistory_Create);


   app.post('/API/patient_management/HospitalSummaryAdverseEvents_Create', Controller.HospitalSummaryAdverseEvents_Create);
   app.post('/API/patient_management/HospitalSummaryAdverseEvents_View', Controller.HospitalSummaryAdverseEvents_View);
   app.post('/API/patient_management/HospitalSummaryAdverseEvents_Update', Controller.HospitalSummaryAdverseEvents_Update);
   app.post('/API/patient_management/AdverseEventsHistory_Update', Controller.AdverseEventsHistory_Update);
   app.post('/API/patient_management/AdverseEventsHistory_Create', Controller.AdverseEventsHistory_Create);
  
};