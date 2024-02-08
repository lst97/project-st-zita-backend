import { DatabaseService } from '../../services/DatabaseService';
import IStaffRepository from './interfaces/IStaffRepository';
import StaffDbModel from '../../models/database/Staff';
import { Service } from 'typedi';

@Service()
class StaffRepository implements IStaffRepository {
	constructor(private databaseService: DatabaseService) {}

	async findByName(name: string): Promise<StaffDbModel | null> {
		return new Promise((resolve, reject) => {
			const db = this.databaseService.getDatabase();
			db.get(
				'SELECT * FROM Staffs WHERE name = ?',
				[name],
				(err, row: StaffDbModel | undefined) => {
					if (err) {
						reject(err);
					} else if (row) {
						resolve(row);
					} else {
						resolve(null);
					}
				}
			);
		});
	}

	async create(staff: StaffDbModel): Promise<StaffDbModel> {
		return new Promise((resolve, reject) => {
			const db = this.databaseService.getDatabase();
			db.run(
				'INSERT INTO Staffs (id, name, email, phoneNumber, image, color, createDate, modifyDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
				[
					staff.id,
					staff.name,
					staff.email,
					staff.phoneNumber,
					staff.image,
					staff.color
				],
				(err) => {
					if (err) {
						reject(err);
					} else {
						resolve(staff);
					}
				}
			);
		});
	}

	async findById(id: string): Promise<StaffDbModel | null> {
		return new Promise((resolve, reject) => {
			const db = this.databaseService.getDatabase();
			db.get(
				'SELECT * FROM Staffs WHERE id = ?',
				[id],
				(err, row: StaffDbModel | undefined) => {
					if (err) {
						reject(err);
					} else if (row) {
						resolve(row);
					} else {
						resolve(null);
					}
				}
			);
		});
	}

	async findAll(): Promise<StaffDbModel[]> {
		return new Promise((resolve, reject) => {
			const db = this.databaseService.getDatabase();
			db.all('SELECT * FROM Staffs', (err, rows: StaffDbModel[]) => {
				if (err) {
					reject(err);
				} else {
					resolve(rows);
				}
			});
		});
	}

	async update(staff: StaffDbModel): Promise<StaffDbModel> {
		return new Promise((resolve, reject) => {
			const db = this.databaseService.getDatabase();
			db.run(
				'UPDATE Staffs SET name = ?, email = ?, phoneNumber = ?, image = ?, color = ?, modifyDate = ? WHERE id = ?',
				[
					staff.name,
					staff.email,
					staff.phoneNumber,
					staff.image,
					staff.color,
					staff.modifyDate,
					staff.id
				],
				(err) => {
					if (err) {
						reject(err);
					} else {
						resolve(staff);
					}
				}
			);
		});
	}

	async deleteById(id: string): Promise<void> {
		return new Promise((resolve, reject) => {
			const db = this.databaseService.getDatabase();
			db.run('DELETE FROM Staffs WHERE id = ?', [id], (err) => {
				if (err) {
					reject(err);
				} else {
					resolve();
				}
			});
		});
	}

	async deleteByName(name: string): Promise<void> {
		return new Promise((resolve, reject) => {
			const db = this.databaseService.getDatabase();
			db.run('DELETE FROM Staffs WHERE name = ?', [name], (err) => {
				if (err) {
					reject(err);
				} else {
					resolve();
				}
			});
		});
	}
}

export default StaffRepository;
