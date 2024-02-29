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
	async findById(
		id: string,
		userId: string
	): Promise<StaffAppointmentDbModel | null> {
		return (await this.queryService.getWithSqlErrorHandlingAsync(
			this.databaseService.getDatabase(),
			'SELECT * FROM StaffAppointments WHERE id = ? AND userId = ?',
			[id, userId],
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
		appointment: StaffAppointmentDbModel,
		userId: string
	): Promise<StaffAppointmentDbModel> {
		await this.queryService.runWithSqlErrorHandlingAsync(
			this.databaseService.getDatabase(),
			`
			INSERT INTO StaffAppointments (id, userId, staffId, weekViewId, startDate, endDate, location)
			VALUES (?, ?, ?, ?, ?, ?, ?)
		`,
			[
				appointment.id,
				userId,
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
		appointments: StaffAppointmentDbModel[],
		userId: string
	): Promise<StaffAppointmentDbModel[]> {
		await this.queryService.runWithSqlErrorHandlingAsync(
			this.databaseService.getDatabase(),
			`
			INSERT INTO StaffAppointments (id, userId, staffId, weekViewId, startDate, endDate, location)
			VALUES ${appointments.map(() => '(?, ?, ?, ?, ?, ?, ?)').join(', ')}
		`,
			appointments.flatMap((appointment) => [
				appointment.id,
				userId,
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
	async getAllWeekViewIdsByStaffId(
		staffId: string,
		userId: string
	): Promise<string[]> {
		return (
			(await this.queryService.allWithSqlErrorHandlingAsync(
				this.databaseService.getDatabase(),
				`
		SELECT weekViewId FROM StaffAppointments WHERE staffId = ? AND userId = ?
		`,
				[staffId, userId],
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
	async findByWeekViewId(
		id: string,
		userId: string
	): Promise<StaffAppointmentDbModel[]> {
		return (await this.queryService.allWithSqlErrorHandlingAsync(
			this.databaseService.getDatabase(),
			'SELECT * FROM StaffAppointments WHERE weekViewId = ? AND userId = ?',
			[id, userId],
			SqlReadError
		)) as StaffAppointmentDbModel[];
	}

	/**
	 * Finds all staff appointments.
	 * @returns A promise that resolves to an array of all staff appointments.
	 * @throws {SqlReadError} If the query fails.
	 */
	async findAll(userId: string): Promise<StaffAppointmentDbModel[]> {
		return (await this.queryService.allWithSqlErrorHandlingAsync(
			this.databaseService.getDatabase(),
			'SELECT * FROM StaffAppointments WHERE userId = ?',
			[userId],
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
		appointment: StaffAppointmentDbModel,
		userId: string
	): Promise<StaffAppointmentDbModel> {
		await this.queryService.runWithSqlErrorHandlingAsync(
			this.databaseService.getDatabase(),
			`
				UPDATE StaffAppointments SET staffId = ?, weekViewId = ?, startDate = ?, endDate = ?, location = ?, modifyDate = ?
				WHERE id = ? AND userId = ?
			`,
			[
				appointment.staffId,
				appointment.weekViewId,
				appointment.startDate,
				appointment.endDate,
				appointment.location,
				new Date().toISOString(),
				appointment.id,
				userId
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
	async deleteById(id: string, userId: string): Promise<void> {
		await this.queryService.runWithSqlErrorHandlingAsync(
			this.databaseService.getDatabase(),
			'DELETE FROM StaffAppointments WHERE id = ? AND userId = ?',
			[id, userId],
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
		weekViewId: string,
		userId: string
	): Promise<void> {
		await this.queryService.runWithSqlErrorHandlingAsync(
			this.databaseService.getDatabase(),
			'DELETE FROM StaffAppointments WHERE staffId = ? AND weekViewId = ? AND userId = ?',
			[staffId, weekViewId, userId],
			SqlDeleteError
		);
	}

	async getAppointmentsByDateRange(
		startDate: string,
		endDate: string,
		userId: string
	): Promise<StaffAppointmentDbModel[]> {
		return (await this.queryService.allWithSqlErrorHandlingAsync(
			this.databaseService.getDatabase(),
			`
				SELECT * FROM StaffAppointments
				WHERE startDate >= ? 
				AND endDate <= ? 
				AND userId = ?
			`,
			[startDate, endDate, userId],
			SqlReadError
		)) as StaffAppointmentDbModel[];
	}
}
export default StaffAppointmentRepository;
