const { createInvoice, retrieveInvoice, cancelInvoice } = require("../../services/stripe/invoice");
const Bill = require("../../models/bill");
const Tenant = require("../../models/tenant");
const { NotFoundError, BadRequestError } = require("../../utils/errors");

module.exports = {
  async createBill(req, res) {
    try {
      const { tenantId, amount, description, dueDate, billType } = req.body;
      
      const tenant = await Tenant.findById(tenantId);
      if (!tenant) {
        throw new NotFoundError('Tenant not found');
      }

      // Create Stripe invoice
      const invoice = await createInvoice({
        customerId: tenant.stripeCustomerId,
        amount,
        description,
        dueDate: new Date(dueDate)
      });

      // Create local bill record
      const bill = await Bill.create({
        tenantId,
        amount,
        description,
        dueDate: new Date(dueDate),
        billType,
        stripeInvoiceId: invoice.id,
        landlordId: req.user.id,
        status: 'pending'
      });

      res.status(201).json({ success: true, data: bill });
    } catch (error) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message
      });
    }
  },

  async getBills(req, res) {
    try {
      const { status, tenantId, startDate, endDate } = req.query;
      
      const query = { landlordId: req.user.id };
      
      if (status) query.status = status;
      if (tenantId) query.tenantId = tenantId;
      if (startDate && endDate) {
        query.dueDate = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }

      const bills = await Bill.find(query)
        .populate('tenantId', 'name email room')
        .sort({ dueDate: -1 });

      res.status(200).json({ success: true, data: bills });
    } catch (error) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message
      });
    }
  },

  async updateBill(req, res) {
    try {
      const { billId } = req.params;
      const updates = req.body;

      const bill = await Bill.findByIdAndUpdate(
        billId,
        updates,
        { new: true, runValidators: true }
      );

      if (!bill) {
        throw new NotFoundError('Bill not found');
      }

      res.status(200).json({ success: true, data: bill });
    } catch (error) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message
      });
    }
  },

  async deleteBill(req, res) {
    try {
      const { billId } = req.params;

      const bill = await Bill.findByIdAndDelete(billId);
      if (!bill) {
        throw new NotFoundError('Bill not found');
      }

      // Cancel Stripe invoice if exists
      if (bill.stripeInvoiceId) {
        await cancelInvoice(bill.stripeInvoiceId);
      }

      res.status(200).json({ success: true, data: {} });
    } catch (error) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message
      });
    }
  }
};