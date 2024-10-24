const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    email: { 
        type: String, 
        required: true, 
        unique: true,
        trim: true,
        lowercase: true
    },
    password: { 
        type: String, 
        required: true 
    },
    role: { 
        type: String, 
        enum: ['landlord', 'tenant'], 
        required: true 
    },
    firstName: { 
        type: String, 
        required: true,
        trim: true
    },
    lastName: { 
        type: String, 
        required: true,
        trim: true
    },
    phone: String,
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model('User', userSchema);
