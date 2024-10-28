const { Router } = require("express");
const { getDashboardData } = require("../../controllers/tenant/dashboard.controller");

const router = Router();

router.get("/dashboard", getDashboardData);

module.exports = router;
    