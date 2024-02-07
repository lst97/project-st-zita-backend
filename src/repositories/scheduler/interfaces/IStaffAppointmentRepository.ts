// IUserRepository.ts

import UserAppointmentDbModel from "../../../models/database/StaffAppointment";

interface IUserAppointmentRepository {
  create(
    userOrUsers: UserAppointmentDbModel | UserAppointmentDbModel[]
  ): Promise<boolean | UserAppointmentDbModel>;
  findByGroupId(id: string): Promise<UserAppointmentDbModel | null>;
  findByWeekViewId(id: string): Promise<UserAppointmentDbModel[] | null>;
  findAll(): Promise<UserAppointmentDbModel[]>;
  update(appointment: UserAppointmentDbModel): Promise<UserAppointmentDbModel>;
  delete(id: string): Promise<void>;
}

export default IUserAppointmentRepository;
