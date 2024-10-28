const { Router } = require("express");
const { getDashboardData } = require("../../controllers/landlord/dashboard.controller");

const router = Router();

router.get("/dashboard", getDashboardData);

module.exports = router;
