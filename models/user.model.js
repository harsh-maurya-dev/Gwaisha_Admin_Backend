import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "User Name is required"],
            trim: true,
            minlength: 2,
            maxlength: 50,
        },
        email: {
            type: String,
            required: [true, "User Email is required"],
            trim: true,
            lowercase: true,
            unique: true,
            minlength: 5,
            maxlength: 255,
            match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"], // Fixed regex
        },
        password: {
            type: String,
            required: [true, "User Password is required"],
            minlength: 6,
        },
        otp: { type: Number },
        otpExpires: { type: Date },
        isVerified: { type: Boolean, default: false }
    },
    { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
