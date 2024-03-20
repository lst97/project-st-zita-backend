import {
	CreateStaffForm,
	UpdateStaffForm
} from '../../models/forms/scheduler/StaffForms';
import StaffDbModel from '../../models/database/Staff';
import StaffRepository from '../../repositories/scheduler/StaffRepository';
import StaffDataSharedModel from '../../models/share/scheduler/StaffData';
import { IErrorHandlerService } from '@lst97/common_response';
import {
	SqlRecordExistsError,
	SqlRecordNotFoundError
} from '@lst97/common_response/';
import { StaffAppointmentService } from './StaffAppointmentService';
import { SQLite3QueryService } from '../DatabaseService';
import { inject, injectable } from 'inversify';

@injectable()
class StaffService {
	constructor(
		private staffRepository: StaffRepository,
		private appointmentService: StaffAppointmentService,
		private dbQueryService: SQLite3QueryService,
		@inject('ErrorHandlerService')
		private errorHandlerService: IErrorHandlerService
	) {}

	/**
	 * Creates a new staff member.
	 *
	 * @param staffForm - The form data for creating a staff member.
	 * @param userId - The ID of the user to create the staff member for.
	 * @returns A promise that resolves to the created staff member.
	 * @throws {SqlRecordExistsError} If a staff member with the same name already exists.
	 * @throws {DatabaseError} If an unknown database error occurs.
	 */
	public async create(
		staffForm: CreateStaffForm,
		userId: string
	): Promise<StaffDbModel> {
		if (
			await this.staffRepository.findByName(staffForm.staffName, userId)
		) {
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
		await this.staffRepository.create(staff, userId);
		return staff;
	}

	/**
	 * Deletes a staff member by their name.
	 * @param name - The name of the staff member to delete.
	 * @param userId - The ID of the user to delete the staff member for.
	 * @returns A Promise that resolves when the staff member is successfully deleted.
	 * @throws {SqlRecordNotFoundError} If the staff member with the given name is not found.
	 */
	public async deleteByName(name: string, userId: string): Promise<void> {
		let db = null;
		try {
			const staffDbModel = await this.staffRepository.findByName(
				name,
				userId
			);
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
				name,
				userId
			);
			await this.staffRepository.deleteByName(name, userId);
			await this.dbQueryService.commitTransactionAsync(db);
		} catch (error) {
			if (db) {
				await this.dbQueryService.rollbackTransactionAsync(db);
			}
		}
	}

	public async updateStaff(
		staff: UpdateStaffForm,
		userId: string
	): Promise<StaffDbModel>;
	/**
	 * Updates a staff member in the database.
	 * If the provided staff parameter is an instance of UpdateStaffForm, it searches for the staff member by name and updates their information.
	 * If the staff member is not found, a SqlRecordNotFoundError is thrown.
	 * If the provided staff parameter is an instance of StaffDbModel, it directly updates the staff member's information.
	 *
	 * @param staff - The staff member to update. Can be an instance of UpdateStaffForm or StaffDbModel.
	 * @param userId - The ID of the user to update the staff member for.
	 * @returns The updated staff member.
	 * @throws {SqlRecordNotFoundError} If the staff member is not found in the database.
	 */
	public async updateStaff(
		staff: UpdateStaffForm,
		userId: string
	): Promise<StaffDbModel> {
		if (!(await this.staffRepository.findById(staff.id, userId))) {
			const sqlError = new SqlRecordNotFoundError({
				message: `Staff id "${staff.id}" not found`
			});

			this.errorHandlerService.handleError({
				error: sqlError,
				service: StaffService.name
			});

			throw sqlError;
		}

		const staffDbModel = new StaffDbModel({
			id: staff.id,
			name: staff.staffName,
			email: staff.email,
			phoneNumber: staff.phoneNumber,
			image: staff.image,
			color: staff.color
		});

		await this.staffRepository.update(staffDbModel, userId);
		return staffDbModel;
	}

	/**
	 * Retrieves all staff data.
	 * @param userId - The ID of the user to retrieve the staff member for.
	 * @returns A promise that resolves to an array of StaffDataSharedModel objects.
	 * @throws {DatabaseError} If an unknown database error occurs.
	 */
	public async getAll(userId: string): Promise<StaffDataSharedModel[]> {
		let staffs = await this.staffRepository.findAll(userId);
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
	 * @param userId - The ID of the user to retrieve the staff member for.
	 * @returns A promise that resolves to the staff member.
	 * @throws {SqlRecordNotFoundError} If the staff member with the given name is not found.
	 */
	public async getIdByName(name: string, userId: string): Promise<string> {
		const staff = await this.staffRepository.findByName(name, userId);
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
