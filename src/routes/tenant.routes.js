const express = require('express');
const router = express.Router();
const { auth, validate } = require('../middlewares');
const { communicationController } = require('../controllers/tenant');
const { communicationValidation } = require('../middlewares/validate.middleware');
const { dashboardController } = require('../controllers/tenant');
const { dashboardValidation } = require('../middlewares/validate.middleware');

// Communication routes
router.get(
  '/communication/:propertyId',
  auth(),
  auth.isTenant,
  validate(communicationValidation.getConversation),
  communicationController.getConversation
);

router.post(
  '/communication/:propertyId',
  auth(),
  auth.isTenant,
  validate(communicationValidation.sendMessage),
  communicationController.sendMessage
);

router.get(
  '/communication/unread/count',
  auth(),
  auth.isTenant,
  communicationController.getUnreadCount
);

router.patch(
  '/communication/:propertyId/archive',
  auth(),
  auth.isTenant,
  validate(communicationValidation.getConversation),
  communicationController.archiveConversation
);

// Dashboard routes
router.get(
  '/dashboard',
  auth(),
  auth.isTenant,
  validate(dashboardValidation.getDashboardData),
  dashboardController.getDashboardData
);

module.exports = router; 