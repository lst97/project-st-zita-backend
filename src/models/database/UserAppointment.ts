class UserAppointment {
  userId: string;
  groupId: string;
  startDate: Date;
  endDate: Date;
  location: string;
  createDate: Date = new Date();
  modifyDate: Date = new Date();

  constructor(
    userId: string,
    groupId: string,
    startDate: Date,
    endDate: Date,
    location: string
  ) {
    this.userId = userId;
    this.groupId = groupId;
    this.startDate = startDate;
    this.endDate = endDate;
    this.location = location;
  }
}

export default UserAppointment;
