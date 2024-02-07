import StaffDbModel from "../../../models/database/Staff";

interface IStaffRepository {
  create(staff: StaffDbModel): Promise<StaffDbModel>;
  findById(id: string): Promise<StaffDbModel | null>;
  findAll(): Promise<StaffDbModel[]>;
  update(staff: StaffDbModel): Promise<StaffDbModel>;
  deleteById(id: string): Promise<void>;
  deleteByName(name: string): Promise<void>;
}

export default IStaffRepository;
