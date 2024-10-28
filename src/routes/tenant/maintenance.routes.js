const { Router } = require("express");
const { getMaintenanceData } = require("../../controllers/tenant/maintenance.controller");

const router = Router();

router.get("/maintenance", getMaintenanceData);

module.exports = router;
