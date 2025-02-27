import mongoose from "mongoose"
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { EMAIL_USER, JWT_EXPIRES_IN, JWT_SECRET } from "../config/env.js";
import User from "../models/user.model.js";
import transporter from "../config/nodemailer.js";

// Signup API Logic
export const signUp = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { name, email, password } = req.body;

        // Check if the email already exists
        const existingUser = await User.findOne({ email }).session(session);
        if (existingUser) {
            await session.abortTransaction();
            session.endSession();
            return res.status(409).json({
                status: 409,
                success: false,
                message: "User already exists!",
            });
        }

        // Hash the password asynchronously
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create a new user
        const newUser = await User.create([{ name, email, password: hashedPassword }], { session });

        // Generate JWT token
        const token = jwt.sign({ userId: newUser[0]._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

        // Commit the transaction
        await session.commitTransaction();
        session.endSession();

        // Send success response
        res.status(201).json({
            status: 201,
            success: true,
            message: "User created successfully!",
            data: {
                token: token,
                user: newUser[0]
            },
        });
    } catch (error) {
        if (session.inTransaction()) {
            await session.abortTransaction();
        }
        session.endSession();
        next(error);
    }
};


export const signIn = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email })

        if (!user) {
            return res.status(404).json({
                status: 404,
                success: false,
                message: "User not found!",
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password)

        if (!isPasswordValid) {
            // const error = new Error("Invalid Password")
            // error.statusCode = 401;
            // throw error
            return res.status(401).json({
                status: 401,
                success: false,
                message: "Invalid Password",
            });
        }

        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })

        // Send success response
        res.status(200).json({
            status: 200,
            success: true,
            message: "User signed in successfully!",
            data: {
                token: token,
                user: user
            },
        });


    } catch (error) {
        next(error)
    }


}


export const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });

        if (!user) return res.status(404).json({ message: "User not found" });

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // const hashedOtp = await bcrypt.hash(otp, 10); // Hash OTP before storing

        // // Save OTP & expiration time in the database
        // user.otp = hashedOtp;
        user.otp = otp
        user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes expiration

        await user.save();

        // Send OTP via Email
        const mailOptions = {
            from: EMAIL_USER,
            to: user.email,
            subject: "Password Reset OTP",
            text: `Your OTP for password reset is: ${otp}. It will expire in 10 minutes.`,
        };

        // console.log(EMAIL_USER);

        await transporter.sendMail(mailOptions);

        res.status(202).json(
            {
                status: 202,
                success: true,
                message: "OTP sent successfully",
                data: {
                    otp: otp
                }
            }
        );
    } catch (error) {
        // res.status(500).json({ message: "Something went wrong", error: error.message });
        next(error)
    }
};



export const verifyOtp = async (req, res, next) => {
    try {
        const { email, otp } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                stauts: 404,
                success: false,
                message: "User not found",
            });
        }

        if (!user.otp || user.otp !== otp || user.otpExpires < Date.now()) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        user.isVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        res.status(200).json({
            status: 200,
            success: true,
            message: "OTP verified successfully"
        });
        
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
        next()
    }
};



export const signOut = async (req, res, next) => {
}