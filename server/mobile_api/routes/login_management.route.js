module.exports = function (app){

var Controller = require('../controllers/login_management.controller');
 
    app.post('/APP_API/LoginManagement/StemiApp_Login', Controller.StemiApp_Login);
    app.post('/APP_API/LoginManagement/StemiApp_Logout', Controller.StemiApp_Logout);
    app.post('/APP_API/LoginManagement/StemiApp_LoginVerify', Controller.StemiApp_LoginVerify);
 
 };
 