import { Request, Response } from 'express';
import { Service } from 'typedi';

import dotenv from 'dotenv';
import { SignInForm } from '../../models/forms/auth/SignInForm';
import AuthService from '../../services/auth/AuthService';
import { RegistrationForm } from '../../models/forms/auth/RegistrationForm';
import { IResponseService } from '@lst97/common_response';

dotenv.config();

@Service()
class AuthenticateController {
	constructor(
		private authService: AuthService,
		private responseService: IResponseService
	) {}

	public async signin(req: Request, res: Response): Promise<void> {
		const signinForm = req.body as SignInForm;
		try {
			const accessToken = await this.authService.signin(signinForm, req);
			const commonResponse = this.responseService.buildSuccessResponse(
				accessToken,
				req.headers.requestId as string
			);

			res.status(commonResponse.httpStatus).json(commonResponse.response);
		} catch (error) {
			const commonResponse = this.responseService.buildErrorResponse(
				error as Error,
				req.headers.requestId as string
			);

			res.status(commonResponse.httpStatus).json(commonResponse.response);
		}
	}

	public async register(req: Request, res: Response): Promise<void> {
		const registrationForm = req.body as RegistrationForm;

		try {
			const userDbModel = await this.authService.register(
				registrationForm,
				req
			);
			const commonResponse = this.responseService.buildSuccessResponse(
				userDbModel,
				req.headers.requestId as string
			);

			res.status(commonResponse.httpStatus).json(commonResponse.response);
		} catch (error) {
			const commonResponse = this.responseService.buildErrorResponse(
				error as Error,
				req.headers.requestId as string
			);
		}
	}
}

export default AuthenticateController;
