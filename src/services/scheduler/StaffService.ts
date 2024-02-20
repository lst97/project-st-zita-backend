import { CreateStaffForm } from '../../models/forms/scheduler/CreateStaffForm';
import StaffDbModel from '../../models/database/Staff';
import StaffRepository from '../../repositories/scheduler/StaffRepository';
import StaffDataSharedModel from '../../models/share/scheduler/StaffData';
import { Service } from 'typedi';
import ErrorHandlerService from '../ErrorHandlerService';
import {
	DatabaseError,
	ServiceError,
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

	public async create(staffForm: CreateStaffForm): Promise<StaffDbModel> {
		try {
			if (await this.staffRepository.findByName(staffForm.staffName)) {
				const sqlError = new SqlRecordNotFoundError({
					message: `Staff name "${staffForm.staffName}" not found`
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

		try {
			const staff = new StaffDbModel({
				name: staffForm.staffName,
				email: staffForm.email,
				phoneNumber: staffForm.phoneNumber,
				image: staffForm.image,
				color: staffForm.color
			});
			await this.staffRepository.create(staff);
			return staff;
		} catch (error) {
			if (!(error instanceof DatabaseError)) {
				this.errorHandlerService.handleUnknownServiceError({
					error: error as Error,
					service: StaffService.name,
					errorType: ServiceError
				});
			}
			throw error;
		}
	}

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
			if (!(error instanceof DatabaseError)) {
				this.errorHandlerService.handleUnknownServiceError({
					error: error as Error,
					service: StaffService.name,
					errorType: ServiceError
				});
			}
			throw error;
		}
	}

	public async updateStaff(staff: StaffDbModel): Promise<StaffDbModel> {
		try {
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
		} catch (error) {
			if (!(error instanceof SqlRecordNotFoundError)) {
				throw error;
			}
		}

		try {
			return await this.staffRepository.update(staff);
		} catch (error) {
			if (!(error instanceof DatabaseError)) {
				this.errorHandlerService.handleUnknownServiceError({
					error: error as Error,
					service: StaffService.name,
					errorType: ServiceError
				});
			}
			throw error;
		}
	}

	public async getAll(): Promise<StaffDataSharedModel[]> {
		try {
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
		} catch (error) {
			if (!(error instanceof DatabaseError)) {
				this.errorHandlerService.handleUnknownServiceError({
					error: error as Error,
					service: StaffService.name,
					errorType: ServiceError
				});
			}
			throw error;
		}
	}

	public async getIdByName(name: string): Promise<string> {
		try {
			const staff = await this.staffRepository.findByName(name);
			return staff ? staff.id : '';
		} catch (error) {
			if (!(error instanceof DatabaseError)) {
				this.errorHandlerService.handleUnknownServiceError({
					error: error as Error,
					service: StaffService.name,
					errorType: ServiceError
				});
			}
			throw error;
		}
	}
}

export default StaffService;
