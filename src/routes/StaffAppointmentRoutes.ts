import express from 'express';
import { StaffAppointmentController } from '../controllers/scheduler/StaffAppointmentController';
import { Container } from 'typedi';

const router = express.Router();

const staffAppointmentController = Container.get(StaffAppointmentController);

router.get('/appointments/week_view/:id', (req, res) =>
	staffAppointmentController.getAllAppointmentsByWeekViewId(req, res)
);

router.post('/appointments', (req, res) =>
	staffAppointmentController.createAppointments(req, res)
);

router.delete('/appointments/week_view/:id', (req, res) =>
	staffAppointmentController.deleteAllAppointmentsByWeekViewIdAndStaffName(
		req,
		res
	)
);

export default router;
