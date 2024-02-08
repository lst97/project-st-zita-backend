import { Service } from 'typedi';
import sqlite3 from 'sqlite3';
import * as DbConstants from '../constants/DatabaseConstants';

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
