import Joi from 'joi';
import { IBaseSchema } from './IBaseSchema';

export class AuthSchema implements IBaseSchema {
	static signinFormSchema = Joi.object({
		email: Joi.string().email().required(),
		password: Joi.string().min(8).required().messages({
			'string.min': 'Invalid password'
		})
	});

	static registrationFormSchema = Joi.object({
		firstName: Joi.string().min(2).max(64).required(),
		lastName: Joi.string().min(2).max(64).required(),
		email: Joi.string().email().required(),
		password: Joi.string().min(8).required(),
		color: Joi.string()
			.pattern(/^#[0-9A-F]{6}$/i)
			.required(),
		image: Joi.alternatives()
			.try(Joi.string().base64(), Joi.string().uri())
			.optional(),
		phoneNumber: Joi.string()
			.pattern(/^(\+\d{1,3})?\d{10,15}$/)
			.optional()
	});

	static urlParamSchema = Joi.object({});

	// weekViewId=14-2024
	static urlQuerySchema = Joi.object({});
}
