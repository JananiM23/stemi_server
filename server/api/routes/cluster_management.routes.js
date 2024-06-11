module.exports = function(app) {

   var Controller = require('../controllers/cluster_management.controller');

   app.post('/API/Cluster_Management/StemiCluster_Create', Controller.StemiCluster_Create);
   app.post('/API/Cluster_Management/StemiCluster_Update', Controller.StemiCluster_Update);
   app.post('/API/Cluster_Management/StemiCluster_View', Controller.StemiCluster_View);
   app.post('/API/Cluster_Management/Clusters_SimpleList', Controller.Clusters_SimpleList);
   app.post('/API/Cluster_Management/StemiCluster_AsyncValidate', Controller.StemiCluster_AsyncValidate);
   app.post('/API/Cluster_Management/ClusterBased_Hospitals', Controller.ClusterBased_Hospitals);
   app.post('/API/Cluster_Management/ClusterBased_ControlPanelFields', Controller.ClusterBased_ControlPanelFields);
   app.post('/API/Cluster_Management/ClusterControlPanel_Update', Controller.ClusterControlPanel_Update);
   app.post('/API/Cluster_Management/ClustersSimpleList_LocationBased', Controller.ClustersSimpleList_LocationBased);
   app.post('/API/Cluster_Management/ClusterDetails_RequiredForMapping', Controller.ClusterDetails_RequiredForMapping);
   app.post('/API/Cluster_Management/Add_HospitalTo_Cluster', Controller.Add_HospitalTo_Cluster);
   app.post('/API/Cluster_Management/Remove_HospitalFrom_Cluster', Controller.Remove_HospitalFrom_Cluster);
};