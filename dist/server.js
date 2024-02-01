"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const UserRoutes_1 = __importDefault(require("./routes/UserRoutes"));
const UserAppointmentRoutes_1 = __importDefault(require("./routes/UserAppointmentRoutes"));
const ServerConstants_1 = require("./constants/ServerConstants");
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(`${ServerConstants_1.API_ENDPOINT}`, UserRoutes_1.default);
app.use(`${ServerConstants_1.API_ENDPOINT}`, UserAppointmentRoutes_1.default);
app.listen(`${ServerConstants_1.PORT}`, () => {
    console.log(`Server running on port ${ServerConstants_1.PORT}`);
});
