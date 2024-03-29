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
} from '@lst97/common_response/src/';
import StaffDbModel from '../../models/database/Staff';
import ErrorHandlerService from '@lst97/common_response/src/services/ErrorHandlerService';
import { ExportHelper, WeeklyExportStrategy } from '../../utils/ExportHelper';

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
		appointmentsData: AppointmentData[],
		userId: string
	): Promise<AppointmentData[]> {
		// Can optimize this by using groupBy
		const staffs = await this.staffRepository.findAll(userId);
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
			await this.appointmentRepository.createMany(
				appointmentsDbModels,
				userId
			);
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
	public async getAllAppointments(
		userId: string
	): Promise<AppointmentData[]> {
		const appointmentDbModels = await this.appointmentRepository.findAll(
			userId
		);
		const staffDbModels = await this.staffRepository.findAll(userId);
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
		weekViewId: string,
		userId: string
	): Promise<AppointmentData[] | null> {
		const appointmentDbModels =
			await this.appointmentRepository.findByWeekViewId(
				weekViewId,
				userId
			);
		const staffDbModels = await this.staffRepository.findAll(userId);
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
		weekViewId: string,
		userId: string
	) {
		const staffId = (
			await this.staffRepository.findByName(staffName, userId)
		)?.id;
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
			weekViewId,
			userId
		);
	}

	public async deleteAllAppointmentsByStaffName(
		staffName: string,
		userId: string
	): Promise<void> {
		const staffId = (
			await this.staffRepository.findByName(staffName, userId)
		)?.id;
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
				staffId,
				userId
			);

		for (const weekViewId of weekViewIds) {
			await this.appointmentRepository.deleteByWeekViewIdAndStaffId(
				staffId,
				weekViewId,
				userId
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
			return this.getAllAppointmentsByWeekViewId(
				weekViewId,
				linkDbModels[0].userId
			);
		}

		if (!allowedWeekViewIds.includes(weekViewId)) {
			return null;
		} else {
			return this.getAllAppointmentsByWeekViewId(
				weekViewId,
				linkDbModels[0].userId
			);
		}
	}

	public async getExportedAppointmentExcelBuffer(
		startDate: string,
		endDate: string,
		method: string,
		fileName: string,
		userId: string
	): Promise<Buffer> {
		let exportStrategy = null;
		if (method === 'weekly') {
			exportStrategy = new WeeklyExportStrategy();
		} else {
			throw new Error('Invalid export method');
		}

		// get data from database.
		const appointmentDbModels =
			await this.appointmentRepository.getAppointmentsByDateRange(
				startDate,
				endDate,
				userId
			);

		if (!appointmentDbModels) {
			return Buffer.from([]);
		}

		const staffDbModels = await this.staffRepository.findAll(userId);
		const staffNameMap = this.buildStaffNameMap(staffDbModels);

		const appointmentsData = this.mapAppointmentDbModelsToAppointmentsData(
			appointmentDbModels,
			staffNameMap
		);

		const exportHelper = new ExportHelper(exportStrategy!);
		return await exportHelper.exportToExcel(appointmentsData, fileName);
	}
}
