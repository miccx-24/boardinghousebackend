const Maintenance = require("../../models/maintenance");
const Room = require("../../models/room");
const { NotFoundError } = require("../../utils/errors");
const { sendEmail } = require("../../services/email");
const { sendSMS } = require("../../services/sms");

module.exports = {
  async createMaintenanceRequest(req, res) {
    try {
      const {
        roomId,
        description,
        priority,
        category,
        estimatedCost,
        scheduledDate,
        assignedTo
      } = req.body;

      // Verify room exists
      const room = await Room.findById(roomId);
      if (!room) {
        throw new NotFoundError('Room not found');
      }

      const maintenance = await Maintenance.create({
        roomId,
        description,
        priority: priority || 'medium',
        category,
        estimatedCost,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : undefined,
        assignedTo,
        status: 'pending',
        landlordId: req.user.id
      });

      // Notify assigned maintenance staff if specified
      if (assignedTo) {
        await sendEmail(
          assignedTo.email,
          'New Maintenance Task Assigned',
          `You have been assigned a new maintenance task for Room ${room.number}`
        );
      }

      res.status(201).json({ success: true, data: maintenance });
    } catch (error) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message
      });
    }
  },

  async getMaintenanceRequests(req, res) {
    try {
      const { status, priority, roomId, startDate, endDate } = req.query;
      
      const query = { landlordId: req.user.id };
      
      if (status) query.status = status;
      if (priority) query.priority = priority;
      if (roomId) query.roomId = roomId;
      if (startDate && endDate) {
        query.createdAt = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }

      const maintenanceRequests = await Maintenance.find(query)
        .populate('roomId', 'number floor')
        .populate('assignedTo', 'name email phone')
        .sort({ priority: -1, createdAt: -1 });

      res.status(200).json({ success: true, data: maintenanceRequests });
    } catch (error) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message
      });
    }
  },

  async updateMaintenanceStatus(req, res) {
    try {
      const { requestId } = req.params;
      const {
        status,
        notes,
        completionDate,
        actualCost,
        nextMaintenanceDate
      } = req.body;

      const maintenance = await Maintenance.findByIdAndUpdate(
        requestId,
        {
          status,
          notes,
          completionDate: completionDate ? new Date(completionDate) : undefined,
          actualCost,
          nextMaintenanceDate: nextMaintenanceDate ? new Date(nextMaintenanceDate) : undefined,
          lastUpdatedBy: req.user.id
        },
        { new: true }
      ).populate('roomId', 'number floor');

      if (!maintenance) {
        throw new NotFoundError('Maintenance request not found');
      }

      // Update room status if maintenance is completed
      if (status === 'completed' && maintenance.roomId) {
        await Room.findByIdAndUpdate(maintenance.roomId, { status: 'available' });
      }

      res.status(200).json({ success: true, data: maintenance });
    } catch (error) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message
      });
    }
  },

  async deleteMaintenanceRequest(req, res) {
    try {
      const { requestId } = req.params;

      const maintenance = await Maintenance.findByIdAndDelete(requestId);
      
      if (!maintenance) {
        throw new NotFoundError('Maintenance request not found');
      }

      res.status(200).json({ success: true, data: {} });
    } catch (error) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message
      });
    }
  },

  async assignMaintenance(req, res) {
    try {
      const { requestId } = req.params;
      const { assignedTo, scheduledDate, notes } = req.body;

      const maintenance = await Maintenance.findByIdAndUpdate(
        requestId,
        {
          assignedTo,
          scheduledDate: new Date(scheduledDate),
          notes,
          status: 'assigned',
          lastUpdatedBy: req.user.id
        },
        { new: true }
      );

      if (!maintenance) {
        throw new NotFoundError('Maintenance request not found');
      }

      // Notify assigned personnel
      await sendEmail(
        assignedTo.email,
        'Maintenance Task Assignment',
        `You have been assigned to maintenance task #${maintenance._id}`
      );

      res.status(200).json({ success: true, data: maintenance });
    } catch (error) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message
      });
    }
  },

  async getMaintenanceHistory(req, res) {
    try {
      const { roomId } = req.params;

      const history = await Maintenance.find({
        roomId,
        landlordId: req.user.id
      })
      .sort({ createdAt: -1 })
      .populate('assignedTo', 'name');

      res.status(200).json({ success: true, data: history });
    } catch (error) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message
      });
    }
  }
};