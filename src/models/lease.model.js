const mongoose = require('mongoose');

const leaseSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  monthlyRent: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'terminated'],
    default: 'active'
  },
  documents: [{
    type: String // URLs to lease documents
  }],
  terms: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

const Lease = mongoose.model('Lease', leaseSchema);
module.exports = Lease;
