import express from 'express';
import { Container } from 'typedi';
import AuthenticateController from '../controllers/auth/AuthenticateController';
import {
	RequestBodyValidationStrategy,
	requestValidator
} from '../middleware/request/RequestValidationMiddleware';
import { AuthSchema } from '../schemas/AuthSchema';

const router = express.Router();

const authController = Container.get(AuthenticateController);

router.post(
	'/auth/signin',
	requestValidator(
		new RequestBodyValidationStrategy(AuthSchema.signinFormSchema)
	),
	(req, res) => authController.signin(req, res)
);
router.post(
	'/auth/register',
	requestValidator(
		new RequestBodyValidationStrategy(AuthSchema.registrationFormSchema)
	),
	(req, res) => authController.register(req, res)
);

export default router;
