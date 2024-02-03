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
const User_1 = __importDefault(require("../models/database/User"));
const UserData_1 = __importDefault(require("../models/share/UserData"));
class UserService {
    constructor(userProfileService, userRepository) {
        this.userProfileService = userProfileService;
        this.userRepository = userRepository;
    }
    createUser(userForm) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = new User_1.default(userForm.username);
            this.userRepository.create(user);
            yield this.userProfileService.createProfile(user, userForm);
            // create user profile
            return user;
        });
    }
    deleteUser(username) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = yield this.getUserIdByUsername(username);
            if (userId) {
                yield this.userProfileService.deleteProfile(userId);
                yield this.userRepository.delete(userId);
            }
        });
    }
    getUserIdByUsername(username) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.userRepository.findByUsername(username);
            const userId = user ? user.id : null;
            return userId;
        });
    }
    getAllUserData() {
        return __awaiter(this, void 0, void 0, function* () {
            let users = yield this.userRepository.findAll();
            let userProfiles = yield this.userProfileService.getAllProfiles();
            let userDataList = [];
            users.map((user) => {
                let profile = userProfiles.find((p) => p.id === user.id);
                if (profile) {
                    let userData = new UserData_1.default(user.username, profile.email, profile.color, profile.image, profile.phoneNumber);
                    userDataList.push(userData);
                }
            });
            return userDataList;
        });
    }
    getAllUsers() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.userRepository.findAll();
        });
    }
}
exports.default = UserService;
