import { NextFunction, Request, Response } from 'express';
import { injectable } from 'inversify';
import { v4 as uuidv4 } from 'uuid';
import appConfig from '../../configs/config';

@injectable()
export class RequestHeaderMiddleware {
	public static requestId(req: Request, _res: Response, next: NextFunction) {
		req.headers.requestId = `${
			appConfig.appIdentifier.name
		}.requestId.${uuidv4()}`;
		next();
	}
}
