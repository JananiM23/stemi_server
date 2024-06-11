var HospitalSummaryModel = require('./../../models/patient-management/hospital_summary.model');
var mongoose = require('mongoose');

// In hospital Summary - Lab Report Create----------------------------------------------
exports.HospitalSummaryLabReport_Create = function(req, res){
   var ReceivingData = req.body;
   
   if(!ReceivingData.User || ReceivingData.User === null){
      res.status(400).send({ Status: false, Message: "User Details is Required!" });
   } else if(!ReceivingData.PatientId || ReceivingData.PatientId === null){
      res.status(400).send({ Status: false, Message: "Patient Detail not valid!" });
   } else if(!ReceivingData.Hospital || ReceivingData.Hospital === null){
      res.status(400).send({ Status: false, Message: "Hospital Detail not valid!" });
   } else {
      const Create_HospitalSummaryLabReport = new HospitalSummaryModel.HospitalSummaryLabReportSchema({
        PatientId: mongoose.Types.ObjectId(ReceivingData.PatientId),
        Hospital: mongoose.Types.ObjectId(ReceivingData.Hospital), 
        Lab_Report_Haemoglobin: ReceivingData.Lab_Report_Haemoglobin || '',
        Lab_Report_Haemoglobin_Dosage_Units: ReceivingData.Lab_Report_Haemoglobin_Dosage_Units || '',
        Lab_Report_Creatinine: ReceivingData.Lab_Report_Creatinine || '',
        Lab_Report_Creatinine_Dosage_Units: ReceivingData.Lab_Report_Creatinine_Dosage_Units || '',
        Lab_Report_CPK_Mb: ReceivingData.Lab_Report_CPK_Mb || '',
        Lab_Report_CPK_Mb_Dosage_Units: ReceivingData.Lab_Report_CPK_Mb_Dosage_Units || '',
        Lab_Report_Trop: ReceivingData.Lab_Report_Trop || '',
		  Lab_Report_TropT: ReceivingData.Lab_Report_TropT || '',
        Lab_Report_TropI: ReceivingData.Lab_Report_TropI || '',
        Lab_Report_Trop_Dosage_Units: ReceivingData.Lab_Report_Trop_Dosage_Units || '',
        Lab_Report_Trop_T: ReceivingData.Lab_Report_Trop_T || '',
        Lab_Report_RBS: ReceivingData.Lab_Report_RBS || '',
        Lab_Report_RBS_Dosage_Units: ReceivingData.Lab_Report_RBS_Dosage_Units || '',
        Lab_Report_LDL: ReceivingData.Lab_Report_LDL || '',
        Lab_Report_LDL_Dosage_Units: ReceivingData.Lab_Report_LDL_Dosage_Units || '',
        Lab_Report_HDL: ReceivingData.Lab_Report_HDL || '',
        Lab_Report_HDL_Dosage_Units: ReceivingData.Lab_Report_HDL_Dosage_Units || '',
        Lab_Report_Cholesterol: ReceivingData.Lab_Report_Cholesterol || '',
        Lab_Report_Cholesterol_Dosage_Units: ReceivingData.Lab_Report_Cholesterol_Dosage_Units || '',
        Lab_Report_HBA1c: ReceivingData.Lab_Report_HBA1c || '',
        Lab_Report_HBA1c_Dosage_Units: ReceivingData.Lab_Report_HBA1c_Dosage_Units || '',
		  Lab_Report_eGFR: ReceivingData.Lab_Report_eGFR || '',
        Lab_Report_eGFR_Dosage_Units: ReceivingData.Lab_Report_eGFR_Dosage_Units || '',
        Active_Status: true,
        If_Deleted: false
      });
      Create_HospitalSummaryLabReport.save(function(err, result){
         if (err) {
            res.status(417).send({ Status: false, Message: "Some error occurred while Creating the Hospital Summary Lab Report!.", Error: err });
         } else {
            HospitalSummaryModel.HospitalSummaryLabReportSchema.find({PatientId: mongoose.Types.ObjectId(ReceivingData.PatientId)}, {}, {'sort': { createdAt: 1 }})
            .populate({ path: 'Hospital', select: ['Hospital_Name', 'Hospital_Role']})
            .exec(function(err_1, result_1) {
               if(err_1) {
                  res.status(417).send({status: false, Message: "Some error occurred while Find The Lab Report Details!.", Error: err_1 });
               } else {
                  res.status(200).send({Status: true, Response: result_1 });
               }
            });
         }
      });
   }
};
// In hospital Summary - Lab Report View---------------------------------------------------------
exports.HospitalSummaryLabReport_View= function(req, res) {
   var ReceivingData = req.body;

   if (!ReceivingData.User || ReceivingData.User === '') {
      res.status(400).send({ Status: false, Message: "User Details is Required!" });
   } else if (!ReceivingData.PatientId || ReceivingData.PatientId === '') {
      res.status(400).send({ Status: false, Message: "Patient Detail not valid!" });
   } else {
      HospitalSummaryModel.HospitalSummaryLabReportSchema.find({PatientId: mongoose.Types.ObjectId(ReceivingData.PatientId)}, {}, {'sort': { createdAt: 1 }})
      .populate({ path: 'Hospital', select: ['Hospital_Name', 'Hospital_Role']})
      .exec(function(err, result) {
         if(err) {
            res.status(417).send({status: false, Message: "Some error occurred while Find The Lab Report Details!.", Error: err });
         } else {
            res.status(200).send({Status: true, Response: result });
         }
      });
   }
};

// In hospital Summary - Lab report Update----------------------------------------------
exports.HospitalSummaryLabReport_Update = function(req, res){
   var ReceivingData = req.body;

   if(!ReceivingData.User || ReceivingData.User === null){
      res.status(400).send({ Status: false, Message: "User Details is Required!" });
   } else if(!ReceivingData.PatientId || ReceivingData.PatientId === null){
      res.status(400).send({ Status: false, Message: "Patient Detail not valid!" });
   } else if(!ReceivingData.LabReportId || ReceivingData.LabReportId === null){
      res.status(400).send({ Status: false, Message: "Lab Report Details not valid!" });
   } else {
      HospitalSummaryModel.HospitalSummaryLabReportSchema.findOne({_id: mongoose.Types.ObjectId(ReceivingData.LabReportId)}, {}, {}, function(err, result) {
         if (err) {
            res.status(417).send({ Status: false, Message: "Some error occurred while Find the Lab Deport!.", Error: err });
         } else if (result === null){
            res.status(400).send({ Status: false, Message: "Invalid Lab Deport Details!" });
         } else {
            result.Lab_Report_Haemoglobin = ReceivingData.Lab_Report_Haemoglobin || '';
            result.Lab_Report_Haemoglobin_Dosage_Units = ReceivingData.Lab_Report_Haemoglobin_Dosage_Units || '';            
            result.Lab_Report_Creatinine = ReceivingData.Lab_Report_Creatinine || '';
            result.Lab_Report_Creatinine_Dosage_Units = ReceivingData.Lab_Report_Creatinine_Dosage_Units || '';
            result.Lab_Report_CPK_Mb = ReceivingData.Lab_Report_CPK_Mb || '';
            result.Lab_Report_CPK_Mb_Dosage_Units = ReceivingData.Lab_Report_CPK_Mb_Dosage_Units || '';
            result.Lab_Report_Trop = ReceivingData.Lab_Report_Trop || '';
				result.Lab_Report_TropT = ReceivingData.Lab_Report_TropT || '';
            result.Lab_Report_TropI = ReceivingData.Lab_Report_TropI || '';
            result.Lab_Report_Trop_Dosage_Units = ReceivingData.Lab_Report_Trop_Dosage_Units || '';
            result.Lab_Report_Trop_T = ReceivingData.Lab_Report_Trop_T || '';
            result.Lab_Report_RBS = ReceivingData.Lab_Report_RBS || '';
            result.Lab_Report_RBS_Dosage_Units = ReceivingData.Lab_Report_RBS_Dosage_Units || '';
            result.Lab_Report_LDL = ReceivingData.Lab_Report_LDL || '';
            result.Lab_Report_LDL_Dosage_Units = ReceivingData.Lab_Report_LDL_Dosage_Units || '';
            result.Lab_Report_HDL = ReceivingData.Lab_Report_HDL || '';
            result.Lab_Report_HDL_Dosage_Units = ReceivingData.Lab_Report_HDL_Dosage_Units || '';
            result.Lab_Report_Cholesterol = ReceivingData.Lab_Report_Cholesterol || '';
            result.Lab_Report_Cholesterol_Dosage_Units = ReceivingData.Lab_Report_Cholesterol_Dosage_Units || '';
            result.Lab_Report_HBA1c = ReceivingData.Lab_Report_HBA1c || '';
            result.Lab_Report_HBA1c_Dosage_Units = ReceivingData.Lab_Report_HBA1c_Dosage_Units || '';
				result.Lab_Report_eGFR = ReceivingData.Lab_Report_eGFR || '';
            result.Lab_Report_eGFR_Dosage_Units = ReceivingData.Lab_Report_eGFR_Dosage_Units || '';
            result.save( function(errNew, resultNew){
               if (errNew) {
                  res.status(417).send({ Status: false, Message: "Some error occurred while update the Lab Deport Details!.", Error: errNew });
               } else {
                  HospitalSummaryModel.HospitalSummaryLabReportSchema.find({PatientId: mongoose.Types.ObjectId(ReceivingData.PatientId)}, {}, {'sort': { createdAt: 1 }})
                  .populate({ path: 'Hospital', select: ['Hospital_Name', 'Hospital_Role']})
                  .exec(function(err_1, result_1) {
                     if(err_1) {
                        res.status(417).send({status: false, Message: "Some error occurred while Find The Lab Report Details!.", Error: err_1 });
                     } else {
                        res.status(200).send({Status: true, Response: result_1 });
                     }
                  });
               }
            });
         }
      });
   }
};

// In hospital Summary - Lab Report History Cardiac Update----------------------------------------------
exports.LabReportHistory_CardiacUpdate = function(req, res){
   var ReceivingData = req.body;

  if(!ReceivingData.Patient || ReceivingData.Patient === null){
      res.status(400).send({ Status: false, Message: "Patient Detail not valid!" });
   } else if(!ReceivingData._id || ReceivingData._id === null){
      res.status(400).send({ Status: false, Message: "Lab Report Details not valid!" });
   } else {
      HospitalSummaryModel.HospitalSummaryLabReportSchema.findOne({_id: mongoose.Types.ObjectId(ReceivingData._id)}, {}, {}, function(err, result) {
         if (err) {
            res.status(417).send({ Status: false, Message: "Some error occurred while Find the Lab Deport!.", Error: err });
         } else if (result === null){
            res.status(400).send({ Status: false, Message: "Invalid Lab Deport Details!" });
         } else {
            result.Lab_Report_Haemoglobin = ReceivingData.Lab_Report_Haemoglobin || '';
            result.Lab_Report_Haemoglobin_Dosage_Units = ReceivingData.Lab_Report_Haemoglobin_Dosage_Units || '';
            result.Lab_Report_Creatinine = ReceivingData.Lab_Report_Creatinine || '';
            result.Lab_Report_Creatinine_Dosage_Units = ReceivingData.Lab_Report_Creatinine_Dosage_Units || '';
            result.Lab_Report_CPK_Mb = ReceivingData.Lab_Report_CPK_Mb || '';
            result.Lab_Report_CPK_Mb_Dosage_Units = ReceivingData.Lab_Report_CPK_Mb_Dosage_Units || '';
            result.Lab_Report_Trop = ReceivingData.Lab_Report_Trop || '';
				result.Lab_Report_TropT = ReceivingData.Lab_Report_TropT || '';
            result.Lab_Report_TropI = ReceivingData.Lab_Report_TropI || '';
            result.Lab_Report_Trop_Dosage_Units = ReceivingData.Lab_Report_Trop_Dosage_Units || '';
            result.Lab_Report_Trop_T = ReceivingData.Lab_Report_Trop_T || '';
            result.save( function(errNew, resultNew){
               if (errNew) {
                  res.status(417).send({ Status: false, Message: "Some error occurred while update the Lab Deport Details!.", Error: errNew });
               } else {
                  res.status(200).send({Status: true, Response: resultNew });
               }
            });
         }
      });
   }
};
// In hospital Summary - Lab Report History Serum Update----------------------------------------------
exports.LabReportHistory_SerumUpdate = function(req, res){
   var ReceivingData = req.body;

  if(!ReceivingData.Patient || ReceivingData.Patient === null){
      res.status(400).send({ Status: false, Message: "Patient Detail not valid!" });
   } else if(!ReceivingData._id || ReceivingData._id === null){
      res.status(400).send({ Status: false, Message: "Lab Report Details not valid!" });
   } else {
      HospitalSummaryModel.HospitalSummaryLabReportSchema.findOne({_id: mongoose.Types.ObjectId(ReceivingData._id)}, {}, {}, function(err, result) {
         if (err) {
            res.status(417).send({ Status: false, Message: "Some error occurred while Find the Lab Deport!.", Error: err });
         } else if (result === null){
            res.status(400).send({ Status: false, Message: "Invalid Lab Deport Details!" });
         } else {
            result.Lab_Report_RBS = ReceivingData.Lab_Report_RBS || '';
            result.Lab_Report_RBS_Dosage_Units = ReceivingData.Lab_Report_RBS_Dosage_Units|| '';
            result.Lab_Report_LDL = ReceivingData.Lab_Report_LDL || '';
            result.Lab_Report_LDL_Dosage_Units = ReceivingData.Lab_Report_LDL_Dosage_Units || '';
            result.Lab_Report_HDL = ReceivingData.Lab_Report_HDL || '';
            result.Lab_Report_HDL_Dosage_Units = ReceivingData.Lab_Report_HDL_Dosage_Units|| '';
            result.Lab_Report_Cholesterol = ReceivingData.Lab_Report_Cholesterol || '';
            result.Lab_Report_Cholesterol_Dosage_Units = ReceivingData.Lab_Report_Cholesterol_Dosage_Units || '';
            result.Lab_Report_HBA1c = ReceivingData.Lab_Report_HBA1c || '';
            result.Lab_Report_HBA1c_Dosage_Units = ReceivingData.Lab_Report_HBA1c_Dosage_Units || '';
				result.Lab_Report_eGFR = ReceivingData.Lab_Report_eGFR || '';
            result.Lab_Report_eGFR_Dosage_Units = ReceivingData.Lab_Report_eGFR_Dosage_Units || '';
            result.save( function(errNew, resultNew){
               if (errNew) {
                  res.status(417).send({ Status: false, Message: "Some error occurred while update the Lab Deport Details!.", Error: errNew });
               } else {
                  res.status(200).send({Status: true, Response: resultNew });
               }
            });
         }
      });
   }
};
// In hospital Summary - Lab Report History Create----------------------------------------------
exports.LabReportHistory_Create = function(req, res){
   var ReceivingData = req.body;
   
   if(!ReceivingData.PatientId || ReceivingData.Patient === null){
      res.status(400).send({ Status: false, Message: "Patient Detail not valid!" });
   } else if(!ReceivingData.Hospital || ReceivingData.Hospital === null){
      res.status(400).send({ Status: false, Message: "Hospital Detail not valid!" });
   } else {
      const Create_HospitalSummaryLabReport = new HospitalSummaryModel.HospitalSummaryLabReportSchema({
        PatientId: mongoose.Types.ObjectId(ReceivingData.Patient),
        Hospital: mongoose.Types.ObjectId(ReceivingData.Hospital), 
        Lab_Report_Haemoglobin: ReceivingData.Lab_Report_Haemoglobin || '',  
        Lab_Report_Haemoglobin_Dosage_Units: ReceivingData.Lab_Report_Haemoglobin_Dosage_Units || '',
        Lab_Report_Creatinine: ReceivingData.Lab_Report_Creatinine || '',
        Lab_Report_Creatinine_Dosage_Units: ReceivingData.Lab_Report_Creatinine_Dosage_Units || '',
        Lab_Report_CPK_Mb: ReceivingData.Lab_Report_CPK_Mb || '',
        Lab_Report_CPK_Mb_Dosage_Units: ReceivingData.Lab_Report_CPK_Mb_Dosage_Units || '',
        Lab_Report_Trop: ReceivingData.Lab_Report_Trop || '',
		  Lab_Report_TropT: ReceivingData.Lab_Report_TropT || '',
		  Lab_Report_TropI: ReceivingData.Lab_Report_TropI || '',
        Lab_Report_Trop_Dosage_Units: ReceivingData.Lab_Report_Trop_Dosage_Units || '',
        Lab_Report_Trop_T: ReceivingData.Lab_Report_Trop_T || '',
        Lab_Report_RBS: ReceivingData.Lab_Report_RBS || '',
        Lab_Report_RBS_Dosage_Units: ReceivingData.Lab_Report_RBS_Dosage_Units || '',
        Lab_Report_LDL: ReceivingData.Lab_Report_LDL || '',
        Lab_Report_LDL_Dosage_Units: ReceivingData.Lab_Report_LDL_Dosage_Units || '',
        Lab_Report_HDL: ReceivingData.Lab_Report_HDL || '',
        Lab_Report_HDL_Dosage_Units: ReceivingData.Lab_Report_HDL_Dosage_Units || '',
        Lab_Report_Cholesterol: ReceivingData.Lab_Report_Cholesterol || '',
        Lab_Report_Cholesterol_Dosage_Units: ReceivingData.Lab_Report_Cholesterol_Dosage_Units || '',
        Lab_Report_HBA1c: ReceivingData.Lab_Report_HBA1c || '',
        Lab_Report_HBA1c_Dosage_Units: ReceivingData.Lab_Report_HBA1c_Dosage_Units || '',
		  Lab_Report_eGFR: ReceivingData.Lab_Report_eGFR || '',
        Lab_Report_eGFR_Dosage_Units: ReceivingData.Lab_Report_eGFR_Dosage_Units || '',
        Active_Status: true,
        If_Deleted: false
      });
      Create_HospitalSummaryLabReport.save(function(err, result){
         if (err) {
            res.status(417).send({ Status: false, Message: "Some error occurred while Creating the Hospital Summary Lab Report!.", Error: err });
         } else {
            res.status(200).send({Status: true, Response: result });
         }
      });
   }
};



// In hospital Summary - Medication in Hospital Create----------------------------------------------
exports.HospitalSummaryMedicationInHospital_Create = function(req, res){
    var ReceivingData = req.body;
 
    if(!ReceivingData.User || ReceivingData.User === null){
      res.status(400).send({ Status: false, Message: "User Details is Required!" });
      } else if(!ReceivingData.PatientId || ReceivingData.PatientId === null){
         res.status(400).send({ Status: false, Message: "Patient Detail not valid!" });
      } else if(!ReceivingData.Hospital || ReceivingData.Hospital === null){
         res.status(400).send({ Status: false, Message: "Hospital Detail not valid!" });
      } else {
       const Create_HospitalSummaryMedicationInHospital = new HospitalSummaryModel.HospitalSummaryMedicationInHospitalSchema({
         PatientId: mongoose.Types.ObjectId(ReceivingData.PatientId),
         Hospital: mongoose.Types.ObjectId(ReceivingData.Hospital),  
         Medication_In_Hospital_Nitroglycerin: ReceivingData.Medication_In_Hospital_Nitroglycerin || '',
         Medication_In_Hospital_Nitroglycerin_Route: ReceivingData.Medication_In_Hospital_Nitroglycerin_Route || '',
         Medication_In_Hospital_Nitroglycerin_Dosage: ReceivingData.Medication_In_Hospital_Nitroglycerin_Dosage || '',
         Medication_In_Hospital_Nitroglycerin_Dosage_Units: ReceivingData.Medication_In_Hospital_Nitroglycerin_Dosage_Units || '',
         Medication_In_Hospital_Nitroglycerin_Date_Time: ReceivingData.Medication_In_Hospital_Nitroglycerin_Date_Time || '',
         Medication_In_Hospital_Dopamine: ReceivingData.Medication_In_Hospital_Dopamine || '',
         Medication_In_Hospital_Dopamine_Route: ReceivingData.Medication_In_Hospital_Dopamine_Route || '',
         Medication_In_Hospital_Dopamine_Dosage: ReceivingData.Medication_In_Hospital_Dopamine_Dosage || '',
         Medication_In_Hospital_Dopamine_Dosage_Units: ReceivingData.Medication_In_Hospital_Dopamine_Dosage_Units || '',
         Medication_In_Hospital_Dopamine_Date_Time: ReceivingData.Medication_In_Hospital_Dopamine_Date_Time || '',
         Medication_In_Hospital_Dobutamine: ReceivingData.Medication_In_Hospital_Dobutamine || '',
         Medication_In_Hospital_Dobutamine_Route: ReceivingData.Medication_In_Hospital_Dobutamine_Route || '',
         Medication_In_Hospital_Dobutamine_Dosage: ReceivingData.Medication_In_Hospital_Dobutamine_Dosage || '',
         Medication_In_Hospital_Dobutamine_Dosage_Units: ReceivingData.Medication_In_Hospital_Dobutamine_Dosage_Units || '',
         Medication_In_Hospital_Dobutamine_Date_Time: ReceivingData.Medication_In_Hospital_Dobutamine_Date_Time || '',
         Medication_In_Hospital_Adrenaline: ReceivingData.Medication_In_Hospital_Adrenaline || '',
         Medication_In_Hospital_Adrenaline_Route: ReceivingData.Medication_In_Hospital_Adrenaline_Route || '',
         Medication_In_Hospital_Adrenaline_Dosage: ReceivingData.Medication_In_Hospital_Adrenaline_Dosage || '',
         Medication_In_Hospital_Adrenaline_Dosage_Units: ReceivingData.Medication_In_Hospital_Adrenaline_Dosage_Units || '',
         Medication_In_Hospital_Adrenaline_Date_Time: ReceivingData.Medication_In_Hospital_Adrenaline_Date_Time || '',
         Medication_In_Hospital_Nor_Aadrenaline: ReceivingData.Medication_In_Hospital_Nor_Aadrenaline || '',
         Medication_In_Hospital_Nor_Aadrenaline_Route: ReceivingData.Medication_In_Hospital_Nor_Aadrenaline_Route || '',
         Medication_In_Hospital_Nor_Aadrenaline_Dosage: ReceivingData.Medication_In_Hospital_Nor_Aadrenaline_Dosage || '',
         Medication_In_Hospital_Nor_Aadrenaline_Dosage_Units: ReceivingData.Medication_In_Hospital_Nor_Aadrenaline_Dosage_Units || '',
         Medication_In_Hospital_Nor_Aadrenaline_Date_Time: ReceivingData.Medication_In_Hospital_Nor_Aadrenaline_Date_Time || '',
         Medication_In_Hospital_Oxygen: ReceivingData.Medication_In_Hospital_Oxygen || '',
         Medication_In_Hospital_Oxygen_Dosage: ReceivingData.Medication_In_Hospital_Oxygen_Dosage || '',
         Medication_In_Hospital_Aspirin: ReceivingData.Medication_In_Hospital_Aspirin || '',
         Medication_In_Hospital_Aspirin_Dosage: ReceivingData.Medication_In_Hospital_Aspirin_Dosage || '',
         Medication_In_Hospital_Aspirin_Dosage_Date_Time: ReceivingData.Medication_In_Hospital_Aspirin_Dosage_Date_Time || null,
         Medication_In_Hospital_Clopidogrel: ReceivingData.Medication_In_Hospital_Clopidogrel || '',
         Medication_In_Hospital_Clopidogrel_Dosage: ReceivingData.Medication_In_Hospital_Clopidogrel_Dosage || '',
         Medication_In_Hospital_Clopidogrel_Dosage_Date_Time: ReceivingData.Medication_In_Hospital_Clopidogrel_Dosage_Date_Time || null,
         Medication_In_Hospital_Prasugrel: ReceivingData.Medication_In_Hospital_Prasugrel || '',
         Medication_In_Hospital_Prasugrel_Dosage: ReceivingData.Medication_In_Hospital_Prasugrel_Dosage || '',
         Medication_In_Hospital_Prasugrel_Dosage_Date_Time: ReceivingData.Medication_In_Hospital_Prasugrel_Dosage_Date_Time || null,
         Medication_In_Hospital_Ticagrelor: ReceivingData.Medication_In_Hospital_Ticagrelor || '',
         Medication_In_Hospital_Ticagrelor_Dosage: ReceivingData.Medication_In_Hospital_Ticagrelor_Dosage || '',
         Medication_In_Hospital_Ticagrelor_Dosage_Date_Time: ReceivingData.Medication_In_Hospital_Ticagrelor_Dosage_Date_Time || null,
         Medication_In_Hospital_IIbIIIa_inhibitor: ReceivingData.Medication_In_Hospital_IIbIIIa_inhibitor || '',
         Medication_In_Hospital_IIbIIIa_inhibitor_Dosage: ReceivingData.Medication_In_Hospital_IIbIIIa_inhibitor_Dosage || '',
         Medication_In_Hospital_IIbIIIa_inhibitor_Date_Time: ReceivingData.Medication_In_Hospital_IIbIIIa_inhibitor_Date_Time || null,
         Medication_In_Hospital_Inotrope: ReceivingData.Medication_In_Hospital_Inotrope || '',
         Medication_In_Hospital_Inotrope_Dosage: ReceivingData.Medication_In_Hospital_Inotrope_Dosage || '',
         Medication_In_Hospital_Inotrope_Date_Time: ReceivingData.Medication_In_Hospital_Inotrope_Date_Time || null,
			Medication_In_Hospital_Enoxaparin: ReceivingData.Medication_In_Hospital_Enoxaparin || '',
         Medication_In_Hospital_Enoxaparin_Dosage: ReceivingData.Medication_In_Hospital_Enoxaparin_Dosage || '',
         Medication_In_Hospital_Enoxaparin_Date_Time: ReceivingData.Medication_In_Hospital_Enoxaparin_Date_Time || null,
         Medication_In_Hospital_UnFractionated_Heparin: ReceivingData.Medication_In_Hospital_UnFractionated_Heparin || '',
         Medication_In_Hospital_UnFractionated_Heparin_Route: ReceivingData.Medication_In_Hospital_UnFractionated_Heparin_Route || '',
         Medication_In_Hospital_UnFractionated_Heparin_Dosage: ReceivingData.Medication_In_Hospital_UnFractionated_Heparin_Dosage || null,
         Medication_In_Hospital_UnFractionated_Heparin_Dosage_Units: ReceivingData.Medication_In_Hospital_UnFractionated_Heparin_Dosage_Units || '',
         Medication_In_Hospital_UnFractionated_Heparin_Date_Time: ReceivingData.Medication_In_Hospital_UnFractionated_Heparin_Date_Time || null,
         Medication_In_Hospital_LMW_Heparin: ReceivingData.Medication_In_Hospital_LMW_Heparin || '',
         Medication_In_Hospital_LMW_Heparin_Route: ReceivingData.Medication_In_Hospital_LMW_Heparin_Route || '',
         Medication_In_Hospital_LMW_Heparin_Dosage: ReceivingData.Medication_In_Hospital_LMW_Heparin_Dosage || null,
         Medication_In_Hospital_LMW_Heparin_Dosage_Units: ReceivingData.Medication_In_Hospital_LMW_Heparin_Dosage_Units || '',
         Medication_In_Hospital_LMW_Heparin_Date_Time: ReceivingData.Medication_In_Hospital_LMW_Heparin_Date_Time || null,
			Medication_In_Hospital_Fondaparinux: ReceivingData.Medication_In_Hospital_Fondaparinux || '',
			Medication_In_Hospital_Fondaparinux_Route: ReceivingData.Medication_In_Hospital_Fondaparinux_Route || '',
			Medication_In_Hospital_Fondaparinux_Dosage: ReceivingData.Medication_In_Hospital_Fondaparinux_Dosage || null,
			Medication_In_Hospital_Fondaparinux_Dosage_Units: ReceivingData.Medication_In_Hospital_Fondaparinux_Dosage_Units || '',
			Medication_In_Hospital_Fondaparinux_Date_Time: ReceivingData.Medication_In_Hospital_Fondaparinux_Date_Time || null,
         Medication_In_Hospital_N_Saline: ReceivingData.Medication_In_Hospital_N_Saline || '',
         Medication_In_Hospital_Morphine: ReceivingData.Medication_In_Hospital_Morphine || '',
         Medication_In_Hospital_Atropine: ReceivingData.Medication_In_Hospital_Atropine || '',
         OtherMedicationArray: ReceivingData.OtherMedicationArray || [],
         Active_Status: true,
         If_Deleted: false
         });
       Create_HospitalSummaryMedicationInHospital.save(function(err, result){
          if (err) {
             res.status(417).send({ Status: false, Message: "Some error occurred while Creating the Hospital Summary Medication in Hospital!.", Error: err });
          } else {
            HospitalSummaryModel.HospitalSummaryMedicationInHospitalSchema.find({PatientId: mongoose.Types.ObjectId(ReceivingData.PatientId)}, {}, {'sort': { createdAt: 1 }})
            .populate({ path: 'Hospital', select: ['Hospital_Name', 'Hospital_Role']})
            .exec(function(err_1, result_1) {
               if(err_1) {
                  res.status(417).send({status: false, Message: "Some error occurred while Find The Medication in Hospital Details!.", Error: err_1 });
               } else {
                  res.status(200).send({Status: true, Response: result_1 });
               }
            });
          }
       });
    }
 };

 // In hospital Summary - Medication in Hospital View---------------------------------------------------------
exports.HospitalSummaryMedicationInHospital_View= function(req, res) {
   var ReceivingData = req.body;

   if (!ReceivingData.User || ReceivingData.User === '') {
      res.status(400).send({ Status: false, Message: "User Details is Required!" });
   } else if (!ReceivingData.PatientId || ReceivingData.PatientId === '') {
      res.status(400).send({ Status: false, Message: "Patient Detail not valid!" });
   } else {
      HospitalSummaryModel.HospitalSummaryMedicationInHospitalSchema.find({PatientId: mongoose.Types.ObjectId(ReceivingData.PatientId)}, {}, {'sort': { createdAt: 1 }})
      .populate({ path: 'Hospital', select: ['Hospital_Name', 'Hospital_Role']})
      .exec(function(err, result) {
         if(err) {
            res.status(417).send({status: false, Message: "Some error occurred while Find The Medication in Hospital Details!.", Error: err });
         } else {
            res.status(200).send({Status: true, Response: result });
         }
      });
   }
};

 // In hospital Summary - Medication in Hospital Update----------------------------------------------
exports.HospitalSummaryMedicationInHospital_Update = function(req, res){
   var ReceivingData = req.body;
   
   if(!ReceivingData.User || ReceivingData.User === null){
      res.status(400).send({ Status: false, Message: "User Details is Required!" });
   } else if(!ReceivingData.PatientId || ReceivingData.PatientId === null){
      res.status(400).send({ Status: false, Message: "Patient Detail not valid!" });
   } else if(!ReceivingData.MedicationHospitalId || ReceivingData.MedicationHospitalId === null){
      res.status(400).send({ Status: false, Message: "Medication in Hospital Details not valid!" });
   } else {
      HospitalSummaryModel.HospitalSummaryMedicationInHospitalSchema.findOne({_id: mongoose.Types.ObjectId(ReceivingData.MedicationHospitalId)}, {}, {}, function(err, result) {
         if (err) {
            res.status(417).send({ Status: false, Message: "Some error occurred while Find the Medication in Hospital!.", Error: err });
         } else if (result === null){
            res.status(400).send({ Status: false, Message: "Invalid Medication in Hospital Details!" });
         } else {
            result.Medication_In_Hospital_Nitroglycerin = ReceivingData.Medication_In_Hospital_Nitroglycerin || '';
            result.Medication_In_Hospital_Nitroglycerin_Route = ReceivingData.Medication_In_Hospital_Nitroglycerin_Route || '';
            result.Medication_In_Hospital_Nitroglycerin_Dosage = ReceivingData.Medication_In_Hospital_Nitroglycerin_Dosage || '';
            result.Medication_In_Hospital_Nitroglycerin_Dosage_Units = ReceivingData.Medication_In_Hospital_Nitroglycerin_Dosage_Units || '';
            result.Medication_In_Hospital_Nitroglycerin_Date_Time = ReceivingData.Medication_In_Hospital_Nitroglycerin_Date_Time || '';
            result.Medication_In_Hospital_Dopamine = ReceivingData.Medication_In_Hospital_Dopamine || '';
            result.Medication_In_Hospital_Dopamine_Route = ReceivingData.Medication_In_Hospital_Dopamine_Route || '';
            result.Medication_In_Hospital_Dopamine_Dosage = ReceivingData.Medication_In_Hospital_Dopamine_Dosage || '';
            result.Medication_In_Hospital_Dopamine_Dosage_Units = ReceivingData.Medication_In_Hospital_Dopamine_Dosage_Units || '';
            result.Medication_In_Hospital_Dopamine_Date_Time = ReceivingData.Medication_In_Hospital_Dopamine_Date_Time || '';
            result.Medication_In_Hospital_Dobutamine = ReceivingData.Medication_In_Hospital_Dobutamine || '';
            result.Medication_In_Hospital_Dobutamine_Route = ReceivingData.Medication_In_Hospital_Dobutamine_Route || '';
            result.Medication_In_Hospital_Dobutamine_Dosage = ReceivingData.Medication_In_Hospital_Dobutamine_Dosage || '';
            result.Medication_In_Hospital_Dobutamine_Dosage_Units = ReceivingData.Medication_In_Hospital_Dobutamine_Dosage_Units || '';
            result.Medication_In_Hospital_Dobutamine_Date_Time = ReceivingData.Medication_In_Hospital_Dobutamine_Date_Time || '';
            result.Medication_In_Hospital_Adrenaline = ReceivingData.Medication_In_Hospital_Adrenaline || '';
            result.Medication_In_Hospital_Adrenaline_Route = ReceivingData.Medication_In_Hospital_Adrenaline_Route || '';
            result.Medication_In_Hospital_Adrenaline_Dosage = ReceivingData.Medication_In_Hospital_Adrenaline_Dosage || '';
            result.Medication_In_Hospital_Adrenaline_Dosage_Units = ReceivingData.Medication_In_Hospital_Adrenaline_Dosage_Units || '';
            result.Medication_In_Hospital_Adrenaline_Date_Time = ReceivingData.Medication_In_Hospital_Adrenaline_Date_Time || '';
            result.Medication_In_Hospital_Nor_Aadrenaline = ReceivingData.Medication_In_Hospital_Nor_Aadrenaline || '';
            result.Medication_In_Hospital_Nor_Aadrenaline_Route = ReceivingData.Medication_In_Hospital_Nor_Aadrenaline_Route || '';
            result.Medication_In_Hospital_Nor_Aadrenaline_Dosage = ReceivingData.Medication_In_Hospital_Nor_Aadrenaline_Dosage || '';
            result.Medication_In_Hospital_Nor_Aadrenaline_Dosage_Units = ReceivingData.Medication_In_Hospital_Nor_Aadrenaline_Dosage_Units || '';
            result.Medication_In_Hospital_Nor_Aadrenaline_Date_Time = ReceivingData.Medication_In_Hospital_Nor_Aadrenaline_Date_Time || '';
            result.Medication_In_Hospital_Oxygen = ReceivingData.Medication_In_Hospital_Oxygen || '';
            result.Medication_In_Hospital_Oxygen_Dosage = ReceivingData.Medication_In_Hospital_Oxygen_Dosage || '';
            result.Medication_In_Hospital_Aspirin = ReceivingData.Medication_In_Hospital_Aspirin || '';
            result.Medication_In_Hospital_Aspirin_Dosage = ReceivingData.Medication_In_Hospital_Aspirin_Dosage || '';
            result.Medication_In_Hospital_Aspirin_Dosage_Date_Time = ReceivingData.Medication_In_Hospital_Aspirin_Dosage_Date_Time || null;
            result.Medication_In_Hospital_Clopidogrel = ReceivingData.Medication_In_Hospital_Clopidogrel || '';
            result.Medication_In_Hospital_Clopidogrel_Dosage = ReceivingData.Medication_In_Hospital_Clopidogrel_Dosage || '';
            result.Medication_In_Hospital_Clopidogrel_Dosage_Date_Time = ReceivingData.Medication_In_Hospital_Clopidogrel_Dosage_Date_Time || null;
            result.Medication_In_Hospital_Prasugrel = ReceivingData.Medication_In_Hospital_Prasugrel || '';
            result.Medication_In_Hospital_Prasugrel_Dosage = ReceivingData.Medication_In_Hospital_Prasugrel_Dosage || '';
            result.Medication_In_Hospital_Prasugrel_Dosage_Date_Time = ReceivingData.Medication_In_Hospital_Prasugrel_Dosage_Date_Time || null;
            result.Medication_In_Hospital_Ticagrelor = ReceivingData.Medication_In_Hospital_Ticagrelor || '';
            result.Medication_In_Hospital_Ticagrelor_Dosage = ReceivingData.Medication_In_Hospital_Ticagrelor_Dosage || '';
            result.Medication_In_Hospital_Ticagrelor_Dosage_Date_Time = ReceivingData.Medication_In_Hospital_Ticagrelor_Dosage_Date_Time || null;
            result.Medication_In_Hospital_IIbIIIa_inhibitor = ReceivingData.Medication_In_Hospital_IIbIIIa_inhibitor || '';
            result.Medication_In_Hospital_IIbIIIa_inhibitor_Dosage = ReceivingData.Medication_In_Hospital_IIbIIIa_inhibitor_Dosage || '';
            result.Medication_In_Hospital_IIbIIIa_inhibitor_Date_Time = ReceivingData.Medication_In_Hospital_IIbIIIa_inhibitor_Date_Time || null;
            result.Medication_In_Hospital_Inotrope = ReceivingData.Medication_In_Hospital_Inotrope || '';
            result.Medication_In_Hospital_Inotrope_Dosage = ReceivingData.Medication_In_Hospital_Inotrope_Dosage || '';
            result.Medication_In_Hospital_Inotrope_Date_Time = ReceivingData.Medication_In_Hospital_Inotrope_Date_Time || null;
				result.Medication_In_Hospital_Enoxaparin = ReceivingData.Medication_In_Hospital_Enoxaparin || '';
            result.Medication_In_Hospital_Enoxaparin_Dosage = ReceivingData.Medication_In_Hospital_Enoxaparin_Dosage || '';
            result.Medication_In_Hospital_Enoxaparin_Date_Time = ReceivingData.Medication_In_Hospital_Enoxaparin_Date_Time || null;
            result.Medication_In_Hospital_UnFractionated_Heparin = ReceivingData.Medication_In_Hospital_UnFractionated_Heparin || '';
            result.Medication_In_Hospital_UnFractionated_Heparin_Route = ReceivingData.Medication_In_Hospital_UnFractionated_Heparin_Route || '';
            result.Medication_In_Hospital_UnFractionated_Heparin_Dosage = ReceivingData.Medication_In_Hospital_UnFractionated_Heparin_Dosage || null;
            result.Medication_In_Hospital_UnFractionated_Heparin_Dosage_Units = ReceivingData.Medication_In_Hospital_UnFractionated_Heparin_Dosage_Units || '';
            result.Medication_In_Hospital_UnFractionated_Heparin_Date_Time = ReceivingData.Medication_In_Hospital_UnFractionated_Heparin_Date_Time || null;
            result.Medication_In_Hospital_LMW_Heparin = ReceivingData.Medication_In_Hospital_LMW_Heparin || '';
            result.Medication_In_Hospital_LMW_Heparin_Route = ReceivingData.Medication_In_Hospital_LMW_Heparin_Route || '';
            result.Medication_In_Hospital_LMW_Heparin_Dosage = ReceivingData.Medication_In_Hospital_LMW_Heparin_Dosage || null;
            result.Medication_In_Hospital_LMW_Heparin_Dosage_Units = ReceivingData.Medication_In_Hospital_LMW_Heparin_Dosage_Units || '';
            result.Medication_In_Hospital_LMW_Heparin_Date_Time = ReceivingData.Medication_In_Hospital_LMW_Heparin_Date_Time || null;
				result.Medication_In_Hospital_Fondaparinux = ReceivingData.Medication_In_Hospital_Fondaparinux || '';
				result.Medication_In_Hospital_Fondaparinux_Route = ReceivingData.Medication_In_Hospital_Fondaparinux_Route || '';
				result.Medication_In_Hospital_Fondaparinux_Dosage = ReceivingData.Medication_In_Hospital_Fondaparinux_Dosage || null;
				result.Medication_In_Hospital_Fondaparinux_Dosage_Units = ReceivingData.Medication_In_Hospital_Fondaparinux_Dosage_Units || '';
				result.Medication_In_Hospital_Fondaparinux_Date_Time = ReceivingData.Medication_In_Hospital_Fondaparinux_Date_Time || null;
            result.Medication_In_Hospital_N_Saline = ReceivingData.Medication_In_Hospital_N_Saline || '';
            result.Medication_In_Hospital_Morphine = ReceivingData.Medication_In_Hospital_Morphine || '';
            result.Medication_In_Hospital_Atropine = ReceivingData.Medication_In_Hospital_Atropine || '';  
            result.OtherMedicationArray = ReceivingData.OtherMedicationArray || [];
            result.save( function(errNew, resultNew){
               if (errNew) {
                  res.status(417).send({ Status: false, Message: "Some error occurred while update the Medication in Hospital Details!.", Error: errNew });
               } else {
                  HospitalSummaryModel.HospitalSummaryMedicationInHospitalSchema.find({PatientId: mongoose.Types.ObjectId(ReceivingData.PatientId)}, {}, {'sort': { createdAt: 1 }})
                  .populate({ path: 'Hospital', select: ['Hospital_Name', 'Hospital_Role']})
                  .exec(function(err_1, result_1) {
                     if(err_1) {
                        res.status(417).send({status: false, Message: "Some error occurred while Find The Medication in Hospital Details!.", Error: err_1 });
                     } else {
                        res.status(200).send({Status: true, Response: result_1 });
                     }
                  });
               }
            });
         }
      });
   }
};

 // In hospital Summary - Medication in Hospital History Update----------------------------------------------
 exports.MedicationInHospitalHistory_Update = function(req, res){
   var ReceivingData = req.body;
   
   if(!ReceivingData.Patient || ReceivingData.Patient === null){
      res.status(400).send({ Status: false, Message: "Patient Detail not valid!" });
   } else if(!ReceivingData._id || ReceivingData._id === null){
      res.status(400).send({ Status: false, Message: "Medication in Hospital Details not valid!" });
   } else {
      HospitalSummaryModel.HospitalSummaryMedicationInHospitalSchema.findOne({_id: mongoose.Types.ObjectId(ReceivingData._id)}, {}, {}, function(err, result) {
         if (err) {
            res.status(417).send({ Status: false, Message: "Some error occurred while Find the Medication in Hospital!.", Error: err });
         } else if (result === null){
            res.status(400).send({ Status: false, Message: "Invalid Medication in Hospital Details!" });
         } else {
            result.Medication_In_Hospital_Nitroglycerin = ReceivingData.Medication_In_Hospital_Nitroglycerin || '';
            result.Medication_In_Hospital_Nitroglycerin_Route = ReceivingData.Medication_In_Hospital_Nitroglycerin_Route || '';
            result.Medication_In_Hospital_Nitroglycerin_Dosage = ReceivingData.Medication_In_Hospital_Nitroglycerin_Dosage || '';
            result.Medication_In_Hospital_Nitroglycerin_Dosage_Units = ReceivingData.Medication_In_Hospital_Nitroglycerin_Dosage_Units || '';
            result.Medication_In_Hospital_Nitroglycerin_Date_Time = ReceivingData.Medication_In_Hospital_Nitroglycerin_Date_Time || '';
            result.Medication_In_Hospital_Dopamine = ReceivingData.Medication_In_Hospital_Dopamine || '';
            result.Medication_In_Hospital_Dopamine_Route = ReceivingData.Medication_In_Hospital_Dopamine_Route || '';
            result.Medication_In_Hospital_Dopamine_Dosage = ReceivingData.Medication_In_Hospital_Dopamine_Dosage || '';
            result.Medication_In_Hospital_Dopamine_Dosage_Units = ReceivingData.Medication_In_Hospital_Dopamine_Dosage_Units || '';
            result.Medication_In_Hospital_Dopamine_Date_Time = ReceivingData.Medication_In_Hospital_Dopamine_Date_Time || '';
            result.Medication_In_Hospital_Dobutamine = ReceivingData.Medication_In_Hospital_Dobutamine || '';
            result.Medication_In_Hospital_Dobutamine_Route = ReceivingData.Medication_In_Hospital_Dobutamine_Route || '';
            result.Medication_In_Hospital_Dobutamine_Dosage = ReceivingData.Medication_In_Hospital_Dobutamine_Dosage || '';
            result.Medication_In_Hospital_Dobutamine_Dosage_Units = ReceivingData.Medication_In_Hospital_Dobutamine_Dosage_Units || '';
            result.Medication_In_Hospital_Dobutamine_Date_Time = ReceivingData.Medication_In_Hospital_Dobutamine_Date_Time || '';
            result.Medication_In_Hospital_Adrenaline = ReceivingData.Medication_In_Hospital_Adrenaline || '';
            result.Medication_In_Hospital_Adrenaline_Route = ReceivingData.Medication_In_Hospital_Adrenaline_Route || '';
            result.Medication_In_Hospital_Adrenaline_Dosage = ReceivingData.Medication_In_Hospital_Adrenaline_Dosage || '';
            result.Medication_In_Hospital_Adrenaline_Dosage_Units = ReceivingData.Medication_In_Hospital_Adrenaline_Dosage_Units || '';
            result.Medication_In_Hospital_Adrenaline_Date_Time = ReceivingData.Medication_In_Hospital_Adrenaline_Date_Time || '';
            result.Medication_In_Hospital_Nor_Aadrenaline = ReceivingData.Medication_In_Hospital_Nor_Aadrenaline || '';
            result.Medication_In_Hospital_Nor_Aadrenaline_Route = ReceivingData.Medication_In_Hospital_Nor_Aadrenaline_Route || '';
            result.Medication_In_Hospital_Nor_Aadrenaline_Dosage = ReceivingData.Medication_In_Hospital_Nor_Aadrenaline_Dosage || '';
            result.Medication_In_Hospital_Nor_Aadrenaline_Dosage_Units = ReceivingData.Medication_In_Hospital_Nor_Aadrenaline_Dosage_Units || '';
            result.Medication_In_Hospital_Nor_Aadrenaline_Date_Time = ReceivingData.Medication_In_Hospital_Nor_Aadrenaline_Date_Time || '';
            result.Medication_In_Hospital_Oxygen = ReceivingData.Medication_In_Hospital_Oxygen || '';
            result.Medication_In_Hospital_Oxygen_Dosage = ReceivingData.Medication_In_Hospital_Oxygen_Dosage || '';
            result.Medication_In_Hospital_Aspirin = ReceivingData.Medication_In_Hospital_Aspirin || '';
            result.Medication_In_Hospital_Aspirin_Dosage = ReceivingData.Medication_In_Hospital_Aspirin_Dosage || '';
            result.Medication_In_Hospital_Aspirin_Dosage_Date_Time = ReceivingData.Medication_In_Hospital_Aspirin_Dosage_Date_Time || null;
            result.Medication_In_Hospital_Clopidogrel = ReceivingData.Medication_In_Hospital_Clopidogrel || '';
            result.Medication_In_Hospital_Clopidogrel_Dosage = ReceivingData.Medication_In_Hospital_Clopidogrel_Dosage || '';
            result.Medication_In_Hospital_Clopidogrel_Dosage_Date_Time = ReceivingData.Medication_In_Hospital_Clopidogrel_Dosage_Date_Time || null;
            result.Medication_In_Hospital_Prasugrel = ReceivingData.Medication_In_Hospital_Prasugrel || '';
            result.Medication_In_Hospital_Prasugrel_Dosage = ReceivingData.Medication_In_Hospital_Prasugrel_Dosage || '';
            result.Medication_In_Hospital_Prasugrel_Dosage_Date_Time = ReceivingData.Medication_In_Hospital_Prasugrel_Dosage_Date_Time || null;
            result.Medication_In_Hospital_Ticagrelor = ReceivingData.Medication_In_Hospital_Ticagrelor || '';
            result.Medication_In_Hospital_Ticagrelor_Dosage = ReceivingData.Medication_In_Hospital_Ticagrelor_Dosage || '';
            result.Medication_In_Hospital_Ticagrelor_Dosage_Date_Time = ReceivingData.Medication_In_Hospital_Ticagrelor_Dosage_Date_Time || null;
            result.Medication_In_Hospital_IIbIIIa_inhibitor = ReceivingData.Medication_In_Hospital_IIbIIIa_inhibitor || '';
            result.Medication_In_Hospital_IIbIIIa_inhibitor_Dosage = ReceivingData.Medication_In_Hospital_IIbIIIa_inhibitor_Dosage || '';
            result.Medication_In_Hospital_IIbIIIa_inhibitor_Date_Time = ReceivingData.Medication_In_Hospital_IIbIIIa_inhibitor_Date_Time || null;
            result.Medication_In_Hospital_Inotrope = ReceivingData.Medication_In_Hospital_Inotrope || '';
            result.Medication_In_Hospital_Inotrope_Dosage = ReceivingData.Medication_In_Hospital_Inotrope_Dosage || '';
            result.Medication_In_Hospital_Inotrope_Date_Time = ReceivingData.Medication_In_Hospital_Inotrope_Date_Time || null;
				result.Medication_In_Hospital_Enoxaparin = ReceivingData.Medication_In_Hospital_Enoxaparin || '';
            result.Medication_In_Hospital_Enoxaparin_Dosage = ReceivingData.Medication_In_Hospital_Enoxaparin_Dosage || '';
            result.Medication_In_Hospital_Enoxaparin_Date_Time = ReceivingData.Medication_In_Hospital_Enoxaparin_Date_Time || null;
            result.Medication_In_Hospital_UnFractionated_Heparin = ReceivingData.Medication_In_Hospital_UnFractionated_Heparin || '';
            result.Medication_In_Hospital_UnFractionated_Heparin_Route = ReceivingData.Medication_In_Hospital_UnFractionated_Heparin_Route || '';
            result.Medication_In_Hospital_UnFractionated_Heparin_Dosage = ReceivingData.Medication_In_Hospital_UnFractionated_Heparin_Dosage || null;
            result.Medication_In_Hospital_UnFractionated_Heparin_Dosage_Units = ReceivingData.Medication_In_Hospital_UnFractionated_Heparin_Dosage_Units || '';
            result.Medication_In_Hospital_UnFractionated_Heparin_Date_Time = ReceivingData.Medication_In_Hospital_UnFractionated_Heparin_Date_Time || null;
            result.Medication_In_Hospital_LMW_Heparin = ReceivingData.Medication_In_Hospital_LMW_Heparin || '';
            result.Medication_In_Hospital_LMW_Heparin_Route = ReceivingData.Medication_In_Hospital_LMW_Heparin_Route || '';
            result.Medication_In_Hospital_LMW_Heparin_Dosage = ReceivingData.Medication_In_Hospital_LMW_Heparin_Dosage || null;
            result.Medication_In_Hospital_LMW_Heparin_Dosage_Units = ReceivingData.Medication_In_Hospital_LMW_Heparin_Dosage_Units || '';
            result.Medication_In_Hospital_LMW_Heparin_Date_Time = ReceivingData.Medication_In_Hospital_LMW_Heparin_Date_Time || null;
				result.Medication_In_Hospital_Fondaparinux = ReceivingData.Medication_In_Hospital_Fondaparinux || '';
				result.Medication_In_Hospital_Fondaparinux_Route = ReceivingData.Medication_In_Hospital_Fondaparinux_Route || '';
				result.Medication_In_Hospital_Fondaparinux_Dosage = ReceivingData.Medication_In_Hospital_Fondaparinux_Dosage || null;
				result.Medication_In_Hospital_Fondaparinux_Dosage_Units = ReceivingData.Medication_In_Hospital_Fondaparinux_Dosage_Units || '';
				result.Medication_In_Hospital_Fondaparinux_Date_Time = ReceivingData.Medication_In_Hospital_Fondaparinux_Date_Time || null;
            result.Medication_In_Hospital_N_Saline = ReceivingData.Medication_In_Hospital_N_Saline || '';
            result.Medication_In_Hospital_Morphine = ReceivingData.Medication_In_Hospital_Morphine || '';
            result.Medication_In_Hospital_Atropine = ReceivingData.Medication_In_Hospital_Atropine || ''; 
            result.OtherMedicationArray = ReceivingData.OtherMedicationArray || [];
            result.save( function(errNew, resultNew){
               if (errNew) {
                  res.status(417).send({ Status: false, Message: "Some error occurred while update the Medication in Hospital Details!.", Error: errNew });
               } else {
                  res.status(200).send({Status: true, Response: resultNew });
               }
            });
         }
      });
   }
};
// In hospital Summary - Medication in Hospital History Create----------------------------------------------
exports.MedicationInHospitalHistory_Create = function(req, res){
   var ReceivingData = req.body;

   if(!ReceivingData.Patient || ReceivingData.Patient === null){
        res.status(400).send({ Status: false, Message: "Patient Detail not valid!" });
     } else if(!ReceivingData.Hospital || ReceivingData.Hospital === null){
        res.status(400).send({ Status: false, Message: "Hospital Detail not valid!" });
     } else {
      const Create_HospitalSummaryMedicationInHospital = new HospitalSummaryModel.HospitalSummaryMedicationInHospitalSchema({
         PatientId: mongoose.Types.ObjectId(ReceivingData.Patient),
         Hospital: mongoose.Types.ObjectId(ReceivingData.Hospital),  
         Medication_In_Hospital_Nitroglycerin: ReceivingData.Medication_In_Hospital_Nitroglycerin || '',
         Medication_In_Hospital_Nitroglycerin_Route: ReceivingData.Medication_In_Hospital_Nitroglycerin_Route || '',
         Medication_In_Hospital_Nitroglycerin_Dosage: ReceivingData.Medication_In_Hospital_Nitroglycerin_Dosage || '',
         Medication_In_Hospital_Nitroglycerin_Dosage_Units: ReceivingData.Medication_In_Hospital_Nitroglycerin_Dosage_Units || '',
         Medication_In_Hospital_Nitroglycerin_Date_Time: ReceivingData.Medication_In_Hospital_Nitroglycerin_Date_Time || '',
         Medication_In_Hospital_Dopamine: ReceivingData.Medication_In_Hospital_Dopamine || '',
         Medication_In_Hospital_Dopamine_Route: ReceivingData.Medication_In_Hospital_Dopamine_Route || '',
         Medication_In_Hospital_Dopamine_Dosage: ReceivingData.Medication_In_Hospital_Dopamine_Dosage || '',
         Medication_In_Hospital_Dopamine_Dosage_Units: ReceivingData.Medication_In_Hospital_Dopamine_Dosage_Units || '',
         Medication_In_Hospital_Dopamine_Date_Time: ReceivingData.Medication_In_Hospital_Dopamine_Date_Time || '',
         Medication_In_Hospital_Dobutamine: ReceivingData.Medication_In_Hospital_Dobutamine || '',
         Medication_In_Hospital_Dobutamine_Route: ReceivingData.Medication_In_Hospital_Dobutamine_Route || '',
         Medication_In_Hospital_Dobutamine_Dosage: ReceivingData.Medication_In_Hospital_Dobutamine_Dosage || '',
         Medication_In_Hospital_Dobutamine_Dosage_Units: ReceivingData.Medication_In_Hospital_Dobutamine_Dosage_Units || '',
         Medication_In_Hospital_Dobutamine_Date_Time: ReceivingData.Medication_In_Hospital_Dobutamine_Date_Time || '',
         Medication_In_Hospital_Adrenaline: ReceivingData.Medication_In_Hospital_Adrenaline || '',
         Medication_In_Hospital_Adrenaline_Route: ReceivingData.Medication_In_Hospital_Adrenaline_Route || '',
         Medication_In_Hospital_Adrenaline_Dosage: ReceivingData.Medication_In_Hospital_Adrenaline_Dosage || '',
         Medication_In_Hospital_Adrenaline_Dosage_Units: ReceivingData.Medication_In_Hospital_Adrenaline_Dosage_Units || '',
         Medication_In_Hospital_Adrenaline_Date_Time: ReceivingData.Medication_In_Hospital_Adrenaline_Date_Time || '',
         Medication_In_Hospital_Nor_Aadrenaline: ReceivingData.Medication_In_Hospital_Nor_Aadrenaline || '',
         Medication_In_Hospital_Nor_Aadrenaline_Route: ReceivingData.Medication_In_Hospital_Nor_Aadrenaline_Route || '',
         Medication_In_Hospital_Nor_Aadrenaline_Dosage: ReceivingData.Medication_In_Hospital_Nor_Aadrenaline_Dosage || '',
         Medication_In_Hospital_Nor_Aadrenaline_Dosage_Units: ReceivingData.Medication_In_Hospital_Nor_Aadrenaline_Dosage_Units || '',
         Medication_In_Hospital_Nor_Aadrenaline_Date_Time: ReceivingData.Medication_In_Hospital_Nor_Aadrenaline_Date_Time || '',
         Medication_In_Hospital_Oxygen: ReceivingData.Medication_In_Hospital_Oxygen || '',
         Medication_In_Hospital_Oxygen_Dosage: ReceivingData.Medication_In_Hospital_Oxygen_Dosage || '',
         Medication_In_Hospital_Aspirin: ReceivingData.Medication_In_Hospital_Aspirin || '',
         Medication_In_Hospital_Aspirin_Dosage: ReceivingData.Medication_In_Hospital_Aspirin_Dosage || '',
         Medication_In_Hospital_Aspirin_Dosage_Date_Time: ReceivingData.Medication_In_Hospital_Aspirin_Dosage_Date_Time || null,
         Medication_In_Hospital_Clopidogrel: ReceivingData.Medication_In_Hospital_Clopidogrel || '',
         Medication_In_Hospital_Clopidogrel_Dosage: ReceivingData.Medication_In_Hospital_Clopidogrel_Dosage || '',
         Medication_In_Hospital_Clopidogrel_Dosage_Date_Time: ReceivingData.Medication_In_Hospital_Clopidogrel_Dosage_Date_Time || null,
         Medication_In_Hospital_Prasugrel: ReceivingData.Medication_In_Hospital_Prasugrel || '',
         Medication_In_Hospital_Prasugrel_Dosage: ReceivingData.Medication_In_Hospital_Prasugrel_Dosage || '',
         Medication_In_Hospital_Prasugrel_Dosage_Date_Time: ReceivingData.Medication_In_Hospital_Prasugrel_Dosage_Date_Time || null,
         Medication_In_Hospital_Ticagrelor: ReceivingData.Medication_In_Hospital_Ticagrelor || '',
         Medication_In_Hospital_Ticagrelor_Dosage: ReceivingData.Medication_In_Hospital_Ticagrelor_Dosage || '',
         Medication_In_Hospital_Ticagrelor_Dosage_Date_Time: ReceivingData.Medication_In_Hospital_Ticagrelor_Dosage_Date_Time || null,
         Medication_In_Hospital_IIbIIIa_inhibitor: ReceivingData.Medication_In_Hospital_IIbIIIa_inhibitor || '',
         Medication_In_Hospital_IIbIIIa_inhibitor_Dosage: ReceivingData.Medication_In_Hospital_IIbIIIa_inhibitor_Dosage || '',
         Medication_In_Hospital_IIbIIIa_inhibitor_Date_Time: ReceivingData.Medication_In_Hospital_IIbIIIa_inhibitor_Date_Time || null,
         Medication_In_Hospital_Inotrope: ReceivingData.Medication_In_Hospital_Inotrope || '',
         Medication_In_Hospital_Inotrope_Dosage: ReceivingData.Medication_In_Hospital_Inotrope_Dosage || '',
         Medication_In_Hospital_Inotrope_Date_Time: ReceivingData.Medication_In_Hospital_Inotrope_Date_Time || null,
			Medication_In_Hospital_Enoxaparin: ReceivingData.Medication_In_Hospital_Enoxaparin || '',
         Medication_In_Hospital_Enoxaparin_Dosage: ReceivingData.Medication_In_Hospital_Enoxaparin_Dosage || '',
         Medication_In_Hospital_Enoxaparin_Date_Time: ReceivingData.Medication_In_Hospital_Enoxaparin_Date_Time || null,
         Medication_In_Hospital_UnFractionated_Heparin: ReceivingData.Medication_In_Hospital_UnFractionated_Heparin || '',
         Medication_In_Hospital_UnFractionated_Heparin_Route: ReceivingData.Medication_In_Hospital_UnFractionated_Heparin_Route || '',
         Medication_In_Hospital_UnFractionated_Heparin_Dosage: ReceivingData.Medication_In_Hospital_UnFractionated_Heparin_Dosage || null,
         Medication_In_Hospital_UnFractionated_Heparin_Dosage_Units: ReceivingData.Medication_In_Hospital_UnFractionated_Heparin_Dosage_Units || '',
         Medication_In_Hospital_UnFractionated_Heparin_Date_Time: ReceivingData.Medication_In_Hospital_UnFractionated_Heparin_Date_Time || null,
         Medication_In_Hospital_LMW_Heparin: ReceivingData.Medication_In_Hospital_LMW_Heparin || '',
         Medication_In_Hospital_LMW_Heparin_Route: ReceivingData.Medication_In_Hospital_LMW_Heparin_Route || '',
         Medication_In_Hospital_LMW_Heparin_Dosage: ReceivingData.Medication_In_Hospital_LMW_Heparin_Dosage || null,
         Medication_In_Hospital_LMW_Heparin_Dosage_Units: ReceivingData.Medication_In_Hospital_LMW_Heparin_Dosage_Units || '',
         Medication_In_Hospital_LMW_Heparin_Date_Time: ReceivingData.Medication_In_Hospital_LMW_Heparin_Date_Time || null,
			Medication_In_Hospital_Fondaparinux: ReceivingData.Medication_In_Hospital_Fondaparinux || '',
			Medication_In_Hospital_Fondaparinux_Route: ReceivingData.Medication_In_Hospital_Fondaparinux_Route || '',
			Medication_In_Hospital_Fondaparinux_Dosage: ReceivingData.Medication_In_Hospital_Fondaparinux_Dosage || null,
			Medication_In_Hospital_Fondaparinux_Dosage_Units: ReceivingData.Medication_In_Hospital_Fondaparinux_Dosage_Units || '',
			Medication_In_Hospital_Fondaparinux_Date_Time: ReceivingData.Medication_In_Hospital_Fondaparinux_Date_Time || null,
         Medication_In_Hospital_N_Saline: ReceivingData.Medication_In_Hospital_N_Saline || '',
         Medication_In_Hospital_Morphine: ReceivingData.Medication_In_Hospital_Morphine || '',
         Medication_In_Hospital_Atropine: ReceivingData.Medication_In_Hospital_Atropine || '',
         OtherMedicationArray: ReceivingData.OtherMedicationArray || [],
         Active_Status: true,
         If_Deleted: false
      });
      Create_HospitalSummaryMedicationInHospital.save(function(err, result){
         if (err) {
            res.status(417).send({ Status: false, Message: "Some error occurred while Creating the Hospital Summary Medication in Hospital!.", Error: err });
         } else {
            res.status(200).send({Status: true, Response: result });
         }
      });
   }
};



 // In hospital Summary - Adverse Events Create----------------------------------------------
exports.HospitalSummaryAdverseEvents_Create = function(req, res){
   var ReceivingData = req.body;

   if(!ReceivingData.User || ReceivingData.User === null){
      res.status(400).send({ Status: false, Message: "User Details is Required!" });
   } else if(!ReceivingData.PatientId || ReceivingData.PatientId === null){
      res.status(400).send({ Status: false, Message: "Patient Detail not valid!" });
   } else if(!ReceivingData.Hospital || ReceivingData.Hospital === null){
      res.status(400).send({ Status: false, Message: "Hospital Detail not valid!" });
   } else {
      const Create_HospitalSummaryAdverseEvents = new HospitalSummaryModel.HospitalSummaryAdverseEventsSchema({
         PatientId: mongoose.Types.ObjectId(ReceivingData.PatientId),
         Hospital: mongoose.Types.ObjectId(ReceivingData.Hospital),
         Adverse_Events_Primary_Reperfusion_therapy: ReceivingData.Adverse_Events_Primary_Reperfusion_therapy || '',
         Adverse_Events_Reperfusion_Late_presentation: ReceivingData.Adverse_Events_Reperfusion_Late_presentation || '',
         Adverse_Events_Reperfusion_Other: ReceivingData.Adverse_Events_Reperfusion_Other || '',
         Adverse_Events_Reperfusion_Specify_Other: ReceivingData.Adverse_Events_Reperfusion_Specify_Other || '',
         Adverse_Events_Recurrence_Of_Angina: ReceivingData.Adverse_Events_Recurrence_Of_Angina || '',
         Adverse_Events_Recurrence_Of_Angina_Date: ReceivingData.Adverse_Events_Recurrence_Of_Angina_Date || '',
         Adverse_Events_Re_infarction: ReceivingData.Adverse_Events_Re_infarction || '',
         Adverse_Events_Location_Of_Re_infarction: ReceivingData.Adverse_Events_Location_Of_Re_infarction || '',
         Adverse_Events_Re_infarction_Date: ReceivingData.Adverse_Events_Re_infarction_Date || '',
         Adverse_Events_Repeat_Pci: ReceivingData.Adverse_Events_Repeat_Pci || '',
         Adverse_Events_Repeat_Pci_Date: ReceivingData.Adverse_Events_Repeat_Pci_Date || '',
         Adverse_Events_Repeat_Cabg: ReceivingData.Adverse_Events_Repeat_Cabg || '',
         Adverse_Events_Repeat_Cabg_Date: ReceivingData.Adverse_Events_Repeat_Cabg_Date || '',
         Adverse_Events_Stroke: ReceivingData.Adverse_Events_Stroke || '',
         Adverse_Events_Stroke_Date: ReceivingData.Adverse_Events_Stroke_Date || '',
         Adverse_Events_Cardiogenic_Shock: ReceivingData.Adverse_Events_Cardiogenic_Shock || '',
         Adverse_Events_Cardiogenic_Shock_Date: ReceivingData.Adverse_Events_Cardiogenic_Shock_Date || '',
         Adverse_Events_Hemorrhage: ReceivingData.Adverse_Events_Hemorrhage || '',
         Adverse_Events_Hemorrhage_Date: ReceivingData.Adverse_Events_Hemorrhage_Date || '',
         Adverse_Events_Major_Bleed: ReceivingData.Adverse_Events_Major_Bleed || '',
         Adverse_Events_Major_Bleed_Date: ReceivingData.Adverse_Events_Major_Bleed_Date || '',
         Adverse_Events_Minor_Bleed: ReceivingData.Adverse_Events_Minor_Bleed || '',
         Adverse_Events_Minor_Bleed_Date: ReceivingData.Adverse_Events_Minor_Bleed_Date || '',
         Adverse_Events_In_stent_thrombosis: ReceivingData.Adverse_Events_In_stent_thrombosis || '',
			Adverse_Events_Prolonged_Admission_Beyond30Days: ReceivingData.Adverse_Events_Prolonged_Admission_Beyond30Days || '',
         Adverse_Events_Death: ReceivingData.Adverse_Events_Death || '',
			Adverse_Events_Cause_of_Death: ReceivingData.Adverse_Events_Cause_of_Death || '',
         Adverse_Events_Death_Date_Time: ReceivingData.Adverse_Events_Death_Date_Time || '',
         Adverse_Events_Death_Remarks: ReceivingData.Adverse_Events_Death_Remarks || '',
         OtherMedicationArrayAdverseEvent: ReceivingData.OtherMedicationArrayAdverseEvent || [],
         Active_Status: true,
         If_Deleted: false
      });
      Create_HospitalSummaryAdverseEvents.save(function(err, result){
         if (err) {
            res.status(417).send({ Status: false, Message: "Some error occurred while Creating the Hospital Summary Adverse Events!.", Error: err });
         } else {
            HospitalSummaryModel.HospitalSummaryAdverseEventsSchema.find({PatientId: mongoose.Types.ObjectId(ReceivingData.PatientId)}, {}, {'sort': { createdAt: 1 }})
            .populate({ path: 'Hospital', select: ['Hospital_Name', 'Hospital_Role']})
            .exec(function(err_1, result_1) {
               if(err_1) {
                  res.status(417).send({status: false, Message: "Some error occurred while Find The Adverse Events Details!.", Error: err_1 });
               } else {
                  res.status(200).send({Status: true, Response: result_1 });
               }
            });
         }
      });
   }
};

// In hospital Summary - Adverse Events Update----------------------------------------------
exports.HospitalSummaryAdverseEvents_Update = function(req, res) {
   var ReceivingData = req.body;

   if(!ReceivingData.User || ReceivingData.User === null){
      res.status(400).send({ Status: false, Message: "User Details is Required!" });
   } else if(!ReceivingData.PatientId || ReceivingData.PatientId === null){
      res.status(400).send({ Status: false, Message: "Patient Detail not valid!" });
   } else if(!ReceivingData.EventsId || ReceivingData.EventsId === null){
      res.status(400).send({ Status: false, Message: "Adverse Events Details not valid!" });
   } else {
      HospitalSummaryModel.HospitalSummaryAdverseEventsSchema.findOne({_id: mongoose.Types.ObjectId(ReceivingData.EventsId)}, {}, {}, function(err, result) {
         if (err) {
            res.status(417).send({ Status: false, Message: "Some error occurred while Find the Adverse Events!.", Error: err });
         } else if (result === null){
            res.status(400).send({ Status: false, Message: "Invalid Adverse Events Details!" });
         } else {
            result.Adverse_Events_Primary_Reperfusion_therapy = ReceivingData.Adverse_Events_Primary_Reperfusion_therapy || '';
            result.Adverse_Events_Reperfusion_Late_presentation = ReceivingData.Adverse_Events_Reperfusion_Late_presentation || '';
            result.Adverse_Events_Reperfusion_Other = ReceivingData.Adverse_Events_Reperfusion_Other || '';
            result.Adverse_Events_Reperfusion_Specify_Other = ReceivingData.Adverse_Events_Reperfusion_Specify_Other || '';
            result.Adverse_Events_Recurrence_Of_Angina = ReceivingData.Adverse_Events_Recurrence_Of_Angina || '';
            result.Adverse_Events_Recurrence_Of_Angina_Date = ReceivingData.Adverse_Events_Recurrence_Of_Angina_Date || '';
            result.Adverse_Events_Re_infarction = ReceivingData.Adverse_Events_Re_infarction || '';
            result.Adverse_Events_Location_Of_Re_infarction = ReceivingData.Adverse_Events_Location_Of_Re_infarction || '';
            result.Adverse_Events_Re_infarction_Date = ReceivingData.Adverse_Events_Re_infarction_Date || '';
            result.Adverse_Events_Repeat_Pci = ReceivingData.Adverse_Events_Repeat_Pci || '';
            result.Adverse_Events_Repeat_Pci_Date = ReceivingData.Adverse_Events_Repeat_Pci_Date || '';
            result.Adverse_Events_Repeat_Cabg = ReceivingData.Adverse_Events_Repeat_Cabg || '';
            result.Adverse_Events_Repeat_Cabg_Date = ReceivingData.Adverse_Events_Repeat_Cabg_Date || '';
            result.Adverse_Events_Stroke = ReceivingData.Adverse_Events_Stroke || '';
            result.Adverse_Events_Stroke_Date = ReceivingData.Adverse_Events_Stroke_Date || '';
            result.Adverse_Events_Cardiogenic_Shock = ReceivingData.Adverse_Events_Cardiogenic_Shock || '';
            result.Adverse_Events_Cardiogenic_Shock_Date = ReceivingData.Adverse_Events_Cardiogenic_Shock_Date || '';
            result.Adverse_Events_Hemorrhage = ReceivingData.Adverse_Events_Hemorrhage || '';
            result.Adverse_Events_Hemorrhage_Date = ReceivingData.Adverse_Events_Hemorrhage_Date || '';
            result.Adverse_Events_Major_Bleed = ReceivingData.Adverse_Events_Major_Bleed || '';
            result.Adverse_Events_Major_Bleed_Date = ReceivingData.Adverse_Events_Major_Bleed_Date || '';
            result.Adverse_Events_Minor_Bleed = ReceivingData.Adverse_Events_Minor_Bleed || '';
            result.Adverse_Events_Minor_Bleed_Date = ReceivingData.Adverse_Events_Minor_Bleed_Date || '';
            result.Adverse_Events_In_stent_thrombosis = ReceivingData.Adverse_Events_In_stent_thrombosis || '';
				result.Adverse_Events_Prolonged_Admission_Beyond30Days = ReceivingData.Adverse_Events_Prolonged_Admission_Beyond30Days || '';
            result.Adverse_Events_Death = ReceivingData.Adverse_Events_Death || '';
				result.Adverse_Events_Cause_of_Death = ReceivingData.Adverse_Events_Cause_of_Death || '';
				result.Adverse_Events_Death_Date_Time = ReceivingData.Adverse_Events_Death_Date_Time || '';
				result.Adverse_Events_Death_Remarks = ReceivingData.Adverse_Events_Death_Remarks || '';
            result.OtherMedicationArrayAdverseEvent = ReceivingData.OtherMedicationArrayAdverseEvent || [];
            result.save( function(errNew, resultNew){
               if (errNew) {
                  res.status(417).send({ Status: false, Message: "Some error occurred while update the Adverse Events Details!.", Error: errNew });
               } else {
                  HospitalSummaryModel.HospitalSummaryAdverseEventsSchema.find({PatientId: mongoose.Types.ObjectId(ReceivingData.PatientId)}, {}, {'sort': { createdAt: 1 }})
                  .populate({ path: 'Hospital', select: ['Hospital_Name', 'Hospital_Role']})
                  .exec(function(err_1, result_1) {
                     if(err_1) {
                        res.status(417).send({status: false, Message: "Some error occurred while Find The Adverse Events Details!.", Error: err_1 });
                     } else {
                        res.status(200).send({Status: true, Response: result_1 });
                     }
                  });
               }
            });
         }
      });
   }
};

// In hospital Summary - Adverse Events View---------------------------------------------------------
exports.HospitalSummaryAdverseEvents_View= function(req, res) {
   var ReceivingData = req.body;

   if (!ReceivingData.User || ReceivingData.User === '') {
      res.status(400).send({ Status: false, Message: "User Details is Required!" });
   } else if (!ReceivingData.PatientId || ReceivingData.PatientId === '') {
      res.status(400).send({ Status: false, Message: "Patient Detail not valid!" });
   } else {
      HospitalSummaryModel.HospitalSummaryAdverseEventsSchema.find({PatientId: mongoose.Types.ObjectId(ReceivingData.PatientId)}, {}, { 'sort': { createdAt: 1 } })
      .populate({ path: 'Hospital', select: ['Hospital_Name', 'Hospital_Role']})
      .exec(function(err, result) {
         if(err) {
            res.status(417).send({status: false, Message: "Some error occurred while Find The Adverse Events Details!.", Error: err });
         } else {
            res.status(200).send({Status: true, Response: result });
         }
      });
   }
};

// In hospital Summary - Adverse Events History Update----------------------------------------------
exports.AdverseEventsHistory_Update = function(req, res) {
   var ReceivingData = req.body;

   if(!ReceivingData.Patient || ReceivingData.Patient === null){
      res.status(400).send({ Status: false, Message: "Patient Detail not valid!" });
   } else if(!ReceivingData._id || ReceivingData._id === null){
      res.status(400).send({ Status: false, Message: "Adverse Events Details not valid!" });
   } else {
      HospitalSummaryModel.HospitalSummaryAdverseEventsSchema.findOne({_id: mongoose.Types.ObjectId(ReceivingData._id)}, {}, {}, function(err, result) {
         if (err) {
            res.status(417).send({ Status: false, Message: "Some error occurred while Find the Adverse Events!.", Error: err });
         } else if (result === null){
            res.status(400).send({ Status: false, Message: "Invalid Adverse Events Details!" });
         } else {
            result.Adverse_Events_Primary_Reperfusion_therapy = ReceivingData.Adverse_Events_Primary_Reperfusion_therapy || '';
            result.Adverse_Events_Reperfusion_Late_presentation = ReceivingData.Adverse_Events_Reperfusion_Late_presentation || '';
            result.Adverse_Events_Reperfusion_Other = ReceivingData.Adverse_Events_Reperfusion_Other || '';
            result.Adverse_Events_Reperfusion_Specify_Other = ReceivingData.Adverse_Events_Reperfusion_Specify_Other || '';
            result.Adverse_Events_Recurrence_Of_Angina = ReceivingData.Adverse_Events_Recurrence_Of_Angina || '';
            result.Adverse_Events_Recurrence_Of_Angina_Date = ReceivingData.Adverse_Events_Recurrence_Of_Angina_Date || '';
            result.Adverse_Events_Re_infarction = ReceivingData.Adverse_Events_Re_infarction || '';
            result.Adverse_Events_Location_Of_Re_infarction = ReceivingData.Adverse_Events_Location_Of_Re_infarction || '';
            result.Adverse_Events_Re_infarction_Date = ReceivingData.Adverse_Events_Re_infarction_Date || '';
            result.Adverse_Events_Repeat_Pci = ReceivingData.Adverse_Events_Repeat_Pci || '';
            result.Adverse_Events_Repeat_Pci_Date = ReceivingData.Adverse_Events_Repeat_Pci_Date || '';
            result.Adverse_Events_Repeat_Cabg = ReceivingData.Adverse_Events_Repeat_Cabg || '';
            result.Adverse_Events_Repeat_Cabg_Date = ReceivingData.Adverse_Events_Repeat_Cabg_Date || '';
            result.Adverse_Events_Stroke = ReceivingData.Adverse_Events_Stroke || '';
            result.Adverse_Events_Stroke_Date = ReceivingData.Adverse_Events_Stroke_Date || '';
            result.Adverse_Events_Cardiogenic_Shock = ReceivingData.Adverse_Events_Cardiogenic_Shock || '';
            result.Adverse_Events_Cardiogenic_Shock_Date = ReceivingData.Adverse_Events_Cardiogenic_Shock_Date || '';
            result.Adverse_Events_Hemorrhage = ReceivingData.Adverse_Events_Hemorrhage || '';
            result.Adverse_Events_Hemorrhage_Date = ReceivingData.Adverse_Events_Hemorrhage_Date || '';
            result.Adverse_Events_Major_Bleed = ReceivingData.Adverse_Events_Major_Bleed || '';
            result.Adverse_Events_Major_Bleed_Date = ReceivingData.Adverse_Events_Major_Bleed_Date || '';
            result.Adverse_Events_Minor_Bleed = ReceivingData.Adverse_Events_Minor_Bleed || '';
            result.Adverse_Events_Minor_Bleed_Date = ReceivingData.Adverse_Events_Minor_Bleed_Date || '';
            result.Adverse_Events_In_stent_thrombosis = ReceivingData.Adverse_Events_In_stent_thrombosis || '';
				result.Adverse_Events_Prolonged_Admission_Beyond30Days = ReceivingData.Adverse_Events_Prolonged_Admission_Beyond30Days || '';
            result.Adverse_Events_Death = ReceivingData.Adverse_Events_Death || '';
				result.Adverse_Events_Cause_of_Death = ReceivingData.Adverse_Events_Cause_of_Death || '';
				result.Adverse_Events_Death_Date_Time = ReceivingData.Adverse_Events_Death_Date_Time || '';
				result.Adverse_Events_Death_Remarks = ReceivingData.Adverse_Events_Death_Remarks || '';
            result.OtherMedicationArrayAdverseEvent = ReceivingData.OtherMedicationArrayAdverseEvent || [];
            result.save( function(errNew, resultNew){
               if (errNew) {
                  res.status(417).send({ Status: false, Message: "Some error occurred while update the Adverse Events Details!.", Error: errNew });
               } else {
                  res.status(200).send({Status: true, Response: resultNew });
               }
            });
         }
      });
   }
};
 // In hospital Summary - Adverse Events History Create----------------------------------------------
 exports.AdverseEventsHistory_Create = function(req, res){
   var ReceivingData = req.body;

   if(!ReceivingData.Patient || ReceivingData.Patient === null){
      res.status(400).send({ Status: false, Message: "Patient Detail not valid!" });
   } else if(!ReceivingData.Hospital || ReceivingData.Hospital === null){
      res.status(400).send({ Status: false, Message: "Hospital Detail not valid!" });
   } else {
      const Create_HospitalSummaryAdverseEvents = new HospitalSummaryModel.HospitalSummaryAdverseEventsSchema({
         PatientId: mongoose.Types.ObjectId(ReceivingData.Patient),
         Hospital: mongoose.Types.ObjectId(ReceivingData.Hospital),
         Adverse_Events_Primary_Reperfusion_therapy: ReceivingData.Adverse_Events_Primary_Reperfusion_therapy || '',
         Adverse_Events_Reperfusion_Late_presentation: ReceivingData.Adverse_Events_Reperfusion_Late_presentation || '',
         Adverse_Events_Reperfusion_Other: ReceivingData.Adverse_Events_Reperfusion_Other || '',
         Adverse_Events_Reperfusion_Specify_Other: ReceivingData.Adverse_Events_Reperfusion_Specify_Other || '',
         Adverse_Events_Recurrence_Of_Angina: ReceivingData.Adverse_Events_Recurrence_Of_Angina || '',
         Adverse_Events_Recurrence_Of_Angina_Date: ReceivingData.Adverse_Events_Recurrence_Of_Angina_Date || '',
         Adverse_Events_Re_infarction: ReceivingData.Adverse_Events_Re_infarction || '',
         Adverse_Events_Location_Of_Re_infarction: ReceivingData.Adverse_Events_Location_Of_Re_infarction || '',
         Adverse_Events_Re_infarction_Date: ReceivingData.Adverse_Events_Re_infarction_Date || '',
         Adverse_Events_Repeat_Pci: ReceivingData.Adverse_Events_Repeat_Pci || '',
         Adverse_Events_Repeat_Pci_Date: ReceivingData.Adverse_Events_Repeat_Pci_Date || '',
         Adverse_Events_Repeat_Cabg: ReceivingData.Adverse_Events_Repeat_Cabg || '',
         Adverse_Events_Repeat_Cabg_Date: ReceivingData.Adverse_Events_Repeat_Cabg_Date || '',
         Adverse_Events_Stroke: ReceivingData.Adverse_Events_Stroke || '',
         Adverse_Events_Stroke_Date: ReceivingData.Adverse_Events_Stroke_Date || '',
         Adverse_Events_Cardiogenic_Shock: ReceivingData.Adverse_Events_Cardiogenic_Shock || '',
         Adverse_Events_Cardiogenic_Shock_Date: ReceivingData.Adverse_Events_Cardiogenic_Shock_Date || '',
         Adverse_Events_Hemorrhage: ReceivingData.Adverse_Events_Hemorrhage || '',
         Adverse_Events_Hemorrhage_Date: ReceivingData.Adverse_Events_Hemorrhage_Date || '',
         Adverse_Events_Major_Bleed: ReceivingData.Adverse_Events_Major_Bleed || '',
         Adverse_Events_Major_Bleed_Date: ReceivingData.Adverse_Events_Major_Bleed_Date || '',
         Adverse_Events_Minor_Bleed: ReceivingData.Adverse_Events_Minor_Bleed || '',
         Adverse_Events_Minor_Bleed_Date: ReceivingData.Adverse_Events_Minor_Bleed_Date || '',
         Adverse_Events_In_stent_thrombosis: ReceivingData.Adverse_Events_In_stent_thrombosis || '',
			Adverse_Events_Prolonged_Admission_Beyond30Days: ReceivingData.Adverse_Events_Prolonged_Admission_Beyond30Days || '',
         Adverse_Events_Death: ReceivingData.Adverse_Events_Death || '',
			Adverse_Events_Cause_of_Death: ReceivingData.Adverse_Events_Cause_of_Death || '',
         Adverse_Events_Death_Date_Time: ReceivingData.Adverse_Events_Death_Date_Time || '',
         Adverse_Events_Death_Remarks: ReceivingData.Adverse_Events_Death_Remarks || '',
         OtherMedicationArrayAdverseEvent: ReceivingData.OtherMedicationArrayAdverseEvent || [],
         Active_Status: true,
         If_Deleted: false
      });
      Create_HospitalSummaryAdverseEvents.save(function(err, result){
         if (err) {
            res.status(417).send({ Status: false, Message: "Some error occurred while Creating the Hospital Summary Adverse Events!.", Error: err });
         } else {
            res.status(200).send({Status: true, Response: result });
         }
      });
   }
};
