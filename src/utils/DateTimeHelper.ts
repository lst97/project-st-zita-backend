import moment from 'moment';

export function isValidWeekViewId(weekViewId: string): boolean {
	const parts = weekViewId.split('-');
	if (parts.length !== 2) return false;

	const weekNumber = parseInt(parts[0], 10);
	const year = parseInt(parts[1], 10);

	const date = moment().year(year).isoWeek(weekNumber);
	return (
		date.isValid() &&
		weekNumber >= 1 &&
		weekNumber <= 52 &&
		year >= 2000 &&
		year <= 2050
	);
}
