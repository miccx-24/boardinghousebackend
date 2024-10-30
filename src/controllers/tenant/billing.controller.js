const { billingService } = require("../../services/billing.service");
const { ApiError } = require("../../utils/ApiError");
const { catchAsync } = require("../../utils/catchAsync");

const getBillingHistory = catchAsync(async (req, res) => {
  const { tenantId } = req.user;
  const { startDate, endDate, status } = req.query;
  
  const billingHistory = await billingService.getBillingHistory(tenantId, {
    startDate,
    endDate,
    status
  });
  
  res.status(200).json({
    status: 'success',
    data: billingHistory
  });
});

const getCurrentBill = catchAsync(async (req, res) => {
  const { tenantId } = req.user;
  
  const currentBill = await billingService.getCurrentBill(tenantId);
  
  res.status(200).json({
    status: 'success',
    data: currentBill
  });
});

const getInvoiceDetails = catchAsync(async (req, res) => {
  const { invoiceId } = req.params;
  const { tenantId } = req.user;
  
  const invoice = await billingService.getInvoiceDetails(invoiceId, tenantId);
  
  if (!invoice) {
    throw new ApiError(404, 'Invoice not found');
  }
  
  res.status(200).json({
    status: 'success',
    data: invoice
  });
});

const downloadInvoice = catchAsync(async (req, res) => {
  const { invoiceId } = req.params;
  const { tenantId } = req.user;
  
  const invoiceFile = await billingService.generateInvoicePDF(invoiceId, tenantId);
  
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="invoice-${invoiceId}.pdf"`);
  
  res.status(200).send(invoiceFile);
});

const getPaymentMethods = catchAsync(async (req, res) => {
  const { tenantId } = req.user;
  
  const paymentMethods = await billingService.getPaymentMethods(tenantId);
  
  res.status(200).json({
    status: 'success',
    data: paymentMethods
  });
});

const addPaymentMethod = catchAsync(async (req, res) => {
  const { tenantId } = req.user;
  const paymentDetails = req.body;
  
  const newPaymentMethod = await billingService.addPaymentMethod(tenantId, paymentDetails);
  
  res.status(201).json({
    status: 'success',
    data: newPaymentMethod
  });
});

const makePayment = catchAsync(async (req, res) => {
  const { tenantId } = req.user;
  const { invoiceId, paymentMethodId, amount } = req.body;
  
  const payment = await billingService.processPayment({
    tenantId,
    invoiceId,
    paymentMethodId,
    amount
  });
  
  res.status(200).json({
    status: 'success',
    data: payment
  });
});

module.exports = {
  getBillingHistory,
  getCurrentBill,
  getInvoiceDetails,
  downloadInvoice,
  getPaymentMethods,
  addPaymentMethod,
  makePayment
};

