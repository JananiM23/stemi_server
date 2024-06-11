var mysql = require('mysql');
var moment = require('moment');
var TableInfo = require('./MySQLFields_List');
var DataCollect = require('../api/controllers/reports.controller');
var HeaderFields = require('./Report-Fiels');
var Schedule = require('node-schedule');
var CronJob = require('cron').CronJob;

// MySQL Connection
var connection = mysql.createConnection({
   host: process.env.MYSQL_HOST,
   user: process.env.MYSQL_UN,
   password: process.env.MYSQL_PW,
   database: process.env.MYSQL_DB,
});
connection.connect(function(err) {
   if (err) {
      console.warn('MySQL Connection Error ');
   } else {
		console.log('MySQL Connectivity, Success!');
	}
});


exports.MySQL_Manage = function () {
   var job = new CronJob('0 0 * * * *', function() {

		async function DataCollectInsert() {
			let result = await DataCollect.AllPatientDetails_List(null, null);

			// MySQL Fields
			let HeadersArr = [];
			var valueArr = [];
			TableInfo.MySQLFields.map(Obj => { if (Obj.Key !== 'id') { HeadersArr.push(Obj.Key);  }});
			HeadersArr = HeadersArr.toString();
			result.MySQLDataArr.map(record => {
				var arrObj = Object.keys(record).map(function (key) { 
					var value = record[key];
					if (TableInfo.DateFields.includes(key)) {
						value = (value !== '' && value !== null) ? moment(value, "DD-MMM-YYYY").toDate() : null;
					}
					if (TableInfo.DateTimeFields.includes(key)) {
						value = (value !== '' && value !== null) ? moment(value, "DD-MMM-YYYY HH:mm").toDate() : null;
					}
					if (TableInfo.TimeFields.includes(key)) {
						value = (value !== '' && value !== null) ? moment(value, "HH:mm").format("HH:mm:ss") : null;
					}
					if (TableInfo.IntFields.includes(key)) {
						value = (value !== '' && value !== null) ? parseInt(value, "10") : null;
					}
					return value; 
				});
				valueArr.push(arrObj);
			});

			// MySQL Medication Header
			let HeadersMedArr = [];
			let ValueMedArr = [];
			TableInfo.MySQLMedicationFields.map(Obj => { if (Obj.Key !== 'id') { HeadersMedArr.push(Obj.Key);  }});
			HeadersMedArr = HeadersMedArr.toString();
			result.MedicationArr.map(record => {
				var arrObj = Object.keys(record).map(function (key) { 
					var value = record[key];
					if (TableInfo.DateTimeFields.includes(key)) {
						value = (value !== '' && value !== null) ? moment(value, "DD-MMM-YYYY HH:mm").toDate() : null;
					}
					return value; 
				});
				ValueMedArr.push(arrObj);
			});

			// MySQL Treatment Modalities
			let HeadersTreatmentArr = [];
			let ValueTreatmentArr = [];
			TableInfo.MySQLTreatmentModalitiesFields.map(Obj => { if (Obj.Key !== 'id') { HeadersTreatmentArr.push(Obj.Key);  }});
			HeadersTreatmentArr = HeadersTreatmentArr.toString();
			result.TreatmentModalitiesArr.map(record => {
				var arrObj = Object.keys(record).map(function (key) { 
					var value = record[key];
					if (TableInfo.DateTimeFields.includes(key)) {
						value = (value !== '' && value !== null) ? moment(value, "DD-MMM-YYYY HH:mm").toDate() : null;
					}
					return value; 
				});
				ValueTreatmentArr.push(arrObj);
			});

			// MySQL Vessel Stent 
			let HeadersVesselArr = [];
			let ValueVesselArr = [];
			TableInfo.MySQLVesselStentFields.map(Obj => { if (Obj.Key !== 'id') { HeadersVesselArr.push(Obj.Key);  }});
			HeadersVesselArr = HeadersVesselArr.toString();
			result.VesselStentArr.map(record => {
				var arrObj = Object.keys(record).map(function (key) { 
					var value = record[key];
					if (TableInfo.DateTimeFields.includes(key)) {
						value = (value !== '' && value !== null) ? moment(value, "DD-MMM-YYYY HH:mm").toDate() : null;
					}
					return value; 
				});
				ValueVesselArr.push(arrObj);
			});

			// MySQL Stents
			let HeadersStentArr = [];
			let ValueStentsArr = [];
			TableInfo.MySQLStentsFields.map(Obj => { if (Obj.Key !== 'id') { HeadersStentArr.push(Obj.Key);  }});
			HeadersStentArr = HeadersStentArr.toString();
			result.StentsArr.map(record => {
				var arrObj = Object.keys(record).map(function (key) {
					var value = record[key];
					if (TableInfo.DateTimeFields.includes(key)) {
						value = (value !== '' && value !== null) ? moment(value, "DD-MMM-YYYY HH:mm").toDate() : null;
					}
					return value; 
				});
				ValueStentsArr.push(arrObj);
			});

			// MySQL MACE
			let HeadersMaceArr = [];
			let ValueMaceArr = [];
			TableInfo.MySQLMaceFields.map(Obj => { if (Obj.Key !== 'id') { HeadersMaceArr.push(Obj.Key);  }});
			HeadersMaceArr = HeadersMaceArr.toString();
			result.MaceArr.map(record => {
				var arrObj = Object.keys(record).map(function (key) {
					var value = record[key];
					if (TableInfo.DateTimeFields.includes(key)) {
						value = (value !== '' && value !== null) ? moment(value, "DD-MMM-YYYY HH:mm").toDate() : null;
					}
					return value; 
				});
				ValueMaceArr.push(arrObj);
			});


			// MySQL Drug Before PCI Medication
			let HeadersDrugBeforePCIMedicationArr = [];
			let ValueDrugBeforePCIMedicationArr = [];
			TableInfo.MySQLDrugBeforePCIMedicationFields.map(Obj => { if (Obj.Key !== 'id') { HeadersDrugBeforePCIMedicationArr.push(Obj.Key);  }});
			HeadersDrugBeforePCIMedicationArr = HeadersDrugBeforePCIMedicationArr.toString();
			result.DrugBeforePCIMedicationArr.map(record => {
				var arrObj = Object.keys(record).map(function (key) {
					var value = record[key];
					if (TableInfo.DateTimeFields.includes(key)) {
						value = (value !== '' && value !== null) ? moment(value, "DD-MMM-YYYY HH:mm").toDate() : null;
					}
					return value; 
				});
				ValueDrugBeforePCIMedicationArr.push(arrObj);
			});

			// MySQL Risk Factor
			let HeadersRiskFactorArr = [];
			let ValueRiskFactorArr = [];
			TableInfo.MySQLRiskFactorFields.map(Obj => { if (Obj.Key !== 'id') { HeadersRiskFactorArr.push(Obj.Key);  }});
			HeadersRiskFactorArr = HeadersRiskFactorArr.toString();
			result.RiskFactorArr.map(record => {
				var arrObj = Object.keys(record).map(function (key) {
					var value = record[key];
					if (TableInfo.DateTimeFields.includes(key)) {
						value = (value !== '' && value !== null) ? moment(value, "DD-MMM-YYYY HH:mm").toDate() : null;
					}
					return value; 
				});
				ValueRiskFactorArr.push(arrObj);
			});

			const InsetQueryOne = 'INSERT INTO temp_patient_records(' + HeadersArr + ') VALUES ? ';
			const InsetQueryOneValue = valueArr;
			const InsetQueryTwo = 'INSERT INTO temp_patient_medication(' + HeadersMedArr + ') VALUES ? ';
			const InsetQueryTwoValue = ValueMedArr;
			const InsetQueryThree = 'INSERT INTO temp_patient_treatment_strategy(' + HeadersTreatmentArr + ') VALUES ? ';
			const InsetQueryThreeValue = ValueTreatmentArr;
			const InsetQueryFour = 'INSERT INTO temp_patient_vessel(' + HeadersVesselArr + ') VALUES ? ';
			const InsetQueryFourValue = ValueVesselArr;
			const InsetQueryFive = 'INSERT INTO temp_patient_stent(' + HeadersStentArr + ') VALUES ? ';
			const InsetQueryFiveValue = ValueStentsArr;
			const InsetQuerySix = 'INSERT INTO temp_patient_mace(' + HeadersMaceArr + ') VALUES ? ';
			const InsetQuerySixValue = ValueMaceArr;
			const InsetQueryEight = 'INSERT INTO temp_drug_before_pci_medication(' + HeadersDrugBeforePCIMedicationArr + ') VALUES ? ';
			const InsetQueryEightValue = ValueDrugBeforePCIMedicationArr;
			const InsetQueryNine = 'INSERT INTO temp_risk_factor(' + HeadersRiskFactorArr + ') VALUES ? ';
			const InsetQueryNineValue = ValueRiskFactorArr;

			var renameError = false;
			if (InsetQueryOneValue.length > 0) {
				connection.query(InsetQueryOne,  [InsetQueryOneValue], function (err1, Result_1) {
					if (!err1) {
						var DropQuery = "DROP TABLE IF EXISTS patient_records";
						connection.query(DropQuery, function (err2, Result_2) {
							if (!err2) {
								var RenameQuery = "RENAME TABLE temp_patient_records TO patient_records";
								connection.query(RenameQuery, (err3, result3) => {
									if (err3) {
										renameError = true;
										console.log('Error Rename temp_patient_records');
									}
								});
							} else {
								console.log('Error DROP patient_records');
							}
						});
					} else {
						console.log('Error Insert patient_records');
					}
				});
			}

			if (InsetQueryTwoValue.length > 0) {
				connection.query(InsetQueryTwo,  [InsetQueryTwoValue], function (err1, Result_1) {
					if (!err1) {
						var DropQuery = "DROP TABLE IF EXISTS patient_medication";
						connection.query(DropQuery, function (err2, Result_2) {
							if (!err2) {
								var RenameQuery = "RENAME TABLE temp_patient_medication TO patient_medication";
								connection.query(RenameQuery, (err3, result3) => {
									if (err3) {
										renameError = true;
										console.log('Error Rename temp_patient_medication');
									}
								});
							} else {
								console.log('Error DROP patient_medication');
							}
						});
					} else {
						console.log('Error Insert patient_medication');
					}
				});
			}

			if (InsetQueryThreeValue.length > 0) {
				connection.query(InsetQueryThree,  [InsetQueryThreeValue], function (err1, Result_1) {
					if (!err1) {
						var DropQuery = "DROP TABLE IF EXISTS patient_treatment_strategy";
						connection.query(DropQuery, function (err2, Result_2) {
							if (!err2) {
								var RenameQuery = "RENAME TABLE temp_patient_treatment_strategy TO patient_treatment_strategy";
								connection.query(RenameQuery, (err3, result3) => {
									if (err3) {
										renameError = true;
										console.log('Error Rename temp_patient_treatment_strategy');
									}
								});
							} else {
								console.log('Error DROP patient_treatment_strategy');
							}
						});
					} else {
						console.log('Error Insert patient_treatment_strategy');
					}
				});
			}

			if (InsetQueryFourValue.length > 0) {
				connection.query(InsetQueryFour,  [InsetQueryFourValue], function (err1, Result_1) {
					if (!err1) {
						var DropQuery = "DROP TABLE IF EXISTS patient_vessel";
						connection.query(DropQuery, function (err2, Result_2) {
							if (!err2) {
								var RenameQuery = "RENAME TABLE temp_patient_vessel TO patient_vessel";
								connection.query(RenameQuery, (err3, result3) => {
									if (err3) {
										renameError = true;
										console.log('Error Rename temp_patient_vessel');
									}
								});
							} else {
								console.log('Error DROP patient_vessel');
							}
						});
					} else {
						console.log('Error Insert patient_vessel');
					}
				});
			}

			if (InsetQueryFiveValue.length > 0) {
				connection.query(InsetQueryFive,  [InsetQueryFiveValue], function (err1, Result_1) {
					if (!err1) {
						var DropQuery = "DROP TABLE IF EXISTS patient_stent";
						connection.query(DropQuery, function (err2, Result_2) {
							if (!err2) {
								var RenameQuery = "RENAME TABLE temp_patient_stent TO patient_stent";
								connection.query(RenameQuery, (err3, result3) => {
									if (err3) {
										renameError = true;
										console.log('Error Rename temp_patient_stent');
									}
								});
							} else {
								console.log('Error DROP patient_stent');
							}
						});
					} else {
						console.log('Error Insert patient_stent');
					}
				});
			}

			if (InsetQuerySixValue.length > 0) {
				connection.query(InsetQuerySix,  [InsetQuerySixValue], function (err1, Result_1) {
					if (!err1) {
						var DropQuery = "DROP TABLE IF EXISTS patient_mace";
						connection.query(DropQuery, function (err2, Result_2) {
							if (!err2) {
								var RenameQuery = "RENAME TABLE temp_patient_mace TO patient_mace";
								connection.query(RenameQuery, (err3, result3) => {
									if (err3) {
										renameError = true;
										console.log('Error Rename temp_patient_mace');
									}
								});
							} else {
								console.log('Error DROP patient_mace');
							}
						});
					} else {
						console.log('Error Insert patient_mace');
					}
				});
			}

			if (InsetQueryEightValue.length > 0) {
				connection.query(InsetQueryEight,  [InsetQueryEightValue], function (err1, Result_1) {
					if (!err1) {
						var DropQuery = "DROP TABLE IF EXISTS drug_before_pci_medication";
						connection.query(DropQuery, function (err2, Result_2) {
							if (!err2) {
								var RenameQuery = "RENAME TABLE temp_drug_before_pci_medication TO drug_before_pci_medication";
								connection.query(RenameQuery, (err3, result3) => {
									if (err3) {
										renameError = true;
										console.log('Error Rename temp_drug_before_pci_medication');
									}
								});
							} else {
								console.log('Error DROP drug_before_pci_medication');
							}
						});
					} else {
						console.log('Error Insert drug_before_pci_medication');
					}
				});
			}

			if (InsetQueryNineValue.length > 0) {
				connection.query(InsetQueryNine,  [InsetQueryNineValue], function (err1, Result_1) {
					if (!err1) {
						var DropQuery = "DROP TABLE IF EXISTS risk_factor";
						connection.query(DropQuery, function (err2, Result_2) {
							if (!err2) {
								var RenameQuery = "RENAME TABLE temp_risk_factor TO risk_factor";
								connection.query(RenameQuery, (err3, result3) => {
									if (err3) {
										renameError = true;
										console.log('Error Rename temp_risk_factor');
									}
								});
							} else {
								console.log('Error DROP risk_factor');
							}
						});
					} else {
						console.log('Error Insert risk_factor');
					}
				});
			}

			setTimeout(() => {
				if (renameError) {
					tempTableCreation();
					console.log('cron re-initiated');
				}
			}, 60000);
		}
			
		function tempTableCreation() {
			var TempDropQuery = "DROP TABLE IF EXISTS temp_patient_records, temp_patient_medication, temp_patient_treatment_strategy, temp_patient_vessel, temp_patient_stent, temp_patient_mace, temp_drug_before_pci_medication, temp_risk_factor";
			connection.query(TempDropQuery, function (err_1, result_1) {
				if (err_1) throw err_1;
				// MySQL Query
				var Addon_Query = '';
				TableInfo.MySQLFields.map((obj, idx) => {
					const Addon = idx + 1 === TableInfo.MySQLFields.length ? '' : ',';
					Addon_Query = Addon_Query + ' ' + obj.Key + ' ' + obj.Type + ' ' + obj.Extra + Addon;
				});
				var MySQL_Query = 'CREATE TABLE IF NOT EXISTS temp_patient_records(' + Addon_Query + ')';
				var MySQL_AddOn_Query = 'CREATE TABLE IF NOT EXISTS patient_records(' + Addon_Query + ')';

				// MySQL Medication
				var Addon_Query_Med = '';
				TableInfo.MySQLMedicationFields.map((obj, idx) => {
					const Addon_Med = idx + 1 === TableInfo.MySQLMedicationFields.length ? '' : ',';
					Addon_Query_Med = Addon_Query_Med + ' ' + obj.Key + ' ' + obj.Type + ' ' + obj.Extra + Addon_Med;
				});
				var MySQL_Query_1 = 'CREATE TABLE IF NOT EXISTS temp_patient_medication(' + Addon_Query_Med + ')';
				var MySQL_AddOn_Query_1 = 'CREATE TABLE IF NOT EXISTS patient_medication(' + Addon_Query_Med + ')';

				// MySQL Treatment Modalities
				var Addon_Query_Treatment = '';
				TableInfo.MySQLTreatmentModalitiesFields.map((obj, idx) => {
					const Addon_Treatment = idx + 1 === TableInfo.MySQLTreatmentModalitiesFields.length ? '' : ',';
					Addon_Query_Treatment = Addon_Query_Treatment + ' ' + obj.Key + ' ' + obj.Type + ' ' + obj.Extra + Addon_Treatment;
				});
				var MySQL_Query_2 = 'CREATE TABLE IF NOT EXISTS temp_patient_treatment_strategy(' + Addon_Query_Treatment + ')';
				var MySQL_AddOn_Query_2 = 'CREATE TABLE IF NOT EXISTS patient_treatment_strategy(' + Addon_Query_Treatment + ')';

				// MySQL Vessel Stent
				var Addon_Query_Vessel = '';
				TableInfo.MySQLVesselStentFields.map((obj, idx) => {
					const Addon_Vessel = idx + 1 === TableInfo.MySQLVesselStentFields.length ? '' : ',';
					Addon_Query_Vessel = Addon_Query_Vessel + ' ' + obj.Key + ' ' + obj.Type + ' ' + obj.Extra + Addon_Vessel;
				});
				var MySQL_Query_3 = 'CREATE TABLE IF NOT EXISTS temp_patient_vessel(' + Addon_Query_Vessel + ')';
				var MySQL_AddOn_Query_3 = 'CREATE TABLE IF NOT EXISTS patient_vessel(' + Addon_Query_Vessel + ')';

				
				// MySQL Stents
				var Addon_Query_Stent = '';
				TableInfo.MySQLStentsFields.map((obj, idx) => {
					const Addon_Stent = idx + 1 === TableInfo.MySQLStentsFields.length ? '' : ',';
					Addon_Query_Stent = Addon_Query_Stent + ' ' + obj.Key + ' ' + obj.Type + ' ' + obj.Extra + Addon_Stent;
				});
				var MySQL_Query_4 = 'CREATE TABLE IF NOT EXISTS temp_patient_stent(' + Addon_Query_Stent + ')';
				var MySQL_AddOn_Query_4 = 'CREATE TABLE IF NOT EXISTS patient_stent(' + Addon_Query_Stent + ')';

				
				// MySQL MACE
				var Addon_Query_Mace = '';
				TableInfo.MySQLMaceFields.map((obj, idx) => {
					const Addon_Mace = idx + 1 === TableInfo.MySQLMaceFields.length ? '' : ',';
					Addon_Query_Mace = Addon_Query_Mace + ' ' + obj.Key + ' ' + obj.Type + ' ' + obj.Extra + Addon_Mace;
				});
				var MySQL_Query_5 = 'CREATE TABLE IF NOT EXISTS temp_patient_mace(' + Addon_Query_Mace + ')';
				var MySQL_AddOn_Query_5 = 'CREATE TABLE IF NOT EXISTS patient_mace(' + Addon_Query_Mace + ')';

				// MySQL Drug Before PCI Medication
				var Addon_Query_DrugBeforePCIMedication = '';
				TableInfo.MySQLDrugBeforePCIMedicationFields.map((obj, idx) => {
					const Addon_pci_med = idx + 1 === TableInfo.MySQLDrugBeforePCIMedicationFields.length ? '' : ',';
					Addon_Query_DrugBeforePCIMedication = Addon_Query_DrugBeforePCIMedication + ' ' + obj.Key + ' ' + obj.Type + ' ' + obj.Extra + Addon_pci_med;
				});
				var MySQL_Query_7 = 'CREATE TABLE IF NOT EXISTS temp_drug_before_pci_medication(' + Addon_Query_DrugBeforePCIMedication + ')';
				var MySQL_AddOn_Query_7 = 'CREATE TABLE IF NOT EXISTS drug_before_pci_medication(' + Addon_Query_DrugBeforePCIMedication + ')';

				// MySQL Risk Factor
				var Addon_Query_RiskFactor = '';
				TableInfo.MySQLRiskFactorFields.map((obj, idx) => {
					const Addon_risk_factor = idx + 1 === TableInfo.MySQLRiskFactorFields.length ? '' : ',';
					Addon_Query_RiskFactor = Addon_Query_RiskFactor + ' ' + obj.Key + ' ' + obj.Type + ' ' + obj.Extra + Addon_risk_factor;
				});
				var MySQL_Query_8 = 'CREATE TABLE IF NOT EXISTS temp_risk_factor(' + Addon_Query_RiskFactor + ')';
				var MySQL_AddOn_Query_8 = 'CREATE TABLE IF NOT EXISTS risk_factor(' + Addon_Query_RiskFactor + ')';


				Promise.all([
					connection.query(MySQL_Query),
					connection.query(MySQL_AddOn_Query),
					connection.query(MySQL_Query_1),
					connection.query(MySQL_AddOn_Query_1),
					connection.query(MySQL_Query_2),
					connection.query(MySQL_AddOn_Query_2),
					connection.query(MySQL_Query_3),
					connection.query(MySQL_AddOn_Query_3),
					connection.query(MySQL_Query_4),
					connection.query(MySQL_AddOn_Query_4),
					connection.query(MySQL_Query_5),
					connection.query(MySQL_AddOn_Query_5),
					connection.query(MySQL_Query_7),
					connection.query(MySQL_AddOn_Query_7),
					connection.query(MySQL_Query_8),
					connection.query(MySQL_AddOn_Query_8)
				]).then( response => {
					DataCollectInsert();
				}).catch(error => {
					console.log('CREATE TABLE Error');
				});
			});
		}

		if (connection.state === 'connected' || connection.state === 'authenticated') {
			tempTableCreation()
		}

   }, null, true, 'Africa/Johannesburg');
   job.start();
};
