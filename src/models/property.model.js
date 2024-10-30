const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  landlord: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  address: {
    street: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    zipCode: {
      type: String,
      required: true
    }
  },
  units: [{
    unitNumber: String,
    bedrooms: Number,
    bathrooms: Number,
    squareFeet: Number,
    isOccupied: {
      type: Boolean,
      default: false
    },
    currentTenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  amenities: [String],
  propertyType: {
    type: String,
    enum: ['apartment', 'house', 'condo', 'townhouse'],
    required: true
  }
}, {
  timestamps: true
});

const Property = mongoose.model('Property', propertySchema);
module.exports = { Property }; 