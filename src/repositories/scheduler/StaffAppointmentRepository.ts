import IStaffAppointmentRepository from './interfaces/IStaffAppointmentRepository';
import StaffAppointmentDbModel from '../../models/database/StaffAppointment';
import { Service } from 'typedi';
import { DatabaseService } from '../../services/DatabaseService';

@Service()
class StaffAppointmentRepository implements IStaffAppointmentRepository {
	constructor(private databaseService: DatabaseService) {}
	async findById(id: string): Promise<StaffAppointmentDbModel | null> {
		return new Promise((resolve, reject) => {
			const db = this.databaseService.getDatabase();
			db.get(
				'SELECT * FROM StaffAppointments WHERE id = ?',
				[id],
				(err, row: StaffAppointmentDbModel | undefined) => {
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

	private async createAppointment(
		appointment: StaffAppointmentDbModel
	): Promise<boolean | Error> {
		return new Promise((resolve, reject) => {
			const db = this.databaseService.getDatabase();
			db.run(
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
				],
				(err) => {
					if (err) {
						reject(err);
					} else {
						resolve(true);
					}
				}
			);
		});
	}

	private async createManyAppointments(
		appointments: StaffAppointmentDbModel[]
	): Promise<boolean | Error> {
		return new Promise((resolve, reject) => {
			const db = this.databaseService.getDatabase();
			const placeholders = appointments
				.map(() => '(?, ?, ?, ?, ?, ?)')
				.join(', ');
			const values = appointments.flatMap((appointment) => [
				appointment.id,
				appointment.staffId,
				appointment.weekViewId,
				appointment.startDate,
				appointment.endDate,
				appointment.location
			]);

			db.run(
				`
          INSERT INTO StaffAppointments (id, staffId, weekViewId, startDate, endDate, location)
          VALUES ${placeholders}
        `,
				values,
				(err) => {
					if (err) {
						reject(err);
					} else {
						resolve(true);
					}
				}
			);
		});
	}

	async create(
		appointment: StaffAppointmentDbModel
	): Promise<StaffAppointmentDbModel> {
		await this.createAppointment(appointment);
		return appointment;
	}

	async createMany(
		appointments: StaffAppointmentDbModel[]
	): Promise<StaffAppointmentDbModel[]> {
		await this.createManyAppointments(appointments);
		return appointments;
	}

	async getAllWeekViewIdsByStaffId(staffId: string): Promise<string[]> {
		return new Promise((resolve, reject) => {
			const db = this.databaseService.getDatabase();
			db.all(
				`
          SELECT weekViewId FROM StaffAppointments WHERE staffId = ?
        `,
				[staffId],
				(err, rows: { weekViewId: string }[]) => {
					if (err) {
						reject(err);
					} else {
						resolve(rows.map((row) => row.weekViewId));
					}
				}
			);
		});
	}

	async findByWeekViewId(id: string): Promise<StaffAppointmentDbModel[]> {
		return new Promise((resolve, reject) => {
			const db = this.databaseService.getDatabase();
			db.all(
				'SELECT * FROM StaffAppointments WHERE weekViewId = ?',
				[id],
				(err, rows: StaffAppointmentDbModel[]) => {
					if (err) {
						reject(err);
					} else {
						resolve(rows);
					}
				}
			);
		});
	}

	async findAll(): Promise<StaffAppointmentDbModel[]> {
		return new Promise((resolve, reject) => {
			const db = this.databaseService.getDatabase();
			db.all(
				'SELECT * FROM StaffAppointments',
				(err, rows: StaffAppointmentDbModel[]) => {
					if (err) {
						reject(err);
					} else {
						resolve(rows);
					}
				}
			);
		});
	}

	async update(
		appointment: StaffAppointmentDbModel
	): Promise<StaffAppointmentDbModel> {
		return new Promise((resolve, reject) => {
			const db = this.databaseService.getDatabase();
			db.run(
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
				],
				(err) => {
					if (err) {
						reject(err);
					} else {
						resolve(appointment);
					}
				}
			);
		});
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
