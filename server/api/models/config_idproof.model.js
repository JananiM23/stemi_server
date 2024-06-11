var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//  ID-proof Config Schema
var IdProofConfigSchema = mongoose.Schema({
   Name: { type: String },  
   Key_Name: { type: String },
   Active_Status: { type : Boolean, required : true },
   If_Deleted: { type : Boolean, required : true },
   },
   { timestamps: true }
);
var VarIdProofConfig = mongoose.model('IdProof_Config', IdProofConfigSchema, 'IdProof_Config');


// Cluster Based ID-proof Control Schema
var Cluster_IdProofControlSchema = mongoose.Schema({
   Cluster: { type: Schema.Types.ObjectId, ref: 'Cluster' },
   Config_Details: [{ type: Schema.Types.ObjectId, ref: 'IdProof_Config'} ],
   Active_Status: { type : Boolean, required : true },
   If_Deleted: { type : Boolean, required : true },
   },
   { timestamps: true }
);
var VarCluster_IdProofControl = mongoose.model('Cluster_IdProofControl', Cluster_IdProofControlSchema, 'Cluster_IdProofControl');

module.exports = {
   IdProofConfigSchema: VarIdProofConfig,
   Cluster_IdProofControlSchema: VarCluster_IdProofControl
};
