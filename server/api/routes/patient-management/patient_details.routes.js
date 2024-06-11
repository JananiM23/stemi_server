module.exports = function (app) {

   var Controller = require('./../../controllers/patient-management/patient_details.controller');
   var ReportController = require('./../../controllers/reports.controller');

   app.post('/API/patient_management/PatientBasicDetails_Create', Controller.PatientBasicDetails_Create);
   app.post('/API/patient_management/PatientBasicDetails_View', Controller.PatientBasicDetails_View);
   app.post('/API/patient_management/PatientBasicDetails_Update', Controller.PatientBasicDetails_Update);
   app.post('/API/patient_management/PatientPrintDetails', Controller.PatientPrintDetails_View);
   app.post('/API/patient_management/PatientNonCluster_Update', Controller.PatientNonCluster_Update);
   app.post('/API/patient_management/PatientBasicHospital_Update', Controller.PatientBasicHospital_Update);
   app.post('/API/patient_management/PatientBasicTransport_Update', Controller.PatientBasicTransport_Update);
   app.post('/API/patient_management/PatientClinical_Update', Controller.PatientClinical_Update);

   app.post('/API/patient_management/PatientDidNotArrive_Update', Controller.PatientDidNotArrive_Update);
   app.post('/API/patient_management/Patient_Delete', Controller.Patient_Delete);

   app.post('/API/patient_management/SingleClusterBased_Patients', Controller.SingleClusterBased_Patients);
   app.post('/API/patient_management/AdvancedClusterBased_Patients', Controller.AdvancedClusterBased_Patients);
   app.post('/API/patient_management/MultipleClusterBased_Patients', Controller.MultipleClusterBased_Patients);
   app.post('/API/patient_management/HospitalBased_Patients', Controller.HospitalBased_Patients);
   app.post('/API/patient_management/CoordinatorBasedPatients_List', Controller.CoordinatorBasedPatients_List);
   app.post('/API/patient_management/AllPatientDetails_List', Controller.AllPatientDetails_List);



   app.post('/API/patient_management/HospitalBased_PatientsSimpleList', Controller.HospitalBased_PatientsSimpleList);
   app.post('/API/patient_management/SingleClusterBased_PatientsSimpleList', Controller.SingleClusterBased_PatientsSimpleList);
   app.post('/API/patient_management/AdvancedClusterBased_PatientsSimpleList', Controller.AdvancedClusterBased_PatientsSimpleList);
   app.post('/API/patient_management/MultipleClusterBased_PatientsSimpleList', Controller.MultipleClusterBased_PatientsSimpleList);
   app.post('/API/patient_management/CoordinatorBasedPatients_SimpleList', Controller.CoordinatorBasedPatients_SimpleList);
   app.post('/API/patient_management/AllPatientDetails_SimpleList', Controller.AllPatientDetails_SimpleList);


   app.post('/API/patient_management/SingleClusterBasedPatients_Count', Controller.SingleClusterBasedPatients_Count);
   app.post('/API/patient_management/AdvancedClusterBasedPatients_Count', Controller.AdvancedClusterBasedPatients_Count);
   app.post('/API/patient_management/MultipleClusterBasedPatients_Count', Controller.MultipleClusterBasedPatients_Count);
   app.post('/API/patient_management/HospitalBasedPatients_Count', Controller.HospitalBasedPatients_Count);
   app.post('/API/patient_management/CoordinatorBasedPatients_Count', Controller.CoordinatorBasedPatients_Count);
   app.post('/API/patient_management/AllPatientDetails_Count', Controller.AllPatientDetails_Count);

   app.post('/API/patient_management/AdmissionType', Controller.AdmissionType);

   app.post('/API/patient_management/PatientFibrinolyticChecklist_Create', Controller.PatientFibrinolyticChecklist_Create);
   app.post('/API/patient_management/PatientFibrinolyticChecklist_View', Controller.PatientFibrinolyticChecklist_View);
   app.post('/API/patient_management/PatientFibrinolyticChecklist_Update', Controller.PatientFibrinolyticChecklist_Update);
   app.post('/API/patient_management/PatientCheckList_Update', Controller.PatientCheckList_Update);
   app.post('/API/patient_management/PatientChecklist_Create', Controller.PatientChecklist_Create);


   app.post('/API/patient_management/PatientMedicationDuringTransportation_Create', Controller.PatientMedicationDuringTransportation_Create);
   app.post('/API/patient_management/PatientMedicationDuringTransportation_View', Controller.PatientMedicationDuringTransportation_View);
   app.post('/API/patient_management/PatientMedicationDuringTransportation_Update', Controller.PatientMedicationDuringTransportation_Update);


   app.post('/API/patient_management/PatientCardiacHistory_Create', Controller.PatientCardiacHistory_Create);
   app.post('/API/patient_management/PatientCardiacHistory_View', Controller.PatientCardiacHistory_View);
   app.post('/API/patient_management/PatientCardiacHistory_Update', Controller.PatientCardiacHistory_Update);


   app.post('/API/patient_management/PatientCoMorbidCondition_Create', Controller.PatientCoMorbidCondition_Create);
   app.post('/API/patient_management/PatientCoMorbidCondition_View', Controller.PatientCoMorbidCondition_View);
   app.post('/API/patient_management/PatientCoMorbidCondition_Update', Controller.PatientCoMorbidCondition_Update);


   app.post('/API/patient_management/PatientContactDetails_Create', Controller.PatientContactDetails_Create);
   app.post('/API/patient_management/PatientContactDetails_View', Controller.PatientContactDetails_View);
   app.post('/API/patient_management/PatientContactDetails_Update', Controller.PatientContactDetails_Update);


   app.post('/API/patient_management/ECG_Files', Controller.ECG_Files);
   app.post('/API/patient_management/Update_FollowUp_ECG', Controller.Update_FollowUp_ECG);
   app.post('/API/patient_management/Update_Ninety_Min_ECG', Controller.Update_Ninety_Min_ECG);


   // Notification List
   app.post('/API/patient_management/Notification_Counts', Controller.Notification_Counts);  
   app.post('/API/patient_management/Notifications_List', Controller.All_Notifications_List);
   app.post('/API/patient_management/Notifications_Viewed', Controller.Notifications_Viewed);
   app.post('/API/patient_management/Viewed_Notifications_Delete', Controller.Viewed_Notifications_Delete); 


   // Reports
   app.post('/API/patient_management/PatientData_Export', ReportController.AllPatientDetails_List);

	// Files
	app.post('/API/patient_management/LoadBasicPage_Files', Controller.LoadBasicPage_Files);
   
   // ECG Report Count & List of ECG Report
   app.post('/API/patient_management/DownloadECGReport_Pdf', Controller.AllpatientECG_Count);

   // DownloadECGReport_Pdf
   app.post('/API/patient_management/DownloadECGReport_Pdf', Controller.DownloadECGReport_Pdf);

};