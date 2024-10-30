const Payment = require("../../models/payment");
const Tenant = require("../../models/tenant");
const Bill = require("../../models/bill");
const { NotFoundError, BadRequestError } = require("../../utils/errors");
const { processStripePayment } = require("../../services/stripe/payment");
const { sendEmail } = require("../../services/email");

module.exports = {
  async recordPayment(req, res) {
    try {
      const {
        tenantId,
        amount,
        paymentMethod,
        paymentDate,
        billId,
        description,
        paymentType
      } = req.body;

      // Verify tenant exists
      const tenant = await Tenant.findById(tenantId);
      if (!tenant) {
        throw new NotFoundError('Tenant not found');
      }

      // If payment is for a bill, verify bill exists
      if (billId) {
        const bill = await Bill.findById(billId);
        if (!bill) {
          throw new NotFoundError('Bill not found');
        }
      }

      const payment = await Payment.create({
        tenantId,
        amount,
        paymentMethod,
        paymentDate: new Date(paymentDate),
        billId,
        description,
        paymentType,
        status: 'completed',
        landlordId: req.user.id
      });

      // Update bill status if payment is for a bill
      if (billId) {
        await Bill.findByIdAndUpdate(billId, { status: 'paid' });
      }

      // Send payment confirmation to tenant
      await sendEmail(
        tenant.email,
        'Payment Confirmation',
        `Your payment of ${amount} has been recorded successfully.`
      );

      res.status(201).json({ success: true, data: payment });
    } catch (error) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message
      });
    }
  },

  async processOnlinePayment(req, res) {
    try {
      const { tenantId, amount, billId, paymentMethod } = req.body;

      const tenant = await Tenant.findById(tenantId);
      if (!tenant) {
        throw new NotFoundError('Tenant not found');
      }

      // Process payment through Stripe
      const stripePayment = await processStripePayment({
        amount,
        customerId: tenant.stripeCustomerId,
        paymentMethod
      });

      // Record payment in database
      const payment = await Payment.create({
        tenantId,
        amount,
        paymentMethod: 'online',
        paymentDate: new Date(),
        billId,
        stripePaymentId: stripePayment.id,
        status: 'completed',
        landlordId: req.user.id
      });

      // Update bill status if applicable
      if (billId) {
        await Bill.findByIdAndUpdate(billId, { status: 'paid' });
      }

      res.status(200).json({ success: true, data: payment });
    } catch (error) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message
      });
    }
  },

  async getPayments(req, res) {
    try {
      const { tenantId, startDate, endDate, status, paymentMethod } = req.query;
      
      const query = { landlordId: req.user.id };
      
      if (tenantId) query.tenantId = tenantId;
      if (status) query.status = status;
      if (paymentMethod) query.paymentMethod = paymentMethod;
      if (startDate && endDate) {
        query.paymentDate = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }

      const payments = await Payment.find(query)
        .populate('tenantId', 'name room')
        .populate('billId', 'description dueDate')
        .sort({ paymentDate: -1 });

      res.status(200).json({ success: true, data: payments });
    } catch (error) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message
      });
    }
  },

  async getPaymentDetails(req, res) {
    try {
      const { paymentId } = req.params;

      const payment = await Payment.findById(paymentId)
        .populate('tenantId', 'name room email')
        .populate('billId');

      if (!payment) {
        throw new NotFoundError('Payment not found');
      }

      res.status(200).json({ success: true, data: payment });
    } catch (error) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message
      });
    }
  },

  async voidPayment(req, res) {
    try {
      const { paymentId } = req.params;
      const { reason } = req.body;

      const payment = await Payment.findById(paymentId);
      if (!payment) {
        throw new NotFoundError('Payment not found');
      }

      // If online payment, process refund through Stripe
      if (payment.stripePaymentId) {
        // Implement Stripe refund logic
      }

      payment.status = 'voided';
      payment.voidReason = reason;
      payment.voidDate = new Date();
      payment.voidedBy = req.user.id;
      await payment.save();

      // If payment was for a bill, update bill status
      if (payment.billId) {
        await Bill.findByIdAndUpdate(payment.billId, { status: 'pending' });
      }

      res.status(200).json({ success: true, data: payment });
    } catch (error) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message
      });
    }
  }
};