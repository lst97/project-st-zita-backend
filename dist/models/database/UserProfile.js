"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class UserProfileDbModel {
    constructor(id, email, color, phoneNumber, image, createDate, modifyDate) {
        this.createDate = new Date();
        this.modifyDate = new Date();
        if (createDate) {
            this.createDate = createDate;
        }
        if (modifyDate) {
            this.modifyDate = modifyDate;
        }
        if (image) {
            this.image = image;
        }
        this.id = id;
        this.phoneNumber = phoneNumber;
        this.email = email;
        this.color = color;
    }
}
exports.default = UserProfileDbModel;
