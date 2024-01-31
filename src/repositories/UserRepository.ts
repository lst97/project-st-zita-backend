// UserRepository.ts

import { openDatabase } from "../utils/database";
import User from "../models/database/User";
import IUserRepository from "../repositories/interfaces/IUserRepository";

class UserRepository implements IUserRepository {
  async create(user: User): Promise<User> {
    const db = await openDatabase();
    await db.run(
      "INSERT INTO Users (id, username, createDate, modifyDate) VALUES (?, ?, ?, ?)",
      [
        user.id,
        user.username,
        user.createDate.toISOString(),
        user.modifyDate.toISOString(),
      ]
    );
    return user;
  }

  async findById(id: string): Promise<User | null> {
    const db = await openDatabase();
    const user = await db.get("SELECT * FROM Users WHERE id = ?", [id]);
    return user ? new User(user.username, user.id) : null;
  }

  async findAll(): Promise<User[]> {
    const db = await openDatabase();
    const users = await db.all("SELECT * FROM Users");
    return users.map(
      (u) =>
        new User(
          u.username,
          u.id,
          new Date(u.createDate),
          new Date(u.modifyDate)
        )
    );
  }

  async update(user: User): Promise<User> {
    const db = await openDatabase();
    await db.run("UPDATE Users SET username = ?, modifyDate = ? WHERE id = ?", [
      user.username,
      new Date().toISOString(),
      user.id,
    ]);
    return user;
  }

  async delete(id: string): Promise<void> {
    const db = await openDatabase();
    await db.run("DELETE FROM Users WHERE id = ?", [id]);
  }
}

export default UserRepository;
