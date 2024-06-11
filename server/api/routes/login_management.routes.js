module.exports = function (app){

   var Controller = require('../controllers/login_management.controller');

   app.post('/API/LoginManagement/StemiUser_Login', Controller.StemiUser_Login);
   app.post('/API/LoginManagement/StemiUser_AutoLogin', Controller.StemiUser_AutoLogin);


};
