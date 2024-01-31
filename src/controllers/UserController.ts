import { Request, Response } from "express";
import UserService from "../services/UserService";
import { CreateUserForm } from "../models/Forms/CreateUserForm";

class UserController {
  private userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
  }

  public async createUser(req: Request, res: Response): Promise<void> {
    const createUserForm = req.body as CreateUserForm;

    const user = await this.userService.createUser(createUserForm);
    res.json(user);
  }

  public async getAllUser(req: Request, res: Response): Promise<void> {
    const users = await this.userService.getAllUser();
    res.json(users);
  }
}

export default UserController;
