const express = require("express");
const mongoose = require('mongoose')
const cors = require("cors");
const dotenv = require("dotenv");
const DBConnect = require("./DB/DBconnect.js");
const authRouter = require("./routes/auth.js");
const transactionRoutes = require("./routes/transactionRoute.js");
const userProfileRoutes = require("./routes/userProfileRoute.js");
const category = require('./routes/category.js');
const customer = require('./routes/CustomerRoute.js')
const supplier = require('./routes/supplierRoute.js')
const inventory = require('./routes/inventoryRoute.js')
const reservation = require('./routes/reservationRoute.js')
const menu = require('./routes/menu.js')
const subcategory = require('./routes/subcategory.js')
const qr = require('./routes/QrRoutes.js')
const floor = require('./routes/floorRoute.js')
const due = require('./routes/due.js')
const devlieryTiming = require('./routes/deliverymanagement.js')
const banner = require('./routes/banner.js')
const order = require('./routes/orderRoute.js')
const path = require("path");
const report = require('./routes/reportRoute.js')
const dashboard = require('./routes/dashboardRoute.js')
const coupen = require('./routes/CoupenRoute.js')
const uploadRoute =require("./routes/uploadRoute.js");
const restaurant = require('./routes/restaurant.js')
const loginActivity = require('./routes/loginActivity.js')
const settingsRoute = require('./routes/settingsRoute.js')
const taxRoute = require('./routes/taxRoute.js')
const memberRoute = require('./routes/memberRoutes.js')
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
const allowedOrigins = [
  'https://dq-rms.vercel.app',
  'http://localhost:3000' // Add your local frontend URL for development
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true, // If you need to send cookies or authorization headers
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// DB connection
// DBConnect("mongodb+srv://nileshgoyal624_db_user:nilesh774@cluster0.t0sg444.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0/dqdashboard");
DBConnect(process.env.MONGO_URL)
mongoose.connection.on("connected", () => {
  console.log("✅ Mongoose connected to MongoDB Atlas");
});

mongoose.connection.on("error", (err) => {
  console.error("❌ Mongoose connection error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.log("⚠️ Mongoose disconnected");
});
// Default route
app.get("/", (req, res) => {
  res.send("Hello World");
});

// Routes
app.use("/", authRouter);
app.use(category)
app.use(customer)
app.use(supplier)
app.use(subcategory)
app.use("/reservations", reservation)
app.use(inventory)
app.use(memberRoute)
app.use(menu);
app.use(qr)
app.use(due)
app.use(floor)
app.use(devlieryTiming)
app.use(transactionRoutes);
app.use(userProfileRoutes);
app.use(order)
app.use(banner)
app.use(report)
app.use(restaurant)
app.use(dashboard)
app.use("/api/coupon", coupen)
app.use("/api/login-activity", loginActivity)
app.use("/api/settings", settingsRoute)
app.use("/api/tax", taxRoute)
app.use(uploadRoute);
// 1. COMMENT this (for prod)
app.listen(PORT, () => {
  console.log(`🚀 Server started at http://localhost:${PORT}`);
});

// UNcomment this (for prod)
// module.exports = app;