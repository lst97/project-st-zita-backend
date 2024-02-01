import express from "express";
import userRoutes from "./routes/UserRoutes";
import appointmentRoutes from "./routes/UserAppointmentRoutes";
import { API_ENDPOINT, PORT } from "./constants/ServerConstants";
import cors from "cors";

const app = express();

app.use(cors());

app.use(express.json());

app.use(`${API_ENDPOINT}`, userRoutes);
app.use(`${API_ENDPOINT}`, appointmentRoutes);

app.listen(`${PORT}`, () => {
  console.log(`Server running on port ${PORT}`);
});
