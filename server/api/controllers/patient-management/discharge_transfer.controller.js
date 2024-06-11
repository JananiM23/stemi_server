var DischargeTransferModel = require('./../../models/patient-management/discharge_transfer.model');
var PatientBasicModel = require('./../../models/patient-management/patient_details.model');
var ClusterManagementModel = require('./../../models/cluster_management.model');
var HospitalManagementModel = require('./../../models/hospital_management.model');
var UsersManagementModel = require('./../../models/user_management.model');
var NotificationModel = require('../../models/notification_management.model');

var mongoose = require('mongoose');


// Discharge Transfer - Death Create---------------------------------------------------------
exports.DischargeTransferDeath_Create = function(req, res) {
   var ReceivingData = req.body;

   if(!ReceivingData.User || ReceivingData.User === null){
      res.status(400).send({ Status: false, Message: "User Details is Required!" });
   } else if(!ReceivingData.PatientId || ReceivingData.PatientId === null){
      res.status(400).send({ Status: false, Message: "Patient Detail not valid!" });
   } else if(!ReceivingData.Hospital || ReceivingData.Hospital === null){
      res.status(400).send({ Status: false, Message: "Hospital Detail not valid!" });
   } else {
      const Create_DischargeTransferDeath = new DischargeTransferModel.DischargeTransferDeathSchema({
         PatientId: mongoose.Types.ObjectId(ReceivingData.PatientId),
         Hospital: mongoose.Types.ObjectId(ReceivingData.Hospital), 
         Discharge_Transfer_Death: ReceivingData.Discharge_Transfer_Death || '',
         Discharge_Transfer_Cause_of_Death: ReceivingData.Discharge_Transfer_Cause_of_Death || '',
         Discharge_Transfer_Death_Date_Time: ReceivingData.Discharge_Transfer_Death_Date_Time || '',
         Discharge_Transfer_Remarks: ReceivingData.Discharge_Transfer_Remarks || '',
         Active_Status: true,
         If_Deleted: false
      });
      Create_DischargeTransferDeath.save(function(err, result){
         if(err) {
            res.status(417).send({ Status: false, Message: "Some error occurred while Creating the Discharge/ Transfer Death Details!.", Error: err });
         } else {
            const IfDeath = ReceivingData.Discharge_Transfer_Death === 'Yes' ? true : ReceivingData.Discharge_Transfer_Death === 'No' ? false : null; 
            PatientBasicModel.PatientBasicDetailsSchema.updateOne({_id: mongoose.Types.ObjectId(ReceivingData.PatientId)}, { $set: {IfDeath: IfDeath}}).exec();
            res.status(200).send({ Status: true, Response: result });
         }
      });
   }
};

// Discharge Transfer - Death View---------------------------------------------------------
exports.DischargeTransferDeath_View= function(req, res) {
   var ReceivingData = req.body;

   if (!ReceivingData.User || ReceivingData.User === '') {
      res.status(400).send({ Status: false, Message: "User Details is Required!" });
   } else if (!ReceivingData.PatientId || ReceivingData.PatientId === '') {
      res.status(400).send({ Status: false, Message: "Patient Detail not valid!" });
   } else {
      DischargeTransferModel.DischargeTransferDeathSchema.findOne({PatientId: mongoose.Types.ObjectId(ReceivingData.PatientId)}, {}, {})
      .exec(function(err, result) {
         if(err) {
            res.status(417).send({status: false, Message: "Some error occurred while Find The Discharge/ Transfer Death Details!.", Error: err });
         } else {
            res.status(200).send({Status: true, Response: result });
         }
      });
   }
};

// Discharge Transfer - Death Update----------------------------------------------
exports.DischargeTransferDeath_Update = function(req, res){
   var ReceivingData = req.body;

   if(!ReceivingData.User || ReceivingData.User === null){
      res.status(400).send({ Status: false, Message: "User Details is Required!" });
   } else if(!ReceivingData.PatientId || ReceivingData.PatientId === null){
      res.status(400).send({ Status: false, Message: "Patient Detail not valid!" });
   } else if(!ReceivingData.DeathId || ReceivingData.DeathId === null){
      res.status(400).send({ Status: false, Message: "Death Details not valid!" });
   } else {
      DischargeTransferModel.DischargeTransferDeathSchema.findOne({_id: mongoose.Types.ObjectId(ReceivingData.DeathId)}, {}, {}, function(err, result) {
         if (err) {
            res.status(417).send({ Status: false, Message: "Some error occurred while Find the Death Details!.", Error: err });
         } else if (result === null){
            res.status(400).send({ Status: false, Message: "Invalid Death Details!" });
         } else {
            result.Discharge_Transfer_Death = ReceivingData.Discharge_Transfer_Death || '';
            result.Discharge_Transfer_Cause_of_Death = ReceivingData.Discharge_Transfer_Cause_of_Death || '';
            result.Discharge_Transfer_Death_Date_Time = ReceivingData.Discharge_Transfer_Death_Date_Time || '';
            result.Discharge_Transfer_Remarks = ReceivingData.Discharge_Transfer_Remarks || '';
            result.save( function(errNew, resultNew){
            if (errNew) {
               res.status(417).send({ Status: false, Message: "Some error occurred while update the Lab Deport Details!.", Error: errNew });
            } else {
               const IfDeath = ReceivingData.Discharge_Transfer_Death === 'Yes' ? true : ReceivingData.Discharge_Transfer_Death === 'No' ? false : null; 
               PatientBasicModel.PatientBasicDetailsSchema.updateOne({_id: mongoose.Types.ObjectId(ReceivingData.PatientId)}, { $set: {IfDeath: IfDeath}}).exec();
               res.status(200).send({ Status: true, Response: resultNew });
            }
            });
         }
      });
   }
};






//Discharge-Transfer Medications Create
exports.DischargeTransferMedication_Create = function(req, res) {
   var ReceivingData = req.body;

   if(!ReceivingData.User || ReceivingData.User === null){
      res.status(400).send({ Status: false, Message: "User Details is Required!" });
   } else if(!ReceivingData.PatientId || ReceivingData.PatientId === null){
      res.status(400).send({ Status: false, Message: "Patient Detail not valid!" });
   } else if(!ReceivingData.Hospital || ReceivingData.Hospital === null){
      res.status(400).send({ Status: false, Message: "Hospital Detail not valid!" });
   } else {
      const Create_DischargeTransferDeath = new DischargeTransferModel.DischargeTransferMedicationsSchema({
         PatientId: mongoose.Types.ObjectId(ReceivingData.PatientId),
         Hospital: mongoose.Types.ObjectId(ReceivingData.Hospital), 
         Discharge_Medications_Aspirin: ReceivingData.Discharge_Medications_Aspirin || '',
         Discharge_Medications_Clopidogrel: ReceivingData.Discharge_Medications_Clopidogrel || '',
         Discharge_Medications_Prasugrel: ReceivingData.Discharge_Medications_Prasugrel || '',
         Discharge_Medications_Ticagrelor: ReceivingData.Discharge_Medications_Ticagrelor || '',
         Discharge_Medications_ACEI: ReceivingData.Discharge_Medications_ACEI || '',
         Discharge_Medications_ARB: ReceivingData.Discharge_Medications_ARB || '',
         Discharge_Medications_Beta_Blocker: ReceivingData.Discharge_Medications_Beta_Blocker || '',
         Discharge_Medications_Nitrate: ReceivingData.Discharge_Medications_Nitrate || '',
         Discharge_Medications_Statin: ReceivingData.Discharge_Medications_Statin || '',
			Discharge_Medications_Statin_Option: ReceivingData.Discharge_Medications_Statin_Option || '',
         Discharge_Medications_Echocardiography: ReceivingData.Discharge_Medications_Echocardiography || '',
         Discharge_Medications_Ejection_Fraction: ReceivingData.Discharge_Medications_Ejection_Fraction || null,
         OtherMedicationArray: ReceivingData.OtherMedicationArray || [],
         Active_Status: true,
         If_Deleted: false
      });

      Create_DischargeTransferDeath.save(function(err, result) {
         if(err) {
            res.status(417).send({Status: false, Message: "Some error occurred while Creating the Discharge/ Transfer Medications Details!.", Error: err });
         } else {
            DischargeTransferModel.DischargeTransferMedicationsSchema.find({PatientId: mongoose.Types.ObjectId(ReceivingData.PatientId)}, {}, {'sort': { createdAt: 1 }})
            .populate({ path: 'Hospital', select: ['Hospital_Name', 'Hospital_Role']})
            .exec(function(err_1, result_1) {
               if(err) {
                  res.status(417).send({status: false, Message: "Some error occurred while Find The Discharge/ Transfer Death Details!.", Error: err_1 });
               } else {
                  res.status(200).send({Status: true, Response: result_1 });
               }
            });
         }
      });
   }
};

// Discharge Transfer - Medication Update----------------------------------------------
exports.DischargeTransferMedication_Update = function(req, res){
   var ReceivingData = req.body;

   if(!ReceivingData.User || ReceivingData.User === null){
      res.status(400).send({ Status: false, Message: "User Details is Required!" });
   } else if(!ReceivingData.PatientId || ReceivingData.PatientId === null){
      res.status(400).send({ Status: false, Message: "Patient Detail not valid!" });
   } else if(!ReceivingData.DischargeMedicationId || ReceivingData.DischargeMedicationId === null){
      res.status(400).send({ Status: false, Message: "Discharge Medication Details not valid!" });
   } else {
      DischargeTransferModel.DischargeTransferMedicationsSchema.findOne({_id: mongoose.Types.ObjectId(ReceivingData.DischargeMedicationId)}, {}, {}, function(err, result) {
         if (err) {
            res.status(417).send({ Status: false, Message: "Some error occurred while Find the Discharge Medication Details!.", Error: err });
         } else if (result === null){
            res.status(400).send({ Status: false, Message: "Invalid Discharge Medication Details!" });
         } else {
            result.Discharge_Medications_Aspirin = ReceivingData.Discharge_Medications_Aspirin || '';
            result.Discharge_Medications_Clopidogrel = ReceivingData.Discharge_Medications_Clopidogrel || '';
            result.Discharge_Medications_Prasugrel = ReceivingData.Discharge_Medications_Prasugrel || '';
            result.Discharge_Medications_Ticagrelor = ReceivingData.Discharge_Medications_Ticagrelor || '';
            result.Discharge_Medications_ACEI = ReceivingData.Discharge_Medications_ACEI || '';
            result.Discharge_Medications_ARB = ReceivingData.Discharge_Medications_ARB || '';
            result.Discharge_Medications_Beta_Blocker = ReceivingData.Discharge_Medications_Beta_Blocker || '';
            result.Discharge_Medications_Nitrate = ReceivingData.Discharge_Medications_Nitrate || '';
            result.Discharge_Medications_Statin = ReceivingData.Discharge_Medications_Statin || '';
				result.Discharge_Medications_Statin_Option = ReceivingData.Discharge_Medications_Statin_Option || '';
            result.Discharge_Medications_Echocardiography = ReceivingData.Discharge_Medications_Echocardiography || '';
            result.Discharge_Medications_Ejection_Fraction = ReceivingData.Discharge_Medications_Ejection_Fraction || null;
            result.OtherMedicationArray = ReceivingData.OtherMedicationArray || [];
            result.save( function(errNew, resultNew) {
               if (errNew) {
                  res.status(417).send({ Status: false, Message: "Some error occurred while update the Discharge Medication Details!.", Error: errNew });
               } else {
                  DischargeTransferModel.DischargeTransferMedicationsSchema.find({PatientId: mongoose.Types.ObjectId(ReceivingData.PatientId)}, {}, {'sort': { createdAt: 1 }})
                  .populate({ path: 'Hospital', select: ['Hospital_Name', 'Hospital_Role']})
                  .exec(function(err_1, result_1) {
                     if(err) {
                        res.status(417).send({status: false, Message: "Some error occurred while Find The Discharge/ Transfer Death Details!.", Error: err_1 });
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

// Discharge Transfer - Medication View---------------------------------------------------------
exports.DischargeTransferMedication_View= function(req, res) {
   var ReceivingData = req.body;

   if (!ReceivingData.User || ReceivingData.User === '') {
      res.status(400).send({ Status: false, Message: "User Details is Required!" });
   } else if (!ReceivingData.PatientId || ReceivingData.PatientId === '') {
      res.status(400).send({ Status: false, Message: "Patient Detail not valid!" });
   } else {
      DischargeTransferModel.DischargeTransferMedicationsSchema.find({PatientId: mongoose.Types.ObjectId(ReceivingData.PatientId)}, {}, {'sort': { createdAt: 1 }})
      .populate({ path: 'Hospital', select: ['Hospital_Name', 'Hospital_Role']})
      .exec(function(err, result) {
         if(err) {
            res.status(417).send({status: false, Message: "Some error occurred while Find The Discharge/ Transfer Death Details!.", Error: err });
         } else {
            res.status(200).send({Status: true, Response: result });
         }
      });
   }
};

// Discharge Transfer - Medication History Update----------------------------------------------
exports.TransferHistoryMedication_Update = function(req, res){
   var ReceivingData = req.body;

   if(!ReceivingData.Patient || ReceivingData.Patient === null){
      res.status(400).send({ Status: false, Message: "Patient Detail not valid!" });
   } else if(!ReceivingData._id || ReceivingData._id === null){
      res.status(400).send({ Status: false, Message: "Discharge Medication Details not valid!" });
   } else {
      DischargeTransferModel.DischargeTransferMedicationsSchema.findOne({_id: mongoose.Types.ObjectId(ReceivingData._id)}, {}, {}, function(err, result) {
         if (err) {
            res.status(417).send({ Status: false, Message: "Some error occurred while Find the Discharge Medication Details!.", Error: err });
         } else if (result === null){
            res.status(400).send({ Status: false, Message: "Invalid Discharge Medication Details!" });
         } else {
            result.Discharge_Medications_Aspirin = ReceivingData.Discharge_Medications_Aspirin || '';
            result.Discharge_Medications_Clopidogrel = ReceivingData.Discharge_Medications_Clopidogrel || '';
            result.Discharge_Medications_Prasugrel = ReceivingData.Discharge_Medications_Prasugrel || '';
            result.Discharge_Medications_Ticagrelor = ReceivingData.Discharge_Medications_Ticagrelor || '';
            result.Discharge_Medications_ACEI = ReceivingData.Discharge_Medications_ACEI || '';
            result.Discharge_Medications_ARB = ReceivingData.Discharge_Medications_ARB || '';
            result.Discharge_Medications_Beta_Blocker = ReceivingData.Discharge_Medications_Beta_Blocker || '';
            result.Discharge_Medications_Nitrate = ReceivingData.Discharge_Medications_Nitrate || '';
            result.Discharge_Medications_Statin = ReceivingData.Discharge_Medications_Statin || '';
				result.Discharge_Medications_Statin_Option = ReceivingData.Discharge_Medications_Statin_Option || '';
            result.Discharge_Medications_Echocardiography = ReceivingData.Discharge_Medications_Echocardiography || '';
            result.Discharge_Medications_Ejection_Fraction = ReceivingData.Discharge_Medications_Ejection_Fraction || null;
            result.OtherMedicationArray = ReceivingData.OtherMedicationArray || [];
            result.save( function(errNew, resultNew) {
               if (errNew) {
                  res.status(417).send({ Status: false, Message: "Some error occurred while update the Discharge Medication Details!.", Error: errNew });
               } else {
                  res.status(200).send({Status: true, Response: resultNew });
               }
            });
         }
      });
   }
};
//Discharge-Transfer Medications History Create
exports.TransferHistoryMedication_Create = function(req, res) {
   var ReceivingData = req.body;

   if(!ReceivingData.Patient || ReceivingData.Patient === null){
      res.status(400).send({ Status: false, Message: "Patient Detail not valid!" });
   } else if(!ReceivingData.Hospital || ReceivingData.Hospital === null){
      res.status(400).send({ Status: false, Message: "Hospital Detail not valid!" });
   } else {
      const Create_DischargeTransferDeath = new DischargeTransferModel.DischargeTransferMedicationsSchema({
         PatientId: mongoose.Types.ObjectId(ReceivingData.Patient),
         Hospital: mongoose.Types.ObjectId(ReceivingData.Hospital), 
         Discharge_Medications_Aspirin: ReceivingData.Discharge_Medications_Aspirin || '',
         Discharge_Medications_Clopidogrel: ReceivingData.Discharge_Medications_Clopidogrel || '',
         Discharge_Medications_Prasugrel: ReceivingData.Discharge_Medications_Prasugrel || '',
         Discharge_Medications_Ticagrelor: ReceivingData.Discharge_Medications_Ticagrelor || '',
         Discharge_Medications_ACEI: ReceivingData.Discharge_Medications_ACEI || '',
         Discharge_Medications_ARB: ReceivingData.Discharge_Medications_ARB || '',
         Discharge_Medications_Beta_Blocker: ReceivingData.Discharge_Medications_Beta_Blocker || '',
         Discharge_Medications_Nitrate: ReceivingData.Discharge_Medications_Nitrate || '',
         Discharge_Medications_Statin: ReceivingData.Discharge_Medications_Statin || '',
			Discharge_Medications_Statin_Option: ReceivingData.Discharge_Medications_Statin_Option || '',
         Discharge_Medications_Echocardiography: ReceivingData.Discharge_Medications_Echocardiography || '',
         Discharge_Medications_Ejection_Fraction: ReceivingData.Discharge_Medications_Ejection_Fraction || null,
         OtherMedicationArray: ReceivingData.OtherMedicationArray || [],
         Active_Status: true,
         If_Deleted: false
      });

      Create_DischargeTransferDeath.save(function(err, result) {
         if(err) {
            res.status(417).send({Status: false, Message: "Some error occurred while Creating the Discharge/ Transfer Medications Details!.", Error: err });
         } else {
            res.status(200).send({Status: true, Response: result });
         }
      });
   }
};






// Discharge Transfer Details
exports.DischargeTransferDischarge_Create = function(req, res) {
   var ReceivingData = req.body;

   if(!ReceivingData.User || ReceivingData.User === null){
      res.status(400).send({ Status: false, Message: "User Details is Required!" });
   } else if(!ReceivingData.PatientId || ReceivingData.PatientId === null){
      res.status(400).send({ Status: false, Message: "Patient Detail not valid!" });
   } else if(!ReceivingData.Hospital || ReceivingData.Hospital === null){
      res.status(400).send({ Status: false, Message: "Hospital Detail not valid!" });
   } else {
      var Transfer_Cluster = null;
      if(ReceivingData.Transfer_to_Stemi_Cluster && typeof ReceivingData.Transfer_to_Stemi_Cluster === 'object' && ReceivingData.Transfer_to_Stemi_Cluster !== null && ReceivingData.Transfer_to_Stemi_Cluster._id ) {
         Transfer_Cluster = mongoose.Types.ObjectId(ReceivingData.Transfer_to_Stemi_Cluster._id);
      }
      var Transfer_Hospital = null;
      if(ReceivingData.Transfer_to_Stemi_Cluster_Hospital_Name && typeof ReceivingData.Transfer_to_Stemi_Cluster_Hospital_Name === 'object' && ReceivingData.Transfer_to_Stemi_Cluster_Hospital_Name !== null && ReceivingData.Transfer_to_Stemi_Cluster_Hospital_Name._id ) {
         Transfer_Hospital = mongoose.Types.ObjectId(ReceivingData.Transfer_to_Stemi_Cluster_Hospital_Name._id);
      }
      var HospitalFrom = null;
      if(ReceivingData.Hospital && ReceivingData.Hospital !== '' && ReceivingData.Hospital !== null && ReceivingData.Hospital ) {
         HospitalFrom = mongoose.Types.ObjectId(ReceivingData.Hospital);
      }
      var ClusterAmbulance = null;
      if(ReceivingData.Discharge_Cluster_Ambulance && ReceivingData.Discharge_Cluster_Ambulance !== '' && ReceivingData.Discharge_Cluster_Ambulance !== null && ReceivingData.Discharge_Cluster_Ambulance ) {
         ClusterAmbulance = mongoose.Types.ObjectId(ReceivingData.Discharge_Cluster_Ambulance._id);
      }
      const Create_DischargeTransferDetails = new DischargeTransferModel.DischargeTransferSchema({
         PatientId: mongoose.Types.ObjectId(ReceivingData.PatientId),
         Hospital: HospitalFrom, 
         Discharge_Transfer_ICU_CCU_HCU_Date_Time: ReceivingData.Discharge_Transfer_ICU_CCU_HCU_Date_Time || '',
         Discharge_Transfer_from_Hospital_Date_Time: ReceivingData.Discharge_Transfer_from_Hospital_Date_Time || '',
         Discharge_Transfer_To: ReceivingData.Discharge_Transfer_To || '',
         Discharge_Details_Remarks: ReceivingData.Discharge_Details_Remarks || '',
         Transfer_to_Stemi_Cluster: Transfer_Cluster || null,
         Transfer_to_Stemi_Cluster_Hospital_Name: Transfer_Hospital || null,
         Transfer_to_Stemi_Cluster_Hospital_Address: ReceivingData.Transfer_to_Stemi_Cluster_Hospital_Address || '',
         Transfer_to_Non_Stemi_Cluster_Hospital_Hospital_Name: ReceivingData.Transfer_to_Non_Stemi_Cluster_Hospital_Hospital_Name || '',
         Transfer_to_Non_Stemi_Cluster_Hospital_Hospital_Address: ReceivingData.Transfer_to_Non_Stemi_Cluster_Hospital_Hospital_Address || '',
         Transport_Vehicle: ReceivingData.Transport_Vehicle || '',
         Transport_Vehicle_Other: ReceivingData.Transport_Vehicle_Other || '',
         Discharge_Cluster_Ambulance: ClusterAmbulance,
         Discharge_Ambulance_Call_Date_Time: ReceivingData.Discharge_Ambulance_Call_Date_Time || '',
         Discharge_Ambulance_Arrival_Date_Time: ReceivingData.Discharge_Ambulance_Arrival_Date_Time || '',
         Discharge_Ambulance_Departure_Date_Time: ReceivingData.Discharge_Ambulance_Departure_Date_Time || '',
         Active_Status: true,
         If_Deleted: false
      });

      Create_DischargeTransferDetails.save(function(err, result) {
         if(err) {
            res.status(417).send({ Status: false, Message: "Some error occurred while Creating the Discharge/ Transfer Details!.", Error: err });
         } else {
            if (result.Discharge_Transfer_To === 'Current_Cluster' || result.Discharge_Transfer_To === 'Other_Cluster') {
               PatientBasicModel.PatientBasicDetailsSchema.findOne({_id: mongoose.Types.ObjectId(ReceivingData.PatientId)}, {}, {})
               .exec( (err_1, result_1) => {
                  if(err_1) {
                     DischargeTransferModel.DischargeTransferSchema.findOneAndDelete({_id: result._id}).exec();
                     res.status(417).send({ Status: false, Message: "Some error occurred while Creating the Discharge/ Transfer Details!.", Error: err_1 });
                  } else {
                     if (result_1 !== null) {
                        if (result.Discharge_Transfer_To === 'Current_Cluster' || result.Discharge_Transfer_To === 'Other_Cluster') {
									const trfBending = Transfer_Hospital ? true : false;
                           PatientBasicModel.PatientBasicDetailsSchema
                           .updateOne({_id: mongoose.Types.ObjectId(ReceivingData.PatientId)}, { $set: { TransferBending: trfBending, TransferBendingTo: Transfer_Hospital, DischargeTransferId: result._id }
                           }).exec( (err_2, result_2)  => { 
                              if(err_1) {
                                 DischargeTransferModel.DischargeTransferSchema.findOneAndDelete({_id: result._id}).exec();
                                 res.status(417).send({ Status: false, Message: "Some error occurred while Updating the Patient Transfer Details!.", Error: err_2 });
                              } else {
                                 UsersManagementModel.UserManagementSchema.findOne({User_Type: 'PU', Hospital: Transfer_Hospital })
                                 .exec((err_2, result_2) => {
                                    if(result_2 !== undefined && result_2 !== null) {
                                       const Notification = new NotificationModel.NotificationSchema({
                                          User_ID: result_2._id,
                                          Patient_ID: result.PatientId,
                                          Confirmed_PatientId: result.PatientId,
                                          Notification_Type: 'STEMI_Patient_Transfer',
                                          Message: 'The Patient: ' + result_1.Patient_Name + ', Age: ' + result_1.Patient_Age + ', Gender: ' + result_1.Patient_Gender + ' is Transferred your Hospital.',
                                          TransferFrom:  HospitalFrom,
                                          TransferTo: Transfer_Hospital,
                                          Message_Received: false,
                                          Message_Viewed: false,
                                          Active_Status: true,
                                          If_Deleted: false
                                       });
                                       Notification.save();
                                    }
                                 });
                                 res.status(200).send({ Status: true, Response: result });
                              }
                           });
                        } else {
                           res.status(200).send({ Status: true, Response: result });
                        }
                     } else {
                        DischargeTransferModel.DischargeTransferSchema.findOneAndDelete({_id: result._id}).exec();
                        res.status(400).send({ Status: false, Message: 'Invalid Patient Details' });
                     }
                  }
               });
            } else {
               if (result.Discharge_Transfer_To !== '') {
                  PatientBasicModel.PatientBasicDetailsSchema.updateOne({_id: mongoose.Types.ObjectId(ReceivingData.PatientId)}, { $set: { IfDischarge: true }}).exec();
               }
               res.status(200).send({ Status: true, Response: result });
            }
         }
      });
   }   
};

// Discharge Transfer - Discharge Transfer Details Update----------------------------------------------
exports.DischargeTransferDischarge_Update = function(req, res){
   var ReceivingData = req.body;

   if(!ReceivingData.User || ReceivingData.User === null){
      res.status(400).send({ Status: false, Message: "User Details is Required!" });
   } else if(!ReceivingData.PatientId || ReceivingData.PatientId === null){
      res.status(400).send({ Status: false, Message: "Patient Detail not valid!" });
   } else if(!ReceivingData.DischargeId || ReceivingData.DischargeId === null){
      res.status(400).send({ Status: false, Message: "Discharge Transfer Details not valid!" });
   } else if(!ReceivingData.Hospital || ReceivingData.Hospital === null){
      res.status(400).send({ Status: false, Message: "Hospital Detail not valid!" });
   } else {
      var Transfer_Cluster = null;
      if(ReceivingData.Transfer_to_Stemi_Cluster && typeof ReceivingData.Transfer_to_Stemi_Cluster === 'object' && ReceivingData.Transfer_to_Stemi_Cluster !== null && ReceivingData.Transfer_to_Stemi_Cluster._id ) {
         Transfer_Cluster = mongoose.Types.ObjectId(ReceivingData.Transfer_to_Stemi_Cluster._id);
      }
      var Transfer_Hospital = null;
      if(ReceivingData.Transfer_to_Stemi_Cluster_Hospital_Name && typeof ReceivingData.Transfer_to_Stemi_Cluster_Hospital_Name === 'object' && ReceivingData.Transfer_to_Stemi_Cluster_Hospital_Name !== null && ReceivingData.Transfer_to_Stemi_Cluster_Hospital_Name._id ) {
         Transfer_Hospital = mongoose.Types.ObjectId(ReceivingData.Transfer_to_Stemi_Cluster_Hospital_Name._id);
      }
      var HospitalFrom = null;
      if(ReceivingData.Hospital && ReceivingData.Hospital !== '' && ReceivingData.Hospital !== null && ReceivingData.Hospital ) {
         HospitalFrom = mongoose.Types.ObjectId(ReceivingData.Hospital);
      }
      var ClusterAmbulance = null;
      if(ReceivingData.Discharge_Cluster_Ambulance && ReceivingData.Discharge_Cluster_Ambulance !== '' && ReceivingData.Discharge_Cluster_Ambulance !== null && ReceivingData.Discharge_Cluster_Ambulance ) {
         ClusterAmbulance = mongoose.Types.ObjectId(ReceivingData.Discharge_Cluster_Ambulance._id);
      }

      DischargeTransferModel.DischargeTransferSchema.findOne({_id: mongoose.Types.ObjectId(ReceivingData.DischargeId), Hospital: HospitalFrom}, {}, {}, function(err, result) {
         if (err) {
            res.status(417).send({ Status: false, Message: "Some error occurred while Find the Discharge Transfer Details!.", Error: err });
         } else if (result === null) {
            res.status(400).send({ Status: false, Message: "Invalid Discharge Transfer Details!" });
         } else {
            result.Discharge_Transfer_ICU_CCU_HCU_Date_Time = ReceivingData.Discharge_Transfer_ICU_CCU_HCU_Date_Time || '';
            result.Discharge_Transfer_from_Hospital_Date_Time = ReceivingData.Discharge_Transfer_from_Hospital_Date_Time || '';
            result.Discharge_Transfer_To = ReceivingData.Discharge_Transfer_To || '';
            result.Discharge_Details_Remarks = ReceivingData.Discharge_Details_Remarks || '';
            result.Transfer_to_Stemi_Cluster = Transfer_Cluster || null;
            result.Transfer_to_Stemi_Cluster_Hospital_Name = Transfer_Hospital || null;
            result.Transfer_to_Stemi_Cluster_Hospital_Address = ReceivingData.Transfer_to_Stemi_Cluster_Hospital_Address || '';
            result.Transfer_to_Non_Stemi_Cluster_Hospital_Hospital_Name = ReceivingData.Transfer_to_Non_Stemi_Cluster_Hospital_Hospital_Name || '';
            result.Transfer_to_Non_Stemi_Cluster_Hospital_Hospital_Address = ReceivingData.Transfer_to_Non_Stemi_Cluster_Hospital_Hospital_Address || '';
            result.Transport_Vehicle = ReceivingData.Transport_Vehicle || '';
            result.Transport_Vehicle_Other = ReceivingData.Transport_Vehicle_Other || '';
            result.Discharge_Cluster_Ambulance = ClusterAmbulance;
            result.Discharge_Ambulance_Call_Date_Time = ReceivingData.Discharge_Ambulance_Call_Date_Time || '';
            result.Discharge_Ambulance_Arrival_Date_Time = ReceivingData.Discharge_Ambulance_Arrival_Date_Time || '';
            result.Discharge_Ambulance_Departure_Date_Time = ReceivingData.Discharge_Ambulance_Departure_Date_Time || '';
            result.save( function(errNew, resultNew){
               if (errNew) {
                  res.status(417).send({ Status: false, Message: "Some error occurred while update the Discharge Transfer Details!.", Error: errNew });
               } else {
                  if (result.Discharge_Transfer_To === 'Current_Cluster' || result.Discharge_Transfer_To === 'Other_Cluster') {
                     PatientBasicModel.PatientBasicDetailsSchema.findOne({_id: mongoose.Types.ObjectId(ReceivingData.PatientId)}, {}, {})
                     .exec( (err_1, result_1) => {
                        if(err_1) {
                           res.status(417).send({ Status: false, Message: "Some error occurred while Creating the Discharge/ Transfer Details!.", Error: err_1 });
                        } else {
                           if (result_1 !== null) {
                              if (ReceivingData.Discharge_Transfer_To === 'Current_Cluster' || ReceivingData.Discharge_Transfer_To === 'Other_Cluster') {
											const trfBending = Transfer_Hospital ? true : false;
                                 PatientBasicModel.PatientBasicDetailsSchema
                                 .updateOne( {_id: result_1._id}, { $set: { DidNotArrive: false, TransferBending: trfBending, TransferBendingTo: Transfer_Hospital, DischargeTransferId: result._id }
                                 }).exec( (err_2, result_2)  => {
                                    if(err_1) {
                                       DischargeTransferModel.DischargeTransferSchema.findOneAndDelete({_id: resultNew._id}).exec();
                                       res.status(417).send({ Status: false, Message: "Some error occurred while Updating the Patient Transfer Details!.", Error: err_2 });
                                    } else {
                                       Promise.all([
                                          NotificationModel.NotificationSchema.findOne({Confirmed_PatientId: result_1._id, TransferFrom: HospitalFrom, TransferTo: Transfer_Hospital, If_Deleted: false}).exec(),
                                          NotificationModel.NotificationSchema.findOne({Confirmed_PatientId: result_1._id, TransferFrom: HospitalFrom, If_Deleted: false}).exec(),
                                          UsersManagementModel.UserManagementSchema.findOne({User_Type: 'PU', Hospital: Transfer_Hospital }).exec()
                                       ]).then(response_1 => {
                                          const SameData = response_1[0];
                                          const OldData = response_1[1];
                                          const UserData = response_1[2];
                                          if (SameData === null && OldData !== null) {
                                             OldData.If_Deleted = true;
                                             OldData.save();
                                             if(UserData !== undefined && UserData !== null) {
                                                const Notification = new NotificationModel.NotificationSchema({
                                                   User_ID: UserData._id,
                                                   Patient_ID: result.PatientId,
                                                   Confirmed_PatientId: result.PatientId,
                                                   Notification_Type: 'STEMI_Patient_Transfer',
                                                   Message: 'The Patient: ' + result_1.Patient_Name + ', Age: ' + result_1.Patient_Age + ', Gender: ' + result_1.Patient_Gender + ' is Transferred your Hospital.',
                                                   TransferFrom:  HospitalFrom,
                                                   TransferTo: Transfer_Hospital,
                                                   Message_Received: false,
                                                   Message_Viewed: false,
                                                   Active_Status: true,
                                                   If_Deleted: false
                                                });
                                                Notification.save();
                                             }
                                          }
                                       }).catch(error_1 => {

                                       });
                                       res.status(200).send({ Status: true, Response: resultNew });
                                    }
                                 });
                              } else {
                                 PatientBasicModel.PatientBasicDetailsSchema
                                 .updateOne( {_id: result_1._id}, { $set: { TransferBending: false, TransferBendingTo: null, DischargeTransferId: null }
                                 }).exec( (err_2, result_2)  => {
                                    if(err_1) {
                                       DischargeTransferModel.DischargeTransferSchema.findOneAndDelete({_id: resultNew._id}).exec();
                                       res.status(417).send({ Status: false, Message: "Some error occurred while Updating the Patient Transfer Details!.", Error: err_2 });
                                    } else {
                                       res.status(200).send({ Status: true, Response: resultNew });
                                    }
                                 });
                              }
                           } else {
                              DischargeTransferModel.DischargeTransferSchema.findOneAndDelete({_id: resultNew._id}).exec();
                              res.status(400).send({ Status: false, Message: 'Invalid Patient Details' });
                           }
                        }
                     });
                     PatientBasicModel.PatientBasicDetailsSchema.updateOne({_id: mongoose.Types.ObjectId(ReceivingData.PatientId)}, { $set: { IfDischarge: null }}).exec();
                  } else {
                     if (result.Discharge_Transfer_To !== '') {
                        PatientBasicModel.PatientBasicDetailsSchema.updateOne({_id: mongoose.Types.ObjectId(ReceivingData.PatientId)}, { $set: { IfDischarge: true }}).exec();
                     }
                     res.status(200).send({ Status: true, Response: resultNew });
                  }
               }
            });
         }
      });
   }
};

// Discharge Transfer - Discharge Transfer Details View---------------------------------------------------------
exports.DischargeTransferDischarge_View= function(req, res) {
   var ReceivingData = req.body;

   if (!ReceivingData.User || ReceivingData.User === '') {
      res.status(400).send({ Status: false, Message: "User Details is Required!" });
   } else if (!ReceivingData.PatientId || ReceivingData.PatientId === '') {
      res.status(400).send({ Status: false, Message: "Patient Detail not valid!" });
   } else {
      DischargeTransferModel.DischargeTransferSchema.find({PatientId: mongoose.Types.ObjectId(ReceivingData.PatientId)}, {}, {'sort': { createdAt: 1 }})
      .populate({ path: 'Hospital', select: ['Hospital_Name', 'Address', 'Hospital_Role']})
      .populate({ path: 'Transfer_to_Stemi_Cluster_Hospital_Name', select: ['Hospital_Name', 'Address', 'Hospital_Role'] })
      .populate({ path: 'Transfer_to_Stemi_Cluster', select: 'Cluster_Name' })
      .populate({ path: 'Discharge_Cluster_Ambulance', select: ['Hospital_Name', 'Address', 'Hospital_Role']})
      .exec(function(err, result) {
         if(err) {
            res.status(417).send({status: false, Message: "Some error occurred while Find The Discharge/ Transfer Details!.", Error: err });
         } else {
            res.status(200).send({Status: true, Response: result });
         }
      });
   }
};

// Discharge Transfer - Discharge Transfer Details History Update----------------------------------------------
exports.DischargeHistory_Update = function(req, res){
   var ReceivingData = req.body;

   if(!ReceivingData.Patient || ReceivingData.Patient === null){
      res.status(400).send({ Status: false, Message: "Patient Detail not valid!" });
   } else if(!ReceivingData._id || ReceivingData._id === null){
      res.status(400).send({ Status: false, Message: "Discharge Transfer Details not valid!" });
   } else if(!ReceivingData.Hospital || ReceivingData.Hospital === null){
      res.status(400).send({ Status: false, Message: "Hospital Detail not valid!" });
   } else {

      DischargeTransferModel.DischargeTransferSchema.findOne({_id: mongoose.Types.ObjectId(ReceivingData._id)}, {}, {}, function(err, result) {
         if (err) {
            res.status(417).send({ Status: false, Message: "Some error occurred while Find the Discharge Transfer Details!.", Error: err });
         } else if (result === null) {
            res.status(400).send({ Status: false, Message: "Invalid Discharge Transfer Details!" });
         } else {
            result.Discharge_Transfer_ICU_CCU_HCU_Date_Time = ReceivingData.Discharge_Transfer_ICU_CCU_HCU_Date_Time || '';
            result.Discharge_Transfer_from_Hospital_Date_Time = ReceivingData.Discharge_Transfer_from_Hospital_Date_Time || '';
            result.Discharge_Details_Remarks = ReceivingData.Discharge_Details_Remarks || '';
            result.Transfer_to_Non_Stemi_Cluster_Hospital_Hospital_Name = ReceivingData.Transfer_to_Non_Stemi_Cluster_Hospital_Hospital_Name || '';
            result.Transfer_to_Non_Stemi_Cluster_Hospital_Hospital_Address = ReceivingData.Transfer_to_Non_Stemi_Cluster_Hospital_Hospital_Address || '';
				result.Transport_Vehicle_Other = ReceivingData.Transport_Vehicle_Other || '';
            result.Discharge_Ambulance_Call_Date_Time = ReceivingData.Discharge_Ambulance_Call_Date_Time || '';
            result.Discharge_Ambulance_Arrival_Date_Time = ReceivingData.Discharge_Ambulance_Arrival_Date_Time || '';
            result.Discharge_Ambulance_Departure_Date_Time = ReceivingData.Discharge_Ambulance_Departure_Date_Time || '';
            result.save( function(errNew, resultNew) {
               if (errNew) {
                  res.status(417).send({ Status: false, Message: "Some error occurred while update the Discharge Transfer Details!.", Error: errNew });
               } else {
                  PatientBasicModel.PatientBasicDetailsSchema.updateOne(
                     { _id: mongoose.Types.ObjectId(ReceivingData.Patient), "Transport_History.Transport_From_Hospital": mongoose.Types.ObjectId(ReceivingData.Hospital)},
                     { $set: {
                        "Transport_History.$.Ambulance_Call_Date_Time": ReceivingData.Discharge_Ambulance_Call_Date_Time,
                        "Transport_History.$.Ambulance_Arrival_Date_Time": ReceivingData.Discharge_Ambulance_Arrival_Date_Time,
                        "Transport_History.$.Ambulance_Departure_Date_Time": ReceivingData.Discharge_Ambulance_Departure_Date_Time,
                     }
                  }).exec( (err_2, result_2)  => {
                     if (err_2) {
                        res.status(417).send({ Status: false, Message: "Some error occurred while update the Patient Transfer Details!.", Error: errNew });
                     } else {
                        res.status(200).send({ Status: true, Response: resultNew });
                     }
                  });
               }
            });
         }
      });
   }
};
 

exports.DischargeOther_Clusters = function(req, res) {
   var ReceivingData = req.body;
   if(!ReceivingData.Clusters || typeof ReceivingData.Clusters !== 'object' || ReceivingData.Clusters === null ) {
      res.status(400).send({Status: false, ErrorCode: 400, Message: "Cluster Details can not be empty" });
   } else if(!ReceivingData.Location_Id || ReceivingData.Location_Id === '' ) {
      res.status(400).send({Status: false, ErrorCode: 400, Message: "Location Details can not be empty" });
   } else {
      ClusterManagementModel.ClusterSchema
      .find({ 'Location': mongoose.Types.ObjectId(ReceivingData.Location_Id), 'Active_Status': true, 'If_Deleted': false}, {Cluster_Name: 1}, {})
      .exec(function(err,result){
         if(err) {
            res.status(417).send({status: false, ErrorCode: 417, Message: "Some error occurred!.", Error: err });
         } else {
            result = JSON.parse(JSON.stringify(result));
            result = result.filter(obj => !ReceivingData.Clusters.includes(obj._id));
            // Duplicates Remove
            resultIds = result.map(obj => obj._id);
            resultIds = resultIds.filter((obj, index) => resultIds.indexOf(obj) === index);
            var ReturnResponse = [];
            resultIds.map(obj => {
               const index = result.findIndex(objNew => objNew._id === obj);
               ReturnResponse.push(result[index]);
            });
            ReturnResponse = ReturnResponse.sort(function(Obj1, Obj2) { return Obj1.Cluster_Name.localeCompare(Obj2.Cluster_Name); });
            res.status(200).send({Status: true, Response: ReturnResponse });
         }
      });
   }
};


exports.DischargeHospitals_ClusterBased = function(req, res) {
   var ReceivingData = req.body;
   if(!ReceivingData.Clusters || typeof ReceivingData.Clusters !== 'object' || ReceivingData.Clusters === null ) {
      res.status(400).send({Status: false, ErrorCode: 400, Message: "Cluster Details can not be empty" });
   } else if(!ReceivingData.Hospital_Id || ReceivingData.Hospital_Id === '' ) {
      res.status(400).send({Status: false, ErrorCode: 400, Message: "Hospital Details can not be empty" });
   } else if(!ReceivingData.Restrictions_List || typeof ReceivingData.Restrictions_List !== 'object' || ReceivingData.Restrictions_List === null || ReceivingData.Restrictions_List.length === 0 ) {
      res.status(400).send({Status: false, ErrorCode: 400, Message: "Restrictions List can not be empty" });
   } else if(!ReceivingData.Location_Id || ReceivingData.Location_Id === '' ) {
      res.status(400).send({Status: false, ErrorCode: 400, Message: "Location Details can not be empty" });
   } else {
      ReceivingData.Clusters = ReceivingData.Clusters.map(obj => mongoose.Types.ObjectId(obj));
      ClusterManagementModel.ClusterMappingSchema
      .find( { 'Cluster': {$in: ReceivingData.Clusters }, 'Active_Status': true, 'If_Deleted': false }, {ClusterHospital: 1}, {})
      .populate({ path: 'ClusterHospital', select: ['Hospital_Name', 'Address', 'Hospital_Role'] })
      .exec(function(err, result) {
         if(err) {
            res.status(417).send({status: false, ErrorCode: 417, Message: "Some error occurred!.", Error: err });
         } else {
            ReceivingData.Hospital_Id = ReceivingData.Hospital_Id._id;
            result = JSON.parse(JSON.stringify(result));
            result = result.map(obj => {
               return { Hospital_Name: obj.ClusterHospital.Hospital_Name,
                        _id: obj.ClusterHospital._id,
                        Hospital_Role: obj.ClusterHospital.Hospital_Role,
                        Address: obj.ClusterHospital.Address,
                        Hospital_Type: 'Tier 1' };
                     });

            ClusterManagementModel.ClusterSchema
            .find({ 'Location': mongoose.Types.ObjectId(ReceivingData.Location_Id), 'Cluster_Type': 'advanced',  'Active_Status': true, 'If_Deleted': false}, {HospitalsArray: 1}, {})
            .populate({ path: 'HospitalsArray', select: ['Hospital_Name', 'Address', 'Hospital_Role'] })
            .exec(function(err_1, result_1) {
               if(err_1) {
                  res.status(417).send({status: false, ErrorCode: 417, Message: "Some error occurred!.", Error: err_1 });
               } else {
                  result_1 = JSON.parse(JSON.stringify(result_1));
                  Hospitals = [];
                  result_1.map(obj => {
                     obj.HospitalsArray.map(obj1 => {
                        Hospitals.push(obj1);
                     });
                  });
                  Hospitals = Hospitals.map(obj => { obj.Hospital_Type = 'Tier 2'; return obj; });
                  ResultHospitals = result.map(obj => obj._Id );
                  Hospitals = Hospitals.filter(obj => !ResultHospitals.includes(obj._id)); // Duplicates Remove
                  result = result.concat(Hospitals);

                  result = result.filter(obj => ReceivingData.Restrictions_List.includes(obj.Hospital_Role) && (obj._id !== ReceivingData.Hospital_Id));
                  // Duplicates Remove
                  resultIds = result.map(obj => obj._id);
                  resultIds = resultIds.filter((obj, index) => resultIds.indexOf(obj) === index);
                  var ReturnResponse = [];
                  resultIds.map(obj => {
                     const index = result.findIndex(objNew => objNew._id === obj);
                     ReturnResponse.push(result[index]);
                  });
                  ReturnResponse = ReturnResponse.sort(function(Obj1, Obj2) { return Obj1.Hospital_Name.localeCompare(Obj2.Hospital_Name); });

                  res.status(200).send({Status: true, Response: ReturnResponse });
               }
            });
         }
      });
   }
};

exports.DischargeAmbulance_LocationBased = function(req, res) {
   var ReceivingData = req.body;

   if(!ReceivingData.Location_Id || ReceivingData.Location_Id === '' ) {
      res.status(400).send({Status: false, ErrorCode: 400, Message: "Location Details can not be empty" });
   } else {
      ReceivingData.Location_Id = mongoose.Types.ObjectId(ReceivingData.Location_Id);
      HospitalManagementModel.HospitalManagementSchema
      .find( { 'Location':  ReceivingData.Location_Id, Hospital_Role: 'EMS', 'If_Cluster_Mapped': true, 'Active_Status': true, 'If_Deleted': false }, {Hospital_Name: 1, Hospital_Role: 1, Address: 1}, {})
      .exec(function(err, result) {
         if(err) {
            res.status(417).send({status: false, ErrorCode: 417, Message: "Some error occurred!.", Error: err });
         } else {
            res.status(200).send({Status: true, Response: result });
         }
      });
   }
};



