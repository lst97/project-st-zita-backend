import StaffAppointmentDbModel from '../../models/database/StaffAppointment';
import { v4 as uuidv4 } from 'uuid';
import StaffAppointmentRepository from '../../repositories/scheduler/StaffAppointmentRepository';
import { AppointmentData } from '../../models/share/scheduler/StaffAppointmentData';
import { Service } from 'typedi';
import SharedAppointmentLinkRepository from '../../repositories/scheduler/SharedAppointmentLinkRepository';
import SharedAppointmentLinkDbModel from '../../models/database/SharedLink';
import { Permission } from '../../utils/PermissionHelper';
import StaffRepository from '../../repositories/scheduler/StaffRepository';

@Service()
export class StaffAppointmentService {
	constructor(
		private staffRepository: StaffRepository,
		private appointmentRepository: StaffAppointmentRepository,
		private shareAppointmentLinkRepository: SharedAppointmentLinkRepository
	) {}

	public async createAppointments(
		appointmentsData: AppointmentData[]
	): Promise<AppointmentData[]> {
		// Can optimize this by using groupBy
		const staffs = await this.staffRepository.findAll();
		const staffIdMap = staffs.reduce((map, staff) => {
			map.set(staff.name, staff.id);
			return map;
		}, new Map<string, string>());

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
			}
		});

		await this.appointmentRepository.createMany(appointmentsDbModels);
		return appointmentsData;
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

	private async buildStaffNameMap(): Promise<Map<string, string>> {
		const staffs = await this.staffRepository.findAll();
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

	public async getAllAppointments(): Promise<AppointmentData[]> {
		const appointmentDbModels = await this.appointmentRepository.findAll();
		const staffNameMap = await this.buildStaffNameMap();

		return this.mapAppointmentDbModelsToAppointmentsData(
			appointmentDbModels,
			staffNameMap
		);
	}

	public async getAllAppointmentsByWeekViewId(
		weekViewId: string
	): Promise<AppointmentData[] | null> {
		const appointmentDbModels =
			await this.appointmentRepository.findByWeekViewId(weekViewId);

		const staffNameMap = await this.buildStaffNameMap();

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
			return;
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
			return;
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
