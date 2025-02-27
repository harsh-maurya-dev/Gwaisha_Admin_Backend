import nodemailer from "nodemailer"
import { EMAIL_HOST, EMAIL_PASS, EMAIL_PORT, EMAIL_USER } from "./env.js"

const transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port: EMAIL_PORT,
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS
    },
    secure: false,  // Set to false for Mailtrap
    tls: { rejectUnauthorized: false } // Bypass SSL issues
});

// console.log(EMAIL_USER, EMAIL_PASS);


export default transporter