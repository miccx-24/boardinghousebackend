const Guest = require("../../models/guest");
const Tenant = require("../../models/tenant");
const { NotFoundError, BadRequestError } = require("../../utils/errors");
const { sendEmail } = require("../../services/email");

module.exports = {
  async registerGuest(req, res) {
    try {
      const {
        tenantId,
        name,
        identification,
        contactNumber,
        purpose,
        expectedDuration,
        startDate
      } = req.body;

      // Verify tenant exists
      const tenant = await Tenant.findById(tenantId);
      if (!tenant) {
        throw new NotFoundError('Tenant not found');
      }

      const guest = await Guest.create({
        tenantId,
        name,
        identification,
        contactNumber,
        purpose,
        expectedDuration,
        startDate: new Date(startDate),
        status: 'pending',
        landlordId: req.user.id
      });

      // Notify tenant about guest registration
      await sendEmail(tenant.email, 
        'Guest Registration Confirmation',
        `A guest (${name}) has been registered under your name.`
      );

      res.status(201).json({ success: true, data: guest });
    } catch (error) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message
      });
    }
  },

  async approveGuest(req, res) {
    try {
      const { guestId } = req.params;
      const { approvalNotes } = req.body;

      const guest = await Guest.findByIdAndUpdate(
        guestId,
        {
          status: 'approved',
          approvalDate: new Date(),
          approvalNotes,
          approvedBy: req.user.id
        },
        { new: true }
      );

      if (!guest) {
        throw new NotFoundError('Guest not found');
      }

      // Notify tenant about guest approval
      const tenant = await Tenant.findById(guest.tenantId);
      await sendEmail(tenant.email,
        'Guest Approval Notification',
        `Your guest (${guest.name}) has been approved.`
      );

      res.status(200).json({ success: true, data: guest });
    } catch (error) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message
      });
    }
  },

  async getGuests(req, res) {
    try {
      const { status, tenantId, startDate, endDate } = req.query;
      
      const query = { landlordId: req.user.id };
      
      if (status) query.status = status;
      if (tenantId) query.tenantId = tenantId;
      if (startDate && endDate) {
        query.startDate = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }
      
      const guests = await Guest.find(query)
        .populate('tenantId', 'name room')
        .sort({ startDate: -1 });
      
      res.status(200).json({ success: true, data: guests });
    } catch (error) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message
      });
    }
  },

  async updateGuestStatus(req, res) {
    try {
      const { guestId } = req.params;
      const { status, notes } = req.body;
      
      const guest = await Guest.findByIdAndUpdate(
        guestId,
        {
          status,
          notes,
          updatedBy: req.user.id,
          updatedAt: new Date()
        },
        { new: true }
      ).populate('tenantId', 'name email');
      
      if (!guest) {
        throw new NotFoundError('Guest not found');
      }
      
      // Notify tenant about status change
      await sendEmail(guest.tenantId.email,
        `Guest Registration ${status.charAt(0).toUpperCase() + status.slice(1)}`,
        `Your guest (${guest.name}) registration has been ${status}.${notes ? ` Notes: ${notes}` : ''}`
      );
      
      res.status(200).json({ success: true, data: guest });
    } catch (error) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message
      });
    }
  },

  async checkoutGuest(req, res) {
    try {
      const { guestId } = req.params;
      const { checkoutNotes } = req.body;
      
      const guest = await Guest.findByIdAndUpdate(
        guestId,
        {
          status: 'checked-out',
          checkoutDate: new Date(),
          checkoutNotes,
          checkedOutBy: req.user.id
        },
        { new: true }
      );
      
      if (!guest) {
        throw new NotFoundError('Guest not found');
      }
      
      res.status(200).json({ success: true, data: guest });
    } catch (error) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message
      });
    }
  },

  async getGuestHistory(req, res) {
    try {
      const { tenantId } = req.params;
      
      const guestHistory = await Guest.find({
        tenantId,
        landlordId: req.user.id
      }).sort({ startDate: -1 });
      
      res.status(200).json({ success: true, data: guestHistory });
    } catch (error) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message
      });
    }
  }
};