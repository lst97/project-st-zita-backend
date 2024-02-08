interface StaffAppointmentData {
  staffName: string;
  groupId: string;
  weekViewId: string;
  location?: string;
  startDate: string;
  endDate: string;
}

export class AppointmentData {
  staffName: string;
  groupId: string;
  weekViewId: string;
  location?: string;
  startDate: string;
  endDate: string;

  constructor({
    staffName,
    groupId,
    weekViewId,
    location,
    startDate,
    endDate,
  }: StaffAppointmentData) {
    this.staffName = staffName;
    this.groupId = groupId;
    this.weekViewId = weekViewId;
    this.startDate = startDate;
    this.endDate = endDate;

    if (location) {
      this.location = location;
    }
  }
}
