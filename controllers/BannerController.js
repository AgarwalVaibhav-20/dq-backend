const Banner = require("../model/Banner");
const multer = require("multer");
const path = require("path");

// ⚡ Configure multer inside controller
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/banners"); // folder where files are stored
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, "_"));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).fields([
  { name: "banner_1", maxCount: 1 },
  { name: "banner_2", maxCount: 1 },
  { name: "banner_3", maxCount: 1 },
]);

// ✅ Get all banners
exports.getBanners = async (req, res) => {
  try {
    const { restaurantId } = req.query;
    if (!restaurantId) {
      return res.status(400).json({ success: false, message: "restaurantId is required" });
    }

    const banners = await Banner.find({ restaurantId });
    res.status(200).json({ success: true, data: banners });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Create Banner (with multer handling inside controller)
exports.createBanner = (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }

    try {
      const { restaurantId } = req.body;
      if (!restaurantId) {
        return res.status(400).json({ success: false, message: "restaurantId is required" });
      }

      const bannerData = {
        restaurantId,
        banner_1: req.files?.banner_1 ? req.files.banner_1[0].path : null,
        banner_2: req.files?.banner_2 ? req.files.banner_2[0].path : null,
        banner_3: req.files?.banner_3 ? req.files.banner_3[0].path : null,
      };

      if (!bannerData.banner_1) {
        return res.status(400).json({ success: false, message: "banner_1 is required" });
      }

      const banner = new Banner(bannerData);
      await banner.save();

      res.status(201).json({ success: true, data: banner });
    } catch (error) {
        console.log(error)
        console.error(error)
      res.status(500).json({ success: false, message: error.message });
    }
  });
};

// ✅ Update Banner
exports.updateBanner = (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }

    try {
      const { id } = req.params;
      const { restaurantId } = req.body;

      let updateData = { restaurantId };

      if (req.files?.banner_1) updateData.banner_1 = req.files.banner_1[0].path;
      else if (req.body.banner_1_url) updateData.banner_1 = req.body.banner_1_url;

      if (req.files?.banner_2) updateData.banner_2 = req.files.banner_2[0].path;
      else if (req.body.banner_2_url) updateData.banner_2 = req.body.banner_2_url;

      if (req.files?.banner_3) updateData.banner_3 = req.files.banner_3[0].path;
      else if (req.body.banner_3_url) updateData.banner_3 = req.body.banner_3_url;

      const updatedBanner = await Banner.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      });

      if (!updatedBanner) {
        return res.status(404).json({ success: false, message: "Banner not found" });
      }

      res.status(200).json({ success: true, data: updatedBanner });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });
};

// ✅ Delete Banner
exports.deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedBanner = await Banner.findByIdAndDelete(id);

    if (!deletedBanner) {
      return res.status(404).json({ success: false, message: "Banner not found" });
    }

    res.status(200).json({ success: true, message: "Banner deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
