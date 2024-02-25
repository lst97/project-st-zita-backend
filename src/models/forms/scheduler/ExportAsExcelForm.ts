import { AppointmentData } from '../../share/scheduler/StaffAppointmentData';

export interface ExportAsExcelFormParams {
	fromDate: string;
	toDate: string;
	method: 'weekly' | 'monthly' | 'yearly';
}

export class ExportAsExcelForm {
	fromDate: string;
	toDate: string;
	method: 'weekly' | 'monthly' | 'yearly';

	constructor(params: ExportAsExcelFormParams) {
		this.fromDate = params.fromDate;
		this.toDate = params.toDate;
		this.method = params.method;
	}
}
