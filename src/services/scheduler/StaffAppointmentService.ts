import StaffAppointmentDbModel from '../../models/database/StaffAppointment';
import { v4 as uuidv4 } from 'uuid';
import StaffAppointmentRepository from '../../repositories/scheduler/StaffAppointmentRepository';
import { AppointmentData } from '../../models/share/scheduler/StaffAppointmentData';
import { Service } from 'typedi';
import SharedAppointmentLinkRepository from '../../repositories/scheduler/SharedAppointmentLinkRepository';
import SharedAppointmentLinkDbModel from '../../models/database/SharedLink';
import { Permission } from '../../utils/PermissionHelper';
import StaffRepository from '../../repositories/scheduler/StaffRepository';
import {
	PartialError,
	SqlRecordNotFoundError
} from '../../models/error/Errors';
import StaffDbModel from '../../models/database/Staff';
import ErrorHandlerService from '../ErrorHandlerService';

@Service()
export class StaffAppointmentService {
	constructor(
		private staffRepository: StaffRepository,
		private appointmentRepository: StaffAppointmentRepository,
		private shareAppointmentLinkRepository: SharedAppointmentLinkRepository,
		private errorHandlerService: ErrorHandlerService
	) {}

	/**
	 * Creates appointments based on the provided data.
	 *
	 * @param appointmentsData - An array of appointment data.
	 * @returns A promise that resolves to an array of created appointment data.
	 * @throws {PartialError} If any of the appointments fail to be created due to non-existent staff.
	 */
	public async createAppointments(
		appointmentsData: AppointmentData[]
	): Promise<AppointmentData[]> {
		// Can optimize this by using groupBy
		const staffs = await this.staffRepository.findAll();
		const staffIdMap = staffs.reduce((map, staff) => {
			map.set(staff.name, staff.id);
			return map;
		}, new Map<string, string>());

		const unsuccessfulAppointments: AppointmentData[] = [];
		const successfulAppointments: AppointmentData[] = [];

		const appointmentsDbModels: StaffAppointmentDbModel[] = [];
		appointmentsData.forEach((appointment) => {
			const staffId = staffIdMap.get(appointment.staffName);

			if (staffId) {
				const appointmentDbModel = new StaffAppointmentDbModel({
					id: uuidv4(),
					staffId: staffId,
					weekViewId: appointment.weekViewId,
					startDate: appointment.startDate,
					endDate: appointment.endDate,
					location: appointment.location
				});

				appointmentsDbModels.push(appointmentDbModel);
				successfulAppointments.push(appointment);
			} else {
				unsuccessfulAppointments.push(appointment);
			}
		});

		if (appointmentsDbModels.length > 0) {
			await this.appointmentRepository.createMany(appointmentsDbModels);
		}

		if (unsuccessfulAppointments.length > 0) {
			const errorMessage: string[] = [];
			for (const appointment of unsuccessfulAppointments) {
				errorMessage.push(
					`Staff with name ${appointment.staffName} does not exist`
				);
			}
			throw new PartialError({ message: errorMessage.join('\n') });
		}

		return successfulAppointments;
	}

	private convertToAppointmentData(
		appointmentDbModel: StaffAppointmentDbModel,
		staffName: string
	): AppointmentData {
		return new AppointmentData({
			staffName: staffName,
			groupId: appointmentDbModel.id,
			weekViewId: appointmentDbModel.weekViewId,
			location: appointmentDbModel.location,
			startDate: appointmentDbModel.startDate,
			endDate: appointmentDbModel.endDate
		});
	}

	/**
	 * Builds a map of staff IDs to staff names.
	 * @returns A Promise that resolves to a Map object with staff IDs as keys and staff names as values.
	 */
	private buildStaffNameMap(staffs: StaffDbModel[]): Map<string, string> {
		const staffNameMap = staffs.reduce((map, staff) => {
			map.set(staff.id, staff.name);
			return map;
		}, new Map<string, string>());
		return staffNameMap;
	}

	private mapAppointmentDbModelsToAppointmentsData(
		appointmentDbModels: StaffAppointmentDbModel[],
		staffNameMap: Map<string, string>
	): AppointmentData[] {
		const appointments: AppointmentData[] = [];

		for (const appointmentDbModel of appointmentDbModels) {
			const staffName = staffNameMap.get(appointmentDbModel.staffId);
			if (staffName) {
				appointments.push(
					this.convertToAppointmentData(appointmentDbModel, staffName)
				);
			}
		}

		return appointments;
	}

	/**
	 * Retrieves all appointments.
	 * @returns A promise that resolves to an array of AppointmentData.
	 * @throws {DatabaseError} If the query fails.
	 */
	public async getAllAppointments(): Promise<AppointmentData[]> {
		const appointmentDbModels = await this.appointmentRepository.findAll();
		const staffDbModels = await this.staffRepository.findAll();
		const staffNameMap = this.buildStaffNameMap(staffDbModels);

		return this.mapAppointmentDbModelsToAppointmentsData(
			appointmentDbModels,
			staffNameMap
		);
	}

	/**
	 * Retrieves all appointments by week view ID.
	 *
	 * @param weekViewId - The ID of the week view.
	 * @returns A promise that resolves to an array of AppointmentData or null if no appointments are found.
	 * @throws {DatabaseError} If the query fails.
	 */
	public async getAllAppointmentsByWeekViewId(
		weekViewId: string
	): Promise<AppointmentData[] | null> {
		const appointmentDbModels =
			await this.appointmentRepository.findByWeekViewId(weekViewId);
		const staffDbModels = await this.staffRepository.findAll();
		const staffNameMap = this.buildStaffNameMap(staffDbModels);

		if (!appointmentDbModels) {
			return null;
		}

		return this.mapAppointmentDbModelsToAppointmentsData(
			appointmentDbModels,
			staffNameMap
		);
	}

	public async deleteAllAppointmentsByWeekViewIdAndStaffName(
		staffName: string,
		weekViewId: string
	) {
		const staffId = (await this.staffRepository.findByName(staffName))?.id;
		if (!staffId) {
			const sqlError = new SqlRecordNotFoundError({
				message: `Staff with name ${staffName} does not exist`
			});

			this.errorHandlerService.handleError({
				error: sqlError,
				service: StaffAppointmentService.name
			});

			throw sqlError;
		}

		await this.appointmentRepository.deleteByWeekViewIdAndStaffId(
			staffId,
			weekViewId
		);
	}

	public async deleteAllAppointmentsByStaffName(
		staffName: string
	): Promise<void> {
		const staffId = (await this.staffRepository.findByName(staffName))?.id;
		if (!staffId) {
			const sqlError = new SqlRecordNotFoundError({
				message: `Staff with name ${staffName} does not exist`
			});

			this.errorHandlerService.handleError({
				error: sqlError,
				service: StaffAppointmentService.name
			});

			throw sqlError;
		}

		const weekViewIds =
			await this.appointmentRepository.getAllWeekViewIdsByStaffId(
				staffId
			);

		for (const weekViewId of weekViewIds) {
			await this.appointmentRepository.deleteByWeekViewIdAndStaffId(
				staffId,
				weekViewId
			);
		}
	}

	public async deleteSharedAppointment(linkId: string) {
		await this.shareAppointmentLinkRepository.deleteById(linkId);
	}

	public async createShareAppointments(
		userId: string,
		permission: string,
		expiry?: string,
		weekViewIds?: string[]
	): Promise<string> {
		// TODO: not yet finished, basic basic function only
		// user is only allowed to create one link id at the moment
		const existingLinks =
			await this.shareAppointmentLinkRepository.findAllByUserId(userId);

		if (existingLinks.length == 1) {
			const dbWeekViewId = existingLinks[0].weekViewId;
			const dbExpiry = existingLinks[0].expiry;
			const dbPermission = existingLinks[0].permission;

			if (
				dbWeekViewId == weekViewIds &&
				dbPermission == permission &&
				dbExpiry == expiry
			) {
				return existingLinks[0].id;
			}
		}

		if (existingLinks.length > 1 && weekViewIds) {
			// check if identical link exists
			const dbWeekViewIds = [];
			for (const link of existingLinks) {
				const dbWeekViewId = link.weekViewId;
				const dbExpiry = link.expiry;
				const dbPermission = link.permission;

				if (dbExpiry !== expiry || dbPermission !== permission) {
					await this.deleteSharedAppointment(link.id);
					break;
				}
				dbWeekViewIds.push(dbWeekViewId);
			}

			if (dbWeekViewIds.length === weekViewIds.length) {
				const isIdentical = dbWeekViewIds.every((id) =>
					weekViewIds.includes(id!)
				);
				if (isIdentical) {
					return existingLinks[0].id;
				}
			}
		}

		// create new link
		const linkId = uuidv4();
		const linkDbModels =
			weekViewIds?.map(
				(weekViewId) =>
					new SharedAppointmentLinkDbModel({
						id: linkId,
						userId: userId,
						weekViewId: weekViewId,
						expiry: expiry,
						permission: permission
					})
			) ?? [];

		if (linkDbModels.length > 1) {
			await this.shareAppointmentLinkRepository.createManyByWeekViewIds(
				linkDbModels
			);
		} else if (linkDbModels.length === 1) {
			await this.shareAppointmentLinkRepository.create(linkDbModels[0]);
		} else {
			// View all appointments
			await this.shareAppointmentLinkRepository.create(
				new SharedAppointmentLinkDbModel({
					id: linkId,
					userId: userId,
					expiry: expiry,
					permission: permission
				})
			);
		}

		return linkId;
	}

	public async getSharedAppointments(
		linkId: string,
		weekViewId: string
	): Promise<AppointmentData[] | null> {
		// TODO: not yet finished, basic function only
		const linkDbModels =
			await this.shareAppointmentLinkRepository.findAllById(linkId);

		if (!linkDbModels || linkDbModels.length === 0) {
			return null;
		}

		if (
			linkDbModels[0].expiry &&
			new Date(linkDbModels[0].expiry) < new Date()
		) {
			return null;
		}

		if (parseInt(linkDbModels[0].permission) >= Permission.Read) {
		} else {
			return null;
		}

		const allowedWeekViewIds = linkDbModels.map((link) => link.weekViewId);

		if (allowedWeekViewIds.length === 1 && allowedWeekViewIds[0] === null) {
			// Allowed to view all appointments
			return this.getAllAppointmentsByWeekViewId(weekViewId);
		}

		if (!allowedWeekViewIds.includes(weekViewId)) {
			return null;
		} else {
			return this.getAllAppointmentsByWeekViewId(weekViewId);
		}
	}
}
