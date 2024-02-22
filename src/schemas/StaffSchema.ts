import Joi from 'joi';
import { IBaseSchema } from './IBaseSchema';

export class StaffSchema implements IBaseSchema {
	static createFormSchema = Joi.object({
		staffName: Joi.string().max(64).required(),
		image: Joi.alternatives()
			.try(Joi.string().base64(), Joi.string().uri())
			.optional(),
		color: Joi.string()
			.pattern(/^#[0-9A-F]{6}$/i)
			.required(),
		email: Joi.string().email().optional(),
		phoneNumber: Joi.string()
			.pattern(/^(\+\d{1,3})?\d{10,15}$/) // +1234567890123 or 1234567890123
			.optional()
	});

	static urlParamSchema = Joi.object({});

	// weekViewId=14-2024
	static urlQuerySchema = Joi.object({});
}
