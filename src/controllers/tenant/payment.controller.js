const { Payment } = require("../../models/payment.model");
const { ApiError } = require("../../utils/ApiError");
const { catchAsync } = require("../../utils/catchAsync");
const httpStatus = require("http-status");
const Bill = require('../../models/bill');

/**
 * Create a new payment
 */
const createPayment = catchAsync(async (req, res) => {
  const { amount, paymentMethod, description } = req.body;
  const tenantId = req.user.id;

  const payment = await Payment.create({
    tenantId,
    amount,
    paymentMethod,
    description,
    status: 'pending'
  });

  res.status(httpStatus.CREATED).json({ payment });
});

/**
 * Get payment history for tenant
 */
const getPaymentHistory = catchAsync(async (req, res) => {
  const tenantId = req.user.id;
  const payments = await Payment.find({ tenantId })
    .sort({ createdAt: -1 });

  res.status(httpStatus.OK).json({ payments });
});

/**
 * Get payment details by ID
 */
const getPaymentById = catchAsync(async (req, res) => {
  const { paymentId } = req.params;
  const tenantId = req.user.id;

  const payment = await Payment.findOne({
    _id: paymentId,
    tenantId
  });

  if (!payment) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Payment not found');
  }

  res.status(httpStatus.OK).json({ payment });
});

/**
 * Cancel pending payment
 */
const cancelPayment = catchAsync(async (req, res) => {
  const { paymentId } = req.params;
  const tenantId = req.user.id;

  const payment = await Payment.findOne({
    _id: paymentId,
    tenantId,
    status: 'pending'
  });

  if (!payment) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Pending payment not found');
  }

  payment.status = 'cancelled';
  await payment.save();

  res.status(httpStatus.OK).json({ payment });
});

/**
 * Get payment summary/statistics
 */
const getPaymentStats = catchAsync(async (req, res) => {
  const tenantId = req.user.id;

  const stats = await Payment.aggregate([
    { $match: { tenantId } },
    {
      $group: {
        _id: null,
        totalPaid: { $sum: '$amount' },
        totalPayments: { $sum: 1 },
        averagePayment: { $avg: '$amount' }
      }
    }
  ]);

  res.status(httpStatus.OK).json({
    stats: stats[0] || {
      totalPaid: 0,
      totalPayments: 0,
      averagePayment: 0
    }
  });
});

const getBillingHistory = catchAsync(async (req, res) => {
  const { period, search } = req.query;
  const tenantId = req.user.id;

  let dateFilter = {};
  const now = new Date();

  switch (period) {
    case 'month':
      dateFilter = {
        date: {
          $gte: new Date(now.getFullYear(), now.getMonth(), 1),
          $lte: new Date(now.getFullYear(), now.getMonth() + 1, 0)
        }
      };
      break;
    case 'quarter':
      const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
      dateFilter = {
        date: {
          $gte: quarterStart
        }
      };
      break;
    case 'year':
      dateFilter = {
        date: {
          $gte: new Date(now.getFullYear(), 0, 1),
          $lte: new Date(now.getFullYear(), 11, 31)
        }
      };
      break;
  }

  let searchFilter = {};
  if (search) {
    searchFilter = {
      $or: [
        { description: { $regex: search, $options: 'i' } },
        { reference: { $regex: search, $options: 'i' } },
        { amount: isNaN(search) ? undefined : Number(search) }
      ]
    };
  }

  const bills = await Bill.find({
    tenantId,
    ...dateFilter,
    ...searchFilter
  }).sort({ date: -1 });

  // Get current balance
  const totalBilled = await Bill.aggregate([
    { $match: { tenantId: req.user._id } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);

  const totalPaid = await Payment.aggregate([
    { $match: { tenantId: req.user._id } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);

  const currentBalance = (totalBilled[0]?.total || 0) - (totalPaid[0]?.total || 0);

  // Get last payment
  const lastPayment = await Payment.findOne({ tenantId })
    .sort({ createdAt: -1 })
    .limit(1);

  res.json({
    bills,
    summary: {
      currentBalance,
      outstandingBalance: currentBalance > 0 ? currentBalance : 0,
      lastPayment: lastPayment?.amount || 0
    }
  });
});

const downloadStatement = catchAsync(async (req, res) => {
  const { startDate, endDate } = req.query;
  const tenantId = req.user.id;

  const bills = await Bill.find({
    tenantId,
    date: {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    }
  }).sort({ date: 1 });

  // Generate PDF statement (implementation depends on your PDF generation library)
  // For example, using PDFKit or similar

  res.download('path/to/generated/statement.pdf');
});

module.exports = {
  createPayment,
  getPaymentHistory,
  getPaymentById,
  cancelPayment,
  getPaymentStats,
  getBillingHistory,
  downloadStatement
};
