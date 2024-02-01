"use strict";
// UserProfileRepository.ts
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
const database_1 = require("../utils/database"); // Your database connection setup
const UserProfile_1 = __importDefault(require("../models/database/UserProfile"));
class UserProfileRepository {
    create(userProfile) {
        return __awaiter(this, void 0, void 0, function* () {
            const db = yield (0, database_1.openDatabase)();
            yield db.run("INSERT INTO UserProfiles (id, email, color, phoneNumber, createDate, modifyDate) VALUES (?, ?, ?, ?, ?, ?)", [
                userProfile.id,
                userProfile.email,
                userProfile.color,
                userProfile.phoneNumber,
                userProfile.createDate.toISOString(),
                userProfile.modifyDate.toISOString(),
            ]);
            return userProfile;
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const db = yield (0, database_1.openDatabase)();
            const row = yield db.get("SELECT * FROM UserProfiles WHERE id = ?", [id]);
            if (row) {
                return new UserProfile_1.default(row.id, row.email, row.color, row.phoneNumber, row.image, new Date(row.createDate), new Date(row.modifyDate));
            }
            else {
                return null;
            }
        });
    }
    update(userProfile) {
        return __awaiter(this, void 0, void 0, function* () {
            const db = yield (0, database_1.openDatabase)();
            yield db.run("UPDATE UserProfiles SET email = ?, color = ?, phoneNumber = ?, image = ?, modifyDate = ? WHERE id = ?", [
                userProfile.email,
                userProfile.color,
                userProfile.phoneNumber,
                userProfile.image,
                new Date().toISOString(),
                userProfile.id,
            ]);
            return userProfile;
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const db = yield (0, database_1.openDatabase)();
            yield db.run("DELETE FROM UserProfiles WHERE id = ?", [id]);
        });
    }
    findAll() {
        return __awaiter(this, void 0, void 0, function* () {
            const db = yield (0, database_1.openDatabase)();
            const rows = yield db.all("SELECT * FROM UserProfiles");
            return rows.map((row) => new UserProfile_1.default(row.userId, row.email, row.color, row.phoneNumber, row.image, new Date(row.createDate), new Date(row.modifyDate)));
        });
    }
}
exports.default = UserProfileRepository;
