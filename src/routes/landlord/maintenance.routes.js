const { Router } = require("express");
const { getMaintenanceData } = require("../../controllers/landlord/maintenance.controller");

const router = Router();

router.get("/maintenance", getMaintenanceData);

module.exports = router;
