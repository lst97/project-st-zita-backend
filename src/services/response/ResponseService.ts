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
		error: DefinedBaseError,
		requestId: string,
		status?: number
	): void {
		// default as internal server error
		let message = new ResponseMessage(
			this.messageCodeService.Messages.Common.OperationFail.Code,
			this.messageCodeService.Messages.Common.OperationFail.Message
		);

		if (error.traceId === undefined) {
			const response = new BackendStandardResponse({
				status: 'error',
				message: message,
				requestId: requestId
			});
			res.status(status ?? 500).json({ response });
		} else {
			const rootCause = this.errorHandlerService.getRootCause(
				error.traceId
			);
			let status;
			if (rootCause instanceof DefinedBaseError) {
				message = new ResponseMessage(
					rootCause.messageCode,
					rootCause.userMessage
				);
				status = rootCause.httpStatus;
			}

			const response = new BackendStandardResponse({
				status: 'error',
				message: message,
				requestId: requestId
			});
			res.status(status ?? 500).json({ response });
		}
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
