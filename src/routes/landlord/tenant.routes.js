const express = require('express');
const router = express.Router();
const tenantController = require('../../controllers/landlord/tenant.controller');
const { authenticateLandlord } = require('../../middleware/auth.middleware');

router.use(authenticateLandlord);

router.get('/tenants', tenantController.getTenants);
router.post('/tenants/assign', tenantController.assignTenant);
router.delete('/tenants/remove/:roomId', tenantController.removeTenant);

module.exports = router;
