module.exports = function (app) {

    var Controller = require('./../controllers/control_panel.controller');

    app.post('/API/ControlPanel/NewField_Create', Controller.NewField_Create);
    app.get('/API/ControlPanel/All_Fields', Controller.All_Fields);
    app.post('/API/ControlPanel/All_Fields_Update', Controller.All_Fields_Update);



    app.post('/API/ControlPanel/NewValidation_Create', Controller.NewValidation_Create);
    app.get('/API/ControlPanel/All_Validations', Controller.All_Validations);
    app.post('/API/ControlPanel/TypeBased_Validations', Controller.TypeBased_Validations);


};