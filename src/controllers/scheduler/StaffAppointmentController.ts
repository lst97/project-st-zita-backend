import { Request, Response } from "express";
import AppointmentService from "../../services/AppointmentService";
import { AppointmentData } from "../../models/share/scheduler/StaffAppointmentData";

class StaffAppointmentController {
  private appointmentService: AppointmentService;

  constructor(appointmentService: AppointmentService) {
    this.appointmentService = appointmentService;
  }

  public async createAppointments(req: Request, res: Response): Promise<void> {
    const appointsData = req.body as AppointmentData[];
    await this.appointmentService.createAppointments(appointsData);
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
    const weekViewId = req.params.id;

    const appointments =
      await this.appointmentService.getAllAppointmentsByWeekViewId(weekViewId);
    res.json({ data: appointments });
  }

  public async deleteAllAppointmentsByWeekViewIdAndStaffName(
    req: Request,
    res: Response
  ) {
    const weekViewId = req.params.id;
    const staffName = req.query.staffName as string;
    await this.appointmentService.deleteAllAppointmentsByWeekViewIdAndStaffName(
      staffName,
      weekViewId
    );
    res.json({ data: true });
  }
}

export default StaffAppointmentController;
