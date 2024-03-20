import 'reflect-metadata';

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import appConfig, { IAppConfig } from './configs/config';
import { RequestHeaderMiddleware } from './middleware/request/RequestHeaderMiddleware';
import container from './inversify.config';
import StaffRoutes from './routes/StaffRoutes';
import StaffAppointmentRoutes from './routes/StaffAppointmentRoutes';
import AuthenticateRoutes from './routes/AuthenticateRoutes';
import Credentials from './configs/credentials';
import https from 'https';
import { RequestLoggerMiddleware } from './middleware/request/RequestLoggerMiddleware';
import ResponseLoggerMiddleware from './middleware/response/ResponseLoggerMiddleware';

/**
 * The App class represents the main application.
 * It is responsible for configuring the express application, setting up routes, and starting the server.
 *
 * @class
 */
class App {
	private app: express.Application;
	private appConfig: IAppConfig;

	public get Config(): IAppConfig {
		return this.appConfig;
	}

	constructor() {
		this.app = express();
		this.appConfig = appConfig;
		this.config();
		this.routes();
	}

	public getApp(): express.Application {
		return this.app;
	}

	private config(): void {
		this.app.use(helmet());
		this.app.use(cors());
		this.app.use(express.json());
		this.app.use(RequestHeaderMiddleware.requestId);
		this.app.use(RequestLoggerMiddleware.requestLogger);

		this.app.use(ResponseLoggerMiddleware.responseLogger);
	}

	private routes(): void {
		this.app.use(
			`${appConfig.apiEndpoint}/${appConfig.apiVersion}`,
			container.get(StaffRoutes).routers
		);
		this.app.use(
			`${appConfig.apiEndpoint}/${appConfig.apiVersion}`,
			container.get(StaffAppointmentRoutes).routers
		);
		this.app.use(
			`${appConfig.apiEndpoint}/${appConfig.apiVersion}`,
			container.get(AuthenticateRoutes).routers
		);
	}

	public listen(port: number, callback: () => void): void {
		if (this.appConfig.environment === 'production') {
			const httpsServer = https.createServer(
				new Credentials().tls,
				this.app
			);
			httpsServer.listen(`${appConfig.port}`, callback);
		} else if (this.appConfig.environment === 'development') {
			this.app.listen(port, callback);
		} else {
			throw new Error('Environment not set');
		}
	}
}

const app = new App();
const port = app.Config.port;
const environment = app.Config.environment;

app.listen(port, () => {
	console.log(
		`(${environment}) Server is running on ${app.Config.protocol}://${app.Config.host}:${port} 🚀`
	);
});

// function csrf(): any {
// 	throw new Error('Function not implemented.');
// }
