import Container from 'typedi';
import { MessageCodeService } from '../../services/response/MessageCodeService';
import { v4 as uuidv4 } from 'uuid';
import { Request } from 'express';

interface SqlErrorParams {
	message?: string;
	query?: string;
	cause?: Error;
}

interface ClientAuthErrorParams {
	message?: string;
	messageCode?: string;
	cause?: Error;
	request?: Request;
	userId?: string;
}

interface PartialErrorParams {
	message?: string;
	messageCode?: string;
	cause?: Error;
}

interface AuthErrorParams {
	message?: string;
	messageCode?: string;
	cause?: Error;
	request?: Request;
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

export class ServerInvalidEnvConfigError extends ServerError {
	constructor({ message }: ServerErrorParams) {
		const defaultMessage =
			Container.get(MessageCodeService).Messages.Server.InvalidEnvConfig;

		super({
			message: message || defaultMessage.Message,
			messageCode: defaultMessage.Code
		});
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

export class ClientAuthError extends DefinedBaseError {
	userId?: string;
	request?: Request;

	constructor({
		message,
		messageCode,
		cause,
		request,
		userId
	}: ClientAuthErrorParams) {
		const defaultMessage =
			Container.get(MessageCodeService).Messages.Auth.AuthFail;

		const responseMessage = messageCode
			? Container.get(MessageCodeService).getResponseMessageByCode(
					messageCode
			  )
			: null;

		super(
			message ?? responseMessage?.Message ?? defaultMessage.Message,
			responseMessage?.StatusCode ?? defaultMessage.StatusCode,
			messageCode ?? defaultMessage.Code
		);

		if (cause === undefined) {
			this.cause = cause;
		}

		this.request = request;
		this.userId = userId;
	}
}

export class AuthAccessDeniedError extends ClientAuthError {
	constructor({ message, request, userId }: ClientAuthErrorParams) {
		const defaultMessage =
			Container.get(MessageCodeService).Messages.Common.AccessDenied;

		super({
			message: message || defaultMessage.Message,
			messageCode: defaultMessage.Code,
			request,
			userId
		});
	}
}

export class AuthInvalidEmailError extends ClientAuthError {
	constructor({ message, messageCode, cause, request }: AuthErrorParams) {
		const defaultMessage =
			Container.get(MessageCodeService).Messages.Auth.InvalidEmail;

		super({
			message: message || defaultMessage.Message,
			messageCode: messageCode || defaultMessage.Code,
			cause: cause,
			request: request,
			userId: request?.user?.id
		});
	}
}

export class AuthRegistrationFailWithDuplicatedEmailError extends ClientAuthError {
	constructor({ message, messageCode, cause, request }: AuthErrorParams) {
		const defaultMessage =
			Container.get(MessageCodeService).Messages.Auth
				.RegistrationFailWithDuplicatedEmail;

		super({
			message: message || defaultMessage.Message,
			messageCode: messageCode || defaultMessage.Code,
			cause: cause,
			request: request,
			userId: request?.user?.id
		});
	}
}
export class AuthInvalidPasswordError extends ClientAuthError {
	constructor({ message, messageCode, cause, request }: AuthErrorParams) {
		const defaultMessage =
			Container.get(MessageCodeService).Messages.Auth.InvalidPassword;

		super({
			message: message || defaultMessage.Message,
			messageCode: messageCode || defaultMessage.Code,
			cause: cause,
			request: request,
			userId: request?.user?.id
		});
	}
}

export class AuthInvalidCredentialsError extends ClientAuthError {
	constructor({ message, messageCode, cause, request }: AuthErrorParams) {
		const defaultMessage =
			Container.get(MessageCodeService).Messages.Auth.InvalidCredentials;

		super({
			message: message || defaultMessage.Message,
			messageCode: messageCode || defaultMessage.Code,
			cause: cause,
			request: request,
			userId: request?.user?.id
		});
	}
}

export class AuthAccessTokenExpiredError extends ClientAuthError {
	constructor({ message, messageCode, cause, request }: AuthErrorParams) {
		const defaultMessage =
			Container.get(MessageCodeService).Messages.Auth.AccessTokenExpired;

		super({
			message: message || defaultMessage.Message,
			messageCode: messageCode || defaultMessage.Code,
			cause: cause,
			request: request,
			userId: request?.user?.id
		});
	}
}

export class AuthAccessTokenInvalidError extends ClientAuthError {
	constructor({ message, messageCode, cause, request }: AuthErrorParams) {
		const defaultMessage =
			Container.get(MessageCodeService).Messages.Auth.AccessTokenInvalid;

		super({
			message: message || defaultMessage.Message,
			messageCode: messageCode || defaultMessage.Code,
			cause: cause,
			request: request,
			userId: request?.user?.id
		});
	}
}

export class AuthAccessTokenMissingError extends ClientAuthError {
	constructor({ message, messageCode, cause, request }: AuthErrorParams) {
		const defaultMessage =
			Container.get(MessageCodeService).Messages.Auth.AccessTokenMissing;

		super({
			message: message || defaultMessage.Message,
			messageCode: messageCode || defaultMessage.Code,
			cause: cause,
			request: request,
			userId: request?.user?.id
		});
	}
}
//////////// Layer specific errors
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

export class PartialError extends DefinedBaseError {
	// Partial error
	constructor({ message, messageCode, cause }: PartialErrorParams) {
		const messageCodeService = Container.get(MessageCodeService);
		const defaultFailedOperation =
			messageCodeService.Messages.Common.PartialOperationFail;

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

//////////// Leaf errors (database)
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

		this.query = query;
	}
}

export default DefinedBaseError;
