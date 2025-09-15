// // backend/middleware/adminMiddleware.js
// const jwt = require('jsonwebtoken');
// const User = require('../models/User'); // Import your User model
// // const { JWT_SECRET } = require('../utils/constants'); // Your secret key

// const adminMiddleware = async (req, res, next) => {
//   try {
//     const authHeader = req.headers.authorization;

//     // 1. Check for token
//     if (!authHeader || !authHeader.startsWith("Bearer ")) {
//       return res.status(401).json({ message: "No token provided" });
//     }

//     const token = authHeader.split(" ")[1];

//     // 2. Verify token
//     let decoded;
//     try {
//       decoded = jwt.verify(token, process.env.SECRET_ACCESS_KEY); // 👈 use same secret as login
//     } catch (err) {
//       return res.status(401).json({ message: "Invalid or expired token" });
//     }

//     // 3. Check decoded payload
//     if (!decoded || !decoded.id) {
//       return res.status(401).json({ message: "Invalid token payload" });
//     }

//     // 4. Find user in DB
//     const user = await User.findById(decoded.id);
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // 5. Check role
//     if (user.role !== "admin") {
//       return res.status(403).json({ message: "Admin access required" });
//     }

//     // 6. Attach user to request
//     req.user = user;
//     req.userId = user._id;
//     req.role = user.role;

//     next();
//   } catch (error) {
//     console.error("❌ Admin middleware error:", error.message);
//     res.status(500).json({ message: "Server error in admin middleware" });
//   }
// };


// module.exports = {adminMiddleware};
