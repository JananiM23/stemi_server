var fs = require('fs');
var path = require('path');
var PDFParser = require("pdf2json");
var chokidar = require('chokidar');
var axios = require('axios');
var DeviceManagementModel = require('../api/models/device_management.model');
var BPLPatientsModel = require('../api/models/bpl_patients.model');
var UsersModel = require('../api/models/user_management.model');
var NotificationModel = require('../api/models/notification_management.model');
var base64conversion = require('./pdf2base64');



exports.DirectoryWatching = function () {
   chokidar.watch('./BPL_Records/upload/', { persistent: true, awaitWriteFinish: true }).on('add', (file) => {
      var ext = path.extname(file);
      if (ext === '.pdf') {
         var CurrentPath = file;
         var newPath = 'Uploads/BPL-ECG/PDF-Reports/' + path.basename(file);
         var unfindablePath = file.replace('upload', 'unfindable');

         let pdfParser = new PDFParser();
         pdfParser.on("pdfParser_dataError", errData => console.error(errData.parserError) );
         pdfParser.on("pdfParser_dataReady", pdfData => {
            var FinalData = { Id: '', Name: '', Age: '', Gender: '', Height: '', Weight: '', BP: '', DateTime: null };
            // Device Info From PDF
            var Data = JSON.parse(JSON.stringify(pdfData));
            var Device = Data.formImage.Pages[0].Texts[0].R[0].T;
            var DeviceData = Device.replace(/%20/g, ' ').replace('ECG REPORT', '').trim();

            // ECG Date Time From PDF
            var DateTimeObj = null;
            Data.formImage.Pages[0].Texts.map(obj => {
               if (obj.x > 38 && obj.y > 34 ) {
                  DateTimeObj = obj;
               }
            });
            var DateTime = '';
            if (DateTimeObj !== null) {
               DateTime = DateTimeObj.R[0].T;
               DateTime = DateTime.replace(/%20%20%20/g, ' ').replace(/%20%20/g, ' ').replace(/%20/g, ' ').replace(/%3A/g, ':').replace(/%2F/, '/');
            }
            if (DateTime !== '') {
               const DateArr = DateTime.split('-');
               DateTime = DateArr.length > 2 ? DateArr[1] + '-' + DateArr[0] + '-' + DateArr[2] : '';
            }
            FinalData.DateTime = !isNaN(Date.parse(DateTime)) ? new Date(DateTime) : null;

            // Patient Info from PDF
            var Patient = Data.formImage.Pages[0].Texts[1].R[0].T;
            Patient = Patient.slice(0, (Patient.indexOf('mmHg') + 4));
            Patient = Patient.replace(/%20%20%20/g, '_').replace(/%20%20/g, '_').replace(/%20/g, '_').replace(/___/g, '_').replace(/__/g, '_').replace(/ID_%3A_/, '').replace(/%2F/, '/');
            var Arr = Patient.split('_');
            Arr.map( (obj, idx) => {
               if (idx === 0) {
                  FinalData.Id = obj;
               }
               if (obj.includes('Years')) {
                  FinalData.Age = obj.replace('Years', '');
                  if (idx > 1) {
                     FinalData.Name = Arr.filter( (objNew, idxNew) => idxNew !== 0 && idxNew < idx).join(' ');
                  }
               }
               if (obj === 'Male' || obj === 'Female') {
                  FinalData.Gender = obj;
               }
               if (obj.includes('cm')) {
                  FinalData.Height = obj.replace('cm', '');
               }
               if (obj.includes('kg')) {
                  FinalData.Weight = obj.replace('kg', '');
               }
               if (obj.includes('mmHg') && Arr[idx - 1].includes('kg')) {
                  FinalData.BP = obj.replace('mmHg', '');
               }
               if (obj.includes('mmHg') && !Arr[idx - 1].includes('kg') && FinalData.BP === '') {
                  FinalData.BP = Arr[idx - 1];
               }
            });
            // Find Device Info
            DeviceManagementModel.DeviceManagementSchema
            .findOne({Device_UID: { $regex: new RegExp("^" + DeviceData + "$", "i") }, Active_Status: true, If_Deleted: false}, {}, {})
            .exec((err, result) => {
               if (!err && result !== null) {
                  // User Details
                  UsersModel.UserManagementSchema
                  .findOne({Hospital: result.Hospital, User_Type : "PU", Active_Status: true, If_Deleted: false}, {}, {})
                  .exec((err_1, result_1) => {
                     if (!err_1 ) {
                        var User = result_1 !== null ? result_1._id : null;
                        // Create Patient
                        var bpl_record = new BPLPatientsModel.BPLPatientsSchema({
                           Patient_Id: FinalData.Id,
                           Patient_Name: FinalData.Name,
                           Patient_Age: FinalData.Age, 
                           Patient_Gender: FinalData.Gender,
                           Patient_Height: FinalData.Height,
                           Patient_Weight: FinalData.Weight,
                           Patient_BP: FinalData.BP,
                           Device_Id: result.Device_UID,
                           Device_Management: result._id,
                           Hospital: result.Hospital,
                           User: User,
                           Confirmed_UserType: '',
                           Confirmed_By: null,
                           ECG_Taken_date_time: FinalData.DateTime,
                           ECG_Report: path.basename(file, path.extname(file)) + '.pdf',
                           ECG_File: '',
                           Patient_Status: 'Pending',
                           Active_Status: true,
                           If_Deleted: false,
                        });
                        bpl_record.save( (err_2, result_2) => {
                           if (!err_2 && result_2 !== null) {
                              // Current file move to report directory
                              fs.rename(CurrentPath, newPath, function (err_3) {
                                 if (err_3) {
                                    console.log('BPL File rename Error!!');
                                 } else {
                                    base64conversion.pdf2base64(newPath).then(response =>{
                                       BPLPatientsModel.BPLPatientsSchema.updateOne({_id: result_2._id}, {$set: {ECG_File: 'data:image/jpeg;base64,' + response}}).exec();
                                    }).catch(error => {
                                       console.log('BPL Base64 Conversion Error!!');
                                    });
                                 }
                              });
                              // New Record Notification
                              if (User !== null) {
                                 const Notification = new NotificationModel.NotificationSchema({
                                    User_ID: User,
                                    Patient_ID: null,
                                    Confirmed_PatientId: null,
                                    BPL_ID: result_2._id,
                                    Notification_Type: 'New_BPL_Record',
                                    Message: 'New BPL ECG for Patient: ' + FinalData.Name + ', Age: ' + FinalData.Age + ', Gender: ' + FinalData.Gender,
                                    Message_Received: false,
                                    Message_Viewed: true,
                                    Active_Status: true,
                                    If_Deleted: false
                                 });
                                 Notification.save();
                                 if (result_1.Phone !== '' && result_1.Phone !== null) {
                                    var Msg = 'New BPL ECG for Patient: ' + FinalData.Name + ', Age: ' + FinalData.Age + ', Gender: ' + FinalData.Gender;
                                    axios({ method: 'post', url: 'http://bulksmsservice.co.in/httpapi/v1/sendsms?api-token=9)2_6eh0s,v3(*4.1alzcgjp8uxnotkdy7ibqr5f&numbers=' + [result_1.Phone] + '&route=2&message=' + Msg + '&sender=STEMIN', }).
                                    then( (responseNew) =>{ });
                                 }
                              }
                           }
                        });
                     }
                  });
               } else {
                  fs.rename(CurrentPath, unfindablePath, function (err_1) {
                     if (err_1) console.error('BPL Unfindable File rename Error!!');
                  });
               }
            });
         });
         pdfParser.loadPDF(CurrentPath);
      }
   });

};
