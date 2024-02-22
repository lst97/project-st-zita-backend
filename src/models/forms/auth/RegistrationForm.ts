export interface RegistrationFormParams {
	username: string;
	email: string;
	password: string;
	color: string;
	image?: string;
	phoneNumber?: string;
}

export class RegistrationForm {
	username: string;
	email: string;
	password: string;
	color: string;
	image?: string;
	phoneNumber?: string;

	constructor({
		username,
		email,
		password,
		color,
		image,
		phoneNumber
	}: RegistrationFormParams) {
		this.username = username;
		this.email = email;
		this.password = password;
		this.color = color;
		this.image = image;
		this.phoneNumber = phoneNumber;
	}
}
