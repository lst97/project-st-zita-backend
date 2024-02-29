import express from 'express';
import StaffController from '../controllers/scheduler/StaffController';
import { Container } from 'typedi';
import { verifyToken } from '../middleware/request/JwtMiddleware';
import {
	RequestBodyValidationStrategy,
	requestValidator
} from '../middleware/request/RequestValidationMiddleware';
import { StaffSchema } from '../schemas/StaffSchema';

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

const router = express.Router();

router.post(
	'/staffs',
	verifyToken,
	requestValidator(
		new RequestBodyValidationStrategy(StaffSchema.createFormSchema)
	),
	(req, res) => {
		const staffController = Container.get(StaffController);
		staffController.createStaff(req, res);
	}
);
router.delete('/staffs', verifyToken, (req, res) => {
	const staffController = Container.get(StaffController);
	staffController.deleteStaff(req, res);
});
router.get('/staffs', verifyToken, (req, res) => {
	const staffController = Container.get(StaffController);
	staffController.getAllStaffData(req, res);
});
router.put(
	'/staffs/edit',
	verifyToken,
	requestValidator(
		new RequestBodyValidationStrategy(StaffSchema.updateFormSchema)
	),
	(req, res) => {
		const staffController = Container.get(StaffController);
		staffController.editStaff(req, res);
	}
);

export default router;
