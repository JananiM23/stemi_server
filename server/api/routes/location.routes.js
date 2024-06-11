module.exports = function (app){

   var Controller = require('../controllers/location.controller');

   app.post('/API/Location/StemiLocation_AsyncValidate', Controller.StemiLocation_AsyncValidate);
   app.post('/API/Location/StemiLocation_Create', Controller.StemiLocation_Create);
   app.post('/API/Location/StemiLocations_List', Controller.StemiLocations_List);
   app.post('/API/Location/StemiLocations_SimpleList', Controller.StemiLocations_SimpleList);
   app.post('/API/Location/StemiLocation_Update', Controller.StemiLocation_Update);
   
};