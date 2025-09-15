const Coupon = require("../model/Coupen");

// ➤ Create a new coupon
exports.createCoupon = async (req, res) => {
  try {
    const coupon = new Coupon({
      ...req.body,
      createdBy: req.user?._id,
    });
    await coupon.save();

    res.status(201).json({
      success: true,
      message: "Coupon created successfully",
      coupon,
    });
  } catch (error) {
    console.error("Error creating coupon:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create coupon",
      error: error.message,
    });
  }
};

// ➤ Get all coupons (with pagination + filter)
exports.getCoupons = async (req, res) => {
  try {
    const { restaurantId, isActive, page = 1, limit = 10 } = req.query;

    const filter = {};
    if (restaurantId) filter.restaurantId = restaurantId;
    if (isActive !== undefined) filter.isActive = isActive === "true";

    const coupons = await Coupon.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Coupon.countDocuments(filter);

    res.json({
      success: true,
      coupons,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching coupons:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch coupons",
      error: error.message,
    });
  }
};

// ➤ Get single coupon by ID
exports.getCouponById = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }
    res.json({ success: true, coupon });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch coupon",
      error: error.message,
    });
  }
};

// ➤ Apply coupon
exports.applyCoupon = async (req, res) => {
  try {
    const { couponId, orderTotal } = req.body;

    const coupon = await Coupon.findById(couponId);
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    // validate
    const validity = coupon.isValid();
    if (!validity.valid) {
      return res.status(400).json({
        success: false,
        message: validity.message,
      });
    }

    // calculate
    const discount = coupon.calculateDiscount(orderTotal);
    if (!discount.applicable) {
      return res.status(400).json({
        success: false,
        message: discount.message,
      });
    }

    // increment usage
    coupon.usageCount += 1;
    await coupon.save();

    res.json({
      success: true,
      message: "Coupon applied successfully",
      discount,
    });
  } catch (error) {
    console.error("Error applying coupon:", error);
    res.status(500).json({
      success: false,
      message: "Failed to apply coupon",
      error: error.message,
    });
  }
};

// ➤ Update coupon
exports.updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    res.json({
      success: true,
      message: "Coupon updated successfully",
      coupon,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update coupon",
      error: error.message,
    });
  }
};

// ➤ Delete coupon
exports.deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    res.json({
      success: true,
      message: "Coupon deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete coupon",
      error: error.message,
    });
  }
};
