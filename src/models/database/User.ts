import { v4 as uuidv4 } from "uuid";
class User {
  id: string = uuidv4();
  username: string;
  createDate: Date = new Date();
  modifyDate: Date = new Date();

  constructor(
    username: string,
    id?: string,
    createDate?: Date,
    modifyDate?: Date
  ) {
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

export default User;
