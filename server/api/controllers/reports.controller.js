var PatientDetailsModel = require('../models/patient-management/patient_details.model');
// var moment = require('moment');
var momentTZ = require('moment-timezone');
var XLSX = require('xlsx');
var mongoose = require('mongoose');
var ReportFields = require('../../helpers/Report-Fiels');
var moment = momentTZ.tz.setDefault('Africa/Johannesburg');

// SA User All Patients
function CollectData(ReceivingData) {
   return new Promise((resolve, reject) => {
      var FindQuery = { 'Stemi_Confirmed': "Yes", 'If_Deleted': false };
      var LocationFilter = {};
      if (ReceivingData.Location !== undefined && ReceivingData.Location !== null) {
         LocationFilter = { 'FirstHospital.Hospital.Location': mongoose.Types.ObjectId(ReceivingData.Location._id) };
      }
      var SubFindQuery = {};
      if (ReceivingData.FromDate !== undefined && ReceivingData.ToDate !== undefined &&ReceivingData.FromDate !== null && ReceivingData.ToDate !== null) {
         SubFindQuery['$and'] = [
            {$or: [
               { $and: [{"FirstHospital.Hospital_Arrival_Date_Time": {$ne: null}}, {"FirstHospital.Hospital_Arrival_Date_Time": {$gte: new Date(ReceivingData.FromDate)} }] },
               { $and: [{"FirstHospital.Hospital_Arrival_Date_Time": null}, {"createdAt": {$gte: new Date(ReceivingData.FromDate)}} ] }
            ]},
            {$or: [
               { $and: [{"FirstHospital.Hospital_Arrival_Date_Time": {$ne: null}}, {"FirstHospital.Hospital_Arrival_Date_Time": {$lt: new Date(new Date(ReceivingData.ToDate).setDate(new Date(ReceivingData.ToDate).getDate() + 1 )) } }] },
               { $and: [{"FirstHospital.Hospital_Arrival_Date_Time": null}, {"createdAt": {$lte: new Date(new Date(ReceivingData.ToDate).setDate(new Date(ReceivingData.ToDate).getDate() + 1 )) }} ] }
            ]}
         ];
      } else if (ReceivingData.FromDate !== undefined && ReceivingData.FromDate !== null ) {
         SubFindQuery['$or'] = [
            { $and: [{"FirstHospital.Hospital_Arrival_Date_Time": {$ne: null}}, {"FirstHospital.Hospital_Arrival_Date_Time": {$gte: new Date(ReceivingData.FromDate)} }] },
            { $and: [{"FirstHospital.Hospital_Arrival_Date_Time": null}, {"createdAt": {$gte: new Date(ReceivingData.FromDate)}} ] }
         ];
      } else if ( ReceivingData.ToDate !== undefined && ReceivingData.ToDate !== null) {
         SubFindQuery['$or'] = [
            { $and: [{"FirstHospital.Hospital_Arrival_Date_Time": {$ne: null}}, {"FirstHospital.Hospital_Arrival_Date_Time": {$lt: new Date(new Date(ReceivingData.ToDate).setDate(new Date(ReceivingData.ToDate).getDate() + 1 )) } }] },
            { $and: [{"FirstHospital.Hospital_Arrival_Date_Time": null}, {"createdAt": {$lt: new Date(new Date(ReceivingData.ToDate).setDate(new Date(ReceivingData.ToDate).getDate() + 1 )) }} ] }
         ];
      }

      PatientDetailsModel.PatientBasicDetailsSchema
      .aggregate([
			{ $project: {
				QR_image: 0,
				ECG_File: 0,
				All_ECG_Files: 0,
				APP_ECG_Files: 0,
				Ninety_Min_ECG_Files: 0
				}
			},
         { $match: FindQuery },
      // Initiated Hospital
         { $lookup: {
            from: "Stemi_Hospital_Management",
            let: { "hospital": "$Initiated_Hospital"},
            pipeline: [
               { $match: { $expr: { $eq: ["$$hospital", "$_id"] } } },
               { $project: { "Hospital_Name": 1, "Hospital_Code": 1, "Hospital_Role": 1, "Connected_Clusters": 1 }}
            ],
            as: 'Initiated_Hospital' } },
         { $unwind: { path: "$Initiated_Hospital",  preserveNullAndEmptyArrays: true } },
      // First Hospital
         { $addFields: { FirstHospital: { $arrayElemAt: [ "$Hospital_History", 0 ] }  } },
         { $lookup: {
            from: "Stemi_Hospital_Management",
            let: { "hospital": "$FirstHospital.Hospital"},
            pipeline: [
               { $match: { $expr: { $eq: ["$$hospital", "$_id"] } } },
               { $project: { "Hospital_Name": 1, "Hospital_Code": 1, "Hospital_Role": 1, "Location": 1, "Connected_Clusters": 1 }}
            ],
            as: 'FirstHospital.Hospital' } },
         { $unwind: { path: "$FirstHospital.Hospital",  preserveNullAndEmptyArrays: true } },
         { $match: LocationFilter },
         { $match: SubFindQuery },
      // Location
         { $lookup: {
            from: "Stemi_Location",
            let: { "location": "$FirstHospital.Hospital.Location"},
            pipeline: [
               { $match: { $expr: { $eq: ["$$location", "$_id"] } } },
               { $project: { "Location_Name": 1, "Location_Code": 1}}
            ],
            as: 'Location' } },
         { $unwind: { path: "$Location",  preserveNullAndEmptyArrays: true } },
      // All Hospital Details
         { $addFields: { HospitalIds: { $map: { input: "$Hospital_History", as: "hospital", in: "$$hospital.Hospital" } } } },
         { $lookup: {
            from: "Stemi_Hospital_Management",
            let: { "hospitalIds": "$HospitalIds"},
            pipeline: [
               { $match: { $expr: { $in: ["$_id", "$$hospitalIds",] } } },
               { $project: { "Hospital_Name": 1, "Hospital_Code": 1, "Hospital_Role": 1, "Connected_Clusters": 1 }}
            ],
            as: 'HospitalDetails' } },
      // First Hospital Cluster Details
         { $lookup: {
            from: "Stemi_Cluster",
            let: { "clusters": "$FirstHospital.Hospital.Connected_Clusters"},
            pipeline: [
               { $match: { $expr: { $in: ["$_id", "$$clusters",] } } },
               { $project: { "Cluster_Name": 1, "Cluster_Code": 1, "Cluster_Type": 1, "Location": 1 }}
            ],
            as: 'FirstHospital.Hospital.Connected_Clusters' } },
         { $addFields: {
            FirstHospitalCluster: {
            $cond: {
               if: { $isArray: "$FirstHospital.Hospital.Connected_Clusters" },
               then: { $arrayElemAt: [ "$FirstHospital.Hospital.Connected_Clusters", 0 ] },
               else: null } } } },
         { $addFields: { FirstHospitalClinicalExamination: { $arrayElemAt: [ "$Clinical_Examination_History", 0 ] }  } },
      // First Hospital Transport Details
         { $addFields: { FirstHospitalTransport: { $arrayElemAt: [ "$Transport_History", 0 ] }  } },
		// NON Cluster Hospital
			{ $lookup: {
				from: "Referral_Facility",
            let: { "hospital": "$NonCluster_Hospital_Name"},
				pipeline: [
					{ $match: { $expr: { $eq: ["$$hospital", "$_id"] } } },
               { $project: { "Hospital_Name": 1, "Hospital_Code": 1, "Hospital_Role": 1, "Connected_Clusters": 1 }}
				],
				as: 'NonClusterHospital' } },
			{ $unwind: { path: "$NonClusterHospital",  preserveNullAndEmptyArrays: true } },
      // Fibrinolytic Checklist
         { $lookup: {
            from: "Patient_Fibrinolytic_Checklist",
            let: { "id": "$_id"},
            pipeline: [
               { $match: { $expr: { $eq: ["$$id", "$PatientId"] } } },
            ],
            as: 'FibrinolyticChecklist' } },
      // Patient Medication Transportation
         { $lookup: {
            from: "Patient_Medication_Transportation",
            let: { "id": "$_id"},
            pipeline: [
               { $match: { $expr: { $eq: ["$$id", "$PatientId"] } } },
            ],
            as: 'PatientMedicationTransportation' } },
         { $unwind: { path: "$PatientMedicationTransportation",  preserveNullAndEmptyArrays: true } },
      // Patient Cardiac History
         { $lookup: {
            from: "Patient_Cardiac_History",
            let: { "id": "$_id"},
            pipeline: [
               { $match: { $expr: { $eq: ["$$id", "$PatientId"] } } },
            ],
            as: 'PatientCardiacHistory' } },
         { $unwind: { path: "$PatientCardiacHistory",  preserveNullAndEmptyArrays: true } },
      // Patient CoMorbid Conditions 
         { $lookup: {
            from: "Patient_CoMorbid_Conditions",
            let: { "id": "$_id"},
            pipeline: [
               { $match: { $expr: { $eq: ["$$id", "$PatientId"] } } },
            ],
            as: 'PatientCoMorbidConditions' } },
         { $unwind: { path: "$PatientCoMorbidConditions",  preserveNullAndEmptyArrays: true } },
      // Patient Contact Details
         { $lookup: {
            from: "Patient_Contact_Details",
            let: { "id": "$_id"},
            pipeline: [
               { $match: { $expr: { $eq: ["$$id", "$PatientId"] } } },
            ],
            as: 'PatientContactDetails' } },
         { $unwind: { path: "$PatientContactDetails",  preserveNullAndEmptyArrays: true } },
      // Patient Thrombolysis Medication Details
         { $lookup: {
            from: "Thrombolysis-Medication-Thrombolysis",
            let: { "id": "$_id"},
            pipeline: [
               { $match: { $expr: { $eq: ["$$id", "$PatientId"] } } },
            ],
            as: 'ThrombolysisMedicationDetails' } },
         { $unwind: { path: "$ThrombolysisMedicationDetails",  preserveNullAndEmptyArrays: true } },
      // Patient Thrombolysis Details
         { $lookup: {
            from: "Thrombolysis",
            let: { "id": "$_id"},
            pipeline: [
               { $match: { $expr: { $eq: ["$$id", "$PatientId"] } } },
            ],
            as: 'ThrombolysisDetails' } },
         { $unwind: { path: "$ThrombolysisDetails",  preserveNullAndEmptyArrays: true } },
      // Patient Drug Before PCI Details
         { $lookup: {
            from: "PCI-Drug-Before-Pci",
            let: { "id": "$_id"},
            pipeline: [
               { $match: { $expr: { $eq: ["$$id", "$PatientId"] } } },
            ],
            as: 'DrugBeforePCIDetails' } },
         { $unwind: { path: "$DrugBeforePCIDetails",  preserveNullAndEmptyArrays: true } },
      // Patient PCI Details
         { $lookup: {
            from: "PCI-Pci",
            let: { "id": "$_id"},
            pipeline: [
               { $match: { $expr: { $eq: ["$$id", "$PatientId"] } } },
            ],
            as: 'PCIDetails' } },
         { $unwind: { path: "$PCIDetails",  preserveNullAndEmptyArrays: true } },
      // Patient PCI Medication in Cath Details
         { $lookup: {
            from: "PCI-Medication-In-Cath",
            let: { "id": "$_id"},
            pipeline: [
               { $match: { $expr: { $eq: ["$$id", "$PatientId"] } } },
            ],
            as: 'PCIMedicationInCathDetails' } },
         { $unwind: { path: "$PCIMedicationInCathDetails",  preserveNullAndEmptyArrays: true } },
      // Patient Hospital Summary Lab Report Details
         { $lookup: {
            from: "Hospital_Summary_Lab_Report",
            let: { "id": "$_id"},
            pipeline: [
               { $match: { $expr: { $eq: ["$$id", "$PatientId"] } } },
            ],
            as: 'HospitalSummaryLabReportDetails' } },
      // Patient Hospital Summary Medication Details
         { $lookup: {
            from: "Hospital_Summary_Medication_In_Hospital",
            let: { "id": "$_id"},
            pipeline: [
               { $match: { $expr: { $eq: ["$$id", "$PatientId"] } } },
            ],
            as: 'HospitalSummaryMedicationDetails' } },
      // Patient Hospital Summary Adverse Events Details
         { $lookup: {
            from: "Hospital_Summary_Adverse_Events",
            let: { "id": "$_id"},
            pipeline: [
               { $match: { $expr: { $eq: ["$$id", "$PatientId"] } } },
            ],
            as: 'HospitalSummaryAdverseEventsDetails' } },
      // Patient Discharge/Transfer Death Details
         { $lookup: {
            from: "Discharge_Transfer_Death",
            let: { "id": "$_id"},
            pipeline: [
               { $match: { $expr: { $eq: ["$$id", "$PatientId"] } } },
            ],
            as: 'DischargeTransferDeathDetails' } },
         { $unwind: { path: "$DischargeTransferDeathDetails",  preserveNullAndEmptyArrays: true } },
      // Patient Discharge/Transfer Medication Details
         { $lookup: {
            from: "Discharge_Transfer_Medications",
            let: { "id": "$_id"},
            pipeline: [
               { $match: { $expr: { $eq: ["$$id", "$PatientId"] } } },
            ],
            as: 'DischargeTransferMedicationDetails' } },
      // Patient Discharge/Transfer Details
         { $lookup: {
            from: "Discharge_Transfer",
            let: { "id": "$_id"},
            pipeline: [
               { $match: { $expr: { $eq: ["$$id", "$PatientId"] } } },
            ],
            as: 'DischargeTransferDetails' } },
      // Patient Follow Up Details
         { $lookup: {
            from: "FollowUp_Details",
            let: { "id": "$_id"},
            pipeline: [
               { $match: { $expr: { $eq: ["$$id", "$PatientId"] } } },
            ],
            as: 'FollowUpDetails' } },
      // Patient Follow Up Medication Details
         { $lookup: {
            from: "FollowUp_Medications",
            let: { "id": "$_id"},
            pipeline: [
               { $match: { $expr: { $eq: ["$$id", "$PatientId"] } } },
            ],
            as: 'FollowUpMedicationDetails' } },
      // Patient Follow Up Event Details
         { $lookup: {
            from: "FollowUp_Events",
            let: { "id": "$_id"},
            pipeline: [
               { $match: { $expr: { $eq: ["$$id", "$PatientId"] } } },
            ],
            as: 'FollowUpEventDetails' } },
      ]).exec((err, result) => {
         if (err) {
            reject(err);
            // res.status(417).send({ Status: false, Message: "Some error occurred while find the patients!.", Error: err });
         } else {
            var DataDumpArr = [];
            var MySQLDataArr = [];
            var MedicationArr = [];
            var TreatmentModalitiesArr = [];
            var VesselStentArr = [];
            var StentsArr = [];
            var MaceArr = [];
            var LocationOfInfarctionArr = [];
            var DrugBeforePCIMedicationArr = [];
				var RiskFactorArr = [];
            result.map(patient => {
					patient = JSON.parse(JSON.stringify(patient));
               // Replace Hospital Details to HospitalId in Hospital History
               patient.Hospital_History = patient.Hospital_History.map(hos => {
                  const Idx = patient.HospitalDetails.findIndex(HosDet => HosDet._id === hos.Hospital);
                  hos.Hospital = patient.HospitalDetails[Idx];
                  return hos;
               });
               // Replace Hospital Details to HospitalId in Transport History
               patient.Transport_History = patient.Transport_History.map(hos => {
                  const Idx = patient.HospitalDetails.findIndex(HosDet => HosDet._id === hos.Transport_To_Hospital);
                  hos.Transport_To_Hospital = patient.HospitalDetails[Idx];
                  return hos;
               });
               // Get First Hospital Location
               const Location = patient.Location !== null ? patient.Location.Location_Name : '';              
               // Get Date Of Registration
               const DateOfRegistration = patient.FirstHospital.Hospital_Arrival_Date_Time !== null ? moment(patient.FirstHospital.Hospital_Arrival_Date_Time).format("DD-MMM-YYYY") : moment(patient.createdAt).format("DD-MMM-YYYY");
               // Get Patient Admission Type
               const AdmissionType = patient.FirstHospital.Patient_Admission_Type !== '' ? patient.FirstHospital.Patient_Admission_Type : 'NA'; 
					// Get Date Of Registration Month And Year
                const MonthAndYear = moment(DateOfRegistration, 'DD-MMM-YYYY').format("MMM-YYYY");                            
               // Get Hospital Arrived DateTime
               const HospitalArrivedAt = patient.FirstHospital.Hospital_Arrival_Date_Time !== null ? moment(patient.FirstHospital.Hospital_Arrival_Date_Time).format("DD-MMM-YYYY HH:mm") : '';              
               // Get First Hospital Cluster Name
               const OriginCluster = patient.FirstHospitalCluster !== null ? patient.FirstHospitalCluster.Cluster_Name : '';
               // Get First Hospital Name
               const RegisteredHospital = patient.FirstHospital.Hospital !== null ? patient.FirstHospital.Hospital.Hospital_Name : '';
					// Get First Hospital Name
               const NonClusterHospital = patient.NonClusterHospital && patient.NonClusterHospital !== null ? patient.NonClusterHospital.Hospital_Name : '';
					// Get First Hospital Name
               const NonClusterHospitalArrival = patient.NonCluster_Hospital_Arrival_Date_Time !== null ? moment(patient.NonCluster_Hospital_Arrival_Date_Time).format("DD-MMM-YYYY HH:mm") : '';
               // Get Below the Poverty Line (Yes/No)
               const BelowThePovertyLine = (patient.Patient_Payment === 'State_BPL_Insurance' || patient.Patient_Payment === 'Pm_Jay') ? 'Yes' : patient.Patient_Payment !== '' ? 'No' : '';
               // Get Female Gender (Yes/No)
               const FemaleGender = patient.Patient_Gender === 'Female' ? 'Yes' : patient.Patient_Gender !== '' ? 'No' : 'NA';
					// Get Race
               const Race = patient.Race !== '' ? patient.Race === 'Others' ? patient.Race_Other : patient.Race : 'NA';
               // Get Medical Insurance
					const Insurance = patient.Patient_Payment !== '' ? patient.Patient_Payment : 'NA';
					// Get Medical Insurance
					const LocationOfInfarction = patient.Location_of_Infarction !== '' ? patient.Location_of_Infarction : 'NA';
					// Risk Factors
					const RiskFactorDiabetes = (patient.PatientCoMorbidConditions !== undefined && patient.PatientCoMorbidConditions !== '') ? patient.PatientCoMorbidConditions.Diabetes_Mellitus !== '' ? patient.PatientCoMorbidConditions.Diabetes_Mellitus : 'NA' : 'NA';
					const RiskFactorHypertension = (patient.PatientCoMorbidConditions !== undefined && patient.PatientCoMorbidConditions !== '') ? patient.PatientCoMorbidConditions.Hypertension !== '' ? patient.PatientCoMorbidConditions.Hypertension : 'NA' : 'NA';
					const RiskFactorSmoking = (patient.PatientCoMorbidConditions !== undefined && patient.PatientCoMorbidConditions !== '') ? patient.PatientCoMorbidConditions.Smoker !== '' ? patient.PatientCoMorbidConditions.Smoker : 'NA' : 'NA';
					const RiskFactorCholesterol = (patient.PatientCoMorbidConditions !== undefined && patient.PatientCoMorbidConditions !== '') ? patient.PatientCoMorbidConditions.High_Cholesterol !== '' ? patient.PatientCoMorbidConditions.High_Cholesterol : 'NA' : 'NA';
					const RiskFactorFamilyHistory = (patient.PatientCoMorbidConditions !== undefined && patient.PatientCoMorbidConditions !== '') ? patient.PatientCoMorbidConditions.Family_history_of_IHD !== '' ? patient.PatientCoMorbidConditions.Family_history_of_IHD : 'NA' : 'NA';
					// Get Prior Diabetes (Yes/No)
               const PriorDiabetes = (patient.PatientCoMorbidConditions !== undefined && patient.PatientCoMorbidConditions !== '') ? patient.PatientCoMorbidConditions.Diabetes_Mellitus : '';
               // Get Prior HTN (Yes/No)
               const PriorHTN = (patient.PatientCoMorbidConditions !== undefined && patient.PatientCoMorbidConditions !== '') ? patient.PatientCoMorbidConditions.Hypertension : '';
					// Get High Cholesterol (Yes/No)
					const HighCholesterol = (patient.PatientCoMorbidConditions !== undefined && patient.PatientCoMorbidConditions !== '') ? patient.PatientCoMorbidConditions.High_Cholesterol : '';
               // Get Prior Dyslipidemia (Yes/No)
               const PriorDyslipidemia = (patient.PatientCoMorbidConditions !== undefined && patient.PatientCoMorbidConditions !== '') ? patient.PatientCoMorbidConditions.Dyslipidemia : '';
               // Get Active Smoking (Yes/No)
               const ActiveSmoking = (patient.PatientCoMorbidConditions !== undefined && patient.PatientCoMorbidConditions !== '') ? patient.PatientCoMorbidConditions.Smoker === 'Current_Smoker' ? 'yes' : patient.PatientCoMorbidConditions.Smoker !== '' ? 'No' : '' : '';
               // Get Prior PCI (Yes/No)
               const PriorPCI = (patient.PatientCardiacHistory !== undefined && patient.PatientCardiacHistory !== '') ? (patient.PatientCardiacHistory.PCI1 === 'Yes' || patient.PatientCardiacHistory.PCI2 === 'Yes') ? 'Yes' : (patient.PatientCardiacHistory.PCI1 === 'No' || patient.PatientCardiacHistory.PCI2 === 'No') ? 'No' : '' : '';
               // Get Prior CABG (Yes/No)
               const PriorCABG = (patient.PatientCardiacHistory !== undefined && patient.PatientCardiacHistory !== '') ? patient.PatientCardiacHistory.CABG : '';
               // Get Location Of Infarct (Count)
               // let LocationOfInfarct = 0;
					// if (patient.Location_of_Infarction && patient.Location_of_Infarction.length > 0) {
					// 	Object.keys(patient.Location_of_Infarction[0]).map(key => {
					// 		if (patient.Location_of_Infarction[0][key] === true) {
					// 			LocationOfInfarct = LocationOfInfarct + 1;
					// 		}
					// 	});
					// }
               // LocationOfInfarct = LocationOfInfarct > 0 ? LocationOfInfarct : '';
               // Get Radial Access Site (Yes/No)
               const RadialAccessSite = (patient.PCIDetails !== undefined && patient.PCIDetails !== '') ? patient.PCIDetails.Pci_Catheter_Access === 'Radial' ? 'Yes' : patient.PCIDetails.Pci_Catheter_Access === 'Femoral' ? 'No' : '' : '';
               // First Hospital Transport Mode
               const AmbulanceTransport = (patient.FirstHospitalTransport.TransportMode !== undefined && patient.FirstHospitalTransport.TransportMode !== null && patient.FirstHospitalTransport.TransportMode !== '') ?
                                             patient.FirstHospitalTransport.TransportMode === 'Cluster_Ambulance' ? 'CLUSTER AMBULANCE' :
                                             patient.FirstHospitalTransport.TransportMode === 'Govt_ambulance' ? 'GOVERNMENT AMBULANCE' :
                                             patient.FirstHospitalTransport.TransportMode === 'Private_ambulance' ? 'PRIVATE AMBULANCE' :
                                             patient.FirstHospitalTransport.TransportMode === 'Helicopter' ? 'HELICOPTER' :
                                             patient.FirstHospitalTransport.TransportMode === 'Fixed_wing' ? 'FIXED WING' :
                                             patient.FirstHospitalTransport.TransportMode === 'Private' ? 'PRIVATE' :
                                             patient.FirstHospitalTransport.TransportMode === 'Public' ? 'PUBLIC' :
                                             patient.FirstHospitalTransport.TransportMode === 'Others' ? 'OTHERS' : '' : '';              
               // Get Date of Symptom Onset
               const DateOfSymptomOnset = patient.Symptom_Onset_Date_Time !== null ? moment(patient.Symptom_Onset_Date_Time).format("DD-MMM-YYYY") : '';              
               // Get Time of Symptom Onset
               const TimeOfSymptomOnset = patient.Symptom_Onset_Date_Time !== null ? moment(patient.Symptom_Onset_Date_Time).format("HH:mm") : '';              
               // Get Date of First Medical Contact
               const DateOfFirstMedicalContact =  patient.First_Medical_Contact_Date_Time !== null ? moment(patient.First_Medical_Contact_Date_Time).format("DD-MMM-YYYY") : '';              
               // Get Time of First Medical Contact
               const TimeOfFirstMedicalContact = patient.First_Medical_Contact_Date_Time !== null ? moment(patient.First_Medical_Contact_Date_Time).format("HH:mm") : '';              
               // Get Symptom Onset To First Medical Contact (Minutes)
               const DateTimeOfFirstMedicalContact = patient.FirstHospital.First_Medical_Contact_Date_Time !== null ? patient.First_Medical_Contact_Date_Time : '';
               const DateTimeOfSymptomOnset = patient.Symptom_Onset_Date_Time !== null ? patient.Symptom_Onset_Date_Time : '';
               const SymptomOnsetToFirstMedicalContact = (DateTimeOfSymptomOnset !== '' && DateTimeOfFirstMedicalContact !== '') ? moment.duration(moment(DateTimeOfFirstMedicalContact).diff(moment(DateTimeOfSymptomOnset))).asMinutes() : '';
               // Get Date of ECG Taken
               const DateOfFirstECGWithSTEMI = patient.ECG_Taken_date_time !== null ? moment(patient.ECG_Taken_date_time).format("DD-MMM-YYYY") : '';
               // Get Time of ECG Taken
               const TimeOfFirstECGWithSTEMI = patient.ECG_Taken_date_time !== null ? moment(patient.ECG_Taken_date_time).format("HH:mm") : '';
               // First Asked DateTime 
               const FirstAskedDateTime = patient.FirstAskTime !== undefined && patient.FirstAskTime !== null ? moment(patient.FirstAskTime).format("DD-MMM-YYYY HH:mm") : '';
               // First Replied DateTime 
               const FirstRepliedDateTime = patient.FirstRepailedTime !== undefined && patient.FirstRepailedTime !== null ? moment(patient.FirstRepailedTime).format("DD-MMM-YYYY HH:mm") : '';
               // Get First Medical Contact To ECG Taken (Minutes)
               const DateTimeOfFirstMedicalContact_1 = patient.First_Medical_Contact_Date_Time !== null ? patient.First_Medical_Contact_Date_Time : '';
               const DateTimeOfECGTaken = patient.ECG_Taken_date_time !== null ? patient.ECG_Taken_date_time : '';
               const FirstMedicalContactToECG = (DateTimeOfECGTaken !== '' && DateTimeOfFirstMedicalContact !== '') ? moment.duration(moment(DateTimeOfECGTaken).diff(moment(DateTimeOfFirstMedicalContact_1))).asMinutes() : '';
               // Get Date of First STEMI Network Hospital
               const DateOfFirstSTEMINetworkHospital = patient.FirstHospital.Hospital_Arrival_Date_Time !== null ? moment(patient.FirstHospital.Hospital_Arrival_Date_Time).format("DD-MMM-YYYY") : '';              
               // Get Time of First STEMI Network Hospital
               const TimeOfFirstSTEMINetworkHospital = patient.FirstHospital.Hospital_Arrival_Date_Time !== null ? moment(patient.FirstHospital.Hospital_Arrival_Date_Time).format("HH:mm") : '';              
               // Get Date and Time Of AB(H1, H2) Hospital Arrival
               const FirstHubHospitals = patient.Hospital_History.filter(hos => hos.Hospital.Hospital_Role === 'Hub H1' ||  hos.Hospital.Hospital_Role === 'Hub H2');
               const DateOfABHospitalArrival = (FirstHubHospitals.length > 0 && FirstHubHospitals[0].Hospital_Arrival_Date_Time !== null) ? moment(FirstHubHospitals[0].Hospital_Arrival_Date_Time).format("DD-MMM-YYYY") : '';              
               const TimeOfABHospitalArrival = (FirstHubHospitals.length > 0 && FirstHubHospitals[0].Hospital_Arrival_Date_Time !== null) ? moment(FirstHubHospitals[0].Hospital_Arrival_Date_Time).format("HH:mm") : '';              
               // Get Transfer Time
               const FirstHubHospitals_1 = patient.Hospital_History.filter(hos => hos.Hospital.Hospital_Role === 'Hub H1' ||  hos.Hospital.Hospital_Role === 'Hub H2');
               const FirstHubHospitalArrival = (FirstHubHospitals_1.length > 0 && FirstHubHospitals_1[0].Hospital_Arrival_Date_Time !== null) ? FirstHubHospitals_1[0].Hospital_Arrival_Date_Time : '';
               const ECGDateTime = patient.ECG_Taken_date_time !== null ? patient.ECG_Taken_date_time : '';
               const TransferTimeDiff = (FirstHubHospitalArrival !== '' && ECGDateTime !== '') ? moment.duration(moment(FirstHubHospitalArrival).diff(moment(ECGDateTime))).asMinutes() : '';
               const TransferTime =  (TransferTimeDiff !== '' && ECGDateTime < 0) ? 0 : TransferTimeDiff;
               // Get External Lysis(post Thrombolysis) (Yes/No)
               const ExternalLysis = patient.Post_Thrombolysis !== null ? patient.Post_Thrombolysis : '';
               // Get Start Date of Lytic Therapy
               const StartDateOfLyticTherapy = patient.Post_Thrombolysis !== null ? (patient.Post_Thrombolysis === 'Yes' && patient.Post_Thrombolysis_Data.Post_Thrombolysis_Start_Date_Time !== null) ? moment(patient.Post_Thrombolysis_Data.Post_Thrombolysis_Start_Date_Time).format("DD-MMM-YYYY") : '' :
                                                (patient.ThrombolysisDetails !== undefined && patient.ThrombolysisDetails !== '' && patient.ThrombolysisDetails.Thrombolysis === 'Yes' && patient.ThrombolysisDetails.Thrombolysis_Agent_Dosage_Start_Date_time !== null) ? moment(patient.ThrombolysisDetails.Thrombolysis_Agent_Dosage_Start_Date_time).format("DD-MMM-YYYY") : '';
               // Get Start Date of Lytic Therapy
               const StartTimeOfLyticTherapy = patient.Post_Thrombolysis !== null ? (patient.Post_Thrombolysis === 'Yes' && patient.Post_Thrombolysis_Data.Post_Thrombolysis_Start_Date_Time !== null) ? moment(patient.Post_Thrombolysis_Data.Post_Thrombolysis_Start_Date_Time).format("HH:mm") : '' :
                                                (patient.ThrombolysisDetails !== undefined && patient.ThrombolysisDetails !== '' && patient.ThrombolysisDetails.Thrombolysis === 'Yes' && patient.ThrombolysisDetails.Thrombolysis_Agent_Dosage_Start_Date_time !== null) ? moment(patient.ThrombolysisDetails.Thrombolysis_Agent_Dosage_Start_Date_time).format("HH:mm") : '';
               // Get Completion Date of Lytic Therapy
               const CompletionDateOfLyticTherapy = patient.Post_Thrombolysis !== null ? (patient.Post_Thrombolysis === 'Yes' && patient.Post_Thrombolysis_Data.Post_Thrombolysis_End_Date_Time !== null) ? moment(patient.Post_Thrombolysis_Data.Post_Thrombolysis_End_Date_Time).format("DD-MMM-YYYY") : '' :
                                                (patient.ThrombolysisDetails !== undefined && patient.ThrombolysisDetails !== '' && patient.ThrombolysisDetails.Thrombolysis === 'Yes' && patient.ThrombolysisDetails.Thrombolysis_Agent_Dosage_End_Date_time !== null) ? moment(patient.ThrombolysisDetails.Thrombolysis_Agent_Dosage_End_Date_time).format("DD-MMM-YYYY") : '';
               // Get Completion Time of Lytic Therapy
               const CompletionTimeOfLyticTherapy = patient.Post_Thrombolysis !== null ? (patient.Post_Thrombolysis === 'Yes' && patient.Post_Thrombolysis_Data.Post_Thrombolysis_End_Date_Time !== null) ? moment(patient.Post_Thrombolysis_Data.Post_Thrombolysis_End_Date_Time).format("HH:mm") : '' :
                                                (patient.ThrombolysisDetails !== undefined && patient.ThrombolysisDetails !== '' && patient.ThrombolysisDetails.Thrombolysis === 'Yes' && patient.ThrombolysisDetails.Thrombolysis_Agent_Dosage_End_Date_time !== null) ? moment(patient.ThrombolysisDetails.Thrombolysis_Agent_Dosage_End_Date_time).format("HH:mm") : '';
               // Get ECG To Thrombolysis (Minutes)
               const ThrombolysisStartDateTime = patient.Post_Thrombolysis !== null ? (patient.Post_Thrombolysis === 'Yes' && patient.Post_Thrombolysis_Data.Post_Thrombolysis_Start_Date_Time !== null) ? patient.Post_Thrombolysis_Data.Post_Thrombolysis_Start_Date_Time : '' :
                                             (patient.ThrombolysisDetails !== undefined && patient.ThrombolysisDetails !== '' && patient.ThrombolysisDetails.Thrombolysis === 'Yes' && patient.ThrombolysisDetails.Thrombolysis_Agent_Dosage_Start_Date_time !== null) ? patient.ThrombolysisDetails.Thrombolysis_Agent_Dosage_Start_Date_time : '';
               const DateTimeOfECGTaken_1 = patient.ECG_Taken_date_time !== null ? patient.ECG_Taken_date_time : '';
               const ECGToThrombolysis = (DateTimeOfECGTaken_1 !== '' && ThrombolysisStartDateTime !== '') ? moment.duration(moment(ThrombolysisStartDateTime).diff(moment(DateTimeOfECGTaken_1))).asMinutes() : '';
               // Get Date Of Coronary Angiography Start
               const DateOfCoronaryAngiographyStart = (patient.PCIDetails !== undefined && patient.PCIDetails !== '' && patient.PCIDetails.PCI === 'Yes' && patient.PCIDetails.Pci_Cart_Start_Date_Time !== null ) ? moment(patient.PCIDetails.Pci_Cart_Start_Date_Time).format("DD-MMM-YYYY") : '';
               // Get Time Of Coronary Angiography Start
               const TimeOfCoronaryAngiographyStart = (patient.PCIDetails !== undefined && patient.PCIDetails !== '' && patient.PCIDetails.PCI === 'Yes' && patient.PCIDetails.Pci_Cart_Start_Date_Time !== null ) ? moment(patient.PCIDetails.Pci_Cart_Start_Date_Time).format("HH:mm") : '';
               // Get Date and Time of PCI First Balloon/Stent Deployment
               const StentDeploymentDateArr = [];
               if (patient.PCIDetails !== undefined && patient.PCIDetails !== '' && patient.PCIDetails.PCI === 'Yes' && ( patient.PCIDetails.CulpritVesselArray.length > 0 || patient.PCIDetails.VesselArray > 0) ) {
                  patient.PCIDetails.CulpritVesselArray.map(Stent => {
                     if (Stent.PCI_Intervention_Stenting_Date_Time !== null) {
                        StentDeploymentDateArr.push( moment(Stent.PCI_Intervention_Stenting_Date_Time));
                     }
                  });
                  patient.PCIDetails.VesselArray.map(Stent => {
                     if (Stent.PCI_Intervention_Vessel_Stenting_Date_Time !== null) {
                        StentDeploymentDateArr.push(moment(Stent.PCI_Intervention_Vessel_Stenting_Date_Time));
                     }
                  });
               }
               const DateOfPCIFirstStentDeployment = StentDeploymentDateArr.length > 0 ? moment.min(StentDeploymentDateArr).format("DD-MMM-YYYY") : '';
               const TimeOfPCIFirstStentDeployment = StentDeploymentDateArr.length > 0 ? moment.min(StentDeploymentDateArr).format("HH:mm") : '';
               // Get HospitalArrival To Thrombolysis (Minutes)
               const ThrombolysisStartDateTime_1 =  patient.Post_Thrombolysis !== null ? (patient.Post_Thrombolysis === 'Yes' && patient.Post_Thrombolysis_Data.Post_Thrombolysis_Start_Date_Time !== null) ? patient.Post_Thrombolysis_Data.Post_Thrombolysis_Start_Date_Time : '' :
                                                   (patient.ThrombolysisDetails !== undefined && patient.ThrombolysisDetails !== '' && patient.ThrombolysisDetails.Thrombolysis === 'Yes' && patient.ThrombolysisDetails.Thrombolysis_Agent_Dosage_Start_Date_time !== null) ? patient.ThrombolysisDetails.Thrombolysis_Agent_Dosage_Start_Date_time : '';
               const DateTimeOfFirstHospitalArrival = patient.First_Medical_Contact_Date_Time !== null ? patient.First_Medical_Contact_Date_Time : '';              
               const DoorToNeedleTime = (DateTimeOfFirstHospitalArrival !== '' && ThrombolysisStartDateTime_1 !== '') ? moment.duration(moment(ThrombolysisStartDateTime_1).diff(moment(DateTimeOfFirstHospitalArrival))).asMinutes() : '';
               // Get HospitalArrival To Balloon/Stenting (Minutes)
               const BalloonStentingMinDateTime = StentDeploymentDateArr.length > 0 ? moment.min(StentDeploymentDateArr) : '';
               const DateTimeOfFirstHospitalArrival_1 = patient.First_Medical_Contact_Date_Time !== null ? patient.First_Medical_Contact_Date_Time : '';
               const DoorToBalloonTime = (DateTimeOfFirstHospitalArrival_1 !== '' && BalloonStentingMinDateTime !== '') ? moment.duration(BalloonStentingMinDateTime.diff(moment(DateTimeOfFirstHospitalArrival_1))).asMinutes() : '';
               // Get patients getting any reperfusion (no lytic or PCI = N), total ischemic time
               const DateTimeOfFirstMedicalContact_2 = patient.First_Medical_Contact_Date_Time !== null ? patient.First_Medical_Contact_Date_Time : '';
               const DateTimeOfSymptomOnset_1 = patient.Symptom_Onset_Date_Time !== null ? patient.Symptom_Onset_Date_Time : '';
               const DateTimeOfECGTaken_2 = patient.ECG_Taken_date_time !== null ? patient.ECG_Taken_date_time : '';
               const LyticStartDateTime = patient.Post_Thrombolysis !== null ? (patient.Post_Thrombolysis === 'Yes' && patient.Post_Thrombolysis_Data.Post_Thrombolysis_Start_Date_Time !== null) ? patient.Post_Thrombolysis_Data.Post_Thrombolysis_Start_Date_Time : '' :
                                          (patient.ThrombolysisDetails !== undefined && patient.ThrombolysisDetails !== '' && patient.ThrombolysisDetails.Thrombolysis === 'Yes' && patient.ThrombolysisDetails.Thrombolysis_Agent_Dosage_Start_Date_time !== null) ? patient.ThrombolysisDetails.Thrombolysis_Agent_Dosage_Start_Date_time : '';
               const DateTimeOfFirstHospitalArrival_2 = patient.First_Medical_Contact_Date_Time !== null ? patient.First_Medical_Contact_Date_Time : '';
               const BalloonStentingMinDateTime_0 = StentDeploymentDateArr.length > 0 ? moment.min(StentDeploymentDateArr) : '';
               const SymptomOnsetToFirstMedicalContact_1 = (DateTimeOfSymptomOnset_1 !== '' && DateTimeOfFirstMedicalContact_2 !== '') ? moment.duration(moment(DateTimeOfFirstMedicalContact_2).diff(moment(DateTimeOfSymptomOnset_1))).asMinutes() : '';
               const FirstMedicalContactToECG_1 = (DateTimeOfECGTaken_2 !== '' && DateTimeOfFirstMedicalContact_2 !== '') ? moment.duration(moment(DateTimeOfECGTaken_2).diff(moment(DateTimeOfFirstMedicalContact_2))).asMinutes() : '';
               const ECGToThrombolysis_1 = (DateTimeOfECGTaken_2 !== '' && LyticStartDateTime !== '') ? moment.duration(moment(LyticStartDateTime).diff(moment(DateTimeOfECGTaken_2))).asMinutes() : '';
               const DoorToBalloonTime_1 = (DateTimeOfFirstHospitalArrival_2 !== '' && BalloonStentingMinDateTime_0 !== '') ? moment.duration(BalloonStentingMinDateTime_0.diff(moment(DateTimeOfFirstHospitalArrival_2))).asMinutes() : '';
               const IfLytic = patient.Post_Thrombolysis !== null ? patient.Post_Thrombolysis : (patient.ThrombolysisDetails !== undefined && patient.ThrombolysisDetails !== '' ) ?  patient.ThrombolysisDetails.Thrombolysis : '';
               const IfPCI = (patient.PCIDetails !== undefined && patient.PCIDetails !== '') ?  patient.PCIDetails.PCI : '';
               let TotalIschemicTime = '';
               if (IfLytic === 'Yes') {
                  TotalIschemicTime = (SymptomOnsetToFirstMedicalContact_1 !== '' &&  FirstMedicalContactToECG_1 !== '' && ECGToThrombolysis_1 !== '') ? SymptomOnsetToFirstMedicalContact_1 + FirstMedicalContactToECG_1 + ECGToThrombolysis_1 : '';
               } else if (IfPCI === 'Yes') {
                  TotalIschemicTime = (SymptomOnsetToFirstMedicalContact_1 !== '' &&  FirstMedicalContactToECG_1 !== '' && TransferTime !== '' && DoorToBalloonTime_1 !== '') ? SymptomOnsetToFirstMedicalContact_1 + FirstMedicalContactToECG_1 + TransferTime + DoorToBalloonTime_1 : '';
               }
					let CulpritVesselData = '';
               if (patient.PCIDetails !== undefined && patient.PCIDetails !== '') {
                  if (patient.PCIDetails.CulpritVesselArray !== undefined && patient.PCIDetails.CulpritVesselArray !== '' && patient.PCIDetails.CulpritVesselArray.length > 0 ) {
                     const CVValue = patient.PCIDetails.CulpritVesselArray[0].Pci_Culprit_Vessel;
                     if (CVValue !== undefined && CVValue !== null && CVValue !== '') {
                        CulpritVesselData =  CVValue; 
                     }
                  }
               }
               // Get ECG To PCI (Minutes)
               const BalloonStentingMinDateTime_1 = StentDeploymentDateArr.length > 0 ? moment.min(StentDeploymentDateArr) : '';
               const DateTimeOfECGTaken_3 = patient.ECG_Taken_date_time !== null ? patient.ECG_Taken_date_time : '';
               const ECGToPCI = (DateTimeOfECGTaken_3 !== '' && BalloonStentingMinDateTime_1 !== '') ? moment.duration(BalloonStentingMinDateTime_1.diff(moment(DateTimeOfECGTaken_3))).asMinutes() : '';
               // Get Thrombolysis To Angiography (Minutes)
               const ThrombolysisStartDateTime_2 =  patient.Post_Thrombolysis !== null ? (patient.Post_Thrombolysis === 'Yes' && patient.Post_Thrombolysis_Data.Post_Thrombolysis_Start_Date_Time !== null) ? patient.Post_Thrombolysis_Data.Post_Thrombolysis_Start_Date_Time : '' :
                                                   (patient.ThrombolysisDetails !== undefined && patient.ThrombolysisDetails !== '' && patient.ThrombolysisDetails.Thrombolysis === 'Yes' && patient.ThrombolysisDetails.Thrombolysis_Agent_Dosage_Start_Date_time !== null) ? patient.ThrombolysisDetails.Thrombolysis_Agent_Dosage_Start_Date_time : '';
               const AngiographyStart = (patient.PCIDetails !== undefined && patient.PCIDetails !== '' && patient.PCIDetails.PCI === 'Yes' && patient.PCIDetails.Pci_Cart_Start_Date_Time !== null ) ? patient.PCIDetails.Pci_Cart_Start_Date_Time : '';
               const ThrombolysisToAngio = (AngiographyStart !== '' && ThrombolysisStartDateTime_2 !== '') ? moment.duration(moment(AngiographyStart).diff(moment(ThrombolysisStartDateTime_2))).asMinutes() : '';
               // Get Thrombolysis to Angio less than 24Hrs
               const ThrombolysisToAngioLessThan24Hrs = ThrombolysisToAngio !== '' ? ThrombolysisToAngio < 1440 ? 'Yes' : 'No' : '';
               // Get Thrombolysis To PCI (Minutes)
               const ThrombolysisStartDateTime_3 =  patient.Post_Thrombolysis !== null ? (patient.Post_Thrombolysis === 'Yes' && patient.Post_Thrombolysis_Data.Post_Thrombolysis_Start_Date_Time !== null) ? patient.Post_Thrombolysis_Data.Post_Thrombolysis_Start_Date_Time : '' :
                                                   (patient.ThrombolysisDetails !== undefined && patient.ThrombolysisDetails !== '' && patient.ThrombolysisDetails.Thrombolysis === 'Yes' && patient.ThrombolysisDetails.Thrombolysis_Agent_Dosage_Start_Date_time !== null) ? patient.ThrombolysisDetails.Thrombolysis_Agent_Dosage_Start_Date_time : '';
               const BalloonStentingMinDateTime_2 = StentDeploymentDateArr.length > 0 ? moment.min(StentDeploymentDateArr) : '';
               const ThrombolysisToPCI = (BalloonStentingMinDateTime_2 !== '' && ThrombolysisStartDateTime_3 !== '') ? moment.duration(BalloonStentingMinDateTime_2.diff(moment(ThrombolysisStartDateTime_3))).asMinutes() : '';
               // Get Thrombolysis to PCI less than 24Hrs
               const ThrombolysisToPCILessThan24Hrs = ThrombolysisToPCI !== '' ? ThrombolysisToPCI < 1440 ? 'Yes' : 'No' : '';
               // Get Date Of Discharge
               let DateOfDischarge = '';
               if (typeof patient.DischargeTransferDetails === 'object' && patient.DischargeTransferDetails.length !== undefined && patient.DischargeTransferDetails.length > 0) {
                  if (patient.DischargeTransferDetails[0].Discharge_Transfer_from_Hospital_Date_Time !== null ) {
                     DateOfDischarge = moment(patient.DischargeTransferDetails[0].Discharge_Transfer_from_Hospital_Date_Time).format("DD-MMM-YYYY");
                  }
               }
					// Get Missed STEMI
					const MissedSTEMI =  patient.Post_Thrombolysis !== null ? (patient.Post_Thrombolysis === 'No' && patient.Post_Thrombolysis_Data.MissedSTEMI !== null) ? patient.Post_Thrombolysis_Data.MissedSTEMI : '' :
											(patient.ThrombolysisDetails !== undefined && patient.ThrombolysisDetails !== '' && patient.ThrombolysisDetails.Thrombolysis === 'No' && patient.ThrombolysisDetails.Thrombolysis_MissedSTEMI !== null) ? patient.ThrombolysisDetails.Thrombolysis_MissedSTEMI : '';
					// Autoreperfused
					const Autoreperfused =  patient.Post_Thrombolysis !== null ? (patient.Post_Thrombolysis === 'Yes' && patient.Post_Thrombolysis_Data.Autoreperfused !== null) ? patient.Post_Thrombolysis_Data.Autoreperfused : '' :
											(patient.ThrombolysisDetails !== undefined && patient.ThrombolysisDetails !== '' && patient.ThrombolysisDetails.Thrombolysis === 'No' && patient.ThrombolysisDetails.Thrombolysis_Autoreperfused !== null) ? patient.ThrombolysisDetails.Thrombolysis_Autoreperfused : '';
               // Get Successful Lysis 
               const Successful_Lysis = (patient.PCIDetails !== undefined && patient.PCIDetails !== '' && patient.PCIDetails.PCI === 'Yes') ? patient.PCIDetails.PCI_No_Successful_lysis : '';
               // Get No Lytic or PCI
               const ThrombolysisYesOrNo = patient.Post_Thrombolysis !== null ? patient.Post_Thrombolysis : (patient.ThrombolysisDetails !== undefined && patient.ThrombolysisDetails !== '' ) ?  patient.ThrombolysisDetails.Thrombolysis : '';
               const PCIYesOrNo = (patient.PCIDetails !== undefined && patient.PCIDetails !== '') ?  patient.PCIDetails.PCI : '';
               const NoLyticOrPCI = (ThrombolysisYesOrNo !== 'Yes' && PCIYesOrNo !== 'Yes') ? 'Yes' : 'No';
               // Get Lytic
               const Lytic = patient.Post_Thrombolysis !== null ? patient.Post_Thrombolysis : (patient.ThrombolysisDetails !== undefined && patient.ThrombolysisDetails !== '' ) ?  patient.ThrombolysisDetails.Thrombolysis : '';
               // Get Lytic Agent
               const ThrombolyticAgent = (patient.Post_Thrombolysis !== null && patient.Post_Thrombolysis === 'Yes' && patient.Post_Thrombolysis_Data.Thrombolytic_Agent !== undefined) ? patient.Post_Thrombolysis_Data.Thrombolytic_Agent :
                                    (patient.ThrombolysisDetails !== undefined && patient.ThrombolysisDetails !== '' && patient.ThrombolysisDetails.Thrombolysis === 'Yes') ? patient.ThrombolysisDetails.Thrombolysis_Agent_Select_any_one : '';
               const LyticAgent = ThrombolyticAgent !== '' ? ThrombolyticAgent === 'Streptokinase' ? 1 : ThrombolyticAgent === 'Reteplase' ? 2 : ThrombolyticAgent === 'Tenecteplase' ? 3 : '' : '';
               // Get Coronary Angiography
               const CoronaryAngiography = (patient.PCIDetails !== undefined && patient.PCIDetails !== '' ) ?  patient.PCIDetails.PCI : '';
               // Get PCI
               const PCI = (patient.PCIDetails !== undefined && patient.PCIDetails !== '' && patient.PCIDetails.PCI === 'Yes') ?  patient.PCIDetails.PCI_Management_PCI : '';
					 // Get Failed PCI
					const FailedPCI = (patient.PCIDetails !== undefined && patient.PCIDetails !== '' && patient.PCIDetails.Failed_PCI === 'Yes') ?  patient.PCIDetails.Failed_PCI : '';
					// Get Additional Revascularization Needed
               const AdditionalRevascularizationNeeded = (patient.PCIDetails !== undefined && patient.PCIDetails !== '' && patient.PCIDetails.PCI_Intervention_Additional_revascularization === 'Yes') ?  patient.PCIDetails.PCI_Intervention_Additional_revascularization : '';
					// Get type of PCI
					const TypeOfPCI = (patient.PCIDetails !== undefined && patient.PCIDetails !== '' ) ?  (patient.PCIDetails.PCI_Options ? patient.PCIDetails.PCI_Options.replace(/_/g, ' ') : '' ) : '';
               // Get First Hospital Code
               const SiteOf1stMedicalContact = patient.FirstHospital.Hospital !== null ? (patient.FirstHospital.Hospital.Hospital_Role !== null && patient.FirstHospital.Hospital.Hospital_Role !== '' ) ? patient.FirstHospital.Hospital.Hospital_Role === 'EMS' ? 'E' : patient.FirstHospital.Hospital.Hospital_Role.slice(-2) : '' : '';
               // Get H1/H2 Hospital (Yes/No)
               const HubHospitals = patient.Hospital_History.filter(hos => hos.Hospital.Hospital_Role === 'Hub H1' ||  hos.Hospital.Hospital_Role === 'Hub H2');
               const ABHospital = HubHospitals.length > 0 ? 'Yes' : 'No';
               // Get S1/S2 Hospital (Yes/No)
               const SpokeHospitals = patient.Hospital_History.filter(hos => hos.Hospital.Hospital_Role === 'Spoke S1' ||  hos.Hospital.Hospital_Role === 'Spoke S2');
               const CDHospital = HubHospitals.length > 0 ? 'Yes' : 'No';
               // Get A Hospital (Yes/No)
               const A_HealthCareUnit = SiteOf1stMedicalContact === 'H1' ? 'Yes' : 'No';
               // Get B Hospital (Yes/No)
               const B_HealthCareUnit = SiteOf1stMedicalContact === 'H2' ? 'Yes' : 'No';
               // Get C Hospital (Yes/No)
               const C_HealthCareUnit = SiteOf1stMedicalContact === 'S2' ? 'Yes' : 'No';
               // Get D Hospital (Yes/No)
               const D_HealthCareUnit = SiteOf1stMedicalContact === 'S1' ? 'Yes' : 'No';
               // Get E Hospital (Yes/No)
               const E_HealthCareUnit = SiteOf1stMedicalContact === 'E' ? 'Yes' : 'No';
               // First Register
               const RegisterFrom =  A_HealthCareUnit === 'Yes' || B_HealthCareUnit === 'Yes' ? 'Hub' : C_HealthCareUnit === 'Yes' ||  D_HealthCareUnit === 'Yes' ? 'Spoke' : 'EMS';
               // Transferred from spoke to hub
               const SpokeToHub = CDHospital === 'Yes' && ABHospital === 'Yes' ? 'Yes' : 'No';
               // Get Admission Aspirin (Yes/No)
               const TransportationMedicationAspirin = (patient.PatientMedicationTransportation !== undefined && patient.PatientMedicationTransportation !== '') ? patient.PatientMedicationTransportation.Transportation_Medication_Aspirin : '';
               const ThrombolysisMedicationAspirin = (patient.ThrombolysisMedicationDetails !== undefined && patient.ThrombolysisMedicationDetails !== '') ? patient.ThrombolysisMedicationDetails.Medication_Prior_to_Thrombolysis_Aspirin : '';
               const DrugBeforePCIAspirin = (patient.DrugBeforePCIDetails !== undefined && patient.DrugBeforePCIDetails !== '') ? patient.DrugBeforePCIDetails.Pci_Drug_Before_Pci_Aspirin : '';
               let HospitalSummaryMedicationAspirin = '';
               if (typeof patient.HospitalSummaryMedicationDetails === 'object' && patient.HospitalSummaryMedicationDetails.length !== undefined && patient.HospitalSummaryMedicationDetails.length > 0) {
                  patient.HospitalSummaryMedicationDetails.map(Summary => {
                     if (Summary.Medication_In_Hospital_Aspirin !== undefined && Summary.Medication_In_Hospital_Aspirin !== null && Summary.Medication_In_Hospital_Aspirin !== '' ) {
                        if (Summary.Medication_In_Hospital_Aspirin === 'Yes') {
                           HospitalSummaryMedicationAspirin = 'Yes';  
                        } else if (Summary.Medication_In_Hospital_Aspirin === 'No' && HospitalSummaryMedicationAspirin === '') {
                           HospitalSummaryMedicationAspirin = 'No';
                        }
                     }
                  });
               }
               const AdmissionAspirin = (TransportationMedicationAspirin === 'Yes' || ThrombolysisMedicationAspirin === 'Yes' || DrugBeforePCIAspirin === 'Yes' || HospitalSummaryMedicationAspirin === 'Yes') ? 'Yes' :
                                       (TransportationMedicationAspirin === 'No' || ThrombolysisMedicationAspirin === 'No' || DrugBeforePCIAspirin === 'No' || HospitalSummaryMedicationAspirin === 'No') ?  'No' : '' ;
               
					let AdmissionEnoxaparin = '';
					let AdmissionFondaparinux = '';
					if (typeof patient.HospitalSummaryMedicationDetails === 'object' && patient.HospitalSummaryMedicationDetails.length !== undefined && patient.HospitalSummaryMedicationDetails.length > 0) {
                  patient.HospitalSummaryMedicationDetails.map(Summary => {
                     if (Summary.Medication_In_Hospital_Enoxaparin !== undefined && Summary.Medication_In_Hospital_Enoxaparin !== null && Summary.Medication_In_Hospital_Enoxaparin !== '' ) {
                        if (Summary.Medication_In_Hospital_Enoxaparin === 'Yes') {
                           AdmissionEnoxaparin = 'Yes';  
                        } else if (Summary.Medication_In_Hospital_Enoxaparin === 'No' && AdmissionEnoxaparin === '') {
                           AdmissionEnoxaparin = 'No';
                        }
								if (Summary.Medication_In_Hospital_Fondaparinux !== undefined && Summary.Medication_In_Hospital_Fondaparinux !== null && Summary.Medication_In_Hospital_Fondaparinux !== '' ) {
									if (Summary.Medication_In_Hospital_Fondaparinux === 'Yes') {
										AdmissionFondaparinux = 'Yes';  
									} else if (Summary.Medication_In_Hospital_Fondaparinux === 'No' && AdmissionFondaparinux === '') {
										AdmissionFondaparinux = 'No';
									}
								}
                     }
                  });
               }
					// Get Admission Clopidogrel (Yes/No)
               const TransportationMedicationClopidogrel = (patient.PatientMedicationTransportation !== undefined && patient.PatientMedicationTransportation !== '') ? patient.PatientMedicationTransportation.Transportation_Medication_Clopidogrel : '';
               const ThrombolysisMedicationClopidogrel = (patient.ThrombolysisMedicationDetails !== undefined && patient.ThrombolysisMedicationDetails !== '') ? patient.ThrombolysisMedicationDetails.Medication_Prior_to_Thrombolysis_Clopidogrel : '';
               const DrugBeforePCIClopidogrel = (patient.DrugBeforePCIDetails !== undefined && patient.DrugBeforePCIDetails !== '') ? patient.DrugBeforePCIDetails.Pci_Drug_Before_Pci_Clopidogrel : '';
               let HospitalSummaryMedicationClopidogrel = '';
               if (typeof patient.HospitalSummaryMedicationDetails === 'object' && patient.HospitalSummaryMedicationDetails.length !== undefined && patient.HospitalSummaryMedicationDetails.length > 0) {
                  patient.HospitalSummaryMedicationDetails.map(Summary => {
                     if (Summary.Medication_In_Hospital_Clopidogrel !== undefined && Summary.Medication_In_Hospital_Clopidogrel !== null && Summary.Medication_In_Hospital_Clopidogrel !== '' ) {
                        if (Summary.Medication_In_Hospital_Clopidogrel === 'Yes') {
                           HospitalSummaryMedicationClopidogrel = 'Yes';  
                        } else if (Summary.Medication_In_Hospital_Clopidogrel === 'No' && HospitalSummaryMedicationClopidogrel === '') {
                           HospitalSummaryMedicationClopidogrel = 'No';
                        }
                     }
                  });
               }
               const AdmissionClopidogrel = (TransportationMedicationClopidogrel === 'Yes' || ThrombolysisMedicationClopidogrel === 'Yes' || DrugBeforePCIClopidogrel === 'Yes' || HospitalSummaryMedicationClopidogrel === 'Yes') ? 'Yes' :
                                       (TransportationMedicationClopidogrel === 'No' || ThrombolysisMedicationClopidogrel === 'No' || DrugBeforePCIClopidogrel === 'No' || HospitalSummaryMedicationClopidogrel === 'No') ?  'No' : '' ;
               // Get Admission Heparin (Yes/No)
               const TransportationMedicationHeparin = (patient.PatientMedicationTransportation !== undefined && patient.PatientMedicationTransportation !== '') ?
                                                         (patient.PatientMedicationTransportation.Transportation_Medication_UnFractionated_Heparin === 'Yes' || patient.PatientMedicationTransportation.Transportation_Medication_LMW_Heparin === 'Yes') ? 'Yes' :
                                                         (patient.PatientMedicationTransportation.Transportation_Medication_UnFractionated_Heparin === 'No' || patient.PatientMedicationTransportation.Transportation_Medication_LMW_Heparin === 'No') ? 'No' : '' : '';
               const ThrombolysisMedicationHeparin = (patient.ThrombolysisMedicationDetails !== undefined && patient.ThrombolysisMedicationDetails !== '') ?
                                                      (patient.ThrombolysisMedicationDetails.Unfractionated_Heparin === 'Yes' || patient.ThrombolysisMedicationDetails.Medication_Prior_to_Thrombolysis_LMW_Heparin === 'Yes') ? 'Yes' :
                                                      (patient.ThrombolysisMedicationDetails.Unfractionated_Heparin === 'No' || patient.ThrombolysisMedicationDetails.Medication_Prior_to_Thrombolysis_LMW_Heparin === 'No') ? 'No' : '' : '';
               const PCIMedicationHeparin = (patient.PCIMedicationInCathDetails !== undefined && patient.PCIMedicationInCathDetails !== '') ?
                                             (patient.PCIMedicationInCathDetails.Anti_Thrombotics_Unfractionated_Heparin === 'Yes' || patient.PCIMedicationInCathDetails.Anti_Thrombotics_LMW_Heparin === 'Yes') ? 'Yes' :
                                             (patient.PCIMedicationInCathDetails.Anti_Thrombotics_Unfractionated_Heparin === 'No' || patient.PCIMedicationInCathDetails.Anti_Thrombotics_LMW_Heparin === 'No') ? 'No' : '' : '';
               let HospitalSummaryMedicationHeparin = '';
               if (typeof patient.HospitalSummaryMedicationDetails === 'object' && patient.HospitalSummaryMedicationDetails.length !== undefined && patient.HospitalSummaryMedicationDetails.length > 0) {
                  patient.HospitalSummaryMedicationDetails.map(Summary => {
                     if (Summary.Medication_In_Hospital_Heparin !== undefined && Summary.Medication_In_Hospital_Heparin !== null && Summary.Medication_In_Hospital_Heparin !== '' ) {
                        if (Summary.Medication_In_Hospital_UnFractionated_Heparin === 'Yes' || Summary.Medication_In_Hospital_LMW_Heparin === 'Yes') {
                           HospitalSummaryMedicationHeparin = 'Yes';  
                        } else if ((Summary.Medication_In_Hospital_UnFractionated_Heparin === 'No' || Summary.Medication_In_Hospital_LMW_Heparin === 'No') && HospitalSummaryMedicationHeparin === '') {
                           HospitalSummaryMedicationHeparin = 'No';
                        }
                     }
                  });
               }
               const AdmissionHeparin = (TransportationMedicationHeparin === 'Yes' || ThrombolysisMedicationHeparin === 'Yes' || PCIMedicationHeparin === 'Yes' || HospitalSummaryMedicationHeparin === 'Yes') ? 'Yes' :
                                       (TransportationMedicationHeparin === 'No' || ThrombolysisMedicationHeparin === 'No' || PCIMedicationHeparin === 'No' || HospitalSummaryMedicationHeparin === 'No') ?  'No' : '' ;
               // Get Admission Prasugrel (Yes/No)
               const TransportationMedicationPrasugrel = (patient.PatientMedicationTransportation !== undefined && patient.PatientMedicationTransportation !== '') ? patient.PatientMedicationTransportation.Transportation_Medication_Prasugrel : '';
               const DrugBeforePCIPrasugrel = (patient.DrugBeforePCIDetails !== undefined && patient.DrugBeforePCIDetails !== '') ? patient.DrugBeforePCIDetails.Pci_Drug_Before_Pci_Prasugrel : '';
               let HospitalSummaryMedicationPrasugrel = '';
               if (typeof patient.HospitalSummaryMedicationDetails === 'object' && patient.HospitalSummaryMedicationDetails.length !== undefined && patient.HospitalSummaryMedicationDetails.length > 0) {
                  patient.HospitalSummaryMedicationDetails.map(Summary => {
                     if (Summary.Medication_In_Hospital_Prasugrel !== undefined && Summary.Medication_In_Hospital_Prasugrel !== null && Summary.Medication_In_Hospital_Prasugrel !== '' ) {
                        if (Summary.Medication_In_Hospital_Prasugrel === 'Yes') {
                           HospitalSummaryMedicationPrasugrel = 'Yes';  
                        } else if (Summary.Medication_In_Hospital_Prasugrel === 'No' && HospitalSummaryMedicationPrasugrel === '') {
                           HospitalSummaryMedicationPrasugrel = 'No';
                        }
                     }
                  });
               }
               const AdmissionPrasugrel = (TransportationMedicationPrasugrel === 'Yes' || DrugBeforePCIPrasugrel === 'Yes' || HospitalSummaryMedicationPrasugrel === 'Yes') ? 'Yes' :
                                                   (TransportationMedicationPrasugrel === 'No' || DrugBeforePCIPrasugrel === 'No' || HospitalSummaryMedicationPrasugrel === 'No') ?  'No' : '' ;
               // Get Admission Ticagrelor (Yes/No)
               const TransportationMedicationTicagrelor = (patient.PatientMedicationTransportation !== undefined && patient.PatientMedicationTransportation !== '') ? patient.PatientMedicationTransportation.Transportation_Medication_Ticagrelor : '';
               const ThrombolysisMedicationTicagrelor = (patient.ThrombolysisMedicationDetails !== undefined && patient.ThrombolysisMedicationDetails !== '') ? patient.ThrombolysisMedicationDetails.Medication_Prior_to_Thrombolysis_Ticagrelor : '';
               const DrugBeforePCITicagrelor = (patient.DrugBeforePCIDetails !== undefined && patient.DrugBeforePCIDetails !== '') ? patient.DrugBeforePCIDetails.Pci_Drug_Before_Pci_Ticagrelor : '';
               let HospitalSummaryMedicationTicagrelor = '';
               if (typeof patient.HospitalSummaryMedicationDetails === 'object' && patient.HospitalSummaryMedicationDetails.length !== undefined && patient.HospitalSummaryMedicationDetails.length > 0) {
                  patient.HospitalSummaryMedicationDetails.map(Summary => {
                     if (Summary.Medication_In_Hospital_Ticagrelor !== undefined && Summary.Medication_In_Hospital_Ticagrelor !== null && Summary.Medication_In_Hospital_Ticagrelor !== '' ) {
                        if (Summary.Medication_In_Hospital_Ticagrelor === 'Yes') {
                           HospitalSummaryMedicationTicagrelor = 'Yes';  
                        } else if (Summary.Medication_In_Hospital_Ticagrelor === 'No' && HospitalSummaryMedicationTicagrelor === '') {
                           HospitalSummaryMedicationTicagrelor = 'No';
                        }
                     }
                  });
               }
               const AdmissionTicagrelor = (TransportationMedicationTicagrelor === 'Yes' || ThrombolysisMedicationTicagrelor === 'Yes' || DrugBeforePCITicagrelor === 'Yes' || HospitalSummaryMedicationTicagrelor === 'Yes') ? 'Yes' :
                                             (TransportationMedicationTicagrelor === 'No' || ThrombolysisMedicationTicagrelor === 'No' || DrugBeforePCITicagrelor === 'No' || HospitalSummaryMedicationTicagrelor === 'No') ?  'No' : '' ;
               // Get Admission Other (Yes/No)
               const ThrombolysisMedicationOther = (patient.ThrombolysisMedicationDetails !== undefined && patient.ThrombolysisMedicationDetails !== '' && patient.ThrombolysisMedicationDetails.OtherMedicationArray.length !== undefined) ? patient.ThrombolysisMedicationDetails.OtherMedicationArray.length > 0 ? 'Yes' : 'No' : '';
               const DrugBeforePCIOther = (patient.DrugBeforePCIDetails !== undefined && patient.DrugBeforePCIDetails !== '' && patient.DrugBeforePCIDetails.DrugsBeforePCIOthersArray.length !== undefined) ? patient.DrugBeforePCIDetails.DrugsBeforePCIOthersArray.length > 0 ? 'Yes' : 'No' : '';
               const PCIMedicationOther = (patient.PCIMedicationInCathDetails !== undefined && patient.PCIMedicationInCathDetails !== '' && patient.PCIMedicationInCathDetails.AntiThromboticsOthersArray.length !== undefined) ? patient.PCIMedicationInCathDetails.AntiThromboticsOthersArray.length > 0 ? 'Yes' : 'No' : '';
               let HospitalSummaryMedicationOther = '';
               if (typeof patient.HospitalSummaryMedicationDetails === 'object' && patient.HospitalSummaryMedicationDetails.length !== undefined && patient.HospitalSummaryMedicationDetails.length > 0) {
                  patient.HospitalSummaryMedicationDetails.map(Summary => {
                     if (Summary.OtherMedicationArray !== undefined && Summary.OtherMedicationArray !== null && Summary.OtherMedicationArray.length !== undefined ) {
                        if (Summary.OtherMedicationArray.length > 0) {
                           HospitalSummaryMedicationOther = 'Yes';  
                        } else if (Summary.OtherMedicationArray.length === 0 && HospitalSummaryMedicationOther === '') {
                           HospitalSummaryMedicationOther = 'No';
                        }
                     }
                  });
               }
               const AdmissionOther = (ThrombolysisMedicationOther === 'Yes' || DrugBeforePCIOther === 'Yes' || PCIMedicationOther === 'Yes' || HospitalSummaryMedicationOther === 'Yes') ? 'Yes' :
                                             ( ThrombolysisMedicationOther === 'No' || DrugBeforePCIOther === 'No' || PCIMedicationOther === 'No' || HospitalSummaryMedicationOther === 'No') ?  'No' : '' ;
               // Get Discharge ABR/ACEI (Yes/No)
               let DischargeABR = '';
               if (typeof patient.DischargeTransferMedicationDetails === 'object' && patient.DischargeTransferMedicationDetails.length !== undefined && patient.DischargeTransferMedicationDetails.length > 0) {
                  patient.DischargeTransferMedicationDetails.map(DisMed => {
                     if (DisMed.Discharge_Medications_ARB !== undefined && DisMed.Discharge_Medications_ARB !== null && DisMed.Discharge_Medications_ARB !== '') {
                        if (DisMed.Discharge_Medications_ARB === 'Yes') {
                           DischargeABR = 'Yes';
                        } else if (DisMed.Discharge_Medications_ARB === 'No' && DischargeABR === '') {
                           DischargeABR = 'No';
                        }
                     }
                  });
               }
               let DischargeACEI = '';
               if (typeof patient.DischargeTransferMedicationDetails === 'object' && patient.DischargeTransferMedicationDetails.length !== undefined && patient.DischargeTransferMedicationDetails.length > 0) {
                  patient.DischargeTransferMedicationDetails.map(DisMed => {
                     if (DisMed.Discharge_Medications_ACEI !== undefined && DisMed.Discharge_Medications_ACEI !== null && DisMed.Discharge_Medications_ACEI !== '') {
                        if (DisMed.Discharge_Medications_ACEI === 'Yes') {
                           DischargeACEI = 'Yes';
                        } else if (DisMed.Discharge_Medications_ACEI === 'No' && DischargeACEI === '') {
                           DischargeACEI = 'No';
                        }
                     }
                  });
               }
               const DischargeABROrACEI = (DischargeABR === 'Yes' || DischargeACEI === 'Yes') ? 'Yes' : (DischargeABR === 'No' || DischargeACEI === 'No') ? 'No' : '';
               // Get Discharge Aspirin (Yes/No)
               let DischargeAspirin = '';
               if (typeof patient.DischargeTransferMedicationDetails === 'object' && patient.DischargeTransferMedicationDetails.length !== undefined && patient.DischargeTransferMedicationDetails.length > 0) {
                  patient.DischargeTransferMedicationDetails.map(DisMed => {
                     if (DisMed.Discharge_Medications_Aspirin !== undefined && DisMed.Discharge_Medications_Aspirin !== null && DisMed.Discharge_Medications_Aspirin !== '') {
                        if (DisMed.Discharge_Medications_Aspirin === 'Yes') {
                           DischargeAspirin = 'Yes';
                        } else if (DisMed.Discharge_Medications_Aspirin === 'No' && DischargeAspirin === '') {
                           DischargeAspirin = 'No';
                        }
                     }
                  });
               }
               // Get Discharge Beta Blocker (Yes/No)
               let DischargeBetaBlocker = '';
               if (typeof patient.DischargeTransferMedicationDetails === 'object' && patient.DischargeTransferMedicationDetails.length !== undefined && patient.DischargeTransferMedicationDetails.length > 0) {
                  patient.DischargeTransferMedicationDetails.map(DisMed => {
                     if (DisMed.Discharge_Medications_Beta_Blocker !== undefined && DisMed.Discharge_Medications_Beta_Blocker !== null && DisMed.Discharge_Medications_Beta_Blocker !== '') {
                        if (DisMed.Discharge_Medications_Beta_Blocker === 'Yes') {
                           DischargeBetaBlocker = 'Yes';
                        } else if (DisMed.Discharge_Medications_Beta_Blocker === 'No' && DischargeBetaBlocker === '') {
                           DischargeBetaBlocker = 'No';
                        }
                     }
                  });
               }
               // Get Discharge Clopidogrel (Yes/No)
               let DischargeClopidogrel = '';
               if (typeof patient.DischargeTransferMedicationDetails === 'object' && patient.DischargeTransferMedicationDetails.length !== undefined && patient.DischargeTransferMedicationDetails.length > 0) {
                  patient.DischargeTransferMedicationDetails.map(DisMed => {
                     if (DisMed.Discharge_Medications_Clopidogrel !== undefined && DisMed.Discharge_Medications_Clopidogrel !== null && DisMed.Discharge_Medications_Clopidogrel !== '') {
                        if (DisMed.Discharge_Medications_Clopidogrel === 'Yes') {
                           DischargeClopidogrel = 'Yes';
                        } else if (DisMed.Discharge_Medications_Clopidogrel === 'No' && DischargeClopidogrel === '') {
                           DischargeClopidogrel = 'No';
                        }
                     }
                  });
               }
               // Get Discharge Prasugrel (Yes/No)
               let DischargePrasugrel = '';
               if (typeof patient.DischargeTransferMedicationDetails === 'object' && patient.DischargeTransferMedicationDetails.length !== undefined && patient.DischargeTransferMedicationDetails.length > 0) {
                  patient.DischargeTransferMedicationDetails.map(DisMed => {
                     if (DisMed.Discharge_Medications_Prasugrel !== undefined && DisMed.Discharge_Medications_Prasugrel !== null && DisMed.Discharge_Medications_Prasugrel !== '') {
                        if (DisMed.Discharge_Medications_Prasugrel === 'Yes') {
                           DischargePrasugrel = 'Yes';
                        } else if (DisMed.Discharge_Medications_Prasugrel === 'No' && DischargePrasugrel === '') {
                           DischargePrasugrel = 'No';
                        }
                     }
                  });
               }
               // Get Discharge Statin (Yes/No)
               let DischargeStatin = '';
               if (typeof patient.DischargeTransferMedicationDetails === 'object' && patient.DischargeTransferMedicationDetails.length !== undefined && patient.DischargeTransferMedicationDetails.length > 0) {
                  patient.DischargeTransferMedicationDetails.map(DisMed => {
                     if (DisMed.Discharge_Medications_Statin !== undefined && DisMed.Discharge_Medications_Statin !== null && DisMed.Discharge_Medications_Statin !== '') {
                        if (DisMed.Discharge_Medications_Statin === 'Yes') {
                           DischargeStatin = 'Yes';
                        } else if (DisMed.Discharge_Medications_Statin === 'No' && DischargeStatin === '') {
                           DischargeStatin = 'No';
                        }
                     }
                  });
               }
               // Get Discharge Ticagrelor (Yes/No)
               let DischargeTicagrelor = '';
               if (typeof patient.DischargeTransferMedicationDetails === 'object' && patient.DischargeTransferMedicationDetails.length !== undefined && patient.DischargeTransferMedicationDetails.length > 0) {
                  patient.DischargeTransferMedicationDetails.map(DisMed => {
                     if (DisMed.Discharge_Medications_Ticagrelor !== undefined && DisMed.Discharge_Medications_Ticagrelor !== null && DisMed.Discharge_Medications_Ticagrelor !== '') {
                        if (DisMed.Discharge_Medications_Ticagrelor === 'Yes') {
                           DischargeTicagrelor = 'Yes';
                        } else if (DisMed.Discharge_Medications_Ticagrelor === 'No' && DischargeTicagrelor === '') {
                           DischargeTicagrelor = 'No';
                        }
                     }
                  });
               }
               // Get Discharge Other (Yes/No)
               let DischargeOther = '';
               if (typeof patient.DischargeTransferMedicationDetails === 'object' && patient.DischargeTransferMedicationDetails.length !== undefined && patient.DischargeTransferMedicationDetails.length > 0) {
                  patient.DischargeTransferMedicationDetails.map(DisMed => {
                     if (DisMed.OtherMedicationArray !== undefined && DisMed.OtherMedicationArray !== null && DisMed.OtherMedicationArray.length !== undefined) {
                        if (DisMed.OtherMedicationArray.length > 0 ) {
                           DischargeOther = 'Yes';
                        } else if (DisMed.OtherMedicationArray.length === 0 && DischargeOther === '') {
                           DischargeOther = 'No';
                        }
                     }
                  });
               }
               // Get IHAE Death (Yes/No)
               const IHAEDeath = (patient.DischargeTransferDeathDetails !== undefined && patient.DischargeTransferDeathDetails.Discharge_Transfer_Death !== undefined) ? patient.DischargeTransferDeathDetails.Discharge_Transfer_Death : '';
               // Get IHAE Death Remarks
               const IHAEDeathRemarks = (patient.DischargeTransferDeathDetails !== undefined && IHAEDeath === 'Yes' && patient.DischargeTransferDeathDetails.Discharge_Transfer_Remarks !== undefined ) ? patient.DischargeTransferDeathDetails.Discharge_Transfer_Remarks : '';
               // Get IHAE Stroke (Yes/No)
               let IHAEStroke = '';
               if (typeof patient.HospitalSummaryAdverseEventsDetails === 'object' && patient.HospitalSummaryAdverseEventsDetails.length !== undefined && patient.HospitalSummaryAdverseEventsDetails.length > 0) {
                  patient.HospitalSummaryAdverseEventsDetails.map(HosAdvEve => {
                     if (HosAdvEve.Adverse_Events_Stroke !== undefined && HosAdvEve.Adverse_Events_Stroke !== null && HosAdvEve.Adverse_Events_Stroke !== '') {
                        if (HosAdvEve.Adverse_Events_Stroke === 'Yes') {
                           IHAEStroke = 'Yes';
                        } else if (HosAdvEve.Adverse_Events_Stroke === 'No' && IHAEStroke === '') {
                           IHAEStroke = 'No';
                        }
                     }
                  });
               }
               // get One Month Followup Re Infarction (Yes/No)
               let IHAEReInfarction = '';
               if (typeof patient.HospitalSummaryAdverseEventsDetails === 'object' && patient.HospitalSummaryAdverseEventsDetails.length !== undefined && patient.HospitalSummaryAdverseEventsDetails.length > 0) {
                  patient.HospitalSummaryAdverseEventsDetails.map(HosAdvEve => {
                     if (HosAdvEve.Adverse_Events_Re_infarction !== undefined && HosAdvEve.Adverse_Events_Re_infarction !== null && HosAdvEve.Adverse_Events_Re_infarction !== '') {
                        if (HosAdvEve.Adverse_Events_Re_infarction === 'Yes') {
                           IHAEReInfarction = 'Yes';
                        } else if (HosAdvEve.Adverse_Events_Re_infarction === 'No' && IHAEReInfarction === '') {
                           IHAEReInfarction = 'No';
                        }
                     }
                  });
               }
               // Get IHAE Hemorrhage (Yes/No)
               let IHAEHemorrhage = '';
               if (typeof patient.HospitalSummaryAdverseEventsDetails === 'object' && patient.HospitalSummaryAdverseEventsDetails.length !== undefined && patient.HospitalSummaryAdverseEventsDetails.length > 0) {
                  patient.HospitalSummaryAdverseEventsDetails.map(HosAdvEve => {
                     if (HosAdvEve.Adverse_Events_Hemorrhage !== undefined && HosAdvEve.Adverse_Events_Hemorrhage !== null && HosAdvEve.Adverse_Events_Hemorrhage !== '') {
                        if (HosAdvEve.Adverse_Events_Hemorrhage === 'Yes') {
                           IHAEHemorrhage = 'Yes';
                        } else if (HosAdvEve.Adverse_Events_Hemorrhage === 'No' && IHAEHemorrhage === '') {
                           IHAEHemorrhage = 'No';
                        }
                     }
                  });
               }
               // Get IHAE Minor Bleed (Yes/No)
               let IHAEMinorBleed = '';
               if (typeof patient.HospitalSummaryAdverseEventsDetails === 'object' && patient.HospitalSummaryAdverseEventsDetails.length !== undefined && patient.HospitalSummaryAdverseEventsDetails.length > 0) {
                  patient.HospitalSummaryAdverseEventsDetails.map(HosAdvEve => {
                     if (HosAdvEve.Adverse_Events_Minor_Bleed !== undefined && HosAdvEve.Adverse_Events_Minor_Bleed !== null && HosAdvEve.Adverse_Events_Minor_Bleed !== '') {
                        if (HosAdvEve.Adverse_Events_Minor_Bleed === 'Yes') {
                           IHAEMinorBleed = 'Yes';
                        } else if (HosAdvEve.Adverse_Events_Minor_Bleed === 'No' && IHAEMinorBleed === '') {
                           IHAEMinorBleed = 'No';
                        }
                     }
                  });
               }
               // Get IHAE Major Bleed (Yes/No)
               let IHAEMajorBleed = '';
               if (typeof patient.HospitalSummaryAdverseEventsDetails === 'object' && patient.HospitalSummaryAdverseEventsDetails.length !== undefined && patient.HospitalSummaryAdverseEventsDetails.length > 0) {
                  patient.HospitalSummaryAdverseEventsDetails.map(HosAdvEve => {
                     if (HosAdvEve.Adverse_Events_Major_Bleed !== undefined && HosAdvEve.Adverse_Events_Major_Bleed !== null && HosAdvEve.Adverse_Events_Major_Bleed !== '') {
                        if (HosAdvEve.Adverse_Events_Major_Bleed === 'Yes') {
                           IHAEMajorBleed = 'Yes';
                        } else if (HosAdvEve.Adverse_Events_Major_Bleed === 'No' && IHAEMajorBleed === '') {
                           IHAEMajorBleed = 'No';
                        }
                     }
                  });
               }
               // Get IHAE Cardiogenic Shock (Yes/No)
               let IHAECardiogenicShock = '';
               if (typeof patient.HospitalSummaryAdverseEventsDetails === 'object' && patient.HospitalSummaryAdverseEventsDetails.length !== undefined && patient.HospitalSummaryAdverseEventsDetails.length > 0) {
                  patient.HospitalSummaryAdverseEventsDetails.map(HosAdvEve => {
                     if (HosAdvEve.Adverse_Events_Cardiogenic_Shock !== undefined && HosAdvEve.Adverse_Events_Cardiogenic_Shock !== null && HosAdvEve.Adverse_Events_Cardiogenic_Shock !== '') {
                        if (HosAdvEve.Adverse_Events_Cardiogenic_Shock === 'Yes') {
                           IHAECardiogenicShock = 'Yes';
                        } else if (HosAdvEve.Adverse_Events_Cardiogenic_Shock === 'No' && IHAECardiogenicShock === '') {
                           IHAECardiogenicShock = 'No';
                        }
                     }
                  });
               }
               // Get IHAE Other (Yes/No)
               let IHAEOthers = '';
               if (typeof patient.HospitalSummaryAdverseEventsDetails === 'object' && patient.HospitalSummaryAdverseEventsDetails.length !== undefined && patient.HospitalSummaryAdverseEventsDetails.length > 0) {
                  patient.HospitalSummaryAdverseEventsDetails.map(HosAdvEve => {
                     if (HosAdvEve.OtherMedicationArrayAdverseEvent !== undefined && HosAdvEve.OtherMedicationArrayAdverseEvent !== null && HosAdvEve.OtherMedicationArrayAdverseEvent.length !== undefined) {
                        if (HosAdvEve.OtherMedicationArrayAdverseEvent.length > 0 ) {
                           IHAEOthers = 'Yes';
                        } else if (HosAdvEve.OtherMedicationArrayAdverseEvent.length === 0 && IHAEOthers === '') {
                           IHAEOthers = 'No';
                        }
                     }
                  });
               }
               // Get IHAE Other Remarks 
               let IHAEOthersRemarks = '';
               if (typeof patient.HospitalSummaryAdverseEventsDetails === 'object' && patient.HospitalSummaryAdverseEventsDetails.length !== undefined && patient.HospitalSummaryAdverseEventsDetails.length > 0) {
                  patient.HospitalSummaryAdverseEventsDetails.map(HosAdvEve => {
                     if (HosAdvEve.OtherMedicationArrayAdverseEvent !== undefined && HosAdvEve.OtherMedicationArrayAdverseEvent !== null && HosAdvEve.OtherMedicationArrayAdverseEvent.length !== undefined) {
                        if (HosAdvEve.OtherMedicationArrayAdverseEvent.length > 0 ) {
                           HosAdvEve.OtherMedicationArrayAdverseEvent.map(objOther => {
                              IHAEOthersRemarks = IHAEOthersRemarks !== '' ? IHAEOthersRemarks + ', ' + objOther.Adverse_Events_Others : objOther.Adverse_Events_Others;
                           });
                        }
                     }
                  });
               }
               // get One Month Followup Lost
               let LostFirstFollowUp = '';
               if (typeof patient.FollowUpDetails === 'object' && patient.FollowUpDetails.length !== undefined && patient.FollowUpDetails.length > 0 ) {
                  patient.FollowUpDetails.map(FolDet => {
                     if (FolDet.Mode_Of_Follow_Up !== undefined && FolDet.Mode_Of_Follow_Up === 'Lost_Follow_Up' && FolDet.Duration_Of_Follow_Up_Visit !== undefined && FolDet.Duration_Of_Follow_Up_Visit === '1_Month') {
                        LostFirstFollowUp = 'Yes';
                     }
                  });
               }
               // get One Month Followup Death (Yes/No)
               let OneMonthFollowupDeath = '';
               if (patient.DischargeTransferDeathDetails !== undefined && patient.DischargeTransferDeathDetails !== null && patient.DischargeTransferDeathDetails !== '' && patient.DischargeTransferDeathDetails.Discharge_Transfer_Death !== undefined && patient.DischargeTransferDeathDetails.Discharge_Transfer_Death === 'Yes') {
                  OneMonthFollowupDeath = 'IHD'; 
               } else if (typeof patient.FollowUpDetails === 'object' && patient.FollowUpDetails.length !== undefined && patient.FollowUpDetails.length > 0 && patient.FollowUpDetails.Mode_Of_Follow_Up !== undefined && patient.FollowUpDetails.Mode_Of_Follow_Up !== 'Lost_Follow_Up' && typeof patient.FollowUpEventDetails === 'object' && patient.FollowUpEventDetails.length !== undefined && patient.FollowUpEventDetails.length > 0 ) {
                  if (LostFirstFollowUp !== 'Yes') {
                     patient.FollowUpEventDetails.map(FolEve => {
                        if (FolEve.Follow_Up_Death !== undefined && FolEve.Follow_Up_Death !== null && FolEve.Follow_Up_Death !== '' && FolEve.Duration_Of_Follow_Up_Event !== undefined && FolEve.Duration_Of_Follow_Up_Event !== '' &&  FolEve.Duration_Of_Follow_Up_Event === '1_Month') {
                           OneMonthFollowupDeath = FolEve.Follow_Up_Death;
                        }
                     });
                  }
               }
               // // get One Month Followup Re Infarction (Yes/No)
               // let OneMonthFollowupReInfarction = '';
               // if (OneMonthFollowupDeath === 'IHD') {
               //    OneMonthFollowupReInfarction = 'IHD';
               // } else if (typeof patient.HospitalSummaryAdverseEventsDetails === 'object' && patient.HospitalSummaryAdverseEventsDetails.length !== undefined && patient.HospitalSummaryAdverseEventsDetails.length > 0) {
               //    const LastHospital =  patient.HospitalDetails[patient.HospitalDetails.length -1];
               //    const Idx = patient.HospitalSummaryAdverseEventsDetails.findIndex(HosAdvEve => HosAdvEve.Hospital === LastHospital.Hospital._id);
               //    if (Idx >= 0) {
               //       const LastAdverseEvents =  patient.HospitalSummaryAdverseEventsDetails[Idx];
               //       if (LastAdverseEvents.Adverse_Events_Re_infarction !== undefined && LastAdverseEvents.Adverse_Events_Re_infarction !== null && LastAdverseEvents.Adverse_Events_Re_infarction !== '' ) {
               //          OneMonthFollowupReInfarction = LastAdverseEvents.Adverse_Events_Re_infarction;
               //       }
               //    }
               // }
               // get One Month Followup Stroke (Yes/No)
               let OneMonthFollowupStroke = '';
               if (OneMonthFollowupDeath === 'IHD') {
                  OneMonthFollowupStroke = 'IHD';
               } else if (typeof patient.FollowUpEventDetails === 'object' && patient.FollowUpEventDetails.length !== undefined && patient.FollowUpEventDetails.length > 0 ) {
                  if (LostFirstFollowUp !== 'Yes') {
                     patient.FollowUpEventDetails.map(FolEve => {
                        if (FolEve.Follow_Up_Events_Stroke !== undefined && FolEve.Follow_Up_Events_Stroke !== null && FolEve.Follow_Up_Events_Stroke !== '' && FolEve.Duration_Of_Follow_Up_Event !== undefined && FolEve.Duration_Of_Follow_Up_Event !== '' &&  FolEve.Duration_Of_Follow_Up_Event === '1_Month') {
                           OneMonthFollowupStroke = FolEve.Follow_Up_Events_Stroke;
                        }
                     });
                  }
               }
                // get One Year Followup Lost
                let LostYearFollowUp = '';
                if (typeof patient.FollowUpDetails === 'object' && patient.FollowUpDetails.length !== undefined && patient.FollowUpDetails.length > 0 ) {
                   patient.FollowUpDetails.map(FolDet => {
                      if (FolDet.Mode_Of_Follow_Up !== undefined && FolDet.Mode_Of_Follow_Up === 'Lost_Follow_Up') {
                        LostYearFollowUp = 'Yes';
                      }
                   });
                }
               // get One Year Followup Death (Yes/No)
               let OneYearFollowupDeath = '';
               if (OneMonthFollowupDeath === 'IHD') {
                  OneYearFollowupDeath = 'IHD'; 
               } else if (typeof patient.FollowUpEventDetails === 'object' && patient.FollowUpEventDetails.length !== undefined && patient.FollowUpEventDetails.length > 0) {
                  if (LostYearFollowUp !== 'Yes') {
                     patient.FollowUpEventDetails.map(FolEve => {
                        if (FolEve.Follow_Up_Death !== undefined && FolEve.Follow_Up_Death !== null && FolEve.Follow_Up_Death !== '' && OneYearFollowupDeath !== 'Yes') {
                           OneYearFollowupDeath = FolEve.Follow_Up_Death;
                        }
                     });
                  }
               }
               // get One year Followup Stroke (Yes/No)
               let OneYearFollowupStroke = '';
               if (OneMonthFollowupDeath === 'IHD') {
                  OneYearFollowupStroke = 'IHD';
               } else if (typeof patient.FollowUpEventDetails === 'object' && patient.FollowUpEventDetails.length !== undefined && patient.FollowUpEventDetails.length > 0 ) {
                  if (LostYearFollowUp !== 'Yes') {
                     patient.FollowUpEventDetails.map(FolEve => {
                        if (FolEve.Follow_Up_Events_Stroke !== undefined && FolEve.Follow_Up_Events_Stroke !== null && FolEve.Follow_Up_Events_Stroke !== '') {
                           OneYearFollowupStroke = FolEve.Follow_Up_Events_Stroke;
                        }
                     });
                  }
               }
   
               const NewPatient = {};
               NewPatient.DataType = patient.Data_Type; // DataType
               NewPatient.Patient_Record_ID = patient.Patient_Code; // Patient Record ID
               NewPatient.Patient_ID = patient.Patient_Unique; // Patient ID
               NewPatient.Name = patient.Patient_Name; // Name
               NewPatient.Phone_Number = patient.Patient_PhoneNo; // Phone Number
               NewPatient.Address = patient.Patient_Address; // Address
               NewPatient.DateOfRegistration = DateOfRegistration; // Date Of Registration
					NewPatient.Admission_Type = AdmissionType;
               NewPatient.HospitalArrivedAt = HospitalArrivedAt; // Hospital Arrived At
               NewPatient.Origin_Cluster = OriginCluster; // Origin Cluster
               NewPatient.Registered_Hospital = RegisteredHospital; // Registered Hospital
					NewPatient.Referral_Hospital = NonClusterHospital;
					NewPatient.Referral_Hospital_Arrival = NonClusterHospitalArrival;
               NewPatient.Below_the_Poverty_Line = BelowThePovertyLine; // Below the Poverty Line
               NewPatient.Age = patient.Patient_Age; // Age
               NewPatient.Female_Gender = FemaleGender; // Female Gender
					NewPatient.Race = Race; // Race and Race Other
					NewPatient.Medical_Insurance = Insurance; // Medical Insurance
					NewPatient.Location_of_Infarction = LocationOfInfarction; 
					NewPatient.Risk_Factor_Diabetes = RiskFactorDiabetes;
					NewPatient.Risk_Factor_Hypertension = RiskFactorHypertension;
					NewPatient.Risk_Factor_Smoking = RiskFactorSmoking;
					NewPatient.Risk_Factor_Cholesterol = RiskFactorCholesterol;
					NewPatient.Risk_Factor_Family_History = RiskFactorFamilyHistory;
               NewPatient.Prior_Diabetes = PriorDiabetes; // Prior Diabetes
					NewPatient.High_Cholesterol = HighCholesterol; // High Cholesterol 
               NewPatient.Prior_HTN = PriorHTN; // Prior HTN
               NewPatient.Prior_Dyslipidemia = PriorDyslipidemia; // Prior Dyslipidemia
               NewPatient.Active_Smoking = ActiveSmoking; // Active Smoking
               NewPatient.Prior_PCI = PriorPCI; // Prior PCI
               NewPatient.Prior_CABG = PriorCABG; // Prior CABG
               // NewPatient.Location_of_Infarct = LocationOfInfarct; // Location of Infarct
               NewPatient.First_heart_rate = patient.FirstHospitalClinicalExamination.Heart_Rate; // First heart rate
               NewPatient.Systolic_BP = patient.FirstHospitalClinicalExamination.BP_Systolic; // Systolic BP
               NewPatient.Diastolic_BP = patient.FirstHospitalClinicalExamination.BP_Diastolic; // Diastolic BP
               NewPatient.Radial_access_site = RadialAccessSite; // Radial access site
               NewPatient.Ambulance_transport = AmbulanceTransport; // Ambulance Transport
               NewPatient.Date_of_Symptom_Onset = DateOfSymptomOnset; // Date of Symptom Onset
               NewPatient.Time_of_Symptom_Onset = TimeOfSymptomOnset; // Time of Symptom Onset
               NewPatient.Date_of_First_Medical_Contact = DateOfFirstMedicalContact; // Date of First Medical Contact
               NewPatient.Time_of_First_Medical_Contact = TimeOfFirstMedicalContact; // Time of First Medical Contact
               NewPatient.Symptom_Onset_to_First_Medical_Contact = SymptomOnsetToFirstMedicalContact; // Symptom Onset to First Medical Contact
               NewPatient.Date_of_First_ECG_with_STEMI = DateOfFirstECGWithSTEMI; // Date of First ECG With STEMI
               NewPatient.Time_of_First_ECG_with_STEMI = TimeOfFirstECGWithSTEMI; // Time of First ECG with STEMI
               NewPatient.Total_NoOf_ECG = (patient.All_ECG_Files !== undefined && patient.All_ECG_Files !== null) ? patient.All_ECG_Files.length : 0; // Total No Of ECG
               NewPatient.First_Asked_DateTime = FirstAskedDateTime; // First Asked Date Time
               NewPatient.First_Replied_DateTime = FirstRepliedDateTime; // First Replied Date Time
               NewPatient.First_Medical_Contact_to_ECG = FirstMedicalContactToECG; // First Medical Contact to ECG
               NewPatient.Date_of_First_STEMI_Network_Hospital = DateOfFirstSTEMINetworkHospital; // Date of First STEMI Network Hospital
               NewPatient.Time_of_First_STEMI_Network_Hospital = TimeOfFirstSTEMINetworkHospital; // Time of First STEMI Network Hospital
               NewPatient.Date_of_AB_Hospital_Arrival = DateOfABHospitalArrival; // Date of AB(H1, H2) Hospital Arrival
               NewPatient.Time_of_AB_Hospital_Arrival = TimeOfABHospitalArrival; // Time of AB(H1, H2) Hospital Arrival
               NewPatient.Transfer_Time = TransferTime; // Transfer Time
               NewPatient.External_Lysis = ExternalLysis; // External Lysis
               NewPatient.Start_Date_of_Lytic_Therapy = StartDateOfLyticTherapy; // Start Date of Lytic Therapy
               NewPatient.Start_Time_of_Lytic_Therapy = StartTimeOfLyticTherapy; // Start Time of Lytic Therapy
               NewPatient.Completion_Date_of_Lytic_Therapy = CompletionDateOfLyticTherapy; // Completion Date of Lytic Therapy
               NewPatient.Completion_Time_of_Lytic_Therapy = CompletionTimeOfLyticTherapy; // Completion Time of Lytic Therapy
               NewPatient.ECG_to_Thrombolysis = ECGToThrombolysis; // ECG to Thrombolysis
               NewPatient.Date_of_Coronary_Angiography_Start = DateOfCoronaryAngiographyStart; // Date of Coronary Angiography Start
               NewPatient.Time_of_Coronary_Angiography_Start = TimeOfCoronaryAngiographyStart; // Time of Coronary Angiography Start
               NewPatient.Date_of_PCI_First_Balloon_Stent_Deployment = DateOfPCIFirstStentDeployment; // Date of PCI First Balloon/Stent Deployment
               NewPatient.Time_of_PCI_First_Balloon_Stent_Deployment = TimeOfPCIFirstStentDeployment; // Date of PCI First Balloon/Stent Deployment
               NewPatient.Door_To_Needle_Time = DoorToNeedleTime; // Door To Needle Time
               NewPatient.Door_To_Balloon_Time = DoorToBalloonTime; // Door To Balloon Time
               NewPatient.For_patients_getting_any_reperfusion_and_Total_Ischemic_Time = TotalIschemicTime; // Get patients getting any reperfusion (no lytic or PCI = N), total ischemic time
               NewPatient.ECG_to_PCI = ECGToPCI; // ECG To PCI
               NewPatient.Thrombolysis_to_Angio = ThrombolysisToAngio; // Thrombolysis to Angio
               NewPatient.Thrombolysis_to_Angio_lessthan_24Hrs = ThrombolysisToAngioLessThan24Hrs; // Thrombolysis to Angio less than 24Hrs
               NewPatient.Thrombolysis_to_PCI = ThrombolysisToPCI; // Thrombolysis to PCI
               NewPatient.Thrombolysis_to_PCI_lessthan_24Hrs = ThrombolysisToPCILessThan24Hrs; // Thrombolysis to PCI less than 24Hrs
               NewPatient.Date_of_Discharge = DateOfDischarge; // Date of Discharge
					NewPatient.MissedSTEMI = MissedSTEMI; // Date of Discharge
               NewPatient.Autoreperfused = Autoreperfused; // Date of Discharge
               // Successful Lysis field added
               NewPatient.Successful_Lysis = Successful_Lysis ? Successful_Lysis : '';
               NewPatient.No_Lytic_or_PCI = NoLyticOrPCI; // No Lytic or PCI
               NewPatient.Lytic = Lytic !== '' ? Lytic : 'No'; // Lytic
               NewPatient.Lytic_Agent = LyticAgent; // Lytic Agent
               NewPatient.Coronary_Angiography = CoronaryAngiography !== '' ? CoronaryAngiography : 'No'; // Coronary Angiography
               NewPatient.PCI = PCI !== '' ? PCI : 'No'; // PCI
					NewPatient.Failed_PCI = FailedPCI;
					NewPatient.Additional_Revascularization_Needed = AdditionalRevascularizationNeeded;
					NewPatient.Type_of_PCI = TypeOfPCI; // PCI Options
					NewPatient.Culprit_Vessel = CulpritVesselData;
               NewPatient.Site_of_1st_medical_contact = SiteOf1stMedicalContact; // Site of 1st medical contact
               NewPatient.AB_Hospital = ABHospital; // AB Hospital
               NewPatient.C_Health_Care_Unit = C_HealthCareUnit; // C Health Care Unit
               NewPatient.D_Health_Care_Unit = D_HealthCareUnit; // D Health Care Unit
               NewPatient.E_Health_Care_Unit = E_HealthCareUnit; // E Health Care Unit
					NewPatient.Admission_Enoxaparin = AdmissionEnoxaparin;
					NewPatient.Admission_Fondaparinux = AdmissionFondaparinux;
               NewPatient.Admission_Aspirin = AdmissionAspirin; // Admission Aspirin
               NewPatient.Admission_Clopidogrel = AdmissionClopidogrel; // Admission Clopidogrel
               NewPatient.Admission_Heparin = AdmissionHeparin; // Admission Heparin
               NewPatient.Admission_Prasugrel = AdmissionPrasugrel; // Admission Prasugrel
               NewPatient.Admission_Ticagrelor = AdmissionTicagrelor; // Admission Ticagrelor
               NewPatient.Admission_Other = AdmissionOther; // Admission Other
               NewPatient.Discharge_ABR_ACEI = DischargeABROrACEI; // Discharge ABR/ACEI
               NewPatient.Discharge_Aspirin = DischargeAspirin; // Discharge Aspirin
               NewPatient.Discharge_Beta_blocker = DischargeBetaBlocker; // Discharge Beta blocker
               NewPatient.Discharge_Clopidogrel = DischargeClopidogrel; // Discharge Clopidogrel
               NewPatient.Discharge_Prasugrel = DischargePrasugrel; // Discharge Prasugrel
               NewPatient.Discharge_Statin = DischargeStatin; // Discharge Statin
               NewPatient.Discharge_Ticagrelor = DischargeTicagrelor; // Discharge Ticagrelor
               NewPatient.Discharge_Other = DischargeOther; // Discharge Other
               NewPatient.IHAE_Death = IHAEDeath; // IHAE_Death
               NewPatient.IHAE_Death_Remarks = IHAEDeathRemarks; // IHAE Death Remarks
               NewPatient.IHAE_Stroke = IHAEStroke; // IHAE Stroke
               NewPatient.IHAE_Hemorrhage = IHAEHemorrhage; // IHAE Hemorrhage
               NewPatient.IHAE_Minor_Bleed = IHAEMinorBleed; // IHAE Minor Bleed
               NewPatient.IHAE_Major_Bleed = IHAEMajorBleed; // IHAE Major Bleed
               NewPatient.IHAE_Cardiogenic_Shock = IHAECardiogenicShock; // IHAE Cardiogenic Shock
               NewPatient.IHAE_Others = IHAEOthers; // IHAE Others
               NewPatient.IHAE_Others_Remarks = IHAEOthersRemarks; // IHAE_Others_Remarks
               NewPatient.One_Month_followup_Death = OneMonthFollowupDeath; // One Month followup Death
               // NewPatient.One_Month_Followup_Re_Infarction = OneMonthFollowupReInfarction; // One Month Followup Re Infarction
               NewPatient.One_Month_Followup_Stroke = OneMonthFollowupStroke; // One Month Followup Stroke
               NewPatient.One_Year_followup_Death = OneYearFollowupDeath; // One Year followup Death
               NewPatient.One_Year_Followup_Stroke = OneYearFollowupStroke; // One Year Followup Stroke
   
               Object.keys(NewPatient).map(key => {
                  if (NewPatient[key] === undefined || NewPatient[key] === null) {
                     NewPatient[key] = '';
                  }
               });
               Object.keys(NewPatient).map(NewObj => {
                  ReportFields.ReportFieldKeys.includes(NewObj);
                  if (ReportFields.ReportFieldKeys.includes(NewObj) === false) {
                     delete NewPatient[NewObj];
                  }
               });
               DataDumpArr.push(NewPatient);

               // Get First Hospital Name
               const FMCName = (patient.FirstHospital.Hospital !== null && patient.FirstHospital.Hospital !== '' && patient.FirstHospital.Hospital.Hospital_Name !== undefined ) ? patient.FirstHospital.Hospital.Hospital_Name : '';
               const DateTimeOfFirstSTEMINetwork = patient.FirstHospital.Hospital_Arrival_Date_Time !== null ? moment(patient.FirstHospital.Hospital_Arrival_Date_Time) : '';              

               let OnsetTimePeriod = TimeOfSymptomOnset === '' ? '': parseInt(moment(TimeOfSymptomOnset, 'HH:mm').format("HH").toString(), "10");
               OnsetTimePeriod = OnsetTimePeriod === '' ? 'No Data' : OnsetTimePeriod < 3 ? '00:00 - 02:59' : OnsetTimePeriod < 6 ? '03:00 - 05:59' : OnsetTimePeriod < 9 ? '06:00 - 08:59' : OnsetTimePeriod < 12 ? '09:00 - 11:59' : OnsetTimePeriod < 15 ? '12:00 - 14:59' : OnsetTimePeriod < 18 ? '15:00 - 17:59' : OnsetTimePeriod < 21 ? '18:00 - 20:59' : OnsetTimePeriod < 24 ? '21:00 - 23:59' : 'No Data';

               let AgePeriod = (patient.Patient_Age === '' || patient.Patient_Age === null) ? '': parseInt(patient.Patient_Age, "10");
               AgePeriod = AgePeriod === '' ? '0 - 9' : AgePeriod < 10 ? '0 - 9' : AgePeriod < 20 ? '10 - 19' : AgePeriod < 30 ? '20 - 29' : AgePeriod < 40 ? '30 - 39' : AgePeriod < 50 ? '40 - 49' : AgePeriod < 60 ? '50 - 59' : AgePeriod < 70 ? '60 - 69' : AgePeriod < 80 ? '70 - 79' : AgePeriod < 80 ? '80 - 89' : AgePeriod < 90 ? '90 - 99' : AgePeriod >= 100 ? '>= 100' : '0 - 9';
               
               let OnsetToFMCPeriod = (SymptomOnsetToFirstMedicalContact === '' || SymptomOnsetToFirstMedicalContact === null) ? '': parseInt(SymptomOnsetToFirstMedicalContact, "10");
               OnsetToFMCPeriod = OnsetToFMCPeriod === '' ? '0 - 1' : OnsetToFMCPeriod < 1 ? '0 - 1' : OnsetToFMCPeriod < 2 ? '1 - 2' : OnsetToFMCPeriod < 3 ? '2 - 3' : OnsetToFMCPeriod < 4 ? '3 - 4' : OnsetToFMCPeriod < 5 ? '4 - 5' : OnsetToFMCPeriod < 6 ? '5 - 6' : OnsetToFMCPeriod < 7 ? '6 - 7' : OnsetToFMCPeriod < 8 ? '7 - 8' : OnsetToFMCPeriod < 9 ? '8 - 9' : OnsetToFMCPeriod < 10 ? '9 - 10' : OnsetToFMCPeriod < 11 ? ' 10 - 11' : OnsetToFMCPeriod < 12 ? ' 11 - 12' : OnsetToFMCPeriod < 13 ? ' 12 - 13' : OnsetToFMCPeriod < 14 ? ' 13 - 14' : OnsetToFMCPeriod < 15 ? ' 14 - 15' : OnsetToFMCPeriod < 16 ? ' 15 - 16' : OnsetToFMCPeriod < 17 ? ' 16 - 17' : OnsetToFMCPeriod < 18 ? ' 17 - 18' : OnsetToFMCPeriod < 19 ? ' 18 - 19' : OnsetToFMCPeriod < 20 ? ' 19 - 20' : OnsetToFMCPeriod < 21 ? ' 20 - 21' : OnsetToFMCPeriod < 22 ? ' 21 - 22' : OnsetToFMCPeriod < 23 ? ' 22 - 23' : OnsetToFMCPeriod < 24 ? ' 23 - 24' : OnsetToFMCPeriod >= 24 ? ' >= 24' : '0 - 1';
               
               let FMCArrivalPeriod = TimeOfFirstMedicalContact === '' ? '': parseInt(moment(TimeOfFirstMedicalContact, 'HH:mm').format("HH").toString(), "10");
               FMCArrivalPeriod = FMCArrivalPeriod === '' ? 'No Data' : FMCArrivalPeriod < 3 ? '00:00 - 02:59' : FMCArrivalPeriod < 6 ? '03:00 - 05:59' : FMCArrivalPeriod < 9 ? '06:00 - 08:59' : FMCArrivalPeriod < 12 ? '09:00 - 11:59' : FMCArrivalPeriod < 15 ? '12:00 - 14:59' : FMCArrivalPeriod < 18 ? '15:00 - 17:59' : FMCArrivalPeriod < 21 ? '18:00 - 20:59' : FMCArrivalPeriod < 24 ? '21:00 - 23:59' : 'No Data';

               let FMCArrivalToECGPeriod = FirstMedicalContactToECG === '' ? '' : parseInt(FirstMedicalContactToECG, "10");
               FMCArrivalToECGPeriod = FMCArrivalToECGPeriod === '' ? '0 - 04' : FMCArrivalToECGPeriod < 5 ? '0 - 04' : FMCArrivalToECGPeriod < 10 ? '05 - 09' : FMCArrivalToECGPeriod < 15 ? '10 - 14' : FMCArrivalToECGPeriod < 20 ? '15 - 19' : FMCArrivalToECGPeriod < 25 ? '20 - 24' : FMCArrivalToECGPeriod < 30 ? '25 - 29' : FMCArrivalToECGPeriod < 35 ? '30 - 34' : FMCArrivalToECGPeriod < 40 ? '35 - 39' : FMCArrivalToECGPeriod < 45 ? '40 - 44' : FMCArrivalToECGPeriod < 50 ? '45 - 49' : FMCArrivalToECGPeriod < 55 ? '50 - 54' : FMCArrivalToECGPeriod < 60 ? '55 - 59' : FMCArrivalToECGPeriod < 65 ? '60 - 64' : FMCArrivalToECGPeriod < 70 ? '65 - 69' : FMCArrivalToECGPeriod < 75 ? '70 - 74' : FMCArrivalToECGPeriod < 80 ? '75 - 79' : FMCArrivalToECGPeriod < 85 ? '80 - 84' : FMCArrivalToECGPeriod < 90 ? '85 - 89' : FMCArrivalToECGPeriod < 95 ? '90 - 94' : FMCArrivalToECGPeriod < 100 ? '95 - 99' : FMCArrivalToECGPeriod >= 100 ? '>=100' : '0 - 04';

               const StemiConfirmedAt = patient.Stemi_Confirmed_Date_Time !== null ? patient.Stemi_Confirmed_Date_Time : '';              
               const FirstECGAt = patient.ECG_Taken_date_time !== null ? patient.ECG_Taken_date_time : '';
               const ECGToSTEMIConfirm = (StemiConfirmedAt !== '' && FirstECGAt !== '') ? moment.duration(moment(StemiConfirmedAt).diff(moment(FirstECGAt))).asMinutes() : '';

               let ECGToSTEMIConfirmPeriod = ECGToSTEMIConfirm === '' ? '' : parseInt(ECGToSTEMIConfirm, "10");
               ECGToSTEMIConfirmPeriod = ECGToSTEMIConfirmPeriod === '' ? '0 - 04' : ECGToSTEMIConfirmPeriod < 5 ? '0 - 04' : ECGToSTEMIConfirmPeriod < 10 ? '05 - 09' : ECGToSTEMIConfirmPeriod < 15 ? '10 - 14' : ECGToSTEMIConfirmPeriod < 20 ? '15 - 19' : ECGToSTEMIConfirmPeriod < 25 ? '20 - 24' : ECGToSTEMIConfirmPeriod < 30 ? '25 - 29' : ECGToSTEMIConfirmPeriod < 35 ? '30 - 34' : ECGToSTEMIConfirmPeriod < 40 ? '35 - 39' : ECGToSTEMIConfirmPeriod < 45 ? '40 - 44' : ECGToSTEMIConfirmPeriod < 50 ? '45 - 49' : ECGToSTEMIConfirmPeriod < 55 ? '50 - 54' : ECGToSTEMIConfirmPeriod < 60 ? '55 - 59' : ECGToSTEMIConfirmPeriod < 65 ? '60 - 64' : ECGToSTEMIConfirmPeriod < 70 ? '65 - 69' : ECGToSTEMIConfirmPeriod < 75 ? '70 - 74' : ECGToSTEMIConfirmPeriod < 80 ? '75 - 79' : ECGToSTEMIConfirmPeriod < 85 ? '80 - 84' : ECGToSTEMIConfirmPeriod < 90 ? '85 - 89' : ECGToSTEMIConfirmPeriod < 95 ? '90 - 94' : ECGToSTEMIConfirmPeriod < 100 ? '95 - 99' : ECGToSTEMIConfirmPeriod >= 100 ? '>=100' :  '0 - 04';

               const STEMIConfirmToNeedle = (StemiConfirmedAt !== '' && ThrombolysisStartDateTime !== '') ? moment.duration(moment(ThrombolysisStartDateTime).diff(moment(StemiConfirmedAt))).asMinutes() : '';
               let STEMIConfirmToNeedlePeriod = STEMIConfirmToNeedle === '' ? '' : parseInt(STEMIConfirmToNeedle, "10");
               STEMIConfirmToNeedlePeriod = STEMIConfirmToNeedlePeriod === '' ? '0 - 04' : STEMIConfirmToNeedlePeriod < 5 ? '0 - 04' : STEMIConfirmToNeedlePeriod < 10 ? '05 - 09' : STEMIConfirmToNeedlePeriod < 15 ? '10 - 14' : STEMIConfirmToNeedlePeriod < 20 ? '15 - 19' : STEMIConfirmToNeedlePeriod < 25 ? '20 - 24' : STEMIConfirmToNeedlePeriod < 30 ? '25 - 29' : STEMIConfirmToNeedlePeriod < 35 ? '30 - 34' : STEMIConfirmToNeedlePeriod < 40 ? '35 - 39' : STEMIConfirmToNeedlePeriod < 45 ? '40 - 44' : STEMIConfirmToNeedlePeriod < 50 ? '45 - 49' : STEMIConfirmToNeedlePeriod < 55 ? '50 - 54' : STEMIConfirmToNeedlePeriod < 60 ? '55 - 59' : STEMIConfirmToNeedlePeriod < 65 ? '60 - 64' : STEMIConfirmToNeedlePeriod < 70 ? '65 - 69' : STEMIConfirmToNeedlePeriod < 75 ? '70 - 74' : STEMIConfirmToNeedlePeriod < 80 ? '75 - 79' : STEMIConfirmToNeedlePeriod < 85 ? '80 - 84' : STEMIConfirmToNeedlePeriod < 90 ? '85 - 89' : STEMIConfirmToNeedlePeriod < 95 ? '90 - 94' : STEMIConfirmToNeedlePeriod < 100 ? '95 - 99' : STEMIConfirmToNeedlePeriod >= 100 ? '>=100' :  '0 - 04';

               const STEMIConfirmToBalloon = (StemiConfirmedAt !== '' && BalloonStentingMinDateTime !== '') ? moment.duration(moment(BalloonStentingMinDateTime).diff(moment(StemiConfirmedAt))).asMinutes() : '';
               let STEMIConfirmToBalloonPeriod = STEMIConfirmToBalloon === '' ? '' : parseInt(STEMIConfirmToBalloon, "10");
               STEMIConfirmToBalloonPeriod = STEMIConfirmToBalloonPeriod === '' ? '0 - 04' : STEMIConfirmToBalloonPeriod < 5 ? '0 - 04' : STEMIConfirmToBalloonPeriod < 10 ? '05 - 09' : STEMIConfirmToBalloonPeriod < 15 ? '10 - 14' : STEMIConfirmToBalloonPeriod < 20 ? '15 - 19' : STEMIConfirmToBalloonPeriod < 25 ? '20 - 24' : STEMIConfirmToBalloonPeriod < 30 ? '25 - 29' : STEMIConfirmToBalloonPeriod < 35 ? '30 - 34' : STEMIConfirmToBalloonPeriod < 40 ? '35 - 39' : STEMIConfirmToBalloonPeriod < 45 ? '40 - 44' : STEMIConfirmToBalloonPeriod < 50 ? '45 - 49' : STEMIConfirmToBalloonPeriod < 55 ? '50 - 54' : STEMIConfirmToBalloonPeriod < 60 ? '55 - 59' : STEMIConfirmToBalloonPeriod < 65 ? '60 - 64' : STEMIConfirmToBalloonPeriod < 70 ? '65 - 69' : STEMIConfirmToBalloonPeriod < 75 ? '70 - 74' : STEMIConfirmToBalloonPeriod < 80 ? '75 - 79' : STEMIConfirmToBalloonPeriod < 85 ? '80 - 84' : STEMIConfirmToBalloonPeriod < 90 ? '85 - 89' : STEMIConfirmToBalloonPeriod < 95 ? '90 - 94' : STEMIConfirmToBalloonPeriod < 100 ? '95 - 99' : STEMIConfirmToBalloonPeriod >= 100 ? '>=100' :  '0 - 04';

               const EMSToNextHospitals = E_HealthCareUnit === 'Yes' ? patient.Hospital_History.length > 1 ? patient.Hospital_History[1].Hospital.Hospital_Role === 'EMS' ? 'E' : patient.Hospital_History[1].Hospital.Hospital_Role.slice(-2)  : 'Not Transferred' : '';
               const S1ToNextHospitals = D_HealthCareUnit === 'Yes' ? FirstHubHospitals.length > 0 ? FirstHubHospitals[0].Hospital.Hospital_Role.slice(-2)  : 'Not Transferred' : '' ;
               const S2ToNextHospitals = C_HealthCareUnit === 'Yes' ? FirstHubHospitals.length > 0 ? FirstHubHospitals[0].Hospital.Hospital_Role.slice(-2)  : 'Not Transferred' : '' ;

               const S1ToFirstHub = (D_HealthCareUnit === 'Yes' && patient.Hospital_History.length > 1) ? (patient.Hospital_History[1].Hospital.Hospital_Role === 'Hub H1' || patient.Hospital_History[1].Hospital.Hospital_Role === 'Hub H2') ? 'Yes' :  'No' : '' ;
               const S2ToFirstHub = (C_HealthCareUnit === 'Yes' && patient.Hospital_History.length > 1) ? (patient.Hospital_History[1].Hospital.Hospital_Role === 'Hub H1' || patient.Hospital_History[1].Hospital.Hospital_Role === 'Hub H2') ? 'Yes' :  'No' : '' ;
               const SpokeToHubTransfer = S1ToFirstHub === 'Yes' ? 'S1 to Hub' : S2ToFirstHub === 'Yes' ? 'S2 to Hub' : '';
               const ModeOfSpokeToHubTransfer = SpokeToHubTransfer !== '' ? AmbulanceTransport !== '' ? AmbulanceTransport : 'NA' : '';

               const PreviousMI = (patient.PatientCardiacHistory !== undefined && patient.PatientCardiacHistory !== '') ? patient.PatientCardiacHistory.Previous_MI === true ? 'Yes' : '' : '';
               const RiskFactor = PriorDiabetes === 'Yes' ? 'Diabetes' : PriorHTN === 'Yes' ? 'Hypertension' : ActiveSmoking === 'Yes' ? 'Smoking' : PreviousMI === 'Yes' ? 'Previous MI' :  HighCholesterol === 'Yes' ? 'High Cholesterol' : '';

               // let LocationOfInfarction = [];
					// if (patient.Location_of_Infarction && patient.Location_of_Infarction.length > 0 ) {
					// 	Object.keys(patient.Location_of_Infarction[0]).map(key => {
					// 		if (patient.Location_of_Infarction[0][key] === true) {
					// 			const val = key.replace(/_/g, ' ');
					// 			LocationOfInfarction.push(val);
					// 		}
					// 	});
					// }
               // LocationOfInfarction = LocationOfInfarction.length > 0 ? LocationOfInfarction.toString() : 'NA';
               const ModeOfPayment = (patient.Patient_Payment !== undefined && patient.Patient_Payment !== null && patient.Patient_Payment !== '') ?
                                       patient.Patient_Payment === 'State_BPL_Insurance' ? 'State BPL Insurance' :
                                       patient.Patient_Payment === 'Private_Insurance' ? 'Private Insurance' :
                                       patient.Patient_Payment === 'Self_Payment' ? 'Self Payment' :
                                       patient.Patient_Payment === 'Pm_Jay' ? 'PM-JAY' :
                                       patient.Patient_Payment === 'Others' ? 'Others' : '' : ''; 

               const ThrombolyticAgentValue = (ThrombolyticAgent !== undefined && ThrombolyticAgent !== null && ThrombolyticAgent !== '') ? ThrombolyticAgent : 'NA';
               const OnsetDateTime = patient.Symptom_Onset_Date_Time !== null ? patient.Symptom_Onset_Date_Time : '';              
               const LyticStartDateTime_1 = patient.Post_Thrombolysis !== null ? (patient.Post_Thrombolysis === 'Yes' && patient.Post_Thrombolysis_Data.Post_Thrombolysis_Start_Date_Time !== null) ? patient.Post_Thrombolysis_Data.Post_Thrombolysis_Start_Date_Time : '' :
                                             (patient.ThrombolysisDetails !== undefined && patient.ThrombolysisDetails !== '' && patient.ThrombolysisDetails.Thrombolysis === 'Yes' && patient.ThrombolysisDetails.Thrombolysis_Agent_Dosage_Start_Date_time !== null) ? patient.ThrombolysisDetails.Thrombolysis_Agent_Dosage_Start_Date_time : '';
               const OnsetToThrombolysis = (OnsetDateTime !== '' && LyticStartDateTime_1 !== '') ? moment.duration(moment(LyticStartDateTime_1).diff(moment(OnsetDateTime))).asHours() : '';
               
               let OnsetToThrombolysisPeriod = OnsetToThrombolysis === '' ? '' : parseInt(OnsetToThrombolysis, "10");
               OnsetToThrombolysisPeriod = OnsetToThrombolysisPeriod === '' ? '0 - 14' : OnsetToThrombolysisPeriod < 15 ? '0 - 14' : OnsetToThrombolysisPeriod < 30 ? '15 - 29' : OnsetToThrombolysisPeriod < 45 ? '30 - 44' : OnsetToThrombolysisPeriod < 60 ? '45 - 59' : OnsetToThrombolysisPeriod < 75 ? '60 - 74' : OnsetToThrombolysisPeriod < 90 ? '75 - 89' : OnsetToThrombolysisPeriod < 105 ? '90 - 104' : OnsetToThrombolysisPeriod < 120 ? '105 - 119' : OnsetToThrombolysisPeriod >= 120 ? '>=120' : '0 - 14';
               
               let DoorToNeedleTimePeriod = DoorToNeedleTime === '' ? '' : parseInt(DoorToNeedleTime, "10");
               DoorToNeedleTimePeriod = DoorToNeedleTimePeriod === '' ? null : DoorToNeedleTimePeriod < 5 ? '0 - 04' : DoorToNeedleTimePeriod < 10 ? '05 - 09' : DoorToNeedleTimePeriod < 15 ? '10 - 14' : DoorToNeedleTimePeriod < 20 ? '15 - 19' : DoorToNeedleTimePeriod < 25 ? '20 - 24' : DoorToNeedleTimePeriod < 30 ? '25 - 29' : DoorToNeedleTimePeriod < 35 ? '30 - 34' : DoorToNeedleTimePeriod < 40 ? '35 - 39' : DoorToNeedleTimePeriod < 45 ? '40 - 44' : DoorToNeedleTimePeriod < 50 ? '45 - 49' : DoorToNeedleTimePeriod < 55 ? '50 - 54' : DoorToNeedleTimePeriod < 60 ? '55 - 59' : DoorToNeedleTimePeriod < 65 ? '60 - 64' : DoorToNeedleTimePeriod < 70 ? '65 - 69' : DoorToNeedleTimePeriod < 75 ? '70 - 74' : DoorToNeedleTimePeriod < 80 ? '75 - 79' : DoorToNeedleTimePeriod < 85 ? '80 - 84' : DoorToNeedleTimePeriod < 90 ? '85 - 89' : DoorToNeedleTimePeriod < 95 ? '90 - 94' : DoorToNeedleTimePeriod < 100 ? '95 - 99' : DoorToNeedleTimePeriod >= 100 ? '>= 100' : null;
               
               const DoorToNeedleTimeInt = DoorToNeedleTime === '' ? 0 : parseInt(DoorToNeedleTime, "10");
               const DoorToNeedleWithin30 = DoorToNeedleTimeInt !== '' ? DoorToNeedleTimeInt <= 30 ? 'Yes' : 'No' : '';
               const DoorToNeedleMoreThan30 = DoorToNeedleTimeInt !== '' ? DoorToNeedleTimeInt > 30 ? 'Yes' : 'No' : '';

               let NeedleToBallooTimePeriod = ThrombolysisToPCI === '' ? '' : parseInt(ThrombolysisToPCI, "10");
               NeedleToBallooTimePeriod = NeedleToBallooTimePeriod === '' ? '0 - 29' : NeedleToBallooTimePeriod < 30 ? '0 - 29' : NeedleToBallooTimePeriod < 60 ? '30 - 59' : NeedleToBallooTimePeriod < 90 ? '60 - 89' : NeedleToBallooTimePeriod < 120 ? '90 - 119' : NeedleToBallooTimePeriod < 150 ? '120 - 149' :  NeedleToBallooTimePeriod >= 150 ? '>= 150' : '0 - 29';
               
               let LyticMedication = [];
               if (ThrombolysisMedicationAspirin === 'Yes') { LyticMedication.push('Aspirin'); }
               if (ThrombolysisMedicationClopidogrel === 'Yes') { LyticMedication.push('Clopidogrel'); }
               if (ThrombolysisMedicationHeparin === 'Yes') { LyticMedication.push('Heparin'); }
               if (ThrombolysisMedicationTicagrelor === 'Yes') { LyticMedication.push('Ticagrelor'); }
               if (ThrombolysisMedicationOther === 'Yes') { LyticMedication.push('Other'); }
               LyticMedication = LyticMedication.toString();

               const BalloonDateTime = StentDeploymentDateArr.length > 0 ? moment.min(StentDeploymentDateArr) : '';
               const OnsetToBalloon = (OnsetDateTime !== '' && BalloonDateTime !== '') ? moment.duration(moment(BalloonDateTime).diff(moment(OnsetDateTime))).asHours() : '';
               
               let OnsetToBalloonPeriod = OnsetToBalloon === '' ? '' : parseInt(OnsetToBalloon, "10");
               OnsetToBalloonPeriod = OnsetToBalloonPeriod === '' ? '0 - 04' : OnsetToBalloonPeriod < 5 ? '0 - 04' : OnsetToBalloonPeriod < 10 ? '05 - 09' : OnsetToBalloonPeriod < 15 ? '10 - 14' : OnsetToBalloonPeriod < 20 ? '15 - 19' : OnsetToBalloonPeriod < 25 ? '20 - 24' : OnsetToBalloonPeriod < 30 ? '25 - 29' : OnsetToBalloonPeriod < 35 ? '30 - 34' : OnsetToBalloonPeriod < 40 ? '35 - 39' : OnsetToBalloonPeriod < 45 ? '40 - 44' : OnsetToBalloonPeriod < 50 ? '45 - 49' : OnsetToBalloonPeriod < 55 ? '50 - 54' : OnsetToBalloonPeriod < 60 ? '55 - 59' : OnsetToBalloonPeriod < 65 ? '60 - 64' : OnsetToBalloonPeriod < 70 ? '65 - 69' : OnsetToBalloonPeriod < 75 ? '70 - 74' : OnsetToBalloonPeriod < 80 ? '75 - 79' : OnsetToBalloonPeriod < 85 ? '80 - 84' : OnsetToBalloonPeriod < 90 ? '85 - 89' : OnsetToBalloonPeriod < 95 ? '90 - 94' : OnsetToBalloonPeriod < 100 ? '95 - 99' : OnsetToBalloonPeriod >= 100 ? '>= 100' : '0 - 04';

               let DoorToBalloonPeriod = DoorToBalloonTime === '' ? '' : parseInt(DoorToBalloonTime, "10");
               DoorToBalloonPeriod = DoorToBalloonPeriod === '' ? null : DoorToBalloonPeriod < 20 ? '0 - 19' : DoorToBalloonPeriod < 40 ? '20 - 39' : DoorToBalloonPeriod < 60 ? '40 - 59' : DoorToBalloonPeriod < 80 ? '60 - 79' : DoorToBalloonPeriod < 100 ? '80 - 99' : DoorToBalloonPeriod < 120 ? '100 - 119' : DoorToBalloonPeriod >= 120 ? '>= 120' : null;
               
               const DoorToBalloonTimeInt = DoorToBalloonTime === '' ? 0 : parseInt(DoorToBalloonTime, "10");
               const DoorToBalloonWithin90 = DoorToBalloonTimeInt !== '' ? DoorToBalloonTimeInt <= 90 ? 'Yes' : 'No' : '';
               const DoorToBalloonMoreThan90 = DoorToBalloonTimeInt !== '' ? DoorToBalloonTimeInt > 90 ? 'Yes' : 'No' : '';

               const ThrombolysisToAngioHour = (AngiographyStart !== '' && ThrombolysisStartDateTime_2 !== '') ? moment.duration(moment(AngiographyStart).diff(moment(ThrombolysisStartDateTime_2))).asHours() : '';
               let ThrombolysisToAngioPeriod = ThrombolysisToAngioHour === '' ? '': parseInt(ThrombolysisToAngioHour, "10");
               ThrombolysisToAngioPeriod = ThrombolysisToAngioPeriod === '' ? '0-3' : ThrombolysisToAngioPeriod <= 3 ? '0 - 3' : ThrombolysisToAngioPeriod <= 6 ? '4 - 6' : ThrombolysisToAngioPeriod <= 9 ? '7 - 9' : ThrombolysisToAngioPeriod <= 12 ? '10 - 12' : ThrombolysisToAngioPeriod <= 15 ? '13 - 15' : ThrombolysisToAngioPeriod <= 18 ? '17 - 18' : ThrombolysisToAngioPeriod <= 21 ? '19 - 21' : ThrombolysisToAngioPeriod <= 24 ? '22 - 24' : ThrombolysisToAngioPeriod <= 27 ? '25 - 27' : ThrombolysisToAngioPeriod <= 30 ? '28 - 30' : ThrombolysisToAngioPeriod <= 33 ? '31 - 33' : ThrombolysisToAngioPeriod <= 36 ? '34 - 36' : ThrombolysisToAngioPeriod <= 39 ? '37 - 39' : ThrombolysisToAngioPeriod <= 42 ? '40 - 42' : ThrombolysisToAngioPeriod <= 45 ? '41 - 45' : ThrombolysisToAngioPeriod <= 48 ? '46 - 48' : ThrombolysisToAngioPeriod > 48 ? '> 48' : '0 - 3';
               
               const SuccessfulLysis = (patient.ThrombolysisDetails !== undefined && patient.ThrombolysisDetails !== '' && patient.ThrombolysisDetails.Thrombolysis === 'Yes' && patient.ThrombolysisDetails.Thrombolysis_Successful_Lysis !== '' ) ? patient.ThrombolysisDetails.Thrombolysis_Successful_Lysis  : '';
               
               const AngioFindings = (patient.PCIDetails !== undefined && patient.PCIDetails !== '' && patient.PCIDetails.Pci_Cart !== '' ) ? patient.PCIDetails.Pci_Cart : '';

               const ThrombolysisToAngioWithIn24Hrs = ThrombolysisToAngio !== '' ? ThrombolysisToAngio <= 1440 ? 'Yes' : 'No' : '';
               const ThrombolysisToAngioMoreThan24Hrs = ThrombolysisToAngio !== '' ? ThrombolysisToAngio > 1440 ? 'Yes' : 'No' : '';
               const ThrombolysisToPCIWithIn24Hrs = ThrombolysisToPCI !== '' ? ThrombolysisToPCI <= 1440 ? 'Yes' : 'No' : '';
               const ThrombolysisToPCIMoreThan24Hrs = ThrombolysisToPCI !== '' ? ThrombolysisToPCI > 1440 ? 'Yes' : 'No' : '';

               let PCIHospitalRole = '';
                  if (patient.PCIDetails !== undefined && patient.PCIDetails !== '') {
                     const Idx = patient.HospitalDetails.findIndex(HosDet => HosDet._id === patient.PCIDetails.Hospital);
                     const PCIHospital = patient.HospitalDetails[Idx];
                     PCIHospitalRole = PCIHospital.Hospital_Role.slice(-2);
                  }

               const PCIType =  (Lytic === 'Yes' && CoronaryAngiography === 'Yes') ? 'Pharmaco-invasive' : ((Lytic === 'No' || Lytic === '') && CoronaryAngiography === 'Yes') ?  'Primary PCI' : '';

               let CulpritVessel = '';
               let CulpritVesselPercent = 0;
               if (patient.PCIDetails !== undefined && patient.PCIDetails !== '') {
                  if (patient.PCIDetails.CulpritVesselArray !== undefined && patient.PCIDetails.CulpritVesselArray !== '' && patient.PCIDetails.CulpritVesselArray.length > 0 ) {
                     const CVValue = patient.PCIDetails.CulpritVesselArray[0].Pci_Culprit_Vessel;
                     if (CVValue !== undefined && CVValue !== null && CVValue !== '') {
                        CulpritVessel =  CVValue.includes('LAD') ? 'LAD' : CVValue.includes('LCX') ? 'LCX' : CVValue.includes('RCA') ? 'RCA' : 'Others'; 
                     }
                     const CVPercent = patient.PCIDetails.CulpritVesselArray[0].Pci_Culprit_Vessel_Percent;
                     if (CVPercent !== undefined && CVPercent !== null && CVPercent !== '') {
                        CulpritVesselPercent = CVPercent; 
                     }
                  }
               }

               const IfAdditionalVessel = (patient.PCIDetails !== undefined && patient.PCIDetails !== '' && patient.PCIDetails.VesselArray !== undefined && patient.PCIDetails.VesselArray !== '' && patient.PCIDetails.VesselArray.length > 0 && patient.PCIDetails.VesselArray[0].Pci_Cart_Vessel !== '' && patient.PCIDetails.VesselArray[0].Pci_Cart_Vessel !== null ) ? 'Yes' : '';

               let DrugBeforePCIMedication = [];
               if (DrugBeforePCIAspirin !== '' && DrugBeforePCIAspirin !== 'No') { DrugBeforePCIMedication.push('Aspirin'); }
               if (DrugBeforePCIClopidogrel !== '' && DrugBeforePCIClopidogrel !== 'No') { DrugBeforePCIMedication.push('Clopidogrel'); }
               if (DrugBeforePCIPrasugrel !== '' && DrugBeforePCIPrasugrel !== 'No') { DrugBeforePCIMedication.push('Prasugrel'); }
               if (DrugBeforePCITicagrelor !== '' && DrugBeforePCITicagrelor !== 'No') { DrugBeforePCIMedication.push('Ticagrelor'); }
               if (DrugBeforePCIOther !== '' && DrugBeforePCIOther !== 'No') { DrugBeforePCIMedication.push('Others'); }
               DrugBeforePCIMedication = DrugBeforePCIMedication.toString();

               const VesselCategory = (CulpritVessel !== '' && IfAdditionalVessel === 'Yes') ? 'Culprit Plus Additional' : (CulpritVessel !== '' && IfAdditionalVessel !== 'Yes') ? 'Culprit Only' : ''; 

               const Data = {
                  Data_Type: patient.Data_Type,
                  Location: Location,
                  Cluster: OriginCluster,
                  FMC_Name: FMCName,
                  FMC_Role: SiteOf1stMedicalContact,
                  FMC_Arrival_DateTime: DateTimeOfFirstSTEMINetwork,
                  Spoke_To_Hub: SpokeToHub,
                  Death: IHAEDeath,
                  TreatmentStrategy: 'No Treatment'
               };

               let treatmentStrategy = 'No Treatment';
               if (Lytic === 'Yes' && CoronaryAngiography !== 'Yes' && PCI !== 'Yes') {
                  Data.TreatmentStrategy = 'Standalone Thrombolysis';
                  let StandaloneThrombolysis = Object.assign({}, Data);
                  StandaloneThrombolysis.Value = 'Standalone Thrombolysis';
                  TreatmentModalitiesArr.push(StandaloneThrombolysis);
                  treatmentStrategy = 'Standalone Thrombolysis';
               } else if (Lytic === 'Yes' && CoronaryAngiography === 'Yes' && (PCI !== 'Yes' || PCI === 'Yes')) {
                  Data.TreatmentStrategy = 'Pharmacoinvasive treatment';
                  let PharmacoInvasiveTherapy = Object.assign({}, Data);
                  PharmacoInvasiveTherapy.Value = 'Pharmacoinvasive treatment (Thrombolysis followed by Angiogram/PCI) ';
                  TreatmentModalitiesArr.push(PharmacoInvasiveTherapy);
                  treatmentStrategy = 'Pharmacoinvasive treatment';
               } else if (Lytic !== 'Yes' && CoronaryAngiography === 'Yes' && (PCI !== 'Yes' || PCI === 'Yes')) {
                  Data.TreatmentStrategy = 'Angiogram/Primary PCI';
                  let AngiogramAndPrimaryPCI = Object.assign({}, Data);
                  AngiogramAndPrimaryPCI.Value = 'Angiogram/Primary PCI ';
                  TreatmentModalitiesArr.push(AngiogramAndPrimaryPCI);
                  treatmentStrategy = 'Angiogram/Primary PCI';
               } else if (Lytic !== 'Yes' && CoronaryAngiography !== 'Yes' && PCI !== 'Yes') {
                  let NoTreatment = Object.assign({}, Data);
                  NoTreatment.Value = 'No Treatment';
                  TreatmentModalitiesArr.push(NoTreatment);
                  treatmentStrategy = 'No Treatment';
               }

               if (AdmissionAspirin === 'Yes') {
                  let AdmissionAspirinData = Object.assign({}, Data);
                  AdmissionAspirinData.Category = 'Admission';
                  AdmissionAspirinData.Medication = 'Aspirin';
                  MedicationArr.push(AdmissionAspirinData);
               }
               if (AdmissionClopidogrel === 'Yes') {
                  let AdmissionClopidogrelData = Object.assign({}, Data);
                  AdmissionClopidogrelData.Category = 'Admission';
                  AdmissionClopidogrelData.Medication = 'Clopidogrel';
                  MedicationArr.push(AdmissionClopidogrelData);
               }
               if (AdmissionHeparin === 'Yes') {
                  let AdmissionHeparinData = Object.assign({}, Data);
                  AdmissionHeparinData.Category = 'Admission';
                  AdmissionHeparinData.Medication = 'Heparin';
                  MedicationArr.push(AdmissionHeparinData);
               }
               if (AdmissionPrasugrel === 'Yes') {
                  let AdmissionPrasugrelData = Object.assign({}, Data);
                  AdmissionPrasugrelData.Category = 'Admission';
                  AdmissionPrasugrelData.Medication = 'Prasugrel';
                  MedicationArr.push(AdmissionPrasugrelData);
               }
               if (AdmissionTicagrelor === 'Yes') {
                  let AdmissionTicagrelorData = Object.assign({}, Data);
                  AdmissionTicagrelorData.Category = 'Admission';
                  AdmissionTicagrelorData.Medication = 'Ticagrelor';
                  MedicationArr.push(AdmissionTicagrelorData);
               }
               if (AdmissionOther === 'Yes') {
                  let AdmissionOtherData = Object.assign({}, Data);
                  AdmissionOtherData.Category = 'Admission';
                  AdmissionOtherData.Medication = 'Other';
                  MedicationArr.push(AdmissionOtherData);
               }

               if (DischargeABROrACEI === 'Yes') {
                  let DischargeABRData = Object.assign({}, Data);
                  DischargeABRData.Category = 'Discharge';
                  DischargeABRData.Medication = 'ARB/ACEI';
                  MedicationArr.push(DischargeABRData);
               }
               if (DischargeAspirin === 'Yes') {
                  let DischargeAspirinData = Object.assign({}, Data);
                  DischargeAspirinData.Category = 'Discharge';
                  DischargeAspirinData.Medication = 'Aspirin';
                  MedicationArr.push(DischargeAspirinData);
               }
               if (DischargeBetaBlocker === 'Yes') {
                  let DischargeBetaBlockerData = Object.assign({}, Data);
                  DischargeBetaBlockerData.Category = 'Discharge';
                  DischargeBetaBlockerData.Medication = 'Beta Blocker';
                  MedicationArr.push(DischargeBetaBlockerData);
               }
               if (DischargeClopidogrel === 'Yes') {
                  let DischargeClopidogrelData = Object.assign({}, Data);
                  DischargeClopidogrelData.Category = 'Discharge';
                  DischargeClopidogrelData.Medication = 'Clopidogrel';
                  MedicationArr.push(DischargeClopidogrelData);
               }
               if (DischargePrasugrel === 'Yes') {
                  let DischargePrasugrelData = Object.assign({}, Data);
                  DischargePrasugrelData.Category = 'Discharge';
                  DischargePrasugrelData.Medication = 'Prasugrel';
                  MedicationArr.push(DischargePrasugrelData);
               }
               if (DischargeStatin === 'Yes') {
                  let DischargeStatinData = Object.assign({}, Data);
                  DischargeStatinData.Category = 'Discharge';
                  DischargeStatinData.Medication = 'Statin';
                  MedicationArr.push(DischargeStatinData);
               }
               if (DischargeTicagrelor === 'Yes') {
                  let DischargeTicagrelorData = Object.assign({}, Data);
                  DischargeTicagrelorData.Category = 'Discharge';
                  DischargeTicagrelorData.Medication = 'Ticagrelor';
                  MedicationArr.push(DischargeTicagrelorData);
               }
               if (DischargeOther === 'Yes') {
                  let DischargeOtherData = Object.assign({}, Data);
                  DischargeOtherData.Category = 'Discharge';
                  DischargeOtherData.Medication = 'Other';
                  MedicationArr.push(DischargeOtherData);
               }

               if (IHAEDeath === 'Yes') {
                  let IHAEDeathData = Object.assign({}, Data);
                  IHAEDeathData.MACEValue = 'Death';
                  MaceArr.push(IHAEDeathData);
                  let TotalData = Object.assign({}, Data);
                  TotalData.MACEValue = 'Total MACE';
                  MaceArr.push(TotalData);
               }
               if (IHAEReInfarction === 'Yes') {
                  let IHAEReInfarctionData = Object.assign({}, Data);
                  IHAEReInfarctionData.MACEValue = 'Re-Infarction';
                  MaceArr.push(IHAEReInfarctionData);
                  let TotalData = Object.assign({}, Data);
                  TotalData.MACEValue = 'Total MACE';
                  MaceArr.push(TotalData);
               }
               if (IHAEStroke === 'Yes') {
                  let IHAEStrokeData = Object.assign({}, Data);
                  IHAEStrokeData.MACEValue = 'Stroke';
                  MaceArr.push(IHAEStrokeData);
                  let TotalData = Object.assign({}, Data);
                  TotalData.MACEValue = 'Total MACE';
                  MaceArr.push(TotalData);
               }

               let LocationOfInfarctionValueArr = [];
					if (patient.Location_of_Infarction && patient.Location_of_Infarction.length  > 0) {
						Object.keys(patient.Location_of_Infarction[0]).map(key => {
							if (patient.Location_of_Infarction[0][key] === true) {
								const val = key.replace(/_/g, ' ');
								LocationOfInfarctionValueArr.push(val);
							}
						});
					}

               LocationOfInfarctionValueArr.map(value => {
                  if (value === 'Anterior Wall MI') {
                     let AnteriorWallData = Object.assign({}, Data);
                     AnteriorWallData.Value = 'Anterior Wall MI';
                     LocationOfInfarctionArr.push(AnteriorWallData);
                  } else if (value === 'Inferior Wall MI') {
                     let InferiorWallData = Object.assign({}, Data);
                     InferiorWallData.Value = 'Inferior Wall MI';
                     LocationOfInfarctionArr.push(InferiorWallData);
                  } else if (value === 'Posterior Wall MI') {
                     let PosteriorWallData = Object.assign({}, Data);
                     PosteriorWallData.Value = 'Posterior Wall MI';
                     LocationOfInfarctionArr.push(PosteriorWallData);
                  } else if (value === 'Lateral Wall MI') {
                     let LateralWallData = Object.assign({}, Data);
                     LateralWallData.Value = 'Lateral Wall MI';
                     LocationOfInfarctionArr.push(LateralWallData);
                  } else if (value === 'RV Infarction MI') {
                     let RVInfarctionData = Object.assign({}, Data);
                     RVInfarctionData.Value = 'RV Infarction MI';
                     LocationOfInfarctionArr.push(RVInfarctionData);
                  }
               });

               if (DrugBeforePCIAspirin !== '' && DrugBeforePCIAspirin !== 'No') {
                  let AspirinData = Object.assign({}, Data);
                  AspirinData.Value = 'Aspirin';
                  DrugBeforePCIMedicationArr.push(AspirinData);
               }
               if (DrugBeforePCIClopidogrel !== '' && DrugBeforePCIClopidogrel !== 'No') {
                  let ClopidogrelData = Object.assign({}, Data);
                  ClopidogrelData.Value = 'Clopidogrel';
                  DrugBeforePCIMedicationArr.push(ClopidogrelData);
               }
               if (DrugBeforePCIPrasugrel !== '' && DrugBeforePCIPrasugrel !== 'No') {
                  let PrasugrelData = Object.assign({}, Data);
                  PrasugrelData.Value = 'Prasugrel';
                  DrugBeforePCIMedicationArr.push(PrasugrelData);
               }
               if (DrugBeforePCITicagrelor !== '' && DrugBeforePCITicagrelor !== 'No') {
                  let TicagrelorData = Object.assign({}, Data);
                  TicagrelorData.Value = 'Ticagrelor';
                  DrugBeforePCIMedicationArr.push(TicagrelorData);
               }
               if (DrugBeforePCIOther !== '' && DrugBeforePCIOther !== 'No') {
                  let OthersData = Object.assign({}, Data);
                  OthersData.Value = 'Others';
                  DrugBeforePCIMedicationArr.push(OthersData);
               }

               if (patient.PCIDetails !== undefined && patient.PCIDetails !== '') {
                  if (patient.PCIDetails.VesselArray !== undefined && patient.PCIDetails.VesselArray !== '' && patient.PCIDetails.VesselArray.length > 0 ) {
                     patient.PCIDetails.VesselArray.map(vessel => {
                        let VValue = vessel.Pci_Cart_Vessel;
                        if (VValue !== undefined && VValue !== null && VValue !== '') {
                           VValue =  VValue.includes('LAD') ? 'LAD' : VValue.includes('LCX') ? 'LCX' : VValue.includes('RCA') ? 'RCA' : 'Others';
                           let VValueData = Object.assign({}, Data);
                           VValueData.Vessel = VValue;
                           VesselStentArr.push(VValueData);
                        }
                     });
                  }
               }

               delete Data.Vessel;
               if (patient.PCIDetails !== undefined && patient.PCIDetails !== '') {
                  if (patient.PCIDetails.CulpritVesselArray !== undefined && patient.PCIDetails.CulpritVesselArray !== '' && patient.PCIDetails.CulpritVesselArray.length > 0 ) {
                     patient.PCIDetails.CulpritVesselArray.map(CVessel => {
                        const BMS = CVessel.PCI_Intervention_Bms;
                        if (BMS !== undefined && BMS !== null && BMS !== '') {
                           let StentData = Object.assign({}, Data);
                           StentData.Stent = 'BMS';
                           StentsArr.push(StentData);
                        }
                        const DES = CVessel.PCI_Intervention_DES;
                        if (DES !== undefined && DES !== null && DES !== '') {
                           let StentData_1 = Object.assign({}, Data);
                           StentData_1.Stent = 'DES';
                           StentsArr.push(StentData_1);
                        }
                        const MGuard = CVessel.PCI_Intervention_MGuard;
                        if (MGuard !== undefined && MGuard !== null && MGuard !== '') {
                           let StentData_2 = Object.assign({}, Data);
                           StentData_2.Stent = 'MGAURD';
                           StentsArr.push(StentData_2);
                        }
                     });
                  }
                  if (patient.PCIDetails.VesselArray !== undefined && patient.PCIDetails.VesselArray !== '' && patient.PCIDetails.VesselArray.length > 0 ) {
                     patient.PCIDetails.VesselArray.map(vessel => {
                        const BMS = vessel.PCI_Intervention_Bms;
                        if (BMS !== undefined && BMS !== null && BMS !== '') {
                           let StentData_3 = Object.assign({}, Data);
                           StentData_3.Stent = 'BMS';
                           StentsArr.push(StentData_3);
                        }
                        const DES = vessel.PCI_Intervention_DES;
                        if (DES !== undefined && DES !== null && DES !== '') {
                           let StentData_4 = Object.assign({}, Data);
                           StentData_4.Stent = 'DES';
                           StentsArr.push(StentData_4);
                        }
                        const MGuard = vessel.PCI_Intervention_MGuard;
                        if (MGuard !== undefined && MGuard !== null && MGuard !== '') {
                           let StentData_5 = Object.assign({}, Data);
                           StentData_5.Stent = 'MGAURD';
                           StentsArr.push(StentData_5);
                        }
                     });
                  }
               }

					if (PriorDiabetes === 'Yes') {
                  let IfPriorDiabetes = Object.assign({}, Data);
                  IfPriorDiabetes.Value = 'Diabetes';
                  RiskFactorArr.push(IfPriorDiabetes);
               }
               if (PriorHTN === 'Yes') {
                  let IfPriorHTN = Object.assign({}, Data);
                  IfPriorHTN.Value = 'Hypertension';
                  RiskFactorArr.push(IfPriorHTN);
               }
					if (ActiveSmoking === 'Yes') {
                  let IfActiveSmoking = Object.assign({}, Data);
                  IfActiveSmoking.Value = 'Smoking';
                  RiskFactorArr.push(IfActiveSmoking);
               }
					if (PreviousMI === 'Yes') {
                  let IfPreviousMI = Object.assign({}, Data);
                  IfPreviousMI.Value = 'PreviousMI';
                  RiskFactorArr.push(IfPreviousMI);
               }
					if (HighCholesterol === 'Yes') {
                  let IfHighCholesterol = Object.assign({}, Data);
                  IfHighCholesterol.Value = 'HighCholesterol';
                  RiskFactorArr.push(IfHighCholesterol);
               }

               // Get Discharge To Home (Yes/No)
               let DischargeToHome = '';
               if (typeof patient.DischargeTransferDetails === 'object' && patient.DischargeTransferDetails.length !== undefined && patient.DischargeTransferDetails.length > 0) {
                  if (patient.DischargeTransferDetails[0].Discharge_Transfer_To !== '' && patient.DischargeTransferDetails[0].Discharge_Transfer_To !== null ) {
                     DischargeToHome = patient.DischargeTransferDetails[0].Discharge_Transfer_To === 'Home' ? 'Yes' : 'No';
                  }
               }

               // Get Transfer To Non-Cluster (Yes/No)
               let TransferToNonCluster = '';
               if (typeof patient.DischargeTransferDetails === 'object' && patient.DischargeTransferDetails.length !== undefined && patient.DischargeTransferDetails.length > 0) {
                  if (patient.DischargeTransferDetails[0].Discharge_Transfer_To !== '' && patient.DischargeTransferDetails[0].Discharge_Transfer_To !== null ) {
                     DischargeToHome = patient.DischargeTransferDetails[0].Discharge_Transfer_To === 'Non_Stemi_Cluster' ? 'Yes' : 'No';
                  }
               }

               // Get Transfer To Non-Cluster (Yes/No)
               let TransferToHub = '';
               if (patient.ThrombolysisDetails !== undefined && patient.ThrombolysisDetails !== null ) {
                  const S1Hospitals = patient.Hospital_History.filter(hos => hos.Hospital.Hospital_Role === 'Spoke S1');
                  const S1Filter = S1Hospitals.filter(hos => hos.Hospital._id === patient.ThrombolysisDetails.Hospital );
                  if (S1Filter.length > 0 ) {
                     TransferToHub = ABHospital === 'Yes' ? 'Yes' : 'No';
                  }
               }

               const MySQLPatientData = {};
               MySQLPatientData.DateOfRegistration = DateOfRegistration;
               MySQLPatientData.Location = Location;
               MySQLPatientData.Data_Type = patient.Data_Type;
               MySQLPatientData.Cluster = OriginCluster;
               MySQLPatientData.FMC_Name = FMCName;
               MySQLPatientData.FMC_Role = SiteOf1stMedicalContact;
               MySQLPatientData.Register_From = RegisterFrom;
               MySQLPatientData.Gender = patient.Patient_Gender;
               MySQLPatientData.FemaleGender = FemaleGender;
               MySQLPatientData.Age = patient.Patient_Age;
               MySQLPatientData.Age_Period = AgePeriod;
               MySQLPatientData.Onset_Time = TimeOfSymptomOnset;
               MySQLPatientData.Onset_Time_Period = OnsetTimePeriod;
               MySQLPatientData.Onset_To_FMC = SymptomOnsetToFirstMedicalContact;
               MySQLPatientData.Onset_To_FMC_Period = OnsetToFMCPeriod;
               MySQLPatientData.FMC_Arrival_DateTime = DateTimeOfFirstSTEMINetwork;
               MySQLPatientData.FMC_Arrival = TimeOfFirstMedicalContact;
               MySQLPatientData.FMC_Arrival_Period = FMCArrivalPeriod;
               MySQLPatientData.ModeOf_FMC_Arrival = AmbulanceTransport;
               MySQLPatientData.FMC_Arrival_To_ECG = FirstMedicalContactToECG;
               MySQLPatientData.FMC_Arrival_To_ECG_Period = FMCArrivalToECGPeriod;
               MySQLPatientData.ECG_To_STEMI_Confirm = ECGToSTEMIConfirm;
               MySQLPatientData.ECG_To_STEMI_Confirm_Period = ECGToSTEMIConfirmPeriod;
               MySQLPatientData.STEMI_Confirm_To_Needle = STEMIConfirmToNeedle;
               MySQLPatientData.STEMI_Confirm_To_Needle_Period = STEMIConfirmToNeedlePeriod;
               MySQLPatientData.STEMI_Confirm_To_Balloon = STEMIConfirmToBalloon;
               MySQLPatientData.STEMI_Confirm_To_Balloon_Period = STEMIConfirmToBalloonPeriod;
               MySQLPatientData.Direct_EMS = E_HealthCareUnit;
               MySQLPatientData.EMS_To = EMSToNextHospitals;
               MySQLPatientData.Direct_S1 = D_HealthCareUnit;
               MySQLPatientData.S1_To = S1ToNextHospitals;
               MySQLPatientData.Direct_S2 = C_HealthCareUnit;
               MySQLPatientData.S2_To = S2ToNextHospitals;
               MySQLPatientData.Lytic = Lytic === 'Yes' ? 'Thrombolysed' : Lytic === 'No' ? 'Not Thrombolysed' : 'NA';
               MySQLPatientData.Spoke_To_Hub = SpokeToHub;
               MySQLPatientData.Spoke_To_Hub_Transfer = SpokeToHubTransfer;
               MySQLPatientData.ModeOf_Spoke_To_Hub_Transfer = ModeOfSpokeToHubTransfer;
               MySQLPatientData.Risk_Factor = RiskFactor;
               MySQLPatientData.Location_Of_Infarction = LocationOfInfarction;
               MySQLPatientData.Mode_Of_Payment = ModeOfPayment;
               MySQLPatientData.Thrombolytic_Agent = ThrombolyticAgentValue;
               MySQLPatientData.Onset_To_Thrombolysis = OnsetToThrombolysis;
               MySQLPatientData.Onset_To_Thrombolysis_Period = OnsetToThrombolysisPeriod;
               MySQLPatientData.Door_To_Needle = DoorToNeedleTime;
               MySQLPatientData.Door_To_Needle_Period = DoorToNeedleTimePeriod;
               MySQLPatientData.Door_To_Needle_WithIn30Min = DoorToNeedleWithin30;
               MySQLPatientData.Door_To_Needle_MoreThan30Min = DoorToNeedleMoreThan30;
               MySQLPatientData.Needle_To_BallooTime = ThrombolysisToPCI;
               MySQLPatientData.Needle_To_BallooTime_Period = NeedleToBallooTimePeriod;
               MySQLPatientData.Lytic_Medication = LyticMedication;
               MySQLPatientData.Onset_To_Balloon = OnsetToBalloon;
               MySQLPatientData.Onset_To_Balloon_Period = OnsetToBalloonPeriod;
               MySQLPatientData.Door_To_Balloon = DoorToBalloonTime;
               MySQLPatientData.Door_To_Balloon_Period = DoorToBalloonPeriod;
               MySQLPatientData.Door_To_Balloon_WithIn90Min = DoorToBalloonWithin90;
               MySQLPatientData.Door_To_Balloon_MoreThan90Min = DoorToBalloonMoreThan90;
               MySQLPatientData.Thrombolysis_To_Angio = ThrombolysisToAngio;
               MySQLPatientData.Thrombolysis_To_Angio_Period = ThrombolysisToAngioPeriod;
               MySQLPatientData.Successful_Lysis = SuccessfulLysis;
               MySQLPatientData.PCI_Hospital_Role = PCIHospitalRole;
               MySQLPatientData.Coronary_Angiography = CoronaryAngiography;
               MySQLPatientData.PCI = PCI;
               MySQLPatientData.Angio_Findings = AngioFindings;
               MySQLPatientData.Thrombolysis_To_PCI = ThrombolysisToPCI;
               MySQLPatientData.Thrombolysis_To_Angio_WithIn24Hrs = ThrombolysisToAngioWithIn24Hrs;
               MySQLPatientData.Thrombolysis_To_Angio_MoreThan24Hrs = ThrombolysisToAngioMoreThan24Hrs;
               MySQLPatientData.Thrombolysis_To_PCI_WithIn24Hrs = ThrombolysisToPCIWithIn24Hrs;
               MySQLPatientData.Thrombolysis_To_PCI_MoreThan24Hrs = ThrombolysisToPCIMoreThan24Hrs;
               MySQLPatientData.PCI_Type = PCIType;
               MySQLPatientData.Culprit_Vessel = CulpritVessel;
               MySQLPatientData.Culprit_Vessel_Percent = CulpritVesselPercent;
               MySQLPatientData.If_Additional_Vessel = IfAdditionalVessel;
               MySQLPatientData.Drug_Before_PCI_Medication = DrugBeforePCIMedication;
               MySQLPatientData.Vessel_Category = VesselCategory;
               MySQLPatientData.MonthAndYear = MonthAndYear;
               MySQLPatientData.Death = IHAEDeath;
               MySQLPatientData.DischargeToHome = DischargeToHome;
               MySQLPatientData.TransferToNonCluster = TransferToNonCluster;
               MySQLPatientData.TransferToHub = TransferToHub;
               MySQLPatientData.TreatmentStrategy = treatmentStrategy;
               Object.keys(MySQLPatientData).map(key => {
                  if (MySQLPatientData[key] === undefined || MySQLPatientData[key] === null) {
                     MySQLPatientData[key] = '';
                  }
               });
               MySQLDataArr.push(MySQLPatientData);
            });
            resolve({
               ExcelData: DataDumpArr,
               DashboardData: {
                  MySQLDataArr: MySQLDataArr,
                  MedicationArr: MedicationArr,
                  TreatmentModalitiesArr: TreatmentModalitiesArr,
                  VesselStentArr: VesselStentArr,
                  StentsArr: StentsArr,
                  MaceArr: MaceArr,
                  LocationOfInfarctionArr: LocationOfInfarctionArr,
                  DrugBeforePCIMedicationArr: DrugBeforePCIMedicationArr,
						RiskFactorArr: RiskFactorArr
               } });
         }
      });

   });
}

exports.AllPatientDetails_List = async function(req, res) {

   var ReceivingData = {Location: null, FromDate: null, ToDate: null};
   if (req !== null) {
      ReceivingData = req.body;
   }

   try {
      let Result = await CollectData(ReceivingData);
      if (req !== null) {
         res.status(200).send({ Status: true, Response: {Data: Result.ExcelData, Header: ReportFields.ReportFields} });
      } else {
         return Result.DashboardData;
      }
   } catch (err) {
      console.log(err);
      res.status(417).send({ Status: false, Message: "Some error occurred while find the patients!.", Error: err });
   }


};
