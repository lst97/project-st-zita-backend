import jwt from 'jsonwebtoken';
import { NextFunction, Request, Response } from 'express';
import { JwtPayload } from '../../models/auth/JwtPayload';
import {
	DefinedBaseError,
	AuthAccessDeniedError,
	AuthAccessTokenMissingError,
	ServerInvalidEnvConfigError
} from '@lst97/common_response';
import Container from 'typedi';
import { ErrorHandlerService } from '@lst97/common_response';
import { ResponseService } from '@lst97/common_response';

export const verifyToken = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const errorHandlerService = Container.get(ErrorHandlerService);
	const responseService = Container.get(ResponseService);

	const authHeader = req.headers['authorization'];
	// Authorization: Bearer <token>
	const token = authHeader && authHeader.split(' ')[1];

	try {
		if (token == null) {
			throw new AuthAccessTokenMissingError({ request: req });
		}

		const secret = process.env.ACCESS_TOKEN_SECRET;
		if (!secret) {
			throw new ServerInvalidEnvConfigError({
				message: 'ACCESS_TOKEN_SECRET is not set in .env file.'
			});
		}

		jwt.verify(token, secret, (err, decoded) => {
			if (err || !decoded || typeof decoded === 'string') {
				throw new AuthAccessDeniedError({ request: req });
			}

			const expiration = decoded.exp!;
			const now = new Date().getTime() / 1000;
			if (now > expiration) {
				throw new AuthAccessDeniedError({ request: req });
			}

			req.user = JwtPayload.fromObject(decoded);

			next();
		});
	} catch (error) {
		if (error instanceof DefinedBaseError) {
			errorHandlerService.handleError({
				error: error,
				service: verifyToken.name
			});

			return responseService.sendError(
				res,
				error,
				req.headers.requestId as string
			);
		} else {
			errorHandlerService.handleUnknownError({
				error: error as Error,
				service: verifyToken.name
			});

			const rootCause = errorHandlerService.getDefinedBaseError(
				req.headers.requestId as string
			)!;

			return responseService.sendError(
				res,
				rootCause,
				req.headers.requestId as string
			);
		}
	}
};
