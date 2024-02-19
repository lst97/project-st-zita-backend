import { Service } from 'typedi';
import { createLogger, transports, format, Logger } from 'winston';
import DefinedBaseError, {
	DatabaseError,
	ServiceError
} from '../models/error/Errors';
import { SQLite3QueryService } from '../utils/SQLiteHelper';

interface HandlerErrorParams {
	error: Error;
	service: string;
	query?: string;
	traceId?: string;
}

@Service()
class ErrorHandlerService {
	private logger: Logger;
	private errorStacks: Map<string, Error[]> = new Map();

	constructor() {
		this.logger = this.createLogger({
			transports: [new transports.Console()],
			format: format.combine(
				format.colorize(),
				format.timestamp(),
				format.printf(({ timestamp, level, message, service }) => {
					return `[${timestamp}] ${service} ${level}: ${message}`;
				})
			)
		});
	}

	private createLogger(options: any): Logger {
		return createLogger(options);
	}

	private log(error: Error): void {
		if (error instanceof DefinedBaseError) {
			this.logger.error(`${error.message} - ${error.traceId}`);
		} else {
			this.logger.error(error.message);
		}
	}

	private handleSqlError(error: DatabaseError): void {
		if (this.errorStacks.has(error.traceId)) {
			this.errorStacks.get(error.traceId)!.push(error);
		} else {
			this.errorStacks.set(error.traceId, [error]);
		}

		this.log(error);
	}

	private handleServiceError(error: ServiceError): void {
		if (this.errorStacks.has(error.traceId)) {
			this.errorStacks.get(error.traceId)!.push(error);
		} else {
			this.errorStacks.set(error.traceId, [error]);
		}

		this.log(error);
	}

	public getRootCause(traceId: string): Error | null {
		if (this.errorStacks.has(traceId)) {
			return this.errorStacks.get(traceId)![0];
		}
		return null;
	}

	public handleError({
		error,
		service,
		query,
		traceId
	}: HandlerErrorParams): void {
		this.logger.defaultMeta = { service: service };

		if (traceId) {
			this.errorStacks.get(traceId)!.push(error);
		} else {
			if (service === SQLite3QueryService.name) {
				// Error defined by SQLite3
				new DatabaseError({ query: query, cause: error });
			}
			if (error instanceof DatabaseError) {
				// Defined error
				this.handleSqlError(error);
			} else if (error instanceof ServiceError) {
				this.log(error);
			} else {
				// Generic error which is not defined
			}
		}
	}
}

export default ErrorHandlerService;
