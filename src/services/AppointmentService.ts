import { CreateAppointmentForm } from "../models/forms/CreateAppointmentForm";
import UserService from "./UserService";
import UserAppointmentDbModel from "../models/database/UserAppointment";
import { v4 as uuidv4 } from "uuid";
import UserAppointmentRepository from "../repositories/UserAppointmentRepository";
import { AppointmentData } from "../models/share/AppointmentData";

class AppointmentService {
  private userService: UserService;
  private appointmentRepository: UserAppointmentRepository;

  constructor(
    userService: UserService,
    appointmentRepository: UserAppointmentRepository
  ) {
    this.userService = userService;
    this.appointmentRepository = appointmentRepository;
  }

  public async createAppointments(
    appointmentForm: CreateAppointmentForm
  ): Promise<boolean> {
    const users = await this.userService.getAllUsers();
    const userIdMap = new Map<string, string>();
    users.forEach((user) => {
      userIdMap.set(user.username, user.id);
    });

    const appointmentsDbModels = new Array<UserAppointmentDbModel>();
    appointmentForm.appointments.forEach((appointment) => {
      const userId = userIdMap.get(appointment.username);

      if (userId) {
        const appointmentDbModel = new UserAppointmentDbModel(
          userId,
          uuidv4(),
          appointment.weekViewId,
          appointment.startDate,
          appointment.endDate,
          appointment.location
        );

        appointmentsDbModels.push(appointmentDbModel);
      }
    });

    await this.appointmentRepository.create(appointmentsDbModels);
    return true;
  }

  private convertToAppointmentData(
    appointmentDbModel: UserAppointmentDbModel,
    userName: string
  ): AppointmentData {
    return new AppointmentData(
      userName,
      appointmentDbModel.groupId,
      appointmentDbModel.weekViewId,
      appointmentDbModel.startDate,
      appointmentDbModel.endDate,
      appointmentDbModel.location
    );
  }
  private async buildUserNameMap(): Promise<Map<string, string>> {
    const users = await this.userService.getAllUsers();
    const userNameMap = new Map<string, string>();
    users.forEach((user) => {
      userNameMap.set(user.id, user.username);
    });
    return userNameMap;
  }

  private mapAppointmentDbModelsToAppointmentsData(
    appointmentDbModels: UserAppointmentDbModel[],
    userNameMap: Map<string, string>
  ): AppointmentData[] {
    const appointments = new Array<AppointmentData>();

    for (const appointmentDbModel of appointmentDbModels) {
      const userName = userNameMap.get(appointmentDbModel.userId);
      if (userName) {
        appointments.push(
          this.convertToAppointmentData(appointmentDbModel, userName)
        );
      }
    }

    return appointments;
  }

  public async getAllAppointments(): Promise<AppointmentData[]> {
    const appointmentDbModels = await this.appointmentRepository.findAll();
    const userNameMap = await this.buildUserNameMap();

    return this.mapAppointmentDbModelsToAppointmentsData(
      appointmentDbModels,
      userNameMap
    );
  }

  public async getAllAppointmentsByWeekViewId(
    weekViewId: string
  ): Promise<AppointmentData[] | null> {
    const appointmentDbModels =
      await this.appointmentRepository.findByWeekViewId(weekViewId);

    const userNameMap = await this.buildUserNameMap();

    if (!appointmentDbModels) {
      return null;
    }

    return this.mapAppointmentDbModelsToAppointmentsData(
      appointmentDbModels,
      userNameMap
    );
  }
}

export default AppointmentService;
