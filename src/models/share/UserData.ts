class UserData {
  username: string;
  email: string;
  image?: string;
  color: string;
  phoneNumber?: string;

  constructor(
    username: string,
    email: string,
    color: string,
    image?: string,
    phoneNumber?: string
  ) {
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

export default UserData;
