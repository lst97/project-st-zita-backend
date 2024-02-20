import Container from 'typedi';
import { MessageCodeService } from '../../services/response/MessageCodeService';
import { v4 as uuidv4 } from 'uuid';

interface SqlErrorParams {
	message?: string;
	query?: string;
	cause?: Error;
}

interface DatabaseErrorParams {
	query?: string;
	messageCode?: string;
	message?: string;
	cause?: Error;
}

interface ServiceErrorParams {
	message?: string;
	messageCode?: string;
	cause?: Error;
}

interface ServerErrorParams {
	message?: string;
	messageCode?: string;
	cause?: Error;
}

interface UnknownErrorParams {
	message?: string;
	cause?: Error;
}

class DefinedBaseError extends Error {
	httpStatus: number;
	userMessage: string;
	messageCode: string;
	traceId: string;
	cause?: Error;

	constructor(
		message: string,
		httpStatus: number,
		messageCode: string,
		userMessage?: string
	) {
		super(message);
		this.httpStatus = httpStatus;
		this.userMessage = userMessage || message;
		this.messageCode = messageCode;
		this.traceId = `stzita.traceId.${uuidv4()}`;
	}
}

export class UnknownError extends Error {
	constructor({ message, cause }: UnknownErrorParams) {
		super(message);
		this.cause = cause;
	}
}
export class ServerError extends DefinedBaseError {
	constructor({ message, messageCode, cause }: ServerErrorParams) {
		const messageCodeService = Container.get(MessageCodeService);
		const defaultFailedOperation =
			messageCodeService.Messages.Common.OperationFail;

		const responseMessage = messageCode
			? messageCodeService.getResponseMessageByCode(messageCode)
			: null;

		super(
			message ??
				responseMessage?.Message ??
				defaultFailedOperation.Message,
			responseMessage?.StatusCode ?? defaultFailedOperation.StatusCode,
			messageCode ?? defaultFailedOperation.Code
		);

		if (this.cause === undefined) {
			this.cause = cause;
		}
	}
}

export class ServiceError extends DefinedBaseError {
	// Generic service error
	constructor({ message, messageCode, cause }: ServiceErrorParams) {
		const messageCodeService = Container.get(MessageCodeService);
		const defaultFailedOperation =
			messageCodeService.Messages.Common.OperationFail;

		const responseMessage = messageCode
			? messageCodeService.getResponseMessageByCode(messageCode)
			: null;

		super(
			message ??
				responseMessage?.Message ??
				defaultFailedOperation.Message,
			responseMessage?.StatusCode ?? defaultFailedOperation.StatusCode,
			messageCode ?? defaultFailedOperation.Code
		);

		if (this.cause === undefined) {
			this.cause = cause;
		}
	}
}

export class ControllerError extends DefinedBaseError {
	// Generic controller error
	constructor(message?: string) {
		const defaultMessage =
			Container.get(MessageCodeService).Messages.Common.OperationFail;

		super(
			message || defaultMessage.Message,
			defaultMessage.StatusCode,
			defaultMessage.Code
		);
	}
}

export class DatabaseError extends DefinedBaseError {
	// Generic database error
	query?: string;

	constructor({ message, messageCode, cause, query }: DatabaseErrorParams) {
		const messageCodeService = Container.get(MessageCodeService);
		const defaultFailedOperation =
			messageCodeService.Messages.Sql.OperationFail;

		const responseMessage = messageCode
			? messageCodeService.getResponseMessageByCode(messageCode)
			: null;

		super(
			message ??
				responseMessage?.Message ??
				defaultFailedOperation.Message,
			responseMessage?.StatusCode ?? defaultFailedOperation.StatusCode,
			messageCode ?? defaultFailedOperation.Code
		);

		this.query = query;
		if (this.cause === undefined && cause) {
			this.cause = cause;
		}
	}
}

export class ServerResourceNotFoundError extends DefinedBaseError {
	constructor(message?: string) {
		const defaultMessage =
			Container.get(MessageCodeService).Messages.Common.ResourceNotFound;

		super(
			message || defaultMessage.Message,
			defaultMessage.StatusCode,
			defaultMessage.Code
		);
	}
}

export class ServerInternalError extends DefinedBaseError {
	constructor(message?: string) {
		const defaultMessage =
			Container.get(MessageCodeService).Messages.Common.OperationFail;

		super(
			message || defaultMessage.Message,
			defaultMessage.StatusCode,
			defaultMessage.Code
		);
	}
}

export class SqlCreateError extends DatabaseError {
	constructor({ message, query, cause }: SqlErrorParams) {
		const defaultMessage =
			Container.get(MessageCodeService).Messages.Sql.CreateFail;

		super({ message: message || defaultMessage.Message, cause });

		this.query = query;
	}
}

export class SqlReadError extends DatabaseError {
	query?: string;

	constructor({ message, query, cause }: SqlErrorParams) {
		const defaultMessage =
			Container.get(MessageCodeService).Messages.Sql.OperationFail;

		super({ message: message || defaultMessage.Message, cause });

		this.query = query;
	}
}

export class SqlUpdateError extends DatabaseError {
	query?: string;

	constructor({ message, query, cause }: SqlErrorParams) {
		const defaultMessage =
			Container.get(MessageCodeService).Messages.Sql.UpdateFail;

		super({ message: message || defaultMessage.Message, cause });

		this.query = query;
	}
}

export class SqlDeleteError extends DatabaseError {
	query?: string;

	constructor({ message, query, cause }: SqlErrorParams) {
		const defaultMessage =
			Container.get(MessageCodeService).Messages.Sql.DeleteFail;

		super({ message: message || defaultMessage.Message, cause });

		this.query = query;
	}
}

export class SqlRecordNotFoundError extends DatabaseError {
	query?: string;

	constructor({ message, query, cause }: SqlErrorParams) {
		const defaultMessage =
			Container.get(MessageCodeService).Messages.Sql.RecordNotFound;

		super({ message: message || defaultMessage.Message, cause });

		this.query = query;
	}
}

export class SqlOperationFailError extends DatabaseError {
	query?: string;

	constructor({ message, query, cause }: SqlErrorParams) {
		const defaultMessage =
			Container.get(MessageCodeService).Messages.Sql.OperationFail;

		super({ message: message || defaultMessage.Message, cause });

		this.query = query;
	}
}

export class SqlRecordExistsError extends DatabaseError {
	query?: string;

	constructor({ message, query, cause }: SqlErrorParams) {
		const defaultMessage =
			Container.get(MessageCodeService).Messages.Sql.RecordExists;

		super({
			message: message || defaultMessage.Message,
			messageCode: defaultMessage.Code,
			cause
		});

		if (this.cause === undefined) {
			this.cause = this;
		}

		this.query = query;
	}
}

export default DefinedBaseError;