import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

export async function hashPassword(password: string) {
	const saltRounds = process.env.BCRYPT_SALT_ROUNDS;
	if (!saltRounds) {
		throw new Error('BCRYPT_SALT_ROUNDS is not set in .env file.');
	}

	const hash = await bcrypt.hash(password, parseInt(saltRounds, 10));
	return hash;
}

export async function verifyPassword(password: string, hash: string) {
	const match = await bcrypt.compare(password, hash);
	return match;
}
