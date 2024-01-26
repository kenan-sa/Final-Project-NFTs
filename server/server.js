require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const { v4 } = require("uuid");
const multer = require("multer");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Set your destination folder
  },
  filename: function (req, file, cb) {
    const nftId = v4();
    const extension = file.mimetype.split('/')[1]; // Get the second part of the mimetype
    const fileName = `${nftId}.${extension}`;
    cb(null, fileName);
  }
});

const upload = multer({ storage: storage })

async function main() {
  const app = express();

  app.use(express.static("public"));
  const PORT = 3001;

  app.use(bodyParser.json()); // express now has one
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(cors());

  // Connect to MongoDB
  try {
    await mongoose.connect(process.env.DATABASE_URL);
  } catch (err) {
    console.log(err.message);
  }

  const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    tokens: { type: Number, default: 10000 },
    nfts: [
      {
        name: String,
        path: String,
        nftId: String,
      },
    ],
  });

  const User = new mongoose.model("User", userSchema);

  app.get("/", (req, res) => {
    res.send("Hello, this is your Express server!");
  });

  app.get("/collection", async (req, res) => {
    try {
      // Assuming you have the user's email in the request
      const userEmail = req.query.email;

      // Fetch the user's collection from the database
      const userCollection = await User.findOne({ email: userEmail }).select(
        "nfts"
      );

      if (userCollection) {
        res.json({ collection: userCollection.nfts });
      } else {
        res.status(404).json({ error: "User not found" });
      }
    } catch (error) {
      console.error("Error fetching collection:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  //..................................................... Signup
  app.post("/signup", async (req, res) => {
    const { email, password } = req.body;

    try {
      // Create a new user
      const newUser = new User({ email, password });

      // Save the user to the database
      await newUser.save();

      // Update the success response in the signup route
      res.json({
        success: true,
        message: "Registration successful",
        user: newUser,
        redirect: "/", // Add the redirect URL (change to your desired home page)
      });
    } catch (error) {
      console.error("Error during registration:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  });

  // ..................................................................Login
  app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
      // Find the user in your database using email
      const user = await User.findOne({ email });

      if (user) {
        console.log("Provided password:", password);
        console.log("Stored password:", user.password);
        // Compare the provided password with the stored password in the database
        if (password === user.password) {
          res.json({
            success: true,
            message: "Login successful",
            user,
            redirect: "/",
          });
        } else {
          res.status(401).json({
            success: false,
            message: "Invalid email or password",
          });
        }
      } else {
        res
          .status(401)
          .json({ success: false, message: "Invalid email or password" });
      }
    } catch (error) {
      console.error("Error during login:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  });
  //..............................................................Mint
  app.post("/mint", upload.single("buffer"), async (req, res) => {
    const nftId = v4();
    const { buffer, name, userId } = req.body;
    try {
      const user = await User.findById(userId);
      user.nfts.push({ path: req.file.path, name, nftId });
      await user.save();
      res.json(nftId);
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
  });

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}
console.clear();
main().catch((err) => {
  console.log(err.message);
});
