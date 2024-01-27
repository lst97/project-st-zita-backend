import "reflect-metadata";
import express from "express";
import { Container } from "typedi";
import { UserController } from "./controllers/UserController";

const app = express();
const port = 1167;

const userController = Container.get(UserController);

app.get("/users", (req, res) => userController.getUsers(req, res));

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
