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
const StaffAppointment_1 = __importDefault(require("../models/database/StaffAppointment"));
const uuid_1 = require("uuid");
const StaffAppointmentData_1 = require("../models/share/scheduler/StaffAppointmentData");
class StaffAppointmentService {
    constructor(staffService, appointmentRepository) {
        this.staffService = staffService;
        this.appointmentRepository = appointmentRepository;
    }
    createAppointments(appointmentsData) {
        return __awaiter(this, void 0, void 0, function* () {
            // Can optimize this by using groupBy
            const staffs = yield this.staffService.getAll();
            const staffIdMap = new Map();
            staffs.forEach((staff) => {
                staffIdMap.set(staff.name, staff.id);
            });
            const appointmentsDbModels = new Array();
            appointmentsData.forEach((appointment) => {
                const staffId = staffIdMap.get(appointment.staffName);
                if (staffId) {
                    const appointmentDbModel = new StaffAppointment_1.default({
                        id: (0, uuid_1.v4)(),
                        staffId: staffId,
                        weekViewId: appointment.weekViewId,
                        startDate: appointment.startDate,
                        endDate: appointment.endDate,
                        location: appointment.location,
                    });
                    appointmentsDbModels.push(appointmentDbModel);
                }
            });
            yield this.appointmentRepository.create(appointmentsDbModels);
            return true;
        });
    }
    convertToAppointmentData(appointmentDbModel, staffName) {
        return new StaffAppointmentData_1.AppointmentData({
            staffName: staffName,
            groupId: appointmentDbModel.id,
            weekViewId: appointmentDbModel.weekViewId,
            location: appointmentDbModel.location,
            startDate: appointmentDbModel.startDate,
            endDate: appointmentDbModel.endDate,
        });
    }
    buildStaffNameMap() {
        return __awaiter(this, void 0, void 0, function* () {
            const staffs = yield this.staffService.getAll();
            const staffNameMap = new Map();
            staffs.forEach((staff) => {
                staffNameMap.set(staff.id, staff.name);
            });
            return staffNameMap;
        });
    }
    mapAppointmentDbModelsToAppointmentsData(appointmentDbModels, staffNameMap) {
        const appointments = new Array();
        for (const appointmentDbModel of appointmentDbModels) {
            const staffName = staffNameMap.get(appointmentDbModel.staffId);
            if (staffName) {
                appointments.push(this.convertToAppointmentData(appointmentDbModel, staffName));
            }
        }
        return appointments;
    }
    getAllAppointments() {
        return __awaiter(this, void 0, void 0, function* () {
            const appointmentDbModels = yield this.appointmentRepository.findAll();
            const staffNameMap = yield this.buildStaffNameMap();
            return this.mapAppointmentDbModelsToAppointmentsData(appointmentDbModels, staffNameMap);
        });
    }
    getAllAppointmentsByWeekViewId(weekViewId) {
        return __awaiter(this, void 0, void 0, function* () {
            const appointmentDbModels = yield this.appointmentRepository.findByWeekViewId(weekViewId);
            const staffNameMap = yield this.buildStaffNameMap();
            if (!appointmentDbModels) {
                return null;
            }
            return this.mapAppointmentDbModelsToAppointmentsData(appointmentDbModels, staffNameMap);
        });
    }
    deleteAllAppointmentsByWeekViewIdAndStaffName(staffName, weekViewId) {
        return __awaiter(this, void 0, void 0, function* () {
            const staffId = yield this.staffService.getIdByName(staffName);
            if (!staffId) {
                return;
            }
            yield this.appointmentRepository.deleteByWeekViewIdAndStaffId(staffId, weekViewId);
        });
    }
    deleteAllAppointmentsByStaffName(staffName) {
        return __awaiter(this, void 0, void 0, function* () {
            const staffId = yield this.staffService.getIdByName(staffName);
            if (!staffId) {
                return;
            }
            const weekViewIds = yield this.appointmentRepository.getAllWeekViewIdsByStaffId(staffId);
            for (const weekViewId of weekViewIds) {
                yield this.appointmentRepository.deleteByWeekViewIdAndStaffId(staffId, weekViewId);
            }
        });
    }
}
exports.default = StaffAppointmentService;
