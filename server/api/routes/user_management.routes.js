module.exports = function(app) {
   var Controller = require('../controllers/user_management.controller');

   app.post('/API/UserManagement/StemiUser_AsyncValidate', Controller.StemiUser_AsyncValidate);
   app.post('/API/UserManagement/StemiUser_Create', Controller.StemiUser_Create);
   app.post('/API/UserManagement/StemiUsers_List', Controller.StemiUsers_List);
   app.post('/API/UserManagement/StemiUsers_Delete', Controller.StemiUsers_Delete);
   app.post('/API/UserManagement/StemiUser_Update', Controller.StemiUser_Update);
   app.post('/API/UserManagement/StemiUserActive_Status', Controller.StemiUserActive_Status);
};