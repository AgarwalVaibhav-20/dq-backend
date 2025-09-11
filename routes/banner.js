const express = require("express");
const router = express.Router();
const bannerController = require("../controllers/BannerController");

router.get("/all/banner", bannerController.getBanners);
router.post("/upload/banner-images", bannerController.createBanner);
router.post("/:id", bannerController.updateBanner);
router.delete("/:id", bannerController.deleteBanner);

module.exports = router;
