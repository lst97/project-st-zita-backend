// IUserRepository.ts

import SharedAppointmentLinkDbModel from '../../../models/database/SharedLink';

interface ISharedAppointmentLinkRepository
	extends IBaseRepository<SharedAppointmentLinkDbModel> {}

export default ISharedAppointmentLinkRepository;
