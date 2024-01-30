"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserProfile = void 0;
class UserProfile {
    constructor(id, username, email, phoneNumber) {
        this.createDate = new Date();
        this.modifyDate = new Date();
        this.id = id;
        this.username = username;
        this.phoneNumber = phoneNumber;
        this.email = email;
    }
}
exports.UserProfile = UserProfile;
