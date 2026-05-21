import { Schema, model } from "mongoose";

const receiptSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    vendorOsmId: {
        type: String,
        required: true
    },
    ingredientId: {
        type: Schema.Types.ObjectId,
        ref: "Ingredient",
        required: true
    },
    found: {
        type: Boolean,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Receipt = model("Receipt", receiptSchema);

export default Receipt;