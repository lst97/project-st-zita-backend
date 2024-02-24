import IStaffAppointmentRepository from './interfaces/IStaffAppointmentRepository';
import StaffAppointmentDbModel from '../../models/database/StaffAppointment';
import { Service } from 'typedi';
import {
	DatabaseService,
	SQLite3QueryService
} from '../../services/DatabaseService';
import {
	SqlCreateError,
	SqlDeleteError,
	SqlReadError,
	SqlUpdateError
} from '../../models/error/Errors';

@Service()
class StaffAppointmentRepository implements IStaffAppointmentRepository {
	constructor(
		private databaseService: DatabaseService,
		private queryService: SQLite3QueryService
	) {}
	/**
	 * Finds a staff appointment by its ID.
	 * @param id The ID of the staff appointment.
	 * @returns A promise that resolves to the found staff appointment or null if not found.
	 * @throws {SqlReadError} If the query fails.
	 */
	async findById(id: string): Promise<StaffAppointmentDbModel | null> {
		return (await this.queryService.getWithSqlErrorHandlingAsync(
			this.databaseService.getDatabase(),
			'SELECT * FROM StaffAppointments WHERE id = ?',
			[id],
			SqlReadError
		)) as StaffAppointmentDbModel | null;
	}

	/**
	 * Creates a new staff appointment.
	 * @param appointment The staff appointment to create.
	 * @returns A promise that resolves to the created staff appointment.
	 * @throws {SqlCreateError} If the query fails.
	 */
	async create(
		appointment: StaffAppointmentDbModel
	): Promise<StaffAppointmentDbModel> {
		await this.queryService.runWithSqlErrorHandlingAsync(
			this.databaseService.getDatabase(),
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
				appointment.location
			],
			SqlCreateError
		);
		return appointment;
	}

	/**
	 * Creates multiple staff appointments.
	 * @param appointments The staff appointments to create.
	 * @returns A promise that resolves to the created staff appointments.
	 * @throws {SqlCreateError} If the query fails.
	 */
	async createMany(
		appointments: StaffAppointmentDbModel[]
	): Promise<StaffAppointmentDbModel[]> {
		await this.queryService.runWithSqlErrorHandlingAsync(
			this.databaseService.getDatabase(),
			`
		  INSERT INTO StaffAppointments (id, staffId, weekViewId, startDate, endDate, location)
		  VALUES ${appointments.map(() => '(?, ?, ?, ?, ?, ?)').join(', ')}
		`,
			appointments.flatMap((appointment) => [
				appointment.id,
				appointment.staffId,
				appointment.weekViewId,
				appointment.startDate,
				appointment.endDate,
				appointment.location
			]),
			SqlCreateError
		);
		return appointments;
	}

	/**
	 * Finds all staff appointments by staff ID.
	 * @param staffId The ID of the staff.
	 * @returns A promise that resolves to the found staff appointments.
	 * @throws {SqlReadError} If the query fails.
	 */
	async getAllWeekViewIdsByStaffId(staffId: string): Promise<string[]> {
		return (
			(await this.queryService.allWithSqlErrorHandlingAsync(
				this.databaseService.getDatabase(),
				`
		SELECT weekViewId FROM StaffAppointments WHERE staffId = ?
	  `,
				[staffId],
				SqlReadError
			)) as StaffAppointmentDbModel[]
		).map((row) => row.weekViewId);
	}

	/**
	 * Finds all staff appointments by staff ID.
	 * @param staffId The ID of the staff.
	 * @returns A promise that resolves to the found staff appointments.
	 * @throws {SqlReadError} If the query fails.
	 */
	async findByWeekViewId(id: string): Promise<StaffAppointmentDbModel[]> {
		return (await this.queryService.allWithSqlErrorHandlingAsync(
			this.databaseService.getDatabase(),
			'SELECT * FROM StaffAppointments WHERE weekViewId = ?',
			[id],
			SqlReadError
		)) as StaffAppointmentDbModel[];
	}

	/**
	 * Finds all staff appointments.
	 * @returns A promise that resolves to an array of all staff appointments.
	 * @throws {SqlReadError} If the query fails.
	 */
	async findAll(): Promise<StaffAppointmentDbModel[]> {
		return (await this.queryService.allWithSqlErrorHandlingAsync(
			this.databaseService.getDatabase(),
			'SELECT * FROM StaffAppointments',
			[],
			SqlReadError
		)) as StaffAppointmentDbModel[];
	}

	/**
	 * Updates a staff appointment.
	 * @param appointment The staff appointment to update.
	 * @returns A promise that resolves to the updated staff appointment.
	 * @throws {SqlUpdateError} If the query fails.
	 */
	async update(
		appointment: StaffAppointmentDbModel
	): Promise<StaffAppointmentDbModel> {
		await this.queryService.runWithSqlErrorHandlingAsync(
			this.databaseService.getDatabase(),
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
				appointment.id
			],
			SqlUpdateError
		);
		return appointment;
	}

	/**
	 * Deletes a staff appointment by its ID.
	 * @param id The ID of the staff appointment to delete.
	 * @returns A promise that resolves when the deletion is complete.
	 * @throws {SqlDeleteError} If the query fails.
	 */
	async deleteById(id: string): Promise<void> {
		await this.queryService.runWithSqlErrorHandlingAsync(
			this.databaseService.getDatabase(),
			'DELETE FROM StaffAppointments WHERE id = ?',
			[id],
			SqlDeleteError
		);
	}

	/**
	 * Deletes staff appointments by week view ID and staff ID.
	 *
	 * @param {string} staffId - The ID of the staff.
	 * @param {string} weekViewId - The ID of the week view.
	 * @returns {Promise<void>} A promise that resolves when the deletion is complete.
	 * @throws {SqlDeleteError} If the query fails.
	 */
	async deleteByWeekViewIdAndStaffId(
		staffId: string,
		weekViewId: string
	): Promise<void> {
		await this.queryService.runWithSqlErrorHandlingAsync(
			this.databaseService.getDatabase(),
			'DELETE FROM StaffAppointments WHERE staffId = ? AND weekViewId = ?',
			[staffId, weekViewId],
			SqlDeleteError
		);
	}

	async getAppointmentsByDateRange(
		startDate: string,
		endDate: string
	): Promise<StaffAppointmentDbModel[]> {
		return (await this.queryService.allWithSqlErrorHandlingAsync(
			this.databaseService.getDatabase(),
			`
				SELECT * FROM StaffAppointments
				WHERE startDate >= ? 
				AND endDate <= ? 
			`,
			[startDate, endDate],
			SqlReadError
		)) as StaffAppointmentDbModel[];
	}
}
export default StaffAppointmentRepository;
