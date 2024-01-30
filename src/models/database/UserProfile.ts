export class UserProfile {
  id: string;
  username: string;
  email: string;
  phoneNumber: string;
  createDate: Date = new Date();
  modifyDate: Date = new Date();

  constructor(
    id: string,
    username: string,
    email: string,
    phoneNumber: string
  ) {
    this.id = id;
    this.username = username;
    this.phoneNumber = phoneNumber;
    this.email = email;
  }
}
