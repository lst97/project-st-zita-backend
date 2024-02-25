import {
	DatabaseService,
	SQLite3QueryService
} from '../../services/DatabaseService';
import { Service } from 'typedi';
import ISharedAppointmentLinkRepository from './interfaces/ISharedAppointmentLinkRepository';
import SharedAppointmentLinkDbModel from '../../models/database/SharedLink';
import {
	SqlCreateError,
	SqlDeleteError,
	SqlReadError,
	SqlUpdateError
} from '../../models/error/Errors';

@Service()
class SharedAppointmentLinkRepository
	implements ISharedAppointmentLinkRepository
{
	constructor(
		private databaseService: DatabaseService,
		private queryService: SQLite3QueryService
	) {}

	/**
	 * Creates a new shared appointment link in the database.
	 *
	 * @param link - The shared appointment link to be created.
	 * @returns The created shared appointment link.
	 * @throws {SqlCreateError} If the query fails.
	 */
	async create(
		link: SharedAppointmentLinkDbModel
	): Promise<SharedAppointmentLinkDbModel> {
		await this.queryService.runWithSqlErrorHandlingAsync(
			this.databaseService.getDatabase(),
			'INSERT INTO SharedAppointmentLinks (id, userId, weekViewId, expiry, permission, createDate, modifyDate) VALUES (?, ?, ?, ?, ?, ?, ?)',
			[
				link.id,
				link.userId,
				link.weekViewId,
				link.expiry,
				link.permission,
				link.createDate,
				link.modifyDate
			],
			SqlCreateError
		);
		return link;
	}

	/**
	 * Finds a shared appointment link by its ID.
	 *
	 * @param id - The ID of the shared appointment link.
	 * @returns A promise that resolves to the found shared appointment link or null if not found.
	 * @throws {SqlReadError} If the query fails.
	 */
	async findById(id: string): Promise<SharedAppointmentLinkDbModel | null> {
		return (await this.queryService.getWithSqlErrorHandlingAsync(
			this.databaseService.getDatabase(),
			'SELECT * FROM SharedAppointmentLinks WHERE id = ?',
			[id],
			SqlReadError
		)) as SharedAppointmentLinkDbModel | null;
	}

	/**
	 * Finds all shared appointment links in the database.
	 *
	 * @returns A promise that resolves to an array of all shared appointment links.
	 * @throws {SqlReadError} If the query fails.
	 */
	async findAll(): Promise<SharedAppointmentLinkDbModel[]> {
		return (await this.queryService.allWithSqlErrorHandlingAsync(
			this.databaseService.getDatabase(),
			'SELECT * FROM SharedAppointmentLinks',
			[],
			SqlReadError
		)) as SharedAppointmentLinkDbModel[];
	}

	/**
	 * Finds all shared appointment links by their ID.
	 *
	 * @param linkId - The ID of the shared appointment link.
	 * @returns A promise that resolves to the found shared appointment link or null if not found.
	 * @throws {SqlReadError} If the query fails.
	 */
	async findAllById(linkId: string) {
		return (await this.queryService.allWithSqlErrorHandlingAsync(
			this.databaseService.getDatabase(),
			'SELECT * FROM SharedAppointmentLinks WHERE id = ?',
			[linkId],
			SqlReadError
		)) as SharedAppointmentLinkDbModel[];
	}

	/**
	 * Updates a shared appointment link in the database.
	 *
	 * @param link - The shared appointment link to be updated.
	 * @returns The updated shared appointment link.
	 * @throws {SqlUpdateError} If the query fails.
	 */
	async update(
		staff: SharedAppointmentLinkDbModel
	): Promise<SharedAppointmentLinkDbModel> {
		await this.queryService.runWithSqlErrorHandlingAsync(
			this.databaseService.getDatabase(),
			'UPDATE SharedAppointmentLinks SET userId = ?, weekViewId = ?, expiry = ?, permission = ?, createDate = ?, modifyDate = ? WHERE id = ?',
			[
				staff.userId,
				staff.weekViewId,
				staff.expiry,
				staff.permission,
				staff.createDate,
				staff.modifyDate,
				staff.id
			],
			SqlUpdateError
		);
		return staff;
	}

	/**
	 * Deletes a shared appointment link from the database.
	 *
	 * @param id - The ID of the shared appointment link to be deleted.
	 * @returns A promise that resolves when the shared appointment link has been deleted.
	 * @throws {SqlDeleteError} If the query fails.
	 */
	async deleteById(id: string): Promise<void> {
		await this.queryService.runWithSqlErrorHandlingAsync(
			this.databaseService.getDatabase(),
			'DELETE FROM SharedAppointmentLinks WHERE id = ?',
			[id],
			SqlDeleteError
		);
	}

	/**
	 * Finds all shared appointment links by their user ID.
	 *
	 * @param userId - The ID of the user.
	 * @returns A promise that resolves to an array of all shared appointment links.
	 * @throws {SqlReadError} If the query fails.
	 */
	async findAllByUserId(userId: string) {
		return (await this.queryService.allWithSqlErrorHandlingAsync(
			this.databaseService.getDatabase(),
			'SELECT * FROM SharedAppointmentLinks WHERE userId = ?',
			[userId],
			SqlReadError
		)) as SharedAppointmentLinkDbModel[];
	}

	/**
	 * Finds all shared appointment links by their week view ID.
	 *
	 * @param weekViewId - The ID of the week view.
	 * @returns A promise that resolves to an array of all shared appointment links.
	 * @throws {SqlReadError} If the query fails.
	 */
	async createManyByWeekViewIds(
		links: SharedAppointmentLinkDbModel[]
	): Promise<SharedAppointmentLinkDbModel[]> {
		await this.queryService.runWithSqlErrorHandlingAsync(
			this.databaseService.getDatabase(),
			`
	  INSERT INTO SharedAppointmentLinks (id, userId, weekViewId, expiry, permission, createDate, modifyDate)
	  VALUES ${links.map(() => '(?, ?, ?, ?, ?, ?, ?)').join(', ')}
	`,
			links.flatMap((link) => [
				link.id,
				link.userId,
				link.weekViewId,
				link.expiry,
				link.permission,
				link.createDate,
				link.modifyDate
			]),
			SqlCreateError
		);
		return links;
	}

	/**
	 * Finds all shared appointment links by their week view ID.
	 *
	 * @param weekViewId - The ID of the week view.
	 * @returns A promise that resolves to an array of all shared appointment links.
	 * @throws {SqlReadError} If the query fails.
	 */
	async findByUserId(userId: string) {
		return (await this.queryService.getWithSqlErrorHandlingAsync(
			this.databaseService.getDatabase(),
			'SELECT * FROM SharedAppointmentLinks WHERE userId = ?',
			[userId],
			SqlReadError
		)) as SharedAppointmentLinkDbModel | null;
	}
}

export default SharedAppointmentLinkRepository;
