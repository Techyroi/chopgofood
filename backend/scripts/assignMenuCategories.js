require("dotenv").config();

const MenuItem = require("../models/menuItem");
const connectDB = require("../config/db");

const categoryMap = {
  "Jollof Rice with Chicken": "Rice",
  "Fried Rice with Chicken": "Rice",
  Pizza: "Pizza",
  Burger: "Burger",
  Shawarma: "Shawarma",
  Amala: "Amala",
  "Pounded Yam": "Pounded Yam",
  "Egusi Soup": "Egusi Soup",
  "Banga Soup": "Egusi Soup",
  "Chinese Rice": "Rice",
  Samosa: "Small Chops",
  "Black Soup": "Egusi Soup",
  Kpomo: "Fried Chicken",
  Plantain: "Fried Chicken",
  "Cow Tail": "Fried Chicken",
  "Cow Leg": "Fried Chicken",
  Turkey: "Fried Chicken",
  "Mini Munch": "Small Chops",
  "Pepper Rice": "Rice",
  "Chicken Shawarma": "Shawarma",
  Sausage: "Fried Chicken",
  "Pepper Sauce": "Egusi Soup",
  "Spring Roll": "Small Chops",
  "Gizzard Cut Out": "Fried Chicken",
  "Tiger Nut": "Drinks",
  Hollandia: "Drinks",
  "Chivita Active": "Drinks",
  Zobo: "Drinks",
  "Big Fanta": "Drinks",
  Schweppes: "Drinks",
};

async function assignMenuCategories() {
  try {
    await connectDB();

    console.log("Starting menu category assignment...\n");

    let totalMatched = 0;
    let totalModified = 0;

    for (const [foodName, category] of Object.entries(categoryMap)) {
      const result = await MenuItem.updateMany(
        { name: foodName },
        {
          $set: {
            category,
          },
        }
      );

      const matched = result.matchedCount ?? result.n ?? 0;
      const modified = result.modifiedCount ?? result.nModified ?? 0;

      totalMatched += matched;
      totalModified += modified;

      console.log(
        `${foodName} → ${category} | matched: ${matched} | modified: ${modified}`
      );
    }

    console.log("\n=================================");
    console.log("MENU CATEGORY ASSIGNMENT COMPLETE");
    console.log("=================================");
    console.log(`Foods processed:     ${Object.keys(categoryMap).length}`);
    console.log(`Documents matched:   ${totalMatched}`);
    console.log(`Documents modified:  ${totalModified}`);
    console.log("=================================");

    process.exit(0);
  } catch (error) {
    console.error("\nERROR:", error.message);
    process.exit(1);
  }
}

assignMenuCategories();