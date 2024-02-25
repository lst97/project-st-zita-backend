import { Service } from 'typedi';
import { createLogger, transports, format } from 'winston';
import { consoleColorCodes } from '../utils/ColorHelper';

@Service()
class LogService {
	private logger;
	constructor() {
		this.logger = createLogger({
			transports: [new transports.Console()],
			format: format.combine(
				format.colorize(),
				format.timestamp(),
				format.printf(({ timestamp, level, message, service }) => {
					service =
						consoleColorCodes.blue +
						service +
						consoleColorCodes.reset;
					timestamp =
						consoleColorCodes.gray +
						timestamp +
						consoleColorCodes.reset;
					return `[${timestamp}] ${service} ${level}: ${message}`;
				})
			)
		});
	}

	public setServiceName(service: string) {
		this.logger.defaultMeta = { service: service };
	}

	public error(message: string) {
		this.logger.error(message);
	}

	public info(message: string) {
		this.logger.info(message);
	}

	public warn(message: string) {
		this.logger.warn(message);
	}

	public debug(message: string) {
		this.logger.debug(message);
	}
}

export default LogService;
