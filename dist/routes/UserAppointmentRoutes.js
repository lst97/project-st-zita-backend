"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const UserService_1 = __importDefault(require("../services/UserService"));
const UserProfileService_1 = __importDefault(require("../services/UserProfileService"));
const UserRepository_1 = __importDefault(require("../repositories/UserRepository"));
const UserProfileRepository_1 = __importDefault(require("../repositories/UserProfileRepository"));
const AppointmentService_1 = __importDefault(require("../services/AppointmentService"));
const UserAppointmentRepository_1 = __importDefault(require("../repositories/UserAppointmentRepository"));
const UserAppointmentController_1 = __importDefault(require("../controllers/UserAppointmentController"));
const router = express_1.default.Router();
const appointmentService = new AppointmentService_1.default(new UserService_1.default(new UserProfileService_1.default(new UserProfileRepository_1.default()), new UserRepository_1.default()), new UserAppointmentRepository_1.default());
const userAppointmentController = new UserAppointmentController_1.default(appointmentService);
router.post("/appointments", (req, res) => userAppointmentController.createAppointments(req, res));
router.get("/appointments/week_view/:id", (req, res) => userAppointmentController.getAllAppointmentsByWeekViewId(req, res));
exports.default = router;