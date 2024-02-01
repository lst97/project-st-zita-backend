import { CreateUserForm } from "../models/forms/CreateUserForm";
import User from "../models/database/User";
import UserProfileService from "./UserProfileService";
import UserRepository from "../repositories/UserRepository";
import UserData from "../models/share/UserData";

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
    await this.userProfileService.createProfile(user, userForm);
    // create user profile
    return user;
  }

  public async getUserIdByUsername(username: string): Promise<string | null> {
    const user = await this.userRepository.findByUsername(username);
    const userId = user ? user.id : null;
    return userId;
  }

  public async getAllUserData(): Promise<UserData[]> {
    let users = await this.userRepository.findAll();
    let userProfiles = await this.userProfileService.getAllProfiles();
    let userDataList = new Array<UserData>();

    users.map((user) => {
      let profile = userProfiles.find((p) => p.id === user.id);
      if (profile) {
        let userData = new UserData(
          user.username,
          profile.email,
          profile.color,
          profile.image,
          profile.phoneNumber
        );
        userDataList.push(userData);
      }
    });

    return userDataList;
  }

  public async getAllUsers(): Promise<User[]> {
    return await this.userRepository.findAll();
  }
}

export default UserService;
