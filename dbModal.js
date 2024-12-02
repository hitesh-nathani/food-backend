import mongoose from "mongoose";

const tiktokSchema = mongoose.Schema({
  channel: { type: String, default: "titok" }, // Make this field required
  song: { type: String, default: "Dil Diyan Gallan" }, // Make this field required
  likes: { type: Number, default: 0 },
  messages: { type: Number, default: 0 },
  description: { type: String, default: "This is a description" }, // Make this field required
  shares: { type: Number, default: 0 },
  url: {
    type: String,
    default: "https://cdn.pixabay.com/video/2024/08/30/228847_large.mp4",
  }, // Make this field required
});

// Collection inside the database
export default mongoose.model("tiktokVideos", tiktokSchema);

// food-backend
// user : food-backend
// pwd:hitesh-food-backend

// mongodb+srv://food-backend:hitesh-food-backend@cluster0.ahpq5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
