const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    propertyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property',
        required: true
    },
    number: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['Single', 'Double', 'Suite'],
        required: true
    },
    status: {
        type: String,
        enum: ['Available', 'Occupied', 'Maintenance'],
        default: 'Available'
    },
    price: {
        type: Number,
        required: true
    },
    capacity: {
        type: Number,
        required: true,
        default: 1
    },
    amenities: [{
        type: String
    }],
    currentTenant: {
        type: String
    },
    lastCleaned: {
        type: Date
    },
    notes: {
        type: String
    }
}, {
    timestamps: true
});

const Room = mongoose.model('Room', roomSchema);
module.exports = { Room };
