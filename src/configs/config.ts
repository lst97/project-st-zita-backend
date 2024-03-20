import yaml from 'yaml';
import * as fs from 'fs';
import * as path from 'path';

export interface IAppConfig {
	port: number;
	host: string;
	apiVersion: string;
	apiEndpoint: string;
	apiBaseUrl: string;
	database: {
		connectionString: string;
	};
	certificates: {
		privateKey: string;
		certificate: string;
		ca: string;
	};
	appIdentifier: {
		name: string;
	};
	environment: string;
}

class AppConfig {
	port: number;
	host: string;
	apiVersion: string;
	apiEndpoint: string;
	apiBaseUrl: string;
	database: {
		connectionString: string;
	};
	certificates: {
		privateKey: string;
		certificate: string;
		ca: string;
	};
	appIdentifier: {
		name: string;
	};
	environment: string;

	constructor(configData: any) {
		this.port = configData.port;
		this.host = configData.host;
		this.apiVersion = configData.apiVersion;
		this.apiEndpoint = configData.apiEndpoint;
		this.apiBaseUrl = configData.apiBaseUrl;
		this.database = configData.database;
		this.certificates = configData.certificates;
		this.appIdentifier = configData.appIdentifier;
		this.environment = configData.environment;
	}
}

const configPath = path.resolve(__dirname, 'app_config.yml');
const configData = yaml.parse(fs.readFileSync(configPath, 'utf8')) as any; // 'any' for typing flexibility

const appConfig = new AppConfig(configData);

export default appConfig;
