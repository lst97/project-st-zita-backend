// IUserRepository.ts

import StaffAppointmentDbModel from "../../../models/database/StaffAppointment";

interface IStaffAppointmentRepository
  extends IBaseRepository<StaffAppointmentDbModel> {
  findByWeekViewId(id: string): Promise<StaffAppointmentDbModel[] | null>;

  createMany(
    appointments: StaffAppointmentDbModel[]
  ): Promise<StaffAppointmentDbModel[]>;
}

export default IStaffAppointmentRepository;
