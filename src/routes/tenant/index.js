const { Router } = require("express");

const router = Router();

router.use("/billing", require("./billing.routes"));
router.use("/communication", require("./communication.routes"));
router.use("/dashboard", require("./dashboard.routes"));

module.exports = router;
