import express from 'express';
import { StaffAppointmentController } from '../controllers/scheduler/StaffAppointmentController';
import { Container } from 'typedi';
import { verifyToken } from '../middleware/request/JwtMiddleware';
import {
	RequestBodyValidationStrategy,
	RequestParamValidationStrategy,
	RequestQueryValidationStrategy,
	requestValidator
} from '../middleware/request/RequestValidationMiddleware';
import { ShareAppointmentSchema } from '../schemas/ShareAppointmentSchema';

const router = express.Router();

const staffAppointmentController = Container.get(StaffAppointmentController);

router.get('/appointments/week_view/:id', verifyToken, (req, res) =>
	staffAppointmentController.getAllAppointmentsByWeekViewId(req, res)
);

router.post('/appointments', verifyToken, (req, res) =>
	staffAppointmentController.createAppointments(req, res)
);

router.delete('/appointments/week_view/:id', verifyToken, (req, res) =>
	staffAppointmentController.deleteAllAppointmentsByWeekViewIdAndStaffName(
		req,
		res
	)
);

router.post(
	'/appointments/share',
	verifyToken,
	requestValidator(
		new RequestBodyValidationStrategy(
			ShareAppointmentSchema.createFormSchema
		)
	),
	(req, res) => staffAppointmentController.createShareAppointments(req, res)
);

// uuidv4&weekViewId=142024
router.get(
	'/shared_appointments/:id',
	requestValidator(
		new RequestParamValidationStrategy(
			ShareAppointmentSchema.urlParamSchema
		)
	),
	requestValidator(
		new RequestQueryValidationStrategy(
			ShareAppointmentSchema.urlQuerySchema
		)
	),
	(req, res) => staffAppointmentController.getSharedAppointments(req, res)
);

router.post('/appointments/export/excel', verifyToken, (req, res) =>
	// TODO: validation if the dates is a valid date (only 7 days is allowed to export)
	staffAppointmentController.exportAppointmentsAsExcel(req, res)
);

router.delete('/appointments', verifyToken, (req, res) =>
	staffAppointmentController.deleteAppointmentByDateAndStaffName(req, res)
);

export default router;
