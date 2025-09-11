// controllers/subCategoryController.js
const Category = require('../model/Category')
const SubCategory = require("../model/SubCategory");

// ---------------- CREATE SUBCATEGORY ----------------
exports.createSubCategory = async (req, res) => {
  try {
    const { sub_category_name, categoryName, categoryId, restaurantId } = req.body;

    if (!sub_category_name || !categoryId || !restaurantId) {
      return res.status(400).json({ message: "sub_category_name, categoryId, and restaurantId are required" });
    }

    // Check duplicate
    const existing = await SubCategory.findOne({
      sub_category_name: sub_category_name.trim(),
      categoryId,
      restaurantId,
    });

    if (existing) {
      return res.status(400).json({ message: "SubCategory already exists under this category" });
    }
    const category = await Category.findById(categoryId);
    const subCategory = new SubCategory({
      sub_category_name: sub_category_name.trim(),
      categoryName:category.categoryName,
      categoryId,
      restaurantId,
    });

    await subCategory.save();

    // ⚠️ Important: return consistent payload for Redux
    res.status(201).json({
      id: subCategory._id, // match frontend .id usage
      sub_category_name: subCategory.sub_category_name,
      categoryName: subCategory.categoryName,
      categoryId: subCategory.categoryId,
      restaurantId: subCategory.restaurantId,
    });
  } catch (error) {
    console.error("Error creating subcategory:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ---------------- FETCH SUBCATEGORIES ----------------
exports.getSubCategories = async (req, res) => {
  try {
    const { restaurantId, categoryId } = req.query;

    const filter = {};
    if (restaurantId) filter.restaurantId = restaurantId;
    if (categoryId) filter.categoryId = categoryId;

    const subCategories = await SubCategory.find(filter);

    res.status(200).json(
      subCategories.map((sub) => ({
        id: sub._id,
        sub_category_name: sub.sub_category_name,
        categoryName: sub.categoryName,
        categoryId: sub.categoryId,
        restaurantId: sub.restaurantId,
      }))
    );
  } catch (error) {
    console.error("Error fetching subcategories:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ---------------- UPDATE SUBCATEGORY ----------------
exports.updateSubCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { sub_category_name, categoryId } = req.body;

    const subCategory = await SubCategory.findById(id);
    if (!subCategory) {
      return res.status(404).json({ message: "SubCategory not found" });
    }

    if (sub_category_name) subCategory.sub_category_name = sub_category_name.trim();
    if (categoryId) subCategory.categoryId = categoryId;

    await subCategory.save();

    res.status(200).json({
      id: subCategory._id,
      sub_category_name: subCategory.sub_category_name,
      categoryName: subCategory.categoryName,
      categoryId: subCategory.categoryId,
      restaurantId: subCategory.restaurantId,
    });
  } catch (error) {
    console.error("Error updating subcategory:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ---------------- DELETE SUBCATEGORY ----------------
exports.deleteSubCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const subCategory = await SubCategory.findByIdAndDelete(id);
    if (!subCategory) {
      return res.status(404).json({ message: "SubCategory not found" });
    }

    res.status(200).json({ id });
  } catch (error) {
    console.error("Error deleting subcategory:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
