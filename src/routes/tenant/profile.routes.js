const { Router } = require("express");
const { getProfileData } = require("../../controllers/tenant/profile.controller");

const router = Router();

router.get("/profile", getProfileData);

module.exports = router;
