import { NextFunction, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

export function requestId(req: Request, _res: Response, next: NextFunction) {
	req.headers.requestId = `stzita.requestId.${uuidv4()}`;
	next();
}
