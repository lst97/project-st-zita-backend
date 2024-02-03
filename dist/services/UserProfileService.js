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
const UserProfile_1 = __importDefault(require("../models/database/UserProfile"));
class UserProfileService {
    constructor(userProfileRepository) {
        this.userProfileRepository = userProfileRepository;
    }
    createProfile(user, userForm) {
        return __awaiter(this, void 0, void 0, function* () {
            let userProfile = new UserProfile_1.default(user.id, userForm.email, userForm.color, userForm.phoneNumber, userForm.image);
            yield this.userProfileRepository.create(userProfile);
            return user;
        });
    }
    deleteProfile(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.userProfileRepository.delete(userId);
        });
    }
    getProfile(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.userProfileRepository.findById(userId);
        });
    }
    getAllProfiles() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.userProfileRepository.findAll();
        });
    }
}
exports.default = UserProfileService;
