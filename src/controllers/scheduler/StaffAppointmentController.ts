import { Request, Response } from 'express';
import { StaffAppointmentService } from '../../services/scheduler/StaffAppointmentService';
import { AppointmentData } from '../../models/share/scheduler/StaffAppointmentData';
import { CreateShareLinkForm } from '../../models/forms/scheduler/CreateShareLinkForm';
import { IErrorHandlerService, IResponseService } from '@lst97/common_response';
import { ExportAsExcelForm } from '../../models/forms/scheduler/ExportAsExcelForm';
import { injectable, inject } from 'inversify';

@injectable()
export class StaffAppointmentController {
	constructor(
		private appointmentService: StaffAppointmentService,
		@inject('ErrorHandlerService')
		private errorHandlerService: IErrorHandlerService,
		@inject('ResponseService') private responseService: IResponseService
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
			const commonResponse = this.responseService.buildSuccessResponse(
				true,
				req.headers.requestId as string
			);

			res.status(commonResponse.httpStatus).json(commonResponse.response);
		} catch (error) {
			if (error instanceof Error) {
				this.errorHandlerService.handleUnknownError({
					error: error,
					service: StaffAppointmentController.name
				});
			}

			const commonResponse = this.responseService.buildErrorResponse(
				error as Error,
				req.headers.requestId as string
			);

			res.status(commonResponse.httpStatus).json(commonResponse.response);
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
			const commonResponse = this.responseService.buildSuccessResponse(
				appointments,
				req.headers.requestId as string
			);

			res.status(commonResponse.httpStatus).json(commonResponse.response);
		} catch (error) {
			if (error instanceof Error) {
				this.errorHandlerService.handleUnknownError({
					error: error,
					service: StaffAppointmentController.name
				});
			}

			const commonResponse = this.responseService.buildErrorResponse(
				error as Error,
				req.headers.requestId as string
			);

			res.status(commonResponse.httpStatus).json(commonResponse.response);
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
			const commonResponse = this.responseService.buildSuccessResponse(
				true,
				req.headers.requestId as string
			);

			res.status(commonResponse.httpStatus).json(commonResponse.response);
		} catch (error) {
			if (error instanceof Error) {
				this.errorHandlerService.handleUnknownError({
					error: error,
					service: StaffAppointmentController.name
				});
			}

			const commonResponse = this.responseService.buildErrorResponse(
				error as Error,
				req.headers.requestId as string
			);

			res.status(commonResponse.httpStatus).json(commonResponse.response);
		}
	}

	public async deleteAppointmentByDateAndStaffName(
		req: Request,
		res: Response
	) {
		const staffName = req.query.staffName as string;
		const startDate = req.query.startDate as string;
		const endDate = req.query.endDate as string;
		const userId = req.user.id;

		try {
			await this.appointmentService.deleteAppointmentByDateAndStaffName(
				staffName,
				startDate,
				endDate,
				userId
			);

			const commonResponse = this.responseService.buildSuccessResponse(
				true,
				req.headers.requestId as string
			);

			res.status(commonResponse.httpStatus).json(commonResponse.response);
		} catch (error) {
			if (error instanceof Error) {
				this.errorHandlerService.handleUnknownError({
					error: error,
					service: StaffAppointmentController.name
				});
			}

			const commonResponse = this.responseService.buildErrorResponse(
				error as Error,
				req.headers.requestId as string
			);

			res.status(commonResponse.httpStatus).json(commonResponse.response);
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
			const commonResponse = this.responseService.buildSuccessResponse(
				link,
				req.headers.requestId as string
			);

			res.status(commonResponse.httpStatus).json(commonResponse.response);
		} catch (error) {
			if (error instanceof Error) {
				this.errorHandlerService.handleUnknownError({
					error: error,
					service: StaffAppointmentController.name
				});
			}

			const commonResponse = this.responseService.buildErrorResponse(
				error as Error,
				req.headers.requestId as string
			);

			res.status(commonResponse.httpStatus).json(commonResponse.response);
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
					weekViewId
				);
			const commonResponse = this.responseService.buildSuccessResponse(
				appointments,
				req.headers.requestId as string
			);

			res.status(commonResponse.httpStatus).json(commonResponse.response);
		} catch (error) {
			if (error instanceof Error) {
				this.errorHandlerService.handleUnknownError({
					error: error,
					service: StaffAppointmentController.name
				});
			}

			const commonResponse = this.responseService.buildErrorResponse(
				error as Error,
				req.headers.requestId as string
			);

			res.status(commonResponse.httpStatus).json(commonResponse.response);
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

			const commonResponse = this.responseService.buildSuccessResponse(
				{ fileName: fileName, buffer: excelBuffer.toString('base64') },
				req.headers.requestId as string
			);

			res.status(commonResponse.httpStatus).json(commonResponse.response);
		} catch (error) {
			if (error instanceof Error) {
				this.errorHandlerService.handleUnknownError({
					error: error,
					service: StaffAppointmentController.name
				});
			}

			const commonResponse = this.responseService.buildErrorResponse(
				error as Error,
				req.headers.requestId as string
			);

			res.status(commonResponse.httpStatus).json(commonResponse.response);
		}
	}
}
