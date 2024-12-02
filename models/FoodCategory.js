import mongoose from "mongoose";

const foodCategorySchema = new mongoose.Schema(
  {
    category_name: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

export default mongoose.model("FoodCategory", foodCategorySchema);
