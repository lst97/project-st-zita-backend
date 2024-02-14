import { CreateStaffForm } from '../../models/forms/scheduler/CreateStaffForm';
import StaffDbModel from '../../models/database/Staff';
import StaffRepository from '../../repositories/scheduler/StaffRepository';
import StaffDataSharedModel from '../../models/share/scheduler/StaffData';
import { Service } from 'typedi';

@Service()
class StaffService {
	constructor(private staffRepository: StaffRepository) {}

	public async create(staffForm: CreateStaffForm): Promise<StaffDbModel> {
		const staff = new StaffDbModel({
			name: staffForm.staffName,
			email: staffForm.email,
			phoneNumber: staffForm.phoneNumber,
			image: staffForm.image,
			color: staffForm.color
		});
		await this.staffRepository.create(staff);
		return staff;
	}

	public async deleteByName(name: string): Promise<void> {
		await this.staffRepository.deleteByName(name);
	}

	public async getAll(): Promise<StaffDataSharedModel[]> {
		let staffs = await this.staffRepository.findAll();

		return staffs.map((staff) => {
			return new StaffDataSharedModel({
				id: staff.id,
				name: staff.name,
				email: staff.email,
				phoneNumber: staff.phoneNumber,
				image: staff.image,
				color: staff.color
			});
		});
	}

	public async getIdByName(name: string): Promise<string> {
		const staff = await this.staffRepository.findByName(name);
		return staff ? staff.id : '';
	}
}

export default StaffService;
