export interface CreateShareLinkFormParams {
	userId?: string;
	permission: string;
	weekViewIds?: string[];
	expiry?: string;
}

export class CreateShareLinkForm {
	userId?: string;
	permission: string;
	weekViewIds?: string[];
	expiry?: string;

	constructor(params: CreateShareLinkFormParams) {
		this.userId = params.userId;
		this.permission = params.permission;
		this.weekViewIds = params.weekViewIds;
		this.expiry = params.expiry;
	}
}
