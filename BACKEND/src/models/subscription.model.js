import mongoose, { Schema } from "mongoose";

export const subscriptionSchema = new mongoose.Schema({
    subscripber: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    channel: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
}, {timestamps: true})

export const Subscription = mongoose.model("Subscription", subscriptionSchema)