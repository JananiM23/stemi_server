var ThrombolysisModel = require('./../../models/patient-management/thrombolysis.model');
var PatientDetailsModel = require('../../models/patient-management/patient_details.model');
var mongoose = require('mongoose');

// Medication prior to Thrombolysis
exports.ThrombolysisMedication_Create = function(req, res){
    var ReceivingData = req.body;

    if(!ReceivingData.User || ReceivingData.User === null){
      res.status(400).send({ Status: false, Message: "User Details is Required!" });
   } else if(!ReceivingData.PatientId || ReceivingData.PatientId === null){
      res.status(400).send({ Status: false, Message: "Patient Detail not valid!" });
   } else if(!ReceivingData.Hospital || ReceivingData.Hospital === null){
      res.status(400).send({ Status: false, Message: "Hospital Detail not valid!" });
   } else {
      const Create_ThrombolysisMedication = new ThrombolysisModel.ThrombolysisMedicationSchema({
         PatientId: mongoose.Types.ObjectId(ReceivingData.PatientId),
         Hospital: mongoose.Types.ObjectId(ReceivingData.Hospital),
         Medication_Prior_to_Thrombolysis_Aspirin: ReceivingData.Medication_Prior_to_Thrombolysis_Aspirin || '',
         Medication_Prior_to_Thrombolysis_Aspirin_Dosage: ReceivingData.Medication_Prior_to_Thrombolysis_Aspirin_Dosage || null,
         Medication_Prior_to_Thrombolysis_Aspirin_Dosage_Units: ReceivingData.Medication_Prior_to_Thrombolysis_Aspirin_Dosage_Units || '',
         Aspirin_Date_Time: ReceivingData.Aspirin_Date_Time || null,
         Medication_Prior_to_Thrombolysis_Clopidogrel: ReceivingData.Medication_Prior_to_Thrombolysis_Clopidogrel || '',
         Medication_Prior_to_Thrombolysis_Clopidogrel_Dosage: ReceivingData.Medication_Prior_to_Thrombolysis_Clopidogrel_Dosage || null,
         Medication_Prior_to_Thrombolysis_Clopidogrel_Dosage_Units: ReceivingData.Medication_Prior_to_Thrombolysis_Clopidogrel_Dosage_Units || '',
         Medication_Prior_to_Thrombolysis_Clopidogrel_Dosage_Date_Time: ReceivingData.Medication_Prior_to_Thrombolysis_Clopidogrel_Dosage_Date_Time || null,
         Unfractionated_Heparin: ReceivingData.Unfractionated_Heparin || '',
         Unfractionated_Heparin_Dosage: ReceivingData.Unfractionated_Heparin_Dosage || null,
         Unfractionated_Heparin_Dosage_Units: ReceivingData.Unfractionated_Heparin_Dosage_Units || '',
         Unfractionated_Heparin_Dosage_Date_Time: ReceivingData.Unfractionated_Heparin_Dosage_Date_Time || null,
         Medication_Prior_to_Thrombolysis_LMW_Heparin: ReceivingData.Medication_Prior_to_Thrombolysis_LMW_Heparin || '',
         Medication_Prior_to_Thrombolysis_LMW_Heparin_Dosage: ReceivingData.Medication_Prior_to_Thrombolysis_LMW_Heparin_Dosage || null,
         Medication_Prior_to_Thrombolysis_LMW_Heparin_Dosage_Units: ReceivingData.Medication_Prior_to_Thrombolysis_LMW_Heparin_Dosage_Units || '',
         Medication_Prior_to_Thrombolysis_LMW_Heparin_Dosage_Date_Time: ReceivingData.Medication_Prior_to_Thrombolysis_LMW_Heparin_Dosage_Date_Time || null,
         Medication_Prior_to_Thrombolysis_Ticagrelor: ReceivingData.Medication_Prior_to_Thrombolysis_Ticagrelor || '',
         Medication_Prior_to_Thrombolysis_Ticagrelor_Dosage: ReceivingData.Medication_Prior_to_Thrombolysis_Ticagrelor_Dosage || null,
         Medication_Prior_to_Thrombolysis_Ticagrelor_Dosage_Units: ReceivingData.Medication_Prior_to_Thrombolysis_Ticagrelor_Dosage_Units || '',
         Medication_Prior_to_Thrombolysis_Ticagrelor_Dosage_Units_Date_Time: ReceivingData.Medication_Prior_to_Thrombolysis_Ticagrelor_Dosage_Units_Date_Time || null,
			Medication_Prior_to_Thrombolysis_Enoxaparin: ReceivingData.Medication_Prior_to_Thrombolysis_Enoxaparin || '',
         Medication_Prior_to_Thrombolysis_Enoxaparin_Dosage: ReceivingData.Medication_Prior_to_Thrombolysis_Enoxaparin_Dosage || null,
         Medication_Prior_to_Thrombolysis_Enoxaparin_Dosage_Units: ReceivingData.Medication_Prior_to_Thrombolysis_Enoxaparin_Dosage_Units || '',
         Medication_Prior_to_Thrombolysis_Enoxaparin_Dosage_Units_Date_Time: ReceivingData.Medication_Prior_to_Thrombolysis_Enoxaparin_Dosage_Units_Date_Time || null,
         OtherMedicationArray: ReceivingData.OtherMedicationArray || [],
         Active_Status: true,
         If_Deleted: false
      });
      Create_ThrombolysisMedication.save(function (err, result) {
         if (err) {
            res.status(417).send({ Status: false, Message: "Some error occurred while Creating the Medication Prior To Thrombolysis!", Error: err });
         } else {
            res.status(200).send({ Status: true, Response: result });
         }
      });
   }
};
// Medication prior to Thrombolysis View---------------------------------------------------------
exports.ThrombolysisMedication_View= function(req, res) {
   var ReceivingData = req.body;

   if (!ReceivingData.User || ReceivingData.User === '') {
      res.status(400).send({ Status: false, Message: "User Details is Required!" });
   } else if (!ReceivingData.PatientId || ReceivingData.PatientId === '') {
      res.status(400).send({ Status: false, Message: "Patient Detail not valid!" });
   } else {
      ThrombolysisModel.ThrombolysisMedicationSchema.findOne({PatientId: mongoose.Types.ObjectId(ReceivingData.PatientId)}, {}, {})
      .exec(function(err, result) {
         if(err) {
            res.status(417).send({status: false, Message: "Some error occurred while Find The Medication Prior To Thrombolysis!.", Error: err });
         } else {
            res.status(200).send({Status: true, Response: result });
         }
      });
   }
};

// Medication prior to Thrombolysis Update----------------------------------------------
exports.ThrombolysisMedication_Update = function(req, res){
   var ReceivingData = req.body;

   if(!ReceivingData.User || ReceivingData.User === null){
      res.status(400).send({ Status: false, Message: "User Details is Required!" });
   } else if(!ReceivingData.PatientId || ReceivingData.PatientId === null){
      res.status(400).send({ Status: false, Message: "Patient Detail not valid!" });
   } else if(!ReceivingData.MedicationId || ReceivingData.MedicationId === null){
      res.status(400).send({ Status: false, Message: "Medication Prior To Thrombolysis not valid!" });
   } else {
      ThrombolysisModel.ThrombolysisMedicationSchema.findOne({_id: mongoose.Types.ObjectId(ReceivingData.MedicationId)}, {}, {}, function(err, result) {
         if (err) {
            res.status(417).send({ Status: false, Message: "Some error occurred while Find the Medication Prior To Thrombolysis!.", Error: err });
         } else if (result === null){
            res.status(400).send({ Status: false, Message: "Invalid Medication Prior To Thrombolysis Details!" });
         } else {

            result.Medication_Prior_to_Thrombolysis_Aspirin = ReceivingData.Medication_Prior_to_Thrombolysis_Aspirin || '';
            result.Medication_Prior_to_Thrombolysis_Aspirin_Dosage = ReceivingData.Medication_Prior_to_Thrombolysis_Aspirin_Dosage || null;
            result.Medication_Prior_to_Thrombolysis_Aspirin_Dosage_Units = ReceivingData.Medication_Prior_to_Thrombolysis_Aspirin_Dosage_Units || '';
            result.Aspirin_Date_Time = ReceivingData.Aspirin_Date_Time || null;
            result.Medication_Prior_to_Thrombolysis_Clopidogrel = ReceivingData.Medication_Prior_to_Thrombolysis_Clopidogrel || '';
            result.Medication_Prior_to_Thrombolysis_Clopidogrel_Dosage = ReceivingData.Medication_Prior_to_Thrombolysis_Clopidogrel_Dosage || null;
            result.Medication_Prior_to_Thrombolysis_Clopidogrel_Dosage_Units = ReceivingData.Medication_Prior_to_Thrombolysis_Clopidogrel_Dosage_Units || '';
            result.Medication_Prior_to_Thrombolysis_Clopidogrel_Dosage_Date_Time = ReceivingData.Medication_Prior_to_Thrombolysis_Clopidogrel_Dosage_Date_Time || null;
            result.Unfractionated_Heparin = ReceivingData.Unfractionated_Heparin || '';
            result.Unfractionated_Heparin_Dosage = ReceivingData.Unfractionated_Heparin_Dosage || null;
            result.Unfractionated_Heparin_Dosage_Units = ReceivingData.Unfractionated_Heparin_Dosage_Units || '';
            result.Unfractionated_Heparin_Dosage_Date_Time = ReceivingData.Unfractionated_Heparin_Dosage_Date_Time || null;
            result.Medication_Prior_to_Thrombolysis_LMW_Heparin = ReceivingData.Medication_Prior_to_Thrombolysis_LMW_Heparin || '';
            result.Medication_Prior_to_Thrombolysis_LMW_Heparin_Dosage = ReceivingData.Medication_Prior_to_Thrombolysis_LMW_Heparin_Dosage || null;
            result.Medication_Prior_to_Thrombolysis_LMW_Heparin_Dosage_Units = ReceivingData.Medication_Prior_to_Thrombolysis_LMW_Heparin_Dosage_Units || '';
            result.Medication_Prior_to_Thrombolysis_LMW_Heparin_Dosage_Date_Time = ReceivingData.Medication_Prior_to_Thrombolysis_LMW_Heparin_Dosage_Date_Time || null;
            result.Medication_Prior_to_Thrombolysis_Ticagrelor = ReceivingData.Medication_Prior_to_Thrombolysis_Ticagrelor || '';
            result.Medication_Prior_to_Thrombolysis_Ticagrelor_Dosage = ReceivingData.Medication_Prior_to_Thrombolysis_Ticagrelor_Dosage || null;
            result.Medication_Prior_to_Thrombolysis_Ticagrelor_Dosage_Units = ReceivingData.Medication_Prior_to_Thrombolysis_Ticagrelor_Dosage_Units || '';
            result.Medication_Prior_to_Thrombolysis_Ticagrelor_Dosage_Units_Date_Time = ReceivingData.Medication_Prior_to_Thrombolysis_Ticagrelor_Dosage_Units_Date_Time || null;
				result.Medication_Prior_to_Thrombolysis_Enoxaparin = ReceivingData.Medication_Prior_to_Thrombolysis_Enoxaparin || '';
            result.Medication_Prior_to_Thrombolysis_Enoxaparin_Dosage = ReceivingData.Medication_Prior_to_Thrombolysis_Enoxaparin_Dosage || null;
            result.Medication_Prior_to_Thrombolysis_Enoxaparin_Dosage_Units = ReceivingData.Medication_Prior_to_Thrombolysis_Enoxaparin_Dosage_Units || '';
            result.Medication_Prior_to_Thrombolysis_Enoxaparin_Dosage_Units_Date_Time = ReceivingData.Medication_Prior_to_Thrombolysis_Enoxaparin_Dosage_Units_Date_Time || null;
				result.OtherMedicationArray = ReceivingData.OtherMedicationArray || [];

            result.save( function(errNew, resultNew){
               if (errNew) {
                  res.status(417).send({ Status: false, Message: "Some error occurred while update the Medication Prior To Thrombolysis Details!.", Error: errNew });
               } else {
                  res.status(200).send({ Status: true, Response: resultNew });
               }
            });
         }
      });
   }
};












exports.Thrombolysis_Create = function(req, res){
   var ReceivingData = req.body;
   if(!ReceivingData.User || ReceivingData.User === null){
     res.status(400).send({ Status: false, Message: "User Details is Required!" });
     } else if(!ReceivingData.PatientId || ReceivingData.PatientId === null){
        res.status(400).send({ Status: false, Message: "Patient Detail not valid!" });
     } else if(!ReceivingData.Hospital || ReceivingData.Hospital === null){
        res.status(400).send({ Status: false, Message: "Hospital Detail not valid!" });
     }  else {
        const Create_Thrombolysis = new ThrombolysisModel.ThrombolysisSchema({            
           PatientId: mongoose.Types.ObjectId(ReceivingData.PatientId),
           Hospital: mongoose.Types.ObjectId(ReceivingData.Hospital),
           Thrombolysis: ReceivingData.Thrombolysis || '',
           Reason_to_proceed_for_thrombolysis: ReceivingData.Reason_to_proceed_for_thrombolysis || '',
           Thrombolysis_Agent_Select_any_one: ReceivingData.Thrombolysis_Agent_Select_any_one || '',
           Thrombolysis_Agent_Completed: ReceivingData.Thrombolysis_Agent_Completed || '',
           Thrombolysis_Agent_Dosage: ReceivingData.Thrombolysis_Agent_Dosage || null,
           Thrombolysis_Agent_Dosage_Units: ReceivingData.Thrombolysis_Agent_Dosage_Units || '',
           Thrombolysis_Agent_Dosage_Start_Date_time: ReceivingData.Thrombolysis_Agent_Dosage_Start_Date_time || null,
           Thrombolysis_Agent_Dosage_End_Date_time: ReceivingData.Thrombolysis_Agent_Dosage_End_Date_time || null,
           Thrombolysis_90_120_Min_ECG: ReceivingData.Thrombolysis_90_120_Min_ECG || '',
           Thrombolysis_90_120_Min_ECG_Date_Time: ReceivingData.Thrombolysis_90_120_Min_ECG_Date_Time || null,
           Thrombolysis_Successful_Lysis: ReceivingData.Thrombolysis_Successful_Lysis || '',
			  Thrombolysis_MissedSTEMI: ReceivingData.Thrombolysis_MissedSTEMI || '',
           Thrombolysis_Autoreperfused: ReceivingData.Thrombolysis_Autoreperfused || '',
           Thrombolysis_Others: ReceivingData.Thrombolysis_Others || '',
			  Reperfusion_Markers: ReceivingData.Reperfusion_Markers || '',
           Ongoing_pain: ReceivingData.Ongoing_pain || '',
           lessThan50_reduction_ST_elevation: ReceivingData.lessThan50_reduction_ST_elevation || '',
           Haemodynamic_instability: ReceivingData.Haemodynamic_instability || '',
           Electrical_instability: ReceivingData.Electrical_instability || '',
           Active_Status: true,
           If_Deleted: false
       });
       Create_Thrombolysis.save(function (err, result) {
           if (err) {
              res.status(417).send({ Status: false, Message: "Some error occurred while Creating the Thrombolysis!", Error: err });
           } else {
              const IfThrombolysis = ReceivingData.Thrombolysis === 'Yes' ? true : ReceivingData.Thrombolysis === 'No' ? false : null; 
              PatientDetailsModel.PatientBasicDetailsSchema.updateOne({_id: mongoose.Types.ObjectId(ReceivingData.PatientId)}, { $set: {IfThrombolysis: IfThrombolysis, ThrombolysisFrom: mongoose.Types.ObjectId(ReceivingData.Hospital) }}).exec();
              res.status(200).send({ Status: true, Response: result });
           }
        });
   }
};

// Thrombolysis View---------------------------------------------------------
exports.Thrombolysis_View= function(req, res) {
  var ReceivingData = req.body;

  if (!ReceivingData.User || ReceivingData.User === '') {
     res.status(400).send({ Status: false, Message: "User Details is Required!" });
  } else if (!ReceivingData.PatientId || ReceivingData.PatientId === '') {
     res.status(400).send({ Status: false, Message: "Patient Detail not valid!" });
  } else {
     ThrombolysisModel.ThrombolysisSchema.findOne({PatientId: mongoose.Types.ObjectId(ReceivingData.PatientId)}, {}, {})
     .exec(function(err, result) {
        if(err) {
           res.status(417).send({status: false, Message: "Some error occurred while Find The Thrombolysis!.", Error: err });
        } else {
           res.status(200).send({Status: true, Response: result });
        }
     });
  }
};

// Thrombolysis Update----------------------------------------------
exports.Thrombolysis_Update = function(req, res){
  var ReceivingData = req.body;

  if(!ReceivingData.User || ReceivingData.User === null){
     res.status(400).send({ Status: false, Message: "User Details is Required!" });
  } else if(!ReceivingData.PatientId || ReceivingData.PatientId === null){
     res.status(400).send({ Status: false, Message: "Patient Detail not valid!" });
  } else if(!ReceivingData.ThrombolysisId || ReceivingData.ThrombolysisId === null){
     res.status(400).send({ Status: false, Message: "Thrombolysis not valid!" });
  } else {
     ThrombolysisModel.ThrombolysisSchema.findOne({_id: mongoose.Types.ObjectId(ReceivingData.ThrombolysisId)}, {}, {}, function(err, result) {
        if (err) {
           res.status(417).send({ Status: false, Message: "Some error occurred while Find the Thrombolysis!.", Error: err });
        } else if (result === null){
           res.status(400).send({ Status: false, Message: "Invalid Thrombolysis Details!" });
        } else {
            result.Thrombolysis = ReceivingData.Thrombolysis || '';
            result.Reason_to_proceed_for_thrombolysis = ReceivingData.Reason_to_proceed_for_thrombolysis || '';
           result.Thrombolysis_Agent_Select_any_one = ReceivingData.Thrombolysis_Agent_Select_any_one || '';
           result.Thrombolysis_Agent_Completed = ReceivingData.Thrombolysis_Agent_Completed || '';
           result.Thrombolysis_Agent_Dosage = ReceivingData.Thrombolysis_Agent_Dosage || null;
           result.Thrombolysis_Agent_Dosage_Units = ReceivingData.Thrombolysis_Agent_Dosage_Units || '';
           result.Thrombolysis_Agent_Dosage_Start_Date_time = ReceivingData.Thrombolysis_Agent_Dosage_Start_Date_time || null;
           result.Thrombolysis_Agent_Dosage_End_Date_time = ReceivingData.Thrombolysis_Agent_Dosage_End_Date_time || null;
           result.Thrombolysis_90_120_Min_ECG = ReceivingData.Thrombolysis_90_120_Min_ECG || '';
           result.Thrombolysis_90_120_Min_ECG_Date_Time = ReceivingData.Thrombolysis_90_120_Min_ECG_Date_Time || null;
           result.Thrombolysis_Successful_Lysis = ReceivingData.Thrombolysis_Successful_Lysis || '';
			  result.Thrombolysis_MissedSTEMI = ReceivingData.Thrombolysis_MissedSTEMI || '';
           result.Thrombolysis_Autoreperfused = ReceivingData.Thrombolysis_Autoreperfused || '';
           result.Thrombolysis_Others = ReceivingData.Thrombolysis_Others || '';
			  result.Reperfusion_Markers = ReceivingData.Reperfusion_Markers || '';
           result.Ongoing_pain = ReceivingData.Ongoing_pain || '';
           result.lessThan50_reduction_ST_elevation = ReceivingData.lessThan50_reduction_ST_elevation || '';
           result.Haemodynamic_instability = ReceivingData.Haemodynamic_instability || '';
           result.Electrical_instability = ReceivingData.Electrical_instability || '';
           result.save( function(errNew, resultNew){
              if (errNew) {
                 res.status(417).send({ Status: false, Message: "Some error occurred while update the Thrombolysis Details!.", Error: errNew });
              } else {
                 const IfThrombolysis = ReceivingData.Thrombolysis === 'Yes' ? true : ReceivingData.Thrombolysis === 'No' ? false : null; 
                 PatientDetailsModel.PatientBasicDetailsSchema.updateOne({_id: mongoose.Types.ObjectId(ReceivingData.PatientId)}, { $set: {IfThrombolysis: IfThrombolysis }}).exec();
                 res.status(200).send({ Status: true, Response: resultNew });
              }
           });
        }
     });
  }
};


