import { Service } from "typedi";
import { Request, Response } from "express";
import { DatabaseService } from "../services/DatabaseService";

@Service()
export class UserController {
  constructor(private databaseService: DatabaseService) {}

  public getUsers(req: Request, res: Response): void {
    const users = this.databaseService.getUsers();
    res.json(users);
  }
}
