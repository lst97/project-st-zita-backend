import StaffService from './StaffService';
import StaffAppointmentDbModel from '../../models/database/StaffAppointment';
import { v4 as uuidv4 } from 'uuid';
import StaffAppointmentRepository from '../../repositories/scheduler/StaffAppointmentRepository';
import { AppointmentData } from '../../models/share/scheduler/StaffAppointmentData';
import { Service } from 'typedi';

@Service()
export class StaffAppointmentService {
	constructor(
		private staffService: StaffService,
		private appointmentRepository: StaffAppointmentRepository
	) {}

	public async createAppointments(
		appointmentsData: AppointmentData[]
	): Promise<AppointmentData[]> {
		// Can optimize this by using groupBy
		const staffs = await this.staffService.getAll();
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
		const staffs = await this.staffService.getAll();
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
		const staffId = await this.staffService.getIdByName(staffName);
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
		const staffId = await this.staffService.getIdByName(staffName);
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
}
