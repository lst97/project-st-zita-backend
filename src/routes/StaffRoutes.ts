import express from 'express';
import StaffController from '../controllers/scheduler/StaffController';
import RequestValidationMiddleware, {
	RequestBodyValidationStrategy
} from '../middleware/request/RequestValidationMiddleware';
import { StaffSchema } from '../schemas/StaffSchema';
import container from '../inversify.config';
import { JwtMiddlewareService } from '../middleware/request/JwtMiddleware';
import { inject, injectable } from 'inversify';

// TODO: add asyncHandler middleware (sprint 2)
/// Example
// asyncHandler.ts
// const asyncHandler = (fn) => (req, res, next) =>
//   Promise.resolve(fn(req, res, next)).catch(next);
// export default asyncHandler;

// router.post("/staffs", asyncHandler(staffController.createStaff));
//
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).send('Something went wrong!');
// });

@injectable()
class StaffRoutes {
	private router: express.Router;

	public get routers(): express.Router {
		return this.router;
	}

	constructor(
		@inject(StaffController) private staffController: StaffController,
		@inject(JwtMiddlewareService)
		private jwtMiddlewareService: JwtMiddlewareService,
		@inject(RequestValidationMiddleware)
		private requestValidationMiddleware: RequestValidationMiddleware
	) {
		this.router = express.Router();
		this.configureRoutes();
	}

	public configureRoutes(): void {
		this.router.post(
			'/staffs',
			this.jwtMiddlewareService.verifyToken,
			this.requestValidationMiddleware.requestValidator(
				new RequestBodyValidationStrategy(StaffSchema.createFormSchema)
			),
			(req, res) => {
				this.staffController.createStaff(req, res);
			}
		);
		this.router.delete(
			'/staffs',
			this.jwtMiddlewareService.verifyToken,
			(req, res) => {
				this.staffController.deleteStaff(req, res);
			}
		);
		this.router.get(
			'/staffs',
			this.jwtMiddlewareService.verifyToken,
			(req, res) => {
				this.staffController.getAllStaffData(req, res);
			}
		);
		this.router.put(
			'/staffs/edit',
			this.jwtMiddlewareService.verifyToken,
			this.requestValidationMiddleware.requestValidator(
				new RequestBodyValidationStrategy(StaffSchema.updateFormSchema)
			),
			(req, res) => {
				this.staffController.editStaff(req, res);
			}
		);
	}
}

export default StaffRoutes;
