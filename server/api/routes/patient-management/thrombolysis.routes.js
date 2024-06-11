module.exports = function (app) {

    var Controller = require('./../../controllers/patient-management/thrombolysis.controller');

    app.post('/API/patient_management/ThrombolysisMedication_Create', Controller.ThrombolysisMedication_Create);
    app.post('/API/patient_management/ThrombolysisMedication_View', Controller.ThrombolysisMedication_View);
    app.post('/API/patient_management/ThrombolysisMedication_Update', Controller.ThrombolysisMedication_Update);


    app.post('/API/patient_management/Thrombolysis_Create', Controller.Thrombolysis_Create);
    app.post('/API/patient_management/Thrombolysis_View', Controller.Thrombolysis_View);
    app.post('/API/patient_management/Thrombolysis_Update', Controller.Thrombolysis_Update);


};