import express from "express";
import mongoose from "mongoose";
import data from "./data.js";
import Videos from "./dbModal.js";
import User from "./models/User.js";
import bcrypt from "bcrypt";

// app config
const app = express();
const port = 9000;

// middlewares
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

// DB config
const connectionUrl =
  "mongodb+srv://food-backend:hitesh-food-backend@cluster0.ahpq5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

mongoose
  .connect(connectionUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
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
    const { name, email, password } = req.body;
    const newUser = new User({ name, email, password });
    await newUser.save();
    res
      .status(201)
      .json({ message: "User created successfully", user: newUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/users", async (req, res) => {
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

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Compare provided password with the hashed password
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Login successful
    res
      .status(200)
      .json({
        message: "Login successful",
        user: { email: user.email, name: user.name },
      });
  } catch (err) {
    console.error("Error during login:", err.message);
    res.status(500).json({ error: err.message });
  }
});

mongoose.set("bufferTimeoutMS", 20000); // Set timeout to 20 seconds

// api endpoints
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
