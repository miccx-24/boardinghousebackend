const { Profile } = require("../../models/profile.model");
const { catchAsync } = require("../../utils/catchAsync");
const { ApiError } = require("../../utils/ApiError");
const httpStatus = require("http-status");

/**
 * Profile controller for tenant operations
 */
const profileController = {
  /**
   * Get tenant's profile
   */
  getProfile: catchAsync(async (req, res) => {
    const profile = await Profile.findOne({ userId: req.user.id });
    if (!profile) {
      throw new ApiError(httpStatus.NOT_FOUND, "Profile not found");
    }
    res.status(httpStatus.OK).json(profile);
  }),

  /**
   * Update tenant's profile
   */
  updateProfile: catchAsync(async (req, res) => {
    const allowedUpdates = [
      "firstName",
      "lastName",
      "phoneNumber",
      "emergencyContact",
      "profilePicture",
    ];
    
    const updates = Object.keys(req.body)
      .filter(key => allowedUpdates.includes(key))
      .reduce((obj, key) => {
        obj[key] = req.body[key];
        return obj;
      }, {});

    const profile = await Profile.findOneAndUpdate(
      { userId: req.user.id },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!profile) {
      throw new ApiError(httpStatus.NOT_FOUND, "Profile not found");
    }

    res.status(httpStatus.OK).json(profile);
  }),

  /**
   * Upload profile picture
   */
  uploadProfilePicture: catchAsync(async (req, res) => {
    if (!req.file) {
      throw new ApiError(httpStatus.BAD_REQUEST, "No file uploaded");
    }

    const profile = await Profile.findOneAndUpdate(
      { userId: req.user.id },
      { $set: { profilePicture: req.file.path } },
      { new: true }
    );

    if (!profile) {
      throw new ApiError(httpStatus.NOT_FOUND, "Profile not found");
    }

    res.status(httpStatus.OK).json({
      message: "Profile picture uploaded successfully",
      profilePicture: profile.profilePicture
    });
  }),

  /**
   * Delete profile picture
   */
  deleteProfilePicture: catchAsync(async (req, res) => {
    const profile = await Profile.findOneAndUpdate(
      { userId: req.user.id },
      { $unset: { profilePicture: 1 } },
      { new: true }
    );

    if (!profile) {
      throw new ApiError(httpStatus.NOT_FOUND, "Profile not found");
    }

    res.status(httpStatus.OK).json({
      message: "Profile picture deleted successfully"
    });
  })
};

module.exports = profileController;
