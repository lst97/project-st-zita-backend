import { Request, Response } from 'express';
import StaffService from '../../services/scheduler/StaffService';
import {
	CreateStaffForm,
	UpdateStaffForm
} from '../../models/forms/scheduler/StaffForms';
import { Service } from 'typedi';
import ErrorHandlerService from '@lst97/common_response/src/services/ErrorHandlerService';
import DefinedBaseError, {
	ControllerError
} from '@lst97/common_response/src/models/Errors';
import ResponseService from '@lst97/common_response/src/services/ResponseService';

@Service()
class StaffController {
	constructor(
		private staffService: StaffService,
		private errorHandlerService: ErrorHandlerService,
		private responseService: ResponseService
	) {}

	public async createStaff(req: Request, res: Response): Promise<void> {
		const createStaffForm = req.body as CreateStaffForm;
		try {
			const staffDbModel = await this.staffService.create(
				createStaffForm,
				req.user.id
			);
			this.responseService.sendSuccess(
				res,
				staffDbModel,
				req.headers.requestId as string
			);
		} catch (error) {
			if (!(error instanceof DefinedBaseError)) {
				this.errorHandlerService.handleUnknownControllerError({
					error: error as Error,
					service: StaffController.name,
					errorType: ControllerError
				});
			}

			this.responseService.sendError(res, error as Error, req.id);
		}
	}

	public async deleteStaff(req: Request, res: Response): Promise<void> {
		try {
			const staffName = req.query.staffName as string;

			await this.staffService.deleteByName(staffName, req.user.id);
			this.responseService.sendSuccess(
				res,
				true,
				req.headers.requestId as string
			);
		} catch (error) {
			if (!(error instanceof DefinedBaseError)) {
				this.errorHandlerService.handleUnknownControllerError({
					error: error as Error,
					service: StaffController.name,
					errorType: ControllerError
				});
			}

			this.responseService.sendError(res, error as Error, req.id);
		}
	}

	public async editStaff(req: Request, res: Response): Promise<void> {
		try {
			const staffForm = req.body as UpdateStaffForm;

			const updatedStaff = await this.staffService.updateStaff(
				staffForm,
				req.user.id
			);

			this.responseService.sendSuccess(
				res,
				updatedStaff,
				req.headers.requestId as string
			);
		} catch (error) {
			if (!(error instanceof DefinedBaseError)) {
				this.errorHandlerService.handleUnknownControllerError({
					error: error as Error,
					service: StaffController.name,
					errorType: ControllerError
				});
			}

			this.responseService.sendError(res, error as Error, req.id);
		}
	}

	public async getAllStaffData(req: Request, res: Response): Promise<void> {
		try {
			const staffs = await this.staffService.getAll(req.user.id);
			this.responseService.sendSuccess(
				res,
				staffs,
				req.headers.requestId as string
			);
		} catch (error) {
			if (!(error instanceof DefinedBaseError)) {
				this.errorHandlerService.handleUnknownControllerError({
					error: error as Error,
					service: StaffController.name,
					errorType: ControllerError
				});
			}

			this.responseService.sendError(res, error as Error, req.id);
		}
	}
}

export default StaffController;
