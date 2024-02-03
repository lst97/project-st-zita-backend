import { Request, Response } from "express";
import UserService from "../services/UserService";
import { CreateUserForm } from "../models/forms/CreateUserForm";
import AppointmentService from "../services/AppointmentService";

class UserController {
  private appointmentService: AppointmentService;
  private userService: UserService;

  constructor(
    userService: UserService,
    appointmentService: AppointmentService
  ) {
    this.userService = userService;
    this.appointmentService = appointmentService;
  }

  public async createUser(req: Request, res: Response): Promise<void> {
    const createUserForm = req.body as CreateUserForm;

    const user = await this.userService.createUser(createUserForm);
    res.json({ data: user });
  }

  public async deleteUser(req: Request, res: Response): Promise<void> {
    const staffName = req.query.staffName as string;
    await this.appointmentService.deleteAllAppointmentsByUserName(staffName);
    await this.userService.deleteUser(staffName);
    res.json({ data: true });
  }

  public async getAllUserData(req: Request, res: Response): Promise<void> {
    const users = await this.userService.getAllUserData();
    res.json({ data: users });
  }
}

export default UserController;
