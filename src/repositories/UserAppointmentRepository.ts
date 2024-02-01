import IUserAppointmentRepository from "./interfaces/IUserAppointmentRepository";
import UserAppointmentDbModel from "../models/database/UserAppointment";
import { openDatabase } from "../utils/database";
import { ISqlite } from "sqlite";
import { Statement } from "sqlite3";

class UserAppointmentRepository implements IUserAppointmentRepository {
  async findByGroupId(groupId: string): Promise<UserAppointmentDbModel | null> {
    const db = await openDatabase();
    const result = await db.get(
      `
            SELECT * FROM UserAppointments WHERE groupId = ?
          `,
      [groupId]
    );

    if (!result) {
      return null;
    }

    return new UserAppointmentDbModel(
      result.userId,
      result.groupId,
      result.weekViewId,
      result.startDate,
      result.endDate,
      result.location,
      result.createDate,
      result.modifyDate
    );
  }

  private async createAppointment(
    appointment: UserAppointmentDbModel
  ): Promise<ISqlite.RunResult<Statement>> {
    const db = await openDatabase();

    return db.run(
      `
            INSERT INTO UserAppointments (groupId, userId, weekViewId, startDate, endDate, location)
            VALUES (?, ?, ?, ?, ?, ?)
          `,
      [
        appointment.groupId,
        appointment.userId,
        appointment.weekViewId,
        appointment.startDate,
        appointment.endDate,
        appointment.location,
      ]
    );
  }
  // Overload signatures
  async create(
    appointment: UserAppointmentDbModel
  ): Promise<UserAppointmentDbModel>;
  async create(appointments: UserAppointmentDbModel[]): Promise<boolean>;

  // Actual implementation
  async create(
    appointmentOrAppointments: UserAppointmentDbModel | UserAppointmentDbModel[]
  ): Promise<boolean | UserAppointmentDbModel> {
    if (Array.isArray(appointmentOrAppointments)) {
      for (const appointment of appointmentOrAppointments) {
        const result = await this.createAppointment(appointment);
        // TODO: handle if any insertion fails
      }
      return true;
    } else {
      await this.createAppointment(appointmentOrAppointments);
      return appointmentOrAppointments;
    }
  }

  async findByWeekViewId(id: string): Promise<UserAppointmentDbModel[] | null> {
    const db = await openDatabase();

    const results = await db.all(
      "SELECT * FROM UserAppointments WHERE weekViewId = ?",
      [id]
    );

    if (!results || results.length === 0) {
      return null;
    }

    return results.map(
      (result) =>
        new UserAppointmentDbModel(
          result.userId,
          result.groupId,
          result.weekViewId,
          result.startDate,
          result.endDate,
          result.location
        )
    );
  }

  async findAll(): Promise<UserAppointmentDbModel[]> {
    const db = await openDatabase();
    const results = await db.all(`
            SELECT * FROM UserAppointments
          `);

    return results.map(
      (result) =>
        new UserAppointmentDbModel(
          result.userId,
          result.groupId,
          result.weekViewId,
          result.startDate,
          result.endDate,
          result.location
        )
    );
  }
  async update(
    appointment: UserAppointmentDbModel
  ): Promise<UserAppointmentDbModel> {
    const db = await openDatabase();
    await db.run(
      `
            UPDATE UserAppointments SET groupId = ?, userId = ?, weekViewId = ?, startDate = ?, endDate = ?, location = ?
            WHERE groupId = ?
          `,
      [
        appointment.groupId,
        appointment.userId,
        appointment.weekViewId,
        appointment.startDate,
        appointment.endDate,
        appointment.location,
        appointment.groupId,
      ]
    );

    return appointment;
  }

  async delete(groupId: string): Promise<void> {
    const db = await openDatabase();
    await db.run(
      `
            DELETE FROM UserAppointments WHERE groupId = ?
          `,
      [groupId]
    );
  }
}
export default UserAppointmentRepository;
