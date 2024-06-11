module.exports = function (app) {

   var Controller = require('../../controllers/patient-management/followup.controller');

   app.post('/API/patient_management/FollowUpDetails_Create', Controller.FollowUpDetails_Create);
   app.post('/API/patient_management/FollowUpDetails_View', Controller.FollowUpDetails_View);
   app.post('/API/patient_management/FollowUpDetails_Update', Controller.FollowUpDetails_Update);
   app.post('/API/patient_management/FollowUpHistory_Update', Controller.FollowUpHistory_Update);
   
   // Route added for FollowUp delete
   app.post('/API/patient_management/FollowUpHistory_Delete', Controller.FollowUpHistory_Delete);

   app.post('/API/patient_management/FollowUpMedication_Create', Controller.FollowUpMedication_Create);
   app.post('/API/patient_management/FollowUpMedication_View', Controller.FollowUpMedication_View);
   app.post('/API/patient_management/FollowUpMedication_Update', Controller.FollowUpMedication_Update);
   app.post('/API/patient_management/FollowUpMedicationHistory_Update', Controller.FollowUpMedicationHistory_Update);
   app.post('/API/patient_management/FollowUpMedicationHistory_Create', Controller.FollowUpMedicationHistory_Create);

   // Route added for Medication delete
   app.post('/API/patient_management/FollowUpMedicationHistory_Delete', Controller.FollowUpMedicationHistory_Delete);

   app.post('/API/patient_management/FollowUpEvents_Create', Controller.FollowUpEvents_Create);
   app.post('/API/patient_management/FollowUpEvents_View', Controller.FollowUpEvents_View);
   app.post('/API/patient_management/FollowUpEvents_Update', Controller.FollowUpEvents_Update);
   app.post('/API/patient_management/FollowUpEventsHistory_Update', Controller.FollowUpEventsHistory_Update);
   app.post('/API/patient_management/FollowUpEventsHistory_Create', Controller.FollowUpEventsHistory_Create);

   // Route added for Event delete
   app.post('/API/patient_management/FollowUpEventHistory_Delete', Controller.FollowUpEventHistory_Delete);
};