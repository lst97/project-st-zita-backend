class UserProfile {
  id: string;
  email: string;
  phoneNumber?: string;
  color: string;
  image?: string;
  createDate: Date = new Date();
  modifyDate: Date = new Date();

  constructor(
    id: string,
    email: string,
    color: string,
    phoneNumber?: string,
    image?: string,
    createDate?: Date,
    modifyDate?: Date
  ) {
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

export default UserProfile;
