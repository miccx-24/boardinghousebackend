const { Router } = require("express");
const { createInvoice } = require("../../controllers/landlord/billing.controller");

const router = Router();

router.post("/create-invoice", createInvoice);

module.exports = router;
