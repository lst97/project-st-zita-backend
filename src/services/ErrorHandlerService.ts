import { Service } from 'typedi';

import DefinedBaseError, {
	ClientAuthError,
	ControllerError,
	DatabaseError,
	ServerError,
	ServiceError,
	ValidationError
} from '../models/error/Errors';
import LogService from './LogService';
import { Request } from 'express';

interface HandleErrorParams {
	error: Error;
	service: string;
	query?: string;
	traceId?: string;
	req?: Request;
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

// TODO: need to clean up the errorChains using the traceId when the request is done to prevent memory leak
@Service()
class ErrorHandlerService {
	private errorChains: Map<string, DefinedBaseError> = new Map();

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

			if (error instanceof ClientAuthError) {
				logMessage.push(`userId: ${error.userId ?? 'N/A'}`);
			}

			this.logger.error(logMessage.join('\n'));
		} else {
			this.logger.error(`Unhandled error: ${error.message}`);
		}
	}

	private _handleError<T extends DefinedBaseError>(error: T): void {
		if (this.errorChains.has(error.traceId)) {
			error.cause = this.errorChains.get(error.traceId);
			this.errorChains.set(error.traceId, error);
		} else {
			this.errorChains.set(error.traceId, error);
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

	private handleClientAuthError(error: ClientAuthError): void {
		this._handleError(error);
	}

	private _handleUnknownError(error: Error): void {
		const serverError = new ServerError({ cause: error });
		this._handleError(serverError);
	}

	private handleControllerError(error: ControllerError): void {
		this._handleError(error);
	}

	private handleValidationError(error: ValidationError): void {
		this._handleError(error);
	}

	public getDefinedBaseError(traceId: string): DefinedBaseError | null {
		if (this.errorChains.has(traceId)) {
			let chain = this.errorChains.get(traceId);

			let rootBaseError = chain;
			while (chain?.cause && chain.cause instanceof DefinedBaseError) {
				rootBaseError = chain;
				chain = chain.cause;
			}

			return rootBaseError!;
		}
		return null;
	}

	public handleError({ error, service, req }: HandleErrorParams): void {
		this.logger.setServiceName(service);

		if (error instanceof DatabaseError) {
			this.handleSqlError(error);
		} else if (error instanceof ServiceError) {
			this.handleServiceError(error);
		} else if (error instanceof ControllerError) {
			this.handleControllerError(error);
		} else if (error instanceof ServerError) {
			this.handleServerError(error);
		} else if (error instanceof ClientAuthError) {
			this.handleClientAuthError(error);
		} else if (error instanceof ValidationError) {
			this.handleValidationError(error);
		} else {
			this._handleUnknownError(error);
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
