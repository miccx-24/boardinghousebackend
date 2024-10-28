const { Router } = require("express");
const { getTenantData } = require("../../controllers/landlord/tenant.controller");

const router = Router();

router.get("/tenant", getTenantData);

module.exports = router;
