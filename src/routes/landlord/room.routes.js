const { Router } = require("express");
const { getRoomData } = require("../../controllers/landlord/room.controller");

const router = Router();

router.get("/room", getRoomData);

module.exports = router;
