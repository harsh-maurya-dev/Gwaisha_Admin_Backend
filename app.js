import express from "express";
import {PORT} from "./config/env.js"
import cors from "cors"
import userRouter from "./routes/user.routes.js";
import authRouter from "./routes/auth.routes.js";
import connectToDatabase from "./database/mongodb.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use('/api/v1/auth', authRouter)
app.use('/api/v1/users', userRouter)

app.get("/", (req, res) => {
    res.send("server is up running fine!!")
})

app.listen(PORT, async() => {
    console.log(`Server running on http://localhost:${PORT}`)
    await connectToDatabase()
})

