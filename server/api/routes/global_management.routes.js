module.exports = function(app) {
    var Controller = require('./../controllers/global_management.controller');

    app.post('/API/Global_Management/Country_List', Controller.Country_List);
    app.post('/API/Global_Management/State_List', Controller.State_List);
    app.post('/API/Global_Management/City_List', Controller.City_List);

};