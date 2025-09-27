const Banner = require("../model/Banner");
const multer = require('multer')
const cloudinary = require("../config/cloudinary"); // adjust path
const fs = require("fs");
const storage = multer.memoryStorage();
const streamifier = require("streamifier");


const upload = multer({ storage }).fields([
  { name: "banner_1", maxCount: 1 },
  { name: "banner_2", maxCount: 1 },
  { name: "banner_3", maxCount: 1 },
]);


const uploadToCloudinary = (fileBuffer, folder) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    streamifier.createReadStream(fileBuffer).pipe(stream);
  });


exports.createBanner = (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error("Multer error:", err);
      return res.status(400).json({ success: false, message: err.message });
    }

    try {
      const restaurantId = req.body.restaurantId || "default-restaurant";
      // Upload each banner (if present) to Cloudinary
      const banner_1 = req.files?.banner_1
        ? await uploadToCloudinary(req.files.banner_1[0].buffer, "banners")
        : null;

      const banner_2 = req.files?.banner_2
        ? await uploadToCloudinary(req.files.banner_2[0].buffer, "banners")
        : null;

      const banner_3 = req.files?.banner_3
        ? await uploadToCloudinary(req.files.banner_3[0].buffer, "banners")
        : null;

      if (!banner_1) {
        return res
          .status(400)
          .json({ success: false, message: "banner_1 is required" });
      }

      const banner = new Banner({
        restaurantId,
        banner_1,
        banner_2,
        banner_3,
      });

      await banner.save();
      res.status(201).json({ success: true, data: banner });
    } catch (error) {
      console.error("Create banner error:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  });
};
exports.getBanners = async (req, res) => {
  try {
    const { restaurantId } = req.query;

    let banners;
    if (restaurantId) {
      banners = await Banner.find({ restaurantId });
    } else {
      banners = await Banner.find({});
    }

    // No need to modify URLs since Cloudinary already provides them
    res.status(200).json({ success: true, data: banners });
  } catch (error) {
    console.error("Get banners error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Update Banner (No Auth)
exports.updateBanner = (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error("Multer error:", err);
      return res.status(400).json({ success: false, message: err.message });
    }

    try {
      const { id } = req.params;
      // Find existing banner
      const existingBanner = await Banner.findById(id);
      if (!existingBanner) {
        return res.status(404).json({ success: false, message: "Banner not found" });
      }

      let updateData = {};

      // Handle restaurantId
      if (req.body.restaurantId) {
        if (!mongoose.Types.ObjectId.isValid(req.body.restaurantId)) {
          return res.status(400).json({
            success: false,
            message: "Invalid restaurantId format. Must be a valid MongoDB ObjectId."
          });
        }
        updateData.restaurantId = req.body.restaurantId;
      } else {
        updateData.restaurantId = existingBanner.restaurantId;
      }

      // Handle banner_1
      if (req.files?.banner_1) {
        updateData.banner_1 = req.files.banner_1[0].path;
      } else if (req.body.banner_1_url && req.body.banner_1_url !== 'undefined') {
        updateData.banner_1 = req.body.banner_1_url;
      } else {
        updateData.banner_1 = existingBanner.banner_1; // Keep existing
      }

      // Handle banner_2
      if (req.files?.banner_2) {
        updateData.banner_2 = req.files.banner_2[0].path;
      } else if (req.body.banner_2_url && req.body.banner_2_url !== 'undefined') {
        updateData.banner_2 = req.body.banner_2_url;
      } else {
        updateData.banner_2 = existingBanner.banner_2; // Keep existing
      }

      // Handle banner_3
      if (req.files?.banner_3) {
        updateData.banner_3 = req.files.banner_3[0].path;
      } else if (req.body.banner_3_url && req.body.banner_3_url !== 'undefined') {
        updateData.banner_3 = req.body.banner_3_url;
      } else {
        updateData.banner_3 = existingBanner.banner_3; // Keep existing
      }


      const updatedBanner = await Banner.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      });

      // Convert file paths to URLs
      const bannerWithUrls = {
        ...updatedBanner.toObject(),
        banner_1: getImageUrl(updatedBanner.banner_1),
        banner_2: getImageUrl(updatedBanner.banner_2),
        banner_3: getImageUrl(updatedBanner.banner_3),
      };


      res.status(200).json({ success: true, data: bannerWithUrls });
    } catch (error) {
      console.error("Update banner error:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  });
};

// ✅ Delete Banner (No Auth)
exports.deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;


    // Find banner first
    const banner = await Banner.findById(id);
    if (!banner) {
      return res.status(404).json({ success: false, message: "Banner not found" });
    }

    // Delete the banner
    await Banner.findByIdAndDelete(id);

    // Optionally delete the image files from filesystem
    const imagePaths = [banner.banner_1, banner.banner_2, banner.banner_3].filter(Boolean);
    imagePaths.forEach(imagePath => {
      if (imagePath && fs.existsSync(imagePath)) {
        try {
          fs.unlinkSync(imagePath);

        } catch (fileErr) {
          console.error('Error deleting file:', imagePath, fileErr);
        }
      }
    });


    res.status(200).json({ success: true, message: "Banner deleted successfully" });
  } catch (error) {
    console.error("Delete banner error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};