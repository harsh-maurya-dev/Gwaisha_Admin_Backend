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
            match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
        },
        password: {
            type: String,
            required: [true, "User Password is required"],
            minlength: 6,
        },
        profile_image: {
            type: String,
            default: "", // URL of the profile image
        },
        age: {
            type: Number,
            required: [true, "User Age is required"],
            min: 13, // Assuming a minimum age limit
            max: 100,
        },
        gender: {
            type: String,
            enum: ["Male", "Female", "Other"]
        },
        mobile_number: {
            type: String,
            required: [true, "Mobile number is required"],
            unique: true,
            match: [/^\d{10}$/, "Please enter a valid 10-digit mobile number"], // Validates 10-digit phone numbers
        },
        status: {
            type: Boolean,
            default: true, // Active status
        },
        total_orders: {
            type: Number,
            default: 0,
            min: 0,
        },
        address: {
            type:String,
            default:true
        },
        otp: { type: Number },
        otpExpires: { type: Date },
        isVerified: { type: Boolean, default: false },
        user_type:{
            type:String,
            enum: ["Admin", "User"]
        }
    },
    { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
