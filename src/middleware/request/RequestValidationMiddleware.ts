import { NextFunction, Request, Response } from 'express';
import Container from 'typedi';
import ResponseService from '../../services/response/ResponseService';
import ErrorHandlerService from '../../services/ErrorHandlerService';
import DefinedBaseError, {
	ValidateRequestFormError,
	ValidateRequestParamError,
	ValidationError
} from '../../models/error/Errors';
import Joi from 'joi';
import { ValidateRequestQueryError } from '../../models/error/Errors';

// 1. Common Interfaces
interface ValidationStrategy {
	validate(req: Request): ValidationResult;
}

interface ValidationResult {
	isValid: boolean;
	value?: any;
	errors?: DefinedBaseError[];
}

// 2. Validation Strategies
/**
 * Represents a validation strategy for validating request body.
 */
export class RequestBodyValidationStrategy implements ValidationStrategy {
	/**
	 * Creates an instance of RequestBodyValidationStrategy.
	 * @param schema - The Joi schema used for validation.
	 */
	constructor(private schema: Joi.ObjectSchema) {}

	/**
	 * Validates the request body.
	 * @param req - The request object.
	 * @returns The validation result.
	 */
	validate(req: Request): ValidationResult {
		const { error, value } = this.schema.validate(req.body, {
			abortEarly: false
		});

		if (error) {
			return {
				isValid: false,
				errors: error.details.map(
					(err) => new ValidateRequestFormError(err.message)
				)
			};
		} else {
			return { isValid: true, value };
		}
	}
}

/**
 * Represents a validation strategy for request parameters.
 */
export class RequestParamValidationStrategy implements ValidationStrategy {
	/**
	 * Creates an instance of RequestParamValidationStrategy.
	 * @param schema - The Joi schema used for validation.
	 */
	constructor(private schema: Joi.ObjectSchema) {}

	/**
	 * Validates the request parameters.
	 * @param req - The request object.
	 * @returns The validation result.
	 */
	validate(req: Request): ValidationResult {
		const { error, value } = this.schema.validate(req.params, {
			abortEarly: true
		});

		if (error) {
			return {
				isValid: false,
				errors: error.details.map(
					(err) => new ValidateRequestParamError(err.message)
				)
			};
		} else {
			return { isValid: true, value };
		}
	}
}

/**
 * Represents a validation strategy for request query parameters.
 */
export class RequestQueryValidationStrategy implements ValidationStrategy {
	/**
	 * Creates an instance of RequestQueryValidationStrategy.
	 * @param schema - The Joi schema used for validation.
	 */
	constructor(private schema: Joi.ObjectSchema) {}

	/**
	 * Validates the request query parameters.
	 * @param req - The request object.
	 * @returns The validation result.
	 */
	validate(req: Request): ValidationResult {
		const { error, value } = this.schema.validate(req.query, {
			abortEarly: true
		});

		if (error) {
			return {
				isValid: false,
				errors: error.details.map(
					(err) => new ValidateRequestQueryError(err.message)
				)
			};
		} else {
			return { isValid: true, value };
		}
	}
}

// 3. Generic Middleware
/**
 * Middleware function that performs request validation using a specified validation strategy.
 * @param strategy The validation strategy to use.
 * @returns The middleware function.
 */
export function requestValidator(strategy: ValidationStrategy) {
	return async (req: Request, res: Response, next: NextFunction) => {
		const responseService = Container.get(ResponseService);
		const errorHandlerService = Container.get(ErrorHandlerService);

		const result = strategy.validate(req);

		if (!result.isValid) {
			const errorMessage = result
				.errors!.map((error) => error.message)
				.join('\n');

			const validationError = new ValidationError({
				message: errorMessage,
				cause: result.errors![0]
			});

			errorHandlerService.handleError({
				error: validationError,
				service: 'RequestValidationMiddleware'
			});

			responseService.sendError(
				res,
				validationError,
				req.headers.requestId as string
			);
		} else {
			next();
		}
	};
}
