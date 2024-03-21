import mongoose, { Schema } from "mongoose";
import mongooseAggregationPaginate from "mongoose-aggregate-paginate-v2"

export const videoSchema = new mongoose.Schema({
    videoFile: {
        type: String,
        required: true
    },
    thumbnail: {
        type: String,
        required: true
    },
    title : {
        title: String,
        required: true
    },
    description: {
        type : String,
        required: true
    },
    duration : {
        type: Number,
        required: true   //cloudynary
    },
    views: {
        type: Number,
        default: 0
    },
    isPublished: {
        type: Boolean,
        default: true
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
}, {timestamps: true});

videoSchema.plugin(mongooseAggregationPaginate)

export const Video = mongoose.model("Video", videoSchema);