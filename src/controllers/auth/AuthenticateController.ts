import { Request, Response } from 'express';
import { Service } from 'typedi';

import dotenv from 'dotenv';
import { SignInForm } from '../../models/forms/auth/SignInForm';
import AuthService from '../../services/auth/AuthService';
import { RegistrationForm } from '../../models/forms/auth/RegistrationForm';
import ResponseService from '@lst97/common_response/src/services/ResponseService';

dotenv.config();

@Service()
class AuthenticateController {
	constructor(
		private authService: AuthService,
		private responseService: ResponseService
	) {}

	public async signin(req: Request, res: Response): Promise<void> {
		const signinForm = req.body as SignInForm;
		try {
			const accessToken = await this.authService.signin(signinForm, req);
			this.responseService.sendSuccess(
				res,
				accessToken,
				req.headers.requestId as string
			);
		} catch (error) {
			this.responseService.sendError(
				res,
				error as Error,
				req.headers.requestId as string
			);
		}
	}

	public async register(req: Request, res: Response): Promise<void> {
		const registrationForm = req.body as RegistrationForm;

		try {
			const userDbModel = await this.authService.register(
				registrationForm,
				req
			);
			this.responseService.sendSuccess(
				res,
				userDbModel,
				req.headers.requestId as string
			);
		} catch (error) {
			this.responseService.sendError(
				res,
				error as Error,
				req.headers.requestId as string
			);
		}
	}
}

export default AuthenticateController;
