// Read-only: 4
// Write-only: 2
// Comment-only: 1
// Read & Write: 4 + 2 = 6
// Read & Comment: 4 + 1 = 5
// Write & Comment: 2 + 1 = 3
// Read, Write & Comment: 4 + 2 + 1 = 7

export enum Permission {
	Read = 4,
	Write = 2,
	Comment = 1
}

export function permissionNumber(
	read: boolean,
	write: boolean,
	comment: boolean
): number {
	let permissions = 0;
	if (read) {
		permissions += Permission.Read;
	}
	if (write) {
		permissions += Permission.Write;
	}
	if (comment) {
		permissions += Permission.Comment;
	}
	return permissions;
}
