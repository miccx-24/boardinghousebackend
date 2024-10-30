const Conversation = require('../../models/communication.model');
const ApiError = require('../../utils/ApiError');
const catchAsync = require('../../utils/catchAsync');
const httpStatus = require('http-status');

/**
 * Get conversation history
 */
const getConversation = catchAsync(async (req, res) => {
  const tenantId = req.user.id;
  const { propertyId } = req.params;

  const conversation = await Conversation.findOne({
    tenantId,
    propertyId,
    status: 'active'
  })
  .populate('messages.sender', 'name')
  .populate('landlordId', 'name email')
  .sort({ 'messages.createdAt': -1 });

  if (!conversation) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Conversation not found');
  }

  // Mark all unread messages as read
  if (conversation.messages.length > 0) {
    await Conversation.updateMany(
      {
        _id: conversation._id,
        'messages.sender': { $ne: tenantId },
        'messages.read': false
      },
      { $set: { 'messages.$.read': true } }
    );
  }

  res.json(conversation);
});

/**
 * Send a new message
 */
const sendMessage = catchAsync(async (req, res) => {
  const tenantId = req.user.id;
  const { propertyId } = req.params;
  const { content } = req.body;

  let conversation = await Conversation.findOne({
    tenantId,
    propertyId,
    status: 'active'
  });

  if (!conversation) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Conversation not found');
  }

  const newMessage = {
    sender: tenantId,
    content,
    read: false
  };

  conversation.messages.push(newMessage);
  conversation.lastMessage = new Date();
  await conversation.save();

  // Populate sender information for the response
  const populatedConversation = await Conversation.findById(conversation._id)
    .populate('messages.sender', 'name')
    .populate('landlordId', 'name email');

  res.status(httpStatus.CREATED).json({
    message: populatedConversation.messages[populatedConversation.messages.length - 1]
  });
});

/**
 * Get unread message count
 */
const getUnreadCount = catchAsync(async (req, res) => {
  const tenantId = req.user.id;

  const unreadCount = await Conversation.aggregate([
    { $match: { tenantId, status: 'active' } },
    { $unwind: '$messages' },
    {
      $match: {
        'messages.sender': { $ne: tenantId },
        'messages.read': false
      }
    },
    { $count: 'total' }
  ]);

  res.json({ unreadCount: unreadCount[0]?.total || 0 });
});

/**
 * Archive conversation
 */
const archiveConversation = catchAsync(async (req, res) => {
  const tenantId = req.user.id;
  const { propertyId } = req.params;

  const conversation = await Conversation.findOneAndUpdate(
    {
      tenantId,
      propertyId,
      status: 'active'
    },
    { status: 'archived' },
    { new: true }
  );

  if (!conversation) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Conversation not found');
  }

  res.json({ message: 'Conversation archived successfully' });
});

module.exports = {
  getConversation,
  sendMessage,
  getUnreadCount,
  archiveConversation
};
