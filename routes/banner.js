const express = require("express");
const router = express.Router();
const bannerController = require("../controllers/BannerController");
const { authMiddleware } = require('../middleware/authMiddleware');

// Routes with authentication
router.get("/all/banner", authMiddleware, bannerController.getBanners);
router.post("/create/banner-images", authMiddleware, bannerController.createBanner);
router.put("/admin/banners/update/:id", authMiddleware, bannerController.updateBanner);
router.delete("/admin/banners/:id", authMiddleware, bannerController.deleteBanner);

module.exports = router;