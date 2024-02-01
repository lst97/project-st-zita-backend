"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const UserController_1 = __importDefault(require("../controllers/UserController"));
const UserService_1 = __importDefault(require("../services/UserService"));
const UserProfileService_1 = __importDefault(require("../services/UserProfileService"));
const UserRepository_1 = __importDefault(require("../repositories/UserRepository"));
const UserProfileRepository_1 = __importDefault(require("../repositories/UserProfileRepository"));
const router = express_1.default.Router();
// create service and repository instance.
const userProfileRepository = new UserProfileRepository_1.default();
const userProfileService = new UserProfileService_1.default(userProfileRepository);
const userRepository = new UserRepository_1.default();
const userService = new UserService_1.default(userProfileService, userRepository);
const userController = new UserController_1.default(userService);
router.post("/users", (req, res) => userController.createUser(req, res));
router.get("/users", (req, res) => userController.getAllUserData(req, res));
// Other route definitions
exports.default = router;
