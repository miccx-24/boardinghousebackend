const { User } = require('../../models/user.model');
const { Room } = require('../../models/room.model');

const tenantController = {
    // Get all tenants for a landlord's properties
    getTenants: async (req, res) => {
        try {
            console.log('Getting tenants for landlord:', req.user._id);
            
            const rooms = await Room.find({ 
                propertyId: { $in: req.user.properties },
                status: 'Occupied'
            }).populate('currentTenant');
            
            console.log('Found rooms:', rooms);

            const tenants = rooms.map(room => ({
                id: room.currentTenant?._id,
                name: room.currentTenant ? 
                    `${room.currentTenant.firstName} ${room.currentTenant.lastName}` : 'N/A',
                roomNumber: room.number,
                email: room.currentTenant?.email,
                moveInDate: room.lastUpdated,
                status: 'Active'
            })).filter(tenant => tenant.id); // Only include rooms with tenants

            res.status(200).json(tenants);
        } catch (error) {
            console.error('Error in getTenants:', error);
            res.status(500).json({ message: "Error fetching tenants", error: error.message });
        }
    },

    // Add tenant to room
    assignTenant: async (req, res) => {
        try {
            const { roomId, tenantEmail } = req.body;
            console.log('Assigning tenant:', { roomId, tenantEmail });

            // Validate input
            if (!roomId || !tenantEmail) {
                return res.status(400).json({ 
                    message: "Room ID and tenant email are required" 
                });
            }

            // Find tenant by email
            const tenant = await User.findOne({ email: tenantEmail, role: 'tenant' });
            console.log('Found tenant:', tenant);

            if (!tenant) {
                return res.status(404).json({ 
                    message: "Tenant not found. Please make sure the email is correct and the user is registered as a tenant" 
                });
            }

            // Check if room exists and is available
            const room = await Room.findById(roomId);
            if (!room) {
                return res.status(404).json({ message: "Room not found" });
            }

            if (room.status === 'Occupied') {
                return res.status(400).json({ 
                    message: "Room is already occupied" 
                });
            }

            // Update room with tenant
            const updatedRoom = await Room.findByIdAndUpdate(
                roomId,
                { 
                    currentTenant: tenant._id,
                    status: 'Occupied',
                    lastUpdated: new Date()
                },
                { new: true }
            ).populate('currentTenant');

            res.status(200).json({ 
                message: "Tenant assigned successfully",
                room: {
                    id: updatedRoom._id,
                    number: updatedRoom.number,
                    tenant: {
                        id: tenant._id,
                        name: `${tenant.firstName} ${tenant.lastName}`,
                        email: tenant.email
                    },
                    status: updatedRoom.status
                }
            });
        } catch (error) {
            console.error('Error in assignTenant:', error);
            res.status(500).json({ message: "Error assigning tenant", error: error.message });
        }
    },

    // Remove tenant from room
    removeTenant: async (req, res) => {
        try {
            const { roomId } = req.params;
            console.log('Removing tenant from room:', roomId);

            const room = await Room.findById(roomId);
            if (!room) {
                return res.status(404).json({ message: "Room not found" });
            }

            if (room.status !== 'Occupied') {
                return res.status(400).json({ 
                    message: "Room is not currently occupied" 
                });
            }

            const updatedRoom = await Room.findByIdAndUpdate(
                roomId,
                { 
                    currentTenant: null,
                    status: 'Available',
                    lastUpdated: new Date()
                },
                { new: true }
            );

            res.status(200).json({ 
                message: "Tenant removed successfully",
                room: {
                    id: updatedRoom._id,
                    number: updatedRoom.number,
                    status: updatedRoom.status
                }
            });
        } catch (error) {
            console.error('Error in removeTenant:', error);
            res.status(500).json({ message: "Error removing tenant", error: error.message });
        }
    }
};

module.exports = tenantController;
