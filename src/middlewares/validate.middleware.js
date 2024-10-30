const { check } = require("express-validator");
const Joi = require('joi');

const billingValidation = {
  getBillingHistory: {
    query: Joi.object({
      period: Joi.string().valid('all', 'month', 'quarter', 'year'),
      search: Joi.string().allow('', null)
    })
  },
  downloadStatement: {
    query: Joi.object({
      startDate: Joi.date().required(),
      endDate: Joi.date().required().min(Joi.ref('startDate'))
    })
  }
};

const communicationValidation = {
  sendMessage: {
    params: Joi.object({
      propertyId: Joi.string().required().hex().length(24)
    }),
    body: Joi.object({
      content: Joi.string().required().min(1).max(1000)
    })
  },
  getConversation: {
    params: Joi.object({
      propertyId: Joi.string().required().hex().length(24)
    })
  }
};

const dashboardValidation = {
  getDashboardData: {
    query: Joi.object({
      // Add any query parameters if needed
    })
  }
};

module.exports = {
    check,
    billingValidation,
    communicationValidation,
    dashboardValidation
};
