const { Dashboard } = require("../../models/dashboard.model");
const { Lease } = require("../../models/lease.model");
const { Maintenance } = require("../../models/maintenance.model");
const { Payment } = require("../../models/payment.model");
const { catchAsync } = require("../../utils/catchAsync");

const getDashboardSummary = catchAsync(async (req, res) => {
    const tenantId = req.user.id;

    // Get lease information
    const lease = await Lease.findOne({ tenant: tenantId }).select('rent_amount due_date').lean();

    // Get pending maintenance requests
    const maintenanceRequests = await Maintenance.find({ 
        tenant: tenantId,
        status: { $in: ['pending', 'in_progress'] }
    }).limit(5).lean();

    // Get recent payments
    const recentPayments = await Payment.find({ 
        tenant: tenantId 
    })
    .sort({ date: -1 })
    .limit(3)
    .lean();

    // Get upcoming payment
    const upcomingPayment = lease ? {
        amount: lease.rent_amount,
        due_date: lease.due_date
    } : null;

    const dashboardData = {
        maintenanceRequests,
        recentPayments,
        upcomingPayment,
        notifications: [], // To be implemented based on notification system
    };

    res.status(200).json({
        status: 'success',
        data: dashboardData
    });
});

const getRecentActivities = catchAsync(async (req, res) => {
    const tenantId = req.user.id;
    
    // Get combined recent activities (payments, maintenance requests, etc.)
    const activities = await Dashboard.getRecentActivities(tenantId);

    res.status(200).json({
        status: 'success',
        data: activities
    });
});

const getPendingActions = catchAsync(async (req, res) => {
    const tenantId = req.user.id;

    // Get pending actions (unsigned documents, pending payments, etc.)
    const pendingActions = await Dashboard.getPendingActions(tenantId);

    res.status(200).json({
        status: 'success',
        data: pendingActions
    });
});

module.exports = {
    getDashboardSummary,
    getRecentActivities,
    getPendingActions
};
