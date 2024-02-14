import { v4 as uuidv4 } from 'uuid';

interface SharedAppointmentLinkDbModelParams {
	id?: string;
	userId: string;
	weekViewId?: string;
	expiry?: string;
	permission: string;
	createDate?: string;
	modifyDate?: string;
}

class SharedAppointmentLinkDbModel {
	id: string;
	userId: string;
	weekViewId?: string;
	expiry?: string;
	permission: string;
	createDate?: string;
	modifyDate?: string;

	constructor({
		id = uuidv4(),
		userId,
		weekViewId,
		expiry,
		permission,
		createDate = new Date().toISOString(),
		modifyDate = new Date().toISOString()
	}: SharedAppointmentLinkDbModelParams) {
		this.id = id;
		this.userId = userId;
		this.weekViewId = weekViewId;
		this.expiry = expiry;
		this.permission = permission;
		this.createDate = createDate;
		this.modifyDate = modifyDate;
	}
}

export default SharedAppointmentLinkDbModel;
