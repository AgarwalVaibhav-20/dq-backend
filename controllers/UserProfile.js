const UserProfile = require("../model/UserProfile");
const mongoose = require("mongoose");
/**
 * @desc    Get profile by userId
 * @route   GET /api/profile/:userId
 */
exports.getProfile = async (req, res) => {
  try {
    const user = await UserProfile.findOne({ userId: req.params.userId });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.json({ success: true, data: user });
  } catch (err) {
    console.error("Error fetching profile:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const user = await UserProfile.find();
    res.json({ success: true, data: user })
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, message: "Server error" });
  }
}
/**
 * @desc    Update profile
 * @route   PUT /api/profile/:userId
 */
exports.updateProfile = async (req, res) => {
  try {
    const updateData = { ...req.body };
    // prevent email/username overwrite unless you allow it
    delete updateData.password;
    delete updateData.email;
    delete updateData.username;

    const updatedUser = await UserProfile.findOneAndUpdate(
      { userId: req.params.userId },
      updateData,
      { new: true, runValidators: true }
    ).select("-password -verifyOTP -otpExpiry");

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, data: updatedUser });
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * @desc    Delete profile
 * @route   DELETE /api/profile/:userId
 */
exports.deleteProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ success: false, message: "userId is required" });
    }

    const deletedUser = await UserProfile.findOneAndDelete({ userId });
    if (!deletedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, message: "Profile deleted" });
  } catch (err) {
    console.error("Error deleting profile:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.checkRestaurantPermission = async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ message: "userId missing" });
    }
    const user = await UserProfile.findOne({
      userId: userId  
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    req.userProfile = user;
    next();
  } catch (error) {
    console.error("Error in checkRestaurantPermission:", error);
    res.status(500).json({ message: "Server error" });
  }
};