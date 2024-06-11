var PciModel = require('./../../models/patient-management/pci.model');
var PatientDetailsModel = require('../../models/patient-management/patient_details.model');
var mongoose = require('mongoose');

// Drug before pci Create----------------------------------------------
exports.PciDrugBeforePci_Create = function(req, res){
   var ReceivingData = req.body;

    if(!ReceivingData.User || ReceivingData.User === null){
      res.status(400).send({ Status: false, Message: "User Details is Required!" });
   } else if(!ReceivingData.PatientId || ReceivingData.PatientId === null){
      res.status(400).send({ Status: false, Message: "Patient Detail not valid!" });
   } else if(!ReceivingData.Hospital || ReceivingData.Hospital === null){
      res.status(400).send({ Status: false, Message: "Hospital Detail not valid!" });
   } else {
      const Create_PciDrugBeforePci = new PciModel.PCIDrugBeforePciSchema({
         PatientId: mongoose.Types.ObjectId(ReceivingData.PatientId),
         Hospital: mongoose.Types.ObjectId(ReceivingData.Hospital),
         Pci_Drug_Before_Pci_Clopidogrel: ReceivingData.Pci_Drug_Before_Pci_Clopidogrel || '',
         Pci_Drug_Before_Pci_Clopidogrel_Date_Time: ReceivingData.Pci_Drug_Before_Pci_Clopidogrel_Date_Time || '',
         Pci_Drug_Before_Pci_Prasugrel: ReceivingData.Pci_Drug_Before_Pci_Prasugrel || '',
         Pci_Drug_Before_Pci_Prasugrel_Date_Time: ReceivingData.Pci_Drug_Before_Pci_Prasugrel_Date_Time || '',
         Pci_Drug_Before_Pci_Ticagrelor: ReceivingData.Pci_Drug_Before_Pci_Ticagrelor || '',
         Pci_Drug_Before_Pci_Ticagrelor_Date_Time: ReceivingData.Pci_Drug_Before_Pci_Ticagrelor_Date_Time || '',
         Pci_Drug_Before_Pci_Aspirin: ReceivingData.Pci_Drug_Before_Pci_Aspirin || '',
         Pci_Drug_Before_Pci_Aspirin_Dosage: ReceivingData.Pci_Drug_Before_Pci_Aspirin_Dosage || '',
         Pci_Drug_Before_Pci_Aspirin_Dosage_Date_Time: ReceivingData.Pci_Drug_Before_Pci_Aspirin_Dosage_Date_Time || '',
         DrugsBeforePCIOthersArray: ReceivingData.DrugsBeforePCIOthersArray || [],
         Active_Status: true,
         If_Deleted: false
      });
      Create_PciDrugBeforePci.save(function(err, result){
         if (err) {
            res.status(417).send({ Status: false, Message: "Some error occurred while Creating the Drug Before PCI!.", Error: err });
         } else {
            res.status(200).send({ Status: true, Response: result });
         }
      });
   }
};
// Drug Before PCI View---------------------------------------------------------
exports.PciDrugBeforePci_View = function(req, res) {
   var ReceivingData = req.body;

   if (!ReceivingData.User || ReceivingData.User === '') {
      res.status(400).send({ Status: false, Message: "User Details is Required!" });
   } else if (!ReceivingData.PatientId || ReceivingData.PatientId === '') {
      res.status(400).send({ Status: false, Message: "Patient Detail not valid!" });
   } else {
      PciModel.PCIDrugBeforePciSchema.findOne({PatientId: mongoose.Types.ObjectId(ReceivingData.PatientId)}, {}, {})
      .exec(function(err, result) {
         if(err) {
            res.status(417).send({status: false, Message: "Some error occurred while Find The Drug Before PCI!.", Error: err });
         } else {
            res.status(200).send({Status: true, Response: result });
         }
      });
   }
};
// Drug Before PCI Update----------------------------------------------
exports.PciDrugBeforePci_Update = function(req, res){
   var ReceivingData = req.body;

   if(!ReceivingData.User || ReceivingData.User === null){
      res.status(400).send({ Status: false, Message: "User Details is Required!" });
   } else if(!ReceivingData.PatientId || ReceivingData.PatientId === null){
      res.status(400).send({ Status: false, Message: "Patient Detail not valid!" });
   } else if(!ReceivingData.DrugBeforePciId || ReceivingData.DrugBeforePciId === null){
      res.status(400).send({ Status: false, Message: "Drug Before PCI not valid!" });
   } else {
      PciModel.PCIDrugBeforePciSchema.findOne({_id: mongoose.Types.ObjectId(ReceivingData.DrugBeforePciId)}, {}, {}, function(err, result) {
         if (err) {
            res.status(417).send({ Status: false, Message: "Some error occurred while Find the Drug Before PCI!.", Error: err });
         } else if (result === null){
            res.status(400).send({ Status: false, Message: "Invalid Drug Before PCI Details!" });
         } else {

            result.Pci_Drug_Before_Pci_Clopidogrel = ReceivingData.Pci_Drug_Before_Pci_Clopidogrel || '';
            result.Pci_Drug_Before_Pci_Clopidogrel_Date_Time = ReceivingData.Pci_Drug_Before_Pci_Clopidogrel_Date_Time || '';
            result.Pci_Drug_Before_Pci_Prasugrel = ReceivingData.Pci_Drug_Before_Pci_Prasugrel || '';
            result.Pci_Drug_Before_Pci_Prasugrel_Date_Time = ReceivingData.Pci_Drug_Before_Pci_Prasugrel_Date_Time || '';
            result.Pci_Drug_Before_Pci_Ticagrelor = ReceivingData.Pci_Drug_Before_Pci_Ticagrelor || '';
            result.Pci_Drug_Before_Pci_Ticagrelor_Date_Time = ReceivingData.Pci_Drug_Before_Pci_Ticagrelor_Date_Time || '';
            result.Pci_Drug_Before_Pci_Aspirin = ReceivingData.Pci_Drug_Before_Pci_Aspirin || '';
            result.Pci_Drug_Before_Pci_Aspirin_Dosage = ReceivingData.Pci_Drug_Before_Pci_Aspirin_Dosage || '';
            result.Pci_Drug_Before_Pci_Aspirin_Dosage_Date_Time = ReceivingData.Pci_Drug_Before_Pci_Aspirin_Dosage_Date_Time || '';
            result.DrugsBeforePCIOthersArray = ReceivingData.DrugsBeforePCIOthersArray || [];
            
            result.save( function(errNew, resultNew){
               if (errNew) {
                  res.status(417).send({ Status: false, Message: "Some error occurred while update the Drug Before PCI!.", Error: errNew });
               } else {
                  res.status(200).send({ Status: true, Response: resultNew });
               }
            });
         }
      });
   }
};









// PCI Pci Create----------------------------------------------
exports.Pci_Create = function(req, res){
    var ReceivingData = req.body;
 
    if(!ReceivingData.User || ReceivingData.User === null){
      res.status(400).send({ Status: false, Message: "User Details is Required!" });
   } else if(!ReceivingData.PatientId || ReceivingData.PatientId === null){
      res.status(400).send({ Status: false, Message: "Patient Detail not valid!" });
   } else if(!ReceivingData.Hospital || ReceivingData.Hospital === null){
      res.status(400).send({ Status: false, Message: "Hospital Detail not valid!" });
   } else {
      const Create_Pci = new PciModel.PciSchema({
         PatientId: mongoose.Types.ObjectId(ReceivingData.PatientId),
         Hospital: mongoose.Types.ObjectId(ReceivingData.Hospital),
         PCI: ReceivingData.PCI || '',
         PCI_No_Reason: ReceivingData.PCI_No_Reason || '',
         Pci_Cath_Lab_Activation_Date_Time: ReceivingData.Pci_Cath_Lab_Activation_Date_Time || '',
         Pci_Cath_Lab_Arrival_Date_Time: ReceivingData.Pci_Cath_Lab_Arrival_Date_Time || '',
         Pci_Vascular_Access_Date_Time: ReceivingData.Pci_Vascular_Access_Date_Time || '',
         Pci_Catheter_Access: ReceivingData.Pci_Catheter_Access || '',
         Pci_Cart_Start_Date_Time: ReceivingData.Pci_Cart_Start_Date_Time || '',
         Pci_Cart_End_Date_Time: ReceivingData.Pci_Cart_End_Date_Time || '',
         Pci_Cart: ReceivingData.Pci_Cart || '',
         PCI_Management_Conservative: ReceivingData.PCI_Management_Conservative || '',
         PCI_Management_CABG: ReceivingData.PCI_Management_CABG || '',
         PCI_Management_CABG_Present_elective: ReceivingData.PCI_Management_CABG_Present_elective || '',
         PCI_Management_CABG_Date: ReceivingData.PCI_Management_CABG_Date || '',
         PCI_Management_PCI: ReceivingData.PCI_Management_PCI || '',
			PCI_Options: ReceivingData.PCI_Options || '',
         PCI_No_Distal_lesion: ReceivingData.PCI_No_Distal_lesion || '',
         PCI_No_Tortuosity: ReceivingData.PCI_No_Tortuosity || '',
         PCI_No_Small_vessel: ReceivingData.PCI_No_Small_vessel || '',
         PCI_No_Non_significant_lesion: ReceivingData.PCI_No_Non_significant_lesion || '',
         PCI_No_Other_Reason: ReceivingData.PCI_No_Other_Reason || '',
         PCI_No_Specify_Other: ReceivingData.PCI_No_Specify_Other || '',
         PCI_No_Successful_lysis: ReceivingData.PCI_No_Successful_lysis || '',

         // PCI_Management_Rescue_PCI: ReceivingData.PCI_Management_Rescue_PCI || '',
         // PCI_Management_Rescue_PCI_Ongoing_pain: ReceivingData.PCI_Management_Rescue_PCI_Ongoing_pain || '',
         // PCI_Management_Rescue_PCI_lessThan50_reduction_ST_elevation: ReceivingData.PCI_Management_Rescue_PCI_lessThan50_reduction_ST_elevation || '',
         // PCI_Management_Rescue_PCI_Haemodynamic_instability: ReceivingData.PCI_Management_Rescue_PCI_Haemodynamic_instability || '',
         // PCI_Management_Rescue_PCI_Electrical_instability: ReceivingData.PCI_Management_Rescue_PCI_Electrical_instability || '',

         CulpritVesselArray: ReceivingData.CulpritVesselArray || [],
         VesselArray: ReceivingData.VesselArray || [],
         PCI_Intervention_IABP: ReceivingData.PCI_Intervention_IABP || '',
         PCI_Intervention_Additional_revascularization: ReceivingData.PCI_Intervention_Additional_revascularization || '',
         PCI_Intervention_Additional_revascularization_Specify: ReceivingData.PCI_Intervention_Additional_revascularization_Specify || '',
         PCI_Intervention_Admission: ReceivingData.PCI_Intervention_Admission || '',
         PCI_Intervention_Subsequent_Admission: ReceivingData.PCI_Intervention_Subsequent_Admission || '',
         PCI_Intervention_Angiogram: ReceivingData.PCI_Intervention_Angiogram || '',
         PCI_Intervention_ReferralCABG: ReceivingData.PCI_Intervention_ReferralCABG || '',
			Failed_PCI: ReceivingData.Failed_PCI || '',
         Failed_PCI_Reason: ReceivingData.Failed_PCI_Reason || '',

         Active_Status: true,
         If_Deleted: false
      });
      Create_Pci.save(function(err, result){
         if (err) {
            res.status(417).send({ Status: false, Message: "Some error occurred while Creating the PCI!.", Error: err });
         } else {
            const IfPCI = ReceivingData.PCI === 'Yes' ? true : ReceivingData.PCI === 'No' ? false : null; 
            PatientDetailsModel.PatientBasicDetailsSchema.updateOne({_id: mongoose.Types.ObjectId(ReceivingData.PatientId)}, { $set: {IfPCI: IfPCI, PCIFrom: mongoose.Types.ObjectId(ReceivingData.Hospital) }}).exec();
            res.status(200).send({ Status: true, Response: result });
         }
      });
   }
 };

// PCI Pci View---------------------------------------------------------
exports.Pci_View = function(req, res) {
   var ReceivingData = req.body;

   if (!ReceivingData.User || ReceivingData.User === '') {
      res.status(400).send({ Status: false, Message: "User Details is Required!" });
   } else if (!ReceivingData.PatientId || ReceivingData.PatientId === '') {
      res.status(400).send({ Status: false, Message: "Patient Detail not valid!" });
   } else {
      PciModel.PciSchema.findOne({PatientId: mongoose.Types.ObjectId(ReceivingData.PatientId)}, {}, {})
      .exec(function(err, result) {
         if(err) {
            res.status(417).send({status: false, Message: "Some error occurred while Find The PCI!.", Error: err });
         } else {
            res.status(200).send({Status: true, Response: result });
         }
      });
   }
};

// PCI PCI Update----------------------------------------------
exports.Pci_Update = function(req, res){
   var ReceivingData = req.body;

   if(!ReceivingData.User || ReceivingData.User === null){
      res.status(400).send({ Status: false, Message: "User Details is Required!" });
   } else if(!ReceivingData.PatientId || ReceivingData.PatientId === null){
      res.status(400).send({ Status: false, Message: "Patient Detail not valid!" });
   } else if(!ReceivingData.PCIId || ReceivingData.PCIId === null){
      res.status(400).send({ Status: false, Message: "Drug Before PCI not valid!" });
   } else {
      PciModel.PciSchema.findOne({_id: mongoose.Types.ObjectId(ReceivingData.PCIId)}, {}, {}, function(err, result) {
         if (err) {
            res.status(417).send({ Status: false, Message: "Some error occurred while Find the PCI!.", Error: err });
         } else if (result === null){
            res.status(400).send({ Status: false, Message: "Invalid PCI Details!" });
         } else {
            result.PCI = ReceivingData.PCI || '';
            result.PCI_No_Reason = ReceivingData.PCI_No_Reason || '';
            result.Pci_Cath_Lab_Activation_Date_Time = ReceivingData.Pci_Cath_Lab_Activation_Date_Time || '';
            result.Pci_Cath_Lab_Arrival_Date_Time = ReceivingData.Pci_Cath_Lab_Arrival_Date_Time || '';
            result.Pci_Vascular_Access_Date_Time = ReceivingData.Pci_Vascular_Access_Date_Time || '';
            result.Pci_Catheter_Access = ReceivingData.Pci_Catheter_Access || '';
            result.Pci_Cart_Start_Date_Time = ReceivingData.Pci_Cart_Start_Date_Time || '';
            result.Pci_Cart_End_Date_Time = ReceivingData.Pci_Cart_End_Date_Time || '';
            result.Pci_Cart = ReceivingData.Pci_Cart || '';
            result.PCI_Management_Conservative = ReceivingData.PCI_Management_Conservative || '';
            result.PCI_Management_CABG = ReceivingData.PCI_Management_CABG || '';
            result.PCI_Management_CABG_Present_elective = ReceivingData.PCI_Management_CABG_Present_elective || '';
            result.PCI_Management_CABG_Date = ReceivingData.PCI_Management_CABG_Date || '';
            result.PCI_Management_PCI = ReceivingData.PCI_Management_PCI || '';
				result.PCI_Options = ReceivingData.PCI_Options || '';
            result.PCI_No_Distal_lesion = ReceivingData.PCI_No_Distal_lesion || '';
            result.PCI_No_Tortuosity = ReceivingData.PCI_No_Tortuosity || '';
            result.PCI_No_Small_vessel = ReceivingData.PCI_No_Small_vessel || '';
            result.PCI_No_Non_significant_lesion = ReceivingData.PCI_No_Non_significant_lesion || '';
            result.PCI_No_Other_Reason = ReceivingData.PCI_No_Other_Reason || '';
            result.PCI_No_Specify_Other = ReceivingData.PCI_No_Specify_Other || '';
            result.PCI_No_Successful_lysis = ReceivingData.PCI_No_Successful_lysis || '';

            // result.PCI_Management_Rescue_PCI = ReceivingData.PCI_Management_Rescue_PCI || '';
            // result.PCI_Management_Rescue_PCI_Ongoing_pain = ReceivingData.PCI_Management_Rescue_PCI_Ongoing_pain || '';
            // result.PCI_Management_Rescue_PCI_lessThan50_reduction_ST_elevation = ReceivingData.PCI_Management_Rescue_PCI_lessThan50_reduction_ST_elevation || '';
            // result.PCI_Management_Rescue_PCI_Haemodynamic_instability = ReceivingData.PCI_Management_Rescue_PCI_Haemodynamic_instability || '';
            // result.PCI_Management_Rescue_PCI_Electrical_instability = ReceivingData.PCI_Management_Rescue_PCI_Electrical_instability || '';

            result.CulpritVesselArray = ReceivingData.CulpritVesselArray || [];
            result.VesselArray = ReceivingData.VesselArray || [];
            result.PCI_Intervention_IABP = ReceivingData.PCI_Intervention_IABP || '';
            result.PCI_Intervention_Additional_revascularization = ReceivingData.PCI_Intervention_Additional_revascularization || '';
            result.PCI_Intervention_Additional_revascularization_Specify = ReceivingData.PCI_Intervention_Additional_revascularization_Specify || '';
            result.PCI_Intervention_Admission = ReceivingData.PCI_Intervention_Admission || '';
            result.PCI_Intervention_Subsequent_Admission = ReceivingData.PCI_Intervention_Subsequent_Admission || '';
				result.PCI_Intervention_Angiogram = ReceivingData.PCI_Intervention_Angiogram || '';
            result.PCI_Intervention_ReferralCABG = ReceivingData.PCI_Intervention_ReferralCABG || '';
				result.Failed_PCI = ReceivingData.Failed_PCI || '';
            result.Failed_PCI_Reason = ReceivingData.Failed_PCI_Reason || '';

            result.save( function(errNew, resultNew){
               if (errNew) {
                  res.status(417).send({ Status: false, Message: "Some error occurred while update the PCI!.", Error: errNew });
               } else {
                  const IfPCI = ReceivingData.PCI === 'Yes' ? true : ReceivingData.PCI === 'No' ? false : null; 
                  PatientDetailsModel.PatientBasicDetailsSchema.updateOne({_id: mongoose.Types.ObjectId(ReceivingData.PatientId)}, { $set: {IfPCI: IfPCI }}).exec();
                  res.status(200).send({ Status: true, Response: resultNew });
               }
            });
         }
      });
   }
};

 // PCI Medication in cath Create----------------------------------------------
exports.PciMedicationInCath_Create = function(req, res){
    var ReceivingData = req.body;
 
    if(!ReceivingData.User || ReceivingData.User === null){
      res.status(400).send({ Status: false, Message: "User Details is Required!" });
   } else if(!ReceivingData.PatientId || ReceivingData.PatientId === null){
      res.status(400).send({ Status: false, Message: "Patient Detail not valid!" });
   } else if(!ReceivingData.Hospital || ReceivingData.Hospital === null){
      res.status(400).send({ Status: false, Message: "Hospital Detail not valid!" });
    } else {
      const Create_PciMedicationInCath = new PciModel.PciMedicationInCathSchema({
         PatientId: mongoose.Types.ObjectId(ReceivingData.PatientId),
         Hospital: mongoose.Types.ObjectId(ReceivingData.Hospital),
         Medication_In_Cath_Nitroglycerin: ReceivingData.Medication_In_Cath_Nitroglycerin || '',
         Medication_In_Cath_Adenosine: ReceivingData.Medication_In_Cath_Adenosine || '',
         Medication_In_Cath_Nicorandil: ReceivingData.Medication_In_Cath_Nicorandil || '',
         Medication_In_Cath_Snp: ReceivingData.Medication_In_Cath_Snp || '',
         Medication_In_Cath_Ca_Blockers: ReceivingData.Medication_In_Cath_Ca_Blockers || '',
         IntraCoronaryDrugsOthersArray: ReceivingData.IntraCoronaryDrugsOthersArray || [],
         Medication_In_Cath_Inhibitors_Abciximab: ReceivingData.Medication_In_Cath_Inhibitors_Abciximab || '',
         Medication_In_Cath_Inhibitors_Eptifibatide: ReceivingData.Medication_In_Cath_Inhibitors_Eptifibatide || '',
         Medication_In_Cath_Inhibitors_Tirofiban: ReceivingData.Medication_In_Cath_Inhibitors_Tirofiban || '',
         InhibitorsOthersArray: ReceivingData.InhibitorsOthersArray || [],
         Anti_Thrombotics_Unfractionated_Heparin: ReceivingData.Anti_Thrombotics_Unfractionated_Heparin || '',
         Anti_Thrombotics_Unfractionated_Heparin_Dosage: ReceivingData.Anti_Thrombotics_Unfractionated_Heparin_Dosage || '',
         Anti_Thrombotics_Unfractionated_Heparin_Dosage_Units: ReceivingData.Anti_Thrombotics_Unfractionated_Heparin_Dosage_Units || '',
         Anti_Thrombotics_Unfractionated_Heparin_Dosage_Date: ReceivingData.Anti_Thrombotics_Unfractionated_Heparin_Dosage_Date || '',
         Anti_Thrombotics_LMW_Heparin: ReceivingData.Anti_Thrombotics_LMW_Heparin || '',
         Anti_Thrombotics_LMW_Heparin_Route: ReceivingData.Anti_Thrombotics_LMW_Heparin_Route || '',
         Anti_Thrombotics_LMW_Heparin_Dosage: ReceivingData.Anti_Thrombotics_LMW_Heparin_Dosage || '',
         Anti_Thrombotics_LMW_Heparin_Dosage_Units: ReceivingData.Anti_Thrombotics_LMW_Heparin_Dosage_Units || '',
         Anti_Thrombotics_LMW_Heparin_Dosage_Date: ReceivingData.Anti_Thrombotics_LMW_Heparin_Dosage_Date || '',
         Anti_Thrombotics_Bivalirudin: ReceivingData.Anti_Thrombotics_Bivalirudin || '',
         AntiThromboticsOthersArray: ReceivingData.AntiThromboticsOthersArray || [],
         Active_Status: true,
         If_Deleted: false
      });
      Create_PciMedicationInCath.save(function(err, result){
         if (err) {
            res.status(417).send({ Status: false, Message: "Some error occurred while Creating the Medication In Cath!.", Error: err });
         } else {
            res.status(200).send({ Status: true, Response: result });
         }
      });
   }
};

// PCI Medication in cath View---------------------------------------------------------
exports.PciMedicationInCath_View = function(req, res) {
   var ReceivingData = req.body;

   if (!ReceivingData.User || ReceivingData.User === '') {
      res.status(400).send({ Status: false, Message: "User Details is Required!" });
   } else if (!ReceivingData.PatientId || ReceivingData.PatientId === '') {
      res.status(400).send({ Status: false, Message: "Patient Detail not valid!" });
   } else {
      PciModel.PciMedicationInCathSchema.findOne({PatientId: mongoose.Types.ObjectId(ReceivingData.PatientId)}, {}, {})
      .exec(function(err, result) {
         if(err) {
            res.status(417).send({status: false, Message: "Some error occurred while Find The Medication In Cath!.", Error: err });
         } else {
            res.status(200).send({Status: true, Response: result });
         }
      });
   }
};
// PCI Medication in cath Update----------------------------------------------
exports.PciMedicationInCath_Update = function(req, res){
   var ReceivingData = req.body;

   if(!ReceivingData.User || ReceivingData.User === null){
      res.status(400).send({ Status: false, Message: "User Details is Required!" });
   } else if(!ReceivingData.PatientId || ReceivingData.PatientId === null){
      res.status(400).send({ Status: false, Message: "Patient Detail not valid!" });
   } else if(!ReceivingData.MedicationInCathId || ReceivingData.MedicationInCathId === null){
      res.status(400).send({ Status: false, Message: "PCI Medication In Cath not valid!" });
   } else {
      PciModel.PciMedicationInCathSchema.findOne({_id: mongoose.Types.ObjectId(ReceivingData.MedicationInCathId)}, {}, {}, function(err, result) {
         if (err) {
            res.status(417).send({ Status: false, Message: "Some error occurred while Find the Medication In Cath!.", Error: err });
         } else if (result === null){
            res.status(400).send({ Status: false, Message: "Invalid Medication In Cath Details!" });
         } else {

            result.Medication_In_Cath_Nitroglycerin = ReceivingData.Medication_In_Cath_Nitroglycerin || '';
            result.Medication_In_Cath_Adenosine = ReceivingData.Medication_In_Cath_Adenosine || '';
            result.Medication_In_Cath_Nicorandil = ReceivingData.Medication_In_Cath_Nicorandil || '';
            result.Medication_In_Cath_Snp = ReceivingData.Medication_In_Cath_Snp || '';
            result.Medication_In_Cath_Ca_Blockers = ReceivingData.Medication_In_Cath_Ca_Blockers || '';
            result.IntraCoronaryDrugsOthersArray = ReceivingData.IntraCoronaryDrugsOthersArray || [];
            result.Medication_In_Cath_Inhibitors_Abciximab = ReceivingData.Medication_In_Cath_Inhibitors_Abciximab || '';
            result.Medication_In_Cath_Inhibitors_Eptifibatide = ReceivingData.Medication_In_Cath_Inhibitors_Eptifibatide || '';
            result.Medication_In_Cath_Inhibitors_Tirofiban = ReceivingData.Medication_In_Cath_Inhibitors_Tirofiban || '';
            result.InhibitorsOthersArray = ReceivingData.InhibitorsOthersArray || [];
            result.Anti_Thrombotics_Unfractionated_Heparin = ReceivingData.Anti_Thrombotics_Unfractionated_Heparin || '';
            result.Anti_Thrombotics_Unfractionated_Heparin_Dosage = ReceivingData.Anti_Thrombotics_Unfractionated_Heparin_Dosage || '';
            result.Anti_Thrombotics_Unfractionated_Heparin_Dosage_Units = ReceivingData.Anti_Thrombotics_Unfractionated_Heparin_Dosage_Units || '';
            result.Anti_Thrombotics_Unfractionated_Heparin_Dosage_Date = ReceivingData.Anti_Thrombotics_Unfractionated_Heparin_Dosage_Date || '';
            result.Anti_Thrombotics_LMW_Heparin = ReceivingData.Anti_Thrombotics_LMW_Heparin || '';
            result.Anti_Thrombotics_LMW_Heparin_Route = ReceivingData.Anti_Thrombotics_LMW_Heparin_Route || '';
            result.Anti_Thrombotics_LMW_Heparin_Dosage = ReceivingData.Anti_Thrombotics_LMW_Heparin_Dosage || '';
            result.Anti_Thrombotics_LMW_Heparin_Dosage_Units = ReceivingData.Anti_Thrombotics_LMW_Heparin_Dosage_Units || '';
            result.Anti_Thrombotics_LMW_Heparin_Dosage_Date = ReceivingData.Anti_Thrombotics_LMW_Heparin_Dosage_Date || '';
            result.Anti_Thrombotics_Bivalirudin = ReceivingData.Anti_Thrombotics_Bivalirudin || '';
            result.AntiThromboticsOthersArray = ReceivingData.AntiThromboticsOthersArray || [];
            result.save( function(errNew, resultNew){
               if (errNew) {
                  res.status(417).send({ Status: false, Message: "Some error occurred while update the Medication In Cath!.", Error: errNew });
               } else {
                  res.status(200).send({ Status: true, Response: resultNew });
               }
            });
         }
      });
   }
};
