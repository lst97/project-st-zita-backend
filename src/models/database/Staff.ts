import { v4 as uuidv4 } from 'uuid';

interface StaffDbModelParams {
	id?: string;
	name: string;
	email?: string;
	phoneNumber?: string;
	image?: string;
	color: string;
	createDate?: string;
	modifyDate?: string;
}

class StaffDbModel {
	id: string;
	name: string;
	email?: string;
	phoneNumber?: string;
	image?: string;
	color: string;
	createDate?: string;
	modifyDate?: string;

	constructor({
		id = uuidv4(), // Default value if not provided
		name,
		color,
		email,
		phoneNumber,
		image,
		createDate = new Date().toISOString(),
		modifyDate = new Date().toISOString()
	}: StaffDbModelParams) {
		this.id = id;
		this.name = name;
		this.color = color;
		this.email = email;
		this.phoneNumber = phoneNumber;
		this.image = image;
		if (createDate) {
			this.createDate = createDate;
		}
		if (modifyDate) {
			this.modifyDate = modifyDate;
		}
	}
}

export default StaffDbModel;
