// IUserRepository.ts

import StaffAppointmentDbModel from '../../../models/database/StaffAppointment';

interface IStaffAppointmentRepository
	extends IBaseRepository<StaffAppointmentDbModel> {
	findByWeekViewId(
		id: string,
		userId: string
	): Promise<StaffAppointmentDbModel[] | null>;

	createMany(
		appointments: StaffAppointmentDbModel[],
		userId: string
	): Promise<StaffAppointmentDbModel[]>;
}

export default IStaffAppointmentRepository;
