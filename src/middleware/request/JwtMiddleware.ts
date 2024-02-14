import jwt from 'jsonwebtoken';
import { NextFunction, Request, Response } from 'express';
import { JwtPayload } from '../../models/auth/JwtPayload';

export const verifyToken = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	// Typically, the token is sent in the Authorization header
	const authHeader = req.headers['authorization'];
	// Authorization: Bearer <token>
	const token = authHeader && authHeader.split(' ')[1];

	if (token == null) {
		return res.status(401).send('Unauthorized'); // If no token is provided, return an unauthorized error
	}

	const secret = process.env.ACCESS_TOKEN_SECRET;
	if (!secret) {
		throw new Error('ACCESS_TOKEN_SECRET is not set in .env file.');
	}

	jwt.verify(token, secret, (err, decoded) => {
		if (err || !decoded || typeof decoded === 'string') {
			return res.status(403).send('Invalid token'); // Forbidden if token is invalid
		}

		const expiration = decoded.exp!;
		const now = new Date().getTime() / 1000;
		if (now > expiration) {
			return res.status(403).send('Token expired');
		}

		req.user = JwtPayload.fromObject(decoded);

		next();
	});
};
