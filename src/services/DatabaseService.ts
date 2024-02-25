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

	/**
	 * Closes the database connection.
	 * If the connection is open, it will be closed and the process will exit.
	 * If the connection is already closed or not initialized, the process will exit.
	 */
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

/**
 * Represents a transaction for SQLite3 database operations.
 */
class SQLite3Transaction {
	private databaseService: DatabaseService;

	constructor(databaseService: DatabaseService) {
		this.databaseService = databaseService;
	}

	/**
	 * Begins a transaction asynchronously with error handling.
	 * @returns A Promise that resolves to a Database object representing the transaction.
	 * @throws {DatabaseError} If an error occurs during the transaction.
	 */
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

	/**
	 * Commits a transaction asynchronously with error handling.
	 * @param db - The Database object representing the transaction.
	 * @throws {DatabaseError} If an error occurs during the transaction.
	 */
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

	/**
	 * Rolls back a transaction asynchronously with error handling.
	 * @param db - The Database object representing the transaction.
	 * @throws {DatabaseError} If an error occurs during the transaction.
	 */
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
/**
 * Service for executing SQL queries with error handling using SQLite3.
 */
export class SQLite3QueryService {
	constructor(
		private errorHandlerService: ErrorHandlerService,
		private databaseService: DatabaseService
	) {}

	/**
	 * Begins a transaction asynchronously.
	 * @returns A Promise that resolves to a Database object representing the transaction.
	 * @example
	 * const db = await databaseService.beginTransactionAsync();
	 * try {
	 *   // Perform database operations within the transaction
	 *   await performDatabaseOperations(db);
	 *
	 *   // Commit the transaction
	 *   await databaseService.commitTransactionAsync(db);
	 * } catch (error) {
	 *   // Handle any errors and rollback the transaction
	 *   await databaseService.rollbackTransactionAsync(db);
	 *   throw error;
	 * }
	 */
	async beginTransactionAsync(): Promise<Database> {
		const transaction = new SQLite3Transaction(this.databaseService);
		return await transaction.beginTransactionAsyncWithErrorHandling();
	}

	/**
	 * Commits the current transaction in the database.
	 * @param db The database connection.
	 * @returns A promise that resolves when the transaction is committed.
	 */
	async commitTransactionAsync(db: Database): Promise<void> {
		await SQLite3Transaction.commitTransactionAsyncWithErrorHandling(db);
	}

	/**
	 * Rolls back a transaction in the database.
	 * @param db The database connection.
	 * @returns A promise that resolves when the transaction is rolled back.
	 */
	async rollbackTransactionAsync(db: Database): Promise<void> {
		await SQLite3Transaction.rollbackTransactionAsyncWithErrorHandling(db);
	}

	/**
	 * Executes a SQL query with error handling, all SQLite3 error will be convert to
	 * DatabaseError, therefore try catch may not be necessary in the repository level.
	 *
	 * @template T - The type of the result array.
	 * @param {Database} db - The database connection.
	 * @param {string} query - The SQL query to execute.
	 * @param {any[]} params - The parameters for the query.
	 * @param {new (...args: any[]) => DatabaseError} errorType - The error type to throw in case of a database error.
	 * @returns {Promise<T[]>} - A promise that resolves to the result array.
	 * @throws {DatabaseError} - Throws a database error if an SQL error occurs.
	 */
	async runWithSqlErrorHandlingAsync<T>(
		db: Database,
		query: string,
		params: any[],
		errorType: new (...args: any[]) => DatabaseError // Pass error constructor
	): Promise<T> {
		try {
			return (await runAsync(db, query, params)) as T;
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

	/**
	 * Executes a SQL query with error handling, all SQLite3 error will be convert to
	 * DatabaseError, therefore try catch may not be necessary in the repository level.
	 *
	 * @template T - The type of the result.
	 * @param {Database} db - The database instance.
	 * @param {string} query - The SQL query to execute.
	 * @param {any[]} params - The parameters for the query.
	 * @param {new (...args: any[]) => DatabaseError} errorType - The error type to throw in case of an error.
	 * @returns {Promise<T>} - A promise that resolves to the result of the query.
	 * @throws {DatabaseError} - If an error occurs during the query execution.
	 */
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

	/**
	 * Executes a SQL query with error handling, all SQLite3 error will be convert to
	 * DatabaseError, therefore try catch may not be necessary in the repository level.
	 *
	 * @template T - The type of the result array.
	 * @param {Database} db - The database connection.
	 * @param {string} query - The SQL query to execute.
	 * @param {any[]} params - The parameters for the query.
	 * @param {new (...args: any[]) => DatabaseError} errorType - The error type to throw in case of a database error.
	 * @returns {Promise<T[]>} - A promise that resolves to the result array.
	 * @throws {DatabaseError} - Throws a database error if an SQL error occurs.
	 */
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

function runAsync(
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

function getAsync(
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

function allAsync(
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
