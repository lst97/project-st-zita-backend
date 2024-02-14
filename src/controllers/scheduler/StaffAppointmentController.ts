import { Request, Response } from 'express';
import { StaffAppointmentService } from '../../services/scheduler/StaffAppointmentService';
import { AppointmentData } from '../../models/share/scheduler/StaffAppointmentData';
import { Service } from 'typedi';
import { CreateShareLinkForm } from '../../models/forms/scheduler/CreateShareLinkForm';

@Service()
export class StaffAppointmentController {
	constructor(private appointmentService: StaffAppointmentService) {}

	public async createAppointments(
		req: Request,
		res: Response
	): Promise<void> {
		const appointsData = req.body as AppointmentData[];
		await this.appointmentService.createAppointments(appointsData);
		res.json({ data: true });
	}

	public async getAllAppointments(
		_req: Request,
		res: Response
	): Promise<void> {
		const appointments = await this.appointmentService.getAllAppointments();
		res.json({ data: appointments });
	}

	// week_number + year = 142024
	public async getAllAppointmentsByWeekViewId(
		req: Request,
		res: Response
	): Promise<void> {
		const weekViewId = req.params.id;

		const appointments =
			await this.appointmentService.getAllAppointmentsByWeekViewId(
				weekViewId
			);
		res.json({ data: appointments });
	}

	public async deleteAllAppointmentsByWeekViewIdAndStaffName(
		req: Request,
		res: Response
	) {
		const weekViewId = req.params.id;
		const staffName = req.query.staffName as string;
		await this.appointmentService.deleteAllAppointmentsByWeekViewIdAndStaffName(
			staffName,
			weekViewId
		);
		res.json({ data: true });
	}

	public async createShareAppointments(
		req: Request,
		res: Response
	): Promise<void> {
		const shareLinkForm = req.body as CreateShareLinkForm;
		shareLinkForm.userId = req.user.id;

		const linkId = await this.appointmentService.createShareAppointments(
			shareLinkForm.userId,
			shareLinkForm.permission,
			shareLinkForm.expiry,
			shareLinkForm.weekViewIds
		);
		res.json({ data: linkId });
	}

	public async getSharedAppointments(
		req: Request,
		res: Response
	): Promise<void> {
		const linkId = req.params.id;
		const weekViewId = req.query.weekViewId as string;

		const appointments =
			await this.appointmentService.getSharedAppointments(
				linkId,
				weekViewId
			);
		res.json({ data: appointments });
	}
}
