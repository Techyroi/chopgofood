const fs = require("fs");
const path = require("path");
const cloudinary = require("cloudinary").v2;
require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const imagesFolder = path.join(__dirname, "menu-images");

const foodNames = {
  "01-jollof-rice-with-chicken.jpg": "Jollof Rice with Chicken",
  "02-fried-rice-with-chicken.jpg": "Fried Rice with Chicken",
  "03-pizza.jpg": "Pizza",
  "04-burger.jpg": "Burger",
  "05-shawarma.jpg": "Shawarma",
  "06-amala.jpg": "Amala",
  "07-pounded-yam.jpg": "Pounded Yam",
  "08-egusi-soup.jpg": "Egusi Soup",
  "09-banga-soup.jpg": "Banga Soup",
  "10-chinese-rice.jpg": "Chinese Rice",
  "11-samosa.jpg": "Samosa",
  "12-black-soup.jpg": "Black Soup",
  "13-kpomo.jpg": "Kpomo",
  "14-plantain.jpg": "Plantain",
  "15-cow-tail.jpg": "Cow Tail",
  "16-cow-leg.jpg": "Cow Leg",
  "17-turkey.jpg": "Turkey",
  "18-mini-munch.jpg": "Mini Munch",
  "19-pepper-rice.jpg": "Pepper Rice",
  "20-chicken-shawarma.jpg": "Chicken Shawarma",
  "21-sausage.jpg": "Sausage",
  "22-pepper-sauce.jpg": "Pepper Sauce",
  "23-spring-roll.jpg": "Spring Roll",
  "24-gizzard-cut-out.jpg": "Gizzard Cut Out",
  "25-tiger-nut.jpg": "Tiger Nut",
  "26-hollandia.jpg": "Hollandia",
  "27-chivita-active.jpg": "Chivita Active",
  "28-zobo.jpg": "Zobo",
  "29-big-fanta.jpg": "Big Fanta",
  "30-schweppes.jpg": "Schweppes",
};

function uploadImage(filePath, publicId) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      filePath,
      {
        folder: "chopgofood/menu",
        public_id: publicId,
        resource_type: "image",
        overwrite: true,
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );
  });
}

async function uploadAllImages() {
  try {
    if (!fs.existsSync(imagesFolder)) {
      throw new Error(
        `Images folder not found: ${imagesFolder}`
      );
    }

    const files = fs
      .readdirSync(imagesFolder)
      .filter((file) => /\.(jpg|jpeg|png|webp)$/i.test(file))
      .sort();

    if (files.length === 0) {
      throw new Error("No image files found.");
    }

    console.log(`Found ${files.length} images.`);
    console.log("Starting Cloudinary upload...\n");

    const results = [];

    for (const file of files) {
      const filePath = path.join(imagesFolder, file);

      const extension = path.extname(file);
      const filenameWithoutExtension = path.basename(
        file,
        extension
      );

      const publicId = filenameWithoutExtension;

      console.log(`Uploading: ${file}`);

      const result = await uploadImage(
        filePath,
        publicId
      );

      const foodName =
        foodNames[file] || filenameWithoutExtension;

      results.push({
        name: foodName,
        filename: file,
        publicId: result.public_id,
        url: result.secure_url,
      });

      console.log(`✓ Uploaded: ${foodName}`);
      console.log(`  ${result.secure_url}\n`);
    }

    const outputPath = path.join(
      __dirname,
      "menu-images.json"
    );

    fs.writeFileSync(
      outputPath,
      JSON.stringify(results, null, 2)
    );

    console.log("=================================");
    console.log("ALL IMAGES UPLOADED SUCCESSFULLY");
    console.log("=================================");
    console.log(`Total uploaded: ${results.length}`);
    console.log(`JSON saved to: ${outputPath}`);
  } catch (error) {
    console.error("\nUPLOAD FAILED");
    console.error(error);
    process.exit(1);
  }
}

uploadAllImages();