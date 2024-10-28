const { Router } = require("express");
const router = Router();

router.use("/billing", require("./billing.routes"));
router.use("/communication", require("./communication.routes"));
router.use("/dashboard", require("./dashboard.routes"));
router.use("/guest", require("./guest.routes"));
router.use("/inventory", require("./inventory.routes"));
router.use("/lease", require("./lease.routes"));
router.use("/maintenance", require("./maintenance.routes"));
router.use("/payment", require("./payment.routes"));
router.use("/report", require("./report.routes"));
router.use("/room", require("./room.routes"));
router.use("/tenant", require("./tenant.routes"));

module.exports = router;
