import express from 'express';
import StaffController from '../controllers/scheduler/StaffController';
import { Container } from 'typedi';
import { verifyToken } from '../middleware/request/JwtMiddleware';

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

const staffController = Container.get(StaffController);

router.post('/staffs', verifyToken, (req, res) =>
	staffController.createStaff(req, res)
);
router.delete('/staffs', verifyToken, (req, res) =>
	staffController.deleteStaff(req, res)
);
router.get('/staffs', verifyToken, (req, res) =>
	staffController.getAllStaffData(req, res)
);

export default router;
