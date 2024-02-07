import { v4 as uuidv4 } from "uuid";

interface StaffDbModelProps {
  id?: string;
  name: string;
  email?: string;
  phoneNumber?: string;
  image?: string;
  color: string;
  createDate?: Date;
  modifyDate?: Date;
}

class StaffDbModel {
  id: string;
  name: string;
  email?: string;
  phoneNumber?: string;
  image?: string;
  color: string;
  createDate: Date;
  modifyDate: Date;

  constructor({
    id = uuidv4(), // Default value if not provided
    name,
    color,
    email,
    phoneNumber,
    image,
    createDate = new Date(), // Default value if not provided
    modifyDate = new Date(), // Default value if not provided
  }: StaffDbModelProps) {
    this.id = id;
    this.name = name;
    this.color = color;
    this.email = email;
    this.phoneNumber = phoneNumber;
    this.image = image;
    this.createDate = createDate;
    this.modifyDate = modifyDate;
  }
}

export default StaffDbModel;
