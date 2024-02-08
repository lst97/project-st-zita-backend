import { Request, Response } from 'express';
import StaffService from '../../services/scheduler/StaffService';
import { CreateStaffForm } from '../../models/forms/scheduler/CreateStaffForm';
import { StaffAppointmentService as AppointmentService } from '../../services/scheduler/StaffAppointmentService';
import { Service } from 'typedi';

@Service()
class StaffController {
	constructor(
		private staffService: StaffService,
		private appointmentService: AppointmentService
	) {}

	public async createStaff(req: Request, res: Response): Promise<void> {
		const createStaffForm = req.body as CreateStaffForm;

		const staff = await this.staffService.create(createStaffForm);
		res.json({ data: staff });
	}

	public async deleteStaff(req: Request, res: Response): Promise<void> {
		const staffName = req.query.staffName as string;
		await this.appointmentService.deleteAllAppointmentsByStaffName(
			staffName
		);
		await this.staffService.deleteByName(staffName);
		res.json({ data: true });
	}

	public async getAllStaffData(_req: Request, res: Response): Promise<void> {
		const staffs = await this.staffService.getAll();
		res.json({ data: staffs });
	}
}

export default StaffController;
