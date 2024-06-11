var ControlPanelModel = require('./../models/control_panel.model');
var mongoose = require('mongoose');


// New Field Create --------------------------------------------------
exports.NewField_Create = function (req, res) {
   var ReceivingData = req.body;

   if (!ReceivingData.Name || ReceivingData.Name === '') {
      res.status(400).send({ Status: false, Message: "Name can not be empty" });
   } else if (!ReceivingData.Key_Name || ReceivingData.Key_Name === '') {
      res.status(400).send({ Status: false, Message: "Key Name can not be empty" });
   } else if (!ReceivingData.Type || ReceivingData.Type === '') {
      res.status(400).send({ Status: false, Message: "Type can not be empty" });
   } else if (!ReceivingData.Category || ReceivingData.Category === '') {
      res.status(400).send({ Status: false, Message: "Category can not be empty" });
   } else {

      if (ReceivingData.Parent && ReceivingData.Parent !== null && ReceivingData.Parent !== '') {
         ReceivingData.Parent = mongoose.Types.ObjectId(ReceivingData.Parent);
      } else {
         ReceivingData.Parent = null; 
      }
      if (ReceivingData.If_Validation_Control_Array && ReceivingData.Validation_Control_Array !== undefined  && ReceivingData.Validation_Control_Array !== null  && ReceivingData.Validation_Control_Array !== '') {
         ReceivingData.Validation_Control_Array = JSON.parse(ReceivingData.Validation_Control_Array);
         if (typeof ReceivingData.Validation_Control_Array === 'object') {
            ReceivingData.Validation_Control_Array = ReceivingData.Validation_Control_Array.map(obj => {
               obj.Validation_Control = mongoose.Types.ObjectId(obj.Validation_Control);
               return obj;
            });
         }
      } else {
         ReceivingData.Validation_Control_Array = null;
      }
      if (ReceivingData.If_Min_Date_Restriction && ReceivingData.Min_Date_Field && ReceivingData.Min_Date_Field !== null && ReceivingData.Min_Date_Field !== '') {
         ReceivingData.Min_Date_Field = mongoose.Types.ObjectId(ReceivingData.Min_Date_Field);
      } else {
         ReceivingData.Min_Date_Field = null;
      }
      if (ReceivingData.If_Min_Date_Array_Available && ReceivingData.Min_Date_Array !== undefined  && ReceivingData.Min_Date_Array !== null  && ReceivingData.Min_Date_Array !== '') {
         ReceivingData.Min_Date_Array = JSON.parse(ReceivingData.Min_Date_Array);
         if (typeof ReceivingData.Min_Date_Array === 'object') {
            ReceivingData.Min_Date_Array = ReceivingData.Min_Date_Array.map(obj => {
               obj.Min_Date_Field = mongoose.Types.ObjectId(obj.Min_Date_Field);
               return obj;
            });
         }
      } else {
         ReceivingData.Min_Date_Array = null;
      }
      if (ReceivingData.If_Max_Date_Restriction && ReceivingData.Max_Date_Field && ReceivingData.Max_Date_Field !== null && ReceivingData.Max_Date_Field !== '') {
         ReceivingData.Max_Date_Field = mongoose.Types.ObjectId(ReceivingData.Max_Date_Field);
      } else {
         ReceivingData.Max_Date_Field = null;
      }
      if (ReceivingData.If_Max_Date_Array_Available && ReceivingData.Max_Date_Array !== undefined  && ReceivingData.Max_Date_Array !== null  && ReceivingData.Max_Date_Array !== '') {
         ReceivingData.Max_Date_Array = JSON.parse(ReceivingData.Max_Date_Array);
         if (typeof ReceivingData.Max_Date_Array === 'object') {
            ReceivingData.Max_Date_Array = ReceivingData.Max_Date_Array.map(obj => {
               obj.Max_Date_Field = mongoose.Types.ObjectId(obj.Max_Date_Field);
               return obj;
            });
         }
      } else {
         ReceivingData.Max_Date_Array = null;
      }
      if (ReceivingData.If_Min_Number_Field_Restriction && ReceivingData.Min_Number_Field && ReceivingData.Min_Number_Field !== null && ReceivingData.Min_Number_Field !== '' ) {
         ReceivingData.Min_Number_Field = mongoose.Types.ObjectId(ReceivingData.Min_Number_Field);
      } else {
         ReceivingData.Min_Number_Field = null;  
      }
      if (ReceivingData.If_Max_Number_Field_Restriction && ReceivingData.Max_Number_Field && ReceivingData.Max_Number_Field !== null && ReceivingData.Max_Number_Field !== '' ) {
         ReceivingData.Max_Number_Field = mongoose.Types.ObjectId(ReceivingData.Max_Number_Field);
      } else {
         ReceivingData.Max_Number_Field = null;
      }

      const Create_NewField = new ControlPanelModel.AllFieldsSchema({
         Name: ReceivingData.Name,
         Key_Name: ReceivingData.Key_Name,
         Type: ReceivingData.Type,
         If_Child_Available: ReceivingData.If_Child_Available || false,
         If_Parent_Available: ReceivingData.If_Parent_Available || false,
         Parent: ReceivingData.Parent || null,
         Visibility: ReceivingData.Visibility || false,
         Mandatory: ReceivingData.Mandatory || false,
         Validation: ReceivingData.Validation || false,
         If_Validation_Control_Array: ReceivingData.If_Validation_Control_Array || false,
         Validation_Control_Array: ReceivingData.Validation_Control_Array || [],
         If_Date_Restriction: ReceivingData.If_Date_Restriction || false,
         If_Min_Date_Restriction: ReceivingData.If_Min_Date_Restriction || false,
         Min_Date_Field: ReceivingData.Min_Date_Field || null,
         If_Min_Date_Array_Available: ReceivingData.If_Min_Date_Array_Available || false,
         Min_Date_Array: ReceivingData.Min_Date_Array || [],
         If_Max_Date_Restriction: ReceivingData.If_Max_Date_Restriction || false,
         Max_Date_Field: ReceivingData.Max_Date_Field || null,
         If_Max_Date_Array_Available: ReceivingData.If_Max_Date_Array_Available || false,
         Max_Date_Array: ReceivingData.Max_Date_Array || [],
         If_Future_Date_Available: ReceivingData.If_Future_Date_Available || false,
         If_Number_Restriction: ReceivingData.If_Number_Restriction || false,
         If_Min_Number_Restriction: ReceivingData.If_Min_Number_Restriction || false,
         Min_Number_Value: ReceivingData.Min_Number_Value || null,
         If_Min_Number_Field_Restriction: ReceivingData.If_Min_Number_Field_Restriction || false,
         Min_Number_Field: ReceivingData.Min_Number_Field || null,
         If_Max_Number_Restriction: ReceivingData.If_Max_Number_Restriction || false,
         Max_Number_Value: ReceivingData.Max_Number_Value || null,
         If_Max_Number_Field_Restriction: ReceivingData.If_Max_Number_Field_Restriction || false,
         Max_Number_Field: ReceivingData.Max_Number_Field || null,
         Category: ReceivingData.Category || 'Other',
         Sub_Category: ReceivingData.Sub_Category || '',
         Sub_Junior_Category: ReceivingData.Sub_Junior_Category || '',
         Active_Status: true,
         If_Deleted: false
      });
      Create_NewField.save(function (err, result) {
         if (err) {
            res.status(417).send({ Status: false, Message: "Some error occurred while Creating the New Field!.", Error: err });
         } else {
            if (ReceivingData.Parent && ReceivingData.Parent !== null && ReceivingData.Parent !== '') {
               ControlPanelModel.AllFieldsSchema.updateOne({ _id: ReceivingData.Parent }, { $set: { If_Child_Available: true} }).exec();
            }
            ControlPanelModel.AllFieldsSchema
            .findOne({ '_id': result._id }, {}, {})
            .populate({ path: 'Parent', select: ['Name', 'Key_Name'] })
            .populate({ path: 'Validation_Control_Array.Validation_Control', select: ['Name', 'Description'] })
            .populate({ path: 'Min_Date_Field', select: ['Name', 'Key_Name'] })
            .populate({ path: 'Max_Date_Field', select: ['Name', 'Key_Name'] })
            .populate({ path: 'Min_Date_Array.Min_Date_Field', select: ['Name', 'Key_Name'] })
            .populate({ path: 'Max_Date_Array.Max_Date_Field', select: ['Name', 'Key_Name'] })
            .populate({ path: 'Min_Number_Field', select: ['Name', 'Key_Name'] })
            .populate({ path: 'Max_Number_Field', select: ['Name', 'Key_Name'] })
            .exec(function (err_1, result_1) {
               if (err_1) {
                  res.status(417).send({ status: false, Message: "Some error occurred while Find The New Field!.", Error: err_1  });
               } else {
                  res.status(200).send({ Status: true, Response: result_1 });
               }
            });
         }
      });
   }
};

// All Fields ---------------------------------------------------------
exports.All_Fields= function(req, res) {
   ControlPanelModel.AllFieldsSchema
   .find({ Active_Status: true }, {}, {sort: { createdAt: 1 }})
   .populate({ path: 'Parent', select: ['Name', 'Key_Name'] })
   .populate({ path: 'Validation_Control_Array.Validation_Control', select: ['Name', 'Description'] })
   .populate({ path: 'Min_Date_Field', select: ['Name', 'Key_Name'] })
   .populate({ path: 'Max_Date_Field', select: ['Name', 'Key_Name'] })
   .populate({ path: 'Min_Date_Array.Min_Date_Field', select: ['Name', 'Key_Name'] })
   .populate({ path: 'Max_Date_Array.Max_Date_Field', select: ['Name', 'Key_Name'] })
   .populate({ path: 'Min_Number_Field', select: ['Name', 'Key_Name'] })
   .populate({ path: 'Max_Number_Field', select: ['Name', 'Key_Name'] })
   .exec(function(err, result) {
      if(err) {
         res.status(417).send({status: false, Message: "Some error occurred while Find The Fields!.", Error: err });
      } else {
         res.status(200).send({Status: true, Response: result });
      }
   });
};

// Field Changes Update -----------------------------------------------
exports.All_Fields_Update= function(req, res) {
   var ReceivingData = req.body;
   // ReceivingData = (ReceivingData !== null && ReceivingData !== '') ?  JSON.parse(ReceivingData) : [];


   if (ReceivingData !== null && typeof ReceivingData !== 'object') {
      res.status(400).send({ Status: false, Message: "Some Error Occurred !, Please Try Again" });
   } else {

      Promise.all(
         ReceivingData.map(Obj => UpdateData(Obj) )
      ).then(response => {
         ControlPanelModel.AllFieldsSchema
         .find({}, {}, {sort: { createdAt: 1 }})
         .populate({ path: 'Parent', select: ['Name', 'Key_Name'] })
         .populate({ path: 'Validation_Control_Array.Validation_Control', select: ['Name', 'Description'] })
         .populate({ path: 'Min_Date_Field', select: ['Name', 'Key_Name'] })
         .populate({ path: 'Max_Date_Field', select: ['Name', 'Key_Name'] })
         .populate({ path: 'Min_Date_Array.Min_Date_Field', select: ['Name', 'Key_Name'] })
         .populate({ path: 'Max_Date_Array.Max_Date_Field', select: ['Name', 'Key_Name'] })
         .populate({ path: 'Min_Number_Field', select: ['Name', 'Key_Name'] })
         .populate({ path: 'Max_Number_Field', select: ['Name', 'Key_Name'] })
         .exec(function(err, result) {
            if(err) {
               res.status(417).send({status: false, Message: "Some error occurred while Find The Fields!.", Error: err });
            } else {
               res.status(200).send({Status: true, Response: result });
            }
         });
      }).catch(err => {
         res.status(200).send({Status: true, Response: err });
      });


      function UpdateData(Obj) {
         return new Promise( (resolve, reject) => {

            // Validations -------------------------------
            if (Obj.Validation_Control_Array && Obj.Validation_Control_Array !== null && typeof Obj.Validation_Control_Array === 'object') {
               Obj.Validation_Control_Array = Obj.Validation_Control_Array.map((Obj_1, index) => {
                  const ReturnObj = {
                     Order_No: index + 1,
                     Validation_Control: mongoose.Types.ObjectId(Obj_1)
                  };
                  return ReturnObj;
               });
            }
            Obj.If_Date_Restriction = (Obj.If_Min_Date_Restriction || Obj.If_Min_Date_Array_Available || Obj.If_Max_Date_Restriction || Obj.If_Max_Date_Array_Available ) ? true : false;
            Obj.Min_Date_Field = (Obj.Min_Date_Field && Obj.Min_Date_Field !== null) ? mongoose.Types.ObjectId(Obj.Min_Date_Field) : null;
            if (Obj.Min_Date_Array && Obj.Min_Date_Array !== null && typeof Obj.Min_Date_Array === 'object') {
               Obj.Min_Date_Array = Obj.Min_Date_Array.map((Obj_1, index) => {
                  const ReturnObj = {
                     Order_No: index + 1,
                     Min_Date_Field: mongoose.Types.ObjectId(Obj_1)
                  };
                  return ReturnObj;
               });
            }
            Obj.Max_Date_Field = (Obj.Max_Date_Field && Obj.Max_Date_Field !== null) ? mongoose.Types.ObjectId(Obj.Max_Date_Field) : null;
            if (Obj.Max_Date_Array && Obj.Max_Date_Array !== null && typeof Obj.Max_Date_Array === 'object') {
               Obj.Max_Date_Array = Obj.Max_Date_Array.map((Obj_1, index) => {
                  const ReturnObj = {
                     Order_No: index + 1,
                     Max_Date_Field: mongoose.Types.ObjectId(Obj_1)
                  };
                  return ReturnObj;
               });
            }
            Obj.If_Number_Restriction = (Obj.If_Min_Number_Restriction || Obj.If_Min_Number_Field_Restriction || Obj.If_Max_Number_Restriction || Obj.If_Max_Number_Field_Restriction ) ? true : false;
            Obj.Min_Number_Field = (Obj.Min_Number_Field && Obj.Min_Number_Field !== null) ? mongoose.Types.ObjectId(Obj.Min_Number_Field) : null;
            Obj.Max_Number_Field = (Obj.Max_Number_Field && Obj.Max_Number_Field !== null) ? mongoose.Types.ObjectId(Obj.Max_Number_Field) : null;

            // Update Query ------------------------------
            ControlPanelModel.AllFieldsSchema.updateOne(
               { _id: mongoose.Types.ObjectId(Obj._id) },
               { $set: {
                  Visibility : Obj.Visibility,
                  Mandatory: Obj.Mandatory,
                  Validation: Obj.Validation,
                  If_Validation_Control_Array: Obj.If_Validation_Control_Array,
                  Validation_Control_Array: Obj.Validation_Control_Array,
                  If_Date_Restriction: Obj.If_Date_Restriction,
                  If_Min_Date_Restriction: Obj.If_Min_Date_Restriction,
                  Min_Date_Field: Obj.Min_Date_Field,
                  If_Min_Date_Array_Available: Obj.If_Min_Date_Array_Available,
                  Min_Date_Array: Obj.Min_Date_Array,
                  If_Max_Date_Restriction: Obj.If_Max_Date_Restriction,
                  Max_Date_Field: Obj.Max_Date_Field,
                  If_Max_Date_Array_Available: Obj.If_Max_Date_Array_Available,
                  Max_Date_Array: Obj.Max_Date_Array,
                  If_Future_Date_Available: Obj.If_Future_Date_Available,
                  If_Number_Restriction: Obj.If_Number_Restriction,
                  If_Min_Number_Restriction: Obj.If_Min_Number_Restriction,
                  Min_Number_Value: Obj.Min_Number_Value,
                  If_Min_Number_Field_Restriction: Obj.If_Min_Number_Field_Restriction,
                  Min_Number_Field: Obj.Min_Number_Field,
                  If_Max_Number_Restriction: Obj.If_Max_Number_Restriction,
                  Max_Number_Value: Obj.Max_Number_Value,
                  If_Max_Number_Field_Restriction: Obj.If_Max_Number_Field_Restriction,
                  Max_Number_Field: Obj.Max_Number_Field
               }}
            ).exec( function(err, result) {
               if (err) {
                  reject(err);
               } else {
                  resolve(result);
               }
            });

         });
      }
   }

};




// New Validation Create ---------------------------------------------
exports.NewValidation_Create = function (req, res) {
   var ReceivingData = req.body;

   if (!ReceivingData.Name || ReceivingData.Name === '') {
      res.status(400).send({ Status: false, Message: "Name can not be empty" });
   } else if (!ReceivingData.Description || ReceivingData.Description === '') {
      res.status(400).send({ Status: false, Message: "Description can not be empty" });
   } else if (!ReceivingData.Accessible_Type || ReceivingData.Accessible_Type === '') {
      res.status(400).send({ Status: false, Message: "Accessible Type can not be empty" });
   } else if (!ReceivingData.Error_Message || ReceivingData.Error_Message === '') {
      res.status(400).send({ Status: false, Message: "Error Message can not be empty" });
   } else {

      const Create_NewValidation = new ControlPanelModel.AllValidationsSchema({
         Name: ReceivingData.Name,
         Description: ReceivingData.Description,
         Accessible_Type: ReceivingData.Accessible_Type,
         If_Regex_Validation: ReceivingData.If_Regex_Validation || false,
         Regex_Validation: ReceivingData.Regex_Validation || '',
         If_Function_Validation: ReceivingData.If_Function_Validation || false,
         Function_Validation: ReceivingData.Function_Validation || '',
         Error_Message: ReceivingData.Error_Message,
         Active_Status: true,
         If_Deleted: false
      });
      Create_NewValidation.save(function (err, result) {
         if (err) {
            res.status(417).send({ Status: false, Message: "Some error occurred while Creating the New Validation!.", Error: err });
         } else {
            res.status(200).send({ Status: true, Response: result });
         }
      });
   }
};

// All Validations ---------------------------------------------------
exports.All_Validations= function(req, res) {
   ControlPanelModel.AllValidationsSchema
   .find({}, {}, {sort: { createdAt: -1 }})
   .exec(function(err, result) {
      if(err) {
         res.status(417).send({status: false, Message: "Some error occurred while Find The Validations!.", Error: err });
      } else {
         res.status(200).send({Status: true, Response: result });
      }
   });
};

// Accessible Type Based Validations ---------------------------------
exports.TypeBased_Validations= function(req, res) {
   var ReceivingData = req.body;

   if (!ReceivingData.Accessible_Type || ReceivingData.Accessible_Type === '') {
      res.status(400).send({ Status: false, Message: "Accessible Type can not be empty" });
   } else {
      ControlPanelModel.AllValidationsSchema
      .find( { Accessible_Type: ReceivingData.Accessible_Type }, {}, {sort: { createdAt: -1 }})
      .exec(function(err, result) {
         if(err) {
            res.status(417).send({status: false, Message: "Some error occurred while Find The Validations!.", Error: err });
         } else {
            res.status(200).send({Status: true, Response: result });
         }
      });
   }
};