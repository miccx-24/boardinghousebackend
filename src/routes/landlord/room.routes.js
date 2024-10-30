const express = require('express');
const router = express.Router();
const roomController = require('../../controllers/landlord/room.controller');
const { authenticateLandlord } = require('../../middleware/auth.middleware');

// Add debug middleware
const debugMiddleware = (req, res, next) => {
    console.log('Request:', {
        method: req.method,
        path: req.path,
        body: req.body,
        headers: req.headers,
        user: req.user
    });
    next();
};

router.use(authenticateLandlord);
router.use(debugMiddleware);

router.post('/rooms', roomController.createRoom);
router.get('/rooms/property/:propertyId', roomController.getRoomsByProperty);
router.get('/rooms/property/:propertyId/stats', roomController.getRoomStats);
router.get('/rooms/property/:propertyId/maintenance', roomController.getMaintenanceRooms);
router.put('/rooms/:roomId', roomController.updateRoom);
router.delete('/rooms/:roomId', roomController.deleteRoom);

module.exports = router;
