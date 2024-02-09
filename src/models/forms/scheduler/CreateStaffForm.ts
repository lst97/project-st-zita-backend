export interface CreateStaffFormParams {
	staffName: string;
	image?: string;
	color: string;
	email: string;
	phoneNumber?: string;
}

export class CreateStaffForm {
	staffName: string;
	image?: string;
	color: string;
	email: string;
	phoneNumber?: string;

	constructor(params: CreateStaffFormParams) {
		this.staffName = params.staffName;
		this.image = params.image;
		this.color = params.color;
		this.email = params.email;
		this.phoneNumber = params.phoneNumber;
	}
}
