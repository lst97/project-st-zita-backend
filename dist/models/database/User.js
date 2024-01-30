"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const uuid_1 = require("uuid");
class User {
    constructor(username) {
        this.id = (0, uuid_1.v4)();
        this.createDate = new Date();
        this.modifyDate = new Date();
        this.username = username;
    }
}
exports.default = User;
