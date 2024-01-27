import { Service } from "typedi";

@Service()
export class DatabaseService {
  public getUsers(): string[] {
    return ["User1", "User2"]; // Sample data
  }
}
