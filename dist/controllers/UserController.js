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
class UserController {
    constructor(userService, appointmentService) {
        this.userService = userService;
        this.appointmentService = appointmentService;
    }
    createUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const createUserForm = req.body;
            const user = yield this.userService.createUser(createUserForm);
            res.json({ data: user });
        });
    }
    deleteUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const staffName = req.query.staffName;
            yield this.appointmentService.deleteAllAppointmentsByUserName(staffName);
            yield this.userService.deleteUser(staffName);
            res.json({ data: true });
        });
    }
    getAllUserData(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const users = yield this.userService.getAllUserData();
            res.json({ data: users });
        });
    }
}
exports.default = UserController;
