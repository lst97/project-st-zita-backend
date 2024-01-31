import express from "express";
import UserController from "../controllers/UserController";
import UserService from "../services/UserService";
import UserProfileService from "../services/UserProfileService";
import UserRepository from "../repositories/UserRepository";
import UserProfileRepository from "../repositories/UserProfileRepository";

const router = express.Router();

// create service and repository instance.
const userProfileRepository = new UserProfileRepository();
const userProfileService = new UserProfileService(userProfileRepository);
const userRepository = new UserRepository();

const userService = new UserService(userProfileService, userRepository);
const userController = new UserController(userService);

router.post("/user", (req, res) => userController.createUser(req, res));
router.get("/user", (req, res) => userController.getAllUser(req, res));

// Other route definitions

export default router;
