const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const User = require('../model/User');
dotenv.config();

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    console.log('Auth header:', authHeader);
    console.log('Request URL:', req.url);
    console.log('Request method:', req.method);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log('No token provided');
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    console.log('Token:', token);

    jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret", async (err, decoded) => {
      if (err) {
        console.log('Token verification error:', err);
        return res.status(403).json({ message: "Invalid token" });
      }

      console.log('Decoded token:', decoded);
      const user = await User.findById(decoded.id);
      if (!user) {
        console.log('User not found with id:', decoded.id);
        return res.status(404).json({ message: 'User not found' });
      }

      console.log('User found:', user._id);
      console.log('User restaurantId:', user.restaurantId);
      console.log('User restaurantId type:', typeof user.restaurantId);
      console.log('User restaurantId toString:', user.restaurantId?.toString());
      req.user = user;
      req.userId = user.restaurantId;
      req.actualUserId = user._id;
      console.log('Final req.userId set to:', req.userId);
      console.log('⚠️ Using ONLY restaurantId, no fallback to _id');
      next();
    });
  } catch (err) {
    console.error('Auth middleware error:', err);
    res.status(500).json({ message: "Server error in authMiddleware" });
  }
};

module.exports = { authMiddleware };