const { Room } = require("../../models/room.model");
const { Property } = require("../../models/property.model");
const mongoose = require("mongoose");

const roomController = {
  createRoom: async (req, res) => {
    try {
      const { propertyId, number, type, status, price, capacity, amenities, notes } = req.body;

      // Validate property exists
      const property = await Property.findById(propertyId);
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }

      // Check if room number already exists in property
      const existingRoom = await Room.findOne({ propertyId, number });
      if (existingRoom) {
        return res.status(400).json({ message: "Room number already exists in this property" });
      }

      const newRoom = new Room({
        propertyId,
        number,
        type,
        status: status || "Available",
        price,
        capacity: capacity || 1,
        amenities: amenities || [],
        notes
      });

      await newRoom.save();
      res.status(201).json({ message: "Room created successfully", room: newRoom });
    } catch (error) {
      res.status(500).json({ message: "Error creating room", error: error.message });
    }
  },

  getRoomsByProperty: async (req, res) => {
    try {
      const { propertyId } = req.params;
      const rooms = await Room.find({ propertyId }).populate('propertyId');
      
      // Transform data to match frontend format
      const transformedRooms = rooms.map(room => ({
        id: room._id,
        number: room.number,
        type: room.type,
        status: room.status,
        price: room.price,
        capacity: room.capacity,
        amenities: room.amenities,
        currentTenant: room.currentTenant,
        lastCleaned: room.lastCleaned,
        notes: room.notes
      }));

      res.status(200).json(transformedRooms);
    } catch (error) {
      res.status(500).json({ message: "Error fetching rooms", error: error.message });
    }
  },

  updateRoom: async (req, res) => {
    try {
      const { roomId } = req.params;
      const updates = req.body;

      const room = await Room.findByIdAndUpdate(
        roomId,
        { $set: updates },
        { new: true, runValidators: true }
      );

      if (!room) {
        return res.status(404).json({ message: "Room not found" });
      }

      // Transform response to match frontend format
      const transformedRoom = {
        id: room._id,
        number: room.number,
        type: room.type,
        status: room.status,
        price: room.price,
        capacity: room.capacity,
        amenities: room.amenities,
        currentTenant: room.currentTenant,
        lastCleaned: room.lastCleaned,
        notes: room.notes
      };

      res.status(200).json({ message: "Room updated successfully", room: transformedRoom });
    } catch (error) {
      res.status(500).json({ message: "Error updating room", error: error.message });
    }
  },

  getRoomStats: async (req, res) => {
    try {
      const { propertyId } = req.params;
      const rooms = await Room.find({ propertyId });

      const stats = {
        totalRooms: rooms.length,
        availableRooms: rooms.filter(r => r.status === 'Available').length,
        occupancyRate: rooms.length ? 
          Math.round((rooms.filter(r => r.status === 'Occupied').length / rooms.length) * 100) : 0,
        averageRate: rooms.length ? 
          Math.round(rooms.reduce((acc, room) => acc + room.price, 0) / rooms.length) : 0
      };

      res.status(200).json(stats);
    } catch (error) {
      res.status(500).json({ message: "Error fetching room statistics", error: error.message });
    }
  },

  getMaintenanceRooms: async (req, res) => {
    try {
      const { propertyId } = req.params;
      const maintenanceRooms = await Room.find({ 
        propertyId, 
        status: 'Maintenance' 
      });

      const transformedRooms = maintenanceRooms.map(room => ({
        id: room._id,
        number: room.number,
        notes: room.notes
      }));

      res.status(200).json(transformedRooms);
    } catch (error) {
      res.status(500).json({ message: "Error fetching maintenance rooms", error: error.message });
    }
  },

  deleteRoom: async (req, res) => {
    try {
      const { roomId } = req.params;
      const room = await Room.findByIdAndDelete(roomId);

      if (!room) {
        return res.status(404).json({ message: "Room not found" });
      }

      res.status(200).json({ message: "Room deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting room", error: error.message });
    }
  }
};

module.exports = roomController;
