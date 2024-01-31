import express from "express";
import UserController from "../controllers/UserController";
import UserService from "../services/UserService";
import UserProfileService from "../services/UserProfileService";
import UserRepository from "../repositories/UserRepository";

const router = express.Router();
const userProfileService = new UserProfileService();
const userRepository = new UserRepository();

const userService = new UserService(userProfileService, userRepository);
const userController = new UserController(userService);

router.post("/user", (req, res) => userController.createUser(req, res));

// Other route definitions

export default router;
