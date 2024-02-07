import express from "express";
import StaffController from "../controllers/scheduler/StaffController";
import StaffService from "../services/StaffService";
import AppointmentService from "../services/AppointmentService";
import StaffRepository from "../repositories/scheduler/StaffRepository";
import StaffAppointmentRepository from "../repositories/scheduler/StaffAppointmentRepository";

const router = express.Router();

// create service and repository instance.
const staffRepository = new StaffRepository();

const staffService = new StaffService(staffRepository);

const appointmentRepository = new StaffAppointmentRepository();
const appointmentService = new AppointmentService(
  staffService,
  appointmentRepository
);

const staffController = new StaffController(staffService, appointmentService);

router.post("/staffs", (req, res) => staffController.createStaff(req, res));
router.delete("/staffs", (req, res) => staffController.deleteStaff(req, res));
router.get("/staffs", (req, res) => staffController.getAllStaffData(req, res));

// Other route definitions

export default router;
