const express = require('express');
const router = express.Router();
const propertyController = require('../../controllers/landlord/property.controller');
const { authenticateLandlord } = require('../../middleware/auth.middleware');

router.use(authenticateLandlord);

router.post('/properties', propertyController.createProperty);
router.get('/properties', propertyController.getProperties);

module.exports = router; 