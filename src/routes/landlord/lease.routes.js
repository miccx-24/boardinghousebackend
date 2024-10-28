const { Router } = require("express");
const { getLeaseData } = require("../../controllers/landlord/lease.controller");

const router = Router();

router.get("/lease", getLeaseData);

module.exports = router;

