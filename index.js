const express = require("express");
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
const due = require('./routes/due.js')
const devlieryTiming = require('./routes/deliverymanagement.js')
const banner = require('./routes/banner.js')
const order = require('./routes/orderRoute.js')
const path = require("path");
const report = require('./routes/reportRoute.js')
const coupen = require('./routes/CoupenRoute.js')
// require('./cron/reportCron');  
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// DB connection
// DBConnect("mongodb+srv://nileshgoyal624_db_user:nilesh774@cluster0.t0sg444.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0/dqdashboard");
DBConnect(process.env.MONGO_URL)
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
app.use(reservation)
app.use(inventory)
app.use(menu);
app.use(qr)
app.use(due)
app.use(devlieryTiming)
app.use(transactionRoutes);
app.use(userProfileRoutes);
app.use(order)
app.use(banner)
app.use(report)
app.use(coupen)
app.listen(PORT, () => {
  console.log(`🚀 Server started at http://localhost:${PORT}`);
});
