import express from "express";
import UserController from "../controllers/UserController";
import UserService from "../services/UserService";
import UserProfileService from "../services/UserProfileService";
import UserRepository from "../repositories/UserRepository";
import UserProfileRepository from "../repositories/UserProfileRepository";
import UserAppointmentRepository from "../repositories/UserAppointmentRepository";
import AppointmentService from "../services/AppointmentService";

const router = express.Router();

// create service and repository instance.
const userProfileRepository = new UserProfileRepository();
const userProfileService = new UserProfileService(userProfileRepository);
const userRepository = new UserRepository();

const userService = new UserService(userProfileService, userRepository);

const appointmentRepository = new UserAppointmentRepository();
const appointmentService = new AppointmentService(
  userService,
  appointmentRepository
);

const userController = new UserController(userService, appointmentService);

router.post("/users", (req, res) => userController.createUser(req, res));
router.delete("/user", (req, res) => userController.deleteUser(req, res));
router.get("/users", (req, res) => userController.getAllUserData(req, res));

// Other route definitions

export default router;
