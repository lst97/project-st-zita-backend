import { CreateStaffForm } from '../../models/forms/scheduler/CreateStaffForm';
import StaffDbModel from '../../models/database/Staff';
import StaffRepository from '../../repositories/scheduler/StaffRepository';
import StaffDataSharedModel from '../../models/share/scheduler/StaffData';
import { Service } from 'typedi';
import ErrorHandlerService from '../ErrorHandlerService';
import {
	SqlRecordExistsError,
	SqlRecordNotFoundError
} from '../../models/error/Errors';
import { StaffAppointmentService } from './StaffAppointmentService';
import { SQLite3QueryService } from '../DatabaseService';

@Service()
class StaffService {
	constructor(
		private staffRepository: StaffRepository,
		private appointmentService: StaffAppointmentService,
		private errorHandlerService: ErrorHandlerService,
		private dbQueryService: SQLite3QueryService
	) {}

	/**
	 * Creates a new staff member.
	 *
	 * @param staffForm - The form data for creating a staff member.
	 * @returns A promise that resolves to the created staff member.
	 * @throws {SqlRecordExistsError} If a staff member with the same name already exists.
	 * @throws {DatabaseError} If an unknown database error occurs.
	 */
	public async create(staffForm: CreateStaffForm): Promise<StaffDbModel> {
		if (await this.staffRepository.findByName(staffForm.staffName)) {
			const sqlError = new SqlRecordExistsError({
				message: `Staff name "${staffForm.staffName}" already exists`
			});

			this.errorHandlerService.handleError({
				error: sqlError,
				service: StaffRepository.name
			});

			throw sqlError;
		}

		const staff = new StaffDbModel({
			name: staffForm.staffName,
			email: staffForm.email,
			phoneNumber: staffForm.phoneNumber,
			image: staffForm.image,
			color: staffForm.color
		});
		await this.staffRepository.create(staff);
		return staff;
	}

	/**
	 * Deletes a staff member by their name.
	 * @param name - The name of the staff member to delete.
	 * @returns A Promise that resolves when the staff member is successfully deleted.
	 * @throws {SqlRecordNotFoundError} If the staff member with the given name is not found.
	 */
	public async deleteByName(name: string): Promise<void> {
		let db = null;
		try {
			const staffDbModel = await this.staffRepository.findByName(name);
			if (staffDbModel === null) {
				const sqlError = new SqlRecordNotFoundError({
					message: `Staff name "${name}" not found`
				});

				this.errorHandlerService.handleError({
					error: sqlError,
					service: StaffService.name
				});

				throw sqlError;
			}

			db = await this.dbQueryService.beginTransactionAsync();
			await this.appointmentService.deleteAllAppointmentsByStaffName(
				name
			);
			await this.staffRepository.deleteByName(name);
			await this.dbQueryService.commitTransactionAsync(db);
		} catch (error) {
			if (db) {
				await this.dbQueryService.rollbackTransactionAsync(db);
			}
		}
	}

	/**
	 * Updates a staff member in the database.
	 * @param staff - The staff member to update.
	 * @returns The updated staff member.
	 * @throws {SqlRecordNotFoundError} If the staff member with the given ID is not found.
	 */
	public async updateStaff(staff: StaffDbModel): Promise<StaffDbModel> {
		const staffDbModel = await this.staffRepository.findById(staff.id);

		if (staffDbModel === null) {
			const sqlError = new SqlRecordNotFoundError({
				message: `Staff id "${staff.id}" not found`
			});

			this.errorHandlerService.handleError({
				error: sqlError,
				service: StaffService.name
			});

			throw sqlError;
		}

		return await this.staffRepository.update(staff);
	}

	/**
	 * Retrieves all staff data.
	 * @returns A promise that resolves to an array of StaffDataSharedModel objects.
	 * @throws {DatabaseError} If an unknown database error occurs.
	 */
	public async getAll(): Promise<StaffDataSharedModel[]> {
		let staffs = await this.staffRepository.findAll();
		return staffs.map((staff) => {
			return new StaffDataSharedModel({
				id: staff.id,
				name: staff.name,
				email: staff.email,
				phoneNumber: staff.phoneNumber,
				image: staff.image,
				color: staff.color
			});
		});
	}

	/**
	 * Retrieves a staff member by their name.
	 * @param name - The name of the staff member to retrieve.
	 * @returns A promise that resolves to the staff member.
	 * @throws {SqlRecordNotFoundError} If the staff member with the given name is not found.
	 */
	public async getIdByName(name: string): Promise<string> {
		const staff = await this.staffRepository.findByName(name);
		if (staff === null) {
			const sqlError = new SqlRecordNotFoundError({
				message: `Staff name "${name}" not found`
			});

			this.errorHandlerService.handleError({
				error: sqlError,
				service: StaffService.name
			});

			throw sqlError;
		}
		return staff.id;
	}
}

export default StaffService;
