import { Schema, model } from "mongoose";

const vendorSchema = new Schema({
    osmId: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    neighbourhood: {
        type: String,
        default: ""
    }
});

const Vendor = model("Vendor", vendorSchema);

export default Vendor;