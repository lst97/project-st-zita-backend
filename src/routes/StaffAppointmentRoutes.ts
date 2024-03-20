import express from 'express';
import { StaffAppointmentController } from '../controllers/scheduler/StaffAppointmentController';
import { JwtMiddlewareService } from '../middleware/request/JwtMiddleware';
import RequestValidationMiddleware, {
	RequestBodyValidationStrategy,
	RequestParamValidationStrategy,
	RequestQueryValidationStrategy
} from '../middleware/request/RequestValidationMiddleware';
import { ShareAppointmentSchema } from '../schemas/ShareAppointmentSchema';
import container from '../inversify.config';
import { inject, injectable } from 'inversify';

@injectable()
class StaffAppointmentRoutes {
	private router: express.Router;

	public get routers(): express.Router {
		return this.router;
	}

	constructor(
		@inject(JwtMiddlewareService)
		private jwtMiddlewareService: JwtMiddlewareService,
		@inject(StaffAppointmentController)
		private staffAppointmentController: StaffAppointmentController,
		@inject(RequestValidationMiddleware)
		private requestValidationMiddleware: RequestValidationMiddleware
	) {
		this.router = express.Router();
		this.configureRoutes();
	}

	public configureRoutes(): void {
		this.router.get(
			'/appointments/week_view/:id',
			this.jwtMiddlewareService.verifyToken,
			(req, res) =>
				this.staffAppointmentController.getAllAppointmentsByWeekViewId(
					req,
					res
				)
		);

		this.router.post(
			'/appointments',
			this.jwtMiddlewareService.verifyToken,
			(req, res) =>
				this.staffAppointmentController.createAppointments(req, res)
		);

		this.router.delete(
			'/appointments/week_view/:id',
			this.jwtMiddlewareService.verifyToken,
			(req, res) =>
				this.staffAppointmentController.deleteAllAppointmentsByWeekViewIdAndStaffName(
					req,
					res
				)
		);

		this.router.post(
			'/appointments/share',
			this.jwtMiddlewareService.verifyToken,
			this.requestValidationMiddleware.requestValidator(
				new RequestBodyValidationStrategy(
					ShareAppointmentSchema.createFormSchema
				)
			),
			(req, res) =>
				this.staffAppointmentController.createShareAppointments(
					req,
					res
				)
		);

		// uuidv4&weekViewId=142024
		this.router.get(
			'/shared_appointments/:id',
			this.requestValidationMiddleware.requestValidator(
				new RequestParamValidationStrategy(
					ShareAppointmentSchema.urlParamSchema
				)
			),
			this.requestValidationMiddleware.requestValidator(
				new RequestQueryValidationStrategy(
					ShareAppointmentSchema.urlQuerySchema
				)
			),
			(req, res) =>
				this.staffAppointmentController.getSharedAppointments(req, res)
		);

		this.router.post(
			'/appointments/export/excel',
			this.jwtMiddlewareService.verifyToken,
			(req, res) =>
				// TODO: validation if the dates is a valid date (only 7 days is allowed to export)
				this.staffAppointmentController.exportAppointmentsAsExcel(
					req,
					res
				)
		);

		this.router.delete(
			'/appointments',
			this.jwtMiddlewareService.verifyToken,
			(req, res) =>
				this.staffAppointmentController.deleteAppointmentByDateAndStaffName(
					req,
					res
				)
		);
	}
}

export default StaffAppointmentRoutes;
