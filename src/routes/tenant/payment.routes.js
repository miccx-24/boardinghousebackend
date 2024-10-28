const { Router } = require("express");
const { getPaymentData } = require("../../controllers/tenant/payment.controller");

const router = Router();

router.get("/payment", getPaymentData);

module.exports = router;
