module.exports = function (app){

   var Controller = require('../controllers/referral_facility.controller');

   app.post('/API/ReferralFacility/ReferralFacility_AsyncValidate', Controller.ReferralFacility_AsyncValidate);
   app.post('/API/ReferralFacility/ReferralFacility_Create', Controller.ReferralFacility_Create);
   app.post('/API/ReferralFacility/ReferralFacilities_List', Controller.ReferralFacilities_List);
   app.post('/API/ReferralFacility/ReferralFacilities_SimpleList', Controller.ReferralFacilities_SimpleList);
   app.post('/API/ReferralFacility/ReferralFacility_Update', Controller.ReferralFacility_Update);
   
};