const Inventory = require("../../models/inventory");
const Room = require("../../models/room");
const { NotFoundError, BadRequestError } = require("../../utils/errors");

module.exports = {
  async addInventoryItem(req, res) {
    try {
      const {
        name,
        category,
        quantity,
        condition,
        roomId,
        purchaseDate,
        purchasePrice,
        description
      } = req.body;

      if (roomId) {
        const room = await Room.findById(roomId);
        if (!room) {
          throw new NotFoundError('Room not found');
        }
      }

      const item = await Inventory.create({
        name,
        category,
        quantity,
        condition,
        roomId,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : undefined,
        purchasePrice,
        description,
        landlordId: req.user.id
      });

      res.status(201).json({ success: true, data: item });
    } catch (error) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message
      });
    }
  },

  async getInventory(req, res) {
    try {
      const { category, roomId, condition } = req.query;
      
      const query = { landlordId: req.user.id };
      
      if (category) query.category = category;
      if (roomId) query.roomId = roomId;
      if (condition) query.condition = condition;

      const inventory = await Inventory.find(query)
        .populate('roomId', 'number floor')
        .sort({ name: 1 });

      res.status(200).json({ success: true, data: inventory });
    } catch (error) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message
      });
    }
  },

  async updateInventoryItem(req, res) {
    try {
      const { itemId } = req.params;
      const updates = req.body;

      const item = await Inventory.findByIdAndUpdate(
        itemId,
        {
          ...updates,
          lastUpdated: new Date()
        },
        { new: true }
      );

      if (!item) {
        throw new NotFoundError('Inventory item not found');
      }

      res.status(200).json({ success: true, data: item });
    } catch (error) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message
      });
    }
  },

  async deleteInventoryItem(req, res) {
    try {
      const { itemId } = req.params;

      const item = await Inventory.findByIdAndDelete(itemId);
      
      if (!item) {
        throw new NotFoundError('Inventory item not found');
      }

      res.status(200).json({ success: true, data: {} });
    } catch (error) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message
      });
    }
  },

  async transferInventory(req, res) {
    try {
      const { itemId } = req.params;
      const { newRoomId, quantity, notes } = req.body;

      // Verify rooms exist
      const room = await Room.findById(newRoomId);
      if (!room) {
        throw new NotFoundError('Destination room not found');
      }

      const item = await Inventory.findById(itemId);
      if (!item) {
        throw new NotFoundError('Inventory item not found');
      }

      if (quantity > item.quantity) {
        throw new BadRequestError('Transfer quantity exceeds available quantity');
      }

      // If transferring all items
      if (quantity === item.quantity) {
        item.roomId = newRoomId;
      } else {
        // Create new inventory record for transferred items
        await Inventory.create({
          name: item.name,
          category: item.category,
          quantity: quantity,
          condition: item.condition,
          roomId: newRoomId,
          description: item.description,
          landlordId: req.user.id,
          transferNotes: notes,
          transferredFrom: item.roomId,
          transferDate: new Date()
        });

        // Update original item quantity
        item.quantity -= quantity;
      }

      await item.save();

      res.status(200).json({ success: true, data: item });
    } catch (error) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message
      });
    }
  },

  async getInventoryReport(req, res) {
    try {
      const inventoryByCategory = await Inventory.aggregate([
        {
          $match: { landlordId: req.user.id }
        },
        {
          $group: {
            _id: "$category",
            totalItems: { $sum: "$quantity" },
            totalValue: {
              $sum: { $multiply: ["$quantity", "$purchasePrice"] }
            },
            itemCount: { $sum: 1 }
          }
        }
      ]);

      const inventoryByRoom = await Inventory.aggregate([
        {
          $match: { landlordId: req.user.id }
        },
        {
          $group: {
            _id: "$roomId",
            totalItems: { $sum: "$quantity" },
            itemCount: { $sum: 1 }
          }
        }
      ]);

      res.status(200).json({
        success: true,
        data: {
          byCategory: inventoryByCategory,
          byRoom: inventoryByRoom
        }
      });
    } catch (error) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message
      });
    }
  }
};