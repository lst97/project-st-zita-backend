import { Inject, Service } from 'typedi';
import { SignInForm } from '../../models/forms/auth/SignInForm';
import UserRepository from '../../repositories/auth/UserRepository';
import { hashPassword, verifyPassword } from '../../utils/HashHelper';
import jwt from 'jsonwebtoken';
import { RegistrationForm } from '../../models/forms/auth/RegistrationForm';
import UserDbModel from '../../models/database/User';
import { IErrorHandlerService } from '@lst97/common_response';
import {
	AuthInvalidEmailError,
	AuthInvalidPasswordError,
	AuthRegistrationFailWithDuplicatedEmailError,
	ServerInvalidEnvConfigError
} from '@lst97/common_response';
import { Request } from 'express';

@Service()
class AuthService {
	constructor(
		private userRepository: UserRepository,
		@Inject('ErrorHandlerService')
		private errorHandlerService: IErrorHandlerService
	) {}

	public async signin(form: SignInForm, req: Request): Promise<string> {
		const userDbModel = await this.userRepository.findByEmail(form.email);

		if (!userDbModel) {
			const autError = new AuthInvalidEmailError({ request: req });

			this.errorHandlerService.handleError({
				error: autError,
				service: AuthService.name
			});

			throw autError;
		}

		if (
			(await verifyPassword(form.password, userDbModel.passwordHash)) ==
			false
		) {
			const authError = new AuthInvalidPasswordError({
				request: req
			});

			this.errorHandlerService.handleError({
				error: authError,
				service: AuthService.name
			});

			throw authError;
		}

		const role = 'NOT_IMPLEMENTED';
		const permission = 'NOT_IMPLEMENTED';
		const secret = process.env.ACCESS_TOKEN_SECRET;
		if (!secret) {
			const error = new ServerInvalidEnvConfigError({
				message: 'ACCESS_TOKEN_SECRET is not set in .env file.'
			});
			this.errorHandlerService.handleError({
				error: error,
				service: AuthService.name
			});
			throw error;
		}

		const accessToken = jwt.sign(
			{
				id: userDbModel.id!,
				firstName: userDbModel.firstName,
				lastName: userDbModel.lastName,
				email: userDbModel.email,
				role,
				permission
			},
			secret,
			{
				expiresIn: '28d'
			}
		);

		return accessToken;
	}

	public async register(
		form: RegistrationForm,
		req: Request
	): Promise<UserDbModel> {
		const userDbModel = await this.userRepository.findByEmail(form.email);
		if (userDbModel) {
			const autError = new AuthRegistrationFailWithDuplicatedEmailError({
				request: req
			});

			this.errorHandlerService.handleError({
				error: autError,
				service: AuthService.name
			});

			throw autError;
		}

		const passwordHash = await hashPassword(form.password);

		const newUser = await this.userRepository.create(
			new UserDbModel({
				email: form.email,
				passwordHash: passwordHash,
				firstName: form.firstName,
				lastName: form.lastName,
				color: form.color,
				image: form.image
			})
		);

		return newUser;
	}
}

export default AuthService;
