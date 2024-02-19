import { DatabaseService } from '../../services/DatabaseService';
import IStaffRepository from './interfaces/IStaffRepository';
import StaffDbModel from '../../models/database/Staff';
import { Service } from 'typedi';

import {
	SqlCreateError,
	SqlDeleteError,
	SqlReadError,
	SqlRecordExistsError,
	SqlRecordNotFoundError,
	SqlUpdateError
} from '../../models/error/Errors';
import { SQLite3QueryService } from '../../utils/SQLiteHelper';
import ErrorHandlerService from '../../services/ErrorHandlerService';

@Service()
class StaffRepository implements IStaffRepository {
	constructor(
		private databaseService: DatabaseService,
		private queryService: SQLite3QueryService,
		private errorHandlerService: ErrorHandlerService
	) {}

	async findByName(
		name: string,
		errorHandling = true
	): Promise<StaffDbModel | null> {
		const query = 'SELECT * FROM Staffs WHERE name = ?';

		const result = (await this.queryService.getWithSqlErrorHandlingAsync(
			this.databaseService.getDatabase(),
			query,
			[name],
			SqlReadError
		)) as StaffDbModel | null;

		if (result === null) {
			const sqlError = new SqlRecordNotFoundError({
				message: `Staff name "${name}" not found`,
				query: query
			});

			if (errorHandling) {
				this.errorHandlerService.handleError({
					error: sqlError,
					service: StaffRepository.name,
					query: query
				});
			}
			throw sqlError;
		}

		return result as StaffDbModel;
	}

	async create(staff: StaffDbModel): Promise<StaffDbModel> {
		try {
			if (await this.findByName(staff.name)) {
				const sqlError = new SqlRecordExistsError({
					message: `Staff name "${staff.name}" already exists`
				});

				this.errorHandlerService.handleError({
					error: sqlError,
					service: StaffRepository.name
				});

				throw sqlError;
			}
		} catch (error) {
			// If record is not found then it is okay
			if (!(error instanceof SqlRecordNotFoundError)) {
				throw error;
			}
		}

		const query =
			'INSERT INTO Staffs (id, name, email, phoneNumber, image, color, createDate, modifyDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';

		await this.queryService.runWithSqlErrorHandlingAsync(
			this.databaseService.getDatabase(),
			query,
			[
				staff.id,
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

	async findById(
		id: string,
		errorHandling = true
	): Promise<StaffDbModel | null> {
		const query = 'SELECT * FROM Staffs WHERE id = ?';

		const result = (await this.queryService.getWithSqlErrorHandlingAsync(
			this.databaseService.getDatabase(),
			query,
			[id],
			SqlReadError
		)) as StaffDbModel | null;

		if (!result) {
			const sqlError = new SqlRecordNotFoundError({
				message: `Staff id "${id}" not found`,
				query: query
			});

			if (errorHandling) {
				this.errorHandlerService.handleError({
					error: sqlError,
					service: StaffRepository.name
				});
			}

			throw sqlError;
		}

		return result as StaffDbModel;
	}

	async findAll(): Promise<StaffDbModel[]> {
		const query = 'SELECT * FROM Staffs';

		return (await this.queryService.allWithSqlErrorHandlingAsync(
			this.databaseService.getDatabase(),
			query,
			[],
			SqlReadError
		)) as StaffDbModel[];
	}

	async update(staff: StaffDbModel): Promise<StaffDbModel> {
		try {
			await this.findById(staff.id, false);
		} catch (error) {
			if (!(error instanceof SqlRecordNotFoundError)) {
				throw error;
			}
		}

		const query =
			'UPDATE Staffs SET name = ?, email = ?, phoneNumber = ?, image = ?, color = ?, modifyDate = ? WHERE id = ?';
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
				staff.id
			],
			SqlUpdateError
		);

		// Return the updated staff
		return (await this.findById(staff.id)) as StaffDbModel;
	}

	async deleteById(id: string): Promise<void> {
		try {
			await this.findById(id, false);
		} catch (error) {
			if (!(error instanceof SqlRecordNotFoundError)) {
				throw error;
			}
		}

		const query = 'DELETE FROM Staffs WHERE id = ?';

		await this.queryService.runWithSqlErrorHandlingAsync(
			this.databaseService.getDatabase(),
			query,
			[id],
			SqlDeleteError
		);
	}

	async deleteByName(name: string): Promise<void> {
		try {
			await this.findByName(name, false);
		} catch (error) {
			if (!(error instanceof SqlRecordNotFoundError)) {
				throw error;
			}
		}

		const query = 'DELETE FROM Staffs WHERE name = ?';

		await this.queryService.runWithSqlErrorHandlingAsync(
			this.databaseService.getDatabase(),
			query,
			[name],
			SqlDeleteError
		);
	}
}

export default StaffRepository;
