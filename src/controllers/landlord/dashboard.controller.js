const Room = require("../../models/room");
const Tenant = require("../../models/tenant");
const Payment = require("../../models/payment");
const Maintenance = require("../../models/maintenance");
const Bill = require("../../models/bill");

module.exports = {
  async getDashboardStats(req, res) {
    try {
      // Get rooms statistics
      const rooms = await Room.find({ landlordId: req.user.id });
      const roomStats = {
        total: rooms.length,
        occupied: rooms.filter(room => room.status === 'occupied').length,
        vacant: rooms.filter(room => room.status === 'available').length,
        maintenance: rooms.filter(room => room.status === 'maintenance').length
      };

      // Get tenants statistics
      const tenants = await Tenant.find({ landlordId: req.user.id });
      const tenantStats = {
        total: tenants.length,
        active: tenants.filter(tenant => tenant.status === 'active').length,
        pending: tenants.filter(tenant => tenant.status === 'pending').length
      };

      // Get financial statistics
      const currentMonth = new Date();
      currentMonth.setDate(1);
      const payments = await Payment.find({
        landlordId: req.user.id,
        date: { $gte: currentMonth }
      });
      
      const bills = await Bill.find({
        landlordId: req.user.id,
        dueDate: { $gte: currentMonth }
      });

      const financialStats = {
        monthlyIncome: payments.reduce((sum, payment) => sum + payment.amount, 0),
        pendingPayments: bills.filter(bill => bill.status === 'pending').length,
        totalDue: bills.reduce((sum, bill) => sum + bill.amount, 0)
      };

      // Get maintenance statistics
      const maintenance = await Maintenance.find({ landlordId: req.user.id });
      const maintenanceStats = {
        total: maintenance.length,
        pending: maintenance.filter(m => m.status === 'pending').length,
        inProgress: maintenance.filter(m => m.status === 'in-progress').length,
        completed: maintenance.filter(m => m.status === 'completed').length
      };

      // Recent activities
      const recentActivities = await Promise.all([
        Payment.find({ landlordId: req.user.id })
          .sort({ date: -1 })
          .limit(5)
          .populate('tenantId', 'name'),
        Maintenance.find({ landlordId: req.user.id })
          .sort({ createdAt: -1 })
          .limit(5)
          .populate('roomId', 'number')
      ]);

      res.status(200).json({
        success: true,
        data: {
          roomStats,
          tenantStats,
          financialStats,
          maintenanceStats,
          recentActivities: {
            payments: recentActivities[0],
            maintenance: recentActivities[1]
          }
        }
      });
    } catch (error) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message
      });
    }
  },

  async getOccupancyTrends(req, res) {
    try {
      const { months = 6 } = req.query;
      
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - months);

      const occupancyData = await Room.aggregate([
        {
          $match: {
            landlordId: req.user.id
          }
        },
        {
          $group: {
            _id: {
              year: { $year: "$updatedAt" },
              month: { $month: "$updatedAt" }
            },
            occupiedCount: {
              $sum: { $cond: [{ $eq: ["$status", "occupied"] }, 1, 0] }
            },
            totalRooms: { $sum: 1 }
          }
        },
        {
          $sort: { "_id.year": 1, "_id.month": 1 }
        }
      ]);

      res.status(200).json({ success: true, data: occupancyData });
    } catch (error) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message
      });
    }
  },

  async getRevenueAnalytics(req, res) {
    try {
      const { startDate, endDate } = req.query;

      const revenues = await Payment.aggregate([
        {
          $match: {
            landlordId: req.user.id,
            date: {
              $gte: new Date(startDate),
              $lte: new Date(endDate)
            }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: "$date" },
              month: { $month: "$date" }
            },
            totalRevenue: { $sum: "$amount" },
            paymentCount: { $sum: 1 }
          }
        },
        {
          $sort: { "_id.year": 1, "_id.month": 1 }
        }
      ]);

      res.status(200).json({ success: true, data: revenues });
    } catch (error) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message
      });
    }
  }
};