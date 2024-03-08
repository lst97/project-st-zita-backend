import ExcelJS from 'exceljs';
import { AppointmentData } from '../models/share/scheduler/StaffAppointmentData';
import moment from 'moment';
import { ExportAsExcelError } from '@lst97/common_response/src/';

interface ExportStrategy {
	exportToExcel(data: AppointmentData[], fileName: string): Promise<Buffer>;
}

interface CreateWorksheetStrategy {
	createWorksheet(workbook: ExcelJS.Workbook): void;
}

function getStaffNames(data: AppointmentData[]): string[] {
	const staffNames = new Set<string>();
	for (const d of data) {
		staffNames.add(d.staffName);
	}
	return Array.from(staffNames);
}
function createWorkbook(): ExcelJS.Workbook {
	const workbook = new ExcelJS.Workbook();
	workbook.creator = 'Project ST Zita Scheduler - Backend';
	workbook.lastModifiedBy = 'Bot';
	workbook.created = new Date();
	workbook.modified = new Date();
	return workbook;
}

function generateTimeIntervals(
	startTime: string,
	endTime: string,
	intervalMinutes = 30
) {
	const intervals = [];
	let currentTime = moment(startTime, 'h:mm A');

	while (currentTime.isBefore(moment(endTime, 'h:mm A'))) {
		intervals.push(currentTime.format('h:mm A'));
		currentTime.add(intervalMinutes, 'minutes');
	}

	return intervals;
}

function getDayOfWeek(): string[] {
	return [
		'Monday',
		'Tuesday',
		'Wednesday',
		'Thursday',
		'Friday',
		'Saturday',
		'Sunday'
	];
}

class WeeklyWorksheetStrategy implements CreateWorksheetStrategy {
	createWorksheet(workbook: ExcelJS.Workbook): void {
		const daysOfWeek = getDayOfWeek();

		for (const day of daysOfWeek) {
			workbook.addWorksheet(day);
		}
	}
}

class WorksheetHelper {
	private strategy: CreateWorksheetStrategy;

	constructor(strategy: CreateWorksheetStrategy) {
		this.strategy = strategy;
	}

	createWorksheet(workbook: ExcelJS.Workbook): void {
		this.strategy.createWorksheet(workbook);
	}
}

function calculateAndAddTotalHours(row: ExcelJS.Row, timeIntervals: string[]) {
	const firstTimeSlotCell = row.getCell(timeIntervals[0]); // Adjust if needed
	const lastTimeSlotCell = row.getCell(
		timeIntervals[timeIntervals.length - 1]
	);
	const totalHoursCell = row.getCell('totalHours');

	// Formula for counting colored cells and converting to hours
	totalHoursCell.value = {
		formula: `=COUNTIF(${firstTimeSlotCell.address}:${lastTimeSlotCell.address}, "✓")`, // Assuming 30-minute intervals
		date1904: true // May be needed for proper date/time handling
	};
	totalHoursCell.style.alignment = {
		horizontal: 'center',
		vertical: 'middle'
	};
}

function mapAppointmentByDay(
	data: AppointmentData[]
): Map<string, AppointmentData[]> {
	const map = new Map<string, AppointmentData[]>();
	const daysOfWeek = getDayOfWeek();

	for (const day of daysOfWeek) {
		map.set(day, []);
	}

	for (const d of data) {
		const day = moment(d.startDate).format('dddd');
		map.get(day)?.push(d);
	}

	return map;
}

export class WeeklyExportStrategy implements ExportStrategy {
	async exportToExcel(data: AppointmentData[]): Promise<Buffer> {
		const workbook = createWorkbook();
		const worksheetHelper = new WorksheetHelper(
			new WeeklyWorksheetStrategy()
		);
		worksheetHelper.createWorksheet(workbook);

		const staffNames = getStaffNames(data);
		const timeIntervals = generateTimeIntervals('8:00 AM', '5:00 PM');

		workbook.worksheets.forEach((worksheet) => {
			worksheet.columns = [
				{ header: 'Staff', key: 'staff', width: 13 },
				...timeIntervals.map((time) => ({
					header: time,
					key: time,
					width: 9
				})),
				{ header: 'Total', key: 'totalHours', width: 5 },
				{ header: 'Wage', key: 'wage', width: 5 }
			];

			// Add staff name rows
			staffNames.forEach((staffName) => {
				worksheet.addRow({ staff: staffName });
			});

			const appointmentMap = mapAppointmentByDay(data);

			// Conditional Formatting and Total Hours
			appointmentMap.forEach((appointments) => {
				if (appointments.length !== 0) {
					const appointmentDay =
						getDayOfWeek()[
							new Date(appointments[0].startDate).getDay()
						];

					if (worksheet.name === appointmentDay) {
						worksheet.eachRow((row) => {
							for (const appointment of appointments) {
								if (
									row.getCell(1).text ===
									appointment.staffName
								) {
									timeIntervals.forEach((time) => {
										const cell = row.getCell(time);
										const cellTime = moment(time, 'h:mm A');
										const startDate = moment(
											moment(
												appointment.startDate
											).format('h:mm A'),
											'h:mm A'
										);
										const endDate = moment(
											moment(appointment.endDate).format(
												'h:mm A'
											),
											'h:mm A'
										);
										if (
											cellTime.isBetween(
												startDate,
												endDate,
												null,
												'[]'
											)
										) {
											cell.fill = {
												type: 'pattern',
												pattern: 'solid',
												fgColor: { argb: 'FF00FF00' }
											}; // Green

											cell.style.alignment = {
												horizontal: 'center',
												vertical: 'middle'
											};

											cell.value = '✓';
										}
									});

									calculateAndAddTotalHours(
										row,
										timeIntervals
									);
								}
							}
						});
					}
				}
			});
		});

		const buffer = Buffer.from(await workbook.xlsx.writeBuffer());
		return buffer;
	}
}

export class ExportHelper {
	private strategy: ExportStrategy;

	constructor(strategy: ExportStrategy) {
		this.strategy = strategy;
	}

	async exportToExcel(
		data: AppointmentData[],
		fileName: string
	): Promise<Buffer> {
		try {
			return await this.strategy.exportToExcel(data, fileName);
		} catch (error) {
			throw new ExportAsExcelError({ cause: error as Error });
		}
	}
}
