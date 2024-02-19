import sqlite3, { Database } from 'sqlite3';
import { DatabaseError } from '../models/error/Errors';
import { Service } from 'typedi';
import ErrorHandlerService from '../services/ErrorHandlerService';

@Service()
export class SQLite3QueryService {
	constructor(private errorHandlerService: ErrorHandlerService) {}

	async runWithSqlErrorHandlingAsync<T>(
		db: Database,
		query: string,
		params: any[],
		errorType: new (...args: any[]) => DatabaseError // Pass error constructor
	): Promise<T> {
		try {
			return (await getAsync(db, query, params)) as T;
		} catch (error) {
			const dbError = new errorType({
				query,
				cause: error as Error
			});
			this.errorHandlerService.handleError({
				error: dbError,
				service: SQLite3QueryService.name,
				query: query
			});
			throw dbError;
		}
	}

	async getWithSqlErrorHandlingAsync<T>(
		db: Database,
		query: string,
		params: any[],
		errorType: new (...args: any[]) => DatabaseError
	): Promise<T> {
		try {
			return (await getAsync(db, query, params)) as T;
		} catch (error) {
			const dbError = new errorType({
				query,
				cause: error as Error
			});
			this.errorHandlerService.handleError({
				error: dbError,
				service: SQLite3QueryService.name,
				query: query
			});
			throw dbError;
		}
	}

	async allWithSqlErrorHandlingAsync<T>(
		db: Database,
		query: string,
		params: any[],
		errorType: new (...args: any[]) => DatabaseError
	): Promise<T[]> {
		try {
			return (await allAsync(db, query, params)) as T[];
		} catch (error) {
			const dbError = new errorType({
				query,
				cause: error as Error
			});
			this.errorHandlerService.handleError({
				error: dbError,
				service: SQLite3QueryService.name,
				query: query
			});
			throw dbError;
		}
	}
}

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
