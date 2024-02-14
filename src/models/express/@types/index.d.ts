import { JwtPayload } from '../../auth/JwtPayload';

declare module 'express-serve-static-core' {
	export interface Request {
		user: JwtPayload;
	}
}
