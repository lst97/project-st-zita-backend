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

	async findByName(name: string): Promise<StaffDbModel | null> {
		const query = 'SELECT * FROM Staffs WHERE name = ?';

		return (await this.queryService.getWithSqlErrorHandlingAsync(
			this.databaseService.getDatabase(),
			query,
			[name],
			SqlReadError
		)) as StaffDbModel | null;
	}

	async create(staff: StaffDbModel): Promise<StaffDbModel> {
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

	async findById(id: string): Promise<StaffDbModel | null> {
		const query = 'SELECT * FROM Staffs WHERE id = ?';

		return (await this.queryService.getWithSqlErrorHandlingAsync(
			this.databaseService.getDatabase(),
			query,
			[id],
			SqlReadError
		)) as StaffDbModel | null;
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
		// try {
		// 	await this.findById(id);
		// } catch (error) {
		// 	if (!(error instanceof SqlRecordNotFoundError)) {
		// 		throw error;
		// 	}
		// }

		const query = 'DELETE FROM Staffs WHERE id = ?';

		await this.queryService.runWithSqlErrorHandlingAsync(
			this.databaseService.getDatabase(),
			query,
			[id],
			SqlDeleteError
		);
	}

	async deleteByName(name: string): Promise<void> {
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
