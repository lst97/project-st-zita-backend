export interface RegistrationFormParams {
	username: string;
	email: string;
	password: string;
	color: string;
	image?: string;
}

export class RegistrationForm {
	username: string;
	email: string;
	password: string;
	color: string;
	image?: string;

	constructor({
		username,
		email,
		password,
		color,
		image
	}: RegistrationFormParams) {
		this.username = username;
		this.email = email;
		this.password = password;
		this.color = color;
		this.image = image;
	}
}
