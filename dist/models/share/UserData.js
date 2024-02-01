"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class UserData {
    constructor(username, email, color, image, phoneNumber) {
        this.username = username;
        this.email = email;
        this.color = color;
        if (image) {
            this.image = image;
        }
        if (phoneNumber) {
            this.phoneNumber = phoneNumber;
        }
    }
}
exports.default = UserData;
