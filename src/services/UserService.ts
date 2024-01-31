import { CreateUserForm } from "../models/Forms/CreateUserForm";
import User from "../models/database/User";
import UserProfileService from "./UserProfileService";
import UserRepository from "../repositories/UserRepository";

class UserService {
  private userProfileService: UserProfileService;
  private userRepository: UserRepository;

  constructor(
    userProfileService: UserProfileService,
    userRepository: UserRepository
  ) {
    this.userProfileService = userProfileService;
    this.userRepository = userRepository;
  }

  public async createUser(userForm: CreateUserForm): Promise<User> {
    const user = new User(userForm.username);
    this.userRepository.create(user);
    await this.userProfileService.createProfile(user.id, userForm);
    // create user profile
    return user;
  }

  // Other user-related business logic
}

export default UserService;
