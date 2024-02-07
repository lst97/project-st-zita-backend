import { Request, Response } from "express";
import StaffService from "../../services/StaffService";
import { CreateStaffForm } from "../../models/forms/scheduler/CreateStaffForm";
import AppointmentService from "../../services/AppointmentService";

class StaffController {
  private appointmentService: AppointmentService;
  private staffService: StaffService;

  constructor(
    staffService: StaffService,
    appointmentService: AppointmentService
  ) {
    this.staffService = staffService;
    this.appointmentService = appointmentService;
  }

  public async createStaff(req: Request, res: Response): Promise<void> {
    const createStaffForm = req.body as CreateStaffForm;

    const staff = await this.staffService.create(createStaffForm);
    res.json({ data: staff });
  }

  public async deleteStaff(req: Request, res: Response): Promise<void> {
    const staffName = req.query.staffName as string;
    await this.appointmentService.deleteAllAppointmentsByStaffName(staffName);
    await this.staffService.deleteByName(staffName);
    res.json({ data: true });
  }

  public async getAllStaffData(_req: Request, res: Response): Promise<void> {
    const staffs = await this.staffService.getAll();
    res.json({ data: staffs });
  }
}

export default StaffController;
