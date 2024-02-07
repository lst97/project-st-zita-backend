interface StaffAppointmentDbModelPrams {
  id: string;
  staffId: string;
  weekViewId: string;
  startDate: string;
  endDate: string;
  location?: string;
  createDate?: string;
  modifyDate?: string;
}

class StaffAppointmentDbModel {
  id: string;
  staffId: string;
  weekViewId: string;
  startDate: string;
  endDate: string;
  location?: string;
  createDate: Date = new Date();
  modifyDate: Date = new Date();

  constructor({
    id,
    staffId,
    weekViewId,
    startDate,
    endDate,
    location,
    createDate,
    modifyDate,
  }: StaffAppointmentDbModelPrams) {
    this.id = id;
    this.staffId = staffId;
    this.weekViewId = weekViewId;
    this.startDate = startDate;
    this.endDate = endDate;
    if (location) {
      this.location = location;
    }

    if (createDate) {
      this.createDate = new Date(createDate);
    }
    if (modifyDate) {
      this.modifyDate = new Date(modifyDate);
    }
  }
}

export default StaffAppointmentDbModel;
