import { Request, Response } from 'express';
import { Service } from 'typedi';
import jwt from 'jsonwebtoken';

import dotenv from 'dotenv';
import { SignInForm } from '../../models/forms/auth/SignInForm';
import AuthService from '../../services/auth/AuthService';
import { RegistrationForm } from '../../models/forms/auth/RegistrationForm';
dotenv.config();

@Service()
class AuthenticateController {
	constructor(private authService: AuthService) {}

	public async signin(req: Request, res: Response): Promise<void> {
		const signinForm = req.body as SignInForm;
		const accessToken = await this.authService.signin(signinForm);
		if (!accessToken) {
			// Unauthorized
			res.status(401).send('Invalid email or password.');
			return;
		}

		res.json({ data: accessToken });
	}

	public async register(req: Request, res: Response): Promise<void> {
		const registrationForm = req.body as RegistrationForm;
		const userDbModel = await this.authService.register(registrationForm);
		if (!userDbModel) {
			res.status(401).send('User already exists.');
			return;
		}

		res.json({
			data: {
				id: userDbModel.id,
				username: userDbModel.username,
				email: userDbModel.email
			}
		});
	}
}

export default AuthenticateController;
