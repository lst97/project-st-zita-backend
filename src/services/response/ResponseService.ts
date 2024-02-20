import { Response } from 'express';
import { Service } from 'typedi';
import BackendStandardResponse, {
	ResponseMessage
} from '../../models/share/api/Response';
import ErrorHandlerService from '../ErrorHandlerService';
import { MessageCodeService } from './MessageCodeService';
import DefinedBaseError from '../../models/error/Errors';

@Service()
class ResponseService {
	constructor(
		private errorHandlerService: ErrorHandlerService,
		private messageCodeService: MessageCodeService
	) {}
	public sendError(
		res: Response,
		error: Error,
		requestId: string,
		httpStatus?: number
	): void {
		// default as internal server error
		let message = new ResponseMessage(
			this.messageCodeService.Messages.Common.OperationFail.Code,
			this.messageCodeService.Messages.Common.OperationFail.Message
		);
		let traceId = '';

		if (!(error instanceof DefinedBaseError)) {
			this.errorHandlerService.handleUnknownError({
				error: error as Error,
				service: this.sendError.caller.name
			});
		} else {
			const rootCause = this.errorHandlerService.getDefinedBaseError(
				error.traceId
			)!;

			message = new ResponseMessage(
				rootCause.messageCode,
				rootCause.userMessage
			);

			traceId = rootCause.traceId;

			httpStatus = error.httpStatus;
		}

		const response = new BackendStandardResponse({
			status: 'error',
			message: message,
			requestId: requestId,
			traceId: traceId
		});
		res.status(httpStatus ?? 500).json({ response });
	}

	public sendSuccess(
		res: Response,
		data: any,
		requestId: string,
		status: number = 200
	): void {
		const response = new BackendStandardResponse({
			status: 'success',
			message: new ResponseMessage(
				this.messageCodeService.Messages.Common.OperationSuccess.Code,
				this.messageCodeService.Messages.Common.OperationSuccess.Message
			),
			data: data,
			requestId: requestId
		});
		res.status(status).json(response);
	}
}

export default ResponseService;
