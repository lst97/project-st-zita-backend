"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class UserAppointment {
    constructor(userId, groupId, startDate, endDate, location) {
        this.createDate = new Date();
        this.modifyDate = new Date();
        this.userId = userId;
        this.groupId = groupId;
        this.startDate = startDate;
        this.endDate = endDate;
        this.location = location;
    }
}
exports.default = UserAppointment;
