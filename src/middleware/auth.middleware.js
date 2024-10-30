const jwt = require('jsonwebtoken');
const { User } = require('../models/user.model');

const authenticateLandlord = async (req, res, next) => {
    try {
        // Get token from header
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ message: 'No authentication token, access denied' });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Find user
        const user = await User.findById(decoded.userId);
        
        if (!user || user.role !== 'landlord') {
            return res.status(403).json({ message: 'Not authorized as landlord' });
        }

        // Add user to request
        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token is invalid', error: error.message });
    }
};

module.exports = {
    authenticateLandlord
}; 