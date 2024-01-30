import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import * as DbConstants from '../constants/DatabaseConstants';

export const openDatabase = async () => {
    return open({
        filename: DbConstants.CONNECTION_STRING,
        driver: sqlite3.Database
    });
};
