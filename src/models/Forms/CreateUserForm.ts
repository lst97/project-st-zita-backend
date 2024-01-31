export class CreateUserForm {
  username: string;
  image: string;
  color: string;
  email: string;
  phoneNumber?: string;

  constructor(
    username: string,
    image: string,
    color: string,
    email: string,
    phoneNumber?: string
  ) {
    this.username = username;
    this.image = image;
    this.color = color;
    this.email = email;
    this.phoneNumber = phoneNumber;
  }
}
