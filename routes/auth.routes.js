import { Router } from "express";
import { forgotPassword, resetPassword, signIn, signOut, signUp, verifyOtp } from "../controllers/auth.controller.js";

const authRouter = Router()

authRouter.post('/sign-up', signUp)
authRouter.post('/sign-in', signIn)
authRouter.post('/sign-out', signOut)
authRouter.post('/forgot-password', forgotPassword)
authRouter.post('/verify-otp', verifyOtp)
authRouter.post('/reset-password', resetPassword)

export default authRouter;