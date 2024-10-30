const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const ApiError = require('../utils/ApiError');

const verifyToken = (req, res, next) => {
    let token = req.headers["x-access-token"] || req.headers["authorization"];

    if (!token) {
        return res.status(403).send({ message: "No token provided!" });
    }

    if (token.startsWith("Bearer ")) {
        token = token.slice(7, token.length);
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).send({ message: "Unauthorized!" });
        }
        req.userId = decoded.id;
        next();
    });
};

const isTenant = (req, res, next) => {
  if (req.user && req.user.role === 'tenant') {
    next();
  } else {
    throw new ApiError(403, 'Access denied. Tenant access required.');
  }
};

module.exports = {
  verifyToken,
  isTenant
};
