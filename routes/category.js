const express = require('express');
const router = express.Router();
const Category = require('../model/Category');
const User = require('../model/User');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authMiddleware } = require('../middleware/authMiddleware');
const cloudinary = require("../config/cloudinary");
const upload = multer({ dest: "uploads/" }); // temp storage

// ---------- CREATE CATEGORY ----------
router.post(
  "/category",
  authMiddleware,
  upload.single("categoryImage"),
  async (req, res) => {
    try {
      const restaurantId = req.user.restaurantId;
      const { categoryName, basePrice, description, size } = req.body;

      console.log("Request Body:", req.body);
      console.log("Uploaded File:", req.file);

      if (!categoryName || !req.file) {
        return res
          .status(400)
          .json({ message: "categoryName and categoryImage are required" });
      }

      // Upload to Cloudinary inside "category" folder
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "category",
        public_id: `${Date.now()}-${path
          .basename(req.file.originalname, path.extname(req.file.originalname))}`,
      });

      // Delete local temp file
      fs.unlinkSync(req.file.path);

      const newCategory = new Category({
        categoryName,
        categoryImage: result.secure_url, // Cloudinary image URL
        restaurantId,
        basePrice,
        description,
        size,
      });

      await newCategory.save();

      console.log("New Category Saved:", newCategory);
      res.status(201).json(newCategory);
    } catch (err) {
      console.error("Error creating category:", err);
      res.status(500).json({ message: err.message || "Server error" });
    }
  }
);

// ---------- Multer setup ----------
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     const dir = './uploads/categories';
//     if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
//     cb(null, dir);
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + path.extname(file.originalname));
//   },
// });

// const upload = multer({ storage });

// // ---------- CREATE CATEGORY ----------
// router.post(
//   '/category',
//   authMiddleware,
//   upload.single('categoryImage'),
//   async (req, res) => {
//     try {
//       const restaurantId = req.user.restaurantId;
//       const { categoryName, basePrice, description, size } = req.body;

//       console.log("Request Body:", req.body);
//       console.log("Uploaded File:", req.file);

//       if (!categoryName || !req.file) {
//         return res.status(400).json({ message: 'categoryName and categoryImage are required' });
//       }

//       const categoryImage = `/uploads/categories/${req.file.filename}`;

//       const newCategory = new Category({
//         categoryName,
//         categoryImage,
//         restaurantId,
//         basePrice,
//         description,
//         size,
//       });

//       await newCategory.save();

//       console.log("New Category Saved:", newCategory);
//       res.status(201).json(newCategory);
//     } catch (err) {
//       console.error("Error creating category:", err);
//       res.status(500).json({ message: err.message || 'Server error' });
//     }
//   }
// );

router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.find({ isDeleted: false });
    res.json({ data: categories });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});
// ---------- GET CATEGORY BY ID ----------
router.get('/category/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });

    res.json({ data: category });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ---------- UPDATE CATEGORY ----------
router.post(
  "/category/update/:id",
  upload.single("categoryImage"),
  async (req, res) => {
    try {
      const { categoryName, restaurantId } = req.body;
      const updateData = {};

      if (categoryName) updateData.categoryName = categoryName;
      if (restaurantId) updateData.restaurantId = restaurantId;

      // If new image uploaded
      if (req.file) {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: "category",
          public_id: `${Date.now()}-${path.basename(
            req.file.originalname,
            path.extname(req.file.originalname)
          )}`,
        });

        fs.unlinkSync(req.file.path); // remove temp file

        updateData.categoryImage = result.secure_url;
      }

      const updatedCategory = await Category.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true }
      );

      if (!updatedCategory) {
        return res.status(404).json({ message: "Category not found" });
      }

      res.json(updatedCategory);
    } catch (err) {
      console.error("Error updating category:", err);
      res.status(500).json({ message: err.message || "Server error" });
    }
  }
);


// ---------- DELETE CATEGORY ----------
router.delete('/delete/category/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Remove image if you want on delete
    if (category.categoryImage && fs.existsSync(category.categoryImage)) {
      fs.unlinkSync(category.categoryImage);
    }

    category.isDeleted = true;
    await category.save();

    res.json({ message: 'Category marked as deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
})

module.exports = router;
