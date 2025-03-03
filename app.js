import express from "express";
import {PORT} from "./config/env.js"
import cors from "cors"
import userRouter from "./routes/user.routes.js";
import authRouter from "./routes/auth.routes.js";
import connectToDatabase from "./database/mongodb.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
    origin: "http://ec2-52-66-186-107.ap-south-1.compute.amazonaws.com:8095",
    // origin: "http://localhost:5174",
    methods: "GET,POST,PUT,DELETE",
    credentials: true
}));

app.use('/api/v1/auth', authRouter)
app.use('/api/v1/users', userRouter)

app.get("/", (req, res) => {
    res.send("server is up running fine!!")
})

app.listen(PORT, async() => {
    console.log(`Server running on http://localhost:${PORT}`)
    await connectToDatabase()
})

