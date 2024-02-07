interface StaffDataParams {
  id: string;
  name: string;
  email?: string;
  image?: string;
  color: string;
  phoneNumber?: string;
}

class StaffData {
  id: string;
  name: string;
  email?: string;
  image?: string;
  color: string;
  phoneNumber?: string;

  constructor({ id, name, email, color, image, phoneNumber }: StaffDataParams) {
    this.name = name;
    this.color = color;
    this.id = id;
    if (email) {
      this.email = email;
    }
    if (image) {
      this.image = image;
    }
    if (phoneNumber) {
      this.phoneNumber = phoneNumber;
    }
  }
}

export default StaffData;
