"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const UserController_1 = __importDefault(require("../controllers/UserController"));
const UserService_1 = __importDefault(require("../services/UserService"));
const router = express_1.default.Router();
const userService = new UserService_1.default();
const userController = new UserController_1.default(userService);
router.post("/user", (req, res) => userController.createUser(req, res));
// Other route definitions
exports.default = router;
