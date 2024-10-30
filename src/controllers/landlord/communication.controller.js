const Message = require("../../models/message");
const Notification = require("../../models/notification");
const Announcement = require("../../models/announcement");
const { sendEmail } = require("../../services/email");
const { sendSMS } = require("../../services/sms");
const { NotFoundError } = require("../../utils/errors");

module.exports = {
  async sendMessage(req, res) {
    try {
      const { recipientId, subject, content, messageType } = req.body;

      const message = await Message.create({
        senderId: req.user.id,
        recipientId,
        subject,
        content,
        messageType,
        status: 'sent'
      });

      // Send notification based on message type
      if (messageType === 'email') {
        await sendEmail(recipientId, subject, content);
      } else if (messageType === 'sms') {
        await sendSMS(recipientId, content);
      }

      res.status(201).json({ success: true, data: message });
    } catch (error) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message
      });
    }
  },

  async createAnnouncement(req, res) {
    try {
      const { title, content, priority, targetAudience } = req.body;

      const announcement = await Announcement.create({
        landlordId: req.user.id,
        title,
        content,
        priority,
        targetAudience
      });

      // Create notifications for all relevant tenants
      await Notification.create({
        type: 'announcement',
        title,
        content,
        recipients: targetAudience,
        senderId: req.user.id
      });

      res.status(201).json({ success: true, data: announcement });
    } catch (error) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message
      });
    }
  },

  async getMessages(req, res) {
    try {
      const { messageType, status } = req.query;
      
      const query = {
        $or: [
          { senderId: req.user.id },
          { recipientId: req.user.id }
        ]
      };

      if (messageType) query.messageType = messageType;
      if (status) query.status = status;

      const messages = await Message.find(query)
        .populate('senderId recipientId', 'name email')
        .sort({ createdAt: -1 });

      res.status(200).json({ success: true, data: messages });
    } catch (error) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message
      });
    }
  },

  async getAnnouncements(req, res) {
    try {
      const announcements = await Announcement.find({ landlordId: req.user.id })
        .sort({ createdAt: -1 });

      res.status(200).json({ success: true, data: announcements });
    } catch (error) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message
      });
    }
  },

  async updateAnnouncementStatus(req, res) {
    try {
      const { announcementId } = req.params;
      const { status } = req.body;

      const announcement = await Announcement.findByIdAndUpdate(
        announcementId,
        { status },
        { new: true }
      );

      if (!announcement) {
        throw new NotFoundError('Announcement not found');
      }

      res.status(200).json({ success: true, data: announcement });
    } catch (error) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message
      });
    }
  }
};