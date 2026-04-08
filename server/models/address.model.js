import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
    address_line: {
        type: String,
        required: true,
        trim: true,
    },
    landmark: {
        type: String,
        trim: true,
        default: "",
    },
    city: {
        type: String,
        required: true,
        trim: true,
    },
    state: {
        type: String,
        required: true,
        trim: true,
    },
    pincode: {
        type: String,
        required: true,
        match: /^[1-9][0-9]{5}$/, // Regex for 6-digit Indian pincode
    },
    country: {
        type: String,
        default: "India",
        trim: true,
    },
    mobile: {
        type: String,
        required: true,
        match: /^[6-9]\d{9}$/, // Regex for 10-digit Indian mobile numbers
    },
    type: {
        type: String,
        enum: ["home", "work", "other"],
        default: "home",
    },
    is_default: {
        type: Boolean,
        default: false,
    },
    status: {
        type: Boolean,
        default: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true,
    }
}, {
    timestamps: true,
});

const AddressModel = mongoose.model("address", addressSchema);

export default AddressModel;
