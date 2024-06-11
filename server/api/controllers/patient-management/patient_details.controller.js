var PatientDetailsModel = require('../../models/patient-management/patient_details.model');
var UserManagementModel = require('../../models/user_management.model');
var ClusterModel = require('../../models/cluster_management.model');
var mongoose = require('mongoose');
var QRCode = require('qrcode');

var ThrombolysisModel = require('./../../models/patient-management/thrombolysis.model');
var PciModel = require('./../../models/patient-management/pci.model');
var HospitalSummaryModel = require('./../../models/patient-management/hospital_summary.model');
var DischargeTransferModel = require('./../../models/patient-management/discharge_transfer.model');
var FollowUpModel = require('./../../models/patient-management/followup_model');
var NotificationModel = require('../../../api/models/notification_management.model');

// Patient Basic Details Create ---------------------------------------------
exports.PatientBasicDetails_Create = function (req, res) {
   var ReceivingData = req.body;
   if (!ReceivingData.User || ReceivingData.User === '') {
      res.status(400).send({ Status: false, Message: "Patient Name can not be empty" });
   } else if (!ReceivingData.Hospital || ReceivingData.Hospital === '') {
      res.status(400).send({ Status: false, Message: "Patient Name can not be empty" });
   } else {
      Promise.all([
         PatientDetailsModel.PatientBasicDetailsSchema.findOne({}, {}, {'sort': {createdAt: -1} }).exec(),
         UserManagementModel.UserManagementSchema.findOne({_id: mongoose.Types.ObjectId(ReceivingData.User)}).populate({ path: 'Cluster' }).populate({ path: 'Location' }).exec()
      ]).then( PromiseRes => {
         var result = PromiseRes[0];
         var UsersDetails = PromiseRes[1];
         var LastPatientCode = result !== null ? (result.Patient_Code + 1) : 1;
         var Patient_Code = (LastPatientCode.toString()).padStart(4, 0);
       
         var Location_Code = (ReceivingData.Location_Code).toString().padStart(2, 0);
         var Cluster_Code = (ReceivingData.Cluster_Code).toString().padStart(2, 0);
         var Hospital_Code = (ReceivingData.Hospital_Code).toString().padStart(3, 0);
         var Patient_Unique = Location_Code + Cluster_Code + Hospital_Code + Patient_Code;
         var Patient_Unique_Identity = Location_Code +  '-' + Cluster_Code + '-' + Hospital_Code + '-' +  Patient_Code;
         var Temp_Patient_Unique = Patient_Unique_Identity;
         if (ReceivingData.Stemi_Confirmed === null || (ReceivingData.Stemi_Confirmed !== 'Yes' && ReceivingData.Stemi_Confirmed !== 'No')) {
            Patient_Unique = '';
            Patient_Unique_Identity = '';
         } else if (ReceivingData.Stemi_Confirmed === 'No') {
            Patient_Unique = '00000000000';
            Patient_Unique_Identity = '00-00-000-0000';
         }
         var Data_Type = 'Pre';
         if (UsersDetails.Cluster.Data_Type && UsersDetails.Cluster.Data_Type === 'Post') {
            if (UsersDetails.Cluster.Post_Date && UsersDetails.Cluster.Post_Date !== '') {
               Data_Type = new Date(ReceivingData.Hospital_Arrival_Date_Time).valueOf() <= new Date(UsersDetails.Cluster.Post_Date).valueOf() ? 'Post' : 'Pre';
            } else {
               Data_Type = 'Post';
            }
         }
         var NonCluster = ReceivingData.Patient_Admission_Type ===  "Non_Cluster_Spoke" || ReceivingData.Patient_Admission_Type ===  "Non_Cluster_NonSpoke" ? true : false;

         var ClusterAmbulance = null;
         if(ReceivingData.ClusterAmbulance && ReceivingData.ClusterAmbulance !== '' && ReceivingData.ClusterAmbulance !== null && ReceivingData.ClusterAmbulance ) {
            ClusterAmbulance = mongoose.Types.ObjectId(ReceivingData.ClusterAmbulance._id);
         }
			var ReferralFacility = null;
			if(ReceivingData.NonCluster_Hospital_Name && ReceivingData.NonCluster_Hospital_Name !== '' && ReceivingData.NonCluster_Hospital_Name !== null && ReceivingData.NonCluster_Hospital_Name ) {
				ReferralFacility = mongoose.Types.ObjectId(ReceivingData.NonCluster_Hospital_Name._id);
			}
         var ECG_Arr = [];
         if (ReceivingData.ECG_File && ReceivingData.ECG_File !== '') {
            ECG_Arr.push({
               "Name": new Date().valueOf() + '-' + 'Web-1',
               "ECG_File": ReceivingData.ECG_File,
               "DateTime": ReceivingData.ECG_Taken_date_time,
               "Hospital": mongoose.Types.ObjectId(ReceivingData.Hospital),
            });
         }

         var Clinical_Examination = {  Hospital: mongoose.Types.ObjectId(ReceivingData.Hospital) || null,
                                       Patient_Height: ReceivingData.Patient_Height || '',
                                       Patient_Weight: ReceivingData.Patient_Weight || '',
                                       BMI: ReceivingData.BMI || '',
                                       BP_Systolic: ReceivingData.BP_Systolic || '',
                                       BP_Diastolic: ReceivingData.BP_Diastolic || '',
                                       Heart_Rate: ReceivingData.Heart_Rate || '',
                                       SP_O2: ReceivingData.SP_O2 || '',
                                       Abdominal_Girth: ReceivingData.Abdominal_Girth || '',
                                       Kilip_Class: ReceivingData.Kilip_Class || null
                                    };
         const Create_PatientBasicDetails = new PatientDetailsModel.PatientBasicDetailsSchema({
            Patient_Code: Patient_Code || 1,
            Patient_Unique: Patient_Unique || '',
            Patient_Unique_Identity: Patient_Unique_Identity,
            Temp_Patient_Unique: Temp_Patient_Unique,
            Patient_Name: ReceivingData.Patient_Name || '',
            DateOfBirth: ReceivingData.DateOfBirth || '',
            Patient_Age: ReceivingData.Patient_Age || null,
            Patient_Gender: ReceivingData.Patient_Gender || '',
            Race: ReceivingData.Race || '',
            Race_Other: ReceivingData.Race_Other || '',
            Patient_PhoneNo: ReceivingData.Patient_PhoneNo || null,
            Patient_Address: ReceivingData.Patient_Address || '',
            Hospital_Id: ReceivingData.Hospital_Id || '',
            Telephone_Number: ReceivingData.Telephone_Number || '',
            Postal_Code: ReceivingData.Postal_Code || '',
            Income: ReceivingData.Income || '',
            consent_form: ReceivingData.consent_form || '',
            Patient_Payment: ReceivingData.Patient_Payment || '', 
            Symptom_Onset_Date_Time: ReceivingData.Symptom_Onset_Date_Time || '',
				First_Medical_Contact_Date_Time: ReceivingData.First_Medical_Contact_Date_Time || '',
            Initiated_Hospital: mongoose.Types.ObjectId(ReceivingData.Hospital) || null,
            Initiated_Hospital_Arrival: ReceivingData.Hospital_Arrival_Date_Time || null,
            EMS_Ambulance_Call_Date_Time: ReceivingData.EMS_Ambulance_Call_Date_Time || null,
            EMS_Ambulance_Departure_Date_Time: ReceivingData.EMS_Ambulance_Departure_Date_Time || null,

            Hospital_History: [{
               Hospital_Count: 1,
               Hospital: mongoose.Types.ObjectId(ReceivingData.Hospital) || null,
               Handled_User: mongoose.Types.ObjectId(ReceivingData.User) || null,
               Patient_Admission_Type: ReceivingData.Patient_Admission_Type || 'Direct',
               Hospital_Arrival_Date_Time: ReceivingData.Hospital_Arrival_Date_Time || null,
            }],

            If_NonCluster: NonCluster || false,
            NonCluster_Hospital_Name: ReferralFacility,
				NonCluster_Hospital_Name_NonSpoke: ReceivingData.NonCluster_Hospital_Name_NonSpoke || '',
            NonCluster_Hospital_Type: ReceivingData.NonCluster_Hospital_Type || '',
            NonCluster_Hospital_Address: ReceivingData.NonCluster_Hospital_Address || '',
            NonCluster_Hospital_Arrival_Date_Time: ReceivingData.NonCluster_Hospital_Arrival_Date_Time || null,
				NonCluster_TransportMode: ReceivingData.NonCluster_TransportMode || '',
            NonCluster_TransportMode_Other: ReceivingData.NonCluster_TransportMode_Other || '',
            NonCluster_Ambulance_Call_Date_Time: ReceivingData.NonCluster_Ambulance_Call_Date_Time || null,
            NonCluster_Ambulance_Arrival_Date_Time: ReceivingData.NonCluster_Ambulance_Arrival_Date_Time || null,
				NonCluster_Ambulance_Departure_Date_Time: ReceivingData.NonCluster_Ambulance_Departure_Date_Time || null,

            Transport_History: [{
               Transport_Count: 1,
               Transport_From_Hospital: null,
               Transport_To_Hospital: mongoose.Types.ObjectId(ReceivingData.Hospital) || null,
               TransportMode: ReceivingData.TransportMode || null,
               TransportMode_Other: ReceivingData.TransportMode_Other || '',
               ClusterAmbulance: ClusterAmbulance,
               Ambulance_Call_Date_Time: ReceivingData.Ambulance_Call_Date_Time || null,
               Ambulance_Arrival_Date_Time: ReceivingData.Ambulance_Arrival_Date_Time || null,
               Ambulance_Departure_Date_Time: ReceivingData.Ambulance_Departure_Date_Time || null,
            }],
            
            ECG_Taken_Type: ReceivingData.ECG_Taken_Type || null,
            ECG_File: ReceivingData.ECG_File || '',
            All_ECG_Files: ECG_Arr,
            ECG_Taken_date_time: ReceivingData.ECG_Taken_date_time || null,
            Stemi_Confirmed: ReceivingData.Stemi_Confirmed || null,
            Stemi_Confirmed_Date_Time: ReceivingData.Stemi_Confirmed_Date_Time || null,
            Stemi_Confirmed_Hospital: mongoose.Types.ObjectId(ReceivingData.Hospital) || null,
            Stemi_Confirmed_Type: 'Peripheral User',
            Stemi_Confirmed_By: mongoose.Types.ObjectId(ReceivingData.User) || null,
            Location_of_Infarction: ReceivingData.Location_of_Infarction || '',

            Post_Thrombolysis: ReceivingData.Post_Thrombolysis || null,
            "Post_Thrombolysis_Data.Thrombolytic_Agent" : ReceivingData.Thrombolytic_Agent || null,
            "Post_Thrombolysis_Data.Dosage" : ReceivingData.Dosage || '',
            "Post_Thrombolysis_Data.Dosage_Units" : ReceivingData.Dosage_Units || null,
            "Post_Thrombolysis_Data.Post_Thrombolysis_Start_Date_Time" : ReceivingData.Post_Thrombolysis_Start_Date_Time || null,
            "Post_Thrombolysis_Data.Post_Thrombolysis_End_Date_Time" : ReceivingData.Post_Thrombolysis_End_Date_Time || null,
            "Post_Thrombolysis_Data.Ninety_Min_ECG" : ReceivingData.Ninety_Min_ECG || null,
            "Post_Thrombolysis_Data.Ninety_Min_ECG_Date_Time" : ReceivingData.Ninety_Min_ECG_Date_Time || null,
            "Post_Thrombolysis_Data.Successful_Lysis" : ReceivingData.Successful_Lysis || null,
				"Post_Thrombolysis_Data.MissedSTEMI" : ReceivingData.MissedSTEMI || null,
            "Post_Thrombolysis_Data.Autoreperfused" : ReceivingData.Autoreperfused || null,
            "Post_Thrombolysis_Data.Others" : ReceivingData.Others || null,
            Clinical_Examination_History : [Clinical_Examination],
            QR_image: '' ,
            LastCompletion: 'Patient_Details',
            LastCompletionChild: 'Basic_Details',
            IfThrombolysis: null,
            ThrombolysisFrom: null,
            IfPCI: null,
            PCIFrom: null,
            IfDeath: null,
            IfDischarge: null,
            DidNotArrive: false,
            TransferBending: null,
            TransferBendingTo: null,
            DischargeTransferId: null,
            Data_Type: Data_Type,
            Active_Status: true,
            If_Deleted: false
         });

         Create_PatientBasicDetails.save(function (err, resultNew) {
            if (err) {
               res.status(417).send({ Status: false, Message: "Some error occurred while Creating the Patient QR Generate!.", Error: err });
            } else {
               res.status(200).send({ Status: true, Response: resultNew });
               var QRid = resultNew._id.toString() + '-Stemi';
               QRCode.toDataURL(QRid, function (err, url) {
                  var QrFile = url;
                  resultNew.QR_image = QrFile;
                  resultNew.save();
                });
            }
         });
      }).catch( err => {
         res.status(417).send({ Status: false, Message: "Some error occurred while Find the Location!.", Error: err });
      });
   }
};
// Patient Basic Details View---------------------------------------------------------
exports.PatientBasicDetails_View= function(req, res) {
   var ReceivingData = req.body;
   
   if (!ReceivingData.User || ReceivingData.User === '') {
      res.status(400).send({ Status: false, Message: "User Details is Required!" });
   } else if (!ReceivingData.PatientId || ReceivingData.PatientId === '') {
      res.status(400).send({ Status: false, Message: "Patient Detail not valid!" });
   } else {
		var FindQuery = { _id: mongoose.Types.ObjectId(ReceivingData.PatientId) };

		Promise.all([
			PatientDetailsModel.PatientBasicDetailsSchema.aggregate([
				{ $match: FindQuery},
				{ $project: {
					consent_form: {$cond: [ {$eq: [ "$consent_form", '']}, null, 'Available' ]},
					ECG_File: {$cond: [ {$eq: [ "$ECG_File", '']}, null, 'Available' ]}
				} }
			]).exec(),
			PatientDetailsModel.PatientBasicDetailsSchema.findOne(FindQuery, {consent_form: 0, ECG_File: 0, All_ECG_Files: 0, App_ECG_Files: 0, Ninety_Min_ECG_Files: 0 }, {})
				.populate({ path: 'NonCluster_Hospital_Name', select: ['Hospital_Name', 'Hospital_Type', 'Hospital_Address']})
				.populate({ path: 'Initiated_Hospital', select: ['Hospital_Name', 'Hospital_Role', 'Location', 'Country']})
				.populate({ path: 'Hospital_History.Hospital', select: ['Hospital_Name', 'Address', 'Hospital_Role', ]})
				.populate({ path: 'Transport_History.Transport_From_Hospital', select: ['Hospital_Name', 'Hospital_Role']})
				.populate({ path: 'Transport_History.Transport_To_Hospital', select: ['Hospital_Name', 'Hospital_Role']}) 
				.populate({ path: 'Transport_History.ClusterAmbulance', select: ['Hospital_Name', 'Hospital_Role', 'Address']})
				.populate({ path: 'Clinical_Examination_History.Hospital', select: ['Hospital_Name', 'Hospital_Role']})
				.populate({ path: 'Stemi_Confirmed_Hospital', select: ['Hospital_Name', 'Hospital_Role']})
				.populate({ path: 'Stemi_Confirmed_By', select: ['Name', 'User_Type']})
				.populate({ path: 'TransferBendingTo', select: ['Hospital_Name', 'Hospital_Role']})
				.populate({ path: 'DischargeTransferId', select: ['Discharge_Transfer_from_Hospital_Date_Time', 'Transport_Vehicle', 'Discharge_Cluster_Ambulance', 'Discharge_Ambulance_Call_Date_Time', 'Discharge_Ambulance_Arrival_Date_Time', 'Discharge_Ambulance_Departure_Date_Time'], populate: {path: 'Discharge_Cluster_Ambulance', select: ['Address', 'Hospital_Name', 'Hospital_Role'] }})
				.exec()
		]).then( response => {
			response = JSON.parse(JSON.stringify(response));
			const returnData = response[1];
			returnData.consent_form = response[0][0].consent_form;
			returnData.ECG_File = response[0][0].ECG_File;
			res.status(200).send({Status: true, Response: returnData });
		}).catch(error => {
			res.status(417).send({status: false, Message: "Some error occurred while Find The Patient Details!.", Error: error });
		});
   }
};
// Patient Basic Details Create ---------------------------------------------
exports.PatientBasicDetails_Update = function (req, res) {
   var ReceivingData = req.body;
   if (!ReceivingData.User || ReceivingData.User === '') {
      res.status(400).send({ Status: false, Message: "Patient Name can not be empty" });
   } else if (!ReceivingData.PatientId || ReceivingData.PatientId === '') {
      res.status(400).send({ Status: false, Message: "Patient Details can not be valid" });
   } else if (!ReceivingData.Hospital || ReceivingData.Hospital === '') {
      res.status(400).send({ Status: false, Message: "Hospital Details can not be valid" });
   } else {
      var Hospital = mongoose.Types.ObjectId(ReceivingData.Hospital);
      var User = mongoose.Types.ObjectId(ReceivingData.User);
      Promise.all([
         PatientDetailsModel.PatientBasicDetailsSchema.findOne({_id: mongoose.Types.ObjectId(ReceivingData.PatientId)}, {}, {}).exec(),
         UserManagementModel.UserManagementSchema.findOne({_id: User}, {}, {}).populate({ path: 'Cluster' }).exec(),
         PatientDetailsModel.PatientMedicationTransportationSchema.findOne({PatientId: mongoose.Types.ObjectId(ReceivingData.PatientId)}, {}, {}).exec(),
      ]).then( response => {
         var result = response[0];
         var UserDetails = response[1];
         var MedicationDetails = response[2];
         var MedicationResponse = null;
         if (MedicationDetails !== null) {
            MedicationResponse = Object.assign({}, JSON.parse(JSON.stringify(MedicationDetails)));
         }
         if (result === null){
            res.status(400).send({ Status: false, Message: "Invalid Patient Details!" });
         } else {
            if (result.Patient_Unique === '' && (ReceivingData.Stemi_Confirmed === 'Yes' || ReceivingData.Stemi_Confirmed === 'No')) {
               if (ReceivingData.Stemi_Confirmed === 'Yes') {
                  result.Patient_Unique =  result.Temp_Patient_Unique.replace(/-/g, '');
                  result.Patient_Unique_Identity =  result.Temp_Patient_Unique;
               } else {
                  result.Patient_Unique = '00000000000';
                  result.Patient_Unique_Identity = '00-00-000-0000';
               }
            }
            var ECG_Arr = result.All_ECG_Files;
            var AddOn = (ECG_Arr.length !== undefined && ECG_Arr.length !== 0) ? ECG_Arr.length + 1 : 1;

            var NonCluster = ReceivingData.Patient_Admission_Type ===  "Non_Cluster_Spoke" || ReceivingData.Patient_Admission_Type ===  "Non_Cluster_NonSpoke" ? true : false;
            var Hospital = mongoose.Types.ObjectId(ReceivingData.Hospital);
            var User = mongoose.Types.ObjectId(ReceivingData.User);

            result.Patient_Name = ReceivingData.Patient_Name || '';
            result.DateOfBirth = ReceivingData.DateOfBirth || '';
            result.Patient_Age = ReceivingData.Patient_Age || null;
            result.Patient_Gender = ReceivingData.Patient_Gender || '';
            result.Race = ReceivingData.Race || '';
            result.Race_Other = ReceivingData.Race_Other || '';
            result.Patient_PhoneNo = ReceivingData.Patient_PhoneNo || null;
            result.Patient_Address = ReceivingData.Patient_Address || '';
            result.Patient_Payment = ReceivingData.Patient_Payment || '';
            result.Hospital_Id = ReceivingData.Hospital_Id || '';
            result.Telephone_Number = ReceivingData.Telephone_Number || '';
            result.Postal_Code = ReceivingData.Postal_Code || '';
            result.Income = ReceivingData.Income || '';
            result.Symptom_Onset_Date_Time = ReceivingData.Symptom_Onset_Date_Time || '';
				result.First_Medical_Contact_Date_Time = ReceivingData.First_Medical_Contact_Date_Time || '';
            result.Initiated_Hospital_Arrival = ReceivingData.Hospital_Arrival_Date_Time || null;

            result.ECG_Taken_Type = ReceivingData.ECG_Taken_Type || null;
            result.ECG_File = ReceivingData.ECG_File || '';
            result.consent_form = ReceivingData.consent_form || '';
            result.ECG_Taken_date_time = ReceivingData.ECG_Taken_date_time || null;
            if (ReceivingData.Stemi_Confirmed !== undefined && ReceivingData.Stemi_Confirmed !== null && ReceivingData.Stemi_Confirmed !== '' && result.Stemi_Confirmed !== ReceivingData.Stemi_Confirmed) {
               var User_Type = UserDetails.User_Type === 'PU' ? 'Peripheral User' : UserDetails.User_Type === 'D' || UserDetails.User_Type === 'CDA'  ? 'Doctor' : UserDetails.User_Type === 'CO'  ? 'Co-Ordinator' : 'Admin';
               result.Stemi_Confirmed_By = User;
               result.Stemi_Confirmed_Type = User_Type;
            }
            result.Stemi_Confirmed = ReceivingData.Stemi_Confirmed || null;
            result.Stemi_Confirmed_Date_Time = ReceivingData.Stemi_Confirmed_Date_Time || null;
            result.Location_of_Infarction = ReceivingData.Location_of_Infarction || '';

            result.Post_Thrombolysis = ReceivingData.Post_Thrombolysis || null;
            result.Post_Thrombolysis_Data.Thrombolytic_Agent = ReceivingData.Thrombolytic_Agent || null;
            result.Post_Thrombolysis_Data.Dosage = ReceivingData.Dosage || '';
            result.Post_Thrombolysis_Data.Dosage_Units = ReceivingData.Dosage_Units || null;
            result.Post_Thrombolysis_Data.Post_Thrombolysis_Start_Date_Time = ReceivingData.Post_Thrombolysis_Start_Date_Time || null;
            result.Post_Thrombolysis_Data.Post_Thrombolysis_End_Date_Time = ReceivingData.Post_Thrombolysis_End_Date_Time || null;
            result.Post_Thrombolysis_Data.Ninety_Min_ECG = ReceivingData.Ninety_Min_ECG || null;
            result.Post_Thrombolysis_Data.Ninety_Min_ECG_Date_Time = ReceivingData.Ninety_Min_ECG_Date_Time || null;
            result.Post_Thrombolysis_Data.Successful_Lysis = ReceivingData.Successful_Lysis || null;
				result.Post_Thrombolysis_Data.MissedSTEMI = ReceivingData.MissedSTEMI || null;
				result.Post_Thrombolysis_Data.Autoreperfused = ReceivingData.Autoreperfused || null;
				result.Post_Thrombolysis_Data.Others = ReceivingData.Others || null;
            
            var ClusterAmbulance = null;
            if(ReceivingData.ClusterAmbulance && ReceivingData.ClusterAmbulance !== '' && ReceivingData.ClusterAmbulance !== null && ReceivingData.ClusterAmbulance ) {
               ClusterAmbulance = mongoose.Types.ObjectId(ReceivingData.ClusterAmbulance._id);
            }

				var ReferralFacility = null;
            if(ReceivingData.NonCluster_Hospital_Name && ReceivingData.NonCluster_Hospital_Name !== '' && ReceivingData.NonCluster_Hospital_Name !== null && ReceivingData.NonCluster_Hospital_Name ) {
               ReferralFacility = mongoose.Types.ObjectId(ReceivingData.NonCluster_Hospital_Name._id);
            }

            if ((result.TransferBending === undefined ||  result.TransferBending !== true) || (result.TransferBending && JSON.parse(JSON.stringify(result.Initiated_Hospital)) === JSON.parse(JSON.stringify(Hospital)) )) {

               if (ReceivingData.NewECG !== undefined && ReceivingData.NewECG && ReceivingData.ECG_File && ReceivingData.ECG_File !== '') {
                  ECG_Arr.push({
                     "Name": new Date().valueOf() + '-' + 'Web-' + AddOn,
                     "ECG_File": ReceivingData.ECG_File,
                     "DateTime": ReceivingData.ECG_Taken_date_time,
                     "Hospital": result.Initiated_Hospital,
                  });
               }
               if (result.Hospital_History.length === 1) {
                  var Data_Type = 'Pre';
                  if (UserDetails.Cluster !== null && UserDetails.Cluster.Data_Type && UserDetails.Cluster.Data_Type === 'Post') {
                     if (UserDetails.Cluster.Post_Date && UserDetails.Cluster.Post_Date !== '') {
                        Data_Type = new Date(ReceivingData.Hospital_Arrival_Date_Time).valueOf() <= new Date(UserDetails.Cluster.Post_Date).valueOf() ? 'Post' : 'Pre';
                     } else {
                        Data_Type = 'Post';
                     }
                  }
                  if (new Date(ReceivingData.Hospital_Arrival_Date_Time).valueOf() !== new Date(result.Initiated_Hospital_Arrival).valueOf()) {
                     result.Data_Type = Data_Type;
                  }
               }

               result.EMS_Ambulance_Call_Date_Time = ReceivingData.EMS_Ambulance_Call_Date_Time || null;
               result.EMS_Ambulance_Departure_Date_Time = ReceivingData.EMS_Ambulance_Departure_Date_Time || null;
               
               result.If_NonCluster = NonCluster || false;
               result.NonCluster_Hospital_Name = ReferralFacility;
					result.NonCluster_Hospital_Name_NonSpoke = ReceivingData.NonCluster_Hospital_Name_NonSpoke || '';
               result.NonCluster_Hospital_Type = ReceivingData.NonCluster_Hospital_Type || '';
               result.NonCluster_Hospital_Address = ReceivingData.NonCluster_Hospital_Address || '';
               result.NonCluster_Hospital_Arrival_Date_Time = ReceivingData.NonCluster_Hospital_Arrival_Date_Time || null;
					result.NonCluster_TransportMode = ReceivingData.NonCluster_TransportMode || '';
					result.NonCluster_TransportMode_Other = ReceivingData.NonCluster_TransportMode_Other || '';
					result.NonCluster_Ambulance_Call_Date_Time = ReceivingData.NonCluster_Ambulance_Call_Date_Time || null;
					result.NonCluster_Ambulance_Arrival_Date_Time = ReceivingData.NonCluster_Ambulance_Arrival_Date_Time || null;
					result.NonCluster_Ambulance_Departure_Date_Time = ReceivingData.NonCluster_Ambulance_Departure_Date_Time || null;

               result.Hospital_History[result.Hospital_History.length - 1].Patient_Admission_Type = ReceivingData.Patient_Admission_Type || 'Direct';
               result.Hospital_History[result.Hospital_History.length - 1].Hospital_Arrival_Date_Time = ReceivingData.Hospital_Arrival_Date_Time || null;

               result.Transport_History[result.Transport_History.length - 1].TransportMode = ReceivingData.TransportMode || null;
               result.Transport_History[result.Transport_History.length - 1].TransportMode_Other = ReceivingData.TransportMode_Other || '';
               result.Transport_History[result.Transport_History.length - 1].ClusterAmbulance = ClusterAmbulance;
               result.Transport_History[result.Transport_History.length - 1].Ambulance_Call_Date_Time = ReceivingData.Ambulance_Call_Date_Time || null;
               result.Transport_History[result.Transport_History.length - 1].Ambulance_Arrival_Date_Time = ReceivingData.Ambulance_Arrival_Date_Time || null;
               result.Transport_History[result.Transport_History.length - 1].Ambulance_Departure_Date_Time = ReceivingData.Ambulance_Departure_Date_Time || null;

               result.Clinical_Examination_History[result.Clinical_Examination_History.length - 1].Patient_Height = ReceivingData.Patient_Height || '';
               result.Clinical_Examination_History[result.Clinical_Examination_History.length - 1].Patient_Weight = ReceivingData.Patient_Weight || '';
               result.Clinical_Examination_History[result.Clinical_Examination_History.length - 1].BMI = ReceivingData.BMI || '';
               result.Clinical_Examination_History[result.Clinical_Examination_History.length - 1].BP_Systolic = ReceivingData.BP_Systolic || '';
               result.Clinical_Examination_History[result.Clinical_Examination_History.length - 1].BP_Diastolic = ReceivingData.BP_Diastolic || '';
               result.Clinical_Examination_History[result.Clinical_Examination_History.length - 1].Heart_Rate = ReceivingData.Heart_Rate || '';
               result.Clinical_Examination_History[result.Clinical_Examination_History.length - 1].SP_O2 = ReceivingData.SP_O2 || '';
               result.Clinical_Examination_History[result.Clinical_Examination_History.length - 1].Abdominal_Girth = ReceivingData.Abdominal_Girth || '';
               result.Clinical_Examination_History[result.Clinical_Examination_History.length - 1].Kilip_Class = ReceivingData.Kilip_Class || null;
            
               if (result.Hospital_History.length === 1 && ReceivingData.TransportMode === 'Others' && MedicationDetails !== null) {
                  MedicationDetails.deleteOne();
                  MedicationResponse = null;
               }
            } else {
               if (ReceivingData.NewECG !== undefined && ReceivingData.NewECG && ReceivingData.ECG_File && ReceivingData.ECG_File !== '') {
                  ECG_Arr.push({
                     "Name": new Date().valueOf() + '-' + 'Web-' + AddOn,
                     "ECG_File": ReceivingData.ECG_File,
                     "DateTime": ReceivingData.ECG_Taken_date_time,
                     "Hospital": mongoose.Types.ObjectId(ReceivingData.Hospital),
                  });
               }

               var NewHospital = {
                  Hospital_Count : result.Hospital_History[result.Hospital_History.length - 1].Hospital_Count + 1,
                  Hospital : Hospital || null,
                  Handled_User : User || null,
                  Patient_Admission_Type : result.Hospital_History[0].Patient_Admission_Type || 'Direct',
                  Hospital_Arrival_Date_Time : ReceivingData.Hospital_Arrival_Date_Time || null,
               };

               var Transport = {
                  Transport_Count: result.Transport_History[result.Transport_History.length - 1].Transport_Count + 1,
                  Transport_From_Hospital: result.Initiated_Hospital,
                  TransportMode : ReceivingData.TransportMode || null,
                  TransportMode_Other : ReceivingData.TransportMode_Other || null,
                  Transport_To_Hospital : Hospital || null, 
                  ClusterAmbulance: ClusterAmbulance,
                  Ambulance_Call_Date_Time : ReceivingData.Ambulance_Call_Date_Time || null,
                  Ambulance_Arrival_Date_Time : ReceivingData.Ambulance_Arrival_Date_Time || null,
                  Ambulance_Departure_Date_Time : ReceivingData.Ambulance_Departure_Date_Time || null
               };

               var ClinicalExamination = {
                  Hospital: Hospital || null,
                  Patient_Height : ReceivingData.Patient_Height || '',
                  Patient_Weight : ReceivingData.Patient_Weight || '',
                  BMI : ReceivingData.BMI || '',
                  BP_Systolic : ReceivingData.BP_Systolic || '',
                  BP_Diastolic : ReceivingData.BP_Diastolic || '',
                  Heart_Rate : ReceivingData.Heart_Rate || '',
                  SP_O2 : ReceivingData.SP_O2 || '',
                  Abdominal_Girth : ReceivingData.Abdominal_Girth || '',
                  Kilip_Class : ReceivingData.Kilip_Class || null,
               };
               const Pending =  result.Hospital_History.length > 1 ? false : null;
               PatientDetailsModel.PatientBasicDetailsSchema
               .updateOne(
                  {_id: result._id},
                  { $set: { Initiated_Hospital: Hospital,
                              TransferBending: Pending,
                              TransferBendingTo: null,
                              DischargeTransferId: null },
                  $push: { Hospital_History: NewHospital,
                     Transport_History: Transport,
                     Clinical_Examination_History: ClinicalExamination
                  } }).exec();
                  Promise.all([
                     NotificationModel.NotificationSchema.findOne({Confirmed_PatientId: result._id, TransferFrom: result.Initiated_Hospital, TransferTo: Hospital, If_Deleted: false}).exec(),
                     NotificationModel.NotificationSchema.findOne({Confirmed_PatientId: result._id, TransferFrom: result.Initiated_Hospital, If_Deleted: false}).exec(),
                  ]).then(response => {
                     const SameData = response[0];
                     const OldData = response[1];
                     if (SameData === null && OldData !== null) {
                        OldData.If_Deleted = true;
                        OldData.save();
                     }
                  }).catch(error_1 => { });
            }
            result.All_ECG_Files = ECG_Arr;
            result.save( function(errNew, resultNew) {
               if (errNew) {
                  res.status(417).send({ Status: false, Message: "Some error occurred while Update the Patient Basic Details!.", Error: errNew });
               } else {
                  PatientDetailsModel.PatientBasicDetailsSchema.findOne({_id: result._id}, {}, {})
                  .populate({ path: 'Initiated_Hospital', select: ['Hospital_Name', 'Hospital_Role', 'Location', 'Country']})
                  .populate({ path: 'Hospital_History.Hospital', select: ['Hospital_Name', 'Address', 'Hospital_Role']})
                  .populate({ path: 'Transport_History.Transport_From_Hospital', select: ['Hospital_Name', 'Hospital_Role']})
                  .populate({ path: 'Transport_History.Transport_To_Hospital', select: ['Hospital_Name', 'Hospital_Role']})
                  .populate({ path: 'Clinical_Examination_History.Hospital', select: ['Hospital_Name', 'Hospital_Role']})
                  .populate({ path: 'Stemi_Confirmed_Hospital', select: ['Hospital_Name', 'Hospital_Role']})
                  .populate({ path: 'Stemi_Confirmed_By', select: ['Name', 'User_Type']})
                  .populate({ path: 'TransferBendingTo', select: ['Hospital_Name', 'Hospital_Role']})
                  .populate({ path: 'DischargeTransferId', select: ['Transport_Vehicle', 'Discharge_Cluster_Ambulance', 'Discharge_Ambulance_Call_Date_Time', 'Discharge_Ambulance_Arrival_Date_Time', 'Discharge_Ambulance_Departure_Date_Time']})
                  .exec(function(err1, result1) {
                     if(err1) {
                        res.status(417).send({status: false, Message: "Some error occurred while Find The Patient Details!.", Error: err1 });
                     } else {
                        res.status(200).send({Status: true, Response: {Result: result1, Medication: MedicationResponse }  });
                     }
                  });
                  if (result.Transport_History.length > 1) {
                     let DisHospital = result.Transport_History[result.Transport_History.length - 1].Transport_From_Hospital;
                     DisHospital = DisHospital !== undefined && DisHospital !== null ? mongoose.Types.ObjectId(DisHospital) : null;
                     DischargeTransferModel.DischargeTransferSchema.updateOne(
                        { PatientId: result._id, Hospital: DisHospital},
                        { $set: {
                           "Discharge_Ambulance_Call_Date_Time": ReceivingData.Ambulance_Call_Date_Time,
                           "Discharge_Ambulance_Arrival_Date_Time": ReceivingData.Ambulance_Arrival_Date_Time,
                           "Discharge_Ambulance_Departure_Date_Time": ReceivingData.Ambulance_Departure_Date_Time,
                        }
                     }).exec( (err_2, result_2)  => {});
                  }
                  const LastCompletionChild = ReceivingData.LastActiveTab;
                  if (LastCompletionChild !== undefined && LastCompletionChild !== null && LastCompletionChild !== '') {
                     PatientDetailsModel.PatientBasicDetailsSchema.updateOne(
                        {_id: mongoose.Types.ObjectId(ReceivingData.PatientId), LastCompletionChild: 'Basic_Details'},
                        { $set: {LastCompletionChild: LastCompletionChild }}).exec();
                  }
                  // res.status(200).send({ Status: true, Response: resultNew });
               }
            });
         }
      }).catch(error => {
         console.log(error);
         res.status(417).send({ Status: false, Message: "Some error occurred while Find the Patient!.", Error: error });

      });
   }
};
// Patient NonCluster Update----------------------------------------------
exports.PatientNonCluster_Update = function(req, res){
   var ReceivingData = req.body;

   if(!ReceivingData.Patient || ReceivingData.Patient === null){
      res.status(400).send({ Status: false, Message: "Patient Detail not valid!" });
   } else {
		var ReferralFacility = null;
		if(ReceivingData.NonCluster_Hospital_Name && ReceivingData.NonCluster_Hospital_Name !== '' && ReceivingData.NonCluster_Hospital_Name !== null && ReceivingData.NonCluster_Hospital_Name ) {
			ReferralFacility = mongoose.Types.ObjectId(ReceivingData.NonCluster_Hospital_Name._id);
		}
      PatientDetailsModel.PatientBasicDetailsSchema
      .updateOne(
         {_id: mongoose.Types.ObjectId(ReceivingData.Patient)},
         {$set: {
            'NonCluster_Hospital_Name': ReferralFacility,
				'NonCluster_Hospital_Name_NonSpoke': ReceivingData.NonCluster_Hospital_Name_NonSpoke,
            'NonCluster_Hospital_Type': ReceivingData.NonCluster_Hospital_Type,
            'NonCluster_Hospital_Address': ReceivingData.NonCluster_Hospital_Address,
            'NonCluster_Hospital_Arrival_Date_Time': ReceivingData.NonCluster_Hospital_Arrival_Date_Time,
				'NonCluster_TransportMode': ReceivingData.NonCluster_TransportMode,
            'NonCluster_TransportMode_Other': ReceivingData.NonCluster_TransportMode_Other,
            'NonCluster_Ambulance_Call_Date_Time': ReceivingData.NonCluster_Ambulance_Call_Date_Time,
            'NonCluster_Ambulance_Arrival_Date_Time': ReceivingData.NonCluster_Ambulance_Arrival_Date_Time,
				'NonCluster_Ambulance_Departure_Date_Time': ReceivingData.NonCluster_Ambulance_Departure_Date_Time,
         }})
      .exec((err, result) => {
         if (err) {
            res.status(417).send({ Status: false, Message: "Some error occurred while update the NonCluster Details!.", Error: err });
         } else {
            res.status(200).send({Status: true, Response: result });
         }
      });
   }
};
// Patient Hospital Update----------------------------------------------
exports.PatientBasicHospital_Update = function(req, res){
   var ReceivingData = req.body;

   if(!ReceivingData._id || ReceivingData._id === null){
      res.status(400).send({ Status: false, Message: "Transport Details is Required!" });
   } else if(!ReceivingData.Patient || ReceivingData.Patient === null){
      res.status(400).send({ Status: false, Message: "Patient Detail not valid!" });
   } else {
      PatientDetailsModel.PatientBasicDetailsSchema
      .updateOne(
         {'Hospital_History._id': mongoose.Types.ObjectId(ReceivingData._id)},
         {$set: {
            'Hospital_History.$.Hospital_Arrival_Date_Time': ReceivingData.Hospital_Arrival_Date_Time,
         }})
      .exec((err, result) => {
         if (err) {
            res.status(417).send({ Status: false, Message: "Some error occurred while update the Hospital Details!.", Error: err });
         } else {
            res.status(200).send({Status: true, Response: result });
         }
      });
   }
};
// Patient Transport Update----------------------------------------------
exports.PatientBasicTransport_Update = function(req, res){
   var ReceivingData = req.body;

   if(!ReceivingData._id || ReceivingData._id === null){
      res.status(400).send({ Status: false, Message: "Transport Details is Required!" });
   } else if(!ReceivingData.Patient || ReceivingData.Patient === null){
      res.status(400).send({ Status: false, Message: "Patient Detail not valid!" });
   } else {
      var ClusterAmbulance = null;
      if(ReceivingData.ClusterAmbulance && ReceivingData.ClusterAmbulance !== '' && ReceivingData.ClusterAmbulance !== null ) {
         ClusterAmbulance = mongoose.Types.ObjectId(ReceivingData.ClusterAmbulance._id);
      }
      PatientDetailsModel.PatientBasicDetailsSchema.findOne({_id: mongoose.Types.ObjectId(ReceivingData.Patient)}, {}, {})
      .exec( (error, response) => {
         if (error) {
            res.status(417).send({ Status: false, Message: "Some error occurred while find the Patient Details!.", Error: err });
         } else {
            PatientDetailsModel.PatientBasicDetailsSchema
            .updateOne(
               {'Transport_History._id': mongoose.Types.ObjectId(ReceivingData._id)},
               {$set: {
                  'Transport_History.$.TransportMode': ReceivingData.TransportMode,
                  'Transport_History.$.ClusterAmbulance': ClusterAmbulance,
                  'Transport_History.$.Ambulance_Call_Date_Time': ReceivingData.Ambulance_Call_Date_Time,
                  'Transport_History.$.Ambulance_Arrival_Date_Time': ReceivingData.Ambulance_Arrival_Date_Time,
                  'Transport_History.$.Ambulance_Departure_Date_Time': ReceivingData.Ambulance_Departure_Date_Time
               }})
            .exec((err, result) => {
               if (err) {
                  res.status(417).send({ Status: false, Message: "Some error occurred while update the Transport Details!.", Error: err });
               } else {
                  response = JSON.parse(JSON.stringify(response));
                  const Transport = response.Transport_History;
                  const Idx = Transport.findIndex(obj => obj._id === JSON.parse(JSON.stringify(ReceivingData._id)) );
                  const Hospital = Transport[Idx].Transport_From_Hospital !== undefined &&Transport[Idx].Transport_From_Hospital !== null ?  mongoose.Types.ObjectId(Transport[Idx].Transport_From_Hospital) : null;
                  DischargeTransferModel.DischargeTransferSchema.updateOne(
                     { PatientId: mongoose.Types.ObjectId(ReceivingData.Patient), Hospital: Hospital},
                     { $set: {
                        "Discharge_Ambulance_Call_Date_Time": ReceivingData.Ambulance_Call_Date_Time,
                        "Discharge_Ambulance_Arrival_Date_Time": ReceivingData.Ambulance_Arrival_Date_Time,
                        "Discharge_Ambulance_Departure_Date_Time": ReceivingData.Ambulance_Departure_Date_Time,
                     }
                  }).exec( (err_2, result_2)  => {
                     if (err_2) {
                        res.status(417).send({ Status: false, Message: "Some error occurred while update the Patient Transfer Details!.", Error: errNew });
                     } else {
                        res.status(200).send({ Status: true, Response: result });
                     }
                  });
               }
            });
         }
      });
   }
};
// Patient Clinical Update----------------------------------------------
exports.PatientClinical_Update = function(req, res){
   var ReceivingData = req.body;

   if(!ReceivingData._id || ReceivingData._id === null){
      res.status(400).send({ Status: false, Message: "Transport Details is Required!" });
   } else if(!ReceivingData.Patient || ReceivingData.Patient === null){
      res.status(400).send({ Status: false, Message: "Patient Detail not valid!" });
   } else {
      PatientDetailsModel.PatientBasicDetailsSchema
      .updateOne(
         {'Clinical_Examination_History._id': mongoose.Types.ObjectId(ReceivingData._id)},
         {$set: {
            'Clinical_Examination_History.$.Patient_Height': ReceivingData.Patient_Height,
            'Clinical_Examination_History.$.Patient_Weight': ReceivingData.Patient_Weight,
            'Clinical_Examination_History.$.BMI': ReceivingData.BMI,
            'Clinical_Examination_History.$.BP_Systolic': ReceivingData.BP_Systolic,
            'Clinical_Examination_History.$.BP_Diastolic': ReceivingData.BP_Diastolic,
            'Clinical_Examination_History.$.Heart_Rate': ReceivingData.Heart_Rate,
            'Clinical_Examination_History.$.SP_O2': ReceivingData.SP_O2,
            'Clinical_Examination_History.$.Abdominal_Girth': ReceivingData.Abdominal_Girth,
            'Clinical_Examination_History.$.Kilip_Class': ReceivingData.Kilip_Class
         }})
      .exec((err, result) => {
         if (err) {
            res.status(417).send({ Status: false, Message: "Some error occurred while update the Transport Details!.", Error: err });
         } else {
            res.status(200).send({Status: true, Response: result });
         }
      });
   }
};

// Patient DidNotArrive Update----------------------------------------------
exports.PatientDidNotArrive_Update = function(req, res){
   var ReceivingData = req.body;

   if(!ReceivingData.Patient || ReceivingData.Patient === null){
      res.status(400).send({ Status: false, Message: "Patient Detail not valid!" });
   } else {
      ReceivingData.Patient = mongoose.Types.ObjectId(ReceivingData.Patient);
      PatientDetailsModel.PatientBasicDetailsSchema.findOne({_id: ReceivingData.Patient}, {}, {}).exec( (err, result) => {
         if (err) {
            res.status(417).send({ Status: false, Message: "Some error occurred while find the patient!.", Error: err });
         } else {
            Promise.all([
               PatientDetailsModel.PatientBasicDetailsSchema.updateOne(
                  {'_id': mongoose.Types.ObjectId(ReceivingData.Patient)},
                  { $set: { DidNotArrive: true, TransferBending: null, TransferBendingTo: null }}).exec(),
               NotificationModel.NotificationSchema.updateMany(
                  {Confirmed_PatientId: result._id, Notification_Type: 'STEMI_Patient_Transfer', TransferFrom: result.Initiated_Hospital, If_Deleted: false},
                  { $set: { If_Deleted: true }}).exec()
            ]).then(response => {
               res.status(200).send({Status: true, Message: 'Did Not Arrive Successfully Updated' });
            }).catch( error => {
               res.status(417).send({ Status: false, Message: "Some error occurred while update the Did Not Arrive!.", Error: error });
            });
         }
      });
   }
};
// Patient Delete----------------------------------------------
exports.Patient_Delete = function(req, res){
   var ReceivingData = req.body;

   if(!ReceivingData.Patient || ReceivingData.Patient === null){
      res.status(400).send({ Status: false, Message: "Patient Detail not valid!" });
   } else {
      const PatientId = mongoose.Types.ObjectId(ReceivingData.Patient);
      Promise.all([
         PatientDetailsModel.PatientBasicDetailsSchema.updateOne( { _id: PatientId }, { $set: { Active_Status: false, If_Deleted: true}}).exec(),
         PatientDetailsModel.PatientFibrinolyticChecklistSchema.updateOne( { PatientId: PatientId }, { $set: { Active_Status: false, If_Deleted: true}}).exec(),
         PatientDetailsModel.PatientMedicationTransportationSchema.updateOne( { PatientId: PatientId }, { $set: { Active_Status: false, If_Deleted: true}}).exec(),
         PatientDetailsModel.PatientCardiacHistorySchema.updateOne( { PatientId: PatientId }, { $set: { Active_Status: false, If_Deleted: true}}).exec(),
         PatientDetailsModel.PatientCoMorbidConditionSchema.updateOne( { PatientId: PatientId }, { $set: { Active_Status: false, If_Deleted: true}}).exec(),
         PatientDetailsModel.PatientContactDetailsSchema.updateOne( { PatientId: PatientId }, { $set: { Active_Status: false, If_Deleted: true}}).exec(),
         ThrombolysisModel.ThrombolysisMedicationSchema.updateOne( { PatientId: PatientId }, { $set: { Active_Status: false, If_Deleted: true}}).exec(),
         ThrombolysisModel.ThrombolysisSchema.updateOne( { PatientId: PatientId }, { $set: { Active_Status: false, If_Deleted: true}}).exec(),
         PciModel.PCIDrugBeforePciSchema.updateOne( { PatientId: PatientId }, { $set: { Active_Status: false, If_Deleted: true}}).exec(),
         PciModel.PciSchema.updateOne( { PatientId: PatientId }, { $set: { Active_Status: false, If_Deleted: true}}).exec(),
         PciModel.PciMedicationInCathSchema.updateOne( { PatientId: PatientId }, { $set: { Active_Status: false, If_Deleted: true}}).exec(),
         HospitalSummaryModel.HospitalSummaryLabReportSchema.updateOne( { PatientId: PatientId }, { $set: { Active_Status: false, If_Deleted: true}}).exec(),
         HospitalSummaryModel.HospitalSummaryMedicationInHospitalSchema.updateOne( { PatientId: PatientId }, { $set: { Active_Status: false, If_Deleted: true}}).exec(),
         HospitalSummaryModel.HospitalSummaryAdverseEventsSchema.updateOne( { PatientId: PatientId }, { $set: { Active_Status: false, If_Deleted: true}}).exec(),
         DischargeTransferModel.DischargeTransferDeathSchema.updateOne( { PatientId: PatientId }, { $set: { Active_Status: false, If_Deleted: true}}).exec(),
         DischargeTransferModel.DischargeTransferMedicationsSchema.updateOne( { PatientId: PatientId }, { $set: { Active_Status: false, If_Deleted: true}}).exec(),
         DischargeTransferModel.DischargeTransferSchema.updateOne( { PatientId: PatientId }, { $set: { Active_Status: false, If_Deleted: true}}).exec(),
         FollowUpModel.FollowUpDetailsSchema.updateOne( { PatientId: PatientId }, { $set: { Active_Status: false, If_Deleted: true}}).exec(),
         FollowUpModel.FollowUpMedicationsSchema.updateOne( { PatientId: PatientId }, { $set: { Active_Status: false, If_Deleted: true}}).exec(),
         FollowUpModel.FollowUpEventsSchema.updateOne( { PatientId: PatientId }, { $set: { Active_Status: false, If_Deleted: true}}).exec()
      ]).then(response => {
         res.status(200).send({Status: true, Message: 'Patient Report Successfully Deleted' });
      }).catch(error => {
         res.status(417).send({ Status: false, Message: "Some error occurred while delete the Patient!.", Error: error });
      });
   }
};


// Print Patient Details View 
exports.PatientPrintDetails_View = function (req, res) {
   var ReceivingData = req.body;
   if (!ReceivingData.PatientId || ReceivingData.PatientId === '') {
      res.status(400).send({ Status: false, Message: "Patient Detail not valid!" });
   } else {
      Promise.all([
         PatientDetailsModel.PatientBasicDetailsSchema.findOne({ _id: mongoose.Types.ObjectId(ReceivingData.PatientId) }, {}, {})
            .populate({ path: 'Initiated_Hospital', select: ['Hospital_Name', 'Hospital_Role'] })
				.populate({ path: 'NonCluster_Hospital_Name', select: ['Hospital_Name', 'Hospital_Type', 'Hospital_Address']})
            .populate({ path: 'Hospital_History.Hospital', select: ['Hospital_Name', 'Address', 'Hospital_Role'] })
            .populate({ path: 'Transport_History.Transport_From_Hospital', select: ['Hospital_Name', 'Hospital_Role'] })
            .populate({ path: 'Transport_History.Transport_To_Hospital', select: ['Hospital_Name', 'Hospital_Role'] })
            .populate({ path: 'Clinical_Examination_History.Hospital', select: ['Hospital_Name', 'Hospital_Role'] })
            .populate({ path: 'Stemi_Confirmed_Hospital', select: ['Hospital_Name', 'Hospital_Role'] }).exec(),
         PatientDetailsModel.PatientFibrinolyticChecklistSchema.find({ PatientId: mongoose.Types.ObjectId(ReceivingData.PatientId) }, {}, {})
         .populate({ path: 'Hospital', select: ['Hospital_Name', 'Hospital_Role'] }).exec(),
         PatientDetailsModel.PatientMedicationTransportationSchema.findOne({ PatientId: mongoose.Types.ObjectId(ReceivingData.PatientId) }, {}, {})
         .populate({ path: 'Hospital', select: ['Hospital_Name', 'Hospital_Role'] }).exec(),
         PatientDetailsModel.PatientCardiacHistorySchema.findOne({ PatientId: mongoose.Types.ObjectId(ReceivingData.PatientId) }, {}, {})
         .populate({ path: 'Hospital', select: ['Hospital_Name', 'Hospital_Role'] }).exec(),
         PatientDetailsModel.PatientCoMorbidConditionSchema.findOne({ PatientId: mongoose.Types.ObjectId(ReceivingData.PatientId) }, {}, {})
         .populate({ path: 'Hospital', select: ['Hospital_Name', 'Hospital_Role'] }).exec(),
         PatientDetailsModel.PatientContactDetailsSchema.findOne({ PatientId: mongoose.Types.ObjectId(ReceivingData.PatientId) }, {}, {})
         .populate({ path: 'Hospital', select: ['Hospital_Name', 'Hospital_Role'] }).exec(),

         // Thrombolysis List
         ThrombolysisModel.ThrombolysisMedicationSchema.findOne({ PatientId: mongoose.Types.ObjectId(ReceivingData.PatientId) }, {}, {})
         .populate({ path: 'Hospital', select: ['Hospital_Name', 'Hospital_Role'] }).exec(),
         ThrombolysisModel.ThrombolysisSchema.findOne({ PatientId: mongoose.Types.ObjectId(ReceivingData.PatientId) }, {}, {})
         .populate({ path: 'Hospital', select: ['Hospital_Name', 'Hospital_Role'] }).exec(),


         // PCI List 
         PciModel.PCIDrugBeforePciSchema.findOne({ PatientId: mongoose.Types.ObjectId(ReceivingData.PatientId) }, {}, {})
         .populate({ path: 'Hospital', select: ['Hospital_Name', 'Hospital_Role'] }).exec(),

         PciModel.PciSchema.findOne({ PatientId: mongoose.Types.ObjectId(ReceivingData.PatientId) }, {}, {})
         .populate({ path: 'Hospital', select: ['Hospital_Name', 'Hospital_Role'] }).exec(),

         PciModel.PciMedicationInCathSchema.findOne({ PatientId: mongoose.Types.ObjectId(ReceivingData.PatientId) }, {}, {})
         .populate({ path: 'Hospital', select: ['Hospital_Name', 'Hospital_Role'] }).exec(),

         // In Hospital Summary List
         HospitalSummaryModel.HospitalSummaryLabReportSchema.find({ PatientId: mongoose.Types.ObjectId(ReceivingData.PatientId) }, {}, {})
         .populate({ path: 'Hospital', select: ['Hospital_Name', 'Hospital_Role'] }).exec(),
         HospitalSummaryModel.HospitalSummaryMedicationInHospitalSchema.find({ PatientId: mongoose.Types.ObjectId(ReceivingData.PatientId) }, {}, {})
         .populate({ path: 'Hospital', select: ['Hospital_Name', 'Hospital_Role'] }).exec(),
         HospitalSummaryModel.HospitalSummaryAdverseEventsSchema.find({ PatientId: mongoose.Types.ObjectId(ReceivingData.PatientId) }, {}, {})
         .populate({ path: 'Hospital', select: ['Hospital_Name', 'Hospital_Role'] }).exec(),


         // Discharge List
         DischargeTransferModel.DischargeTransferDeathSchema.find({ PatientId: mongoose.Types.ObjectId(ReceivingData.PatientId) }, {}, {})
         .populate({ path: 'Hospital', select: ['Hospital_Name', 'Hospital_Role'] }).exec(),

         DischargeTransferModel.DischargeTransferMedicationsSchema.find({ PatientId: mongoose.Types.ObjectId(ReceivingData.PatientId) }, {}, {})
         .populate({ path: 'Hospital', select: ['Hospital_Name', 'Hospital_Role'] }).exec(),
           
         // DischargeTransferModel.DischargeTransferSchema.find({ PatientId: mongoose.Types.ObjectId(ReceivingData.PatientId) }, {}, {}).exec(),
         DischargeTransferModel.DischargeTransferSchema.find({ PatientId: mongoose.Types.ObjectId(ReceivingData.PatientId) }, {}, {})
         .populate({ path: 'Initiated_Hospital', select: ['Hospital_Name', 'Hospital_Role'] })
         .populate({ path: 'Transfer_to_Stemi_Cluster_Hospital_Name', select: ['Hospital_Name', 'Hospital_Role', 'Address'] })

         .populate({ path: 'Hospital', select: ['Hospital_Name', 'Hospital_Role'] })
         .populate({ path: 'Hospital_History.Hospital', select: ['Hospital_Name', 'Address', 'Hospital_Role'] })
         .populate({ path: 'Transport_History.Transport_From_Hospital', select: ['Hospital_Name', 'Hospital_Role'] })
         .populate({ path: 'Transport_History.Transport_To_Hospital', select: ['Hospital_Name', 'Hospital_Role'] })
         .populate({ path: 'Clinical_Examination_History.Hospital', select: ['Hospital_Name', 'Hospital_Role'] })
         .populate({ path: 'Stemi_Confirmed_Hospital', select: ['Hospital_Name', 'Hospital_Role'] }).exec(),
         // Followup List
         FollowUpModel.FollowUpDetailsSchema.find({ PatientId: mongoose.Types.ObjectId(ReceivingData.PatientId) }, {}, {})
         .populate({ path: 'Name_Of_The_Stemi_Follow_Up_Cluster', select: ['Cluster_Name', 'Cluster_Type'] })
         .populate({ path: 'Name_Of_The_Stemi_Follow_Up_Hospital', select: ['Hospital_Name', 'Hospital_Role', 'Address'] }).exec(),

         FollowUpModel.FollowUpMedicationsSchema.find({ PatientId: mongoose.Types.ObjectId(ReceivingData.PatientId) }, {}, {})
         .populate({ path: 'Hospital', select: ['Hospital_Name', 'Hospital_Role'] }).exec(),
         FollowUpModel.FollowUpEventsSchema.find({ PatientId: mongoose.Types.ObjectId(ReceivingData.PatientId) }, {}, {})
         .populate({ path: 'Hospital', select: ['Hospital_Name', 'Hospital_Role'] }).exec()
      ]).then(result => {
         const ResponseNew = {
            Basic: result[0],
            FibrinolyticChecklist: result[1],
            MedicationTransportation: result[2],
            CardiacHistory: result[3],
            CoMorbidCondition: result[4],
            ContactDetails: result[5],
            ThrombolysisMedication: result[6],
            Thrombolysis: result[7],
            PCIDrugBeforePci: result[8], 
            Pci: result[9],
            LabReport: result[10],
            PciMedicationInCath: result[11],
            MedicationInHospital: result[12],
            AdverseEvents: result[13],
            TransferDeath: result[14],
            TransferMedications: result[15],
            Transfer: result[16],
            FollowUpDetails: result[17],
            FollowUpMedications: result[18],
            FollowUpEvents: result[19]
         };         
         res.status(200).send({ Status: true, Response: ResponseNew });
      }).catch(errNew => {
         res.status(417).send({ Status: false, ErrorCode: 417, ErrorMessage: "Some error occurred while Find The Patients list!." });
      });
   }
};


// PU User Single Cluster Based Patients
exports.SingleClusterBased_Patients = function(req, res) {
  var ReceivingData = req.body;
  if (!ReceivingData.User || ReceivingData.User === '') {
      res.status(400).send({ Status: false, Message: "User Details is Required!" });
   } else if (!ReceivingData.User_Type || ReceivingData.User_Type !== 'PU') {
      res.status(400).send({ Status: false, Message: "User Rights is not Proper!" });
   } else if (!ReceivingData.Cluster || typeof ReceivingData.Cluster !== 'object' || ReceivingData.Cluster === null ) {
      res.status(400).send({ Status: false, Message: "Cluster Details not valid!" });
   } else {
      var ClusterId = mongoose.Types.ObjectId(ReceivingData.Cluster._id);
      ClusterModel.ClusterMappingSchema.find( {'Cluster': ClusterId }, {}, {}) 
      .exec(function(err, result) {
         if(err) {
            res.status(417).send({status: false, Message: "Some error occurred while Find The Cluster Details!.", Error: err });
      } else {

         const HospitalResult = result.map(obj => obj.ClusterHospital);
         const HospitalArr = HospitalResult.filter((element, index, thisArg) => thisArg.indexOf(element) === index);

         const Skip_Count = parseInt(ReceivingData.Skip_Count, 0) || 0;
         const Limit_Count = parseInt(ReceivingData.Limit_Count, 0) || 5;
      
         var ShortOrder = {createdAt: -1};
         var ShortKey = ReceivingData.ShortKey;
         var ShortCondition = ReceivingData.ShortCondition;
         if ( ShortKey && ShortKey !== null && ShortKey !== '' && ShortCondition && ShortCondition !== null && ShortCondition !== ''){           
            ShortOrder = {};
            ShortOrder[ShortKey] = ShortCondition === 'Ascending' ? 1 : -1 ;
         }

         var FindQuery = { 'If_Deleted': false };
         var SecondLevelFindQuery = { };

         FindQuery['$or']  = [{ 'Initiated_Hospital': { $in: HospitalArr }}, {'TransferBendingTo': { $in: HospitalArr }}, {'Hospital_History.Hospital': { $in: HospitalArr } }];

         if (ReceivingData.FilterQuery && typeof ReceivingData.FilterQuery === 'object' && ReceivingData.FilterQuery !== null && ReceivingData.FilterQuery.length > 0) {
            ReceivingData.FilterQuery.map(obj => {
               if (obj.Type === 'String') {
                  FindQuery[obj.DBName] = { $regex : new RegExp(".*" + obj.Value + ".*", "i") };
               }
               if (obj.Type === 'Select') {
                  if (obj.DBName == 'PatientStatus') {
                     SecondLevelFindQuery[obj.DBName] = obj.Value;
                  } else {
                     FindQuery[obj.DBName] = obj.Value;
                  }
               }
               if (obj.Type === 'Date') {
                  if (FindQuery[obj.DBName] === undefined) {
                     FindQuery[obj.DBName] = obj.Option === 'LTE' ? {$lt:new Date(new Date(obj.Value).setDate(new Date(obj.Value).getDate() + 1))} : obj.Option === 'GTE' ? {$gte: new Date(obj.Value)} : new Date(obj.Value);
                  } else {
                     const DBName = obj.DBName;
                     const AndQuery = obj.Option === 'LTE' ? {$lt:new Date(new Date(obj.Value).setDate(new Date(obj.Value).getDate() + 1))} : obj.Option === 'GTE' ? {$gte: new Date(obj.Value)} :new Date(obj.Value);
                     FindQuery['$and'] = [{[DBName]: FindQuery[obj.DBName] }, {[DBName]: AndQuery}];
                  }
               }
               if (obj.Type === 'Object') {
                  FindQuery[obj.DBName] = mongoose.Types.ObjectId(obj.Value._id);
               }
            });
         } 

         Promise.all([
            PatientDetailsModel.PatientBasicDetailsSchema
            .aggregate([
               { $match: FindQuery},
               { $lookup: {
                  from: "Stemi_Hospital_Management",
                  let: { "hospital": "$Initiated_Hospital"},
                  pipeline: [
                     { $match: { $expr: { $eq: ["$$hospital", "$_id"] } } },
                     { $project: { "Hospital_Name": 1, "Hospital_Code": 1, "Hospital_Role": 1, "Connected_Clusters": 1 }}
                  ],
                  as: 'Initiated_Hospital' } },
               { $unwind: { path: "$Initiated_Hospital",  preserveNullAndEmptyArrays: true } },
               { $lookup: {
                  from: "Discharge_Transfer",
                  let: { "transfer": "$DischargeTransferId"},
                  pipeline: [
                     { $match: { $expr: { $eq: ["$$transfer", "$_id"] } } },
                     { $project: { "Discharge_Transfer_from_Hospital_Date_Time": 1 }}
                  ],
                  as: 'TransferInfo' } },
               { $unwind: { path: "$TransferInfo",  preserveNullAndEmptyArrays: true } },
               { $addFields: { Initiated_Hospital: { $ifNull: [ "$Initiated_Hospital", null ] }  } },
               { $addFields: { HospitalSort: { $ifNull: [ "$Initiated_Hospital.Hospital_Name", null ] }  } },
               { $addFields: { PatientNameSort: { $ifNull: [ "$Patient_Name", null ] }  } },

               { $addFields: { HospitalSort: { $toLower: "$HospitalSort" } } },
               { $addFields: { PatientNameSort: { $toLower: "$PatientNameSort" } } },
               { $lookup: {
                  from: "Discharge_Transfer",
                  let: { "patient": "$_id"},
                  pipeline: [
                     { $match: { $expr: { $eq: ["$$patient", "$PatientId"] } } },
                     { $project: { "Hospital": 1, "Discharge_Transfer_To": 1, "Active_Status": 1, "Transfer_to_Stemi_Cluster_Hospital_Name": 1 }}
                  ],
                  as: 'Discharge_Details' } },
               { $addFields: { HospitalIds: { $map: { input: "$Hospital_History", as: "history", in: "$$history.Hospital" } } }},
               { $addFields: {
                  PatientStatus: {
                     $cond: {
                        if: {$or:[ {$eq: [ "$IfDeath", true ]}, {$eq: [ "$IfDischarge", true ]}, {$eq: [ "$DidNotArrive", true ]} ]},
                        then:'Closed',
                        else: {
                           $cond: {
                              if: {$and:[ {$eq: [ "$TransferBending", true ]}, {$not: [ {$in: [ ReceivingData.Hospital, "$HospitalIds"  ]} ] } ]},
                              then:'Un-Attended',
                              else: 'Pending'
                              }
                           }
                        }
                     }
                  }
               },
               { $match: SecondLevelFindQuery},
               { $project: { PatientStatus: 1, PatientNameSort: 1, HospitalSort: 1, Patient_Name: 1, Patient_Unique: 1, Stemi_Confirmed: 1, Initiated_Hospital: 1, Initiated_Hospital_Arrival: 1, 
                  Hospital_History: 1, DidNotArrive: 1, TransferInfo: 1, LastCompletion: 1, LastCompletionChild: 1, Discharge_Details: 1, Active_Status: 1, If_Deleted: 1, createdAt: 1 } },
               { $sort : ShortOrder },
               { $skip : Skip_Count },
               { $limit : Limit_Count }
            ]).exec(),
            PatientDetailsModel.PatientBasicDetailsSchema
            .aggregate([
               { $match: FindQuery},
               { $addFields: { HospitalIds: { $map: { input: "$Hospital_History", as: "history", in: "$$history.Hospital" } } }},
               { $addFields: {
                  PatientStatus: {
                     $cond: {
                        if: {$or:[ {$eq: [ "$IfDeath", true ]}, {$eq: [ "$IfDischarge", true ]}, {$eq: [ "$DidNotArrive", true ]} ]},
                        then:'Closed',
                        else: {
                           $cond: {
                              if: {$and:[ {$eq: [ "$TransferBending", true ]}, {$not: [ {$in: [ ReceivingData.Hospital, "$HospitalIds"  ]} ] } ]},
                              then:'Un-Attended',
                              else: 'Pending'
                              }
                           }
                        }
                     }
                  }
               },
               { $match: SecondLevelFindQuery},
               { $project: {PatientStatus: 1} }
            ]).exec()
         ]).then(resultNew => {
            res.status(200).send({Status: true, Response: resultNew[0], SubResponse: resultNew[1].length });
         }).catch(errNew => {
            // console.log(errNew);
            res.status(417).send({Status: false, ErrorCode: 417, ErrorMessage: "Some error occurred while Find The Patients list!."});
         });
      }
         
      });
      }
};
// PU User Advanced Cluster Based Patients
exports.AdvancedClusterBased_Patients = function(req, res) {
   var ReceivingData = req.body;
   if (!ReceivingData.User || ReceivingData.User === '') {
      res.status(400).send({ Status: false, Message: "User Details is Required!" });
   } else if (!ReceivingData.Cluster || typeof ReceivingData.Cluster !== 'object' || ReceivingData.Cluster === null ) { 
      res.status(400).send({ Status: false, Message: "Cluster Detail not valid!" });
   } else {
      var ClusterId = mongoose.Types.ObjectId(ReceivingData.Cluster._id);
      ClusterModel.ClusterMappingSchema.find( {'Cluster': ClusterId }, {}, {})
      .exec(function(err, result) {
         if(err) {
            res.status(417).send({status: false, Message: "Some error occurred while Find The Cluster Details!.", Error: err });
         } else {
            const HospitalResult = result.map(obj => obj.ClusterHospital);
            const HospitalArr = HospitalResult.filter((element, index, thisArg) => thisArg.indexOf(element) === index);

            const Skip_Count = parseInt(ReceivingData.Skip_Count, 0) || 0;
            const Limit_Count = parseInt(ReceivingData.Limit_Count, 0) || 5;
         
            var ShortOrder = {createdAt: -1};
            var ShortKey = ReceivingData.ShortKey;
            var ShortCondition = ReceivingData.ShortCondition;
            if ( ShortKey && ShortKey !== null && ShortKey !== '' && ShortCondition && ShortCondition !== null && ShortCondition !== ''){           
               ShortOrder = {};
               ShortOrder[ShortKey] = ShortCondition === 'Ascending' ? 1 : -1 ;
            }
            var FindQuery = { 'If_Deleted': false };
            FindQuery['$or']  = [{ 'Initiated_Hospital': { $in: HospitalArr }}, {'TransferBendingTo': { $in: HospitalArr }}, {'Hospital_History.Hospital': { $in: HospitalArr } }];
            var SecondLevelFindQuery = { };

            if (ReceivingData.FilterQuery && typeof ReceivingData.FilterQuery === 'object' && ReceivingData.FilterQuery !== null && ReceivingData.FilterQuery.length > 0) {
               ReceivingData.FilterQuery.map(obj => {
                  if (obj.Type === 'String') {
                     FindQuery[obj.DBName] = { $regex : new RegExp(".*" + obj.Value + ".*", "i") };
                  }
                  if (obj.Type === 'Select') {
                     if (obj.DBName == 'PatientStatus') {
                        SecondLevelFindQuery[obj.DBName] = obj.Value;
                     } else {
                        FindQuery[obj.DBName] = obj.Value;
                     }
                  }
                  if (obj.Type === 'Date') {
                     if (FindQuery[obj.DBName] === undefined) {
                        FindQuery[obj.DBName] = obj.Option === 'LTE' ? {$lt:new Date(new Date(obj.Value).setDate(new Date(obj.Value).getDate() + 1))} : obj.Option === 'GTE' ? {$gte: new Date(obj.Value)} : new Date(obj.Value);
                     } else {
                        const DBName = obj.DBName;
                        const AndQuery = obj.Option === 'LTE' ? {$lt:new Date(new Date(obj.Value).setDate(new Date(obj.Value).getDate() + 1))} : obj.Option === 'GTE' ? {$gte: new Date(obj.Value)} :new Date(obj.Value);
                        FindQuery['$and'] = [{[DBName]: FindQuery[obj.DBName] }, {[DBName]: AndQuery}];
                     }
                  }
                  if (obj.Type === 'Object') {
                     FindQuery[obj.DBName] = mongoose.Types.ObjectId(obj.Value._id);
                  }
               });
            } 

            Promise.all([
               PatientDetailsModel.PatientBasicDetailsSchema
               .aggregate([
                  { $match: FindQuery},
                  { $lookup: {
                     from: "Stemi_Hospital_Management",
                     let: { "hospital": "$Initiated_Hospital"},
                     pipeline: [
                        { $match: { $expr: { $eq: ["$$hospital", "$_id"] } } },
                        { $project: { "Hospital_Name": 1, "Hospital_Code": 1, "Hospital_Role": 1, "Connected_Clusters": 1 }}
                     ],
                     as: 'Initiated_Hospital' } },
                  { $unwind: { path: "$Initiated_Hospital",  preserveNullAndEmptyArrays: true } },
                  { $lookup: {
                     from: "Discharge_Transfer",
                     let: { "transfer": "$DischargeTransferId"},
                     pipeline: [
                        { $match: { $expr: { $eq: ["$$transfer", "$_id"] } } },
                        { $project: { "Discharge_Transfer_from_Hospital_Date_Time": 1 }}
                     ],
                     as: 'TransferInfo' } },
                  { $unwind: { path: "$TransferInfo",  preserveNullAndEmptyArrays: true } },
                  { $addFields: { Initiated_Hospital: { $ifNull: [ "$Initiated_Hospital", null ] }  } },
                  { $addFields: { HospitalSort: { $ifNull: [ "$Initiated_Hospital.Hospital_Name", null ] }  } },
                  { $addFields: { PatientNameSort: { $ifNull: [ "$Patient_Name", null ] }  } },

                  { $addFields: { HospitalSort: { $toLower: "$HospitalSort" } } },
                  { $addFields: { PatientNameSort: { $toLower: "$PatientNameSort" } } },
                  { $lookup: {
                     from: "Discharge_Transfer",
                     let: { "patient": "$_id"},
                     pipeline: [
                        { $match: { $expr: { $eq: ["$$patient", "$PatientId"] } } },
                        { $project: { "Hospital": 1, "Discharge_Transfer_To": 1, "Active_Status": 1, "Transfer_to_Stemi_Cluster_Hospital_Name": 1 }}
                     ],
                     as: 'Discharge_Details' } },
                  { $addFields: { HospitalIds: { $map: { input: "$Hospital_History", as: "history", in: "$$history.Hospital" } } }},
                  { $addFields: {
                     PatientStatus: {
                        $cond: {
                           if: {$or:[ {$eq: [ "$IfDeath", true ]}, {$eq: [ "$IfDischarge", true ]}, {$eq: [ "$DidNotArrive", true ]} ]},
                           then:'Closed',
                           else: {
                              $cond: {
                                 if: {$and:[ {$eq: [ "$TransferBending", true ]}, {$not: [ {$in: [ ReceivingData.Hospital, "$HospitalIds"  ]} ] } ]},
                                 then:'Un-Attended',
                                 else: 'Pending'
                                 }
                              }
                           }
                        }
                     }
                  },
                  { $match: SecondLevelFindQuery},
                  { $project: { PatientStatus: 1, PatientNameSort: 1, HospitalSort: 1, Patient_Name: 1, Patient_Unique: 1, Stemi_Confirmed: 1, Initiated_Hospital: 1, Initiated_Hospital_Arrival: 1, 
                     Hospital_History: 1, DidNotArrive: 1, TransferInfo: 1, LastCompletion: 1, LastCompletionChild: 1, Discharge_Details: 1, Active_Status: 1, If_Deleted: 1, createdAt: 1 } },
                  { $sort : ShortOrder },
                  { $skip : Skip_Count },
                  { $limit : Limit_Count }
               ]).exec(),
               PatientDetailsModel.PatientBasicDetailsSchema
               .aggregate([
                  { $match: FindQuery},
                  { $addFields: { HospitalIds: { $map: { input: "$Hospital_History", as: "history", in: "$$history.Hospital" } } }},
                  { $addFields: {
                     PatientStatus: {
                        $cond: {
                           if: {$or:[ {$eq: [ "$IfDeath", true ]}, {$eq: [ "$IfDischarge", true ]}, {$eq: [ "$DidNotArrive", true ]} ]},
                           then:'Closed',
                           else: {
                              $cond: {
                                 if: {$and:[ {$eq: [ "$TransferBending", true ]}, {$not: [ {$in: [ ReceivingData.Hospital, "$HospitalIds"  ]} ] } ]},
                                 then:'Un-Attended',
                                 else: 'Pending'
                                 }
                              }
                           }
                        }
                     }
                  },
                  { $match: SecondLevelFindQuery},
                  { $project: {PatientStatus: 1} }
               ]).exec()
            ]).then(resultNew => {
               res.status(200).send({Status: true, Response: resultNew[0], SubResponse: resultNew[1].length });
            }).catch(errNew => {
               res.status(417).send({Status: false, ErrorCode: 417, ErrorMessage: "Some error occurred while Find The Patients list!."});
            });
         }
      });
   }
};
// PU User Multiple Cluster Based Patients
exports.MultipleClusterBased_Patients = function(req, res) {
   var ReceivingData = req.body;
   // console.log(req.body);
   if (!ReceivingData.User || ReceivingData.User === '') {
      res.status(400).send({ Status: false, Message: "User Details is Required!" });
   } else if (!ReceivingData.User_Type || ReceivingData.User_Type !== 'PU') {
      res.status(400).send({ Status: false, Message: "User Rights is not Proper!" });
   } else if (!ReceivingData.Hospital || typeof ReceivingData.Hospital !== 'object' || ReceivingData.Hospital._id === undefined) {
      res.status(400).send({ Status: false, Message: "Hospital Details Not proper!" });
   } else {
      const ClusterId = mongoose.Types.ObjectId(ReceivingData.Cluster._id);
      ClusterModel.ClusterSchema.findOne( {'_id':  ClusterId }, {}, {})
      .exec(function(err, result) {
         if(err) {
            res.status(417).send({status: false, Message: "Some error occurred while Find The Cluster Details!.", Error: err });
         } else {
            result = JSON.parse(JSON.stringify(result)); 
            const HospitalsId = mongoose.Types.ObjectId(ReceivingData.Hospital._id);
            const ConnectionType = result.Hospital === JSON.parse(JSON.stringify(HospitalsId)) ? 'Primary' : 'Secondary';
            Promise.all([
               ClusterModel.ClusterMappingSchema.find({'Cluster': ClusterId }, {}, {}).exec(),
               ClusterModel.ClusterMappingSchema.find({'Connected_ClusterHub': HospitalsId }, {}, {}).exec()
            ]).then(response => {
               var PrimaryHospitals = JSON.parse(JSON.stringify(response[0]));
               var SecondaryHospitals = JSON.parse(JSON.stringify(response[1]));
               var Hospitals = [];
               Hospitals.push(HospitalsId);
               if (ConnectionType === 'Primary') {
                  PrimaryHospitals.map(obj => {
                     Hospitals.push(obj.ClusterHospital);
                  });
               }
               if (ConnectionType === 'Secondary') {
                  SecondaryHospitals.map(obj => {
                     Hospitals.push(obj.ClusterHospital);
                  });
               }
               Hospitals = Hospitals.map(obj => mongoose.Types.ObjectId(obj));
               const Skip_Count = parseInt(ReceivingData.Skip_Count, 0) || 0;
               const Limit_Count = parseInt(ReceivingData.Limit_Count, 0) || 5;
               var ShortOrder = {createdAt: -1};
               var ShortKey = ReceivingData.ShortKey;
               var ShortCondition = ReceivingData.ShortCondition;
               if ( ShortKey && ShortKey !== null && ShortKey !== '' && ShortCondition && ShortCondition !== null && ShortCondition !== ''){           
                  ShortOrder = {};
                  ShortOrder[ShortKey] = ShortCondition === 'Ascending' ? 1 : -1 ;
               } 

               var FindQuery = { 'If_Deleted': false };
               FindQuery['$or']  = [{ 'Initiated_Hospital': { $in: Hospitals }}, {'TransferBendingTo': { $in: Hospitals }}, {'Hospital_History.Hospital': { $in: Hospitals } }];
               var SecondLevelFindQuery = { };

               if (ReceivingData.FilterQuery && typeof ReceivingData.FilterQuery === 'object' && ReceivingData.FilterQuery !== null && ReceivingData.FilterQuery.length > 0) {
                  ReceivingData.FilterQuery.map(obj => {
                     if (obj.Type === 'String') {
                        FindQuery[obj.DBName] = { $regex : new RegExp(".*" + obj.Value + ".*", "i") };
                     }
                     if (obj.Type === 'Select') {
                        if (obj.DBName == 'PatientStatus') {
                           SecondLevelFindQuery[obj.DBName] = obj.Value;
                        } else {
                           FindQuery[obj.DBName] = obj.Value;
                        }
                     }
                     if (obj.Type === 'Date') {
                        if (FindQuery[obj.DBName] === undefined) {
                           FindQuery[obj.DBName] = obj.Option === 'LTE' ? {$lt:new Date(new Date(obj.Value).setDate(new Date(obj.Value).getDate() + 1))} : obj.Option === 'GTE' ? {$gte: new Date(obj.Value)} : new Date(obj.Value);
                        } else {
                           const DBName = obj.DBName;
                           const AndQuery = obj.Option === 'LTE' ? {$lt:new Date(new Date(obj.Value).setDate(new Date(obj.Value).getDate() + 1))} : obj.Option === 'GTE' ? {$gte: new Date(obj.Value)} :new Date(obj.Value);
                           FindQuery['$and'] = [{[DBName]: FindQuery[obj.DBName] }, {[DBName]: AndQuery}];
                        }
                     }
                     if (obj.Type === 'Object') {
                        FindQuery[obj.DBName] = mongoose.Types.ObjectId(obj.Value._id);
                     }
                  });
               }
               Promise.all([
                  PatientDetailsModel.PatientBasicDetailsSchema
                  .aggregate([
                     { $match: FindQuery},
                     { $lookup: {
                        from: "Stemi_Hospital_Management",
                        let: { "hospital": "$Initiated_Hospital"},
                        pipeline: [
                           { $match: { $expr: { $eq: ["$$hospital", "$_id"] } } },
                           { $project: { "Hospital_Name": 1, "Hospital_Code": 1, "Hospital_Role": 1, "Connected_Clusters": 1 }}
                        ],
                        as: 'Initiated_Hospital' } },
                     { $unwind: { path: "$Initiated_Hospital",  preserveNullAndEmptyArrays: true } },
                     { $lookup: {
                        from: "Discharge_Transfer",
                        let: { "transfer": "$DischargeTransferId"},
                        pipeline: [
                           { $match: { $expr: { $eq: ["$$transfer", "$_id"] } } },
                           { $project: { "Discharge_Transfer_from_Hospital_Date_Time": 1 }}
                        ],
                        as: 'TransferInfo' } },
                     { $unwind: { path: "$TransferInfo",  preserveNullAndEmptyArrays: true } },
                     { $addFields: { Initiated_Hospital: { $ifNull: [ "$Initiated_Hospital", null ] }  } },
                     { $addFields: { HospitalSort: { $ifNull: [ "$Initiated_Hospital.Hospital_Name", null ] }  } },
                     { $addFields: { PatientNameSort: { $ifNull: [ "$Patient_Name", null ] }  } },
   
                     { $addFields: { HospitalSort: { $toLower: "$HospitalSort" } } },
                     { $addFields: { PatientNameSort: { $toLower: "$PatientNameSort" } } },
                     { $lookup: {
                        from: "Discharge_Transfer",
                        let: { "patient": "$_id"},
                        pipeline: [
                           { $match: { $expr: { $eq: ["$$patient", "$PatientId"] } } },
                           { $project: { "Hospital": 1, "Discharge_Transfer_To": 1, "Active_Status": 1, "Transfer_to_Stemi_Cluster_Hospital_Name": 1 }}
                        ],
                        as: 'Discharge_Details' } },
                        { $addFields: { HospitalIds: { $map: { input: "$Hospital_History", as: "history", in: "$$history.Hospital" } } }},
                     { $addFields: {
                        PatientStatus: {
                           $cond: {
                              if: {$or:[ {$eq: [ "$IfDeath", true ]}, {$eq: [ "$IfDischarge", true ]}, {$eq: [ "$DidNotArrive", true ]} ]},
                              then:'Closed',
                              else: {
                                 $cond: {
                                    if: {$and:[ {$eq: [ "$TransferBending", true ]}, {$not: [ {$in: [ ReceivingData.Hospital, "$HospitalIds"  ]} ] } ]},
                                    then:'Un-Attended',
                                    else: 'Pending'
                                    }
                                 }
                              }
                           }
                        }
                     },
                     { $match: SecondLevelFindQuery},
                     { $project: { PatientStatus: 1, PatientNameSort: 1, HospitalSort: 1, Patient_Name: 1, Patient_Unique: 1, Stemi_Confirmed: 1, Initiated_Hospital: 1, Initiated_Hospital_Arrival: 1, 
                        Hospital_History: 1, DidNotArrive: 1, TransferInfo: 1, LastCompletion: 1, LastCompletionChild: 1, Discharge_Details: 1, Active_Status: 1, If_Deleted: 1, createdAt: 1 } },
                     { $sort : ShortOrder },
                     { $skip : Skip_Count },
                     { $limit : Limit_Count }
                  ]).exec(),
                  PatientDetailsModel.PatientBasicDetailsSchema
                  .aggregate([
                     { $match: FindQuery},
                     { $addFields: { HospitalIds: { $map: { input: "$Hospital_History", as: "history", in: "$$history.Hospital" } } }},
                     { $addFields: {
                        PatientStatus: {
                           $cond: {
                              if: {$or:[ {$eq: [ "$IfDeath", true ]}, {$eq: [ "$IfDischarge", true ]}, {$eq: [ "$DidNotArrive", true ]} ]},
                              then:'Closed',
                              else: {
                                 $cond: {
                                    if: {$and:[ {$eq: [ "$TransferBending", true ]}, {$not: [ {$in: [ ReceivingData.Hospital, "$HospitalIds"  ]} ] } ]},
                                    then:'Un-Attended',
                                    else: 'Pending'
                                    }
                                 }
                              }
                           }
                        }
                     },
                     { $match: SecondLevelFindQuery},
                     { $project: {PatientStatus: 1} }
                  ]).exec()
               ]).then(resultNew => {
                  res.status(200).send({Status: true, Response: resultNew[0], SubResponse: resultNew[1].length });
               }).catch(errNew => {
                  // console.log(errNew);
                  res.status(417).send({Status: false, ErrorCode: 417, ErrorMessage: "Some error occurred while Find The Patients list!."});
               }); 
            });
         }
      });
   }
};
// PU User Hospital Based Patients
exports.HospitalBased_Patients = function(req, res) {
   var ReceivingData = req.body;

   if (!ReceivingData.User || ReceivingData.User === '') {
      res.status(400).send({ Status: false, Message: "User Details is Required!" });
   } else if (!ReceivingData.Hospital || typeof ReceivingData.Hospital !== 'object' || ReceivingData.Hospital._id === undefined) {
      res.status(400).send({ Status: false, Message: "Hospital Details Not proper!" });
   } else {
      const Skip_Count = parseInt(ReceivingData.Skip_Count, 0) || 0;
      const Limit_Count = parseInt(ReceivingData.Limit_Count, 0) || 5;

      var ShortOrder = {createdAt: -1};
      var ShortKey = ReceivingData.ShortKey;
      var ShortCondition = ReceivingData.ShortCondition;
      if ( ShortKey && ShortKey !== null && ShortKey !== '' && ShortCondition && ShortCondition !== null && ShortCondition !== ''){           
         ShortOrder = {};
         ShortOrder[ShortKey] = ShortCondition === 'Ascending' ? 1 : -1 ;
      }
      ReceivingData.Hospital = mongoose.Types.ObjectId(ReceivingData.Hospital._id);
      
      var FindQuery = { 'If_Deleted': false };
      var SecondLevelFindQuery = { };

      FindQuery['$or']  = [{ 'Initiated_Hospital': ReceivingData.Hospital}, {'TransferBendingTo': ReceivingData.Hospital}, {'Hospital_History.Hospital': ReceivingData.Hospital }];


      if (ReceivingData.FilterQuery && typeof ReceivingData.FilterQuery === 'object' && ReceivingData.FilterQuery !== null && ReceivingData.FilterQuery.length > 0) {
         ReceivingData.FilterQuery.map(obj => {
            if (obj.Type === 'String') {
               FindQuery[obj.DBName] = { $regex : new RegExp(".*" + obj.Value + ".*", "i") };
            }
            if (obj.Type === 'Select') {
               if (obj.DBName == 'PatientStatus') {
                  SecondLevelFindQuery[obj.DBName] = obj.Value;
               } else {
                  FindQuery[obj.DBName] = obj.Value;
               }
            }
            if (obj.Type === 'Date') {
               if (FindQuery[obj.DBName] === undefined) {
                  FindQuery[obj.DBName] = obj.Option === 'LTE' ? {$lt:new Date(new Date(obj.Value).setDate(new Date(obj.Value).getDate() + 1))} : obj.Option === 'GTE' ? {$gte: new Date(obj.Value)} : new Date(obj.Value);
               } else {
                  const DBName = obj.DBName;
                  const AndQuery = obj.Option === 'LTE' ? {$lt:new Date(new Date(obj.Value).setDate(new Date(obj.Value).getDate() + 1))} : obj.Option === 'GTE' ? {$gte: new Date(obj.Value)} :new Date(obj.Value);
                  FindQuery['$and'] = [{[DBName]: FindQuery[obj.DBName] }, {[DBName]: AndQuery}];
               }
            }
            if (obj.Type === 'Object') {
               FindQuery[obj.DBName] = mongoose.Types.ObjectId(obj.Value._id);
            }
         });
      }
   
      Promise.all([
         PatientDetailsModel.PatientBasicDetailsSchema
         .aggregate([
            { $match: FindQuery},
            { $lookup: {
               from: "Stemi_Hospital_Management",
               let: { "hospital": "$Initiated_Hospital"},
               pipeline: [
                  { $match: { $expr: { $eq: ["$$hospital", "$_id"] } } },
                  { $project: { "Hospital_Name": 1, "Hospital_Code": 1, "Hospital_Role": 1, "Connected_Clusters": 1}}
               ],
               as: 'Initiated_Hospital' } },
            { $unwind: { path: "$Initiated_Hospital",  preserveNullAndEmptyArrays: true } },
            { $lookup: {
               from: "Discharge_Transfer",
               let: { "transfer": "$DischargeTransferId"},
               pipeline: [
                  { $match: { $expr: { $eq: ["$$transfer", "$_id"] } } },
                  { $project: { "Discharge_Transfer_from_Hospital_Date_Time": 1 }}
               ],
               as: 'TransferInfo' } },
            { $unwind: { path: "$TransferInfo",  preserveNullAndEmptyArrays: true } },
            { $addFields: { Initiated_Hospital: { $ifNull: [ "$Initiated_Hospital", null ] }  } },
            { $addFields: { HospitalSort: { $ifNull: [ "$Initiated_Hospital.Hospital_Name", null ] }  } },
            { $addFields: { PatientNameSort: { $ifNull: [ "$Patient_Name", null ] }  } },

            { $addFields: { HospitalSort: { $toLower: "$HospitalSort" } } },
            { $addFields: { PatientNameSort: { $toLower: "$PatientNameSort" } } },
            { $lookup: {
               from: "Discharge_Transfer",
               let: { "patient": "$_id"},
               pipeline: [
                  { $match: { $expr: { $eq: ["$$patient", "$PatientId"] } } },
                  { $project: { "Hospital": 1, "Discharge_Transfer_To": 1, "Active_Status": 1, "Transfer_to_Stemi_Cluster_Hospital_Name": 1 }}
               ],
               as: 'Discharge_Details' } },
            { $addFields: { HospitalIds: { $map: { input: "$Hospital_History", as: "history", in: "$$history.Hospital" } } }},
            { $addFields: {
               PatientStatus: {
                  $cond: {
                     if: {$or:[ {$eq: [ "$IfDeath", true ]}, {$eq: [ "$IfDischarge", true ]}, {$eq: [ "$DidNotArrive", true ]} ]},
                     then:'Closed',
                     else: {
                        $cond: {
                           if: {$and:[ {$eq: [ "$TransferBending", true ]}, {$not: [ {$in: [ ReceivingData.Hospital, "$HospitalIds"  ]} ] } ]},
                           then:'Un-Attended',
                           else: 'Pending'
                           }
                        }
                     }
                  }
               }
            },
            { $match: SecondLevelFindQuery},
            { $project: {PatientStatus: 1, PatientNameSort: 1, HospitalSort: 1, Patient_Name: 1, Patient_Unique: 1, Stemi_Confirmed: 1, Initiated_Hospital: 1, Initiated_Hospital_Arrival: 1, 
               Hospital_History: 1, DidNotArrive: 1, TransferInfo: 1, LastCompletion: 1, LastCompletionChild: 1, Discharge_Details: 1, Active_Status: 1, If_Deleted: 1, createdAt: 1 } },
            { $sort : ShortOrder },
            { $skip : Skip_Count },
            { $limit : Limit_Count }
         ]).exec(),
         PatientDetailsModel.PatientBasicDetailsSchema
         .aggregate([
            { $match: FindQuery},
            { $addFields: { HospitalIds: { $map: { input: "$Hospital_History", as: "history", in: "$$history.Hospital" } } }},
            { $addFields: {
               PatientStatus: {
                  $cond: {
                     if: {$or:[ {$eq: [ "$IfDeath", true ]}, {$eq: [ "$IfDischarge", true ]}, {$eq: [ "$DidNotArrive", true ]} ]},
                     then:'Closed',
                     else: {
                        $cond: {
                           if: {$and:[ {$eq: [ "$TransferBending", true ]}, {$not: [ {$in: [ ReceivingData.Hospital, "$HospitalIds"  ]} ] } ]},
                           then:'Un-Attended',
                           else: 'Pending'
                           }
                        }
                     }
                  }
               }
            },
            { $match: SecondLevelFindQuery},
            { $project: {PatientStatus: 1} }
         ]).exec(),
      ]).then(result => {
         res.status(200).send({Status: true, Response: result[0], SubResponse: result[1].length });
      }).catch(err => {
         res.status(417).send({Status: false, ErrorCode: 417, ErrorMessage: "Some error occurred while Find The Users list!."});
      });
   }
};
// CO User Clusters Based Patients
exports.CoordinatorBasedPatients_List = function(req, res) {
   var ReceivingData = req.body;
   if (!ReceivingData.User || ReceivingData.User === '') {
      res.status(400).send({ Status: false, Message: "User Details is Required!" });
   } else if (!ReceivingData.User_Type || ReceivingData.User_Type !== 'CO') {
      res.status(400).send({ Status: false, Message: "User Rights is not Proper!" });
   } else if (!ReceivingData.ClustersArray || typeof ReceivingData.ClustersArray !== 'object' || ReceivingData.ClustersArray.length <= 0) {
      res.status(400).send({ Status: false, Message: "Coordinators Detail not valid!" });
   } else {
      const ClusterArr = ReceivingData.ClustersArray.map(obj => mongoose.Types.ObjectId(obj._id));
      ClusterModel.ClusterMappingSchema.find( {'Cluster': { $in: ClusterArr } }, {}, {})
      .exec(function(err, result) {
         if(err) {
            res.status(417).send({status: false, Message: "Some error occurred while Find The Cluster Details!.", Error: err });
         } else {
            const HospitalResult = result.map(obj => obj.ClusterHospital);
            const HospitalArr = HospitalResult.filter((element, index, thisArg) => thisArg.indexOf(element) === index);

            const Skip_Count = parseInt(ReceivingData.Skip_Count, 0) || 0;
            const Limit_Count = parseInt(ReceivingData.Limit_Count, 0) || 5;
         
            var ShortOrder = {createdAt: -1};
            var ShortKey = ReceivingData.ShortKey;
            var ShortCondition = ReceivingData.ShortCondition;
            if ( ShortKey && ShortKey !== null && ShortKey !== '' && ShortCondition && ShortCondition !== null && ShortCondition !== ''){           
               ShortOrder = {};
               ShortOrder[ShortKey] = ShortCondition === 'Ascending' ? 1 : -1 ;
            }
            var FindQuery = { 'If_Deleted': false };
            var SecondLevelFindQuery = { };

            FindQuery['$or']  = [{ 'Initiated_Hospital': { $in: HospitalArr }}, {'TransferBendingTo': { $in: HospitalArr }}, {'Hospital_History.Hospital': { $in: HospitalArr } }];
            if (ReceivingData.FilterQuery && typeof ReceivingData.FilterQuery === 'object' && ReceivingData.FilterQuery !== null && ReceivingData.FilterQuery.length > 0) {
               ReceivingData.FilterQuery.map(obj => {
                  if (obj.Type === 'String') {
                     FindQuery[obj.DBName] = { $regex : new RegExp(".*" + obj.Value + ".*", "i") };
                  }
                  if (obj.Type === 'Select') {
                     if (obj.DBName == 'PatientStatus') {
                        SecondLevelFindQuery[obj.DBName] = obj.Value;
                     } else {
                        FindQuery[obj.DBName] = obj.Value;
                     }
                  }
                  if (obj.Type === 'Date') {
                     if (FindQuery[obj.DBName] === undefined) {
                        FindQuery[obj.DBName] = obj.Option === 'LTE' ? {$lt:new Date(new Date(obj.Value).setDate(new Date(obj.Value).getDate() + 1))} : obj.Option === 'GTE' ? {$gte: new Date(obj.Value)} : new Date(obj.Value);
                     } else {
                        const DBName = obj.DBName;
                        const AndQuery = obj.Option === 'LTE' ? {$lt:new Date(new Date(obj.Value).setDate(new Date(obj.Value).getDate() + 1))} : obj.Option === 'GTE' ? {$gte: new Date(obj.Value)} :new Date(obj.Value);
                        FindQuery['$and'] = [{[DBName]: FindQuery[obj.DBName] }, {[DBName]: AndQuery}];
                     }
                  }
                  if (obj.Type === 'Object') {
                     FindQuery[obj.DBName] = mongoose.Types.ObjectId(obj.Value._id);
                  }
               });
            } 

            Promise.all([
               PatientDetailsModel.PatientBasicDetailsSchema
               .aggregate([
                  { $match: FindQuery},
                  { $lookup: {
                     from: "Stemi_Hospital_Management",
                     let: { "hospital": "$Initiated_Hospital"},
                     pipeline: [
                        { $match: { $expr: { $eq: ["$$hospital", "$_id"] } } },
                        { $project: { "Hospital_Name": 1, "Hospital_Code": 1, "Hospital_Role": 1, "Connected_Clusters": 1 }}
                     ],
                     as: 'Initiated_Hospital' } },
                  { $unwind: { path: "$Initiated_Hospital",  preserveNullAndEmptyArrays: true } },
                  { $lookup: {
                     from: "Discharge_Transfer",
                     let: { "transfer": "$DischargeTransferId"},
                     pipeline: [
                        { $match: { $expr: { $eq: ["$$transfer", "$_id"] } } },
                        { $project: { "Discharge_Transfer_from_Hospital_Date_Time": 1 }}
                     ],
                     as: 'TransferInfo' } },
                  { $unwind: { path: "$TransferInfo",  preserveNullAndEmptyArrays: true } },
                  { $addFields: { Initiated_Hospital: { $ifNull: [ "$Initiated_Hospital", null ] }  } },
                  { $addFields: { HospitalSort: { $ifNull: [ "$Initiated_Hospital.Hospital_Name", null ] }  } },
                  { $addFields: { PatientNameSort: { $ifNull: [ "$Patient_Name", null ] }  } },

                  { $addFields: { HospitalSort: { $toLower: "$HospitalSort" } } },
                  { $addFields: { PatientNameSort: { $toLower: "$PatientNameSort" } } },
                  { $addFields: { HospitalIds: { $map: { input: "$Hospital_History", as: "history", in: "$$history.Hospital" } } }},
                  { $addFields: {
                     PatientStatus: {
                        $cond: {
                           if: {$or:[ {$eq: [ "$IfDeath", true ]}, {$eq: [ "$IfDischarge", true ]}, {$eq: [ "$DidNotArrive", true ]} ]},
                           then:'Closed',
                           else: {
                              $cond: {
                                 if: {$eq: [ "$TransferBending", true ]},
                                 then:'In-Transfer',
                                 else: 'Pending'
                                 }
                              }
                           }
                        }
                     }
                  },
                  { $match: SecondLevelFindQuery},
                  { $project: { PatientStatus: 1, PatientNameSort: 1, HospitalSort: 1, Patient_Name: 1, Patient_Unique: 1, Stemi_Confirmed: 1, Initiated_Hospital: 1, Initiated_Hospital_Arrival: 1, 
                     Hospital_History: 1, DidNotArrive: 1, TransferInfo: 1, LastCompletion: 1, LastCompletionChild: 1, Active_Status: 1, If_Deleted: 1, createdAt: 1 } },
                  { $sort : ShortOrder },
                  { $skip : Skip_Count },
                  { $limit : Limit_Count }
               ]).exec(),
               PatientDetailsModel.PatientBasicDetailsSchema
               .aggregate([
                  { $match: FindQuery},
                  { $addFields: { HospitalIds: { $map: { input: "$Hospital_History", as: "history", in: "$$history.Hospital" } } }},
                  { $addFields: {
                     PatientStatus: {
                        $cond: {
                           if: {$or:[ {$eq: [ "$IfDeath", true ]}, {$eq: [ "$IfDischarge", true ]}, {$eq: [ "$DidNotArrive", true ]} ]},
                           then:'Closed',
                           else: {
                              $cond: {
                                 if: {$eq: [ "$TransferBending", true ]},
                                 then:'In-Transfer',
                                 else: 'Pending'
                                 }
                              }
                           }
                        }
                     }
                  },
                  { $match: SecondLevelFindQuery},
                  { $project: {PatientStatus: 1} }
               ]).exec()
            ]).then(resultNew => {
               res.status(200).send({Status: true, Response: resultNew[0], SubResponse: resultNew[1].length});
            }).catch(errNew => {
               // console.log(errNew);
               res.status(417).send({Status: false, ErrorCode: 417, ErrorMessage: "Some error occurred while Find The Patients list!."});
            });
         }
      });
   }
};
// SA User All Patients
exports.AllPatientDetails_List = function(req, res) {
   var ReceivingData = req.body;

   const Skip_Count = parseInt(ReceivingData.Skip_Count, 0) || 0;
   const Limit_Count = parseInt(ReceivingData.Limit_Count, 0) || 5;

   var ShortOrder = {createdAt: -1};
   var ShortKey = ReceivingData.ShortKey;
   var ShortCondition = ReceivingData.ShortCondition;
   if ( ShortKey && ShortKey !== null && ShortKey !== '' && ShortCondition && ShortCondition !== null && ShortCondition !== ''){           
      ShortOrder = {};
      ShortOrder[ShortKey] = ShortCondition === 'Ascending' ? 1 : -1 ;
   }
   var FindQuery = {'If_Deleted': false};
   var SecondLevelFindQuery = { };

   if (ReceivingData.FilterQuery && typeof ReceivingData.FilterQuery === 'object' && ReceivingData.FilterQuery !== null && ReceivingData.FilterQuery.length > 0) {
      ReceivingData.FilterQuery.map(obj => {
         if (obj.Type === 'String') {
            FindQuery[obj.DBName] = { $regex : new RegExp(".*" + obj.Value + ".*", "i") };
         }
         if (obj.Type === 'Select') {
            if (obj.DBName == 'PatientStatus') {
               SecondLevelFindQuery[obj.DBName] = obj.Value;
            } else {
               FindQuery[obj.DBName] = obj.Value;
            }
         }
         if (obj.Type === 'Date') {
            if (FindQuery[obj.DBName] === undefined) {
               FindQuery[obj.DBName] = obj.Option === 'LTE' ? {$lt:new Date(new Date(obj.Value).setDate(new Date(obj.Value).getDate() + 1))} : obj.Option === 'GTE' ? {$gte: new Date(obj.Value)} : new Date(obj.Value);
            } else {
               const DBName = obj.DBName;
               const AndQuery = obj.Option === 'LTE' ? {$lt:new Date(new Date(obj.Value).setDate(new Date(obj.Value).getDate() + 1))} : obj.Option === 'GTE' ? {$gte: new Date(obj.Value)} :new Date(obj.Value);
               FindQuery['$and'] = [{[DBName]: FindQuery[obj.DBName] }, {[DBName]: AndQuery}];
            }
         }
         if (obj.Type === 'Object') {
            FindQuery[obj.DBName] = mongoose.Types.ObjectId(obj.Value._id);
         }
      });
   }  
   Promise.all([
      PatientDetailsModel.PatientBasicDetailsSchema
      .aggregate([
         { $match: FindQuery},
         { $lookup: {
            from: "Stemi_Hospital_Management",
            let: { "hospital": "$Initiated_Hospital"},
            pipeline: [
               { $match: { $expr: { $eq: ["$$hospital", "$_id"] } } },
               { $project: { "Hospital_Name": 1, "Hospital_Code": 1, "Hospital_Role": 1, "Connected_Clusters": 1 }}
            ],
            as: 'Initiated_Hospital' } },
         { $unwind: { path: "$Initiated_Hospital",  preserveNullAndEmptyArrays: true } },
         { $lookup: {
            from: "Discharge_Transfer",
            let: { "transfer": "$DischargeTransferId"},
            pipeline: [
               { $match: { $expr: { $eq: ["$$transfer", "$_id"] } } },
               { $project: { "Discharge_Transfer_from_Hospital_Date_Time": 1 }}
            ],
            as: 'TransferInfo' } },
         { $unwind: { path: "$TransferInfo",  preserveNullAndEmptyArrays: true } },
         { $addFields: { Initiated_Hospital: { $ifNull: [ "$Initiated_Hospital", null ] }  } },
         { $addFields: { HospitalSort: { $ifNull: [ "$Initiated_Hospital.Hospital_Name", null ] }  } },
         { $addFields: { PatientNameSort: { $ifNull: [ "$Patient_Name", null ] }  } },
         { $addFields: { HospitalSort: { $toLower: "$HospitalSort" } } },
         { $addFields: { PatientNameSort: { $toLower: "$PatientNameSort" } } },
         { $addFields: { HospitalIds: { $map: { input: "$Hospital_History", as: "history", in: "$$history.Hospital" } } }},
         { $addFields: {
            PatientStatus: {
               $cond: {
                  if: {$or:[ {$eq: [ "$IfDeath", true ]}, {$eq: [ "$IfDischarge", true ]}, {$eq: [ "$DidNotArrive", true ]} ]},
                  then:'Closed',
                  else: {
                     $cond: {
                        if: {$eq: [ "$TransferBending", true ]},
                        then:'In-Transfer',
                        else: 'Pending'
                        }
                     }
                  }
               }
            }
         },
         { $match: SecondLevelFindQuery},
         { $project: { PatientStatus: 1, PatientNameSort: 1, HospitalSort: 1, Patient_Name: 1, Patient_Unique: 1, Stemi_Confirmed: 1, Initiated_Hospital: 1, Initiated_Hospital_Arrival: 1, 
            Hospital_History: 1, DidNotArrive: 1, TransferInfo: 1, LastCompletion: 1, LastCompletionChild: 1, Active_Status: 1, If_Deleted: 1, createdAt: 1 } },
         { $sort : ShortOrder },
         { $skip : Skip_Count },
         { $limit : Limit_Count }
      ]).exec(),
      PatientDetailsModel.PatientBasicDetailsSchema
      .aggregate([
         { $match: FindQuery},
         { $addFields: { HospitalIds: { $map: { input: "$Hospital_History", as: "history", in: "$$history.Hospital" } } }},
         { $addFields: {
            PatientStatus: {
               $cond: {
                  if: {$or:[ {$eq: [ "$IfDeath", true ]}, {$eq: [ "$IfDischarge", true ]}, {$eq: [ "$DidNotArrive", true ]} ]},
                  then:'Closed',
                  else: {
                     $cond: {
                        if: {$eq: [ "$TransferBending", true ]},
                        then:'In-Transfer',
                        else: 'Pending'
                        }
                     }
                  }
               }
            }
         },
         { $match: SecondLevelFindQuery},
         { $project: {PatientStatus: 1} }
      ]).exec()
   ]).then(result => {
      res.status(200).send({Status: true, Response: result[0], SubResponse: result[1].length });
   }).catch(err => {
      res.status(417).send({Status: false, ErrorCode: 417, ErrorMessage: "Some error occurred while Find The Users list!."});
   });
};




// PU User Hospital Based Patients Simple List
exports.HospitalBased_PatientsSimpleList = function(req, res) {
   var ReceivingData = req.body;

   if (!ReceivingData.User || ReceivingData.User === '') {
      res.status(400).send({ Status: false, Message: "User Details is Required!" });
   } else if (!ReceivingData.Hospital || typeof ReceivingData.Hospital !== 'object' || ReceivingData.Hospital._id === undefined) {
      res.status(400).send({ Status: false, Message: "Hospital Details Not proper!" });
   } else {

      var ShortOrder = {createdAt: -1};
      ReceivingData.Hospital = mongoose.Types.ObjectId(ReceivingData.Hospital._id);
   
      var FindQuery = { 'If_Deleted': false };
      // FindQuery['$or'] = [{ 'Patient_Name': {$regex : new RegExp(".*" + ReceivingData.searchKey + ".*", "i")} },  {'Patient_Unique': {$regex : new RegExp(".*" + ReceivingData.searchKey + ".*", "i")}}];
      FindQuery['$or']  = [{ 'Initiated_Hospital': ReceivingData.Hospital}, {'TransferBendingTo': ReceivingData.Hospital}, {'Hospital_History.Hospital': ReceivingData.Hospital }];

      PatientDetailsModel.PatientBasicDetailsSchema
      .aggregate([
         { $match: FindQuery},
         { $lookup: {
            from: "Stemi_Hospital_Management",
            let: { "hospital": "$Initiated_Hospital"},
            pipeline: [
               { $match: { $expr: { $eq: ["$$hospital", "$_id"] } } },
               { $project: { "Hospital_Name": 1, "Hospital_Code": 1, "Hospital_Role": 1, "Connected_Clusters": 1 }}
            ],
            as: 'Initiated_Hospital' } },
         { $unwind: { path: "$Initiated_Hospital",  preserveNullAndEmptyArrays: true } },
         { $addFields: { Initiated_Hospital: { $ifNull: [ "$Initiated_Hospital", null ] }  } },
         { $addFields: { Hospital_Name: { $ifNull: [ "$Initiated_Hospital.Hospital_Name", null ] }  } },
         { $project: { Patient_Unique: 1, Patient_Name: 1, Patient_Age: 1, Patient_Gender: 1, Hospital_Name: 1, Hospital_Id: 1, createdAt: 1} },
         { $sort : ShortOrder },
      ]).exec( (errOne, resultOne) => {
         if (errOne) {
            res.status(417).send({Status: false, ErrorCode: 417, ErrorMessage: "Some error occurred while Find The patients!."});
         } else {
            res.status(200).send({Status: true, Response: resultOne });
         }
      });
   }
};
// PU User Single Cluster Based Patients Simple List
exports.SingleClusterBased_PatientsSimpleList = function(req, res) {
   var ReceivingData = req.body;

   if (!ReceivingData.User || ReceivingData.User === '') {
      res.status(400).send({ Status: false, Message: "User Details is Required!" });
   } else if (!ReceivingData.User_Type || ReceivingData.User_Type !== 'PU') {
      res.status(400).send({ Status: false, Message: "User Rights is not Proper!" });
   } else if (!ReceivingData.Cluster || typeof ReceivingData.Cluster !== 'object' || ReceivingData.Cluster === null ) {
      res.status(400).send({ Status: false, Message: "Cluster Details not valid!" });
   } else {
      var ClusterId = mongoose.Types.ObjectId(ReceivingData.Cluster._id);
      ClusterModel.ClusterMappingSchema.find( {'Cluster': ClusterId }, {}, {}) 
      .exec(function(err, result) {
         if(err) {
            res.status(417).send({status: false, Message: "Some error occurred while Find The Cluster Details!.", Error: err });
         } else {

            const HospitalResult = result.map(obj => obj.ClusterHospital);
            const HospitalArr = HospitalResult.filter((element, index, thisArg) => thisArg.indexOf(element) === index);
         
            var ShortOrder = {createdAt: -1};

            var FindQuery = { 'If_Deleted': false };
            // FindQuery['$or'] = [{ 'Patient_Name': {$regex : new RegExp(".*" + ReceivingData.searchKey + ".*", "i")} },  {'Patient_Unique': {$regex : new RegExp(".*" + ReceivingData.searchKey + ".*", "i")}}];
            FindQuery['$or']  = [{ 'Initiated_Hospital': { $in: HospitalArr }}, {'TransferBendingTo': { $in: HospitalArr }}, {'Hospital_History.Hospital': { $in: HospitalArr } }];

            PatientDetailsModel.PatientBasicDetailsSchema
            .aggregate([
               { $match: FindQuery},
               { $lookup: {
                  from: "Stemi_Hospital_Management",
                  let: { "hospital": "$Initiated_Hospital"},
                  pipeline: [
                     { $match: { $expr: { $eq: ["$$hospital", "$_id"] } } },
                     { $project: { "Hospital_Name": 1, "Hospital_Code": 1, "Hospital_Role": 1, "Connected_Clusters": 1 }}
                  ],
                  as: 'Initiated_Hospital' } },
               { $unwind: { path: "$Initiated_Hospital",  preserveNullAndEmptyArrays: true } },
               { $addFields: { Initiated_Hospital: { $ifNull: [ "$Initiated_Hospital", null ] }  } },
               { $addFields: { Hospital_Name: { $ifNull: [ "$Initiated_Hospital.Hospital_Name", null ] }  } },
               { $project: { Patient_Unique: 1, Patient_Name: 1, Patient_Age: 1, Patient_Gender: 1, Hospital_Name: 1, Hospital_Id: 1, createdAt: 1} },
               { $sort : ShortOrder },
            ]).exec( (errOne, resultOne) => {
               if (errOne) {
                  res.status(417).send({Status: false, ErrorCode: 417, ErrorMessage: "Some error occurred while Find The patients!."});
               } else {
                  res.status(200).send({Status: true, Response: resultOne });
               }
            });
         }
      });
   }
 };
// PU User Advanced Cluster Based Patients Simple List
exports.AdvancedClusterBased_PatientsSimpleList = function(req, res) {
   var ReceivingData = req.body;
   if (!ReceivingData.User || ReceivingData.User === '') {
      res.status(400).send({ Status: false, Message: "User Details is Required!" });
   } else if (!ReceivingData.Cluster || typeof ReceivingData.Cluster !== 'object' || ReceivingData.Cluster === null ) { 
      res.status(400).send({ Status: false, Message: "Cluster Detail not valid!" });
   } else {
      var ClusterId = mongoose.Types.ObjectId(ReceivingData.Cluster._id);
      ClusterModel.ClusterMappingSchema.find( {'Cluster': ClusterId }, {}, {})
      .exec(function(err, result) {
         if(err) {
            res.status(417).send({status: false, Message: "Some error occurred while Find The Cluster Details!.", Error: err });
         } else {
            const HospitalResult = result.map(obj => obj.ClusterHospital);
            const HospitalArr = HospitalResult.filter((element, index, thisArg) => thisArg.indexOf(element) === index);
         
            var ShortOrder = {createdAt: -1};
            var FindQuery = { 'If_Deleted': false };
            // FindQuery['$or'] = [{ 'Patient_Name': {$regex : new RegExp(".*" + ReceivingData.searchKey + ".*", "i")} },  {'Patient_Unique': {$regex : new RegExp(".*" + ReceivingData.searchKey + ".*", "i")}}];
            FindQuery['$or']  = [{ 'Initiated_Hospital': { $in: HospitalArr }}, {'TransferBendingTo': { $in: HospitalArr }}, {'Hospital_History.Hospital': { $in: HospitalArr } }];
            
            PatientDetailsModel.PatientBasicDetailsSchema
            .aggregate([
               { $match: FindQuery},
               { $lookup: {
                  from: "Stemi_Hospital_Management",
                  let: { "hospital": "$Initiated_Hospital"},
                  pipeline: [
                     { $match: { $expr: { $eq: ["$$hospital", "$_id"] } } },
                     { $project: { "Hospital_Name": 1, "Hospital_Code": 1, "Hospital_Role": 1, "Connected_Clusters": 1 }}
                  ],
                  as: 'Initiated_Hospital' } },
               { $unwind: { path: "$Initiated_Hospital",  preserveNullAndEmptyArrays: true } },
               { $addFields: { Initiated_Hospital: { $ifNull: [ "$Initiated_Hospital", null ] }  } },
               { $addFields: { Hospital_Name: { $ifNull: [ "$Initiated_Hospital.Hospital_Name", null ] }  } },
               { $project: { Patient_Unique: 1, Patient_Name: 1, Patient_Age: 1, Patient_Gender: 1, Hospital_Name: 1, Hospital_Id: 1, createdAt: 1} },
               { $sort : ShortOrder },
            ]).exec( (errOne, resultOne) => {
               if (errOne) {
                  res.status(417).send({Status: false, ErrorCode: 417, ErrorMessage: "Some error occurred while Find The patients!."});
               } else {
                  res.status(200).send({Status: true, Response: resultOne });
               }
            });
         }
      });
   }
};
// PU User Multiple Cluster Based Patients Simple List
exports.MultipleClusterBased_PatientsSimpleList = function(req, res) {
   var ReceivingData = req.body;

   if (!ReceivingData.User || ReceivingData.User === '') {
      res.status(400).send({ Status: false, Message: "User Details is Required!" });
   } else if (!ReceivingData.User_Type || ReceivingData.User_Type !== 'PU') {
      res.status(400).send({ Status: false, Message: "User Rights is not Proper!" });
   } else if (!ReceivingData.Hospital || typeof ReceivingData.Hospital !== 'object' || ReceivingData.Hospital._id === undefined) {
      res.status(400).send({ Status: false, Message: "Hospital Details Not proper!" });
   } else {
      const ClusterId = mongoose.Types.ObjectId(ReceivingData.Cluster._id);
      ClusterModel.ClusterSchema.findOne( {'_id':  ClusterId }, {}, {})
      .exec(function(err, result) {
         if(err) {
            res.status(417).send({status: false, Message: "Some error occurred while Find The Cluster Details!.", Error: err });
         } else {
            result = JSON.parse(JSON.stringify(result)); 
            const HospitalsId = mongoose.Types.ObjectId(ReceivingData.Hospital._id);
            const ConnectionType = result.Hospital === JSON.parse(JSON.stringify(HospitalsId)) ? 'Primary' : 'Secondary';
            Promise.all([
               ClusterModel.ClusterMappingSchema.find({'Cluster': ClusterId }, {}, {}).exec(),
               ClusterModel.ClusterMappingSchema.find({'Connected_ClusterHub': HospitalsId }, {}, {}).exec()
            ]).then(response => {
               var PrimaryHospitals = JSON.parse(JSON.stringify(response[0]));
               var SecondaryHospitals = JSON.parse(JSON.stringify(response[1]));
               var Hospitals = [];
               Hospitals.push(HospitalsId);
               if (ConnectionType === 'Primary') {
                  PrimaryHospitals.map(obj => {
                     Hospitals.push(obj.ClusterHospital);
                  });
               }
               if (ConnectionType === 'Secondary') {
                  SecondaryHospitals.map(obj => {
                     Hospitals.push(obj.ClusterHospital);
                  });
               }
               Hospitals = Hospitals.map(obj => mongoose.Types.ObjectId(obj));

               var ShortOrder = {createdAt: -1};
               var FindQuery = { 'If_Deleted': false };
               // FindQuery['$or'] = [{ 'Patient_Name': {$regex : new RegExp(".*" + ReceivingData.searchKey + ".*", "i")} },  {'Patient_Unique': {$regex : new RegExp(".*" + ReceivingData.searchKey + ".*", "i")}}];
               FindQuery['$or']  = [{ 'Initiated_Hospital': { $in: Hospitals }}, {'TransferBendingTo': { $in: Hospitals }}, {'Hospital_History.Hospital': { $in: Hospitals } }];
               
               PatientDetailsModel.PatientBasicDetailsSchema
               .aggregate([
                  { $match: FindQuery},
                  { $lookup: {
                     from: "Stemi_Hospital_Management",
                     let: { "hospital": "$Initiated_Hospital"},
                     pipeline: [
                        { $match: { $expr: { $eq: ["$$hospital", "$_id"] } } },
                        { $project: { "Hospital_Name": 1, "Hospital_Code": 1, "Hospital_Role": 1, "Connected_Clusters": 1 }}
                     ],
                     as: 'Initiated_Hospital' } },
                  { $unwind: { path: "$Initiated_Hospital",  preserveNullAndEmptyArrays: true } },
                  { $addFields: { Initiated_Hospital: { $ifNull: [ "$Initiated_Hospital", null ] }  } },
                  { $addFields: { Hospital_Name: { $ifNull: [ "$Initiated_Hospital.Hospital_Name", null ] }  } },
                  { $project: { Patient_Unique: 1, Patient_Name: 1, Patient_Age: 1, Patient_Gender: 1, Hospital_Name: 1, Hospital_Id: 1, createdAt: 1} },
                  { $sort : ShortOrder },
               ]).exec( (errOne, resultOne) => {
                  if (errOne) {
                     res.status(417).send({Status: false, ErrorCode: 417, ErrorMessage: "Some error occurred while Find The patients!."});
                  } else {
                     res.status(200).send({Status: true, Response: resultOne });
                  }
               });
            });
         }
      });
   }
};
// CO User Clusters Based Patients Simple List
exports.CoordinatorBasedPatients_SimpleList = function(req, res) {
   var ReceivingData = req.body;
   if (!ReceivingData.User || ReceivingData.User === '') {
      res.status(400).send({ Status: false, Message: "User Details is Required!" });
   } else if (!ReceivingData.User_Type || ReceivingData.User_Type !== 'CO') {
      res.status(400).send({ Status: false, Message: "User Rights is not Proper!" });
   } else if (!ReceivingData.ClustersArray || typeof ReceivingData.ClustersArray !== 'object' || ReceivingData.ClustersArray.length <= 0) {
      res.status(400).send({ Status: false, Message: "Coordinators Detail not valid!" });
   } else {
      const ClusterArr = ReceivingData.ClustersArray.map(obj => mongoose.Types.ObjectId(obj._id));
      ClusterModel.ClusterMappingSchema.find( {'Cluster': { $in: ClusterArr } }, {}, {})
      .exec(function(err, result) {
         if(err) {
            res.status(417).send({status: false, Message: "Some error occurred while Find The Cluster Details!.", Error: err });
         } else {
            const HospitalResult = result.map(obj => obj.ClusterHospital);
            const HospitalArr = HospitalResult.filter((element, index, thisArg) => thisArg.indexOf(element) === index);

            var ShortOrder = {createdAt: -1};
            var FindQuery = {'If_Deleted': false};
            // FindQuery['$or'] = [{ 'Patient_Name': {$regex : new RegExp(".*" + ReceivingData.searchKey + ".*", "i")} },  {'Patient_Unique': {$regex : new RegExp(".*" + ReceivingData.searchKey + ".*", "i")}}];
            FindQuery['$or'] = [{ 'Initiated_Hospital': { $in: HospitalArr }}, {'TransferBendingTo': { $in: HospitalArr }}, {'Hospital_History.Hospital': { $in: HospitalArr } }];

            PatientDetailsModel.PatientBasicDetailsSchema
            .aggregate([
               { $match: FindQuery},
               { $lookup: {
                  from: "Stemi_Hospital_Management",
                  let: { "hospital": "$Initiated_Hospital"},
                  pipeline: [
                     { $match: { $expr: { $eq: ["$$hospital", "$_id"] } } },
                     { $project: { "Hospital_Name": 1, "Hospital_Code": 1, "Hospital_Role": 1, "Connected_Clusters": 1 }}
                  ],
                  as: 'Initiated_Hospital' } },
               { $unwind: { path: "$Initiated_Hospital",  preserveNullAndEmptyArrays: true } },
               { $addFields: { Initiated_Hospital: { $ifNull: [ "$Initiated_Hospital", null ] }  } },
               { $addFields: { Hospital_Name: { $ifNull: [ "$Initiated_Hospital.Hospital_Name", null ] }  } },
               { $project: { Patient_Unique: 1, Patient_Name: 1, Patient_Age: 1, Patient_Gender: 1, Hospital_Name: 1, Hospital_Id: 1, createdAt: 1} },
               { $sort : ShortOrder },
            ]).exec( (errOne, resultOne) => {
               if (errOne) {
                  res.status(417).send({Status: false, ErrorCode: 417, ErrorMessage: "Some error occurred while Find The patients!."});
               } else {
                  res.status(200).send({Status: true, Response: resultOne });
               }
            });
         }
      });
   }
};
// SA User All Patients Simple List
exports.AllPatientDetails_SimpleList = function(req, res) {
   var ReceivingData = req.body;

   var ShortOrder = {createdAt: -1};
   var FindQuery = {'If_Deleted': false};
   // FindQuery['$or'] = [{ 'Patient_Name': {$regex : new RegExp(".*" + ReceivingData.searchKey + ".*", "i")} },  {'Patient_Unique': {$regex : new RegExp(".*" + ReceivingData.searchKey + ".*", "i")}}];
   
   PatientDetailsModel.PatientBasicDetailsSchema
   .aggregate([
      { $match: FindQuery},
      { $lookup: {
         from: "Stemi_Hospital_Management",
         let: { "hospital": "$Initiated_Hospital"},
         pipeline: [
            { $match: { $expr: { $eq: ["$$hospital", "$_id"] } } },
            { $project: { "Hospital_Name": 1, "Hospital_Code": 1, "Hospital_Role": 1, "Connected_Clusters": 1 }}
         ],
         as: 'Initiated_Hospital' } },
      { $unwind: { path: "$Initiated_Hospital",  preserveNullAndEmptyArrays: true } },
      { $addFields: { Initiated_Hospital: { $ifNull: [ "$Initiated_Hospital", null ] }  } },
      { $addFields: { Hospital_Name: { $ifNull: [ "$Initiated_Hospital.Hospital_Name", null ] }  } },
      { $project: { Patient_Unique: 1, Patient_Name: 1, Patient_Age: 1, Patient_Gender: 1, Hospital_Name: 1, Hospital_Id: 1, createdAt: 1} },
      { $sort : ShortOrder },
   ]).exec( (err, result) => {
      if (err) {
         res.status(417).send({Status: false, ErrorCode: 417, ErrorMessage: "Some error occurred while Find The patients!."});
      } else {
         res.status(200).send({Status: true, Response: result });
      }
   });
};



// PU User Single Cluster Based Patients Count
exports.SingleClusterBasedPatients_Count = function(req, res) {
   var ReceivingData = req.body;
   if (!ReceivingData.User || ReceivingData.User === '') {
       res.status(400).send({ Status: false, Message: "User Details is Required!" });
    } else if (!ReceivingData.User_Type || ReceivingData.User_Type !== 'PU') {
       res.status(400).send({ Status: false, Message: "User Rights is not Proper!" });
    } else if (!ReceivingData.Cluster || typeof ReceivingData.Cluster !== 'object' || ReceivingData.Cluster === null ) {
       res.status(400).send({ Status: false, Message: "Cluster Details not valid!" });
    } else {
       var ClusterId = mongoose.Types.ObjectId(ReceivingData.Cluster._id);
       ClusterModel.ClusterMappingSchema.find( {'Cluster': ClusterId }, {}, {}) 
       .exec(function(err, result) {
          if(err) {
             res.status(417).send({status: false, Message: "Some error occurred while Find The Cluster Details!.", Error: err });
       } else {
 
          const HospitalResult = result.map(obj => obj.ClusterHospital);
          const HospitalArr = HospitalResult.filter((element, index, thisArg) => thisArg.indexOf(element) === index);

          var FindQuery = { 'If_Deleted': false }; 
          FindQuery['$or']  = [{ 'Initiated_Hospital': { $in: HospitalArr }}, {'TransferBendingTo': { $in: HospitalArr }}, {'Hospital_History.Hospital': { $in: HospitalArr } }];

 
          Promise.all([
             PatientDetailsModel.PatientBasicDetailsSchema
             .aggregate([
                { $match: FindQuery},
                { $addFields: { HospitalIds: { $map: { input: "$Hospital_History", as: "history", in: "$$history.Hospital" } } }},
                { $addFields: {
                   PatientStatus: {
                      $cond: {
                         if: {$or:[ {$eq: [ "$IfDeath", true ]}, {$eq: [ "$IfDischarge", true ]}, {$eq: [ "$DidNotArrive", true ]} ]},
                         then:'Closed',
                         else: {
                            $cond: {
                               if: {$and:[ {$eq: [ "$TransferBending", true ]}, {$not: [ {$in: [ ReceivingData.Hospital, "$HospitalIds"  ]} ] } ]},
                               then:'Un-Attended',
                               else: 'Pending'
                               }
                            }
                         }
                      }
                   }
                },
                { $project: {PatientStatus: 1} }
             ]).exec()
          ]).then(resultNew => {
            var UnAttended = resultNew[0].filter(obj => obj.PatientStatus === 'Un-Attended');
            var InTransfer = resultNew[0].filter(obj => obj.PatientStatus === 'In-Transfer');
            var Pending = resultNew[0].filter(obj => obj.PatientStatus === 'Pending');
            var Closed = resultNew[0].filter(obj => obj.PatientStatus === 'Closed');
            var Counts = {
               UnAttended: UnAttended.length,
               InTransfer: InTransfer.length,
               Pending: Pending.length,
               Closed: Closed.length
            };
            res.status(200).send({Status: true, Response: Counts });
         }).catch(errNew => {
             res.status(417).send({Status: false, ErrorCode: 417, ErrorMessage: "Some error occurred while Find The Patients list!."});
          });
       }
          
       });
       }
};
// PU User Advanced Cluster Based Patients Count
exports.AdvancedClusterBasedPatients_Count = function(req, res) {
   var ReceivingData = req.body;
   if (!ReceivingData.User || ReceivingData.User === '') {
      res.status(400).send({ Status: false, Message: "User Details is Required!" });
   } else if (!ReceivingData.Cluster || typeof ReceivingData.Cluster !== 'object' || ReceivingData.Cluster === null ) { 
      res.status(400).send({ Status: false, Message: "Cluster Detail not valid!" });
   } else {
      var ClusterId = mongoose.Types.ObjectId(ReceivingData.Cluster._id);
      ClusterModel.ClusterMappingSchema.find( {'Cluster': ClusterId }, {}, {})
      .exec(function(err, result) {
         if(err) {
            res.status(417).send({status: false, Message: "Some error occurred while Find The Cluster Details!.", Error: err });
         } else {
            const HospitalResult = result.map(obj => obj.ClusterHospital);
            const HospitalArr = HospitalResult.filter((element, index, thisArg) => thisArg.indexOf(element) === index);

            var FindQuery = { 'If_Deleted': false };
            FindQuery['$or']  = [{ 'Initiated_Hospital': { $in: HospitalArr }}, {'TransferBendingTo': { $in: HospitalArr }}, {'Hospital_History.Hospital': { $in: HospitalArr } }];

            Promise.all([
               PatientDetailsModel.PatientBasicDetailsSchema
               .aggregate([
                  { $match: FindQuery},
                  { $addFields: { HospitalIds: { $map: { input: "$Hospital_History", as: "history", in: "$$history.Hospital" } } }},
                  { $addFields: {
                     PatientStatus: {
                        $cond: {
                           if: {$or:[ {$eq: [ "$IfDeath", true ]}, {$eq: [ "$IfDischarge", true ]}, {$eq: [ "$DidNotArrive", true ]} ]},
                           then:'Closed',
                           else: {
                              $cond: {
                                 if: {$and:[ {$eq: [ "$TransferBending", true ]}, {$not: [ {$in: [ ReceivingData.Hospital, "$HospitalIds"  ]} ] } ]},
                                 then:'Un-Attended',
                                 else: 'Pending'
                                 }
                              }
                           }
                        }
                     }
                  },
                  { $project: {PatientStatus: 1} }
               ]).exec()
            ]).then(resultNew => {
               var UnAttended = resultNew[0].filter(obj => obj.PatientStatus === 'Un-Attended');
               var InTransfer = resultNew[0].filter(obj => obj.PatientStatus === 'In-Transfer');
               var Pending = resultNew[0].filter(obj => obj.PatientStatus === 'Pending');
               var Closed = resultNew[0].filter(obj => obj.PatientStatus === 'Closed');
               var Counts = {
                  UnAttended: UnAttended.length,
                  InTransfer: InTransfer.length,
                  Pending: Pending.length,
                  Closed: Closed.length
               };
               res.status(200).send({Status: true, Response: Counts });
            }).catch(errNew => {
               res.status(417).send({Status: false, ErrorCode: 417, ErrorMessage: "Some error occurred while Find The Patients list!."});
            });
         }
      });
   }
};
// PU User Multiple Cluster Based Patients Count
exports.MultipleClusterBasedPatients_Count = function(req, res) {
   var ReceivingData = req.body;
   // console.log(req.body);
   if (!ReceivingData.User || ReceivingData.User === '') {
      res.status(400).send({ Status: false, Message: "User Details is Required!" });
   } else if (!ReceivingData.User_Type || ReceivingData.User_Type !== 'PU') {
      res.status(400).send({ Status: false, Message: "User Rights is not Proper!" });
   } else if (!ReceivingData.Hospital || typeof ReceivingData.Hospital !== 'object' || ReceivingData.Hospital._id === undefined) {
      res.status(400).send({ Status: false, Message: "Hospital Details Not proper!" });
   } else {
      const ClusterId = mongoose.Types.ObjectId(ReceivingData.Cluster._id);
      ClusterModel.ClusterSchema.findOne( {'_id':  ClusterId }, {}, {})
      .exec(function(err, result) {
         if(err) {
            res.status(417).send({status: false, Message: "Some error occurred while Find The Cluster Details!.", Error: err });
         } else {
            result = JSON.parse(JSON.stringify(result)); 
            const HospitalsId = mongoose.Types.ObjectId(ReceivingData.Hospital._id);
            const ConnectionType = result.Hospital === JSON.parse(JSON.stringify(HospitalsId)) ? 'Primary' : 'Secondary';
            Promise.all([
               ClusterModel.ClusterMappingSchema.find({'Cluster': ClusterId }, {}, {}).exec(),
               ClusterModel.ClusterMappingSchema.find({'Connected_ClusterHub': HospitalsId }, {}, {}).exec()
            ]).then(response => {
               var PrimaryHospitals = JSON.parse(JSON.stringify(response[0]));
               var SecondaryHospitals = JSON.parse(JSON.stringify(response[1]));
               var Hospitals = [];
               Hospitals.push(HospitalsId);
               if (ConnectionType === 'Primary') {
                  PrimaryHospitals.map(obj => {
                     Hospitals.push(obj.ClusterHospital);
                  });
               }
               if (ConnectionType === 'Secondary') {
                  SecondaryHospitals.map(obj => {
                     Hospitals.push(obj.ClusterHospital);
                  });
               }
               Hospitals = Hospitals.map(obj => mongoose.Types.ObjectId(obj));
               var FindQuery = { 'If_Deleted': false };
               FindQuery['$or']  = [{ 'Initiated_Hospital': { $in: Hospitals }}, {'TransferBendingTo': { $in: Hospitals }}, {'Hospital_History.Hospital': { $in: Hospitals } }];

               Promise.all([
                  PatientDetailsModel.PatientBasicDetailsSchema
                  .aggregate([
                     { $match: FindQuery},
                     { $addFields: { HospitalIds: { $map: { input: "$Hospital_History", as: "history", in: "$$history.Hospital" } } }},
                     { $addFields: {
                        PatientStatus: {
                           $cond: {
                              if: {$or:[ {$eq: [ "$IfDeath", true ]}, {$eq: [ "$IfDischarge", true ]}, {$eq: [ "$DidNotArrive", true ]} ]},
                              then:'Closed',
                              else: {
                                 $cond: {
                                    if: {$and:[ {$eq: [ "$TransferBending", true ]}, {$not: [ {$in: [ ReceivingData.Hospital, "$HospitalIds"  ]} ] } ]},
                                    then:'Un-Attended',
                                    else: 'Pending'
                                    }
                                 }
                              }
                           }
                        }
                     },
                     { $project: {PatientStatus: 1} }
                  ]).exec()
               ]).then(resultNew => {
                  var UnAttended = resultNew[0].filter(obj => obj.PatientStatus === 'Un-Attended');
                  var InTransfer = resultNew[0].filter(obj => obj.PatientStatus === 'In-Transfer');
                  var Pending = resultNew[0].filter(obj => obj.PatientStatus === 'Pending');
                  var Closed = resultNew[0].filter(obj => obj.PatientStatus === 'Closed');
                  var Counts = {
                     UnAttended: UnAttended.length,
                     InTransfer: InTransfer.length,
                     Pending: Pending.length,
                     Closed: Closed.length
                  };
                  res.status(200).send({Status: true, Response: Counts });
               }).catch(errNew => {
                  res.status(417).send({Status: false, ErrorCode: 417, ErrorMessage: "Some error occurred while Find The Patients list!."});
               }); 
            });
         }
      });
   }
};
// PU User Hospital Based Patients Count
exports.HospitalBasedPatients_Count = function(req, res) {
   var ReceivingData = req.body;

   if (!ReceivingData.User || ReceivingData.User === '') {
      res.status(400).send({ Status: false, Message: "User Details is Required!" });
   } else if (!ReceivingData.Hospital || typeof ReceivingData.Hospital !== 'object' || ReceivingData.Hospital._id === undefined) {
      res.status(400).send({ Status: false, Message: "Hospital Details Not proper!" });
   } else {

      ReceivingData.Hospital = mongoose.Types.ObjectId(ReceivingData.Hospital._id);
      
      var FindQuery = { 'If_Deleted': false };
      FindQuery['$or']  = [{ 'Initiated_Hospital': ReceivingData.Hospital}, {'TransferBendingTo': ReceivingData.Hospital}, {'Hospital_History.Hospital': ReceivingData.Hospital }];
   
      Promise.all([
         PatientDetailsModel.PatientBasicDetailsSchema
         .aggregate([
            { $match: FindQuery},
            { $addFields: { HospitalIds: { $map: { input: "$Hospital_History", as: "history", in: "$$history.Hospital" } } }},
            { $addFields: {
               PatientStatus: {
                  $cond: {
                     if: {$or:[ {$eq: [ "$IfDeath", true ]}, {$eq: [ "$IfDischarge", true ]}, {$eq: [ "$DidNotArrive", true ]} ]},
                     then:'Closed',
                     else: {
                        $cond: {
                           if: {$and:[ {$eq: [ "$TransferBending", true ]}, {$not: [ {$in: [ ReceivingData.Hospital, "$HospitalIds"  ]} ] } ]},
                           then:'Un-Attended',
                           else: 'Pending'
                           }
                        }
                     }
                  }
               }
            },
            { $project: {PatientStatus: 1} }
         ]).exec()
      ]).then(result => {
         var UnAttended = result[0].filter(obj => obj.PatientStatus === 'Un-Attended');
         var InTransfer = result[0].filter(obj => obj.PatientStatus === 'In-Transfer');
         var Pending = result[0].filter(obj => obj.PatientStatus === 'Pending');
         var Closed = result[0].filter(obj => obj.PatientStatus === 'Closed');
         var Counts = {
            UnAttended: UnAttended.length,
            InTransfer: InTransfer.length,
            Pending: Pending.length,
            Closed: Closed.length
         };
         res.status(200).send({Status: true, Response: Counts });
      }).catch(err => {
         res.status(417).send({Status: false, ErrorCode: 417, ErrorMessage: "Some error occurred while Find The Users list!."});
      });
   }
};
// Coordinator Based Patients Count ---------------------------------------------------------
exports.CoordinatorBasedPatients_Count = function(req, res) {
   var ReceivingData = req.body;
   if (!ReceivingData.User || ReceivingData.User === '') {
      res.status(400).send({ Status: false, Message: "User Details is Required!" });
   } else if (!ReceivingData.User_Type || ReceivingData.User_Type !== 'CO') {
      res.status(400).send({ Status: false, Message: "User Rights is not Proper!" });
   } else if (!ReceivingData.ClustersArray || typeof ReceivingData.ClustersArray !== 'object' || ReceivingData.ClustersArray.length <= 0) {
      res.status(400).send({ Status: false, Message: "Coordinators Detail not valid!" });
   } else {
      const ClusterArr = ReceivingData.ClustersArray.map(obj => mongoose.Types.ObjectId(obj._id));
      ClusterModel.ClusterMappingSchema.find( {'Cluster': { $in: ClusterArr } }, {}, {})
      .exec(function(err, result) {
         if(err) {
            res.status(417).send({status: false, Message: "Some error occurred while Find The Cluster Details!.", Error: err });
         } else {
            const HospitalResult = result.map(obj => obj.ClusterHospital);
            const HospitalArr = HospitalResult.filter((element, index, thisArg) => thisArg.indexOf(element) === index);
            var FindQuery = { 'If_Deleted': false };
            FindQuery['$or']  = [{ 'Initiated_Hospital': { $in: HospitalArr }}, {'TransferBendingTo': { $in: HospitalArr }}, {'Hospital_History.Hospital': { $in: HospitalArr } }];
            Promise.all([
               PatientDetailsModel.PatientBasicDetailsSchema
               .aggregate([
                  { $match: FindQuery},
                  { $addFields: { HospitalIds: { $map: { input: "$Hospital_History", as: "history", in: "$$history.Hospital" } } }},
                  { $addFields: {
                     PatientStatus: {
                        $cond: {
                           if: {$or:[ {$eq: [ "$IfDeath", true ]}, {$eq: [ "$IfDischarge", true ]}, {$eq: [ "$DidNotArrive", true ]} ]},
                           then:'Closed',
                           else: {
                              $cond: {
                                 if: {$eq: [ "$TransferBending", true ]},
                                 then:'In-Transfer',
                                 else: 'Pending'
                                 }
                              }
                           }
                        }
                     }
                  },
                  { $project: {PatientStatus: 1} }
               ]).exec()
            ]).then(resultNew => {
               var UnAttended = resultNew[0].filter(obj => obj.PatientStatus === 'Un-Attended');
               var InTransfer = resultNew[0].filter(obj => obj.PatientStatus === 'In-Transfer');
               var Pending = resultNew[0].filter(obj => obj.PatientStatus === 'Pending');
               var Closed = resultNew[0].filter(obj => obj.PatientStatus === 'Closed');
               var Counts = {
                  UnAttended: UnAttended.length,
                  InTransfer: InTransfer.length,
                  Pending: Pending.length,
                  Closed: Closed.length
               };
               res.status(200).send({Status: true, Response: Counts });
            }).catch(errNew => {
               res.status(417).send({Status: false, ErrorCode: 417, ErrorMessage: "Some error occurred while Find The Patients list!."});
            });
         }
      });
   }
};
// Super Admin All Patients Count
exports.AllPatientDetails_Count = function(req, res) {
   var ReceivingData = req.body;
   var FindQuery = {'If_Deleted': false};
   Promise.all([
      PatientDetailsModel.PatientBasicDetailsSchema
      .aggregate([
         { $match: FindQuery},
         { $addFields: { HospitalIds: { $map: { input: "$Hospital_History", as: "history", in: "$$history.Hospital" } } }},
         { $addFields: {
            PatientStatus: {
               $cond: {
                  if: {$or:[ {$eq: [ "$IfDeath", true ]}, {$eq: [ "$IfDischarge", true ]}, {$eq: [ "$DidNotArrive", true ]} ]},
                  then:'Closed',
                  else: {
                     $cond: {
                        if: {$eq: [ "$TransferBending", true ]},
                        then:'In-Transfer',
                        else: 'Pending'
                        }
                     }
                  }
               }
            }
         },
         { $project: {PatientStatus: 1} }
      ]).exec()
   ]).then(result => {
      var UnAttended = result[0].filter(obj => obj.PatientStatus === 'Un-Attended');
      var InTransfer = result[0].filter(obj => obj.PatientStatus === 'In-Transfer');
      var Pending = result[0].filter(obj => obj.PatientStatus === 'Pending');
      var Closed = result[0].filter(obj => obj.PatientStatus === 'Closed');
      var Counts = {
         UnAttended: UnAttended.length,
         InTransfer: InTransfer.length,
         Pending: Pending.length,
         Closed: Closed.length
      };
      res.status(200).send({Status: true, Response: Counts });
   }).catch(err => {
      res.status(417).send({Status: false, ErrorCode: 417, ErrorMessage: "Some error occurred while Find The Users list!."});
   });
};



// Patient Admission Type History 
exports.AdmissionType = function (req, res) {
   var ReceivingData = req.body;
   if (!ReceivingData.PatientId || ReceivingData.PatientId === '') {
      res.status(400).send({ Status: false, Message: "Patient Detail not valid!" });
   } else {
      Promise.all([
         PatientDetailsModel.PatientBasicDetailsSchema.findOne({ _id: mongoose.Types.ObjectId(ReceivingData.PatientId) }, {consent_form: 0, QR_image: 0, ECG_File: 0, All_ECG_Files: 0, App_ECG_Files: 0, Ninety_Min_ECG_Files: 0 }, {'sort': {createdAt: 1} })
            .populate({ path: 'Initiated_Hospital', select: ['Hospital_Name', 'Hospital_Role'] })
            .populate({ path: 'Hospital_History.Hospital', select: ['Hospital_Name', 'Hospital_Role'] }).exec(),
         // Thrombolysis List
         ThrombolysisModel.ThrombolysisSchema.findOne({ PatientId: mongoose.Types.ObjectId(ReceivingData.PatientId) }, {}, {'sort': {createdAt: 1} })
            .populate({ path: 'Hospital', select: ['Hospital_Name', 'Hospital_Role']}).exec(),
         // PCI List 
         PciModel.PciSchema.findOne({ PatientId: mongoose.Types.ObjectId(ReceivingData.PatientId) }, {}, {'sort': {createdAt: 1} })
            .populate({ path: 'Hospital', select: ['Hospital_Name', 'Hospital_Role']}).exec(),
         // In Hospital Summary List
         HospitalSummaryModel.HospitalSummaryLabReportSchema.findOne({ PatientId: mongoose.Types.ObjectId(ReceivingData.PatientId) }, {}, {'sort': {createdAt: -1} })
            .populate({ path: 'Hospital', select: ['Hospital_Name', 'Hospital_Role']}).exec(),
         // Discharge Death List
         DischargeTransferModel.DischargeTransferDeathSchema.findOne({ PatientId: mongoose.Types.ObjectId(ReceivingData.PatientId) }, {}, {'sort': {createdAt: -1} })
            .populate({ path: 'Hospital', select: ['Hospital_Name', 'Hospital_Role']}).exec(),
         // Discharge List
         DischargeTransferModel.DischargeTransferSchema.findOne({ PatientId: mongoose.Types.ObjectId(ReceivingData.PatientId) }, {}, {'sort': {createdAt: -1} })
            .populate({ path: 'Hospital', select: ['Hospital_Name', 'Hospital_Role']}).exec(),
         // Followup List
         FollowUpModel.FollowUpDetailsSchema.findOne({ PatientId: mongoose.Types.ObjectId(ReceivingData.PatientId) }, {}, {'sort': {createdAt: 1} })
            .populate({ path: 'Hospital', select: ['Hospital_Name', 'Hospital_Role']}).exec()
      ]).then(result => {
         const ResponseNew = {
            Basic: result[0],
            Thrombolysis: result[1],
            PCI: result[2],
            LabReport: result[3],
            DischargeDeath: result[4],
            Transfer: result[5],
            FollowUps: result[6]
         };
         res.status(200).send({ Status: true, Response: ResponseNew });
      }).catch(errNew => {
         res.status(417).send({ Status: false, ErrorCode: 417, ErrorMessage: "Some error occurred while Find The Patients list!." });
      });
   }
};


// Patient Fibrinolytic Checklist Create----------------------------------------------
exports.PatientFibrinolyticChecklist_Create = function(req, res) {
   var ReceivingData = req.body;

   if(!ReceivingData.User || ReceivingData.User === null){
      res.status(400).send({ Status: false, Message: "User Details is Required!" });
   } else if(!ReceivingData.PatientId || ReceivingData.PatientId === null){
      res.status(400).send({ Status: false, Message: "Patient Detail not valid!" });
   } else if(!ReceivingData.Hospital || ReceivingData.Hospital === null){
      res.status(400).send({ Status: false, Message: "Hospital Detail not valid!" });
   } else {

      const Create_PatientFibrinolyticChecklist = new PatientDetailsModel.PatientFibrinolyticChecklistSchema({
         PatientId: mongoose.Types.ObjectId(ReceivingData.PatientId),
         Hospital: mongoose.Types.ObjectId(ReceivingData.Hospital),
         Systolic_BP_greater_than_180_mmHg: ReceivingData.Systolic_BP_greater_than_180_mmHg || '',
         Diastolic_BP_greater_than_110_mmHg: ReceivingData.Diastolic_BP_greater_than_110_mmHg || '',
         Right_Left_arm_Systolic_BP_difference_greater_than_15_mmHg: ReceivingData.Right_Left_arm_Systolic_BP_difference_greater_than_15_mmHg || '',
         History_of_structural_central_nervous_system_disease: ReceivingData.History_of_structural_central_nervous_system_disease || '',
         Significant_closed_head_facial_trauma_within_the_previous_3_months: ReceivingData.Significant_closed_head_facial_trauma_within_the_previous_3_months || '',
         Recent_major_trauma_surgery_GI_GU_bleed: ReceivingData.Recent_major_trauma_surgery_GI_GU_bleed || '',
         Bleeding_or_Clotting_problem_or_on_blood_thinners: ReceivingData.Bleeding_or_Clotting_problem_or_on_blood_thinners || '',
         CPR_greater_than_10_min: ReceivingData.CPR_greater_than_10_min || '',
         Pregnant_Female: ReceivingData.Pregnant_Female || '',
         Serious_systemic_disease: ReceivingData.Serious_systemic_disease || '',
         Does_the_Patient_have_severe_heart_failure_or_cardiogenic_shock_such_that_PCI_is_preferable: ReceivingData.Does_the_Patient_have_severe_heart_failure_or_cardiogenic_shock_such_that_PCI_is_preferable || '',
         Pulmonary_edema: ReceivingData.Pulmonary_edema || '',
         Systemic_hypoperfusion: ReceivingData.Systemic_hypoperfusion || '',
			Other_contraindications_to_Lysis: ReceivingData.Other_contraindications_to_Lysis || '',
         Specify_Other_contraindications: ReceivingData.Specify_Other_contraindications || '',
         Active_Status: true,
         If_Deleted: false
      });
      Create_PatientFibrinolyticChecklist.save( function(err, result){
         if (err) {
            res.status(417).send({ Status: false, Message: "Some error occurred while Creating the New Patient Fibrinolytic Checklist!.", Error: err });
         } else {
            PatientDetailsModel.PatientFibrinolyticChecklistSchema.find({PatientId: mongoose.Types.ObjectId(ReceivingData.PatientId)}, {}, {'sort': { createdAt: 1 }})
            .populate({ path: 'Hospital', select: ['Hospital_Name', 'Address', 'Hospital_Role']})
            .exec(function(err1, result1) {
               if(err1) {
                  res.status(417).send({status: false, Message: "Some error occurred while Find The Patient Details!.", Error: err1 });
               } else {
                  res.status(200).send({Status: true, Response: result1 });
               }
            });
            const LastCompletionChild = ReceivingData.LastActiveTab;
            PatientDetailsModel.PatientBasicDetailsSchema.updateOne({_id: mongoose.Types.ObjectId(ReceivingData.PatientId), LastCompletionChild: 'Basic_Details'}, { $set: {LastCompletionChild: LastCompletionChild }}).exec();
         }
      });
   }
};
// Patient Fibrinolytic Checklist View---------------------------------------------------------
exports.PatientFibrinolyticChecklist_View= function(req, res) {
   var ReceivingData = req.body;
   if (!ReceivingData.User || ReceivingData.User === '') {
      res.status(400).send({ Status: false, Message: "User Details is Required!" });
   } else if (!ReceivingData.PatientId || ReceivingData.PatientId === '') {
      res.status(400).send({ Status: false, Message: "Patient Detail not valid!" });
   } else {
      PatientDetailsModel.PatientFibrinolyticChecklistSchema.find({PatientId: mongoose.Types.ObjectId(ReceivingData.PatientId)}, {}, {'sort': { createdAt: 1 }})
      .populate({ path: 'Hospital', select: ['Hospital_Name', 'Address', 'Hospital_Role']})
      .exec(function(err, result) {
         if(err) {
            res.status(417).send({status: false, Message: "Some error occurred while Find The Patient Details!.", Error: err });
         } else {
            res.status(200).send({Status: true, Response: result });
         }
      });
   }
};
// Patient Fibrinolytic Checklist Update----------------------------------------------
exports.PatientFibrinolyticChecklist_Update = function(req, res){
   var ReceivingData = req.body;

   if(!ReceivingData.User || ReceivingData.User === null){
      res.status(400).send({ Status: false, Message: "User Details is Required!" });
   } else if(!ReceivingData.PatientId || ReceivingData.PatientId === null){
      res.status(400).send({ Status: false, Message: "Patient Detail not valid!" });
   } else if(!ReceivingData.CheckListId || ReceivingData.CheckListId === null){
      res.status(400).send({ Status: false, Message: "Fibrinolytic CheckList Detail not valid!" });
   } else {
      PatientDetailsModel.PatientFibrinolyticChecklistSchema.findOne({_id: mongoose.Types.ObjectId(ReceivingData.CheckListId)}, {}, {}, function(err, result) {
         if (err) {
            res.status(417).send({ Status: false, Message: "Some error occurred while Find the Fibrinolytic CheckList!.", Error: err });
         } else if (result === null){
            res.status(400).send({ Status: false, Message: "Invalid Fibrinolytic CheckList Details!" });
         } else {

            result.Systolic_BP_greater_than_180_mmHg = ReceivingData.Systolic_BP_greater_than_180_mmHg || '';
            result.Diastolic_BP_greater_than_110_mmHg = ReceivingData.Diastolic_BP_greater_than_110_mmHg || '';
            result.Right_Left_arm_Systolic_BP_difference_greater_than_15_mmHg = ReceivingData.Right_Left_arm_Systolic_BP_difference_greater_than_15_mmHg || '';
            result.History_of_structural_central_nervous_system_disease = ReceivingData.History_of_structural_central_nervous_system_disease || '';
            result.Significant_closed_head_facial_trauma_within_the_previous_3_months = ReceivingData.Significant_closed_head_facial_trauma_within_the_previous_3_months || '';
            result.Recent_major_trauma_surgery_GI_GU_bleed = ReceivingData.Recent_major_trauma_surgery_GI_GU_bleed || '';
            result.Bleeding_or_Clotting_problem_or_on_blood_thinners = ReceivingData.Bleeding_or_Clotting_problem_or_on_blood_thinners || '';
            result.CPR_greater_than_10_min = ReceivingData.CPR_greater_than_10_min || '';
            result.Pregnant_Female = ReceivingData.Pregnant_Female || '';
            result.Serious_systemic_disease = ReceivingData.Serious_systemic_disease || '';
            result.Does_the_Patient_have_severe_heart_failure_or_cardiogenic_shock_such_that_PCI_is_preferable = ReceivingData.Does_the_Patient_have_severe_heart_failure_or_cardiogenic_shock_such_that_PCI_is_preferable || '';
            result.Pulmonary_edema = ReceivingData.Pulmonary_edema || '';
            result.Systemic_hypoperfusion = ReceivingData.Systemic_hypoperfusion || '';
				result.Other_contraindications_to_Lysis = ReceivingData.Other_contraindications_to_Lysis || '';
				result.Specify_Other_contraindications = ReceivingData.Specify_Other_contraindications || '';
            result.save( function(errNew, resultNew){
               if (errNew) {
                  res.status(417).send({ Status: false, Message: "Some error occurred while Update the Patient Fibrinolytic Checklist!.", Error: errNew });
               } else {
                  PatientDetailsModel.PatientFibrinolyticChecklistSchema.find({PatientId: mongoose.Types.ObjectId(ReceivingData.PatientId)}, {}, {'sort': { createdAt: 1 }})
                  .populate({ path: 'Hospital', select: ['Hospital_Name', 'Address', 'Hospital_Role']})
                  .exec(function(err1, result1) {
                     if(err1) {
                        res.status(417).send({status: false, Message: "Some error occurred while Find The Patient Details!.", Error: err1 });
                     } else {
                        const LastCompletionChild = ReceivingData.LastActiveTab;
                        if (LastCompletionChild !== undefined && LastCompletionChild !== null && LastCompletionChild !== '') {
                           PatientDetailsModel.PatientBasicDetailsSchema.updateOne(
                              {_id: mongoose.Types.ObjectId(ReceivingData.PatientId),
                                 $or: [ {LastCompletionChild: 'Fibrinolytic_Checklist'},
                                        {LastCompletionChild: 'Basic_Details'} ] },
                              { $set: {LastCompletionChild: LastCompletionChild }}).exec();
                        }
                        res.status(200).send({Status: true, Response: result1 });
                     }
                  });
               }
            });
         }
      });
   }
};
// Patient CheckList History Update----------------------------------------------
exports.PatientCheckList_Update = function(req, res) {
   var ReceivingData = req.body;

   if(!ReceivingData.Patient || ReceivingData.Patient === null) {
      res.status(400).send({ Status: false, Message: "Patient Detail not valid!" });
   } else if(!ReceivingData._id || ReceivingData._id === null) {
      res.status(400).send({ Status: false, Message: "Fibrinolytic CheckList Detail not valid!" });
   } else {
      PatientDetailsModel.PatientFibrinolyticChecklistSchema.findOne({_id: mongoose.Types.ObjectId(ReceivingData._id)}, {}, {}, function(err, result) {
         if (err) {
            res.status(417).send({ Status: false, Message: "Some error occurred while Find the Fibrinolytic CheckList!.", Error: err });
         } else if (result === null){
            res.status(400).send({ Status: false, Message: "Invalid Fibrinolytic CheckList Details!" });
         } else {

            result.Systolic_BP_greater_than_180_mmHg = ReceivingData.Systolic_BP_greater_than_180_mmHg || '';
            result.Diastolic_BP_greater_than_110_mmHg = ReceivingData.Diastolic_BP_greater_than_110_mmHg || '';
            result.Right_Left_arm_Systolic_BP_difference_greater_than_15_mmHg = ReceivingData.Right_Left_arm_Systolic_BP_difference_greater_than_15_mmHg || '';
            result.History_of_structural_central_nervous_system_disease = ReceivingData.History_of_structural_central_nervous_system_disease || '';
            result.Significant_closed_head_facial_trauma_within_the_previous_3_months = ReceivingData.Significant_closed_head_facial_trauma_within_the_previous_3_months || '';
            result.Recent_major_trauma_surgery_GI_GU_bleed = ReceivingData.Recent_major_trauma_surgery_GI_GU_bleed || '';
            result.Bleeding_or_Clotting_problem_or_on_blood_thinners = ReceivingData.Bleeding_or_Clotting_problem_or_on_blood_thinners || '';
            result.CPR_greater_than_10_min = ReceivingData.CPR_greater_than_10_min || '';
            result.Pregnant_Female = ReceivingData.Pregnant_Female || '';
            result.Serious_systemic_disease = ReceivingData.Serious_systemic_disease || '';
            result.Does_the_Patient_have_severe_heart_failure_or_cardiogenic_shock_such_that_PCI_is_preferable = ReceivingData.Does_the_Patient_have_severe_heart_failure_or_cardiogenic_shock_such_that_PCI_is_preferable || '';
            result.Pulmonary_edema = ReceivingData.Pulmonary_edema || '';
            result.Systemic_hypoperfusion = ReceivingData.Systemic_hypoperfusion || '';
				result.Other_contraindications_to_Lysis = ReceivingData.Other_contraindications_to_Lysis || '';
				result.Specify_Other_contraindications = ReceivingData.Specify_Other_contraindications || '';
            result.save( function(errNew, resultNew){
               if (errNew) {
                  res.status(417).send({ Status: false, Message: "Some error occurred while Update the Patient Fibrinolytic Checklist!.", Error: errNew });
               } else {
                  res.status(200).send({Status: true, Response: resultNew });
               }
            });
         }
      });
   }
};

// Patient Checklist History Create----------------------------------------------
exports.PatientChecklist_Create = function(req, res) {
   var ReceivingData = req.body;

   if(!ReceivingData.Patient || ReceivingData.Patient === null){
      res.status(400).send({ Status: false, Message: "Patient Detail not valid!" });
   } else if(!ReceivingData.Hospital || ReceivingData.Hospital === null){
      res.status(400).send({ Status: false, Message: "Hospital Detail not valid!" });
   } else {
      const Create_PatientFibrinolyticChecklist = new PatientDetailsModel.PatientFibrinolyticChecklistSchema({
         PatientId: mongoose.Types.ObjectId(ReceivingData.Patient),
         Hospital: mongoose.Types.ObjectId(ReceivingData.Hospital),
         Systolic_BP_greater_than_180_mmHg: ReceivingData.Systolic_BP_greater_than_180_mmHg || '',
         Diastolic_BP_greater_than_110_mmHg: ReceivingData.Diastolic_BP_greater_than_110_mmHg || '',
         Right_Left_arm_Systolic_BP_difference_greater_than_15_mmHg: ReceivingData.Right_Left_arm_Systolic_BP_difference_greater_than_15_mmHg || '',
         History_of_structural_central_nervous_system_disease: ReceivingData.History_of_structural_central_nervous_system_disease || '',
         Significant_closed_head_facial_trauma_within_the_previous_3_months: ReceivingData.Significant_closed_head_facial_trauma_within_the_previous_3_months || '',
         Recent_major_trauma_surgery_GI_GU_bleed: ReceivingData.Recent_major_trauma_surgery_GI_GU_bleed || '',
         Bleeding_or_Clotting_problem_or_on_blood_thinners: ReceivingData.Bleeding_or_Clotting_problem_or_on_blood_thinners || '',
         CPR_greater_than_10_min: ReceivingData.CPR_greater_than_10_min || '',
         Pregnant_Female: ReceivingData.Pregnant_Female || '',
         Serious_systemic_disease: ReceivingData.Serious_systemic_disease || '',
         Does_the_Patient_have_severe_heart_failure_or_cardiogenic_shock_such_that_PCI_is_preferable: ReceivingData.Does_the_Patient_have_severe_heart_failure_or_cardiogenic_shock_such_that_PCI_is_preferable || '',
         Pulmonary_edema: ReceivingData.Pulmonary_edema || '',
         Systemic_hypoperfusion: ReceivingData.Systemic_hypoperfusion || '',
			Other_contraindications_to_Lysis: ReceivingData.Other_contraindications_to_Lysis || '',
			Specify_Other_contraindications: ReceivingData.Specify_Other_contraindications || '',
         Active_Status: true,
         If_Deleted: false
      });
      Create_PatientFibrinolyticChecklist.save( function(err, result){
         if (err) {
            res.status(417).send({ Status: false, Message: "Some error occurred while Creating the Patient Fibrinolytic Checklist!.", Error: err });
         } else {
            const LastCompletionChild = ReceivingData.LastActiveTab;
            PatientDetailsModel.PatientBasicDetailsSchema.updateOne({_id: mongoose.Types.ObjectId(ReceivingData.PatientId), LastCompletionChild: 'Basic_Details'}, { $set: {LastCompletionChild: LastCompletionChild }}).exec();
            res.status(200).send({Status: true, Response: result });
         }
      });
   }
};


// Patient Medication During Transportation Create------------------------------------
exports.PatientMedicationDuringTransportation_Create = function(req, res){
   var ReceivingData = req.body;

   if(!ReceivingData.User || ReceivingData.User === null){
      res.status(400).send({ Status: false, Message: "User Details is Required!" });
   } else if(!ReceivingData.PatientId || ReceivingData.PatientId === null){
      res.status(400).send({ Status: false, Message: "Patient Detail not valid!" });
   } else if(!ReceivingData.Hospital || ReceivingData.Hospital === null){
      res.status(400).send({ Status: false, Message: "Hospital Detail not valid!" });
   } else {
      const Create_PatientMedicationTransportation = new PatientDetailsModel.PatientMedicationTransportationSchema({
         PatientId: mongoose.Types.ObjectId(ReceivingData.PatientId),
         Hospital: mongoose.Types.ObjectId(ReceivingData.Hospital),
         Transportation_Medication_Oxygen: ReceivingData.Transportation_Medication_Oxygen || '',
         Transportation_Medication_Oxygen_Dosage: ReceivingData.Transportation_Medication_Oxygen_Dosage || '',
         Transportation_Medication_Aspirin: ReceivingData.Transportation_Medication_Aspirin || '',
         Transportation_Medication_Aspirin_Dosage: ReceivingData.Transportation_Medication_Aspirin_Dosage || '',
         Transportation_Medication_Aspirin_Dosage_Date_Time: ReceivingData.Transportation_Medication_Aspirin_Dosage_Date_Time || null,
         Transportation_Medication_Clopidogrel: ReceivingData.Transportation_Medication_Clopidogrel || '',
         Transportation_Medication_Clopidogrel_Dosage: ReceivingData.Transportation_Medication_Clopidogrel_Dosage || '',
         Transportation_Medication_Clopidogrel_Dosage_Date_Time: ReceivingData.Transportation_Medication_Clopidogrel_Dosage_Date_Time || null,
         Transportation_Medication_Prasugrel: ReceivingData.Transportation_Medication_Prasugrel || '',
         Transportation_Medication_Prasugrel_Dosage: ReceivingData.Transportation_Medication_Prasugrel_Dosage || '',
         Transportation_Medication_Prasugrel_Dosage_Date_Time: ReceivingData.Transportation_Medication_Prasugrel_Dosage_Date_Time || null,
         Transportation_Medication_Ticagrelor: ReceivingData.Transportation_Medication_Ticagrelor || '',
         Transportation_Medication_Ticagrelor_Dosage: ReceivingData.Transportation_Medication_Ticagrelor_Dosage || '',
         Transportation_Medication_Ticagrelor_Dosage_Date_Time: ReceivingData.Transportation_Medication_Ticagrelor_Dosage_Date_Time || null,
         Transportation_Medication_UnFractionated_Heparin: ReceivingData.Transportation_Medication_UnFractionated_Heparin || '',
         Transportation_Medication_UnFractionated_Heparin_Route: ReceivingData.Transportation_Medication_UnFractionated_Heparin_Route || '',
         UnFractionated_Heparin_Dosage: ReceivingData.UnFractionated_Heparin_Dosage || null,
         Transportation_Medication_UnFractionated_Heparin_Dosage_Units: ReceivingData.Transportation_Medication_UnFractionated_Heparin_Dosage_Units || '',
         Transportation_Medication_UnFractionated_Heparin_Date_Time: ReceivingData.Transportation_Medication_UnFractionated_Heparin_Date_Time || null,
         Transportation_Medication_LMW_Heparin: ReceivingData.Transportation_Medication_LMW_Heparin || '',
         Transportation_Medication_LMW_Heparin_Route: ReceivingData.Transportation_Medication_LMW_Heparin_Route || '',
         Transportation_Medication_LMW_Heparin_Dosage: ReceivingData.Transportation_Medication_LMW_Heparin_Dosage || null,
         Transportation_Medication_LMW_Heparin_Dosage_Units: ReceivingData.Transportation_Medication_LMW_Heparin_Dosage_Units || '',
         Transportation_Medication_LMW_Heparin_Date_Time: ReceivingData.Transportation_Medication_LMW_Heparin_Date_Time || null,
         N_Saline: ReceivingData.N_Saline || '',
         Nitroglycerin: ReceivingData.Nitroglycerin || '',
         Morphine: ReceivingData.Morphine || '',
         Atropine: ReceivingData.Atropine || '',
         Active_Status: true,
         If_Deleted: false
      });
      Create_PatientMedicationTransportation.save(function(err, result){
         if (err) {
            res.status(417).send({ Status: false, Message: "Some error occurred while Creating the New Patient Medication During Transportation!.", Error: err });
         } else {
            const LastCompletionChild = ReceivingData.LastActiveTab;
            PatientDetailsModel.PatientBasicDetailsSchema.updateOne(
               {_id: mongoose.Types.ObjectId(ReceivingData.PatientId),
                  $or: [ {LastCompletionChild: 'Fibrinolytic_Checklist'},
                         {LastCompletionChild: 'Basic_Details'} ] },
               { $set: {LastCompletionChild: LastCompletionChild }}).exec();
            res.status(200).send({ Status: true, Response: result });
         }
      });
   }
};
// Patient Medication During Transportation View---------------------------------------------------------
exports.PatientMedicationDuringTransportation_View= function(req, res) {
   var ReceivingData = req.body;

   if (!ReceivingData.User || ReceivingData.User === '') {
      res.status(400).send({ Status: false, Message: "User Details is Required!" });
   } else if (!ReceivingData.PatientId || ReceivingData.PatientId === '') {
      res.status(400).send({ Status: false, Message: "Patient Detail not valid!" });
   } else {
      PatientDetailsModel.PatientMedicationTransportationSchema.findOne({PatientId: mongoose.Types.ObjectId(ReceivingData.PatientId)}, {}, {})
      .exec(function(err, result) {
         if(err) {
            res.status(417).send({status: false, Message: "Some error occurred while Find The Patient Details!.", Error: err });
         } else {
            res.status(200).send({Status: true, Response: result });
         }
      });
   }
};
// Patient Medication During Transportation Update----------------------------------------------
exports.PatientMedicationDuringTransportation_Update = function(req, res){
   var ReceivingData = req.body;

   if(!ReceivingData.User || ReceivingData.User === null){
      res.status(400).send({ Status: false, Message: "User Details is Required!" });
   } else if(!ReceivingData.PatientId || ReceivingData.PatientId === null){
      res.status(400).send({ Status: false, Message: "Patient Detail not valid!" });
   } else if(!ReceivingData.TransportationId || ReceivingData.TransportationId === null){
      res.status(400).send({ Status: false, Message: "Medication During Transportation Detail not valid!" });
   } else {
      PatientDetailsModel.PatientMedicationTransportationSchema.findOne({_id: mongoose.Types.ObjectId(ReceivingData.TransportationId)}, {}, {}, function(err, result) {
         if (err) {
            res.status(417).send({ Status: false, Message: "Some error occurred while Find the Medication During Transportation!.", Error: err });
         } else if (result === null){
            res.status(400).send({ Status: false, Message: "Invalid Medication During Transportation Details!" });
         } else {

            result.Transportation_Medication_Oxygen = ReceivingData.Transportation_Medication_Oxygen || '';
            result.Transportation_Medication_Oxygen_Dosage = ReceivingData.Transportation_Medication_Oxygen_Dosage || '';
            result.Transportation_Medication_Aspirin = ReceivingData.Transportation_Medication_Aspirin || '';
            result.Transportation_Medication_Aspirin_Dosage = ReceivingData.Transportation_Medication_Aspirin_Dosage || '';
            result.Transportation_Medication_Aspirin_Dosage_Date_Time = ReceivingData.Transportation_Medication_Aspirin_Dosage_Date_Time || null;
            result.Transportation_Medication_Clopidogrel = ReceivingData.Transportation_Medication_Clopidogrel || '';
            result.Transportation_Medication_Clopidogrel_Dosage = ReceivingData.Transportation_Medication_Clopidogrel_Dosage || '';
            result.Transportation_Medication_Clopidogrel_Dosage_Date_Time = ReceivingData.Transportation_Medication_Clopidogrel_Dosage_Date_Time || null;
            result.Transportation_Medication_Prasugrel = ReceivingData.Transportation_Medication_Prasugrel || '';
            result.Transportation_Medication_Prasugrel_Dosage = ReceivingData.Transportation_Medication_Prasugrel_Dosage || '';
            result.Transportation_Medication_Prasugrel_Dosage_Date_Time = ReceivingData.Transportation_Medication_Prasugrel_Dosage_Date_Time || null;
            result.Transportation_Medication_Ticagrelor = ReceivingData.Transportation_Medication_Ticagrelor || '';
            result.Transportation_Medication_Ticagrelor_Dosage = ReceivingData.Transportation_Medication_Ticagrelor_Dosage || '';
            result.Transportation_Medication_Ticagrelor_Dosage_Date_Time = ReceivingData.Transportation_Medication_Ticagrelor_Dosage_Date_Time || null;
            result.Transportation_Medication_UnFractionated_Heparin = ReceivingData.Transportation_Medication_UnFractionated_Heparin || '';
            result.Transportation_Medication_UnFractionated_Heparin_Route = ReceivingData.Transportation_Medication_UnFractionated_Heparin_Route || '';
            result.UnFractionated_Heparin_Dosage = ReceivingData.UnFractionated_Heparin_Dosage || null;
            result.Transportation_Medication_UnFractionated_Heparin_Dosage_Units = ReceivingData.Transportation_Medication_UnFractionated_Heparin_Dosage_Units || '';
            result.Transportation_Medication_UnFractionated_Heparin_Date_Time = ReceivingData.Transportation_Medication_UnFractionated_Heparin_Date_Time || null;
            result.Transportation_Medication_LMW_Heparin = ReceivingData.Transportation_Medication_LMW_Heparin || '';
            result.Transportation_Medication_LMW_Heparin_Route = ReceivingData.Transportation_Medication_LMW_Heparin_Route || '';
            result.Transportation_Medication_LMW_Heparin_Dosage = ReceivingData.Transportation_Medication_LMW_Heparin_Dosage || null;
            result.Transportation_Medication_LMW_Heparin_Dosage_Units = ReceivingData.Transportation_Medication_LMW_Heparin_Dosage_Units || '';
            result.Transportation_Medication_LMW_Heparin_Date_Time = ReceivingData.Transportation_Medication_LMW_Heparin_Date_Time || null;
            result.N_Saline = ReceivingData.N_Saline || '';
            result.Nitroglycerin = ReceivingData.Nitroglycerin || '';
            result.Morphine = ReceivingData.Morphine || '';
            result.Atropine = ReceivingData.Atropine || '';            
            result.save( function(errNew, resultNew){
               if (errNew) {
                  res.status(417).send({ Status: false, Message: "Some error occurred while update the Medication During Transportation!.", Error: errNew });
               } else {
                  res.status(200).send({ Status: true, Response: resultNew });
               }
            });
         }
      });
   }
};


//Patient Cardiac History Create-----------------------------------------------------------------------------
exports.PatientCardiacHistory_Create = function(req, res){
   var ReceivingData = req.body;

   if(!ReceivingData.User || ReceivingData.User === null){
      res.status(400).send({ Status: false, Message: "User Details is Required!" });
   } else if(!ReceivingData.PatientId || ReceivingData.PatientId === null){
      res.status(400).send({ Status: false, Message: "Patient Detail not valid!" });
   } else if(!ReceivingData.Hospital || ReceivingData.Hospital === null){
      res.status(400).send({ Status: false, Message: "Hospital Detail not valid!" });
   } else {
      if (ReceivingData.Location_of_Pain !== undefined && typeof ReceivingData.Location_of_Pain === 'object' && ReceivingData.Location_of_Pain !== null && ReceivingData.Location_of_Pain !== '') {
         var Location_of_Pain = [];
         Location_of_Pain = ReceivingData.Location_of_Pain;
         ReceivingData.Location_of_Pain = Location_of_Pain.join(',');
      } else {
         ReceivingData.Location_of_Pain = '';
      }
      const Create_PatientCardiacHistory = new PatientDetailsModel.PatientCardiacHistorySchema({
         PatientId: mongoose.Types.ObjectId(ReceivingData.PatientId),
         Hospital: mongoose.Types.ObjectId(ReceivingData.Hospital),
         Previous_MI: ReceivingData.Previous_MI || '',
         Previous_MI1: ReceivingData.Previous_MI1 || '',
         Previous_MI1_Date: ReceivingData.Previous_MI1_Date || null,
         Previous_MI1_Details: ReceivingData.Previous_MI1_Details || '',
         Previous_MI2: ReceivingData.Previous_MI2 || '',
         Previous_MI2_Date: ReceivingData.Previous_MI2_Date || null,
         Previous_MI2_Details: ReceivingData.Previous_MI2_Details || '',
         Cardiac_History_Angina: ReceivingData.Cardiac_History_Angina || '',
         Cardiac_History_Angina_Duration_Years: ReceivingData.Cardiac_History_Angina_Duration_Years || null,
         Cardiac_History_Angina_Duration_Month: ReceivingData.Cardiac_History_Angina_Duration_Month || null,
         CABG: ReceivingData.CABG || '',
         CABG_Date: ReceivingData.CABG_Date || null,
			Cardiac_History_PCI: ReceivingData.Cardiac_History_PCI || '',
         PCI1: ReceivingData.PCI1 || '',
         PCI_Date: ReceivingData.PCI_Date || null,
         PCI1_Details: ReceivingData.PCI1_Details || '',
         PCI2: ReceivingData.PCI2 || '',
         PCI2_Date: ReceivingData.PCI2_Date || null,
         PCI2_Details: ReceivingData.PCI2_Details || '',
			PCI3: ReceivingData.PCI3 || '',
         PCI3_Date: ReceivingData.PCI3_Date || null,
			PCI4: ReceivingData.PCI4 || '',
         PCI4_Date: ReceivingData.PCI4_Date || null,
         Chest_Discomfort: ReceivingData.Chest_Discomfort || '',
         Duration_of_Pain_Date_Time: ReceivingData.Duration_of_Pain_Date_Time || null,
         Location_of_Pain: ReceivingData.Location_of_Pain || '',
         Pain_Severity: ReceivingData.Pain_Severity || '',
         Palpitation: ReceivingData.Palpitation || null,
         Pallor: ReceivingData.Pallor || null,
         Diaphoresis: ReceivingData.Diaphoresis || null,
         Shortness_of_breath: ReceivingData.Shortness_of_breath || null,
         Nausea_Vomiting: ReceivingData.Nausea_Vomiting || null,
         Dizziness: ReceivingData.Dizziness || null,
         Syncope: ReceivingData.Syncope || null,
         Active_Status: true,
         If_Deleted: false
      });
      Create_PatientCardiacHistory.save(function(err, result){
         if (err) {
            res.status(417).send({ Status: false, Message: "Some error occurred while Creating the New Patient Cardiac History!.", Error: err });
         } else {
            result = JSON.parse(JSON.stringify(result));
            var Location_of_Pain = [];
            Location_of_Pain = result.Location_of_Pain.split(',');
            result.Location_of_Pain = Location_of_Pain;
            PatientDetailsModel.PatientBasicDetailsSchema.updateOne(
               {_id: mongoose.Types.ObjectId(ReceivingData.PatientId),
                  $or: [ {LastCompletionChild: 'Medication_During_Transportation'},
                         {LastCompletionChild: 'Fibrinolytic_Checklist'},
                         {LastCompletionChild: 'Basic_Details'} ] },
               { $set: {LastCompletionChild: 'Cardiac_History' }}).exec();
            res.status(200).send({ Status: true, Response: result });
         }
      });
   }
};
// Patient Cardiac History View---------------------------------------------------------
exports.PatientCardiacHistory_View= function(req, res) {
   var ReceivingData = req.body;

   if (!ReceivingData.User || ReceivingData.User === '') {
      res.status(400).send({ Status: false, Message: "User Details is Required!" });
   } else if (!ReceivingData.PatientId || ReceivingData.PatientId === '') {
      res.status(400).send({ Status: false, Message: "Patient Detail not valid!" });
   } else {
      PatientDetailsModel.PatientCardiacHistorySchema.findOne({PatientId: mongoose.Types.ObjectId(ReceivingData.PatientId)}, {}, {})
      .exec(function(err, result) {
         if(err) {
            res.status(417).send({status: false, Message: "Some error occurred while Find The Patient Cardiac History!.", Error: err });
         } else {
            var Location_of_Pain = [];
            if (result !== null) {
               result = JSON.parse(JSON.stringify(result));
               Location_of_Pain = result.Location_of_Pain.split(',');
               result.Location_of_Pain = Location_of_Pain;
            }
            res.status(200).send({Status: true, Response: result });
         }
      });
   }
};
// Patient Cardiac History Update----------------------------------------------
exports.PatientCardiacHistory_Update = function(req, res){
   var ReceivingData = req.body;

   if(!ReceivingData.User || ReceivingData.User === null){
      res.status(400).send({ Status: false, Message: "User Details is Required!" });
   } else if(!ReceivingData.PatientId || ReceivingData.PatientId === null){
      res.status(400).send({ Status: false, Message: "Patient Detail not valid!" });
   } else if(!ReceivingData.CardiacHistoryId || ReceivingData.CardiacHistoryId === null){
      res.status(400).send({ Status: false, Message: "Cardiac History Detail not valid!" });
   } else {
      PatientDetailsModel.PatientCardiacHistorySchema.findOne({_id: mongoose.Types.ObjectId(ReceivingData.CardiacHistoryId)}, {}, {}, function(err, result) {
         if (err) {
            res.status(417).send({ Status: false, Message: "Some error occurred while Find the Cardiac History!.", Error: err });
         } else if (result === null){
            res.status(400).send({ Status: false, Message: "Invalid Cardiac History Details!" });
         } else {

            if (ReceivingData.Location_of_Pain !== undefined && typeof ReceivingData.Location_of_Pain === 'object' && ReceivingData.Location_of_Pain !== null && ReceivingData.Location_of_Pain !== '') {
               var Location_of_Pain = [];
               Location_of_Pain = ReceivingData.Location_of_Pain;
               ReceivingData.Location_of_Pain = Location_of_Pain.join(',');
            } else {
               ReceivingData.Location_of_Pain = '';
            }

            result.Previous_MI = ReceivingData.Previous_MI || '';
            result.Previous_MI1 = ReceivingData.Previous_MI1 || '';
            result.Previous_MI1_Date = ReceivingData.Previous_MI1_Date || null;
            result.Previous_MI1_Details = ReceivingData.Previous_MI1_Details || '';
            result.Previous_MI2 = ReceivingData.Previous_MI2 || '';
            result.Previous_MI2_Date = ReceivingData.Previous_MI2_Date || null;
            result.Previous_MI2_Details = ReceivingData.Previous_MI2_Details || '';
            result.Cardiac_History_Angina = ReceivingData.Cardiac_History_Angina || '';
            result.Cardiac_History_Angina_Duration_Years = ReceivingData.Cardiac_History_Angina_Duration_Years || null;
            result.Cardiac_History_Angina_Duration_Month = ReceivingData.Cardiac_History_Angina_Duration_Month || null;
            result.CABG = ReceivingData.CABG || '';
            result.CABG_Date = ReceivingData.CABG_Date || null;
				result.Cardiac_History_PCI = ReceivingData.Cardiac_History_PCI || '';
            result.PCI1 = ReceivingData.PCI1 || '';
            result.PCI_Date = ReceivingData.PCI_Date || null;
            result.PCI1_Details = ReceivingData.PCI1_Details || '';
            result.PCI2 = ReceivingData.PCI2 || '';
            result.PCI2_Date = ReceivingData.PCI2_Date || null;
				result.PCI3 = ReceivingData.PCI3 || '';
            result.PCI3_Date = ReceivingData.PCI3_Date || null;
				result.PCI4 = ReceivingData.PCI4 || '';
            result.PCI4_Date = ReceivingData.PCI4_Date || null;
            result.PCI2_Details = ReceivingData.PCI2_Details || '';
            result.Chest_Discomfort = ReceivingData.Chest_Discomfort || '';
            result.Duration_of_Pain_Date_Time = ReceivingData.Duration_of_Pain_Date_Time || null;
            result.Location_of_Pain = ReceivingData.Location_of_Pain || '';
            result.Pain_Severity = ReceivingData.Pain_Severity || '';
            result.Palpitation = ReceivingData.Palpitation || null;
            result.Pallor = ReceivingData.Pallor || null;
            result.Diaphoresis = ReceivingData.Diaphoresis || null;
            result.Shortness_of_breath = ReceivingData.Shortness_of_breath || null;
            result.Nausea_Vomiting = ReceivingData.Nausea_Vomiting || null;
            result.Dizziness = ReceivingData.Dizziness || null;
            result.Syncope = ReceivingData.Syncope || null;
            
            result.save( function(errNew, resultNew) {
               if (errNew) {
                  res.status(417).send({ Status: false, Message: "Some error occurred while update the Cardiac History!.", Error: errNew });
               } else {
                  resultNew = JSON.parse(JSON.stringify(resultNew));
                  var Location_of_Pain = [];
                  Location_of_Pain = resultNew.Location_of_Pain.split(',');
                  resultNew.Location_of_Pain = Location_of_Pain;
                  res.status(200).send({ Status: true, Response: resultNew });
               }
            });
         }
      });
   }
};


// Patient Co-Morbid Conditions Create
exports.PatientCoMorbidCondition_Create = function(req, res){
   var ReceivingData = req.body;

   if(!ReceivingData.User || ReceivingData.User === null){
      res.status(400).send({ Status: false, Message: "User Details is Required!" });
   } else if(!ReceivingData.PatientId || ReceivingData.PatientId === null){
      res.status(400).send({ Status: false, Message: "Patient Detail not valid!" });
   } else if(!ReceivingData.Hospital || ReceivingData.Hospital === null){
      res.status(400).send({ Status: false, Message: "Hospital Detail not valid!" });
   } else {
      const Create_PatientCoMorbidCondition = new PatientDetailsModel.PatientCoMorbidConditionSchema({
         PatientId: mongoose.Types.ObjectId(ReceivingData.PatientId),
         Hospital: mongoose.Types.ObjectId(ReceivingData.Hospital),
         Smoker: ReceivingData.Smoker || '',
         Beedies: ReceivingData.Beedies || null,
         Cigarettes: ReceivingData.Cigarettes || null,
         Number_of_Beedies: ReceivingData.Number_of_Beedies || null,
         Number_of_Beedies_Duration_Years: ReceivingData.Number_of_Beedies_Duration_Years || null,
         Number_of_Beedies_Duration_Months: ReceivingData.Number_of_Beedies_Duration_Months || null,
         Number_of_Cigarettes: ReceivingData.Number_of_Cigarettes || null,
         Number_of_Cigarettes_Duration_Years: ReceivingData.Number_of_Cigarettes_Duration_Years || null,
         Number_of_Cigarettes_Duration_Months: ReceivingData.Number_of_Cigarettes_Duration_Months || null,
			Recreational_Drugs: ReceivingData.Recreational_Drugs || '',
         Previous_IHD: ReceivingData.Previous_IHD || '',
         Diabetes_Mellitus: ReceivingData.Diabetes_Mellitus || '',
         High_Cholesterol: ReceivingData.High_Cholesterol || '',
         On_Statin_Therapy: ReceivingData.On_Statin_Therapy || '',
         HIV: ReceivingData.HIV || '',
         On_ART: ReceivingData.On_ART || '',
         Duration_Years: ReceivingData.Duration_Years || null,
         Duration_Months: ReceivingData.Duration_Months || null,
         OHA: ReceivingData.OHA || '',
         Insulin: ReceivingData.Insulin || '',
         Family_history_of_IHD: ReceivingData.Family_history_of_IHD || '',
         Hypertension: ReceivingData.Hypertension || '',
         Hypertension_Duration_Years: ReceivingData.Hypertension_Duration_Years || null,
         Hypertension_Duration_Months: ReceivingData.Hypertension_Duration_Months || null,
         Hypertension_Medications: ReceivingData.Hypertension_Medications || null,
         Hypertension_Medications_Details: ReceivingData.Hypertension_Medications_Details || '',
         Dyslipidemia: ReceivingData.Dyslipidemia || '',
         Dyslipidemia_Medications: ReceivingData.Dyslipidemia_Medications || null,
         Dyslipidemia_Medications_Details: ReceivingData.Dyslipidemia_Medications_Details || '',
         Peripheral_Vascular_Disease: ReceivingData.Peripheral_Vascular_Disease || '',
         Stroke: ReceivingData.Stroke || '',
         Bronchial_Asthma: ReceivingData.Bronchial_Asthma || '',
         Allergies: ReceivingData.Allergies || '',
         Allergy_Details: ReceivingData.Allergy_Details || '',
			Previous_History_of_PreMature_CAD: ReceivingData.Previous_History_of_PreMature_CAD || '',
         Active_Status: true,
         If_Deleted: false
      });
      Create_PatientCoMorbidCondition.save(function(err, result){
         if (err) {
            res.status(417).send({ Status: false, Message: "Some error occurred while Creating the New Patient Co-Morbid Conditions!.", Error: err });
         } else {
            PatientDetailsModel.PatientBasicDetailsSchema.updateOne(
               {_id: mongoose.Types.ObjectId(ReceivingData.PatientId),
                  $or: [ {LastCompletionChild: 'Medication_During_Transportation'},
                         {LastCompletionChild: 'Fibrinolytic_Checklist'},
                         {LastCompletionChild: 'Basic_Details'},
                         {LastCompletionChild: 'Cardiac_History'}] },
               { $set: {LastCompletionChild: 'Co-Morbid_Conditions' }}).exec();
            res.status(200).send({ Status: true, Response: result });
         }
      });
   }
};
// Patient Co-Morbid Conditions View---------------------------------------------------------
exports.PatientCoMorbidCondition_View= function(req, res) {
   var ReceivingData = req.body;

   if (!ReceivingData.User || ReceivingData.User === '') {
      res.status(400).send({ Status: false, Message: "User Details is Required!" });
   } else if (!ReceivingData.PatientId || ReceivingData.PatientId === '') {
      res.status(400).send({ Status: false, Message: "Patient Detail not valid!" });
   } else {
      PatientDetailsModel.PatientCoMorbidConditionSchema.findOne({PatientId: mongoose.Types.ObjectId(ReceivingData.PatientId)}, {}, {})
      .exec(function(err, result) {
         if(err) {
            res.status(417).send({status: false, Message: "Some error occurred while Find The Patient Co-Morbid Conditions!.", Error: err });
         } else {
            res.status(200).send({Status: true, Response: result });
         }
      });
   }
}; 
// Patient Co-Morbid Conditions Update----------------------------------------------
exports.PatientCoMorbidCondition_Update = function(req, res){
   var ReceivingData = req.body;

   if(!ReceivingData.User || ReceivingData.User === null){
      res.status(400).send({ Status: false, Message: "User Details is Required!" });
   } else if(!ReceivingData.PatientId || ReceivingData.PatientId === null){
      res.status(400).send({ Status: false, Message: "Patient Detail not valid!" });
   } else if(!ReceivingData.CoMorbidConditionId || ReceivingData.CoMorbidConditionId === null){
      res.status(400).send({ Status: false, Message: "Co-Morbid Condition Detail not valid!" });
   } else {
      PatientDetailsModel.PatientCoMorbidConditionSchema.findOne({_id: mongoose.Types.ObjectId(ReceivingData.CoMorbidConditionId)}, {}, {}, function(err, result) {
         if (err) {
            res.status(417).send({ Status: false, Message: "Some error occurred while Find the Co-Morbid Conditions!.", Error: err });
         } else if (result === null){
            res.status(400).send({ Status: false, Message: "Invalid Co-Morbid Condition Details!" });
         } else {

            result.Smoker = ReceivingData.Smoker || '';
            result.Beedies = ReceivingData.Beedies || null;
            result.Cigarettes = ReceivingData.Cigarettes || null;
            result.Number_of_Beedies = ReceivingData.Number_of_Beedies || null;
            result.Number_of_Beedies_Duration_Years = ReceivingData.Number_of_Beedies_Duration_Years || null;
            result.Number_of_Beedies_Duration_Months = ReceivingData.Number_of_Beedies_Duration_Months || null;
            result.Number_of_Cigarettes = ReceivingData.Number_of_Cigarettes || null;
            result.Number_of_Cigarettes_Duration_Years = ReceivingData.Number_of_Cigarettes_Duration_Years || null;
            result.Number_of_Cigarettes_Duration_Months = ReceivingData.Number_of_Cigarettes_Duration_Months || null;
				result.Recreational_Drugs = ReceivingData.Recreational_Drugs || '';
            result.Previous_IHD = ReceivingData.Previous_IHD || '';
            result.Diabetes_Mellitus = ReceivingData.Diabetes_Mellitus || '';
            result.High_Cholesterol = ReceivingData.High_Cholesterol || '',
            result.On_Statin_Therapy = ReceivingData.On_Statin_Therapy || '',
            result.HIV = ReceivingData.HIV || '',
            result.High_CholestOn_ARTerol = ReceivingData.On_ART || '',
            result.Duration_Years = ReceivingData.Duration_Years || null;
            result.Duration_Months = ReceivingData.Duration_Months || null;
            result.OHA = ReceivingData.OHA || '';
            result.Insulin = ReceivingData.Insulin || '';
            result.Family_history_of_IHD = ReceivingData.Family_history_of_IHD || '';
            result.Hypertension = ReceivingData.Hypertension || '';
            result.Hypertension_Duration_Years = ReceivingData.Hypertension_Duration_Years || null;
            result.Hypertension_Duration_Months = ReceivingData.Hypertension_Duration_Months || null;
            result.Hypertension_Medications = ReceivingData.Hypertension_Medications || null;
            result.Hypertension_Medications_Details = ReceivingData.Hypertension_Medications_Details || '';
            result.Dyslipidemia = ReceivingData.Dyslipidemia || '';
            result.Dyslipidemia_Medications = ReceivingData.Dyslipidemia_Medications || null;
            result.Dyslipidemia_Medications_Details = ReceivingData.Dyslipidemia_Medications_Details || '';
            result.Peripheral_Vascular_Disease = ReceivingData.Peripheral_Vascular_Disease || '';
            result.Stroke = ReceivingData.Stroke || '';
            result.Bronchial_Asthma = ReceivingData.Bronchial_Asthma || '';
            result.Allergies = ReceivingData.Allergies || '';
            result.Allergy_Details = ReceivingData.Allergy_Details || '';
				result.Previous_History_of_PreMature_CAD = ReceivingData.Previous_History_of_PreMature_CAD || '';

            result.save( function(errNew, resultNew){
               if (errNew) {
                  res.status(417).send({ Status: false, Message: "Some error occurred while update the Co-Morbid Conditions!.", Error: errNew });
               } else {
                  res.status(200).send({ Status: true, Response: resultNew });
               }
            });
         }
      });
   }
};


// Patient Contact Details Create
exports.PatientContactDetails_Create = function(req, res){
   var ReceivingData = req.body;

   if(!ReceivingData.User || ReceivingData.User === null){
      res.status(400).send({ Status: false, Message: "User Details is Required!" });
   } else if(!ReceivingData.PatientId || ReceivingData.PatientId === null){
      res.status(400).send({ Status: false, Message: "Patient Detail not valid!" });
   } else if(!ReceivingData.Hospital || ReceivingData.Hospital === null){
      res.status(400).send({ Status: false, Message: "Hospital Detail not valid!" });
   } else {
      const Create_PatientContactDetails = new PatientDetailsModel.PatientContactDetailsSchema({
         PatientId: mongoose.Types.ObjectId(ReceivingData.PatientId),
         Hospital: mongoose.Types.ObjectId(ReceivingData.Hospital),
         Contact_Phone_Number:ReceivingData.Contact_Phone_Number || null,
         Address:ReceivingData.Address || '',
         Relation_Name:ReceivingData.Relation_Name || '',
         Relation_Type:ReceivingData.Relation_Type || '',
         Contact_Details_Address2:ReceivingData.Contact_Details_Address2 || '',
         Contact_Details_City:ReceivingData.Contact_Details_City || '',
         Additional_Contact_No:ReceivingData.Additional_Contact_No || null,
         Occupation:ReceivingData.Occupation || '',
         Aadhaar_Card_No:ReceivingData.Aadhaar_Card_No || '',
         Select_Patient_Id_Proof:ReceivingData.Select_Patient_Id_Proof || '',
         Other_Proof_Name: ReceivingData.Other_Proof_Name || '',
         Upload_Aadhaar:ReceivingData.Upload_Aadhaar || '',
         Upload_Id_Proof:ReceivingData.Upload_Id_Proof || '',
         Active_Status: true,
         If_Deleted: false
      });
      Create_PatientContactDetails.save(function(err, result){
         if (err) {
            res.status(417).send({ Status: false, Message: "Some error occurred while Creating the New Patient Contact Details!.", Error: err });
         } else {
            PatientDetailsModel.PatientBasicDetailsSchema.updateOne(
               {_id: mongoose.Types.ObjectId(ReceivingData.PatientId),
                  $or: [ {LastCompletionChild: 'Medication_During_Transportation'},
                         {LastCompletionChild: 'Fibrinolytic_Checklist'},
                         {LastCompletionChild: 'Basic_Details'},
                         {LastCompletionChild: 'Cardiac_History'},
                         {LastCompletionChild: 'Co-Morbid_Conditions'} ] },
               { $set: {LastCompletionChild: 'Contact_Details' }}).exec();
            res.status(200).send({ Status: true, Response: result });
         }
      });
   }
};
// Patient Contact Details View---------------------------------------------------------
exports.PatientContactDetails_View= function(req, res) {
   var ReceivingData = req.body;

   if (!ReceivingData.User || ReceivingData.User === '') {
      res.status(400).send({ Status: false, Message: "User Details is Required!" });
   } else if (!ReceivingData.PatientId || ReceivingData.PatientId === '') {
      res.status(400).send({ Status: false, Message: "Patient Detail not valid!" });
   } else {
      PatientDetailsModel.PatientContactDetailsSchema.findOne({PatientId: mongoose.Types.ObjectId(ReceivingData.PatientId)}, {}, {})
      .exec(function(err, result) {
         if(err) {
            res.status(417).send({status: false, Message: "Some error occurred while Find The Patient Contact Details!.", Error: err });
         } else {
            res.status(200).send({Status: true, Response: result });
         }
      });
   }
};
// Patient Contact Details Update----------------------------------------------
exports.PatientContactDetails_Update = function(req, res){
   var ReceivingData = req.body;

   if(!ReceivingData.User || ReceivingData.User === null){
      res.status(400).send({ Status: false, Message: "User Details is Required!" });
   } else if(!ReceivingData.PatientId || ReceivingData.PatientId === null){
      res.status(400).send({ Status: false, Message: "Patient Detail not valid!" });
   } else if(!ReceivingData.ContactId || ReceivingData.ContactId === null){
      res.status(400).send({ Status: false, Message: "Contact Detail not valid!" });
   } else {
      PatientDetailsModel.PatientContactDetailsSchema.findOne({_id: mongoose.Types.ObjectId(ReceivingData.ContactId)}, {}, {}, function(err, result) {
         if (err) {
            res.status(417).send({ Status: false, Message: "Some error occurred while Find the Contact Details !.", Error: err });
         } else if (result === null){
            res.status(400).send({ Status: false, Message: "Invalid Contact Details!" });
         } else {

            result.Contact_Phone_Number = ReceivingData.Contact_Phone_Number || null;
            result.Address = ReceivingData.Address || '';
            result.Relation_Name = ReceivingData.Relation_Name || '';
            result.Relation_Type = ReceivingData.Relation_Type || '';
            result.Contact_Details_Address2 = ReceivingData.Contact_Details_Address2 || '';
            result.Contact_Details_City = ReceivingData.Contact_Details_City || '';
            result.Additional_Contact_No = ReceivingData.Additional_Contact_No || null;
            result.Occupation = ReceivingData.Occupation || '';
            result.Aadhaar_Card_No = ReceivingData.Aadhaar_Card_No || '';
            result.Select_Patient_Id_Proof = ReceivingData.Select_Patient_Id_Proof || '';
            result.Other_Proof_Name =  ReceivingData.Other_Proof_Name || '';
            result.Upload_Aadhaar = ReceivingData.Upload_Aadhaar || '';
            result.Upload_Id_Proof = ReceivingData.Upload_Id_Proof || '';
            
            result.save( function(errNew, resultNew){
               if (errNew) {
                  res.status(417).send({ Status: false, Message: "Some error occurred while update the Contact Details!.", Error: errNew });
               } else {
                  res.status(200).send({ Status: true, Response: resultNew });
               }
            });
         }
      });
   }
};



// ECG Files Array
exports.ECG_Files = function (req, res) {
   var ReceivingData = req.body;
   if (!ReceivingData.PatientId || ReceivingData.PatientId === '') {
      res.status(400).send({ Status: false, Message: "Patient Details can not be empty" });
   } else {
      PatientDetailsModel.PatientBasicDetailsSchema.findOne({ _id: ReceivingData.PatientId }, { All_ECG_Files: 1, Ninety_Min_ECG_Files: 1 }, {}, function (errNew, resultNEW) {
         if (errNew) {
            res.status(417).send({ Status: false, Message: "Some error occurred while Find the Patient Details!.", Error: errNew });
         } else {
            if (resultNEW !== null) {
               var ECG_Arrays = resultNEW.All_ECG_Files.concat(resultNEW.Ninety_Min_ECG_Files);
               res.status(200).send({ Status: true, Response: ECG_Arrays });
            } else {
               res.status(400).send({ Status: true, Message: "Invalid Patient Details" });
            }
         }
      });
   }
};
// User Update Follow-Up ECG
exports.Update_FollowUp_ECG = function (req, res) {
   var ReceivingData = req.body;
    if (!ReceivingData.Patient || ReceivingData.Patient === '') {
      res.status(400).send({ Success: false, Message: "Patient Details can not be empty" });
   } else if (!ReceivingData.ECG_File || ReceivingData.ECG_File === '') {
      res.status(400).send({ Success: false, Message: "ECG File can not be empty" });
   } else if (!ReceivingData.User || ReceivingData.User === '') {
      res.status(400).send({ Success: false, Message: "User Details can not be empty" });
   } else {
      ReceivingData.Patient = mongoose.Types.ObjectId(ReceivingData.Patient);
      PatientDetailsModel.PatientBasicDetailsSchema.findOne({ _id: ReceivingData.Patient, Active_Status: true, If_Deleted: false }, {}, {}).exec(function (error_2, result_2) {
         if (error_2) {
            res.status(417).send({ Success: false, Message: "Some error occurred while Find The Patient Details!.", Error: error_2 });
         } else {
            if (result_2 !== null) {
               var ECG_Arr = result_2.All_ECG_Files;
               const AddOn = (ECG_Arr.length !== undefined && ECG_Arr.length > 0) ? ECG_Arr.length + 1 : 1;
               var Date_Time = new Date();
               ECG_Arr.push({
                  "Name": Date_Time.valueOf() + '-Web-' + AddOn,
                  "ECG_File": ReceivingData.ECG_File,
                  "DateTime": Date_Time,
                  "Hospital": result_2.Initiated_Hospital
               });
               PatientDetailsModel.PatientBasicDetailsSchema
               .updateOne({ _id: ReceivingData.Patient }, { $set: { All_ECG_Files: ECG_Arr } })
               .exec(function (error3, result_3) {
                  if (error3) {
                     res.status(417).send({ Status: false, Message: "Some error occurred!.", Error: error3 });
                  } else {
                     PatientDetailsModel.PatientBasicDetailsSchema.findOne({ _id: ReceivingData.Patient }, { All_ECG_Files: 1, Ninety_Min_ECG_Files: 1 }, {}, function (errNew, resultNEW) {
                        if (errNew) {
                           res.status(417).send({ Status: false, Message: "Some error occurred while Find the Patient Details!.", Error: errNew });
                        } else {
                           if (resultNEW !== null) {
                              var ECG_Arrays = resultNEW.All_ECG_Files.concat(resultNEW.Ninety_Min_ECG_Files);
                              res.status(200).send({ Status: true, Response: ECG_Arrays });
                           } else {
                              res.status(400).send({ Status: true, Message: "Invalid Patient Details" });
                           }
                        }
                     });
                  }
               });
            } else {
               res.status(400).send({ Status: true, Message: "Invalid Patient Details" });
            }
         }
      });
   }
};
// User Update Ninety Min ECG
exports.Update_Ninety_Min_ECG = function (req, res) {
   var ReceivingData = req.body;
    if (!ReceivingData.Patient || ReceivingData.Patient === '') {
      res.status(400).send({ Success: false, Message: "Patient Details can not be empty" });
   } else if (!ReceivingData.ECG_File || ReceivingData.ECG_File === '') {
      res.status(400).send({ Success: false, Message: "ECG File can not be empty" });
   } else if (!ReceivingData.User || ReceivingData.User === '') {
      res.status(400).send({ Success: false, Message: "User Details can not be empty" });
   } else {
      ReceivingData.Patient = mongoose.Types.ObjectId(ReceivingData.Patient);
      PatientDetailsModel.PatientBasicDetailsSchema.findOne({ _id: ReceivingData.Patient, Active_Status: true, If_Deleted: false }, {}, {}).exec(function (error_2, result_2) {
         if (error_2) {
            res.status(417).send({ Success: false, Message: "Some error occurred while Find The Patient Details!.", Error: error_2 });
         } else {
            if (result_2 !== null) {
               var ECG_Arr = result_2.Ninety_Min_ECG_Files;
               var Date_Time = new Date();
               ECG_Arr.push({
                  "Name": Date_Time.valueOf() + '-90min',
                  "ECG_File": ReceivingData.ECG_File,
                  "DateTime": Date_Time,
                  "Hospital": result_2.Initiated_Hospital
               });
               PatientDetailsModel.PatientBasicDetailsSchema
               .updateOne({ _id: ReceivingData.Patient }, { $set: { Ninety_Min_ECG_Files: ECG_Arr } })
               .exec(function (error3, result_3) {
                  if (error3) {
                     res.status(417).send({ Status: false, Message: "Some error occurred!.", Error: error3 });
                  } else {
                     PatientDetailsModel.PatientBasicDetailsSchema.findOne({ _id: ReceivingData.Patient }, { All_ECG_Files: 1, Ninety_Min_ECG_Files: 1 }, {}, function (errNew, resultNEW) {
                        if (errNew) {
                           res.status(417).send({ Status: false, Message: "Some error occurred while Find the Patient Details!.", Error: errNew });
                        } else {
                           if (resultNEW !== null) {
                              var ECG_Arrays = resultNEW.All_ECG_Files.concat(resultNEW.Ninety_Min_ECG_Files);
                              res.status(200).send({ Status: true, Response: ECG_Arrays });
                           } else {
                              res.status(400).send({ Status: true, Message: "Invalid Patient Details" });
                           }
                        }
                     });
                  }
               });
            } else {
               res.status(400).send({ Status: true, Message: "Invalid Patient Details" });
            }
         }
      });
   }
};



// All Notifications List
exports.All_Notifications_List = function (req, res) {
   var ReceivingData = req.body;
   if (!ReceivingData.User_Type || ReceivingData.User_Type === '' || ReceivingData.User_Type !== 'PU') {
      res.status(400).send({ Status: false, Message: "User Details not Valid" });
   } else if (!ReceivingData.User || ReceivingData.User === '' || ReceivingData.User === null) {
      res.status(400).send({ Status: false, Message: "User Details can not be empty" });
   } else {
      ReceivingData.User = mongoose.Types.ObjectId(ReceivingData.User);
      NotificationModel.NotificationSchema.find({ User_ID: ReceivingData.User, $or: [ { Notification_Type: 'AskingRepeat_ECG_ByDoctor' },  { Notification_Type: 'Stemi_Confirmed_ByDoctor' }, { Notification_Type: 'STEMI_Patient_Transfer' }, { Notification_Type: 'New_BPL_Record' } ], Active_Status: true, If_Deleted: false }, {}, {})
      .populate({path: 'Patient_ID', select: ['Patient_Name', 'Patient_Age', 'Patient_Gender' ]})
      .populate({path: 'Confirmed_PatientId', select: ['Patient_Name', 'Patient_Age', 'Patient_Gender' ]})
      .populate({path: 'BPL_ID', select: ['Patient_Name', 'Patient_Age', 'Patient_Gender' ]})
      .exec(function (err, result) {
         if (err) {
            res.status(417).send({ Status: false, Message: "Some error occurred while Find The Notification Details!.", Error: err });
         } else {
            var Notification_Ids = [];
            result.map(obj => {
               Notification_Ids.push(obj._id);
            });
            NotificationModel.NotificationSchema.updateMany({ _id: { $in: Notification_Ids } }, { $set: { Message_Received: true } }).exec();
            res.status(200).send({ Status: true, Response: result });
         }
      });
   }
};
//Notification Counts
exports.Notification_Counts = function (req, res) {
   var ReceivingData = req.body;
   if (!ReceivingData.User_Type || ReceivingData.User_Type === '' || ReceivingData.User_Type !== 'PU') {
      res.status(400).send({ Status: false, Message: "User Details not Valid" });
   } else if (!ReceivingData.User || ReceivingData.User === '' || ReceivingData.User === null) {
      res.status(400).send({ Status: false, Message: "User Details can not be empty" });
   } else {
      ReceivingData.User = mongoose.Types.ObjectId(ReceivingData.User);
      NotificationModel.NotificationSchema.countDocuments({ User_ID: ReceivingData.User, $or: [{ Notification_Type: 'AskingRepeat_ECG_ByDoctor' },  { Notification_Type: 'Stemi_Confirmed_ByDoctor' }, { Notification_Type: 'STEMI_Patient_Transfer'}, { Notification_Type: 'New_BPL_Record' }], Message_Viewed: false, Active_Status: true, If_Deleted: false })
      .exec((err, result) => {
         if (err) {
            res.status(417).send({ Status: false, Message: "Some error occurred while Find The Notification Details!.", Error: err });
         } else {
            res.status(200).send({ Status: true, Response: result });
         }
      });
   }
};
// Notification Viewed
exports.Notifications_Viewed = function (req, res) {
   var ReceivingData = req.body;
   if (!ReceivingData.NotificationId || ReceivingData.NotificationId === '') {
      res.status(400).send({ Success: false, Message: "Notification Details can not be empty" });
   } else {
      ReceivingData.NotificationId = mongoose.Types.ObjectId(ReceivingData.NotificationId);
      NotificationModel.NotificationSchema.updateOne({ _id: ReceivingData.NotificationId }, { $set: { Message_Viewed: true } })
         .exec(function (err, result) {
            if (err) {
               res.status(417).send({ Success: false, Message: "Some error occurred while Find The Notification Details!.", Error: err });
            } else {
               NotificationModel.NotificationSchema.find({ User_ID: ReceivingData.User, $or: [ { Notification_Type: 'AskingRepeat_ECG_ByDoctor' },  { Notification_Type: 'Stemi_Confirmed_ByDoctor' }, { Notification_Type: 'STEMI_Patient_Transfer' }, { Notification_Type: 'New_BPL_Record' }], Active_Status: true, If_Deleted: false }, {}, {})
               .populate({path: 'Patient_ID', select: ['Patient_Name', 'Patient_Age', 'Patient_Gender' ]})
               .populate({path: 'Confirmed_PatientId', select: ['Patient_Name', 'Patient_Age', 'Patient_Gender' ]})
               .populate({path: 'BPL_ID', select: ['Patient_Name', 'Patient_Age', 'Patient_Gender' ]})
               .exec(function (err1, result1) {
                  if (err1) {
                     res.status(417).send({ Status: false, Message: "Some error occurred while Find The Notification Details!.", Error: err1 });
                  } else {
                     var Notification_Ids = [];
                     result1.map(obj => {
                        Notification_Ids.push(obj._id);
                     });
                     NotificationModel.NotificationSchema.updateMany({ _id: { $in: Notification_Ids } }, { $set: { Message_Received: true } }).exec();
                     res.status(200).send({ Status: true, Response: result1 });
                  }
               });
            }
         });
   }
};
// User Viewed Notifications Delete
exports.Viewed_Notifications_Delete = function (req, res) {
   var ReceivingData = req.body;
   if (!ReceivingData.User || ReceivingData.User === '') {
      res.status(400).send({ Success: false, Message: "User Details can not be empty" });
   } else {
      ReceivingData.User = mongoose.Types.ObjectId(ReceivingData.User);
      NotificationModel.NotificationSchema.updateMany({ User_ID: ReceivingData.User, Message_Viewed: true }, { $set: { If_Deleted: true } })
         .exec(function (err, result) {
            if (err) {
               res.status(417).send({ Success: false, Message: "Some error occurred while Find The Notification Details!.", Error: err });
            } else {
               NotificationModel.NotificationSchema.find({ User_ID: ReceivingData.User, $or: [ { Notification_Type: 'AskingRepeat_ECG_ByDoctor' },  { Notification_Type: 'Stemi_Confirmed_ByDoctor' }, { Notification_Type: 'STEMI_Patient_Transfer' }, { Notification_Type: 'New_BPL_Record' }], Active_Status: true, If_Deleted: false }, {}, {})
               .populate({path: 'Patient_ID', select: ['Patient_Name', 'Patient_Age', 'Patient_Gender' ]})
               .populate({path: 'Confirmed_PatientId', select: ['Patient_Name', 'Patient_Age', 'Patient_Gender' ]})
               .populate({path: 'BPL_ID', select: ['Patient_Name', 'Patient_Age', 'Patient_Gender' ]})
               .exec(function (err1, result1) {
                  if (err1) {
                     res.status(417).send({ Status: false, Message: "Some error occurred while Find The Notification Details!.", Error: err1 });
                  } else {
                     var Notification_Ids = [];
                     result1.map(obj => {
                        Notification_Ids.push(obj._id);
                     });
                     NotificationModel.NotificationSchema.updateMany({ _id: { $in: Notification_Ids } }, { $set: { Message_Received: true } }).exec();
                     res.status(200).send({ Status: true, Response: result1 });
                  }
               });
            }
         });
   }
};


//Load Basic Page Files
exports.LoadBasicPage_Files = function (req, res) {
   var ReceivingData = req.body;
   if (!ReceivingData.Patient || ReceivingData.Patient === '') {
      res.status(400).send({ Status: false, Message: "Patient Details can not be empty" });
   } else {
      PatientDetailsModel.PatientBasicDetailsSchema.findOne({ _id: ReceivingData.Patient }, { ECG_File: 1, consent_form: 1 }, {}, function (errNew, resultNEW) {
         if (errNew) {
            res.status(417).send({ Status: false, Message: "Some error occurred while Find the Patient Details!.", Error: errNew });
         } else {
            if (resultNEW !== null) {
					res.status(200).send({ Status: true, Response: resultNEW });
            } else {
               res.status(400).send({ Status: true, Message: "Invalid Patient Details" });
            }
         }
      });
   }
};

// ECG_File download && ECG_File count && ECG_File Crop

exports.AllpatientECG_Count = async(req, res) => {
   try {
      let resultData = await PatientDetailsModel.PatientBasicDetailsSchema.aggregate([
         { $match: { ECG_Taken_Type: "Manual", ECG_File: 'Available' } },
         { $project: { Patient_Name: 1, ECG_Taken_Type: 1, ECG_File: 1, All_ECG_Files: 1 } },
       ]);

       let ECG_ReportCount = await patient_detailsModel.PatientBasicDetailsSchema.aggregate([
         { $match: { ECG_Taken_Type: "Manual", ECG_File: 'Available' } },
          { $count: "All_ECG_Files" },
       ]);
       console.log(ECG_ReportCount);
       return res.status(200).json({ Status: true, Message: "All Patients ECG Report listed Successfully", ResponseData: resultData, ECG_ReportCount: ECG_ReportCount});
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
}

// All ECG_File PDF Download &&  Pdf Cropper - pdf-lib npm
exports.DownloadECGReport_Pdf = async(req, res) => {
   try {
      let aggregationPipeline = await PatientDetailsModel.PatientBasicDetailsSchema.aggregate(
           [
             { $unwind: { path: "$All_ECG_Files", preserveNullAndEmptyArrays: true } },
             { $project: { Patient_Name: 1, ECG_Taken_Type: 1, ECG_File: 1, All_ECG_Files: 1 } },
             { $match: { ECG_File: "Available" } },
           ],
         );

      let Data = []

         let aggregateData = aggregationPipeline;
         let result = {};
         let resultValue = aggregateData.map((item) => {
            let string = item.All_ECG_Files.ECG_File;
            let actualValue = string.split(';base64,')[1]
            return result = { key: actualValue }
         })

         let urlString = resultValue.map((item) => { return item.key });

         const decodePDFData = Buffer.from(urlString, 'base64');
         return res.status(200).send({ Status: true, Message: "All ECG_Files Pdfs Successfully fetched!", decodePDFData: decodePDFData});

      //    // Pdf Cropper - pdf-lib npm
      //    const { inputPath, outputPath, left, bottom, right, top } = req.body;

      //    // Read the file from decodepdfData
      //    const pdfBytes = await fs.readFile(inputPath);

      //    const pdfDoc = await PDFDocument.load(pdfBytes);
      //    const firstPage = pdfDoc.getPages()[0];

      //    firstPage.setCropBox(left, bottom, right, top);

      //    const modifiedPdfBytes = await pdfDoc.save();
      //    let cropPDF = await fs.writeFile(outputPath, modifiedPdfBytes);

      //  return res.status(200).send({ Status: true, Message: "PDF Cropped Successfully!", croppedPDFFile: cropPDF});
   } catch (error) {
      return res.status(500).send({ Status: false, Message: "Something went wrong!", Error: error.message});
   }
}

// app.post('/crop-pdf', async (req, res) => {
//     const { inputPath, outputPath, left, bottom, right, top } = req.body;

//     try {
//         // Read the PDF file from inputPath
//         const pdfBytes = await fs.readFile(inputPath);

//         // Load the PDF document
//         const pdfDoc = await PDFDocument.load(pdfBytes);
//         const firstPage = pdfDoc.getPages()[0];

//         // Crop the page (left, bottom, right, top)
//         firstPage.setCropBox(left, bottom, right, top);

//         // Save the modified PDF to a buffer
//         const modifiedPdfBytes = await pdfDoc.save();

//         // Write the modified PDF buffer to the output file
//         await fs.writeFile(outputPath, modifiedPdfBytes);

//         // Send a success response
//         res.status(200).json({ success: true, message: 'PDF cropped successfully' });
//     } catch (error) {
//         console.error('Error cropping PDF:', error);
//         // Send an error response
//         res.status(500).json({ success: false, error: 'Failed to crop PDF' });
//     }
// });

