// routes/dashboard.js or your main routes file

const express = require('express');
const router = express.Router();
const {
  getOverallReport,
  getDashboardChartData,
  getWeeklyChartData,
  getPaymentTypeReport
} = require('../controllers/reportController'); // Adjust path as needed

// Authentication middleware (adjust as needed for your app)
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Access token is required' 
    });
  }
  
  // Add your token verification logic here
  // For example, if using JWT:
  // jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
  //   if (err) return res.status(403).json({ success: false, message: 'Invalid token' });
  //   req.user = user;
  //   next();
  // });
  
  // For now, just pass through (remove this in production)
  next();
};

// Routes that match your frontend calls
router.get('/reports/:restaurantId', authenticateToken, getOverallReport);
router.get('/dashboard/chart-data', authenticateToken, getDashboardChartData);
router.get('/dashboard/weekly-chart-data', authenticateToken, getWeeklyChartData);
router.post('/getReportPaymentType', authenticateToken, getPaymentTypeReport);

module.exports = router;