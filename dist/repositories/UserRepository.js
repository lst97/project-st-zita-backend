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
const database_1 = require("../utils/database");
const User_1 = __importDefault(require("../models/database/User"));
class UserRepository {
    findByUsername(username) {
        return __awaiter(this, void 0, void 0, function* () {
            const db = yield (0, database_1.openDatabase)();
            const user = yield db.get("SELECT * FROM Users WHERE username = ?", [
                username,
            ]);
            return user ? new User_1.default(user.username, user.id) : null;
        });
    }
    create(user) {
        return __awaiter(this, void 0, void 0, function* () {
            const db = yield (0, database_1.openDatabase)();
            yield db.run("INSERT INTO Users (id, username, createDate, modifyDate) VALUES (?, ?, ?, ?)", [
                user.id,
                user.username,
                user.createDate.toISOString(),
                user.modifyDate.toISOString(),
            ]);
            return user;
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const db = yield (0, database_1.openDatabase)();
            const user = yield db.get("SELECT * FROM Users WHERE id = ?", [id]);
            return user ? new User_1.default(user.username, user.id) : null;
        });
    }
    findAll() {
        return __awaiter(this, void 0, void 0, function* () {
            const db = yield (0, database_1.openDatabase)();
            const users = yield db.all("SELECT * FROM Users");
            return users.map((u) => new User_1.default(u.username, u.id, new Date(u.createDate), new Date(u.modifyDate)));
        });
    }
    update(user) {
        return __awaiter(this, void 0, void 0, function* () {
            const db = yield (0, database_1.openDatabase)();
            yield db.run("UPDATE Users SET username = ?, modifyDate = ? WHERE id = ?", [
                user.username,
                new Date().toISOString(),
                user.id,
            ]);
            return user;
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const db = yield (0, database_1.openDatabase)();
            yield db.run("DELETE FROM Users WHERE id = ?", [id]);
        });
    }
}
exports.default = UserRepository;
