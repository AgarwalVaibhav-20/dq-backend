const express = require("express");
const { authMiddleware } = require("../middleware/authMiddleware")
const {
  createCoupon,
  getCoupons,
  getCouponById,
  applyCoupon,
  updateCoupon,
  deleteCoupon,
} = require("../controllers/CoupenController");

const router = express.Router();

// ⚡ Order matters: fixed routes before dynamic
router.post("/create/coupen", authMiddleware, createCoupon);
router.get("/all/coupons", authMiddleware, getCoupons);
router.get("/:id", authMiddleware, getCouponById);
router.post("/apply", authMiddleware, applyCoupon);
router.put("/coupon/update/:id", authMiddleware, updateCoupon);
router.delete("/coupon/delete/:id", authMiddleware, deleteCoupon);

module.exports = router;
