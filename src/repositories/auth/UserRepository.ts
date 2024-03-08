import {
	DatabaseService,
	SQLite3QueryService
} from '../../services/DatabaseService';
import { Service } from 'typedi';
import IUserRepository from './interfaces/IUserRepository';
import UserDbModel from '../../models/database/User';
import {
	SqlCreateError,
	SqlDeleteError,
	SqlReadError,
	SqlUpdateError
} from '@lst97/common_response/src/';

@Service()
class UserRepository implements IUserRepository {
	constructor(
		private databaseService: DatabaseService,
		private queryService: SQLite3QueryService
	) {}
	async findByEmail(email: string): Promise<UserDbModel | null> {
		return (await this.queryService.getWithSqlErrorHandlingAsync(
			this.databaseService.getDatabase(),
			'SELECT * FROM Users WHERE email = ?',
			[email],
			SqlReadError
		)) as UserDbModel | null;
	}

	async create(user: UserDbModel): Promise<UserDbModel> {
		await this.queryService.runWithSqlErrorHandlingAsync(
			this.databaseService.getDatabase(),
			'INSERT INTO Users (id, firstName, lastName, email, passwordHash, color, image, createDate, modifyDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
			[
				user.id,
				user.firstName,
				user.lastName,
				user.email,
				user.passwordHash,
				user.color,
				user.image,
				user.createDate,
				user.modifyDate
			],
			SqlCreateError
		);
		return user;
	}

	async findById(id: string): Promise<UserDbModel | null> {
		return (await this.queryService.getWithSqlErrorHandlingAsync(
			this.databaseService.getDatabase(),
			'SELECT * FROM Users WHERE id = ?',
			[id],
			SqlReadError
		)) as UserDbModel | null;
	}

	async findAll(): Promise<UserDbModel[]> {
		return (await this.queryService.allWithSqlErrorHandlingAsync(
			this.databaseService.getDatabase(),
			'SELECT * FROM Users',
			[],
			SqlReadError
		)) as UserDbModel[];
	}

	async update(user: UserDbModel): Promise<UserDbModel> {
		await this.queryService.runWithSqlErrorHandlingAsync(
			this.databaseService.getDatabase(),
			'UPDATE Users SET firstName = ?, lastName = ?, email = ?, passwordHash = ?, color = ?, image = ?, modifyDate = ? WHERE id = ?',
			[
				user.firstName,
				user.lastName,
				user.email,
				user.passwordHash,
				user.color,
				user.image,
				user.modifyDate,
				user.id
			],
			SqlUpdateError
		);
		return user;
	}

	async deleteById(id: string): Promise<void> {
		await this.queryService.runWithSqlErrorHandlingAsync(
			this.databaseService.getDatabase(),
			'DELETE FROM Users WHERE id = ?',
			[id],
			SqlDeleteError
		);
	}
}

export default UserRepository;
