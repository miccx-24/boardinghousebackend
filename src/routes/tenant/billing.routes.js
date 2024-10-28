const { Router } = require("express");
const { getBillingData } = require("../../controllers/tenant/billing.controller");

const router = Router();

router.get("/billing", getBillingData);

module.exports = router;

