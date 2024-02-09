import UserDbModel from '../../../models/database/User';

interface IUserRepository extends IBaseRepository<UserDbModel> {
	findByEmail(email: string): Promise<UserDbModel | null>;
}

export default IUserRepository;
