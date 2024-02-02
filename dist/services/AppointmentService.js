"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const UserAppointment_1 = __importDefault(require("../models/database/UserAppointment"));
const uuid_1 = require("uuid");
const AppointmentData_1 = require("../models/share/AppointmentData");
class AppointmentService {
    constructor(userService, appointmentRepository) {
        this.userService = userService;
        this.appointmentRepository = appointmentRepository;
    }
    createAppointments(appointmentsData) {
        return __awaiter(this, void 0, void 0, function* () {
            const users = yield this.userService.getAllUsers();
            const userIdMap = new Map();
            users.forEach((user) => {
                userIdMap.set(user.username, user.id);
            });
            const appointmentsDbModels = new Array();
            appointmentsData.forEach((appointment) => {
                const userId = userIdMap.get(appointment.username);
                if (userId) {
                    const appointmentDbModel = new UserAppointment_1.default(userId, (0, uuid_1.v4)(), appointment.weekViewId, appointment.startDate, appointment.endDate, appointment.location);
                    appointmentsDbModels.push(appointmentDbModel);
                }
            });
            yield this.appointmentRepository.create(appointmentsDbModels);
            return true;
        });
    }
    convertToAppointmentData(appointmentDbModel, userName) {
        return new AppointmentData_1.AppointmentData(userName, appointmentDbModel.groupId, appointmentDbModel.weekViewId, appointmentDbModel.startDate, appointmentDbModel.endDate, appointmentDbModel.location);
    }
    buildUserNameMap() {
        return __awaiter(this, void 0, void 0, function* () {
            const users = yield this.userService.getAllUsers();
            const userNameMap = new Map();
            users.forEach((user) => {
                userNameMap.set(user.id, user.username);
            });
            return userNameMap;
        });
    }
    mapAppointmentDbModelsToAppointmentsData(appointmentDbModels, userNameMap) {
        const appointments = new Array();
        for (const appointmentDbModel of appointmentDbModels) {
            const userName = userNameMap.get(appointmentDbModel.userId);
            if (userName) {
                appointments.push(this.convertToAppointmentData(appointmentDbModel, userName));
            }
        }
        return appointments;
    }
    getAllAppointments() {
        return __awaiter(this, void 0, void 0, function* () {
            const appointmentDbModels = yield this.appointmentRepository.findAll();
            const userNameMap = yield this.buildUserNameMap();
            return this.mapAppointmentDbModelsToAppointmentsData(appointmentDbModels, userNameMap);
        });
    }
    getAllAppointmentsByWeekViewId(weekViewId) {
        return __awaiter(this, void 0, void 0, function* () {
            const appointmentDbModels = yield this.appointmentRepository.findByWeekViewId(weekViewId);
            const userNameMap = yield this.buildUserNameMap();
            if (!appointmentDbModels) {
                return null;
            }
            return this.mapAppointmentDbModelsToAppointmentsData(appointmentDbModels, userNameMap);
        });
    }
    deleteAllAppointmentsByWeekViewIdAndStaffName(staffName, weekViewId) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = yield this.userService.getUserIdByUsername(staffName);
            if (!userId) {
                return;
            }
            yield this.appointmentRepository.deleteByWeekViewIdAndUserId(userId, weekViewId);
        });
    }
}
exports.default = AppointmentService;
