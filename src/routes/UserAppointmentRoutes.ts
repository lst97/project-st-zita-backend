import express from "express";
import UserService from "../services/UserService";
import UserProfileService from "../services/UserProfileService";
import UserRepository from "../repositories/UserRepository";
import UserProfileRepository from "../repositories/UserProfileRepository";
import AppointmentService from "../services/AppointmentService";
import UserAppointmentRepository from "../repositories/UserAppointmentRepository";
import UserAppointmentController from "../controllers/UserAppointmentController";

const router = express.Router();

const appointmentService = new AppointmentService(
  new UserService(
    new UserProfileService(new UserProfileRepository()),
    new UserRepository()
  ),
  new UserAppointmentRepository()
);

const userAppointmentController = new UserAppointmentController(
  appointmentService
);

router.post("/appointment", (req, res) =>
  userAppointmentController.createAppointments(req, res)
);

export default router;
