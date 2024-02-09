import { Service } from 'typedi';
import { SignInForm } from '../../models/forms/auth/SignInForm';
import UserRepository from '../../repositories/auth/UserRepository';
import { hashPassword, verifyPassword } from '../../utils/HashHelper';
import jwt from 'jsonwebtoken';
import { RegistrationForm } from '../../models/forms/auth/RegistrationForm';
import UserDbModel from '../../models/database/User';

@Service()
class AuthService {
	constructor(private userRepository: UserRepository) {}

	public async signin(form: SignInForm): Promise<string | null> {
		const userDbModel = await this.userRepository.findByEmail(form.email);
		if (!userDbModel) {
			return null;
		}

		const passwordHash = await hashPassword(form.password);
		if (await verifyPassword(passwordHash, userDbModel.passwordHash)) {
			console.log(
				`client hashed password: ${passwordHash}, db hashed password: ${userDbModel.passwordHash}`
			);
			return null;
		}

		const role = 'NOT_IMPLEMENTED';
		const permission = 'NOT_IMPLEMENTED';
		const secret = process.env.ACCESS_TOKEN_SECRET;
		if (!secret) {
			throw new Error('ACCESS_TOKEN_SECRET is not set in .env file.');
		}

		const accessToken = jwt.sign(
			{
				id: userDbModel.id,
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
