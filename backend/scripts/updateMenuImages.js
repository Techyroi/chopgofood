const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config();

const MenuItem = require("../models/menuItem");
const connectDB = require("../config/db");

const jsonPath = path.join(__dirname, "menu-images.json");

async function updateMenuImages() {
  try {
    // Check that the Cloudinary mapping file exists
    if (!fs.existsSync(jsonPath)) {
      throw new Error(
        `menu-images.json not found at: ${jsonPath}`
      );
    }

    // Read Cloudinary image mapping
    const imageData = JSON.parse(
      fs.readFileSync(jsonPath, "utf-8")
    );

    if (!Array.isArray(imageData) || imageData.length === 0) {
      throw new Error("menu-images.json is empty or invalid.");
    }

    console.log(`Found ${imageData.length} Cloudinary images.\n`);

    // Connect to MongoDB
    await connectDB();

    let matched = 0;
    let updated = 0;
    let notFound = 0;

    console.log("Starting MongoDB image update...\n");

    for (const image of imageData) {
      const menuItem = await MenuItem.findOne({
        name: image.name,
      });

      if (!menuItem) {
        console.log(`NOT FOUND: ${image.name}`);
        notFound++;
        continue;
      }

      matched++;

      const result = await MenuItem.updateOne(
        { _id: menuItem._id },
        {
          $set: {
            image: image.url,
          },
        }
      );

      if (result.modifiedCount > 0) {
        console.log(`✓ Updated: ${image.name}`);
        updated++;
      } else {
        console.log(`- Already current: ${image.name}`);
      }
    }

    console.log("\n=================================");
    console.log("MENU IMAGE UPDATE COMPLETE");
    console.log("=================================");
    console.log(`Cloudinary images: ${imageData.length}`);
    console.log(`MongoDB matches:   ${matched}`);
    console.log(`Images updated:    ${updated}`);
    console.log(`Not found:         ${notFound}`);
    console.log("=================================\n");

    await mongoose.connection.close();

    process.exit(0);
  } catch (error) {
    console.error("\nUPDATE FAILED");
    console.error(error);

    try {
      await mongoose.connection.close();
    } catch {}

    process.exit(1);
  }
}

updateMenuImages();