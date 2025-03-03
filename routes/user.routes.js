import { Router } from "express"
import { getUser, getUsers } from "../controllers/user.controller.js"
import authorize from "../middlewares/auth.middleware.js"
import authorizeRoles from "../middlewares/role.middleware.js"

const userRouter = Router()

userRouter.get("/", authorize, authorizeRoles("Admin"), getUsers)
userRouter.get("/:id", authorize, authorizeRoles("Admin"), getUser)

userRouter.post("/", (req, res) => {
    res.send("add or create new user")
})
userRouter.put("/update/:id", (req, res) => {
    res.send("update user by id")
})
userRouter.delete("/delete/:id", (req, res) => {
    res.send("delete user by id")
})

export default userRouter 