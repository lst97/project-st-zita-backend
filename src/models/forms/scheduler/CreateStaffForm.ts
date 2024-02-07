export interface CreateStaffFormParams {
  staffName: string;
  image?: string;
  color: string;
  email: string;
  phoneNumber?: string;
}

export class CreateStaffForm {
  name: string;
  image?: string;
  color: string;
  email: string;
  phoneNumber?: string;

  constructor({
    staffName,
    image,
    color,
    email,
    phoneNumber,
  }: CreateStaffFormParams) {
    this.name = staffName;
    this.image = image;
    this.color = color;
    this.email = email;
    this.phoneNumber = phoneNumber;
  }
}
