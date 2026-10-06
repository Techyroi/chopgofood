const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = require("../config/db");
const MenuItem = require("../models/menuItem");
const Restaurant = require("../models/Restaurant");

const imageJsonPath = path.join(
  __dirname,
  "menu-images.json"
);

const menuPrices = {
  "Jollof Rice with Chicken": 4000,
  "Fried Rice with Chicken": 4000,
  "Pizza": 7000,
  "Burger": 2500,
  "Shawarma": 3000,
  "Amala": 500,
  "Pounded Yam": 800,
  "Egusi Soup": 500,
  "Banga Soup": 1200,
  "Chinese Rice": 5000,
  "Samosa": 2000,
  "Black Soup": 1000,
  "Kpomo": 500,
  "Plantain": 200,
  "Cow Tail": 2000,
  "Cow Leg": 1500,
  "Turkey": 5000,
  "Mini Munch": 5500,
  "Pepper Rice": 4000,
  "Chicken Shawarma": 4500,
  "Sausage": 500,
  "Pepper Sauce": 2000,
  "Spring Roll": 500,
  "Gizzard Cut Out": 300,
  "Tiger Nut": 1200,
  "Hollandia": 2500,
  "Chivita Active": 2500,
  "Zobo": 1000,
  "Big Fanta": 800,
  "Schweppes": 800,
};

const restaurantAliases = {
  "gt food plus": "gt foods plus",
  "gt foods plus": "gt foods plus",
  "mat ice": "mat ice",
  "choplife republic": "choplife republic",
};

function normalizeName(name) {
  return name
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

async function seedMenus() {
  try {
    // -----------------------------------
    // CHECK IMAGE MAPPING
    // -----------------------------------

    if (!fs.existsSync(imageJsonPath)) {
      throw new Error(
        `menu-images.json not found at: ${imageJsonPath}`
      );
    }

    const imageData = JSON.parse(
      fs.readFileSync(imageJsonPath, "utf-8")
    );

    if (!Array.isArray(imageData) || imageData.length !== 30) {
      throw new Error(
        `Expected 30 Cloudinary images but found ${
          imageData.length
        }.`
      );
    }

    // -----------------------------------
    // CONNECT TO MONGODB
    // -----------------------------------

    await connectDB();

    console.log("\nMongoDB connected.");
    console.log("Starting restaurant menu setup...\n");

    // -----------------------------------
    // GET RESTAURANTS
    // -----------------------------------

    const restaurants = await Restaurant.find({});

    if (restaurants.length === 0) {
      throw new Error("No restaurants found in MongoDB.");
    }

    const restaurantMap = {};

    for (const restaurant of restaurants) {
      const normalized = normalizeName(restaurant.name);

      const canonicalName =
        restaurantAliases[normalized];

      if (canonicalName) {
        restaurantMap[canonicalName] = restaurant;
      }
    }

    const requiredRestaurants = [
      "gt foods plus",
      "mat ice",
      "choplife republic",
    ];

    for (const restaurantName of requiredRestaurants) {
      if (!restaurantMap[restaurantName]) {
        throw new Error(
          `Restaurant not found: ${restaurantName}`
        );
      }
    }

    console.log("Restaurants found:");

    for (const restaurantName of requiredRestaurants) {
      console.log(
        `✓ ${restaurantMap[restaurantName].name}`
      );
    }

    console.log("");

    // -----------------------------------
    // CREATE IMAGE MAP
    // -----------------------------------

    const imageMap = {};

    for (const image of imageData) {
      imageMap[normalizeName(image.name)] = image;
    }

    // -----------------------------------
    // PROCESS MENUS
    // -----------------------------------

    let created = 0;
    let updated = 0;

    for (const restaurantName of requiredRestaurants) {
      const restaurant = restaurantMap[restaurantName];

      console.log(
        `\n========== ${restaurant.name} ==========`
      );

      for (const [foodName, price] of Object.entries(
        menuPrices
      )) {
        const image = imageMap[normalizeName(foodName)];

        if (!image) {
          console.log(
            `⚠ Image not found: ${foodName}`
          );
          continue;
        }

        // Check how many matching menu items already exist
        const existingCount =
          await MenuItem.countDocuments({
            restaurant: restaurant._id,
            name: foodName,
          });

        if (existingCount > 1) {
          console.log(
            `⚠ DUPLICATE FOUND: ${restaurant.name} → ${foodName}`
          );

          console.log(
            `   Found ${existingCount} documents. Skipping this item.`
          );

          continue;
        }

        // -----------------------------------
        // EXISTING ITEM
        // -----------------------------------

        if (existingCount === 1) {
          await MenuItem.findOneAndUpdate(
            {
              restaurant: restaurant._id,
              name: foodName,
            },
            {
              $set: {
                price,
                image: image.url,
              },
            },
            {
              runValidators: true,
            }
          );

          console.log(
            `✓ Updated: ${foodName} → ₦${price.toLocaleString()}`
          );

          updated++;
          continue;
        }

        // -----------------------------------
        // NEW ITEM
        // -----------------------------------

        await MenuItem.findOneAndUpdate(
          {
            restaurant: restaurant._id,
            name: foodName,
          },
          {
            $set: {
              price,
              image: image.url,
            },
            $setOnInsert: {
              restaurant: restaurant._id,
              name: foodName,
              description: "",
              category: "",
              isAvailable: true,
              isPopular: false,
              preparationTime: 20,
            },
          },
          {
            upsert: true,
            runValidators: true,
          }
        );

        console.log(
          `+ Created: ${foodName} → ₦${price.toLocaleString()}`
        );

        created++;
      }
    }

    // -----------------------------------
    // SUMMARY
    // -----------------------------------

    console.log("\n=================================");
    console.log("RESTAURANT MENU SETUP COMPLETE");
    console.log("=================================");
    console.log(
      `Restaurants processed: ${requiredRestaurants.length}`
    );
    console.log(`Menu items created:    ${created}`);
    console.log(`Menu items updated:    ${updated}`);
    console.log(
      `Total expected items:  ${
        requiredRestaurants.length * Object.keys(menuPrices).length
      }`
    );
    console.log("=================================\n");

    await mongoose.connection.close();

    process.exit(0);
  } catch (error) {
    console.error("\nMENU SETUP FAILED");
    console.error(error);

    try {
      await mongoose.connection.close();
    } catch {}

    process.exit(1);
  }
}

seedMenus();