import {
	DatabaseService,
	allAsync,
	getAsync,
	runAsync
} from '../../services/DatabaseService';
import { Service } from 'typedi';
import IUserRepository from './interfaces/IUserRepository';
import UserDbModel from '../../models/database/User';

@Service()
class UserRepository implements IUserRepository {
	constructor(private databaseService: DatabaseService) {}
	async findByEmail(email: string): Promise<UserDbModel | null> {
		return (await getAsync(
			this.databaseService.getDatabase(),
			'SELECT * FROM Users WHERE email = ?',
			[email]
		)) as UserDbModel | null;
	}

	async create(user: UserDbModel): Promise<UserDbModel> {
		await runAsync(
			this.databaseService.getDatabase(),
			'INSERT INTO Staffs (id, username, email, passwordHash, color, image, createDate, modifyDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
			[
				user.id,
				user.username,
				user.email,
				user.passwordHash,
				user.color,
				user.image,
				user.createDate,
				user.modifyDate
			]
		);
		return user;
	}

	async findById(id: string): Promise<UserDbModel | null> {
		return (await getAsync(
			this.databaseService.getDatabase(),
			'SELECT * FROM Users WHERE id = ?',
			[id]
		)) as UserDbModel | null;
	}

	async findAll(): Promise<UserDbModel[]> {
		return (await allAsync(
			this.databaseService.getDatabase(),
			'SELECT * FROM Users',
			[]
		)) as UserDbModel[];
	}

	async update(user: UserDbModel): Promise<UserDbModel> {
		await runAsync(
			this.databaseService.getDatabase(),
			'UPDATE Users SET username = ?, email = ?, passwordHash = ?, color = ?, image = ?, modifyDate = ? WHERE id = ?',
			[
				user.username,
				user.email,
				user.passwordHash,
				user.color,
				user.image,
				user.modifyDate,
				user.id
			]
		);
		return user;
	}

	async deleteById(id: string): Promise<void> {
		await runAsync(
			this.databaseService.getDatabase(),
			'DELETE FROM Users WHERE id = ?',
			[id]
		);
	}
}

export default UserRepository;
