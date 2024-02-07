import { openDatabase } from "../../utils/database";
import IStaffRepository from "./interfaces/IStaffRepository";
import StaffDbModel from "../../models/database/Staff";

class StaffRepository implements IStaffRepository {
  async findByName(name: string): Promise<StaffDbModel | null> {
    const db = await openDatabase();
    const staff = await db.get("SELECT * FROM Staffs WHERE name = ?", [name]);

    return staff
      ? new StaffDbModel({
          id: staff.id as string,
          name: staff.name as string,
          email: staff.email as string,
          phoneNumber: staff.phoneNumber as string,
          image: staff.image as string,
          color: staff.color as string,
          createDate: new Date(staff.createDate as string),
          modifyDate: new Date(staff.modifyDate as string),
        })
      : null;
  }

  async create(staff: StaffDbModel): Promise<StaffDbModel> {
    const db = await openDatabase();
    await db.run(
      "INSERT INTO Staffs (id, name, email, phoneNumber, image, color, createDate, modifyDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [
        staff.id,
        staff.name,
        staff.email,
        staff.phoneNumber,
        staff.image,
        staff.color,
        new Date().toISOString(),
        new Date().toISOString(),
      ]
    );
    return staff;
  }

  async findById(id: string): Promise<StaffDbModel | null> {
    const db = await openDatabase();
    const staff = await db.get("SELECT * FROM Staffs WHERE id = ?", [id]);
    return staff
      ? new StaffDbModel({
          id: staff.id,
          name: staff.name,
          email: staff.email,
          phoneNumber: staff.phoneNumber,
          image: staff.image,
          color: staff.color,
          createDate: new Date(staff.createDate),
          modifyDate: new Date(staff.modifyDate),
        })
      : null;
  }

  async findAll(): Promise<StaffDbModel[]> {
    const db = await openDatabase();
    const staffs = await db.all("SELECT * FROM Staffs");
    return staffs.map(
      (staff) =>
        new StaffDbModel({
          id: staff.id as string,
          name: staff.name as string,
          email: staff.email as string,
          phoneNumber: staff.phoneNumber as string,
          image: staff.image as string,
          color: staff.color as string,
          createDate: new Date(staff.createDate as string),
          modifyDate: new Date(staff.modifyDate as string),
        })
    );
  }

  async update(staff: StaffDbModel): Promise<StaffDbModel> {
    const db = await openDatabase();
    await db.run(
      "UPDATE Staffs SET name = ?, email = ?, phoneNumber = ?, image = ?, color = ?, modifyDate = ? WHERE id = ?",
      [
        staff.name,
        staff.email,
        staff.phoneNumber,
        staff.image,
        staff.color,
        new Date().toISOString(),
        staff.id,
      ]
    );
    return staff;
  }

  async deleteById(id: string): Promise<void> {
    const db = await openDatabase();
    await db.run("DELETE FROM Staffs WHERE id = ?", [id]);
  }

  async deleteByName(name: string): Promise<void> {
    const db = await openDatabase();
    await db.run("DELETE FROM Staffs WHERE name = ?", [name]);
  }
}

export default StaffRepository;
