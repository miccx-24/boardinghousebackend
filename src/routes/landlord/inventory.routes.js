const { Router } = require("express");
const { getInventoryData } = require("../../controllers/landlord/inventory.controller");

const router = Router();

router.get("/inventory", getInventoryData);

module.exports = router;
