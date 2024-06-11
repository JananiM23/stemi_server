module.exports = function(app) {
   var Controller = require('../controllers/device_management.controller');

   app.post('/API/DeviceManagement/Device_AsyncValidate', Controller.Device_AsyncValidate);
   app.post('/API/DeviceManagement/Device_Create', Controller.Device_Create);
   app.post('/API/DeviceManagement/Devices_List', Controller.Devices_List);
   app.post('/API/DeviceManagement/Device_Update', Controller.Device_Update);
   app.post('/API/DeviceManagement/Device_Delete', Controller.Device_Delete);
};