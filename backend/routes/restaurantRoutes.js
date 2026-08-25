const express = require("express");

const {
  getRestaurants,
  getRestaurantById,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
} = require("../controllers/restaurantController");

const router = express.Router();

const {
  getRestaurantMenuItems,
} = require("../controllers/menuItemController");

router.get("/", getRestaurants);

router.get("/:restaurantId/menu-items", getRestaurantMenuItems);

router.get("/:id", getRestaurantById);

router.post("/", createRestaurant);

router.put("/:id", updateRestaurant);

router.delete("/:id", deleteRestaurant);

module.exports = router;