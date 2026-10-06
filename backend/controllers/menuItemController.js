const MenuItem = require("../models/menuItem");
const Restaurant = require("../models/Restaurant");

// GET /api/menu-items
const getMenuItems = async (req, res) => {
  try {
    const isPopularRequest = req.query.popular === "true";

    const filter = {
      isAvailable: true,
    };

    // Home page can request only popular food
    if (isPopularRequest) {
      filter.isPopular = true;
    }

    const query = MenuItem.find(filter);

    // Home only needs these fields for Popular Food
    if (isPopularRequest) {
      query.select(
        "restaurant name image price category preparationTime"
      );
    }

    const menuItems = await query
      .populate("restaurant", "name")
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    res.status(200).json({
      success: true,
      count: menuItems.length,
      data: menuItems,
    });
  } catch (error) {
    console.error("Get menu items error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch menu items",
    });
  }
};

// GET /api/menu-items/:id
const getMenuItemById = async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id)
      .populate("restaurant", "name slug");

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: "Menu item not found",
      });
    }

    res.status(200).json({
      success: true,
      data: menuItem,
    });
  } catch (error) {
    console.error("Get menu item error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch menu item",
    });
  }
};

// GET /api/restaurants/:restaurantId/menu-items
const getRestaurantMenuItems = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    const restaurant = await Restaurant.findById(restaurantId);

    if (!restaurant || !restaurant.isActive) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

      const menuItems = await MenuItem.find({
        restaurant: restaurantId,
        isAvailable: true,
      })
        .populate("restaurant", "name slug")
        .sort({ createdAt: -1 })
        .limit(50)
        .lean();

    res.status(200).json({
      success: true,
      count: menuItems.length,
      restaurant: {
        id: restaurant._id,
        name: restaurant.name,
      },
      data: menuItems,
    });
  } catch (error) {
    console.error("Get restaurant menu error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch restaurant menu",
    });
  }
};

// POST /api/menu-items
const createMenuItem = async (req, res) => {
  try {
    const {
      restaurant,
      name,
      description,
      image,
      price,
      category,
      isAvailable,
      isPopular,
      preparationTime,
    } = req.body;

    const restaurantExists = await Restaurant.findOne({
      _id: restaurant,
      isActive: true,
    });

    if (!restaurantExists) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    const menuItem = await MenuItem.create({
      restaurant,
      name,
      description,
      image,
      price,
      category,
      isAvailable,
      isPopular,
      preparationTime,
    });

    res.status(201).json({
      success: true,
      message: "Menu item created successfully",
      data: menuItem,
    });
  } catch (error) {
    console.error("Create menu item error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create menu item",
    });
  }
};

// PUT /api/menu-items/:id
const updateMenuItem = async (req, res) => {
  try {
    const menuItem = await MenuItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        returnDocument: "after",
        runValidators: true,
      }
    );

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: "Menu item not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Menu item updated successfully",
      data: menuItem,
    });
  } catch (error) {
    console.error("Update menu item error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update menu item",
    });
  }
};

// DELETE /api/menu-items/:id
const deleteMenuItem = async (req, res) => {
  try {
    const menuItem = await MenuItem.findByIdAndUpdate(
      req.params.id,
      { isAvailable: false },
      { returnDocument: "after" }
    );

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: "Menu item not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Menu item deleted successfully",
    });
  } catch (error) {
    console.error("Delete menu item error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete menu item",
    });
  }
};

module.exports = {
  getMenuItems,
  getMenuItemById,
  getRestaurantMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
};