import { Request, Response } from "express";
import UserService from "../services/UserService";

class UserController {
  private userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
  }

  public async createUser(req: Request, res: Response): Promise<void> {
    const { username } = req.body;
    const user = await this.userService.createUser(username);
    res.json(user);
  }
}

export default UserController;
