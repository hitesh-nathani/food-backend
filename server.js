import express from "express";
import mongoose from "mongoose";
import data from "./data.js";
import Videos from "./dbModal.js";
import User from "./models/User.js";
import bcrypt from "bcrypt";
import FoodCategory from "./models/FoodCategory.js";
import FoodItem from "./models/FoodItem.js";
import cors from "cors";
import jwt from "jsonwebtoken";

// app config
const app = express();
const port = 9000;

// middlewares
app.use(cors());
app.use(express.json()); // Parse incoming JSON payloads

// app.use((req, res, next) => {
//   res.setHeader("Access-Control-Allow-Origin", "*");
//   res.setHeader("Access-Control-Allow-Headers", "*");

//   next();
// });

// app.use(express.text());

app.use((req, res, next) => {
  console.log("Headers:", req.headers);
  console.log("Body:", req.body);
  next();
});

// Hardcoded secret key (for development only)
const JWT_SECRET = "uJr8$nD7Fg!xKvP3Lm@9#zGhQqT*Rt5Vy^bC2J";

// DB config
const connectionUrl =
  "mongodb+srv://food-backend:hitesh-food-backend@cluster0.ahpq5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

mongoose
  .connect(connectionUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000, // 5 seconds timeout
  })
  .then(
    () => {
      console.log("Database connection successful");
    },
    (err) => {
      console.log("Error in DB connection", err);
    }
  );

app.post("/add-user", async (req, res) => {
  try {
    const { name, email, password, address } = req.body;

    // Save plain-text password (NOT RECOMMENDED)
    const newUser = new User({ name, email, password, address });
    await newUser.save();

    res
      .status(201)
      .json({ message: "User created successfully", user: newUser });
  } catch (err) {
    console.error("Error creating user:", err.message);
    res.status(500).json({ error: err.message });
  }
});

const authenticateToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1]; // Extract token from "Bearer <token>"

  if (!token) {
    return res.status(401).json({ error: "Access token missing or invalid" });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Invalid or expired token" });
    }

    req.user = user; // Attach the decoded token payload to the request
    next();
  });
};

app.get("/users", authenticateToken, async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if the user exists in the database
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.password !== password) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate a JWT token
    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, {
      expiresIn: "1h", // Token expires in 1 hour
    });

    // Respond with the token
    res.status(200).json({
      message: "Login successful",
      token, // Send token to the client
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/food-category", async (req, res) => {
  try {
    const { category_name } = req.body;

    if (!category_name) {
      return res.status(400).json({ error: "Category name is required" });
    }

    const newCategory = new FoodCategory({ category_name });
    await newCategory.save();

    res.status(201).json({
      message: "Food category created successfully",
      category: newCategory,
    });
  } catch (err) {
    console.error("Error creating food category:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get("/food-category", async (req, res) => {
  try {
    const categories = await FoodCategory.find({});
    res.status(200).json(categories);
  } catch (err) {
    console.error("Error retrieving food categories:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.post("/food-item", async (req, res) => {
  try {
    const { categoryName, name, img, options, description } = req.body;

    if (!categoryName || !name) {
      return res.status(400).json({ error: "Category and name are required" });
    }

    const newFoodItem = new FoodItem({
      categoryName,
      name,
      img,
      options,
      description,
    });
    await newFoodItem.save();

    res.status(201).json({
      message: "Food item created successfully",
      foodItem: newFoodItem,
    });
    console.log("🚀 ~ app.post ~ newFoodItem:", newFoodItem);
  } catch (err) {
    console.error("Error creating food item:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get("/food-item", async (req, res) => {
  try {
    const foodItems = await FoodItem.find({});
    res.status(200).json(foodItems);
  } catch (err) {
    console.error("Error retrieving food items:", err.message);
    res.status(500).json({ error: err.message });
  }
});

mongoose.set("bufferTimeoutMS", 20000);

app.get("/", (req, res) => res.status(200).send("Hello World!"));

app.get("/v1/posts", (req, res) => res.status(200).send(data));

// Post request to add data to the database
app.post("/v2/posts", async (req, res) => {
  try {
    console.log("Incoming data:", req.body); // Log the incoming request body
    const dbVideos = req.body;

    // Validate the incoming data
    const video = new Videos(dbVideos);
    await video.save();

    res.status(201).send(video);
  } catch (err) {
    console.error("Error saving video:", err.message);
    res.status(500).send(err.message);
  }
});

app.get("/v2/posts", async (req, res) => {
  try {
    const videos = await Videos.find({});
    res.status(200).send(videos);
  } catch (err) {
    console.error("Error: ", err); // Log the error for debugging
    res.status(500).send(err.message);
  }
});

// app listen
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
