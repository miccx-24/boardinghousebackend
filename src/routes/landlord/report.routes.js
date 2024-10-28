const { Router } = require("express");
const { getReportData } = require("../../controllers/landlord/report.controller");

const router = Router();

router.get("/report", getReportData);

module.exports = router;
