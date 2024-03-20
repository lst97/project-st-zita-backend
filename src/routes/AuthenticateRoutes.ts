import express from 'express';
import AuthenticateController from '../controllers/auth/AuthenticateController';
import RequestValidationMiddleware, {
	RequestBodyValidationStrategy
} from '../middleware/request/RequestValidationMiddleware';
import { AuthSchema } from '../schemas/AuthSchema';
import { inject, injectable } from 'inversify';

/**
 * Represents a class that handles authentication routes.
 */
@injectable()
class AuthenticateRoutes {
	private router: express.Router;

	public get routers(): express.Router {
		return this.router;
	}

	constructor(
		@inject(AuthenticateController)
		private authController: AuthenticateController,
		@inject(RequestValidationMiddleware)
		private requestValidationMiddleware: RequestValidationMiddleware
	) {
		this.router = express.Router();
		this.configureRoutes();
	}

	public configureRoutes(): void {
		this.router.post(
			'/auth/signin',
			this.requestValidationMiddleware.requestValidator(
				new RequestBodyValidationStrategy(AuthSchema.signinFormSchema)
			),
			(req, res) => this.authController.signin(req, res)
		);
		this.router.post(
			'/auth/register',
			this.requestValidationMiddleware.requestValidator(
				new RequestBodyValidationStrategy(
					AuthSchema.registrationFormSchema
				)
			),
			(req, res) => this.authController.register(req, res)
		);
	}

	public get routes(): express.Router {
		return this.router;
	}
}

export default AuthenticateRoutes;
