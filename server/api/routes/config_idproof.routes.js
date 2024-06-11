module.exports = function(app) {

    var Controller = require('../controllers/config_idproof.controller');
 
    app.post('/API/Config_Management/IdProofConfig_Create', Controller.IdProofConfig_Create);
    app.post('/API/Config_Management/Cluster_IdProofUpdate', Controller.Cluster_IdProofUpdate);
    app.post('/API/Config_Management/IdProof_ConfigList', Controller.IdProof_ConfigList);
    app.post('/API/Config_Management/ClusterConfig_View', Controller.ClusterConfig_View);
    app.post('/API/Config_Management/ClusterConfig_DetailedView', Controller.ClusterConfig_DetailedView);
    app.post('/API/Config_Management/IdProofConfig_Delete', Controller.IdProofConfig_Delete);
    
 };