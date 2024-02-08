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

		process.on('SIGINT', this.closeConnection.bind(this));
	}

	private closeConnection(): void {
		this.db.close((err) => {
			if (err) {
				console.error('Error closing the database connection', err);
				return;
			}
			console.log('Database connection closed');
		});
	}

	public getDatabase(): sqlite3.Database {
		return this.db;
	}
}
