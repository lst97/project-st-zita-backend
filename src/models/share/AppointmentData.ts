export class AppointmentData {
  username: string;
  groupId: string;
  weekViewId: string;
  location: string;
  startDate: string;
  endDate: string;

  constructor(
    username: string,
    groupId: string,
    weekViewId: string,
    location: string,
    startDate: string,
    endDate: string
  ) {
    this.username = username;
    this.groupId = groupId;
    this.weekViewId = weekViewId;
    this.location = location;
    this.startDate = startDate;
    this.endDate = endDate;
  }
}
