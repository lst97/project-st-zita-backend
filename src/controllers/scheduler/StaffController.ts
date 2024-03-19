import { Request, Response } from 'express';
import StaffService from '../../services/scheduler/StaffService';
import {
	CreateStaffForm,
	UpdateStaffForm
} from '../../models/forms/scheduler/StaffForms';
import { Service } from 'typedi';
import { IErrorHandlerService } from '@lst97/common_response';
import { DefinedBaseError, ControllerError } from '@lst97/common_response';
import { IResponseService } from '@lst97/common_response';

@Service()
class StaffController {
	constructor(
		private staffService: StaffService,
		private errorHandlerService: IErrorHandlerService,
		private responseService: IResponseService
	) {}

	public async createStaff(req: Request, res: Response): Promise<void> {
		const createStaffForm = req.body as CreateStaffForm;
		try {
			const staffDbModel = await this.staffService.create(
				createStaffForm,
				req.user.id
			);
			const commonResponse = this.responseService.buildSuccessResponse(
				staffDbModel,
				req.headers.requestId as string
			);

			res.status(commonResponse.httpStatus).json(commonResponse.response);
		} catch (error) {
			if (!(error instanceof DefinedBaseError)) {
				this.errorHandlerService.handleUnknownControllerError({
					error: error as Error,
					service: StaffController.name,
					errorType: ControllerError
				});
			}

			const commonResponse = this.responseService.buildErrorResponse(
				error as Error,
				req.id
			);
			res.status(commonResponse.httpStatus).json(commonResponse.response);
		}
	}

	public async deleteStaff(req: Request, res: Response): Promise<void> {
		try {
			const staffName = req.query.staffName as string;

			await this.staffService.deleteByName(staffName, req.user.id);
			const commonResponse = this.responseService.buildSuccessResponse(
				true,
				req.headers.requestId as string
			);

			res.status(commonResponse.httpStatus).json(commonResponse.response);
		} catch (error) {
			if (!(error instanceof DefinedBaseError)) {
				this.errorHandlerService.handleUnknownControllerError({
					error: error as Error,
					service: StaffController.name,
					errorType: ControllerError
				});
			}

			const commonResponse = this.responseService.buildErrorResponse(
				error as Error,
				req.id
			);
			res.status(commonResponse.httpStatus).json(commonResponse.response);
		}
	}

	public async editStaff(req: Request, res: Response): Promise<void> {
		try {
			const staffForm = req.body as UpdateStaffForm;

			const updatedStaff = await this.staffService.updateStaff(
				staffForm,
				req.user.id
			);

			const commonResponse = this.responseService.buildSuccessResponse(
				updatedStaff,
				req.headers.requestId as string
			);

			res.status(commonResponse.httpStatus).json(commonResponse.response);
		} catch (error) {
			if (!(error instanceof DefinedBaseError)) {
				this.errorHandlerService.handleUnknownControllerError({
					error: error as Error,
					service: StaffController.name,
					errorType: ControllerError
				});
			}

			const commonResponse = this.responseService.buildErrorResponse(
				error as Error,
				req.id
			);
			res.status(commonResponse.httpStatus).json(commonResponse.response);
		}
	}

	public async getAllStaffData(req: Request, res: Response): Promise<void> {
		try {
			const staffs = await this.staffService.getAll(req.user.id);
			const commonResponse = this.responseService.buildSuccessResponse(
				staffs,
				req.headers.requestId as string
			);

			res.status(commonResponse.httpStatus).json(commonResponse.response);
		} catch (error) {
			if (!(error instanceof DefinedBaseError)) {
				this.errorHandlerService.handleUnknownControllerError({
					error: error as Error,
					service: StaffController.name,
					errorType: ControllerError
				});
			}

			const commonResponse = this.responseService.buildErrorResponse(
				error as Error,
				req.id
			);

			res.status(commonResponse.httpStatus).json(commonResponse.response);
		}
	}
}

export default StaffController;
