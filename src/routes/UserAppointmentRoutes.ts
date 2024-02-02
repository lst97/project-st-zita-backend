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

router.post("/appointments", (req, res) =>
  userAppointmentController.createAppointments(req, res)
);

router.get("/appointments/week_view/:id", (req, res) =>
  userAppointmentController.getAllAppointmentsByWeekViewId(req, res)
);

router.delete("/appointments/week_view/:id", (req, res) =>
  userAppointmentController.deleteAllAppointmentsByWeekViewId(req, res)
);

export default router;
