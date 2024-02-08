import { DatabaseService } from '../../services/DatabaseService';
import IStaffRepository from './interfaces/IStaffRepository';
import StaffDbModel from '../../models/database/Staff';
import { Service } from 'typedi';
import { allAsync, getAsync, runAsync } from '../../utils/SQLiteHelper';

@Service()
class StaffRepository implements IStaffRepository {
	constructor(private databaseService: DatabaseService) {}

	async findByName(name: string): Promise<StaffDbModel | null> {
		return (await getAsync(
			this.databaseService.getDatabase(),
			'SELECT * FROM Staffs WHERE name = ?',
			[name]
		)) as StaffDbModel | null;
	}

	async create(staff: StaffDbModel): Promise<StaffDbModel> {
		await runAsync(
			this.databaseService.getDatabase(),
			'INSERT INTO Staffs (id, name, email, phoneNumber, image, color, createDate, modifyDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
			[
				staff.id,
				staff.name,
				staff.email,
				staff.phoneNumber,
				staff.image,
				staff.color,
				staff.createDate,
				staff.modifyDate
			]
		);
		return staff;
	}

	async findById(id: string): Promise<StaffDbModel | null> {
		return (await getAsync(
			this.databaseService.getDatabase(),
			'SELECT * FROM Staffs WHERE id = ?',
			[id]
		)) as StaffDbModel | null;
	}

	async findAll(): Promise<StaffDbModel[]> {
		return (await allAsync(
			this.databaseService.getDatabase(),
			'SELECT * FROM Staffs',
			[]
		)) as StaffDbModel[];
	}

	async update(staff: StaffDbModel): Promise<StaffDbModel> {
		await runAsync(
			this.databaseService.getDatabase(),
			'UPDATE Staffs SET name = ?, email = ?, phoneNumber = ?, image = ?, color = ?, modifyDate = ? WHERE id = ?',
			[
				staff.name,
				staff.email,
				staff.phoneNumber,
				staff.image,
				staff.color,
				staff.modifyDate,
				staff.id
			]
		);
		return staff;
	}

	async deleteById(id: string): Promise<void> {
		await runAsync(
			this.databaseService.getDatabase(),
			'DELETE FROM Staffs WHERE id = ?',
			[id]
		);
	}

	async deleteByName(name: string): Promise<void> {
		await runAsync(
			this.databaseService.getDatabase(),
			'DELETE FROM Staffs WHERE name = ?',
			[name]
		);
	}
}

export default StaffRepository;
