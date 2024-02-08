import StaffDbModel from "../../../models/database/Staff";

interface IStaffRepository extends IBaseRepository<StaffDbModel> {
  // Define any additional methods specific to the StaffRepository
  deleteByName(name: string): Promise<void>;
}

export default IStaffRepository;
