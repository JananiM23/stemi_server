module.exports = function (app) {

   var Controller = require('../controllers/reports.controller');

   app.post('/API/Reports/AllPatientDetails_List', Controller.AllPatientDetails_List); 
};
