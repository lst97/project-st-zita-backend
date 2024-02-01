class UserAppointmentDbModel {
  userId: string;
  groupId: string;
  weekViewId: string;
  startDate: string;
  endDate: string;
  location: string;
  createDate: Date = new Date();
  modifyDate: Date = new Date();

  constructor(
    userId: string,
    groupId: string,
    weekViewId: string,
    startDate: string,
    endDate: string,
    location: string,
    createDate?: string,
    modifyDate?: string
  ) {
    this.userId = userId;
    this.groupId = groupId;
    this.weekViewId = weekViewId;
    this.startDate = startDate;
    this.endDate = endDate;
    this.location = location;
    if (createDate) {
      this.createDate = new Date(createDate);
    }
    if (modifyDate) {
      this.modifyDate = new Date(modifyDate);
    }
  }
}

export default UserAppointmentDbModel;
