require("dotenv").config();
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const { v4 } = require("uuid");
const multer = require("multer");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Set your destination folder
  },
  filename: function (req, file, cb) {
    const nftId = v4();
    const extension = file.mimetype.split("/")[1]; // Get the second part of the mimetype
    const fileName = `${nftId}.${extension}`;
    cb(null, fileName);
  },
});

const upload = multer({ storage: storage });

async function main() {
  const app = express();
  const server = http.createServer(app);
  const io = socketIo(server, {
    cors: {
      origin: "http://localhost:3000", // Adjust the origin to match your React app's URL
      methods: ["GET", "POST"],
    },
  });

  app.use(express.static("public"));
  app.use("/uploads", express.static("uploads"));

  const PORT = 3001;

  app.use(bodyParser.json()); // express now has one
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(
    cors({
      origin: "http://localhost:3000", // Adjust the origin to match your React app's URL
      methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
      credentials: true,
    })
  );

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
        status: String, //owned or listed-> for sale
        price: Number, // in KANMURU tokens
      },
    ],
  });

  const User = new mongoose.model("User", userSchema);

  //.......................................................... WebSocket logic
  io.on("connection", (socket) => {
    console.log("A user connected");
    // Example: Send initial tokens to the client
    socket.on("initialTokens", async (userId) => {
      if (userId) {
        const user = await User.findById(userId);
        if (user) {
          socket.emit("updateTokens", user.tokens);
        }
      }
    });

    // Example: Listen for changes in tokens
    socket.on("tokenUpdate", async (userId) => {
      const user = await User.findById(userId);
      if (user) {
        io.emit("updateTokens", user.tokens);
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });

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
    const { buffer, name, userId, status } = req.body;
    try {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const correctedPath = req.file.path.replace(/\\/g, "/");
      const newNft = { path: correctedPath, name, nftId, status, price: 0 };
      user.nfts.push(newNft);
      await user.save();
      res.json({
        nftId: newNft.nftId,
        path: `http://localhost:3001/${newNft.path}`,
      });
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
  });
  //...........................................................nfts
  app.get("/nfts", async (req, res) => {
    const userId = req.query.userId;

    try {
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user.nfts);
    } catch (err) {
      console.error(err);
      res.status(500).json(err);
    }
  });
  //............................................................listedNFTs
  app.get("/all-listed-nfts", async (req, res) => {
    try {
      // Fetch all users with listed NFTs from the database
      const usersWithListedNFTs = await User.find({ "nfts.status": "listed" });

      // Extract and concatenate the listed NFTs from each user
      const allListedNFTs = usersWithListedNFTs.reduce((accumulator, user) => {
        const userListedNFTs = user.nfts.filter(
          (nft) => nft.status === "listed"
        );
        return accumulator.concat(userListedNFTs);
      }, []);

      res.json({ listedNFTs: allListedNFTs });
    } catch (error) {
      console.error("Error fetching listed NFTs:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  //................................................................. ownedNFTs
  app.get("/owned", async (req, res) => {
    const userId = req.query.userId;

    try {
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Filter NFTs with status 'listed'
      const ownedNFTs = user.nfts.filter((nft) => nft.status === "owned");

      // Do something with the filtered NFTs (e.g., send them as a JSON response)
      res.json(ownedNFTs);
    } catch (err) {
      console.error(err);
      res.status(500).json(err);
    }
  });
  //.......................................................................... Get the owner by the nftId
  // Add this route to get the owner by nftId
  app.get("/owner", async (req, res) => {
    const nftId = req.query.nftId;

    try {
      const user = await User.findOne({ "nfts.nftId": nftId });

      if (!user) {
        return res.status(404).json({ error: "NFT not found" });
      }

      const nft = user.nfts.find((nft) => nft.nftId === nftId);

      if (!nft) {
        return res.status(404).json({ error: "NFT not found" });
      }

      res.json({ owner: user.email, ownerId: user._id });
    } catch (error) {
      console.error("Error fetching owner:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  //.......................................................................... Get the Price by the nftId
  app.get("/price", async (req, res) => {
    const nftId = req.query.nftId;

    try {
      const user = await User.findOne({ "nfts.nftId": nftId });

      if (!user) {
        return res.status(404).json({ error: "NFT not found" });
      }

      const nft = user.nfts.find((nft) => nft.nftId === nftId);

      if (!nft) {
        return res.status(404).json({ error: "NFT not found" });
      }

      res.json({ price: nft.price });
    } catch (error) {
      console.error("Error fetching owner:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  //................................................................ get Tokens
  app.get("/tokens", async (req, res) => {
    const userId = req.query.userId;

    try {
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user.tokens);
    } catch (err) {
      console.error(err);
      res.status(500).json(err);
    }
  });
  //................................................................ set the price of the NFT that wanted to list
  app.post("/price", async (req, res) => {
    const { nftId, price } = req.body;

    try {
      const user = await User.findOne({ "nfts.nftId": nftId });

      if (!user) {
        return res.status(404).json({ error: "NFT not found" });
      }

      const nft = user.nfts.find((nft) => nft.nftId === nftId);

      if (!nft) {
        return res.status(404).json({ error: "NFT not found" });
      }

      // Update the price of the NFT
      nft.price = price;
      nft.status = "listed";

      // Save the updated user to the database
      await user.save();

      res.json({
        success: true,
        message: "Price set successfully and the NFT is listed for sale",
      });
    } catch (error) {
      console.error("Error setting price:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  //............................................................... Transfer
  app.post("/transfer", async (req, res) => {
    const { senderUserId, receiverUserId, nftId } = req.body;

    try {
      // Fetch sender and receiver users from the database
      const senderUser = await User.findById(senderUserId);
      const receiverUser = await User.findById(receiverUserId);

      if (!senderUser || !receiverUser) {
        console.log("User not found");
        return res.status(404).json({ error: "User not found" });
      }
      //get the wanted nft from the receiverUser
      const wantedNFT = receiverUser.nfts.find((nft) => nft.nftId === nftId);

      if (!wantedNFT) {
        console.log("NFT not found");
        return res.status(404).json({ error: "NFT not found" });
      }

      // Check if the sender has enough tokens
      if (senderUser.tokens < wantedNFT.price) {
        return res.status(400).json({ error: "Insufficient funds" });
      }

      // Update token balances
      senderUser.tokens -= wantedNFT.price;
      receiverUser.tokens += wantedNFT.price;
      wantedNFT.status = "owned";
      wantedNFT.price = 0;
      receiverUser.nfts = receiverUser.nfts.filter(
        (nft) => nft.nftId !== nftId
      );
      senderUser.nfts.push(wantedNFT);

      // Save the updated users to the database
      await senderUser.save();
      await receiverUser.save();

      res.json({ success: true, message: "Tokens transferred successfully" });
    } catch (error) {
      console.error("Error transferring tokens:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
  // app.listen(PORT, () => {
  //   console.log(`Server is running on port ${PORT}`);
  // });
}
console.clear();
main().catch((err) => {
  console.log(err.message);
});
