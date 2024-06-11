module.exports = function (app){

    var Controller = require('./../../controllers/patient-management/pci.controller');

    app.post('/API/patient_management/PciDrugBeforePci_Create', Controller.PciDrugBeforePci_Create);
    app.post('/API/patient_management/PciDrugBeforePci_View', Controller.PciDrugBeforePci_View);
    app.post('/API/patient_management/PciDrugBeforePci_Update', Controller.PciDrugBeforePci_Update);

    app.post('/API/patient_management/Pci_Create', Controller.Pci_Create);
    app.post('/API/patient_management/Pci_View', Controller.Pci_View);
    app.post('/API/patient_management/Pci_Update', Controller.Pci_Update);

    app.post('/API/patient_management/PciMedicationInCath_Create', Controller.PciMedicationInCath_Create);
    app.post('/API/patient_management/PciMedicationInCath_View', Controller.PciMedicationInCath_View);
    app.post('/API/patient_management/PciMedicationInCath_Update', Controller.PciMedicationInCath_Update);

};