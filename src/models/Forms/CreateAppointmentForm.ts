class AppointmentFormData {
  username: string;
  startDate: string;
  endDate: string;
  location: string;
  weekViewId: string;
  constructor(
    username: string,
    startDate: string,
    endDate: string,
    location: string,
    weekViewId: string
  ) {
    this.username = username;
    this.startDate = startDate;
    this.endDate = endDate;
    this.location = location;
    this.weekViewId = weekViewId;
  }
}

export class CreateAppointmentForm {
  appointments: AppointmentFormData[];
  constructor(appointments: AppointmentFormData[]) {
    this.appointments = appointments;
  }
}
