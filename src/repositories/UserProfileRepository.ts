// UserProfileRepository.ts

import { openDatabase } from "../utils/database"; // Your database connection setup
import UserProfile from "../models/database/UserProfile";
import IUserProfileRepository from "./interfaces/IUserProfileRepository";

class UserProfileRepository implements IUserProfileRepository {
  async create(userProfile: UserProfile): Promise<UserProfile> {
    const db = await openDatabase();
    await db.run(
      "INSERT INTO UserProfiles (id, email, color, phoneNumber, createDate, modifyDate) VALUES (?, ?, ?, ?, ?, ?)",
      [
        userProfile.id,
        userProfile.email,
        userProfile.color,
        userProfile.phoneNumber,
        userProfile.createDate.toISOString(),
        userProfile.modifyDate.toISOString(),
      ]
    );
    return userProfile;
  }

  async findById(id: string): Promise<UserProfile | null> {
    const db = await openDatabase();
    const row = await db.get("SELECT * FROM UserProfiles WHERE id = ?", [id]);
    if (row) {
      return new UserProfile(
        row.id,
        row.email,
        row.color,
        row.phoneNumber,
        row.image,
        new Date(row.createDate),
        new Date(row.modifyDate)
      );
    } else {
      return null;
    }
  }

  async update(userProfile: UserProfile): Promise<UserProfile> {
    const db = await openDatabase();
    await db.run(
      "UPDATE UserProfiles SET email = ?, color = ?, phoneNumber = ?, image = ?, modifyDate = ? WHERE id = ?",
      [
        userProfile.email,
        userProfile.color,
        userProfile.phoneNumber,
        userProfile.image,
        new Date().toISOString(),
        userProfile.id,
      ]
    );
    return userProfile;
  }

  async delete(id: string): Promise<void> {
    const db = await openDatabase();
    await db.run("DELETE FROM UserProfiles WHERE id = ?", [id]);
  }

  async findAll(): Promise<UserProfile[]> {
    const db = await openDatabase();
    const rows = await db.all("SELECT * FROM UserProfiles");

    return rows.map(
      (row) =>
        new UserProfile(
          row.id,
          row.email,
          row.color,
          row.phoneNumber,
          row.image,
          new Date(row.createDate),
          new Date(row.modifyDate)
        )
    );
  }
}
export default UserProfileRepository;
