const { Router } = require("express");
const { sendEmail } = require("../../controllers/tenant/communication.controller");

const router = Router();

router.post("/send-email", sendEmail);

module.exports = router;
