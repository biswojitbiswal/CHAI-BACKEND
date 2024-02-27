import mongoose from "mongoose";

const orderItemSchema = mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
    },
    quantity: {
        type : Number,
        required: true
    }
})

const orderSchema = new mongoose.Schema({
    orderprice: {
        type: Number,
        required: true
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    OrderItems: {
        type: [orderItemSchema]
    },
    address: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ["PENDING", "CANCELLED", "SUCCESSFULL"],
        default: "PENDING",
    }
    // we can make a separate Schema for address but for now we will do it like
}, {timestamps: true});

export const Order = mongoose.model("Order", orderSchema);