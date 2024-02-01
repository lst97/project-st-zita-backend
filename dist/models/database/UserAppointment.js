"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class UserAppointmentDbModel {
    constructor(userId, groupId, weekViewId, startDate, endDate, location, createDate, modifyDate) {
        this.createDate = new Date();
        this.modifyDate = new Date();
        this.userId = userId;
        this.groupId = groupId;
        this.weekViewId = weekViewId;
        this.startDate = startDate;
        this.endDate = endDate;
        this.location = location;
        if (createDate) {
            this.createDate = new Date(createDate);
        }
        if (modifyDate) {
            this.modifyDate = new Date(modifyDate);
        }
    }
}
exports.default = UserAppointmentDbModel;
