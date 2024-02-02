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
const database_1 = require("../utils/database");
class UserAppointmentRepository {
    findByGroupId(groupId) {
        return __awaiter(this, void 0, void 0, function* () {
            const db = yield (0, database_1.openDatabase)();
            const result = yield db.get(`
            SELECT * FROM UserAppointments WHERE groupId = ?
          `, [groupId]);
            if (!result) {
                return null;
            }
            return new UserAppointment_1.default(result.userId, result.groupId, result.weekViewId, result.startDate, result.endDate, result.location, result.createDate, result.modifyDate);
        });
    }
    createAppointment(appointment) {
        return __awaiter(this, void 0, void 0, function* () {
            const db = yield (0, database_1.openDatabase)();
            return db.run(`
            INSERT INTO UserAppointments (groupId, userId, weekViewId, startDate, endDate, location)
            VALUES (?, ?, ?, ?, ?, ?)
          `, [
                appointment.groupId,
                appointment.userId,
                appointment.weekViewId,
                appointment.startDate,
                appointment.endDate,
                appointment.location,
            ]);
        });
    }
    // Actual implementation
    create(appointmentOrAppointments) {
        return __awaiter(this, void 0, void 0, function* () {
            if (Array.isArray(appointmentOrAppointments)) {
                for (const appointment of appointmentOrAppointments) {
                    const result = yield this.createAppointment(appointment);
                    // TODO: handle if any insertion fails
                }
                return true;
            }
            else {
                yield this.createAppointment(appointmentOrAppointments);
                return appointmentOrAppointments;
            }
        });
    }
    findByWeekViewId(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const db = yield (0, database_1.openDatabase)();
            const results = yield db.all("SELECT * FROM UserAppointments WHERE weekViewId = ?", [id]);
            if (!results || results.length === 0) {
                return [];
            }
            return results.map((result) => new UserAppointment_1.default(result.userId, result.groupId, result.weekViewId, result.startDate, result.endDate, result.location));
        });
    }
    findAll() {
        return __awaiter(this, void 0, void 0, function* () {
            const db = yield (0, database_1.openDatabase)();
            const results = yield db.all(`
            SELECT * FROM UserAppointments
          `);
            return results.map((result) => new UserAppointment_1.default(result.userId, result.groupId, result.weekViewId, result.startDate, result.endDate, result.location));
        });
    }
    update(appointment) {
        return __awaiter(this, void 0, void 0, function* () {
            const db = yield (0, database_1.openDatabase)();
            yield db.run(`
            UPDATE UserAppointments SET groupId = ?, userId = ?, weekViewId = ?, startDate = ?, endDate = ?, location = ?
            WHERE groupId = ?
          `, [
                appointment.groupId,
                appointment.userId,
                appointment.weekViewId,
                appointment.startDate,
                appointment.endDate,
                appointment.location,
                appointment.groupId,
            ]);
            return appointment;
        });
    }
    delete(groupId) {
        return __awaiter(this, void 0, void 0, function* () {
            const db = yield (0, database_1.openDatabase)();
            yield db.run(`
            DELETE FROM UserAppointments WHERE groupId = ?
          `, [groupId]);
        });
    }
    deleteByWeekViewIdAndUserId(userId, weekViewId) {
        return __awaiter(this, void 0, void 0, function* () {
            const db = yield (0, database_1.openDatabase)();
            yield db.run(`
            DELETE FROM UserAppointments WHERE weekViewId = ? AND userId = ?
          `, [weekViewId, userId]);
        });
    }
}
exports.default = UserAppointmentRepository;
