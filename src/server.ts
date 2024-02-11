import 'reflect-metadata';
import express from 'express';
import helmet from 'helmet';
import staffRoutes from './routes/StaffRoutes';
import appointmentRoutes from './routes/StaffAppointmentRoutes';
import authenticationRoutes from './routes/AuthenticateRoutes';
import { API_ENDPOINT, PORT } from './constants/ServerConstants';
import cors from 'cors';

const app = express();

app.use(express.static(__dirname, { dotfiles: 'allow' }));

app.use(helmet());

app.use(cors());

app.use(express.json());

app.use(`${API_ENDPOINT}`, staffRoutes);
app.use(`${API_ENDPOINT}`, appointmentRoutes);
app.use(`${API_ENDPOINT}`, authenticationRoutes);

app.listen(`${PORT}`, () => {
	console.log(`Server running on port ${PORT}`);
});
function csrf(): any {
	throw new Error('Function not implemented.');
}
