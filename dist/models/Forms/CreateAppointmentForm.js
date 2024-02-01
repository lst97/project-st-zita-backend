"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateAppointmentForm = void 0;
class AppointmentFormData {
    constructor(username, startDate, endDate, location, weekViewId) {
        this.username = username;
        this.startDate = startDate;
        this.endDate = endDate;
        this.location = location;
        this.weekViewId = weekViewId;
    }
}
class CreateAppointmentForm {
    constructor(appointments) {
        this.appointments = appointments;
    }
}
exports.CreateAppointmentForm = CreateAppointmentForm;
