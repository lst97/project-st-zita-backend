import { Response } from 'express';
import { Service } from 'typedi';
import BackendStandardResponse, {
	ResponseMessage
} from '../../models/share/api/Response';
import ErrorHandlerService from '../ErrorHandlerService';
import { MessageCodeService } from './MessageCodeService';
import DefinedBaseError, {
	DatabaseError,
	ServerError
} from '../../models/error/Errors';

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
	): Response<any, Record<string, any>> {
		let message = null;
		let traceId = '';

		if (!(error instanceof DefinedBaseError)) {
			// TODO: extract the traceId from the error
			this.errorHandlerService.handleUnknownError({
				error: error as Error,
				service: ResponseService.name
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

		if (
			error instanceof ServerError ||
			error instanceof DatabaseError ||
			!message
		) {
			message = new ResponseMessage(
				this.messageCodeService.Messages.Common.OperationFail.Code,
				this.messageCodeService.Messages.Common.OperationFail.Message
			);
		}

		const response = new BackendStandardResponse({
			status: 'error',
			message: message,
			requestId: requestId,
			traceId: traceId
		});
		return res.status(httpStatus ?? 500).json(response);
	}

	public sendSuccess(
		res: Response,
		data: any,
		requestId: string,
		status?: number
	): Response<any, Record<string, any>> {
		status = status ?? 200;

		const response = new BackendStandardResponse({
			status: 'success',
			message: new ResponseMessage(
				this.messageCodeService.Messages.Common.OperationSuccess.Code,
				this.messageCodeService.Messages.Common.OperationSuccess.Message
			),
			data: data,
			requestId: requestId
		});
		return res.status(status).json(response);
	}
}

export default ResponseService;
