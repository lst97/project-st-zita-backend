import { JwtPayload } from '../../Auth/JwtPayload';

declare module 'express-serve-static-core' {
	export interface Request {
		user: JwtPayload;
	}
}
