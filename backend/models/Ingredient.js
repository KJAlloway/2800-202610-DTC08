import { Schema, model } from "mongoose";

const ingredientSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    normalizedName: {
        type: String,
        required: true,
        unique: true
    },
    aliases: {
        type: [String],
        default: []
    },
    culturalTags: {
        type: [String],
        default: []
    },
    categoryTags: {
        type: [String],
        default: []
    },
    osmCuisineTags: {
        type: [String],
        default: []
    },
    osmShopTags: {
        type: [String],
        default: []
    },
});

const Ingredient = model("Ingredient", ingredientSchema);

export default Ingredient;