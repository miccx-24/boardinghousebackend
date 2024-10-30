const { Lease } = require("../../models/lease.model");
const { ApiError } = require("../../utils/ApiError");
const httpStatus = require("http-status");

/**
 * Controller for tenant lease operations
 */
const leaseController = {
  /**
   * Get tenant's current lease
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getCurrentLease: async (req, res) => {
    try {
      const tenantId = req.user.id;
      const lease = await Lease.findOne({
        tenant: tenantId,
        status: 'active'
      }).populate('property room');

      if (!lease) {
        throw new ApiError(httpStatus.NOT_FOUND, 'No active lease found');
      }

      res.status(httpStatus.OK).json({
        success: true,
        data: lease
      });
    } catch (error) {
      throw new ApiError(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR, error.message);
    }
  },

  /**
   * Get tenant's lease history
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getLeaseHistory: async (req, res) => {
    try {
      const tenantId = req.user.id;
      const leases = await Lease.find({
        tenant: tenantId
      })
        .sort({ createdAt: -1 })
        .populate('property room');

      res.status(httpStatus.OK).json({
        success: true,
        data: leases
      });
    } catch (error) {
      throw new ApiError(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR, error.message);
    }
  },

  /**
   * Accept a lease agreement
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  acceptLease: async (req, res) => {
    try {
      const { leaseId } = req.params;
      const tenantId = req.user.id;

      const lease = await Lease.findOne({
        _id: leaseId,
        tenant: tenantId,
        status: 'pending'
      });

      if (!lease) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Lease not found or not in pending status');
      }

      lease.status = 'active';
      lease.acceptedAt = new Date();
      await lease.save();

      res.status(httpStatus.OK).json({
        success: true,
        message: 'Lease accepted successfully',
        data: lease
      });
    } catch (error) {
      throw new ApiError(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR, error.message);
    }
  },

  /**
   * Request lease termination
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  requestTermination: async (req, res) => {
    try {
      const { leaseId } = req.params;
      const { reason } = req.body;
      const tenantId = req.user.id;

      const lease = await Lease.findOne({
        _id: leaseId,
        tenant: tenantId,
        status: 'active'
      });

      if (!lease) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Active lease not found');
      }

      lease.terminationRequest = {
        status: 'pending',
        reason,
        requestedAt: new Date()
      };

      await lease.save();

      res.status(httpStatus.OK).json({
        success: true,
        message: 'Termination request submitted successfully',
        data: lease
      });
    } catch (error) {
      throw new ApiError(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR, error.message);
    }
  }
};

module.exports = leaseController;
