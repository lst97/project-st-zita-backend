import Joi from 'joi';
import { isValidWeekViewId } from '../utils/DateTimeHelper';
import { IBaseSchema } from './IBaseSchema';
import { CommonSchema } from './CommonSchema';

export class ShareAppointmentSchema implements IBaseSchema {
	static createFormSchema = Joi.object({
		userId: Joi.string()
			.guid({ version: ['uuidv4'] }) // Strict GUID v4 validation
			.optional(),

		permission: Joi.string()
			// TODO improve this regex
			.pattern(/^\d+$/) // Only numeric characters
			.custom((value, helpers) => {
				if (Number(value) % 1 !== 0) {
					// Check for decimals
					return helpers.message({ custom: 'Invalid permission' });
				}
				return value;
			})
			.required(),

		weekViewIds: Joi.array()
			.items(
				Joi.string().custom((value, helpers) => {
					if (!isValidWeekViewId(value)) {
						return helpers.message({
							custom: 'Invalid week view ID'
						});
					}
					return value;
				})
			)
			.optional(),

		expiry: Joi.date()
			.min('now') // Can't be earlier than the current time
			.optional()
	});

	static urlParamSchema = CommonSchema.urlParamUuidSchema;

	// weekViewId=14-2024
	static urlQuerySchema = CommonSchema.urlQueryWeekViewIdSchema;
}
