import { v4 as uuidv4 } from "uuid";
class User {
  id: string = uuidv4();
  username: string;
  createDate: Date = new Date();
  modifyDate: Date = new Date();

  constructor(username: string) {
    this.username = username;
  }
}

export default User;
