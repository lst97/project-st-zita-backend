"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const uuid_1 = require("uuid");
class UserDbModel {
    constructor(username, id, createDate, modifyDate) {
        this.id = (0, uuid_1.v4)();
        this.createDate = new Date();
        this.modifyDate = new Date();
        if (createDate) {
            this.createDate = createDate;
        }
        if (modifyDate) {
            this.modifyDate = modifyDate;
        }
        this.username = username;
        if (id) {
            this.id = id;
        }
    }
}
exports.default = UserDbModel;
