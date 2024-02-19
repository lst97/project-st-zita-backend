import { Request, Response } from 'express';
import StaffService from '../../services/scheduler/StaffService';
import { CreateStaffForm } from '../../models/forms/scheduler/CreateStaffForm';
import { StaffAppointmentService as AppointmentService } from '../../services/scheduler/StaffAppointmentService';
import { Service } from 'typedi';
import ErrorHandlerService from '../../services/ErrorHandlerService';
import DefinedBaseError from '../../models/error/Errors';
import ResponseService from '../../services/response/ResponseService';

@Service()
class StaffController {
	constructor(
		private staffService: StaffService,
		private appointmentService: AppointmentService,
		private errorHandlerService: ErrorHandlerService,
		private responseService: ResponseService
	) {}

	public async createStaff(req: Request, res: Response): Promise<void> {
		const createStaffForm = req.body as CreateStaffForm;
		try {
			await this.staffService.create(createStaffForm);
		} catch (error) {
			if (error instanceof DefinedBaseError) {
				this.errorHandlerService.handleError({
					error,
					service: StaffController.name,
					traceId: error.traceId
				});

				this.responseService.sendError(res, error, req.id);
			} else {
				res.status(500).json({
					message: 'Unhandled internal server error'
				});
			}
		}
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
		this.responseService.sendSuccess(
			res,
			staffs,
			_req.headers.requestId as string
		);
	}
}

export default StaffController;
