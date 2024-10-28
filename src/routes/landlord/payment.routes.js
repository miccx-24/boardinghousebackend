const { Router } = require("express");
const { getPaymentData } = require("../../controllers/landlord/payment.controller");

const router = Router();

router.get("/payment", getPaymentData);

module.exports = router;
