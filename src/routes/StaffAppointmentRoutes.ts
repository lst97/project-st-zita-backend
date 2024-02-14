import express from 'express';
import { StaffAppointmentController } from '../controllers/scheduler/StaffAppointmentController';
import { Container } from 'typedi';
import { verifyToken } from '../middleware/request/JwtMiddleware';

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

router.post('/appointments/share', verifyToken, (req, res) =>
	staffAppointmentController.createShareAppointments(req, res)
);

router.get('/shared_appointments/:id', (req, res) =>
	staffAppointmentController.getSharedAppointments(req, res)
);

export default router;
