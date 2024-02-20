import { Service } from 'typedi';

import DefinedBaseError, {
	ControllerError,
	DatabaseError,
	ServerError,
	ServiceError,
	UnknownError
} from '../models/error/Errors';
import LogService from './LogService';

interface HandleErrorParams {
	error: Error;
	service: string;
	query?: string;
	traceId?: string;
}

interface HandleUnknownDatabaseErrorParams {
	error: Error;
	service: string;
	query: string;
	errorType: new (...args: any[]) => DatabaseError;
}

interface HandleUnknownServiceErrorParams {
	error: Error;
	service: string;
	errorType: new (...args: any[]) => ServiceError;
}

interface HandleUnknownControllerErrorParams {
	error: Error;
	service: string;
	errorType: new (...args: any[]) => ControllerError;
}

interface HandleUnknownServerErrorParams {
	error: Error;
	service: string;
	errorType: new (...args: any[]) => ServerError;
}

interface HandleUnknownErrorParams {
	error: Error;
	service: string;
}
@Service()
class ErrorHandlerService {
	private errorStacks: Map<string, Error[]> = new Map();

	constructor(private logger: LogService) {}

	private log(error: Error): void {
		if (error instanceof DefinedBaseError) {
			const logMessage = [
				`${error.message} - ${error.traceId}`,
				error.stack,
				`httpStatus: ${error.httpStatus ?? 'N/A'}`,
				`userMessage: ${error.userMessage ?? 'N/A'}`,
				`messageCode: ${error.messageCode ?? 'N/A'}`,
				`traceId: ${error.traceId}`,
				`cause: ${error.cause ?? 'N/A'}`
			];

			// Optional Logging by Type
			if (error instanceof DatabaseError) {
				logMessage.push(`query: ${error.query ?? 'N/A'}`);
			}

			this.logger.error(logMessage.join('\n'));
		} else {
			this.logger.error(`Unhandled error: ${error.message}`);
		}
	}

	private _handleError<T extends DefinedBaseError>(error: T): void {
		if (this.errorStacks.has(error.traceId)) {
			this.errorStacks.get(error.traceId)!.push(error);
		} else {
			this.errorStacks.set(error.traceId, [error]);
		}

		this.log(error);
	}

	private handleSqlError(error: DatabaseError): void {
		this._handleError(error);
	}

	private handleServiceError(error: ServiceError): void {
		this._handleError(error);
	}

	private handleServerError(error: ServerError): void {
		this._handleError(error);
	}

	private _handleUnknownError(error: Error): void {
		const unknownError = new UnknownError({ cause: error });
		const serverError = new ServerError({ cause: unknownError });
		this._handleError(serverError);
	}

	private handleControllerError(error: ControllerError): void {
		this._handleError(error);
	}

	public getRootCause(traceId: string): Error | null {
		if (this.errorStacks.has(traceId)) {
			return this.errorStacks.get(traceId)![0];
		}
		return null;
	}

	public getDefinedBaseError(traceId: string): DefinedBaseError | null {
		if (this.errorStacks.has(traceId)) {
			for (let error of this.errorStacks.get(traceId)!) {
				if (error instanceof DefinedBaseError) {
					return error;
				}
			}
		}
		return null;
	}

	public handleError({ error, service, traceId }: HandleErrorParams): void {
		this.logger.setServiceName(service);

		if (traceId) {
			this.errorStacks.get(traceId)!.push(error);
		} else {
			if (error instanceof DatabaseError) {
				this.handleSqlError(error);
			} else if (error instanceof ServiceError) {
				this.handleServiceError(error);
			} else if (error instanceof ControllerError) {
				this.handleControllerError(error);
			} else if (error instanceof ServerError) {
				this.handleServerError(error);
			} else {
				this._handleUnknownError(error);
			}
		}
	}

	public handleUnknownDatabaseError({
		error,
		service,
		query,
		errorType
	}: HandleUnknownDatabaseErrorParams): DatabaseError {
		const unhandledDbError = new errorType({
			query,
			cause: error as Error
		});

		this.handleError({
			error: unhandledDbError,
			service: service,
			query: query
		});
		return unhandledDbError;
	}

	public handleUnknownServiceError({
		error,
		service,
		errorType
	}: HandleUnknownServiceErrorParams): ServiceError {
		const unhandledServiceError = new errorType({
			cause: error as Error
		});
		this.handleError({
			error: unhandledServiceError,
			service: service
		});

		return unhandledServiceError;
	}

	public handleUnknownControllerError({
		error,
		service,
		errorType
	}: HandleUnknownControllerErrorParams): ControllerError {
		const unhandledControllerError = new errorType({
			cause: error as Error
		});
		this.handleError({
			error: unhandledControllerError,
			service: service
		});

		return unhandledControllerError;
	}

	public handleUnknownServerError({
		error,
		service,
		errorType
	}: HandleUnknownServerErrorParams): ServerError {
		const unhandledServerError = new errorType({
			cause: error as Error
		});
		this.handleError({
			error: unhandledServerError,
			service: service
		});

		return unhandledServerError;
	}

	public handleUnknownError({
		error,
		service
	}: HandleUnknownErrorParams): void {
		this.handleError({
			error: error,
			service: service
		});
	}
}

export default ErrorHandlerService;
