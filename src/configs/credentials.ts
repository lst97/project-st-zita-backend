import fs from 'fs';
import appConfig from './config';

class Credentials {
	public readonly tls = {
		key: fs.readFileSync(appConfig.certificates.privateKey, 'utf8'),
		cert: fs.readFileSync(appConfig.certificates.certificate, 'utf8'),
		ca: fs.readFileSync(appConfig.certificates.ca, 'utf8')
	};
}

export default Credentials;
