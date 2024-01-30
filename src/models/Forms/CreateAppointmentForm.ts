export class CreateAppointmentForm {
  username: string;
  startDate: string;
  endDate: string;
  location: string;
  constructor(
    username: string,
    startDate: string,
    endDate: string,
    location: string
  ) {
    this.username = username;
    this.startDate = startDate;
    this.endDate = endDate;
    this.location = location;
  }
}
