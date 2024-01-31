// IUserProfileRepository.ts

import UserProfile from "../../models/database/UserProfile";

interface IUserProfileRepository {
  create(userProfile: UserProfile): Promise<UserProfile>;
  findById(id: string): Promise<UserProfile | null>;
  update(userProfile: UserProfile): Promise<UserProfile>;
  delete(id: string): Promise<void>;
  // Add other methods as needed
}

export default IUserProfileRepository;
