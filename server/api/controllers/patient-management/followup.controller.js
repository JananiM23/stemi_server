var FollowUpModel = require('./../../models/patient-management/followup_model');
var mongoose = require('mongoose');

// Follow Up - FollowUp Details Create
exports.FollowUpDetails_Create = function(req, res) {
   var ReceivingData = req.body;

      if(!ReceivingData.User || ReceivingData.User === null){
         res.status(400).send({ Status: false, Message: "User Details is Required!" });
      } else if(!ReceivingData.PatientId || ReceivingData.PatientId === null){
         res.status(400).send({ Status: false, Message: "Patient Detail not valid!" });
      } else if(!ReceivingData.Hospital || ReceivingData.Hospital === null){
         res.status(400).send({ Status: false, Message: "Hospital Detail not valid!" });
      } else {
         if (ReceivingData.Name_Of_The_Stemi_Follow_Up_Cluster !== null && ReceivingData.Name_Of_The_Stemi_Follow_Up_Cluster !== '') {
            ReceivingData.Name_Of_The_Stemi_Follow_Up_Cluster = mongoose.Types.ObjectId(ReceivingData.Name_Of_The_Stemi_Follow_Up_Cluster);
         } else {
            ReceivingData.Name_Of_The_Stemi_Follow_Up_Cluster = null;
         }
         if (ReceivingData.Name_Of_The_Stemi_Follow_Up_Hospital !== null && ReceivingData.Name_Of_The_Stemi_Follow_Up_Hospital !== '') {
            ReceivingData.Name_Of_The_Stemi_Follow_Up_Hospital = mongoose.Types.ObjectId(ReceivingData.Name_Of_The_Stemi_Follow_Up_Hospital);
         } else {
            ReceivingData.Name_Of_The_Stemi_Follow_Up_Hospital = null;
         }
         
      const Create_FollowUpDetails = new FollowUpModel.FollowUpDetailsSchema({
         PatientId: mongoose.Types.ObjectId(ReceivingData.PatientId),
         Hospital: mongoose.Types.ObjectId(ReceivingData.Hospital),  
         // Duration_Of_Follow_Up_Visit: ReceivingData.Duration_Of_Follow_Up_Visit || '',
         Follow_Up_Date: ReceivingData.Follow_Up_Date || '',
         Mode_Of_Follow_Up: ReceivingData.Mode_Of_Follow_Up || '',
         Type_Of_Follow_Up_Hospital: ReceivingData.Type_Of_Follow_Up_Hospital || '',
         Name_Of_The_Stemi_Follow_Up_Cluster: ReceivingData.Name_Of_The_Stemi_Follow_Up_Cluster || null,
         Name_Of_The_Stemi_Follow_Up_Hospital: ReceivingData.Name_Of_The_Stemi_Follow_Up_Hospital || null,
         Name_Of_The_Non_Stemi_Follow_Up_Hospital: ReceivingData.Name_Of_The_Non_Stemi_Follow_Up_Hospital || '',
         Location_Of_Follow_Up_Hospital: ReceivingData.Location_Of_Follow_Up_Hospital || '',
         Follow_Up_Comments: ReceivingData.Follow_Up_Comments || '',
         Active_Status: true,
         If_Deleted: false
      });

      Create_FollowUpDetails.save( function(err, result){
         if (err) {
            res.status(417).send({ Status: false, Message: "Some error occurred while Creating the FollowUp Details!.", Error: err });
         } else {
            FollowUpModel.FollowUpDetailsSchema.find({PatientId: mongoose.Types.ObjectId(ReceivingData.PatientId), If_Deleted: false}, {}, {})
            .populate({path: 'Name_Of_The_Stemi_Follow_Up_Cluster', select: ['Cluster_Name']})
            .populate({path: 'Name_Of_The_Stemi_Follow_Up_Hospital', select: ['Hospital_Name', 'Address']})
            .exec(function(err1, result1) {
               if(err1) {
                  res.status(417).send({Status: false, Message: "Some error occurred while Find The Follow Up Details!.", Error: err1 });
               } else {
                  res.status(200).send({Status: true, Response: result1 });
               }
            });
         }
      });
   }
};
// Follow Up - FollowUp Details Update----------------------------------------------
exports.FollowUpDetails_Update = function(req, res){
   var ReceivingData = req.body;

   if(!ReceivingData.User || ReceivingData.User === null){
      res.status(400).send({ Status: false, Message: "User Details is Required!" });
   } else if(!ReceivingData.PatientId || ReceivingData.PatientId === null){
      res.status(400).send({ Status: false, Message: "Patient Detail not valid!" });
   } else if(!ReceivingData.FollowupId || ReceivingData.FollowupId === null){
      res.status(400).send({ Status: false, Message: "Follow Up Details not valid!" });
   } else {
      FollowUpModel.FollowUpDetailsSchema.findOne({_id: mongoose.Types.ObjectId(ReceivingData.FollowupId), If_Deleted: false}, {}, {}, function(err, result) {
         if (err) {
            res.status(417).send({ Status: false, Message: "Some error occurred while Find the Follow Up Details!.", Error: err });
         } else if (result === null){
            res.status(400).send({ Status: false, Message: "Invalid Follow Up Details!" });
         } else {
				if (ReceivingData.Name_Of_The_Stemi_Follow_Up_Cluster !== null && ReceivingData.Name_Of_The_Stemi_Follow_Up_Cluster !== '') {
					ReceivingData.Name_Of_The_Stemi_Follow_Up_Cluster = mongoose.Types.ObjectId(ReceivingData.Name_Of_The_Stemi_Follow_Up_Cluster);
				} else {
					ReceivingData.Name_Of_The_Stemi_Follow_Up_Cluster = null;
				}
				if (ReceivingData.Name_Of_The_Stemi_Follow_Up_Hospital !== null && ReceivingData.Name_Of_The_Stemi_Follow_Up_Hospital !== '') {
					ReceivingData.Name_Of_The_Stemi_Follow_Up_Hospital = mongoose.Types.ObjectId(ReceivingData.Name_Of_The_Stemi_Follow_Up_Hospital);
				} else {
					ReceivingData.Name_Of_The_Stemi_Follow_Up_Hospital = null;
				}				
            // result.Duration_Of_Follow_Up_Visit=  ReceivingData.Duration_Of_Follow_Up_Visit || '';
            result.Follow_Up_Date = ReceivingData.Follow_Up_Date || '';
            result.Mode_Of_Follow_Up = ReceivingData.Mode_Of_Follow_Up || '';
            result.Type_Of_Follow_Up_Hospital = ReceivingData.Type_Of_Follow_Up_Hospital || '';
            result.Name_Of_The_Stemi_Follow_Up_Cluster = ReceivingData.Name_Of_The_Stemi_Follow_Up_Cluster;
            result.Name_Of_The_Stemi_Follow_Up_Hospital = ReceivingData.Name_Of_The_Stemi_Follow_Up_Hospital;
            result.Name_Of_The_Non_Stemi_Follow_Up_Hospital = ReceivingData.Name_Of_The_Non_Stemi_Follow_Up_Hospital || '';
            result.Location_Of_Follow_Up_Hospital = ReceivingData.Location_Of_Follow_Up_Hospital || '';
            result.Follow_Up_Comments = ReceivingData.Follow_Up_Comments || '';
            result.save( function(errNew, resultNew){
               if (errNew) {
                  res.status(417).send({ Status: false, Message: "Some error occurred while update the Follow Up Details!.", Error: errNew });
               } else {
                  FollowUpModel.FollowUpDetailsSchema.find({_id: mongoose.Types.ObjectId(ReceivingData.FollowupId), If_Deleted: false}, {}, {})
                  .populate({path: 'Name_Of_The_Stemi_Follow_Up_Cluster', select: ['Cluster_Name']})
                  .populate({path: 'Name_Of_The_Stemi_Follow_Up_Hospital', select: ['Hospital_Name', 'Address']})
                  .exec(function(err_1, result_1) {
                     if(err) {
                        res.status(417).send({status: false, Message: "Some error occurred while Find The Follow Up Details!.", Error: err_1 });
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
// Follow Up - Follow Up Details View---------------------------------------------------------
exports.FollowUpDetails_View= function(req, res) {
   var ReceivingData = req.body;

   if (!ReceivingData.User || ReceivingData.User === '') {
      res.status(400).send({ Status: false, Message: "User Details is Required!" });
   } else if (!ReceivingData.PatientId || ReceivingData.PatientId === '') {
      res.status(400).send({ Status: false, Message: "Patient Detail not valid!" });
   } else {
      FollowUpModel.FollowUpDetailsSchema.find({PatientId: mongoose.Types.ObjectId(ReceivingData.PatientId), If_Deleted: false}, {}, {})
      .populate({path: 'Name_Of_The_Stemi_Follow_Up_Cluster', select: ['Cluster_Name']})
      .populate({path: 'Name_Of_The_Stemi_Follow_Up_Hospital', select: ['Hospital_Name', 'Address']})
      .exec(function(err, result) {
         if(err) {
            res.status(417).send({status: false, Message: "Some error occurred while Find The Follow Up Details!.", Error: err });
         } else {
            res.status(200).send({Status: true, Response: result });
         }
      });
   }
};
// Follow Up - FollowUp Details History Update----------------------------------------------
exports.FollowUpHistory_Update = function(req, res){
   var ReceivingData = req.body;

   if(!ReceivingData.PatientId || ReceivingData.PatientId === null){
      res.status(400).send({ Status: false, Message: "Patient Detail not valid!" });
   } else if(!ReceivingData._id || ReceivingData._id === null){
      res.status(400).send({ Status: false, Message: "Follow Up Details not valid!" });
   } else {
      FollowUpModel.FollowUpDetailsSchema.findOne({_id: mongoose.Types.ObjectId(ReceivingData._id)}, {}, {}, function(err, result) {
         if (err) {
            res.status(417).send({ Status: false, Message: "Some error occurred while Find the Follow Up Details!.", Error: err });
         } else if (result === null){
            res.status(400).send({ Status: false, Message: "Invalid Follow Up Details!" });
         } else {
				if (ReceivingData.Name_Of_The_Stemi_Follow_Up_Cluster !== null && ReceivingData.Name_Of_The_Stemi_Follow_Up_Cluster !== '') {
					ReceivingData.Name_Of_The_Stemi_Follow_Up_Cluster = mongoose.Types.ObjectId(ReceivingData.Name_Of_The_Stemi_Follow_Up_Cluster);
				} else {
					ReceivingData.Name_Of_The_Stemi_Follow_Up_Cluster = null;
				}
				if (ReceivingData.Name_Of_The_Stemi_Follow_Up_Hospital !== null && ReceivingData.Name_Of_The_Stemi_Follow_Up_Hospital !== '') {
					ReceivingData.Name_Of_The_Stemi_Follow_Up_Hospital = mongoose.Types.ObjectId(ReceivingData.Name_Of_The_Stemi_Follow_Up_Hospital);
				} else {
					ReceivingData.Name_Of_The_Stemi_Follow_Up_Hospital = null;
				}
            result.Follow_Up_Date = ReceivingData.Follow_Up_Date || '';
            result.Mode_Of_Follow_Up = ReceivingData.Mode_Of_Follow_Up || '';
            result.Type_Of_Follow_Up_Hospital = ReceivingData.Type_Of_Follow_Up_Hospital || '';
            result.Name_Of_The_Stemi_Follow_Up_Cluster = ReceivingData.Name_Of_The_Stemi_Follow_Up_Cluster;
            result.Name_Of_The_Stemi_Follow_Up_Hospital = ReceivingData.Name_Of_The_Stemi_Follow_Up_Hospital;
            result.Name_Of_The_Non_Stemi_Follow_Up_Hospital = ReceivingData.Name_Of_The_Non_Stemi_Follow_Up_Hospital || '';
            result.Location_Of_Follow_Up_Hospital = ReceivingData.Location_Of_Follow_Up_Hospital || '';
            result.Follow_Up_Comments = ReceivingData.Follow_Up_Comments || '';
            result.save( function(errNew, resultNew){
               if (errNew) {
                  res.status(417).send({ Status: false, Message: "Some error occurred while update the Follow Up Details!.", Error: errNew });
               } else {
                  res.status(200).send({Status: true, Response: resultNew });
               }
            });
         }
      });
   }
};


// Follow Up - FollowUp Medication Details Create---------------------------------------------------------
exports.FollowUpMedication_Create = function(req, res) {
   var ReceivingData = req.body;
   if(!ReceivingData.User || ReceivingData.User === null){
      res.status(400).send({ Status: false, Message: "User Details is Required!" });
   } else if(!ReceivingData.PatientId || ReceivingData.PatientId === null){
      res.status(400).send({ Status: false, Message: "Patient Detail not valid!" });
   } else {
      const Create_FollowUpDetailsMedications = new FollowUpModel.FollowUpMedicationsSchema({
         PatientId: mongoose.Types.ObjectId(ReceivingData.PatientId),
         Hospital: mongoose.Types.ObjectId(ReceivingData.Hospital), 
         // Duration_Of_Follow_Up_Medication: ReceivingData.Duration_Of_Follow_Up_Medication,
			Follow_Up_Date: ReceivingData.Follow_Up_Date || '',
         Follow_Up_Medication_Aspirin: ReceivingData.Follow_Up_Medication_Aspirin || '',
         Follow_Up_Medication_Clopidogrel: ReceivingData.Follow_Up_Medication_Clopidogrel || '',
         Follow_Up_Medication_Prasugral: ReceivingData.Follow_Up_Medication_Prasugral || '',
         Follow_Up_Medication_Nitrate: ReceivingData.Follow_Up_Medication_Nitrate || '',
         Follow_Up_Medication_Betablocker: ReceivingData.Follow_Up_Medication_Betablocker || '',
         Follow_Up_Medication_ACEI: ReceivingData.Follow_Up_Medication_ACEI || '',
         Follow_Up_Medication_ARB: ReceivingData.Follow_Up_Medication_ARB || '',
         Follow_Up_Medication_Statins: ReceivingData.Follow_Up_Medication_Statins || '',
         Follow_Up_Medication_OHA: ReceivingData.Follow_Up_Medication_OHA || '',
         Follow_Up_Medication_Insulin: ReceivingData.Follow_Up_Medication_Insulin || '',
         Active_Status: true,
         If_Deleted: false
      });

      Create_FollowUpDetailsMedications.save(function(err, result) {
         if(err) {
            res.status(417).send({ Status: false, Message: "Some error occurred while Creating the FollowUp Medications Details!.", Error: err });
         } else {
            FollowUpModel.FollowUpMedicationsSchema.find({_id: mongoose.Types.ObjectId(result._id)}, {}, {})
            .exec(function(err1, result1) {
               if(err1) {
                  res.status(417).send({status: false, Message: "Some error occurred while Find The Follow Up Medication Details!.", Error: err1 });
               } else {
                  res.status(200).send({Status: true, Response: result1 });
               }
            });
         }
      });
   }  
};
// Follow Up - FollowUp Medication Details View---------------------------------------------------------
exports.FollowUpMedication_View = function(req, res) {
   var ReceivingData = req.body;

   if (!ReceivingData.User || ReceivingData.User === '') {
      res.status(400).send({ Status: false, Message: "User Details is Required!" });
   } else if (!ReceivingData.PatientId || ReceivingData.PatientId === '') {
      res.status(400).send({ Status: false, Message: "Patient Detail not valid!" });
   } else {
      FollowUpModel.FollowUpMedicationsSchema.find({PatientId: mongoose.Types.ObjectId(ReceivingData.PatientId), If_Deleted: false}, {}, {})
      .exec(function(err, result) {
         if(err) {
            res.status(417).send({status: false, Message: "Some error occurred while Find The Follow Up Medication Details!.", Error: err });
         } else {
            res.status(200).send({Status: true, Response: result });
         }
      });
   }
};
// Follow Up - FollowUp Medication Details Update---------------------------------------------------------
exports.FollowUpMedication_Update = function(req, res){
   var ReceivingData = req.body;
   if(!ReceivingData.User || ReceivingData.User === null){
      res.status(400).send({ Status: false, Message: "User Details is Required!" });
   } else if(!ReceivingData.PatientId || ReceivingData.PatientId === null){
      res.status(400).send({ Status: false, Message: "Patient Detail not valid!" });
   } else if(!ReceivingData.FollowupMedicationId || ReceivingData.FollowupMedicationId === null){
      res.status(400).send({ Status: false, Message: "Follow Up Medication Details not valid!" });
   } else {
      FollowUpModel.FollowUpEventsSchema.findOne({_id: mongoose.Types.ObjectId(ReceivingData.FollowupEventsId)}, {}, {}, function(err, result) {
         if (err) {
            res.status(417).send({ Status: false, Message: "Some error occurred while Find the Follow Up Event Details!.", Error: err });
         } else if (result === null){
            res.status(400).send({ Status: false, Message: "Invalid Follow Up Event Details!" });
         } else {      
            result.Follow_Up_Medication_Aspirin = ReceivingData.Follow_Up_Medication_Aspirin || '';
            result.Follow_Up_Medication_Clopidogrel=  ReceivingData.Follow_Up_Medication_Clopidogrel || '';
            result.Follow_Up_Medication_Prasugral = ReceivingData.Follow_Up_Medication_Prasugral || '';
            result.Follow_Up_Medication_Nitrate = ReceivingData.Follow_Up_Medication_Nitrate || '';
            result.Follow_Up_Medication_Betablocker = ReceivingData.Follow_Up_Medication_Betablocker || '';
            result.Follow_Up_Medication_ACEI = ReceivingData.Follow_Up_Medication_ACEI || '';
            result.Follow_Up_Medication_ARB = ReceivingData.Follow_Up_Medication_ARB || '';
            result.Follow_Up_Medication_Statins = ReceivingData.Follow_Up_Medication_Statins || '';
            result.Follow_Up_Medication_OHA = ReceivingData.Follow_Up_Medication_OHA || '';
            result.Follow_Up_Medication_Insulin = ReceivingData.Follow_Up_Medication_Insulin || '';
            result.save( function(errNew, resultNew){
               if (errNew) {
                  res.status(417).send({ Status: false, Message: "Some error occurred while update the Follow Up Event Details!.", Error: errNew });
               } else {
                  FollowUpModel.FollowUpMedicationsSchema.find({_id: mongoose.Types.ObjectId(resultNew._id)}, {}, {})
                  .exec(function(err1, result1) {
                     if(err1) {
                        res.status(417).send({status: false, Message: "Some error occurred while Find The Follow Up Medication Details!.", Error: err1 });
                     } else {
                        res.status(200).send({Status: true, Response: result1 });
                     }
                  });
               }
            });
         }
      });
   }
};
// Follow Up - FollowUp Medication History Update---------------------------------------------------------
exports.FollowUpMedicationHistory_Update = function(req, res){
   var ReceivingData = req.body;
   if(!ReceivingData.PatientId || ReceivingData.PatientId === null){
      res.status(400).send({ Status: false, Message: "Patient Detail not valid!" });
   } else if(!ReceivingData._id || ReceivingData._id === null){
      res.status(400).send({ Status: false, Message: "Follow Up Medication Details not valid!" });
   } else {
      FollowUpModel.FollowUpEventsSchema.findOne({_id: mongoose.Types.ObjectId(ReceivingData._id)}, {}, {}, function(err, result) {
         if (err) {
            res.status(417).send({ Status: false, Message: "Some error occurred while Find the Follow Up Event Details!.", Error: err });
         } else if (result === null){
            res.status(400).send({ Status: false, Message: "Invalid Follow Up Event Details!" });
         } else {      
            result.Follow_Up_Medication_Aspirin = ReceivingData.Follow_Up_Medication_Aspirin || '';
            result.Follow_Up_Medication_Clopidogrel=  ReceivingData.Follow_Up_Medication_Clopidogrel || '';
            result.Follow_Up_Medication_Prasugral = ReceivingData.Follow_Up_Medication_Prasugral || '';
            result.Follow_Up_Medication_Nitrate = ReceivingData.Follow_Up_Medication_Nitrate || '';
            result.Follow_Up_Medication_Betablocker = ReceivingData.Follow_Up_Medication_Betablocker || '';
            result.Follow_Up_Medication_ACEI = ReceivingData.Follow_Up_Medication_ACEI || '';
            result.Follow_Up_Medication_ARB = ReceivingData.Follow_Up_Medication_ARB || '';
            result.Follow_Up_Medication_Statins = ReceivingData.Follow_Up_Medication_Statins || '';
            result.Follow_Up_Medication_OHA = ReceivingData.Follow_Up_Medication_OHA || '';
            result.Follow_Up_Medication_Insulin = ReceivingData.Follow_Up_Medication_Insulin || '';
            result.save( function(errNew, resultNew){
               if (errNew) {
                  res.status(417).send({ Status: false, Message: "Some error occurred while update the Follow Up Event Details!.", Error: errNew });
               } else {
                  res.status(200).send({Status: true, Response: resultNew });
               }
            });
         }
      });
   }
};
// Follow Up - FollowUp Medication History Create---------------------------------------------------------
exports.FollowUpMedicationHistory_Create = function(req, res) {
   var ReceivingData = req.body;
   if(!ReceivingData.Hospital || ReceivingData.Hospital === null){
      res.status(400).send({ Status: false, Message: "Hospital Details is Required!" });
   } else if(!ReceivingData.PatientId || ReceivingData.PatientId === null){
      res.status(400).send({ Status: false, Message: "Patient Detail not valid!" });
   } else {
      const Create_FollowUpDetailsMedications = new FollowUpModel.FollowUpMedicationsSchema({
         PatientId: mongoose.Types.ObjectId(ReceivingData.PatientId),
         Hospital: mongoose.Types.ObjectId(ReceivingData.Hospital), 
         // Duration_Of_Follow_Up_Medication: ReceivingData.Duration_Of_Follow_Up_Medication,
			Follow_Up_Date: ReceivingData.Follow_Up_Date || '',
         Follow_Up_Medication_Aspirin: ReceivingData.Follow_Up_Medication_Aspirin || '',
         Follow_Up_Medication_Clopidogrel: ReceivingData.Follow_Up_Medication_Clopidogrel || '',
         Follow_Up_Medication_Prasugral: ReceivingData.Follow_Up_Medication_Prasugral || '',
         Follow_Up_Medication_Nitrate: ReceivingData.Follow_Up_Medication_Nitrate || '',
         Follow_Up_Medication_Betablocker: ReceivingData.Follow_Up_Medication_Betablocker || '',
         Follow_Up_Medication_ACEI: ReceivingData.Follow_Up_Medication_ACEI || '',
         Follow_Up_Medication_ARB: ReceivingData.Follow_Up_Medication_ARB || '',
         Follow_Up_Medication_Statins: ReceivingData.Follow_Up_Medication_Statins || '',
         Follow_Up_Medication_OHA: ReceivingData.Follow_Up_Medication_OHA || '',
         Follow_Up_Medication_Insulin: ReceivingData.Follow_Up_Medication_Insulin || '',
         Active_Status: true,
         If_Deleted: false
      });

      Create_FollowUpDetailsMedications.save(function(err, result) {
         if(err) {
            res.status(417).send({ Status: false, Message: "Some error occurred while Creating the FollowUp Medications Details!.", Error: err });
         } else {
            res.status(200).send({Status: true, Response: result });
         }
      });
   }  
};


// Follow Up - FollowUp Events Create---------------------------------------------------------
exports.FollowUpEvents_Create = function(req, res) {
   var ReceivingData = req.body;

   if(!ReceivingData.User || ReceivingData.User === null){
      res.status(400).send({ Status: false, Message: "User Details is Required!" });
   } else if(!ReceivingData.PatientId || ReceivingData.PatientId === null){
      res.status(400).send({ Status: false, Message: "Patient Detail not valid!" });
   } else if(!ReceivingData.Hospital || ReceivingData.Hospital === null){
      res.status(400).send({ Status: false, Message: "Hospital Detail not valid!" });
   } else {
      const Create_FollowUpEvents = new FollowUpModel.FollowUpEventsSchema({
         PatientId: mongoose.Types.ObjectId(ReceivingData.PatientId),
         Hospital: mongoose.Types.ObjectId(ReceivingData.Hospital),
         // Duration_Of_Follow_Up_Event: ReceivingData.Duration_Of_Follow_Up_Event,
			Follow_Up_Date: ReceivingData.Follow_Up_Date || '',
         Follow_Up_Events_Readmission: ReceivingData.Follow_Up_Events_Readmission || '',
         Follow_Up_Events_Readmission_Reason: ReceivingData.Follow_Up_Events_Readmission_Reason || '',
         Follow_Up_Events_Readmission_Date: ReceivingData.Follow_Up_Events_Readmission_Date || null,
         Follow_Up_Events_Additional_cardiac_procedures: ReceivingData.Follow_Up_Events_Additional_cardiac_procedures || '',
         Follow_Up_Events_CABG: ReceivingData.Follow_Up_Events_CABG || '',
         Follow_Up_Events_CABG_Date: ReceivingData.Follow_Up_Events_CABG_Date || null,
         Follow_Up_Events_PCI: ReceivingData.Follow_Up_Events_PCI || '',
         Follow_Up_Events_PCI_Date: ReceivingData.Follow_Up_Events_PCI_Date || '',
         Follow_Up_Events_Others: ReceivingData.Follow_Up_Events_Others || null,
         Follow_Up_Events_Specify_Others: ReceivingData.Follow_Up_Events_Specify_Others || null,
         Follow_Up_Events_Others_Date: ReceivingData.Follow_Up_Events_Others_Date || null,
         Follow_Up_Events_Recurrence_Of_Angina: ReceivingData.Follow_Up_Events_Recurrence_Of_Angina || '',
         Follow_Up_Events_TMT: ReceivingData.Follow_Up_Events_TMT || '',
         Follow_Up_Events_Echo_LVEF: ReceivingData.Follow_Up_Events_Echo_LVEF || '',
         Follow_Up_Events_Re_CART: ReceivingData.Follow_Up_Events_Re_CART || '',
         Follow_Up_Events_Re_CART_Date: ReceivingData.Follow_Up_Events_Re_CART_Date || '',
         Follow_Up_Events_Restenosis: ReceivingData.Follow_Up_Events_Restenosis || '',
         Follow_Up_Events_Restenosis_Date: ReceivingData.Follow_Up_Events_Restenosis_Date || '',
         Follow_Up_Events_Re_MI: ReceivingData.Follow_Up_Events_Re_MI || '',
         Follow_Up_Events_Re_MI_Date: ReceivingData.Follow_Up_Events_Re_MI_Date || '',
         Follow_Up_Events_Re_Intervention: ReceivingData.Follow_Up_Events_Re_Intervention || '',
         Follow_Up_Events_TLR_PCI1: ReceivingData.Follow_Up_Events_TLR_PCI1 || '',
         Follow_Up_Events_TLR_PCI1_Date: ReceivingData.Follow_Up_Events_TLR_PCI1_Date || '',
         Follow_Up_Events_TVR_PCI: ReceivingData.Follow_Up_Events_TVR_PCI || '',
         Follow_Up_Events_TVR_PCI_Date: ReceivingData.Follow_Up_Events_TVR_PCI_Date || '',
         Follow_Up_Events_Non_TVR_PCI: ReceivingData.Follow_Up_Events_Non_TVR_PCI || '',
         Follow_Up_Events_Non_TVR_PCI_Date: ReceivingData.Follow_Up_Events_Non_TVR_PCI_Date || '',
         Follow_Up_Events_Stroke: ReceivingData.Follow_Up_Events_Stroke || '',
         Follow_Up_Events_Stroke_Date: ReceivingData.Follow_Up_Events_Stroke_Date || '',
         Follow_Up_Death: ReceivingData.Follow_Up_Death || '',
			Follow_Up_Death_Date: ReceivingData.Follow_Up_Death_Date || null,
         Follow_Up_Reason_Of_Death: ReceivingData.Follow_Up_Reason_Of_Death || '',
         Follow_Up_Event_Comments: ReceivingData.Follow_Up_Event_Comments || '',
         Active_Status: true,
         If_Deleted: false
      });

      Create_FollowUpEvents.save( function(err, result) {
         if (err) {
            res.status(417).send({ Status: false, Message: "Some error occurred while Creating the Follow Up Events Details!.", Error: err });
         } else {
            FollowUpModel.FollowUpEventsSchema.find({_id: result._id}, {}, {})
            .exec(function(err1, result1) {
               if(err1) {
                  res.status(417).send({status: false, Message: "Some error occurred while Find The Follow Up Events Details!.", Error: err1 });
               } else {
                  res.status(200).send({Status: true, Response: result1 });
               }
            });
         }
      });
   }
};
// Follow Up - Follow Up Events View---------------------------------------------------------
exports.FollowUpEvents_View= function(req, res) {
   var ReceivingData = req.body;

   if (!ReceivingData.User || ReceivingData.User === '') {
      res.status(400).send({ Status: false, Message: "User Details is Required!" });
   } else if (!ReceivingData.PatientId || ReceivingData.PatientId === '') {
      res.status(400).send({ Status: false, Message: "Patient Detail not valid!" });
   } else {
      FollowUpModel.FollowUpEventsSchema.find({PatientId: mongoose.Types.ObjectId(ReceivingData.PatientId), If_Deleted: false}, {}, {})
      .exec(function(err, result) {
         if(err) {
            res.status(417).send({status: false, Message: "Some error occurred while Find The Follow Up Events Details!.", Error: err });
         } else {
            res.status(200).send({Status: true, Response: result });
         }
      });
   }
};
// Follow Up - FollowUp Events Update----------------------------------------------
exports.FollowUpEvents_Update = function(req, res){
   var ReceivingData = req.body;

   if(!ReceivingData.User || ReceivingData.User === null){
      res.status(400).send({ Status: false, Message: "User Details is Required!" });
   } else if(!ReceivingData.PatientId || ReceivingData.PatientId === null){
      res.status(400).send({ Status: false, Message: "Patient Detail not valid!" });
   } else if(!ReceivingData.FollowupEventsId || ReceivingData.FollowupEventsId === null){
      res.status(400).send({ Status: false, Message: "Follow Up Event Details not valid!" });
   } 
   else {
      FollowUpModel.FollowUpEventsSchema.findOne({_id: mongoose.Types.ObjectId(ReceivingData.FollowupEventsId), If_Deleted: false}, {}, {}, function(err, result) {
         if (err) {
            res.status(417).send({ Status: false, Message: "Some error occurred while Find the Follow Up Event Details!.", Error: err });
         } else if (result === null){
            res.status(400).send({ Status: false, Message: "Invalid Follow Up Event Details!" });
         } else {   
            result.Follow_Up_Events_Readmission = ReceivingData.Follow_Up_Events_Readmission || '';
            result.Follow_Up_Events_Readmission_Reason = ReceivingData.Follow_Up_Events_Readmission_Reason || '';
            result.Follow_Up_Events_Readmission_Date = ReceivingData.Follow_Up_Events_Readmission_Date || null;
            result.Follow_Up_Events_Additional_cardiac_procedures = ReceivingData.Follow_Up_Events_Additional_cardiac_procedures || '';
            result.Follow_Up_Events_CABG = ReceivingData.Follow_Up_Events_CABG || '';
            result.Follow_Up_Events_CABG_Date = ReceivingData.Follow_Up_Events_CABG_Date || null;
            result.Follow_Up_Events_PCI = ReceivingData.Follow_Up_Events_PCI || '';
            result.Follow_Up_Events_PCI_Date = ReceivingData.Follow_Up_Events_PCI_Date || '';
            result.Follow_Up_Events_Others = ReceivingData.Follow_Up_Events_Others || null;
            result.Follow_Up_Events_Specify_Others = ReceivingData.Follow_Up_Events_Specify_Others || null;
            result.Follow_Up_Events_Others_Date = ReceivingData.Follow_Up_Events_Others_Date || null;
            result.Follow_Up_Events_Recurrence_Of_Angina = ReceivingData.Follow_Up_Events_Recurrence_Of_Angina || '';
            result.Follow_Up_Events_TMT=  ReceivingData.Follow_Up_Events_TMT || '';
            result.Follow_Up_Events_Echo_LVEF = ReceivingData.Follow_Up_Events_Echo_LVEF || '';
            result.Follow_Up_Events_Re_CART = ReceivingData.Follow_Up_Events_Re_CART || '';
            result.Follow_Up_Events_Re_CART_Date = ReceivingData.Follow_Up_Events_Re_CART_Date || '';
            result.Follow_Up_Events_Restenosis = ReceivingData.Follow_Up_Events_Restenosis || '';
            result.Follow_Up_Events_Restenosis_Date = ReceivingData.Follow_Up_Events_Restenosis_Date || '';
            result.Follow_Up_Events_Re_MI = ReceivingData.Follow_Up_Events_Re_MI || '';
            result.Follow_Up_Events_Re_MI_Date = ReceivingData.Follow_Up_Events_Re_MI_Date || '';
            result.Follow_Up_Events_Re_Intervention = ReceivingData.Follow_Up_Events_Re_Intervention || '';
            result.Follow_Up_Events_TLR_PCI1 = ReceivingData.Follow_Up_Events_TLR_PCI1 || '';
            result.Follow_Up_Events_TLR_PCI1_Date = ReceivingData.Follow_Up_Events_TLR_PCI1_Date || '';
            result.Follow_Up_Events_TVR_PCI = ReceivingData.Follow_Up_Events_TVR_PCI || '';
            result.Follow_Up_Events_TVR_PCI_Date = ReceivingData.Follow_Up_Events_TVR_PCI_Date || '';
            result.Follow_Up_Events_Non_TVR_PCI = ReceivingData.Follow_Up_Events_Non_TVR_PCI || '';
            result.Follow_Up_Events_Non_TVR_PCI_Date = ReceivingData.Follow_Up_Events_Non_TVR_PCI_Date || '';
            result.Follow_Up_Events_Stroke = ReceivingData.Follow_Up_Events_Stroke || '';
            result.Follow_Up_Events_Stroke_Date = ReceivingData.Follow_Up_Events_Stroke_Date || '';
            result.Follow_Up_Death = ReceivingData.Follow_Up_Death || '';
				result.Follow_Up_Death_Date = ReceivingData.Follow_Up_Death_Date || null;
            result.Follow_Up_Reason_Of_Death = ReceivingData.Follow_Up_Reason_Of_Death || '';
            result.Follow_Up_Event_Comments = ReceivingData.Follow_Up_Event_Comments || '';
            result.save( function(errNew, resultNew){
               if (errNew) {
                  res.status(417).send({ Status: false, Message: "Some error occurred while update the Follow Up Event Details!.", Error: errNew });
               } else {
                  FollowUpModel.FollowUpEventsSchema.find({_id: mongoose.Types.ObjectId(ReceivingData.FollowupEventsId), If_Deleted: false}, {}, {})
                  .exec(function(err1, result1) {
                     if(err1) {
                        res.status(417).send({status: false, Message: "Some error occurred while Find The Follow Up Events Details!.", Error: err1 });
                     } else {
                        res.status(200).send({Status: true, Response: result1 });
                     }
                  });
               }
            });
         }
      });
   }
};
// Follow Up - FollowUp Events History Update----------------------------------------------
exports.FollowUpEventsHistory_Update = function(req, res){
   var ReceivingData = req.body;

   if(!ReceivingData.PatientId || ReceivingData.PatientId === null){
      res.status(400).send({ Status: false, Message: "Patient Detail not valid!" });
   } else if(!ReceivingData._id || ReceivingData._id === null){
      res.status(400).send({ Status: false, Message: "Follow Up Event Details not valid!" });
   } 
   else {
      FollowUpModel.FollowUpEventsSchema.findOne({_id: mongoose.Types.ObjectId(ReceivingData._id)}, {}, {}, function(err, result) {
         if (err) {
            res.status(417).send({ Status: false, Message: "Some error occurred while Find the Follow Up Event Details!.", Error: err });
         } else if (result === null){
            res.status(400).send({ Status: false, Message: "Invalid Follow Up Event Details!" });
         } else {     
            result.Follow_Up_Events_Readmission = ReceivingData.Follow_Up_Events_Readmission || '';
            result.Follow_Up_Events_Readmission_Reason = ReceivingData.Follow_Up_Events_Readmission_Reason || '';
            result.Follow_Up_Events_Readmission_Date = ReceivingData.Follow_Up_Events_Readmission_Date || null;
            result.Follow_Up_Events_Additional_cardiac_procedures = ReceivingData.Follow_Up_Events_Additional_cardiac_procedures || '';
            result.Follow_Up_Events_CABG = ReceivingData.Follow_Up_Events_CABG || '';
            result.Follow_Up_Events_CABG_Date = ReceivingData.Follow_Up_Events_CABG_Date || null;
            result.Follow_Up_Events_PCI = ReceivingData.Follow_Up_Events_PCI || '';
            result.Follow_Up_Events_PCI_Date = ReceivingData.Follow_Up_Events_PCI_Date || '';
            result.Follow_Up_Events_Others = ReceivingData.Follow_Up_Events_Others || null;
            result.Follow_Up_Events_Specify_Others = ReceivingData.Follow_Up_Events_Specify_Others || null;
            result.Follow_Up_Events_Others_Date = ReceivingData.Follow_Up_Events_Others_Date || null;
            result.Follow_Up_Events_Recurrence_Of_Angina = ReceivingData.Follow_Up_Events_Recurrence_Of_Angina || '';
            result.Follow_Up_Events_TMT=  ReceivingData.Follow_Up_Events_TMT || '';
            result.Follow_Up_Events_Echo_LVEF = ReceivingData.Follow_Up_Events_Echo_LVEF || '';
            result.Follow_Up_Events_Re_CART = ReceivingData.Follow_Up_Events_Re_CART || '';
            result.Follow_Up_Events_Re_CART_Date = ReceivingData.Follow_Up_Events_Re_CART_Date || '';
            result.Follow_Up_Events_Restenosis = ReceivingData.Follow_Up_Events_Restenosis || '';
            result.Follow_Up_Events_Restenosis_Date = ReceivingData.Follow_Up_Events_Restenosis_Date || '';
            result.Follow_Up_Events_Re_MI = ReceivingData.Follow_Up_Events_Re_MI || '';
            result.Follow_Up_Events_Re_MI_Date = ReceivingData.Follow_Up_Events_Re_MI_Date || '';
            result.Follow_Up_Events_Re_Intervention = ReceivingData.Follow_Up_Events_Re_Intervention || '';
            result.Follow_Up_Events_TLR_PCI1 = ReceivingData.Follow_Up_Events_TLR_PCI1 || '';
            result.Follow_Up_Events_TLR_PCI1_Date = ReceivingData.Follow_Up_Events_TLR_PCI1_Date || '';
            result.Follow_Up_Events_TVR_PCI = ReceivingData.Follow_Up_Events_TVR_PCI || '';
            result.Follow_Up_Events_TVR_PCI_Date = ReceivingData.Follow_Up_Events_TVR_PCI_Date || '';
            result.Follow_Up_Events_Non_TVR_PCI = ReceivingData.Follow_Up_Events_Non_TVR_PCI || '';
            result.Follow_Up_Events_Non_TVR_PCI_Date = ReceivingData.Follow_Up_Events_Non_TVR_PCI_Date || '';
            result.Follow_Up_Events_Stroke = ReceivingData.Follow_Up_Events_Stroke || '';
            result.Follow_Up_Events_Stroke_Date = ReceivingData.Follow_Up_Events_Stroke_Date || '';
            result.Follow_Up_Death = ReceivingData.Follow_Up_Death || '';
				result.Follow_Up_Death_Date = ReceivingData.Follow_Up_Death_Date || null;
            result.Follow_Up_Reason_Of_Death = ReceivingData.Follow_Up_Reason_Of_Death || '';
            result.Follow_Up_Event_Comments = ReceivingData.Follow_Up_Event_Comments || '';
            result.save( function(errNew, resultNew){
               if (errNew) {
                  res.status(417).send({ Status: false, Message: "Some error occurred while update the Follow Up Event Details!.", Error: errNew });
               } else {
                  res.status(200).send({Status: true, Response: resultNew });
               }
            });
         }
      });
   }
};
// Follow Up - FollowUp Events History Create---------------------------------------------------------
exports.FollowUpEventsHistory_Create = function(req, res) {
   var ReceivingData = req.body;

   if(!ReceivingData.PatientId || ReceivingData.PatientId === null){
      res.status(400).send({ Status: false, Message: "Patient Detail not valid!" });
   } else if(!ReceivingData.Hospital || ReceivingData.Hospital === null){
      res.status(400).send({ Status: false, Message: "Hospital Detail not valid!" });
   } else {
      const Create_FollowUpEvents = new FollowUpModel.FollowUpEventsSchema({
         PatientId: mongoose.Types.ObjectId(ReceivingData.PatientId),
         Hospital: mongoose.Types.ObjectId(ReceivingData.Hospital),
         // Duration_Of_Follow_Up_Event: ReceivingData.Duration_Of_Follow_Up_Event,
			Follow_Up_Date: ReceivingData.Follow_Up_Date || '',
         Follow_Up_Events_Readmission: ReceivingData.Follow_Up_Events_Readmission || '',
         Follow_Up_Events_Readmission_Reason: ReceivingData.Follow_Up_Events_Readmission_Reason || '',
         Follow_Up_Events_Readmission_Date: ReceivingData.Follow_Up_Events_Readmission_Date || null,
         Follow_Up_Events_Additional_cardiac_procedures: ReceivingData.Follow_Up_Events_Additional_cardiac_procedures || '',
         Follow_Up_Events_CABG: ReceivingData.Follow_Up_Events_CABG || '',
         Follow_Up_Events_CABG_Date: ReceivingData.Follow_Up_Events_CABG_Date || null,
         Follow_Up_Events_PCI: ReceivingData.Follow_Up_Events_PCI || '',
         Follow_Up_Events_PCI_Date: ReceivingData.Follow_Up_Events_PCI_Date || '',
         Follow_Up_Events_Others: ReceivingData.Follow_Up_Events_Others || null,
         Follow_Up_Events_Specify_Others: ReceivingData.Follow_Up_Events_Specify_Others || null,
         Follow_Up_Events_Others_Date: ReceivingData.Follow_Up_Events_Others_Date || null,
         Follow_Up_Events_Recurrence_Of_Angina: ReceivingData.Follow_Up_Events_Recurrence_Of_Angina || '',
         Follow_Up_Events_TMT: ReceivingData.Follow_Up_Events_TMT || '',
         Follow_Up_Events_Echo_LVEF: ReceivingData.Follow_Up_Events_Echo_LVEF || '',
         Follow_Up_Events_Re_CART: ReceivingData.Follow_Up_Events_Re_CART || '',
         Follow_Up_Events_Re_CART_Date: ReceivingData.Follow_Up_Events_Re_CART_Date || '',
         Follow_Up_Events_Restenosis: ReceivingData.Follow_Up_Events_Restenosis || '',
         Follow_Up_Events_Restenosis_Date: ReceivingData.Follow_Up_Events_Restenosis_Date || '',
         Follow_Up_Events_Re_MI: ReceivingData.Follow_Up_Events_Re_MI || '',
         Follow_Up_Events_Re_MI_Date: ReceivingData.Follow_Up_Events_Re_MI_Date || '',
         Follow_Up_Events_Re_Intervention: ReceivingData.Follow_Up_Events_Re_Intervention || '',
         Follow_Up_Events_TLR_PCI1: ReceivingData.Follow_Up_Events_TLR_PCI1 || '',
         Follow_Up_Events_TLR_PCI1_Date: ReceivingData.Follow_Up_Events_TLR_PCI1_Date || '',
         Follow_Up_Events_TVR_PCI: ReceivingData.Follow_Up_Events_TVR_PCI || '',
         Follow_Up_Events_TVR_PCI_Date: ReceivingData.Follow_Up_Events_TVR_PCI_Date || '',
         Follow_Up_Events_Non_TVR_PCI: ReceivingData.Follow_Up_Events_Non_TVR_PCI || '',
         Follow_Up_Events_Non_TVR_PCI_Date: ReceivingData.Follow_Up_Events_Non_TVR_PCI_Date || '',
         Follow_Up_Events_Stroke: ReceivingData.Follow_Up_Events_Stroke || '',
         Follow_Up_Events_Stroke_Date: ReceivingData.Follow_Up_Events_Stroke_Date || '',
         Follow_Up_Death: ReceivingData.Follow_Up_Death || '',
			Follow_Up_Death_Date: ReceivingData.Follow_Up_Death_Date || null,
         Follow_Up_Reason_Of_Death: ReceivingData.Follow_Up_Reason_Of_Death || '',
         Follow_Up_Event_Comments: ReceivingData.Follow_Up_Event_Comments || '',
         Active_Status: true,
         If_Deleted: false
      });

      Create_FollowUpEvents.save( function(err, result) {
         if (err) {
            res.status(417).send({ Status: false, Message: "Some error occurred while Creating the Follow Up Events Details!.", Error: err });
         } else {
            res.status(200).send({Status: true, Response: result });
         }
      });
   }
};

// Follow Up - Medication Delete---------------------------------------------------
exports.FollowUpMedicationHistory_Delete = function(req, res){
   var ReceivingData = req.body;
   FollowUpModel.FollowUpMedicationsSchema
   .updateOne({_id: mongoose.Types.ObjectId(ReceivingData._id)},{ $set: { If_Deleted: 'true'}})
   .exec(function(err, result){
      if(err) {
         res.status(417).send({Status: false, Message: "Some error occurred!.", Error: err });
      } else {
         res.status(200).send({Status: true, Response: result });
      }
   });
};

// Follow Up - FollowUp Details Delete---------------------------------------------------
exports.FollowUpHistory_Delete = function(req, res){
   var ReceivingData = req.body;
   FollowUpModel.FollowUpDetailsSchema
   .updateOne({_id: mongoose.Types.ObjectId(ReceivingData._id)},{ $set: { If_Deleted: 'true'}})
   .exec(function(err, result){
      if(err) {
         res.status(417).send({Status: false, Message: "Some error occurred!.", Error: err });
      } else {
         res.status(200).send({Status: true, Response: result });
      }
   });
};
// Follow Up - Events Delete---------------------------------------------------
exports.FollowUpEventHistory_Delete = function(req, res){
   var ReceivingData = req.body;
      FollowUpModel.FollowUpEventsSchema
      .updateOne({_id: mongoose.Types.ObjectId(ReceivingData._id)},{ $set: { If_Deleted: 'true'}})
      .exec(function(err, result){
         if(err) {
            res.status(417).send({Status: false, Message: "Some error occurred!.", Error: err });
         } else {
            res.status(200).send({Status: true, Response: result });
         }
      });
};