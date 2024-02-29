import {
	DatabaseService,
	SQLite3QueryService
} from '../../services/DatabaseService';
import IStaffRepository from './interfaces/IStaffRepository';
import StaffDbModel from '../../models/database/Staff';
import { Service } from 'typedi';

import {
	SqlCreateError,
	SqlDeleteError,
	SqlReadError,
	SqlUpdateError
} from '../../models/error/Errors';

@Service()
class StaffRepository implements IStaffRepository {
	constructor(
		private databaseService: DatabaseService,
		private queryService: SQLite3QueryService
	) {}

	/**
	 * Finds a staff member by their name.
	 * @param name - The name of the staff member to find.
	 * @returns A promise that resolves to the found staff member or null if not found.
	 * @throws {SqlReadError} If the query fails.
	 */
	async findByName(
		name: string,
		userId: string
	): Promise<StaffDbModel | null> {
		const query = 'SELECT * FROM Staffs WHERE name = ? AND userId = ?';

		return (await this.queryService.getWithSqlErrorHandlingAsync(
			this.databaseService.getDatabase(),
			query,
			[name, userId],
			SqlReadError
		)) as StaffDbModel | null;
	}

	/**
	 * Creates a new staff member.
	 * @param staff - The staff member to create.
	 * @returns A promise that resolves to the created staff member.
	 * @throws {SqlCreateError} If the query fails.
	 */
	async create(staff: StaffDbModel, userId: string): Promise<StaffDbModel> {
		// const query =
		// 	'INSERT INTO Staffs (id, name, email, phoneNumber, image, color, createDate, modifyDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';

		const query = `INSERT INTO Staffs (id, userId, name, email, phoneNumber, image, color, createDate, modifyDate, userId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

		await this.queryService.runWithSqlErrorHandlingAsync(
			this.databaseService.getDatabase(),
			query,
			[
				staff.id,
				userId,
				staff.name,
				staff.email,
				staff.phoneNumber,
				staff.image,
				staff.color,
				staff.createDate,
				staff.modifyDate
			],
			SqlCreateError
		);
		return staff;
	}

	/**
	 * Finds a staff member by their ID.
	 * @param id - The ID of the staff member to find.
	 * @returns A promise that resolves to the found staff member or null if not found.
	 * @throws {SqlReadError} If the query fails.
	 */
	async findById(id: string, userId: string): Promise<StaffDbModel | null> {
		const query = 'SELECT * FROM Staffs WHERE id = ? AND userId = ?';

		return (await this.queryService.getWithSqlErrorHandlingAsync(
			this.databaseService.getDatabase(),
			query,
			[id, userId],
			SqlReadError
		)) as StaffDbModel | null;
	}

	/**
	 * Finds all staff members.
	 * @returns A promise that resolves to an array of all staff members.
	 * @throws {SqlReadError} If the query fails.
	 */
	async findAll(userId: string): Promise<StaffDbModel[]> {
		const query = 'SELECT * FROM Staffs WHERE userId = ?';

		return (await this.queryService.allWithSqlErrorHandlingAsync(
			this.databaseService.getDatabase(),
			query,
			[userId],
			SqlReadError
		)) as StaffDbModel[];
	}

	/**
	 * Updates a staff member.
	 * @param staff - The staff member to update.
	 * @returns A promise that resolves to the updated staff member.
	 * @throws {SqlUpdateError} If the query fails.
	 */
	async update(staff: StaffDbModel, userId: string): Promise<StaffDbModel> {
		const query =
			'UPDATE Staffs SET name = ?, email = ?, phoneNumber = ?, image = ?, color = ?, modifyDate = ? WHERE id = ? AND userId = ?';
		await this.queryService.runWithSqlErrorHandlingAsync(
			this.databaseService.getDatabase(),
			query,
			[
				staff.name,
				staff.email,
				staff.phoneNumber,
				staff.image,
				staff.color,
				staff.modifyDate,
				staff.id,
				userId
			],
			SqlUpdateError
		);

		// Return the updated staff
		return (await this.findById(staff.id, userId)) as StaffDbModel;
	}

	/**
	 * Deletes a staff member by their ID.
	 * @param id - The ID of the staff member to delete.
	 * @returns A promise that resolves when the staff member is deleted.
	 * @throws {SqlDeleteError} If the query fails.
	 */
	async deleteById(id: string, userId: string): Promise<void> {
		// try {
		// 	await this.findById(id);
		// } catch (error) {
		// 	if (!(error instanceof SqlRecordNotFoundError)) {
		// 		throw error;
		// 	}
		// }

		const query = 'DELETE FROM Staffs WHERE id = ? AND userId = ?';

		await this.queryService.runWithSqlErrorHandlingAsync(
			this.databaseService.getDatabase(),
			query,
			[id, userId],
			SqlDeleteError
		);
	}

	/**
	 * Deletes a staff member by their name.
	 * @param name - The name of the staff member to delete.
	 * @returns A promise that resolves when the staff member is deleted.
	 * @throws {SqlDeleteError} If the query fails.
	 */
	async deleteByName(name: string, userId: string): Promise<void> {
		const query = 'DELETE FROM Staffs WHERE name = ? AND userId = ?';

		await this.queryService.runWithSqlErrorHandlingAsync(
			this.databaseService.getDatabase(),
			query,
			[name, userId],
			SqlDeleteError
		);
	}
}

export default StaffRepository;
