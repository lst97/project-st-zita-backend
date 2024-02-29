export interface RegistrationFormParams {
	id?: string;
	firstName: string;
	lastName: string;
	email: string;
	password: string;
	color: string;
	image?: string;
	phoneNumber?: string;
}

export class RegistrationForm {
	id?: string;
	firstName: string;
	lastName: string;
	email: string;
	password: string;
	color: string;
	image?: string;
	phoneNumber?: string;

	constructor({
		id,
		firstName,
		lastName,
		email,
		password,
		color,
		image,
		phoneNumber
	}: RegistrationFormParams) {
		this.id = id;
		this.firstName = firstName;
		this.lastName = lastName;
		this.email = email;
		this.password = password;
		this.color = color;
		this.image = image;
		this.phoneNumber = phoneNumber;
	}
}
