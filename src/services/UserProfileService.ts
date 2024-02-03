import { CreateUserForm } from "../models/forms/CreateUserForm";
import User from "../models/database/User";
import UserProfileRepository from "../repositories/UserProfileRepository";
import UserProfile from "../models/database/UserProfile";

class UserProfileService {
  private userProfileRepository: UserProfileRepository;

  constructor(userProfileRepository: UserProfileRepository) {
    this.userProfileRepository = userProfileRepository;
  }

  public async createProfile(
    user: User,
    userForm: CreateUserForm
  ): Promise<User> {
    let userProfile = new UserProfile(
      user.id,
      userForm.email,
      userForm.color,
      userForm.phoneNumber,
      userForm.image
    );

    await this.userProfileRepository.create(userProfile);
    return user;
  }
  public async deleteProfile(userId: string): Promise<void> {
    await this.userProfileRepository.delete(userId);
  }

  public async getProfile(userId: string): Promise<UserProfile | null> {
    return await this.userProfileRepository.findById(userId);
  }

  public async getAllProfiles(): Promise<UserProfile[]> {
    return await this.userProfileRepository.findAll();
  }
}

export default UserProfileService;
