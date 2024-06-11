var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var cors = require('cors');
var path = require('path');
var mime = require('mime-types');
var fs = require('fs');
var CryptoJS = require("crypto-js");
var http = require('http');
var https = require('https');
var NODE_ENV = process.env.NODE_ENV || 'development';

var ErrorManagement = require('./server/handling/ErrorHandling.js');
var LogManagement = require('./server/handling/LogHandling.js');   

// Server run part
var app = express();
var server = require('http').Server(app);
// SSL Configuration part
if (NODE_ENV === 'production') {
	const credentials = {
		key: fs.readFileSync('./Config/ssl/stemi.key', 'utf8'),
		cert: fs.readFileSync('./Config/ssl/stemi_co_za.crt', 'utf8'),
		ca: [
			fs.readFileSync('./Config/ssl/SectigoRSADomainValidationSecureServerCA.crt', 'utf8'),
			fs.readFileSync('./Config/ssl/USERTrustRSAAAACA.crt', 'utf8')
		]
	};
	server =  https.createServer(credentials, app);
}


// secure redirection part
if (NODE_ENV === 'production') {
	http.createServer(function (req, res) {
		res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
		res.end();
	}).listen(process.env.DEFAULT_PORT);
}


// Process On Every Error
process.env.TZ = "Africa/Johannesburg";
process.setMaxListeners(0);
process.on('unhandledRejection', (reason, promise) => {
    ErrorManagement.ErrorHandling.ErrorLogCreation('', 'Un Handled Rejection', '', reason);
});
process.on('uncaughtException', function (err) {
   ErrorManagement.ErrorHandling.ErrorLogCreation('', 'Un Caught Exception: ' + err.message, '', JSON.stringify(err.stack));
});


// DB Connection
var connection_option =  {useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true };
if (NODE_ENV === 'production') {
	connection_option.user = process.env.DB_UN,
	connection_option.pass = process.env.DB_PW,
	connection_option.auth = { authSource: 'admin' }
}
mongoose.connect(process.env.DB_URL, connection_option);
mongoose.connection.on('error', function (err) {
    ErrorManagement.ErrorHandling.ErrorLogCreation('', 'Mongodb Connection Error', '', err);
});
mongoose.connection.once('open', function () {
    console.log('DB Connectivity, Success!');
});


// Cors and bodyParser
var corsOptions = {
   origin: NODE_ENV === 'production' ? [process.env.CORS_ORIGIN, process.env.CORS_ORIGIN_ONE] : process.env.CORS_ORIGIN,
   optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true, parameterLimit: 50000 }));
app.use(bodyParser.json({ limit: '10mb' }));


// Complete Data log management in Production
if (NODE_ENV === 'production') {
	app.use('*', (request, response, next) => {
		LogManagement.LogHandling.LogCreation('', request);
		next();
	});
}


// Data Encrypt/Decrypt Only in Production
if (NODE_ENV === 'production') {
	// Decrypt
	app.use('/API/', function (req, res, next) {
		var data = req.body;
		if (data.info) {
			var decryptedData = CryptoJS.AES.decrypt(data.info, process.env.DATA_ENCRIPTION_KEY).toString(CryptoJS.enc.Utf8);
			req.body = JSON.parse(decryptedData);
		}
		next();
	});
	// Encrypt
	function convertData(originalData) {
		if (originalData[0] && originalData[0].Response) {
			const data = JSON.stringify(originalData[0].Response);
			var encryptedData  = CryptoJS.AES.encrypt(data, process.env.DATA_DECRIPTION_KEY).toString();
			originalData[0].Response = encryptedData;
		}
		return originalData;
	}
	app.use('/API/', function (req, res, next) {
		var originalSend = res.send;
		res.send = function(){
			originalSend.apply(res, convertData(arguments));
		};
		next();
	});
}


// Cron jobs and Directory watch
require('./server/helpers/mysqlDB-handling').MySQL_Manage();
require('./server/helpers/BPL-handling').DirectoryWatching();
// require('./server/helpers/new-field-inserting').NewFieldInserting();


// Web API
require('./server/api/routes/login_management.routes')(app);
require('./server/api/routes/control_panel.routes')(app);
require('./server/api/routes/location.routes')(app);
require('./server/api/routes/patient-management/patient_details.routes')(app);
require('./server/api/routes/patient-management/thrombolysis.routes')(app);
require('./server/api/routes/patient-management/pci.routes')(app);
require('./server/api/routes/patient-management/hospital_summary.routes')(app);
require('./server/api/routes/patient-management/discharge_transfer.routes')(app);
require('./server/api/routes/patient-management/followup.routes')(app);
require('./server/api/routes/hospital_management.routes')(app);
require('./server/api/routes/global_management.routes')(app);
require('./server/api/routes/cluster_management.routes')(app);
require('./server/api/routes/user_management.routes')(app);
require('./server/api/routes/device_management.routes')(app);
require('./server/api/routes/Ask_Cardiologist_patients.routes')(app);
require('./server/api/routes/offline_patients.routes')(app);
require('./server/api/routes/BPLPatient_Management.routes')(app);
require('./server/api/routes/config_idproof.routes')(app);
require('./server/api/routes/reports.routes')(app);
require('./server/api/routes/referral_facility.routes')(app);


// Mobile API
require('./server/mobile_api/routes/login_management.route')(app);
require('./server/mobile_api/routes/patient-management/patient_details.route')(app);


// gzip redirection and dist redirection Only in Production
if (NODE_ENV === 'production' || NODE_ENV === 'stage') {
	app.use('/*.html|/*.js|/*.css|/*.png|/*.jpg|/*.svg|/*.ico|/*.ttf|/*.woff|/*.txt|/*.eot|/*.json', function (req, res, next) {
		if (req.headers['accept-encoding']) {
			const cond = req.headers['accept-encoding'].includes('gzip');
			if (cond) {
				const contentType = mime.lookup(req.originalUrl);
				req.url = req.url + '.gz';
				res.set('Content-Encoding', 'gzip');
				res.set('Content-Type', contentType);
			}
		}
		next();
	});
}

app.use(express.static(path.join(__dirname, 'web')));
app.get('*', function(req, res) {
	res.sendFile(path.join(__dirname, 'web/index.html'));
});

server.listen(process.env.PORT, function () {
   console.log(`Server listening on port ${process.env.PORT}` );
});
