// var StemiClusterModel = require('./../../server/api/models/cluster_management.model');
// var ControlPanelModel = require('./../../server/api/models/control_panel.model');
// var mongoose = require('mongoose');

// exports.NewFieldInserting = function () {
// 	const dataInsertRequests = [{
// 		Name: 'Missed STEMI',
// 		Key_Name: 'MissedSTEMI',
// 		Type : 'Select',
// 		If_Child_Available : false,
// 		If_Parent_Available : true,
// 		Category: 'Patient_Details',
// 		Sub_Category: 'Basic_Details',
// 		Sub_Junior_Category: 'Post_Thrombolysis',
// 		Parent_KeyName: 'Post_Thrombolysis',
// 		insertNextOf_KeyName: 'Successful_Lysis'
// 	},
// 	{
// 		Name: 'Autoreperfused (Clinically diagnosed)',
// 		Key_Name: 'Autoreperfused',
// 		Type : 'Select',
// 		If_Child_Available : false,
// 		If_Parent_Available : true,
// 		Category: 'Patient_Details',
// 		Sub_Category: 'Basic_Details',
// 		Sub_Junior_Category: 'Post_Thrombolysis',
// 		Parent_KeyName: 'Post_Thrombolysis',
// 		insertNextOf_KeyName: 'MissedSTEMI'
// 	},
// 	{
// 		Name: 'Others',
// 		Key_Name: 'Others',
// 		Type : 'Text',
// 		If_Child_Available : false,
// 		If_Parent_Available : true,
// 		Category: 'Patient_Details',
// 		Sub_Category: 'Basic_Details',
// 		Sub_Junior_Category: 'Post_Thrombolysis',
// 		Parent_KeyName: 'Post_Thrombolysis',
// 		insertNextOf_KeyName: 'Autoreperfused'
// 	},
// 	{
// 		Name: 'Missed STEMI',
// 		Key_Name: 'Thrombolysis_MissedSTEMI',
// 		Type : 'Select',
// 		If_Child_Available : false,
// 		If_Parent_Available : true,
// 		Category: 'Thrombolysis',
// 		Sub_Category: 'Thrombolysis',
// 		Sub_Junior_Category: 'Thrombolysis',
// 		Parent_KeyName: 'Thrombolysis',
// 		insertNextOf_KeyName: 'Thrombolysis_Successful_Lysis'
// 	},
// 	{
// 		Name: 'Autoreperfused (Clinically diagnosed)',
// 		Key_Name: 'Thrombolysis_Autoreperfused',
// 		Type : 'Select',
// 		If_Child_Available : false,
// 		If_Parent_Available : true,
// 		Category: 'Thrombolysis',
// 		Sub_Category: 'Thrombolysis',
// 		Sub_Junior_Category: 'Thrombolysis',
// 		Parent_KeyName: 'Thrombolysis',
// 		insertNextOf_KeyName: 'Thrombolysis_MissedSTEMI'
// 	},
// 	{
// 		Name: 'Others',
// 		Key_Name: 'Thrombolysis_Others',
// 		Type : 'Text',
// 		If_Child_Available : false,
// 		If_Parent_Available : true,
// 		Category: 'Thrombolysis',
// 		Sub_Category: 'Thrombolysis',
// 		Sub_Junior_Category: 'Thrombolysis',
// 		Parent_KeyName: 'Thrombolysis',
// 		insertNextOf_KeyName: 'Thrombolysis_Autoreperfused'
// 	}];

// 	const defaultConfig = {
// 		Parent: null,
// 		Visibility : true,
// 		Mandatory : false,
// 		Validation : false,
// 		If_Validation_Control_Array : false,
// 		Validation_Control_Array : [ ],
// 		If_Date_Restriction : false,
// 		If_Min_Date_Restriction : false,
// 		Min_Date_Field : null,
// 		If_Min_Date_Array_Available : false,
// 		Min_Date_Array : [ ],
// 		If_Max_Date_Restriction : false,
// 		Max_Date_Field : null,
// 		If_Max_Date_Array_Available : false,
// 		Max_Date_Array : [ ],
// 		If_Future_Date_Available : false,
// 		If_Number_Restriction : false,
// 		If_Min_Number_Restriction : false,
// 		Min_Number_Value : null,
// 		If_Min_Number_Field_Restriction : false,
// 		Min_Number_Field : null,
// 		If_Max_Number_Restriction : false,
// 		Max_Number_Value : null,
// 		If_Max_Number_Field_Restriction : false,
// 		Max_Number_Field : null,
// 		Active_Status: true,
// 		If_Deleted: false,
// 		createdAt: new Date(),
// 		updatedAt: new Date()
// 	};
	

// 	const getAllProcess = (query, key, ifCluster) => {
// 		return new Promise((resolve, reject) => {
// 			if (ifCluster) {
// 				StemiClusterModel.ClusterControlPanelSchema.find(query, {Key_Name: 1,  createdAt: 1}, {sort: { createdAt: 1 }})
// 				.exec(function(queryErr, queryResult) {
// 					if (!queryErr) {
// 						resolve({[key]: queryResult});
// 					} else {
// 						reject(queryErr);
// 					}
// 				});
// 			} else {
// 				ControlPanelModel.AllFieldsSchema.find(query, {Key_Name: 1,  createdAt: 1}, {sort: { createdAt: 1 }})
// 				.exec(function(queryErr, queryResult) {
// 					if (!queryErr) {
// 						resolve({[key]: queryResult});
// 					} else {
// 						reject(queryErr);
// 					}
// 				});
// 			}
// 		});
// 	}
// 	const queryProcess = (query, key, ifCluster) => {
// 		return new Promise((resolve, reject) => {
// 			if (ifCluster) {
// 				StemiClusterModel.ClusterControlPanelSchema.findOne(query, {Name: 1, createdAt: 1})
// 				.exec(function(queryErr, queryResult) {
// 					if (!queryErr) {
// 						resolve({[key]: queryResult});
// 					} else {
// 						reject(queryErr);
// 					}
// 				});
// 			} else {
// 				ControlPanelModel.AllFieldsSchema.findOne(query, {Name: 1, createdAt: 1})
// 				.exec(function(queryErr, queryResult) {
// 					if (!queryErr) {
// 						resolve({[key]: queryResult});
// 					} else {
// 						reject(queryErr);
// 					}
// 				});
// 			}
// 		});
// 	}
// 	const insertProcess = (request, ifCluster) => {
// 		return new Promise((resolve, reject) => {
// 			childQueryProcessArr = [];
// 			const insertNextOfQuery = {Key_Name: request.insertNextOf_KeyName};
// 			const allQuery = {};
// 			const parentQuery = {Key_Name: request.Parent_KeyName};
// 			if (ifCluster) {
// 				insertNextOfQuery.Cluster = request.Cluster;
// 				allQuery.Cluster = request.Cluster;
// 				parentQuery.Cluster = request.Cluster;
// 			}
// 			childQueryProcessArr.push(queryProcess(insertNextOfQuery, 'insertNextOf', ifCluster));
// 			childQueryProcessArr.push(getAllProcess(allQuery, 'all', ifCluster));
// 			if (request.If_Parent_Available) {
// 				childQueryProcessArr.push(queryProcess(parentQuery, 'parent', ifCluster));
// 			}
// 			Promise.all(childQueryProcessArr).then(response => {
// 				if (request.If_Parent_Available) {
// 					const parentIdx = response.findIndex(x => x.parent && typeof x.parent === 'object');
// 					if (parentIdx >= 0) {
// 						defaultConfig.Parent =  response[parentIdx].parent._id;
// 					}
// 				}
// 				let totalResult = [];
// 				const allDataIdx = response.findIndex(x => x.all && typeof x.all === 'object');
// 				if (allDataIdx >= 0) {
// 					totalResult = response[allDataIdx].all;
// 				}
// 				const insertNextId = response.findIndex(x => x.insertNextOf && typeof x.insertNextOf === 'object');
// 				if (insertNextId >= 0) {
// 					let createdDate = new Date(response[insertNextId].insertNextOf.createdAt);
// 					createdDate.setSeconds(createdDate.getSeconds() + 1);
// 					const getIndexFromAllData = totalResult.findIndex(x => JSON.stringify(x._id) === JSON.stringify(response[insertNextId].insertNextOf._id));
// 					if (getIndexFromAllData >= 0) {
// 						const betweenFromDate = new Date(response[insertNextId].insertNextOf.createdAt);
// 						const betweenToDate = new Date(totalResult[getIndexFromAllData + 1].createdAt);
// 						if (!(betweenFromDate.valueOf() < createdDate.valueOf() && createdDate.valueOf() < betweenToDate.valueOf())) {
// 							createdDate = new Date(betweenFromDate.setMilliseconds(betweenFromDate.getMilliseconds() + 1));
// 						}
// 					}
// 					defaultConfig.createdAt = createdDate;
// 					defaultConfig.updatedAt = createdDate;
// 				}
				
// 				delete request.insertNextOf_KeyName;
// 				delete request.Parent_KeyName;
// 				const insertData = Object.assign(request, defaultConfig);

// 				if (ifCluster) {
// 					StemiClusterModel.ClusterControlPanelSchema.insertMany([insertData]).then(insertResult => {
// 						console.log('Cluster insert Finished');
// 						resolve(insertResult);
// 					}).catch(insertError => {
// 						console.log('Cluster insert Error');
// 						reject(insertError);
// 					});
// 				} else {
// 					ControlPanelModel.AllFieldsSchema.insertMany([insertData]).then(insertResult => {
// 						console.log('insert Finished');
// 						resolve(insertResult);
// 					}).catch(insertError => {
// 						console.log('insert Error');
// 						console.log(insertError);
// 						reject(insertError);
// 					})
// 				}
// 			}).catch(childProcessError => {
// 				reject(childProcessError);
// 			});
// 		});
// 	}

// 	async function asyncForEach(array, callback) {
// 		for (let index = 0; index < array.length; index++) {
// 		  await callback(array[index], index, array);
// 		}
// 	}

// 	const start = async (dataRequest, ifCluster) => {
// 		await asyncForEach(dataRequest, async (data) => {
// 		  await insertProcess(data, ifCluster);
// 		});
// 	 }
	 

// 	 StemiClusterModel.ClusterSchema.find({}).exec((err, response) => {
// 		if (!err) {
// 			response.forEach(cluster => {
// 				const dataRequest = [];
// 				dataInsertRequests.forEach(obj => {
// 					const newObj = Object.assign({}, obj);
// 					newObj['Cluster'] = cluster._id;
// 					dataRequest.push(newObj);
// 				});
// 				start(dataRequest, true);
// 			});
// 		}
// 		start(dataInsertRequests, false);
// 	 });


// }