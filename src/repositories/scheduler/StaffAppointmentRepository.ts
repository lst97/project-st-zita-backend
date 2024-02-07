import IStaffAppointmentRepository from "./interfaces/IStaffAppointmentRepository";
import StaffAppointmentDbModel from "../../models/database/StaffAppointment";
import { openDatabase } from "../../utils/database";
import { ISqlite } from "sqlite";
import { Statement } from "sqlite3";

class StaffAppointmentRepository implements IStaffAppointmentRepository {
  async findByGroupId(
    groupId: string
  ): Promise<StaffAppointmentDbModel | null> {
    const db = await openDatabase();
    const result = await db.get(
      `
            SELECT * FROM StaffAppointments WHERE groupId = ?
          `,
      [groupId]
    );

    if (!result) {
      return null;
    }

    return new StaffAppointmentDbModel({
      id: result.id,
      staffId: result.staffId,
      weekViewId: result.weekViewId,
      startDate: result.startDate,
      endDate: result.endDate,
      location: result.location,
    });
  }

  private async createAppointment(
    appointment: StaffAppointmentDbModel
  ): Promise<ISqlite.RunResult<Statement>> {
    const db = await openDatabase();

    return db.run(
      `
            INSERT INTO StaffAppointments (id, staffId, weekViewId, startDate, endDate, location)
            VALUES (?, ?, ?, ?, ?, ?)
          `,
      [
        appointment.id,
        appointment.staffId,
        appointment.weekViewId,
        appointment.startDate,
        appointment.endDate,
        appointment.location,
      ]
    );
  }
  // Overload signatures
  async create(
    appointment: StaffAppointmentDbModel
  ): Promise<StaffAppointmentDbModel>;
  async create(appointments: StaffAppointmentDbModel[]): Promise<boolean>;

  // Actual implementation
  async create(
    appointmentOrAppointments:
      | StaffAppointmentDbModel
      | StaffAppointmentDbModel[]
  ): Promise<boolean | StaffAppointmentDbModel> {
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

  async getAllWeekViewIdsByStaffId(staffId: string): Promise<string[]> {
    const db = await openDatabase();
    const results = await db.all(
      `
            SELECT weekViewId FROM StaffAppointments WHERE staffId = ?
          `,
      [staffId]
    );
    return results.map((result) => result.weekViewId);
  }

  async findByWeekViewId(id: string): Promise<StaffAppointmentDbModel[]> {
    const db = await openDatabase();

    const results = await db.all(
      "SELECT * FROM StaffAppointments WHERE weekViewId = ?",
      [id]
    );

    if (!results || results.length === 0) {
      return [];
    }

    return results.map(
      (result) =>
        new StaffAppointmentDbModel({
          id: result.id,
          staffId: result.staffId,
          weekViewId: result.weekViewId,
          startDate: result.startDate,
          endDate: result.endDate,
          location: result.location,
        })
    );
  }

  async findAll(): Promise<StaffAppointmentDbModel[]> {
    const db = await openDatabase();
    const results = await db.all(`
            SELECT * FROM StaffAppointments
          `);

    return results.map(
      (result) =>
        new StaffAppointmentDbModel({
          id: result.id,
          staffId: result.staffId,
          weekViewId: result.weekViewId,
          startDate: result.startDate,
          endDate: result.endDate,
          location: result.location,
        })
    );
  }
  async update(
    appointment: StaffAppointmentDbModel
  ): Promise<StaffAppointmentDbModel> {
    const db = await openDatabase();
    await db.run(
      `
            UPDATE StaffAppointments SET staffId = ?, weekViewId = ?, startDate = ?, endDate = ?, location = ?, modifyDate = ?
            WHERE id = ?
          `,
      [
        appointment.staffId,
        appointment.weekViewId,
        appointment.startDate,
        appointment.endDate,
        appointment.location,
        new Date().toISOString(),
        appointment.id,
      ]
    );

    return appointment;
  }

  async delete(id: string): Promise<void> {
    const db = await openDatabase();
    await db.run(
      `
            DELETE FROM StaffAppointments WHERE id = ?
          `,
      [id]
    );
  }

  async deleteByWeekViewIdAndStaffId(
    staffId: string,
    weekViewId: string
  ): Promise<void> {
    const db = await openDatabase();
    await db.run(
      `
            DELETE FROM StaffAppointments WHERE weekViewId = ? AND staffId = ?
          `,
      [weekViewId, staffId]
    );
  }
}
export default StaffAppointmentRepository;
