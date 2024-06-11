module.exports = function (app){

    var Controller = require('../controllers/hospital_management.controller');

    app.post('/API/Hospital_Management/Create_Hospital', Controller.Create_Hospital);
    app.post('/API/Hospital_Management/Hospitals_List', Controller.Hospitals_List);
    app.post('/API/Hospital_Management/Hospitals_All_List', Controller.Hospitals_All_List);
    app.post('/API/Hospital_Management/Update_Hospital', Controller.Update_Hospital);
    app.post('/API/Hospital_Management/Hospital_view', Controller.Hospital_view);
    app.post('/API/Hospital_Management/Hospital_Approve', Controller.Hospital_Approve);
    app.post('/API/Hospital_Management/Hospital_Reject', Controller.Hospital_Reject);
    app.post('/API/Hospital_Management/Hospital_Block', Controller.Hospital_Block);
    app.post('/API/Hospital_Management/Hospital_UnBlock', Controller.Hospital_UnBlock);
    app.post('/API/Hospital_Management/Hospital_Delete', Controller.Hospital_Delete);
    app.post('/API/Hospital_Management/HubHospitals_SimpleList', Controller.HubHospitals_SimpleList);
    app.post('/API/Hospital_Management/Location_HubHospitals', Controller.Location_HubHospitals);
    app.post('/API/Hospital_Management/ClusterEdit_HubHospitals', Controller.ClusterEdit_HubHospitals);
    app.post('/API/Hospital_Management/Location_HubHospitals_AlsoMapped', Controller.Location_HubHospitals_AlsoMapped);
    app.post('/API/Hospital_Management/Hospital_SimpleList', Controller.Hospital_SimpleList);

};
