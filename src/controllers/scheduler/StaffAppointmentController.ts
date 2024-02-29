import { Request, Response } from 'express';
import { StaffAppointmentService } from '../../services/scheduler/StaffAppointmentService';
import { AppointmentData } from '../../models/share/scheduler/StaffAppointmentData';
import { Service } from 'typedi';
import { CreateShareLinkForm } from '../../models/forms/scheduler/CreateShareLinkForm';
import ResponseService from '../../services/response/ResponseService';
import ErrorHandlerService from '../../services/ErrorHandlerService';
import { ExportAsExcelForm } from '../../models/forms/scheduler/ExportAsExcelForm';

@Service()
export class StaffAppointmentController {
	constructor(
		private appointmentService: StaffAppointmentService,
		private responseService: ResponseService,
		private errorHandlerService: ErrorHandlerService
	) {}

	public async createAppointments(
		req: Request,
		res: Response
	): Promise<void> {
		const appointsData = req.body as AppointmentData[];
		try {
			await this.appointmentService.createAppointments(
				appointsData,
				req.user.id
			);
			this.responseService.sendSuccess(
				res,
				true,
				req.headers.requestId as string
			);
		} catch (error) {
			if (error instanceof Error) {
				this.errorHandlerService.handleUnknownError({
					error: error,
					service: StaffAppointmentController.name
				});
			}

			this.responseService.sendError(
				res,
				error as Error,
				req.headers.requestId as string
			);
		}
	}

	// week_number + year = 142024
	public async getAllAppointmentsByWeekViewId(
		req: Request,
		res: Response
	): Promise<void> {
		const weekViewId = req.params.id;

		try {
			const appointments =
				await this.appointmentService.getAllAppointmentsByWeekViewId(
					weekViewId,
					req.user.id
				);
			this.responseService.sendSuccess(
				res,
				appointments,
				req.headers.requestId as string
			);
		} catch (error) {
			if (error instanceof Error) {
				this.errorHandlerService.handleUnknownError({
					error: error,
					service: StaffAppointmentController.name
				});
			}

			this.responseService.sendError(
				res,
				error as Error,
				req.headers.requestId as string
			);
		}
	}

	public async deleteAllAppointmentsByWeekViewIdAndStaffName(
		req: Request,
		res: Response
	) {
		const weekViewId = req.params.id;
		const staffName = req.query.staffName as string;

		try {
			await this.appointmentService.deleteAllAppointmentsByWeekViewIdAndStaffName(
				staffName,
				weekViewId,
				req.user.id
			);
			this.responseService.sendSuccess(
				res,
				true,
				req.headers.requestId as string
			);
		} catch (error) {
			if (error instanceof Error) {
				this.errorHandlerService.handleUnknownError({
					error: error,
					service: StaffAppointmentController.name
				});
			}

			this.responseService.sendError(
				res,
				error as Error,
				req.headers.requestId as string
			);
		}
	}

	public async createShareAppointments(
		req: Request,
		res: Response
	): Promise<void> {
		const shareLinkForm = req.body as CreateShareLinkForm;
		shareLinkForm.userId = req.user.id;

		try {
			const link = await this.appointmentService.createShareAppointments(
				shareLinkForm.userId,
				shareLinkForm.permission,
				shareLinkForm.expiry,
				shareLinkForm.weekViewIds
			);
			this.responseService.sendSuccess(
				res,
				link,
				req.headers.requestId as string
			);
		} catch (error) {
			if (error instanceof Error) {
				this.errorHandlerService.handleUnknownError({
					error: error,
					service: StaffAppointmentController.name
				});
			}

			this.responseService.sendError(
				res,
				error as Error,
				req.headers.requestId as string
			);
		}
	}

	public async getSharedAppointments(
		req: Request,
		res: Response
	): Promise<void> {
		const linkId = req.params.id;
		const weekViewId = req.query.weekViewId as string;

		try {
			const appointments =
				await this.appointmentService.getSharedAppointments(
					linkId,
					weekViewId,
					req.user.id
				);
			this.responseService.sendSuccess(
				res,
				appointments,
				req.headers.requestId as string
			);
		} catch (error) {
			if (error instanceof Error) {
				this.errorHandlerService.handleUnknownError({
					error: error,
					service: StaffAppointmentController.name
				});
			}

			this.responseService.sendError(
				res,
				error as Error,
				req.headers.requestId as string
			);
		}
	}

	public async exportAppointmentsAsExcel(
		req: Request,
		res: Response
	): Promise<void> {
		const exportForm = req.body as ExportAsExcelForm;
		const fileName = `${
			exportForm.method
		}_schedule_${exportForm.fromDate.substring(
			0,
			10
		)}_${exportForm.toDate.substring(0, 10)}.xlsx`;

		try {
			const excelBuffer =
				await this.appointmentService.getExportedAppointmentExcelBuffer(
					exportForm.fromDate,
					exportForm.toDate,
					exportForm.method,
					fileName,
					req.user.id
				);

			res.setHeader(
				'Content-Type',
				'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
			);

			this.responseService.sendSuccess(
				res,
				{ fileName: fileName, buffer: excelBuffer.toString('base64') },
				req.headers.requestId as string
			);
		} catch (error) {
			if (error instanceof Error) {
				this.errorHandlerService.handleUnknownError({
					error: error,
					service: StaffAppointmentController.name
				});
			}

			this.responseService.sendError(
				res,
				error as Error,
				req.headers.requestId as string
			);
		}
	}
}
