import { openDatabase } from "../utils/database";
import UserDbModel from "../models/database/User";
import IUserRepository from "../repositories/interfaces/IUserRepository";

class UserRepository implements IUserRepository {
  async findByUsername(username: string): Promise<UserDbModel | null> {
    const db = await openDatabase();
    const user = await db.get("SELECT * FROM Users WHERE username = ?", [
      username,
    ]);
    return user ? new UserDbModel(user.username, user.id) : null;
  }

  async create(user: UserDbModel): Promise<UserDbModel> {
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

  async findById(id: string): Promise<UserDbModel | null> {
    const db = await openDatabase();
    const user = await db.get("SELECT * FROM Users WHERE id = ?", [id]);
    return user ? new UserDbModel(user.username, user.id) : null;
  }

  async findAll(): Promise<UserDbModel[]> {
    const db = await openDatabase();
    const users = await db.all("SELECT * FROM Users");
    return users.map(
      (u) =>
        new UserDbModel(
          u.username,
          u.id,
          new Date(u.createDate),
          new Date(u.modifyDate)
        )
    );
  }

  async update(user: UserDbModel): Promise<UserDbModel> {
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
