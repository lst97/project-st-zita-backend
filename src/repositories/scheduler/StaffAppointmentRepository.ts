import IStaffAppointmentRepository from './interfaces/IStaffAppointmentRepository';
import StaffAppointmentDbModel from '../../models/database/StaffAppointment';
import { Service } from 'typedi';
import {
	DatabaseService,
	allAsync,
	getAsync,
	runAsync
} from '../../services/DatabaseService';

@Service()
class StaffAppointmentRepository implements IStaffAppointmentRepository {
	constructor(private databaseService: DatabaseService) {}
	async findById(id: string): Promise<StaffAppointmentDbModel | null> {
		return (await getAsync(
			this.databaseService.getDatabase(),
			'SELECT * FROM StaffAppointments WHERE id = ?',
			[id]
		)) as StaffAppointmentDbModel | null;
	}

	async create(
		appointment: StaffAppointmentDbModel
	): Promise<StaffAppointmentDbModel> {
		await runAsync(
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
			]
		);
		return appointment;
	}

	async createMany(
		appointments: StaffAppointmentDbModel[]
	): Promise<StaffAppointmentDbModel[]> {
		await runAsync(
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
			])
		);
		return appointments;
	}

	async getAllWeekViewIdsByStaffId(staffId: string): Promise<string[]> {
		return (
			await allAsync(
				this.databaseService.getDatabase(),
				`
		SELECT weekViewId FROM StaffAppointments WHERE staffId = ?
	  `,
				[staffId]
			)
		).map((row) => row.weekViewId);
	}

	async findByWeekViewId(id: string): Promise<StaffAppointmentDbModel[]> {
		return (await allAsync(
			this.databaseService.getDatabase(),
			'SELECT * FROM StaffAppointments WHERE weekViewId = ?',
			[id]
		)) as StaffAppointmentDbModel[];
	}

	async findAll(): Promise<StaffAppointmentDbModel[]> {
		return (await allAsync(
			this.databaseService.getDatabase(),
			'SELECT * FROM StaffAppointments',
			[]
		)) as StaffAppointmentDbModel[];
	}

	async update(
		appointment: StaffAppointmentDbModel
	): Promise<StaffAppointmentDbModel> {
		await runAsync(
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
			]
		);
		return appointment;
	}

	async deleteById(id: string): Promise<void> {
		return new Promise((resolve, reject) => {
			const db = this.databaseService.getDatabase();
			db.run(
				'DELETE FROM StaffAppointments WHERE id = ?',
				[id],
				(err) => {
					if (err) {
						reject(err);
					} else {
						resolve();
					}
				}
			);
		});
	}

	async deleteByWeekViewIdAndStaffId(
		staffId: string,
		weekViewId: string
	): Promise<void> {
		return new Promise((resolve, reject) => {
			const db = this.databaseService.getDatabase();
			db.run(
				'DELETE FROM StaffAppointments WHERE weekViewId = ? AND staffId = ?',
				[weekViewId, staffId],
				(err) => {
					if (err) {
						reject(err);
					} else {
						resolve();
					}
				}
			);
		});
	}
}
export default StaffAppointmentRepository;
