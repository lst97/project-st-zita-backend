import { Service } from 'typedi';
import { SignInForm } from '../../models/forms/auth/SignInForm';
import UserRepository from '../../repositories/auth/UserRepository';
import { hashPassword, verifyPassword } from '../../utils/HashHelper';
import jwt from 'jsonwebtoken';
import { RegistrationForm } from '../../models/forms/auth/RegistrationForm';
import UserDbModel from '../../models/database/User';
import ErrorHandlerService from '../ErrorHandlerService';
import {
	AuthInvalidEmailError,
	AuthInvalidPasswordError,
	ClientAuthError,
	ServerInvalidEnvConfigError,
	ServiceError
} from '../../models/error/Errors';

@Service()
class AuthService {
	constructor(
		private userRepository: UserRepository,
		private errorHandlerService: ErrorHandlerService
	) {}

	public async signin(form: SignInForm): Promise<string> {
		try {
			const userDbModel = await this.userRepository.findByEmail(
				form.email
			);

			if (!userDbModel) {
				const autError = new AuthInvalidEmailError({
					message: `Email not registered`
				});

				this.errorHandlerService.handleError({
					error: autError,
					service: AuthService.name
				});

				throw autError;
			}

			if (
				(await verifyPassword(
					form.password,
					userDbModel.passwordHash
				)) == false
			) {
				const authError = new AuthInvalidPasswordError({
					message: `Incorrect password`
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
					username: userDbModel.username,
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
		} catch (error) {
			if (
				!(
					error instanceof ClientAuthError ||
					error instanceof ServerInvalidEnvConfigError
				)
			) {
				this.errorHandlerService.handleUnknownServiceError({
					error: error as Error,
					service: AuthService.name,
					errorType: ServiceError
				});
			}
			throw error;
		}
	}

	public async register(form: RegistrationForm): Promise<UserDbModel | null> {
		const userDbModel = await this.userRepository.findByEmail(form.email);
		if (userDbModel) {
			// User already exists
			return null;
		}

		const passwordHash = await hashPassword(form.password);

		const newUser = await this.userRepository.create(
			new UserDbModel({
				email: form.email,
				passwordHash: passwordHash,
				username: form.username,
				color: form.color,
				image: form.image
			})
		);

		return newUser;
	}
}

export default AuthService;
