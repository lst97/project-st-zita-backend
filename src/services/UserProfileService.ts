import { CreateUserForm } from "../models/Forms/CreateUserForm";
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
}

export default UserProfileService;
