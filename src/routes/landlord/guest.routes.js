const { Router } = require("express");
const { getGuestData } = require("../../controllers/landlord/guest.controller");

const router = Router();

router.get("/guest", getGuestData);

module.exports = router;
