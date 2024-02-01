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
Object.defineProperty(exports, "__esModule", { value: true });
class UserAppointmentController {
    constructor(appointmentService) {
        this.appointmentService = appointmentService;
    }
    createAppointments(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const appointsData = req.body;
            yield this.appointmentService.createAppointments(appointsData);
            res.json({ data: true });
        });
    }
    getAllAppointments(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const appointments = yield this.appointmentService.getAllAppointments();
            res.json({ data: appointments });
        });
    }
    // week_number + year = 142024
    getAllAppointmentsByWeekViewId(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const weekViewId = req.params.id;
            const appointments = yield this.appointmentService.getAllAppointmentsByWeekViewId(weekViewId);
            res.json({ data: appointments });
        });
    }
}
exports.default = UserAppointmentController;
