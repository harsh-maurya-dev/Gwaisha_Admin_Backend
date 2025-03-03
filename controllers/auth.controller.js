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
        const { name, email, password, age, mobile_number, address, profile_image, total_orders, status, user_type } = req.body;

        // Validate required fields
        if (!name || !email || !password || !mobile_number) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                status: 400,
                success: false,
                message: "Name, email, password, and mobile number are required fields.",
            });
        }

        // Check if the email or mobile number already exists
        const existingUser = await User.findOne({ email }).session(session);
        if (existingUser) {
            await session.abortTransaction();
            session.endSession();
            return res.status(409).json({
                status: 409,
                success: false,
                message: "User with this email already exists!",
            });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create a new user
        const newUser = await User.create(
            [
                {
                    name,
                    email,
                    password: hashedPassword,
                    age,
                    mobile_number,
                    address,
                    profile_image,
                    total_orders,
                    status,
                    user_type
                },
            ],
            { session }
        );

        // Generate JWT token
        const token = jwt.sign({ userId: newUser[0]._id, userType:newUser[0].user_type }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

        // Commit the transaction
        await session.commitTransaction();
        session.endSession();

        // Log the successful user creation
        // logger.info(`User created successfully: ${newUser[0].email}`);

        // Send success response
        res.status(201).json({
            status: 201,
            success: true,
            message: "User created successfully!",
            data: {
                token,
                user: {
                    _id: newUser[0]._id,
                    name: newUser[0].name,
                    email: newUser[0].email,
                    age: newUser[0].age,
                    mobile_number: newUser[0].mobile_number,
                    address: newUser[0].address,
                    profile_image: newUser[0].profile_image,
                    total_orders: newUser[0].total_orders,
                    status: newUser[0].status,
                    user_type:newUser[0].user_type
                },
            },
        });
    } catch (error) {
        // Log the error
        // logger.error(`Error during user signup: ${error.message}`);

        // Rollback the transaction if it's still active
        if (session.inTransaction()) {
            await session.abortTransaction();
        }
        session.endSession();

        // Pass the error to the error-handling middleware
        next(error);
    }
};

// SignIn API Logic
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
        const otp = Math.floor(1000 + Math.random() * 9000).toString();

        user.otp = otp
        user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes expiration

        await user.save();

        // Send OTP via Email
        const mailOptions = {
            from: EMAIL_USER,
            to: user.email,
            subject: "Reset Password OTP",
            text: `Your OTP for password reset is: ${otp}. It will expire in 10 minutes.`,
        };

        // console.log(EMAIL_USER);

        await transporter.sendMail(mailOptions);
        await user.save();
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
                status: 404,
                success: false,
                message: "User not found",
            });
        }

        if (!user.otp || String(user.otp) !== String(otp) || new Date(user.otpExpires).getTime() < Date.now()) {
            return res.status(400).json(
                {
                    status: 400,
                    success: false,
                    message: "Invalid or expired OTP",
                }
            );
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


export const resetPassword = async (req, res, next) => {
    try {
        const { email, newPassword } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json(
                {
                    status: 404,
                    success: false,
                    message: "User not found!"
                });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;

        await user.save();

        res.status(200).json({
            status: 200,
            success: true,
            message: "Password reset successfully!"
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
        next()
    }
};


export const signOut = async (req, res, next) => {
}