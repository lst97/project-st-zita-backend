import { v4 as uuidv4 } from 'uuid';

interface UserDbModelParams {
	id?: string;
	firstName: string;
	lastName: string;
	email: string;
	passwordHash: string;
	color: string;
	image?: string;
	createDate?: string;
	modifyDate?: string;
}

class UserDbModel {
	id?: string;
	firstName: string;
	lastName: string;
	email: string;
	passwordHash: string;
	color: string;
	image?: string;
	createDate?: string;
	modifyDate?: string;

	constructor({
		id = uuidv4(), // Default value if not provided
		firstName,
		lastName,
		email,
		passwordHash,
		color,
		image,
		createDate = new Date().toISOString(),
		modifyDate = new Date().toISOString()
	}: UserDbModelParams) {
		this.id = id;
		this.firstName = firstName;
		this.lastName = lastName;
		this.email = email;
		this.passwordHash = passwordHash;
		this.color = color;
		this.image = image;
		if (createDate) {
			this.createDate = createDate;
		}
		if (modifyDate) {
			this.modifyDate = modifyDate;
		}
	}
}

export default UserDbModel;
