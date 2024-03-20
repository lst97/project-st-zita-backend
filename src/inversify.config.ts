import {
	IErrorHandlerService,
	IResponseService,
	errorHandlerService,
	responseService
} from '@lst97/common_response';
import { Container } from 'inversify';
import AuthenticateController from './controllers/auth/AuthenticateController';
import { StaffAppointmentController } from './controllers/scheduler/StaffAppointmentController';
import StaffController from './controllers/scheduler/StaffController';
import {
	DatabaseService,
	SQLite3QueryService
} from './services/DatabaseService';
import AuthService from './services/auth/AuthService';
import { StaffAppointmentService } from './services/scheduler/StaffAppointmentService';
import StaffService from './services/scheduler/StaffService';
import { JwtMiddlewareService } from './middleware/request/JwtMiddleware';
import { RequestHeaderMiddleware } from './middleware/request/RequestHeaderMiddleware';
import AuthenticateRoutes from './routes/AuthenticateRoutes';
import StaffAppointmentRoutes from './routes/StaffAppointmentRoutes';
import StaffRoutes from './routes/StaffRoutes';
import RequestValidationMiddleware from './middleware/request/RequestValidationMiddleware';
import UserRepository from './repositories/auth/UserRepository';
import SharedAppointmentLinkRepository from './repositories/scheduler/SharedAppointmentLinkRepository';
import StaffRepository from './repositories/scheduler/StaffRepository';
import StaffAppointmentRepository from './repositories/scheduler/StaffAppointmentRepository';

const container = new Container();
function buildLibContainers() {
	container
		.bind<IErrorHandlerService>('ErrorHandlerService')
		.toConstantValue(errorHandlerService);
	container
		.bind<IResponseService>('ResponseService')
		.toConstantValue(responseService);
}

function buildRepositoryContainers() {
	container.bind(UserRepository).toSelf().inTransientScope();
	container.bind(SharedAppointmentLinkRepository).toSelf().inTransientScope();
	container.bind(StaffAppointmentRepository).toSelf().inTransientScope();
	container.bind(StaffRepository).toSelf().inTransientScope();
}

function buildServiceContainers() {
	container.bind(DatabaseService).toSelf().inSingletonScope();
	container.bind(SQLite3QueryService).toSelf().inTransientScope();

	container.bind(AuthService).toSelf().inTransientScope();
	container.bind(StaffAppointmentService).toSelf().inTransientScope();
	container.bind(StaffService).toSelf().inTransientScope();
}

function buildControllerContainers() {
	container.bind(AuthenticateController).toSelf().inTransientScope();
	container.bind(StaffAppointmentController).toSelf().inTransientScope();
	container.bind(StaffController).toSelf().inTransientScope();
}

function buildMiddlewareContainers() {
	container.bind(JwtMiddlewareService).toSelf().inTransientScope();
	container.bind(RequestHeaderMiddleware).toSelf().inTransientScope();
	container.bind(RequestValidationMiddleware).toSelf().inTransientScope();
}

function buildRouterContainers() {
	container.bind(AuthenticateRoutes).toSelf().inSingletonScope();
	container.bind(StaffAppointmentRoutes).toSelf().inSingletonScope();
	container.bind(StaffRoutes).toSelf().inSingletonScope();
}

function buildAppContainers() {
	buildLibContainers();
	buildRepositoryContainers();
	buildServiceContainers();
	buildControllerContainers();
	buildMiddlewareContainers();
	buildRouterContainers();
}

buildAppContainers();

export default container;
