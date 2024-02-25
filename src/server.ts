import 'reflect-metadata';
import express from 'express';
import helmet from 'helmet';
import staffRoutes from './routes/StaffRoutes';
import appointmentRoutes from './routes/StaffAppointmentRoutes';
import authenticationRoutes from './routes/AuthenticateRoutes';
import { API_ENDPOINT, PORT } from './constants/ServerConstants';
import cors from 'cors';
import fs from 'fs';
import https from 'https';
import { requestId } from './middleware/request/RequestIdMiddleware';

const app = express();

// Certificate
const privateKey = fs.readFileSync(
	'/etc/letsencrypt/live/lst97.tplinkdns.com/privkey.pem',
	'utf8'
);
const certificate = fs.readFileSync(
	'/etc/letsencrypt/live/lst97.tplinkdns.com/cert.pem',
	'utf8'
);
const ca = fs.readFileSync(
	'/etc/letsencrypt/live/lst97.tplinkdns.com/chain.pem',
	'utf8'
);

const credentials = {
	key: privateKey,
	cert: certificate,
	ca: ca
};

app.use(helmet());

app.use(cors());

app.use(express.json());

app.use(`${API_ENDPOINT}`, staffRoutes);
app.use(`${API_ENDPOINT}`, appointmentRoutes);
app.use(`${API_ENDPOINT}`, authenticationRoutes);

app.use(requestId);

const httpsServer = https.createServer(credentials, app);

httpsServer.listen(`${PORT}`, () => {
	console.log(`Server running on port ${PORT}`);
});

function csrf(): any {
	throw new Error('Function not implemented.');
}
