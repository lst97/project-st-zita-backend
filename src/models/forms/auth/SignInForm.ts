export interface SignInFormParams {
	email: string;
	password: string;
}

export class SignInForm {
	email: string;
	password: string;

	constructor({ email, password }: SignInFormParams) {
		this.email = email;
		this.password = password;
	}
}
