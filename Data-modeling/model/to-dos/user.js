import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
    {
        // username: String,
        // email: String,
        // isActive: Boolean,
        // this approach is correct but not industry and optimize standard

        usrname:{
            type: String,
            required: true,
            unique: true,
            lowercase: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
        },
        password: {
            type: String,
            required: [true, "password must be required"],
        }
    }, {timestamps: true}
    );

export const User = mongoose.model("User", userSchema);
// User = schema name
// userSchema = based on this schema
// User is convert to Users in mongo database