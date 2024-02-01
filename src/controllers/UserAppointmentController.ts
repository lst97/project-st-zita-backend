import { Request, Response } from "express";
import { CreateAppointmentForm } from "../models/forms/CreateAppointmentForm";
import AppointmentService from "../services/AppointmentService";
import { AppointmentData } from "../models/share/AppointmentData";

class UserAppointmentController {
  private appointmentService: AppointmentService;

  constructor(appointmentService: AppointmentService) {
    this.appointmentService = appointmentService;
  }

  public async createAppointments(req: Request, res: Response): Promise<void> {
    const createAppointmentForm = req.body as CreateAppointmentForm;
    await this.appointmentService.createAppointments(createAppointmentForm);
    res.json({ data: true });
  }

  public async getAllAppointments(req: Request, res: Response): Promise<void> {
    const appointments = await this.appointmentService.getAllAppointments();
    res.json({ data: appointments });
  }

  // week_number + year = 142024
  public async getAllAppointmentsByWeekViewId(
    req: Request,
    res: Response
  ): Promise<void> {
    const { weekViewId } = req.params;

    const appointments =
      await this.appointmentService.getAllAppointmentsByWeekViewId(weekViewId);
    res.json({ data: appointments });
  }
}

export default UserAppointmentController;