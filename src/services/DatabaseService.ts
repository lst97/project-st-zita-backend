import { Service } from 'typedi';
import sqlite3, { Database } from 'sqlite3';
import * as DbConstants from '../constants/DatabaseConstants';
import { DatabaseError } from '../models/error/Errors';
import ErrorHandlerService from '../services/ErrorHandlerService';

@Service()
export class DatabaseService {
	private db: sqlite3.Database;

	constructor() {
		this.db = new sqlite3.Database(DbConstants.CONNECTION_STRING, (err) => {
			if (err) {
				console.error('Error opening database', err);
				throw err; // Consider handling this error more gracefully
			}
			console.log('Database connection established');
		});

		// exit application
		process.on('SIGINT', this.closeConnection.bind(this));
	}

	private closeConnection(): void {
		// Check if the db object exists and is open before attempting to close
		if (this.db) {
			this.db.close((err) => {
				if (err) {
					console.error('Error closing the database connection', err);
				} else {
					console.log('Database connection closed');
				}

				process.exit(err ? 1 : 0);
			});
		} else {
			// If the database is already closed or not initialized, exit the process
			console.log('Database was not open or already closed');
			process.exit(0);
		}
	}

	public getDatabase(): sqlite3.Database {
		return this.db;
	}
}

class SQLite3Transaction {
	private databaseService: DatabaseService;

	constructor(databaseService: DatabaseService) {
		this.databaseService = databaseService;
	}

	async beginTransactionAsyncWithErrorHandling(): Promise<Database> {
		try {
			const db = this.databaseService.getDatabase();
			return await beginTransactionAsync(db);
		} catch (error) {
			throw new DatabaseError({
				cause: error as Error
			});
		}
	}

	static async commitTransactionAsyncWithErrorHandling(
		db: Database
	): Promise<void> {
		try {
			await commitTransactionAsync(db);
		} catch (error) {
			throw new DatabaseError({
				cause: error as Error
			});
		}
	}

	static async rollbackTransactionAsyncWithErrorHandling(
		db: Database
	): Promise<void> {
		try {
			await rollbackTransactionAsync(db);
		} catch (error) {
			throw new DatabaseError({
				cause: error as Error
			});
		}
	}
}

function beginTransactionAsync(db: Database): Promise<Database> {
	return new Promise((resolve, reject) => {
		db.serialize(() => {
			db.run('BEGIN', (err) => {
				if (err) {
					reject(err);
				}
				resolve(db);
			});
		});
	});
}

function commitTransactionAsync(db: Database): Promise<void> {
	return new Promise((resolve, reject) => {
		db.run('COMMIT', (err) => {
			if (err) {
				reject(err);
			}
			resolve();
		});
	});
}

function rollbackTransactionAsync(db: Database): Promise<void> {
	return new Promise((resolve, reject) => {
		db.run('ROLLBACK', (err) => {
			if (err) {
				reject(err);
			}
			resolve();
		});
	});
}

@Service()
export class SQLite3QueryService {
	constructor(
		private errorHandlerService: ErrorHandlerService,
		private databaseService: DatabaseService
	) {}

	async beginTransactionAsync(): Promise<Database> {
		const transaction = new SQLite3Transaction(this.databaseService);
		return await transaction.beginTransactionAsyncWithErrorHandling();
	}

	async commitTransactionAsync(db: Database): Promise<void> {
		await SQLite3Transaction.commitTransactionAsyncWithErrorHandling(db);
	}

	async rollbackTransactionAsync(db: Database): Promise<void> {
		await SQLite3Transaction.rollbackTransactionAsyncWithErrorHandling(db);
	}

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
			throw this.errorHandlerService.handleUnknownDatabaseError({
				error: error as Error,
				service: SQLite3QueryService.name,
				query: query,
				errorType
			});
		}
	}
}

/**
 * @deprecated Use runWithSqlErrorHandlingAsync instead.
 */
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

/**
 * @deprecated Use getWithSqlErrorHandlingAsync instead.
 */
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

/**
 * @deprecated Use allWithSqlErrorHandlingAsync instead.
 */
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
