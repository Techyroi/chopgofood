require("dotenv").config();

const mongoose = require("mongoose");
const connectDB = require("../config/db");
const MenuItem = require("../models/menuItem");

const restaurantNames = [
  "GT Foods Plus",
  "Mat ice",
  "ChopLife Republic",
];

const popularFoodNames = [
  "Jollof Rice with Chicken",
  "Fried Rice with Chicken",
  "Pizza",
  "Burger",
  "Shawarma",
  "Amala",
  "Pounded Yam",
  "Egusi Soup",
  "Chicken Shawarma",
  "Mini Munch",
];

const markPopularMenuItems = async () => {
  try {
    await connectDB();

    console.log("Updating popular menu items...\n");

    // First, remove the popular flag from all menu items
    // belonging to the three ChopGoFood restaurants.
    const restaurants = await mongoose.connection
      .collection("restaurants")
      .find({
        name: { $in: restaurantNames },
      })
      .toArray();

    if (restaurants.length !== 3) {
      throw new Error(
        `Expected 3 restaurants, but found ${restaurants.length}.`
      );
    }

    const restaurantIds = restaurants.map(
      (restaurant) => restaurant._id
    );

    await MenuItem.updateMany(
      {
        restaurant: { $in: restaurantIds },
      },
      {
        $set: { isPopular: false },
      }
    );

    // Mark the selected 10 foods as popular at each restaurant.
    const result = await MenuItem.updateMany(
      {
        restaurant: { $in: restaurantIds },
        name: { $in: popularFoodNames },
      },
      {
        $set: { isPopular: true },
      }
    );

    console.log("POPULAR MENU UPDATE COMPLETE");
    console.log("--------------------------------");
    console.log(`Restaurants found: ${restaurants.length}`);
    console.log(`Popular foods selected: ${popularFoodNames.length}`);
    console.log(`Documents modified: ${result.modifiedCount}`);
    console.log("");
    console.log("Popular foods:");

    popularFoodNames.forEach((food, index) => {
      console.log(`${index + 1}. ${food}`);
    });

    console.log("");
    console.log(
      "Expected popular items: 30 total (10 per restaurant)"
    );
  } catch (error) {
    console.error("Failed to update popular menu items:");
    console.error(error.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

markPopularMenuItems();