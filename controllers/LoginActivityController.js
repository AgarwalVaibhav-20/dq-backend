const LoginActivity = require('../model/LoginActivity');
const User = require('../model/User');

// @desc Create login activity
// @route POST /api/login-activity
// @access Private
const createLoginActivity = async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.userId;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Name is required' });
    }

    // Check if user already has an active session
    const existingActivity = await LoginActivity.findOne({
      userId: userId,
      status: 'active'
    });

    if (existingActivity) {
      return res.status(400).json({ 
        message: 'You already have an active session. Please logout first.' 
      });
    }

    // Create new login activity
    const loginActivity = new LoginActivity({
      name: name.trim(),
      userId: userId,
      logintime: new Date(),
      status: 'active'
    });

    await loginActivity.save();

    res.status(201).json({
      message: 'Login activity recorded successfully',
      data: loginActivity
    });

  } catch (error) {
    console.error('Error creating login activity:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc Get all login activities for current user
// @route GET /api/login-activity
// @access Private
const getLoginActivities = async (req, res) => {
  try {
    const userId = req.userId;
    const { page = 1, limit = 10, status } = req.query;

    const query = { userId };
    if (status) {
      query.status = status;
    }

    const activities = await LoginActivity.find(query)
      .sort({ logintime: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await LoginActivity.countDocuments(query);

    res.json({
      activities,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });

  } catch (error) {
    console.error('Error fetching login activities:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc Get all login activities (Admin only)
// @route GET /api/login-activity/all
// @access Private (Admin)
const getAllLoginActivities = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, userId } = req.query;

    const query = {};
    if (status) query.status = status;
    if (userId) query.userId = userId;

    const activities = await LoginActivity.find(query)
      .populate('userId', 'username email role')
      .sort({ logintime: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await LoginActivity.countDocuments(query);

    res.json({
      activities,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });

  } catch (error) {
    console.error('Error fetching all login activities:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc Update logout time
// @route PUT /api/login-activity/logout
// @access Private
const updateLogoutTime = async (req, res) => {
  try {
    const userId = req.userId;

    // Find active session for this user
    const activeActivity = await LoginActivity.findOne({
      userId: userId,
      status: 'active'
    });

    if (!activeActivity) {
      return res.status(404).json({ 
        message: 'No active session found' 
      });
    }

    // Update logout time and status
    activeActivity.logouttime = new Date();
    activeActivity.status = 'logged_out';
    await activeActivity.save();

    res.json({
      message: 'Logout time updated successfully',
      data: activeActivity
    });

  } catch (error) {
    console.error('Error updating logout time:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc Get current active session
// @route GET /api/login-activity/current
// @access Private
const getCurrentSession = async (req, res) => {
  try {
    const userId = req.userId;

    const currentSession = await LoginActivity.findOne({
      userId: userId,
      status: 'active'
    });

    res.json({
      hasActiveSession: !!currentSession,
      session: currentSession
    });

  } catch (error) {
    console.error('Error fetching current session:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createLoginActivity,
  getLoginActivities,
  getAllLoginActivities,
  updateLogoutTime,
  getCurrentSession
};
