import express from "express";
import AppointmentService from "../services/AppointmentService";
import StaffAppointmentRepository from "../repositories/scheduler/StaffAppointmentRepository";
import StaffAppointmentController from "../controllers/scheduler/StaffAppointmentController";
import StaffRepository from "../repositories/scheduler/StaffRepository";
import StaffService from "../services/StaffService";

const router = express.Router();

const appointmentService = new AppointmentService(
  new StaffService(new StaffRepository()),
  new StaffAppointmentRepository()
);

const staffAppointmentController = new StaffAppointmentController(
  appointmentService
);

router.post("/appointments", (req, res) =>
  staffAppointmentController.createAppointments(req, res)
);

router.get("/appointments/week_view/:id", (req, res) =>
  staffAppointmentController.getAllAppointmentsByWeekViewId(req, res)
);

router.delete("/appointments/week_view/:id", (req, res) =>
  staffAppointmentController.deleteAllAppointmentsByWeekViewIdAndStaffName(
    req,
    res
  )
);

export default router;
