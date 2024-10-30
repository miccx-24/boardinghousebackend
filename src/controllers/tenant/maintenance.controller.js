const { Maintenance } = require("../../models/maintenance.model");
const { validateMaintenanceRequest } = require("../../utils/validators");
const { handleError } = require("../../utils/errorHandler");

const maintenanceController = {
  // Create a new maintenance request
  createRequest: async (req, res) => {
    try {
      const { title, description, priority, category } = req.body;
      const tenantId = req.user.id; // Assuming user info is added by auth middleware

      const newRequest = new Maintenance({
        title,
        description,
        priority,
        category,
        tenant: tenantId,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      await newRequest.save();
      
      return res.status(201).json({
        success: true,
        message: 'Maintenance request created successfully',
        data: newRequest
      });
    } catch (error) {
      return handleError(res, error);
    }
  },

  // Get all maintenance requests for the tenant
  getRequests: async (req, res) => {
    try {
      const tenantId = req.user.id;
      const requests = await Maintenance.find({ tenant: tenantId })
        .sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        data: requests
      });
    } catch (error) {
      return handleError(res, error);
    }
  },

  // Get a specific maintenance request
  getRequestById: async (req, res) => {
    try {
      const { requestId } = req.params;
      const tenantId = req.user.id;

      const request = await Maintenance.findOne({
        _id: requestId,
        tenant: tenantId
      });

      if (!request) {
        return res.status(404).json({
          success: false,
          message: 'Maintenance request not found'
        });
      }

      return res.status(200).json({
        success: true,
        data: request
      });
    } catch (error) {
      return handleError(res, error);
    }
  },

  // Update a maintenance request
  updateRequest: async (req, res) => {
    try {
      const { requestId } = req.params;
      const tenantId = req.user.id;
      const updates = req.body;

      const request = await Maintenance.findOneAndUpdate(
        {
          _id: requestId,
          tenant: tenantId,
          status: 'pending' // Only allow updates if request is still pending
        },
        {
          ...updates,
          updatedAt: new Date()
        },
        { new: true }
      );

      if (!request) {
        return res.status(404).json({
          success: false,
          message: 'Maintenance request not found or cannot be updated'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Maintenance request updated successfully',
        data: request
      });
    } catch (error) {
      return handleError(res, error);
    }
  },

  // Cancel a maintenance request
  cancelRequest: async (req, res) => {
    try {
      const { requestId } = req.params;
      const tenantId = req.user.id;

      const request = await Maintenance.findOneAndUpdate(
        {
          _id: requestId,
          tenant: tenantId,
          status: 'pending' // Only allow cancellation if request is still pending
        },
        {
          status: 'cancelled',
          updatedAt: new Date()
        },
        { new: true }
      );

      if (!request) {
        return res.status(404).json({
          success: false,
          message: 'Maintenance request not found or cannot be cancelled'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Maintenance request cancelled successfully',
        data: request
      });
    } catch (error) {
      return handleError(res, error);
    }
  }
};

module.exports = maintenanceController;
