const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
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
  date: {
    type: Date,
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['Paid', 'Pending', 'Due'],
    default: 'Due'
  },
  reference: {
    type: String,
    required: true,
    unique: true
  },
  paymentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment'
  }
}, {
  timestamps: true
});

// Generate reference number
billSchema.pre('save', async function(next) {
  if (!this.reference) {
    const date = new Date(this.date);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const count = await mongoose.model('Bill').countDocuments() + 1;
    this.reference = `INV-${year}-${month}-${String(count).padStart(3, '0')}`;
  }
  next();
});

const Bill = mongoose.model('Bill', billSchema);
module.exports = Bill; 