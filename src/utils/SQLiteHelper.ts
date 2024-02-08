import sqlite3 from 'sqlite3';

export function runAsync(
	db: sqlite3.Database,
	query: string,
	params: any[]
): Promise<sqlite3.RunResult> {
	return new Promise((resolve, reject) => {
		db.prepare(
			query,
			function (this: sqlite3.Statement, err: Error | null) {
				if (err) return reject(err);
				this.run(
					params,
					function (this: sqlite3.RunResult, err: Error | null) {
						if (err) return reject(err);
						resolve(this);
					}
				).finalize();
			}
		);
	});
}

export function getAsync(
	db: sqlite3.Database,
	query: string,
	params: any[]
): Promise<any> {
	return new Promise((resolve, reject) => {
		db.prepare(
			query,
			function (this: sqlite3.Statement, err: Error | null) {
				if (err) return reject(err);
				this.get(
					params,
					function (
						this: sqlite3.Statement,
						err: Error | null,
						row: any
					) {
						if (err) return reject(err);
						resolve(row);
					}
				).finalize();
			}
		);
	});
}

export function allAsync(
	db: sqlite3.Database,
	query: string,
	params: any[]
): Promise<any[]> {
	return new Promise((resolve, reject) => {
		db.prepare(
			query,
			function (this: sqlite3.Statement, err: Error | null) {
				if (err) return reject(err);
				this.all(
					params,
					function (
						this: sqlite3.Statement,
						err: Error | null,
						rows: any[]
					) {
						if (err) return reject(err);
						resolve(rows);
					}
				).finalize();
			}
		);
	});
}
