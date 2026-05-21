import { Schema, model } from "mongoose";

const ingredientRequestSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    ingredientId: {
        type: Schema.Types.ObjectId,
        ref: "Ingredient",
        required: true
    },
    neighbourhood: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const IngredientRequest = model("IngredientRequest", ingredientRequestSchema);

export default IngredientRequest;