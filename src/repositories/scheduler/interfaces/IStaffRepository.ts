import StaffDbModel from '../../../models/database/Staff';

interface IStaffRepository extends IBaseRepository<StaffDbModel> {
	// Define any additional methods specific to the StaffRepository
	deleteByName(name: string, userId: string): Promise<void>;
	findByName(name: string, userId: string): Promise<StaffDbModel | null>;
}

export default IStaffRepository;
