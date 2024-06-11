const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

const PORT = 3000;
const app = express();

app.use(express.json());
const crossOptions = {origin: "*"}
app.use(cors(crossOptions));
app.use(express.urlencoded({extended: true}));

// DB Connection
const connection_option =  {useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true };
	

// mongoose.connect("mongodb://10.10.20.210:27017/stemi-sa", connection_option);
mongoose.connect("mongodb://localhost:27017/Stemi-IN-Live", connection_option);
mongoose.connection.on('error', function (err) {
    console.log(err);
});
mongoose.connection.once('open', function () {
    console.log('DB Connectivity, Success!');
});

app.get('/', (req, res) => {
    try {
    console.log("Listening at port 3000");
    res.status(200).send("Listening at port 3000");
    }
    catch (error) {
        res.status(500).send(error);
    }
});
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

app.use(express.static(path.join(__dirname, 'web')));
app.get('*', function(req, res) {
	res.sendFile(path.join(__dirname, 'web/index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is listening on port number ${PORT}`);
});