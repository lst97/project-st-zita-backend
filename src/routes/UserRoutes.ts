import express from "express";
import UserController from "../controllers/UserController";
import UserService from "../services/UserService";

const router = express.Router();
const userService = new UserService();
const userController = new UserController(userService);

router.post("/user", (req, res) => userController.createUser(req, res));

// Other route definitions

export default router;
