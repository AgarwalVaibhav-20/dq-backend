const express = require("express");
const router = express.Router();
const bannerController = require("../controllers/BannerController");

// Temporary routes without authentication for testing
router.get("/all/banner", bannerController.getBanners);
router.post("/create/banner-images", bannerController.createBanner);
router.put("/admin/banners/update/:id", bannerController.updateBanner);
router.delete("/admin/banners/:id", bannerController.deleteBanner);

module.exports = router;