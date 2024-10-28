const { Router } = require("express");
const { getLeaseData } = require("../../controllers/tenant/lease.controller");

const router = Router();

router.get("/lease", getLeaseData);

module.exports = router;
