"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const StaffRoutes_1 = __importDefault(require("./routes/StaffRoutes"));
const StaffAppointmentRoutes_1 = __importDefault(require("./routes/StaffAppointmentRoutes"));
const ServerConstants_1 = require("./constants/ServerConstants");
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(`${ServerConstants_1.API_ENDPOINT}`, StaffRoutes_1.default);
app.use(`${ServerConstants_1.API_ENDPOINT}`, StaffAppointmentRoutes_1.default);
app.listen(`${ServerConstants_1.PORT}`, () => {
    console.log(`Server running on port ${ServerConstants_1.PORT}`);
});
function csrf() {
    throw new Error("Function not implemented.");
}
