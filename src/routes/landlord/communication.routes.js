const { Router } = require("express");
const { sendEmail } = require("../../controllers/landlord/communication.controller");

const router = Router();

router.post("/send-email", sendEmail);

module.exports = router;
