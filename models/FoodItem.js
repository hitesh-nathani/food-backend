import mongoose from "mongoose";

const foodItemSchema = new mongoose.Schema(
  {
    categoryName: { type: String, required: true }, // Reference category by name
    name: { type: String, required: true },
    img: { type: String },
    options: [
      {
        half: { type: String, required: false },
        full: { type: String, required: false },
      },
    ],
    description: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("FoodItem", foodItemSchema);
