import Joi from 'joi';
import { isValidWeekViewId } from '../utils/DateTimeHelper';

export class CommonSchema {
	static urlParamUuidSchema = Joi.object({
		id: Joi.string().guid({ version: 'uuidv4', separator: '-' })
	});

	static urlQueryWeekViewIdSchema = Joi.object({
		weekViewId: Joi.string().custom((value, helpers) => {
			if (!isValidWeekViewId(value)) {
				return helpers.message({ custom: 'Invalid week view ID' });
			}
			return value;
		})
	});
}
